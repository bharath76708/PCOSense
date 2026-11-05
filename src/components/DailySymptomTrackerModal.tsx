import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Activity,
  Heart,
  Moon,
  Sparkles,
  Coffee,
  Droplets,
  Flame,
  CheckCircle2,
  X,
  Plus,
  AlertCircle,
  HelpCircle,
  Clock,
  Mic,
  MicOff,
  Radio,
  Wand2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { DailySymptomLog } from '../types';
import { saveDailySymptomLog, calculateSymptomScores } from '../services/dailySymptomService';
import { queueSymptomForSync } from '../services/offlineSyncService';
import { playNotificationSound } from '../services/soundService';

interface DailySymptomTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (log: DailySymptomLog) => void;
}

export const DailySymptomTrackerModal: React.FC<DailySymptomTrackerModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { user } = useAuth();
  const { t, isTelugu } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  const [dateKey, setDateKey] = useState<string>(todayStr);
  const [cycleDay, setCycleDay] = useState<number>(14);
  const [menstrualFlow, setMenstrualFlow] = useState<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>('none');
  
  // Physical ratings (0-5)
  const [pelvicPain, setPelvicPain] = useState<number>(1);
  const [bloating, setBloating] = useState<number>(2);
  const [fatigue, setFatigue] = useState<number>(2);
  const [acne, setAcne] = useState<number>(1);
  const [headaches, setHeadaches] = useState<number>(0);
  const [hirsutismFlare, setHirsutismFlare] = useState<boolean>(false);
  const [hairLossNoticed, setHairLossNoticed] = useState<boolean>(false);

  // Emotional ratings (0-5)
  const [moodSwings, setMoodSwings] = useState<number>(1);
  const [anxiety, setAnxiety] = useState<number>(1);
  const [brainFog, setBrainFog] = useState<number>(1);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sugarCravings, setSugarCravings] = useState<number>(2);

  // Lifestyle
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(30);
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number>(2.2);
  const [fastFoodConsumed, setFastFoodConsumed] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Voice-to-Text State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [detectedSymptoms, setDetectedSymptoms] = useState<{ label: string; key: string; value: any }[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Analyze text for voice-extracted clinical symptom keywords
  const analyzeVoiceForSymptoms = (transcript: string) => {
    const lower = transcript.toLowerCase();
    const detected: { label: string; key: string; value: any }[] = [];

    if (lower.includes('severe cramp') || lower.includes('heavy pelvic') || lower.includes('bad pelvic pain') || lower.includes('కటి నొప్పి')) {
      detected.push({ label: 'Pelvic Pain -> 4/5', key: 'pelvicPain', value: 4 });
    } else if (lower.includes('cramp') || lower.includes('pain') || lower.includes('నొప్పి')) {
      detected.push({ label: 'Pelvic Pain -> 3/5', key: 'pelvicPain', value: 3 });
    }

    if (lower.includes('severe bloat') || lower.includes('very bloated') || lower.includes('కడుపు ఉబ్బరం')) {
      detected.push({ label: 'Bloating -> 4/5', key: 'bloating', value: 4 });
    } else if (lower.includes('bloat') || lower.includes('gassy')) {
      detected.push({ label: 'Bloating -> 3/5', key: 'bloating', value: 3 });
    }

    if (lower.includes('exhausted') || lower.includes('very tired') || lower.includes('severe fatigue') || lower.includes('అలసట')) {
      detected.push({ label: 'Fatigue -> 4/5', key: 'fatigue', value: 4 });
    } else if (lower.includes('fatigue') || lower.includes('tired') || lower.includes('low energy')) {
      detected.push({ label: 'Fatigue -> 3/5', key: 'fatigue', value: 3 });
    }

    if (lower.includes('breakout') || lower.includes('pimples') || lower.includes('acne') || lower.includes('మొటిమలు')) {
      detected.push({ label: 'Acne Breakout -> 3/5', key: 'acne', value: 3 });
    }

    if (lower.includes('headache') || lower.includes('migraine') || lower.includes('తలనొప్పి')) {
      detected.push({ label: 'Headache -> 3/5', key: 'headaches', value: 3 });
    }

    if (lower.includes('anxious') || lower.includes('stress') || lower.includes('anxiety') || lower.includes('ఆందోళన')) {
      detected.push({ label: 'Anxiety -> 3/5', key: 'anxiety', value: 3 });
    }

    if (lower.includes('mood swing') || lower.includes('irritable') || lower.includes('మూడ్')) {
      detected.push({ label: 'Mood Swings -> 3/5', key: 'moodSwings', value: 3 });
    }

    if (lower.includes('brain fog') || lower.includes('foggy') || lower.includes('unfocused')) {
      detected.push({ label: 'Brain Fog -> 3/5', key: 'brainFog', value: 3 });
    }

    if (lower.includes('sugar craving') || lower.includes('craving sweets') || lower.includes('chocolate craving') || lower.includes('తీపి')) {
      detected.push({ label: 'Sugar Cravings -> 4/5', key: 'sugarCravings', value: 4 });
    }

    if (lower.includes('facial hair') || lower.includes('chin hair') || lower.includes('hirsutism')) {
      detected.push({ label: 'Facial Hair Flare -> Yes', key: 'hirsutismFlare', value: true });
    }

    if (lower.includes('hair loss') || lower.includes('hair thinning') || lower.includes('shedding') || lower.includes('జుట్టు రాలడం')) {
      detected.push({ label: 'Hair Loss -> Yes', key: 'hairLossNoticed', value: true });
    }

    setDetectedSymptoms(detected);
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. You can type notes directly.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    try {
      setSpeechError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isTelugu ? 'te-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setNotes(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            const updated = prev + separator + currentTranscript.trim();
            analyzeVoiceForSymptoms(updated);
            return updated;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start voice recognition:', err);
      setSpeechError(err.message || 'Could not access microphone.');
      setIsRecording(false);
    }
  };

  const handleApplyDetectedSymptoms = () => {
    detectedSymptoms.forEach(item => {
      switch (item.key) {
        case 'pelvicPain': setPelvicPain(item.value); break;
        case 'bloating': setBloating(item.value); break;
        case 'fatigue': setFatigue(item.value); break;
        case 'acne': setAcne(item.value); break;
        case 'headaches': setHeadaches(item.value); break;
        case 'anxiety': setAnxiety(item.value); break;
        case 'moodSwings': setMoodSwings(item.value); break;
        case 'brainFog': setBrainFog(item.value); break;
        case 'sugarCravings': setSugarCravings(item.value); break;
        case 'hirsutismFlare': setHirsutismFlare(item.value); break;
        case 'hairLossNoticed': setHairLossNoticed(item.value); break;
      }
    });
    setDetectedSymptoms([]);
  };

  if (!isOpen) return null;


  // Live preview scores
  const liveScores = calculateSymptomScores({
    pelvicPain,
    bloating,
    fatigue,
    acne,
    headaches,
    hirsutismFlare,
    hairLossNoticed,
    moodSwings,
    anxiety,
    brainFog,
    sleepQuality,
    sugarCravings
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLog = saveDailySymptomLog({
      userId: user?.id,
      dateKey,
      pelvicPain,
      bloating,
      fatigue,
      acne,
      headaches,
      hirsutismFlare,
      hairLossNoticed,
      moodSwings,
      anxiety,
      brainFog,
      sleepQuality,
      sleepHours,
      sugarCravings,
      menstrualFlow,
      cycleDay,
      exerciseMinutes,
      waterIntakeLiters,
      fastFoodConsumed,
      notes: notes.trim() || undefined
    });

    queueSymptomForSync(newLog);
    playNotificationSound('symptom-logged');

    setSavedSuccess(true);
    setIsSubmitting(false);

    if (onSaved) {
      onSaved(newLog);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const renderRatingButtons = (
    label: string,
    value: number,
    setter: (v: number) => void,
    minLabel = 'None (0)',
    maxLabel = 'Severe (5)'
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200">{label}</span>
        <span className="font-extrabold text-teal-700 dark:text-teal-400">{value} / 5</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {[0, 1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => setter(rating)}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
              value === rating
                ? 'bg-teal-800 dark:bg-teal-700 text-white shadow-xs scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-symptom-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="h-5 w-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="daily-symptom-title" className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'రోజువారీ లక్షణాల త్వరిత నమోదు' : 'Quick Daily Symptom Check-In'}
                </h2>
                <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                  {isTelugu ? '1 నిమిషం లాగ్' : '1-Min Quick Log'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu 
                  ? 'పూర్తి స్క్రీనింగ్ చేయకుండానే శారీరక, మానసిక లక్షణాలను నమోదు చేయండి.'
                  : 'Log physical and emotional markers quickly to track longitudinal symptom trends.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-400 focus:outline-none"
            aria-label="Close check-in"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Score Banner */}
        <div className="px-6 py-3 bg-teal-50/70 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-950 dark:text-teal-200">
              {isTelugu ? 'నేటి లక్షణ తీవ్రత సూచిక:' : 'Today’s Calculated Symptom Load:'}
            </span>
            <span className={`font-black px-2 py-0.5 rounded-md ${
              liveScores.overallSeverityScore < 30
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                : liveScores.overallSeverityScore < 60
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
            }`}>
              {liveScores.overallSeverityScore}/100 ({liveScores.overallSeverityScore < 30 ? 'Low' : liveScores.overallSeverityScore < 60 ? 'Moderate' : 'Elevated'})
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-teal-900 dark:text-teal-300 font-semibold">
            <span>Physical: <strong>{liveScores.physicalScore}/100</strong></span>
            <span>Emotional: <strong>{liveScores.emotionalScore}/100</strong></span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Date & Cycle Day */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTelugu ? 'తేదీ' : 'Log Date'}
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTelugu ? 'ఋతు చక్రం రోజు' : 'Cycle Day (e.g. Day 14)'}
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTelugu ? 'రక్తస్రావం స్థితి' : 'Menstrual Flow'}
              </label>
              <select
                value={menstrualFlow}
                onChange={(e) => setMenstrualFlow(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="none">None / Clear</option>
                <option value="spotting">Spotting</option>
                <option value="light">Light Flow</option>
                <option value="medium">Medium Flow</option>
                <option value="heavy">Heavy Flow</option>
              </select>
            </div>
          </div>

          {/* Section 1: Physical Symptoms */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'శారీరక లక్షణాలు (0-5)' : 'Physical Symptoms (0 = None, 5 = Severe)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderRatingButtons(isTelugu ? 'కటి నొప్పి / తిమ్మిరి (Pelvic Pain)' : 'Pelvic / Abdominal Cramps', pelvicPain, setPelvicPain)}
              {renderRatingButtons(isTelugu ? 'కడుపు ఉబ్బరం (Bloating)' : 'Abdominal Bloating', bloating, setBloating)}
              {renderRatingButtons(isTelugu ? 'నీరసం / అలసట (Fatigue)' : 'Fatigue / Low Energy', fatigue, setFatigue)}
              {renderRatingButtons(isTelugu ? 'మొటిమలు (Acne / Breakouts)' : 'Acne / Breakouts', acne, setAcne)}
              {renderRatingButtons(isTelugu ? 'తలనొప్పి (Headaches)' : 'Headaches / Migraines', headaches, setHeadaches)}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hirsutismFlare}
                  onChange={(e) => setHirsutismFlare(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-400"
                />
                <span>{isTelugu ? 'ముఖంపై అదనపు వెంట్రుకల పెరుగుదల' : 'Facial / Body Hair Flare'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hairLossNoticed}
                  onChange={(e) => setHairLossNoticed(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-400"
                />
                <span>{isTelugu ? 'జుట్టు రాలడం కనిపించింది' : 'Hair Thinning / Shedding'}</span>
              </label>
            </div>
          </div>

          {/* Section 2: Emotional & Sleep Symptoms */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>{isTelugu ? 'మానసిక & నిద్ర సూచికలు' : 'Emotional, Mood & Sleep Markers'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderRatingButtons(isTelugu ? 'మూడ్ స్వింగ్స్ (Mood Swings)' : 'Mood Swings / Irritability', moodSwings, setMoodSwings)}
              {renderRatingButtons(isTelugu ? 'ఆందోళన / ఒత్తిడి (Anxiety)' : 'Anxiety / Mental Stress', anxiety, setAnxiety)}
              {renderRatingButtons(isTelugu ? 'మెంటల్ ఫాగ్ (Brain Fog)' : 'Brain Fog / Difficulty Focusing', brainFog, setBrainFog)}
              {renderRatingButtons(isTelugu ? 'తీపి కోరికలు (Sugar Cravings)' : 'Sugar / Carb Cravings', sugarCravings, setSugarCravings)}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isTelugu ? 'నిద్ర నాణ్యత' : 'Sleep Quality'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'poor', label: 'Poor' },
                    { id: 'fair', label: 'Fair' },
                    { id: 'good', label: 'Good' },
                    { id: 'excellent', label: 'Great' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSleepQuality(s.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        sleepQuality === s.id
                          ? 'bg-teal-800 dark:bg-teal-700 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isTelugu ? 'నిద్ర గంటలు' : 'Sleep Duration (Hours)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="16"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTelugu ? 'వ్యాయామం (నిమిషాలు)' : 'Exercise (Minutes)'}
              </label>
              <input
                type="number"
                min="0"
                max="300"
                step="5"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isTelugu ? 'నీరు (లీటర్లు)' : 'Water Intake (Liters)'}
              </label>
              <input
                type="number"
                min="0.5"
                max="8.0"
                step="0.1"
                value={waterIntakeLiters}
                onChange={(e) => setWaterIntakeLiters(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isTelugu ? 'ఫాస్ట్ ఫుడ్ తిన్నారా?' : 'Fast Food / High Sugar?'}
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastFoodConsumed}
                  onChange={(e) => setFastFoodConsumed(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-400"
                />
                <span className="font-semibold">{fastFoodConsumed ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'లేదు' : 'No')}</span>
              </label>
            </div>
          </div>

          {/* Clinical Freeform Notes with Hands-Free Voice-to-Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isTelugu ? 'వ్యక్తిగత గమనికలు / లక్షణాల వివరణ' : 'Daily Symptom Notes & Hands-Free Dictation'}
              </label>

              {/* Voice-to-Text Trigger */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                    : 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900 shadow-2xs'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Voice Dictation'}
                id="voice-dictation-btn"
              >
                {isRecording ? (
                  <>
                    <Radio className="h-3.5 w-3.5 text-white animate-spin" />
                    <span>{isTelugu ? 'రికార్డింగ్ అవుతోంది (ఆపండి)' : 'Listening... (Tap to Stop)'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                    <span>{isTelugu ? 'వాయిస్ ద్వారా నమోదు చేయండి' : 'Voice-to-Text Dictation'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Recording Audio Visualizer Wave */}
            {isRecording && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 items-end h-5">
                    <div className="w-1 bg-rose-500 rounded-full animate-bounce h-3" />
                    <div className="w-1 bg-rose-500 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 bg-rose-500 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
                    <div className="w-1 bg-rose-500 rounded-full animate-bounce h-4" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    {isTelugu
                      ? 'స్పష్టంగా మాట్లాడండి (లక్షణాలు, నొప్పి లేదా అలసటను వివరించండి)...'
                      : 'Speak naturally (e.g., "Having bad cramps, high bloating, feeling very tired")...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-600 text-white"
                >
                  Done
                </button>
              </div>
            )}

            {/* Error banner if microphone access fails */}
            {speechError && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{speechError}</span>
              </div>
            )}

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                analyzeVoiceForSymptoms(e.target.value);
              }}
              placeholder={isTelugu ? 'ఉదా. రాత్రి వేళ అదనపు తిమ్మిరి, తక్కువ నీరు తాగడం...' : 'e.g., Felt ovulatory twinge, high stress at work, benefited from peppermint tea...'}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />

            {/* Smart Extracted Symptoms Suggestion Banner */}
            {detectedSymptoms.length > 0 && (
              <div className="p-3 rounded-2xl bg-teal-50/90 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-950 dark:text-teal-200">
                    <Wand2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{isTelugu ? 'వాయిస్ ద్వారా గుర్తించిన లక్షణాలు:' : 'Voice-Detected Symptoms:'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {detectedSymptoms.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyDetectedSymptoms}
                  className="text-xs font-bold px-3 py-1 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-teal-300" />
                  <span>{isTelugu ? 'రేటింగ్‌లకు వర్తింపజేయండి' : 'Apply Detected Ratings'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isTelugu ? 'రద్దు చేయండి' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || savedSuccess}
              className="px-6 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>{isTelugu ? 'సేవ్ చేయబడింది!' : 'Logged Successfully!'}</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{isTelugu ? 'నేటి లాగ్ సేవ్ చేయండి' : 'Save Daily Check-In'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
