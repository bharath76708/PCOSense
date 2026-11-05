"""
Pydantic Data Models for WhatsApp Business Cloud API & PCOSense Automation
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
import uuid


class NotificationPreferences(BaseModel):
    symptom_reminders: bool = True
    food_awareness: bool = True
    exercise_reminders: bool = True
    appointment_reminders: bool = True
    general_education: bool = True


class UserWhatsAppConsent(BaseModel):
    user_id: str
    phone_number: str
    whatsapp_opt_in: bool = False
    preferred_language: Literal["en", "te"] = "en"
    notification_preferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    opt_in_timestamp: Optional[str] = None
    opt_out_timestamp: Optional[str] = None
    weekly_message_count: int = 0
    last_message_sent_at: Optional[str] = None


class WhatsAppTextMessage(BaseModel):
    recipient_phone: str
    message_body: str
    preview_url: bool = False
    language: Literal["en", "te"] = "en"
    message_type: str = "PCOS Awareness"
    campaign_id: Optional[str] = None
    user_id: Optional[str] = None


class WhatsAppSendResult(BaseModel):
    success: bool
    recipient_phone: str
    whatsapp_message_id: Optional[str] = None
    status: Literal["sent", "failed", "simulated", "opted_out", "rate_limited"]
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class WhatsAppIncomingMessage(BaseModel):
    sender_phone: str
    message_id: str
    timestamp: str
    text_body: str
    message_type: str = "text"
    raw_payload: Optional[Dict[str, Any]] = None


class AIMessageGenerateRequest(BaseModel):
    topic: str
    target_audience: str = "Registered PCOSense users"
    language: Literal["en", "te"] = "en"
    tone: Literal["Empathetic", "Encouraging", "Educational", "Motivational"] = "Empathetic"
    message_length: Literal["Short (<160 chars)", "Standard (<300 chars)", "Detailed"] = "Standard (<300 chars)"
    include_disclaimer: bool = True


class CampaignCreateRequest(BaseModel):
    campaign_name: str
    target_audience: str = "All Opted-in Users"
    language: Literal["en", "te", "both"] = "both"
    message_type: Literal[
        "PCOS Awareness",
        "Food Awareness",
        "Exercise Reminder",
        "Symptom Tracking",
        "Appointment Reminder",
        "General Education"
    ] = "PCOS Awareness"
    message_content: str
    message_content_te: Optional[str] = None
    schedule: str = "Immediately"
    start_date: str
    end_date: str
    status: Literal["Draft", "Scheduled", "Active", "Paused", "Completed"] = "Draft"


class CampaignRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"cmp_{uuid.uuid4().hex[:8]}")
    campaign_name: str
    target_audience: str
    language: Literal["en", "te", "both"]
    message_type: str
    message_content: str
    message_content_te: Optional[str] = None
    schedule: str
    start_date: str
    end_date: str
    status: Literal["Draft", "Scheduled", "Active", "Paused", "Completed"]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    stats: Dict[str, int] = Field(default_factory=lambda: {
        "sent": 0,
        "delivered": 0,
        "read": 0,
        "failed": 0,
        "replies": 0
    })


class WhatsAppFrequencySettings(BaseModel):
    max_messages_per_user_weekly: int = 3
    business_phone_number_id: Optional[str] = None
    business_account_id: Optional[str] = None
    verify_token: Optional[str] = None
    quiet_hours_enabled: bool = True
    quiet_hours_start: str = "21:00"
    quiet_hours_end: str = "08:00"
