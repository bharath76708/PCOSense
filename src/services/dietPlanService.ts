/**
 * PCOSense - 7-Day Personalized Anti-PCOS Diet Plan & Recipe Engine
 * Clinically grounded in low-GI, insulin-sensitizing, and anti-androgenic nutrition.
 */

import {
  RecipeItem,
  DailyDietPlan,
  SevenDayDietPlan,
  DietPreference,
  MealCategory,
  CravingType,
  RiskLevel,
  PatientRecord
} from '../types';
import { saveFirestoreSavedRecipe, deleteFirestoreSavedRecipe } from './firestoreService';
import { auth } from '../lib/firebase';
import { MASTER_RECIPES } from '../data/recipesMaster';
import { getRecipeImage } from '../utils/recipeImages';

export { MASTER_RECIPES };

// ============================================================
// 7-DAY PERSONALIZED DIET PLAN GENERATOR
// ============================================================

export function generateSevenDayDietPlan(
  patientOrRisk?: PatientRecord | string | null,
  preference: DietPreference = 'vegetarian',
  patientData?: any
): SevenDayDietPlan {
  let riskLevel: RiskLevel = 'Moderate';
  if (typeof patientOrRisk === 'string') {
    const lower = patientOrRisk.toLowerCase();
    if (lower.includes('high') || lower.includes('elevated')) riskLevel = 'Elevated';
    else if (lower.includes('low')) riskLevel = 'Low';
    else riskLevel = 'Moderate';
  } else if (patientOrRisk && typeof patientOrRisk === 'object') {
    const lvl = (patientOrRisk as any).riskAssessment?.level || (patientOrRisk as any).risk_level || 'Moderate';
    if (String(lvl).toLowerCase().includes('high') || String(lvl).toLowerCase().includes('elevated')) riskLevel = 'Elevated';
    else if (String(lvl).toLowerCase().includes('low')) riskLevel = 'Low';
    else riskLevel = 'Moderate';
  }

  const isHighRisk = riskLevel === 'Elevated';
  
  let primaryTarget = 'Insulin Sensitization & Follicle Nourishment';
  let calorieTarget = 1600;

  if (isHighRisk) {
    primaryTarget = 'Rapid Glycemic Stabilization & Androgen Clearance';
    calorieTarget = 1500;
  } else if (riskLevel === 'Low') {
    primaryTarget = 'Ovulatory Cycle Regularization & Progesterone Boost';
    calorieTarget = 1650;
  }

  // Define distinct daily focus themes
  const dayThemes = [
    {
      name: 'Day 1: Glucose Stabilization & Insulin Reset',
      nameTe: 'రోజు 1: గ్లూకోజ్ స్థిరీకరణ & ఇన్సులిన్ రీసెట్',
      goal: 'Eliminate rapid blood sugar spikes through high-fiber seed pairings and slow-burning complex carbs.'
    },
    {
      name: 'Day 2: Anti-Inflammatory Liver Support',
      nameTe: 'రోజు 2: యాంటీ ఇన్‌ఫ్లమేటరీ లివర్ సపోర్ట్',
      goal: 'Activate liver phase 2 estrogen detoxification with cruciferous greens, allicin, and ginger.'
    },
    {
      name: 'Day 3: Androgen Blockers & DHT Reduction',
      nameTe: 'రోజు 3: ఆండ్రోజెన్ తగ్గింపు & చర్మ సంరక్షణ',
      goal: 'Incorporate zinc, selenium, spearmint, and omega-3s to lower hirsutism and facial acne.'
    },
    {
      name: 'Day 4: Ovulatory Mitochondrial Energy',
      nameTe: 'రోజు 4: అండోత్పత్తి శక్తి & ఫోలికల్ పోషణ',
      goal: 'Provide CoQ10, folate, choline, and antioxidants for follicle egg cellular health.'
    },
    {
      name: 'Day 5: Gut Microbiome & Estrobolome Care',
      nameTe: 'రోజు 5: గట్ మైక్రోబయోమ్ & జీర్ణక్రియ శుద్ధి',
      goal: 'Rebuild beneficial bifidobacteria with live prebiotic and probiotic pairings to safely excrete estrogen.'
    },
    {
      name: 'Day 6: Adrenal De-Stress & Cortisol Balance',
      nameTe: 'రోజు 6: అడ్రినల్ ఒత్తిడి తగ్గింపు & ప్రశాంతత',
      goal: 'Calm nocturnal cortisol with high-magnesium cacao, leafy greens, and soothing adaptogens.'
    },
    {
      name: 'Day 7: Weekend Nourishment & Sustainable Joy',
      nameTe: 'రోజు 7: వీకెండ్ పోషకాహారం & ఇష్టమైన భోజనం',
      goal: 'Enjoy high-flavor spiced biryani and nutrient-dense broths with zero hormone or insulin spikes.'
    }
  ];

  // Distinct recipe mappings for Vegetarian and Non-Vegetarian paths
  const vegPlanDayRecipes = [
    // Day 1
    {
      bf: 'rec_bf_foxtail_upma',
      mm: 'rec_mm_seed_tonic',
      lu: 'rec_lu_quinoa_chickpea_bowl',
      es: 'rec_es_spiced_makhana',
      di: 'rec_di_palak_tofu_millet_roti',
      bt: 'rec_bt_golden_turmeric_elixir'
    },
    // Day 2
    {
      bf: 'rec_bf_moong_chilla',
      mm: 'rec_mm_amla_ginger_shots',
      lu: 'rec_lu_methi_dal_brown_rice',
      es: 'rec_es_spearmint_tea_walnuts',
      di: 'rec_di_grilled_paneer_tikka_salad',
      bt: 'rec_bt_chamomile_lavender'
    },
    // Day 3
    {
      bf: 'rec_bf_chia_berry_pudding',
      mm: 'rec_mm_seed_trail_coconut',
      lu: 'rec_lu_kala_chana_salad',
      es: 'rec_es_roasted_edamame_tea',
      di: 'rec_di_lentil_spinach_soup',
      bt: 'rec_bt_ashwagandha_cinnamon'
    },
    // Day 4
    {
      bf: 'rec_bf_sprout_poha',
      mm: 'rec_mm_hibiscus_rose_tea',
      lu: 'rec_lu_paneer_fajita_bowl',
      es: 'rec_es_roasted_chana_masala',
      di: 'rec_di_zucchini_chickpea_curry',
      bt: 'rec_bt_fennel_ajwain_tea'
    },
    // Day 5
    {
      bf: 'rec_bf_savory_oats_khichdi',
      mm: 'rec_mm_probiotic_buttermilk',
      lu: 'rec_lu_rajma_avocado_quinoa',
      es: 'rec_es_cacao_avocado_pudding',
      di: 'rec_di_mushroom_matar_roti',
      bt: 'rec_bt_saffron_cardamom_milk'
    },
    // Day 6
    {
      bf: 'rec_bf_besan_palak_cheela',
      mm: 'rec_mm_apple_almond_cinnamon',
      lu: 'rec_lu_soya_matar_phulka',
      es: 'rec_es_chia_lemon_cooler',
      di: 'rec_cr_hot_spiced_tomato_rasam_soup',
      bt: 'rec_bt_brahmi_tulsi_tea'
    },
    // Day 7
    {
      bf: 'rec_bf_millet_idli_sambar',
      mm: 'rec_mm_pomegranate_beet_shot',
      lu: 'rec_lu_cauliflower_biryani',
      es: 'rec_es_cucumber_hummus_bites',
      di: 'rec_di_cauliflower_dum_biryani',
      bt: 'rec_bt_golden_vanilla_moon_milk'
    }
  ];

  const nonVegPlanDayRecipes = [
    // Day 1
    {
      bf: 'rec_bf_avocado_spinach_eggs',
      mm: 'rec_mm_seed_tonic',
      lu: 'rec_lu_herb_grilled_salmon_chicken',
      es: 'rec_es_spiced_makhana',
      di: 'rec_di_grilled_salmon_asparagus',
      bt: 'rec_bt_golden_turmeric_elixir'
    },
    // Day 2
    {
      bf: 'rec_bf_boiled_egg_saute',
      mm: 'rec_mm_amla_ginger_shots',
      lu: 'rec_lu_andhra_chicken_curry',
      es: 'rec_es_spearmint_tea_walnuts',
      di: 'rec_di_chicken_tikka_salad',
      bt: 'rec_bt_chamomile_lavender'
    },
    // Day 3
    {
      bf: 'rec_bf_egg_mushroom_omelet',
      mm: 'rec_mm_seed_trail_coconut',
      lu: 'rec_lu_grilled_chicken_salad',
      es: 'rec_es_roasted_edamame_tea',
      di: 'rec_di_egg_vegetable_soup',
      bt: 'rec_bt_ashwagandha_cinnamon'
    },
    // Day 4
    {
      bf: 'rec_bf_foxtail_upma_eggs',
      mm: 'rec_mm_hibiscus_rose_tea',
      lu: 'rec_lu_chicken_veg_stew',
      es: 'rec_es_roasted_chana_masala',
      di: 'rec_di_grilled_fish_tacos',
      bt: 'rec_bt_fennel_ajwain_tea'
    },
    // Day 5
    {
      bf: 'rec_bf_smoked_salmon_toast',
      mm: 'rec_mm_probiotic_buttermilk',
      lu: 'rec_lu_salmon_avocado_wrap',
      es: 'rec_es_cacao_avocado_pudding',
      di: 'rec_di_chicken_spinach_millet_roti',
      bt: 'rec_bt_saffron_cardamom_milk'
    },
    // Day 6
    {
      bf: 'rec_bf_shakshuka_eggs',
      mm: 'rec_mm_apple_almond_cinnamon',
      lu: 'rec_lu_herb_crusted_chicken',
      es: 'rec_es_chia_lemon_cooler',
      di: 'rec_di_turkey_chicken_bowl',
      bt: 'rec_bt_brahmi_tulsi_tea'
    },
    // Day 7
    {
      bf: 'rec_bf_masala_egg_bhurji',
      mm: 'rec_mm_pomegranate_beet_shot',
      lu: 'rec_lu_chicken_dum_biryani',
      es: 'rec_es_cucumber_hummus_bites',
      di: 'rec_di_spiced_mutton_bone_broth',
      bt: 'rec_bt_golden_vanilla_moon_milk'
    }
  ];

  // Distinct alternative healthy recipes for 1-click swapping
  const vegPlanDayAlternatives = [
    // Day 1
    {
      bf: 'rec_bf_besan_palak_cheela',
      mm: 'rec_mm_amla_ginger_shots',
      lu: 'rec_lu_methi_dal_brown_rice',
      es: 'rec_es_cucumber_hummus_bites',
      di: 'rec_di_grilled_paneer_tikka_salad',
      bt: 'rec_bt_chamomile_lavender'
    },
    // Day 2
    {
      bf: 'rec_bf_sprout_poha',
      mm: 'rec_mm_seed_trail_coconut',
      lu: 'rec_lu_kala_chana_salad',
      es: 'rec_es_roasted_chana_masala',
      di: 'rec_di_lentil_spinach_soup',
      bt: 'rec_bt_fennel_ajwain_tea'
    },
    // Day 3
    {
      bf: 'rec_bf_savory_oats_khichdi',
      mm: 'rec_mm_hibiscus_rose_tea',
      lu: 'rec_lu_paneer_fajita_bowl',
      es: 'rec_es_cacao_avocado_pudding',
      di: 'rec_di_zucchini_chickpea_curry',
      bt: 'rec_bt_golden_turmeric_elixir'
    },
    // Day 4
    {
      bf: 'rec_bf_millet_idli_sambar',
      mm: 'rec_mm_probiotic_buttermilk',
      lu: 'rec_lu_rajma_avocado_quinoa',
      es: 'rec_es_spiced_makhana',
      di: 'rec_di_mushroom_matar_roti',
      bt: 'rec_bt_brahmi_tulsi_tea'
    },
    // Day 5
    {
      bf: 'rec_bf_foxtail_upma',
      mm: 'rec_mm_apple_almond_cinnamon',
      lu: 'rec_lu_soya_matar_phulka',
      es: 'rec_es_chia_lemon_cooler',
      di: 'rec_cr_achari_tofu_tikka',
      bt: 'rec_bt_ashwagandha_cinnamon'
    },
    // Day 6
    {
      bf: 'rec_bf_moong_chilla',
      mm: 'rec_mm_pomegranate_beet_shot',
      lu: 'rec_lu_cauliflower_biryani',
      es: 'rec_es_spearmint_tea_walnuts',
      di: 'rec_di_palak_tofu_millet_roti',
      bt: 'rec_bt_golden_vanilla_moon_milk'
    },
    // Day 7
    {
      bf: 'rec_bf_chia_berry_pudding',
      mm: 'rec_mm_seed_tonic',
      lu: 'rec_lu_quinoa_chickpea_bowl',
      es: 'rec_cr_cacao_avocado_mousse',
      di: 'rec_cr_hot_spiced_tomato_rasam_soup',
      bt: 'rec_bt_saffron_cardamom_milk'
    }
  ];

  const nonVegPlanDayAlternatives = [
    // Day 1
    {
      bf: 'rec_bf_boiled_egg_saute',
      mm: 'rec_mm_amla_ginger_shots',
      lu: 'rec_lu_andhra_chicken_curry',
      es: 'rec_es_spearmint_tea_walnuts',
      di: 'rec_di_chicken_tikka_salad',
      bt: 'rec_bt_chamomile_lavender'
    },
    // Day 2
    {
      bf: 'rec_bf_egg_mushroom_omelet',
      mm: 'rec_mm_seed_trail_coconut',
      lu: 'rec_lu_grilled_chicken_salad',
      es: 'rec_es_roasted_edamame_tea',
      di: 'rec_di_egg_vegetable_soup',
      bt: 'rec_bt_ashwagandha_cinnamon'
    },
    // Day 3
    {
      bf: 'rec_bf_foxtail_upma_eggs',
      mm: 'rec_mm_hibiscus_rose_tea',
      lu: 'rec_lu_chicken_veg_stew',
      es: 'rec_es_roasted_chana_masala',
      di: 'rec_di_grilled_fish_tacos',
      bt: 'rec_bt_fennel_ajwain_tea'
    },
    // Day 4
    {
      bf: 'rec_bf_smoked_salmon_toast',
      mm: 'rec_mm_probiotic_buttermilk',
      lu: 'rec_lu_salmon_avocado_wrap',
      es: 'rec_es_cacao_avocado_pudding',
      di: 'rec_di_chicken_spinach_millet_roti',
      bt: 'rec_bt_saffron_cardamom_milk'
    },
    // Day 5
    {
      bf: 'rec_bf_shakshuka_eggs',
      mm: 'rec_mm_apple_almond_cinnamon',
      lu: 'rec_lu_herb_crusted_chicken',
      es: 'rec_es_chia_lemon_cooler',
      di: 'rec_di_turkey_chicken_bowl',
      bt: 'rec_bt_brahmi_tulsi_tea'
    },
    // Day 6
    {
      bf: 'rec_bf_masala_egg_bhurji',
      mm: 'rec_mm_pomegranate_beet_shot',
      lu: 'rec_lu_chicken_dum_biryani',
      es: 'rec_es_cucumber_hummus_bites',
      di: 'rec_di_spiced_mutton_bone_broth',
      bt: 'rec_bt_golden_vanilla_moon_milk'
    },
    // Day 7
    {
      bf: 'rec_bf_avocado_spinach_eggs',
      mm: 'rec_mm_seed_tonic',
      lu: 'rec_lu_herb_grilled_salmon_chicken',
      es: 'rec_es_spiced_makhana',
      di: 'rec_di_grilled_salmon_asparagus',
      bt: 'rec_bt_golden_turmeric_elixir'
    }
  ];

  const planMapping = preference === 'non_vegetarian' ? nonVegPlanDayRecipes : vegPlanDayRecipes;
  const altMapping = preference === 'non_vegetarian' ? nonVegPlanDayAlternatives : vegPlanDayAlternatives;

  const findRecipe = (id: string, fallbackType: MealCategory): RecipeItem => {
    const found = MASTER_RECIPES.find(r => r.id === id);
    const item = found || MASTER_RECIPES.find(r => r.mealType === fallbackType) || MASTER_RECIPES[0];
    return {
      ...item,
      imageUrl: item.imageUrl && item.imageUrl.startsWith('/assets/') ? item.imageUrl : getRecipeImage(item)
    };
  };

  const days: DailyDietPlan[] = dayThemes.map((theme, idx) => {
    const dayNum = idx + 1;
    const recipeMap = planMapping[idx] || vegPlanDayRecipes[0];
    const altMap = altMapping[idx] || vegPlanDayAlternatives[0];

    const bf = findRecipe(recipeMap.bf, 'breakfast');
    const mm = findRecipe(recipeMap.mm, 'mid_morning');
    const lu = findRecipe(recipeMap.lu, 'lunch');
    const es = findRecipe(recipeMap.es, 'evening_snack');
    const di = findRecipe(recipeMap.di, 'dinner');
    const bt = findRecipe(recipeMap.bt, 'bedtime_drink');

    // Alternatives for 1-click Swap Meal
    const altBf = findRecipe(altMap.bf, 'breakfast');
    const altMm = findRecipe(altMap.mm, 'mid_morning');
    const altLu = findRecipe(altMap.lu, 'lunch');
    const altEs = findRecipe(altMap.es, 'evening_snack');
    const altDi = findRecipe(altMap.di, 'dinner');
    const altBt = findRecipe(altMap.bt, 'bedtime_drink');

    const totalCal = (bf.calories || 280) + (mm.calories || 100) + (lu.calories || 400) + (es.calories || 130) + (di.calories || 340) + (bt.calories || 85);
    const totalProt = (bf.proteinGrams || 10) + (mm.proteinGrams || 4) + (lu.proteinGrams || 18) + (es.proteinGrams || 3) + (di.proteinGrams || 16) + (bt.proteinGrams || 3);
    const totalCarbs = (bf.carbsGrams || 30) + (mm.carbsGrams || 10) + (lu.carbsGrams || 45) + (es.carbsGrams || 15) + (di.carbsGrams || 35) + (bt.carbsGrams || 5);
    const totalFat = (bf.fatGrams || 8) + (mm.fatGrams || 5) + (lu.fatGrams || 12) + (es.fatGrams || 6) + (di.fatGrams || 14) + (bt.fatGrams || 3);
    const totalFib = (bf.fiberGrams || 8) + (mm.fiberGrams || 3) + (lu.fiberGrams || 11) + (es.fiberGrams || 3) + (di.fiberGrams || 8) + (bt.fiberGrams || 1);

    return {
      dayNumber: dayNum,
      dayName: `Day ${dayNum}`,
      dayNameTe: `రోజు ${dayNum}`,
      theme: theme.name,
      themeTe: theme.nameTe,
      targetCalories: totalCal,
      targetProtein: totalProt,
      targetCarbs: totalCarbs,
      targetFat: totalFat,
      targetFiber: totalFib,
      primaryHormoneGoal: theme.goal,
      meals: {
        breakfast: bf,
        midMorning: mm,
        lunch: lu,
        eveningSnack: es,
        dinner: di,
        bedtimeDrink: bt
      },
      alternativeMeals: {
        breakfast: altBf,
        midMorning: altMm,
        lunch: altLu,
        eveningSnack: altEs,
        dinner: altDi,
        bedtimeDrink: altBt
      }
    };
  });

  return {
    id: `plan_${preference}_${Date.now()}`,
    createdAt: new Date().toISOString(),
    patientRiskLevel: riskLevel,
    preference,
    primaryTarget,
    calorieTarget,
    days,
    guidelines: [
      {
        title: 'Rule 1: Always "Cloth Your Carbs"',
        description: 'Never eat a carbohydrate alone. Always pair fruit, rice, or roti with fiber, healthy fats, or clean protein to prevent insulin surges.'
      },
      {
        title: 'Rule 2: Two Cups of Spearmint Daily',
        description: 'Drink 1 cup in the mid-morning and 1 cup at 4-5 PM. Spearmint has proven clinical efficacy for reducing androgen excess and hirsutism.'
      },
      {
        title: 'Rule 3: Ten-Minute Post-Meal Walk',
        description: 'Take a gentle 10-minute walk after lunch and dinner to activate muscle GLUT4 receptors and clear glucose without requiring insulin.'
      },
      {
        title: 'Rule 4: Prioritize 35+ Grams of Daily Fiber',
        description: 'Soluble and insoluble fiber bind to recirculating estrogens in the intestinal tract, ensuring safe excretion via the bowel.'
      }
    ]
  };
}

