/**
 * PCOSense - 7-Day Anti-PCOS Grocery List Generator
 * Clinically groups ingredients across all 42 meals into organized supermarket aisles
 * with quantities, PCOS benefits, clipboard export, and print optimization.
 */

import { SevenDayDietPlan, GroceryItem, GroceryCategory, DietPreference, MealCategory } from '../types';

export interface ConsolidatedGroceryList {
  totalItemsCount: number;
  categories: {
    key: GroceryCategory;
    title: string;
    titleTe: string;
    icon: string;
    items: GroceryItem[];
  }[];
  generatedAt: string;
  preference: DietPreference;
}

// Classification dictionary for reliable aisle assignment
const CATEGORY_MATCHERS: Record<GroceryCategory, RegExp> = {
  produce: /(spinach|palak|methi|fenugreek leaves|carrot|bean|zucchini|mushroom|cauliflower|bell pepper|tomato|cucumber|avocado|mint|pudina|coriander|cilantro|ginger|garlic|lemon|chili|chilli|amla|pomegranate|berries|blueberry|blackberry|onion|peas|green gram sprout|sprouts|curry leaves)/i,
  grains_seeds: /(millet|korralu|kangni|quinoa|oats|flour|besan|idli|brown rice|phulka|roti|chia seed|flax|flaxseed|pumpkin seed|sunflower seed|sesame seed|hemp)/i,
  proteins_dairy: /(tofu|paneer|curd|yogurt|moong dal|chickpea|kala chana|rajma|soya|lentil|dal|egg|salmon|chicken|fish|mutton|bone broth|turkey)/i,
  spices_herbs: /(spearmint|turmeric|haldi|cinnamon|dalchini|kalonji|nigella|fennel|saunf|ajwain|cardamom|elaichi|ashwagandha|chamomile|brahmi|tulsi|mustard|cumin|jeera|black pepper|garam masala|hibiscus|rose|green tea)/i,
  pantry_fats: /(coconut oil|olive oil|ghee|walnut|almond|pistachio|cacao|cocoa|makhana|foxnut|stevia|monk fruit|rock salt|pink salt|sea salt|almond milk|coconut milk|sesame oil)/i
};

export function categorizeIngredient(itemName: string): GroceryCategory {
  for (const [category, regex] of Object.entries(CATEGORY_MATCHERS) as [GroceryCategory, RegExp][]) {
    if (regex.test(itemName)) {
      return category;
    }
  }
  return 'pantry_fats'; // default
}

/**
 * Standardize ingredient name for clean deduplication
 */
function normalizeIngredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // remove parenthetical notes like (soaked)
    .replace(/fresh|organic|cold-pressed|pure|raw|low-fat|unsweetened/gi, '')
    .trim();
}

/**
 * Generate a complete, categorized 7-Day Grocery List from the active diet plan
 */
