import { RecipeItem } from '../types';
import { BREAKFAST_RECIPES } from './recipesBreakfasts';
import { BOOSTER_RECIPES } from './recipesBoosters';
import { LUNCH_RECIPES } from './recipesLunches';
import { SNACK_RECIPES } from './recipesSnacks';
import { DINNER_RECIPES } from './recipesDinners';
import { SPECIAL_RECIPES } from './recipesSpecial';

export const MASTER_RECIPES: RecipeItem[] = [
  ...BREAKFAST_RECIPES,
  ...BOOSTER_RECIPES,
  ...LUNCH_RECIPES,
  ...SNACK_RECIPES,
  ...DINNER_RECIPES,
  ...SPECIAL_RECIPES
];