// ============================================================
// SAVED RECIPES PERSISTENCE (BOOKMARKS)
// ============================================================

const SAVED_RECIPES_KEY = 'pcosense_saved_recipes_collection';

export function getSavedRecipes(): RecipeItem[] {
  try {
    const raw = localStorage.getItem(SAVED_RECIPES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading saved recipes:', err);
    return [];
  }
}

export function saveRecipe(recipe: RecipeItem): boolean {
  try {
    const existing = getSavedRecipes();
    if (existing.some(r => r.id === recipe.id)) {
      return true; // Already saved
    }
    const updated = [recipe, ...existing];
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updated));

    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      saveFirestoreSavedRecipe(currentUser.uid, recipe).catch(err => {
        console.warn('Firestore saved recipe sync deferred:', err);
      });
    }

    return true;
  } catch (err) {
    console.error('Error saving recipe:', err);
    return false;
  }
}

export function removeSavedRecipe(recipeId: string): boolean {
  try {
    const existing = getSavedRecipes();
    const filtered = existing.filter(r => r.id !== recipeId);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(filtered));

    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      deleteFirestoreSavedRecipe(currentUser.uid, recipeId).catch(err => {
        console.warn('Firestore saved recipe delete deferred:', err);
      });
    }

    return true;
  } catch (err) {
    console.error('Error removing saved recipe:', err);
    return false;
  }
}

