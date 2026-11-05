import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Utensils,
  ChevronDown,
  Flame,
  Clock
} from 'lucide-react';
import { RecipeItem, DailyDietPlan } from '../types';
import { useLanguage } from '../translations';

export interface CookingTimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  stepLabel: string;
  recipeName?: string;
}

interface CookingTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
  initialLabel?: string;
  initialRecipeName?: string;
  currentDayPlan?: DailyDietPlan;
}

// Synthesize pleasant acoustic chime using Web Audio API
export function playCookingChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play a friendly arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + idx * 0.16;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
}

export const CookingTimerModal: React.FC<CookingTimerModalProps> = ({
  isOpen,
  onClose,
  initialSeconds = 900, // 15 mins default
  initialLabel = 'Millet Simmering & Cooking',
  initialRecipeName = 'PCOS Meal Prep',
  currentDayPlan
}) => {
  const { isTelugu } = useLanguage();

  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [stepLabel, setStepLabel] = useState<string>(initialLabel);
  const [recipeName, setRecipeName] = useState<string>(initialRecipeName);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('15');

  const timerRef = useRef<number | null>(null);

  // Update when initial props change
  useEffect(() => {
    if (initialSeconds && initialSeconds > 0) {
      setTotalSeconds(initialSeconds);
      setRemainingSeconds(initialSeconds);
      setIsRunning(false);
      setIsFinished(false);
    }
    if (initialLabel) setStepLabel(initialLabel);
    if (initialRecipeName) setRecipeName(initialRecipeName);
  }, [initialSeconds, initialLabel, initialRecipeName]);

  // Request browser notifications if available
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Timer Tick effect
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            if (!isMuted) {
              playCookingChime();
            }
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('🍳 PCOSense Cooking Alert!', {
                  body: `${stepLabel} for ${recipeName} is finished and ready!`,
                  icon: '/favicon.ico'
                });
              } catch (e) {
                console.warn('Notification error:', e);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remainingSeconds, isMuted, stepLabel, recipeName]);

  const handleStartPause = () => {
    if (isFinished) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(prev => !prev);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setIsFinished(false);
  };

  const handleAddMinutes = (mins: number) => {
    const addSecs = mins * 60;
    setTotalSeconds(prev => prev + addSecs);
    setRemainingSeconds(prev => prev + addSecs);
    setIsFinished(false);
  };

  const handleSelectPreset = (seconds: number, label: string) => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setStepLabel(label);
  };

  const handleSelectMeal = (recipe: RecipeItem, type: 'prep' | 'cook') => {
    const mins = type === 'prep' ? recipe.prepTimeMinutes : recipe.cookTimeMinutes;
    const secs = (mins || 15) * 60;
    const label = type === 'prep'
      ? `${isTelugu ? 'తయారీ (Prep):' : 'Prep:'} ${recipe.name}`
      : `${isTelugu ? 'వండటం (Cook):' : 'Cook:'} ${recipe.name}`;
    
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setStepLabel(label);
    setRecipeName(recipe.name);
  };

  const handleApplyCustomMinutes = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      const secs = mins * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      setIsRunning(false);
      setIsFinished(false);
      setStepLabel(`${mins}m Custom Cooking Step`);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = totalSeconds > 0 ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100) : 0;

  if (!isOpen && !isRunning) return null;

  // Floating Minimized Bar when running or explicitly minimized
  if (isMinimized || (!isOpen && isRunning)) {
    return (
      <div
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 px-4 rounded-2xl shadow-2xl border border-teal-500/50 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
        id="cooking-timer-minimized-pill"
      >
        <div className="relative flex items-center justify-center">
          <Timer className={`h-5 w-5 ${isRunning ? 'text-teal-400 animate-pulse' : 'text-slate-400'}`} />
          {isFinished && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-teal-300">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[140px]">
              {stepLabel}
            </span>
          </div>
          <div className="w-28 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isFinished ? 'bg-rose-500' : 'bg-teal-400'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={handleStartPause}
            className="p-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-xs"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              // ensure open
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            title="Expand Timer"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Modal
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cooking-timer-title"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="cooking-timer-modal-container"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900/10 via-slate-50 to-slate-100 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {isTelugu ? 'వంట హెచ్చరిక టైమర్' : 'Anti-PCOS Kitchen Assistant'}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Audio Alert
                </span>
              </div>
              <h3 id="cooking-timer-title" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? 'వంట మరియు ప్రిపరేషన్ టైమర్' : 'Cooking & Prep Alert Timer'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-teal-600" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Minimize to floating widget"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Digital Clock Display */}
          <div className={`p-6 rounded-3xl border text-center transition-all ${
            isFinished
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 animate-pulse'
              : isRunning
              ? 'bg-gradient-to-b from-teal-50/70 to-white dark:from-teal-950/30 dark:to-slate-900 border-teal-300 dark:border-teal-800 shadow-md shadow-teal-500/5'
              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
              {recipeName}
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm mx-auto mb-4">
              {stepLabel}
            </div>

            {/* Time String */}
            <div className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatTime(remainingSeconds)}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFinished ? 'bg-rose-500' : 'bg-teal-600'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {isFinished ? (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <Bell className="h-4 w-4 animate-bounce" />
                <span>{isTelugu ? 'సమయం ముగిసింది! వంటకం సిద్ధమైంది.' : 'Time is Up! Step is Ready.'}</span>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-slate-400 font-semibold">
                {progressPct}% {isTelugu ? 'పూర్తయింది' : 'Completed'}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleStartPause}
                className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/30'
                }`}
                id="cooking-timer-play-btn"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>{isTelugu ? 'పాజ్ చేయండి' : 'Pause Timer'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>{isFinished ? (isTelugu ? 'మళ్ళీ ప్రారంభించండి' : 'Restart') : (isTelugu ? 'ప్రారంభించండి' : 'Start Timer')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => handleAddMinutes(1)}
                className="px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                title="Add 1 minute"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>1m</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddMinutes(5)}
                className="px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                title="Add 5 minutes"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>5m</span>
              </button>
            </div>
          </div>

          {/* Quick Step Presets */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              ⚡ {isTelugu ? 'త్వరిత వంట దశల ప్రీసెట్లు:' : 'Common Cooking Step Presets:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(180, isTelugu ? 'మూలికా టీ తయారీ' : 'Herbal Tea / Infusion')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">3 min</span>
                <span className="text-[10px] text-slate-500">Herbal Tea / Soaking</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(300, isTelugu ? 'కూరగాయలు ఆవిరి పట్టడం' : 'Steaming Broccoli & Veggies')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">5 min</span>
                <span className="text-[10px] text-slate-500">Steaming & Blanching</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(600, isTelugu ? 'పోపు / వేయించడం' : 'Tadka / Gentle Sautéing')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">10 min</span>
                <span className="text-[10px] text-slate-500">Sauté & Dressing</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(900, isTelugu ? 'చిరుధాన్యాలు ఉడికించడం' : 'Millet / Quinoa Boiling')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">15 min</span>
                <span className="text-[10px] text-slate-500">Millet & Lentil Simmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(1200, isTelugu ? 'ఓవెన్ బేకింగ్ / నెమ్మదిగా ఉడకబెట్టడం' : 'Baking / Slow Cooking')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">20 min</span>
                <span className="text-[10px] text-slate-500">Roasting / Dal Boil</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(1800, isTelugu ? 'మొత్తం భోజనం ప్రిపరేషన్' : 'Full Meal Prep & Marinating')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 text-left text-xs transition-colors"
              >
                <span className="font-bold text-slate-900 dark:text-white block">30 min</span>
                <span className="text-[10px] text-slate-500">Complete Prep Block</span>
              </button>
            </div>
          </div>

          {/* Sync with Current Day's Meals */}
          {currentDayPlan && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                🍳 {isTelugu ? 'ఈ రోజు వంటకాల నుండి ఎంచుకోండి:' : 'Load from Today’s Meal Plan:'}
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(Object.entries(currentDayPlan.meals) as [string, RecipeItem][]).map(([slotKey, rec]) => {
                  if (!rec) return null;
                  return (
                    <div
                      key={slotKey}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {rec.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Prep: {rec.prepTimeMinutes}m • Cook: {rec.cookTimeMinutes}m
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectMeal(rec, 'prep')}
                          className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 text-[10px] font-bold border border-teal-200 dark:border-teal-800"
                        >
                          {rec.prepTimeMinutes}m Prep
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectMeal(rec, 'cook')}
                          className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 text-[10px] font-bold border border-amber-200 dark:border-amber-800"
                        >
                          {rec.cookTimeMinutes}m Cook
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Minute Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              {isTelugu ? 'కస్టమ్ సమయం (నిమిషాలు):' : 'Custom Duration (minutes):'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={e => setCustomMinutesInput(e.target.value)}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center font-bold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleApplyCustomMinutes}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                {isTelugu ? 'సెట్ చేయండి' : 'Set'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>{isTelugu ? 'మల్టీటాస్కింగ్ కోసం మినిమైజ్ చేయవచ్చు' : 'Minimizes safely while you browse'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            {isTelugu ? 'మూసివేయండి' : 'Close Window'}
          </button>
        </div>
      </div>
    </div>
  );
};