export function generateGroceryList(
  plan: SevenDayDietPlan,
  activeMealSwaps: Record<string, 'primary' | 'alternative'> = {}
): ConsolidatedGroceryList {
  const itemMap = new Map<string, GroceryItem>();

  plan.days.forEach(day => {
    const mealKeys: (keyof typeof day.meals)[] = [
      'breakfast',
      'midMorning',
      'lunch',
      'eveningSnack',
      'dinner',
      'bedtimeDrink'
    ];

    mealKeys.forEach(slot => {
      const swapKey = `${day.dayNumber}_${slot}`;
      const prefSwapKey = `${plan.preference}_${day.dayNumber}_${slot}`;
      const isSwapped = activeMealSwaps[swapKey] === 'alternative' || activeMealSwaps[prefSwapKey] === 'alternative';
      const recipe = isSwapped && day.alternativeMeals?.[slot]
        ? day.alternativeMeals[slot]
        : day.meals[slot];

      if (!recipe || !recipe.ingredients) return;

      recipe.ingredients.forEach((ing, idx) => {
        const rawName = ing.item.trim();
        const normKey = normalizeIngredientKey(rawName);
        const category = categorizeIngredient(rawName);

        const usage = {
          dayNumber: day.dayNumber,
          mealType: recipe.mealType,
          recipeName: recipe.name
        };

        if (itemMap.has(normKey)) {
          const existing = itemMap.get(normKey)!;
          existing.usedInMeals.push(usage);
          // append or update amount note
          if (existing.amount && ing.amount && !existing.amount.includes(ing.amount)) {
            existing.amount = `${existing.amount} + ${ing.amount}`;
          }
        } else {
          itemMap.set(normKey, {
            id: `gro_${category}_${normKey.replace(/[^a-z0-9]/g, '_')}_${idx}`,
            name: rawName,
            category,
            amount: ing.amount,
            pcosBenefit: ing.pcosBenefit || 'Hormone regulation & insulin support',
            usedInMeals: [usage],
            checked: false
          });
        }
      });
    });
  });

  const allItems = Array.from(itemMap.values());

  const categoriesConfig: { key: GroceryCategory; title: string; titleTe: string; icon: string }[] = [
    {
      key: 'produce',
      title: 'Fresh Produce & Leafy Greens',
      titleTe: 'తాజా కూరగాయలు & ఆకుకూరలు',
      icon: '🥦'
    },
    {
      key: 'grains_seeds',
      title: 'Millets, Whole Grains & Super-Seeds',
      titleTe: 'చిరుధాన్యాలు, గింజలు & సూపర్ సీడ్స్',
      icon: '🌾'
    },
    {
      key: 'proteins_dairy',
      title: 'Proteins, Legumes & Clean Dairy / Meats',
      titleTe: 'ప్రొటీన్లు, పప్పులు & డెయిరీ / మాంసాహారం',
      icon: '🫘'
    },
    {
      key: 'spices_herbs',
      title: 'PCOS Healing Herbs, Teas & Spices',
      titleTe: 'హార్మోన్ల హీలింగ్ హెర్బ్స్, టీలు & మసాలాలు',
      icon: '🌿'
    },
    {
      key: 'pantry_fats',
      title: 'Healthy Cooking Fats, Nuts & Pantry',
      titleTe: 'ఆరోగ్యకరమైన కొవ్వులు, గింజలు & కిరాణా',
      icon: '🥥'
    }
  ];

  const categories = categoriesConfig.map(cfg => {
    const items = allItems.filter(item => item.category === cfg.key);
    return {
      ...cfg,
      items
    };
  });

  return {
    totalItemsCount: allItems.length,
    categories,
    generatedAt: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    preference: plan.preference
  };
}

/**
 * Format the entire 7-day grocery list into a clean, markdown/plain-text checklist for clipboard
 */
export function formatGroceryListForClipboard(
  groceryList: ConsolidatedGroceryList,
  isTelugu: boolean = false
): string {
  const lines: string[] = [];

  const prefLabel = groceryList.preference === 'non_vegetarian'
    ? (isTelugu ? 'నాన్-వెజ్ (Non-Veg)' : 'Non-Vegetarian')
    : (isTelugu ? 'వెజ్ (Veg)' : 'Vegetarian');

  lines.push(`🛒 PCOSENSE 7-DAY NUTRITION GROCERY LIST`);
  lines.push(`Protocol: ${prefLabel} Anti-PCOS 7-Day Plan (42 Structured Meals)`);
  lines.push(`Generated: ${groceryList.generatedAt}`);
  lines.push(`Total Unique Ingredients: ${groceryList.totalItemsCount}`);
  lines.push(`══════════════════════════════════════════════`);
  lines.push(``);

  groceryList.categories.forEach(cat => {
    if (cat.items.length === 0) return;
    const catTitle = isTelugu ? `${cat.icon} ${cat.titleTe}` : `${cat.icon} ${cat.title.toUpperCase()}`;
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(catTitle);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    cat.items.forEach(item => {
      const timesUsed = item.usedInMeals.length;
      const usageTag = timesUsed > 1 ? ` (${timesUsed}x in plan)` : '';
      const benefit = item.pcosBenefit ? ` [${item.pcosBenefit}]` : '';
      lines.push(`[ ] ${item.name} - ${item.amount}${usageTag}${benefit}`);
    });

    lines.push(``);
  });

  lines.push(`══════════════════════════════════════════════`);
  lines.push(`💡 Clinical Nutrition Pro-Tip:`);
  lines.push(
    `Batch prep seeds (pumpkin, chia, flax) in airtight glass jars. Drink spearmint tea twice daily to lower bioavailable androgens and clear facial acne.`
  );
  lines.push(`Generated via PCOSense Medical Nutrition Therapy Platform.`);

  return lines.join('\n');
}

/**
 * Safe clipboard copy with fallback
 */
export async function copyGroceryListToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Direct clipboard.writeText failed, using fallback:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('All clipboard operations failed:', err);
    return false;
  }
}
