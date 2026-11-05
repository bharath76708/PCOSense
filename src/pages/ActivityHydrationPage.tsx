import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Droplets,
  Flame,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  BellRing,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowUpRight,
  HeartPulse,
  Activity,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useLanguage } from '../translations';
import {
  getTodayStepRecord,
  logWalkingSteps,
  updateDailyStepGoal,
  generateActivityReport,
  DailyStepRecord,
  ActivitySummaryReport
} from '../services/walkingService';
import {
  getTodayHydrationRecord,
  getHydrationSettings,
  saveHydrationSettings,
  logWaterIntake,
  removeWaterDrinkEntry,
  getNextHydrationAlertInfo,
  DailyHydrationRecord,
  HydrationReminderSettings
} from '../services/hydrationService';
import { playNotificationSound } from '../services/soundService';

export const ActivityHydrationPage: React.FC = () => {
  const { user } = useAuth();
  const { patientData, predictionResult } = useAssessment();
  const { isTelugu } = useLanguage();

  const heightCm = patientData?.['Height(Cm)'] || 162;
  const weightKg = patientData?.['Weight (Kg)'] || 62;

  // Active top tab
  const [activeTab, setActiveTab] = useState<'walking' | 'hydration' | 'reports' | 'science'>('walking');
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Walking state
  const [stepRecord, setStepRecord] = useState<DailyStepRecord>(() =>
    getTodayStepRecord(user?.uid, heightCm, weightKg)
  );
  const [reportData, setReportData] = useState<ActivitySummaryReport>(() =>
    generateActivityReport('week', user?.uid, heightCm, weightKg)
  );
  const [customStepInput, setCustomStepInput] = useState<string>('');
  const [goalStepInput, setGoalStepInput] = useState<number>(stepRecord.goalSteps || 8000);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Live Pedometer Simulator for walking simulation
  const [isSimulatingWalk, setIsSimulatingWalk] = useState<boolean>(false);

  // Hydration state
  const [hydrationRecord, setHydrationRecord] = useState<DailyHydrationRecord>(() =>
    getTodayHydrationRecord(user?.uid)
  );
  const [hydrationSettings, setHydrationSettings] = useState<HydrationReminderSettings>(() =>
    getHydrationSettings()
  );
  const [justLoggedWater, setJustLoggedWater] = useState<boolean>(false);

  // Synchronize on mount and user change
  useEffect(() => {
    const todaySteps = getTodayStepRecord(user?.uid, heightCm, weightKg);
    setStepRecord(todaySteps);
    setGoalStepInput(todaySteps.goalSteps);
    setReportData(generateActivityReport(reportPeriod, user?.uid, heightCm, weightKg));
    setHydrationRecord(getTodayHydrationRecord(user?.uid));
    setHydrationSettings(getHydrationSettings());
  }, [user, heightCm, weightKg, reportPeriod]);

  // Live pedometer simulation ticker
  useEffect(() => {
    if (!isSimulatingWalk) return;
    const timer = setInterval(() => {
      const added = Math.floor(Math.random() * 8) + 12; // ~15 steps every 2 seconds
      setStepRecord(prev => logWalkingSteps(added, user?.uid, heightCm, weightKg));
    }, 2000);
    return () => clearInterval(timer);
  }, [isSimulatingWalk, user, heightCm, weightKg]);

  const handleAddSteps = (steps: number, isPostMeal: boolean = false) => {
    const updated = logWalkingSteps(steps, user?.uid, heightCm, weightKg, isPostMeal);
    setStepRecord(updated);
    setReportData(generateActivityReport(reportPeriod, user?.uid, heightCm, weightKg));
    playNotificationSound('tap-click');
  };

  const handleCustomStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(customStepInput, 10);
    if (!isNaN(count) && count > 0) {
      handleAddSteps(count);
      setCustomStepInput('');
    }
  };

  const handleSaveGoal = () => {
    if (goalStepInput >= 2000 && goalStepInput <= 30000) {
      const updated = updateDailyStepGoal(goalStepInput, user?.uid, heightCm, weightKg);
      setStepRecord(updated);
      setIsEditingGoal(false);
      setReportData(generateActivityReport(reportPeriod, user?.uid, heightCm, weightKg));
    }
  };

  const handleDrinkWater = (amountMl: number = 250, checkpointLabel?: string) => {
    const { updatedRecord } = logWaterIntake(amountMl, checkpointLabel, user?.uid);
    setHydrationRecord(updatedRecord);
    setJustLoggedWater(true);
    setTimeout(() => setJustLoggedWater(false), 2500);
  };

  const handleRemoveWaterEntry = (entryId: string) => {
    const updated = removeWaterDrinkEntry(entryId, user?.uid);
    setHydrationRecord(updated);
  };

  const handleToggleHydrationSound = () => {
    const updated: HydrationReminderSettings = {
      ...hydrationSettings,
      soundEnabled: !hydrationSettings.soundEnabled
    };
    setHydrationSettings(updated);
    saveHydrationSettings(updated);
  };

  const handleUpdateInterval = (intervalMinutes: number) => {
    const updated: HydrationReminderSettings = {
      ...hydrationSettings,
      intervalMinutes
    };
    setHydrationSettings(updated);
    saveHydrationSettings(updated);
  };

  const alertInfo = getNextHydrationAlertInfo(hydrationRecord, hydrationSettings);
  const stepPercent = Math.min(100, Math.round((stepRecord.steps / stepRecord.goalSteps) * 100));
  const waterPercent = Math.min(100, Math.round((hydrationRecord.totalMl / hydrationRecord.targetMl) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white p-6 sm:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ఇన్సులిన్ సెన్సిటివిటీ & డీటాక్స్ ప్రొటోకాల్' : 'Insulin Sensitivity & Renal Detox Protocol'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isTelugu ? 'నడక అడుగులు & స్మార్ట్ వాటర్ అలర్ట్' : 'Step Count & Smart Hydration Tracker'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isTelugu
                ? 'క్రమం తప్పకుండా నడవడం మరియు తగినంత నీరు త్రాగడం వల్ల ఇన్సులిన్ స్థాయిలు తగ్గుతాయి, ఆండ్రోజెన్ హార్మోన్లు నియంత్రణలో ఉంటాయి మరియు పీసీఓఎస్ లక్షణాలు తగ్గుతాయి.'
                : 'Walking activates muscular GLUT4 glucose transporters without requiring extra insulin, while structured hydration flushes excess androgen metabolites and prevents cortisol-driven cravings.'}
            </p>
          </div>

          {/* Quick Metrics Badge Duo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-teal-500/30 text-center min-w-[120px] shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'నేటి అడుగులు' : "Today's Steps"}
              </span>
              <span className="text-2xl font-black text-teal-300 font-mono">
                {stepRecord.steps.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                {stepRecord.distanceKm} km ({stepPercent}%)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-cyan-500/30 text-center min-w-[120px] shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'నీటి శాతం' : "Water Drank"}
              </span>
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {hydrationRecord.totalMl} <span className="text-xs">ml</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold block">
                {hydrationRecord.glassesConsumed} / {hydrationRecord.targetGlasses} {isTelugu ? 'గ్లాసులు' : 'Glasses'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('walking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 ${
            activeTab === 'walking'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
          id="tab-walking-activity"
        >
          <Footprints className="h-4 w-4" />
          <span>{isTelugu ? 'నడక & అడుగులు' : 'Walking Activity & Steps'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 ${
            activeTab === 'hydration'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
          id="tab-hydration-alerts"
        >
          <Droplets className="h-4 w-4" />
          <span>{isTelugu ? 'వాటర్ ట్రాకింగ్ & అలర్ట్స్' : 'Smart Hydration & Water Alerts'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
          id="tab-analytics-reports"
        >
          <BarChart3 className="h-4 w-4" />
          <span>{isTelugu ? 'రోజు / వారం / నెల నివేదికలు' : 'Day, Week & Month Reports'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('science')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 ${
            activeTab === 'science'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
          id="tab-pcos-science"
        >
          <HeartPulse className="h-4 w-4" />
          <span>{isTelugu ? 'పీసీఓఎస్ వైద్య సమాచారం' : 'Clinical PCOS Benefits'}</span>
        </button>
      </div>

      {/* 3. TAB CONTENT: WALKING ACTIVITY */}
      {activeTab === 'walking' && (
        <div className="space-y-6">
          {/* Main Key Metrics Quartet */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Steps Metric */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isTelugu ? 'మొత్తం అడుగులు' : 'Total Steps'}
                </span>
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <Footprints className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {stepRecord.steps.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / {stepRecord.goalSteps.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{stepPercent}% {isTelugu ? 'లక్ష్యం పూర్తయింది' : 'of Daily Goal'}</span>
              </div>
            </div>

            {/* Distance in Kilometers */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isTelugu ? 'నడిచిన దూరం' : 'Distance Covered'}
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {stepRecord.distanceKm}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Kilometers (km)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? 'సగటు మహిళా అడుగుల కొలత ప్రకారం గణించబడింది' : 'Calibrated to stride length'}
              </p>
            </div>

            {/* Calories Burned */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isTelugu ? 'ఖర్చయిన కేలరీలు' : 'Calories Burned'}
                </span>
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {stepRecord.caloriesBurned}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  kcal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? '3.5 METs మధ్యస్థ నడక రేటు' : 'Moderate ~3.5 METs metabolic expenditure'}
              </p>
            </div>

            {/* Active Minutes & Insulin Booster Score */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isTelugu ? 'ఇన్సులిన్ సెన్సిటివిటీ స్కోర్' : 'Insulin Sensitivity Score'}
                </span>
                <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                  {stepRecord.pcosInsulinImpactScore}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stepRecord.activeMinutes} {isTelugu ? 'నిమిషాల క్రియాశీల నడక' : 'active brisk walking mins'}
              </p>
            </div>
          </div>

          {/* Interactive Log Controls & Pedometer Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Logging Box */}
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'నడక అడుగులను నమోదు చేయండి' : 'Quick Step Log & Post-Meal Walks'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTelugu
                      ? 'భోజనం తర్వాత 15 నిమిషాల నడక గ్లూకోజ్ స్పైక్‌ను 35% తగ్గిస్తుంది.'
                      : 'Log walks instantly or trigger a 15-minute post-meal blood sugar stabilizer.'}
                  </p>
                </div>

                {/* Step Goal Modifier */}
                <div className="flex items-center gap-2">
                  {isEditingGoal ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={goalStepInput}
                        onChange={e => setGoalStepInput(Number(e.target.value))}
                        className="w-24 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-teal-400 dark:bg-slate-800 dark:text-white"
                        min="2000"
                        max="30000"
                        step="500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveGoal}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-500"
                      >
                        {isTelugu ? 'సేవ్' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(true)}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isTelugu ? 'లక్ష్యం మార్చండి:' : 'Goal:'} {stepRecord.goalSteps.toLocaleString()}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddSteps(500)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-400 border border-slate-200 dark:border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    {isTelugu ? 'చిన్న నడక' : 'Short Break'}
                  </span>
                  <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono block">
                    +500
                  </span>
                  <span className="text-[10px] text-slate-400">~0.38 km</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddSteps(1000)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-400 border border-slate-200 dark:border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    {isTelugu ? '10 నిమి. నడక' : '10m Stroll'}
                  </span>
                  <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono block">
                    +1,000
                  </span>
                  <span className="text-[10px] text-slate-400">~0.76 km</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddSteps(2000, true)}
                  className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">
                    {isTelugu ? 'భోజనం తర్వాత' : 'Post-Meal Walk'}
                  </span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-300 font-mono block">
                    +2,000
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    {isTelugu ? 'గ్లూకోజ్ నియంత్రణ' : 'Blunts Glucose'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddSteps(3500)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-400 border border-slate-200 dark:border-slate-700 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    {isTelugu ? 'ఉదయపు నడక' : 'Morning Brisk Walk'}
                  </span>
                  <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono block">
                    +3,500
                  </span>
                  <span className="text-[10px] text-slate-400">~2.66 km</span>
                </button>
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleCustomStepSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="number"
                  placeholder={isTelugu ? 'అనుకూల అడుగుల సంఖ్య (ఉదా. 1500)' : 'Custom steps count (e.g. 1500)'}
                  value={customStepInput}
                  onChange={e => setCustomStepInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="50"
                  max="50000"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-colors shrink-0"
                >
                  {isTelugu ? 'నమోదు చేయండి' : 'Log Steps'}
                </button>
              </form>
            </div>

            {/* Live Pedometer & Post-Meal Assistant */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    {isTelugu ? 'లైవ్ పెడోమీటర్ సిమ్యులేటర్' : 'Live Walking Simulator'}
                  </span>
                  {isSimulatingWalk && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-white">
                  {isSimulatingWalk
                    ? (isTelugu ? 'నడక రికార్డ్ అవుతోంది...' : 'Tracking Active Movement...')
                    : (isTelugu ? 'ట్రెడ్‌మిల్ లేదా వాకింగ్ ప్రారంభించండి' : 'Simulate Treadmill or Indoor Walk')}
                </h4>
                <p className="text-xs text-slate-300">
                  {isTelugu
                    ? 'స్టార్ట్ క్లిక్ చేయండి; ప్రతి 2 సెకన్లకు అడుగులు, దూరం మరియు కేలరీలు ఆటోమేటిక్‌గా లెక్కించబడతాయి.'
                    : 'Activate to stream live simulated steps while walking on a treadmill or moving around the home.'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsSimulatingWalk(!isSimulatingWalk)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                    isSimulatingWalk
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md'
                  }`}
                  id="toggle-live-pedometer-btn"
                >
                  {isSimulatingWalk ? (
                    <>
                      <Pause className="h-4 w-4 fill-slate-950" />
                      <span>{isTelugu ? 'నడకను పాజ్ చేయండి' : 'Pause Walking Session'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-slate-950" />
                      <span>{isTelugu ? 'లైవ్ నడక ప్రారంభించండి' : 'Start Live Walking Session'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: SMART HYDRATION & WATER ALERTS */}
      {activeTab === 'hydration' && (
        <div className="space-y-6">
          {/* Top Hydration Status Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Water Target & Glasses Visualizer */}
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isTelugu ? 'నేటి నీటి వినియోగం' : 'Daily Hydration Intake Matrix'}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">
                      {waterPercent}% {isTelugu ? 'పూర్తయింది' : 'Achieved'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTelugu
                      ? 'ప్రతి గ్లాసు 250ml నీటిని సూచిస్తుంది. గ్లాసుపై క్లిక్ చేసి వెంటనే నీరు తాగినట్లు నమోదు చేయండి.'
                      : 'Each glass represents 250ml. Tap any glass to instantly log your intake.'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {hydrationRecord.totalMl}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {hydrationRecord.targetMl} ml
                  </span>
                </div>
              </div>

              {/* 10 Interactive Glasses Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 pt-2">
                {Array.from({ length: hydrationRecord.targetGlasses || 10 }).map((_, idx) => {
                  const isFilled = idx < hydrationRecord.glassesConsumed;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDrinkWater(250, `Glass #${idx + 1}`)}
                      className={`h-20 rounded-xl border flex flex-col items-center justify-between p-2 transition-all group ${
                        isFilled
                          ? 'bg-gradient-to-t from-cyan-500 to-sky-400 border-cyan-400 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-cyan-400 dark:hover:border-cyan-500'
                      }`}
                      title={`${isFilled ? 'Glass Drunk' : 'Tap to log glass # ' + (idx + 1)}`}
                    >
                      <span className={`text-[10px] font-black ${isFilled ? 'text-slate-950' : 'text-slate-400'}`}>
                        #{idx + 1}
                      </span>
                      <Droplets
                        className={`h-6 w-6 transition-transform group-hover:scale-110 ${
                          isFilled ? 'text-slate-950 fill-slate-950' : 'text-slate-400'
                        }`}
                      />
                      <span className={`text-[9px] font-bold ${isFilled ? 'text-slate-900' : 'text-slate-400'}`}>
                        250ml
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDrinkWater(250, 'I Drank 1 Glass')}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md transition-colors"
                  id="page-take-water-primary-btn"
                >
                  <Droplets className="h-4 w-4 fill-slate-950" />
                  <span>{isTelugu ? 'నేను నీరు తాగాను / I Drank It (+250ml)' : 'I Drank Water / Taken (+250ml)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDrinkWater(500, 'I Drank 1 Bottle (500ml)')}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors"
                >
                  +500ml {isTelugu ? 'సీసా' : 'Bottle'}
                </button>
              </div>
            </div>

            {/* Smart Alert Frequency & Sound Controls */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BellRing className="h-3.5 w-3.5" />
                    {isTelugu ? 'అలర్ట్ సమయాలు' : 'Smart Alert Settings'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleHydrationSound}
                    className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                      hydrationSettings.soundEnabled
                        ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-300 text-cyan-700 dark:text-cyan-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400'
                    }`}
                  >
                    {hydrationSettings.soundEnabled ? (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isTelugu ? 'శబ్దం ఆన్' : 'Sound On'}</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        <span>{isTelugu ? 'మ్యూట్' : 'Muted'}</span>
                      </>
                    )}
                  </button>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isTelugu ? 'గుర్తుచేసే వ్యవధి (Interval)' : 'Reminder Interval'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu
                    ? 'ఎంచుకున్న వ్యవధి ప్రకారం యాప్ స్వయంచాలకంగా నీరు త్రాగమని నోటిఫికేషన్ ఇస్తుంది.'
                    : 'System schedules smart reminders to ensure consistent anti-androgen hydration.'}
                </p>

                {/* Interval Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleUpdateInterval(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        hydrationSettings.intervalMinutes === mins
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      {mins} {isTelugu ? 'నిమిషాలు' : 'Mins'}
                    </button>
                  ))}
                </div>

                {/* Next Alert Info */}
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {isTelugu ? 'తదుపరి అలర్ట్:' : 'Next Alert:'}
                    </span>
                    <span className="font-mono font-black text-cyan-600 dark:text-cyan-300">
                      {alertInfo.nextScheduledTime}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {alertInfo.minutesRemaining} {isTelugu ? 'నిమిషాలు మిగిలి ఉన్నాయి' : 'minutes countdown remaining'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playNotificationSound('water-alert', true);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {isTelugu ? 'టెస్ట్ అలర్ట్ శబ్దం వినండి 🔔' : 'Test Reminder Sound 🔔'}
              </button>
            </div>
          </div>

          {/* Clinical Checkpoints Schedule & Today's History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checkpoints Schedule */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isTelugu ? 'పీసీఓఎస్ క్లినికల్ హైడ్రేషన్ చెక్‌పాయింట్స్' : 'Clinical PCOS Hydration Checkpoints'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu
                    ? 'నిర్దిష్ట సమయాల్లో నీరు త్రాగడం వల్ల కార్టిసాల్ తగ్గి, చర్మం మరియు హార్మోన్లు మెరుగవుతాయి.'
                    : 'Targeted hydration windows designed to balance insulin, cortisol, and sebum production.'}
                </p>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {hydrationSettings.scheduledCheckpoints.map((cp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950">
                          {cp.time}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {isTelugu ? cp.labelTe || cp.label : cp.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {isTelugu ? cp.pcosBenefitTe || cp.pcosBenefit : cp.pcosBenefit}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDrinkWater(cp.amountMl, cp.label)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-colors"
                    >
                      {isTelugu ? 'తీసుకున్నాను' : 'Taken'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Logged Drinks History */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'నేడు తీసుకున్న నీటి వివరాలు' : 'Today’s Logged Water Entries'}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {hydrationRecord.entries.length} {isTelugu ? 'సార్లు' : 'Logs'}
                  </span>
                </div>

                {hydrationRecord.entries.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    {isTelugu ? 'ఇంకా ఎటువంటి నీరు నమోదు కాలేదు. గ్లాస్ బటన్ నొక్కండి!' : 'No entries logged yet. Tap "I Drank Water" to start!'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {hydrationRecord.entries.map(entry => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                            <Droplets className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {entry.checkpointLabel || 'Water Intake'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {entry.time} • {entry.amountMl} ml
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWaterEntry(entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isTelugu ? 'తొలగించండి' : 'Remove entry'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: DAY, WEEK & MONTH REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? 'కదలిక & నడక సమగ్ర విశ్లేషణ' : 'Walking & Step Movement Analytics'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? 'రోజు, వారం మరియు నెలవారీ అడుగులు, కిలోమీటర్లు మరియు కేలరీల నివేదికలను సరిచూడండి.'
                  : 'Track your daily, weekly, and monthly distance (km), steps, and caloric trends.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setReportPeriod('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  reportPeriod === 'day'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isTelugu ? 'నేటి రోజు' : 'Daily (Hourly)'}
              </button>
              <button
                type="button"
                onClick={() => setReportPeriod('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  reportPeriod === 'week'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isTelugu ? 'గత 7 రోజులు (వారం)' : 'Weekly (7 Days)'}
              </button>
              <button
                type="button"
                onClick={() => setReportPeriod('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  reportPeriod === 'month'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isTelugu ? 'గత 30 రోజులు (నెల)' : 'Monthly (30 Days)'}
              </button>
            </div>
          </div>

          {/* Aggregated Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'మొత్తం అడుగులు' : 'Total Period Steps'}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {reportData.totalSteps.toLocaleString()}
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold block">
                {reportData.avgDailySteps.toLocaleString()} {isTelugu ? 'రోజు సగటు' : 'avg/day'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'మొత్తం దూరం' : 'Total Distance'}
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {reportData.totalDistanceKm} <span className="text-xs">km</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {isTelugu ? 'ప్రయాణించిన కిలోమీటర్లు' : 'Kilometers walked'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'మొత్తం ఖర్చయిన కేలరీలు' : 'Total Burned'}
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {reportData.totalCaloriesBurned.toLocaleString()} <span className="text-xs">kcal</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {isTelugu ? 'శక్తి వినియోగం' : 'Energy expenditure'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                {isTelugu ? 'లక్ష్య సాధన రేటు' : 'Goal Achievement'}
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {reportData.goalAchievementRate}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                {reportData.daysMetGoal} / {reportData.totalDays} {isTelugu ? 'రోజులు సాధించారు' : 'Days met target'}
              </span>
            </div>
          </div>

          {/* Interactive Recharts Visualizer */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-600" />
                <span>
                  {reportPeriod === 'day'
                    ? (isTelugu ? 'గంటల వారీ అడుగుల వివరాలు' : 'Hourly Step Distribution (Today)')
                    : reportPeriod === 'week'
                    ? (isTelugu ? 'గత 7 రోజుల అడుగుల గ్రాఫ్' : '7-Day Walking Step Progression')
                    : (isTelugu ? 'గత 30 రోజుల నెలవారీ గ్రాఫ్' : '30-Day Monthly Movement Trajectory')}
                </span>
              </h4>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: number, name: string) => {
                      if (name === 'steps') return [`${val.toLocaleString()} steps`, 'Steps Walked'];
                      if (name === 'distanceKm') return [`${val} km`, 'Distance (km)'];
                      if (name === 'calories') return [`${val} kcal`, 'Calories Burned'];
                      return [val, name];
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={8000} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target (8,000)', fill: '#10b981', fontSize: 10 }} />
                  <Bar dataKey="steps" fill="#0d9488" radius={[6, 6, 0, 0]} name="Steps Walked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: CLINICAL PCOS WALKING & HYDRATION SCIENCE */}
      {activeTab === 'science' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 w-fit">
                <Footprints className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? '1. GLUT4 ఇన్సులిన్ రహిత గ్లూకోజ్ నియంత్రణ' : '1. Non-Insulin GLUT4 Glucose Disposal'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isTelugu
                  ? 'కండరాల సంకోచం వల్ల GLUT4 ప్రోటీన్ కణ ఉపరితలానికి చేరుతుంది. ఇది ఇన్సులిన్ అవసరం లేకుండానే రక్తంలోని చక్కెరను కండరాల్లోకి పంపుతుంది, తద్వారా హైపర్‌ఇన్సులినిమియా తగ్గుతుంది.'
                  : 'Skeletal muscle contraction during brisk walking translocates GLUT4 glucose transporters to cell membranes completely independent of insulin, directly relieving pancreatic beta-cell strain.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 w-fit">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? '2. ఆండ్రోజెన్ విసర్జన & కిడ్నీ డీటాక్స్' : '2. Renal Clearance of Androgen Byproducts'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isTelugu
                  ? 'రోజుకు 2.5 నుండి 3 లీటర్ల నీరు త్రాగడం వల్ల కాలేయం మరియు మూత్రపిండాలు రక్తంలోని అదనపు టెస్టోస్టెరాన్ మరియు విష వ్యర్థాలను సులభంగా బయటకు పంపుతాయి.'
                  : 'Adequate daily hydration (2.5L–3.0L) assists renal glomerular filtration, enabling rapid clearance of hepatic androgen metabolites and reducing sebum-clogged cystic acne.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 w-fit">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? '3. కార్టిసాల్ తగ్గింపు & ఆకలి నియంత్రణ' : '3. Cortisol Dampening & Craving Shield'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isTelugu
                  ? 'భారీ వర్కౌట్ల కంటే తేలికపాటి నడక కార్టిసాల్ (ఒత్తిడి హార్మోన్) పెరగకుండా కాపాడుతుంది. నీరు త్రాగడం వల్ల కృత్రిమ ఆకలి మరియు తీపి కోరికలు తగ్గుతాయి.'
                  : 'Low-intensity steady state (LISS) walking suppresses adrenocortical cortisol spikes that trigger belly fat deposition, while scheduled water checkpoints suppress false hunger signals.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
