"""
PCOSense WhatsApp Educational Templates (English & Telugu)
Adheres strictly to medical safety: no diagnosis, no treatment claims, encourages professional consultation.
"""

from typing import Dict, Any

TEMPLATES: Dict[str, Dict[str, str]] = {
    # 1. Symptom Tracking Reminder
    "symptom_tracking": {
        "en": (
            "PCOSense Reminder 🌸\n\n"
            "Have you tracked your symptoms today?\n\n"
            "Regular tracking can help you understand changes in your cycle and discuss them with your healthcare professional.\n\n"
            "Open PCOSense: https://pcosense.health/dashboard\n"
            "Reply STOP to unsubscribe."
        ),
        "te": (
            "PCOSense రిమైండర్ 🌸\n\n"
            "ఈ రోజు మీ లక్షణాలను ట్రాక్ చేశారా?\n\n"
            "మీ లక్షణాలను క్రమం తప్పకుండా నమోదు చేసుకోవడం ద్వారా మార్పులను గమనించి, అవసరమైనప్పుడు ఆరోగ్య నిపుణులతో చర్చించవచ్చు.\n\n"
            "PCOSense తెరవండి: https://pcosense.health/dashboard\n"
            "ఆపివేయడానికి STOP అని సమాధానం ఇవ్వండి."
        )
    },

    # 2. PCOS Awareness
    "pcos_awareness": {
        "en": (
            "PCOSense Awareness 🌿\n\n"
            "Did you know? PCOS affects 1 in 5 women of reproductive age worldwide. "
            "It is a complex hormonal and metabolic condition, often characterized by irregular cycles, insulin resistance, or androgen excess.\n\n"
            "Understanding your unique body is the first step toward hormonal harmony.\n\n"
            "For medical diagnosis and care, always consult an OB/GYN or endocrinologist.\n"
            "Reply STOP to opt out."
        ),
        "te": (
            "PCOSense అవగాహన 🌿\n\n"
            "మీకు తెలుసా? ప్రపంచవ్యాప్తంగా ప్రతి 5 గురు స్త్రీలలో ఒకరికి PCOS లక్షణాలు ఉంటాయి. "
            "ఇది హార్మోన్లు మరియు మెటబాలిజం సమతుల్యతకు సంబంధించినది.\n\n"
            "మీ శరీరాన్ని సరిగ్గా అర్థం చేసుకోవడమే సంపూర్ణ ఆరోగ్యానికి మొదటి అడుగు.\n\n"
            "వైద్య సలహా కోసం మీ స్త్రీల వైద్య నిపుణులను (Gynecologist) సంప్రదించండి.\n"
            "ఆపివేయడానికి STOP అని పంపండి."
        )
    },

    # 3. Food Awareness
    "food_awareness": {
        "en": (
            "PCOSense Nutrition Tip 🥑\n\n"
            "Pairing carbohydrates with dietary fiber and healthy proteins (like lentils, eggs, paneer, or nuts) "
            "helps buffer blood glucose curves and reduces sudden insulin spikes.\n\n"
            "You don't need restrictive diets—focus on balanced, nourishing whole foods.\n\n"
            "Try our 'Scan Your Food' feature inside the app!\n"
            "Reply STOP to unsubscribe."
        ),
        "te": (
            "PCOSense పోషకాహార సూచన 🥑\n\n"
            "కార్బోహైడ్రేట్లతో పాటు పీచు పదార్థాలు (fiber) మరియు ప్రొటీన్లు (పప్పులు, గుడ్లు, పనీర్ లేదా గింజలు) "
            "తీసుకోవడం వలన రక్తంలో షుగర్ మరియు ఇన్సులిన్ స్థాయులు అకస్మాత్తుగా పెరగకుండా నియంత్రణలో ఉంటాయి.\n\n"
            "కఠినమైన డైటింగ్ అవసరం లేదు—సమతుల్య ఆహారాన్ని ఎంచుకోండి.\n\n"
            "మా 'Scan Your Food' ఫీచర్‌ని ప్రయత్నించండి!\n"
            "ఆపివేయడానికి STOP అని పంపండి."
        )
    },

    # 4. Exercise Reminder
    "exercise_reminder": {
        "en": (
            "PCOSense Gentle Movement 🧘‍♀️\n\n"
            "A short 15-minute walk after meals helps your muscles use glucose effectively, supporting insulin sensitivity without spiking stress hormones.\n\n"
            "Gentle yoga, resistance training, and consistent daily steps make a meaningful difference.\n\n"
            "Reply STOP to unsubscribe."
        ),
        "te": (
            "PCOSense తేలికపాటి వ్యాయామం 🧘‍♀️\n\n"
            "భోజనం తర్వాత 15 నిమిషాల తేలికపాటి నడక శరీర కణాలలో ఇన్సులిన్ సామర్థ్యాన్ని పెంచి, జీర్ణక్రియను మెరుగుపరుస్తుంది.\n\n"
            "రోజూ నెమ్మదిగా యోగా లేదా నడక చేయడం హార్మోన్ల సమతుల్యతకు సహాయపడుతుంది.\n\n"
            "ఆపివేయడానికి STOP అని పంపండి."
        )
    },

    # 5. Appointment Reminder
    "appointment_reminder": {
        "en": (
            "PCOSense Appointment Reminder 🏥\n\n"
            "Hello {patient_name},\n"
            "Your consultation with {doctor_name} is scheduled for {appointment_date} at {appointment_time}.\n\n"
            "Clinic / Platform: {clinic_name}\n\n"
            "Please keep your symptom log and ultrasound reports handy for a thorough discussion with your doctor.\n\n"
            "Reply STOP to unsubscribe."
        ),
        "te": (
            "PCOSense అపాయింట్‌మెంట్ రిమైండర్ 🏥\n\n"
            "నమస్కారం {patient_name},\n"
            "{doctor_name} తో మీ డాక్టర్ సంప్రదింపు {appointment_date} నాడు {appointment_time} కి ఖరారైంది.\n\n"
            "క్లినిక్ / ప్లాట్‌ఫారమ్: {clinic_name}\n\n"
            "మీ లక్షణాలు మరియు వైద్య నివేదికలను ముందుగానే సిద్ధంగా ఉంచుకోండి.\n\n"
            "ఆపివేయడానికి STOP అని పంపండి."
        )
    },

    # 6. General Education & Stress Relief
    "general_education": {
        "en": (
            "PCOSense Wellness 🌙\n\n"
            "Sleep and stress play a major role in PCOS. Chronic stress increases adrenal cortisol, which can influence androgen production.\n\n"
            "Aim for 7-8 hours of restful sleep and 5 minutes of deep breathing before bed.\n\n"
            "Remember: You are in control of your journey, one day at a time.\n"
            "Reply STOP to unsubscribe."
        ),
        "te": (
            "PCOSense ఆరోగ్య సూచన 🌙\n\n"
            "నిద్ర మరియు మానసిక ప్రశాంతత PCOS నియంత్రణలో ఎంతో కీలకం. ఒత్తిడి పెరిగితే కార్టిసాల్ హార్మోన్ ఎక్కువై సమస్యలు పెరుగుతాయి.\n\n"
            "రోజూ 7-8 గంటల గాఢ నిద్ర మరియు కొన్ని నిమిషాల ప్రాణాయామం మేలు చేస్తాయి.\n\n"
            "ఆపివేయడానికి STOP అని పంపండి."
        )
    },

    # 7. Food Scanner Summary Template
    "food_summary": {
        "en": (
            "PCOSense Meal Summary 🍽️\n\n"
            "Dish: {dish_name}\n"
            "Glycemic Impact: {glycemic_rating} (GL: {gl_estimate})\n"
            "PCOS Suitability: {suitability_rating} ({suitability_score}/10)\n\n"
            "Key Nutrients:\n"
            "• Calories: ~{calories} kcal\n"
            "• Protein: {protein}g | Carbs: {carbs}g | Fiber: {fiber}g\n\n"
            "Metabolic Guidance:\n"
            "{guidance}\n\n"
            "Note: Nutritional screening for education only; not medical prescription."
        ),
        "te": (
            "PCOSense భోజన విశ్లేషణ 🍽️\n\n"
            "ఆహారం: {dish_name}\n"
            "గ్లైసిమిక్ ప్రభావం: {glycemic_rating} (GL: {gl_estimate})\n"
            "PCOS అనుకూలత: {suitability_rating} ({suitability_score}/10)\n\n"
            "పోషకాలు:\n"
            "• కేలరీలు: ~{calories} kcal\n"
            "• ప్రొటీన్: {protein}g | పిండిపదార్థం: {carbs}g | పీచు: {fiber}g\n\n"
            "పోషకాహార సూచన:\n"
            "{guidance}\n\n"
            "గమనిక: ఇది సాధారణ అవగాహన కోసం మాత్రమే."
        )
    }
}

