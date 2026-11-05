import { RecipeItem } from '../types';

export const BOOSTER_RECIPES: RecipeItem[] = [
  // ============================================================
  // MID-MORNING BOOSTERS (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_mm_seed_tonic',
    name: 'Follicular Seed Cycling Elixir (Pumpkin & Ground Flax with Lemon Mint)',
    nameTe: 'సీడ్ సైక్లింగ్ టానిక్ (గుమ్మడి & అవిసె గింజలు)',
    tagline: 'Supplies natural lignans to bind excess estrogen and zinc for follicular growth',
    taglineTe: 'ఈస్ట్రోజెన్ మరియు జింక్ సమతుల్యత కోసం సీడ్ సైక్లింగ్ పానీయం',
    mealType: 'mid_morning',
    cravingType: 'hot',
    preference: 'vegan',
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 120,
    proteinGrams: 5,
    carbsGrams: 4,
    fatGrams: 9,
    fiberGrams: 4,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Flaxseed lignans act as selective estrogen receptor modulators, clearing excess estrogen.',
      'Pumpkin seed zinc blocks 5-alpha reductase to reduce hirsutism and acne.'
    ],
    ingredients: [
      { item: 'Freshly Ground Flaxseeds', amount: '1 tbsp', pcosBenefit: 'Lignans & Estrogen Balance' },
      { item: 'Raw Shelled Pumpkin Seeds (Pepitas)', amount: '1 tbsp', pcosBenefit: 'Bioavailable Zinc' },
      { item: 'Warm Water with Lemon & Fresh Mint', amount: '1 glass (250ml)', pcosBenefit: 'Hydration & Vit C' }
    ],
    instructions: [
      'Grind fresh flaxseeds in a small grinder.',
      'Stir ground flaxseed and pumpkin seeds into warm lemon-mint water and drink slowly before lunch.'
    ],
    proTips: ['Store whole seeds in the fridge and grind fresh daily to avoid fatty acid oxidation.'],
    tags: ['Seed-Cycling', 'Hormone-Balancer', 'Quick 3-Min']
  },
  {
    id: 'rec_mm_amla_ginger_shots',
    name: 'Fresh Amla, Ginger & Wheatgrass Immunity Detox Shot',
    nameTe: 'ఉసిరికాయ అల్లం ఇమ్యూనిటీ షాట్',
    tagline: 'Mega-dose natural Vitamin C to reduce cortisol and ovarian oxidative stress',
    taglineTe: 'విటమిన్ సి అధికంగా ఉండే ఉసిరి అల్లం రసం',
    mealType: 'mid_morning',
    cravingType: 'spicy',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 45,
    proteinGrams: 1,
    carbsGrams: 9,
    fatGrams: 0,
    fiberGrams: 3,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Amla contains 20x more Vitamin C than oranges, rejuvenating liver detoxification.',
      'Gingerol calms prostaglandin inflammation that triggers severe menstrual cramps.'
    ],
    ingredients: [
      { item: 'Fresh Green Amla (deseeded)', amount: '2 medium', pcosBenefit: 'Concentrated Vitamin C' },
      { item: 'Fresh Ginger Root', amount: '1 inch knob', pcosBenefit: 'Gingerol Anti-Inflammatory' },
      { item: 'Black Pepper & Rock Salt', amount: 'Pinch', pcosBenefit: 'Mineral Balance' }
    ],
    instructions: [
      'Blend chopped amla, ginger, and 1/4 cup water in a blender.',
      'Strain through a sieve and drink with a pinch of black pepper and rock salt.'
    ],
    proTips: ['Vitamin C is a key co-factor for collagen and clears hormonal blemish marks.'],
    tags: ['Immunity', 'Liver-Detox', 'Skin-Glow']
  },
  {
    id: 'rec_mm_seed_trail_coconut',
    name: 'Roasted Pumpkin & Sunflower Seed Trail Mix with Tender Coconut Water',
    nameTe: 'గుమ్మడి & పొద్దుతిరుగుడు గింజలు (కొబ్బరి నీళ్లతో)',
    tagline: 'Luteal phase zinc and selenium booster with natural electrolyte rehydration',
    taglineTe: 'ఎలక్ట్రోలైట్లు మరియు సహజ ఖనిజాల కోసం గింజల మిశ్రమం & కొబ్బరి నీళ్లు',
    mealType: 'mid_morning',
    cravingType: 'crunchy',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 140,
    proteinGrams: 6,
    carbsGrams: 11,
    fatGrams: 9,
    fiberGrams: 3,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Sunflower seeds provide Vitamin E and Selenium to support corpus luteum progesterone production.',
      'Tender coconut water rehydrates vascular volume without spiking blood glucose.'
    ],
    ingredients: [
      { item: 'Lightly Roasted Sunflower Seeds', amount: '1 tbsp', pcosBenefit: 'Vitamin E & Selenium' },
      { item: 'Raw Shelled Pumpkin Seeds', amount: '1 tbsp', pcosBenefit: 'Zinc for Ovulation' },
      { item: 'Fresh Tender Coconut Water', amount: '1 glass (200ml)', pcosBenefit: 'Potassium & Hydration' }
    ],
    instructions: [
      'Mix roasted sunflower seeds and pumpkin seeds in a small bowl.',
      'Enjoy as a crunchy snack paired with a glass of fresh tender coconut water.'
    ],
    proTips: ['Pairing healthy seed fats with coconut water ensures zero glycemic impact.'],
    tags: ['Electrolytes', 'Progesterone-Support', 'No-Cook']
  },
  {
    id: 'rec_mm_hibiscus_rose_tea',
    name: 'Hibiscus & Rose Petal Anti-Inflammatory Iced Herbal Infusion',
    nameTe: 'మందార & గులాబీ రేకుల హెర్బల్ టీ',
    tagline: 'Flavonoid-rich cooling elixir that supports ovarian microcirculation',
    taglineTe: 'రక్త ప్రసరణను మెరుగుపరిచే చల్లని మందార పూల టీ',
    mealType: 'mid_morning',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 3,
    servings: 1,
    calories: 25,
    proteinGrams: 0,
    carbsGrams: 5,
    fatGrams: 0,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Hibiscus sabdariffa polyphenols improve vascular endothelial nitric oxide synthesis.',
      'Rose petals contain gentle bioflavonoids that soothe stress and calm heart rate.'
    ],
    ingredients: [
      { item: 'Dried Organic Hibiscus Flowers', amount: '1 tbsp', pcosBenefit: 'Anthocyanins & Blood Flow' },
      { item: 'Dried Pink Rose Petals', amount: '1 tsp', pcosBenefit: 'Nervous System Calmer' },
      { item: 'Stevia Leaf or Lemon Slices', amount: 'To taste', pcosBenefit: 'Zero-Calorie Flavor' }
    ],
    instructions: [
      'Steep dried hibiscus and rose petals in 1.5 cups hot water for 6 minutes.',
      'Strain, let cool, and serve chilled over ice cubes with a fresh lemon slice.'
    ],
    proTips: ['Hibiscus tea naturally supports balanced arterial blood pressure in PCOS.'],
    tags: ['Antioxidant', 'Cooling', 'Sugar-Free']
  },
  {
    id: 'rec_mm_probiotic_buttermilk',
    name: 'Probiotic Ginger Majjiga (Spiced Buttermilk) with Curry Leaves & Hing',
    nameTe: 'అల్లం కరివేపాకు మజ్జిగ (మజ్జిగ చలవ)',
    tagline: 'Live estrobolome-repairing probiotic tonic that banishes mid-day bloating',
    taglineTe: 'జీర్ణక్రియకు మరియు గట్ బాక్టీరియాకు మేలు చేసే మజ్జిగ',
    mealType: 'mid_morning',
    cravingType: 'spicy',
    preference: 'south_indian',
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 60,
    proteinGrams: 4,
    carbsGrams: 4,
    fatGrams: 2,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Live cultured buttermilk seeds healthy gut bacteria responsible for metabolizing estrogens.',
      'Ginger and asafoetida eliminate intestinal gas and sluggishness.'
    ],
    ingredients: [
      { item: 'Fresh A2 Curd / Yogurt', amount: '1/3 cup, whisked with 1 cup water', pcosBenefit: 'Live Probiotics' },
      { item: 'Crushed Ginger & Green Chili', amount: '1/2 tsp', pcosBenefit: 'Digestive Motility' },
      { item: 'Curry Leaves, Coriander & Hing', amount: 'Finely chopped', pcosBenefit: 'Gut Cleansing' },
      { item: 'Roasted Cumin Powder & Rock Salt', amount: '1/4 tsp each', pcosBenefit: 'Carminative Spices' }
    ],
    instructions: [
      'Whisk curd with cold filtered water until smooth and frothy.',
      'Add crushed ginger, green chili, chopped curry leaves, cumin powder, and rock salt.',
      'Pour into a clay cup or glass and drink 45 minutes before lunch.'
    ],
    proTips: ['Drinking dilute buttermilk stimulates stomach acid (HCL) secretion ahead of lunch.'],
    tags: ['Probiotic', 'Anti-Bloat', 'Traditional']
  },
  {
    id: 'rec_mm_apple_almond_cinnamon',
    name: 'Crisp Green Apple Slices with Pure Almond Butter & Ceylon Cinnamon',
    nameTe: 'గ్రీన్ ఆపిల్ & బాదం బటర్ (దాల్చిన చెక్కతో)',
    tagline: 'Pectin fiber "clothed" in monounsaturated fats for zero glucose spikes',
    taglineTe: 'రక్తంలో చక్కెర పెరగకుండా ఆకలిని తీర్చే ఆపిల్ & బాదం స్నాక్',
    mealType: 'mid_morning',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 155,
    proteinGrams: 4,
    carbsGrams: 16,
    fatGrams: 9,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Green apples have high malic acid and soluble pectin fiber.',
      'Almond butter provides Vitamin E and healthy fats that blunt glucose absorption.',
      'Ceylon cinnamon boosts cellular insulin receptor sensitivity.'
    ],
    ingredients: [
      { item: 'Crisp Green Granny Smith Apple', amount: '1 small, sliced', pcosBenefit: 'Pectin Fiber & Malic Acid' },
      { item: 'Pure 100% Roasted Almond Butter', amount: '1 tbsp', pcosBenefit: 'Vitamin E & Healthy Fats' },
      { item: 'Ceylon Cinnamon Dusting', amount: '1/4 tsp', pcosBenefit: 'Insulin Sensitizer' }
    ],
    instructions: [
      'Slice fresh green apple into wedges.',
      'Dip into pure almond butter dusted with Ceylon cinnamon.'
    ],
    proTips: ['Always pair fruit with fat or protein to ensure zero post-snack insulin surge.'],
    tags: ['No-Cook', 'Sweet-Tooth', 'Fiber-Rich']
  },
  {
    id: 'rec_mm_pomegranate_beet_shot',
    name: 'Pomegranate & Beetroot Nitric-Oxide Ovarian Circulation Shot',
    nameTe: 'దానిమ్మ & బీట్‌రూట్ సర్క్యులేషన్ షాట్',
    tagline: 'Potent nitrate and punicalagin surge that oxygenates ovarian follicle beds',
    taglineTe: 'అండాశయానికి రక్త ప్రసరణను పెంచే దానిమ్మ బీట్‌రూట్ రసం',
    mealType: 'mid_morning',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 65,
    proteinGrams: 1,
    carbsGrams: 14,
    fatGrams: 0,
    fiberGrams: 3,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Dietary nitrates convert to nitric oxide, dilating ovarian microvessels.',
      'Punicalagins from pomegranate seeds reduce systemic markers of lipid peroxidation.'
    ],
    ingredients: [
      { item: 'Fresh Pomegranate Arils', amount: '1/2 cup', pcosBenefit: 'Punicalagin Antioxidants' },
      { item: 'Raw Grated Beetroot', amount: '1/4 cup', pcosBenefit: 'Dietary Nitrates' },
      { item: 'Fresh Mint & Lemon Juice', amount: '1 tsp', pcosBenefit: 'Vitamin C Co-Factor' }
    ],
    instructions: [
      'Blend pomegranate arils, grated beetroot, mint, and lemon juice with 3 tbsp water.',
      'Strain lightly and drink in 2 invigorating sips.'
    ],
    proTips: ['Pomegranate punicalagins have proven efficacy against systemic ovarian oxidative stress.'],
    tags: ['Circulation', 'Nitric-Oxide', 'Skin-Glow']
  },

  // ============================================================
  // BEDTIME HORMONE SOOTHERS (7 DISTINCT DAYS)
  // ============================================================
  {
    id: 'rec_bt_golden_turmeric_elixir',
    name: 'Warm Golden Turmeric & Nutmeg Almond Elixir (Moon Milk)',
    nameTe: 'గోల్డెన్ పసుపు & బాదం పాలు (మూన్ మిల్క్)',
    tagline: 'Anti-inflammatory bedtime tonic that lowers nocturnal cortisol and supports liver cleansing',
    taglineTe: 'గాఢ నిద్ర మరియు శరీర శుద్ధి కోసం రాత్రి వేడి పసుపు బాదం పాలు',
    mealType: 'bedtime_drink',
    cravingType: 'comfort',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 85,
    proteinGrams: 3,
    carbsGrams: 5,
    fatGrams: 6,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Curcumin with black pepper piperine has 2000% enhanced absorption to calm ovarian theca inflammation.',
      'Nutmeg (Myristicin) acts on GABA receptors to induce restorative slow-wave stage 3/4 sleep.'
    ],
    ingredients: [
      { item: 'Unsweetened Almond Milk or A2 Milk', amount: '1 cup (200ml)', pcosBenefit: 'Tryptophan & Calcium' },
      { item: 'Organic High-Curcumin Turmeric', amount: '1/2 tsp', pcosBenefit: 'Active Curcumin' },
      { item: 'Grated Nutmeg & Ceylon Cinnamon', amount: '1 pinch each', pcosBenefit: 'GABA Sleep Relaxant' },
      { item: 'Fresh Crushed Black Pepper', amount: '1 pinch', pcosBenefit: '2000% Curcumin Uptake' }
    ],
    instructions: [
      'Warm almond milk gently in a saucepan.',
      'Whisk in turmeric, cinnamon, nutmeg, and black pepper. Simmer for 3 minutes.',
      'Drink warm 45 minutes before sleep in a dimly lit room.'
    ],
    proTips: ['Never add sugar or honey at night to avoid spiking nocturnal insulin.'],
    tags: ['Sleep-Aid', 'Anti-Inflammatory', 'Night-Routine']
  },
  {
    id: 'rec_bt_chamomile_lavender',
    name: 'Relaxing Chamomile & Lavender Floral Infusion with Crushed Cardamom',
    nameTe: 'చమోమిలే & లావెండర్ నిద్ర హెర్బల్ టీ',
    tagline: 'Apigenin-rich botanical infusion that binds brain benzodiazepine receptors naturally',
    taglineTe: 'ఒత్తిడి తగ్గించి గాఢ నిద్రను కలిగించే చమోమిలే టీ',
    mealType: 'bedtime_drink',
    cravingType: 'comfort',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 4,
    servings: 1,
    calories: 15,
    proteinGrams: 0,
    carbsGrams: 3,
    fatGrams: 0,
    fiberGrams: 0,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Chamomile apigenin directly promotes GABA receptor signaling for nervous relaxation.',
      'Cardamom essential oils soothe nocturnal gastric acid and bloating.'
    ],
    ingredients: [
      { item: 'Dried Organic Chamomile Flowers', amount: '1 tbsp or 1 tea bag', pcosBenefit: 'Apigenin Sedative' },
      { item: 'Culinary Lavender Buds', amount: '1/4 tsp', pcosBenefit: 'Linalool Calming' },
      { item: 'Crushed Green Cardamom Pod', amount: '1 pod', pcosBenefit: 'Digestive Ease' }
    ],
    instructions: [
      'Place chamomile, lavender, and crushed cardamom in a mug.',
      'Pour boiling water, cover with a saucer, and steep for 7 minutes.',
      'Strain and sip slowly before bedtime.'
    ],
    proTips: ['Covering while steeping traps volatile calming terpenes inside the cup.'],
    tags: ['Deep-Sleep', 'Anxiety-Relief', 'Caffeine-Free']
  },
  {
    id: 'rec_bt_ashwagandha_cinnamon',
    name: 'Ashwagandha & Ceylon Cinnamon Warm Almond Night Tonic',
    nameTe: 'అశ్వగంధ & దాల్చిన చెక్క వేడి బాదం పాలు',
    tagline: 'Clinical adaptogen that lowers nocturnal adrenal cortisol by up to 28%',
    taglineTe: 'కార్టిసాల్ ఒత్తిడిని తగ్గించే అశ్వగంధ రాత్రి పానీయం',
    mealType: 'bedtime_drink',
    cravingType: 'comfort',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 4,
    servings: 1,
    calories: 90,
    proteinGrams: 3,
    carbsGrams: 6,
    fatGrams: 6,
    fiberGrams: 2,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Withanolides in Ashwagandha downregulate overactive hypothalamic-pituitary-adrenal (HPA) axis.',
      'Helps eliminate nighttime sugar cravings and midnight awakenings.'
    ],
    ingredients: [
      { item: 'Unsweetened Warm Almond Milk', amount: '1 cup', pcosBenefit: 'Dairy-Free Vehicle' },
      { item: 'Organic Ashwagandha Powder', amount: '1/2 tsp', pcosBenefit: 'Cortisol Lowering Adaptogen' },
      { item: 'Ceylon Cinnamon & Nutmeg', amount: '1/4 tsp each', pcosBenefit: 'Glycemic Sleep Synergist' }
    ],
    instructions: [
      'Simmer warm almond milk with ashwagandha powder and cinnamon for 3 minutes.',
      'Whisk until frothy and drink 30 minutes before bedtime.'
    ],
    proTips: ['Ashwagandha is clinically proven to improve restorative sleep architecture in women with PCOS.'],
    tags: ['Cortisol-Reducer', 'Adaptogen', 'Deep-Sleep']
  },
  {
    id: 'rec_bt_fennel_ajwain_tea',
    name: 'Spiced Fennel (Saunf) & Ajwain Digestive De-Bloat Tea',
    nameTe: 'సోంపు & వాము జీర్ణక్రియ డీ-బ్లోట్ టీ',
    tagline: 'Anethole and thymol carminative blend that eliminates flatulence and digestive spasm',
    taglineTe: 'రాత్రి వేళ కడుపుబ్బరాన్ని తగ్గించే సోంపు వాము కషాయం',
    mealType: 'bedtime_drink',
    cravingType: 'hot',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 20,
    proteinGrams: 1,
    carbsGrams: 3,
    fatGrams: 0,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Fennel seeds contain anethole to relax smooth intestinal and uterine muscles.',
      'Ajwain carom seeds accelerate gut transit and prevent morning fluid retention.'
    ],
    ingredients: [
      { item: 'Organic Fennel Seeds (Saunf)', amount: '1 tsp', pcosBenefit: 'Smooth Muscle Relaxant' },
      { item: 'Ajwain (Carom Seeds)', amount: '1/2 tsp', pcosBenefit: 'Thymol Anti-Spasmodic' },
      { item: 'Fresh Crushed Ginger', amount: '1/2 inch', pcosBenefit: 'Anti-Bloat Catalyst' }
    ],
    instructions: [
      'Boil fennel seeds, ajwain, and ginger in 2 cups water for 5 minutes until reduced by half.',
      'Strain into a mug and drink warm after dinner.'
    ],
    proTips: ['Fennel tea is especially helpful during luteal phase bloating before menses.'],
    tags: ['De-Bloat', 'Digestion', 'Anti-Spasmodic']
  },
  {
    id: 'rec_bt_saffron_cardamom_milk',
    name: 'Pure Saffron & Crushed Cardamom Warm A2/Almond Milk',
    nameTe: 'కుంకుమపువ్వు & యాలకుల వేడి పాలు',
    tagline: 'Crocin and safranal mood-enhancing sleep elixir that elevates serotonin naturally',
    taglineTe: 'మంచి మానసిక ప్రశాంతత మరియు నిద్ర కోసం కుంకుమపువ్వు పాలు',
    mealType: 'bedtime_drink',
    cravingType: 'sweet',
    preference: 'vegetarian',
    prepTimeMinutes: 3,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 95,
    proteinGrams: 4,
    carbsGrams: 6,
    fatGrams: 6,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Saffron crocin boosts synaptic serotonin, reducing premenstrual dysphoria and anxiety.',
      'Warm milk provides bioavailable tryptophan for melatonin production.'
    ],
    ingredients: [
      { item: 'Warm A2 Desi Cow Milk or Almond Milk', amount: '1 cup', pcosBenefit: 'Tryptophan' },
      { item: 'Pure Kashmiri Saffron Strands', amount: '4-5 strands', pcosBenefit: 'Crocin & Mood Support' },
      { item: 'Fresh Crushed Green Cardamom', amount: '2 pods', pcosBenefit: 'Aromatic Calm' }
    ],
    instructions: [
      'Steep saffron strands in 2 tbsp warm milk for 5 minutes to release golden color.',
      'Heat remaining milk with crushed cardamom, then stir in the saffron infusion.',
      'Drink warm before bed.'
    ],
    proTips: ['Kashmiri saffron has rich scientific backing for relieving PMS emotional fluctuations.'],
    tags: ['Mood-Enhancer', 'Serotonin', 'Luxury-Wellness']
  },
  {
    id: 'rec_bt_brahmi_tulsi_tea',
    name: 'Organic Brahmi & Holy Basil (Tulsi) Neuro-Calm Herbal Tea',
    nameTe: 'బ్రాహ్మి & తులసి మైండ్ రిలాక్సింగ్ టీ',
    tagline: 'Bacoside neuro-protector that switches nervous system from fight-or-flight to rest-and-digest',
    taglineTe: 'మెదడును ప్రశాంతపరిచి ఒత్తిడిని దూరం చేసే బ్రాహ్మి తులసి టీ',
    mealType: 'bedtime_drink',
    cravingType: 'hot',
    preference: 'vegan',
    prepTimeMinutes: 2,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 15,
    proteinGrams: 0,
    carbsGrams: 3,
    fatGrams: 0,
    fiberGrams: 0,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Brahmi (Bacopa monnieri) reduces cognitive stress and enhances deep slow-wave sleep.',
      'Tulsi eugenol lowers circulating cortisol and supports balanced insulin receptors.'
    ],
    ingredients: [
      { item: 'Organic Dried Brahmi Leaves', amount: '1 tsp', pcosBenefit: 'Bacoside Neuro-Calm' },
      { item: 'Fresh Krishna Tulsi Leaves', amount: '6-8 leaves', pcosBenefit: 'Eugenol Adaptogen' },
      { item: 'Ceylon Cinnamon', amount: '1 pinch', pcosBenefit: 'Flavor' }
    ],
    instructions: [
      'Boil water, turn off heat, add brahmi and tulsi leaves, cover and steep for 6 minutes.',
      'Strain into a cup and sip slowly in a relaxing atmosphere.'
    ],
    proTips: ['Brahmi calms racing bedtime thoughts and reduces mental chatter.'],
    tags: ['Stress-Relief', 'Neuro-Calm', 'Herbal']
  },
  {
    id: 'rec_bt_golden_vanilla_moon_milk',
    name: 'Warm Golden Turmeric & Pure Vanilla Seed Moon Milk',
    nameTe: 'వెనిల్లా & పసుపు మూన్ మిల్క్',
    tagline: 'Ultra-soothing weekend night elixir that seals a week of restorative nourishment',
    taglineTe: 'వారం ముగింపులో గాఢ నిద్ర కోసం సువాసనభరితమైన వెనిల్లా మూన్ మిల్క్',
    mealType: 'bedtime_drink',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 3,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 90,
    proteinGrams: 3,
    carbsGrams: 6,
    fatGrams: 6,
    fiberGrams: 1,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Natural pure vanilla contains vanillin, which activates olfactory relaxation pathways.',
      'Turmeric and nutmeg restore circadian growth hormone surges overnight.'
    ],
    ingredients: [
      { item: 'Warm Unsweetened Cashew or Almond Milk', amount: '1 cup', pcosBenefit: 'Creamy Magnesium Base' },
      { item: 'Organic Turmeric & Ceylon Cinnamon', amount: '1/3 tsp each', pcosBenefit: 'Anti-Inflammatory' },
      { item: 'Pure Vanilla Bean Extract / Powder', amount: '1/2 tsp', pcosBenefit: 'Vanillin Relaxant' },
      { item: 'Crushed Nutmeg & Black Pepper', amount: '1 pinch each', pcosBenefit: 'GABA Precursor' }
    ],
    instructions: [
      'Warm milk in a pot with turmeric, cinnamon, black pepper, and nutmeg for 3 minutes.',
      'Turn off heat, stir in pure vanilla extract, froth with a milk frother, and enjoy warm.'
    ],
    proTips: ['Cashew milk provides natural bioavailable magnesium without any dairy mucus burden.'],
    tags: ['Weekend-Treat', 'Deep-Sleep', 'Comfort']
  }
];
