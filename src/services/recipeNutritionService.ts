/**
 * PCOSense - Verified Recipe & Nutrition Tracking Service
 * Structured micronutrient records per serving (Calcium, Iron, Zinc, Magnesium, Potassium, etc.)
 * Provides daily nutrition logs, progress toward targets, and admin recipe controls.
 */

import { DetailedRecipeItem, StructuredNutritionRecord, DailyNutritionLog } from '../types';
import { db, doc, setDoc, deleteDoc, collection, getDocs } from '../lib/firebase';
import { handleFirestoreError, OperationType } from './firestoreService';

const RECIPES_STORAGE_KEY = 'pcosense_verified_recipes_db';
const NUTRITION_LOGS_STORAGE_KEY = 'pcosense_nutrition_logs_db';

// Baseline daily target for PCOS health management (configurable)
export const DEFAULT_DAILY_NUTRITION_TARGETS: StructuredNutritionRecord = {
  calories: 1600,
  protein: 70, // 70g
  carbohydrates: 150, // 150g (Low-GI)
  fat: 55, // 55g (Healthy monounsaturated & omega-3)
  fiber: 35, // 35g (Essential for estrogen clearance)
  calcium: 1000, // 1000mg
  iron: 18, // 18mg (Crucial for heavy menstrual losses)
  zinc: 12, // 12mg (Anti-androgenic 5-alpha reductase inhibitor)
  magnesium: 360, // 360mg (Insulin sensitization & muscle calm)
  potassium: 3000, // 3000mg (Fluid balance & blood pressure)
  vitaminC: 85 // 85mg (Progesterone synthesis & iron absorption)
};

