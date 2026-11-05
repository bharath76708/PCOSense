import { RecipeItem, MealCategory } from '../types';

/**
 * Authentic, appetizing, high-resolution food photography for PCOS-friendly nutrition.
 * Mapped to verified local assets in public/assets.
 */

// Master dictionary mapping each specific recipe ID to its high-quality local image
export const RECIPE_IMAGE_BY_ID: Record<string, string> = {
  // ==========================================
  // BREAKFASTS - VEGETARIAN
  // ==========================================
  rec_bf_foxtail_upma: '/assets/foxtail_upma.jpg',
  rec_bf_moong_chilla: '/assets/moong_chilla.jpg',
  rec_bf_chia_berry_pudding: '/assets/chia_berry_pudding.jpg',
  rec_bf_sprout_poha: '/assets/sprout_poha.jpg',
  rec_bf_savory_oats_khichdi: '/assets/oats_khichdi.jpg',
  rec_bf_besan_palak_cheela: '/assets/besan_cheela.jpg',
  rec_bf_millet_idli_sambar: '/assets/millet_idli_sambar.jpg',

  // ==========================================
  // BREAKFASTS - NON-VEGETARIAN
  // ==========================================
  rec_bf_avocado_spinach_eggs: '/assets/avocado_spinach_eggs.jpg',
  rec_bf_boiled_egg_saute: '/assets/boiled_egg_saute.jpg',
  rec_bf_egg_mushroom_omelet: '/assets/egg_mushroom_omelet.jpg',
  rec_bf_foxtail_upma_eggs: '/assets/foxtail_upma_eggs.jpg',
  rec_bf_smoked_salmon_toast: '/assets/smoked_salmon_toast.jpg',
  rec_bf_shakshuka_eggs: '/assets/shakshuka_eggs.jpg',
  rec_bf_masala_egg_bhurji: '/assets/masala_egg_bhurji.jpg',

  // ==========================================
  // MID-MORNING HORMONAL BOOSTERS
  // ==========================================
  rec_mm_seed_tonic: '/assets/seed_tonic.jpg',
  rec_mm_amla_ginger_shots: '/assets/amla_ginger_shots.jpg',
  rec_mm_seed_trail_coconut: '/assets/seed_trail_coconut.jpg',
  rec_mm_hibiscus_rose_tea: '/assets/hibiscus_rose_tea.jpg',
  rec_mm_probiotic_buttermilk: '/assets/probiotic_buttermilk.jpg',
  rec_mm_apple_almond_cinnamon: '/assets/apple_almond_cinnamon.jpg',
  rec_mm_pomegranate_beet_shot: '/assets/pomegranate_beet_shot.jpg',

  // ==========================================
  // LUNCHES - VEGETARIAN
  // ==========================================
  rec_lu_quinoa_chickpea_bowl: '/assets/quinoa_chickpea_bowl.jpg',
  rec_lu_methi_dal_brown_rice: '/assets/methi_dal_brown_rice.jpg',
  rec_lu_kala_chana_salad: '/assets/kala_chana_salad.jpg',
  rec_lu_paneer_fajita_bowl: '/assets/paneer_fajita_bowl.jpg',
  rec_lu_rajma_avocado_quinoa: '/assets/rajma_avocado_quinoa.jpg',
  rec_lu_soya_matar_phulka: '/assets/soya_matar_phulka.jpg',
  rec_lu_cauliflower_biryani: '/assets/cauliflower_biryani.jpg',

  // ==========================================
  // LUNCHES - NON-VEGETARIAN
  // ==========================================
  rec_lu_herb_grilled_salmon_chicken: '/assets/grilled_salmon_chicken.jpg',
  rec_lu_andhra_chicken_curry: '/assets/andhra_chicken_curry.jpg',
  rec_lu_grilled_chicken_salad: '/assets/grilled_chicken_salad.jpg',
  rec_lu_chicken_veg_stew: '/assets/chicken_veg_stew.jpg',
  rec_lu_salmon_avocado_wrap: '/assets/salmon_avocado_wrap.jpg',
  rec_lu_herb_crusted_chicken: '/assets/herb_crusted_chicken.jpg',
  rec_lu_chicken_dum_biryani: '/assets/chicken_dum_biryani.jpg',

  // ==========================================
  // EVENING SNACKS
  // ==========================================
  rec_es_spiced_makhana: '/assets/spiced_makhana.jpg',
  rec_es_spearmint_tea_walnuts: '/assets/spearmint_tea_walnuts.jpg',
  rec_es_roasted_edamame_tea: '/assets/roasted_edamame_tea.jpg',
  rec_es_roasted_chana_masala: '/assets/roasted_chana_masala.jpg',
  rec_es_cacao_avocado_pudding: '/assets/cacao_avocado_pudding.jpg',
  rec_es_chia_lemon_cooler: '/assets/chia_lemon_cooler.jpg',
  rec_es_cucumber_hummus_bites: '/assets/cucumber_hummus_bites.jpg',

  // ==========================================
  // DINNERS - VEGETARIAN
  // ==========================================
  rec_di_palak_tofu_millet_roti: '/assets/palak_tofu_millet_roti.jpg',
  rec_di_grilled_paneer_tikka_salad: '/assets/grilled_paneer_tikka_salad.jpg',
  rec_di_lentil_spinach_soup: '/assets/lentil_spinach_soup.jpg',
  rec_di_zucchini_chickpea_curry: '/assets/zucchini_chickpea_curry.jpg',
  rec_di_mushroom_matar_roti: '/assets/mushroom_matar_roti.jpg',
  rec_di_cauliflower_dum_biryani: '/assets/cauliflower_dum_biryani.jpg',

  // ==========================================
  // DINNERS - NON-VEGETARIAN
  // ==========================================
  rec_di_grilled_salmon_asparagus: '/assets/grilled_salmon_asparagus.jpg',
  rec_di_chicken_tikka_salad: '/assets/chicken_tikka_salad.jpg',
  rec_di_egg_vegetable_soup: '/assets/egg_vegetable_soup.jpg',
  rec_di_grilled_fish_tacos: '/assets/grilled_fish_tacos.jpg',
  rec_di_chicken_spinach_millet_roti: '/assets/chicken_spinach_millet_roti.jpg',
  rec_di_turkey_chicken_bowl: '/assets/turkey_chicken_bowl.jpg',
  rec_di_spiced_mutton_bone_broth: '/assets/spiced_mutton_bone_broth.jpg',

  // ==========================================
  // BEDTIME HORMONE SOOTHERS
  // ==========================================
  rec_bt_golden_turmeric_elixir: '/assets/golden_turmeric_elixir.jpg',
  rec_bt_chamomile_lavender: '/assets/chamomile_lavender.jpg',
  rec_bt_ashwagandha_cinnamon: '/assets/ashwagandha_cinnamon.jpg',
  rec_bt_fennel_ajwain_tea: '/assets/fennel_ajwain_tea.jpg',
  rec_bt_saffron_cardamom_milk: '/assets/saffron_cardamom_milk.jpg',
  rec_bt_brahmi_tulsi_tea: '/assets/brahmi_tulsi_tea.jpg',
  rec_bt_golden_vanilla_moon_milk: '/assets/golden_vanilla_moon_milk.jpg',

  // ==========================================
  // SPECIAL & CRAVING RECIPES
  // ==========================================
  rec_cr_hot_spiced_tomato_rasam_soup: '/assets/tomato_rasam_soup.jpg',
  rec_cr_achari_tofu_tikka: '/assets/achari_tofu_tikka.jpg',
  rec_cr_cacao_avocado_mousse: '/assets/cacao_avocado_mousse.jpg',
  rec_cr_dark_chocolate_avocado_fudge: '/assets/cacao_avocado_pudding.jpg',
  rec_cr_sweet_potato_cinnamon_fries: '/assets/sweet_potato_cinnamon_fries.jpg',
  rec_cr_spiced_roasted_makhana_peri: '/assets/spiced_makhana.jpg',
  rec_cr_chia_berry_superfood_parfait: '/assets/chia_berry_pudding.jpg',
  rec_cr_masala_baked_kale_crisps: '/assets/roasted_edamame_tea.jpg',
  rec_cr_chilled_tender_coconut_lime: '/assets/chia_lemon_cooler.jpg',
  rec_cr_chilled_golden_anti_inflammatory_latte: '/assets/golden_turmeric_elixir.jpg',

  // Nutrition tracking recipes mapping
  'rec-spiced-foxtail-upma': '/assets/foxtail_upma.jpg',
  'rec-spearmint-seed-smoothie': '/assets/seed_tonic.jpg',
  'rec-quinoa-edamame-buddha-bowl': '/assets/quinoa_chickpea_bowl.jpg',
  'rec-spiced-roasted-makhana': '/assets/spiced_makhana.jpg',
  'rec-palak-paneer-jowar-roti': '/assets/palak_tofu_millet_roti.jpg',
  'rec-chamomile-magnesium-elixir': '/assets/chamomile_lavender.jpg'
};

