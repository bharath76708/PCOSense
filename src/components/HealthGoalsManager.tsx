import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Droplets,
  Footprints,
  Apple,
  Moon,
  Heart,
  Pill,
  Calendar,
  Trophy,
  Zap,
  TrendingUp,
  X,
  ChevronRight,
  Info,
  Check,
  RotateCcw,
  Sparkle,
  PartyPopper,
  Bell,
  Clock,
  Settings,
  AlertCircle,
  Volume2
} from 'lucide-react';

export interface HealthGoal {
  id: string;
  title: string;
  category: 'hydration' | 'movement' | 'nutrition' | 'sleep' | 'mindset' | 'supplements';
  dailyTarget: string;
  pcosBenefit: string;
  isCustom?: boolean;
  createdAt: string;
}

export interface DailyGoalLogs {
  [dateStr: string]: string[]; // Array of completed goal IDs for that date
}

export function calculateHabitStreak(dailyLogs: DailyGoalLogs): number {
  if (!dailyLogs || typeof dailyLogs !== 'object') return 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const logged = dailyLogs[dateKey];
    if (logged && Array.isArray(logged) && logged.length > 0) {
      streak++;
    } else {
      if (i === 0) continue; // If today hasn't been logged yet, give grace period for yesterday
      break;
    }
  }
  return streak;
}

export function getStoredUserStreak(userId: string = 'default'): number {
  try {
    const storageLogsKey = `pcosense_health_goals_logs_${userId}`;
    const saved = localStorage.getItem(storageLogsKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      return calculateHabitStreak(parsed);
    }
  } catch {
    // ignore
  }
  return 0;
}

const DEFAULT_PRESET_GOALS: HealthGoal[] = [
  {
    id: 'goal-hydration',
    title: 'Stay Hydrated (2.5L Water)',
    category: 'hydration',
    dailyTarget: 'Drink 8 to 10 glasses of filtered water throughout the day',
    pcosBenefit: 'Supports hepatic estrogen & androgen clearance and mitigates pseudo-hunger.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-daily-walk',
    title: 'Daily Post-Meal Walk (15 min)',
    category: 'movement',
    dailyTarget: 'Take a brisk or leisurely 10-15 min stroll after lunch or dinner',
    pcosBenefit: 'Activates non-insulin dependent GLUT4 glucose uptake in skeletal muscle.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-protein-fiber-first',
    title: 'Fiber & Protein Before Carbs',
    category: 'nutrition',
    dailyTarget: 'Sequence meals by eating greens/protein first before starches',
    pcosBenefit: 'Significantly blunts postprandial glucose and insulin spikes by up to 35%.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-spearmint-tea',
    title: 'Spearmint Tea (1-2 Cups)',
    category: 'supplements',
    dailyTarget: 'Brew 1-2 warm mugs of pure spearmint tea in afternoon/evening',
    pcosBenefit: 'Clinical trials demonstrate mild anti-androgenic effects to curb hirsutism.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-sleep-circadian',
    title: '7-8 Hours Restful Sleep',
    category: 'sleep',
    dailyTarget: 'Unwind 45 min before bed; dark, cool bedroom environment',
    pcosBenefit: 'Prevents morning cortisol spikes and restores nocturnal insulin sensitivity.',
    createdAt: new Date().toISOString()
  }
];

const SUGGESTED_TEMPLATES: Omit<HealthGoal, 'id' | 'createdAt'>[] = [
  {
    title: 'Morning Sunlight & Box Breathing',
    category: 'mindset',
    dailyTarget: '10 min of morning natural light + 4x4 box breathing reset',
    pcosBenefit: 'Synchronizes circadian SCN clock and dampens sympathetic adrenal stress.'
  },
  {
    title: 'Take Inositol / Daily Supplements',
    category: 'supplements',
    dailyTarget: 'Take morning & evening 40:1 Myo/D-Chiro Inositol or prescribed vitamins',
    pcosBenefit: 'Facilitates cellular second-messenger insulin signaling and ovarian follicular health.'
  },
  {
    title: 'Strength / Resistance Training',
    category: 'movement',
    dailyTarget: '20 min bodyweight or dumbbell circuit (squats, push-ups, glute bridges)',
    pcosBenefit: 'Increases resting metabolic rate and peripheral glucose clearance capacity.'
  },
  {
    title: 'Magnesium-Rich Dinner Whole Foods',
    category: 'nutrition',
    dailyTarget: 'Include pumpkin seeds, dark leafy greens, or dark chocolate with dinner',
    pcosBenefit: 'Acts as essential cofactor for insulin receptor tyrosine kinase phosphorylation.'
  },
  {
    title: 'Zero Sugary Beverages Today',
    category: 'nutrition',
    dailyTarget: 'Replace soda, juices, and sweetened coffees with infused water or herbal tea',
    pcosBenefit: 'Prevents acute hepatic de novo lipogenesis and large insulin surges.'
  }
];

