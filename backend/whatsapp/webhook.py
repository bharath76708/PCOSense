"""
WhatsApp Webhook Handler for FastAPI
Processes incoming messages from Meta WhatsApp Cloud API with intent detection and automatic routing.
"""

import os
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, Response, Query, HTTPException
from fastapi.responses import PlainTextResponse

try:
    from backend.whatsapp.service import (
        whatsapp_service,
        WHATSAPP_VERIFY_TOKEN,
        MESSAGE_LOGS
    )
    from backend.whatsapp.templates import INTENT_RESPONSES
    from backend.automation.message_generator import generate_ai_whatsapp_message
except ImportError:
    from whatsapp.service import (
        whatsapp_service,
        WHATSAPP_VERIFY_TOKEN,
        MESSAGE_LOGS
    )
    from whatsapp.templates import INTENT_RESPONSES
    from automation.message_generator import generate_ai_whatsapp_message

logger = logging.getLogger("pcosense.webhook")
router = APIRouter()


@router.get("/webhook")
async def verify_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge")
):
    """
    Official Meta WhatsApp Cloud API Webhook Verification Endpoint.
    Responds to Meta's subscription challenge handshake.
    """
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", WHATSAPP_VERIFY_TOKEN)

    if hub_mode == "subscribe" and hub_verify_token == verify_token:
        logger.info("WhatsApp webhook verified successfully by Meta!")
        return PlainTextResponse(content=hub_challenge or "", status_code=200)

    logger.warning("WhatsApp webhook verification token mismatch or invalid mode")
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("/webhook")
async def handle_incoming_webhook(request: Request):
    """
    Receives incoming webhook events (incoming user messages, read receipts, delivery updates).
    """
    try:
        body: Dict[str, Any] = await request.json()
    except Exception:
        return {"status": "ignored", "reason": "non-json"}

    # Validate that this is a WhatsApp Business Account message entry
    entry_list = body.get("entry", [])
    if not entry_list:
        return {"status": "ok", "message": "no entries"}

    for entry in entry_list:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])

            for msg in messages:
                sender_phone = msg.get("from")
                msg_type = msg.get("type")
                text_content = ""

                if msg_type == "text":
                    text_content = msg.get("text", {}).get("body", "").strip()
                elif msg_type == "button":
                    text_content = msg.get("button", {}).get("text", "").strip()
                elif msg_type == "interactive":
                    text_content = (
                        msg.get("interactive", {}).get("button_reply", {}).get("id") or
                        msg.get("interactive", {}).get("list_reply", {}).get("id") or ""
                    )

                if sender_phone and text_content:
                    await process_incoming_user_message(sender_phone, text_content)

    return {"status": "processed"}


