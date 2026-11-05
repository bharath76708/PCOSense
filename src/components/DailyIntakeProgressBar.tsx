import React from 'react';
import { Flame, Activity, ShieldCheck, Info, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '../translations';

export interface DailyIntakeProgressBarProps {
  dayNumber: number;
  dayName: string;
  dayNameTe?: string;
  theme?: string;
  themeTe?: string;
  intake: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
    proteinPct?: number;
    carbsPct?: number;
    fatPct?: number;
  };
  target: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
}

export const DailyIntakeProgressBar: React.FC<DailyIntakeProgressBarProps> = ({
  dayNumber,
  dayName,
  dayNameTe,
  theme,
  themeTe,
  intake,
  target
}) => {
  const { isTelugu } = useLanguage();

  const targetCalories = target.calories || 1600;
  const targetProtein = target.proteinGrams || 70;
  const targetCarbs = target.carbsGrams || 150;
  const targetFat = target.fatGrams || 45;
  const targetFiber = target.fiberGrams || 35;

  const calPct = Math.round((intake.calories / targetCalories) * 100);
  const proteinPct = Math.round((intake.proteinGrams / targetProtein) * 100);
  const carbsPct = Math.round((intake.carbsGrams / targetCarbs) * 100);
  const fatPct = Math.round((intake.fatGrams / targetFat) * 100);
  const fiberPct = Math.round((intake.fiberGrams / targetFiber) * 100);

  // Remaining calories or surplus
  const diffCal = targetCalories - intake.calories;
  const isOptimal = Math.abs(diffCal) <= 75;

  return (
    <div
      id="global-daily-intake-progress-bar"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 transition-all"
    >
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800 shadow-2xs">
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {isTelugu ? `${dayNameTe || dayName} లక్ష్యాలు & పోషక సమతుల్యత` : `${dayName} Caloric & Macro Target Progress`}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isOptimal
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : diffCal > 0
                    ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {isOptimal
                  ? (isTelugu ? 'ఆదర్శవంతమైన స్థాయి' : 'Optimal PCOS Range')
                  : diffCal > 0
                  ? (isTelugu ? `${diffCal} kcal మిగిలి ఉంది` : `${diffCal} kcal to Target`)
                  : (isTelugu ? `${Math.abs(diffCal)} kcal అదనపు` : `+${Math.abs(diffCal)} kcal Surplus`)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isTelugu && themeTe ? themeTe : theme || (isTelugu ? 'హార్మోన్ల సమతుల్యత కోసం రూపొందించబడిన డైట్' : 'Clinically calibrated for insulin sensitization & ovulatory support')}
            </p>
          </div>
        </div>

        {/* Big Numbers Badge */}
        <div className="flex items-baseline gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {isTelugu ? 'రోజూ మొత్తం:' : 'Day Total:'}
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {intake.calories}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            / {targetCalories} kcal
          </span>
          <span className="text-xs font-black text-teal-600 dark:text-teal-400 ml-1">
            ({calPct}%)
          </span>
        </div>
      </div>

      {/* Primary Global Calorie Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'కెలొరీల వినియోగ ప్రగతి (Caloric Intake vs Target)' : 'Global Caloric Intake vs Daily Target'}</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {calPct}% {isTelugu ? 'పూర్తయింది' : 'Achieved'}
          </span>
        </div>

        <div className="relative h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
          <div
            style={{ width: `${Math.min(100, calPct)}%` }}
            className={`h-full transition-all duration-500 rounded-full ${
              calPct > 105
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500'
            }`}
          />
        </div>
      </div>

      {/* 4-Macro Breakdown Progress Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 1. Protein */}
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{isTelugu ? 'ప్రోటీన్ (Protein)' : 'Protein'}</span>
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
              {intake.proteinGrams}g <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">/ {targetProtein}g</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-emerald-200/50 dark:bg-emerald-900/40 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, proteinPct)}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>{proteinPct}% {isTelugu ? 'లక్ష్యం' : 'of Target'}</span>
            <span className="text-[9px] opacity-80">{isTelugu ? 'కండరాలు & ఆకలి నివారణ' : 'Satiety & Muscle'}</span>
          </div>
        </div>

        {/* 2. Low-GI Carbs */}
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{isTelugu ? 'తక్కువ GI కార్బ్స్' : 'Low-GI Carbs'}</span>
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
              {intake.carbsGrams}g <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">/ {targetCarbs}g</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-amber-200/50 dark:bg-amber-900/40 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, carbsPct)}%` }}
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
            <span>{carbsPct}% {isTelugu ? 'పరిమితి' : 'of Target'}</span>
            <span className="text-[9px] opacity-80">{isTelugu ? 'ఇన్సులిన్ నియంత్రణ' : 'Insulin Ceiling'}</span>
          </div>
        </div>

        {/* 3. Healthy Fats */}
        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>{isTelugu ? 'మంచి కొవ్వులు' : 'Healthy Fats'}</span>
            </span>
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400">
              {intake.fatGrams}g <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">/ {targetFat}g</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-indigo-200/50 dark:bg-indigo-900/40 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, fatPct)}%` }}
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">
            <span>{fatPct}% {isTelugu ? 'లక్ష్యం' : 'of Target'}</span>
            <span className="text-[9px] opacity-80">{isTelugu ? 'హార్మోన్ల తయారీ' : 'Hormone Synthesis'}</span>
          </div>
        </div>

        {/* 4. Dietary Fiber */}
        <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-teal-900 dark:text-teal-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span>{isTelugu ? 'పీచు పదార్థం' : 'Dietary Fiber'}</span>
            </span>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-400">
              {intake.fiberGrams}g <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">/ {targetFiber}g</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-teal-200/50 dark:bg-teal-900/40 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, fiberPct)}%` }}
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
            <span>{fiberPct}% {isTelugu ? 'లక్ష్యం' : 'of Target'}</span>
            <span className="text-[9px] opacity-80">{isTelugu ? 'ఈస్ట్రోజెన్ తొలగింపు' : 'Estrogen Cleansing'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
