import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Flame,
  Bookmark,
  BookmarkCheck,
  Check,
  Sparkles,
  Printer,
  Share2,
  Utensils,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
  Heart,
  Timer
} from 'lucide-react';
import { RecipeItem } from '../types';
import { isRecipeSaved, saveRecipe, removeSavedRecipe } from '../services/dietPlanService';
import { useLanguage } from '../translations';
import { getRecipeImage } from '../utils/recipeImages';

interface RecipeModalProps {
  recipe: RecipeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkChange?: (isSaved: boolean) => void;
  onStartTimer?: (recipe: RecipeItem, type: 'prep' | 'cook') => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onBookmarkChange,
  onStartTimer
}) => {
  const { isTelugu } = useLanguage();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [activeStep, setActiveStep] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (recipe) {
      setIsSaved(isRecipeSaved(recipe.id));
      setCheckedIngredients({});
      setActiveStep(0);
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedRecipe(recipe.id);
      setIsSaved(false);
      onBookmarkChange?.(false);
      showToast(isTelugu ? 'రెసిపీ తీసివేయబడింది' : 'Removed from Saved Recipes');
    } else {
      saveRecipe(recipe);
      setIsSaved(true);
      onBookmarkChange?.(true);
      showToast(isTelugu ? 'రెసిపీ సేవ్ చేయబడింది!' : 'Saved to My Recipe Book!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      id="recipe-detail-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        id="recipe-detail-modal-content"
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-teal-500/40 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <Check className="h-3.5 w-3.5 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header with Authentic Recipe Photography */}
        <div className="relative min-h-[170px] sm:min-h-[210px] w-full overflow-hidden bg-slate-950 shrink-0 border-b border-slate-800">
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80';
            }}
          />
          {/* High legibility gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />

          <div className="relative p-5 sm:p-6 text-white flex flex-col justify-between h-full min-h-[170px] sm:min-h-[210px]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/80 text-teal-300 border border-teal-400/40 backdrop-blur-md">
                    {recipe.mealType.replace('_', ' ')}
                  </span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs ${
                    recipe.preference === 'non_vegetarian'
                      ? 'bg-rose-950/85 text-rose-200 border-rose-500/50'
                      : 'bg-emerald-950/85 text-emerald-200 border-emerald-500/50'
                  }`}>
                    {recipe.preference === 'non_vegetarian' ? (isTelugu ? '🍗 మాంసాహారం' : '🍗 Non-Vegetarian High Protein') : (isTelugu ? '🌱 శాఖాహారం' : '🌱 100% Plant / Vegetarian')}
                  </span>
                  {recipe.cravingType && (
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
                      {recipe.cravingType} craving
                    </span>
                  )}
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                    GI: {recipe.glycemicIndex}
                  </span>
                </div>

                <h2
                  id="recipe-modal-title"
                  className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight drop-shadow-sm"
                >
                  {isTelugu && recipe.nameTe ? recipe.nameTe : recipe.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-snug drop-shadow-xs max-w-2xl">
                  {isTelugu && recipe.taglineTe ? recipe.taglineTe : recipe.tagline}
                </p>
              </div>

              {/* Top Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSaved
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
                id="recipe-modal-bookmark-btn"
                title={isSaved ? 'Remove Bookmark' : 'Save Recipe'}
                aria-label={isSaved ? 'Remove Bookmark' : 'Save Recipe'}
              >
                {isSaved ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                <span className="hidden sm:inline">{isSaved ? (isTelugu ? 'సేవ్ చేయబడింది' : 'Saved') : (isTelugu ? 'సేవ్ చేయండి' : 'Save')}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all"
                title="Print Recipe"
                aria-label="Print Recipe"
                id="recipe-modal-print-btn"
              >
                <Printer className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-rose-500/80 transition-all border border-white/20"
                aria-label="Close recipe modal"
                id="recipe-modal-close-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Key Nutritional & Time Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
            {/* Dedicated Prep Time Indicator */}
            <div className="bg-amber-950/40 rounded-lg p-2 border border-amber-800/60 flex flex-col justify-between">
              <span className="text-[10px] block text-amber-300 uppercase font-bold">{isTelugu ? 'ప్రిపరేషన్' : 'Prep Time'}</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-amber-400" />
                <span className="text-xs sm:text-sm font-black text-amber-200">{recipe.prepTimeMinutes}m</span>
              </div>
              {onStartTimer && (
                <button
                  type="button"
                  onClick={() => onStartTimer(recipe, 'prep')}
                  className="mt-1 text-[9px] font-bold text-amber-300 hover:text-white bg-amber-900/50 hover:bg-amber-800 px-1.5 py-0.5 rounded transition-colors"
                >
                  ⏱️ {isTelugu ? 'టైమర్' : 'Timer'}
                </button>
              )}
            </div>

            {/* Dedicated Cook Time Indicator */}
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'వండే సమయం' : 'Cook Time'}</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Flame className="h-3 w-3 text-rose-400" />
                <span className="text-xs sm:text-sm font-bold text-white">{recipe.cookTimeMinutes}m</span>
              </div>
              {onStartTimer && (
                <button
                  type="button"
                  onClick={() => onStartTimer(recipe, 'cook')}
                  className="mt-1 text-[9px] font-bold text-teal-300 hover:text-white bg-teal-900/50 hover:bg-teal-800 px-1.5 py-0.5 rounded transition-colors"
                >
                  ⏱️ {isTelugu ? 'టైమర్' : 'Timer'}
                </button>
              )}
            </div>

            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'క్యాలరీలు' : 'Calories'}</span>
              <span className="text-xs sm:text-sm font-bold text-teal-300 mt-0.5 block">{recipe.calories} kcal</span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'ప్రొటీన్' : 'Protein'}</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">{recipe.proteinGrams}g</span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'పీచు పదార్థం' : 'Fiber'}</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-300 mt-0.5 block">{recipe.fiberGrams}g</span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'పిండి పదార్థాలు' : 'Carbs'}</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block">{recipe.carbsGrams}g</span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <span className="text-[10px] block text-slate-400 uppercase font-semibold">{isTelugu ? 'కొవ్వు' : 'Fat'}</span>
              <span className="text-xs sm:text-sm font-bold text-sky-300 mt-0.5 block">{recipe.fatGrams}g</span>
            </div>
          </div>
        </div>
      </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: PCOS Clinical Hormone Benefits */}
          <div className="bg-teal-50/70 dark:bg-teal-950/30 rounded-xl p-4 border border-teal-200/80 dark:border-teal-900/60">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
                {isTelugu ? 'ఈ రెసిపీ వల్ల PCOS హార్మోన్లకు కలిగే ప్రయోజనాలు:' : 'PCOS Hormone & Metabolic Benefits:'}
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {(isTelugu && recipe.pcosHormoneBenefitsTe ? recipe.pcosHormoneBenefitsTe : recipe.pcosHormoneBenefits).map(
                (benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Section 2: Ingredients Checklist */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>{isTelugu ? 'కావలసిన పదార్థాలు & కొలతలు' : 'Ingredients Checklist'}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ({recipe.servings} {recipe.servings > 1 ? (isTelugu ? 'సర్వింగ్స్' : 'servings') : (isTelugu ? 'సర్వింగ్' : 'serving')})
                </span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic hidden sm:inline">
                {isTelugu ? 'వంట చేస్తూ టిక్ చేయండి' : 'Click to check off as you prep'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredientCheck(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-bold block ${
                          isChecked
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {ing.item}
                      </span>
                      <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold block mt-0.5">
                        {ing.amount}
                      </span>
                      {ing.pcosBenefit && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                          ✨ {ing.pcosBenefit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Step-by-Step Cooking / Making Instructions */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>{isTelugu ? 'తయారీ విధానం (దశల వారీగా)' : 'Step-by-Step Cooking & Making Process'}</span>
              </h3>
              {onStartTimer && (
                <button
                  type="button"
                  onClick={() => onStartTimer(recipe, 'cook')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 text-xs font-bold transition-colors"
                >
                  <Timer className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'వంట టైమర్ ప్రారంభించండి' : 'Start Cooking Timer'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(isTelugu && recipe.instructionsTe ? recipe.instructionsTe : recipe.instructions).map((step, sIdx) => {
                const isStepActive = activeStep === sIdx;
                return (
                  <div
                    key={sIdx}
                    onClick={() => setActiveStep(sIdx)}
                    className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                      isStepActive
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isStepActive
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sIdx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Clinical Pro-Tips */}
          {recipe.proTips && recipe.proTips.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  {isTelugu ? 'పోషకాహార నిపుణుల సలహాలు (Pro Tips):' : 'Clinical Nutritionist Pro-Tips:'}
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {(isTelugu && recipe.proTipsTe ? recipe.proTipsTe : recipe.proTips).map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleSave}
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /> : <Bookmark className="h-4 w-4" />}
            <span>{isSaved ? (isTelugu ? 'సేవ్ చేయబడింది' : 'Saved to Recipe Book') : (isTelugu ? 'తర్వాత కోసం సేవ్ చేయండి' : 'Save for Later')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-teal-800 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-xl shadow-xs transition-all"
            id="recipe-modal-done-btn"
          >
            {isTelugu ? 'పూర్తయింది' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
