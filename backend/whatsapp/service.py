"""
WhatsApp Business Cloud API Service
Dispatches WhatsApp messages using official Meta Graph API v21.0.
Enforces strict user consent verification, frequency limits, and security boundaries.
"""

import os
import re
import json
import logging
from typing import Optional, Dict, Any, List
import httpx
from datetime import datetime, timedelta

try:
    from backend.whatsapp.models import (
        WhatsAppSendResult,
        UserWhatsAppConsent,
        NotificationPreferences
    )
except ImportError:
    from whatsapp.models import (
        WhatsAppSendResult,
        UserWhatsAppConsent,
        NotificationPreferences
    )

logger = logging.getLogger("pcosense.whatsapp")
logger.setLevel(logging.INFO)

# Environment variables (Backend-only secrets)
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "pcosense_verify_token_2026")

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# In-memory store for user consent and audit logging (mirrored with Firestore/database)
USER_CONSENTS: Dict[str, UserWhatsAppConsent] = {}
MESSAGE_LOGS: List[Dict[str, Any]] = []
ADMIN_SETTINGS = {
    "max_messages_per_user_weekly": 3,
    "quiet_hours_enabled": True,
    "quiet_hours_start": "21:00",
    "quiet_hours_end": "08:00"
}


def sanitize_phone_number(phone: str) -> str:
    """Normalize phone number to international E.164 digits format."""
    digits = re.sub(r"[^\d]", "", phone)
    # Default to India (+91) if 10 digits provided
    if len(digits) == 10:
        return f"91{digits}"
    return digits


