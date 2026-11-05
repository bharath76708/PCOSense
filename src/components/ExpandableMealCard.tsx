import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Heart,
  Timer,
  Utensils,
  CheckCircle2,
  Circle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Zap,
  ChefHat,
  Award,
  Wheat,
  Milk
} from 'lucide-react';
import { RecipeItem, MealCategory } from '../types';
import { useLanguage } from '../translations';
import { getRecipeImage } from '../utils/recipeImages';
import { MealHydrationBadge } from './MealHydrationBadge';
import {
  getRecipeDifficulty,
  getDifficultyBadgeStyle,
  isRecipeGlutenFree,
  isRecipeDairyFree,
  isRecipeLowGlycemic
} from '../utils/dietFilterUtils';
import { motion, AnimatePresence } from 'motion/react';

interface ExpandableMealCardProps {
  recipe: RecipeItem;
  primaryRecipe: RecipeItem;
  mealCategory: MealCategory;
  mealLabel: string;
  mealTime: string;
  slotKey: string;
  dayNumber: number;
  isSwapped: boolean;
  hasAlternative: boolean;
  onToggleSwap: () => void;
  isSaved: boolean;
  onToggleBookmark: (recipe: RecipeItem) => void;
  onOpenModal: (recipe: RecipeItem) => void;
  onStartTimer: (recipe: RecipeItem, type: 'prep' | 'cook') => void;
}