// Fallback high-definition food photography pointing to local assets
export const MORNING_ELIXIR_IMG = '/assets/seed_tonic.jpg';
export const BREAKFAST_VEG_IMG = '/assets/foxtail_upma.jpg';
export const BREAKFAST_NONVEG_IMG = '/assets/avocado_spinach_eggs.jpg';
export const LUNCH_VEG_IMG = '/assets/quinoa_chickpea_bowl.jpg';
export const LUNCH_NONVEG_IMG = '/assets/andhra_chicken_curry.jpg';
export const SNACK_IMG = '/assets/spiced_makhana.jpg';
export const DINNER_VEG_IMG = '/assets/palak_tofu_millet_roti.jpg';
export const DINNER_NONVEG_IMG = '/assets/grilled_salmon_asparagus.jpg';
export const BEDTIME_IMG = '/assets/chamomile_lavender.jpg';

/**
 * Maps a recipe title and optional preference to the most relevant high-quality local image.
 */
export function getRecipeImageByTitle(title: string, preference?: string): string {
  const t = (title || '').toLowerCase();

  // Breakfast items
  if (t.includes('foxtail') && (t.includes('egg') || preference === 'non_vegetarian')) {
    return '/assets/foxtail_upma_eggs.jpg';
  }
  if (t.includes('foxtail') || t.includes('upma')) {
    return '/assets/foxtail_upma.jpg';
  }
  if (t.includes('moong') && (t.includes('chilla') || t.includes('cheela'))) {
    return '/assets/moong_chilla.jpg';
  }
  if (t.includes('besan') && (t.includes('cheela') || t.includes('chilla'))) {
    return '/assets/besan_cheela.jpg';
  }
  if (t.includes('chia') && t.includes('pudding')) {
    return '/assets/chia_berry_pudding.jpg';
  }
  if (t.includes('poha')) {
    return '/assets/sprout_poha.jpg';
  }
  if (t.includes('oats') && t.includes('khichdi')) {
    return '/assets/oats_khichdi.jpg';
  }
  if (t.includes('idli') || t.includes('sambar')) {
    return '/assets/millet_idli_sambar.jpg';
  }
  if (t.includes('avocado') && (t.includes('egg') || t.includes('scramble'))) {
    return '/assets/avocado_spinach_eggs.jpg';
  }
  if (t.includes('boiled egg')) {
    return '/assets/boiled_egg_saute.jpg';
  }
  if (t.includes('omelet') || t.includes('egg white')) {
    return '/assets/egg_mushroom_omelet.jpg';
  }
  if (t.includes('smoked salmon')) {
    return '/assets/smoked_salmon_toast.jpg';
  }
  if (t.includes('shakshuka')) {
    return '/assets/shakshuka_eggs.jpg';
  }
  if (t.includes('bhurji')) {
    return '/assets/masala_egg_bhurji.jpg';
  }

  // Mid-Morning items
  if (t.includes('seed tonic') || (t.includes('spearmint') && t.includes('water'))) {
    return '/assets/seed_tonic.jpg';
  }
  if (t.includes('amla') || t.includes('ginger shot')) {
    return '/assets/amla_ginger_shots.jpg';
  }
  if (t.includes('trail mix') || (t.includes('sunflower') && t.includes('pumpkin'))) {
    return '/assets/seed_trail_coconut.jpg';
  }
  if (t.includes('hibiscus') || t.includes('rose tea')) {
    return '/assets/hibiscus_rose_tea.jpg';
  }
  if (t.includes('buttermilk') || t.includes('chaas')) {
    return '/assets/probiotic_buttermilk.jpg';
  }
  if (t.includes('apple') && (t.includes('almond') || t.includes('cinnamon'))) {
    return '/assets/apple_almond_cinnamon.jpg';
  }
  if (t.includes('beetroot') || t.includes('pomegranate')) {
    return '/assets/pomegranate_beet_shot.jpg';
  }

  // Lunch items - Vegetarian
  if (t.includes('quinoa') && t.includes('chickpea')) {
    return '/assets/quinoa_chickpea_bowl.jpg';
  }
  if (t.includes('methi dal') || (t.includes('dal') && t.includes('brown rice'))) {
    return '/assets/methi_dal_brown_rice.jpg';
  }
  if (t.includes('kala chana')) {
    return '/assets/kala_chana_salad.jpg';
  }
  if (t.includes('fajita') && (t.includes('paneer') || t.includes('tofu'))) {
    return '/assets/paneer_fajita_bowl.jpg';
  }
  if (t.includes('rajma')) {
    return '/assets/rajma_avocado_quinoa.jpg';
  }
  if (t.includes('soya') && t.includes('matar')) {
    return '/assets/soya_matar_phulka.jpg';
  }
  if (t.includes('cauliflower') && t.includes('biryani')) {
    return '/assets/cauliflower_dum_biryani.jpg';
  }

  // Lunch items - Non-Vegetarian
  if (t.includes('andhra') && t.includes('chicken')) {
    return '/assets/andhra_chicken_curry.jpg';
  }
  if (t.includes('grilled chicken salad') || (t.includes('chicken') && t.includes('salad'))) {
    return '/assets/grilled_chicken_salad.jpg';
  }
  if (t.includes('chicken') && t.includes('stew')) {
    return '/assets/chicken_veg_stew.jpg';
  }
  if (t.includes('salmon') && t.includes('wrap')) {
    return '/assets/salmon_avocado_wrap.jpg';
  }
  if (t.includes('herb-crusted') || t.includes('crusted chicken')) {
    return '/assets/herb_crusted_chicken.jpg';
  }
  if (t.includes('chicken') && t.includes('biryani')) {
    return '/assets/chicken_dum_biryani.jpg';
  }
  if (t.includes('grilled salmon') || (t.includes('salmon') && t.includes('chicken'))) {
    return '/assets/grilled_salmon_chicken.jpg';
  }

  // Evening snacks
  if (t.includes('makhana') || t.includes('foxnut')) {
    return '/assets/spiced_makhana.jpg';
  }
  if (t.includes('spearmint') && t.includes('walnut')) {
    return '/assets/spearmint_tea_walnuts.jpg';
  }
  if (t.includes('edamame')) {
    return '/assets/roasted_edamame_tea.jpg';
  }
  if (t.includes('roasted chana') || t.includes('bhuna chana')) {
    return '/assets/roasted_chana_masala.jpg';
  }
  if (t.includes('cacao') || t.includes('chocolate') || t.includes('mousse') || t.includes('fudge')) {
    return '/assets/cacao_avocado_mousse.jpg';
  }
  if (t.includes('chia') && t.includes('lemon')) {
    return '/assets/chia_lemon_cooler.jpg';
  }
  if (t.includes('cucumber') && t.includes('hummus')) {
    return '/assets/cucumber_hummus_bites.jpg';
  }
  if (t.includes('sweet potato')) {
    return '/assets/sweet_potato_cinnamon_fries.jpg';
  }

  // Dinners - Vegetarian
  if (t.includes('palak') && (t.includes('tofu') || t.includes('paneer'))) {
    return '/assets/palak_tofu_millet_roti.jpg';
  }
  if (t.includes('paneer tikka') || t.includes('tofu tikka')) {
    return '/assets/grilled_paneer_tikka_salad.jpg';
  }
  if (t.includes('achari')) {
    return '/assets/achari_tofu_tikka.jpg';
  }
  if (t.includes('lentil') && t.includes('soup')) {
    return '/assets/lentil_spinach_soup.jpg';
  }
  if (t.includes('zucchini') && t.includes('curry')) {
    return '/assets/zucchini_chickpea_curry.jpg';
  }
  if (t.includes('mushroom') && t.includes('matar')) {
    return '/assets/mushroom_matar_roti.jpg';
  }
  if (t.includes('rasam') || t.includes('tomato')) {
    return '/assets/tomato_rasam_soup.jpg';
  }

  // Dinners - Non-Vegetarian
  if (t.includes('salmon') && t.includes('asparagus')) {
    return '/assets/grilled_salmon_asparagus.jpg';
  }
  if (t.includes('chicken tikka')) {
    return '/assets/chicken_tikka_salad.jpg';
  }
  if (t.includes('egg drop') || (t.includes('egg') && t.includes('soup'))) {
    return '/assets/egg_vegetable_soup.jpg';
  }
  if (t.includes('fish taco') || t.includes('fish')) {
    return '/assets/grilled_fish_tacos.jpg';
  }
  if (t.includes('palak chicken') || (t.includes('chicken') && t.includes('spinach'))) {
    return '/assets/chicken_spinach_millet_roti.jpg';
  }
  if (t.includes('turkey') || (t.includes('minced chicken') && t.includes('bowl'))) {
    return '/assets/turkey_chicken_bowl.jpg';
  }
  if (t.includes('bone broth') || t.includes('mutton')) {
    return '/assets/spiced_mutton_bone_broth.jpg';
  }

  // Bedtime drinks
  if (t.includes('golden turmeric') || t.includes('turmeric elixir')) {
    return '/assets/golden_turmeric_elixir.jpg';
  }
  if (t.includes('chamomile') || t.includes('lavender')) {
    return '/assets/chamomile_lavender.jpg';
  }
  if (t.includes('ashwagandha')) {
    return '/assets/ashwagandha_cinnamon.jpg';
  }
  if (t.includes('fennel') || t.includes('ajwain') || t.includes('saunf')) {
    return '/assets/fennel_ajwain_tea.jpg';
  }
  if (t.includes('saffron') || t.includes('cardamom')) {
    return '/assets/saffron_cardamom_milk.jpg';
  }
  if (t.includes('brahmi') || t.includes('tulsi')) {
    return '/assets/brahmi_tulsi_tea.jpg';
  }
  if (t.includes('moon milk') || t.includes('vanilla')) {
    return '/assets/golden_vanilla_moon_milk.jpg';
  }

  // Catch-all fallbacks
  if (preference === 'non_vegetarian') {
    return '/assets/andhra_chicken_curry.jpg';
  }
  return '/assets/quinoa_chickpea_bowl.jpg';
}