export function isRecipeSaved(recipeId: string): boolean {
  const existing = getSavedRecipes();
  return existing.some(r => r.id === recipeId);
}

// ============================================================
// CRAVING CHATBOT RECIPE MATCHER (LOCAL & SMART ENGINE)
// ============================================================

export function searchRecipesByCraving(query: string, cravingType?: CravingType): RecipeItem[] {
  const q = query.toLowerCase().trim();
  
  return MASTER_RECIPES.filter(recipe => {
    if (cravingType && recipe.cravingType === cravingType) return true;
    if (q.includes('spicy') || q.includes('hot') || q.includes('chili') || q.includes('tikka')) {
      if (recipe.cravingType === 'spicy' || (Array.isArray(recipe.tags) && recipe.tags.includes('Spicy'))) return true;
    }
    if (q.includes('sweet') || q.includes('dessert') || q.includes('chocolate') || q.includes('pudding') || q.includes('sugar')) {
      if (recipe.cravingType === 'sweet' || (Array.isArray(recipe.tags) && recipe.tags.includes('Sweet-Craving'))) return true;
    }
    if (q.includes('soup') || q.includes('broth') || q.includes('rasam') || q.includes('comfort')) {
      if (recipe.cravingType === 'hot' || recipe.cravingType === 'comfort') return true;
    }
    if (q.includes('crunch') || q.includes('snack') || q.includes('chips') || q.includes('makhana')) {
      if (recipe.cravingType === 'crunchy') return true;
    }
    if (q.includes('biryani') || q.includes('feast') || q.includes('special') || q.includes('party')) {
      if (recipe.cravingType === 'special') return true;
    }
    // General keyword match
    return (
      (recipe.name || '').toLowerCase().includes(q) ||
      (recipe.tagline || '').toLowerCase().includes(q) ||
      (Array.isArray(recipe.tags) && recipe.tags.some(t => (t || '').toLowerCase().includes(q)))
    );
  });
}

