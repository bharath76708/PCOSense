import React, { useState, useEffect } from 'react';
import {
  Utensils,
  PlusCircle,
  CheckCircle2,
  Flame,
  PieChart,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { DetailedRecipeItem, DailyNutritionLog } from '../types';
import {
  getActiveRecipes,
  getDailyNutritionLog,
  logRecipeMeal,
  calculateNutritionSummary,
  fetchRecipesFromFirestore
} from '../services/recipeNutritionService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { YogaNutritionMediaLibrary } from '../components/YogaNutritionMediaLibrary';

export const NutritionTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const [recipes, setRecipes] = useState<DetailedRecipeItem[]>(() => getActiveRecipes());

  useEffect(() => {
    let isMounted = true;
    fetchRecipesFromFirestore().then(fetched => {
      if (isMounted && fetched && fetched.length > 0) {
        setRecipes(fetched.filter(r => r.isActive));
      }
    }).catch(err => {
      console.warn('Could not fetch recipes from Firestore:', err);
    });

    const handleUpdate = () => {
      setRecipes(getActiveRecipes());
    };

    window.addEventListener('pcosense_recipes_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('pcosense_recipes_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<DetailedRecipeItem | null>(() => recipes[0] || null);

  const [nutritionLog, setNutritionLog] = useState<DailyNutritionLog>(() =>
    getDailyNutritionLog(user?.id || 'guest-user')
  );
  const [toastMessage, setToastMessage] = useState<string>('');

  const categories = ['All', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Bedtime Drink'];

  const filteredRecipes = selectedCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category === selectedCategory);

  const handleLogMeal = (recipe: DetailedRecipeItem) => {
    const updated = logRecipeMeal(user?.id || 'guest-user', recipe);
    setNutritionLog(updated);
    setToastMessage(
      isTelugu
        ? `"${recipe.nameTe || recipe.name}" విజయవంతంగా మీ రోజువారీ ఆహారంలో చేర్చబడింది!`
        : `"${recipe.name}" added to today's clinical nutrition log!`
    );
    setTimeout(() => setToastMessage(''), 3500);
  };

  const summaries = calculateNutritionSummary(nutritionLog);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="nutrition-tracking-page-root">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-teal-700/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'ధృవీకరించబడిన మైక్రో-న్యూట్రిషన్ ఇంజిన్' : 'Clinically Grounded Nutrient Tracking'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {isTelugu ? 'PCOS న్యూట్రిషన్ & రెసిపీ ట్రాకర్' : 'PCOS Structured Nutrition & Recipe Engine'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
            {isTelugu
              ? 'ప్రతి రెసిపీలో ఖచ్చితమైన కాల్షియం, ఐరన్, జింక్, మెగ్నీషియం మరియు పీచు విలువలు ఉంటాయి. ఎలాంటి ఊహాజనిత సంఖ్యలు లేకుండా సైన్స్ ఆధారితంగా లెక్కించబడుతుంది.'
              : 'Structured per-serving micronutrient records (Calcium, Iron, Zinc, Magnesium, Potassium, Fiber) calibrated for insulin resistance and androgen balancing with verifiable daily progress.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {isTelugu ? 'ఖచ్చితమైన పోషక విలువలు' : 'Deterministic Lab-Standard Values'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {nutritionLog.completedMeals.length} {isTelugu ? 'భోజనాలు నమోదయ్యాయి' : 'Meals Logged Today'}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Daily Nutrition Intake Summary Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6" id="daily-nutrition-dashboard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-teal-500" />
              {isTelugu ? 'ఈ రోజు పోషకాహార పురోగతి' : "Today's Clinical Nutrient Progress"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? 'సేవించిన పోషకాలు vs సిఫార్సు చేయబడిన రోజువారీ లక్ష్యాలు'
                : 'Real-time consumed nutrients vs daily therapeutic targets'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isTelugu ? 'క్యాలరీలు:' : 'Calories:'} <strong>{nutritionLog.consumed.calories}</strong> / {nutritionLog.targets.calories} kcal
            </span>
            <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {isTelugu ? 'ప్రోటీన్:' : 'Protein:'} <strong>{nutritionLog.consumed.protein}g</strong> / {nutritionLog.targets.protein}g
            </span>
          </div>
        </div>

        {/* Micronutrient Progress Bars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map(metric => {
            const isFinished = metric.percentage >= 100;
            return (
              <div
                key={metric.name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                id={`metric-progress-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isTelugu ? metric.nameTe : metric.name}
                  </span>
                  <span className={`font-extrabold ${isFinished ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {metric.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFinished
                        ? 'bg-emerald-500'
                        : metric.percentage > 50
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>
                    {isTelugu ? 'తీసుకున్నది:' : 'Consumed:'} {metric.consumed}{metric.unit}
                  </span>
                  <span>
                    {isTelugu ? 'లక్ష్యం:' : 'Target:'} {metric.target}{metric.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logged Meals List */}
        {nutritionLog.completedMeals.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isTelugu ? 'ఈ రోజు తిన్న వంటకాలు:' : 'Meals Logged Today:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {nutritionLog.completedMeals.map((meal, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                  {meal.recipeName} ({meal.calories} kcal)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Showcase & Category Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isTelugu ? 'ధృవీకరించబడిన PCOS వంటకాలు' : 'Verified Clinical PCOS Recipes'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu ? 'ఖచ్చితమైన పోషకాల లెక్కలతో రూపొందించబడిన వంటకాలు' : 'Every recipe includes exact per-serving lab nutrition metrics'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              id={`recipe-card-${recipe.id}`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/quinoa_chickpea_bowl.jpg';
                    }}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                      {recipe.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    {recipe.nutrition.calories} kcal / serving
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                    {isTelugu && recipe.nameTe ? recipe.nameTe : recipe.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {isTelugu && recipe.descriptionTe ? recipe.descriptionTe : recipe.description}
                  </p>

                  {/* "After eating 1 serving, you get approximately..." calculation card */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {isTelugu ? '1 సర్వింగ్ తిన్న తర్వాత మీరు పొందేవి:' : 'After eating 1 serving, you get approximately:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isTelugu ? 'ప్రోటీన్' : 'Protein'}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{recipe.nutrition.protein}g</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isTelugu ? 'పీచు' : 'Fiber'}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{recipe.nutrition.fiber}g</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isTelugu ? 'ఐరన్' : 'Iron'}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{recipe.nutrition.iron}mg</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-teal-900 dark:text-teal-200 font-medium px-1">
                      <span>Zinc: {recipe.nutrition.zinc}mg</span>
                      <span>Magnesium: {recipe.nutrition.magnesium}mg</span>
                      <span>Calcium: {recipe.nutrition.calcium}mg</span>
                    </div>
                  </div>

                  {/* Hormonal benefits */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {isTelugu && recipe.pcosBenefitsTe ? recipe.pcosBenefitsTe : recipe.pcosBenefits}
                    </span>
                  </div>
                </div>
              </div>

              {/* Log Meal Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => handleLogMeal(recipe)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  id={`log-meal-btn-${recipe.id}`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{isTelugu ? 'ఈ భోజనాన్ని ట్రాకర్‌లో చేర్చండి' : 'Log This Meal to Daily Intake'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Clinical Cooking & Nutrition Media Library */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <YogaNutritionMediaLibrary defaultType="nutrition" />
      </div>
    </div>
  );
};
