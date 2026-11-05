import { RecipeItem } from '../types';

export const SNACK_RECIPES: RecipeItem[] = [
  // ============================================================
  // EVENING SNACKS (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_es_spiced_makhana',
    name: 'Turmeric-Roasted Foxnut (Phool Makhana) with Spearmint Tea',
    nameTe: 'పసుపు వేయించిన తామర గింజలు (పూల్ మఖానా) & స్పియర్‌మింట్ టీ',
    tagline: 'Crunchy, ultra-low calorie snack loaded with magnesium and anti-androgenic menthol',
    taglineTe: 'టెస్టోస్టెరాన్ తగ్గించే స్పియర్‌మింట్ టీ & వేయించిన మఖానా',
    mealType: 'evening_snack',
    cravingType: 'crunchy',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 135,
    proteinGrams: 4,
    carbsGrams: 18,
    fatGrams: 5,
    fiberGrams: 3,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Foxnuts (Makhana) are rich in Kaempferol, a flavonoid that reduces cellular aging in ovaries.',
      'High magnesium soothes evening cortisol elevation.',
      'Spearmint tea is clinically proven to reduce total testosterone and hirsutism.'
    ],
    ingredients: [
      { item: 'Raw Phool Makhana (Foxnuts)', amount: '1.5 cups', pcosBenefit: 'Kaempferol & Magnesium' },
      { item: 'Cold-Pressed Olive Oil or Ghee', amount: '1/2 tsp', pcosBenefit: 'Healthy Fat' },
      { item: 'Turmeric, Chaat Masala & Rock Salt', amount: '1/2 tsp', pcosBenefit: 'Anti-Inflammatory Seasoning' },
      { item: 'Organic Spearmint Herbal Tea', amount: '1 freshly brewed cup', pcosBenefit: 'Anti-Androgenic Menthol' }
    ],
    instructions: [
      'Dry-roast makhana in a heavy pan on low heat for 4-5 minutes until super crispy.',
      'Drizzle 1/2 tsp ghee/oil, toss with turmeric, rock salt, and chaat masala.',
      'Brew 1 cup spearmint tea and enjoy together as a mindful 5 PM snack.'
    ],
    proTips: ['Drinking spearmint tea twice daily for 30 consecutive days significantly lowers clinical hirsutism scores.'],
    tags: ['Crunchy', 'Anti-Androgen', 'Quick 5-Min']
  },
  {
    id: 'rec_es_spearmint_tea_walnuts',
    name: 'Brewed Spearmint Tea with 4 Soaked Raw Walnuts & 2 Brazil Nuts',
    nameTe: 'స్పియర్‌మింట్ టీ & నానబెట్టిన వాల్‌నట్లు (బ్రెజిల్ నట్స్)',
    tagline: 'Rich plant Omega-3s and pure organic selenium to support thyroid-ovarian axis',
    taglineTe: 'థైరాయిడ్ మరియు అండాశయ ఆరోగ్యానికి వాల్‌నట్లు & స్పియర్‌మింట్ టీ',
    mealType: 'evening_snack',
    cravingType: 'hot',
    preference: 'vegan',
    prepTimeMinutes: 3,
    cookTimeMinutes: 3,
    servings: 1,
    calories: 145,
    proteinGrams: 4,
    carbsGrams: 3,
    fatGrams: 14,
    fiberGrams: 2,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Brazil nuts are the #1 source of selenium, essential for converting thyroid T4 to active T3.',
      'Walnuts boost SHBG (Sex Hormone-Binding Globulin) to lock up excess free testosterone.',
      'Spearmint blocks ovarian 5-alpha reductase.'
    ],
    ingredients: [
      { item: 'Organic Dried Spearmint Leaves', amount: '1 tbsp', pcosBenefit: 'Anti-Androgen Phenolics' },
      { item: 'Raw Shelled Walnuts (soaked 2 hrs)', amount: '4 walnut halves', pcosBenefit: 'Omega-3 ALA & SHBG' },
      { item: 'Raw Brazil Nuts', amount: '2 nuts', pcosBenefit: '100% Daily Selenium' }
    ],
    instructions: [
      'Steep spearmint leaves in boiling water for 5 minutes; strain into a cup.',
      'Eat the soaked walnuts and Brazil nuts alongside the hot tea.'
    ],
    proTips: ['Just 2 Brazil nuts provide over 150mcg selenium — never exceed 3 to prevent selenium excess.'],
    tags: ['Thyroid-Support', 'Anti-Androgen', 'Zero-Prep']
  },
  {
    id: 'rec_es_roasted_edamame_tea',
    name: 'Spiced Roasted Edamame (Green Soybeans) & Green Matcha Tea',
    nameTe: 'వేయించిన ఎడమామె (గ్రీన్ సోయా) & గ్రీన్ టీ',
    tagline: 'High-protein plant crunch with EGCG green tea catechins to boost fat oxidation',
    taglineTe: 'మెటబాలిజం పెంచే ఎడమామె & గ్రీన్ టీ స్నాక్',
    mealType: 'evening_snack',
    cravingType: 'crunchy',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 140,
    proteinGrams: 11,
    carbsGrams: 9,
    fatGrams: 6,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '11g clean plant protein keeps blood sugar completely level until dinner.',
      'Green tea EGCG catechins improve peripheral insulin sensitivity and metabolic rate.'
    ],
    ingredients: [
      { item: 'Roasted Salted Organic Edamame', amount: '1/3 cup', pcosBenefit: '11g Plant Protein & Isoflavones' },
      { item: 'Pure Ceremonial Matcha or Green Tea', amount: '1 cup', pcosBenefit: 'EGCG Catechins' },
      { item: 'Lemon Slices', amount: '1 slice', pcosBenefit: 'Boosts EGCG Absorption 4x' }
    ],
    instructions: [
      'Toss dry-roasted edamame with a pinch of sea salt and chili flakes.',
      'Whisk matcha powder into hot (not boiling) water with a squeeze of fresh lemon.'
    ],
    proTips: ['Adding lemon juice to green tea boosts catechin antioxidant absorption up to four-fold.'],
    tags: ['High-Protein', 'Metabolism-Boost', 'Crunchy']
  },
  {
    id: 'rec_es_roasted_chana_masala',
    name: 'Crunchy Roasted Black Chana (Bhuna Chana) with Green Mint Chutney & Spearmint Tea',
    nameTe: 'వేయించిన గుగ్గిళ్ళు (భునా చనా) & పుదీనా చట్నీ',
    tagline: 'Traditional high-fiber, low-calorie desi crunch that crushes evening hunger pangs',
    taglineTe: 'సాయంత్రం ఆకలిని తీర్చే సంప్రదాయ భునా చనా స్నాక్',
    mealType: 'evening_snack',
    cravingType: 'crunchy',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 130,
    proteinGrams: 7,
    carbsGrams: 18,
    fatGrams: 3,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Roasted Bengal gram (Bhuna Chana) provides resistant starch and insoluble fiber.',
      'Fresh mint dip supplies rosmarinic acid to fight ovarian inflammation.'
    ],
    ingredients: [
      { item: 'Skin-On Roasted Bengal Gram (Bhuna Chana)', amount: '1/3 cup', pcosBenefit: '7g Protein & 6g Fiber' },
      { item: 'Fresh Mint-Coriander Chutney (no sugar)', amount: '1 tbsp', pcosBenefit: 'Rosmarinic Acid' },
      { item: 'Hot Spearmint Herbal Tea', amount: '1 cup', pcosBenefit: 'Anti-Androgen' }
    ],
    instructions: [
      'Toss bhuna chana with a pinch of chaat masala and black salt.',
      'Dip into freshly made mint chutney and sip warm spearmint tea.'
    ],
    proTips: ['Bhuna chana with skin has an exceptionally low glycemic load (GL < 6).'],
    tags: ['Desi-Classic', 'High-Fiber', 'No-Cook']
  },
  {
    id: 'rec_es_cacao_avocado_pudding',
    name: 'Raw Cacao & Avocado Chocolate Cream Cup with Hemp Seeds',
    nameTe: 'రా కాకో & అవకాడో చాక్లెట్ కప్ (హెంప్ గింజలతో)',
    tagline: 'Satisfies intense chocolate and sweet cravings with 0g refined sugar and pure magnesium',
    taglineTe: 'చాక్లెట్ కోరికలను తీర్చే సహజమైన మెగ్నీషియం డెజర్ట్',
    mealType: 'evening_snack',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 165,
    proteinGrams: 5,
    carbsGrams: 10,
    fatGrams: 13,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Raw organic cacao is the #1 food source of magnesium to relax vascular smooth muscle.',
      'Avocado fats slow gastric emptying, preventing insulin spikes.',
      'Hemp seeds provide complete plant amino acids.'
    ],
    ingredients: [
      { item: 'Ripe Avocado', amount: '1/2 medium', pcosBenefit: 'Healthy Hormone Fats' },
      { item: 'Raw Unsweetened Cacao Powder', amount: '1.5 tbsp', pcosBenefit: 'Magnesium & Theobromine' },
      { item: 'Unsweetened Almond Milk & Stevia/Monkfruit', amount: '2 tbsp + 2 drops', pcosBenefit: 'Zero Glycemic Sweetener' },
      { item: 'Hemp Seeds', amount: '1 tsp sprinkle', pcosBenefit: 'Complete Protein & GLA' }
    ],
    instructions: [
      'Blend avocado, cacao powder, almond milk, and stevia in a small blender until ultra creamy.',
      'Scoop into a glass cup, top with hemp seeds and a pinch of sea salt, and enjoy chilled.'
    ],
    proTips: ['Theobromine in cacao elevates dopamine naturally without the cortisol spike of coffee.'],
    tags: ['Sweet-Craving', 'Chocoholic', 'Magnesium-Rich']
  },
  {
    id: 'rec_es_chia_lemon_cooler',
    name: 'Hydrating Chia Seed Lemon Mint Cooler with Handful of Roasted Almonds',
    nameTe: 'చియా లెమన్ కూలర్ & వేయించిన బాదం పప్పులు',
    tagline: 'Cooling soluble fiber hydration that sweeps away intestinal sluggishness',
    taglineTe: 'శరీరాన్ని చల్లబరిచే చియా నిమ్మకాయ డ్రింక్ & బాదం పప్పులు',
    mealType: 'evening_snack',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 145,
    proteinGrams: 5,
    carbsGrams: 8,
    fatGrams: 11,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Chia seed mucilage forms a protective gel in the gut, binding recirculating estrogen.',
      'Almonds deliver Vitamin E to protect ovarian cell membranes.'
    ],
    ingredients: [
      { item: 'Chia Seeds (soaked in 1 cup water)', amount: '1 tbsp', pcosBenefit: 'Soluble Gel Fiber' },
      { item: 'Fresh Lemon Juice & Crushed Mint', amount: '1 tbsp + 5 leaves', pcosBenefit: 'Vitamin C & Flavor' },
      { item: 'Dry-Roasted Almonds', amount: '8-10 nuts', pcosBenefit: 'Vitamin E & Magnesium' }
    ],
    instructions: [
      'Stir chia seeds into water and let sit for 10 minutes until gel-like.',
      'Stir in fresh lemon juice, crushed mint, and a pinch of rock salt.',
      'Sip the cooler while enjoying roasted almonds.'
    ],
    proTips: ['Chia gel slows carbohydrate digestion by forming an insoluble matrix in the duodenum.'],
    tags: ['Hydration', 'Cooling', 'Anti-Bloat']
  },
  {
    id: 'rec_es_cucumber_hummus_bites',
    name: 'Crisp Cucumber & Bell Pepper Slices with Garlic Herb Hummus',
    nameTe: 'దోసకాయ ముక్కలు & గార్లిక్ హుమ్ముస్ డిప్',
    tagline: 'Hydrating, crunchy Mediterranean snack loaded with allicin, zinc, and dietary fiber',
    taglineTe: 'రుచికరమైన మరియు తేలికైన దోసకాయ హుమ్ముస్ స్నాక్',
    mealType: 'evening_snack',
    cravingType: 'crunchy',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 125,
    proteinGrams: 5,
    carbsGrams: 14,
    fatGrams: 6,
    fiberGrams: 4,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Tahini (sesame paste) in hummus provides lignans (sesamin) that support estrogen balance.',
      'Garlic allicin improves microvascular blood flow.',
      'Cucumbers provide 95% water and silica for skin hydration.'
    ],
    ingredients: [
      { item: 'Homemade Chickpea-Tahini Hummus', amount: '3 tbsp', pcosBenefit: 'Sesamin Lignans & Zinc' },
      { item: 'Sliced English Cucumbers & Bell Peppers', amount: '1.5 cups', pcosBenefit: 'Hydration & Vitamin C' },
      { item: 'Extra Virgin Olive Oil & Paprika Dust', amount: '1/2 tsp', pcosBenefit: 'Polyphenols' }
    ],
    instructions: [
      'Slice fresh cucumbers and bell peppers into dipping batons.',
      'Spoon hummus into a ramekin, drizzle olive oil and paprika, and dip veggies generously.'
    ],
    proTips: ['Sesame lignans in tahini synergize with chickpea fiber to balance estrogen:progesterone ratios.'],
    tags: ['Mediterranean', 'No-Cook', 'Low-Calorie']
  }
];