// ============================================================
// DYNAMIC MACRO-NUTRIENT CALCULATOR
// ============================================================

export interface DailyNutrientProfile {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export function calculateDailyNutrients(
  meals: Record<string, RecipeItem | undefined>
): DailyNutrientProfile {
  const mealList = Object.values(meals).filter((m): m is RecipeItem => Boolean(m));
  const calories = mealList.reduce((acc, m) => acc + (m.calories || 0), 0);
  const proteinGrams = mealList.reduce((acc, m) => acc + (m.proteinGrams || 0), 0);
  const carbsGrams = mealList.reduce((acc, m) => acc + (m.carbsGrams || 0), 0);
  const fatGrams = mealList.reduce((acc, m) => acc + (m.fatGrams || 0), 0);
  const fiberGrams = mealList.reduce((acc, m) => acc + (m.fiberGrams || 0), 0);

  const totalMacroCal = (proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9);
  const proteinPct = totalMacroCal > 0 ? Math.round(((proteinGrams * 4) / totalMacroCal) * 100) : 25;
  const carbsPct = totalMacroCal > 0 ? Math.round(((carbsGrams * 4) / totalMacroCal) * 100) : 45;
  const fatPct = totalMacroCal > 0 ? Math.round(((fatGrams * 9) / totalMacroCal) * 100) : 30;

  return {
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    proteinPct,
    carbsPct,
    fatPct
  };
}

/**
 * Returns alternative healthy recipes for a given meal type and preference
 */
export function getCuratedMealAlternatives(
  currentRecipeId: string,
  mealType: MealCategory,
  preference: DietPreference
): RecipeItem[] {
  return MASTER_RECIPES.filter(r => {
    if (r.id === currentRecipeId) return false;
    if (r.mealType !== mealType) return false;
    if (preference === 'vegetarian' || preference === 'vegan' || preference === 'south_indian') {
      return r.preference === 'vegetarian' || r.preference === 'vegan';
    }
    return true; // For non-vegetarian, allow any healthy option
  });
}