interface HealthGoalsManagerProps {
  userId?: string;
  currentRiskScore?: number;
  currentRiskLevel?: string;
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

export const HealthGoalsManager: React.FC<HealthGoalsManagerProps> = ({
  userId = 'default',
  currentRiskScore = 35,
  currentRiskLevel = 'Moderate',
  onAskAI,
  isDark = false
}) => {
  const storageGoalsKey = `pcosense_health_goals_list_${userId}`;
  const storageLogsKey = `pcosense_health_goals_logs_${userId}`;

  // State: List of active health goals
  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    try {
      const saved = localStorage.getItem(storageGoalsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_PRESET_GOALS;
  });

  // State: Daily completion logs { '2026-08-21': ['goal-hydration', ...] }
  const [dailyLogs, setDailyLogs] = useState<DailyGoalLogs>(() => {
    try {
      const saved = localStorage.getItem(storageLogsKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Form State for creating custom goal
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<string>('');
  const [customBenefit, setCustomBenefit] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<HealthGoal['category']>('movement');
  const [showPresetsMenu, setShowPresetsMenu] = useState<boolean>(false);

  // Celebration state & previous count reference for detecting milestone completion
  const [showCelebrationToast, setShowCelebrationToast] = useState<boolean>(false);
  const hasTriggeredInitialCelebration = useRef<boolean>(false);

  // Daily Reminder Settings State (Persisted in localStorage)
  const storageReminderKey = `pcosense_goal_reminder_settings_${userId}`;
  const [reminderSettings, setReminderSettings] = useState<{
    enabled: boolean;
    time: string; // "19:00" = 7:00 PM
    browserPush: boolean;
    snoozeUntil: number | null;
    dismissedDate: string | null;
  }>(() => {
    try {
      const saved = localStorage.getItem(storageReminderKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      enabled: true,
      time: '19:00',
      browserPush: false,
      snoozeUntil: null,
      dismissedDate: null
    };
  });

  const [showReminderSettingsModal, setShowReminderSettingsModal] = useState<boolean>(false);
  const [testReminderActive, setTestReminderActive] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Today's date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Save reminder settings
  useEffect(() => {
    try {
      localStorage.setItem(storageReminderKey, JSON.stringify(reminderSettings));
    } catch {
      // ignore
    }
  }, [reminderSettings, storageReminderKey]);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setReminderSettings(prev => ({ ...prev, browserPush: true }));
        try {
          new Notification('PCOSense Habit Reminders Enabled', {
            body: 'You will receive gentle daily alerts to complete your metabolic health goals.',
            icon: '/favicon.ico'
          });
        } catch {
          // ignore
        }
      }
    }
  };

  // Dispatch browser push notification if active and triggered
  const dispatchBrowserNotification = (remaining: number) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      reminderSettings.browserPush
    ) {
      try {
        new Notification('PCOSense Daily Health Goals Reminder', {
          body: `You have ${remaining} daily PCOS habit${remaining === 1 ? '' : 's'} left to complete today. Keep your streak going!`,
          icon: '/favicon.ico'
        });
      } catch {
        // ignore
      }
    }
  };

  // Save goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageGoalsKey, JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals, storageGoalsKey]);

  // Save daily logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageLogsKey, JSON.stringify(dailyLogs));
    } catch {
      // ignore
    }
  }, [dailyLogs, storageLogsKey]);

  // Trigger high-energy firework celebration bursts with multi-angle cannons
  const triggerFireworks = () => {
    const duration = 2.8 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 99999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial center celebratory burst
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#0f766e', '#14b8a6', '#f59e0b', '#ec4899', '#6366f1', '#10b981', '#fbbf24']
    });

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 45 * (timeLeft / duration);
      // Left cannon
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 },
        colors: ['#0d9488', '#2dd4bf', '#fbbf24', '#f43f5e', '#a855f7', '#38bdf8']
      });
      // Right cannon
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 },
        colors: ['#0d9488', '#2dd4bf', '#fbbf24', '#f43f5e', '#a855f7', '#38bdf8']
      });
    }, 220);
  };

  // Toggle completion of a specific goal today
  const toggleGoal = (goalId: string) => {
    setDailyLogs(prev => {
      const todayList = Array.isArray(prev[todayStr]) ? prev[todayStr] : [];
      const exists = todayList.includes(goalId);
      const updatedList = exists
        ? todayList.filter(id => id !== goalId)
        : [...todayList, goalId];

      // Check if this action completes all goals
      const willBeAllComplete = goals.length > 0 && updatedList.length === goals.length && !exists;
      if (willBeAllComplete) {
        setShowCelebrationToast(true);
        triggerFireworks();
      }

      return {
        ...prev,
        [todayStr]: updatedList
      };
    });
  };

  // Mark all goals as completed today
  const markAllToday = () => {
    setDailyLogs(prev => ({
      ...prev,
      [todayStr]: goals.map(g => g.id)
    }));
    setShowCelebrationToast(true);
    triggerFireworks();
  };

  // Reset today's goals
  const resetToday = () => {
    setDailyLogs(prev => ({
      ...prev,
      [todayStr]: []
    }));
    setShowCelebrationToast(false);
  };

  // Add custom goal
  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newGoal: HealthGoal = {
      id: `goal-custom-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      dailyTarget: customTarget.trim() || 'Daily habit consistency',
      pcosBenefit: customBenefit.trim() || 'Personalized wellness support for metabolic and hormonal balance.',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [...prev, newGoal]);
    setCustomTitle('');
    setCustomTarget('');
    setCustomBenefit('');
    setIsAddingCustom(false);
  };

  // Add from suggested template
  const handleAddTemplate = (template: Omit<HealthGoal, 'id' | 'createdAt'>) => {
    const newGoal: HealthGoal = {
      ...template,
      id: `goal-preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    setShowPresetsMenu(false);
  };

  // Delete a goal
  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    // Also remove from today's list if present
    setDailyLogs(prev => {
      const updated = { ...prev };
      for (const date in updated) {
        updated[date] = updated[date].filter(id => id !== goalId);
      }
      return updated;
    });
  };

  // Compute stats: Completed count today
  const todayCompletedIds: string[] = Array.isArray(dailyLogs?.[todayStr]) ? dailyLogs[todayStr] : [];
  const todayCompletedCount = goals.filter(g => Array.isArray(todayCompletedIds) && todayCompletedIds.includes(g.id)).length;
  const todayTotalCount = goals.length;
  const todayPercentage = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Calculate Streak: consecutive days with at least 1 goal completed
  const calculateStreak = () => {
    let streak = 0;
    const date = new Date();
    
    // Check today first
    const todayLog = dailyLogs[todayStr] || [];
    const hasTodayCompleted = todayLog.length > 0;
    if (hasTodayCompleted) {
      streak += 1;
    }

    // Check consecutive prior days
    for (let i = 1; i <= 365; i++) {
      const prevDate = new Date();
      prevDate.setDate(date.getDate() - i);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      const log = dailyLogs[prevDateStr];

      if (log && log.length > 0) {
        streak += 1;
      } else {
        // Break streak if a day had 0 completions (except if today hasn't been checked yet, we still retain past streak until end of today)
        if (i === 1 && !hasTodayCompleted) {
          // Continue checking yesterday's streak
          continue;
        }
        break;
      }
    }
    return streak;
  };

  // Calculate all-time total completed goal checks
  const totalAllTimeCompletions = Object.values(dailyLogs).reduce<number>(
    (acc: number, list: string[]) => acc + (Array.isArray(list) ? list.length : 0),
    0
  );

  const currentStreak = calculateStreak();

  // Generate 7-day rolling history strip
  const getWeeklyStrip = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const logs = dailyLogs[dStr] || [];
      const isCurrentDay = dStr === todayStr;
      const count = logs.length;
      const allDone = todayTotalCount > 0 && count >= todayTotalCount;

      days.push({
        dateStr: dStr,
        dayName,
        dayNum,
        isCurrentDay,
        completedCount: count,
        allDone
      });
    }
    return days;
  };

  const weeklyDays = getWeeklyStrip();

  // Check if current time has reached or passed reminder time
  const isPastReminderTime = () => {
    try {
      const [targetH, targetM] = reminderSettings.time.split(':').map(Number);
      const now = new Date();
      const curH = now.getHours();
      const curM = now.getMinutes();
      return curH > targetH || (curH === targetH && curM >= targetM);
    } catch {
      return false;
    }
  };

  const isSnoozed = reminderSettings.snoozeUntil ? Date.now() < reminderSettings.snoozeUntil : false;
  const isDismissedToday = reminderSettings.dismissedDate === todayStr;
  const hasIncompleteGoalsToday = todayTotalCount > 0 && todayCompletedCount < todayTotalCount;
  const remainingCount = todayTotalCount - todayCompletedCount;
  const shouldShowReminderBanner =
    reminderSettings.enabled &&
    hasIncompleteGoalsToday &&
    !isDismissedToday &&
    !isSnoozed &&
    (isPastReminderTime() || testReminderActive);

  const handleSnoozeReminder = () => {
    const oneHourLater = Date.now() + 60 * 60 * 1000;
    setReminderSettings(prev => ({ ...prev, snoozeUntil: oneHourLater }));
    setTestReminderActive(false);
  };

  const handleDismissReminderToday = () => {
    setReminderSettings(prev => ({ ...prev, dismissedDate: todayStr, snoozeUntil: null }));
    setTestReminderActive(false);
  };

  const handleTestReminderTrigger = () => {
    setTestReminderActive(true);
    dispatchBrowserNotification(remainingCount);
  };

  const getCategoryBadge = (category: HealthGoal['category']) => {
    switch (category) {
      case 'hydration':
        return {
          icon: <Droplets className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />,
          color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          label: 'Hydration'
        };
      case 'movement':
        return {
          icon: <Footprints className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
          color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          label: 'Movement'
        };
      case 'nutrition':
        return {
          icon: <Apple className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
          color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          label: 'Nutrition'
        };
      case 'sleep':
        return {
          icon: <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />,
          color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          label: 'Sleep'
        };
      case 'mindset':
        return {
          icon: <Heart className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
          color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'Stress & Mind'
        };
      case 'supplements':
        return {
          icon: <Pill className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />,
          color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          label: 'Supplements'
        };
      default:
        return {
          icon: <Target className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />,
          color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          label: 'General'
        };
    }
  };

  const handleAskAIForGoals = () => {
    if (!onAskAI) return;
    const prompt = `Based on my current PCOSense screening score of ${currentRiskScore.toFixed(1)}% (${currentRiskLevel} Risk), suggest 3 evidence-grounded micro daily health habits to optimize insulin sensitivity, reduce LH hypersecretion, and support cycle regularity.`;
    onAskAI(prompt);
  };

  return (
    <section
      id="dashboard-health-goals-manager"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-all"
    >
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-300 flex items-center justify-center shrink-0 shadow-xs border border-teal-700/50">
            <Target className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Daily Health Goals & Streak Tracker
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                PCOS Habit Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Define small, sustainable daily micro-targets (hydration, movement, nutrient timing) and maintain your consistency streak over time.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Custom Goal & Ask AI */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowReminderSettingsModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              reminderSettings.enabled
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            id="goals-reminder-settings-btn"
            title="Configure daily goal notification & reminder time"
          >
            <Bell className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Daily Reminder</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/80 dark:bg-slate-900 border border-amber-300/60 dark:border-amber-700/60">
              {reminderSettings.time}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
            id="goals-preset-library-btn"
          >
            <Sparkle className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Preset Library</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition-all"
            id="goals-add-custom-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Goal</span>
          </button>

          {onAskAI && (
            <button
              type="button"
              onClick={handleAskAIForGoals}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-100 dark:from-teal-950 dark:to-slate-900 hover:from-teal-100 hover:to-emerald-200 dark:hover:from-teal-900 dark:hover:to-slate-800 border border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-200 text-xs font-bold shadow-2xs transition-all"
              id="goals-ask-ai-coach-btn"
              title="Get personalized habit ideas from Gemini AI"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span className="hidden sm:inline">AI Habit Coach</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metrics Grid: Active Streak, Today's Progress, Total Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
              Active Daily Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {currentStreak === 1 ? 'day' : 'consecutive days'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {currentStreak > 0 ? '🔥 Momentum building strong!' : 'Complete any target today to start streak'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <Flame className="h-6 w-6 fill-amber-500 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Today's Completion Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Today's Targets
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {todayCompletedCount} / {todayTotalCount}
              </span>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                ({todayPercentage}%)
              </span>
            </div>
            <div className="w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
            <Zap className="h-6 w-6 text-teal-700 dark:text-teal-300" />
          </div>
        </div>

        {/* All-Time Milestones Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              All-Time Habits Logged
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalAllTimeCompletions}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                completions
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Long-term lifestyle consistency data
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            <TrendingUp className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
          </div>
        </div>
      </div>

      {/* 3. 7-Day Rolling Consistency Calendar Strip */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              7-Day Consistency History
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={markAllToday}
              className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
            >
              Mark All Done Today
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={resetToday}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
            >
              Reset Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyDays.map((day) => (
            <div
              key={day.dateStr}
              className={`rounded-xl p-2 text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                day.isCurrentDay
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-600 ring-2 ring-teal-200 dark:ring-teal-900 shadow-2xs'
                  : day.completedCount > 0
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-100/60 dark:bg-slate-800/20 border-transparent text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {day.dayName}
              </span>
              <span className={`text-xs font-black ${
                day.isCurrentDay ? 'text-teal-900 dark:text-teal-200 font-extrabold' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {day.dayNum}
              </span>

              {day.completedCount > 0 ? (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
                  {day.completedCount}
                </span>
              ) : (
                <span className="h-5 w-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400">
                  0
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3.4. Gentle Daily Incomplete Goals Reminder Alert Banner */}
      <AnimatePresence>
        {shouldShowReminderBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="rounded-2xl p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 dark:border-amber-600/70 shadow-md relative overflow-hidden space-y-3"
            id="goals-gentle-reminder-banner"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bell className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      ⏰ Gentle Reminder: {remainingCount} Health Habit{remainingCount === 1 ? '' : 's'} Remaining Today
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      Scheduled Alert ({reminderSettings.time})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
                    You have {remainingCount} daily goal{remainingCount === 1 ? '' : 's'} left to mark off. Completing them tonight reinforces your {currentStreak}-day metabolic streak and optimizes hormonal balance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissReminderToday}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Dismiss reminder for today"
                title="Dismiss for today"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              <button
                type="button"
                onClick={markAllToday}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                id="reminder-mark-all-done-btn"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark All Complete</span>
              </button>

              <button
                type="button"
                onClick={handleSnoozeReminder}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                id="reminder-snooze-btn"
              >
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Snooze for 1 Hour</span>
              </button>

              <button
                type="button"
                onClick={handleDismissReminderToday}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors"
              >
                <span>Dismiss Today</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReminderSettingsModal(true)}
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-400 hover:underline font-semibold"
              >
                <Settings className="h-3 w-3" />
                <span>Change Alert Time</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3.5. Celebration Toast Notification Banner (Triggered when 100% goals completed) */}
      <AnimatePresence>
        {(showCelebrationToast || (todayTotalCount > 0 && todayCompletedCount === todayTotalCount)) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="rounded-2xl p-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-400 dark:border-emerald-600/70 shadow-md relative overflow-hidden space-y-3"
            id="goals-celebration-toast-banner"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                  <PartyPopper className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      🎉 Phenomenal Job! 100% of Today's Health Goals Completed
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Streak Active 🔥
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
                    Every consistent habit day reduces fasting insulin hypersecretion, supports physiological LH/FSH balance, and bolsters your long-term metabolic resiliency.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCelebrationToast(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Dismiss celebration message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              <button
                type="button"
                onClick={triggerFireworks}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                id="re-launch-fireworks-btn"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Launch Fireworks 🎆</span>
              </button>

              {onAskAI && (
                <button
                  type="button"
                  onClick={() => onAskAI(`I completed 100% of my PCOS daily health habits today (streak: ${currentStreak} days). What metabolic and hormonal benefits should I expect over the next 30 days?`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                >
                  <Sparkle className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  <span>Ask AI About Long-Term Habit Gains</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Preset Goal Drawer Modal / Suggestions */}
      <AnimatePresence>
        {showPresetsMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-950 dark:text-teal-200">
                  Evidence-Based PCOS Habit Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetsMenu(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Click any clinical habit below to add it directly to your daily tracking dashboard:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUGGESTED_TEMPLATES.map((tmpl, idx) => {
                const badge = getCategoryBadge(tmpl.category);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${badge.color}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {tmpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {tmpl.dailyTarget}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTemplate(tmpl)}
                      className="shrink-0 p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-700 transition-colors"
                      title="Add to my goals"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Add Custom Goal Form */}
      <AnimatePresence>
        {isAddingCustom && (
          <motion.form
            onSubmit={handleAddCustomGoal}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>Define a New Daily Health Goal</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-goal-title">
                  Goal Title *
                </label>
                <input
                  id="custom-goal-title"
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., 20-min Morning Yoga / Daily Walk"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-goal-category">
                  Category
                </label>
                <select
                  id="custom-goal-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                >
                  <option value="movement">Movement & Exercise</option>
                  <option value="hydration">Hydration</option>
                  <option value="nutrition">Nutrition & Meal Timing</option>
                  <option value="sleep">Sleep & Circadian</option>
                  <option value="supplements">Supplements & Medications</option>
                  <option value="mindset">Mindset & Stress Relief</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-goal-target">
                  Daily Target Specifics
                </label>
                <input
                  id="custom-goal-target"
                  type="text"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="e.g., 10,000 steps or 2.5 Liters"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1" htmlFor="custom-goal-benefit">
                  Personal Motivation / PCOS Benefit (Optional)
                </label>
                <input
                  id="custom-goal-benefit"
                  type="text"
                  value={customBenefit}
                  onChange={(e) => setCustomBenefit(e.target.value)}
                  placeholder="e.g., Helps steady insulin response after lunch"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
                id="save-custom-goal-btn"
              >
                Save Health Goal
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 6. Active Goals Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            My Daily Targets ({todayCompletedCount} of {goals.length} Completed Today)
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tap the checkbox to record completion
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {goals.map((goal) => {
            const isDone = Array.isArray(todayCompletedIds) && todayCompletedIds.includes(goal.id);
            const badge = getCategoryBadge(goal.category);

            return (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex items-start justify-between gap-3 group ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/70 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-xs'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-2">
                  {/* Category Pill */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${badge.color}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    {goal.isCustom && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className={`text-xs sm:text-sm font-bold transition-all ${
                    isDone
                      ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-85'
                      : 'text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300'
                  }`}>
                    {goal.title}
                  </h4>

                  {/* Target Details */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {goal.dailyTarget}
                  </p>

                  {/* Scientific / Personal Benefit */}
                  {goal.pcosBenefit && (
                    <div className="text-[10px] text-teal-800 dark:text-teal-300/90 bg-teal-50/50 dark:bg-teal-950/30 p-2 rounded-lg border border-teal-100 dark:border-teal-900/40 flex items-start gap-1">
                      <Zap className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{goal.pcosBenefit}</span>
                    </div>
                  )}
                </div>

                {/* Right Actions: Checkbox + Optional Delete */}
                <div className="flex flex-col items-center justify-between h-full gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGoal(goal.id);
                    }}
                    className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-teal-700 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete today'}
                    aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete today'}
                  >
                    {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Circle className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Delete this goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Daily Goal Reminder Settings Modal */}
      <AnimatePresence>
        {showReminderSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-colors"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Bell className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Daily Goal Reminder Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gentle prompt when habits remain incomplete
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReminderSettingsModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 text-left">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Enable Gentle Daily Reminders
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Shows a friendly banner alert if targets aren't done
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setReminderSettings(prev => ({ ...prev, enabled: !prev.enabled }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                      reminderSettings.enabled ? 'bg-teal-700' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="h-5 w-5 rounded-full bg-white shadow-md"
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ marginLeft: reminderSettings.enabled ? 'auto' : '0' }}
                    />
                  </button>
                </div>

                {/* Reminder Time Preset & Custom Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Alert Trigger Time</span>
                    <span className="text-[10px] text-slate-400">24-hour / Local time</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['18:00', '19:00', '20:00', '21:00'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setReminderSettings(prev => ({ ...prev, time: t }))}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          reminderSettings.time === t
                            ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t === '18:00' ? '6 PM' : t === '19:00' ? '7 PM' : t === '20:00' ? '8 PM' : '9 PM'}
                      </button>
                    ))}
                  </div>

                  {/* Custom Time Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Custom Time:</span>
                    <input
                      type="time"
                      value={reminderSettings.time}
                      onChange={e => setReminderSettings(prev => ({ ...prev, time: e.target.value }))}
                      className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Browser Push Notification Permission */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Browser Push Notifications</span>
                      </div>
                      <div className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80">
                        {notificationPermission === 'granted'
                          ? 'Browser notifications are enabled on this device.'
                          : 'Get a native desktop/phone reminder even if the tab is inactive.'}
                      </div>
                    </div>

                    {notificationPermission !== 'granted' ? (
                      <button
                        type="button"
                        onClick={requestNotificationPermission}
                        className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-2xs whitespace-nowrap"
                      >
                        Enable Push
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" />
                        <span>Granted</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Test Notification Simulator Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleTestReminderTrigger();
                      setShowReminderSettingsModal(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 text-xs font-bold border border-amber-300 dark:border-amber-700 shadow-2xs transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Test Reminder Alert Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReminderSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