// Comprehensive pre-verified PCOS recipes with clinical micronutrient breakdown per serving
export const INITIAL_VERIFIED_RECIPES: DetailedRecipeItem[] = [
  {
    id: 'rec-spiced-foxtail-upma',
    name: 'Spiced Foxtail Millet & Vegetable Upma with Chia Seeds',
    nameTe: 'కొర్రల వెజిటబుల్ ఉప్మా (చియా గింజలతో)',
    description: 'Ultra low-GI ancient millet breakfast enriched with soluble prebiotic fiber and plant-based ALA omega-3s.',
    descriptionTe: 'రక్తంలో చక్కెరను స్థిరీకరించే అధిక పీచుతో కూడిన కొర్రల ఉప్మా.',
    category: 'Breakfast',
    mealType: 'breakfast',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servingSize: '1 bowl (250g)',
    ingredients: [
      '1 cup Foxtail millet (rinsed & soaked 20 mins)',
      '1 tbsp Chia seeds',
      '1/2 cup Finely diced carrots and French beans',
      '1 tbsp Grated fresh ginger & 1 green chili',
      '1 sprig Curry leaves & 1/2 tsp mustard seeds',
      '1 tsp Cold-pressed coconut oil or A2 ghee',
      'Fresh lemon juice & chopped cilantro'
    ],
    ingredientsTe: [
      '1 కప్పు కొర్రలు (20 నిమిషాలు నానబెట్టినవి)',
      '1 చెంచా చియా గింజలు',
      '1/2 కప్పు క్యారెట్ మరియు బీన్స్ ముక్కలు',
      '1 చెంచా తురిమిన అల్లం, పచ్చిమిర్చి',
      'కరివేపాకు, ఆవాలు',
      '1 చెంచా కొబ్బరి నూనె లేదా నెయ్యి',
      'నిమ్మరసం, కొత్తిమీర'
    ],
    instructions: [
      'Rinse foxtail millet thoroughly and soak in clean water for 20 minutes.',
      'Heat 1 tsp coconut oil in a heavy-bottomed pan. Crackle mustard seeds and sauté curry leaves, ginger, and chilies.',
      'Add chopped carrots and beans with a pinch of turmeric. Sauté for 3 minutes until tender-crisp.',
      'Pour 2 cups hot water with a pinch of pink rock salt and bring to a gentle boil.',
      'Stir in drained millet, reduce heat to low, cover, and simmer for 10-12 minutes until fluffy.',
      'Remove from heat, fold in chia seeds and fresh lemon juice. Garnish with coriander and serve warm.'
    ],
    instructionsTe: [
      'కొర్రలను శుభ్రంగా కడిగి 20 నిమిషాలు నానబెట్టండి.',
      'బాండీలో 1 చెంచా నూనె వేడి చేసి ఆవాలు, కరివేపాకు, అల్లం వేయించండి.',
      'క్యారెట్, బీన్స్ వేసి 3 నిమిషాలు మగ్గనివ్వండి.',
      '2 కప్పుల వేడి నీరు, ఉప్పు వేసి మరిగించండి.',
      'నానిన కొర్రలను వేసి సన్నని మంటపై 10-12 నిమిషాలు ఉడికించండి.',
      'చివరగా చియా గింజలు, నిమ్మరసం, కొత్తిమీర కలిపి వడ్డించండి.'
    ],
    nutrition: {
      calories: 285,
      protein: 9.2,
      carbohydrates: 38.0,
      fat: 7.1,
      fiber: 8.4,
      calcium: 82,
      iron: 3.4,
      zinc: 2.6,
      magnesium: 110,
      potassium: 340,
      vitaminC: 18
    },
    image: '/assets/foxtail_upma.jpg',
    tags: ['Low-GI', 'Gluten-Free', 'High-Fiber', 'Insulin-Sensitizing'],
    pcosBenefits: 'Foxtail millet delivers complex beta-glucans preventing morning glucose spikes while chia seeds suppress ovarian inflammatory cytokines.',
    pcosBenefitsTe: 'కొర్రలు రక్తంలో ఇన్సులిన్ స్థాయిలను అదుపులో ఉంచుతాయి, చియా గింజలు అండాశయ వాపును తగ్గిస్తాయి.',
    isActive: true
  },
  {
    id: 'rec-spearmint-seed-smoothie',
    name: 'Clinical Spearmint, Flaxseed & Spinach Hormone Booster',
    nameTe: 'స్పియర్‌మింట్, అవిసె గింజల హార్మోన్ బూస్టర్ స్మూతీ',
    description: 'Targeted anti-androgenic drink proven to lower free testosterone and support hepatic estrogen clearance.',
    descriptionTe: 'ఉచిత టెస్టోస్టెరాన్ స్థాయిలను తగ్గించే స్పియర్‌మింట్ మరియు అవిసె గింజల స్మూతీ.',
    category: 'Mid-Morning Snack',
    mealType: 'midMorning',
    prepTime: '5 mins',
    cookTime: '0 mins',
    servingSize: '1 glass (300ml)',
    ingredients: [
      '1 cup Brewed & chilled organic spearmint tea',
      '1.5 tbsp Freshly ground roasted flaxseeds (lignans)',
      '1 handful Baby spinach (washed)',
      '1/2 Green apple or 1/2 cup unsweetened almond milk',
      '1 tsp Soaked pumpkin seeds (high zinc)',
      '1/4 tsp Ground Ceylon cinnamon'
    ],
    ingredientsTe: [
      '1 కప్పు చల్లార్చిన ఆర్గానిక్ స్పియర్‌మింట్ టీ',
      '1.5 చెంచా వేయించి పొడి చేసిన అవిసె గింజలు',
      '1 గుప్పెడు పాలకూర',
      '1/2 ఆపిల్ లేదా బాదం పాలు',
      '1 చెంచా గుమ్మడి గింజలు',
      'చిటికెడు దాల్చినచెక్క పొడి'
    ],
    instructions: [
      'Steep organic spearmint leaves in boiling water for 8 minutes, then chill in the refrigerator.',
      'Add chilled spearmint tea, ground flaxseeds, baby spinach, green apple, and Ceylon cinnamon to a high-speed blender.',
      'Blend for 45-60 seconds until silky smooth.',
      'Pour into a tall glass, top with crunchy soaked pumpkin seeds, and sip between breakfast and lunch.'
    ],
    instructionsTe: [
      'స్పియర్‌మింట్ ఆకులను మరిగించి, చల్లబరచండి.',
      'బ్లెండర్‌లో టీ, అవిసె గింజల పొడి, పాలకూర, ఆపిల్, దాల్చినచెక్క వేయండి.',
      'మెత్తగా బ్లెండ్ చేసి గ్లాసులో పోయండి.',
      'పైనుండి గుమ్మడి గింజలు చల్లి తాగండి.'
    ],
    nutrition: {
      calories: 145,
      protein: 5.8,
      carbohydrates: 14.2,
      fat: 6.9,
      fiber: 6.8,
      calcium: 120,
      iron: 2.8,
      zinc: 2.9,
      magnesium: 98,
      potassium: 420,
      vitaminC: 24
    },
    image: '/assets/seed_tonic.jpg',
    tags: ['Anti-Androgen', 'Zinc-Rich', 'Spearmint', 'Flax Lignans'],
    pcosBenefits: 'Flaxseed lignans elevate SHBG (Sex Hormone-Binding Globulin) binding excess free testosterone, while zinc inhibits 5-alpha reductase activity.',
    pcosBenefitsTe: 'అవిసె గింజలు అదనపు టెస్టోస్టెరాన్‌ను తొలగిస్తాయి, జింక్ వెంట్రుకలు రాలడం మరియు మొటిమలను నివారిస్తుంది.',
    isActive: true
  },
  {
    id: 'rec-quinoa-edamame-buddha-bowl',
    name: 'Mediterranean Quinoa, Roasted Edamame & Avocado Buddha Bowl',
    nameTe: 'క్వినోవా, ఎడమామె మరియు అవోకాడో బుద్ధా బౌల్',
    description: 'High-protein, high-fiber power lunch delivering complete plant amino acids, monounsaturated fats, and folate.',
    descriptionTe: 'హై-ప్రోటీన్ మరియు పీచుతో కూడిన క్వినోవా మరియు అవోకాడో పౌష్టికాహారం.',
    category: 'Lunch',
    mealType: 'lunch',
    prepTime: '15 mins',
    cookTime: '15 mins',
    servingSize: '1 large bowl (350g)',
    ingredients: [
      '3/4 cup Cooked organic tricolor quinoa',
      '1/2 cup Steamed young edamame beans (shelled)',
      '1/2 Hass avocado, sliced',
      '1 cup Mixed dark leafy greens & purple cabbage',
      '6 Cherry tomatoes & 1/2 sliced cucumber',
      '1 tbsp Extra virgin olive oil & lemon-tahini dressing',
      '1 tbsp Toasted sunflower & sesame seeds'
    ],
    ingredientsTe: [
      '3/4 కప్పు ఉడికించిన క్వినోవా',
      '1/2 కప్పు ఉడికించిన ఎడమామె బీన్స్',
      '1/2 అవోకాడో ముక్కలు',
      'మిశ్రమ ఆకుకూరలు, క్యాబేజీ',
      'టొమాటో, కీరదోస ముక్కలు',
      'ఆలివ్ ఆయిల్ & నువ్వుల డ్రెస్సింగ్',
      'సూFoundర్యకాంతి & నువ్వుల గింజలు'
    ],
    instructions: [
      'Fluff cooled cooked quinoa and arrange in a wide serving bowl.',
      'Layer steamed edamame, sliced avocado, purple cabbage, cherry tomatoes, and greens in colorful sections.',
      'Whisk 1 tbsp extra virgin olive oil with 1 tsp sesame tahini, fresh lemon juice, and a pinch of garlic powder.',
      'Drizzle the dressing evenly over the bowl and sprinkle toasted sunflower and sesame seeds for mineral crunch.'
    ],
    instructionsTe: [
      'ఉడికించిన క్వినోవాను వెడల్పాటి గిన్నెలో వేయండి.',
      'ఎడమామె, అవోకాడో, క్యాబేజీ, టొమాటో ముక్కలను చక్కగా అమర్చండి.',
      'ఆలివ్ ఆయిల్, నిమ్మరసం కలిపి డ్రెస్సింగ్ సిద్ధం చేయండి.',
      'డ్రెస్సింగ్ పోసి, గింజలు చల్లి ఆస్వాదించండి.'
    ],
    nutrition: {
      calories: 420,
      protein: 18.5,
      carbohydrates: 42.0,
      fat: 16.8,
      fiber: 12.6,
      calcium: 160,
      iron: 4.8,
      zinc: 3.4,
      magnesium: 175,
      potassium: 760,
      vitaminC: 32
    },
    image: '/assets/quinoa_chickpea_bowl.jpg',
    tags: ['Plant Protein', 'Avocado Fats', 'High-Fiber', 'Anti-Inflammatory'],
    pcosBenefits: 'Provides 18.5g of complete protein to maintain steady glucose for 5 hours. High magnesium improves muscular insulin uptake.',
    pcosBenefitsTe: '18.5 గ్రాముల ప్రోటీన్ అందించి రక్తంలో చక్కెరను నియంత్రించి, కండరాల ఇన్సులిన్ గ్రహణశక్తిని పెంచుతుంది.',
    isActive: true
  },
  {
    id: 'rec-spiced-roasted-makhana',
    name: 'Turmeric & Black Pepper Roasted Makhana (Foxnuts)',
    nameTe: 'పసుపు, మిరియాలతో వేయించిన తామర గింజలు (మఖానా)',
    description: 'Crisp, low-calorie, zero-gluten afternoon crunch loaded with anti-inflammatory curcumin and bioavailable piperine.',
    descriptionTe: 'తక్కువ క్యాలరీలు, మంటను తగ్గించే పసుపు మరియు మిరియాల మఖానా స్నాక్.',
    category: 'Evening Snack',
    mealType: 'eveningSnack',
    prepTime: '5 mins',
    cookTime: '8 mins',
    servingSize: '1 medium bowl (50g)',
    ingredients: [
      '2 cups Raw lotus seeds (makhana / foxnuts)',
      '1 tsp Pure A2 cow ghee or virgin coconut oil',
      '1/2 tsp Turmeric powder',
      '1/4 tsp Coarsely crushed black pepper (piperine)',
      '1/4 tsp Roasted cumin powder & pink Himalayan salt'
    ],
    ingredientsTe: [
      '2 కప్పులు పచ్చి తామర గింజలు (మఖానా)',
      '1 చెంచా ఆవు నెయ్యి',
      '1/2 చెంచా పసుపు',
      '1/4 చెంచా మిరియాల పొడి',
      'జీలకర్ర పొడి, రాతి ఉప్పు'
    ],
    instructions: [
      'Heat 1 tsp ghee in a wide heavy skillet on low heat.',
      'Add makhana and dry roast on low flame for 6-8 minutes, stirring continuously until crisp and brittle.',
      'Add turmeric, black pepper, cumin powder, and pink salt. Toss vigorously so the spices coat each lotus puff.',
      'Allow to cool for 2 minutes to achieve maximum crunch, and store in an airtight container.'
    ],
    instructionsTe: [
      'బాండీలో 1 చెంచా నెయ్యి వేడి చేయండి.',
      'మఖానా వేసి సన్నని మంటపై 6-8 నిమిషాలు కరకరలాడే వరకు వేయించండి.',
      'పసుపు, మిరియాల పొడి, జీలకర్ర పొడి, ఉప్పు వేసి బాగా కలపండి.',
      'చల్లారిన తర్వాత డబ్బాలో భద్రపరుచుకోండి.'
    ],
    nutrition: {
      calories: 180,
      protein: 6.2,
      carbohydrates: 28.5,
      fat: 3.8,
      fiber: 4.5,
      calcium: 75,
      iron: 2.1,
      zinc: 1.8,
      magnesium: 62,
      potassium: 310,
      vitaminC: 2
    },
    image: '/assets/spiced_makhana.jpg',
    tags: ['Low Calorie', 'Anti-Inflammatory', 'Digestive', 'Zero Sugar'],
    pcosBenefits: 'Prevents 4 PM hypoglycemia and sugar cravings without triggering an insulin response. Curcumin-piperine pair calms systemic inflammation.',
    pcosBenefitsTe: 'సాయంత్రం వేళ తీపి పదార్థాల కోరికను అరికడుతుంది, శరీరంలో వాపును తగ్గిస్తుంది.',
    isActive: true
  },
  {
    id: 'rec-palak-paneer-jowar-roti',
    name: 'Iron-Rich Spinach & Tofu/Paneer Curry with Sorghum (Jowar) Roti',
    nameTe: 'పాలక్ పనీర్ కర్రీ & జొన్న రొట్టె',
    description: 'Nutrient-dense restorative dinner packing bioavailable plant iron, calcium, and complex slow-burning carbohydrates.',
    descriptionTe: 'ఐరన్ మరియు కాల్షియం అధికంగా ఉండే పాలకూర పనీర్ కర్రీ మరియు జొన్న రొట్టె.',
    category: 'Dinner',
    mealType: 'dinner',
    prepTime: '15 mins',
    cookTime: '20 mins',
    servingSize: '2 rotis + 1 bowl curry',
    ingredients: [
      '2 bunches Fresh spinach (blanched & pureed)',
      '100g Fresh paneer or firm organic tofu cubes',
      '1 Medium onion, 2 ripe tomatoes & 4 cloves garlic',
      '1/2 inch Fresh ginger & 1 green chili',
      '1 tsp Cumin seeds & 1/2 tsp garam masala',
      '1 tsp Cold-pressed sesame oil or ghee',
      '1 cup 100% Sorghum (Jowar) flour for rotis'
    ],
    ingredientsTe: [
      '2 కట్టల పాలకూర (ఉడికించి పేస్ట్ చేసినది)',
      '100 గ్రాముల పనీర్ లేదా టోఫు ముక్కలు',
      'ఉల్లిపాయ, టొమాటో, వెల్లుల్లి, అల్లం',
      'జీలకర్ర, గరం మసాలా',
      '1 చెంచా నువ్వుల నూనె లేదా నెయ్యి',
      '1 కప్పు జొన్న పిండి'
    ],
    instructions: [
      'Blanch washed spinach leaves in boiling water for 2 minutes, shock in cold water, and blend to a smooth puree.',
      'Heat oil in a pan, add cumin seeds, chopped garlic, ginger, and onions. Sauté until golden.',
      'Add tomato puree, turmeric, coriander powder, and salt. Cook until oil separates.',
      'Stir in spinach puree and simmer for 4 minutes. Add paneer/tofu cubes, sprinkle garam masala, and cook 2 minutes.',
      'Knead warm jowar flour with warm water and roll out two rotis on a hot tawa until toasted.',
      'Serve hot with a squeeze of fresh lemon juice to maximize non-heme iron absorption.'
    ],
    instructionsTe: [
      'పాలకూరను ఉడికించి మెత్తగా పేస్ట్ చేయండి.',
      'బాండీలో నూనె వేసి జీలకర్ర, వెల్లుల్లి, ఉల్లిపాయలు వేయించండి.',
      'టొమాటో, పసుపు, ఉప్పు వేసి మగ్గనివ్వండి.',
      'పాలకూర పేస్ట్, పనీర్ ముక్కలు వేసి 4 నిమిషాలు ఉడికించండి.',
      'వేడి నీటితో జొన్న పిండిని కలిపి రొట్టెలు కాల్చండి.',
      'నిమ్మరసం పిండి వేడిగా వడ్డించండి.'
    ],
    nutrition: {
      calories: 395,
      protein: 17.8,
      carbohydrates: 44.0,
      fat: 13.5,
      fiber: 9.8,
      calcium: 380,
      iron: 6.2,
      zinc: 3.8,
      magnesium: 165,
      potassium: 680,
      vitaminC: 28
    },
    image: '/assets/palak_tofu_millet_roti.jpg',
    tags: ['Iron-Rich', 'Calcium-Dense', 'Jowar', 'Gluten-Free'],
    pcosBenefits: 'Provides 6.2mg of dietary iron to replenish menstrual losses and 380mg of calcium. Jowar keeps nighttime glucose stable.',
    pcosBenefitsTe: 'రక్తహీనతను నివారించడానికి 6.2 మి.గ్రా ఐరన్ మరియు ఎముకల పుష్టికి 380 మి.గ్రా కాల్షియం అందిస్తుంది.',
    isActive: true
  },
  {
    id: 'rec-chamomile-magnesium-elixir',
    name: 'Bedtime Chamomile, Ashwagandha & Magnesium Night Elixir',
    nameTe: 'చామంతి, అశ్వగంధ నైట్ ఎలిక్సిర్ (మంచి నిద్ర కోసం)',
    description: 'Caffeine-free botanical infusion designed to lower nocturnal cortisol, ease pelvic cramps, and encourage deep restorative slow-wave sleep.',
    descriptionTe: 'రాత్రిపూట కార్టిసాల్‌ను తగ్గించి, గాఢ నిద్రను అందించే మూలికా టీ.',
    category: 'Bedtime Drink',
    mealType: 'bedtimeDrink',
    prepTime: '5 mins',
    cookTime: '5 mins',
    servingSize: '1 cup (250ml)',
    ingredients: [
      '1 tbsp Organic dried chamomile flowers',
      '1/4 tsp Ashwagandha root powder (Withania somnifera)',
      '1 cup Hot water or warm unsweetened almond milk',
      '1 crushed Green cardamom pod',
      '1/2 tsp Pure raw forest honey (optional)'
    ],
    ingredientsTe: [
      '1 చెంచా ఎండిన చామంతి పువ్వులు',
      '1/4 చెంచా అశ్వగంధ పొడి',
      '1 కప్పు వేడి నీరు లేదా బాదం పాలు',
      'యాలక్కాయ పొడి',
      'చిటికెడు తేనె'
    ],
    instructions: [
      'Bring 1 cup of clean water to a boil, then remove from heat.',
      'Add chamomile flowers, ashwagandha powder, and crushed cardamom pod.',
      'Cover with a saucer and steep for 6-8 minutes to preserve active flavonoids (apigenin).',
      'Strain into your favorite mug, stir gently, and drink warm 45 minutes before sleep.'
    ],
    instructionsTe: [
      'నీటిని మరిగించి దించండి.',
      'చామంతి పువ్వులు, అశ్వగంధ, యాలక్కాయ వేయండి.',
      'మూతపెట్టి 6-8 నిమిషాలు ఉంచండి.',
      'వడకట్టి నిద్రకు 45 నిమిషాల ముందు వేడిగా తాగండి.'
    ],
    nutrition: {
      calories: 35,
      protein: 0.8,
      carbohydrates: 6.2,
      fat: 0.6,
      fiber: 1.2,
      calcium: 45,
      iron: 0.8,
      zinc: 0.6,
      magnesium: 48,
      potassium: 110,
      vitaminC: 4
    },
    image: '/assets/chamomile_lavender.jpg',
    tags: ['Sleep-Support', 'Cortisol-Lowering', 'Caffeine-Free', 'Herbal'],
    pcosBenefits: 'Apigenin in chamomile binds GABA receptors promoting muscle relaxation. Ashwagandha clinically suppresses nocturnal cortisol surges.',
    pcosBenefitsTe: 'ఒత్తిడి హార్మోన్లను తగ్గించి ప్రశాంతమైన నిద్రకు తోడ్పడుతుంది.',
    isActive: true
  }
];

