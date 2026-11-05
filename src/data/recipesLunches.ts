import { RecipeItem } from '../types';

export const LUNCH_RECIPES: RecipeItem[] = [
  // ============================================================
  // VEGETARIAN LUNCHES (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_lu_quinoa_chickpea_bowl',
    name: 'Mediterranean Spiced Chickpea & Rainbow Quinoa Harvest Bowl',
    nameTe: 'మసాలా శనగలు & క్వినోవా సలాడ్ బౌల్',
    tagline: 'Balanced 40-30-30 macro plate packed with magnesium, folate, and sustained energy',
    taglineTe: 'మెగ్నీషియం మరియు ఫోలేట్ అధికంగా ఉండే క్వినోవా శనగల భోజనం',
    mealType: 'lunch',
    cravingType: 'comfort',
    preference: 'vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 380,
    proteinGrams: 16,
    carbsGrams: 48,
    fatGrams: 12,
    fiberGrams: 12,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Quinoa is a complete plant protein containing all 9 essential amino acids.',
      'Chickpeas provide resistant starch that feeds gut Bifidobacteria to optimize estrogen excretion.',
      'Cucumbers, cherry tomatoes, and kalamata olives deliver antioxidant polyphenols.'
    ],
    ingredients: [
      { item: 'Cooked Tricolor Quinoa', amount: '1 cup', pcosBenefit: 'Complete Amino Acids' },
      { item: 'Boiled Kabuli Chana (Chickpeas)', amount: '1 cup', pcosBenefit: 'Resistant Starch & Folate' },
      { item: 'Diced Cucumbers, Tomatoes & Red Onions', amount: '1 cup mixed', pcosBenefit: 'Hydration & Quercetin' },
      { item: 'Crumbled Feta or Tofu Cubes', amount: '2 tbsp', pcosBenefit: 'Healthy Fat & Zinc' },
      { item: 'Extra Virgin Olive Oil & Lemon Dressing', amount: '1.5 tbsp', pcosBenefit: 'Anti-Inflammatory Dressing' }
    ],
    instructions: [
      'Layer cooked quinoa in a bowl with boiled chickpeas, cucumbers, and tomatoes.',
      'Whisk olive oil, lemon juice, minced garlic, oregano, and black pepper into a vinaigrette.',
      'Drizzle dressing over the bowl, toss lightly, and top with crumbled feta or tofu and fresh parsley.'
    ],
    proTips: ['Boiling chickpeas with a pinch of cumin ensures easy, bloat-free digestion.'],
    tags: ['Mediterranean', 'High-Fiber', 'Meal-Prep-Friendly']
  },
  {
    id: 'rec_lu_methi_dal_brown_rice',
    name: 'Andhra-Style Methi Moong Dal with Brown Basmati & Cucumber Raita',
    nameTe: 'ఆంధ్రా మెంతి పప్పు & బ్రౌన్ రైస్ (దోసకాయ రైతాతో)',
    tagline: 'Fenugreek leaves regulate insulin sensitivity while yellow moong supports liver cleansing',
    taglineTe: 'ఇన్సులిన్ సున్నితత్వాన్ని పెంచే మెంతి పప్పు భోజనం',
    mealType: 'lunch',
    cravingType: 'spicy',
    preference: 'south_indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    calories: 395,
    proteinGrams: 17,
    carbsGrams: 52,
    fatGrams: 10,
    fiberGrams: 11,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Fenugreek (Methi) contains 4-hydroxyisoleucine, clinically proven to increase insulin sensitivity.',
      'Brown basmati rice provides slow glucose release, preventing afternoon lethargy.',
      'Cucumber raita restores gut estrogen-metabolizing estrobolome.'
    ],
    ingredients: [
      { item: 'Split Yellow Moong Dal or Toor Dal', amount: '3/4 cup', pcosBenefit: 'Clean Plant Protein' },
      { item: 'Fresh Fenugreek (Methi) Leaves', amount: '2 cups packed', pcosBenefit: 'Insulin Sensitizer 4-HIL' },
      { item: 'Tomatoes, Garlic & Ghee Tempering', amount: '2 tomatoes + 4 cloves', pcosBenefit: 'Lycopene & Allicin' },
      { item: 'Cooked Brown Basmati Rice', amount: '1/2 cup cooked', pcosBenefit: 'Low-GI Complex Carb' },
      { item: 'A2 Curd Cucumber Raita with Roasted Cumin', amount: '1/2 cup', pcosBenefit: 'Probiotics' }
    ],
    instructions: [
      'Pressure cook moong dal, methi leaves, tomatoes, turmeric, and garlic for 3 whistles.',
      'Mash gently, add rock salt, and temper with 1 tsp ghee, mustard seeds, cumin, and hing.',
      'Serve warm with a measured portion of brown basmati rice and a generous bowl of cucumber raita.'
    ],
    proTips: ['Eat the cucumber raita and methi dal first before the rice to blunt glucose absorption by up to 40%.'],
    tags: ['South-Indian', 'Traditional', 'High-Protein', 'Gut-Friendly']
  },
  {
    id: 'rec_lu_kala_chana_salad',
    name: 'High-Protein Kala Chana (Black Chickpea) & Sautéed Broccoli Super-Salad',
    nameTe: 'నల్ల శనగలు & బ్రకోలీ ప్రోటీన్ సలాడ్',
    tagline: 'Iron-dense black chickpeas paired with indole-3-carbinol cruciferous broccoli',
    taglineTe: 'ఐరన్ మరియు హార్మోన్ల శుద్ధికి నల్ల శనగల పోషకాహారం',
    mealType: 'lunch',
    cravingType: 'crunchy',
    preference: 'vegetarian',
    prepTimeMinutes: 12,
    cookTimeMinutes: 10,
    servings: 2,
    calories: 370,
    proteinGrams: 18,
    carbsGrams: 46,
    fatGrams: 11,
    fiberGrams: 14,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Black chickpeas have an exceptionally low glycemic index (GI 28) and 14g fiber.',
      'Broccoli sulforaphane activates Nrf2 pathway to protect ovarian cells from oxidative stress.',
      'Lemon-mustard dressing enhances non-heme iron absorption.'
    ],
    ingredients: [
      { item: 'Boiled Kala Chana (Black Chickpeas)', amount: '1.5 cups', pcosBenefit: 'Ultra Low GI & Iron' },
      { item: 'Steamed Broccoli Florets', amount: '1 cup', pcosBenefit: 'Indole-3-Carbinol & Sulforaphane' },
      { item: 'Diced Red Bell Peppers & Onions', amount: '1/2 cup', pcosBenefit: 'Vitamin C & Quercetin' },
      { item: 'Cold-Pressed Mustard Oil & Lemon Dressing', amount: '1 tbsp', pcosBenefit: 'Omega-3 ALA Dressing' }
    ],
    instructions: [
      'In a large bowl, combine boiled black chickpeas, steamed tender-crisp broccoli, and red peppers.',
      'Whisk cold-pressed mustard or olive oil with fresh lemon juice, roasted cumin, and black salt.',
      'Toss well, garnish with roasted sunflower seeds, and enjoy fresh.'
    ],
    proTips: ['Kala chana has twice the insoluble fiber of regular white chickpeas.'],
    tags: ['Iron-Dense', 'Cruciferous-Detox', 'Ultra-Low-GI']
  },
  {
    id: 'rec_lu_paneer_fajita_bowl',
    name: 'Sautéed Paneer & Bell Pepper Fajita Bowl with Brown Rice Pilaf',
    nameTe: 'పనీర్ & క్యాప్సికమ్ ఫజితా రైస్ బౌల్',
    tagline: 'High-calcium paneer strips seared with antioxidant-rich tricolor bell peppers',
    taglineTe: 'క్యాల్షియం మరియు ప్రొటీన్ అధికంగా ఉండే పనీర్ క్యాప్సికమ్ భోజనం',
    mealType: 'lunch',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    calories: 410,
    proteinGrams: 20,
    carbsGrams: 42,
    fatGrams: 16,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'A2 paneer supplies 20g clean bioavailable protein to preserve lean metabolic muscle mass.',
      'Tricolor bell peppers provide 250% RDA of Vitamin C.',
      'Guacamole topping provides monounsaturated fatty acids for progesterone synthesis.'
    ],
    ingredients: [
      { item: 'Fresh Low-Fat Paneer Strips', amount: '150g', pcosBenefit: '20g Protein & Calcium' },
      { item: 'Tricolor Bell Peppers & Sliced Red Onions', amount: '1.5 cups', pcosBenefit: 'Antioxidants & Quercetin' },
      { item: 'Cooked Brown Rice Pilaf with Cumin', amount: '1/2 cup', pcosBenefit: 'Slow Release Energy' },
      { item: 'Fresh Guacamole or Sliced Avocado', amount: '2 tbsp', pcosBenefit: 'Healthy Hormone Fats' }
    ],
    instructions: [
      'Heat 1 tsp olive oil in a skillet, sear paneer strips with fajita spices (cumin, paprika, coriander) for 3 minutes.',
      'Add sliced bell peppers and onions; flash-fry for 3 minutes so they stay crisp.',
      'Assemble bowl with brown rice base, top with fajita vegetables, paneer, and a scoop of fresh guacamole.'
    ],
    proTips: ['High protein with healthy fats prevents afternoon insulin crashes.'],
    tags: ['High-Protein', 'Mexican-Spiced', 'Calcium-Rich']
  },
  {
    id: 'rec_lu_rajma_avocado_quinoa',
    name: 'Slow-Cooked Rajma (Kidney Beans) & Sweet Corn Bowl with Avocado Dressing and Steamed Quinoa',
    nameTe: 'రాజ్మా & క్వినోవా అవకాడో లంచ్ బౌల్',
    tagline: 'Resistant starch and potassium powerhouse for blood pressure and hormone stabilization',
    taglineTe: 'పొటాషియం మరియు పీచు సమృద్ధిగా ఉండే రాజ్మా క్వినోవా భోజనం',
    mealType: 'lunch',
    cravingType: 'comfort',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 390,
    proteinGrams: 17,
    carbsGrams: 50,
    fatGrams: 11,
    fiberGrams: 13,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Kidney beans contain alpha-amylase inhibitors that slow carbohydrate breakdown.',
      'High dietary potassium balances sodium and reverses fluid retention in PCOS.',
      'Avocado fats assist assimilation of fat-soluble vitamins.'
    ],
    ingredients: [
      { item: 'Slow-Cooked Rajma (Red Kidney Beans)', amount: '1 cup', pcosBenefit: 'Alpha-Amylase Inhibitors' },
      { item: 'Steamed Tricolor Quinoa', amount: '1/2 cup', pcosBenefit: 'Complete Protein Grain' },
      { item: 'Sweet Corn & Diced Tomatoes', amount: '1/2 cup', pcosBenefit: 'Lutein & Lycopene' },
      { item: 'Creamy Avocado-Cilantro Lime Dressing', amount: '2 tbsp', pcosBenefit: 'Heart-Healthy Fats' }
    ],
    instructions: [
      'Layer steamed quinoa and warm spiced rajma in a bowl.',
      'Top with sweet corn, cherry tomatoes, and shredded romaine lettuce.',
      'Drizzle creamy avocado-cilantro dressing over the top and enjoy warm.'
    ],
    proTips: ['Soaking rajma for 12 hours with a piece of ginger neutralizes lectins.'],
    tags: ['Potassium-Rich', 'High-Fiber', 'Comfort-Food']
  },
  {
    id: 'rec_lu_soya_matar_phulka',
    name: 'High-Protein Soya Chunk / Tofu & Green Peas Curry with 2 Whole Wheat Phulkas & Radish Salad',
    nameTe: 'సోయా మటర్ కర్రీ & ఫుల్కా (ముల్లంగి సలాడ్‌తో)',
    tagline: 'Isoflavone-rich plant protein that gently balances estrogen receptor expression',
    taglineTe: 'హార్మోన్ల సమతుల్యత కోసం అధిక ప్రొటీన్ సోయా మటర్ కర్రీ',
    mealType: 'lunch',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 400,
    proteinGrams: 22,
    carbsGrams: 48,
    fatGrams: 10,
    fiberGrams: 11,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Organic whole soya isoflavones act as selective estrogen receptor modulators.',
      'Green peas provide zinc and B-vitamins for metabolic energy.',
      'Sliced radish provides sulfur compounds for phase-2 liver detox.'
    ],
    ingredients: [
      { item: 'Boiled Organic Soya Chunks or Tofu', amount: '1 cup', pcosBenefit: '22g Plant Protein' },
      { item: 'Tender Green Peas', amount: '1/2 cup', pcosBenefit: 'Zinc & Vitamin B1' },
      { item: 'Tomato-Onion-Ginger Spiced Gravy', amount: '1 cup', pcosBenefit: 'Lycopene & Gingerol' },
      { item: 'Whole Wheat / Multi-Millet Phulkas (oil-free)', amount: '2 phulkas', pcosBenefit: 'Complex Carbs' },
      { item: 'Fresh Sliced White Radish with Lemon', amount: '1/2 cup', pcosBenefit: 'Sulfur Detox' }
    ],
    instructions: [
      'Sauté ginger-garlic paste, onions, and tomato purée with turmeric, coriander, and garam masala.',
      'Add boiled soya chunks and green peas with 1 cup water; simmer for 8 minutes until rich and thick.',
      'Serve with 2 oil-free warm phulkas and fresh radish salad on the side.'
    ],
    proTips: ['Always choose whole organic non-GMO soya for natural phytonutrients.'],
    tags: ['High-Protein', 'Desi-Classic', 'Liver-Detox']
  },
  {
    id: 'rec_lu_cauliflower_biryani',
    name: 'Spiced Cauliflower & Aged Brown Rice Dum Biryani with Cucumber Pomegranate Raita',
    nameTe: 'కాలీఫ్లవర్ & బ్రౌన్ రైస్ దమ్ బిర్యానీ (రైతాతో)',
    tagline: 'Satisfies weekend biryani cravings with half the carbs and 3x the hormone-balancing crucifers',
    taglineTe: 'రుచికరమైన మరియు ఆరోగ్యకరమైన PCOS-ఫ్రెండ్లీ దమ్ బిర్యానీ',
    mealType: 'lunch',
    cravingType: 'special',
    preference: 'vegetarian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    servings: 3,
    calories: 340,
    proteinGrams: 12,
    carbsGrams: 44,
    fatGrams: 10,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Cruciferous cauliflower provides Indole-3-Carbinol (I3C) to support liver estrogen detoxification.',
      'Saffron and whole spices contain antioxidants that improve ovarian blood flow.',
      'Brown rice combined with abundant vegetables halves the glycemic impact.'
    ],
    ingredients: [
      { item: 'Cauliflower Florets & Mushrooms/Paneer', amount: '2 cups', pcosBenefit: 'I3C & Selenium' },
      { item: 'Aged Brown Basmati Rice', amount: '1 cup', pcosBenefit: 'Low-GI Grain' },
      { item: 'Fresh Mint, Coriander & Saffron Almond Milk', amount: '1 cup', pcosBenefit: 'Aromatics & Nitric Oxide' },
      { item: 'A2 Yogurt (Curd) Marinade with Biryani Spices', amount: '1/2 cup', pcosBenefit: 'Probiotics' }
    ],
    instructions: [
      'Marinate cauliflower, mushrooms, and paneer in spiced curd with fresh mint for 20 minutes.',
      'Par-cook brown basmati rice with whole spices (cardamom, clove, cinnamon) until 80% done.',
      'Layer marinated veggies and rice in a heavy pot, drizzle saffron milk, seal lid and slow-cook (Dum) for 15 minutes.',
      'Serve with chilled cucumber-pomegranate raita.'
    ],
    proTips: ['Pairing cauliflower with saffron protects ovarian follicle beds against free-radical damage.'],
    tags: ['Special', 'Weekend-Feast', 'Cruciferous']
  },

  // ============================================================
  // NON-VEGETARIAN LUNCHES (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_lu_herb_grilled_salmon_chicken',
    name: 'Garlic-Herb Grilled Salmon / Lemon Chicken Breast with Sautéed Asparagus & Quinoa',
    nameTe: 'గార్లిక్ హెర్బ్ సాల్మన్ / చికెన్ బ్రెస్ట్ (అస్పరాగస్‌తో)',
    tagline: 'High-potency EPA/DHA Omega-3s that slash androgen levels and ovarian inflammation',
    taglineTe: 'టెస్టోస్టెరాన్ తగ్గించడానికి ఒమేగా-3 సాల్మన్ / చికెన్ భోజనం',
    mealType: 'lunch',
    cravingType: 'special',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 410,
    proteinGrams: 34,
    carbsGrams: 18,
    fatGrams: 20,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Wild salmon provides 2,000mg EPA/DHA Omega-3s proven to reduce androgen synthesis.',
      'Asparagus is rich in glutathione, the master antioxidant for ovarian detoxification.',
      '34g complete protein boosts metabolic rate.'
    ],
    ingredients: [
      { item: 'Wild Alaskan Salmon Fillet or Chicken Breast', amount: '150g', pcosBenefit: 'Pure Protein & EPA/DHA' },
      { item: 'Fresh Asparagus Spears', amount: '6-8 spears', pcosBenefit: 'Glutathione & Inulin' },
      { item: 'Cooked Quinoa', amount: '1/3 cup', pcosBenefit: 'Low-GI Complex Carb' },
      { item: 'Minced Garlic, Rosemary, Olive Oil & Lemon', amount: '1 tbsp', pcosBenefit: 'Anti-Microbial' }
    ],
    instructions: [
      'Marinate salmon or chicken breast with olive oil, garlic, rosemary, sea salt, black pepper, and lemon zest for 10 minutes.',
      'Grill on medium-high for 4-5 minutes per side until cooked through and flaky.',
      'Sauté asparagus in the same pan for 3 minutes until tender-crisp.',
      'Serve alongside steamed quinoa and fresh lemon wedges.'
    ],
    proTips: ['Eating fatty fish 2-3 times weekly reduces serum testosterone and LH excess in PCOS.'],
    tags: ['High-Protein', 'Omega-3-Rich', 'Special']
  },
  {
    id: 'rec_lu_andhra_chicken_curry',
    name: 'Andhra-Style Homestyle Chicken Curry (Low-Oil) with Brown Basmati Rice & Cucumber Raita',
    nameTe: 'ఆంధ్రా చికెన్ కర్రీ & బ్రౌన్ రైస్ (దోసకాయ రైతాతో)',
    tagline: 'Lean poultry protein slow-cooked with fresh ginger, garlic, and whole whole spices',
    taglineTe: 'జింక్ మరియు ప్రొటీన్ సమృద్ధిగా ఉండే ఆంధ్రా చికెన్ భోజనం',
    mealType: 'lunch',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 12,
    cookTimeMinutes: 20,
    servings: 2,
    calories: 420,
    proteinGrams: 32,
    carbsGrams: 40,
    fatGrams: 12,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Skinless chicken breast delivers high bioavailable zinc and niacin (B3).',
      'Turmeric, ginger, and coriander in Andhra curry paste suppress systemic inflammatory prostaglandins.',
      'Cucumber raita provides probiotic cooling balance.'
    ],
    ingredients: [
      { item: 'Skinless Chicken Breast Cubes', amount: '200g', pcosBenefit: '32g Lean Protein' },
      { item: 'Fresh Ginger-Garlic Paste, Onions & Tomatoes', amount: '1 cup', pcosBenefit: 'Allicin & Gingerol' },
      { item: 'Curry Powder, Turmeric, Cumin & Black Pepper', amount: '1.5 tsp', pcosBenefit: 'Anti-Inflammatory Spices' },
      { item: 'Cooked Long-Grain Brown Basmati Rice', amount: '1/2 cup', pcosBenefit: 'Low-GI Carbs' },
      { item: 'Cucumber Curd Raita', amount: '1/2 cup', pcosBenefit: 'Probiotics' }
    ],
    instructions: [
      'Heat 1 tsp oil, sauté finely chopped onions, ginger-garlic paste, and curry leaves until golden.',
      'Add tomatoes, turmeric, coriander, chili powder, and chicken cubes. Sauté for 5 minutes.',
      'Add 1/2 cup water, cover and simmer for 12 minutes until chicken is tender.',
      'Garnish with fresh coriander and serve warm with brown rice and cucumber raita.'
    ],
    proTips: ['Skinless chicken breast has zero inflammatory saturated animal fat.'],
    tags: ['High-Protein', 'South-Indian', 'Desi-Favorite']
  },
  {
    id: 'rec_lu_grilled_chicken_salad',
    name: 'Mediterranean Grilled Chicken Breast Salad with Kalamata Olives, Chickpeas & Herb Vinaigrette',
    nameTe: 'మెడిటరేనియన్ చికెన్ శనగల సలాడ్',
    tagline: 'Crisp, refreshing lunch combining lean poultry, fiber-rich legumes, and healthy monounsaturated fats',
    taglineTe: 'ఆరోగ్యకరమైన కొవ్వులు మరియు ప్రొటీన్‌తో కూడిన చికెన్ సలాడ్',
    mealType: 'lunch',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 1,
    calories: 395,
    proteinGrams: 35,
    carbsGrams: 22,
    fatGrams: 16,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '35g protein triggers peptide YY release to completely silence afternoon snacking cravings.',
      'Extra virgin olive oil and kalamata olives improve systemic insulin sensitivity.'
    ],
    ingredients: [
      { item: 'Grilled Herb Chicken Breast (sliced)', amount: '140g', pcosBenefit: '35g Protein' },
      { item: 'Boiled Chickpeas (Kabuli Chana)', amount: '1/2 cup', pcosBenefit: 'Resistant Starch' },
      { item: 'Mixed Crisp Greens, Cucumbers & Cherry Tomatoes', amount: '2 cups', pcosBenefit: 'Hydration & Fiber' },
      { item: 'Kalamata Olives & Extra Virgin Olive Oil Dressing', amount: '1.5 tbsp', pcosBenefit: 'Polyphenol Monounsaturates' }
    ],
    instructions: [
      'In a salad bowl, toss mixed greens, sliced cucumbers, tomatoes, and chickpeas.',
      'Top with warm sliced grilled chicken breast and sliced kalamata olives.',
      'Drizzle with olive oil, lemon juice, dried oregano, and crushed black pepper vinaigrette.'
    ],
    proTips: ['A high-protein lunch eliminates the 3:00 PM sugar slump completely.'],
    tags: ['High-Protein', 'Mediterranean', 'Low-Carb']
  },
  {
    id: 'rec_lu_chicken_veg_stew',
    name: 'Slow-Simmered Chicken & Vegetable Clear Stew with Brown Rice Noodles',
    nameTe: 'చికెన్ వెజిటబుల్ క్లియర్ స్టూ (రైస్ నూడుల్స్‌తో)',
    tagline: 'Hydrating, gut-healing collagen broth loaded with carrots, beans, and tender chicken',
    taglineTe: 'జీర్ణక్రియకు మరియు గట్ లైనింగ్‌కు మేలు చేసే చికెన్ వెజిటబుల్ స్టూ',
    mealType: 'lunch',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    servings: 2,
    calories: 380,
    proteinGrams: 30,
    carbsGrams: 36,
    fatGrams: 10,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Slow-simmered chicken releases natural glycine and proline to heal leaky gut barrier.',
      'Carrots, green beans, and celery provide soothing soluble prebiotic fiber.'
    ],
    ingredients: [
      { item: 'Diced Chicken Breast / Thigh (boneless)', amount: '180g', pcosBenefit: '30g Complete Protein' },
      { item: 'Diced Carrots, Celery, French Beans & Mushrooms', amount: '1.5 cups', pcosBenefit: 'Prebiotics & Minerals' },
      { item: 'Brown Rice Vermicelli Noodles', amount: '1/2 cup cooked', pcosBenefit: 'Gluten-Free Low-GI Carb' },
      { item: 'Garlic, Ginger, Black Peppercorns & Bay Leaf', amount: '1 tbsp', pcosBenefit: 'Gut Healing Aromatics' }
    ],
    instructions: [
      'In a pot, sauté crushed garlic, ginger, and bay leaf in 1 tsp olive oil.',
      'Add chicken pieces and vegetables; sauté for 3 minutes.',
      'Add 3 cups filtered water or chicken broth, cover and simmer for 15 minutes.',
      'Add cooked brown rice noodles in the last 2 minutes, season with sea salt and crushed black pepper, and serve hot in a deep bowl.'
    ],
    proTips: ['Glycine in broth helps balance elevated insulin and supports liver detoxification.'],
    tags: ['Gut-Healing', 'Comfort-Broth', 'High-Protein']
  },
  {
    id: 'rec_lu_salmon_avocado_wrap',
    name: 'Wild Salmon / Flaked Tuna & Avocado Salad in Whole Grain Wrap with Mixed Greens',
    nameTe: 'సాల్మన్ / ట్యూనా అవకాడో రాప్',
    tagline: 'Portable omega-3 power lunch with rich dietary fiber and zinc',
    taglineTe: 'ఒమేగా-3 మరియు పీచుతో కూడిన సాల్మన్ అవకాడో రాప్',
    mealType: 'lunch',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 415,
    proteinGrams: 32,
    carbsGrams: 32,
    fatGrams: 18,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Wild salmon/tuna delivers bioavailable marine omega-3s to modulate LH:FSH ratio.',
      'Avocado and whole grain wrap provide 8g fiber to assist intestinal estrogen clearance.'
    ],
    ingredients: [
      { item: 'Wild Canned Salmon or Tuna in Water (drained)', amount: '120g', pcosBenefit: '32g Marine Protein' },
      { item: 'Ripe Avocado (mashed with lemon & salt)', amount: '1/2 avocado', pcosBenefit: 'Healthy Fat Binder' },
      { item: '100% Sprouted Whole Grain or Jowar Tortilla', amount: '1 wrap', pcosBenefit: 'Complex Low-GI Grain' },
      { item: 'Diced Celery, Red Onions & Baby Spinach', amount: '1/2 cup', pcosBenefit: 'Crunch & Micronutrients' }
    ],
    instructions: [
      'In a bowl, flake the salmon/tuna and mix with mashed avocado, diced celery, red onions, lemon juice, and black pepper.',
      'Warm the whole grain wrap on a dry pan for 30 seconds.',
      'Layer fresh baby spinach on the wrap, spoon the salmon-avocado mixture down the center, roll tightly, and slice diagonally.'
    ],
    proTips: ['Mashing avocado replaces mayo completely with heart-healthy monounsaturated fats.'],
    tags: ['Omega-3-Rich', 'No-Cook', 'High-Protein']
  },
  {
    id: 'rec_lu_herb_crusted_chicken',
    name: 'Herb-Crusted Grilled Chicken Breast with Baked Sweet Potato Wedges & Steamed Green Beans',
    nameTe: 'హెర్బ్ చికెన్ & బేక్డ్ స్వీట్ పొటాటో భోజనం',
    tagline: 'Post-workout hormone recovery plate with clean protein and carotenoid slow carbs',
    taglineTe: 'వ్యాయామం తర్వాత హార్మోన్ల రికవరీ కోసం చికెన్ & చిలగడదుంప భోజనం',
    mealType: 'lunch',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    calories: 420,
    proteinGrams: 36,
    carbsGrams: 34,
    fatGrams: 12,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Sweet potatoes have a low glycemic load and rich beta-carotene for corpus luteum health.',
      'Green beans supply plant silicon and magnesium for connective tissue strength.'
    ],
    ingredients: [
      { item: 'Chicken Breast Fillet (marinated with oregano & thyme)', amount: '150g', pcosBenefit: '36g Complete Protein' },
      { item: 'Baked Sweet Potato Wedges (skin-on)', amount: '1 small (100g)', pcosBenefit: 'Low-GL Complex Carb' },
      { item: 'Steamed French Green Beans with Garlic', amount: '1 cup', pcosBenefit: 'Magnesium & Silicon' },
      { item: 'Extra Virgin Olive Oil', amount: '1 tsp', pcosBenefit: 'Healthy Fat' }
    ],
    instructions: [
      'Toss skin-on sweet potato wedges with 1/2 tsp olive oil, paprika, and salt; air-fry or bake at 200°C for 15 minutes.',
      'Grill herb-marinated chicken breast in a skillet for 4-5 minutes per side until cooked through.',
      'Steam green beans for 3 minutes, toss with minced garlic, and serve together on a warm plate.'
    ],
    proTips: ['Leaving the skin on sweet potatoes adds 3g insoluble fiber and keeps the glycemic index low.'],
    tags: ['Post-Workout', 'High-Protein', 'Clean-Eating']
  },
  {
    id: 'rec_lu_chicken_dum_biryani',
    name: 'High-Protein Chicken Dum Biryani with Cauliflower-Brown Rice Blend & Mint Raita',
    nameTe: 'చికెన్ దమ్ బిర్యానీ (క్యాలీఫ్లవర్ & బ్రౌన్ రైస్‌తో)',
    tagline: 'Guilt-free weekend biryani blending aromatic spices, tender chicken, and cruciferous cauliflower',
    taglineTe: 'రుచికరమైన మరియు ఆరోగ్యకరమైన హై-ప్రోటీన్ చికెన్ బిర్యానీ',
    mealType: 'lunch',
    cravingType: 'special',
    preference: 'non_vegetarian',
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    servings: 3,
    calories: 420,
    proteinGrams: 35,
    carbsGrams: 36,
    fatGrams: 14,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Blending 50% brown basmati with 50% riced cauliflower cuts glycemic impact by 55%.',
      'Saffron and cloves stimulate ovarian blood microcirculation.',
      '35g lean chicken protein promotes muscle recovery and satiety.'
    ],
    ingredients: [
      { item: 'Skinless Chicken Thigh/Breast Pieces', amount: '250g', pcosBenefit: '35g Protein' },
      { item: 'Aged Brown Basmati Rice (soaked)', amount: '3/4 cup', pcosBenefit: 'Low-GI Grain' },
      { item: 'Riced Cauliflower Florets', amount: '1.5 cups', pcosBenefit: 'Indole-3-Carbinol Detox' },
      { item: 'Spiced Yogurt (Curd) Marinade with Mint & Saffron', amount: '1/2 cup', pcosBenefit: 'Probiotics & Aromatics' }
    ],
    instructions: [
      'Marinate chicken in yogurt, ginger-garlic paste, turmeric, biryani masala, and mint for 25 minutes.',
      'Par-boil brown basmati rice with whole spices until 75% cooked.',
      'Sear marinated chicken in a pot for 6 minutes, layer riced cauliflower and par-cooked brown rice over it, drizzle saffron milk.',
      'Cover tightly and slow-cook (Dum) for 15 minutes. Serve warm with cooling mint-cucumber raita.'
    ],
    proTips: ['Riced cauliflower absorbs the rich biryani masala flavors seamlessly while halving the starch load.'],
    tags: ['Special', 'Weekend-Feast', 'High-Protein']
  }
];