# Auto-replies for Incoming Webhook Intents
INTENT_RESPONSES = {
    "STOP": {
        "en": "You have successfully unsubscribed from PCOSense WhatsApp messages. You will receive no further automated messages. To resume, reply START or update your profile in the app.",
        "te": "మీరు PCOSense WhatsApp రిమైండర్లను విజయవంతంగా ఆపివేశారు. భవిష్యత్తులో ఎలాంటి స్వయంచాలక సందేశాలు పంపబడవు. తిరిగి ప్రారంభించడానికి START అని పంపండి."
    },
    "START": {
        "en": "Welcome back to PCOSense! 🌸 You have opted in to receive educational health tips and tracking reminders. Reply HELP for commands.",
        "te": "PCOSense కి తిరిగి స్వాగతం! 🌸 మీరు ఆరోగ్య సూచనలు మరియు రిమైండర్ల కోసం సమ్మతించారు. వివరాలకు HELP అని పంపండి."
    },
    "HELP": {
        "en": (
            "PCOSense WhatsApp Assistant 🌸\n\n"
            "Available commands:\n"
            "• TRACK - How to log your daily PCOS symptoms\n"
            "• FOOD - Tips for balanced, low-GI eating\n"
            "• APPOINTMENT - How to book or check doctor visits\n"
            "• DOCTOR - Connect with qualified specialists\n"
            "• LANGUAGE - Switch between English and Telugu\n"
            "• STOP - Turn off all WhatsApp reminders\n\n"
            "Visit: https://pcosense.health"
        ),
        "te": (
            "PCOSense సహాయం 🌸\n\n"
            "ఆదేశాలు:\n"
            "• TRACK - లక్షణాలను ఎలా నమోదు చేయాలి\n"
            "• FOOD - సమతుల్య పోషకాహార సమాచారం\n"
            "• APPOINTMENT - డాక్టర్ అపాయింట్‌మెంట్ వివరాలు\n"
            "• DOCTOR - నిపుణులైన వైద్యులతో మాట్లాడండి\n"
            "• LANGUAGE - భాష మార్చుకోవడానికి\n"
            "• STOP - నోటిఫికేషన్లను నిలిపివేయడానికి\n\n"
            "వెబ్‌సైట్: https://pcosense.health"
        )
    },
    "TRACK": {
        "en": "To track your symptoms today: Open PCOSense → Symptom Tracker → Click 'Log Today's Symptoms' to record energy, cycle, mood, and sleep.",
        "te": "ఈ రోజు మీ లక్షణాలను నమోదు చేయడానికి: PCOSense తెరవండి → Symptom Tracker → 'Log Today\\'s Symptoms' పై క్లిక్ చేయండి."
    },
    "FOOD": {
        "en": "PCOS Food Guidance: Focus on fiber-rich vegetables, whole grains (millets/brown rice), and lean protein to blunt insulin spikes. Use our 'Scan Your Food' feature in PCOSense to analyze meals!",
        "te": "ఆహార సలహా: పీచు పదార్థాలు, చిరుధాన్యాలు మరియు ప్రొటీన్లు ఉన్న భోజనాన్ని తీసుకోండి. మీ భోజన ఫోటోను 'Scan Your Food' లో అప్‌లోడ్ చేసి చూడండి!"
    },
    "APPOINTMENT": {
        "en": "You can view, schedule, or manage your specialist gynecologist and endocrinologist appointments anytime in PCOSense under 'Find Healthcare'.",
        "te": "మీ డాక్టర్ అపాయింట్‌మెంట్ వివరాలను PCOSense యాప్‌లో 'Find Healthcare' విభాగంలో చూడవచ్చు లేదా బుక్ చేసుకోవచ్చు."
    },
    "DOCTOR": {
        "en": "PCOSense connects you with verified gynecologists, reproductive endocrinologists, and clinical dietitians. Log into your dashboard to book a consult.",
        "te": "PCOSense ధృవీకరించబడిన వైద్యులతో మిమ్మల్ని కలుపుతుంది. సంప్రదింపుల కోసం మీ డాష్‌బోర్డ్‌ను సందర్శించండి."
    }
}
