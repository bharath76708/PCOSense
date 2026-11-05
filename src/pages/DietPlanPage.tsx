import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Sparkles,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Flame,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Bot,
  Activity,
  Heart,
  CheckCircle2,
  RefreshCw,
  Info,
  ShoppingCart,
  Timer,
  Droplet,
  RotateCcw,
  MapPin,
  BellRing
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { canUserAccessFeature, getUserSubscription } from '../services/subscriptionService';
import { SubscriptionPaymentModal } from '../components/SubscriptionPaymentModal';
import {
  RecipeItem,
  SevenDayDietPlan,
  DailyDietPlan,
  DietPreference,
  MealCategory,
  DifficultyFilter
} from '../types';
import {
  generateSevenDayDietPlan,
  getSavedRecipes,
  saveRecipe,
  removeSavedRecipe,
  isRecipeSaved,
  calculateDailyNutrients,
  MASTER_RECIPES
} from '../services/dietPlanService';
import { analyzeSevenDayNutrientGaps } from '../services/nutrientGapAnalysisService';
import { getFirestoreSavedRecipes } from '../services/firestoreService';
import { RecipeModal } from '../components/RecipeModal';
import { CravingRecipeChatbot } from '../components/CravingRecipeChatbot';
import { PersonalizedRiskReasonsCard } from '../components/PersonalizedRiskReasonsCard';
import { WeeklyMacroDistributionChart } from '../components/WeeklyMacroDistributionChart';
import { MealHydrationBadge } from '../components/MealHydrationBadge';
import { CookingTimerModal } from '../components/CookingTimerModal';
import { ExpandableMealCard } from '../components/ExpandableMealCard';
import { DailyIntakeProgressBar } from '../components/DailyIntakeProgressBar';
import { DietFilterBar } from '../components/DietFilterBar';
import { NutrientGapAnalysisCard } from '../components/NutrientGapAnalysisCard';
import { MealPrepNotificationBanner } from '../components/MealPrepNotificationBanner';
import {
  ActiveDietaryFilters,
  matchesDietaryFilters,
  getRecipeDifficulty,
  isRecipeGlutenFree,
  isRecipeLowGlycemic,
  isRecipeDairyFree
} from '../utils/dietFilterUtils';
import { motion, AnimatePresence } from 'motion/react';
import { APTelangana7DayDietSection } from '../components/APTelangana7DayDietSection';

const mealGridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
};

const mealCardItemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.12 },
  },
};