class WhatsAppService:
    def __init__(self):
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", WHATSAPP_ACCESS_TOKEN)
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", WHATSAPP_PHONE_NUMBER_ID)
        self.business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", WHATSAPP_BUSINESS_ACCOUNT_ID)

    def is_configured(self) -> bool:
        """Check if official Meta WhatsApp Business API credentials are set."""
        return bool(self.access_token and self.phone_number_id)

    def get_user_consent(self, phone_or_id: str) -> Optional[UserWhatsAppConsent]:
        """Look up consent record by user ID or phone number."""
        clean_phone = sanitize_phone_number(phone_or_id)
        for consent in USER_CONSENTS.values():
            if consent.user_id == phone_or_id or sanitize_phone_number(consent.phone_number) == clean_phone:
                return consent
        return None

    def register_user_consent(
        self,
        user_id: str,
        phone_number: str,
        opt_in: bool,
        preferred_language: str = "en",
        notification_preferences: Optional[Dict[str, bool]] = None
    ) -> UserWhatsAppConsent:
        """Record or update user WhatsApp opt-in preferences."""
        prefs = NotificationPreferences(**(notification_preferences or {}))
        consent = UserWhatsAppConsent(
            user_id=user_id,
            phone_number=sanitize_phone_number(phone_number),
            whatsapp_opt_in=opt_in,
            preferred_language="te" if preferred_language == "te" else "en",
            notification_preferences=prefs,
            opt_in_timestamp=datetime.utcnow().isoformat() if opt_in else None,
            opt_out_timestamp=datetime.utcnow().isoformat() if not opt_in else None,
            weekly_message_count=0
        )
        USER_CONSENTS[user_id] = consent
        logger.info(f"User {user_id} WhatsApp consent updated: opt_in={opt_in}, phone={consent.phone_number}")
        return consent

    def opt_out_by_phone(self, raw_phone: str) -> bool:
        """Immediately revoke consent for incoming STOP request."""
        clean_phone = sanitize_phone_number(raw_phone)
        updated = False
        for user_id, consent in USER_CONSENTS.items():
            if sanitize_phone_number(consent.phone_number) == clean_phone:
                consent.whatsapp_opt_in = False
                consent.opt_out_timestamp = datetime.utcnow().isoformat()
                updated = True
                logger.info(f"Opt-out applied to user {user_id} (phone: {clean_phone})")

        # If not found in known dict, still record opt-out mapping
        if not updated:
            dummy_id = f"phone_{clean_phone}"
            USER_CONSENTS[dummy_id] = UserWhatsAppConsent(
                user_id=dummy_id,
                phone_number=clean_phone,
                whatsapp_opt_in=False,
                opt_out_timestamp=datetime.utcnow().isoformat()
            )
        return True

    def check_can_send(self, phone: str, user_id: Optional[str] = None) -> (bool, str):
        """
        Enforce strict safety gates:
        1. Explicit user opt-in must be TRUE.
        2. Configurable weekly frequency limit must NOT be exceeded.
        """
        clean_phone = sanitize_phone_number(phone)
        consent = None

        if user_id and user_id in USER_CONSENTS:
            consent = USER_CONSENTS[user_id]
        else:
            for c in USER_CONSENTS.values():
                if sanitize_phone_number(c.phone_number) == clean_phone:
                    consent = c
                    break

        # Mandatory opt-in check
        if not consent or not consent.whatsapp_opt_in:
            return False, "User has not opted in to receive WhatsApp notifications (whatsapp_opt_in=False)."

        # Weekly frequency limit check
        max_weekly = ADMIN_SETTINGS.get("max_messages_per_user_weekly", 3)
        if consent.weekly_message_count >= max_weekly:
            return False, f"User has reached the weekly frequency cap of {max_weekly} messages."

        return True, "Eligible"

    async def send_text_message(
        self,
        recipient_phone: str,
        message_body: str,
        user_id: Optional[str] = None,
        campaign_id: Optional[str] = None,
        message_type: str = "PCOS Awareness",
        language: str = "en",
        bypass_opt_in_for_test: bool = False
    ) -> WhatsAppSendResult:
        """
        Send a WhatsApp text message to an opted-in user via Meta Graph API.
        If live API credentials are missing, securely logs as 'simulated' preview.
        """
        clean_phone = sanitize_phone_number(recipient_phone)

        # 1. Gatekeeper: Consent & Rate Limit Verification
        if not bypass_opt_in_for_test:
            can_send, reason = self.check_can_send(clean_phone, user_id)
            if not can_send:
                log_entry = {
                    "id": f"log_{datetime.utcnow().timestamp()}",
                    "userId": user_id,
                    "phoneNumber": clean_phone,
                    "messageType": message_type,
                    "content": message_body,
                    "language": language,
                    "direction": "outbound",
                    "status": "failed",
                    "error": reason,
                    "timestamp": datetime.utcnow().isoformat()
                }
                MESSAGE_LOGS.insert(0, log_entry)
                return WhatsAppSendResult(
                    success=False,
                    recipient_phone=clean_phone,
                    status="opted_out" if "opted in" in reason else "rate_limited",
                    error=reason
                )

        # 2. Official WhatsApp Business Cloud API Endpoint
        if self.is_configured():
            endpoint = f"{GRAPH_API_BASE_URL}/{self.phone_number_id}/messages"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": clean_phone,
                "type": "text",
                "text": {
                    "preview_url": False,
                    "body": message_body
                }
            }

            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(endpoint, json=payload, headers=headers)
                    resp_data = resp.json()

                if resp.status_code == 200 and "messages" in resp_data:
                    msg_id = resp_data["messages"][0]["id"]
                    self._increment_user_message_count(clean_phone, user_id)

                    log_entry = {
                        "id": f"log_{datetime.utcnow().timestamp()}",
                        "userId": user_id,
                        "phoneNumber": clean_phone,
                        "campaignId": campaign_id,
                        "messageType": message_type,
                        "content": message_body,
                        "language": language,
                        "direction": "outbound",
                        "status": "sent",
                        "whatsappMessageId": msg_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    MESSAGE_LOGS.insert(0, log_entry)

                    return WhatsAppSendResult(
                        success=True,
                        recipient_phone=clean_phone,
                        whatsapp_message_id=msg_id,
                        status="sent"
                    )
                else:
                    err_detail = resp_data.get("error", {}).get("message", resp.text)
                    logger.error(f"WhatsApp Cloud API Error: {err_detail}")
                    return WhatsAppSendResult(
                        success=False,
                        recipient_phone=clean_phone,
                        status="failed",
                        error=f"WhatsApp Cloud API error: {err_detail}"
                    )
            except Exception as e:
                logger.exception("Failed to connect to Meta WhatsApp endpoint")
                return WhatsAppSendResult(
                    success=False,
                    recipient_phone=clean_phone,
                    status="failed",
                    error=str(e)
                )

        # 3. Development / Sandbox Simulation Mode (Fallback when live credentials not yet configured)
        simulated_id = f"wamid.HBgM{clean_phone}V19Simulated{int(datetime.utcnow().timestamp())}"
        self._increment_user_message_count(clean_phone, user_id)

        log_entry = {
            "id": f"log_{datetime.utcnow().timestamp()}",
            "userId": user_id,
            "phoneNumber": clean_phone,
            "campaignId": campaign_id,
            "messageType": message_type,
            "content": message_body,
            "language": language,
            "direction": "outbound",
            "status": "delivered",
            "whatsappMessageId": simulated_id,
            "timestamp": datetime.utcnow().isoformat(),
            "notes": "Simulated delivery (WHATSAPP_ACCESS_TOKEN not present in environment)"
        }
        MESSAGE_LOGS.insert(0, log_entry)

        return WhatsAppSendResult(
            success=True,
            recipient_phone=clean_phone,
            whatsapp_message_id=simulated_id,
            status="simulated"
        )

    def _increment_user_message_count(self, clean_phone: str, user_id: Optional[str]):
        """Track user weekly dispatch counter for frequency limits."""
        consent = None
        if user_id and user_id in USER_CONSENTS:
            consent = USER_CONSENTS[user_id]
        else:
            for c in USER_CONSENTS.values():
                if sanitize_phone_number(c.phone_number) == clean_phone:
                    consent = c
                    break

        if consent:
            consent.weekly_message_count += 1
            consent.last_message_sent_at = datetime.utcnow().isoformat()


# Global singleton instance
whatsapp_service = WhatsAppService()
