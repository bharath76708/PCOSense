"""
Scheduler for Automated WhatsApp Awareness Workflows
Manages daily symptom reminders, weekly educational blasts, and pre-appointment notifications.
Enforces admin-configured frequency limits.
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

try:
    from backend.whatsapp.service import (
        whatsapp_service,
        USER_CONSENTS,
        ADMIN_SETTINGS
    )
    from backend.whatsapp.templates import TEMPLATES
except ImportError:
    from whatsapp.service import (
        whatsapp_service,
        USER_CONSENTS,
        ADMIN_SETTINGS
    )
    from whatsapp.templates import TEMPLATES

logger = logging.getLogger("pcosense.scheduler")


class AutomationScheduler:
    def __init__(self):
        self.is_running = False

    def get_frequency_limit(self) -> int:
        return ADMIN_SETTINGS.get("max_messages_per_user_weekly", 3)

    def set_frequency_limit(self, limit: int) -> int:
        clamped = max(1, min(10, limit))
        ADMIN_SETTINGS["max_messages_per_user_weekly"] = clamped
        logger.info(f"Updated WhatsApp frequency limit to {clamped} per user/week")
        return clamped

    async def run_daily_symptom_reminders(self) -> Dict[str, Any]:
        """
        Dispatches daily symptom tracking reminders to opted-in users
        who have symptom_reminders preference enabled.
        """
        sent_count = 0
        skipped_count = 0

        for user_id, consent in USER_CONSENTS.items():
            if not consent.whatsapp_opt_in:
                skipped_count += 1
                continue

            if not consent.notification_preferences.symptom_reminders:
                skipped_count += 1
                continue

            lang = consent.preferred_language
            body = TEMPLATES["symptom_tracking"].get(lang, TEMPLATES["symptom_tracking"]["en"])

            res = await whatsapp_service.send_text_message(
                recipient_phone=consent.phone_number,
                message_body=body,
                user_id=user_id,
                message_type="Symptom Tracking",
                language=lang
            )

            if res.success:
                sent_count += 1
            else:
                skipped_count += 1

        return {
            "job": "daily_symptom_reminders",
            "sent": sent_count,
            "skipped": skipped_count,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def run_weekly_education_blast(self, topic: str = "pcos_awareness") -> Dict[str, Any]:
        """
        Dispatches weekly PCOS awareness and lifestyle content to opted-in users.
        """
        sent_count = 0
        skipped_count = 0

        for user_id, consent in USER_CONSENTS.items():
            if not consent.whatsapp_opt_in:
                skipped_count += 1
                continue

            lang = consent.preferred_language
            body = TEMPLATES.get(topic, {}).get(lang, TEMPLATES["pcos_awareness"]["en"])

            res = await whatsapp_service.send_text_message(
                recipient_phone=consent.phone_number,
                message_body=body,
                user_id=user_id,
                message_type="PCOS Awareness",
                language=lang
            )

            if res.success:
                sent_count += 1
            else:
                skipped_count += 1

        return {
            "job": "weekly_education_blast",
            "topic": topic,
            "sent": sent_count,
            "skipped": skipped_count,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def send_appointment_reminder(
        self,
        user_id: str,
        phone_number: str,
        patient_name: str,
        doctor_name: str,
        appointment_date: str,
        appointment_time: str,
        clinic_name: str = "PCOSense Clinical Portal",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Sends an appointment reminder 24h prior to doctor consultation
        ONLY if the user has opted in.
        """
        consent = whatsapp_service.get_user_consent(user_id)
        if not consent or not consent.whatsapp_opt_in:
            logger.info(f"Skipping appointment reminder for {user_id}: User not opted in.")
            return {
                "success": False,
                "error": "User has not opted in to WhatsApp reminders."
            }

        template_str = TEMPLATES["appointment_reminder"].get(language, TEMPLATES["appointment_reminder"]["en"])
        message_body = template_str.format(
            patient_name=patient_name,
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            clinic_name=clinic_name
        )

        res = await whatsapp_service.send_text_message(
            recipient_phone=phone_number or consent.phone_number,
            message_body=message_body,
            user_id=user_id,
            message_type="Appointment Reminder",
            language=language
        )

        return {
            "success": res.success,
            "whatsapp_message_id": res.whatsapp_message_id,
            "status": res.status,
            "error": res.error
        }


scheduler = AutomationScheduler()
