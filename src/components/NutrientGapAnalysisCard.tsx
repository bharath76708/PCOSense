import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Leaf,
  ShieldAlert,
  ArrowRight,
  Info,
  Apple,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { useLanguage } from '../translations';
import { SevenDayNutrientGapReport, NutrientGapItem, SevenDayDietPlan } from '../types';
import { analyzeSevenDayNutrientGaps } from '../services/nutrientGapAnalysisService';

interface NutrientGapAnalysisCardProps {
  report?: SevenDayNutrientGapReport;
  plan?: SevenDayDietPlan;
  customMeals?: Record<string, any>;
  activeDayNumber?: number;
  onApplyBoosterSuggestion?: (boosterItem: string) => void;
  onSelectRecipe?: (recipe: any) => void;
}

export const NutrientGapAnalysisCard: React.FC<NutrientGapAnalysisCardProps> = ({
  report: propReport,
  plan,
  customMeals,
  activeDayNumber = 1,
  onApplyBoosterSuggestion,
  onSelectRecipe
}) => {
  const { isTelugu } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'gaps_only'>('all');
  const [selectedNutrientId, setSelectedNutrientId] = useState<string | null>(null);

  // Safely compute or retrieve the 7-day nutrient gap report
  const report: SevenDayNutrientGapReport = useMemo(() => {
    if (propReport && Array.isArray(propReport.nutrients)) {
      return propReport;
    }
    if (plan && plan.days && plan.days.length > 0) {
      try {
        return analyzeSevenDayNutrientGaps(plan, customMeals || {});
      } catch (err) {
        console.error('Failed to compute nutrient gaps:', err);
      }
    }
    return {
      overallScore: 100,
      gapsCount: 0,
      borderlineCount: 0,
      optimalCount: 7,
      fiberGapIdentified: false,
      nutrients: [],
      highPriorityGapText: 'Nutrient targets analysis loading...',
      highPriorityGapTextTe: 'పోషక లక్ష్యాల విశ్లేషణ లోడ్ అవుతోంది...'
    };
  }, [propReport, plan, customMeals]);

  const allNutrients = Array.isArray(report?.nutrients) ? report.nutrients : [];
  const displayedNutrients =
    filterMode === 'gaps_only'
      ? allNutrients.filter(n => n.status === 'gap' || n.status === 'borderline')
      : allNutrients;

  const gapsCount = report?.gapsCount ?? 0;
  const borderlineCount = report?.borderlineCount ?? 0;
  const overallScore = report?.overallScore ?? 100;
  const hasCriticalGaps = gapsCount > 0 || Boolean(report?.fiberGapIdentified);

  return (
    <div
      id="pcos-nutrient-gap-analysis-card"
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        hasCriticalGaps
          ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/40 shadow-xs'
          : 'bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/30 dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 border-teal-200/80 dark:border-teal-900/40 shadow-xs'
      }`}
    >
      {/* Header Bar */}
      <div className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
              hasCriticalGaps
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800'
            }`}
          >
            {hasCriticalGaps ? (
              <AlertTriangle className="h-4.5 w-4.5" />
            ) : (
              <ShieldAlert className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {isTelugu ? '7-రోజుల పోషక కొరత విశ్లేషణ (Nutrient Gap Analysis)' : '7-Day Nutrient Gap & Fiber Analysis'}
              </h4>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  gapsCount > 0
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                }`}
              >
                {gapsCount > 0
                  ? (isTelugu ? `${gapsCount} కొరతలు గుర్తించబడ్డాయి` : `${gapsCount} Nutritional Gaps Detected`)
                  : (isTelugu ? 'అన్ని మైక్రో-న్యూట్రియెంట్స్ సరైన మోతాదులో ఉన్నాయి' : 'All Micro-Nutrient Targets Balanced')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
              {isTelugu ? report?.highPriorityGapTextTe : report?.highPriorityGapText}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs"
            id="toggle-nutrient-gap-details-btn"
          >
            <span>{isExpanded ? (isTelugu ? 'దాచు' : 'Collapse') : (isTelugu ? 'పూర్తి విశ్లేషణ చూడండి' : 'View Full Analysis')}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Summary Strip (Always Visible) */}
      <div className="px-3.5 sm:px-4.5 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            {isTelugu ? 'వారం మొత్తం హార్మోన్ల సమతుల్యత స్కోరు:' : '7-Day Endocrine Adherence Score:'}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-20 sm:w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  overallScore >= 80
                    ? 'bg-emerald-500'
                    : overallScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {overallScore}%
            </span>
          </div>
        </div>

        {/* Quick Micro-Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {allNutrients.slice(0, 4).map(n => (
            <span
              key={n.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                n.status === 'gap'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                  : n.status === 'borderline'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
              }`}
            >
              {n.status === 'gap' ? '⚠️' : n.status === 'borderline' ? '⚡' : '✓'}
              <span>{n.name.split(' ')[0]}</span>
              <span className="opacity-75">({n.daysMetCount}/{n.totalDays}d)</span>
            </span>
          ))}
          {allNutrients.length > 4 && (
            <span className="text-[10px] text-slate-400 font-semibold">
              +{allNutrients.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/80 space-y-4 animate-fadeIn">
          {/* Filter Chips & Explanation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isTelugu
                ? 'మీ 7-రోజుల ప్లాన్‌లో క్రమంగా లోపించిన సూక్ష్మ పోషకాలను మరియు పీచు లక్ష్యాలను క్రింద పరిశీలించండి. సూచించిన ఆహారాలతో వెంటనే సరిదిద్దండి:'
                : 'Consistently missing micronutrients or fiber targets over 7 days triggers hormonal fluctuations. Review each gap and recommended clinical boosters below:'}
            </p>

            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isTelugu ? 'అన్ని పోషకాలు' : 'All Nutrients'} ({allNutrients.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('gaps_only')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterMode === 'gaps_only'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isTelugu ? 'కొరతలు మాత్రమే' : 'Deficits / Gaps Only'} ({gapsCount + borderlineCount})
              </button>
            </div>
          </div>

          {/* Grid of Nutrients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedNutrients.map(nutrient => {
              const isSelected = selectedNutrientId === nutrient.id;
              const isDeficit = nutrient.status === 'gap';
              const isBorderline = nutrient.status === 'borderline';

              return (
                <div
                  key={nutrient.id}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isDeficit
                      ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/50'
                      : isBorderline
                      ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/50'
                      : 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/40'
                  }`}
                >
                  {/* Top Row: Name, Status Badge, 7-Day Met Rate */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {isTelugu ? nutrient.nameTe : nutrient.name}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
                            isDeficit
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                              : isBorderline
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                          }`}
                        >
                          {isDeficit
                            ? (isTelugu ? 'తీవ్ర కొరత' : 'Target Deficit')
                            : isBorderline
                            ? (isTelugu ? 'స్వల్ప కొరత' : 'Borderline')
                            : (isTelugu ? 'ఆదర్శవంతం' : 'Optimal')}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                        {isTelugu ? nutrient.pcosPathologyFocusTe || nutrient.pcosPathologyFocus : nutrient.pcosPathologyFocus}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {nutrient.daysMetCount} / {nutrient.totalDays} {isTelugu ? 'రోజులు' : 'Days'}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {isTelugu ? 'లక్ష్యం:' : 'Target:'} {nutrient.dailyTargetText}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar of Days Met */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDeficit ? 'bg-rose-500' : isBorderline ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(nutrient.daysMetCount / Math.max(nutrient.totalDays, 1)) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{isTelugu ? `7-రోజుల సగటు: ${nutrient.sevenDayAvg}${nutrient.unit}` : `7-Day Average: ${nutrient.sevenDayAvg}${nutrient.unit}`}</span>
                      <span>{Math.round((nutrient.daysMetCount / Math.max(nutrient.totalDays, 1)) * 100)}% {isTelugu ? 'నియమం పాటింపు' : 'Consistency'}</span>
                    </div>
                  </div>

                  {/* Clinical PCOS Mechanism */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed bg-white/70 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white font-bold">{isTelugu ? 'వైద్య ప్రాముఖ్యత: ' : 'Clinical Mechanism: '}</strong>
                    {isTelugu ? nutrient.clinicalMechanismTe : nutrient.clinicalMechanism}
                  </p>

                  {/* Top Food Boosters & Quick Action */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400">
                        <Apple className="h-3 w-3" />
                        <span>{isTelugu ? 'సిఫార్సు చేసిన సహజ ఆహార బూస్టర్లు:' : 'Recommended Food Boosters:'}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      {(nutrient.topFoodBoosters || []).map((booster, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start justify-between gap-2 p-1.5 rounded-md bg-white dark:bg-slate-800 text-[11px] border border-slate-100 dark:border-slate-700/60"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {isTelugu && booster.itemTe ? booster.itemTe : booster.item}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">
                              ({booster.portion})
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                              {booster.benefit}
                            </p>
                          </div>
                          <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 shrink-0 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                            {booster.nutrientYield}
                          </span>
                        </div>
                      ))}
                    </div>

                    {nutrient.recommendedRecipeSwap && (
                      <div className="mt-2 p-2 rounded-lg bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between gap-2 text-[11px]">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                            {isTelugu ? 'వంటకం మార్పు సలహా:' : 'Suggested Meal Swap:'}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {isTelugu && nutrient.recommendedRecipeSwap.recipeNameTe
                              ? nutrient.recommendedRecipeSwap.recipeNameTe
                              : nutrient.recommendedRecipeSwap.recipeName}
                          </span>
                          <span className="text-teal-600 dark:text-teal-400 font-semibold ml-1">
                            ({nutrient.recommendedRecipeSwap.boostText})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