/**
 * Returns a high-quality, authentic, appetizing visual image for any PCOS meal card,
 * mapped first by exact recipe ID, then by recipe title, then by meal type and dietary preference.
 */
export function getRecipeImage(recipe?: Partial<RecipeItem> | null): string {
  if (!recipe) return LUNCH_VEG_IMG;

  // 1. Direct verified local asset path on recipe if present
  if (recipe.imageUrl && typeof recipe.imageUrl === 'string' && recipe.imageUrl.startsWith('/assets/')) {
    return recipe.imageUrl;
  }

  // 2. Exact match in verified recipe dictionary
  if (recipe.id && RECIPE_IMAGE_BY_ID[recipe.id]) {
    return RECIPE_IMAGE_BY_ID[recipe.id];
  }

  // 3. Match by recipe title
  if (recipe.name) {
    const matchedByTitle = getRecipeImageByTitle(recipe.name, recipe.preference);
    if (matchedByTitle) return matchedByTitle;
  }

  const mealType = (recipe.mealType as string) || '';
  const isNonVeg = recipe.preference === 'non_vegetarian';

  // 4. Fallback by meal category & preference
  switch (mealType) {
    case 'breakfast':
      return isNonVeg ? BREAKFAST_NONVEG_IMG : BREAKFAST_VEG_IMG;
    case 'mid_morning':
    case 'early_morning':
      return MORNING_ELIXIR_IMG;
    case 'lunch':
      return isNonVeg ? LUNCH_NONVEG_IMG : LUNCH_VEG_IMG;
    case 'evening_snack':
      return SNACK_IMG;
    case 'dinner':
      return isNonVeg ? DINNER_NONVEG_IMG : DINNER_VEG_IMG;
    case 'bedtime_drink':
      return BEDTIME_IMG;
    default:
      return isNonVeg ? LUNCH_NONVEG_IMG : LUNCH_VEG_IMG;
  }
}

export const GENERATED_MEAL_IMAGES: Record<MealCategory | 'early_morning', string> = {
  early_morning: MORNING_ELIXIR_IMG,
  mid_morning: MORNING_ELIXIR_IMG,
  breakfast: BREAKFAST_VEG_IMG,
  lunch: LUNCH_VEG_IMG,
  evening_snack: SNACK_IMG,
  dinner: DINNER_VEG_IMG,
  bedtime_drink: BEDTIME_IMG,
};