const DELETED_RECIPES_STORAGE_KEY = 'pcosense_deleted_recipes_db';

function getDeletedRecipeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_RECIPES_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function markRecipeDeleted(id: string): void {
  const ids = getDeletedRecipeIds();
  ids.add(id);
  try {
    localStorage.setItem(DELETED_RECIPES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function unmarkRecipeDeleted(id: string): void {
  const ids = getDeletedRecipeIds();
  if (ids.has(id)) {
    ids.delete(id);
    try {
      localStorage.setItem(DELETED_RECIPES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {}
  }
}

export function getStoredRecipes(): DetailedRecipeItem[] {
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    const deletedIds = getDeletedRecipeIds();
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Upgrade any stale Unsplash images for initial recipes to local verified assets
        const fallbackMap: Record<string, string> = {
          'rec-spiced-foxtail-upma': '/assets/foxtail_upma.jpg',
          'rec-spearmint-seed-smoothie': '/assets/seed_tonic.jpg',
          'rec-quinoa-edamame-buddha-bowl': '/assets/quinoa_chickpea_bowl.jpg',
          'rec-spiced-roasted-makhana': '/assets/spiced_makhana.jpg',
          'rec-palak-paneer-jowar-roti': '/assets/palak_tofu_millet_roti.jpg',
          'rec-chamomile-magnesium-elixir': '/assets/chamomile_lavender.jpg'
        };
        return parsed
          .filter(r => !deletedIds.has(r.id))
          .map(r => {
            // Only replace if it is one of the initial recipes with old Unsplash links
            if (fallbackMap[r.id] && r.image && r.image.includes('unsplash.com')) {
              return {
                ...r,
                image: fallbackMap[r.id]
              };
            }
            // Custom / newly added recipe retains its custom image or uploaded file
            return r;
          });
      }
    }
  } catch (err) {
    console.error('Error reading recipes:', err);
  }
  saveRecipesToStorage(INITIAL_VERIFIED_RECIPES, false);
  return INITIAL_VERIFIED_RECIPES;
}

export function saveRecipesToStorage(recipes: DetailedRecipeItem[], syncToFirestore = true): void {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pcosense_recipes_updated', { detail: recipes }));
    }
  } catch (err) {
    console.error('Error saving recipes:', err);
  }

  if (syncToFirestore) {
    // Non-blocking sync to Firestore
    recipes.forEach(r => {
      const docRef = doc(db, 'recipes', r.id);
      setDoc(docRef, r, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `recipes/${r.id}`);
      });
    });
  }
}

