import { RecipeItem } from '../types';

export const DINNER_RECIPES: RecipeItem[] = [
  // ============================================================
  // VEGETARIAN DINNERS (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_di_palak_tofu_millet_roti',
    name: 'Spiced Palak (Spinach) Paneer / Tofu Curry with Jowar Roti & Spiced Flax Chutney',
    nameTe: 'పాలక్ పనీర్ / టోఫు కర్రీ & జొన్న రొట్టె (అవిసె చట్నీతో)',
    tagline: 'Deep green magnesium infusion paired with gluten-free slow-carb sorghum flatbread',
    taglineTe: 'మెగ్నీషియం మరియు ఐరన్ సమృద్ధిగా ఉండే పాలక్ పనీర్ రాత్రి భోజనం',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 340,
    proteinGrams: 18,
    carbsGrams: 36,
    fatGrams: 12,
    fiberGrams: 9,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Spinach magnesium calms nocturnal adrenal cortisol surges.',
      'Tofu / Paneer provides bioavailable zinc and calcium without glycemic burden.',
      'Jowar (Sorghum) flour is rich in resistant starch that feeds healthy bowel flora.'
    ],
    ingredients: [
      { item: 'Fresh Spinach (Palak) leaves, blanched & puréed', amount: '3 cups packed', pcosBenefit: 'Magnesium & Folate' },
      { item: 'Organic Firm Tofu or Low-Fat Paneer Cubes', amount: '150g', pcosBenefit: '18g Clean Protein' },
      { item: 'Jowar (Sorghum) Flour Roti', amount: '1 fresh warm roti', pcosBenefit: 'Gluten-Free Low-GI Carb' },
      { item: 'Ginger, Garlic & Cumin Seeds in Cold-Pressed Oil', amount: '1 tsp oil', pcosBenefit: 'Allicin & Enzymes' },
      { item: 'Ground Roasted Flaxseed Podi / Chutney', amount: '1 tbsp', pcosBenefit: 'Estrogen-Binding Lignans' }
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes, shock in ice water, and blend with green chili and ginger into a smooth purée.',
      'In a pan, heat 1 tsp oil, sauté cumin seeds, minced garlic, and chopped onions until fragrant.',
      'Pour in spinach purée, add turmeric, garam masala, and rock salt. Simmer for 5 minutes.',
      'Gently fold in tofu or paneer cubes and cook for 3 minutes.',
      'Serve warm with 1 freshly rolled jowar roti and a sprinkle of roasted flaxseed chutney.'
    ],
    proTips: ['Blanching spinach and shocking in ice water retains vibrant chlorophyll and reduces oxalates.'],
    tags: ['Low-Carb', 'Magnesium-Rich', 'Comfort-Food']
  },
  {
    id: 'rec_di_grilled_paneer_tikka_salad',
    name: 'Tandoori Spiced Paneer / Tofu Tikka Skewers with Sautéed Veggies & Mint Dip',
    nameTe: 'తందూరి పనీర్ / టోఫు టిక్కా & మింట్ డిప్',
    tagline: 'High-protein, ultra-low-carb dinner that keeps evening insulin levels completely flat',
    taglineTe: 'రాత్రి వేళ ఇన్సులిన్ పెరగకుండా ఉంచే పనీర్ టిక్కా డిన్నర్',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 2,
    calories: 320,
    proteinGrams: 20,
    carbsGrams: 16,
    fatGrams: 18,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Zero refined starch dinner prevents nocturnal blood glucose spikes and reactive early morning hypoglycemia.',
      '20g protein optimizes overnight muscular recovery and growth hormone secretion.'
    ],
    ingredients: [
      { item: 'Fresh Low-Fat Paneer or Organic Tofu Cubes', amount: '180g', pcosBenefit: '20g Protein & Calcium' },
      { item: 'Bell Peppers, Red Onions & Mushroom Cubes', amount: '1.5 cups', pcosBenefit: 'Antioxidants & Selenium' },
      { item: 'Hung A2 Curd (Yogurt) Marinade with Ajwain & Tandoori Spices', amount: '1/3 cup', pcosBenefit: 'Probiotics & Flavor' },
      { item: 'Fresh Mint-Coriander Yogurt Dip', amount: '2 tbsp', pcosBenefit: 'Cooling Digestive Enzymes' }
    ],
    instructions: [
      'Marinate paneer/tofu cubes and vegetables in spiced yogurt with ajwain, kasoori methi, turmeric, and chaat masala for 15 minutes.',
      'Thread onto skewers or arrange on a hot grill pan.',
      'Grill for 8-10 minutes, turning once until edges are lightly charred and aromatic.',
      'Serve hot with fresh lemon juice and cooling mint dip.'
    ],
    proTips: ['Ajwain and kasoori methi in the marinade enhance digestive enzyme secretions.'],
    tags: ['High-Protein', 'Keto-Friendly', 'Low-Carb', 'Spicy']
  },
  {
    id: 'rec_di_lentil_spinach_soup',
    name: 'Hearty Mediterranean Red Lentil & Kale Soup with Turmeric & Olive Oil Drizzle',
    nameTe: 'రెడ్ లెంటిల్ & కాలే వెజిటబుల్ సూప్',
    tagline: 'Warm, soothing, easily digestible dinner that lets the digestive tract rest overnight',
    taglineTe: 'రాత్రి వేళ జీర్ణక్రియకు తేలికైన ఎర్రపప్పు కాలే సూప్',
    mealType: 'dinner',
    cravingType: 'hot',
    preference: 'vegan',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    servings: 2,
    calories: 290,
    proteinGrams: 15,
    carbsGrams: 42,
    fatGrams: 7,
    fiberGrams: 11,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Red lentils cook down into easily digestible plant protein that does not tax nighttime digestion.',
      'Kale provides indole-3-carbinol to assist liver phase-2 estrogen conjugation while sleeping.',
      'Extra virgin olive oil provides oleocanthal, a natural anti-inflammatory agent.'
    ],
    ingredients: [
      { item: 'Split Red Lentils (Masoor Dal)', amount: '3/4 cup', pcosBenefit: '15g Easy-Digesting Protein' },
      { item: 'Chopped Tuscan Kale or Baby Spinach', amount: '2 cups', pcosBenefit: 'Indole-3-Carbinol & Iron' },
      { item: 'Diced Carrots, Celery & Tomatoes', amount: '1 cup', pcosBenefit: 'Prebiotic Fiber & Lycopene' },
      { item: 'Extra Virgin Olive Oil & Lemon Drizzle', amount: '1 tbsp', pcosBenefit: 'Anti-Inflammatory Lipids' }
    ],
    instructions: [
      'Sauté diced onions, garlic, carrots, and celery in 1 tsp olive oil for 3 minutes.',
      'Add red lentils, turmeric, cumin, vegetable broth or water, and diced tomatoes.',
      'Simmer on medium heat for 15 minutes until lentils are completely tender and creamy.',
      'Stir in chopped kale in the last 3 minutes so it wilts but stays bright green.',
      'Ladle into deep bowls, finish with fresh lemon juice and a drizzle of extra virgin olive oil.'
    ],
    proTips: ['Eating an early, soup-based dinner improves deep stage-4 restorative sleep by 35%.'],
    tags: ['Gut-Healing', 'Vegan', 'Anti-Inflammatory', 'Comfort-Food']
  },
  {
    id: 'rec_di_zucchini_chickpea_curry',
    name: 'Rich Coconut Chickpea & Zucchini Curry with Steamed Cauliflower Rice',
    nameTe: 'కొబ్బరి శనగలు & జుకిని కర్రీ (కాలీఫ్లవర్ రైస్‌తో)',
    tagline: 'Creamy dairy-free curry delivering plant protein and healthy medium-chain triglycerides (MCTs)',
    taglineTe: 'హార్మోన్ల సమతుల్యత కోసం కొబ్బరి శనగల కర్రీ & క్యాలీఫ్లవర్ రైస్',
    mealType: 'dinner',
    cravingType: 'comfort',
    preference: 'vegan',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 330,
    proteinGrams: 14,
    carbsGrams: 36,
    fatGrams: 14,
    fiberGrams: 10,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Coconut milk MCTs provide clean cellular energy without stimulating insulin production.',
      'Cauliflower rice replaces grain starch with sulforaphane liver detox power.',
      'Chickpeas deliver slow-release complex carbs and zinc.'
    ],
    ingredients: [
      { item: 'Boiled Kabuli Chickpeas', amount: '1 cup', pcosBenefit: 'Plant Protein & Zinc' },
      { item: 'Diced Zucchini & Bell Peppers', amount: '1.5 cups', pcosBenefit: 'Potassium & Vitamin C' },
      { item: 'Light Coconut Milk', amount: '1/2 cup', pcosBenefit: 'MCT Healthy Fats' },
      { item: 'Grated Cauliflower Rice (steamed)', amount: '1.5 cups', pcosBenefit: 'Ultra-Low-Carb Base' }
    ],
    instructions: [
      'In a pan, sauté ginger, garlic, turmeric, curry powder, and cumin in 1/2 tsp oil.',
      'Add zucchini, bell peppers, and chickpeas; sauté for 3 minutes.',
      'Pour in coconut milk and 1/4 cup water. Simmer on low heat for 8 minutes until vegetables are tender.',
      'Serve warm over lightly steamed cauliflower rice with fresh coriander.'
    ],
    proTips: ['Cauliflower rice gives the comforting texture of rice with 90% fewer carbohydrates.'],
    tags: ['Dairy-Free', 'Vegan', 'Low-Carb', 'Comfort']
  },
  {
    id: 'rec_di_mushroom_matar_roti',
    name: 'Homestyle Mushroom & Green Peas Masala with 1 Warm Bajra (Pearl Millet) Roti',
    nameTe: 'మష్రూమ్ బఠానీ మసాలా & సజ్జ రొట్టె',
    tagline: 'Selenium-rich mushroom medley paired with iron-packed pearl millet flatbread',
    taglineTe: 'రక్తహీనతను తగ్గించే మష్రూమ్ బఠానీ కర్రీ & సజ్జ రొట్టె',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 335,
    proteinGrams: 15,
    carbsGrams: 42,
    fatGrams: 10,
    fiberGrams: 9,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Button mushrooms provide selenium and ergothioneine to combat ovarian oxidative stress.',
      'Bajra (Pearl Millet) is the richest millet source of iron and dietary zinc.',
      'Green peas provide clean plant protein and B vitamins.'
    ],
    ingredients: [
      { item: 'Fresh Button & Cremini Mushrooms (quartered)', amount: '2 cups', pcosBenefit: 'Selenium & Antioxidants' },
      { item: 'Sweet Green Peas', amount: '1/2 cup', pcosBenefit: 'Zinc & Folate' },
      { item: 'Spiced Tomato-Onion-Kasuri Methi Gravy', amount: '1 cup', pcosBenefit: 'Lycopene' },
      { item: 'Bajra (Pearl Millet) Roti', amount: '1 fresh roti', pcosBenefit: 'Iron-Rich Slow Carb' }
    ],
    instructions: [
      'Heat 1 tsp oil, sauté onions, ginger-garlic paste, and tomatoes with turmeric, coriander, and garam masala.',
      'Add quartered mushrooms and green peas. Simmer for 8 minutes until mushrooms are tender and gravy is thick.',
      'Crush kasuri methi over the curry and serve hot with 1 warm bajra roti.'
    ],
    proTips: ['Bajra contains slowly digestible starch that prevents middle-of-the-night hunger awakenings.'],
    tags: ['Iron-Rich', 'Desi-Classic', 'Gluten-Free']
  },
  {
    id: 'rec_di_cauliflower_dum_biryani',
    name: 'Weekend Saffron Spiced Cauliflower & Brown Rice Biryani with Cucumber Mint Raita',
    nameTe: 'సెలవు దిన ప్రత్యేక కాలీఫ్లవర్ బిర్యానీ (రైతాతో)',
    tagline: 'Aromatic weekend culinary joy engineered with cruciferous super-veggies',
    taglineTe: 'రుచికరమైన మరియు హార్మోన్ల సమతుల్యతకు తోడ్పడే కాలీఫ్లవర్ బిర్యానీ',
    mealType: 'dinner',
    cravingType: 'special',
    preference: 'vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 2,
    calories: 340,
    proteinGrams: 13,
    carbsGrams: 46,
    fatGrams: 11,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Cruciferous cauliflower provides Indole-3-Carbinol (I3C) to support liver estrogen detoxification.',
      'Saffron and whole spices contain antioxidants that improve ovarian blood flow.'
    ],
    ingredients: [
      { item: 'Cauliflower Florets & Mushrooms/Paneer', amount: '2 cups', pcosBenefit: 'I3C & Selenium' },
      { item: 'Aged Brown Basmati Rice', amount: '1 cup', pcosBenefit: 'Low-GI Grain' },
      { item: 'Fresh Mint, Coriander & Saffron Almond Milk', amount: '1 cup', pcosBenefit: 'Aromatics & Nitric Oxide' }
    ],
    instructions: [
      'Layer par-cooked brown rice with spiced marinated cauliflower and mushrooms in a pot.',
      'Seal with lid and slow-cook on low heat for 12 minutes.',
      'Serve hot with cooling mint-cucumber raita.'
    ],
    proTips: ['Saffron has clinical backing for elevating evening mood and relaxing the nervous system.'],
    tags: ['Special', 'Weekend-Feast', 'Cruciferous']
  },
  {
    id: 'rec_cr_hot_spiced_tomato_rasam_soup',
    name: 'Hot Spiced Pepper-Garlic Tomato Rasam with Steamed Foxtail Millet & Roasted Papad',
    nameTe: 'మిరియాలు & వెల్లుల్లి టమాటో చారు (కొర్రల అన్నంతో)',
    tagline: 'Traditional South Indian metabolic broth loaded with piperine, allicin, and lycopene',
    taglineTe: 'జీర్ణక్రియ మరియు మెటబాలిజంను వేగవంతం చేసే మిరియాల చారు భోజనం',
    mealType: 'dinner',
    cravingType: 'hot',
    preference: 'south_indian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    calories: 270,
    proteinGrams: 8,
    carbsGrams: 42,
    fatGrams: 5,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Piperine in black pepper and allicin in crushed garlic boost metabolic resting thermogenesis.',
      'Tamarind and tomato organic acids stimulate liver bile excretion.',
      'Foxtail millet prevents evening glucose swings.'
    ],
    ingredients: [
      { item: 'Ripe Tomatoes & Tamarind Pulp', amount: '2 large tomatoes', pcosBenefit: 'Lycopene & Malic Acid' },
      { item: 'Freshly Crushed Black Pepper, Garlic & Cumin', amount: '1.5 tbsp', pcosBenefit: 'Piperine & Allicin' },
      { item: 'Curry Leaves, Mustard Seeds & Ghee Tadka', amount: '1 tsp ghee', pcosBenefit: 'Digestive Enzymes' },
      { item: 'Steamed Foxtail Millet (Korralu)', amount: '1/2 cup cooked', pcosBenefit: 'Low-GI Millet Carb' }
    ],
    instructions: [
      'Boil crushed tomatoes with tamarind, turmeric, rock salt, and 2 cups water for 5 minutes.',
      'Add crushed black pepper, garlic, and cumin powder. Simmer for 3 minutes.',
      'Temper with mustard seeds, curry leaves, and hing in 1 tsp ghee; pour over boiling rasam.',
      'Serve piping hot in a deep bowl with warm steamed foxtail millet and roasted urad dal papad.'
    ],
    proTips: ['Drink a small cup of hot rasam broth before eating to stimulate gastrin and stomach enzymes.'],
    tags: ['Metabolic-Booster', 'Comfort-Food', 'South-Indian']
  },

  // ============================================================
  // NON-VEGETARIAN DINNERS (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_di_grilled_salmon_asparagus',
    name: 'Wild Alaskan Salmon Fillet with Steamed Lemon-Garlic Asparagus & Mashed Cauliflower',
    nameTe: 'వైల్డ్ సాల్మన్ & అస్పరాగస్ (క్యాలీఫ్లవర్ మాష్‌తో)',
    tagline: 'Ultra-clean dinner with zero refined carbohydrates and 2,200mg pure marine Omega-3s',
    taglineTe: 'రాత్రి వేళ టెస్టోస్టెరాన్ తగ్గించే ఒమేగా-3 సాల్మన్ డిన్నర్',
    mealType: 'dinner',
    cravingType: 'special',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 360,
    proteinGrams: 32,
    carbsGrams: 10,
    fatGrams: 20,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '2,200mg marine EPA/DHA calms ovarian theca cell hyperandrogenism.',
      'Asparagus inulin and glutathione support nocturnal hepatic cleansing.',
      'Zero starch ensures high sleep-phase growth hormone output.'
    ],
    ingredients: [
      { item: 'Wild Salmon Fillet', amount: '150g', pcosBenefit: 'EPA/DHA & Complete Protein' },
      { item: 'Fresh Asparagus Spears', amount: '6 spears', pcosBenefit: 'Glutathione & Inulin' },
      { item: 'Steamed & Mashed Cauliflower (with garlic & olive oil)', amount: '1 cup', pcosBenefit: 'I3C Detox' },
      { item: 'Extra Virgin Olive Oil & Fresh Lemon', amount: '1 tsp', pcosBenefit: 'Polyphenols' }
    ],
    instructions: [
      'Season salmon with sea salt, crushed black pepper, and garlic powder.',
      'Pan-sear in 1/2 tsp olive oil for 4 minutes per side until crisp on outside and tender inside.',
      'Steam asparagus spears for 3 minutes.',
      'Serve salmon over a bed of warm garlic-cauliflower mash with asparagus and lemon wedges.'
    ],
    proTips: ['Eating salmon at dinner promotes deep, restorative REM sleep due to high natural vitamin D3 and B6.'],
    tags: ['Omega-3-Rich', 'Keto-Friendly', 'Low-Carb']
  },
  {
    id: 'rec_di_chicken_tikka_salad',
    name: 'Tandoori Marinated Chicken Breast Tikka with Sautéed Bell Peppers & Mint Dressing',
    nameTe: 'తందూరి చికెన్ టిక్కా & పుదీనా సలాడ్',
    tagline: 'Lean poultry protein charred with kasoori methi, ginger, and digestive tandoori spices',
    taglineTe: 'అధిక ప్రొటీన్ మరియు తక్కువ పిండిపదార్థాలతో కూడిన చికెన్ టిక్కా డిన్నర్',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 340,
    proteinGrams: 36,
    carbsGrams: 12,
    fatGrams: 14,
    fiberGrams: 4,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '36g pure lean protein keeps insulin flat throughout the night.',
      'Fenugreek (kasoori methi) in the marinade supports insulin receptor sensitivity.',
      'Bell peppers provide carotenoids.'
    ],
    ingredients: [
      { item: 'Skinless Chicken Breast Chunks', amount: '180g', pcosBenefit: '36g Pure Protein' },
      { item: 'Hung A2 Yogurt Marinade with Ginger-Garlic & Kasuri Methi', amount: '3 tbsp', pcosBenefit: 'Probiotics & Flavor' },
      { item: 'Bell Peppers & Sliced Red Onions', amount: '1 cup', pcosBenefit: 'Quercetin' },
      { item: 'Fresh Mint-Lemon Dressing', amount: '2 tbsp', pcosBenefit: 'Cooling Digestion' }
    ],
    instructions: [
      'Marinate chicken chunks in hung curd with ginger, garlic, tandoori masala, kasuri methi, and lemon for 15 mins.',
      'Grill or air-fry at 200°C for 10-12 minutes until juicy and slightly charred.',
      'Toss bell peppers and onions in the pan for 2 minutes.',
      'Serve hot with fresh lemon and cooling mint dressing.'
    ],
    proTips: ['High protein low-carb dinners eliminate morning cortisol awakening spikes.'],
    tags: ['High-Protein', 'Low-Carb', 'Spicy']
  },
  {
    id: 'rec_di_egg_vegetable_soup',
    name: 'Hearty Egg Drop Vegetable Soup with Bok Choy, Mushrooms & Ginger Broth',
    nameTe: 'ఎగ్ డ్రాప్ వెజిటబుల్ సూప్ (మష్రూమ్ & అల్లం సూప్)',
    tagline: 'Silky, soothing egg ribbons in hot mineral-rich ginger-garlic vegetable broth',
    taglineTe: 'రాత్రి వేళ కడుపుకు ఎంతో తేలికైన మరియు బలవర్ధకమైన ఎగ్ సూప్',
    mealType: 'dinner',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 1,
    calories: 260,
    proteinGrams: 18,
    carbsGrams: 12,
    fatGrams: 14,
    fiberGrams: 4,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Easily assimilated egg protein does not disrupt nocturnal sleep rhythms.',
      'Bok choy and mushrooms provide glucosinolates and selenium for ovarian micro-detoxification.',
      'Ginger and garlic stimulate restful digestion.'
    ],
    ingredients: [
      { item: 'Free-Range Eggs (whisked)', amount: '2 eggs', pcosBenefit: 'Choline & Protein' },
      { item: 'Chopped Bok Choy, Carrots & Sliced Mushrooms', amount: '1.5 cups', pcosBenefit: 'Glucosinolates & Minerals' },
      { item: 'Fresh Ginger-Garlic Broth with Sesame Oil', amount: '2 cups + 1/2 tsp oil', pcosBenefit: 'Anti-Inflammatory Broth' },
      { item: 'Cracked White Pepper & Fresh Scallions', amount: '1 tsp', pcosBenefit: 'Thermogenic Seasoning' }
    ],
    instructions: [
      'Bring ginger, garlic, chopped carrots, and mushrooms to a simmer in 2 cups vegetable broth for 5 minutes.',
      'Add chopped bok choy.',
      'Slowly drizzle whisked eggs in a circular motion into the simmering soup to create silky egg ribbons.',
      'Turn off heat, drizzle 1/2 tsp toasted sesame oil, crack white pepper, and serve piping hot.'
    ],
    proTips: ['Egg drop soup is ideal on days with lower physical activity or pre-menstrual bloating.'],
    tags: ['Comfort-Broth', 'Quick 15-Min', 'Low-Calorie']
  },
  {
    id: 'rec_di_grilled_fish_tacos',
    name: 'Grilled White Fish (Tilapia/Cod) Lettuce Tacos with Avocado Cilantro Crema',
    nameTe: 'గ్రిల్డ్ ఫిష్ లెట్యూస్ రాప్స్ (ఎవకాడో క్రీమ్‌తో)',
    tagline: 'Grain-free crisp romaine tacos filled with flakey seasoned white fish and rich healthy fats',
    taglineTe: 'పిండి పదార్థాలు లేని తేలికైన గ్రిల్డ్ ఫిష్ డిన్నర్',
    mealType: 'dinner',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 1,
    calories: 320,
    proteinGrams: 28,
    carbsGrams: 10,
    fatGrams: 16,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Zero refined starch lettuce wraps eliminate late-night insulin spikes.',
      'White fish provides high bioavailability clean protein and iodine for thyroid function.',
      'Avocado crema supplies potassium and monounsaturated fatty acids.'
    ],
    ingredients: [
      { item: 'White Fish Fillet (Cod/Tilapia/Sea Bass)', amount: '160g', pcosBenefit: '28g Clean Protein & Iodine' },
      { item: 'Crisp Romaine Lettuce Leaves (as taco shells)', amount: '4 large leaves', pcosBenefit: 'Zero-Carb Shell' },
      { item: 'Ripe Avocado blended with Lime, Garlic & Coriander', amount: '3 tbsp', pcosBenefit: 'Healthy Fat Dressing' },
      { item: 'Diced Tomatoes & Red Cabbage Slaw', amount: '1/2 cup', pcosBenefit: 'Anthocyanins' }
    ],
    instructions: [
      'Season fish with cumin, smoked paprika, garlic powder, sea salt, and lime juice.',
      'Pan-sear in 1/2 tsp olive oil for 3-4 minutes per side until flakey and golden.',
      'Flake fish into large chunks and distribute into crisp romaine lettuce leaves.',
      'Top with red cabbage slaw and a generous drizzle of avocado-cilantro crema.'
    ],
    proTips: ['Using romaine leaves as shells saves 40g refined carbs compared to flour tortillas.'],
    tags: ['Grain-Free', 'Low-Carb', 'High-Protein']
  },
  {
    id: 'rec_di_chicken_spinach_millet_roti',
    name: 'Homestyle Palak (Spinach) Chicken with 1 Warm Jowar Roti & Radish Salad',
    nameTe: 'పాలక్ చికెన్ & జొన్న రొట్టె (ముల్లంగి సలాడ్‌తో)',
    tagline: 'Classic iron-rich spinach and tender chicken breast pairing with sorghum flatbread',
    taglineTe: 'ఐరన్ మరియు ప్రొటీన్ అధికంగా ఉండే పాలక్ చికెన్ రాత్రి భోజనం',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 12,
    cookTimeMinutes: 16,
    servings: 2,
    calories: 360,
    proteinGrams: 30,
    carbsGrams: 28,
    fatGrams: 12,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Spinach magnesium calms nocturnal adrenal cortisol surges.',
      'Chicken breast zinc accelerates ovarian cellular repair.',
      'Jowar flour is gluten-free and has a slow glucose release.'
    ],
    ingredients: [
      { item: 'Boneless Skinless Chicken Breast (diced)', amount: '180g', pcosBenefit: '30g Protein' },
      { item: 'Fresh Spinach Purée (blanched with ginger & chili)', amount: '2 cups', pcosBenefit: 'Magnesium & Folate' },
      { item: 'Spiced Onion-Tomato-Garlic Base with 1 tsp Ghee', amount: '1/2 cup', pcosBenefit: 'Allicin & Ghee Lipids' },
      { item: 'Jowar (Sorghum) Roti', amount: '1 fresh roti', pcosBenefit: 'Gluten-Free Low-GI Carb' }
    ],
    instructions: [
      'Sauté ginger-garlic paste and onions in 1 tsp ghee until golden.',
      'Add chicken cubes, turmeric, coriander, and garam masala; sear for 5 minutes.',
      'Pour in vibrant spinach purée and 1/4 cup water; simmer for 8 minutes until chicken is tender.',
      'Serve warm with 1 freshly rolled jowar roti and fresh sliced radish on the side.'
    ],
    proTips: ['Spinach combined with animal protein maximizes the bio-absorption of dietary iron.'],
    tags: ['Iron-Rich', 'Desi-Classic', 'Gluten-Free']
  },
  {
    id: 'rec_di_turkey_chicken_bowl',
    name: 'Minced Chicken / Turkey & Zucchini Stir-Fry Bowl with Cauliflower Rice & Sesame',
    nameTe: 'చికెన్ / టర్కీ & జుకిని స్టిర్-ఫ్రై (క్యాలీఫ్లవర్ రైస్‌తో)',
    tagline: 'High-tryptophan lean mince that primes serotonin and melatonin for deep sleep',
    taglineTe: 'మంచి నిద్రకు మరియు బరువు నియంత్రణకు చికెన్ జుకిని డిన్నర్ బౌల్',
    mealType: 'dinner',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 1,
    calories: 330,
    proteinGrams: 32,
    carbsGrams: 14,
    fatGrams: 14,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Turkey / Chicken mince contains high bioavailable Tryptophan, the direct amino acid precursor to melatonin.',
      'Toasted sesame seeds provide zinc and calcium.',
      'Cauliflower rice minimizes carbohydrate load.'
    ],
    ingredients: [
      { item: 'Lean Minced Chicken or Turkey Breast', amount: '160g', pcosBenefit: '32g Protein & Tryptophan' },
      { item: 'Diced Zucchini, Bell Peppers & Snap Peas', amount: '1.5 cups', pcosBenefit: 'Vitamins & Fiber' },
      { item: 'Steamed Cauliflower Rice', amount: '1 cup', pcosBenefit: 'I3C Low-Carb Base' },
      { item: 'Ginger, Tamari Soy Sauce & Toasted Sesame Seeds', amount: '1 tbsp', pcosBenefit: 'Zinc & Healthy Fats' }
    ],
    instructions: [
      'Heat 1/2 tsp sesame oil in a wok, stir-fry minced chicken/turkey with minced ginger and garlic for 5 minutes.',
      'Add diced zucchini, snap peas, and tamari sauce; flash-fry for 3 minutes.',
      'Spoon over warm steamed cauliflower rice and sprinkle with toasted sesame seeds and chili flakes.'
    ],
    proTips: ['Eating tryptophan-rich poultry at dinner enhances nighttime melatonin production.'],
    tags: ['High-Protein', 'Deep-Sleep', 'Low-Carb']
  },
  {
    id: 'rec_di_spiced_mutton_bone_broth',
    name: 'Slow-Cooked Spiced Bone Broth Soup with Shredded Chicken & Steamed Foxtail Millet',
    nameTe: 'స్పైస్డ్ బోన్ బ్రాత్ సూప్ & కొర్రల అన్నం',
    tagline: 'Weekend deep nourishment rich in bioavailable collagen, glycine, and anti-inflammatory marrow minerals',
    taglineTe: 'గట్ ఆరోగ్యం మరియు శరీర పుష్టికి బోన్ బ్రాత్ & కొర్రల భోజనం',
    mealType: 'dinner',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    calories: 340,
    proteinGrams: 28,
    carbsGrams: 26,
    fatGrams: 12,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Slow-simmered bone broth provides glycine to calm central nervous system and optimize liver glutathione.',
      'Marrow minerals (magnesium, phosphorus, calcium) nourish bone density.',
      'Foxtail millet provides low-GI complex carbohydrate pairing.'
    ],
    ingredients: [
      { item: 'Rich Simmered Bone Broth with Shredded Chicken', amount: '2 cups + 100g chicken', pcosBenefit: 'Glycine Collagen & Protein' },
      { item: 'Black Pepper, Ginger, Garlic, Cinnamon & Cloves', amount: '1 tbsp', pcosBenefit: 'Metabolic Aromatics' },
      { item: 'Steamed Foxtail Millet (Korralu)', amount: '1/3 cup cooked', pcosBenefit: 'Low-GI Complex Carb' },
      { item: 'Fresh Lemon Juice & Coriander', amount: 'To taste', pcosBenefit: 'Vitamin C' }
    ],
    instructions: [
      'Simmer rich bone broth with crushed ginger, garlic, peppercorns, and cinnamon for 10 minutes.',
      'Add shredded chicken and season with sea salt and fresh lemon juice.',
      'Serve warm in deep bowls alongside a side of steamed foxtail millet.'
    ],
    proTips: ['Glycine in bone broth stimulates sleep by naturally lowering core body temperature.'],
    tags: ['Collagen-Rich', 'Gut-Healing', 'Weekend-Nourishment']
  }
];
