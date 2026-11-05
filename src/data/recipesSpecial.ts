import { RecipeItem } from '../types';

export const SPECIAL_RECIPES: RecipeItem[] = [
  {
    id: 'rec_cr_achari_tofu_tikka',
    name: 'Fiery Achari Paneer / Tofu Tikka with Mint Yogurt Dip',
    nameTe: 'అచారీ పనీర్ / టోఫు టిక్కా (పుదీనా పెరుగుతో)',
    tagline: 'Satisfies intense spicy cravings with pickling spices that stimulate digestive fire',
    taglineTe: 'కారంగా ఉండే ఆహారం తినాలనిపించినప్పుడు ఆరోగ్యకరమైన అచారీ టిక్కా',
    mealType: 'dinner',
    cravingType: 'spicy',
    preference: 'vegetarian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    calories: 295,
    proteinGrams: 19,
    carbsGrams: 12,
    fatGrams: 16,
    fiberGrams: 5,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      'Pickling spices (fennel, nigella kalonji, mustard, fenugreek) contain anti-inflammatory phytochemicals.',
      'Tofu / Paneer provides bioavailable zinc and calcium without glycemic burden.'
    ],
    ingredients: [
      { item: 'Organic Firm Tofu or Low-Fat Paneer Cubes', amount: '200g', pcosBenefit: '19g Clean Protein' },
      { item: 'Achari Masala (Kalonji, Mustard, Methi, Fennel seeds)', amount: '1 tbsp', pcosBenefit: 'Digestive & Anti-Inflammatory' },
      { item: 'A2 Curd / Coconut Yogurt Marinade', amount: '3 tbsp', pcosBenefit: 'Probiotic Base' },
      { item: 'Fresh Mint Leaves & Lemon Juice', amount: '1/2 cup + 1 tbsp', pcosBenefit: 'Cooling Enzymes' }
    ],
    instructions: [
      'Mix achari spices, mustard oil (1/2 tsp), turmeric, and curd into a paste.',
      'Coat tofu or paneer cubes with marinade and let sit for 10 minutes.',
      'Grill on a hot pan or air-fry at 190°C for 10 minutes until sizzling and crisp-edged.',
      'Serve with homemade chilled mint-yogurt dip.'
    ],
    proTips: ['Nigella seeds (Kalonji) have clinical evidence in reducing fasting blood sugar.'],
    tags: ['Spicy-Craving', 'High-Protein', 'Low-Carb']
  },
  {
    id: 'rec_cr_cacao_avocado_mousse',
    name: 'Velvety Dark Cacao Avocado Mousse with Crushed Pistachios',
    nameTe: 'డార్క్ చాక్లెట్ ఎవకాడో మౌస్ (పిస్తా గింజలతో)',
    tagline: 'Rich, glossy chocolate dessert that halts sugar cravings and floods cells with magnesium',
    taglineTe: 'తీపి తినాలనే కోరికను అదుపు చేసే డార్క్ చాక్లెట్ మౌస్',
    mealType: 'evening_snack',
    cravingType: 'sweet',
    preference: 'vegan',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 2,
    calories: 180,
    proteinGrams: 4,
    carbsGrams: 14,
    fatGrams: 13,
    fiberGrams: 7,
    glycemicIndex: 'Low',
    pcosHormoneBenefits: [
      '100% raw cacao is rich in theobromine and bioflavonoids that elevate mood and dopamine.',
      'Avocado fats slow down carbohydrate absorption, preventing insulin spikes.'
    ],
    ingredients: [
      { item: 'Ripe Hass Avocado', amount: '1 medium', pcosBenefit: 'Healthy Hormone Fats' },
      { item: '100% Raw Unsweetened Cacao Powder', amount: '3 tbsp', pcosBenefit: 'Magnesium & Flavonols' },
      { item: 'Pure Ceylon Cinnamon & Sea Salt', amount: '1/4 tsp each', pcosBenefit: 'Insulin Sensitizer' },
      { item: 'Stevia or Monk Fruit drops', amount: 'To taste', pcosBenefit: 'Zero-Calorie Natural Sweetener' },
      { item: 'Crushed Raw Pistachios', amount: '1 tbsp', pcosBenefit: 'Lutein & Crunch' }
    ],
    instructions: [
      'Scoop avocado into a food processor or high-speed blender.',
      'Add raw cacao powder, unsweetened almond milk (2 tbsp), vanilla, cinnamon, and sweetener.',
      'Blend on high for 60 seconds until silky, glossy, and cloud-like.',
      'Chill in the fridge for 20 minutes, top with crushed pistachios and a pinch of flaky sea salt, and serve.'
    ],
    proTips: ['Cacao satisfies chocolate cravings by directly replenishing intracellular magnesium.'],
    tags: ['Sweet-Craving', 'Magnesium-Rich', 'No-Cook', 'Vegan']
  }
];
