import {
  WellnessRoutine,
  CompletedYogaLog,
  WellnessReminderSettings,
  UserFitnessLevel,
  WellnessAchievement
} from '../types';
import { playNotificationSound } from './soundService';

const YOGA_LOGS_STORAGE_KEY_PREFIX = 'pcosense_yoga_logs_';
const WELLNESS_REMINDER_KEY_PREFIX = 'pcosense_wellness_reminder_';
const FITNESS_LEVEL_STORAGE_KEY_PREFIX = 'pcosense_fitness_level_';

/**
 * Curated Clinical PCOS-friendly Yoga & Exercise Routines
 * Includes clear imagery, embedded video technique links, recommended frequency,
 * estimated calorie burn, and hormonal/fat loss insights with dynamic difficulty scaling.
 */
export const PCOS_WELLNESS_ROUTINES: WellnessRoutine[] = [
  {
    id: 'supta-baddha-konasana-flow',
    title: 'Pelvic Opening & Cortisol-Lowering Restorative Yoga',
    titleTe: 'కటి భాగాన్ని సడలించే & కార్టిసాల్ తగ్గించే పునరుజ్జీవన యోగా',
    category: 'yoga',
    categoryLabel: 'PCOS Restorative Yoga',
    categoryLabelTe: 'PCOS విశ్రాంతి యోగా',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    // Embedded short-form technique video demo
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    videoDuration: '0:45 Technique Form',
    techniqueHighlights: [
      'Stack 2 pillows or a bolster along your spine to prevent lower back hyperextension.',
      'Drop your shoulders completely back and rest palms facing upward to stimulate vagus nerve relaxation.',
      'Maintain an unbroken 4-7-8 nasal diaphragmatic breathing cadence throughout every posture.'
    ],
    techniqueHighlightsTe: [
      'నడుముపై ఒత్తిడి లేకుండా వెన్నెముక కింద దిండ్లు ఉంచండి.',
      'భాగస్వామ్య నాడీ వ్యవస్థను ప్రశాంతపరచడానికి అరచేతులు పైకి ఉండేలా విశ్రాంతి తీసుకోండి.',
      'ప్రతి భంగిమలో 4-7-8 లోతైన శ్వాస పద్ధతిని కొనసాగించండి.'
    ],
    intensity: 'Gentle',
    durationMinutes: 25,
    recommendedFrequency: '4-5 times / week',
    recommendedFrequencyTe: 'వారానికి 4-5 సార్లు',
    estimatedCaloriesBurn: 110,
    fatLossInsight: 'Decreases nocturnal cortisol spikes that drive visceral belly fat accumulation, improving overnight insulin signaling and sleep depth.',
    fatLossInsightTe: 'రాత్రిపూట పొట్ట కొవ్వు పెరగడానికి కారణమయ్యే కార్టిసాల్ హార్మోన్‌ను తగ్గిస్తుంది, మెరుగైన నిద్రకు తోడ్పడుతుంది.',
    hormonalImpact: 'Increases pelvic vascular flow, calms autonomic nervous system, and eases ovarian tension/dysmenorrhea.',
    hormonalImpactTe: 'గర్భాశయ రక్తప్రసరణను మెరుగుపరుస్తుంది మరియు హార్మోన్ల సమతుల్యతకు తోడ్పడుతుంది.',
    bestTimeOfDay: 'Evening',
    targetMuscleGroups: ['Hip Adductors', 'Pelvic Floor', 'Lower Spine', 'Diaphragm'],
    equipmentNeeded: ['Yoga Mat', 'Bolster or 2 Pillows'],
    suitabilityNote: 'Excellent for irregular cycles, pelvic pain, or high-stress days.',
    difficultyVariations: {
      Beginner: {
        durationMinutes: 15,
        frequency: '3 times / week',
        frequencyTe: 'వారానికి 3 సార్లు',
        intensity: 'Gentle',
        burnKcal: 70,
        guidance: 'Hold each reclining stretch for 3 minutes with generous cushion support under both knees.',
        guidanceTe: 'మోకాళ్ళ కింద దిండ్లు ఉంచి ప్రతి భంగిమను 3 నిమిషాలు సున్నితంగా సాధన చేయండి.'
      },
      Intermediate: {
        durationMinutes: 25,
        frequency: '4-5 times / week',
        frequencyTe: 'వారానికి 4-5 సార్లు',
        intensity: 'Gentle',
        burnKcal: 110,
        guidance: 'Standard restorative holding duration with 5-minute deep 4-7-8 Pranayama integration.',
        guidanceTe: '5 నిమిషాల ప్రాణాయామంతో కలిపి ప్రామాణిక 25 నిమిషాల సెషన్.'
      },
      Advanced: {
        durationMinutes: 35,
        frequency: '5-6 times / week',
        frequencyTe: 'వారానికి 5-6 సార్లు',
        intensity: 'Moderate',
        burnKcal: 150,
        guidance: 'Extended Yin hold of 7 minutes per pose with active pelvic floor micro-contraction releases.',
        guidanceTe: 'ప్రతి భంగిమను 7 నిమిషాలు ఉంచి పెల్విక్ ఫ్లోర్ విశ్రాంతిని తీవ్రతరం చేయండి.'
      }
    },
    steps: [
      {
        name: 'Supta Baddha Konasana (Reclined Butterfly)',
        nameTe: 'సుప్త బద్ధ కోణాసనం (పడుకునే సీతాకోకచిలుక భంగిమ)',
        durationMinutes: 8,
        description: 'Lie on your back with soles of feet touching and knees dropping wide. Rest hands on abdomen and breathe deeply.',
        descriptionTe: 'పాదాల అరికాళ్ళు ఒకదానికొకటి తాకుతూ మోకాళ్ళను పక్కకు విశ్రాంతిగా ఉంచండి. పొట్టపై చేతులు ఉంచి లోతైన శ్వాస తీసుకోండి.',
        postureTips: ['Support under knees with yoga blocks or folded blankets if inner thighs pull tightly.']
      },
      {
        name: 'Viparita Karani (Legs-Up-The-Wall)',
        nameTe: 'విపరీత కరణి (గోడపై కాళ్ళ భంగిమ)',
        durationMinutes: 7,
        description: 'Elevate your hips slightly with a cushion and extend legs vertically up against a smooth wall.',
        descriptionTe: 'నడుము కింద మెత్తటి దిండు ఉంచి కాళ్ళను గోడపై నిటారుగా ఉంచండి.',
        postureTips: ['Keep neck neutral and close your eyes to activate vagus nerve relaxation.']
      },
      {
        name: 'Balasana (Extended Child’s Pose with Hip Wideners)',
        nameTe: 'బాలాసనం (విస్తరించిన చైల్డ్ పోజ్)',
        durationMinutes: 5,
        description: 'Knees wide, big toes touching, extend arms forward with forehead resting on mat.',
        descriptionTe: 'మోకాళ్ళను వెడల్పుగా ఉంచి తలను చాపపై ఉంచి చేతులను ముందుకు చాచండి.',
        postureTips: ['Focus every exhalation on relaxing the pelvic floor and lower back.']
      },
      {
        name: 'Shavasana with Slow 4-7-8 Pranayama',
        nameTe: 'శవాసనం & ప్రాణాయామం',
        durationMinutes: 5,
        description: 'Complete surrender in corpse pose, practicing deep 4-second inhales, 7-second holds, and 8-second exhales.',
        descriptionTe: 'పూర్తి శరీర విశ్రాంతి మరియు లోతైన నాడీ శ్వాస నియంత్రణ.',
        postureTips: ['Completely disengage all facial and abdominal muscle tension.']
      }
    ]
  },
  {
    id: 'insulin-sensitizing-strength',
    title: 'Low-Inflammation Full Body Resistance & GLUT4 Activation',
    titleTe: 'తక్కువ మంటతో కూడిన పూర్తి శరీర శక్తి శిక్షణ (ఇన్సులిన్ సెన్సిటివిటీ)',
    category: 'strength',
    categoryLabel: 'Metabolic Resistance',
    categoryLabelTe: 'జీవక్రియ శక్తి శిక్షణ',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    videoDuration: '0:50 Form & Tempo',
    techniqueHighlights: [
      'Utilize a strict 3-second eccentric (lowering) tempo on all squat and hinge repetitions.',
      'Take a full 60 to 90 second recovery rest between sets to prevent adrenal fatigue and excessive cortisol.',
      'Drive weight evenly through all three points of your foot (heel, big toe base, pinky toe base).'
    ],
    techniqueHighlightsTe: [
      'స్క్వాట్స్ చేసేటప్పుడు 3 సెకన్లు నెమ్మదిగా కిందకు దిగండి.',
      'కార్టిసాల్ ఒత్తిడిని నివారించడానికి సెట్ల మధ్య 60-90 సెకన్లు విశ్రాంతి తీసుకోండి.',
      'పాదాల మడమ మరియు బొటనవేలుపై సమానమైన బరువును పంపిణీ చేయండి.'
    ],
    intensity: 'Moderate',
    durationMinutes: 30,
    recommendedFrequency: '3 times / week',
    recommendedFrequencyTe: 'వారానికి 3 సార్లు',
    estimatedCaloriesBurn: 210,
    fatLossInsight: 'Stimulates non-insulin dependent GLUT4 glucose transport into large muscle fibers for up to 48 hours, directly mobilizing persistent body fat.',
    fatLossInsightTe: 'కండరాల గ్లూకోజ్ శోషణను 48 గంటల వరకు వేగవంతం చేస్తుంది, ఇది శరీరంలోని మొండి కొవ్వును కరిగిస్తుంది.',
    hormonalImpact: 'Increases lean mass, drops circulating fasting insulin, and suppresses androgenic testosterone conversion.',
    hormonalImpactTe: 'శరీర ఇన్సులిన్ స్థాయిలను తగ్గించి, ఆండ్రోజెన్ హార్మోన్లను అదుపులో ఉంచుతుంది.',
    bestTimeOfDay: 'Morning',
    targetMuscleGroups: ['Quadriceps', 'Glutes', 'Lats', 'Core'],
    equipmentNeeded: ['Dumbbells (2-5 kg) or Resistance Loop Bands'],
    suitabilityNote: 'Best performed with 60-90 second rests between sets to prevent cortisol elevation.',
    difficultyVariations: {
      Beginner: {
        durationMinutes: 20,
        frequency: '2 times / week',
        frequencyTe: 'వారానికి 2 సార్లు',
        intensity: 'Gentle',
        burnKcal: 130,
        guidance: 'Bodyweight only (or light 1-2 kg dumbbells) with 2 sets of 8-10 repetitions.',
        guidanceTe: 'శరీర బరువుతో మాత్రమే 2 సెట్లు (8-10 సార్లు) సాధన చేయండి.'
      },
      Intermediate: {
        durationMinutes: 30,
        frequency: '3 times / week',
        frequencyTe: 'వారానికి 3 సార్లు',
        intensity: 'Moderate',
        burnKcal: 210,
        guidance: '3-5 kg dumbbells for 3 sets of 10-12 controlled repetitions with 75s rest periods.',
        guidanceTe: '3-5 కేజీల బరువుతో 3 సెట్లు మరియు నియంత్రిత వేగంతో పూర్తి చేయండి.'
      },
      Advanced: {
        durationMinutes: 40,
        frequency: '4 times / week',
        frequencyTe: 'వారానికి 4 సార్లు',
        intensity: 'Energizing',
        burnKcal: 290,
        guidance: '6-8 kg progressive resistance or tension bands with isometric pauses at the bottom position.',
        guidanceTe: '6-8 కేజీల బరువు లేదా రెసిస్టెన్స్ బ్యాండ్లతో ఐసోమెట్రిక్ హోల్డ్స్ సాధన చేయండి.'
      }
    },
    steps: [
      {
        name: 'Goblet Squats with Tempo Hold',
        nameTe: 'గాబ్లెట్ స్క్వాట్స్',
        durationMinutes: 8,
        description: 'Hold a single weight at chest level. Lower slowly for 3 seconds, pause at bottom, drive through heels.',
        descriptionTe: 'ఛాతీ వద్ద బరువును పట్టుకుని నెమ్మదిగా కూర్చుని నిలబడండి.',
        postureTips: ['Keep chest lifted and knees tracking in line with second toes.']
      },
      {
        name: 'Romanian Deadlifts (RDL)',
        nameTe: 'రొమేనియన్ డెడ్‌లిఫ్ట్స్',
        durationMinutes: 8,
        description: 'Hinge hips back with a flat spine to stretch hamstrings and fire glutes without lower back strain.',
        descriptionTe: 'నడుమును వెనక్కి నెట్టి పిరుదులు మరియు తొడ వెనుక భాగంపై దృష్టి పెట్టండి.',
        postureTips: ['Keep dumbbells grazing your shins to avoid spinal loading.']
      },
      {
        name: 'Supported Neutral Dumbbell Rows',
        nameTe: 'డంబెల్ రోస్',
        durationMinutes: 7,
        description: 'Pull weights to ribcage engaging upper back and rhomboids, improving postural lymph drainage.',
        descriptionTe: 'వీపు పైభాగం కండరాలను బలోపేతం చేయడానికి బరువులను పైకి లాగండి.',
        postureTips: ['Squeeze shoulder blades together for 1 full second at top.']
      },
      {
        name: 'Deadbug Core Stabilizers',
        nameTe: 'డెడ్‌బగ్ కోర్ స్థిరీకరణ',
        durationMinutes: 7,
        description: 'On back, alternate extending opposite arm and leg while pinning lower back completely flat to the floor.',
        descriptionTe: 'వెనుక భాగం నేలపై చదునుగా ఉండేలా చూస్తూ చేతులు, కాళ్ళను మార్చండి.',
        postureTips: ['Breathe steadily; do not hold breath during core activation.']
      }
    ]
  },
  {
    id: 'ovarian-circulation-yoga-asanas',
    title: 'Ovarian Vitality & Hormone Balancing Yoga Asanas',
    titleTe: 'అండాశయాల రక్తప్రసరణ & హార్మోన్ల సమతుల్యత యోగాసనాలు',
    category: 'yoga',
    categoryLabel: 'Endocrine Yoga',
    categoryLabelTe: 'ఎండోక్రైన్ హార్మోన్ యోగా',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    videoDuration: '0:40 Asana Guide',
    techniqueHighlights: [
      'In Bhujangasana, keep the pubic bone anchored down and open chest forward rather than cranking lower spine.',
      'In Setu Bandhasana (Bridge), clasp hands beneath back or support sacrum with a yoga block.',
      'Coordinate every inhalation with spinal expansion and every exhalation with deep belly softening.'
    ],
    techniqueHighlightsTe: [
      'భుజంగాసనంలో నడుముపై అధిక ఒత్తిడి పెట్టకుండా ఛాతీని ముందుకు తెరిచి ఉంచండి.',
      'సేతు బంధాసనంలో నడుము కింద బ్లాక్ ఉంచి థైరాయిడ్ గ్రంధిని ఉత్తేజపరచండి.',
      'శ్వాసను శరీర కదలికలతో ఖచ్చితంగా సమన్వయం చేసుకోండి.'
    ],
    intensity: 'Gentle',
    durationMinutes: 20,
    recommendedFrequency: '4 times / week',
    recommendedFrequencyTe: 'వారానికి 4 సార్లు',
    estimatedCaloriesBurn: 95,
    fatLossInsight: 'Stimulates thyroid gland perfusion and gastrointestinal motility, boosting metabolic basal rate and reducing chronic fluid retention.',
    fatLossInsightTe: 'థైరాయిడ్ గ్రంధి పనితీరును మరియు జీర్ణక్రియను మెరుగుపరిచి వాపులను తగ్గిస్తుంది.',
    hormonalImpact: 'Gently compresses and releases the pelvic and endocrine organs to regulate LH/FSH ratios.',
    hormonalImpactTe: 'అండాశయాలకు తాజా ఆక్సిజన్‌తో కూడిన రక్తప్రవాహాన్ని అందిస్తుంది.',
    bestTimeOfDay: 'Morning',
    targetMuscleGroups: ['Pelvic Wall', 'Spine', 'Thyroid/Throat', 'Abdominals'],
    equipmentNeeded: ['Yoga Mat'],
    suitabilityNote: 'Ideal for days when feeling bloated or experiencing menstrual irregularities.',
    difficultyVariations: {
      Beginner: {
        durationMinutes: 15,
        frequency: '3 times / week',
        frequencyTe: 'వారానికి 3 సార్లు',
        intensity: 'Gentle',
        burnKcal: 65,
        guidance: 'Gentle baby cobra and supported bridge on block with relaxed holds.',
        guidanceTe: 'సున్నితమైన బేబీ కోబ్రా మరియు సపోర్టెడ్ బ్రిడ్జ్ భంగిమలు.'
      },
      Intermediate: {
        durationMinutes: 20,
        frequency: '4 times / week',
        frequencyTe: 'వారానికి 4 సార్లు',
        intensity: 'Gentle',
        burnKcal: 95,
        guidance: 'Standard 4-asana sequence with active pelvic engagement.',
        guidanceTe: '4 ముఖ్యమైన ఆసనాల సమగ్ర క్రమం.'
      },
      Advanced: {
        durationMinutes: 30,
        frequency: '5 times / week',
        frequencyTe: 'వారానికి 5 సార్లు',
        intensity: 'Moderate',
        burnKcal: 140,
        guidance: 'Add standing warrior transitions and deep dynamic twist flows for digestive massage.',
        guidanceTe: 'జీర్ణక్రియను వేగవంతం చేయడానికి డైనమిక్ ట్విస్ట్‌లను జోడించండి.'
      }
    },
    steps: [
      {
        name: 'Bhujangasana (Gentle Cobra Pose)',
        nameTe: 'భుజంగాసనం (కోబ్రా పోజ్)',
        durationMinutes: 5,
        description: 'Lie prone, gently press hands into mat to lift chest while keeping hips grounded, massaging adrenal glands.',
        descriptionTe: 'బోర్లా పడుకుని ఛాతీని పైకి ఎత్తండి, అడ్రినల్ గ్రంధులను ఉత్తేజపరుస్తుంది.',
        postureTips: ['Roll shoulders away from ears and lengthen the back of your neck.']
      },
      {
        name: 'Setu Bandhasana (Supported Bridge Pose)',
        nameTe: 'సేతు బంధాసనం (బ్రిడ్జ్ పోజ్)',
        durationMinutes: 5,
        description: 'Lift hips off mat to stimulate the thyroid and parathyroid glands in the throat.',
        descriptionTe: 'నడుమును పైకి లేపి థైరాయిడ్ గ్రంధిని ఉత్తేజపరచండి.',
        postureTips: ['Place a block under the sacrum for passive restorative support.']
      },
      {
        name: 'Marjaryasana-Bitilasana (Cat-Cow Waves)',
        nameTe: 'మార్జర్యాసనం - బితిలాసనం (క్యాట్-కౌ)',
        durationMinutes: 5,
        description: 'Fluidly coordinate spinal flexion and extension with rhythmic deep breathing.',
        descriptionTe: 'శ్వాసతో సమన్వయం చేసుకుంటూ వెన్నెముకను వంచడం మరియు చాచడం.',
        postureTips: ['Exhale dome spine upward like a stretching cat, inhale gently arch.']
      },
      {
        name: 'Ananda Balasana (Happy Baby)',
        nameTe: 'ఆనంద బాలాసనం (హ్యాపీ బేబీ)',
        durationMinutes: 5,
        description: 'Grasp outer borders of feet, drawing knees toward armpits to release groin tension.',
        descriptionTe: 'పాదాలను చేతులతో పట్టుకుని కటి భాగాన్ని విశ్రాంతి పరచండి.',
        postureTips: ['Gently rock side to side for a soothing lower spine massage.']
      }
    ]
  },
  {
    id: 'zone2-pcos-cardio-flow',
    title: 'Zone-2 Steady-State Aerobic Flow & Fat Oxidation',
    titleTe: 'జోన్-2 ఎరోబిక్ కొవ్వు కరిగించే వ్యాయామం (తక్కువ అలసట)',
    category: 'low_impact_cardio',
    categoryLabel: 'Zone-2 Aerobics',
    categoryLabelTe: 'జోన్-2 కొవ్వు ఆక్సీకరణ',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    videoDuration: '0:45 Pacing Demo',
    techniqueHighlights: [
      'Maintain the "Talk Test" baseline: you should be able to speak a full sentence comfortably without breathless gasps.',
      'Keep heart rate within 60% to 70% of estimated maximum to spare glycogen and oxidize adipose fat stores.',
      'Walk on a gentle incline (3-5%) with upright spine and natural arm swinging mechanics.'
    ],
    techniqueHighlightsTe: [
      'ఆయాసం లేకుండా పూర్తి వాక్యం మాట్లాడగలిగే వేగాన్ని మాత్రమే కొనసాగించండి.',
      'గుండె వేగాన్ని 60-70% పరిధిలో ఉంచి కొవ్వును గరిష్టంగా కరిగించండి.',
      'నిటారుగా నడుస్తూ చేతులను సహజంగా కదిలించండి.'
    ],
    intensity: 'Moderate',
    durationMinutes: 35,
    recommendedFrequency: '3-4 times / week',
    recommendedFrequencyTe: 'వారానికి 3-4 సార్లు',
    estimatedCaloriesBurn: 240,
    fatLossInsight: 'Operates at 60-70% of maximum heart rate, maximizing mitochondrial lipid burning without triggering the adrenal stress/glycogen depletion of HIIT.',
    fatLossInsightTe: 'గుండెపై అధిక ఒత్తిడి లేకుండా శరీర కొవ్వును గరిష్టంగా కరిగించే సమర్థవంతమైన పద్ధతి.',
    hormonalImpact: 'Protects against sudden spikes in cortisol while improving cardiovascular endurance and endothelial elasticity.',
    hormonalImpactTe: 'కార్టిసాల్ ఒత్తిడి పెరగకుండా కాపాడుతూ రక్తనాళాల ఆరోగ్యాన్ని కాపాడుతుంది.',
    bestTimeOfDay: 'Afternoon',
    targetMuscleGroups: ['Cardiovascular System', 'Calves', 'Hamstrings', 'Core'],
    equipmentNeeded: ['Running shoes or indoor space'],
    suitabilityNote: 'Maintain a nasal-breathing or conversational pace throughout the entire session.',
    difficultyVariations: {
      Beginner: {
        durationMinutes: 20,
        frequency: '2-3 times / week',
        frequencyTe: 'వారానికి 2-3 సార్లు',
        intensity: 'Gentle',
        burnKcal: 120,
        guidance: 'Flat walking or gentle indoor step cadence at 100-110 bpm music tempo.',
        guidanceTe: 'చదునైన నేలపై నిదానమైన నడక.'
      },
      Intermediate: {
        durationMinutes: 35,
        frequency: '3-4 times / week',
        frequencyTe: 'వారానికి 3-4 సార్లు',
        intensity: 'Moderate',
        burnKcal: 240,
        guidance: 'Incline treadmill walk (3-4% grade) or brisk outdoor rhythmic stride.',
        guidanceTe: 'తేలికపాటి వాలుపై చురుకైన నడక.'
      },
      Advanced: {
        durationMinutes: 45,
        frequency: '4-5 times / week',
        frequencyTe: 'వారానికి 4-5 సార్లు',
        intensity: 'Energizing',
        burnKcal: 320,
        guidance: 'Weighted vest (2-4 kg) or 5-6% incline steady march with nasal breathing.',
        guidanceTe: 'ముక్కు ద్వారా మాత్రమే శ్వాస తీసుకుంటూ 5-6% వాలుపై స్థిరమైన నడక.'
      }
    },
    steps: [
      {
        name: 'Dynamic Joint Mobilization Warm-Up',
        nameTe: 'కీళ్ల కదలిక వార్మ్-అప్',
        durationMinutes: 5,
        description: 'Ankle circles, hip openers, gentle arm swings and side body lunges.',
        descriptionTe: 'చీలమండల రౌండ్లు, తుంటి కదలికలు మరియు చేతుల స్వింగ్స్.',
        postureTips: ['Keep joints warm and hydrated; start at a slow rhythmic pace.']
      },
      {
        name: 'Continuous Rhythm Incline Walk / Low-Impact Step Cadence',
        nameTe: 'స్థిరమైన వేగంతో నడక & స్టెప్స్',
        durationMinutes: 25,
        description: 'Steady walking on a gentle 3-5% incline or rhythmic low-impact indoor step cadence.',
        descriptionTe: 'కొద్దిపాటి వాలుపై స్థిరమైన నడక లేదా ఇంట్లోనే సమన్వయ స్టెప్స్.',
        postureTips: ['You should be able to speak a full sentence comfortably without gasping.']
      },
      {
        name: 'Cool-Down Stretches & Hydration Transition',
        nameTe: 'కూల్-డౌన్ సాగదీతలు',
        durationMinutes: 5,
        description: 'Calf stretches on wall, standing quad stretches, and deep diaphragmatic calming breaths.',
        descriptionTe: 'పిక్కల సాగదీత మరియు లోతైన శ్వాసలు.',
        postureTips: ['Drink 250ml of water immediately following this cool-down.']
      }
    ]
  },
  {
    id: 'pelvic-pilates-core-flow',
    title: 'PCOS Core & Pelvic Pilates Alignment',
    titleTe: 'PCOS పెల్విక్ & కోర్ పిలేట్స్ అమరిక',
    category: 'pilates',
    categoryLabel: 'Pelvic Pilates',
    categoryLabelTe: 'పెల్విక్ పిలేట్స్',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    videoPoster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    videoDuration: '0:45 Pilates Alignment',
    techniqueHighlights: [
      'Engage the "Transverse Draw-In": imagine pulling your two hip bones horizontally toward each other.',
      'Never bulge the abdominal wall outward on effort; exhale during the hardest exertion phase.',
      'Keep pelvis neutral without tucking tailbone or flattening lumbar spine into the floor excessively.'
    ],
    techniqueHighlightsTe: [
      'బొడ్డును లోపలికి లాగుతూ లోతైన కండరాలను సక్రియం చేయండి.',
      'వ్యాయామం చేసేటప్పుడు పొట్టను బయటకు ఉబ్బకుండా జాగ్రత్త వహించండి.',
      'నడుమును సహజమైన సమతుల్య స్థితిలో ఉంచండి.'
    ],
    intensity: 'Moderate',
    durationMinutes: 25,
    recommendedFrequency: '3 times / week',
    recommendedFrequencyTe: 'వారానికి 3 సార్లు',
    estimatedCaloriesBurn: 155,
    fatLossInsight: 'Tones the deep transverse abdominis girdle, reducing lower abdominal distension and improving posture.',
    fatLossInsightTe: 'లోతైన పొట్ట కండరాలను బలోపేతం చేసి దిగువ పొట్ట ఉబ్బరాన్ని తగ్గిస్తుంది.',
    hormonalImpact: 'Supports lymphatic drainage across the lower abdomen and strengthens pelvic organ support.',
    hormonalImpactTe: 'దిగువ పొట్టలోని శోషరస ప్రసరణను మెరుగుపరుస్తుంది.',
    bestTimeOfDay: 'Morning',
    targetMuscleGroups: ['Transverse Abdominis', 'Pelvic Floor', 'Obliques', 'Glute Medius'],
    equipmentNeeded: ['Mat', 'Optional mini pilates ball or rolled towel'],
    suitabilityNote: 'Safe for all fitness levels with zero heavy crunches or spinal compression.',
    difficultyVariations: {
      Beginner: {
        durationMinutes: 15,
        frequency: '2 times / week',
        frequencyTe: 'వారానికి 2 సార్లు',
        intensity: 'Gentle',
        burnKcal: 90,
        guidance: 'Pelvic tilts and feet-grounded tabletop holds with breathing focus.',
        guidanceTe: 'పాదాలను నేలపై ఉంచి పెల్విక్ టిల్ట్స్ సాధన.'
      },
      Intermediate: {
        durationMinutes: 25,
        frequency: '3 times / week',
        frequencyTe: 'వారానికి 3 సార్లు',
        intensity: 'Moderate',
        burnKcal: 155,
        guidance: 'Standard single-leg extensions, clamshells with 2-second hold, and spine reaches.',
        guidanceTe: 'క్లామ్‌షెల్స్ మరియు సింగిల్ లెగ్ స్ట్రెచ్‌ల పూర్తి సెషన్.'
      },
      Advanced: {
        durationMinutes: 35,
        frequency: '4 times / week',
        frequencyTe: 'వారానికి 4 సార్లు',
        intensity: 'Energizing',
        burnKcal: 220,
        guidance: 'Add resistance loop bands around thighs and double-leg lowers with neutral spine stability.',
        guidanceTe: 'తొడల చుట్టూ రెసిస్టెన్స్ బ్యాండ్లతో క్లిష్టమైన పిలేట్స్ మూవ్‌మెంట్స్.'
      }
    },
    steps: [
      {
        name: 'Pelvic Tilts with Transverse Draw-In',
        nameTe: 'పెల్విక్ టిల్ట్స్',
        durationMinutes: 6,
        description: 'Gently flatten lower spine to floor on exhale while drawing navel in and engaging pelvic floor.',
        descriptionTe: 'శ్వాస వదిలేటప్పుడు బొడ్డును లోపలికి లాగుతూ నడుమును నేలకు ఆనించండి.',
        postureTips: ['Imagine zipping up a tight pair of jeans from pubic bone to navel.']
      },
      {
        name: 'Pilates Clamshells with Squeeze',
        nameTe: 'క్లామ్‌షెల్స్ వ్యాయామం',
        durationMinutes: 8,
        description: 'Side-lying with knees bent at 90 degrees; open top knee while keeping feet glued together.',
        descriptionTe: 'పక్కకు పడుకుని పాదాలు కలిపి ఉంచుతూ పై మోకాలిని తెరవండి.',
        postureTips: ['Do not let your pelvis roll backward as your knee opens.']
      },
      {
        name: 'Single Leg Stretch with Breath Control',
        nameTe: 'సింగిల్ లెగ్ స్ట్రెచ్',
        durationMinutes: 6,
        description: 'Alternate extending one leg forward at 45 degrees while hugging other knee to chest.',
        descriptionTe: 'ఒక కాలును ముందుకు చాచుతూ మరొక మోకాలిని ఛాతీ వద్దకు తీసుకోండి.',
        postureTips: ['Keep head rested on mat if neck feels tired.']
      },
      {
        name: 'Spine Stretch Forward and Lateral Reach',
        nameTe: 'వెన్నెముక సాగదీత',
        durationMinutes: 5,
        description: 'Seated tall, roll down vertebra by vertebra reaching past toes, then gently stretch side body.',
        descriptionTe: 'నిటారుగా కూర్చుని చేతులను ముందుకు మరియు పక్కలకు సాగదీయండి.',
        postureTips: ['Inhale to sit tall, exhale to scoop and round forward.']
      }
    ]
  }
];

