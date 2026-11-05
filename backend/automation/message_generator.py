"""
PCOSense AI Message Generator using Gemini
Generates personalized, educational WhatsApp messages adhering to strict clinical safety directives.
Supports English and Telugu.
"""

import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("pcosense.ai_generator")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Fallback curated messages in case Gemini API is offline or quota reached
FALLBACK_GENERATIONS: Dict[str, Dict[str, str]] = {
    "PCOS symptom tracking": {
        "en": "PCOSense Reminder 🌸\n\nHave you tracked your symptoms today?\n\nRegular tracking can help you understand changes in your cycle and discuss them with your healthcare professional.\n\nReply STOP to unsubscribe.",
        "te": "PCOSense రిమైండర్ 🌸\n\nఈ రోజు మీ లక్షణాలను ట్రాక్ చేశారా?\n\nమీ లక్షణాలను క్రమం తప్పకుండా నమోదు చేసుకోవడం ద్వారా మార్పులను గమనించి, అవసరమైనప్పుడు ఆరోగ్య నిపుణులతో చర్చించవచ్చు.\n\nఆపివేయడానికి STOP అని సమాధానం ఇవ్వండి."
    },
    "PCOS awareness": {
        "en": "PCOSense Awareness 🌿\n\nUnderstanding PCOS is about discovering what supports your unique body. Consistent sleep, balanced nutrition, and daily movement can make a lasting difference.\n\nConsult your doctor for personalized medical guidance.\n\nReply STOP to unsubscribe.",
        "te": "PCOSense అవగాహన 🌿\n\nPCOS ను సరైన అవగాహనతో ఎదుర్కోవచ్చు. సమతుల్య ఆహారం, మంచి నిద్ర, రోజూ తేలికపాటి నడక హార్మోన్ల సమతుల్యతకు తోడ్పడతాయి.\n\nవైద్య సలహా కోసం డాక్టర్‌ను సంప్రదించండి.\n\nఆపివేయడానికి STOP అని పంపండి."
    },
    "Food awareness": {
        "en": "PCOSense Nutrition 🥑\n\nEnjoying protein and fiber with carbohydrates helps keep your blood sugar steady and energy levels high throughout the day. Balanced plates nourish your hormones!\n\nReply STOP to unsubscribe.",
        "te": "PCOSense పోషకాహారం 🥑\n\nభోజనంలో పప్పులు, కూరగాయలు మరియు చిరుధాన్యాలు ఉండటం వల్ల రక్తంలో చక్కెర స్థాయులు నిలకడగా ఉంటాయి. కఠినమైన డైట్ కంటే సమతుల్యత ముఖ్యం!\n\nఆపివేయడానికి STOP అని పంపండి."
    },
    "Exercise reminder": {
        "en": "PCOSense Daily Movement 🧘‍♀️\n\nEven a brisk 15-minute walk or gentle stretching helps lower cortisol and supports your natural metabolism. Every step counts toward wellness!\n\nReply STOP to unsubscribe.",
        "te": "PCOSense వ్యాయామ సూచన 🧘‍♀️\n\nరోజూ 15 నిమిషాల నడక లేదా యోగా మీ శరీరానికి ఎంతో శక్తిని ఇస్తుంది. నెమ్మదిగా మొదలుపెట్టి క్రమం తప్పకుండా కొనసాగించండి.\n\nఆపివేయడానికి STOP అని పంపండి."
    }
}


def build_system_prompt(language: str = "en") -> str:
    is_telugu = (language == "te")
    lang_clause = (
        "Respond ENTIRELY in natural, grammatically correct, warm, and conversational Telugu (తెలుగు). "
        "Keep terms like 'PCOS' in Latin characters if helpful, but all sentences, greetings, and guidance must be in Telugu."
        if is_telugu else
        "Respond in clear, friendly, and compassionate English."
    )

    return f"""You are the PCOSense AI WhatsApp Engagement & Awareness Specialist.
Your mission is to generate short, warm, empowering, and medically responsible educational WhatsApp messages for women managing Polycystic Ovary Syndrome (PCOS).

LANGUAGE MANDATE:
{lang_clause}

CRITICAL MEDICAL & ETHICAL DIRECTIVES (STRICT ZERO-TOLERANCE RULES):
1. NEVER diagnose PCOS or declare that the reader definitely has or does not have PCOS.
2. NEVER claim to cure or reverse PCOS.
3. NEVER prescribe medication, supplement dosages, or tell users to stop/alter medications.
4. NEVER replace a doctor or medical professional.
5. NEVER make unsafe medical recommendations or generate fear-based/guilt-inducing messaging.
6. For any medical uncertainty, explicitly remind the user to consult a qualified healthcare professional (OB/GYN, endocrinologist, or registered dietitian).
7. Keep messages short, engaging, and formatted for WhatsApp:
   - Use 1-2 friendly emojis (🌸, 🌿, 🥑, 🧘‍♀️, 💧)
   - Max 2 short paragraphs or 3 concise bullet points
   - Total length: under 300 characters for quick reading
   - Always conclude with an opt-out line: "Reply STOP to unsubscribe." (or Telugu: "ఆపివేయడానికి STOP అని పంపండి.")"""


async def generate_ai_whatsapp_message(
    topic: str,
    target_audience: str = "Registered PCOSense users",
    language: str = "en",
    tone: str = "Empathetic",
    message_length: str = "Standard (<300 chars)",
    include_disclaimer: bool = True
) -> Dict[str, Any]:
    """
    Generate an educational WhatsApp message using Google Gemini or fallback templates.
    """
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    system_instruction = build_system_prompt(language)

    user_prompt = f"""Generate a WhatsApp educational broadcast message:
- Campaign Topic: {topic}
- Target Audience: {target_audience}
- Preferred Tone: {tone}
- Length Constraint: {message_length}
- Target Language: {"Telugu (తెలుగు)" if language == 'te' else "English"}

Ensure the response contains ONLY the final ready-to-send WhatsApp message text (with emojis and opt-out line). No extra meta-talk or quotation marks."""

    # 1. Try Google Gemini SDK if available
    if api_key:
        try:
            import httpx
            # Call Google GenAI REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 350
                }
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            generated_text = parts[0]["text"].strip()
                            return {
                                "success": True,
                                "content": generated_text,
                                "model": "Gemini 2.5 Flash",
                                "language": language,
                                "topic": topic
                            }
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to curated template: {e}")

    # 2. High-precision curated fallback
    matched_topic_key = "PCOS awareness"
    topic_lower = topic.lower()
    if "symptom" in topic_lower or "track" in topic_lower:
        matched_topic_key = "PCOS symptom tracking"
    elif "food" in topic_lower or "diet" in topic_lower or "eat" in topic_lower or "nutrition" in topic_lower:
        matched_topic_key = "Food awareness"
    elif "exercise" in topic_lower or "walk" in topic_lower or "yoga" in topic_lower:
        matched_topic_key = "Exercise reminder"

    fallback_text = FALLBACK_GENERATIONS.get(matched_topic_key, {}).get(language, FALLBACK_GENERATIONS["PCOS awareness"]["en"])

    return {
        "success": True,
        "content": fallback_text,
        "model": "PCOSense Clinical Rule Engine (Curated)",
        "language": language,
        "topic": topic
    }
