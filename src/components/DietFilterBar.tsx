import React from 'react';
import {
  Filter,
  Clock,
  Sparkles,
  Zap,
  ChefHat,
  Award,
  Check,
  X,
  Wheat,
  Activity,
  Milk,
  RotateCcw
} from 'lucide-react';
import { DifficultyFilter, RecipeDifficulty } from '../types';
import { ActiveDietaryFilters } from '../utils/dietFilterUtils';
import { useLanguage } from '../translations';

export interface DietFilterBarProps {
  activeFilters: ActiveDietaryFilters;
  onChangeDifficulty: (diff: DifficultyFilter) => void;
  onToggleGlutenFree: () => void;
  onToggleLowGlycemic: () => void;
  onToggleDairyFree: () => void;
  onResetFilters: () => void;
  totalMatchingMealsCount: number;
  totalMealsCount: number;
}

export const DietFilterBar: React.FC<DietFilterBarProps> = ({
  activeFilters,
  onChangeDifficulty,
  onToggleGlutenFree,
  onToggleLowGlycemic,
  onToggleDairyFree,
  onResetFilters,
  totalMatchingMealsCount,
  totalMealsCount
}) => {
  const { isTelugu } = useLanguage();

  const isAnyFilterActive =
    activeFilters.difficulty !== 'All' ||
    activeFilters.glutenFree ||
    activeFilters.lowGlycemic ||
    activeFilters.dairyFree;

  const difficultyOptions: {
    key: DifficultyFilter;
    labelEn: string;
    labelTe: string;
    timeTag: string;
    timeTagTe: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'All',
      labelEn: 'All Recipes',
      labelTe: 'అన్ని వంటకాలు',
      timeTag: 'Any time',
      timeTagTe: 'ఏ సమయమైనా',
      icon: <Filter className="h-3.5 w-3.5" />
    },
    {
      key: 'Easy',
      labelEn: 'Easy',
      labelTe: 'సులువు (Easy)',
      timeTag: '≤ 20 mins',
      timeTagTe: '≤ 20 నిమిషాలు',
      icon: <Zap className="h-3.5 w-3.5 text-emerald-500" />
    },
    {
      key: 'Medium',
      labelEn: 'Medium',
      labelTe: 'మధ్యస్థం (Medium)',
      timeTag: '20–35 mins',
      timeTagTe: '20–35 నిమిషాలు',
      icon: <ChefHat className="h-3.5 w-3.5 text-amber-500" />
    },
    {
      key: 'Advanced',
      labelEn: 'Advanced',
      labelTe: 'నైపుణ్యం (Advanced)',
      timeTag: '35+ mins',
      timeTagTe: '35+ నిమిషాలు',
      icon: <Award className="h-3.5 w-3.5 text-indigo-500" />
    }
  ];

  return (
    <div
      id="diet-plan-filters-container"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? 'వంటకాల ఫిల్టర్లు & ఆహార ప్రాధాన్యతలు' : 'Recipe Filters & Dietary Preferences'}
              </h3>
              {isAnyFilterActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 animate-pulse">
                  {isTelugu ? 'ఫిల్టర్లు చురుగ్గా ఉన్నాయి' : 'Filters Active'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isTelugu
                ? 'మీ వంట సమయం మరియు గ్లూటెన్-ఫ్రీ, లో-గ్లైసెమిక్, డైరీ-ఫ్రీ ప్రాధాన్యతల ఆధారంగా 7 రోజుల ప్లాన్‌ను ఫిల్టర్ చేయండి.'
                : 'Filter 7-day recipes dynamically by cooking time, culinary experience, and endocrine diet tags.'}
            </p>
          </div>
        </div>

        {/* Counter & Reset Action */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {isTelugu
              ? `${totalMealsCount} లో ${totalMatchingMealsCount} వంటకాలు సరిపోలాయి`
              : `${totalMatchingMealsCount} of ${totalMealsCount} meals match`}
          </span>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              id="diet-filters-reset-btn"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-200 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 transition-colors"
              title="Reset all filters to show full 7-day plan"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isTelugu ? 'ఫిల్టర్లు రీసెట్' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Difficulty Filter (Easy, Medium, Advanced) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'వంట కష్టం / సమయం ఆధారిత ఫిల్టర్ (Difficulty)' : 'Culinary Experience & Available Time (Difficulty)'}</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {isTelugu ? 'తక్కువ సమయంలో లేదా నైపుణ్యం ఆధారంగా ఎంచుకోండి' : 'Select based on your kitchen schedule'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {difficultyOptions.map(opt => {
            const isSelected = activeFilters.difficulty === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChangeDifficulty(opt.key)}
                id={`difficulty-filter-btn-${opt.key.toLowerCase()}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-700 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isSelected ? 'text-white' : ''}>{opt.icon}</span>
                  <span className="text-xs font-bold">
                    {isTelugu ? opt.labelTe : opt.labelEn}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 sm:mt-0 ${
                    isSelected ? 'text-teal-200' : 'text-slate-400 dark:text-slate-400'
                  }`}
                >
                  {isTelugu ? opt.timeTagTe : opt.timeTag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Dietary Tag Toggles ('Gluten-Free', 'Low-Glycemic', 'Dairy-Free') */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'ఆహార ట్యాగ్ ఫిల్టర్లు (Gluten, GI, Dairy Tags)' : 'Endocrine Dietary Tag Filters'}</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {isTelugu ? 'ఒకటి లేదా అంతకంటే ఎక్కువ ట్యాగ్‌లను ఎంచుకోవచ్చు' : 'Toggle one or multiple tags'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Gluten-Free Toggle */}
          <button
            type="button"
            onClick={onToggleGlutenFree}
            id="tag-filter-gluten-free-btn"
            aria-pressed={activeFilters.glutenFree}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
              activeFilters.glutenFree
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Wheat className={`h-4 w-4 ${activeFilters.glutenFree ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>{isTelugu ? '🌾 గ్లూటెన్-ఫ్రీ (Gluten-Free)' : '🌾 Gluten-Free'}</span>
            {activeFilters.glutenFree && <Check className="h-3.5 w-3.5 ml-0.5 text-white stroke-[3]" />}
          </button>

          {/* Low-Glycemic Toggle */}
          <button
            type="button"
            onClick={onToggleLowGlycemic}
            id="tag-filter-low-glycemic-btn"
            aria-pressed={activeFilters.lowGlycemic}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
              activeFilters.lowGlycemic
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Activity className={`h-4 w-4 ${activeFilters.lowGlycemic ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>{isTelugu ? '📉 లో-గ్లైసెమిక్ (Low-Glycemic)' : '📉 Low-Glycemic'}</span>
            {activeFilters.lowGlycemic && <Check className="h-3.5 w-3.5 ml-0.5 text-white stroke-[3]" />}
          </button>

          {/* Dairy-Free Toggle */}
          <button
            type="button"
            onClick={onToggleDairyFree}
            id="tag-filter-dairy-free-btn"
            aria-pressed={activeFilters.dairyFree}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
              activeFilters.dairyFree
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Milk className={`h-4 w-4 ${activeFilters.dairyFree ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span>{isTelugu ? '🥛 డైరీ-ఫ్రీ (Dairy-Free)' : '🥛 Dairy-Free'}</span>
            {activeFilters.dairyFree && <Check className="h-3.5 w-3.5 ml-0.5 text-white stroke-[3]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
