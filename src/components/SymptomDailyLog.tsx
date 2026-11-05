import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Heart,
  Moon,
  Droplets,
  Activity,
  Flame,
  Brain,
  Smile,
  Frown,
  Meh,
  Sun,
  Shield,
  Trash2,
  Edit3,
  History,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRight,
  Target,
  Award,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';
import { DailySymptomLog } from '../types';
import {
  getDailySymptomLogs,
  saveDailySymptomLog,
  deleteDailySymptomLog,
  countDailySymptoms
} from '../services/dailySymptomService';
import {
  getWellnessTargets,
  saveWellnessTargets,
  WellnessPersonalTargets
} from '../services/wellnessTargetsService';
import { playNotificationSound } from '../services/soundService';

interface SymptomDailyLogProps {
  userId?: string;
  onLogSaved?: (newLog: DailySymptomLog) => void;
  isCompact?: boolean;
  defaultDateKey?: string;
}

export const SymptomDailyLog: React.FC<SymptomDailyLogProps> = ({
  userId,
  onLogSaved,
  isCompact = false,
  defaultDateKey
}) => {
  const { t, isTelugu } = useLanguage();
  const { user } = useAuth();
  const activeUserId = userId || user?.id || 'default-user';

  // Date selection state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateKey || todayStr);

  // Core PCOS Symptoms State
  // 1. Mood
  const [moodState, setMoodState] = useState<'calm' | 'happy' | 'irritable' | 'anxious' | 'low' | 'swings'>('calm');
  const [moodSwings, setMoodSwings] = useState<number>(0);
  const [anxiety, setAnxiety] = useState<number>(0);
  const [brainFog, setBrainFog] = useState<number>(0);

  // 2. Fatigue & Sleep
  const [fatigue, setFatigue] = useState<number>(1);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [sleepHours, setSleepHours] = useState<number>(7.5);

  // 3. Cycle & Irregularities
  const [cycleDay, setCycleDay] = useState<number>(14);
  const [menstrualFlow, setMenstrualFlow] = useState<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>('none');
  const [cycleIrregularity, setCycleIrregularity] = useState<
    'none' | 'delayed_period' | 'missed_period' | 'spotting_mid_cycle' | 'prolonged_flow' | 'ovulation_pain'
  >('none');
  const [basalTemp, setBasalTemp] = useState<string>('36.6');

  // 4. Physical Symptoms
  const [pelvicPain, setPelvicPain] = useState<number>(0);
  const [bloating, setBloating] = useState<number>(0);
  const [acne, setAcne] = useState<number>(0);
  const [headaches, setHeadaches] = useState<number>(0);
  const [sugarCravings, setSugarCravings] = useState<number>(1);
  const [hirsutismFlare, setHirsutismFlare] = useState<boolean>(false);
  const [hairLossNoticed, setHairLossNoticed] = useState<boolean>(false);

  // 5. Lifestyle Co-factors
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(25);
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number>(2.2);
  const [fastFoodConsumed, setFastFoodConsumed] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // UI States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccessLog, setSavedSuccessLog] = useState<DailySymptomLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailySymptomLog[]>([]);
  const [showRecentHistory, setShowRecentHistory] = useState<boolean>(false);
  const [showExtraPhysical, setShowExtraPhysical] = useState<boolean>(false);

  // Personal Wellness Goals State
  const [personalTargets, setPersonalTargets] = useState<WellnessPersonalTargets>(() => getWellnessTargets(activeUserId));
  const [targetStepsInput, setTargetStepsInput] = useState<number>(() => getWellnessTargets(activeUserId).dailyStepTarget || 7000);
  const [targetWaterLInput, setTargetWaterLInput] = useState<number>(() => Number(((getWellnessTargets(activeUserId).dailyWaterTargetMl || 2000) / 1000).toFixed(1)));
  const [targetActiveDays, setTargetActiveDays] = useState<number>(() => getWellnessTargets(activeUserId).weeklyActiveDaysTarget || 5);
  const [showGoalsCard, setShowGoalsCard] = useState<boolean>(true);
  const [goalsSavedSuccess, setGoalsSavedSuccess] = useState<boolean>(false);

  // Sync targets if external change happens
  useEffect(() => {
    const handleTargetsChange = () => {
      const current = getWellnessTargets(activeUserId);
      setPersonalTargets(current);
      setTargetStepsInput(current.dailyStepTarget || 7000);
      setTargetWaterLInput(Number(((current.dailyWaterTargetMl || 2000) / 1000).toFixed(1)));
      setTargetActiveDays(current.weeklyActiveDaysTarget || 5);
    };
    window.addEventListener('pcosense_wellness_targets_changed', handleTargetsChange);
    return () => window.removeEventListener('pcosense_wellness_targets_changed', handleTargetsChange);
  }, [activeUserId]);

  const handleSavePersonalGoals = () => {
    const updated = saveWellnessTargets({
      dailyStepTarget: Number(targetStepsInput) || 7000,
      dailyWaterTargetMl: Math.round((Number(targetWaterLInput) || 2.0) * 1000),
      weeklyActiveDaysTarget: Number(targetActiveDays) || 5
    }, activeUserId);
    setPersonalTargets(updated);
    setGoalsSavedSuccess(true);
    playNotificationSound('tap-click');
    setTimeout(() => setGoalsSavedSuccess(false), 3500);
  };

  // Load logs and populate form if a log already exists for selectedDate
  const loadLogs = () => {
    const logs = getDailySymptomLogs(activeUserId);
    setRecentLogs(logs);

    const existing = logs.find(l => l.dateKey === selectedDate);
    if (existing) {
      setMoodState(existing.moodState || (existing.moodSwings > 2 ? 'swings' : existing.anxiety > 2 ? 'anxious' : 'calm'));
      setMoodSwings(existing.moodSwings ?? 0);
      setAnxiety(existing.anxiety ?? 0);
      setBrainFog(existing.brainFog ?? 0);
      setFatigue(existing.fatigue ?? 1);
      setSleepQuality(existing.sleepQuality || 'good');
      setSleepHours(existing.sleepHours ?? 7.5);
      setCycleDay(existing.cycleDay ?? 14);
      setMenstrualFlow(existing.menstrualFlow || 'none');
      setCycleIrregularity(existing.cycleIrregularity || 'none');
      if (existing.basalTempCelsius) setBasalTemp(String(existing.basalTempCelsius));
      setPelvicPain(existing.pelvicPain ?? 0);
      setBloating(existing.bloating ?? 0);
      setAcne(existing.acne ?? 0);
      setHeadaches(existing.headaches ?? 0);
      setSugarCravings(existing.sugarCravings ?? 1);
      setHirsutismFlare(!!existing.hirsutismFlare);
      setHairLossNoticed(!!existing.hairLossNoticed);
      setExerciseMinutes(existing.exerciseMinutes ?? 25);
      setWaterIntakeLiters(existing.waterIntakeLiters ?? 2.2);
      setFastFoodConsumed(!!existing.fastFoodConsumed);
      setNotes(existing.notes || '');
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedDate, activeUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        userId: activeUserId,
        dateKey: selectedDate,
        moodState,
        moodSwings,
        anxiety,
        brainFog,
        fatigue,
        sleepQuality,
        sleepHours: Number(sleepHours) || 7,
        cycleDay: Number(cycleDay) || 1,
        menstrualFlow,
        cycleIrregularity,
        basalTempCelsius: basalTemp ? Number(basalTemp) : undefined,
        pelvicPain,
        bloating,
        acne,
        headaches,
        sugarCravings,
        hirsutismFlare,
        hairLossNoticed,
        exerciseMinutes: Number(exerciseMinutes) || 0,
        waterIntakeLiters: Number(waterIntakeLiters) || 0,
        fastFoodConsumed,
        notes: notes.trim()
      };

      const savedLog = saveDailySymptomLog(payload);
      playNotificationSound('symptom-logged');

      setSavedSuccessLog(savedLog);
      loadLogs();

      if (onLogSaved) {
        onLogSaved(savedLog);
      }

      setTimeout(() => {
        setSavedSuccessLog(null);
      }, 5000);
    } catch (err) {
      console.error('Error saving daily symptom log:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLog = (logId: string) => {
    deleteDailySymptomLog(logId, activeUserId);
    playNotificationSound('tap-click');
    loadLogs();
  };

  const quickMoodOptions = [
    { id: 'calm', label: isTelugu ? 'ప్రశాంతం' : 'Calm / Balanced', icon: Smile, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    { id: 'happy', label: isTelugu ? 'ఉత్సాహం' : 'Energized', icon: Sun, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { id: 'irritable', label: isTelugu ? 'చిరాకు' : 'Irritable', icon: Flame, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    { id: 'anxious', label: isTelugu ? 'ఆందోళన' : 'Anxious', icon: Brain, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
    { id: 'low', label: isTelugu ? 'నిరాశ' : 'Low / Down', icon: Frown, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' },
    { id: 'swings', label: isTelugu ? 'మూడ్ స్వింగ్స్' : 'Mood Swings', icon: Meh, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' }
  ];

  const fatigueLevels = [
    { value: 0, label: isTelugu ? '0: శక్తివంతం' : '0: Alert', desc: isTelugu ? 'అలసట లేదు' : 'No fatigue' },
    { value: 1, label: isTelugu ? '1: తేలికపాటి' : '1: Mild', desc: isTelugu ? 'సాధారణం' : 'Normal energy' },
    { value: 2, label: isTelugu ? '2: మోస్తరు' : '2: Moderate', desc: isTelugu ? 'మధ్యాహ్న అలసట' : 'Afternoon slump' },
    { value: 3, label: isTelugu ? '3: అధిక అలసట' : '3: Heavy', desc: isTelugu ? 'ఓపిక తగ్గింది' : 'Sluggish' },
    { value: 4, label: isTelugu ? '4: తీవ్ర నిస్సత్తువ' : '4: Severe', desc: isTelugu ? 'తీవ్రమైన అలసట' : 'Deep exhaustion' },
    { value: 5, label: isTelugu ? '5: పరిపూర్ణ నీరసం' : '5: Debilitating', desc: isTelugu ? 'పని చేయలేకపోవడం' : 'Bed-rest needed' }
  ];

  const cycleIrregularityOptions = [
    { id: 'none', label: isTelugu ? 'సాధారణం (క్రమం తప్పలేదు)' : 'Regular / Normal Timing' },
    { id: 'delayed_period', label: isTelugu ? 'ఆలస్యమైన పీరియడ్ (>35 రోజులు)' : 'Delayed Period (>35 days)' },
    { id: 'missed_period', label: isTelugu ? 'తప్పిపోయిన పీరియడ్ (ఆమెనోరియా)' : 'Missed Period (Amenorrhea)' },
    { id: 'spotting_mid_cycle', label: isTelugu ? 'మధ్య-సైకిల్ స్పాటింగ్' : 'Mid-Cycle Spotting' },
    { id: 'prolonged_flow', label: isTelugu ? 'దీర్ఘకాలిక రక్తస్రావం (>7 రోజులు)' : 'Prolonged Bleeding (>7 days)' },
    { id: 'ovulation_pain', label: isTelugu ? 'అండోత్సర్గము నొప్పి (మిట్టెల్స్‌ష్మెర్జ్)' : 'Ovulatory Pain (Mittelschmerz)' }
  ];

  return (
    <div
      id="symptom-daily-log-card"
      className="rounded-3xl bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] shadow-md p-6 lg:p-8 text-[#263D32] dark:text-[#E8F2EA] transition-all relative overflow-hidden"
    >
      {/* Background soft ambient highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E9E4] dark:border-[#2C3E33]">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[#263D32] dark:text-[#E8F2EA]">
                {isTelugu ? 'రోజువారీ లక్షణాల రికార్డు (Symptom Daily Log)' : 'Symptom Daily Log'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Database className="h-3 w-3" />
                <span>Cloud Synced</span>
              </span>
            </div>
            <p className="text-xs text-[#526B5C] dark:text-[#A1B8AA] mt-0.5">
              {isTelugu
                ? 'మీ మూడ్, అలసట మరియు సైకిల్ మార్పులను సురక్షిత డేటాబేస్‌లో రికార్డ్ చేయండి'
                : 'Track daily PCOS symptoms like mood, fatigue, and cycle irregularities to uncover hormonal trends.'}
            </p>
          </div>
        </div>

        {/* Date Selector & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F4F6F4] dark:bg-[#22352A] px-3 py-1.5 rounded-xl border border-[#E5E9E4] dark:border-[#2C3E33]">
            <Calendar className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={todayStr}
              className="bg-transparent text-xs font-semibold text-[#263D32] dark:text-[#E8F2EA] focus:outline-none cursor-pointer"
              title="Select date to log symptoms"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowRecentHistory(prev => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>{recentLogs.length} {isTelugu ? 'లాగ్‌లు' : 'Logs'}</span>
            {showRecentHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Cloud Firestore Storage Banner Confirmation */}
      <div className="mt-4 px-3.5 py-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between text-[11px] text-teal-800 dark:text-teal-300">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>
            {isTelugu
              ? 'నమోదు చేయబడిన వివరాలు క్లౌడ్ ఫైర్‌స్టోర్ డేటాబేస్ (ai-studio-pcosense) లో భద్రపరచబడతాయి'
              : 'Directly persisted to Cloud Firestore collection: users/{userId}/symptoms'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400 hidden md:inline">
          ai-studio-pcosense
        </span>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessLog && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">
              {isTelugu ? 'లక్షణాల లాగ్ డేటాబేస్‌లో విజయవంతంగా సేవ్ చేయబడింది!' : 'Daily Symptom Log Successfully Saved to Database!'}
            </p>
            <p className="mt-1 text-emerald-800/90 dark:text-emerald-300/90">
              {isTelugu
                ? `తీవ్రత స్కోరు: ${savedSuccessLog.overallSeverityScore}/100 | క్రియాశీల లక్షణాలు: ${savedSuccessLog.symptomsCount ?? countDailySymptoms(savedSuccessLog)}`
                : `Calculated Severity Score: ${savedSuccessLog.overallSeverityScore}/100 • Active Symptoms Count: ${savedSuccessLog.symptomsCount ?? countDailySymptoms(savedSuccessLog)} • Synced for ${savedSuccessLog.dateFormatted}`}
            </p>
          </div>
        </div>
      )}

      {/* History Drawer if toggled */}
      {showRecentHistory && (
        <div className="mt-4 p-4 rounded-2xl bg-[#F4F6F4] dark:bg-[#22352A] border border-[#E5E9E4] dark:border-[#2C3E33]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526B5C] dark:text-[#A1B8AA]">
              {isTelugu ? 'ఇటీవలి రోజువారీ లాగ్‌లు' : 'Recent Log History in Database'}
            </h3>
            <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
              {recentLogs.length} {isTelugu ? 'నమోదులు' : 'entries stored'}
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                {isTelugu ? 'ఇంకా ఎటువంటి లాగ్‌లు నమోదు కాలేదు.' : 'No symptom logs recorded yet. Submit your first log below!'}
              </p>
            ) : (
              recentLogs.slice(0, 7).map(log => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(log.dateKey)}
                      className="text-left hover:underline"
                    >
                      <span className="font-bold text-[#263D32] dark:text-[#E8F2EA]">{log.dateFormatted}</span>
                      <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA] ml-2">
                        Mood: {log.moodState || (log.moodSwings > 2 ? 'Swings' : 'Normal')} • Fatigue: {log.fatigue}/5
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      log.overallSeverityScore > 50
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}>
                      Severity {log.overallSeverityScore}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EXTENDED: PERSONAL WELLNESS GOALS CONFIGURATION & LIVE PROGRESS */}
      <div
        id="personal-wellness-goals-section"
        className="mt-6 rounded-2xl p-5 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-[#F9FAF9] dark:from-teal-950/30 dark:via-emerald-950/20 dark:to-[#1A2820] border border-teal-200/80 dark:border-teal-800/60 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-200/60 dark:border-teal-800/40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-600 dark:bg-teal-500 text-white shadow-xs">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#263D32] dark:text-[#E8F2EA] flex items-center gap-2">
                <span>{isTelugu ? 'వ్యక్తిగత సంరక్షణ లక్ష్యాలు (Personal Wellness Goals)' : 'Personal Wellness Goals'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-semibold">
                  Dashboard Synced
                </span>
              </h3>
              <p className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
                {isTelugu
                  ? 'మీ రోజువారీ నడక మరియు నీటి వినియోగ లక్ష్యాలను సెట్ చేయండి (ఉదా: 7,000 అడుగులు, 2L నీరు)'
                  : 'Set custom targets (e.g. reach 7k steps, drink 2L water) displayed alongside activity charts.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGoalsCard(prev => !prev)}
              className="text-xs font-semibold text-teal-800 dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showGoalsCard ? (isTelugu ? 'దాచు' : 'Minimize') : (isTelugu ? 'సవరించు' : 'Adjust Goals')}</span>
              {showGoalsCard ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {showGoalsCard && (
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Target 1: Daily Step Goal */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E2F26] border border-[#E5E9E4] dark:border-[#2C3E33] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-teal-600" />
                    <span>{isTelugu ? 'రోజువారీ నడక లక్ష్యం' : 'Daily Step Target'}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                    {Number(targetStepsInput).toLocaleString()} steps
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {[6000, 7000, 8000, 10000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetStepsInput(val)}
                      className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        Number(targetStepsInput) === val
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-[#F4F6F4] dark:bg-[#25382D] text-[#526B5C] dark:text-[#A1B8AA] hover:bg-teal-50'
                      }`}
                    >
                      {val === 7000 ? '7k (Rec)' : `${val / 1000}k`}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1000}
                    max={30000}
                    step={500}
                    value={targetStepsInput}
                    onChange={e => setTargetStepsInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5DDD7] dark:border-[#384E41] bg-transparent text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="7000"
                  />
                  <span className="text-[11px] text-slate-500 shrink-0">steps/day</span>
                </div>

                {/* Progress preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex justify-between text-[#526B5C] dark:text-[#A1B8AA] mb-1">
                    <span>Current Pace:</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {exerciseMinutes ? `${exerciseMinutes * 105} est. steps` : '5,400 avg steps'} ({Math.min(100, Math.round(((exerciseMinutes ? exerciseMinutes * 105 : 5400) / (targetStepsInput || 7000)) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(((exerciseMinutes ? exerciseMinutes * 105 : 5400) / (targetStepsInput || 7000)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target 2: Daily Water Intake Goal */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E2F26] border border-[#E5E9E4] dark:border-[#2C3E33] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-blue-600" />
                    <span>{isTelugu ? 'హైడ్రేషన్ లక్ష్యం' : 'Daily Water Target'}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                    {targetWaterLInput} Liters
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {[1.8, 2.0, 2.5, 3.0].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetWaterLInput(val)}
                      className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        Number(targetWaterLInput) === val
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-[#F4F6F4] dark:bg-[#25382D] text-[#526B5C] dark:text-[#A1B8AA] hover:bg-blue-50'
                      }`}
                    >
                      {val}L
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={targetWaterLInput}
                    onChange={e => setTargetWaterLInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5DDD7] dark:border-[#384E41] bg-transparent text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="2.0"
                  />
                  <span className="text-[11px] text-slate-500 shrink-0">Liters/day</span>
                </div>

                {/* Progress preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex justify-between text-[#526B5C] dark:text-[#A1B8AA] mb-1">
                    <span>Today Logged:</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                      {waterIntakeLiters}L / {targetWaterLInput}L ({Math.min(100, Math.round(((waterIntakeLiters || 1.8) / (targetWaterLInput || 2.0)) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(((waterIntakeLiters || 1.8) / (targetWaterLInput || 2.0)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target 3: Weekly Active Days & Sync Action */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E2F26] border border-[#E5E9E4] dark:border-[#2C3E33] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-amber-600" />
                      <span>{isTelugu ? 'వారపు క్రియాశీల రోజులు' : 'Weekly Active Days'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                      {targetActiveDays} days / wk
                    </span>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {[4, 5, 6].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setTargetActiveDays(days)}
                        className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          targetActiveDays === days
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-[#F4F6F4] dark:bg-[#25382D] text-[#526B5C] dark:text-[#A1B8AA] hover:bg-amber-50'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSavePersonalGoals}
                    className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isTelugu ? 'లక్ష్యాలను సేవ్ చేయి' : 'Save & Update Dashboard Goals'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Saved Feedback Notification */}
            {goalsSavedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>
                  {isTelugu
                    ? 'మీ వ్యక్తిగత లక్ష్యాలు సేవ్ చేయబడ్డాయి మరియు డాష్‌బోర్డ్ చార్ట్‌లలో నవీకరించబడ్డాయి!'
                    : 'Personal goals saved! Activity & Hydration progress bars updated on the Dashboard.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Logging Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        
        {/* SECTION 1: MOOD & EMOTIONAL SYMPTOMS */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-[#263D32] dark:text-[#E8F2EA]">
                {isTelugu ? '1. మానసిక స్థితి & మూడ్ (Mood)' : '1. Mood & Emotional State'}
              </h3>
            </div>
            <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
              {isTelugu ? 'హార్మోన్ల సమతుల్యత సూచిక' : 'PCOS Neuroendocrine Marker'}
            </span>
          </div>

          {/* Quick Mood State Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {quickMoodOptions.map(opt => {
              const Icon = opt.icon;
              const isSelected = moodState === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMoodState(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? `${opt.color} ring-2 ring-teal-500 shadow-xs font-bold scale-[1.02]`
                      : 'bg-white dark:bg-[#1A2820] border-[#E5E9E4] dark:border-[#2C3E33] text-[#526B5C] dark:text-[#A1B8AA] hover:bg-slate-50 dark:hover:bg-[#25382D]'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-center leading-tight text-[11px]">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fine-grained Mood & Mental Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5E9E4] dark:border-[#2C3E33]">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{isTelugu ? 'మూడ్ స్వింగ్స్ తీవ్రత' : 'Mood Swings Intensity'}</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{moodSwings} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={moodSwings}
                onChange={e => setMoodSwings(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>None (0)</span>
                <span>Severe (5)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{isTelugu ? 'ఆందోళన (Anxiety)' : 'Anxiety / Restlessness'}</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{anxiety} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={anxiety}
                onChange={e => setAnxiety(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Calm (0)</span>
                <span>High (5)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{isTelugu ? 'మెదడు మందగించడం (Brain Fog)' : 'Brain Fog / Focus'}</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{brainFog} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={brainFog}
                onChange={e => setBrainFog(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Clear (0)</span>
                <span>Cloudy (5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: FATIGUE & SLEEP RECOVERY */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-[#263D32] dark:text-[#E8F2EA]">
                {isTelugu ? '2. అలసట & నిద్ర (Fatigue & Sleep)' : '2. Fatigue Level & Sleep Recovery'}
              </h3>
            </div>
            <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
              {isTelugu ? 'ఇన్సులిన్ & కార్టిసాల్ సంబంధం' : 'Insulin & Cortisol Drain'}
            </span>
          </div>

          {/* Fatigue Level Scale */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">
              {isTelugu ? 'ఈ రోజు మీ అలసట స్థాయిని ఎంచుకోండి:' : 'Select your daily fatigue intensity:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {fatigueLevels.map(lvl => {
                const isSelected = fatigue === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setFatigue(lvl.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs scale-[1.02]'
                        : 'bg-white dark:bg-[#1A2820] border-[#E5E9E4] dark:border-[#2C3E33] text-[#263D32] dark:text-[#E8F2EA] hover:bg-slate-50 dark:hover:bg-[#25382D]'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{lvl.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sleep Quality & Sleep Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E9E4] dark:border-[#2C3E33]">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                {isTelugu ? 'రాత్రి నిద్ర నాణ్యత (Sleep Quality)' : 'Sleep Restfulness'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['poor', 'fair', 'good', 'excellent'] as const).map(quality => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => setSleepQuality(quality)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer text-center ${
                      sleepQuality === quality
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-white dark:bg-[#1A2820] border-[#E5E9E4] dark:border-[#2C3E33] text-[#526B5C] dark:text-[#A1B8AA]'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">
                {isTelugu ? 'నిద్రపోయిన గంటలు (Sleep Hours)' : 'Total Sleep Hours'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={e => setSleepHours(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-teal-600 cursor-pointer"
                />
                <span className="w-14 text-center font-bold text-xs bg-white dark:bg-[#1A2820] px-2 py-1 rounded-lg border border-[#E5E9E4] dark:border-[#2C3E33]">
                  {sleepHours} hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CYCLE & MENSTRUAL IRREGULARITIES */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-[#263D32] dark:text-[#E8F2EA]">
                {isTelugu ? '3. రుతుక్రమ మార్పులు & సైకిల్ (Cycle Irregularities)' : '3. Menstrual Cycle & Irregularities'}
              </h3>
            </div>
            <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
              {isTelugu ? 'ఓవులేషన్ & ఫ్లో ట్రాకింగ్' : 'Ovulatory & Rotterdam Criterion'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Cycle Irregularity Dropdown/Cards */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1.5">
                {isTelugu ? 'సైకిల్ క్రమరాహిత్యం గమనించారా?' : 'Specific Cycle Irregularity Observed:'}
              </label>
              <select
                value={cycleIrregularity}
                onChange={e => setCycleIrregularity(e.target.value as any)}
                className="w-full bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] rounded-xl px-3 py-2 text-xs font-semibold text-[#263D32] dark:text-[#E8F2EA] focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {cycleIrregularityOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle Day */}
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                {isTelugu ? 'సైకిల్ రోజు (Cycle Day)' : 'Current Cycle Day'}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={cycleDay}
                onChange={e => setCycleDay(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] rounded-xl px-3 py-2 text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. 14"
              />
            </div>
          </div>

          {/* Menstrual Flow State */}
          <div>
            <label className="block text-xs font-medium mb-1.5">
              {isTelugu ? 'రక్తస్రావం స్థాయి (Menstrual Flow)' : 'Menstrual Flow Today:'}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['none', 'spotting', 'light', 'medium', 'heavy'] as const).map(flow => (
                <button
                  key={flow}
                  type="button"
                  onClick={() => setMenstrualFlow(flow)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold capitalize border cursor-pointer text-center ${
                    menstrualFlow === flow
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white dark:bg-[#1A2820] border-[#E5E9E4] dark:border-[#2C3E33] text-[#526B5C] dark:text-[#A1B8AA] hover:bg-slate-50 dark:hover:bg-[#25382D]'
                  }`}
                >
                  {flow}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: PHYSICAL PAIN & METABOLIC CO-FACTORS (Collapsible / Expandable) */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowExtraPhysical(prev => !prev)}
              className="flex items-center gap-2 text-sm font-bold text-[#263D32] dark:text-[#E8F2EA] cursor-pointer hover:text-teal-700 transition-colors"
            >
              <Flame className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>
                {isTelugu
                  ? '4. కటి నొప్పి, ఉబ్బరం & ఆండ్రోజెన్ లక్షణాలు (Additional PCOS Symptoms)'
                  : '4. Pelvic Pain, Bloating, Acne & Androgen Symptoms'}
              </span>
              {showExtraPhysical ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>
            <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
              {showExtraPhysical ? 'Expanded' : 'Click to adjust'}
            </span>
          </div>

          {showExtraPhysical && (
            <div className="mt-4 pt-4 border-t border-[#E5E9E4] dark:border-[#2C3E33] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{isTelugu ? 'కటి నొప్పి (Pelvic Pain)' : 'Pelvic Pain / Cramping'}</span>
                    <span className="font-bold text-rose-600">{pelvicPain} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={pelvicPain}
                    onChange={e => setPelvicPain(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-rose-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{isTelugu ? 'కడుపుబ్బరం (Bloating)' : 'Bloating & Discomfort'}</span>
                    <span className="font-bold text-amber-600">{bloating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={bloating}
                    onChange={e => setBloating(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{isTelugu ? 'మొటిమలు (Acne Flare)' : 'Acne Breakouts'}</span>
                    <span className="font-bold text-teal-600">{acne} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={acne}
                    onChange={e => setAcne(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-teal-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{isTelugu ? 'తీపి తినాలనే కోరిక' : 'Sugar / Carb Cravings'}</span>
                    <span className="font-bold text-purple-600">{sugarCravings} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={sugarCravings}
                    onChange={e => setSugarCravings(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles for Hirsutism and Hair loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hirsutismFlare}
                    onChange={e => setHirsutismFlare(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-teal-600 focus:ring-teal-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-[#263D32] dark:text-[#E8F2EA]">
                      {isTelugu ? 'అవాంఛిత రోమాలు అధికంగా కనిపించాయా?' : 'Hirsutism / Facial Hair Flare'}
                    </span>
                    <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
                      {isTelugu ? 'ఆండ్రోజెన్ హార్మోన్ సూచిక' : 'Noticeable coarse chin/jaw hair growth'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hairLossNoticed}
                    onChange={e => setHairLossNoticed(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-teal-600 focus:ring-teal-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-[#263D32] dark:text-[#E8F2EA]">
                      {isTelugu ? 'జుట్టు రాలడం గమనించారా?' : 'Hair Thinning / Scalp Shedding'}
                    </span>
                    <span className="text-[11px] text-[#526B5C] dark:text-[#A1B8AA]">
                      {isTelugu ? 'DHT ఆండ్రోజెన్ ప్రభావం' : 'Excess shedding during brushing or washing'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: LIFESTYLE CO-FACTORS & NOTES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 mb-1.5">
              <Activity className="h-4 w-4" />
              <span>{isTelugu ? 'వ్యాయామం / నడక (నిమిషాలు)' : 'Activity (Minutes)'}</span>
            </div>
            <input
              type="number"
              min="0"
              max="300"
              value={exerciseMinutes}
              onChange={e => setExerciseMinutes(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. 30"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 mb-1.5">
              <Droplets className="h-4 w-4" />
              <span>{isTelugu ? 'నీటి పరిమాణం (లీటర్లు)' : 'Hydration (Liters)'}</span>
            </div>
            <input
              type="number"
              min="0"
              max="8"
              step="0.1"
              value={waterIntakeLiters}
              onChange={e => setWaterIntakeLiters(Number(e.target.value))}
              className="w-full bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. 2.5"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9FAF9] dark:bg-[#1F2F26] border border-[#E5E9E4] dark:border-[#2C3E33]">
            <label className="flex items-center gap-2 cursor-pointer h-full">
              <input
                type="checkbox"
                checked={fastFoodConsumed}
                onChange={e => setFastFoodConsumed(e.target.checked)}
                className="h-4 w-4 rounded-sm text-teal-600 focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-bold block text-[#263D32] dark:text-[#E8F2EA]">
                  {isTelugu ? 'జంక్ ఫుడ్ / షుగర్ తిన్నారా?' : 'Fast Food / High Sugar Day'}
                </span>
                <span className="text-[10px] text-[#526B5C] dark:text-[#A1B8AA]">
                  Inflammatory trigger factor
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Personal Note */}
        <div>
          <label className="block text-xs font-semibold mb-1 text-[#263D32] dark:text-[#E8F2EA]">
            {isTelugu ? 'రోజువారీ వ్యక్తిగత గమనికలు (Notes / Observations):' : 'Daily Journal & Personal Observations:'}
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-[#1A2820] border border-[#E5E9E4] dark:border-[#2C3E33] rounded-xl p-3 text-xs text-[#263D32] dark:text-[#E8F2EA] focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            placeholder={isTelugu ? 'ఈ రోజు అనుభవించిన ప్రత్యేక లక్షణాలు లేదా కారణాలను నమోదు చేయండి...' : 'e.g. Cramping eased after 20-min gentle yoga, noticed mild sweet craving after lunch...'}
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#526B5C] dark:text-[#A1B8AA]">
            {isTelugu ? 'తేదీ:' : 'Date:'} <span className="font-bold text-[#263D32] dark:text-[#E8F2EA]">{selectedDate}</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Database className="h-4 w-4" />
            <span>
              {isSaving
                ? (isTelugu ? 'డేటాబేస్‌లో సేవ్ అవుతోంది...' : 'Saving to Database...')
                : (isTelugu ? 'ఈ రోజు లాగ్ డేటాబేస్‌లో భద్రపరచు' : 'Save Symptom Daily Log to Database')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