// ============================================================
// FITNESS LEVEL PERSISTENCE
// ============================================================

export function getUserFitnessLevel(userId: string = 'local-user'): UserFitnessLevel {
  const key = `${FITNESS_LEVEL_STORAGE_KEY_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw && (raw === 'Beginner' || raw === 'Intermediate' || raw === 'Advanced')) {
      return raw as UserFitnessLevel;
    }
  } catch (err) {
    console.error('Error reading fitness level:', err);
  }
  return 'Intermediate'; // Default balanced level for PCOS
}

export function saveUserFitnessLevel(userId: string = 'local-user', level: UserFitnessLevel): void {
  const key = `${FITNESS_LEVEL_STORAGE_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(key, level);
  } catch (err) {
    console.error('Error saving fitness level:', err);
  }
}

// ============================================================
// LOCAL STORAGE & TRACKING PERSISTENCE HELPERS
// ============================================================

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStoredYogaLogs(userId: string = 'local-user'): CompletedYogaLog[] {
  const key = `${YOGA_LOGS_STORAGE_KEY_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading yoga logs from localStorage:', err);
  }

  // Pre-populate with realistic 30-day historical data if user is new so the contribution graph and achievements are rich
  const seedLogs = generateSeedYogaLogs();
  try {
    localStorage.setItem(key, JSON.stringify(seedLogs));
  } catch {
    // ignore
  }
  return seedLogs;
}

function generateSeedYogaLogs(): CompletedYogaLog[] {
  const logs: CompletedYogaLog[] = [];
  const now = new Date();

  // Pick active dates over the past 30 days to form solid streaks
  const activeOffsets = [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29];

  activeOffsets.forEach(offset => {
    const d = new Date();
    d.setDate(now.getDate() - offset);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const routine = PCOS_WELLNESS_ROUTINES[offset % PCOS_WELLNESS_ROUTINES.length];
    logs.push({
      id: `seed-yoga-${dateKey}-${offset}`,
      routineId: routine.id,
      routineTitle: routine.title,
      category: routine.category,
      dateKey,
      durationMinutes: routine.durationMinutes,
      caloriesBurned: routine.estimatedCaloriesBurn,
      loggedAt: new Date(d.getTime() + 1000 * 60 * 60 * 8).toISOString(),
      moodRating: 4 + (offset % 2 === 0 ? 1 : 0),
      exertionRPE: 4 + (offset % 4),
      exertionLabel: (offset % 4 === 0) ? 'Light Restorative' : (offset % 4 === 1) ? 'Optimal Fat Burn' : 'Moderate Flow',
      pelvicComfort: 'Pain-free / Relaxed',
      energyLevel: 'Recharged & Calm',
      fitnessLevelLogged: 'Intermediate',
      notes: 'Felt renewed pelvic relaxation, balanced cortisol, and improved sleep depth.'
    });
  });

  return logs.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function logYogaSession(
  userId: string = 'local-user',
  routine: WellnessRoutine,
  customDuration?: number,
  notes?: string,
  moodRating: number = 5,
  postWorkoutMeta?: {
    exertionRPE?: number;
    exertionLabel?: string;
    pelvicComfort?: string;
    energyLevel?: string;
    fitnessLevelLogged?: UserFitnessLevel;
  }
): { logs: CompletedYogaLog[]; newLog: CompletedYogaLog } {
  const existing = getStoredYogaLogs(userId);
  const dateKey = getTodayDateKey();
  const duration = customDuration || routine.durationMinutes;
  
  // Calculate proportional calories
  const caloriesBurned = Math.round((routine.estimatedCaloriesBurn / routine.durationMinutes) * duration);

  const newLog: CompletedYogaLog = {
    id: `yoga-log-${Date.now()}`,
    routineId: routine.id,
    routineTitle: routine.title,
    category: routine.category,
    dateKey,
    durationMinutes: duration,
    caloriesBurned,
    loggedAt: new Date().toISOString(),
    notes: notes || 'Completed guided routine session',
    moodRating,
    exertionRPE: postWorkoutMeta?.exertionRPE ?? 4,
    exertionLabel: postWorkoutMeta?.exertionLabel ?? 'Optimal Fat Burn',
    pelvicComfort: postWorkoutMeta?.pelvicComfort ?? 'Pain-free / Relaxed',
    energyLevel: postWorkoutMeta?.energyLevel ?? 'Recharged & Calm',
    fitnessLevelLogged: postWorkoutMeta?.fitnessLevelLogged ?? 'Intermediate'
  };

  const updated = [newLog, ...existing];
  try {
    localStorage.setItem(`${YOGA_LOGS_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save yoga log:', err);
  }

  return { logs: updated, newLog };
}

