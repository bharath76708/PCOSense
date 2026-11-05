import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Droplets,
  Moon,
  ChevronRight,
  Plus,
  Sparkles,
  Cloud,
  Flame,
  Activity
} from 'lucide-react';
import { useLanguage } from '../translations';
import {
  getDailySymptomLogs,
  saveDailySymptomLog
} from '../services/dailySymptomService';
import { queueSymptomForSync } from '../services/offlineSyncService';
import { playNotificationSound } from '../services/soundService';
import { DailySymptomLog } from '../types';

interface QuickSymptomLogWidgetProps {
  userId?: string;
  onOpenFullModal: () => void;
  onLogSaved?: (newLog: DailySymptomLog) => void;
}

export const QuickSymptomLogWidget: React.FC<QuickSymptomLogWidgetProps> = ({
  userId = 'default-user',
  onOpenFullModal,
  onLogSaved
}) => {
  const { isTelugu } = useLanguage();

  const todayKey = new Date().toISOString().split('T')[0];

  // Quick State values
  const [acne, setAcne] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0);
  const [bloating, setBloating] = useState<number>(0);
  const [pelvicPain, setPelvicPain] = useState<number>(0);
  const [anxiety, setAnxiety] = useState<number>(0);
  const [sugarCravings, setSugarCravings] = useState<number>(0);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [waterGlasses, setWaterGlasses] = useState<number>(6); // ~1.5L default

  const [isSavedToday, setIsSavedToday] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load existing log for today if available
  useEffect(() => {
    const logs = getDailySymptomLogs(userId);
    const todayLog = logs.find(l => l.dateKey === todayKey);
    if (todayLog) {
      setAcne(todayLog.acne || 0);
      setFatigue(todayLog.fatigue || 0);
      setBloating(todayLog.bloating || 0);
      setPelvicPain(todayLog.pelvicPain || 0);
      setAnxiety(todayLog.anxiety || 0);
      setSugarCravings(todayLog.sugarCravings || 0);
      setSleepQuality(todayLog.sleepQuality || 'good');
      setWaterGlasses(Math.round((todayLog.waterIntakeLiters || 1.5) * 4));
      setIsSavedToday(true);
    }
  }, [todayKey, userId]);

  const handleQuickSave = async () => {
    setIsSaving(true);
    const waterLiters = Number((waterGlasses * 0.25).toFixed(2));

    const payload = {
      userId,
      dateKey: todayKey,
      cycleDay: 14,
      menstrualFlow: 'none' as const,
      pelvicPain,
      bloating,
      fatigue,
      acne,
      headaches: 0,
      hirsutismFlare: acne >= 2,
      hairLossNoticed: false,
      moodSwings: anxiety > 0 ? anxiety : 0,
      anxiety,
      brainFog: fatigue >= 3 ? 3 : 1,
      sleepQuality,
      sleepHours: sleepQuality === 'good' || sleepQuality === 'excellent' ? 7.5 : 5.5,
      sugarCravings,
      exerciseMinutes: 20,
      waterIntakeLiters: waterLiters,
      fastFoodConsumed: false,
      notes: isTelugu ? 'త్వరిత లక్షణాల లాగ్ ద్వారా క్లౌడ్ డేటాబేస్‌లో నమోదు చేయబడింది.' : 'Recorded via 1-Tap Quick Symptom Log and synced to Firestore.'
    };

    const saved = saveDailySymptomLog(payload);
    queueSymptomForSync(saved);

    // Audio cue
    playNotificationSound('symptom-logged');

    setIsSavedToday(true);
    setIsSaving(false);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 4000);

    if (onLogSaved) {
      onLogSaved(saved);
    }
  };

  const handleWaterAdd = () => {
    setWaterGlasses(prev => Math.min(16, prev + 1));
    playNotificationSound('tap-click');
  };

  return (
    <div
      id="quick-symptom-log-widget"
      className="relative rounded-3xl bg-white dark:bg-slate-900 border border-teal-500/20 dark:border-teal-800/30 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all text-slate-900 dark:text-slate-100 overflow-hidden"
    >
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Zap className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                {isTelugu ? '1-ట్యాప్ శీఘ్ర లక్షణాల లాగ్' : 'Quick Symptom Log'}
              </h3>
              {isSavedToday ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-700">
                  <CheckCircle2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'క్లౌడ్‌లో సేవ్ చేయబడింది' : 'Saved to Cloud'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <span>{isTelugu ? 'నేటి లాగ్ వేచి ఉంది' : 'Today Pending'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? 'మొటిమలు (Acne), అలసట (Fatigue), కడుపు ఉబ్బరం వంటి నేటి లక్షణాలను త్వరగా నమోదు చేసి Firestore లో భద్రపరచండి.'
                : 'Record daily acne, fatigue, bloating, and pelvic pain to update your real-time Firestore health log.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFullModal}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-3.5 py-2 rounded-xl border border-teal-200 dark:border-teal-800 transition-colors shadow-2xs"
          id="quick-log-open-full-modal-btn"
        >
          <span>{isTelugu ? 'పూర్తి డైలీ ట్రాకర్' : 'Full Daily Tracker'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Symptom Quick-Tap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Acne & Skin Breakouts */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-acne-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-rose-500" />
              <span>{isTelugu ? 'మొటిమలు' : 'Acne'}</span>
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              acne >= 2 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {acne === 0 ? 'Clear' : acne === 1 ? 'Mild' : acne === 2 ? 'Mod' : 'Flare'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(val => (
              <button
                key={val}
                type="button"
                id={`quick-log-acne-${val}`}
                onClick={() => {
                  setAcne(val);
                  playNotificationSound('tap-click');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  acne === val
                    ? 'bg-rose-600 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-600'
                }`}
                title={val === 0 ? 'Clear Skin (0)' : val === 1 ? 'Mild Acne (1)' : val === 2 ? 'Moderate (2)' : 'Severe Breakout (3)'}
              >
                {val === 0 ? '0' : val === 1 ? '1' : val === 2 ? '2' : '3'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Fatigue / Energy */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-fatigue-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Activity className="h-3 w-3 text-amber-500" />
              <span>{isTelugu ? 'అలసట' : 'Fatigue'}</span>
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              fatigue >= 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {fatigue === 0 ? 'Fresh' : fatigue === 1 ? 'Mild' : fatigue === 2 ? 'Tired' : 'High'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 4].map(val => (
              <button
                key={val}
                type="button"
                id={`quick-log-fatigue-${val}`}
                onClick={() => {
                  setFatigue(val);
                  playNotificationSound('tap-click');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  fatigue === val
                    ? 'bg-teal-800 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-600'
                }`}
                title={val === 0 ? 'Energetic / Fresh' : val === 1 ? 'Mild Tiredness' : val === 2 ? 'Fatigued' : 'Exhausted'}
              >
                {val === 0 ? '0' : val === 1 ? '1' : val === 2 ? '2' : '4'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Bloating */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-bloating-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isTelugu ? 'కడుపు ఉబ్బరం' : 'Bloating'}
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              bloating >= 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {bloating === 0 ? 'None' : bloating === 1 ? 'Mild' : bloating === 2 ? 'Mod' : 'High'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 4].map(val => (
              <button
                key={val}
                type="button"
                id={`quick-log-bloating-${val}`}
                onClick={() => {
                  setBloating(val);
                  playNotificationSound('tap-click');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  bloating === val
                    ? 'bg-teal-800 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {val === 0 ? '0' : val === 1 ? '1' : val === 2 ? '2' : '4'}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Pelvic Cramps / Pain */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-pelvic-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isTelugu ? 'కటి నొప్పి' : 'Pelvic Pain'}
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              pelvicPain >= 3 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {pelvicPain === 0 ? 'None' : pelvicPain === 1 ? 'Mild' : pelvicPain === 2 ? 'Mod' : 'Sharp'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 4].map(val => (
              <button
                key={val}
                type="button"
                id={`quick-log-pelvic-${val}`}
                onClick={() => {
                  setPelvicPain(val);
                  playNotificationSound('tap-click');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pelvicPain === val
                    ? 'bg-rose-700 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {val === 0 ? '0' : val === 1 ? '1' : val === 2 ? '2' : '4'}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Mood / Anxiety */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-anxiety-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isTelugu ? 'ఆందోళన / మూడ్' : 'Anxiety / Mood'}
            </span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              anxiety >= 2 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {anxiety === 0 ? 'Calm' : anxiety === 1 ? 'Mild' : anxiety === 2 ? 'Tense' : 'High'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(val => (
              <button
                key={val}
                type="button"
                id={`quick-log-anxiety-${val}`}
                onClick={() => {
                  setAnxiety(val);
                  playNotificationSound('tap-click');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  anxiety === val
                    ? 'bg-purple-700 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {val === 0 ? '0' : val === 1 ? '1' : val === 2 ? '2' : '3'}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Sleep Quality */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between" id="quick-log-sleep-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span>{isTelugu ? 'నిద్ర' : 'Sleep'}</span>
            </span>
            <span className="text-[10px] font-extrabold capitalize bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md">
              {sleepQuality}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['poor', 'fair', 'good'] as const).map(qual => (
              <button
                key={qual}
                type="button"
                id={`quick-log-sleep-${qual}`}
                onClick={() => {
                  setSleepQuality(qual);
                  playNotificationSound('tap-click');
                }}
                className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  sleepQuality === qual
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {qual === 'poor' ? 'Poor' : qual === 'fair' ? 'Fair' : 'Good'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Water Quick Tap & 1-Click Firestore Save */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Rapid Water Intake Counter */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {(waterGlasses * 0.25).toFixed(1)} L
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ({waterGlasses} {isTelugu ? 'గ్లాసులు' : 'glasses'})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleWaterAdd}
            id="quick-log-water-add-btn"
            className="p-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-bold flex items-center gap-0.5 px-2 transition-colors ml-1"
            title="+1 Glass (250ml)"
          >
            <Plus className="h-3 w-3" />
            <span>+250ml</span>
          </button>
        </div>

        {/* Quick Log Action Button with Firestore feedback */}
        <div className="flex items-center gap-2">
          {showSavedFeedback && (
            <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
              <Cloud className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'Firestore లో సేవ్ చేయబడింది!' : 'Saved to Firestore & Local!'}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleQuickSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs active:scale-98 transition-all disabled:opacity-75"
            id="quick-log-save-btn"
          >
            <Zap className="h-3.5 w-3.5 text-teal-200" />
            <span>
              {isSaving
                ? (isTelugu ? 'సేవ్ అవుతోంది...' : 'Saving to Firestore...')
                : isSavedToday
                ? (isTelugu ? 'లాగ్‌ను అప్‌డేట్ చేయండి' : 'Update Quick Log')
                : (isTelugu ? 'నేటి లాగ్ సేవ్ చేయండి' : 'Save Symptoms Log')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

