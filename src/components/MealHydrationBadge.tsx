import React, { useState, useRef, useEffect } from 'react';
import { Droplet, Info, X, Check, Clock, Sparkles } from 'lucide-react';
import { MealCategory, RecipeItem } from '../types';
import {
  getMealHydrationGuidance,
  DAILY_PCOS_HYDRATION_TARGET_ML
} from '../services/hydrationGuidanceService';
import { useLanguage } from '../translations';

interface MealHydrationBadgeProps {
  mealCategory: MealCategory;
  recipe?: RecipeItem;
  cumulativeMl?: number;
  className?: string;
}

export const MealHydrationBadge: React.FC<MealHydrationBadgeProps> = ({
  mealCategory,
  recipe,
  cumulativeMl = 350,
  className = ''
}) => {
  const { isTelugu } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const guidance = getMealHydrationGuidance(mealCategory, recipe);
  const pctOfDaily = Math.round((guidance.amountMl / DAILY_PCOS_HYDRATION_TARGET_ML) * 100);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Interactive Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="group/hydro inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-[11px] font-bold hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all shadow-2xs cursor-pointer"
        title={isTelugu ? 'సూచించిన నీటి పరిమాణం & సమయం వివరాలు' : 'Suggested Hydration & Digestive Timing'}
        aria-expanded={isOpen}
      >
        <Droplet className="h-3 w-3 text-sky-500 fill-sky-400 group-hover/hydro:scale-110 transition-transform" />
        <span className="font-extrabold">{guidance.displayAmount}</span>
        <span className="hidden sm:inline text-[10px] text-sky-600/80 dark:text-sky-400 font-medium">
          {isTelugu ? 'హైడ్రేషన్' : 'Water'}
        </span>
        <Info className="h-2.5 w-2.5 text-sky-400 dark:text-sky-400/70 ml-0.5" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          className="absolute z-40 bottom-full mb-2 left-0 sm:left-auto sm:right-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/80 shadow-xl p-4 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Suggested Hydration Details"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-extrabold text-xs">
              <Droplet className="h-4 w-4 fill-sky-400 text-sky-500" />
              <span>{isTelugu ? 'సూచించిన భోజన హైడ్రేషన్' : 'Suggested Meal Hydration'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Amount & Timing */}
          <div className="bg-sky-50/80 dark:bg-sky-950/40 rounded-xl p-2.5 border border-sky-100 dark:border-sky-900/40 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-black text-sky-800 dark:text-sky-200">
                {guidance.displayAmount}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {isTelugu ? guidance.temperatureLabelTe : guidance.temperatureLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <Clock className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>{isTelugu ? guidance.timingTe : guidance.timing}</span>
            </div>
          </div>

          {/* Clinical PCOS Rationale */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {isTelugu ? 'జీర్ణక్రియ & ఇన్సులిన్ ప్రయోజనం' : 'Digestion & Glucose Benefit:'}
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {isTelugu ? guidance.rationaleTe : guidance.rationale}
            </p>
          </div>

          {/* Recommended Infusion */}
          <div className="pt-1 text-[11px] flex items-start gap-1.5 text-teal-800 dark:text-teal-300 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>{isTelugu ? 'సిఫార్సు:' : 'Pairing:'}</strong>{' '}
              {isTelugu ? guidance.recommendedInfusionTe : guidance.recommendedInfusion}
            </span>
          </div>

          {/* Daily Goal Target Progress */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-500">
                {isTelugu ? 'రోజువారీ లక్ష్యం పురోగతి' : 'Daily PCOS Target Contribution'}
              </span>
              <span className="text-sky-600 dark:text-sky-400">
                {guidance.amountMl} / {DAILY_PCOS_HYDRATION_TARGET_ML} ml ({pctOfDaily}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-300"
                style={{ width: `${Math.min(pctOfDaily, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