/**
 * Fetch recipes from Cloud Firestore and merge into local cache with timestamp comparison
 */
export async function fetchRecipesFromFirestore(): Promise<DetailedRecipeItem[]> {
  try {
    const colRef = collection(db, 'recipes');
    const snap = await getDocs(colRef);
    const deletedIds = getDeletedRecipeIds();

    if (!snap.empty) {
      const remoteRecipes = snap.docs.map(d => d.data() as DetailedRecipeItem);

      // Clean up remote items that were deleted locally
      remoteRecipes.forEach(r => {
        if (deletedIds.has(r.id)) {
          deleteDoc(doc(db, 'recipes', r.id)).catch(() => {});
        }
      });

      const validRemote = remoteRecipes.filter(r => !deletedIds.has(r.id));
      const local = getStoredRecipes().filter(r => !deletedIds.has(r.id));

      const map = new Map<string, DetailedRecipeItem>();
      // Remote recipes first
      validRemote.forEach(r => map.set(r.id, r));

      // Local items: if local is newer or doesn't exist in remote, local prevails
      local.forEach(l => {
        const remote = map.get(l.id);
        if (!remote) {
          map.set(l.id, l);
          // Sync local-only item to Firestore
          setDoc(doc(db, 'recipes', l.id), l, { merge: true }).catch(() => {});
        } else {
          const localTime = l.updatedAt ? new Date(l.updatedAt).getTime() : 0;
          const remoteTime = (remote as any).updatedAt ? new Date((remote as any).updatedAt).getTime() : 0;
          if (localTime >= remoteTime) {
            map.set(l.id, l);
            if (localTime > remoteTime) {
              setDoc(doc(db, 'recipes', l.id), l, { merge: true }).catch(() => {});
            }
          }
        }
      });

      const merged = Array.from(map.values());
      saveRecipesToStorage(merged, false);
      return merged;
    } else {
      // Seed initial recipes to Firestore
      const initials = getStoredRecipes().filter(r => !deletedIds.has(r.id));
      initials.forEach(r => {
        setDoc(doc(db, 'recipes', r.id), r).catch(() => {});
      });
      return initials;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'recipes');
  }
  return getStoredRecipes();
}