async def process_incoming_user_message(sender_phone: str, text: str) -> Dict[str, Any]:
    """
    Intent detection pipeline:
    User → WhatsApp → Webhook → FastAPI → AI/Intent Detection
    """
    norm_text = text.upper().strip()
    user_consent = whatsapp_service.get_user_consent(sender_phone)
    lang = user_consent.preferred_language if user_consent else "en"

    # Log incoming message
    MESSAGE_LOGS.insert(0, {
        "id": f"in_{datetime_now()}",
        "phoneNumber": sender_phone,
        "content": text,
        "language": lang,
        "direction": "inbound",
        "status": "received",
        "timestamp": datetime_now_iso()
    })

    # Intent 1: STOP (Immediate Opt-out)
    if "STOP" in norm_text or "UNSUBSCRIBE" in norm_text or "ఆపు" in text:
        whatsapp_service.opt_out_by_phone(sender_phone)
        reply = INTENT_RESPONSES["STOP"].get(lang, INTENT_RESPONSES["STOP"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            bypass_opt_in_for_test=True,
            message_type="System Opt-Out"
        )
        return {"intent": "STOP", "status": "opted_out", "reply": reply}

    # Intent 2: START (Opt-in)
    if "START" in norm_text or "RESUME" in norm_text or "ప్రారంభించు" in text:
        whatsapp_service.register_user_consent(
            user_id=f"user_{sender_phone}",
            phone_number=sender_phone,
            opt_in=True,
            preferred_language=lang
        )
        reply = INTENT_RESPONSES["START"].get(lang, INTENT_RESPONSES["START"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="PCOS Awareness"
        )
        return {"intent": "START", "status": "opted_in", "reply": reply}

    # Intent 3: HELP
    if "HELP" in norm_text or "సహాయం" in text or norm_text == "?":
        reply = INTENT_RESPONSES["HELP"].get(lang, INTENT_RESPONSES["HELP"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="General Education"
        )
        return {"intent": "HELP", "reply": reply}

    # Intent 4: TRACK
    if "TRACK" in norm_text or "SYMPTOM" in norm_text or "లక్షణాలు" in text:
        reply = INTENT_RESPONSES["TRACK"].get(lang, INTENT_RESPONSES["TRACK"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="Symptom Tracking"
        )
        return {"intent": "TRACK", "reply": reply}

    # Intent 5: FOOD
    if "FOOD" in norm_text or "MEAL" in norm_text or "DIET" in norm_text or "ఆహారం" in text:
        reply = INTENT_RESPONSES["FOOD"].get(lang, INTENT_RESPONSES["FOOD"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="Food Awareness"
        )
        return {"intent": "FOOD", "reply": reply}

    # Intent 6: APPOINTMENT
    if "APPOINTMENT" in norm_text or "BOOK" in norm_text or "అపాయింట్‌మెంట్" in text:
        reply = INTENT_RESPONSES["APPOINTMENT"].get(lang, INTENT_RESPONSES["APPOINTMENT"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="Appointment Reminder"
        )
        return {"intent": "APPOINTMENT", "reply": reply}

    # Intent 7: DOCTOR
    if "DOCTOR" in norm_text or "GYNEC" in norm_text or "డాక్టర్" in text:
        reply = INTENT_RESPONSES["DOCTOR"].get(lang, INTENT_RESPONSES["DOCTOR"]["en"])
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="General Education"
        )
        return {"intent": "DOCTOR", "reply": reply}

    # Intent 8: LANGUAGE (Switch)
    if "LANG TE" in norm_text or "TELUGU" in norm_text:
        if user_consent:
            user_consent.preferred_language = "te"
        reply = "భాష విజయవంతంగా తెలుగుకు మార్చబడింది. PCOSense మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది! 🌸"
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="General Education",
            language="te"
        )
        return {"intent": "LANGUAGE", "lang": "te", "reply": reply}

    if "LANG EN" in norm_text or "ENGLISH" in norm_text:
        if user_consent:
            user_consent.preferred_language = "en"
        reply = "Language updated to English. PCOSense is here to support you! 🌸"
        await whatsapp_service.send_text_message(
            recipient_phone=sender_phone,
            message_body=reply,
            message_type="General Education",
            language="en"
        )
        return {"intent": "LANGUAGE", "lang": "en", "reply": reply}

    # Intent 9: AI Educational Assistance with Gemini
    ai_resp = await generate_ai_whatsapp_message(
        topic=text,
        target_audience="User asking question via WhatsApp",
        language=lang,
        tone="Empathetic",
        message_length="Standard (<300 chars)"
    )
    reply_body = ai_resp.get("content", INTENT_RESPONSES["HELP"][lang])

    await whatsapp_service.send_text_message(
        recipient_phone=sender_phone,
        message_body=reply_body,
        message_type="General Education",
        language=lang
    )

    return {"intent": "AI_ANSWER", "reply": reply_body}


def datetime_now() -> int:
    import time
    return int(time.time())

def datetime_now_iso() -> str:
    from datetime import datetime
    return datetime.utcnow().isoformat()
