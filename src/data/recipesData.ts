import { RecipeItem } from '../types';

export const MASTER_RECIPES: RecipeItem[] = [
  // ============================================================
  // BREAKFASTS - VEGETARIAN (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_bf_foxtail_upma',
    name: 'Spiced Foxtail Millet & Vegetable Upma with Chia Seeds',
    nameTe: 'కొర్రల వెజిటబుల్ ఉప్మా (చియా గింజలతో)',
    tagline: 'High-fiber, ultra-low GI breakfast that stabilizes morning glucose for 4+ hours',
    taglineTe: 'రక్తంలో చక్కెరను స్థిరీకరించే అధిక పీచుతో కూడిన కొర్రల ఉప్మా',
    mealType: 'breakfast',
    cravingType: 'hot',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 285,
    proteinGrams: 9,
    carbsGrams: 38,
    fatGrams: 7,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Foxtail millet has a low GI (54), preventing morning insulin surges.',
      'Chia seeds provide plant-based Omega-3s (ALA) to calm ovarian inflammation.',
      'Curry leaves and mustard seeds stimulate gut digestive enzymes.'
    ],
    pcosHormoneBenefitsTe: [
      'కొర్రలు తక్కువ గ్లైసెమిక్ ఇండెక్స్ కలిగి ఉండి ఉదయం ఇన్సులిన్ స్పైక్‌లను నివారిస్తాయి.',
      'చియా గింజలు ఒమేగా-3 కొవ్వులను అందించి అండాశయ వాపును తగ్గిస్తాయి.',
      'కరివేపాకు మరియు ఆవాలు జీర్ణక్రియను మెరుగుపరుస్తాయి.'
    ],
    ingredients: [
      { item: 'Foxtail Millet (Korralu)', amount: '1 cup, soaked 20 mins', pcosBenefit: 'Complex Low-GI Carb' },
      { item: 'Chia Seeds', amount: '1 tbsp', pcosBenefit: 'Omega-3 ALA & Soluble Fiber' },
      { item: 'Finely Chopped Carrots & Beans', amount: '1/2 cup', pcosBenefit: 'Antioxidants & Fiber' },
      { item: 'Fresh Ginger & Green Chili', amount: '1 tbsp minced', pcosBenefit: 'Anti-inflammatory' },
      { item: 'A2 Ghee or Coconut Oil', amount: '1 tsp', pcosBenefit: 'Hormone Precursor Healthy Fat' }
    ],
    instructions: [
      'Rinse foxtail millet and soak in water for 20 minutes.',
      'Heat 1 tsp ghee, sputter mustard seeds, curry leaves, ginger, and green chilies.',
      'Add chopped carrots and beans with a pinch of turmeric; sauté for 3 minutes.',
      'Add 2 cups hot water and rock salt, bring to a rolling boil.',
      'Stir in soaked millet, cover and simmer on low heat for 10-12 minutes until fluffy.',
      'Stir in chia seeds and fresh lemon juice before serving warm.'
    ],
    proTips: ['Soaking millets neutralizes phytic acid, dramatically increasing zinc and magnesium absorption.'],
    tags: ['Low-GI', 'Gluten-Free', 'High-Fiber', 'Quick 20-Min']
  },
  {
    id: 'rec_bf_moong_chilla',
    name: 'Spiced Green Moong Dal Chilla with Grated Paneer & Mint',
    nameTe: 'పెసరట్ల చిల్లా (పనీర్ & పుదీనాతో)',
    tagline: 'Protein-packed savory pancake that keeps androgen synthesis minimal',
    taglineTe: 'హార్మోన్ల సమతుల్యతకు అధిక ప్రొటీన్ పెసరట్ల చిల్లా',
    mealType: 'breakfast',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    calories: 310,
    proteinGrams: 18,
    carbsGrams: 28,
    fatGrams: 9,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Whole green gram provides 18g plant protein and folate for follicle health.',
      'Paneer / Tofu provides bioavailable zinc and calcium without glycemic burden.',
      'Mint and ajwain prevent post-meal bloating and lower androgen markers.'
    ],
    ingredients: [
      { item: 'Whole Green Moong Dal (soaked overnight)', amount: '1 cup', pcosBenefit: 'Plant Protein & Inositol' },
      { item: 'Fresh Low-Fat Paneer or Organic Tofu', amount: '50g, grated', pcosBenefit: 'Bioavailable Protein' },
      { item: 'Fresh Mint & Coriander Leaves', amount: '1/2 cup chopped', pcosBenefit: 'Anti-Androgenic Phytonutrients' },
      { item: 'Ajwain (Carom Seeds) & Cumin', amount: '1/2 tsp each', pcosBenefit: 'Digestive & Anti-Bloat' }
    ],
    instructions: [
      'Blend soaked moong dal with ginger, green chili, and cumin into a smooth batter.',
      'Stir in ajwain seeds, rock salt, and chopped mint leaves.',
      'Pour a ladle onto a hot cast-iron pan and spread into a round pancake.',
      'Top with grated paneer and fresh coriander, cook both sides until golden and crisp.',
      'Serve hot with homemade mint-coriander dip.'
    ],
    proTips: ['Overnight soaking activates natural myo-inositol inside legumes.'],
    tags: ['High-Protein', 'Vegetarian', 'Diabetic-Safe', 'Gluten-Free']
  },
  {
    id: 'rec_bf_chia_berry_pudding',
    name: 'Overnight Cinnamon Chia Berry Pudding with Crushed Walnuts',
    nameTe: 'సిన్నమొన్ చియా బెర్రీ పుడ్డింగ్ (వాల్‌నట్లతో)',
    tagline: 'Decadent sweet breakfast that lowers fasting insulin and fights oxidative stress',
    taglineTe: 'రుచికరమైన సహజమైన తీపి చియా బెర్రీ పుడ్డింగ్',
    mealType: 'breakfast',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 270,
    proteinGrams: 8,
    carbsGrams: 22,
    fatGrams: 16,
    fiberGrams: 11,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '11g of prebiotic fiber slows glucose absorption, flattening insulin curves.',
      'Ceylon cinnamon improves insulin receptor sensitivity.',
      'Blueberries deliver anthocyanins that protect ovarian microvasculature.'
    ],
    ingredients: [
      { item: 'Organic Black/White Chia Seeds', amount: '3 tbsp', pcosBenefit: '11g Soluble Fiber' },
      { item: 'Unsweetened Almond or Coconut Milk', amount: '3/4 cup', pcosBenefit: 'Dairy-Free Base' },
      { item: 'Ceylon Cinnamon Powder', amount: '1/2 tsp', pcosBenefit: 'Insulin Sensitizer' },
      { item: 'Fresh Blueberries or Blackberries', amount: '1/2 cup', pcosBenefit: 'Anthocyanins' },
      { item: 'Crushed Raw Walnuts', amount: '1 tbsp', pcosBenefit: 'Omega-3s' }
    ],
    instructions: [
      'In a glass jar, combine chia seeds, Ceylon cinnamon, and almond milk.',
      'Whisk well and refrigerate overnight (or 3 hours) until creamy.',
      'Top with fresh blueberries, crushed walnuts, and hemp seeds in the morning.'
    ],
    proTips: ['Use true Ceylon cinnamon rather than Cassia to protect liver enzymes.'],
    tags: ['No-Cook', 'Vegan', 'Anti-Inflammatory', 'High-Fiber']
  },
  {
    id: 'rec_bf_sprout_poha',
    name: 'Sprouted Moong & Vegetable Red Rice Poha with Roasted Peanuts',
    nameTe: 'మొలకలు & రెడ్ రైస్ అటుకుల పోహా',
    tagline: 'Iron-rich red rice flakes paired with live active sprouted enzymes',
    taglineTe: 'ఐరన్ మరియు ఎంజైమ్‌లు అధికంగా ఉండే రెడ్ రైస్ పోహా',
    mealType: 'breakfast',
    cravingType: 'hot',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    calories: 295,
    proteinGrams: 11,
    carbsGrams: 39,
    fatGrams: 8,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Sprouted moong has 3x higher bioavailable folate and enzymes than unsprouted beans.',
      'Red rice poha is packed with anthocyanins and dietary iron.',
      'Peanuts provide healthy fats that slow digestion.'
    ],
    ingredients: [
      { item: 'Thick Red Rice Poha (rinsed)', amount: '1 cup', pcosBenefit: 'Anthocyanin Iron Carb' },
      { item: 'Sprouted Green Moong Beans', amount: '1/2 cup', pcosBenefit: 'Active Enzymes & Folate' },
      { item: 'Diced Onions, Green Peas & Carrots', amount: '1/2 cup', pcosBenefit: 'Prebiotic Fiber' },
      { item: 'Roasted Peanuts & Mustard Seeds', amount: '1 tbsp', pcosBenefit: 'Healthy Fat & Magnesium' }
    ],
    instructions: [
      'Rinse red rice poha in a colander and drain for 5 minutes.',
      'Heat 1 tsp oil in a pan, add mustard seeds, curry leaves, green chilies, and peanuts.',
      'Add onions, carrots, and sprouted moong; sauté for 3 minutes until tender.',
      'Add turmeric, rock salt, and drained poha. Toss gently on low heat for 2 minutes.',
      'Garnish with fresh lemon juice and chopped coriander.'
    ],
    proTips: ['Red rice poha retains its fiber hull, delivering sustained 3-hour energy.'],
    tags: ['Iron-Rich', 'Sprouted-Enzymes', 'Quick 15-Min']
  },
  {
    id: 'rec_bf_savory_oats_khichdi',
    name: 'Golden Turmeric Rolled Oats & Yellow Lentil Khichdi with Flax Podi',
    nameTe: 'పసుపు ఓట్స్ & పెసరపప్పు కిచిడీ (అవిసెల పొడితో)',
    tagline: 'Beta-glucan prebiotic comfort bowl that scrubs intestinal estrogen toxins',
    taglineTe: 'ఈస్ట్రోజెన్ సమతుల్యత కోసం ఓట్స్ మరియు పెసరపప్పు కిచిడీ',
    mealType: 'breakfast',
    cravingType: 'comfort',
    preference: 'vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    servings: 2,
    calories: 275,
    proteinGrams: 12,
    carbsGrams: 36,
    fatGrams: 6,
    fiberGrams: 8,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Oat beta-glucan binds to bile acids, accelerating gut estrogen excretion.',
      'Yellow moong dal is gentle on digestion and prevents morning sluggishness.',
      'Flaxseed podi supplies lignans for hormone balance.'
    ],
    ingredients: [
      { item: 'Jumbo Rolled Oats', amount: '1/2 cup', pcosBenefit: 'Beta-Glucan Soluble Fiber' },
      { item: 'Yellow Moong Dal (split)', amount: '1/3 cup', pcosBenefit: 'Clean Light Protein' },
      { item: 'Fresh Spinach & Diced Tomatoes', amount: '1/2 cup', pcosBenefit: 'Magnesium & Lycopene' },
      { item: 'Turmeric, Ginger & Cumin Ghee Tadka', amount: '1 tsp ghee', pcosBenefit: 'Anti-Inflammatory Tadka' },
      { item: 'Flaxseed Podi (Ground Flax Mix)', amount: '1 tsp sprinkle', pcosBenefit: 'Hormone Lignans' }
    ],
    instructions: [
      'In a pot, boil yellow moong dal with turmeric, ginger, and 2 cups water for 8 minutes.',
      'Add rolled oats, diced tomatoes, and spinach. Simmer for 4-5 minutes until creamy.',
      'Tempering: In 1 tsp ghee, sputter cumin seeds and a pinch of hing. Pour over khichdi.',
      'Sprinkle flaxseed podi and serve warm with a spoonful of fresh curd.'
    ],
    proTips: ['Rolled oats have a much lower glycemic impact than instant quick-cooking oats.'],
    tags: ['Beta-Glucan', 'Comfort-Food', 'Gut-Cleanse']
  },
  {
    id: 'rec_bf_besan_palak_cheela',
    name: 'High-Protein Besan (Gram Flour) & Spinach Cheela with Tomato-Mint Chutney',
    nameTe: 'పాలకూర శనగపిండి చీలా (టమాటో పుదీనా చట్నీతో)',
    tagline: 'Zinc-loaded savory crepe that suppresses appetite and curbs insulin',
    taglineTe: 'జింక్ మరియు మెగ్నీషియం సమృద్ధిగా ఉండే శనగపిండి పాలక్ చీలా',
    mealType: 'breakfast',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 10,
    servings: 2,
    calories: 290,
    proteinGrams: 14,
    carbsGrams: 30,
    fatGrams: 8,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Besan is naturally gluten-free and packed with zinc to inhibit 5-alpha reductase.',
      'Spinach provides magnesium to soothe cellular insulin resistance.',
      'Carom seeds (ajwain) prevent flatulence.'
    ],
    ingredients: [
      { item: 'Organic Besan (Bengal Gram Flour)', amount: '3/4 cup', pcosBenefit: 'Plant Zinc & Protein' },
      { item: 'Finely Chopped Fresh Spinach (Palak)', amount: '1 cup', pcosBenefit: 'Folate & Iron' },
      { item: 'Grated Ginger, Green Chili & Ajwain', amount: '1 tsp', pcosBenefit: 'Digestive Enzymes' },
      { item: 'Cold-Pressed Mustard or Sesame Oil', amount: '1 tsp', pcosBenefit: 'Healthy Fat' }
    ],
    instructions: [
      'Whisk besan with water into a smooth, lump-free pouring batter.',
      'Mix in chopped spinach, onions, ginger, green chilies, ajwain, turmeric, and rock salt.',
      'Spread a ladle of batter onto a medium-hot pan. Drizzle a few drops of oil.',
      'Cook for 2-3 minutes on each side until golden and cooked through.',
      'Serve hot with freshly ground tomato-mint chutney.'
    ],
    proTips: ['Bengal gram flour provides resistant starch that feeds healthy bowel flora.'],
    tags: ['High-Zinc', 'Gluten-Free', 'High-Protein']
  },
  {
    id: 'rec_bf_millet_idli_sambar',
    name: 'Steamed Ragi & Foxtail Millet Idlis with Anti-Inflammatory Drumstick Sambar',
    nameTe: 'రాగులు & కొర్రల ఇడ్లీలు (మునగకాయ సాంబారుతో)',
    tagline: 'Fermented microbiome powerhouse with polyphenol-rich drumstick lentil broth',
    taglineTe: 'జీర్ణక్రియకు మరియు అండాశయ ఆరోగ్యానికి పులియబెట్టిన రాగి ఇడ్లీలు',
    mealType: 'breakfast',
    cravingType: 'comfort',
    preference: 'south_indian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 280,
    proteinGrams: 10,
    carbsGrams: 42,
    fatGrams: 4,
    fiberGrams: 9,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Naturally fermented batter provides living Lactobacillus probiotic strains.',
      'Ragi (Finger Millet) is the highest food source of bioavailable calcium.',
      'Moringa (Drumstick) pods improve ovarian blood flow and blood sugar control.'
    ],
    ingredients: [
      { item: 'Ragi & Foxtail Millet Fermented Batter', amount: '4 idlis', pcosBenefit: 'Probiotic Fermented Carbs' },
      { item: 'Drumstick (Moringa) & Mixed Veg Sambar', amount: '1 large bowl', pcosBenefit: 'Moringa Antioxidants' },
      { item: 'Fresh Coconut-Mint Chutney', amount: '2 tbsp', pcosBenefit: 'MCT Healthy Fats' }
    ],
    instructions: [
      'Pour naturally fermented millet batter into greased idli molds.',
      'Steam in an idli cooker for 10-12 minutes until soft and spongy.',
      'Prepare sambar using toor dal, drumsticks, tomatoes, and sambar spices.',
      'Serve 3-4 warm idlis immersed in hot drumstick sambar with coconut-mint chutney.'
    ],
    proTips: ['Steaming preserves 100% of the water-soluble B vitamins inside millets.'],
    tags: ['Fermented', 'Probiotic', 'Calcium-Rich', 'South-Indian']
  },

  // ============================================================
  // BREAKFASTS - NON-VEGETARIAN (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_bf_avocado_spinach_eggs',
    name: 'Herbed Spinach Avocado Scramble with Sourdough / Millet Toast',
    nameTe: 'స్పినాచ్ ఎవకాడో ఆమ్లెట్ / స్క్రాంబుల్',
    tagline: 'Choline and omega-3 powerhouse for ovarian cellular health',
    taglineTe: 'అండాశయ ఆరోగ్యానికి కోలిన్ మరియు ఒమేగా-3 గుడ్ల స్క్రాంబుల్',
    mealType: 'breakfast',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 1,
    calories: 340,
    proteinGrams: 19,
    carbsGrams: 16,
    fatGrams: 20,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Egg yolks are rich in Choline and Vitamin D3, essential for oocyte DNA integrity.',
      'Avocado supplies monounsaturated fatty acids that optimize hormone receptor sensitivity.',
      'Baby spinach provides magnesium and iron to combat fatigue and period cramps.'
    ],
    ingredients: [
      { item: 'Pasture-Raised Eggs', amount: '2 whole eggs', pcosBenefit: 'Complete Protein & Choline' },
      { item: 'Fresh Baby Spinach', amount: '1 generous cup', pcosBenefit: 'Iron, Folate, & Magnesium' },
      { item: 'Ripe Avocado', amount: '1/2 medium, sliced', pcosBenefit: 'Healthy Hormone Fats' },
      { item: 'Extra Virgin Olive Oil', amount: '1 tsp', pcosBenefit: 'Polyphenols' }
    ],
    instructions: [
      'Whisk eggs with a pinch of turmeric, black pepper, and rock salt.',
      'Heat 1 tsp olive oil in a pan, sauté spinach for 60 seconds until wilted.',
      'Pour eggs and fold gently for 2 minutes until creamy.',
      'Serve with fresh avocado slices and a slice of toasted sprouted grain toast.'
    ],
    proTips: ['Never discard the yolk — it holds 100% of the lutein and choline.'],
    tags: ['High-Protein', 'Keto-Friendly', 'Quick 10-Min']
  },
  {
    id: 'rec_bf_boiled_egg_saute',
    name: '3 Egg White & 1 Whole Egg Vegetable Sauté with Sprouted Toast & Cherry Tomatoes',
    nameTe: 'ఉడకబెట్టిన గుడ్ల వెజిటబుల్ సలాడ్ బ్రేక్‌ఫాస్ట్',
    tagline: 'Ultra high-protein morning fuel that turns off ghrelin hunger hormone',
    taglineTe: 'ఆకలిని నియంత్రించే అధిక ప్రొటీన్ ఎగ్ వెజిటబుల్ అల్పాహారం',
    mealType: 'breakfast',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 1,
    calories: 310,
    proteinGrams: 24,
    carbsGrams: 18,
    fatGrams: 12,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '24g of bioavailable albumin protein suppresses ghrelin for 5+ hours.',
      'Cherry tomatoes deliver cooked lycopene for ovarian tissue health.',
      'Sprouted bread minimizes insulin spikes.'
    ],
    ingredients: [
      { item: 'Farm-Fresh Boiled Eggs', amount: '3 whites + 1 whole egg, chopped', pcosBenefit: '24g Complete Protein' },
      { item: 'Cherry Tomatoes & Bell Peppers', amount: '1/2 cup diced', pcosBenefit: 'Lycopene & Vitamin C' },
      { item: 'Extra Virgin Olive Oil & Crushed Pepper', amount: '1 tsp', pcosBenefit: 'Anti-Inflammatory Dressing' },
      { item: 'Sprouted Whole Grain Toast', amount: '1 slice', pcosBenefit: 'Complex Low-GI Carb' }
    ],
    instructions: [
      'Chop boiled egg whites and whole egg into bite-sized cubes.',
      'In a warm skillet with 1 tsp olive oil, toss diced cherry tomatoes and bell peppers for 2 minutes.',
      'Add egg cubes, sprinkle with black pepper, oregano, and Himalayan pink salt.',
      'Toss for 1 minute and serve with warm sprouted toast.'
    ],
    proTips: ['Eating 20g+ protein at breakfast stabilizes daytime glucose levels dramatically.'],
    tags: ['High-Protein', 'Quick 10-Min', 'Lean-Muscle']
  },
  {
    id: 'rec_bf_egg_mushroom_omelet',
    name: 'High-Protein Egg White & Sliced Mushroom Omelet with Sliced Avocado',
    nameTe: 'మష్రూమ్ ఎగ్ ఆమ్లెట్ (ఎవకాడోతో)',
    tagline: 'Mushroom ergothioneine and egg choline for ovarian mitochondrial defense',
    taglineTe: 'అండాశయ కణాల రక్షణ కోసం పుట్టగొడుగుల ఎగ్ ఆమ్లెట్',
    mealType: 'breakfast',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    servings: 1,
    calories: 320,
    proteinGrams: 21,
    carbsGrams: 10,
    fatGrams: 18,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Button and cremini mushrooms supply selenium and ergothioneine.',
      'Pure egg protein prevents post-breakfast reactive hypoglycemia.',
      'Avocado fats assist fat-soluble Vitamin D absorption.'
    ],
    ingredients: [
      { item: 'Free-Range Eggs', amount: '2 whole eggs or 3 whites + 1 yolk', pcosBenefit: 'Choline & Protein' },
      { item: 'Fresh Sliced Mushrooms', amount: '1/2 cup', pcosBenefit: 'Selenium & Antioxidants' },
      { item: 'Green Chili, Onions & Coriander', amount: '2 tbsp', pcosBenefit: 'Zesty Flavor' },
      { item: 'Ripe Avocado Slices', amount: '1/4 avocado', pcosBenefit: 'Monounsaturated Fats' }
    ],
    instructions: [
      'Sauté sliced mushrooms in 1/2 tsp oil until browned and tender (3 minutes).',
      'Whisk eggs with onions, green chili, black pepper, and salt.',
      'Pour whisked eggs over the mushrooms in the pan.',
      'Cook on medium heat until set, flip gently and cook 1 more minute.',
      'Serve with avocado slices and fresh mint dip.'
    ],
    proTips: ['Mushrooms contain unique polysaccharides that nourish beneficial gut bacteria.'],
    tags: ['Keto-Friendly', 'High-Protein', 'Low-Carb']
  },
  {
    id: 'rec_bf_foxtail_upma_eggs',
    name: 'Spiced Foxtail Millet Upma served with 2 Soft-Boiled Free-Range Eggs',
    nameTe: 'కొర్రల ఉప్మా & సాఫ్ట్-బాయిల్డ్ గుడ్లు',
    tagline: 'Balanced synergy of complex low-GI millets and bioavailable animal protein',
    taglineTe: 'సంపూర్ణ పోషకాలతో కూడిన కొర్రల ఉప్మా మరియు ఉడకబెట్టిన గుడ్లు',
    mealType: 'breakfast',
    cravingType: 'hot',
    preference: 'non_vegetarian',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 350,
    proteinGrams: 21,
    carbsGrams: 36,
    fatGrams: 12,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Combining millet fiber with whole egg protein reduces the glycemic response by an additional 25%.',
      'Eggs supply choline to support liver estrogen conjugation.'
    ],
    ingredients: [
      { item: 'Cooked Foxtail Millet Upma with Veggies', amount: '1 cup', pcosBenefit: 'Fiber & Complex Carbs' },
      { item: 'Soft-Boiled Eggs', amount: '2 eggs', pcosBenefit: '12g Complete Protein & Choline' },
      { item: 'Chia Seeds & Fresh Lime', amount: '1 tsp', pcosBenefit: 'Omega-3 ALA' }
    ],
    instructions: [
      'Prepare foxtail millet upma with carrots, beans, mustard seeds, and curry leaves.',
      'Soft-boil 2 free-range eggs for 6.5 minutes, peel and slice in halves.',
      'Plate warm millet upma topped with sliced eggs, a sprinkle of black pepper, and fresh lime.'
    ],
    proTips: ['Soft-boiling keeps the yolk nutrients bioavailable and intact.'],
    tags: ['Balanced-Plate', 'High-Protein', 'Low-GI']
  },
  {
    id: 'rec_bf_smoked_salmon_toast',
    name: 'Wild Smoked Salmon on Guacamole Millet Toast with Microgreens',
    nameTe: 'వైల్డ్ సాల్మన్ & ఎవకాడో మిల్లెట్ టోస్ట్',
    tagline: 'Direct marine EPA/DHA omega-3 infusion to turn off ovarian androgen enzymes',
    taglineTe: 'టెస్టోస్టెరాన్ తగ్గించడానికి ఒమేగా-3 సాల్మన్ అల్పాహారం',
    mealType: 'breakfast',
    cravingType: 'comfort',
    preference: 'non_vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 2,
    servings: 1,
    calories: 360,
    proteinGrams: 22,
    carbsGrams: 18,
    fatGrams: 21,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '1,500mg EPA/DHA omega-3 fatty acids directly suppress 17,20-lyase androgen activity.',
      'Astaxanthin in wild salmon is one of nature\'s strongest cellular antioxidants.',
      'Zero sugar, high satiety.'
    ],
    ingredients: [
      { item: 'Wild Alaskan Smoked Salmon Slices', amount: '80g', pcosBenefit: 'EPA/DHA Omega-3s' },
      { item: 'Mashed Avocado with Lime & Sea Salt', amount: '1/2 avocado', pcosBenefit: 'Healthy Fats' },
      { item: 'Toasted Gluten-Free Millet / Sourdough Bread', amount: '1 slice', pcosBenefit: 'Slow Carbs' },
      { item: 'Fresh Broccoli Sprouts or Microgreens', amount: 'Handful', pcosBenefit: 'Sulforaphane Detox' }
    ],
    instructions: [
      'Toast 1 slice of artisanal sourdough or millet bread until golden and crisp.',
      'Spread fresh guacamole evenly over the toast.',
      'Layer wild smoked salmon slices on top.',
      'Garnish with fresh microgreens, capers, and freshly cracked black pepper.'
    ],
    proTips: ['Wild salmon contains significantly higher omega-3 to omega-6 ratios than farmed fish.'],
    tags: ['Omega-3-Rich', 'Anti-Androgen', 'No-Cook']
  },
  {
    id: 'rec_bf_shakshuka_eggs',
    name: 'Mediterranean Shakshuka (Poached Eggs in Spiced Tomato & Bell Pepper Sauce)',
    nameTe: 'మెడిటరేనియన్ షక్షుకా (టమాటో గ్రేవీలో గుడ్లు)',
    tagline: 'Simmered spiced antioxidant sauce that calms morning cortisol',
    taglineTe: 'రుచికరమైన మరియు హార్మోన్లను సమతుల్యం చేసే షక్షుకా ఎగ్ బ్రేక్‌ఫాస్ట్',
    mealType: 'breakfast',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 330,
    proteinGrams: 18,
    carbsGrams: 16,
    fatGrams: 19,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Cooked tomatoes with olive oil provide maximum bioavailable lycopene.',
      'Cumin and paprika enhance metabolic glucose uptake.',
      'Pasture eggs supply complete essential amino acids.'
    ],
    ingredients: [
      { item: 'Fresh Eggs', amount: '2 whole eggs', pcosBenefit: 'Protein & Choline' },
      { item: 'Diced Bell Peppers, Tomatoes & Onions', amount: '1 cup', pcosBenefit: 'Lycopene & Vitamin C' },
      { item: 'Cumin, Smoked Paprika & Garlic', amount: '1 tsp', pcosBenefit: 'Metabolic Spices' },
      { item: 'Extra Virgin Olive Oil', amount: '1 tsp', pcosBenefit: 'Healthy Fat' }
    ],
    instructions: [
      'Heat olive oil in a skillet, sauté diced onions, bell peppers, and garlic for 4 minutes.',
      'Add chopped tomatoes, cumin, paprika, and salt. Simmer for 5 minutes into a rich sauce.',
      'Make 2 small wells in the sauce and crack the eggs directly into the wells.',
      'Cover with lid and simmer on low heat for 4-5 minutes until egg whites are set and yolks are runny.',
      'Garnish with fresh parsley and serve hot in the pan.'
    ],
    proTips: ['Cast iron skillet preparation adds dietary iron to every serving.'],
    tags: ['Mediterranean', 'Antioxidant-Rich', 'Spicy']
  },
  {
    id: 'rec_bf_masala_egg_bhurji',
    name: 'Masala Egg Bhurji (Scramble) with Sautéed Spinach & 1 Warm Jowar Roti',
    nameTe: 'మసాలా ఎగ్ భుర్జీ (పాలకూర & జొన్న రొట్టెతో)',
    tagline: 'Desi high-protein spiced scramble that keeps blood sugar flat and steady',
    taglineTe: 'రక్తంలో గ్లూకోజ్ పెరగకుండా ఉంచే మసాలా ఎగ్ భుర్జీ భోజనం',
    mealType: 'breakfast',
    cravingType: 'spicy',
    preference: 'non_vegetarian',
    prepTimeMinutes: 6,
    cookTimeMinutes: 8,
    servings: 1,
    calories: 340,
    proteinGrams: 22,
    carbsGrams: 24,
    fatGrams: 14,
    fiberGrams: 6,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Jowar flour is rich in dietary copper and magnesium.',
      'Turmeric and green chilies in bhurji boost resting thermogenesis.',
      '22g protein provides lasting morning energy.'
    ],
    ingredients: [
      { item: 'Farm Eggs', amount: '2 whole eggs + 1 egg white', pcosBenefit: '22g Protein' },
      { item: 'Chopped Spinach, Onions & Tomatoes', amount: '1/2 cup', pcosBenefit: 'Fiber & Iron' },
      { item: 'Jowar (Sorghum) Flour Roti', amount: '1 thin roti', pcosBenefit: 'Gluten-Free Low-GI Carb' },
      { item: 'A2 Ghee for Cooking', amount: '1 tsp', pcosBenefit: 'Healthy Precursor Fats' }
    ],
    instructions: [
      'Heat 1 tsp ghee, sauté onions, green chilies, tomatoes, and chopped spinach for 3 minutes.',
      'Add turmeric, garam masala, and salt.',
      'Pour in whisked eggs and scramble quickly on medium heat for 2 minutes.',
      'Serve hot alongside 1 fresh jowar (sorghum) roti.'
    ],
    proTips: ['Sorghum roti provides slow-release complex carbohydrates that prevent mid-morning crashes.'],
    tags: ['High-Protein', 'Desi-Style', 'Gluten-Free']
  }
];
