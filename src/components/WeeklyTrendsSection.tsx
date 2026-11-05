import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  Activity,
  Utensils,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  HelpCircle,
  Sliders,
  ChevronRight,
  Brain,
  RotateCcw,
  PlusCircle,
  Eye,
  Zap
} from 'lucide-react';
import { useLanguage } from '../translations';
import { getWeeklyTrendsData, WeeklyTrendsSummary, DayWeeklyConsistencyPoint } from '../services/weeklyTrendsService';

interface WeeklyTrendsSectionProps {
  userId?: string;
  isDark?: boolean;
  onAskAI?: (prompt: string) => void;
  onOpenHydration?: () => void;
  onOpenYoga?: () => void;
  onOpenNutrition?: () => void;
}

type TrendMetricMode = 'composite_regression' | 'three_pillars' | 'hydration' | 'yoga' | 'nutrition';

export const WeeklyTrendsSection: React.FC<WeeklyTrendsSectionProps> = ({
  userId = 'local-user',
  isDark = false,
  onAskAI,
  onOpenHydration,
  onOpenYoga,
  onOpenNutrition
}) => {
  const { isTelugu } = useLanguage();

  const [metricMode, setMetricMode] = useState<TrendMetricMode>('composite_regression');
  const [showRegressionLine, setShowRegressionLine] = useState<boolean>(true);
  const [projectionDays, setProjectionDays] = useState<number>(3);
  const [selectedPoint, setSelectedPoint] = useState<DayWeeklyConsistencyPoint | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch 7-day data + regression projection
  const trendsSummary: WeeklyTrendsSummary = useMemo(() => {
    return getWeeklyTrendsData(userId, projectionDays);
  }, [userId, projectionDays, refreshKey]);

  // Live reactivity listeners
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('pcosense_hydration_updated', handleUpdate);
    window.addEventListener('pcosense_yoga_logs_changed', handleUpdate);
    window.addEventListener('pcosense_nutrition_updated', handleUpdate);
    window.addEventListener('pcosense_habits_updated', handleUpdate);
    window.addEventListener('pcosense_wellness_targets_changed', handleUpdate);

    return () => {
      window.removeEventListener('pcosense_hydration_updated', handleUpdate);
      window.removeEventListener('pcosense_yoga_logs_changed', handleUpdate);
      window.removeEventListener('pcosense_nutrition_updated', handleUpdate);
      window.removeEventListener('pcosense_habits_updated', handleUpdate);
      window.removeEventListener('pcosense_wellness_targets_changed', handleUpdate);
    };
  }, []);

  const {
    days,
    allChartPoints,
    avgCompositeConsistency,
    avgHydrationScore,
    avgYogaMinutes,
    yogaActiveDays,
    avgNutritionScore,
    nutritionLoggedDays,
    hydrationGoalMetDays,
    regression,
    projectedNextScore,
    projectedThreeDayScore,
    trajectoryStatus,
    trajectoryText,
    trajectoryTextTe,
    clinicalProjectionAdvice,
    clinicalProjectionAdviceTe
  } = trendsSummary;

  // Set default selected point to today
  useEffect(() => {
    if (days.length > 0 && !selectedPoint) {
      setSelectedPoint(days[days.length - 1]);
    }
  }, [days, selectedPoint]);

  const handleAskAIPrompt = () => {
    const prompt = isTelugu
      ? `నా గత 7 రోజుల నిలకడ విశ్లేషణ: సగటు హైడ్రేషన్ ${avgHydrationScore}%, యోగా ${avgYogaMinutes} నిమిషాలు (${yogaActiveDays}/7 రోజులు), న్యూట్రిషన్ స్కోరు ${avgNutritionScore}%. లీనియర్ రిగ్రెషన్ వాలు ${regression.slope}%/రోజు మరియు 3 రోజుల అంచనా ${projectedThreeDayScore}%. ఈ గణాంకాల ఆధారంగా నా PCOS ఇన్సులిన్ నిరోధకత మరియు హార్మోన్ల సమతుల్యత మెరుగుపడటానికి ఏం చేయాలి?`
      : `Based on my 7-day consistency data across Hydration (${avgHydrationScore}%), Yoga (${avgYogaMinutes} min/day, ${yogaActiveDays}/7 active days), and Nutrition (${avgNutritionScore}%), with a linear regression slope of ${regression.slope}%/day predicting a score of ${projectedThreeDayScore}% in 3 days: What personalized endocrine and lifestyle adjustments will accelerate my insulin sensitivity and hormonal balance?`;

    if (onAskAI) {
      onAskAI(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('open-pcosense-ai', { detail: { prompt } }));
    }
  };

  return (
    <section
      id="trends-section"
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-bold">
              <TrendingUp className="h-3 w-3" />
              {isTelugu ? 'ట్రెండ్స్ & రిగ్రెషన్ అంచనా' : 'Trends & Regression Projection'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {isTelugu ? 'హైడ్రేషన్ + యోగా + న్యూట్రిషన్' : 'Hydration + Yoga + Nutrition'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isTelugu ? 'వారం వారీ నిలకడ & భవిష్యత్ అంచనా ట్రెండ్' : 'Weekly Consistency & Future Projection Trends'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
            {isTelugu
              ? 'గత 7 రోజులలో నీరు, యోగా మరియు సమతుల్య ఆహారపు లాగింగ్ నిలకడను రీచార్ట్స్ ద్వారా విశ్లేషిస్తూ, సింపుల్ లీనియర్ రిగ్రెషన్ లైన్ (y = mx + b) ద్వారా రాబోయే రోజుల వెల్‌నెస్ అంచనాను ప్రొజెక్ట్ చేస్తుంది.'
              : 'Tracking your 7-day adherence across hydration, restorative yoga, and anti-androgenic nutrition with an ordinary least-squares regression line to forecast upcoming wellness momentum.'}
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Regression Line */}
          <button
            type="button"
            onClick={() => setShowRegressionLine(!showRegressionLine)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showRegressionLine
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle simple regression line and future trajectory"
          >
            <Zap className={`h-3.5 w-3.5 ${showRegressionLine ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span>{isTelugu ? 'రిగ్రెషన్ లైన్' : 'Regression Line'}</span>
            <span className={`w-2 h-2 rounded-full ${showRegressionLine ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
          </button>

          {/* Projection Days Selector */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setProjectionDays(3)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                projectionDays === 3
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              +3 {isTelugu ? 'రోజులు' : 'Days'}
            </button>
            <button
              type="button"
              onClick={() => setProjectionDays(5)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                projectionDays === 5
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              +5 {isTelugu ? 'రోజులు' : 'Days'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Micro-Cards: Consistency Pillars & Regression Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Hydration Consistency */}
        <div
          onClick={() => setMetricMode('hydration')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            metricMode === 'hydration'
              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 ring-2 ring-sky-400/20'
              : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/50 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 dark:text-sky-300 mb-1">
            <span className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              {isTelugu ? 'హైడ్రేషన్' : 'Hydration'}
            </span>
            <span className="text-[10px] text-sky-700 dark:text-sky-400">{hydrationGoalMetDays}/7d met</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-950 dark:text-sky-100">{avgHydrationScore}%</span>
            <span className="text-[10px] font-medium text-sky-700 dark:text-sky-400">7d avg</span>
          </div>
          <p className="text-[10px] text-sky-800/80 dark:text-sky-300/80 mt-1 truncate">
            {isTelugu ? 'టార్గెట్: 2.5L రోజుకు' : 'Electrolyte & water balance'}
          </p>
        </div>

        {/* KPI 2: Yoga & Movement */}
        <div
          onClick={() => setMetricMode('yoga')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            metricMode === 'yoga'
              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 ring-2 ring-teal-400/20'
              : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/70 dark:border-teal-900/50 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 dark:text-teal-300 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              {isTelugu ? 'యోగా & వ్యాయామం' : 'Yoga Routine'}
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-400">{yogaActiveDays}/7d active</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-teal-950 dark:text-teal-100">{avgYogaMinutes}</span>
            <span className="text-[10px] font-medium text-teal-700 dark:text-teal-400">min/day avg</span>
          </div>
          <p className="text-[10px] text-teal-800/80 dark:text-teal-300/80 mt-1 truncate">
            {isTelugu ? 'కార్టిసాల్ తగ్గింపు యోగా' : 'Pelvic flow & cortisol reset'}
          </p>
        </div>

        {/* KPI 3: Nutrition Adherence */}
        <div
          onClick={() => setMetricMode('nutrition')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            metricMode === 'nutrition'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/20'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/50 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
            <span className="flex items-center gap-1">
              <Utensils className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              {isTelugu ? 'న్యూట్రిషన్' : 'Nutrition'}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400">{nutritionLoggedDays}/7d logged</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-950 dark:text-amber-100">{avgNutritionScore}%</span>
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">adherence</span>
          </div>
          <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-1 truncate">
            {isTelugu ? 'ఫైబర్ & గ్లూకోజ్ స్థిరత్వం' : 'Low GI & high fiber intake'}
          </p>
        </div>

        {/* KPI 4: 7-Day Composite Consistency */}
        <div
          onClick={() => setMetricMode('composite_regression')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            metricMode === 'composite_regression'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-400/20'
              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {isTelugu ? 'సగటు నిలకడ' : 'Consistency'}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              {avgCompositeConsistency >= 75 ? 'Optimal' : 'Building'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">{avgCompositeConsistency}%</span>
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">weighted</span>
          </div>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-1 truncate">
            {isTelugu ? '3 విభాగాలు కలిపి' : 'Combined 7-day score'}
          </p>
        </div>

        {/* KPI 5: Regression Future Projection */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 dark:text-indigo-300">
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              {isTelugu ? 'ప్రొజెక్షన్ (+3d)' : 'Projected (+3d)'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
              {regression.slope >= 0 ? `+${regression.slope}%` : `${regression.slope}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100">{projectedThreeDayScore}%</span>
            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
              {regression.slope >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 inline mr-0.5" />
                  +{(projectedThreeDayScore - avgCompositeConsistency).toFixed(0)}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center">
                  <TrendingDown className="h-3 w-3 inline mr-0.5" />
                  {(projectedThreeDayScore - avgCompositeConsistency).toFixed(0)}%
                </span>
              )}
            </span>
          </div>
          <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80 truncate">
            {isTelugu ? trajectoryTextTe : trajectoryText}
          </p>
        </div>
      </div>

      {/* Chart View Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMetricMode('composite_regression')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metricMode === 'composite_regression'
                ? 'bg-white dark:bg-slate-900 text-indigo-800 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'సమగ్ర నిలకడ & రిగ్రెషన్' : 'Overall & Regression Trend'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('three_pillars')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metricMode === 'three_pillars'
                ? 'bg-white dark:bg-slate-900 text-indigo-800 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTelugu ? '3 విభాగాలు (తులన)' : 'All 3 Pillars Comparison'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('hydration')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer hidden sm:inline-block ${
              metricMode === 'hydration'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'హైడ్రేషన్' : 'Hydration'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('yoga')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer hidden sm:inline-block ${
              metricMode === 'yoga'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'యోగా' : 'Yoga'}
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('nutrition')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer hidden sm:inline-block ${
              metricMode === 'nutrition'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTelugu ? 'న్యూట్రిషన్' : 'Nutrition'}
          </button>
        </div>

        {/* Legend visual badges */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-indigo-600 inline-block" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Composite Adherence</span>
          </div>
          {showRegressionLine && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-indigo-500 inline-block" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">OLS Regression Line (y = mx + b)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/15 border border-dashed border-indigo-300 inline-block" />
            <span className="text-slate-500">Projected Horizon</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visual Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Recharts Chart Canvas */}
        <div className="lg:col-span-8 space-y-3">
          <div className="h-80 sm:h-88 w-full p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={allChartPoints}
                margin={{ top: 20, right: 25, left: -15, bottom: 10 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setSelectedPoint(state.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="trendsCompositeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="trendsHydrationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="trendsYogaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="trendsNutritionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />

                <XAxis
                  dataKey="dayLabel"
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                />

                <YAxis
                  domain={[0, 110]}
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                />

                {/* Benchmark Reference Lines */}
                <ReferenceLine
                  y={80}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: isTelugu ? '80% ఆప్టిమల్ లక్ష్యం' : '80% Optimal Zone',
                    fill: isDark ? '#34d399' : '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                    position: 'insideTopLeft'
                  }}
                />

                {/* Vertical Divider separating 7-day Historical from Projected Future */}
                {allChartPoints.length > 7 && (
                  <ReferenceLine
                    x={allChartPoints[6]?.dayLabel}
                    stroke="#6366f1"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    label={{
                      value: isTelugu ? '▶ భవిష్యత్ అంచనా (Regression)' : '▶ Regression Horizon',
                      fill: isDark ? '#a5b4fc' : '#4f46e5',
                      fontSize: 10,
                      fontWeight: 700,
                      position: 'top'
                    }}
                  />
                )}

                {/* Custom Interactive Tooltip */}
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload as DayWeeklyConsistencyPoint;
                    return (
                      <div className="rounded-2xl bg-slate-950/95 text-white p-3.5 shadow-2xl border border-slate-700/80 text-xs space-y-2 backdrop-blur-md max-w-xs">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                          <div>
                            <span className="font-bold text-slate-200">
                              {d.displayDate} ({d.dayLabel})
                            </span>
                            {d.isToday && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-sm bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                                Today
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.isProjected
                                ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                                : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
                            }`}
                          >
                            {d.isProjected ? 'Projected Future' : 'Recorded Log'}
                          </span>
                        </div>

                        {/* Consistency Details */}
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-indigo-300 font-bold">
                            <span>Composite Consistency:</span>
                            <span className="font-mono text-sm">{d.compositeConsistency}%</span>
                          </div>

                          {showRegressionLine && typeof d.regressionValue === 'number' && (
                            <div className="flex items-center justify-between text-purple-300 font-semibold border-b border-slate-800/80 pb-1">
                              <span>OLS Regression Trend:</span>
                              <span className="font-mono">{d.regressionValue}%</span>
                            </div>
                          )}

                          {/* 3 Pillars Breakdown */}
                          <div className="pt-0.5 space-y-1">
                            <div className="flex items-center justify-between text-sky-400">
                              <span className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" /> Hydration:
                              </span>
                              <span className="font-mono font-medium">
                                {d.waterMl.toLocaleString()} mL ({d.hydrationScore}%)
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-teal-400">
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" /> Yoga:
                              </span>
                              <span className="font-mono font-medium">
                                {d.yogaMinutes} mins ({d.yogaScore}%)
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-amber-400">
                              <span className="flex items-center gap-1">
                                <Utensils className="h-3 w-3" /> Nutrition:
                              </span>
                              <span className="font-mono font-medium">
                                {d.mealsLoggedCount} meals / score: {d.nutritionScore}%
                              </span>
                            </div>
                          </div>

                          {d.isProjected && (
                            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                              *Extrapolated mathematically from 7-day linear consistency momentum.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />

                {/* View 1: Composite Consistency + Regression Line */}
                {metricMode === 'composite_regression' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="compositeConsistency"
                      name={isTelugu ? 'నిలకడ స్కోరు (%)' : 'Overall Consistency (%)'}
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#trendsCompositeGrad)"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.isProjected) {
                          return (
                            <circle
                              key={`dot-${props.index}`}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="#a855f7"
                              stroke="#ffffff"
                              strokeWidth={1.5}
                              strokeDasharray="2 2"
                            />
                          );
                        }
                        return (
                          <circle
                            key={`dot-${props.index}`}
                            cx={cx}
                            cy={cy}
                            r={payload.isToday ? 6 : 4}
                            fill={payload.isToday ? '#4338ca' : '#4f46e5'}
                            stroke={isDark ? '#0f172a' : '#ffffff'}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 7, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                    />

                    {/* Integrated Simple Regression Line */}
                    {showRegressionLine && (
                      <Line
                        type="linear"
                        dataKey="regressionValue"
                        name={isTelugu ? 'రిగ్రెషన్ లైన్ (ధోరణి)' : 'Regression Trendline (y = mx + b)'}
                        stroke="#9333ea"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 5, fill: '#9333ea' }}
                      />
                    )}
                  </>
                )}

                {/* View 2: Three Pillars Simultaneous Comparison */}
                {metricMode === 'three_pillars' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="hydrationScore"
                      name="Hydration Adherence (%)"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0284c7' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="yogaScore"
                      name="Yoga Consistency (%)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0d9488' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nutritionScore"
                      name="Nutrition Adherence (%)"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#d97706' }}
                    />
                    {showRegressionLine && (
                      <Line
                        type="linear"
                        dataKey="regressionValue"
                        name="Composite Regression Trend"
                        stroke="#9333ea"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </>
                )}

                {/* View 3: Hydration Solo */}
                {metricMode === 'hydration' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="hydrationScore"
                      name="Hydration Score (%)"
                      stroke="#0284c7"
                      strokeWidth={3}
                      fill="url(#trendsHydrationGrad)"
                      dot={{ r: 4, fill: '#0284c7' }}
                    />
                    {showRegressionLine && (
                      <Line
                        type="linear"
                        dataKey="regressionValue"
                        name="Trendline"
                        stroke="#9333ea"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </>
                )}

                {/* View 4: Yoga Solo */}
                {metricMode === 'yoga' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="yogaScore"
                      name="Yoga Adherence (%)"
                      stroke="#0d9488"
                      strokeWidth={3}
                      fill="url(#trendsYogaGrad)"
                      dot={{ r: 4, fill: '#0d9488' }}
                    />
                    {showRegressionLine && (
                      <Line
                        type="linear"
                        dataKey="regressionValue"
                        name="Trendline"
                        stroke="#9333ea"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </>
                )}

                {/* View 5: Nutrition Solo */}
                {metricMode === 'nutrition' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="nutritionScore"
                      name="Nutrition Adherence (%)"
                      stroke="#d97706"
                      strokeWidth={3}
                      fill="url(#trendsNutritionGrad)"
                      dot={{ r: 4, fill: '#d97706' }}
                    />
                    {showRegressionLine && (
                      <Line
                        type="linear"
                        dataKey="regressionValue"
                        name="Trendline"
                        stroke="#9333ea"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Caption / Instruction */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              {isTelugu
                ? 'గ్రాఫ్‌లోని ఏదైనా పాయింట్‌పై క్లిక్ చేసి ఆ రోజు పూర్తి వివరాలను పరిశీలించండి.'
                : 'Click on any data point along the timeline to inspect exact day logs & projected values.'}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              OLS Fit: Slope = {regression.slope > 0 ? '+' : ''}{regression.slope}%/d | R² = {regression.rSquared}
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Precision Data Point Inspector & Clinical Action Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Data Point Inspector Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedPoint ? `${selectedPoint.displayDate} (${selectedPoint.dayLabel})` : 'Timeline Point'}
                </span>
                {selectedPoint?.isToday && (
                  <span className="ml-2 px-1.5 py-0.2 rounded-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-bold">
                    Today
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedPoint?.isProjected
                    ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {selectedPoint?.isProjected ? 'Projected Forecast' : 'Recorded Adherence'}
              </span>
            </div>

            {selectedPoint ? (
              <div className="space-y-2 text-xs">
                {/* Composite Score */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    {isTelugu ? 'సమగ్ర నిలకడ స్కోరు:' : 'Composite Score:'}
                  </span>
                  <span className="text-base font-black text-indigo-950 dark:text-indigo-100 font-mono">
                    {selectedPoint.compositeConsistency}%
                  </span>
                </div>

                {/* 1. Hydration */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {isTelugu ? 'నీరు (Hydration)' : 'Water Intake'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="font-bold text-sky-900 dark:text-sky-200">{selectedPoint.waterMl} mL</span>
                    <span className="text-slate-400 ml-1">({selectedPoint.hydrationScore}%)</span>
                  </div>
                </div>

                {/* 2. Yoga */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {isTelugu ? 'యోగా (Yoga Routine)' : 'Restorative Yoga'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="font-bold text-teal-900 dark:text-teal-200">{selectedPoint.yogaMinutes} min</span>
                    <span className="text-slate-400 ml-1">({selectedPoint.yogaScore}%)</span>
                  </div>
                </div>

                {/* 3. Nutrition */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {isTelugu ? 'ఆహారం (Nutrition)' : 'Anti-Androgen Diet'}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      {selectedPoint.mealsLoggedCount} meals
                    </span>
                    <span className="text-slate-400 ml-1">({selectedPoint.nutritionScore}%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                {isTelugu ? 'డేటాను వీక్షించడానికి చార్ట్‌ను క్లిక్ చేయండి.' : 'Click any chart point to inspect details.'}
              </p>
            )}

            {/* Quick Logging Links */}
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              {onOpenHydration && (
                <button
                  type="button"
                  onClick={onOpenHydration}
                  className="text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <PlusCircle className="h-3 w-3" /> +{isTelugu ? 'నీరు లాగ్' : 'Water'}
                </button>
              )}
              {onOpenYoga && (
                <button
                  type="button"
                  onClick={onOpenYoga}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <PlusCircle className="h-3 w-3" /> +{isTelugu ? 'యోగా లాగ్' : 'Yoga'}
                </button>
              )}
              {onOpenNutrition && (
                <button
                  type="button"
                  onClick={onOpenNutrition}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <PlusCircle className="h-3 w-3" /> +{isTelugu ? 'ఆహారం లాగ్' : 'Meal'}
                </button>
              )}
            </div>
          </div>

          {/* Clinical Projection & AI Insights Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isTelugu ? 'క్లినికల్ ప్రొజెక్షన్ సారాంశం' : 'PCOS Endocrine Trajectory'}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                y = {regression.slope}x + {regression.intercept}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {isTelugu ? clinicalProjectionAdviceTe : clinicalProjectionAdvice}
            </p>

            <button
              type="button"
              onClick={handleAskAIPrompt}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{isTelugu ? 'ఈ ట్రెండ్‌పై AI తో మాట్లాడండి' : 'Ask AI About This Trend Projection'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