export function getActiveRecipes(): DetailedRecipeItem[] {
  return getStoredRecipes().filter(r => r.isActive);
}

export function getRecipeById(id: string): DetailedRecipeItem | undefined {
  return getStoredRecipes().find(r => r.id === id);
}

/**
 * Admin: Add new recipe
 */
export function addRecipe(recipeData: Omit<DetailedRecipeItem, 'id'>): DetailedRecipeItem {
  const all = getStoredRecipes();
  const id = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  unmarkRecipeDeleted(id);
  const now = new Date().toISOString();
  const newRecipe: DetailedRecipeItem = {
    ...recipeData,
    id,
    createdAt: (recipeData as any).createdAt || now,
    updatedAt: now
  };
  all.unshift(newRecipe);
  saveRecipesToStorage(all, true);
  return newRecipe;
}

/**
 * Admin: Update recipe
 */
export function updateRecipe(id: string, updates: Partial<DetailedRecipeItem>): DetailedRecipeItem | null {
  const all = getStoredRecipes();
  const index = all.findIndex(r => r.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveRecipesToStorage(all, true);

  // Sync to Firestore immediately
  setDoc(doc(db, 'recipes', id), all[index], { merge: true }).catch(err => {
    handleFirestoreError(err, OperationType.UPDATE, `recipes/${id}`);
  });

  return all[index];
}

/**
 * Admin: Delete recipe
 */
export function deleteRecipe(id: string): boolean {
  markRecipeDeleted(id);
  const all = getStoredRecipes();
  const filtered = all.filter(r => r.id !== id);
  if (filtered.length !== all.length) {
    saveRecipesToStorage(filtered, false);
    deleteDoc(doc(db, 'recipes', id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `recipes/${id}`);
    });
    return true;
  }
  return false;
}