export const ExpandableMealCard: React.FC<ExpandableMealCardProps> = ({
  recipe,
  primaryRecipe,
  mealCategory,
  mealLabel,
  mealTime,
  slotKey,
  dayNumber,
  isSwapped,
  hasAlternative,
  onToggleSwap,
  isSaved,
  onToggleBookmark,
  onOpenModal,
  onStartTimer
}) => {
  const { isTelugu } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const recipeImg = getRecipeImage(recipe);
  const difficulty = getRecipeDifficulty(recipe);
  const diffStyle = getDifficultyBadgeStyle(difficulty);
  const isGlutenFree = isRecipeGlutenFree(recipe);
  const isDairyFree = isRecipeDairyFree(recipe);

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only toggle if the click wasn't on an interactive child element (button, link, input)
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      id={`meal-card-${recipe.id}`}
      onClick={handleCardClick}
      className={`rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
        isExpanded
          ? 'border-teal-500/80 dark:border-teal-500/80 ring-2 ring-teal-500/20 shadow-lg'
          : 'border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md'
      }`}
    >
      <div>
        {/* Visual Appetizing Image Header */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950 group">
          <img
            src={recipeImg}
            alt={recipe.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/30" />

          {/* Top category & dietary badge */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white border border-white/20 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>{mealLabel}</span>
              </span>

              {/* Dietary Indicator Badge */}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black backdrop-blur-md border shadow-xs ${
                recipe.preference === 'non_vegetarian'
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                  : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              }`}>
                {recipe.preference === 'non_vegetarian' ? (isTelugu ? '🍗 మాంసాహారం' : '🍗 Non-Veg') : (isTelugu ? '🌱 శాఖాహారం' : '🌱 100% Veg')}
              </span>
            </div>

            {/* Save Favorite Bookmark Icon */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleBookmark(recipe);
              }}
              id={`save-favorite-btn-${recipe.id}`}
              className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : 'bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-900 border border-white/20'
              }`}
              title={isSaved ? (isTelugu ? 'ఇష్టమైన వాటి నుండి తొలగించండి' : 'Remove from Favorites') : (isTelugu ? 'ఇష్టమైన వంటకంగా సేవ్ చేయండి' : 'Save Favorite Recipe')}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-white text-white' : ''}`} />
            </button>
          </div>

          {/* Bottom Title & Timing Overlay */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-2 mb-1 text-[10px] text-teal-300 font-semibold">
              <span>{mealTime}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{recipe.calories} kcal</span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-sm">
              {isTelugu && recipe.nameTe ? recipe.nameTe : recipe.name}
            </h4>
          </div>
        </div>

        {/* Swap Meal Control Strip (Option 1 vs Option 2) */}
        {hasAlternative && (
          <div className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (isSwapped) onToggleSwap();
                }}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  !isSwapped
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isTelugu ? 'ఆప్షన్ 1' : 'Option 1'}
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (!isSwapped) onToggleSwap();
                }}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  isSwapped
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isTelugu ? 'ఆప్షన్ 2' : 'Option 2 (Alt)'}
              </button>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleSwap();
              }}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                isSwapped
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/70 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 border-slate-200 dark:border-slate-800 hover:border-teal-400'
              }`}
              id={`swap-meal-btn-${dayNumber}-${slotKey}`}
            >
              <RefreshCw className={`h-3 w-3 ${isSwapped ? 'text-emerald-500 animate-spin-once' : 'text-teal-600 dark:text-teal-400'}`} />
              <span>{isSwapped ? (isTelugu ? 'రీసెట్' : 'Swapped') : (isTelugu ? 'మార్చండి' : 'Swap Meal')}</span>
            </button>
          </div>
        )}

        {/* Meal Content Summary */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Timing & GI Pill Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Difficulty Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border shadow-2xs ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
              title={`Culinary Difficulty: ${diffStyle.labelEn} (${diffStyle.timeRange})`}
            >
              {difficulty === 'Easy' && <Zap className="h-3 w-3 text-emerald-500" />}
              {difficulty === 'Medium' && <ChefHat className="h-3 w-3 text-amber-500" />}
              {difficulty === 'Advanced' && <Award className="h-3 w-3 text-indigo-500" />}
              <span>{isTelugu ? diffStyle.labelTe : diffStyle.labelEn}</span>
            </span>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
              Low GI
            </span>

            {/* Gluten-Free Pill Badge */}
            {isGlutenFree && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                <Wheat className="h-2.5 w-2.5 text-amber-600" />
                <span>GF</span>
              </span>
            )}

            {/* Dairy-Free Pill Badge */}
            {isDairyFree && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                <Milk className="h-2.5 w-2.5 text-indigo-600" />
                <span>DF</span>
              </span>
            )}

            {/* Dedicated Prep Time Indicator */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              title={`Prep Time: ${recipe.prepTimeMinutes} mins`}
            >
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{isTelugu ? 'ప్రిపరేషన్' : 'Prep'}: {recipe.prepTimeMinutes}m</span>
            </span>

            {/* Dedicated Cook Time Indicator */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              title={`Cook Time: ${recipe.cookTimeMinutes} mins`}
            >
              <Flame className="h-3 w-3 text-rose-500" />
              <span>{isTelugu ? 'వండటం' : 'Cook'}: {recipe.cookTimeMinutes}m</span>
            </span>

            {/* Suggested Hydration Badge */}
            <MealHydrationBadge mealCategory={mealCategory} recipe={recipe} />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isTelugu && recipe.taglineTe ? recipe.taglineTe : recipe.tagline}
          </p>

          {/* Hormone Benefit Highlights */}
          <div className="bg-teal-50/60 dark:bg-teal-950/20 rounded-xl p-2.5 border border-teal-100 dark:border-teal-900/30">
            <span className="text-[10px] font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-1">
              ✨ {isTelugu ? 'హార్మోన్ల ప్రయోజనం:' : 'Hormone Benefit:'}
            </span>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              {(isTelugu && recipe.pcosHormoneBenefitsTe
                ? recipe.pcosHormoneBenefitsTe
                : recipe.pcosHormoneBenefits
              ).slice(0, 2).join(' • ')}
            </p>
          </div>

          {/* Macros Bar */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block font-semibold">{isTelugu ? 'ప్రోటీన్' : 'Protein'}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{recipe.proteinGrams}g</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block font-semibold">{isTelugu ? 'కార్బ్స్' : 'Carbs'}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{recipe.carbsGrams}g</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block font-semibold">{isTelugu ? 'ఫ్యాట్స్' : 'Fat'}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{recipe.fatGrams}g</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 block font-semibold">{isTelugu ? 'పీచు' : 'Fiber'}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{recipe.fiberGrams}g</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPANDED RECIPE VIEW: INGREDIENTS + STEP-BY-STEP INSTRUCTIONS */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden px-4 pb-4 pt-1 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              onClick={e => e.stopPropagation()}
            >
              {/* Quick Actions Ribbon inside Expanded View */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(recipe)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                      isSaved
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                    }`}
                    id={`expanded-save-btn-${recipe.id}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>
                      {isSaved
                        ? isTelugu
                          ? 'సేవ్ చేయబడింది'
                          : 'Saved in Favorites'
                        : isTelugu
                        ? 'ఇష్టమైన వాటికి సేవ్ చేయండి'
                        : 'Save to Favorites'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(recipe, 'cook')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors"
                  >
                    <Timer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{isTelugu ? 'వంట టైమర్' : 'Start Timer'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenModal(recipe)}
                  className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-bold flex items-center gap-1"
                  title="Open full detailed popup"
                >
                  <span>{isTelugu ? 'పూర్తి స్క్రీన్' : 'Full Modal'}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Section 1: Breakdown of Ingredients */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{isTelugu ? 'కావలసిన పదార్థాలు' : 'Ingredients Breakdown'}</span>
                  </h5>
                  <span className="text-[10px] font-bold text-slate-400">
                    {recipe.ingredients.length} {isTelugu ? 'పదార్థాలు' : 'items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, iIdx) => (
                    <div
                      key={iIdx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {isTelugu && ing.nameTe ? ing.nameTe : ing.name}
                        </span>
                        {ing.benefit && (
                          <span className="text-[10px] text-teal-700 dark:text-teal-400 flex items-center gap-0.5 mt-0.5">
                            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                            <span className="line-clamp-1">{ing.benefit}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-extrabold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded-md shrink-0">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Step-by-Step Cooking Instructions */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span>{isTelugu ? 'తయారీ విధానం (దశల వారీగా)' : 'Step-by-Step Instructions'}</span>
                  </h5>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {completedSteps.size} / {(isTelugu && recipe.instructionsTe ? recipe.instructionsTe : recipe.instructions).length} {isTelugu ? 'పూర్తయ్యాయి' : 'done'}
                  </span>
                </div>

                <div className="space-y-2">
                  {(isTelugu && recipe.instructionsTe ? recipe.instructionsTe : recipe.instructions).map((step, sIdx) => {
                    const isDone = completedSteps.has(sIdx);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => toggleStepCompleted(sIdx)}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer select-none text-xs leading-relaxed ${
                          isDone
                            ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-70 line-through text-slate-400 dark:text-slate-500'
                            : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-teal-600 dark:text-teal-400 shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-400 hover:text-teal-500" />
                          )}
                        </button>
                        <span className="flex-1 font-medium">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pro Tips snippet if available */}
              {recipe.proTips && recipe.proTips.length > 0 && (
                <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-0.5">
                      💡 {isTelugu ? 'PCOS చిట్కా' : 'Pro PCOS Preparation Tip'}
                    </span>
                    <p className="leading-relaxed">
                      {isTelugu && recipe.proTipsTe ? recipe.proTipsTe[0] : recipe.proTips[0]}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Bottom Expansion Bar */}
      <div className="p-3 pt-0 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          id={`toggle-expand-btn-${recipe.id}`}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            isExpanded
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
              : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900'
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>{isTelugu ? 'వంటకాన్ని తగ్గించండి' : 'Collapse Recipe'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>{isTelugu ? 'వంటకం & విధానం చూడండి' : 'Expand Recipe & Ingredients'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onOpenModal(recipe);
          }}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-700 hover:text-white dark:hover:bg-teal-600 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
          title={isTelugu ? 'వివరమైన పాపప్ మోడల్ తెరవండి' : 'Open Detailed Recipe Modal'}
        >
          <Utensils className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
