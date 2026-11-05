import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Footprints,
  Droplets,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Activity
} from 'lucide-react';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';
import {
  getSevenDayConsistencyReport,
  SevenDayConsistencySummary,
  DayConsistencyData
} from '../services/wellnessTargetsService';
import { calculateLinearRegression } from '../utils/regressionUtils';

interface HydrationActivityConsistencyChartProps {
  userId?: string;
  isDark?: boolean;
  onOpenGoalsModal?: () => void;
  onAskAI?: (prompt: string) => void;
}

type ViewMode = 'consistency' | 'dual' | 'achievement';

export const HydrationActivityConsistencyChart: React.FC<HydrationActivityConsistencyChartProps> = ({
  userId,
  isDark = false,
  onOpenGoalsModal,
  onAskAI
}) => {
  const { isTelugu } = useLanguage();
  const { user } = useAuth();
  const activeUserId = userId || user?.id || 'local-user';

  const [summary, setSummary] = useState<SevenDayConsistencySummary>(() =>
    getSevenDayConsistencyReport(activeUserId)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('consistency');
  const [selectedDay, setSelectedDay] = useState<DayConsistencyData | null>(null);
  const [showRegression, setShowRegression] = useState<boolean>(true);

  const refreshData = () => {
    setSummary(getSevenDayConsistencyReport(activeUserId));
  };

  useEffect(() => {
    refreshData();

    // Listen to custom event when targets or logs update
    const handleUpdate = () => refreshData();
    window.addEventListener('pcosense_wellness_targets_changed', handleUpdate);
    window.addEventListener('pcosense_steps_updated', handleUpdate);
    window.addEventListener('pcosense_hydration_updated', handleUpdate);

    return () => {
      window.removeEventListener('pcosense_wellness_targets_changed', handleUpdate);
      window.removeEventListener('pcosense_steps_updated', handleUpdate);
      window.removeEventListener('pcosense_hydration_updated', handleUpdate);
    };
  }, [activeUserId]);

  const { days, avgDailySteps, avgDailyWaterMl, avgConsistencyScore, stepGoalsMetCount, waterGoalsMetCount, targets } = summary;

  // Linear Regression Calculation on Consistency
  const regression = useMemo(() => {
    const points = days.map((day, idx) => ({ x: idx, y: day.consistencyScore }));
    return calculateLinearRegression(points);
  }, [days]);

  // Formatting chart dataset with regression trendline value
  const chartData = days.map((day, idx) => ({
    label: day.dayLabel,
    dateKey: day.dateKey,
    fullDate: day.fullDateFormatted,
    consistency: day.consistencyScore,
    regressionValue: regression.predict(idx),
    steps: day.steps,
    stepGoal: day.stepGoal,
    stepPercent: day.stepPercent,
    waterMl: day.waterMl,
    waterGoal: day.waterGoal,
    waterPercent: day.waterPercent,
    isToday: day.isToday,
    rawDay: day
  }));

  const handleAskAITrend = () => {
    const prompt = isTelugu
      ? `గత 7 రోజులలో నా నడక సగటు ${avgDailySteps} అడుగులు మరియు నీటి వినియోగం సగటు ${avgDailyWaterMl} mL. ఈ 7 రోజుల నిలకడ స్కోరు (${avgConsistencyScore}%) నా PCOS ఇన్సులిన్ నిరోధకతను ఎలా మెరుగుపరుస్తుంది?`
      : `Over the past 7 days, my daily average was ${avgDailySteps.toLocaleString()} steps and ${avgDailyWaterMl.toLocaleString()} mL water (${avgConsistencyScore}% consistency score). How does this consistency pattern improve my PCOS insulin sensitivity and ovulation?`;

    if (onAskAI) {
      onAskAI(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('open-pcosense-ai', { detail: { prompt } }));
    }
  };

  return (
    <div
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
      id="hydration-activity-consistency-section"
    >
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
              <TrendingUp className="h-3 w-3" />
              {isTelugu ? '7 రోజుల విశ్లేషణ' : '7-Day Longitudinal Consistency'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Recharts Analytics Engine
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {isTelugu ? 'హైడ్రేషన్ & నడక నిలకడ ట్రెండ్' : 'Hydration & Activity Consistency Trend'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isTelugu
              ? 'గత 7 రోజులలో మీరు మీ వ్యక్తిగత లక్ష్యాలను (అడుగులు & నీరు) ఎంత స్థిరంగా పాటించారో చూపే గ్రాఫ్.'
              : 'Visualizing your daily habit adherence across custom steps and water targets over the last 7 days.'}
          </p>
        </div>

        {/* View Mode Switcher and Goal Setting Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('consistency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'consistency'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'నిలకడ సూచిక (%)' : 'Consistency (%)'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dual'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'ద్విముఖ కొలతలు' : 'Dual Metrics'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('achievement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'achievement'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'లక్ష్య సాధన' : 'Days Matrix'}
            </button>
          </div>

          {/* Regression Line Toggle */}
          <button
            type="button"
            onClick={() => setShowRegression(!showRegression)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showRegression
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle OLS linear regression trendline"
          >
            <Zap className={`h-3.5 w-3.5 ${showRegression ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
            <span>{isTelugu ? 'రిగ్రెషన్ లైన్' : 'Regression Line'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${showRegression ? 'bg-purple-500' : 'bg-slate-300'}`} />
          </button>

          {onOpenGoalsModal && (
            <button
              type="button"
              onClick={onOpenGoalsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-2xs"
            >
              <Sliders className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'లక్ష్యాలను మార్చండి' : 'Edit Targets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Micro-KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: 7-Day Consistency Score */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 dark:text-teal-300">
            <span>{isTelugu ? 'సగటు నిలకడ స్కోరు' : '7-Day Consistency'}</span>
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-teal-950 dark:text-teal-100">
              {avgConsistencyScore}%
            </span>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              {avgConsistencyScore >= 80 ? (isTelugu ? 'అద్భుతం' : 'Optimal') : (isTelugu ? 'మంచిది' : 'Building')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-teal-800/80 dark:text-teal-300/80">
            <span>{isTelugu ? 'లక్ష్య సాధన ఆధారంగా' : 'Calculated across habits'}</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
              OLS: {regression.slope >= 0 ? `+${regression.slope}%/d` : `${regression.slope}%/d`}
            </span>
          </div>
        </div>

        {/* KPI 2: 7-Day Average Daily Steps */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
            <span>{isTelugu ? 'సగటు రోజువారీ అడుగులు' : '7-Day Avg Steps'}</span>
            <Footprints className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
              {avgDailySteps.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              / {targets.dailyStepTarget.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
            {stepGoalsMetCount} of 7 days target met
          </p>
        </div>

        {/* KPI 3: 7-Day Average Water Intake */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 dark:text-sky-300">
            <span>{isTelugu ? 'సగటు రోజువారీ నీరు' : '7-Day Avg Water'}</span>
            <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-sky-950 dark:text-sky-100">
              {avgDailyWaterMl.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
              mL
            </span>
          </div>
          <p className="text-[10px] text-sky-800/80 dark:text-sky-300/80">
            {waterGoalsMetCount} of 7 days target met
          </p>
        </div>

        {/* KPI 4: Active Habit Streak */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-300">
            <span>{isTelugu ? 'యాక్టివ్ స్ట్రీక్' : 'Habit Streak'}</span>
            <Flame className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-100">
              {summary.streakDays}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              {isTelugu ? 'రోజులు' : 'Days active'}
            </span>
          </div>
          <p className="text-[10px] text-purple-800/80 dark:text-purple-300/80">
            {isTelugu ? 'ఇన్సులిన్ సెన్సిటివిటీ పెంపు' : 'Non-insulin GLUT4 activation'}
          </p>
        </div>
      </div>

      {/* Main Visual Recharts Chart Area */}
      {viewMode === 'consistency' ? (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 120]}
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <ReferenceLine
                  y={100}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: isTelugu ? '100% లక్ష్యం' : '100% Target Met',
                    position: 'insideTopRight',
                    fill: isDark ? '#34d399' : '#059669',
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900/95 p-3 text-white text-xs shadow-xl border border-slate-700 space-y-1.5 backdrop-blur-md">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-1 font-bold text-teal-300">
                            <span>{d.fullDate} ({d.label})</span>
                            <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-sm text-[10px]">
                              {d.consistency}% Consistency
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px] text-slate-200">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Footprints className="h-3 w-3" /> Steps:
                              </span>
                              <span className="font-mono font-bold">
                                {d.steps.toLocaleString()} / {d.stepGoal.toLocaleString()} ({d.stepPercent}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1 text-sky-400">
                                <Droplets className="h-3 w-3" /> Water:
                              </span>
                              <span className="font-mono font-bold">
                                {d.waterMl.toLocaleString()} / {d.waterGoal.toLocaleString()} mL ({d.waterPercent}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="consistency"
                  name={isTelugu ? 'నిలకడ సూచిక (%)' : 'Overall Consistency Score (%)'}
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#consistencyGradient)"
                  dot={{ r: 4, fill: '#0d9488', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, stroke: '#0d9488', strokeWidth: 2, fill: '#14b8a6' }}
                />
                {showRegression && (
                  <Line
                    type="linear"
                    dataKey="regressionValue"
                    name={isTelugu ? 'రిగ్రెషన్ లైన్ (ధోరణి)' : 'OLS Regression Trendline'}
                    stroke="#9333ea"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 5, fill: '#9333ea' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : viewMode === 'dual' ? (
        <div className="space-y-4">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={isDark ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                {/* Left Y Axis: Steps */}
                <YAxis
                  yAxisId="stepsAxis"
                  stroke="#10b981"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                {/* Right Y Axis: Water mL */}
                <YAxis
                  yAxisId="waterAxis"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}L`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900/95 p-3 text-white text-xs shadow-xl border border-slate-700 space-y-1.5">
                          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                            {d.fullDate} ({d.label})
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="text-emerald-400 font-semibold flex justify-between gap-4">
                              <span>Walking Steps:</span>
                              <span className="font-mono">{d.steps.toLocaleString()} steps</span>
                            </div>
                            <div className="text-sky-400 font-semibold flex justify-between gap-4">
                              <span>Water Hydration:</span>
                              <span className="font-mono">{d.waterMl.toLocaleString()} mL</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Line
                  yAxisId="stepsAxis"
                  type="monotone"
                  dataKey="steps"
                  name={isTelugu ? 'అడుగులు (Steps)' : 'Walking Steps'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 1.5 }}
                />
                <Line
                  yAxisId="waterAxis"
                  type="monotone"
                  dataKey="waterMl"
                  name={isTelugu ? 'నీటి పరిమాణం (mL)' : 'Water Volume (mL)'}
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#0284c7', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Achievement Day-by-Day Matrix */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          {days.map((day) => (
            <div
              key={day.dateKey}
              onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                day.isToday
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 shadow-xs ring-1 ring-teal-400/40'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                <span>{day.dayLabel}</span>
                {day.isToday && (
                  <span className="text-[9px] bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100 px-1 rounded-sm">
                    Today
                  </span>
                )}
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white mb-2">
                {day.consistencyScore}%
              </div>
              <div className="space-y-1">
                <div className={`text-[10px] font-semibold flex items-center justify-center gap-1 rounded-md py-0.5 ${
                  day.stepMet ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}>
                  <Footprints className="h-2.5 w-2.5" />
                  <span>{day.steps.toLocaleString()}</span>
                </div>
                <div className={`text-[10px] font-semibold flex items-center justify-center gap-1 rounded-md py-0.5 ${
                  day.waterMet ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}>
                  <Droplets className="h-2.5 w-2.5" />
                  <span>{day.waterMl}mL</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Day Quick Card or AI Guidance Tip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-teal-50/50 dark:bg-slate-800/40 border border-teal-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-teal-700 dark:text-teal-300" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {isTelugu
              ? 'వరుసగా 7 రోజులు నడక మరియు నీరు త్రాగడం వల్ల శరీరం ఇన్సులిన్‌ను సులభంగా ఉపయోగించుకుని, టెస్టోస్టెరాన్ స్థాయిలను తగ్గిస్తుంది.'
              : 'Maintaining 70%+ daily habit consistency activates skeletal muscle GLUT4 glucose uptake and reduces hyperandrogenic cortisol peaks.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAskAITrend}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs"
        >
          <span>{isTelugu ? 'AI విశ్లేషణ అడగండి' : 'Ask AI to Analyze 7-Day Trend'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
