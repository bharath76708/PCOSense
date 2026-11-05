"""
FastAPI Backend for PCOSense
Endpoints for Health, Prediction, Explainability, What-If Simulation, and Model Benchmarks.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import datetime
import uuid

from app.ml.model import predict_pcos_probability, ORDERED_FEATURES, MODEL_COEFFICIENTS

app = FastAPI(
    title="PCOSense API",
    description="Explainable Machine Learning Risk-Screening and Health Awareness API for PCOS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientInput(BaseModel):
    # Personal
    age: Optional[float] = Field(28.0, alias="Age (yrs)")
    weight: Optional[float] = Field(60.0, alias="Weight (Kg)")
    height: Optional[float] = Field(160.0, alias="Height(Cm)")
    bmi: Optional[float] = Field(23.4, alias="BMI")
    blood_group: Optional[int] = Field(15, alias="Blood Group")
    pulse_rate: Optional[float] = Field(72.0, alias="Pulse rate(bpm)")
    respiratory_rate: Optional[float] = Field(18.0, alias="RR (breaths/min)")
    hb: Optional[float] = Field(11.5, alias="Hb(g/dl)")
    bp_systolic: Optional[float] = Field(115.0, alias="BP _Systolic (mmHg)")
    bp_diastolic: Optional[float] = Field(75.0, alias="BP _Diastolic (mmHg)")
    
    # Menstrual
    cycle_regularity: Optional[int] = Field(2, alias="Cycle(R/I)")
    cycle_length: Optional[float] = Field(5.0, alias="Cycle length(days)")
    marriage_years: Optional[float] = Field(4.0, alias="Marraige Status (Yrs)")
    pregnant: Optional[int] = Field(0, alias="Pregnant(Y/N)")
    abortions: Optional[int] = Field(0, alias="No. of aborptions")
    
    # Symptoms
    weight_gain: Optional[int] = Field(0, alias="Weight gain(Y/N)")
    hair_growth: Optional[int] = Field(0, alias="hair growth(Y/N)")
    skin_darkening: Optional[int] = Field(0, alias="Skin darkening (Y/N)")
    hair_loss: Optional[int] = Field(0, alias="Hair loss(Y/N)")
    pimples: Optional[int] = Field(0, alias="Pimples(Y/N)")
    
    # Lifestyle & Labs
    fast_food: Optional[float] = Field(0.0, alias="Fast food (Y/N)")
    exercise: Optional[int] = Field(1, alias="Reg.Exercise(Y/N)")
    rbs: Optional[float] = Field(95.0, alias="RBS(mg/dl)")
    tsh: Optional[float] = Field(2.3, alias="TSH (mIU/L)")
    amh: Optional[float] = Field(3.5, alias="AMH(ng/mL)")
    prl: Optional[float] = Field(20.0, alias="PRL(ng/mL)")
    vit_d3: Optional[float] = Field(30.0, alias="Vit D3 (ng/mL)")
    prg: Optional[float] = Field(0.4, alias="PRG(ng/mL)")
    fsh: Optional[float] = Field(5.0, alias="FSH(mIU/mL)")
    lh: Optional[float] = Field(3.5, alias="LH(mIU/mL)")
    fsh_lh: Optional[float] = Field(1.8, alias="FSH/LH")
    hip: Optional[float] = Field(38.0, alias="Hip(inch)")
    waist: Optional[float] = Field(32.0, alias="Waist(inch)")
    waist_hip_ratio: Optional[float] = Field(0.84, alias="Waist:Hip Ratio")
    hcg_i: Optional[float] = Field(1.99, alias="I beta-HCG(mIU/mL)")
    hcg_ii: Optional[float] = Field(1.99, alias="II beta-HCG(mIU/mL)")
    follicle_l: Optional[float] = Field(4.0, alias="Follicle No. (L)")
    follicle_r: Optional[float] = Field(5.0, alias="Follicle No. (R)")
    fsize_l: Optional[float] = Field(15.0, alias="Avg. F size (L) (mm)")
    fsize_r: Optional[float] = Field(16.0, alias="Avg. F size (R) (mm)")
    endometrium: Optional[float] = Field(7.5, alias="Endometrium (mm)")

    class Config:
        populate_by_name = True

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PCOSense FastAPI Backend",
        "model": "Logistic Regression (StandardScaled)",
        "accuracy": "88.99%",
        "recall": "86.11%",
        "roc_auc": "95.09%"
    }

@app.post("/predict")
def predict_endpoint(payload: Dict[str, Any]):
    try:
        pred, prob, risk_level, contributions = predict_pcos_probability(payload)
        return {
            "prediction": pred,
            "probability": prob,
            "probability_percentage": round(prob * 100, 2),
            "risk_level": risk_level,
            "model_name": "Logistic Regression (StandardScaled)",
            "assessment_id": f"PCO-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/explain")
def explain_endpoint(payload: Dict[str, Any]):
    try:
        pred, prob, risk_level, contributions = predict_pcos_probability(payload)
        top_drivers = [c for c in contributions if c['direction'] == 'increase'][:7]
        protective = [c for c in contributions if c['direction'] == 'decrease'][:5]
        return {
            "prediction": pred,
            "probability": prob,
            "risk_level": risk_level,
            "key_risk_drivers": top_drivers,
            "protective_factors": protective,
            "all_feature_contributions": contributions
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/model-info")
def model_info_endpoint():
    return {
        "dataset_rows": 541,
        "features_count": 41,
        "selected_model": "Logistic Regression (StandardScaled)",
        "evaluation_metrics": {
            "accuracy": 0.8899,
            "precision": 0.8158,
            "recall": 0.8611,
            "f1_score": 0.8378,
            "roc_auc": 0.9509
        },
        "features": ORDERED_FEATURES
    }

# ============================================================
# WHATSAPP INTEGRATION & AUTOMATION ENDPOINTS
# ============================================================

try:
    from backend.whatsapp.webhook import router as whatsapp_webhook_router
    from backend.whatsapp.service import whatsapp_service, ADMIN_SETTINGS, USER_CONSENTS, MESSAGE_LOGS
    from backend.whatsapp.models import (
        CampaignCreateRequest,
        AIMessageGenerateRequest,
        WhatsAppTextMessage
    )
    from backend.automation.campaign_service import campaign_service
    from backend.automation.message_generator import generate_ai_whatsapp_message
    from backend.automation.scheduler import scheduler
except ImportError:
    from whatsapp.webhook import router as whatsapp_webhook_router
    from whatsapp.service import whatsapp_service, ADMIN_SETTINGS, USER_CONSENTS, MESSAGE_LOGS
    from whatsapp.models import (
        CampaignCreateRequest,
        AIMessageGenerateRequest,
        WhatsAppTextMessage
    )
    from automation.campaign_service import campaign_service
    from automation.message_generator import generate_ai_whatsapp_message
    from automation.scheduler import scheduler

# Mount Webhook router for Meta WhatsApp Business Cloud API
app.include_router(whatsapp_webhook_router, prefix="/api/whatsapp", tags=["whatsapp-webhook"])

@app.get("/api/whatsapp/stats")
def get_whatsapp_analytics():
    return {
        "success": True,
        "data": campaign_service.get_analytics()
    }

@app.get("/api/whatsapp/campaigns")
def list_campaigns():
    return {
        "success": True,
        "data": campaign_service.list_campaigns()
    }

@app.post("/api/whatsapp/campaigns")
def create_campaign(payload: CampaignCreateRequest):
    campaign = campaign_service.create_campaign(payload)
    return {
        "success": True,
        "message": "Campaign created successfully.",
        "data": campaign
    }

@app.post("/api/whatsapp/campaigns/{campaign_id}/execute")
async def execute_campaign(campaign_id: str):
    res = await campaign_service.execute_campaign(campaign_id)
    return res

@app.put("/api/whatsapp/campaigns/{campaign_id}/status")
def update_campaign_status(campaign_id: str, payload: Dict[str, str]):
    status = payload.get("status", "Active")
    updated = campaign_service.update_campaign_status(campaign_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"success": True, "data": updated}

@app.delete("/api/whatsapp/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str):
    ok = campaign_service.delete_campaign(campaign_id)
    return {"success": ok}

@app.post("/api/whatsapp/generate-message")
async def generate_ai_message(payload: AIMessageGenerateRequest):
    res = await generate_ai_whatsapp_message(
        topic=payload.topic,
        target_audience=payload.target_audience,
        language=payload.language,
        tone=payload.tone,
        message_length=payload.message_length,
        include_disclaimer=payload.include_disclaimer
    )
    return {"success": True, "data": res}

@app.post("/api/whatsapp/send-test")
async def send_test_message(payload: Dict[str, Any]):
    recipient = payload.get("recipient_phone")
    content = payload.get("content")
    language = payload.get("language", "en")

    if not recipient or not content:
        raise HTTPException(status_code=400, detail="recipient_phone and content are required")

    result = await whatsapp_service.send_text_message(
        recipient_phone=recipient,
        message_body=content,
        bypass_opt_in_for_test=True,
        message_type="Admin Test",
        language=language
    )
    return {"success": result.success, "data": result}

@app.post("/api/whatsapp/send-food-summary")
async def send_food_summary_whatsapp(payload: Dict[str, Any]):
    user_id = payload.get("user_id")
    dish_name = payload.get("dish_name", "Prepared Meal")
    glycemic_rating = payload.get("glycemic_rating", "Moderate")
    gl_estimate = payload.get("gl_estimate", "12")
    suitability_rating = payload.get("suitability_rating", "Moderate")
    suitability_score = payload.get("suitability_score", 7)
    calories = payload.get("calories", 350)
    protein = payload.get("protein", 15)
    carbs = payload.get("carbs", 40)
    fiber = payload.get("fiber", 8)
    guidance = payload.get("guidance", "Balanced plate with protein and fiber buffer.")
    language = payload.get("language", "en")
    recipient_phone = payload.get("phone_number")

    consent = whatsapp_service.get_user_consent(user_id) if user_id else None
    if not consent and recipient_phone:
        # Check if phone is registered
        for c in USER_CONSENTS.values():
            if c.phone_number == recipient_phone and c.whatsapp_opt_in:
                consent = c
                break

    if not consent or not consent.whatsapp_opt_in:
        return {
            "success": False,
            "requires_opt_in": True,
            "error": "User has not enabled WhatsApp educational notifications. Please opt in from your profile."
        }

    phone_to_use = recipient_phone or consent.phone_number
    lang_to_use = language or consent.preferred_language

    from backend.whatsapp.templates import TEMPLATES
    tpl = TEMPLATES["food_summary"].get(lang_to_use, TEMPLATES["food_summary"]["en"])
    body = tpl.format(
        dish_name=dish_name,
        glycemic_rating=glycemic_rating,
        gl_estimate=gl_estimate,
        suitability_rating=suitability_rating,
        suitability_score=suitability_score,
        calories=calories,
        protein=protein,
        carbs=carbs,
        fiber=fiber,
        guidance=guidance
    )

    res = await whatsapp_service.send_text_message(
        recipient_phone=phone_to_use,
        message_body=body,
        user_id=user_id,
        message_type="Food Awareness",
        language=lang_to_use
    )
    return {"success": res.success, "data": res}

@app.post("/api/whatsapp/send-appointment")
async def send_appointment_whatsapp(payload: Dict[str, Any]):
    user_id = payload.get("user_id")
    phone_number = payload.get("phone_number")
    patient_name = payload.get("patient_name", "Patient")
    doctor_name = payload.get("doctor_name", "Specialist Doctor")
    appointment_date = payload.get("appointment_date", "Tomorrow")
    appointment_time = payload.get("appointment_time", "10:30 AM")
    clinic_name = payload.get("clinic_name", "PCOSense Partner Clinic")
    language = payload.get("language", "en")

    res = await scheduler.send_appointment_reminder(
        user_id=user_id,
        phone_number=phone_number,
        patient_name=patient_name,
        doctor_name=doctor_name,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        clinic_name=clinic_name,
        language=language
    )
    return res

@app.get("/api/whatsapp/settings")
def get_whatsapp_settings():
    return {
        "success": True,
        "data": {
            **ADMIN_SETTINGS,
            "is_configured": whatsapp_service.is_configured()
        }
    }

@app.put("/api/whatsapp/settings")
def update_whatsapp_settings(payload: Dict[str, Any]):
    limit = payload.get("max_messages_per_user_weekly")
    if limit is not None:
        scheduler.set_frequency_limit(int(limit))
    return {"success": True, "data": ADMIN_SETTINGS}

@app.get("/api/whatsapp/consent/{user_id}")
def get_user_consent(user_id: str):
    consent = whatsapp_service.get_user_consent(user_id)
    return {"success": True, "data": consent}

@app.post("/api/whatsapp/consent")
def set_user_consent(payload: Dict[str, Any]):
    user_id = payload.get("user_id")
    phone_number = payload.get("phone_number")
    opt_in = bool(payload.get("whatsapp_opt_in", False))
    preferred_language = payload.get("preferred_language", "en")
    notification_preferences = payload.get("notification_preferences", {})

    if not user_id or not phone_number:
        raise HTTPException(status_code=400, detail="user_id and phone_number are required")

    consent = whatsapp_service.register_user_consent(
        user_id=user_id,
        phone_number=phone_number,
        opt_in=opt_in,
        preferred_language=preferred_language,
        notification_preferences=notification_preferences
    )
    return {"success": True, "data": consent}