// ============================================================
// DAILY NUTRITION TRACKING LOGS
// ============================================================

export function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getStoredNutritionLogs(): Record<string, DailyNutritionLog> {
  try {
    const raw = localStorage.getItem(NUTRITION_LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading nutrition logs:', err);
  }
  return {};
}

export function saveNutritionLogsToStorage(logs: Record<string, DailyNutritionLog>): void {
  try {
    localStorage.setItem(NUTRITION_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving nutrition logs:', err);
  }
}

/**
 * Get or initialize today's daily nutrition log for a user
 */
export function getDailyNutritionLog(userId: string, dateKey: string = getTodayDateKey()): DailyNutritionLog {
  const allLogs = getStoredNutritionLogs();
  const key = `${userId}_${dateKey}`;

  if (allLogs[key]) {
    return allLogs[key];
  }

  const initialLog: DailyNutritionLog = {
    id: key,
    userId,
    dateKey,
    consumed: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      calcium: 0,
      iron: 0,
      zinc: 0,
      magnesium: 0,
      potassium: 0,
      vitaminC: 0
    },
    targets: { ...DEFAULT_DAILY_NUTRITION_TARGETS },
    completedMeals: [],
    lastUpdated: new Date().toISOString()
  };

  allLogs[key] = initialLog;
  saveNutritionLogsToStorage(allLogs);
  return initialLog;
}

/**
 * Log a recipe meal to today's nutrition log
 */
export function logRecipeMeal(userId: string, recipe: DetailedRecipeItem, dateKey: string = getTodayDateKey()): DailyNutritionLog {
  const current = getDailyNutritionLog(userId, dateKey);

  const updatedConsumed: StructuredNutritionRecord = {
    calories: Math.round(current.consumed.calories + recipe.nutrition.calories),
    protein: Number((current.consumed.protein + recipe.nutrition.protein).toFixed(1)),
    carbohydrates: Number((current.consumed.carbohydrates + recipe.nutrition.carbohydrates).toFixed(1)),
    fat: Number((current.consumed.fat + recipe.nutrition.fat).toFixed(1)),
    fiber: Number((current.consumed.fiber + recipe.nutrition.fiber).toFixed(1)),
    calcium: Math.round(current.consumed.calcium + recipe.nutrition.calcium),
    iron: Number((current.consumed.iron + recipe.nutrition.iron).toFixed(1)),
    zinc: Number((current.consumed.zinc + recipe.nutrition.zinc).toFixed(1)),
    magnesium: Math.round(current.consumed.magnesium + recipe.nutrition.magnesium),
    potassium: Math.round(current.consumed.potassium + recipe.nutrition.potassium),
    vitaminC: Math.round(current.consumed.vitaminC + recipe.nutrition.vitaminC)
  };

  const updatedMeals = [
    ...current.completedMeals,
    {
      mealSlot: recipe.mealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      calories: recipe.nutrition.calories,
      loggedAt: new Date().toISOString()
    }
  ];

  const updatedLog: DailyNutritionLog = {
    ...current,
    consumed: updatedConsumed,
    completedMeals: updatedMeals,
    lastUpdated: new Date().toISOString()
  };

  const allLogs = getStoredNutritionLogs();
  allLogs[`${userId}_${dateKey}`] = updatedLog;
  saveNutritionLogsToStorage(allLogs);
  return updatedLog;
}

/**
 * Calculate Remaining Balance & Progress percentage
 */
export interface NutritionMetricSummary {
  name: string;
  nameTe: string;
  unit: string;
  consumed: number;
  target: number;
  remaining: number;
  percentage: number;
  status: 'good' | 'in-progress' | 'exceeded';
}

export function calculateNutritionSummary(log: DailyNutritionLog): NutritionMetricSummary[] {
  const metrics: { key: keyof StructuredNutritionRecord; label: string; labelTe: string; unit: string }[] = [
    { key: 'calories', label: 'Calories', labelTe: 'క్యాలరీలు', unit: 'kcal' },
    { key: 'protein', label: 'Protein', labelTe: 'ప్రోటీన్', unit: 'g' },
    { key: 'fiber', label: 'Fiber', labelTe: 'పీచు పదార్థం', unit: 'g' },
    { key: 'carbohydrates', label: 'Carbohydrates', labelTe: 'పిండి పదార్థాలు', unit: 'g' },
    { key: 'fat', label: 'Healthy Fats', labelTe: 'మంచి కొవ్వులు', unit: 'g' },
    { key: 'calcium', label: 'Calcium', labelTe: 'కాల్షియం', unit: 'mg' },
    { key: 'iron', label: 'Iron', labelTe: 'ఐరన్', unit: 'mg' },
    { key: 'zinc', label: 'Zinc', labelTe: 'జింక్', unit: 'mg' },
    { key: 'magnesium', label: 'Magnesium', labelTe: 'మెగ్నీషియం', unit: 'mg' },
    { key: 'potassium', label: 'Potassium', labelTe: 'పొటాషియం', unit: 'mg' },
    { key: 'vitaminC', label: 'Vitamin C', labelTe: 'విటమిన్ సి', unit: 'mg' }
  ];

  return metrics.map(m => {
    const consumed = log.consumed[m.key] || 0;
    const target = log.targets[m.key] || 1;
    const remaining = Math.max(0, target - consumed);
    const percentage = Math.min(100, Math.round((consumed / target) * 100));

    let status: NutritionMetricSummary['status'] = 'in-progress';
    if (percentage >= 100) status = 'good';
    if (m.key === 'calories' && consumed > target * 1.15) status = 'exceeded';

    return {
      name: m.label,
      nameTe: m.labelTe,
      unit: m.unit,
      consumed,
      target,
      remaining: Number(remaining.toFixed(1)),
      percentage,
      status
    };
  });
}
