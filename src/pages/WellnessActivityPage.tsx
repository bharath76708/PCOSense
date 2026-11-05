import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  Flame,
  Clock,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  BellRing,
  BellOff,
  Plus,
  Info,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Dumbbell,
  ShieldCheck,
  Check,
  Zap,
  Target,
  Share2,
  Trash2,
  X,
  Trophy,
  SlidersHorizontal,
  Smile,
  Shield,
  Heart,
  HelpCircle,
  Eye,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useLanguage } from '../translations';
import {
  PCOS_WELLNESS_ROUTINES,
  getStoredYogaLogs,
  logYogaSession,
  deleteYogaLog,
  calculate30DayYogaStats,
  getWellnessReminderSettings,
  saveWellnessReminderSettings,
  triggerWellnessReminderChime,
  getUserFitnessLevel,
  saveUserFitnessLevel,
  getWellnessAchievements
} from '../services/wellnessService';
import {
  WellnessRoutine,
  CompletedYogaLog,
  WellnessReminderSettings,
  RoutineCategory,
  UserFitnessLevel,
  WellnessAchievement
} from '../types';

export const WellnessActivityPage: React.FC = () => {
  const { user } = useAuth();
  const { patientData } = useAssessment();
  const { isTelugu } = useLanguage();

  const userId = user?.id || user?.email || 'local-user';

  // State: Category & Fitness Difficulty Level
  const [selectedCategory, setSelectedCategory] = useState<RoutineCategory | 'all'>('all');
  const [fitnessLevel, setFitnessLevel] = useState<UserFitnessLevel>(() => getUserFitnessLevel(userId));
  
  // State: Routine Details Modal
  const [activeRoutine, setActiveRoutine] = useState<WellnessRoutine | null>(null);

  // State: Quick Log Modal & Post-Workout Metadata
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [routineToLog, setRoutineToLog] = useState<WellnessRoutine | null>(null);
  const [logDuration, setLogDuration] = useState<number>(25);
  const [logRPE, setLogRPE] = useState<number>(4);
  const [logMood, setLogMood] = useState<number>(5);
  const [logPelvicComfort, setLogPelvicComfort] = useState<string>('Pain-free / Relaxed');
  const [logEnergyLevel, setLogEnergyLevel] = useState<string>('Recharged & Calm');
  const [logNotes, setLogNotes] = useState<string>('');

  // Selected Achievement Detail for Inspection
  const [selectedAchievement, setSelectedAchievement] = useState<WellnessAchievement | null>(null);

  // Success Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // History, Stats & Achievements
  const [yogaLogs, setYogaLogs] = useState<CompletedYogaLog[]>(() => getStoredYogaLogs(userId));
  const stats = calculate30DayYogaStats(yogaLogs);
  const achievements = getWellnessAchievements(stats, yogaLogs);

  // Reminder settings state
  const [reminderSettings, setReminderSettings] = useState<WellnessReminderSettings>(() =>
    getWellnessReminderSettings(userId)
  );
  const [isTestingChime, setIsTestingChime] = useState<boolean>(false);

  // Sync Fitness Level Change
  const handleFitnessLevelChange = (level: UserFitnessLevel) => {
    setFitnessLevel(level);
    saveUserFitnessLevel(userId, level);
    setSuccessToast(
      isTelugu
        ? `ఫిట్‌నెస్ స్థాయి "${level}"కి మార్చబడింది. వ్యాయామ వ్యవధి సర్దుబాటు చేయబడింది!`
        : `Difficulty set to "${level}". Intensity and durations dynamically adapted!`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Reminder Toggle
  const handleToggleReminder = async (enabled: boolean) => {
    const updated = { ...reminderSettings, enabled };
    
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          updated.browserNotificationGranted = perm === 'granted';
        } else {
          updated.browserNotificationGranted = true;
        }
      } catch (err) {
        console.warn('Browser notification permission error:', err);
      }
    }

    setReminderSettings(updated);
    saveWellnessReminderSettings(userId, updated);

    setSuccessToast(
      enabled
        ? (isTelugu
            ? `రోజువారీ యోగా రిమైండర్ ${updated.preferredTime} గంటలకు సెట్ చేయబడింది!`
            : `Daily exercise reminder activated for ${updated.preferredTime}!`)
        : (isTelugu ? 'రిమైండర్ ఆపివేయబడింది' : 'Exercise reminder paused')
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleTimeChange = (newTime: string) => {
    const hours = parseInt(newTime.split(':')[0], 10);
    let period: 'Morning' | 'Afternoon' | 'Evening' = 'Morning';
    if (hours >= 12 && hours < 17) period = 'Afternoon';
    else if (hours >= 17) period = 'Evening';

    const updated = { ...reminderSettings, preferredTime: newTime, preferredPeriod: period };
    setReminderSettings(updated);
    saveWellnessReminderSettings(userId, updated);
  };

  const handleTestChime = () => {
    setIsTestingChime(true);
    triggerWellnessReminderChime();
    setTimeout(() => setIsTestingChime(false), 2000);
  };

  // Open Quick Log Modal
  const handleOpenQuickLog = (routine: WellnessRoutine) => {
    setRoutineToLog(routine);
    const variation = routine.difficultyVariations?.[fitnessLevel];
    setLogDuration(variation ? variation.durationMinutes : routine.durationMinutes);
    setLogRPE(fitnessLevel === 'Beginner' ? 3 : fitnessLevel === 'Intermediate' ? 5 : 7);
    setLogMood(5);
    setLogPelvicComfort('Pain-free / Relaxed');
    setLogEnergyLevel('Recharged & Calm');
    setLogNotes('');
    setIsQuickLogOpen(true);
  };

  // Helper for RPE label
  const getRPELabel = (rpe: number) => {
    if (rpe <= 3) return isTelugu ? 'తేలికైన విశ్రాంతి' : 'Light / Restorative';
    if (rpe <= 6) return isTelugu ? 'ఆదర్శ కొవ్వు కరిగించే స్థాయి' : 'Optimal Fat Burn / Moderate';
    if (rpe <= 8) return isTelugu ? 'సవాలుతో కూడినది' : 'Challenging / Active';
    return isTelugu ? 'గరిష్ట శ్రమ' : 'Maximum Exertion';
  };

  // Confirm Quick Log with Rich Metadata
  const handleConfirmQuickLog = () => {
    if (!routineToLog) return;

    const postMeta = {
      exertionRPE: logRPE,
      exertionLabel: getRPELabel(logRPE),
      pelvicComfort: logPelvicComfort,
      energyLevel: logEnergyLevel,
      fitnessLevelLogged: fitnessLevel
    };

    const { logs, newLog } = logYogaSession(
      userId,
      routineToLog,
      logDuration,
      logNotes,
      logMood,
      postMeta
    );

    setYogaLogs(logs);
    setIsQuickLogOpen(false);
    setRoutineToLog(null);

    setSuccessToast(
      isTelugu
        ? `"${routineToLog.titleTe || routineToLog.title}" సెషన్ & ఫీడ్‌బ్యాక్ విజయవంతంగా నమోదయ్యాయి (+${newLog.caloriesBurned} kcal)!`
        : `Quick Log saved for "${routineToLog.title}" (+${newLog.caloriesBurned} kcal burned, RPE ${logRPE}/10)!`
    );
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteLog = (logId: string) => {
    const updated = deleteYogaLog(userId, logId);
    setYogaLogs(updated);
  };

  const filteredRoutines = selectedCategory === 'all'
    ? PCOS_WELLNESS_ROUTINES
    : PCOS_WELLNESS_ROUTINES.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* SUCCESS NOTIFICATION BANNER */}
        {successToast && (
          <div
            id="wellness-success-toast"
            className="fixed bottom-6 right-6 z-50 rounded-2xl bg-teal-900/95 dark:bg-teal-950/95 text-white p-4 shadow-2xl border border-teal-500/50 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold">{successToast}</div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-teal-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* HERO / HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
              <HeartPulse className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'క్లినికల్ PCOS వ్యాయామం & యోగా ప్రోటోకాల్స్' : 'Clinical PCOS Movement & Restorative Yoga'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {isTelugu ? 'ఆరోగ్యం & శారీరక శ్రమ కేంద్రం' : 'Wellness & Movement Routines'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isTelugu
                ? 'PCOS హార్మోన్ల సమతుల్యత, ఇన్సులిన్ సెన్సిటివిటీ పెంపుదల మరియు కార్టిసాల్ నియంత్రణ కోసం రూపొందించిన శాస్త్రీయ యోగాసనాలు మరియు వ్యాయామాలు.'
                : 'Clinically curated, cortisol-conscious workouts and visual posture alignment guides engineered to enhance peripheral insulin GLUT4 transporters without adrenal burnout.'}
            </p>
          </div>

          {/* Quick Metrics Summary Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 z-10">
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                {isTelugu ? '30-రోజుల సెషన్లు' : '30-Day Sessions'}
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalSessions} <span className="text-xs font-normal text-slate-400">/ 30d</span>
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                {isTelugu ? 'కరిగిన కేలరీలు' : 'Total Calories'}
              </span>
              <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                {stats.totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                {isTelugu ? 'నిలకడ రేటు' : 'Consistency'}
              </span>
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
                {stats.consistencyPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DIFFICULTY LEVEL SELECTOR & ADAPTATION BAR */}
        {/* ============================================================ */}
        <div
          id="wellness-difficulty-level-selector"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'ఫిట్‌నెస్ స్థాయి & తీవ్రత ఎంపిక' : 'Personalized Fitness Difficulty Level'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? 'మీ ప్రస్తుత శారీరక సామర్థ్యాన్ని బట్టి వ్యాయామ సమయం, కేలరీలు మరియు ఫ్రీక్వెన్సీని స్వయంచాలకంగా సర్దుబాటు చేయండి.'
                  : 'Adjusts routine durations, weekly frequencies, and intensity guidance based on your metabolic conditioning.'}
              </p>
            </div>

            {/* Segmented Level Selector Pills */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(['Beginner', 'Intermediate', 'Advanced'] as UserFitnessLevel[]).map((level) => {
                const isSelected = fitnessLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleFitnessLevelChange(level)}
                    id={`fitness-level-btn-${level.toLowerCase()}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-800 dark:bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {level === 'Beginner' && (isTelugu ? 'ప్రారంభ (Beginner)' : 'Beginner (Gentle)')}
                    {level === 'Intermediate' && (isTelugu ? 'మధ్యస్థ (Intermediate)' : 'Intermediate (Balanced)')}
                    {level === 'Advanced' && (isTelugu ? 'ఉన్నత (Advanced)' : 'Advanced (Metabolic)')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Clinical Guidance Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className={`p-3.5 rounded-2xl border transition-all ${
              fitnessLevel === 'Beginner'
                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 ring-2 ring-teal-500/20'
                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                <span>Beginner Level</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  15-20 min • 2-3x/wk
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {isTelugu
                  ? 'కటి భాగాన్ని సున్నితంగా సడలించడం మరియు కీళ్లపై అధిక భారం లేకుండా రక్తప్రసరణను మెరుగుపరచడం.'
                  : 'Gentle hormonal priming with supported props, preventing early joint strain or sudden cortisol spikes.'}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border transition-all ${
              fitnessLevel === 'Intermediate'
                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 ring-2 ring-teal-500/20'
                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                <span>Intermediate (Optimal PCOS)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  25-35 min • 3-4x/wk
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {isTelugu
                  ? 'ఇన్సులిన్ రిసెప్టర్లను ప్రేరేపించడానికి మరియు జీవక్రియను సమతుల్యం చేయడానికి అత్యంత అనుకూలమైన స్థాయి.'
                  : 'Balanced GLUT4 non-insulin dependent glucose uptake, activating visceral fat oxidation safely.'}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border transition-all ${
              fitnessLevel === 'Advanced'
                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 ring-2 ring-teal-500/20'
                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-70'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                <span>Advanced Level</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  35-45 min • 4-5x/wk
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {isTelugu
                  ? 'ఎక్కువ నిరోధకత మరియు లోతైన స్థిరీకరణతో కూడిన పూర్తి జీవక్రియ శక్తి సాధన.'
                  : 'Higher metabolic resistance conditioning with strict tempo pacing and deep postural endurance holds.'}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ACHIEVEMENTS & STREAK BADGES SECTION */}
        {/* ============================================================ */}
        <div
          id="wellness-achievements-badges-section"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'స్ట్రీక్ విజయాలు & గౌరవ బ్యాడ్జ్‌లు' : 'Wellness Consistency & Streak Badges'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? '7-రోజుల మరియు 30-రోజుల క్రమబద్ధమైన వ్యాయామ స్ట్రీక్‌లు సాధించి ప్రత్యేక PCOS బ్యాడ్జ్‌లను అన్‌లాక్ చేయండి.'
                  : 'Earn milestone badges for maintaining continuous 7-day or 30-day movement streaks and resetting baseline insulin sensitivity.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} {isTelugu ? 'అన్‌లాక్ అయ్యాయి' : 'Unlocked'}
              </span>
            </div>
          </div>

          {/* Achievement Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((badge) => {
              const isUnlocked = badge.unlocked;
              const percent = Math.round((badge.progress / badge.maxProgress) * 100);

              let iconComp = <Award className="h-6 w-6" />;
              if (badge.iconName === 'flame') iconComp = <Flame className="h-6 w-6" />;
              if (badge.iconName === 'trophy') iconComp = <Trophy className="h-6 w-6" />;
              if (badge.iconName === 'sparkles') iconComp = <Sparkles className="h-6 w-6" />;
              if (badge.iconName === 'zap') iconComp = <Zap className="h-6 w-6" />;
              if (badge.iconName === 'shield') iconComp = <Shield className="h-6 w-6" />;
              if (badge.iconName === 'heart') iconComp = <Heart className="h-6 w-6" />;

              return (
                <div
                  key={badge.id}
                  id={`achievement-badge-${badge.id}`}
                  onClick={() => setSelectedAchievement(badge)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20 border-amber-300/80 dark:border-amber-700/80 shadow-xs hover:border-amber-400'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 opacity-75 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-2xl shrink-0 transition-transform ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 scale-105'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {iconComp}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {isTelugu ? badge.titleTe : badge.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          badge.rarity === 'Diamond'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300'
                            : badge.rarity === 'Gold'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {badge.rarity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isTelugu ? badge.descriptionTe : badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isUnlocked ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                        {isUnlocked ? (isTelugu ? '✓ అన్‌లాక్ చేయబడింది' : '✓ Unlocked') : `${badge.progress} / ${badge.maxProgress}`}
                      </span>
                      <span className="text-slate-400">{percent}%</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked ? 'bg-amber-500' : 'bg-teal-600 dark:bg-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* DAILY NOTIFICATION REMINDER TOGGLE WIDGET */}
        {/* ============================================================ */}
        <div
          id="wellness-notification-reminder-widget"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl transition-colors ${
                reminderSettings.enabled
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {reminderSettings.enabled ? <BellRing className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>{isTelugu ? 'రోజువారీ PCOS వ్యాయామ రిమైండర్ అలర్ట్' : 'Daily Exercise & Yoga Reminder'}</span>
                  {reminderSettings.enabled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                      {isTelugu ? 'సక్రియం' : 'Active'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isTelugu
                    ? 'మీకు అనుకూలమైన సమయంలో రోజూ యోగా మరియు శారీరక వ్యాయామాలు చేయడానికి సున్నితమైన రిమైండర్ పొందండి.'
                    : 'Reminds you to perform your daily hormone-balancing routine at your peak metabolic activity window.'}
                </p>
              </div>
            </div>

            {/* Master Reminder Toggle Switch */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={reminderSettings.enabled}
                onClick={() => handleToggleReminder(!reminderSettings.enabled)}
                id="wellness-reminder-toggle-btn"
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  reminderSettings.enabled ? 'bg-teal-700' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    reminderSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[70px]">
                {reminderSettings.enabled
                  ? (isTelugu ? 'ఆన్‌లో ఉంది' : 'Enabled')
                  : (isTelugu ? 'ఆఫ్‌లో ఉంది' : 'Disabled')}
              </span>
            </div>
          </div>

          {/* Expanded Config Options when Reminder Enabled */}
          {reminderSettings.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in">
              {/* 1. Preferred Time Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'ఇష్టపడే సమయం' : 'Preferred Activity Time'}</span>
                </label>
                <input
                  type="time"
                  value={reminderSettings.preferredTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  id="wellness-time-input"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {isTelugu
                    ? `విభాగం: ${reminderSettings.preferredPeriod}`
                    : `Suggested window: ${reminderSettings.preferredPeriod} (Cortisol optimization)`}
                </span>
              </div>

              {/* 2. Audio Chime & Test */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <span>{isTelugu ? 'శాంతియుత అలర్ట్ సౌండ్' : 'Gentle Chime Alert'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...reminderSettings, soundEnabled: !reminderSettings.soundEnabled };
                        setReminderSettings(updated);
                        saveWellnessReminderSettings(userId, updated);
                      }}
                      className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      {reminderSettings.soundEnabled ? 'Mute' : 'Unmute'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isTelugu ? 'వెబ్ ఆడియో హార్మోనిక్ బెల్' : 'Harmonic Web Audio bell tone'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestChime}
                  disabled={isTestingChime}
                  id="test-wellness-chime-btn"
                  className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isTestingChime ? (isTelugu ? 'రింగింగ్...' : 'Chiming...') : (isTelugu ? 'టెస్ట్ సౌండ్ వినండి' : 'Test Reminder Chime')}</span>
                </button>
              </div>

              {/* 3. Clinical Guidance */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 space-y-1.5">
                <div className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <span>{isTelugu ? 'PCOS సమయ శాస్త్రం' : 'Metabolic Timing Tip'}</span>
                </div>
                <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
                  {isTelugu
                    ? 'ఉదయం 7-8 గంటల మధ్య విశ్రాంతి యోగా ఇన్సులిన్ స్థాయిలను నియంత్రిస్తుంది. సాయంత్రం వేళ పునరుజ్జీవన భంగిమలు కార్టిసాల్‌ను తగ్గిస్తాయి.'
                    : 'Morning movement (7:00–8:30 AM) primes insulin receptors for breakfast. Evening restorative yoga drops cortisol before sleep.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 30-DAY GOAL TRACKING & CONTRIBUTION GRAPH */}
        {/* ============================================================ */}
        <div
          id="yoga-consistency-goal-tracker-card"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? '30-రోజుల యోగా & వ్యాయామ నిలకడ గ్రాఫ్' : '30-Day Yoga & Movement Consistency Graph'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? 'ప్రతి చిన్న సెషన్ మీ PCOS రిస్క్ తగ్గించడంలో సహాయపడుతుంది. మీ 30-రోజుల నిలకడ చార్ట్ క్రింద చూడండి.'
                  : 'Track your daily adherence to hormone-balancing yoga sessions and build long-term metabolic momentum.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenQuickLog(PCOS_WELLNESS_ROUTINES[0])}
                id="quick-log-yoga-session-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="h-4 w-4 text-teal-200" />
                <span>{isTelugu ? 'క్విక్ లాగ్ సెషన్ (+ఫీడ్‌బ్యాక్)' : 'Quick Log Session'}</span>
              </button>
            </div>
          </div>

          {/* 30-Day Contribution Heatmap Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isTelugu ? 'గత 30 రోజుల ట్రాకింగ్' : 'Last 30 Days Activity Matrix'}
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span>{isTelugu ? 'తక్కువ' : 'Less'}</span>
                <span className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                <span className="h-3 w-3 rounded-xs bg-teal-200 dark:bg-teal-900 border border-teal-300 dark:border-teal-700" />
                <span className="h-3 w-3 rounded-xs bg-teal-500 dark:bg-teal-600" />
                <span className="h-3 w-3 rounded-xs bg-teal-800 dark:bg-teal-400" />
                <span>{isTelugu ? 'ఎక్కువ' : 'More'}</span>
              </div>
            </div>

            {/* Matrix Squares (30 days) */}
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-1">
              {stats.dailyGrid.map((day) => {
                const isComplete = day.count > 0;
                let bgClass = 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-400';
                if (day.count === 1) {
                  bgClass = 'bg-teal-200/90 dark:bg-teal-900/80 border-teal-400 dark:border-teal-700 text-teal-900 dark:text-teal-200';
                } else if (day.count === 2) {
                  bgClass = 'bg-teal-500 dark:bg-teal-600 border-teal-600 dark:border-teal-500 text-white font-bold';
                } else if (day.count >= 3) {
                  bgClass = 'bg-teal-800 dark:bg-teal-400 border-teal-900 dark:border-teal-300 text-white dark:text-slate-950 font-extrabold';
                }

                return (
                  <div
                    key={day.dateKey}
                    className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer min-h-[58px] ${bgClass}`}
                    title={`${day.dateDisplay}: ${day.count} session(s) (${day.minutes} mins, ${day.calories} kcal)`}
                  >
                    <span className="text-[10px] font-semibold opacity-70 leading-none mb-1">{day.dayOfWeek}</span>
                    <span className="text-xs font-bold leading-none">{day.dateDisplay.split(' ')[1]}</span>
                    {isComplete && (
                      <span className="text-[9px] font-medium mt-1 leading-none opacity-85">
                        {day.minutes}m
                      </span>
                    )}

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="bg-slate-900 text-white text-[11px] rounded-lg py-1 px-2.5 shadow-xl whitespace-nowrap border border-slate-700">
                        <p className="font-bold">{day.dateDisplay}</p>
                        <p className="text-teal-300">{day.count} {isTelugu ? 'సెషన్(లు)' : 'session(s)'} • {day.minutes} min</p>
                        <p className="text-amber-300">{day.calories} kcal {isTelugu ? 'బర్న్' : 'burned'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Achievement Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-800 text-white font-bold">
                <Flame className="h-5 w-5 text-teal-200" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">
                  {isTelugu ? 'ప్రస్తుత స్ట్రీక్' : 'Active Streak'}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {stats.currentStreak} {isTelugu ? 'రోజులు' : 'Days Running'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-700 text-white font-bold">
                <Clock className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                  {isTelugu ? 'మొత్తం సమయం' : 'Total Movement'}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {stats.totalMinutes} {isTelugu ? 'నిమిషాలు' : 'Minutes'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white font-bold">
                <Award className="h-5 w-5 text-amber-100" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                  {isTelugu ? 'ఉత్తమ రికార్డు' : 'Best Month Streak'}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {stats.bestStreak} {isTelugu ? 'రోజులు' : 'Consecutive Days'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Workout Activity Logs with Exertion & Mood Metadata */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'ఇటీవలి యోగా లాగ్‌లు & పోస్ట్-వర్కౌట్ ఫీడ్‌బ్యాక్' : 'Recent Completed Sessions & Metadata'}</span>
            </h3>

            {yogaLogs.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500">
                {isTelugu ? 'ఇంకా ఎలాంటి సెషన్లు లాగ్ చేయలేదు. క్రింద ఉన్న రొటీన్‌ను ప్రారంభించండి!' : 'No yoga sessions logged yet. Pick a routine below to start!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {yogaLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {log.routineTitle}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{log.dateKey}</span>
                          <span>•</span>
                          <span className="text-teal-700 dark:text-teal-400 font-semibold">{log.durationMinutes}m</span>
                          <span>•</span>
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">{log.caloriesBurned} kcal</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0"
                        title="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Metadata Chips: RPE, Pelvic, Mood */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                      {log.exertionRPE && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                          RPE {log.exertionRPE}/10
                        </span>
                      )}
                      {log.moodRating && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                          {log.moodRating}★ Mood
                        </span>
                      )}
                      {log.pelvicComfort && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                          {log.pelvicComfort}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PCOS-FRIENDLY ROUTINES CATALOG WITH EMBEDDED VIDEO PLAYERS */}
        {/* ============================================================ */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'సిఫార్సు చేయబడిన PCOS రొటీన్‌లు & భంగిమల మార్గదర్శకాలు' : 'Recommended PCOS-Friendly Workouts & Posture Guides'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? 'కార్టిసాల్‌ను పెంచకుండా కొవ్వు కరిగించే & ఇన్సులిన్ సెన్సిటివిటీని పెంచే శాస్త్రీయ వ్యాయామాలు మరియు స్పష్టమైన భంగిమ చిత్రాలు.'
                  : `Adapted for ${fitnessLevel} level. Clear posture guides, alignment cues, and targeted metabolic insights.`}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: isTelugu ? 'అన్నీ' : 'All' },
                { id: 'yoga', label: isTelugu ? 'పునరుజ్జీవన యోగా' : 'Restorative Yoga' },
                { id: 'strength', label: isTelugu ? 'శక్తి శిక్షణ' : 'Resistance' },
                { id: 'low_impact_cardio', label: isTelugu ? 'జోన్-2 ఎరోబిక్స్' : 'Zone-2 Cardio' },
                { id: 'pilates', label: isTelugu ? 'పిలేట్స్' : 'Pilates' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-800 dark:bg-teal-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routine Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutines.map((routine) => {
              // Dynamic variation values based on selected difficulty level
              const variation = routine.difficultyVariations?.[fitnessLevel];
              const displayDuration = variation ? variation.durationMinutes : routine.durationMinutes;
              const displayBurn = variation ? variation.burnKcal : routine.estimatedCaloriesBurn;
              const displayFreq = variation
                ? (isTelugu && variation.frequencyTe ? variation.frequencyTe : variation.frequency)
                : (isTelugu && routine.recommendedFrequencyTe ? routine.recommendedFrequencyTe : routine.recommendedFrequency);
              const displayIntensity = variation ? variation.intensity : routine.intensity;

              return (
                <div
                  key={routine.id}
                  id={`routine-card-${routine.id}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group"
                >
                  {/* Visual Imagery & Posture Artwork Frame */}
                  <div
                    onClick={() => setActiveRoutine(routine)}
                    className="relative h-48 w-full overflow-hidden bg-slate-800 cursor-pointer"
                  >
                    <img
                      src={routine.imageUrl}
                      alt={routine.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                    
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-teal-300 border border-teal-500/30 text-[10px] font-bold">
                      {routine.categoryLabelTe && isTelugu ? routine.categoryLabelTe : routine.categoryLabel}
                    </span>

                    {/* Intensity & Level Pill */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      <span>{displayIntensity}</span>
                      <span className="opacity-60">•</span>
                      <span className="text-teal-300">{fitnessLevel}</span>
                    </span>

                    {/* Posture Guide Quick Hover Pill */}
                    <div className="absolute top-12 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-900/90 backdrop-blur-md text-teal-200 text-[10px] font-bold border border-teal-400/30 shadow-md">
                        <Eye className="h-3 w-3" />
                        <span>{isTelugu ? 'భంగిమ చూడండి' : 'View Posture'}</span>
                      </span>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-2">
                        {routine.titleTe && isTelugu ? routine.titleTe : routine.title}
                      </h3>
                    </div>
                  </div>

                  {/* Routine Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Key Stats Bar (Frequency, Burn, Time) */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                          {isTelugu ? 'వ్యవధి' : 'Duration'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                          {displayDuration}m
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                          {isTelugu ? 'కేలరీ బర్న్' : 'Est. Burn'}
                        </span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                          <Flame className="h-3 w-3" />
                          ~{displayBurn} kcal
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                          {isTelugu ? 'ఫ్రీక్వెన్సీ' : 'Frequency'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate block">
                          {displayFreq}
                        </span>
                      </div>
                    </div>

                    {/* Level Guidance Note */}
                    {variation && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-teal-800 dark:text-teal-300 mr-1">
                          {fitnessLevel} Cue:
                        </span>
                        {isTelugu && variation.guidanceTe ? variation.guidanceTe : variation.guidance}
                      </div>
                    )}

                    {/* Fat Loss & Hormonal Insights */}
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                          <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{isTelugu ? 'కొవ్వు కరిగించే ప్రభావం' : 'Fat Loss & Glucose Insight'}</span>
                        </div>
                        <p className="text-[11px] text-amber-950/80 dark:text-amber-300/80 leading-relaxed">
                          {routine.fatLossInsightTe && isTelugu ? routine.fatLossInsightTe : routine.fatLossInsight}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60">
                        <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{isTelugu ? 'హార్మోన్ల ప్రయోజనం' : 'Hormonal Impact'}</span>
                        </div>
                        <p className="text-[11px] text-teal-950/80 dark:text-teal-300/80 leading-relaxed">
                          {routine.hormonalImpactTe && isTelugu ? routine.hormonalImpactTe : routine.hormonalImpact}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Triggers: Posture Guide & Quick Log */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRoutine(routine)}
                        id={`view-posture-btn-${routine.id}`}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-teal-600/30 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{isTelugu ? 'భంగిమల మార్గదర్శకం' : 'Posture & Step Guide'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenQuickLog(routine)}
                        id={`quick-log-btn-${routine.id}`}
                        className="py-2.5 px-3.5 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1 shrink-0"
                        title="Quick Log completed session"
                      >
                        <Check className="h-4 w-4" />
                        <span>{isTelugu ? 'లాగ్' : 'Log'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL 2: 'QUICK LOG' POST-WORKOUT FEEDBACK MODAL */}
        {/* ============================================================ */}
        {isQuickLogOpen && routineToLog && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsQuickLogOpen(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Post-Workout Feedback & Logging
                  </span>
                  <h3 className="font-extrabold text-slate-950 dark:text-white text-base mt-0.5">
                    {isTelugu ? 'క్విక్ లాగ్: రొటీన్ & పోస్ట్-వర్కౌట్ ఫీడ్‌బ్యాక్' : 'Quick Log: Workout & Feedback'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[320px]">
                    {routineToLog.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsQuickLogOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Actual Duration */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'వ్యవధి (నిమిషాలు)' : 'Actual Duration (Minutes)'}
                  </label>
                  <span className="text-teal-700 dark:text-teal-400 font-bold">
                    ~{Math.round((routineToLog.estimatedCaloriesBurn / routineToLog.durationMinutes) * logDuration)} kcal burned
                  </span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={logDuration}
                  onChange={(e) => setLogDuration(parseInt(e.target.value, 10) || 20)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* 2. Perceived Exertion Level (RPE 1-10) */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{isTelugu ? 'శ్రద్ధ / శ్రమ స్థాయి (RPE 1-10)' : 'Perceived Exertion (RPE Scale)'}</span>
                  </label>
                  <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">
                    RPE {logRPE}/10 ({getRPELabel(logRPE)})
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={logRPE}
                  onChange={(e) => setLogRPE(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />

                <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center pt-1 font-semibold text-slate-500">
                  <span className={`p-1 rounded-md ${logRPE <= 3 ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold' : ''}`}>
                    1-3 Light
                  </span>
                  <span className={`p-1 rounded-md ${logRPE >= 4 && logRPE <= 6 ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold' : ''}`}>
                    4-6 Moderate
                  </span>
                  <span className={`p-1 rounded-md ${logRPE >= 7 && logRPE <= 8 ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold' : ''}`}>
                    7-8 Active
                  </span>
                  <span className={`p-1 rounded-md ${logRPE >= 9 ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold' : ''}`}>
                    9-10 Max
                  </span>
                </div>
              </div>

              {/* 3. Mood Rating (1 to 5) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'సెషన్ తర్వాత మానసిక స్థితి (మూడ్)' : 'Post-Session Mood & Emotion'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: 'Tired / Low' },
                    { val: 2, label: 'Neutral' },
                    { val: 3, label: 'Grounded' },
                    { val: 4, label: 'Balanced' },
                    { val: 5, label: 'Serene' }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setLogMood(m.val)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                        logMood === m.val
                          ? 'bg-teal-800 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-sm font-bold">{m.val}★</span>
                      <span className="text-[9px] truncate w-full">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Pelvic & Symptom Comfort */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'కటి & అండాశయాల సౌకర్యం' : 'Pelvic & Ovarian Comfort Level'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Pain-free / Relaxed',
                    'Mild Bloating Relief',
                    'Tension Released',
                    'Needs More Rest'
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLogPelvicComfort(opt)}
                      className={`p-2 rounded-xl text-left text-[11px] font-semibold transition-all ${
                        logPelvicComfort === opt
                          ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Energy Level State */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'శక్తి స్థాయి (Energy State)' : 'Post-Movement Energy State'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Recharged & Calm',
                    'Metabolically Energized',
                    'Ready for Sleep',
                    'Pleasantly Tired'
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLogEnergyLevel(opt)}
                      className={`p-2 rounded-xl text-left text-[11px] font-semibold transition-all ${
                        logEnergyLevel === opt
                          ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Personal Notes */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'వ్యక్తిగత పరిశీలనలు (ఐచ్ఛికం)' : 'Personal Reflection & Hormone Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g. Felt reduced pelvic pressure, deeper breathing, and zero lower back strain."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {isTelugu ? 'రద్దు చేయి' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQuickLog}
                  id="confirm-quick-log-btn"
                  className="flex-1 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md"
                >
                  {isTelugu ? 'సేవ్ చేయి' : 'Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: VIEW ROUTINE STEPS & POSTURES DETAIL */}
        {/* ============================================================ */}
        {activeRoutine && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveRoutine(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {activeRoutine.categoryLabel} • {fitnessLevel} Adaptation
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                    {activeRoutine.titleTe && isTelugu ? activeRoutine.titleTe : activeRoutine.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeRoutine.durationMinutes} min • ~{activeRoutine.estimatedCaloriesBurn} kcal • {activeRoutine.recommendedFrequency}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRoutine(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* High-Resolution Position Artwork & Alignment Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md">
                <img
                  src={activeRoutine.imageUrl}
                  alt={activeRoutine.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3.5 text-white flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300">
                    {isTelugu ? 'సరైన శరీర భంగిమ & సమతుల్యత' : 'Target Postural Alignment & Form'}
                  </span>
                  <span className="text-[10px] bg-teal-900/80 px-2.5 py-0.5 rounded-full font-bold text-teal-200 border border-teal-500/30">
                    {activeRoutine.intensity} • {fitnessLevel}
                  </span>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'దశలవారీ వ్యాయామ మార్గదర్శకం' : 'Guided Pose Breakdown & Alignment'}
                </h4>

                <div className="space-y-3">
                  {activeRoutine.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-teal-800 text-white text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{step.nameTe && isTelugu ? step.nameTe : step.name}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                          {step.durationMinutes} min
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                        {step.descriptionTe && isTelugu ? step.descriptionTe : step.description}
                      </p>

                      {step.postureTips.length > 0 && (
                        <div className="pl-7 pt-1 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 shrink-0" />
                          <span>Tip: {step.postureTips[0]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveRoutine(null)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  {isTelugu ? 'మూసివేయి' : 'Close'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const r = activeRoutine;
                    setActiveRoutine(null);
                    handleOpenQuickLog(r);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md transition-all text-center"
                >
                  {isTelugu ? 'ఈ రొటీన్ సెషన్‌ను లాగ్ చేయండి' : 'Quick Log Session'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 4: ACHIEVEMENT BADGE DETAIL MODAL */}
        {/* ============================================================ */}
        {selectedAchievement && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedAchievement(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto h-16 w-16 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                <Trophy className="h-8 w-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {selectedAchievement.badgeCategory.toUpperCase()} BADGE • {selectedAchievement.rarity}
                </span>
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">
                  {isTelugu ? selectedAchievement.titleTe : selectedAchievement.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isTelugu ? selectedAchievement.descriptionTe : selectedAchievement.description}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between font-bold mb-1">
                  <span>Current Milestone Progress</span>
                  <span className="text-teal-700 dark:text-teal-400">
                    {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.round((selectedAchievement.progress / selectedAchievement.maxProgress) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
