import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Sparkles,
  Calendar,
  ChevronRight,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Bot
} from 'lucide-react';
import { RecipeItem, DailyDietPlan, DietPreference, MealCategory } from '../types';
import { generateSevenDayDietPlan, isRecipeSaved, saveRecipe, removeSavedRecipe } from '../services/dietPlanService';
import { RecipeModal } from './RecipeModal';
import { useLanguage } from '../translations';
import { useAssessment } from '../context/AssessmentContext';
import { getRecipeImage } from '../utils/recipeImages';

interface DietPlanDashboardWidgetProps {
  onOpenAssistant?: (prompt?: string) => void;
}

export const DietPlanDashboardWidget: React.FC<DietPlanDashboardWidgetProps> = () => {
  const { predictionResult, patientData } = useAssessment();
  const { isTelugu } = useLanguage();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [preference, setPreference] = useState<DietPreference>(() => {
    try {
      const saved = localStorage.getItem('pcosense_diet_preference');
      if (saved === 'non_vegetarian' || saved === 'vegetarian' || saved === 'south_indian' || saved === 'vegan') {
        return saved as DietPreference;
      }
    } catch {}
    return 'vegetarian';
  });

  const handleSetPreference = (newPref: DietPreference) => {
    setPreference(newPref);
    try {
      localStorage.setItem('pcosense_diet_preference', newPref);
    } catch {}
  };

  const dietPlan = generateSevenDayDietPlan(
    predictionResult?.risk_level || 'Moderate',
    preference,
    patientData
  );

  const todayPlan: DailyDietPlan = dietPlan.days[0];

  const handleOpenRecipe = (recipe: RecipeItem) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const keyMeals = [
    { label: isTelugu ? '🌅 అల్పాహారం (Breakfast)' : '🌅 Breakfast', recipe: todayPlan.meals.breakfast },
    { label: isTelugu ? '🥗 భోజనం (Lunch)' : '🥗 Lunch', recipe: todayPlan.meals.lunch },
    { label: isTelugu ? '🍵 స్నాక్స్ (Snack)' : '🍵 Snack', recipe: todayPlan.meals.eveningSnack },
    { label: isTelugu ? '🍲 రాత్రి భోజనం (Dinner)' : '🍲 Dinner', recipe: todayPlan.meals.dinner }
  ];

  return (
    <div
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
      id="diet-plan-dashboard-widget"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <Utensils className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isTelugu ? 'నేటి యాంటీ-PCOS డైట్ ప్లాన్ & భోజనం' : "Today's Anti-PCOS Diet Plan & Board"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                {todayPlan.targetCalories} kcal
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isTelugu && todayPlan.primaryHormoneGoalTe ? todayPlan.primaryHormoneGoalTe : todayPlan.primaryHormoneGoal}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Veg / Non-Veg Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => handleSetPreference('vegetarian')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                preference === 'vegetarian'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="widget-pref-veg-btn"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              <span>{isTelugu ? 'శాకాహారం' : 'Veg'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPreference('non_vegetarian')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                preference === 'non_vegetarian'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="widget-pref-nonveg-btn"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-300"></span>
              <span>{isTelugu ? 'మాంసాహారం' : 'Non-Veg'}</span>
            </button>
          </div>

          <Link
            to="/diet-plan"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-all"
            id="widget-view-full-7day-plan-btn"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{isTelugu ? '7 రోజుల ప్లాన్' : '7-Day Plan'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Key Meals of Today */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {keyMeals.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-3 flex flex-col justify-between space-y-3 hover:border-teal-300 dark:hover:border-teal-800 transition-all group overflow-hidden"
            >
              <div>
                {/* Authentic recipe image thumbnail */}
                <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-950">
                  <img
                    src={getRecipeImage(m.recipe)}
                    alt={m.recipe.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-xs border border-white/10">
                    {m.label}
                  </span>
                  <span className={`absolute bottom-1.5 right-1.5 text-[10px] font-black px-1.5 py-0.5 rounded backdrop-blur-xs border shadow-2xs ${
                    m.recipe.preference === 'non_vegetarian'
                      ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                      : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                  }`}>
                    {m.recipe.preference === 'non_vegetarian' ? '🍗 Non-Veg' : '🌱 Veg'}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                  {isTelugu && m.recipe.nameTe ? m.recipe.nameTe : m.recipe.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-semibold flex-wrap">
                  <span className="text-amber-700 dark:text-amber-400 font-bold">🔥 {m.recipe.calories} kcal</span>
                  <span>•</span>
                  <span>💪 {m.recipe.proteinGrams}g Protein</span>
                  <span>•</span>
                  <span>🌾 {m.recipe.fiberGrams}g Fiber</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenRecipe(m.recipe)}
                className="w-full bg-white dark:bg-slate-900 hover:bg-teal-800 hover:text-white dark:hover:bg-teal-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1 shadow-2xs"
              >
                <Utensils className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'తయారీ విధానం' : 'View Recipe'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Craving Chef AI Quick Launcher Bar */}
        <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/40 dark:to-indigo-950/40 rounded-xl p-3.5 border border-teal-200/80 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{isTelugu ? 'ఆహార కోరికలు ఉన్నాయా? (Craving Chef AI)' : 'Having food cravings? Ask Craving Chef AI'}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-teal-600 text-white">AI</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {isTelugu
                  ? 'స్పైసీ, స్వీట్, లేదా వేడి సూప్ రెసిపీలను ఇన్సులిన్ పెరగకుండా రూపొందించండి.'
                  : 'Get instant hormone-safe recipes for spicy food, desserts, soups & weekend treats.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/diet-plan"
              className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              id="dashboard-widget-craving-bot-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              <span>{isTelugu ? 'క్రేవింగ్ బాట్‌తో మాట్లాడండి' : 'Open Craving Chef'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
    </div>
  );
};
