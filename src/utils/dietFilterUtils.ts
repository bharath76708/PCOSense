import { RecipeItem, RecipeDifficulty, DifficultyFilter } from '../types';

/**
 * Calculates difficulty for a recipe based on its total time (prep + cook),
 * instruction steps count, ingredient complexity, and speed tags.
 */
export function getRecipeDifficulty(recipe?: Partial<RecipeItem> | null): RecipeDifficulty {
  if (!recipe) return 'Easy';
  if (recipe.difficulty) return recipe.difficulty;

  const prep = recipe.prepTimeMinutes || 0;
  const cook = recipe.cookTimeMinutes || 0;
  const totalMins = prep + cook;
  const tagsStr = (recipe.tags || []).join(' ').toLowerCase();
  const stepCount = recipe.instructions?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;

  // 1. Easy: <= 20 mins, or explicit quick tags, or no-cook
  if (
    tagsStr.includes('quick') ||
    tagsStr.includes('no-cook') ||
    tagsStr.includes('zero-prep') ||
    tagsStr.includes('5-min') ||
    tagsStr.includes('10-min') ||
    tagsStr.includes('15-min') ||
    tagsStr.includes('20-min') ||
    (totalMins <= 20 && stepCount <= 4)
  ) {
    return 'Easy';
  }

  // 2. Advanced: > 35 mins, or 6+ steps with 9+ ingredients (e.g. multi-step artisanal curries, elaborate bowls)
  if (totalMins > 35 || (stepCount >= 6 && ingredientCount >= 8)) {
    return 'Advanced';
  }

  // 3. Medium: 21-35 mins
  return 'Medium';
}

/**
 * Checks if a recipe is Gluten-Free (either tagged as such, or free from wheat, maida, semolina, sooji).
 */
export function isRecipeGlutenFree(recipe?: Partial<RecipeItem> | null): boolean {
  if (!recipe) return false;

  const tagsStr = (recipe.tags || []).join(' ').toLowerCase();
  if (tagsStr.includes('gluten-free') || tagsStr.includes('gluten free')) {
    return true;
  }

  // Check ingredients for gluten triggers
  const glutenTriggers = ['wheat', 'maida', 'semolina', 'sooji', 'atta', 'durum', 'barley', 'rye'];
  const ingredientsList = (recipe.ingredients || []).map(i => i.item.toLowerCase());

  const hasGlutenTrigger = ingredientsList.some(ing => {
    // Exception: "millet rava", "ragi rava", "rice rava" is gluten-free
    if (ing.includes('millet rava') || ing.includes('ragi rava') || ing.includes('rice rava')) {
      return false;
    }
    return glutenTriggers.some(trigger => ing.includes(trigger));
  });

  return !hasGlutenTrigger;
}

/**
 * Checks if a recipe is Low-Glycemic (glycemic index 'Low' or labeled Low-GI).
 */
export function isRecipeLowGlycemic(recipe?: Partial<RecipeItem> | null): boolean {
  if (!recipe) return true;
  if (recipe.glycemicIndex === 'Low') return true;

  const tagsStr = (recipe.tags || []).join(' ').toLowerCase();
  return (
    tagsStr.includes('low-gi') ||
    tagsStr.includes('low-glycemic') ||
    tagsStr.includes('diabetic-safe') ||
    tagsStr.includes('glucose')
  );
}

/**
 * Checks if a recipe is Dairy-Free (no milk, paneer, curd, yogurt, ghee, butter, cheese).
 */
export function isRecipeDairyFree(recipe?: Partial<RecipeItem> | null): boolean {
  if (!recipe) return false;

  const tagsStr = (recipe.tags || []).join(' ').toLowerCase();
  if (tagsStr.includes('dairy-free') || tagsStr.includes('dairy free') || tagsStr.includes('vegan')) {
    return true;
  }

  const dairyTriggers = ['milk', 'paneer', 'curd', 'yogurt', 'dahi', 'ghee', 'butter', 'cheese', 'whey', 'cream'];
  const plantDairyExceptions = ['almond milk', 'coconut milk', 'soy milk', 'oat milk', 'cashew milk', 'tofu', 'peanut curd'];

  const ingredientsList = (recipe.ingredients || []).map(i => i.item.toLowerCase());

  const hasDairy = ingredientsList.some(ing => {
    // If it has a plant-based exception, ignore
    if (plantDairyExceptions.some(ex => ing.includes(ex))) {
      return false;
    }
    return dairyTriggers.some(trigger => {
      // Regex word match to avoid substring false positives (like "buttermilk" or "millets")
      // Buttermilk is dairy unless spiced plant chaas
      if (trigger === 'milk' && (ing.includes('almond') || ing.includes('coconut') || ing.includes('soy') || ing.includes('millet'))) {
        return false;
      }
      return new RegExp(`\\b${trigger}\\b`, 'i').test(ing);
    });
  });

  return !hasDairy;
}

export interface ActiveDietaryFilters {
  difficulty: DifficultyFilter;
  glutenFree: boolean;
  lowGlycemic: boolean;
  dairyFree: boolean;
}

/**
 * Matches a recipe against all active filters simultaneously.
 */
export function matchesDietaryFilters(
  recipe: RecipeItem,
  filters: ActiveDietaryFilters
): boolean {
  // Difficulty match
  if (filters.difficulty !== 'All') {
    const diff = getRecipeDifficulty(recipe);
    if (diff !== filters.difficulty) {
      return false;
    }
  }

  // Gluten-Free tag match
  if (filters.glutenFree && !isRecipeGlutenFree(recipe)) {
    return false;
  }

  // Low-Glycemic tag match
  if (filters.lowGlycemic && !isRecipeLowGlycemic(recipe)) {
    return false;
  }

  // Dairy-Free tag match
  if (filters.dairyFree && !isRecipeDairyFree(recipe)) {
    return false;
  }

  return true;
}

export function getDifficultyBadgeStyle(difficulty: RecipeDifficulty): {
  bg: string;
  text: string;
  border: string;
  iconColor: string;
  labelEn: string;
  labelTe: string;
  timeRange: string;
} {
  switch (difficulty) {
    case 'Easy':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        labelEn: 'Easy',
        labelTe: 'సులువు (Easy)',
        timeRange: '≤ 20 min'
      };
    case 'Medium':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        labelEn: 'Medium',
        labelTe: 'మధ్యస్థం (Medium)',
        timeRange: '20–35 min'
      };
    case 'Advanced':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        labelEn: 'Advanced',
        labelTe: 'నైపుణ్యం (Advanced)',
        timeRange: '35+ min'
      };
  }
}