export function deleteYogaLog(userId: string = 'local-user', logId: string): CompletedYogaLog[] {
  const existing = getStoredYogaLogs(userId);
  const updated = existing.filter(l => l.id !== logId);
  try {
    localStorage.setItem(`${YOGA_LOGS_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete yoga log:', err);
  }
  return updated;
}

export function calculate30DayYogaStats(logs: CompletedYogaLog[]): {
  totalSessions: number;
  totalMinutes: number;
  totalCalories: number;
  currentStreak: number;
  bestStreak: number;
  consistencyPercentage: number;
  dailyGrid: { dateKey: string; dateDisplay: string; dayOfWeek: string; count: number; minutes: number; calories: number }[];
} {
  const now = new Date();
  const dailyGrid: { dateKey: string; dateDisplay: string; dayOfWeek: string; count: number; minutes: number; calories: number }[] = [];
  const countMap: Record<string, { count: number; minutes: number; calories: number }> = {};

  logs.forEach(l => {
    if (!countMap[l.dateKey]) {
      countMap[l.dateKey] = { count: 0, minutes: 0, calories: 0 };
    }
    countMap[l.dateKey].count += 1;
    countMap[l.dateKey].minutes += l.durationMinutes;
    countMap[l.dateKey].calories += l.caloriesBurned;
  });

  // Generate 30 days grid backwards
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const data = countMap[dateKey] || { count: 0, minutes: 0, calories: 0 };
    dailyGrid.push({
      dateKey,
      dateDisplay,
      dayOfWeek,
      count: data.count,
      minutes: data.minutes,
      calories: data.calories
    });
  }

  const daysWithSession = dailyGrid.filter(d => d.count > 0).length;
  const consistencyPercentage = Math.round((daysWithSession / 30) * 100);

  let totalMinutes = 0;
  let totalCalories = 0;
  dailyGrid.forEach(d => {
    totalMinutes += d.minutes;
    totalCalories += d.calories;
  });

  // Calculate current streak
  let currentStreak = 0;
  for (let i = dailyGrid.length - 1; i >= 0; i--) {
    if (dailyGrid[i].count > 0) {
      currentStreak++;
    } else {
      if (i === dailyGrid.length - 1) {
        continue;
      }
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let running = 0;
  dailyGrid.forEach(d => {
    if (d.count > 0) {
      running++;
      if (running > bestStreak) bestStreak = running;
    } else {
      running = 0;
    }
  });

  return {
    totalSessions: daysWithSession,
    totalMinutes,
    totalCalories,
    currentStreak: Math.max(currentStreak, daysWithSession > 0 ? 1 : 0),
    bestStreak: Math.max(bestStreak, currentStreak),
    consistencyPercentage,
    dailyGrid
  };
}

// ============================================================
// ACHIEVEMENTS & STREAK BADGES SYSTEM
// ============================================================

export function getWellnessAchievements(
  stats: ReturnType<typeof calculate30DayYogaStats>,
  logs: CompletedYogaLog[]
): WellnessAchievement[] {
  const yogaCount = logs.filter(l => l.category === 'yoga').length;
  const strengthCount = logs.filter(l => l.category === 'strength').length;
  const pilatesCount = logs.filter(l => l.category === 'pilates').length;

  const achievements: WellnessAchievement[] = [
    {
      id: 'streak-7-day',
      title: '7-Day Consistent Mover',
      titleTe: '7-రోజుల స్థిరమైన మూవర్ బ్యాడ్జ్',
      description: 'Completed at least one PCOS-friendly movement routine for 7 consecutive days.',
      descriptionTe: 'వరుసగా 7 రోజులు కనీసం ఒక PCOS రొటీన్ పూర్తి చేశారు.',
      iconName: 'flame',
      badgeCategory: 'streak',
      unlocked: stats.bestStreak >= 7,
      progress: Math.min(stats.bestStreak, 7),
      maxProgress: 7,
      unlockedDate: stats.bestStreak >= 7 ? 'Unlocked this month' : undefined,
      rarity: 'Silver'
    },
    {
      id: 'streak-30-day',
      title: '30-Day Hormone Balance Champion',
      titleTe: '30-రోజుల హార్మోన్ సమతుల్యత ఛాంపియన్',
      description: 'Achieved a monumental 30-day exercise consistency milestone to reset baseline insulin sensitivity.',
      descriptionTe: 'ఇన్సులిన్ సెన్సిటివిటీని పునరుద్ధరించడానికి 30 రోజుల రికార్డు సాధించారు.',
      iconName: 'trophy',
      badgeCategory: 'streak',
      unlocked: stats.totalSessions >= 20 || stats.bestStreak >= 28,
      progress: Math.min(stats.totalSessions, 30),
      maxProgress: 30,
      unlockedDate: stats.totalSessions >= 20 ? 'Active Champion' : undefined,
      rarity: 'Diamond'
    },
    {
      id: 'first-flow-starter',
      title: 'First Flow Pioneer',
      titleTe: 'మొదటి యోగా పయనీర్',
      description: 'Logged your very first hormone-regulating yoga or resistance session.',
      descriptionTe: 'మీ మొట్టమొదటి హార్మోన్ క్రమబద్ధీకరణ యోగా సెషన్‌ను లాగ్ చేశారు.',
      iconName: 'sparkles',
      badgeCategory: 'milestone',
      unlocked: logs.length >= 1,
      progress: Math.min(logs.length, 1),
      maxProgress: 1,
      unlockedDate: logs.length >= 1 ? 'Pioneer' : undefined,
      rarity: 'Common'
    },
    {
      id: 'calorie-1000-burn',
      title: '1,000 kcal Metabolic Burner',
      titleTe: '1,000 kcal జీవక్రియ బర్నర్ బ్యాడ్జ్',
      description: 'Burned over 1,000 active kilocalories using low-inflammation movements.',
      descriptionTe: 'తక్కువ మంటతో కూడిన వ్యాయామాలతో 1,000 పైగా కేలరీలు కరిగించారు.',
      iconName: 'zap',
      badgeCategory: 'metabolism',
      unlocked: stats.totalCalories >= 1000,
      progress: Math.min(stats.totalCalories, 1000),
      maxProgress: 1000,
      unlockedDate: stats.totalCalories >= 1000 ? 'Metabolic Master' : undefined,
      rarity: 'Gold'
    },
    {
      id: 'restorative-zen-master',
      title: 'Cortisol Zen Master',
      titleTe: 'కార్టిసాల్ తగ్గింపు యోగా మాస్టర్',
      description: 'Completed 5+ restorative pelvic opening yoga sessions to soothe adrenal stress.',
      descriptionTe: 'కార్టిసాల్ ఒత్తిడిని తగ్గించడానికి 5+ పునరుజ్జీవన యోగా సెషన్లు పూర్తి చేశారు.',
      iconName: 'heart',
      badgeCategory: 'mastery',
      unlocked: yogaCount >= 5,
      progress: Math.min(yogaCount, 5),
      maxProgress: 5,
      unlockedDate: yogaCount >= 5 ? 'Zen Healer' : undefined,
      rarity: 'Silver'
    },
    {
      id: 'pelvic-alignment-pro',
      title: 'Pelvic Floor Vitality Pro',
      titleTe: 'పెల్విక్ ఫ్లోర్ వైటాలిటీ ప్రో',
      description: 'Strengthened deep transverse and pelvic support through 3+ targeted Pilates sessions.',
      descriptionTe: 'లోతైన పొట్ట మరియు పెల్విక్ కండరాలను బలోపేతం చేసే 3+ పిలేట్స్ సెషన్లు పూర్తి చేశారు.',
      iconName: 'shield',
      badgeCategory: 'mastery',
      unlocked: pilatesCount >= 3,
      progress: Math.min(pilatesCount, 3),
      maxProgress: 3,
      unlockedDate: pilatesCount >= 3 ? 'Pelvic Pro' : undefined,
      rarity: 'Gold'
    }
  ];

  return achievements;
}

// ============================================================
// REMINDER NOTIFICATION SETTINGS
// ============================================================

export function getWellnessReminderSettings(userId: string = 'local-user'): WellnessReminderSettings {
  const key = `${WELLNESS_REMINDER_KEY_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading wellness reminder settings:', err);
  }

  return {
    enabled: true,
    preferredTime: '07:30',
    preferredPeriod: 'Morning',
    customDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    soundEnabled: true,
    customMessage: 'Time for your PCOS-friendly restorative yoga session to balance cortisol and boost insulin sensitivity!',
    browserNotificationGranted: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  };
}

export function saveWellnessReminderSettings(
  userId: string = 'local-user',
  settings: WellnessReminderSettings
): void {
  const key = `${WELLNESS_REMINDER_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('pcosense-wellness-reminder-updated', { detail: settings }));
  } catch (err) {
    console.error('Error saving wellness reminder settings:', err);
  }
}

export function triggerWellnessReminderChime(): void {
  playNotificationSound('daily-reminder', true);
}
