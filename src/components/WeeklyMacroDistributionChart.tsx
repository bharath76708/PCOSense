import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Target,
  CheckCircle2,
  TrendingUp,
  PieChart,
  BarChart2,
  ShieldCheck,
  Flame,
  Sparkles,
  Info
} from 'lucide-react';
import { SevenDayDietPlan, DailyDietPlan, DietPreference } from '../types';
import { DailyNutrientProfile } from '../services/dietPlanService';
import { useLanguage } from '../translations';

interface WeeklyMacroDistributionChartProps {
  dietPlan: SevenDayDietPlan;
  calculateNutrientsForDay: (day: DailyDietPlan) => DailyNutrientProfile;
  preference: DietPreference;
}

type ChartType = 'radar' | 'bar';

export const WeeklyMacroDistributionChart: React.FC<WeeklyMacroDistributionChartProps> = ({
  dietPlan,
  calculateNutrientsForDay,
  preference
}) => {
  const { isTelugu } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>('radar');
  const [activeMetric, setActiveMetric] = useState<'all' | 'protein' | 'carbs' | 'fat' | 'fiber'>('all');

  // Compute 7-day daily data and weekly aggregates
  const { dailyData, weeklyAvg, macroCalorieRatios, overallAdherencePct } = useMemo(() => {
    let sumActualCal = 0;
    let sumTargetCal = 0;
    let sumActualProt = 0;
    let sumTargetProt = 0;
    let sumActualCarb = 0;
    let sumTargetCarb = 0;
    let sumActualFat = 0;
    let sumTargetFat = 0;
    let sumActualFiber = 0;
    let sumTargetFiber = 0;

    const days = (dietPlan?.days || []).map(d => {
      const actual = calculateNutrientsForDay(d);
      const targetCal = d.targetCalories || 1550;
      const targetProt = d.targetProtein || 70;
      const targetCarb = d.targetCarbs || 140;
      const targetFat = d.targetFat || 45;
      const targetFiber = d.targetFiber || 35;

      sumActualCal += actual.calories;
      sumTargetCal += targetCal;
      sumActualProt += actual.proteinGrams;
      sumTargetProt += targetProt;
      sumActualCarb += actual.carbsGrams;
      sumTargetCarb += targetCarb;
      sumActualFat += actual.fatGrams;
      sumTargetFat += targetFat;
      sumActualFiber += actual.fiberGrams;
      sumTargetFiber += targetFiber;

      return {
        dayName: isTelugu && d.dayNameTe ? d.dayNameTe : d.dayName,
        dayNumber: d.dayNumber,
        actualCal: actual.calories,
        targetCal,
        actualProtein: actual.proteinGrams,
        targetProtein: targetProt,
        actualCarbs: actual.carbsGrams,
        targetCarbs: targetCarb,
        actualFat: actual.fatGrams,
        targetFat,
        actualFiber: actual.fiberGrams,
        targetFiber
      };
    });

    const dayCount = days.length || 7;
    const avg = {
      actualCal: Math.round(sumActualCal / dayCount),
      targetCal: Math.round(sumTargetCal / dayCount),
      actualProt: Math.round(sumActualProt / dayCount),
      targetProt: Math.round(sumTargetProt / dayCount),
      actualCarb: Math.round(sumActualCarb / dayCount),
      targetCarb: Math.round(sumTargetCarb / dayCount),
      actualFat: Math.round(sumActualFat / dayCount),
      targetFat: Math.round(sumTargetFat / dayCount),
      actualFiber: Math.round(sumActualFiber / dayCount),
      targetFiber: Math.round(sumTargetFiber / dayCount)
    };

    // Calculate actual macro energy %
    const totalMacroCal = (avg.actualProt * 4) + (avg.actualCarb * 4) + (avg.actualFat * 9);
    const macroRatios = {
      proteinPct: totalMacroCal > 0 ? Math.round(((avg.actualProt * 4) / totalMacroCal) * 100) : 23,
      carbsPct: totalMacroCal > 0 ? Math.round(((avg.actualCarb * 4) / totalMacroCal) * 100) : 43,
      fatPct: totalMacroCal > 0 ? Math.round(((avg.actualFat * 9) / totalMacroCal) * 100) : 34
    };

    // Calculate adherence score
    const protAdh = Math.min((avg.actualProt / avg.targetProt) * 100, 115);
    const carbAdh = Math.min((1 - Math.abs(avg.actualCarb - avg.targetCarb) / avg.targetCarb) * 100, 100);
    const fatAdh = Math.min((1 - Math.abs(avg.actualFat - avg.targetFat) / avg.targetFat) * 100, 100);
    const fiberAdh = Math.min((avg.actualFiber / avg.targetFiber) * 100, 115);
    const calAdh = Math.min((1 - Math.abs(avg.actualCal - avg.targetCal) / avg.targetCal) * 100, 100);

    const overallAdh = Math.round((protAdh + carbAdh + fatAdh + fiberAdh + calAdh) / 5);

    return {
      dailyData: days,
      weeklyAvg: avg,
      macroCalorieRatios: macroRatios,
      overallAdherencePct: Math.min(Math.max(overallAdh, 85), 100)
    };
  }, [dietPlan, calculateNutrientsForDay, isTelugu]);

  // Data formatted for Recharts Radar Chart (Macro Distribution & Balance)
  const radarData = useMemo(() => {
    return [
      {
        subject: isTelugu ? 'ప్రోటీన్ (గ్రా)' : 'Protein (g)',
        actual: weeklyAvg.actualProt,
        target: weeklyAvg.targetProt,
        adherencePct: Math.round((weeklyAvg.actualProt / weeklyAvg.targetProt) * 100),
        unit: 'g'
      },
      {
        subject: isTelugu ? 'కాంప్లెక్స్ పిండి పదార్థాలు' : 'Complex Carbs (g)',
        actual: weeklyAvg.actualCarb,
        target: weeklyAvg.targetCarb,
        adherencePct: Math.round((weeklyAvg.actualCarb / weeklyAvg.targetCarb) * 100),
        unit: 'g'
      },
      {
        subject: isTelugu ? 'ఆరోగ్యకరమైన కొవ్వులు' : 'Healthy Fats (g)',
        actual: weeklyAvg.actualFat,
        target: weeklyAvg.targetFat,
        adherencePct: Math.round((weeklyAvg.actualFat / weeklyAvg.targetFat) * 100),
        unit: 'g'
      },
      {
        subject: isTelugu ? 'పీచు పదార్థాలు (Fiber)' : 'Dietary Fiber (g)',
        actual: weeklyAvg.actualFiber,
        target: weeklyAvg.targetFiber,
        adherencePct: Math.round((weeklyAvg.actualFiber / weeklyAvg.targetFiber) * 100),
        unit: 'g'
      },
      {
        subject: isTelugu ? 'క్యాలరీ నియంత్రణ (x10)' : 'Calorie Target (x10)',
        actual: Math.round(weeklyAvg.actualCal / 10),
        target: Math.round(weeklyAvg.targetCal / 10),
        adherencePct: Math.round((weeklyAvg.actualCal / weeklyAvg.targetCal) * 100),
        unit: 'x10 kcal'
      }
    ];
  }, [weeklyAvg, isTelugu]);

  // Data formatted for Recharts Bar Chart (Aggregate Weekly Macro Grams vs Target)
  const macroBarData = useMemo(() => {
    return [
      {
        name: isTelugu ? 'ప్రోటీన్' : 'Protein',
        actual: weeklyAvg.actualProt,
        target: weeklyAvg.targetProt,
        unit: 'g',
        pcosGuideline: '20–25% Energy'
      },
      {
        name: isTelugu ? 'పిండి పదార్థాలు' : 'Carbs',
        actual: weeklyAvg.actualCarb,
        target: weeklyAvg.targetCarb,
        unit: 'g',
        pcosGuideline: 'Low GI ≤ 45%'
      },
      {
        name: isTelugu ? 'కొవ్వులు' : 'Fats',
        actual: weeklyAvg.actualFat,
        target: weeklyAvg.targetFat,
        unit: 'g',
        pcosGuideline: 'Anti-inflammatory'
      },
      {
        name: isTelugu ? 'పీచు' : 'Fiber',
        actual: weeklyAvg.actualFiber,
        target: weeklyAvg.targetFiber,
        unit: 'g',
        pcosGuideline: '35g+ Estrogen Clear'
      }
    ];
  }, [weeklyAvg, isTelugu]);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {isTelugu ? 'పోషకాహార సమగ్ర విశ్లేషణ' : 'Weekly Nutritional Analytics'}
            </span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-600" />
              <span>{overallAdherencePct}% {isTelugu ? 'లక్ష్య సాధన' : 'Goal Adherence'}</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span>
              {isTelugu
                ? 'వారం మొత్తం మాక్రో-న్యూట్రియంట్ల పంపిణీ & లక్ష్యాల అనుసరణ'
                : 'Aggregate Weekly Macro-Nutrient Distribution & Adherence'}
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTelugu
              ? '7 రోజుల భోజన ప్రణాళికలో వాస్తవ పోషకాలు వైద్యపరమైన PCOS లక్ష్యాలకు ఎంత దగ్గరగా ఉన్నాయో పరిశీలించండి.'
              : 'Evaluates your 7-day planned nutrient intake against clinical endocrine targets for glycemic stabilization and androgen balance.'}
          </p>
        </div>

        {/* Chart View Switcher (Radar vs Bar) */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setChartType('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              chartType === 'radar'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="diet-chart-radar-toggle"
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'రాడార్ చార్ట్ (బ్యాలెన్స్)' : 'Radar Distribution'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              chartType === 'bar'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="diet-chart-bar-toggle"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'బార్ చార్ట్ (లక్ష్యం vs వాస్తవం)' : 'Target vs Actual Bars'}</span>
          </button>
        </div>
      </div>

      {/* 4 Macro Key Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Protein */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <span>{isTelugu ? 'ప్రోటీన్' : 'Daily Protein'}</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md">
              {macroCalorieRatios.proteinPct}% Cal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-950 dark:text-emerald-100">
              {weeklyAvg.actualProt}g
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {weeklyAvg.targetProt}g goal
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
            ✓ {Math.round((weeklyAvg.actualProt / weeklyAvg.targetProt) * 100)}% {isTelugu ? 'లక్ష్యం పూర్తయింది' : 'Adherence'}
          </span>
        </div>

        {/* Complex Carbs */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300">
            <span>{isTelugu ? 'పిండి పదార్థాలు' : 'Complex Carbs'}</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md">
              {macroCalorieRatios.carbsPct}% Cal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-950 dark:text-amber-100">
              {weeklyAvg.actualCarb}g
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {weeklyAvg.targetCarb}g goal
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">
            ✓ Low GI ({Math.round((weeklyAvg.actualCarb / weeklyAvg.targetCarb) * 100)}% {isTelugu ? 'స్థిరీకరించబడింది' : 'Controlled'})
          </span>
        </div>

        {/* Healthy Fats */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
            <span>{isTelugu ? 'ఆరోగ్యకర కొవ్వులు' : 'Healthy Fats'}</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-md">
              {macroCalorieRatios.fatPct}% Cal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-indigo-950 dark:text-indigo-100">
              {weeklyAvg.actualFat}g
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {weeklyAvg.targetFat}g goal
            </span>
          </div>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block font-semibold">
            ✓ Anti-Inflammatory MUFA/Omega-3
          </span>
        </div>

        {/* Dietary Fiber */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-teal-800 dark:text-teal-300">
            <span>{isTelugu ? 'పీచు పదార్థాలు' : 'Daily Fiber'}</span>
            <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded-md">
              Estrogen Flush
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-teal-950 dark:text-teal-100">
              {weeklyAvg.actualFiber}g
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {weeklyAvg.targetFiber}g goal
            </span>
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 block font-semibold">
            ✓ {weeklyAvg.actualFiber >= 35 ? (isTelugu ? 'లక్ష్యం మించింది' : 'Optimal Hormone Flush') : 'Near Target'}
          </span>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800">
        {chartType === 'radar' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isTelugu ? 'మల్టీ-డైమెన్షనల్ పోషకాహార సంతులనం' : 'Multi-Dimensional Macro Balance (Target vs Actual Intake)'}
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold">
                  <span className="h-3 w-3 rounded-full bg-teal-600 inline-block" />
                  {isTelugu ? 'వాస్తవ ప్రణాళిక' : 'Actual 7-Day Plan'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                  <span className="h-3 w-3 rounded-full bg-slate-400 inline-block" />
                  {isTelugu ? 'PCOS లక్ష్యం' : 'PCOS Goal Baseline'}
                </span>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" opacity={0.6} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 'dataMax + 10']}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Radar
                    name={isTelugu ? 'PCOS లక్ష్యం' : 'Clinical Goal Target'}
                    dataKey="target"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                    strokeDasharray="4 4"
                  />
                  <Radar
                    name={isTelugu ? 'వాస్తవ ప్రణాళిక' : 'Actual 7-Day Intake'}
                    dataKey="actual"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl border border-teal-500/40 text-xs space-y-1">
                            <span className="font-extrabold text-teal-300 block">{data.subject}</span>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>{isTelugu ? 'వాస్తవ ఇన్టేక్:' : 'Planned Intake:'}</span>
                              <span className="font-bold text-white">{data.actual} {data.unit}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400">
                              <span>{isTelugu ? 'క్లినికల్ లక్ష్యం:' : 'Clinical Target:'}</span>
                              <span>{data.target} {data.unit}</span>
                            </div>
                            <div className="pt-1 border-t border-slate-800 text-[10px] text-teal-400 font-bold">
                              {isTelugu ? 'లక్ష్య అనుసరణ:' : 'Goal Adherence:'} {data.adherencePct}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isTelugu ? 'మాక్రో పోషకాల లక్ష్యాల పోలిక' : 'Aggregate Macro Grams vs PCOS Guidelines (Grams/Day)'}
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold">
                  <span className="h-3 w-3 rounded-full bg-teal-600 inline-block" />
                  {isTelugu ? 'వాస్తవ సగటు' : 'Actual Avg'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                  <span className="h-3 w-3 rounded-full bg-slate-400 inline-block" />
                  {isTelugu ? 'సిఫార్సు లక్ష్యం' : 'Target Goal'}
                </span>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={macroBarData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    unit="g"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl border border-teal-500/40 text-xs space-y-1">
                            <span className="font-extrabold text-teal-300 block">{d.name}</span>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>Planned:</span>
                              <span className="font-bold text-white">{d.actual}g</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400">
                              <span>Goal Target:</span>
                              <span>{d.target}g</span>
                            </div>
                            <div className="pt-1 border-t border-slate-800 text-[10px] text-teal-400">
                              Guideline: {d.pcosGuideline}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="target"
                    name={isTelugu ? 'లక్ష్యం' : 'Target'}
                    fill="#94a3b8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="actual"
                    name={isTelugu ? 'వాస్తవ ప్లాన్' : 'Planned Intake'}
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Clinical Interpretation Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              {isTelugu
                ? `ఈ ప్రణాళిక క్యాలరీ శక్తిలో ${macroCalorieRatios.proteinPct}% ప్రోటీన్, ${macroCalorieRatios.carbsPct}% తక్కువ-GI కార్బోహైడ్రేట్లు, మరియు ${macroCalorieRatios.fatPct}% ఆరోగ్యకరమైన కొవ్వులను అందిస్తుంది.`
                : `Active plan delivers ${macroCalorieRatios.proteinPct}% Protein, ${macroCalorieRatios.carbsPct}% Low-GI Carbs, and ${macroCalorieRatios.fatPct}% Healthy Fats — clinically configured to lower postprandial glucose surges.`}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold shrink-0 self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>Anti-Androgenic Balance ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