export const DietPlanPage: React.FC = () => {
  const { predictionResult, patientData } = useAssessment();
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const userSubKey = user?.email || user?.id || 'usr_patient_sample';
  const [userSub, setUserSub] = useState(() => getUserSubscription(userSubKey));
  const access = canUserAccessFeature(userSubKey, 'diet');

  const refreshSub = () => {
    setUserSub(getUserSubscription(user?.email || user?.id || 'usr_patient_sample'));
  };

  useEffect(() => {
    refreshSub();
  }, [user?.email, user?.id]);

  useEffect(() => {
    const handleSubUpdated = () => {
      refreshSub();
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    return () => window.removeEventListener('subscription-updated', handleSubUpdated);
  }, [user?.email, user?.id]);

  const [activeTab, setActiveTab] = useState<'board' | 'chatbot' | 'saved' | 'reasons'>('board');
  const [preference, setPreference] = useState<DietPreference>(() => {
    try {
      const saved = localStorage.getItem('pcosense_diet_preference');
      if (saved === 'non_vegetarian' || saved === 'vegetarian' || saved === 'south_indian' || saved === 'vegan') {
        return saved as DietPreference;
      }
    } catch {}
    return 'vegetarian';
  });
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);

  const handleSetPreference = (newPref: DietPreference) => {
    setPreference(newPref);
    try {
      localStorage.setItem('pcosense_diet_preference', newPref);
    } catch {}
  };

  const dietPlan: SevenDayDietPlan = useMemo(() => {
    return generateSevenDayDietPlan(
      predictionResult?.risk_level || 'Moderate',
      preference,
      patientData
    );
  }, [preference, predictionResult?.risk_level, patientData]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [timerConfig, setTimerConfig] = useState<{
    seconds: number;
    label: string;
    recipeName: string;
  }>({
    seconds: 900,
    label: 'Millet Simmering & Meal Prep',
    recipeName: 'PCOS Meal Prep'
  });
  const [savedRecipes, setSavedRecipes] = useState<RecipeItem[]>(() => getSavedRecipes());
  const [savedSearchQuery, setSavedSearchQuery] = useState<string>('');

  // Recipe Difficulty & Endocrine Dietary Tag Filters
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [dietaryTags, setDietaryTags] = useState<{
    glutenFree: boolean;
    lowGlycemic: boolean;
    dairyFree: boolean;
  }>({
    glutenFree: false,
    lowGlycemic: false,
    dairyFree: false
  });

  const activeFiltersConfig: ActiveDietaryFilters = useMemo(
    () => ({
      difficulty: difficultyFilter,
      glutenFree: dietaryTags.glutenFree,
      lowGlycemic: dietaryTags.lowGlycemic,
      dairyFree: dietaryTags.dairyFree
    }),
    [difficultyFilter, dietaryTags]
  );

  const isFilterActive = useMemo(
    () =>
      difficultyFilter !== 'All' ||
      dietaryTags.glutenFree ||
      dietaryTags.lowGlycemic ||
      dietaryTags.dairyFree,
    [difficultyFilter, dietaryTags]
  );

  const handleToggleGlutenFree = () => {
    setDietaryTags(prev => ({ ...prev, glutenFree: !prev.glutenFree }));
  };

  const handleToggleLowGlycemic = () => {
    setDietaryTags(prev => ({ ...prev, lowGlycemic: !prev.lowGlycemic }));
  };

  const handleToggleDairyFree = () => {
    setDietaryTags(prev => ({ ...prev, dairyFree: !prev.dairyFree }));
  };

  const handleResetFilters = () => {
    setDifficultyFilter('All');
    setDietaryTags({
      glutenFree: false,
      lowGlycemic: false,
      dairyFree: false
    });
  };

  const handleOpenCookingTimer = (recipe?: RecipeItem, stepType: 'prep' | 'cook' = 'prep') => {
    if (recipe) {
      const mins = stepType === 'prep' ? recipe.prepTimeMinutes : recipe.cookTimeMinutes;
      const label = stepType === 'prep'
        ? `${isTelugu ? 'తయారీ:' : 'Prep:'} ${recipe.name}`
        : `${isTelugu ? 'వండటం:' : 'Cook:'} ${recipe.name}`;
      setTimerConfig({
        seconds: (mins || 15) * 60,
        label,
        recipeName: recipe.name
      });
    }
    setIsTimerModalOpen(true);
  };

  // Persisted 1-Click Swap Meal State: maps `${dayNum}_${mealSlot}` -> 'primary' | 'alternative'
  const [mealSwaps, setMealSwaps] = useState<Record<string, 'primary' | 'alternative'>>(() => {
    try {
      const saved = localStorage.getItem('pcosense_diet_meal_swaps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getSwapChoice = (dayNumber: number, slotKey: keyof DailyDietPlan['meals']) => {
    return mealSwaps[`${preference}_${dayNumber}_${slotKey}`] || 'primary';
  };

  const toggleSwapMeal = (dayNumber: number, slotKey: keyof DailyDietPlan['meals']) => {
    const prefKey = `${preference}_${dayNumber}_${slotKey}`;
    setMealSwaps(prev => {
      const currentChoice = prev[prefKey] || 'primary';
      const nextChoice = currentChoice === 'primary' ? 'alternative' : 'primary';
      const updated = { ...prev, [prefKey]: nextChoice };
      try {
        localStorage.setItem('pcosense_diet_meal_swaps', JSON.stringify(updated));
      } catch (err) {
        console.error('Error persisting meal swap:', err);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (user?.uid) {
      getFirestoreSavedRecipes(user.uid).then(cloudList => {
        if (cloudList && cloudList.length > 0) {
          cloudList.forEach(r => saveRecipe(r));
          setSavedRecipes(getSavedRecipes());
        }
      });
    }
  }, [user]);

  const refreshSavedRecipes = () => {
    setSavedRecipes(getSavedRecipes());
  };

  const handleOpenRecipe = (recipe: RecipeItem) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleToggleBookmark = (recipe: RecipeItem) => {
    if (isRecipeSaved(recipe.id)) {
      removeSavedRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
    refreshSavedRecipes();
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const currentDayPlan: DailyDietPlan =
    dietPlan.days.find(d => d.dayNumber === activeDayNumber) || dietPlan.days[0];

  // Helper to calculate exact active daily nutrients for any given day taking into account any meal swaps
  const calculateNutrientsForDay = (day: DailyDietPlan) => {
    const dayNum = day.dayNumber;
    const isAltBf = getSwapChoice(dayNum, 'breakfast') === 'alternative' && day.alternativeMeals?.breakfast;
    const bf = isAltBf ? day.alternativeMeals!.breakfast : day.meals.breakfast;

    const isAltMm = getSwapChoice(dayNum, 'midMorning') === 'alternative' && day.alternativeMeals?.midMorning;
    const mm = isAltMm ? day.alternativeMeals!.midMorning : day.meals.midMorning;

    const isAltLu = getSwapChoice(dayNum, 'lunch') === 'alternative' && day.alternativeMeals?.lunch;
    const lu = isAltLu ? day.alternativeMeals!.lunch : day.meals.lunch;

    const isAltEs = getSwapChoice(dayNum, 'eveningSnack') === 'alternative' && day.alternativeMeals?.eveningSnack;
    const es = isAltEs ? day.alternativeMeals!.eveningSnack : day.meals.eveningSnack;

    const isAltDi = getSwapChoice(dayNum, 'dinner') === 'alternative' && day.alternativeMeals?.dinner;
    const di = isAltDi ? day.alternativeMeals!.dinner : day.meals.dinner;

    const isAltBt = getSwapChoice(dayNum, 'bedtimeDrink') === 'alternative' && day.alternativeMeals?.bedtimeDrink;
    const bt = isAltBt ? day.alternativeMeals!.bedtimeDrink : day.meals.bedtimeDrink;

    return calculateDailyNutrients({
      breakfast: bf,
      midMorning: mm,
      lunch: lu,
      eveningSnack: es,
      dinner: di,
      bedtimeDrink: bt
    });
  };

  // Resolve active recipes for current day based on 1-click meal swaps
  const activeBreakfast =
    getSwapChoice(currentDayPlan.dayNumber, 'breakfast') === 'alternative' && currentDayPlan.alternativeMeals?.breakfast
      ? currentDayPlan.alternativeMeals.breakfast
      : currentDayPlan.meals.breakfast;

  const activeMidMorning =
    getSwapChoice(currentDayPlan.dayNumber, 'midMorning') === 'alternative' && currentDayPlan.alternativeMeals?.midMorning
      ? currentDayPlan.alternativeMeals.midMorning
      : currentDayPlan.meals.midMorning;

  const activeLunch =
    getSwapChoice(currentDayPlan.dayNumber, 'lunch') === 'alternative' && currentDayPlan.alternativeMeals?.lunch
      ? currentDayPlan.alternativeMeals.lunch
      : currentDayPlan.meals.lunch;

  const activeEveningSnack =
    getSwapChoice(currentDayPlan.dayNumber, 'eveningSnack') === 'alternative' && currentDayPlan.alternativeMeals?.eveningSnack
      ? currentDayPlan.alternativeMeals.eveningSnack
      : currentDayPlan.meals.eveningSnack;

  const activeDinner =
    getSwapChoice(currentDayPlan.dayNumber, 'dinner') === 'alternative' && currentDayPlan.alternativeMeals?.dinner
      ? currentDayPlan.alternativeMeals.dinner
      : currentDayPlan.meals.dinner;

  const activeBedtimeDrink =
    getSwapChoice(currentDayPlan.dayNumber, 'bedtimeDrink') === 'alternative' && currentDayPlan.alternativeMeals?.bedtimeDrink
      ? currentDayPlan.alternativeMeals.bedtimeDrink
      : currentDayPlan.meals.bedtimeDrink;

  const currentDayActiveMeals = useMemo(
    () => ({
      breakfast: activeBreakfast,
      midMorning: activeMidMorning,
      lunch: activeLunch,
      eveningSnack: activeEveningSnack,
      dinner: activeDinner,
      bedtimeDrink: activeBedtimeDrink
    }),
    [activeBreakfast, activeMidMorning, activeLunch, activeEveningSnack, activeDinner, activeBedtimeDrink]
  );

  // Dynamic daily macro-nutrients summary calculated on the fly
  const activeDayNutrients = useMemo(() => {
    return calculateNutrientsForDay(currentDayPlan);
  }, [currentDayPlan, currentDayActiveMeals, mealSwaps, preference]);

  // Consolidated 7-Day nutrient gaps and micronutrient adequacy report
  const nutrientGapReport = useMemo(() => {
    return analyzeSevenDayNutrientGaps(dietPlan, mealSwaps);
  }, [dietPlan, mealSwaps]);

  const filteredSavedRecipes = savedRecipes.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
      (r.nameTe && r.nameTe.toLowerCase().includes(savedSearchQuery.toLowerCase())) ||
      r.tagline.toLowerCase().includes(savedSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    return matchesDietaryFilters(r, activeFiltersConfig);
  });

  const getMealCategoryLabel = (cat: MealCategory) => {
    switch (cat) {
      case 'breakfast':
        return { label: isTelugu ? '🌅 ఉదయపు అల్పాహారం (Breakfast)' : '🌅 Breakfast', time: '8:00 AM – 9:00 AM' };
      case 'mid_morning':
        return { label: isTelugu ? '🍎 మిడ్-మార్నింగ్ బూస్టర్ (Booster Snack)' : '🍎 Mid-Morning Booster', time: '11:00 AM' };
      case 'lunch':
        return { label: isTelugu ? '🥗 మధ్యాహ్న భోజనం (Lunch)' : '🥗 Lunch', time: '1:00 PM – 2:00 PM' };
      case 'evening_snack':
        return { label: isTelugu ? '🍵 సాయంత్రం టీ & స్నాక్స్ (Evening Snack)' : '🍵 Evening Anti-Inflammatory Snack', time: '4:30 PM – 5:30 PM' };
      case 'dinner':
        return { label: isTelugu ? '🍲 రాత్రి భోజనం (Dinner)' : '🍲 Dinner', time: '7:30 PM – 8:30 PM' };
      case 'bedtime_drink':
        return { label: isTelugu ? '🌙 రాత్రి పడుకునే ముందు (Bedtime Hormone Soother)' : '🌙 Bedtime Hormone Soother', time: '9:45 PM' };
      default:
        return { label: cat, time: '' };
    }
  };

  const mealEntries: {
    slotKey: keyof DailyDietPlan['meals'];
    category: MealCategory;
    primaryRecipe: RecipeItem;
    alternativeRecipe: RecipeItem;
    activeRecipe: RecipeItem;
    isSwapped: boolean;
  }[] = [
    {
      slotKey: 'breakfast',
      category: 'breakfast',
      primaryRecipe: currentDayPlan.meals.breakfast,
      alternativeRecipe: currentDayPlan.alternativeMeals?.breakfast || currentDayPlan.meals.breakfast,
      activeRecipe: activeBreakfast,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'breakfast') === 'alternative'
    },
    {
      slotKey: 'midMorning',
      category: 'mid_morning',
      primaryRecipe: currentDayPlan.meals.midMorning,
      alternativeRecipe: currentDayPlan.alternativeMeals?.midMorning || currentDayPlan.meals.midMorning,
      activeRecipe: activeMidMorning,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'midMorning') === 'alternative'
    },
    {
      slotKey: 'lunch',
      category: 'lunch',
      primaryRecipe: currentDayPlan.meals.lunch,
      alternativeRecipe: currentDayPlan.alternativeMeals?.lunch || currentDayPlan.meals.lunch,
      activeRecipe: activeLunch,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'lunch') === 'alternative'
    },
    {
      slotKey: 'eveningSnack',
      category: 'evening_snack',
      primaryRecipe: currentDayPlan.meals.eveningSnack,
      alternativeRecipe: currentDayPlan.alternativeMeals?.eveningSnack || currentDayPlan.meals.eveningSnack,
      activeRecipe: activeEveningSnack,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'eveningSnack') === 'alternative'
    },
    {
      slotKey: 'dinner',
      category: 'dinner',
      primaryRecipe: currentDayPlan.meals.dinner,
      alternativeRecipe: currentDayPlan.alternativeMeals?.dinner || currentDayPlan.meals.dinner,
      activeRecipe: activeDinner,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'dinner') === 'alternative'
    },
    {
      slotKey: 'bedtimeDrink',
      category: 'bedtime_drink',
      primaryRecipe: currentDayPlan.meals.bedtimeDrink,
      alternativeRecipe: currentDayPlan.alternativeMeals?.bedtimeDrink || currentDayPlan.meals.bedtimeDrink,
      activeRecipe: activeBedtimeDrink,
      isSwapped: getSwapChoice(currentDayPlan.dayNumber, 'bedtimeDrink') === 'alternative'
    }
  ];

  const getMatchingMealsCountForDay = (day: DailyDietPlan) => {
    if (!isFilterActive) return 6;
    const dayMeals = [
      day.meals.breakfast,
      day.meals.midMorning,
      day.meals.lunch,
      day.meals.eveningSnack,
      day.meals.dinner,
      day.meals.bedtimeDrink
    ];
    return dayMeals.filter(m => matchesDietaryFilters(m, activeFiltersConfig)).length;
  };

  const processedMealEntries = useMemo(() => {
    return mealEntries.map(entry => {
      const activeMatches = matchesDietaryFilters(entry.activeRecipe, activeFiltersConfig);
      const altMatches = !!(
        entry.alternativeRecipe &&
        entry.alternativeRecipe.id !== entry.primaryRecipe.id &&
        matchesDietaryFilters(entry.alternativeRecipe, activeFiltersConfig)
      );
      return {
        ...entry,
        activeMatches,
        altMatches,
        matchesFilter: activeMatches || (!activeMatches && altMatches)
      };
    });
  }, [mealEntries, activeFiltersConfig]);

  const matchingMealsCount = useMemo(() => {
    return processedMealEntries.filter(e => e.activeMatches).length;
  }, [processedMealEntries]);

  const displayedMealEntries = useMemo(() => {
    if (!isFilterActive) return processedMealEntries;
    return processedMealEntries.filter(e => e.matchesFilter);
  }, [processedMealEntries, isFilterActive]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Hero Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
                <Utensils className="h-3.5 w-3.5 text-teal-400" />
                <span>{isTelugu ? 'PCOS న్యూట్రిషన్ & డైట్ ప్లానర్' : 'PCOS Medical Nutrition Therapy'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {isTelugu ? 'మీ వ్యక్తిగత 7 రోజుల యాంటీ-PCOS డైట్ ప్లాన్' : 'Your Personalized 7-Day Anti-PCOS Diet Plan'}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {isTelugu
                  ? 'మీ హార్మోన్ల అసమతుల్యత, ఇన్సులిన్ స్థాయిలు మరియు శరీర కొలతలకు అనుగుణంగా రూపొందించబడిన 7 రోజుల పోషకాహార ప్రణాళిక. ప్రతి వంటకం తయారీ విధానం మరియు ప్రయోజనాలు ఇక్కడ అందుబాటులో ఉన్నాయి.'
                  : 'Grounded in clinical endocrinology: Low-GI complex carbs, hormone-balancing healthy fats, and anti-androgenic herbal pairings designed to reverse risk and restore menstrual harmony.'}
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all border border-amber-400/30"
                id="hero-open-cooking-timer-btn"
                title="Open Global Kitchen Cooking Timer"
              >
                <Timer className="h-4 w-4" />
                <span>{isTelugu ? 'వంట టైమర్' : 'Cooking Timer'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPlan}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all"
                id="print-7day-plan-btn"
              >
                <Printer className="h-4 w-4" />
                <span>{isTelugu ? 'ప్లాన్ ప్రింట్ చేయండి' : 'Print Plan'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chatbot')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors duration-150"
                id="hero-open-craving-bot-btn"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isTelugu ? 'క్రేవింగ్ చెఫ్ AI బాట్' : 'Craving Chef AI'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Block Alert if Access Blocked */}
        {!access.allowed && (
          <div className="rounded-2xl border-2 border-amber-500/80 bg-amber-500/10 p-5 sm:p-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {userSub?.isBlocked ? '3-Day Trial Expired (Access Blocked)' : 'Diet Plan Subscription Required'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
                    {userSub?.isBlocked
                      ? 'Your ₹1 3-day full access trial has expired. To continue viewing your customized 7-day anti-inflammatory meal recipes and nutrient gap analytics, please subscribe to either the ₹100/month or ₹200/month plan.'
                      : 'Access to the clinical 7-day nutrition planner requires either an active 3-Day Trial (₹1) or the ₹100/mo Basic or ₹200/mo Complete plan.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>{userSub?.isBlocked ? 'Reactivate Access (₹100 or ₹200)' : 'Subscribe to Unlock'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Progress Bar at the top of DietPlanPage */}
        <DailyIntakeProgressBar
          dayNumber={currentDayPlan.dayNumber}
          dayName={currentDayPlan.dayName}
          dayNameTe={currentDayPlan.dayNameTe}
          theme={currentDayPlan.theme}
          themeTe={currentDayPlan.themeTe}
          intake={{
            calories: activeDayNutrients.calories,
            proteinGrams: activeDayNutrients.proteinGrams,
            carbsGrams: activeDayNutrients.carbsGrams,
            fatGrams: activeDayNutrients.fatGrams,
            fiberGrams: activeDayNutrients.fiberGrams,
            proteinPct: activeDayNutrients.proteinPct,
            carbsPct: activeDayNutrients.carbsPct,
            fatPct: activeDayNutrients.fatPct
          }}
          target={{
            calories: currentDayPlan.targetCalories || 1600,
            proteinGrams: currentDayPlan.targetProtein || 70,
            carbsGrams: currentDayPlan.targetCarbs || 150,
            fatGrams: currentDayPlan.targetFat || 45,
            fiberGrams: currentDayPlan.targetFiber || 35
          }}
        />

        {/* Global Tab Navigation */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'board'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-diet-board"
            >
              <Calendar className="h-4 w-4" />
              <span>{isTelugu ? '7 రోజుల డైట్ బోర్డు' : '7-Day Diet Board'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'chatbot'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-craving-bot"
            >
              <Bot className="h-4 w-4 text-teal-300" />
              <span>{isTelugu ? 'క్రేవింగ్ చెఫ్ AI బాట్' : 'Craving Chef AI Bot'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-400/20 text-teal-300">
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-saved-recipes"
            >
              <Bookmark className="h-4 w-4" />
              <span>{isTelugu ? 'సేవ్ చేసిన వంటకాలు' : 'Saved Recipes'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {savedRecipes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reasons')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reasons'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              id="tab-btn-risk-reasons"
            >
              <Activity className="h-4 w-4" />
              <span>{isTelugu ? 'నా రిస్క్ కారణాలు & పరిష్కారాలు' : 'Why It\'s A Risk'}</span>
            </button>
          </div>

          {/* Dietary Preference Selector */}
          <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">
              {isTelugu ? 'ఆహార ప్రాధాన్యత:' : 'Diet Preference:'}
            </span>
            <button
              type="button"
              onClick={() => handleSetPreference('vegetarian')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                preference === 'vegetarian'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="diet-pref-veg-btn"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300 inline-block"></span>
              <span>{isTelugu ? 'శాఖాహారం (Veg)' : '🌱 Veg'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreference('non_vegetarian')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                preference === 'non_vegetarian'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="diet-pref-nonveg-btn"
            >
              <span className="h-2 w-2 rounded-full bg-rose-300 inline-block"></span>
              <span>{isTelugu ? 'మాంసాహారం (Non-Veg)' : '🍗 Non-Veg'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreference('south_indian')}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                preference === 'south_indian'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="diet-pref-southindian-btn"
            >
              <span>{isTelugu ? 'దక్షిణ భారతీయ' : 'South Indian'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetPreference('vegan')}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                preference === 'vegan'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              id="diet-pref-vegan-btn"
            >
              <span>Vegan</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: 7-DAY DIET PLAN BOARD */}
        {/* ============================================================ */}
        {activeTab === 'board' && (
          <div className="space-y-8">
            {/* Primary AP + Telangana 7-Day Diet Plan with Vegetarian | Non-Vegetarian | Vegan */}
            <APTelangana7DayDietSection />

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                {isTelugu ? 'అదనపు క్లినికల్ వంటకాలు & ప్రత్యామ్నాయాలు' : 'Clinical Recipe Explorer & Nutrient Gap Analysis'}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      {isTelugu ? 'ఆహార విధానం ఎంపిక' : 'Dietary Mode Selection'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {isTelugu ? 'డైనమిక్ అప్‌డేట్' : 'Live Auto-Update'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? '7 రోజుల భోజన ప్రణాళిక విధానం' : 'Switch Meal Plan Mode'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTelugu
                      ? 'శాఖాహారం లేదా మాంసాహార మోడ్‌ను ఎంచుకోండి. మొత్తం 7 రోజుల వంటకాలు, పోషకాలు మరియు కిరాణా జాబితా తక్షణమే మారతాయి.'
                      : 'Toggle between 100% plant-powered meals and anti-inflammatory clean poultry, eggs & fish. Updates all 7 days instantly.'}
                  </p>
                </div>

                {/* Segmented Toggle Control */}
                <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetPreference('vegetarian')}
                    className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                      preference === 'vegetarian'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
                    }`}
                    id="board-diet-toggle-veg"
                    aria-pressed={preference === 'vegetarian'}
                  >
                    <span className="text-base">🌱</span>
                    <div className="text-left">
                      <span className="block leading-none">{isTelugu ? 'శాఖాహారం (Veg)' : 'Vegetarian Plan'}</span>
                      <span className={`text-[10px] font-medium leading-none mt-1 block ${preference === 'vegetarian' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {isTelugu ? 'పప్పులు, పన్నీర్ & గింజలు' : 'Plant Proteins & Millets'}
                      </span>
                    </div>
                    {preference === 'vegetarian' && (
                      <span className="h-2 w-2 rounded-full bg-white ml-1 animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetPreference('non_vegetarian')}
                    className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                      preference === 'non_vegetarian'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900'
                    }`}
                    id="board-diet-toggle-nonveg"
                    aria-pressed={preference === 'non_vegetarian'}
                  >
                    <span className="text-base">🍗</span>
                    <div className="text-left">
                      <span className="block leading-none">{isTelugu ? 'మాంసాహారం (Non-Veg)' : 'Non-Vegetarian Plan'}</span>
                      <span className={`text-[10px] font-medium leading-none mt-1 block ${preference === 'non_vegetarian' ? 'text-rose-100' : 'text-slate-400'}`}>
                        {isTelugu ? 'గుడ్లు, చేపలు & చికెన్' : 'Eggs, Salmon & Chicken'}
                      </span>
                    </div>
                    {preference === 'non_vegetarian' && (
                      <span className="h-2 w-2 rounded-full bg-white ml-1 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Status / Protocol Note */}
              <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                preference === 'vegetarian'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-900/50 text-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{preference === 'vegetarian' ? '🌱' : '🍗'}</span>
                  <span>
                    {isTelugu
                      ? preference === 'vegetarian'
                        ? 'ప్రస్తుతం 7 రోజుల శాఖాహార ప్లాన్ అమల్లో ఉంది: తక్కువ GI చిరుధాన్యాలు, మొలకలు, చియా గింజలు మరియు పప్పుదినుసులు.'
                        : 'ప్రస్తుతం 7 రోజుల మాంసాహార ప్లాన్ అమల్లో ఉంది: క్లీన్ పౌల్ట్రీ, ఒమేగా-3 సాల్మన్ చేపలు మరియు గుడ్లు.'
                      : preference === 'vegetarian'
                        ? 'Showing 7-Day Vegetarian Plan: Sprouted lentils, whole millets, organic paneer/tofu, and hormone-balancing seeds.'
                        : 'Showing 7-Day Non-Vegetarian Plan: Anti-inflammatory wild fish, pasture-raised eggs, and clean lean poultry.'}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/80 shrink-0 self-start sm:self-auto">
                  {preference === 'vegetarian' ? '🌱 100% Veg Active' : '🍗 Non-Veg Active'}
                </span>
              </div>
            </div>

            {/* Dynamic Recipe Filters & Dietary Preferences Bar */}
            <DietFilterBar
              activeFilters={activeFiltersConfig}
              onChangeDifficulty={setDifficultyFilter}
              onToggleGlutenFree={handleToggleGlutenFree}
              onToggleLowGlycemic={handleToggleLowGlycemic}
              onToggleDairyFree={handleToggleDairyFree}
              onResetFilters={handleResetFilters}
              totalMatchingMealsCount={matchingMealsCount}
              totalMealsCount={mealEntries.length}
            />

            {/* Day Selector Ribbon */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                {dietPlan.days.map(d => {
                  const isActive = d.dayNumber === activeDayNumber;
                  const dayNutrients = calculateNutrientsForDay(d);
                  const matchingCountForDay = getMatchingMealsCountForDay(d);
                  return (
                    <button
                      key={d.dayNumber}
                      type="button"
                      onClick={() => setActiveDayNumber(d.dayNumber)}
                      className={`flex flex-col items-center justify-center min-w-[100px] sm:min-w-[130px] py-2.5 px-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-teal-800 text-white border-teal-700 shadow-sm ring-2 ring-teal-500/20'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                      id={`day-select-btn-${d.dayNumber}`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">
                        {isTelugu && d.dayNameTe ? d.dayNameTe : d.dayName}
                      </span>
                      <span className={`text-[10px] mt-0.5 font-bold ${isActive ? 'text-teal-200' : 'text-teal-700 dark:text-teal-400'}`}>
                        🔥 {dayNutrients.calories} kcal
                      </span>
                      <span className={`text-[9px] mt-0.5 font-bold ${isActive ? 'text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        P: {dayNutrients.proteinGrams}g • C: {dayNutrients.carbsGrams}g • F: {dayNutrients.fatGrams}g
                      </span>
                      {isFilterActive && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : matchingCountForDay > 0
                              ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {matchingCountForDay}/6 {isTelugu ? 'సరిపోలాయి' : 'match'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Day Theme Banner */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/50 dark:bg-teal-950/20 p-3 rounded-xl border border-teal-200/50 dark:border-teal-900/40">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-teal-950 dark:text-teal-200">
                    {isTelugu && currentDayPlan.themeTe ? currentDayPlan.themeTe : currentDayPlan.theme}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {isTelugu && currentDayPlan.primaryHormoneGoalTe ? currentDayPlan.primaryHormoneGoalTe : currentDayPlan.primaryHormoneGoal}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs shrink-0 font-bold text-slate-700 dark:text-slate-300">
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    🔥 {activeDayNutrients.calories} kcal
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    💪 {activeDayNutrients.proteinGrams}g Protein
                  </span>
                  <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    🌾 {activeDayNutrients.fiberGrams}g Fiber
                  </span>
                </div>
              </div>

              {/* Small, Elegant Summary of Estimated Macro-Nutrients (Protein, Carbs, Fats) */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/90 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {isTelugu
                          ? `రోజు ${activeDayNumber} స్థూల పోషకాల వివరాలు (Macro-Nutrients)`
                          : `Day ${activeDayNumber} Estimated Macro-Nutrients Summary`}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isTelugu
                          ? 'హార్మోన్ల సమతుల్యత మరియు ఇన్సులిన్ నిరోధకతను నియంత్రించే క్లినికల్ నిష్పత్తి'
                          : 'Endocrine-optimized 45:25:30 distribution to suppress androgen spikes & maintain satiety'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 w-fit">
                    ⚡ Total: {activeDayNutrients.calories} kcal
                  </span>
                </div>

                {/* 3 Macro Cards: Protein, Carbs, Fats + Fiber */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block">
                      {isTelugu ? 'ప్రొటీన్ (Protein)' : 'Protein'}
                    </span>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      {activeDayNutrients.proteinGrams}g
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/90 font-semibold">
                      {activeDayNutrients.proteinPct}% of energy
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">
                      {isTelugu ? 'కార్బోహైడ్రేట్లు (Carbs)' : 'Low-GI Carbs'}
                    </span>
                    <div className="text-lg font-black text-amber-700 dark:text-amber-300">
                      {activeDayNutrients.carbsGrams}g
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-semibold">
                      {activeDayNutrients.carbsPct}% of energy
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 block">
                      {isTelugu ? 'ఆరోగ్యకర కొవ్వులు (Fats)' : 'Healthy Fats'}
                    </span>
                    <div className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                      {activeDayNutrients.fatGrams}g
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400/90 font-semibold">
                      {activeDayNutrients.fatPct}% of energy
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 block">
                      {isTelugu ? 'పీచు పదార్థం (Fiber)' : 'Dietary Fiber'}
                    </span>
                    <div className="text-lg font-black text-teal-700 dark:text-teal-300">
                      {activeDayNutrients.fiberGrams}g
                    </div>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400/90 font-semibold">
                      Target &gt;30g/day
                    </span>
                  </div>
                </div>

                {/* Macro Distribution Ratio Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${activeDayNutrients.proteinPct}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Protein: ${activeDayNutrients.proteinPct}%`}
                    />
                    <div
                      style={{ width: `${activeDayNutrients.carbsPct}%` }}
                      className="bg-amber-500 transition-all duration-300"
                      title={`Carbs: ${activeDayNutrients.carbsPct}%`}
                    />
                    <div
                      style={{ width: `${activeDayNutrients.fatPct}%` }}
                      className="bg-indigo-500 transition-all duration-300"
                      title={`Healthy Fats: ${activeDayNutrients.fatPct}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Protein ({activeDayNutrients.proteinPct}%)
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" /> Carbs ({activeDayNutrients.carbsPct}%)
                    </span>
                    <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 inline-block" /> Healthy Fats ({activeDayNutrients.fatPct}%)
                    </span>
                  </div>
                </div>

                {/* Nutrient Gap Analysis: Micronutrient & Fiber Sufficiency Engine */}
                <div className="pt-2">
                  <NutrientGapAnalysisCard
                    report={nutrientGapReport}
                    plan={dietPlan}
                    customMeals={mealSwaps}
                    activeDayNumber={activeDayNumber}
                    onSelectRecipe={handleOpenRecipe}
                  />
                </div>
              </div>
            </div>

            {/* Meal Prep Notification & Reminder Engine */}
            <MealPrepNotificationBanner
              todayMeals={currentDayActiveMeals}
              onOpenRecipe={handleOpenRecipe}
              onOpenCookingTimer={recipe => handleOpenCookingTimer(recipe, 'prep')}
            />

            {/* Active Filter Results Status Banner */}
            {isFilterActive && (
              <div
                id="diet-filters-status-banner"
                className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-teal-950 dark:text-teal-200"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>
                    {isTelugu
                      ? `ఫిల్టర్ చేయబడినవి: ${displayedMealEntries.length} వంటకాలు సరిపోలాయి (${[
                          difficultyFilter !== 'All' ? `కష్టం: ${difficultyFilter}` : null,
                          dietaryTags.glutenFree ? 'గ్లూటెన్-ఫ్రీ' : null,
                          dietaryTags.lowGlycemic ? 'లో-గ్లైసెమిక్' : null,
                          dietaryTags.dairyFree ? 'డైరీ-ఫ్రీ' : null
                        ].filter(Boolean).join(', ')}).`
                      : `Showing ${displayedMealEntries.length} of ${mealEntries.length} meals matching active filters (${[
                          difficultyFilter !== 'All' ? `Difficulty: ${difficultyFilter}` : null,
                          dietaryTags.glutenFree ? 'Gluten-Free' : null,
                          dietaryTags.lowGlycemic ? 'Low-Glycemic' : null,
                          dietaryTags.dairyFree ? 'Dairy-Free' : null
                        ].filter(Boolean).join(', ')}).`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100 underline shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{isTelugu ? 'ఫిల్టర్లు క్లియర్' : 'Clear Filters'}</span>
                </button>
              </div>
            )}

            {/* 6 Meals Grid for Active Day or Filtered Empty State */}
            {displayedMealEntries.length === 0 ? (
              <div
                id="diet-filters-empty-state"
                className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Filter className="h-6 w-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isTelugu ? 'ఎంచుకున్న ఫిల్టర్లకు సరిపోయే వంటకాలు కనుగొనబడలేదు' : 'No recipes match the selected filters on this day'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {isTelugu
                    ? 'మీరు ఎంచుకున్న వంట సమయం లేదా గ్లూటెన్/డైరీ ట్యాగ్‌లు ఈ రోజు వంటకాలతో సరిపోలలేదు. దయచేసి ఇతర ఫిల్టర్‌లను ఎంచుకోండి లేదా రీసెట్ చేయండి.'
                    : 'Try selecting a different culinary difficulty level or unchecking some dietary tags to view full meal options.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'అన్ని ఫిల్టర్లను రీసెట్ చేయండి' : 'Reset All Filters'}</span>
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`diet-grid-${preference}-${currentDayPlan.dayNumber}-${difficultyFilter}-${dietaryTags.glutenFree}-${dietaryTags.lowGlycemic}-${dietaryTags.dairyFree}`}
                  variants={mealGridContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {displayedMealEntries.map(
                    ({ slotKey, category, primaryRecipe, alternativeRecipe, activeRecipe, isSwapped, activeMatches, altMatches }) => {
                      const mealMeta = getMealCategoryLabel(category);
                      const isSaved = isRecipeSaved(activeRecipe.id);
                      const hasAlternative = !!(alternativeRecipe && alternativeRecipe.id !== primaryRecipe.id);
                      const suggestSwap = isFilterActive && !activeMatches && altMatches;

                      return (
                        <motion.div
                          key={`${slotKey}-${activeRecipe.id}-${preference}`}
                          variants={mealCardItemVariants}
                          layout="position"
                          className="h-full flex flex-col relative"
                        >
                          {suggestSwap && (
                            <div className="mb-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                              <span>💡 {isTelugu ? 'ప్రత్యామ్నాయ వంటకం మీ ఫిల్టర్‌కు సరిపోలుతుంది!' : 'Alternative meal matches your active filter!'}</span>
                              <button
                                type="button"
                                onClick={() => toggleSwapMeal(currentDayPlan.dayNumber, slotKey)}
                                className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] shrink-0 transition-colors"
                              >
                                {isTelugu ? 'మార్చు' : 'Swap'}
                              </button>
                            </div>
                          )}
                          <ExpandableMealCard
                            recipe={activeRecipe}
                            primaryRecipe={primaryRecipe}
                            mealCategory={category}
                            mealLabel={mealMeta.label}
                            mealTime={mealMeta.time}
                            slotKey={slotKey}
                            dayNumber={currentDayPlan.dayNumber}
                            isSwapped={isSwapped}
                            hasAlternative={hasAlternative}
                            onToggleSwap={() => toggleSwapMeal(currentDayPlan.dayNumber, slotKey)}
                            isSaved={isSaved}
                            onToggleBookmark={handleToggleBookmark}
                            onOpenModal={handleOpenRecipe}
                            onStartTimer={handleOpenCookingTimer}
                          />
                        </motion.div>
                      );
                    }
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Recharts Aggregate Weekly Macro-Nutrient Distribution & Adherence Chart */}
            <WeeklyMacroDistributionChart
              dietPlan={dietPlan}
              calculateNutrientsForDay={calculateNutrientsForDay}
              preference={preference}
            />

            {/* Core PCOS Dietary Guidelines Accordion */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'PCOS నియంత్రణకు ముఖ్యమైన 4 సూత్రాలు' : '4 Core Principles of PCOS Medical Nutrition'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {dietPlan.guidelines.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                  >
                    <span className="font-extrabold text-slate-900 dark:text-teal-300 block">
                      {g.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {g.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CRAVING CHEF & RECIPE AI BOT */}
        {/* ============================================================ */}
        {activeTab === 'chatbot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CravingRecipeChatbot
                patientData={patientData}
                riskLevel={predictionResult?.risk_level || 'Moderate'}
                preference={preference}
                onSelectRecipe={handleOpenRecipe}
              />
            </div>

            {/* Sidebar Inspiration & Popular PCOS Cravings */}
            <div className="space-y-5">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-400">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isTelugu ? 'క్రేవింగ్ బాట్ ఎలా పనిచేస్తుంది?' : 'How Craving Chef Works'}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isTelugu
                    ? 'PCOS ఉన్నప్పుడు తీపి లేదా కారమైన ఆహారాలు తినాలనే కోరికలు రావడం చాలా సహజం. ఈ బాట్ మీకు నచ్చిన రుచులను ఇస్తూనే, రక్తంలో చక్కెర పెరగకుండా ఉండేలా వంటకాలను రూపొందిస్తుంది.'
                    : 'Intense cravings are biologically driven by insulin spikes and androgen dips. Rather than resisting cravings, Craving Chef replaces high-GI triggers with hormone-protective functional alternatives.'}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Spicy / Hot:</strong> Uses thermogenic chilies, mustard & ginger without vegetable seed oils.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Sweet / Desserts:</strong> Powered by raw cacao, ceylon cinnamon, and prebiotic chia seeds.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Comfort / Biryani:</strong> High-protein cauliflower and aged brown basmati with saffron.</span>
                  </div>
                </div>
              </div>

              {/* Master Recipe Library Quick Pick */}
              <div className="rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 p-5 text-white shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  {isTelugu ? 'అత్యంత ప్రజాదరణ పొందిన వంటకాలు' : 'Trending Cravings'}
                </span>
                <h4 className="text-sm font-extrabold">
                  {isTelugu ? 'వెంటనే ప్రయత్నించదగిన స్పెషల్స్' : 'Instant Craving Solvers'}
                </h4>
                <div className="space-y-2 pt-1">
                  {MASTER_RECIPES.slice(0, 3).map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => handleOpenRecipe(rec)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-bold truncate">{isTelugu && rec.nameTe ? rec.nameTe : rec.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SAVED RECIPES COLLECTION */}
        {/* ============================================================ */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'నా సేవ్ చేసిన వంటకాల పుస్తకం' : 'My Saved Recipe Collection'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe bookmarked' : 'recipes bookmarked'} for future meal prep
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={savedSearchQuery}
                  onChange={e => setSavedSearchQuery(e.target.value)}
                  placeholder={isTelugu ? 'సేవ్ చేసిన వంటకాలలో వెతకండి...' : 'Search saved recipes...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {filteredSavedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSavedRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-400 dark:hover:border-teal-700 transition-colors duration-150 transform-none"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                          {recipe.mealType.replace('_', ' ')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(recipe)}
                          className="text-amber-500 hover:text-rose-500 p-1 transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck className="h-4 w-4 fill-current" />
                        </button>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {isTelugu && recipe.nameTe ? recipe.nameTe : recipe.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {isTelugu && recipe.taglineTe ? recipe.taglineTe : recipe.tagline}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl text-[11px] border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Cal</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{recipe.calories}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Protein</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{recipe.proteinGrams}g</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Time</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{recipe.cookTimeMinutes}m</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenRecipe(recipe)}
                        className="w-full bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Utensils className="h-3.5 w-3.5 text-teal-300" />
                        <span>{isTelugu ? 'తయారీ విధానం చూడండి' : 'View Making Process & Recipe'}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'ఇంకా ఎలాంటి వంటకాలు సేవ్ చేయలేదు' : 'No Saved Recipes Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isTelugu
                      ? '7 రోజుల డైట్ ప్లాన్ లేదా క్రేవింగ్ చెఫ్ AI బాట్ నుండి మీకు నచ్చిన వంటకాలను బుక్‌మార్క్ చిహ్నం ద్వారా సేవ్ చేసుకోవచ్చు.'
                      : 'Bookmark your favorite recipes from the 7-day board or ask Craving Chef to save dishes to your personal recipe book.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('board')}
                  className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'డైట్ బోర్డును పరిశీలించండి' : 'Browse 7-Day Diet Board'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PERSONALIZED RISK REASONS & MECHANISMS */}
        {/* ============================================================ */}
        {activeTab === 'reasons' && (
          <div className="space-y-6">
            <PersonalizedRiskReasonsCard
              patientData={patientData}
              prediction={predictionResult}
              riskLevel={predictionResult?.risk_level || 'Moderate'}
              showDietPlanCTA={false}
            />
          </div>
        )}
      </div>

      {/* Recipe Detail & Cooking Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onBookmarkChange={refreshSavedRecipes}
        onStartTimer={handleOpenCookingTimer}
      />

      {/* Global Kitchen Cooking & Prep Timer */}
      <CookingTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        initialSeconds={timerConfig.seconds}
        initialLabel={timerConfig.label}
        initialRecipeName={timerConfig.recipeName}
        currentDayPlan={currentDayPlan}
      />

      {/* Subscription Payment Modal */}
      <SubscriptionPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        userEmail={user?.email}
        userName={user?.full_name}
        userId={user?.id || 'usr_patient_sample'}
        onSuccess={() => refreshSub()}
        initialSelectedPlan={userSub?.isBlocked ? 'plan_100' : 'plan_100'}
      />
    </div>
  );
};
