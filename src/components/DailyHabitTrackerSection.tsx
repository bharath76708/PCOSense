import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Pill,
  Moon,
  Cookie,
  Coffee,
  Footprints,
  Sun,
  Apple,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  MessageSquare,
  Award,
  TrendingUp,
  BarChart3,
  Edit2,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { useLanguage } from '../translations';
import {
  PCOSHabitDefinition,
  DailyHabitsDayRecord,
  PCOSHabitCategory
} from '../types';
import {
  getAllHabitDefinitions,
  getDailyHabitsForDay,
  toggleHabitForDay,
  updateHabitNote,
  saveCustomHabitDefinition,
  deleteCustomHabitDefinition,
  getFormattedDateKey,
  getPast7DaysHabitHistory,
  calculateUserStreak,
  playHabitChime,
  HabitDaySummary
} from '../services/dailyHabitService';

interface DailyHabitTrackerSectionProps {
  userId?: string;
  onAskAI?: (prompt?: string) => void;
  isDark?: boolean;
}

export const DailyHabitTrackerSection: React.FC<DailyHabitTrackerSectionProps> = ({
  userId,
  onAskAI,
  isDark = false
}) => {
  const { isTelugu } = useLanguage();

  // Selected date state (defaults to today)
  const todayKey = useMemo(() => getFormattedDateKey(), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Sound chime preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcosense_habit_sound') !== 'false';
    } catch {
      return true;
    }
  });

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Active records & habits
  const [habitsList, setHabitsList] = useState<PCOSHabitDefinition[]>(() => getAllHabitDefinitions(userId));
  const [dayRecord, setDayRecord] = useState<DailyHabitsDayRecord>(() => getDailyHabitsForDay(userId, todayKey));
  const [streak, setStreak] = useState<number>(() => calculateUserStreak(userId));
  const [weekHistory, setWeekHistory] = useState<HabitDaySummary[]>(() => getPast7DaysHabitHistory(userId));

  // Expanded rationale IDs
  const [expandedRationaleIds, setExpandedRationaleIds] = useState<Record<string, boolean>>({});

  // Note editing state
  const [editingNoteHabitId, setEditingNoteHabitId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Add custom habit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState<string>('');
  const [newHabitCategory, setNewHabitCategory] = useState<PCOSHabitCategory>('supplement');
  const [newHabitTiming, setNewHabitTiming] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [newHabitRationale, setNewHabitRationale] = useState<string>('');
  const [newHabitEndocrineImpact, setNewHabitEndocrineImpact] = useState<string>('');

  // Toggle 7-day trend chart
  const [showTrendChart, setShowTrendChart] = useState<boolean>(false);

  // Sync state when selected date changes or userId changes
  useEffect(() => {
    const record = getDailyHabitsForDay(userId, selectedDateKey);
    setDayRecord(record);
    setHabitsList(getAllHabitDefinitions(userId));
    setStreak(calculateUserStreak(userId));
    setWeekHistory(getPast7DaysHabitHistory(userId));
  }, [userId, selectedDateKey]);

  // Handle habit check toggle
  const handleToggleHabit = async (habitId: string) => {
    const isNowCompleting = !dayRecord.habits[habitId]?.completed;

    const updated = await toggleHabitForDay(userId, selectedDateKey, habitId);
    setDayRecord({ ...updated });
    setStreak(calculateUserStreak(userId));
    setWeekHistory(getPast7DaysHabitHistory(userId));

    if (soundEnabled) {
      if (isNowCompleting) {
        // If all habits completed after this click, play harmonic celebration chime
        if (updated.completedCount === updated.totalHabitsCount && updated.totalHabitsCount > 0) {
          playHabitChime('allCompleted');
        } else {
          playHabitChime('check');
        }
      }
    }
  };

  // Handle note saving
  const handleSaveNote = async (habitId: string) => {
    const updated = await updateHabitNote(userId, selectedDateKey, habitId, noteText.trim());
    setDayRecord({ ...updated });
    setEditingNoteHabitId(null);
    setNoteText('');
  };

  // Handle custom habit creation
  const handleCreateCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    let icon: PCOSHabitDefinition['icon'] = 'sparkles';
    if (newHabitCategory === 'supplement') icon = 'pill';
    else if (newHabitCategory === 'sleep') icon = 'moon';
    else if (newHabitCategory === 'nutrition') icon = 'apple';
    else if (newHabitCategory === 'movement') icon = 'footprints';
    else if (newHabitCategory === 'mindset') icon = 'heart';

    saveCustomHabitDefinition(userId, {
      name: newHabitName.trim(),
      category: newHabitCategory,
      icon,
      clinicalRationale: newHabitRationale.trim() || 'Custom personal PCOS wellness habit supporting healthy hormonal harmony.',
      endocrineImpact: newHabitEndocrineImpact.trim() || 'Personal Metabolic & Lifestyle Balance',
      targetTime: newHabitTiming
    });

    const refreshedList = getAllHabitDefinitions(userId);
    setHabitsList(refreshedList);
    const refreshedRecord = getDailyHabitsForDay(userId, selectedDateKey);
    setDayRecord(refreshedRecord);

    // Reset form
    setNewHabitName('');
    setNewHabitRationale('');
    setNewHabitEndocrineImpact('');
    setIsAddModalOpen(false);
  };

  // Handle custom habit deletion
  const handleDeleteCustomHabit = (habitId: string) => {
    deleteCustomHabitDefinition(userId, habitId);
    const refreshedList = getAllHabitDefinitions(userId);
    setHabitsList(refreshedList);
    const refreshedRecord = getDailyHabitsForDay(userId, selectedDateKey);
    setDayRecord(refreshedRecord);
  };

  // Toggle rationale accordion
  const toggleRationale = (habitId: string) => {
    setExpandedRationaleIds(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('pcosense_habit_sound', String(next));
    } catch {
      // ignore
    }
  };

  // Past 7 days dates for pill selector
  const recentDays = useMemo(() => {
    const list: { key: string; label: string; dateNum: number; isToday: boolean }[] = [];
    const base = new Date();
    const dayNames = isTelugu ? ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(base.getDate() - i);
      const k = getFormattedDateKey(d);
      list.push({
        key: k,
        label: i === 0 ? (isTelugu ? 'ఈరోజు' : 'Today') : dayNames[d.getDay()],
        dateNum: d.getDate(),
        isToday: i === 0
      });
    }
    return list;
  }, [isTelugu]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habitsList;
    return habitsList.filter(h => h.category === selectedCategory);
  }, [habitsList, selectedCategory]);

  // Categories with completion count for today
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {
      all: { total: habitsList.length, completed: dayRecord.completedCount },
      supplement: { total: 0, completed: 0 },
      nutrition: { total: 0, completed: 0 },
      sleep: { total: 0, completed: 0 },
      movement: { total: 0, completed: 0 },
      mindset: { total: 0, completed: 0 }
    };

    habitsList.forEach(h => {
      if (!counts[h.category]) {
        counts[h.category] = { total: 0, completed: 0 };
      }
      counts[h.category].total += 1;
      if (dayRecord.habits[h.id]?.completed) {
        counts[h.category].completed += 1;
      }
    });

    return counts;
  }, [habitsList, dayRecord]);

  // Habit icon renderer
  const renderHabitIcon = (iconName: string, completed: boolean) => {
    const cls = `h-4.5 w-4.5 ${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`;
    switch (iconName) {
      case 'pill':
        return <Pill className={cls} />;
      case 'moon':
        return <Moon className={cls} />;
      case 'cookie':
        return <Cookie className={cls} />;
      case 'coffee':
        return <Coffee className={cls} />;
      case 'footprints':
        return <Footprints className={cls} />;
      case 'sun':
        return <Sun className={cls} />;
      case 'apple':
        return <Apple className={cls} />;
      case 'heart':
        return <Heart className={cls} />;
      default:
        return <Sparkles className={cls} />;
    }
  };

  // Streak status title
  const streakMessage = useMemo(() => {
    if (streak >= 14) return isTelugu ? 'హార్మోన్ల సమతుల్యత ఛాంపియన్!' : 'Hormonal Harmony Champion! 🏆';
    if (streak >= 7) return isTelugu ? 'స్థిరమైన 7 రోజుల అలవాటు లయ!' : 'Consistent 7-Day Habit Master! 🌟';
    if (streak >= 3) return isTelugu ? 'చక్కని పురోగతి! ఇలాగే కొనసాగించండి' : 'Building Great Momentum! ⚡';
    if (streak >= 1) return isTelugu ? 'మంచి ప్రారంభం!' : 'Great start! Keep going! 🌱';
    return isTelugu ? 'ఈరోజే మీ అలవాట్ల లయను ప్రారంభించండి' : 'Begin your daily routine today! 🎯';
  }, [streak, isTelugu]);

  return (
    <section
      id="daily-habits-tracker-section"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-6 transition-colors"
      aria-label="Daily PCOS Habit Tracker"
    >
      {/* 1. Header Bar: Title, Subtitle, Streak & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isTelugu ? 'PCOS రోజువారీ అలవాట్ల ట్రాకర్' : 'PCOS Daily Habit Tracker'}
            </h2>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
              {isTelugu ? 'వైద్య ఆధారాలు' : 'Clinical Routines'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {isTelugu
              ? 'ఇనోసిటాల్ తీసుకోవడం, 8 గంటల నిద్ర, చక్కెరలను నివారించడం వంటి PCOS-ప్రత్యేక అలవాట్లను ప్రతిరోజూ పూర్తి చేసి హార్మోన్ల సమతుల్యతను సాధించండి.'
              : 'Mark off evidence-backed endocrine routines like taking inositol, 8h sleep, and avoiding refined sugars to lower insulin surges and suppress excess androgens.'}
          </p>
        </div>

        {/* Action Controls & Streak Counter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Streak Flame Pill */}
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800 shadow-xs"
            title={streakMessage}
          >
            <div className="h-7 w-7 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center animate-pulse">
              <Flame className="h-4.5 w-4.5 fill-orange-500 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-slate-900 dark:text-white">{streak}</span>
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  {isTelugu ? 'రోజుల స్ట్రీక్' : 'Day Streak'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">
                {streakMessage}
              </p>
            </div>
          </div>

          {/* Sound Chime Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? (isTelugu ? 'శబ్దం ఆన్' : 'Chime sound enabled') : (isTelugu ? 'శబ్దం ఆఫ్' : 'Chime muted')}
            aria-label="Toggle habit audio chime"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>

          {/* 7-Day Consistency Trend Toggle */}
          <button
            type="button"
            onClick={() => setShowTrendChart(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              showTrendChart
                ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            id="btn-toggle-habit-trend"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{isTelugu ? '7-రోజుల గ్రాఫ్' : '7-Day Trend'}</span>
          </button>

          {/* Add Custom Habit Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            id="btn-add-custom-habit"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isTelugu ? '+ కొత్త అలవాటు' : '+ Custom Habit'}</span>
          </button>
        </div>
      </div>

      {/* 2. Date Selector Strip: Past 7 Days Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
            {isTelugu ? 'తేదీని ఎంచుకోండి:' : 'Select Day to Log or Review:'}
          </span>
          {selectedDateKey !== todayKey && (
            <button
              type="button"
              onClick={() => setSelectedDateKey(todayKey)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isTelugu ? 'ఈరోజుకు తిరిగి రండి' : 'Jump back to Today'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {recentDays.map(item => {
            const isSelected = selectedDateKey === item.key;
            // Get completion rate for that day
            const daySum = weekHistory.find(w => w.dateKey === item.key);
            const rate = daySum ? daySum.completionRate : 0;
            const isFull = rate === 100;
            const isGood = rate >= 50;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedDateKey(item.key)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                id={`habit-day-pill-${item.key}`}
              >
                <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.label}
                </span>
                <span className="text-xs sm:text-base font-black my-0.5">{item.dateNum}</span>

                {/* Status Dot / Indicator */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {rate > 0 ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : isFull
                          ? 'bg-emerald-500'
                          : isGood
                          ? 'bg-teal-500'
                          : 'bg-amber-400'
                      }`}
                    />
                  ) : (
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-emerald-300/50' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  )}
                  <span className={`text-[9px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {rate}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Completion Gauge & Motivational Progress Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-cyan-50/80 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 font-black text-sm">
              {dayRecord.completionRate}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {isTelugu ? 'ఈ రోజు అలవాట్ల పురోగతి' : 'Daily Routine Completion'}
                </h4>
                {dayRecord.completionRate === 100 && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    {isTelugu ? 'పూర్తయింది!' : 'All Done!'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? `${dayRecord.totalHabitsCount} అలవాట్లలో ${dayRecord.completedCount} పూర్తయ్యాయి. స్థిరమైన అలవాట్లు ఇన్సులిన్ రెసిస్టెన్స్‌ను తగ్గిస్తాయి.`
                  : `${dayRecord.completedCount} of ${dayRecord.totalHabitsCount} PCOS habits marked completed. Small routines create profound endocrine stability.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {dayRecord.completionRate === 100 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'అద్భుతమైన క్రమశిక్షణ!' : 'Hormone Goals Met!'}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 px-3 py-1 rounded-lg">
                {dayRecord.totalHabitsCount - dayRecord.completedCount} {isTelugu ? 'మిగిలి ఉన్నాయి' : 'remaining today'}
              </span>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${dayRecord.completionRate}%` }}
          />
        </div>
      </div>

      {/* 4. Optional 7-Day Consistency Bar Chart Visualizer */}
      {showTrendChart && (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isTelugu ? 'గత 7 రోజుల అలవాట్ల స్థిరత్వం (%)' : '7-Day Habit Consistency Trend (%)'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isTelugu ? 'లక్ష్యం: 70%+ స్థిరత్వం' : 'Target: ≥70% Consistency'}
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey={isTelugu ? 'dayLabelTe' : 'dayLabel'}
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [`${val}% completed`, isTelugu ? 'పూర్తి శాతం' : 'Completion Rate']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" label={{ value: '70% Goal', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <Bar dataKey="completionRate" radius={[6, 6, 0, 0]}>
                  {weekHistory.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.dateKey === selectedDateKey
                          ? '#059669' // active selected emerald
                          : entry.completionRate >= 70
                          ? '#10b981'
                          : entry.completionRate >= 40
                          ? '#06b6d4'
                          : '#cbd5e1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            {isTelugu
              ? 'రోజువారీ నిలకడ మీ అండాశయాల ఫోలికల్ నాణ్యతను మరియు ఇన్సులిన్ రిసెప్టర్ పనితీరును మెరుగుపరుస్తుంది.'
              : 'Maintaining 70%+ daily habit consistency stimulates durable glucose receptor sensitivity and normalized menstrual cyclicity.'}
          </p>
        </div>
      )}

      {/* 5. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: isTelugu ? 'అన్నీ' : 'All Habits' },
          { key: 'supplement', label: isTelugu ? 'సప్లిమెంట్లు' : 'Supplements' },
          { key: 'nutrition', label: isTelugu ? 'పోషకాహారం' : 'Nutrition' },
          { key: 'sleep', label: isTelugu ? 'నిద్ర & విశ్రాంతి' : 'Sleep & Rest' },
          { key: 'movement', label: isTelugu ? 'నడక & వ్యాయామం' : 'Movement' },
          { key: 'mindset', label: isTelugu ? 'ఒత్తిడి నియంత్రణ' : 'Mindset' }
        ].map(cat => {
          const isCatSelected = selectedCategory === cat.key;
          const stat = categoryCounts[cat.key] || { total: 0, completed: 0 };
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isCatSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isCatSelected
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {stat.completed}/{stat.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6. Main Habits Checklist */}
      <div className="space-y-3">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu ? 'ఈ విభాగంలో అలవాట్లు లేవు.' : 'No habits found in this category.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isTelugu ? '+ ఈ కేటగిరీలో అలవాటును జోడించండి' : '+ Add a custom habit here'}
            </button>
          </div>
        ) : (
          filteredHabits.map(habit => {
            const entry = dayRecord.habits[habit.id] || { habitId: habit.id, completed: false };
            const isCompleted = entry.completed;
            const isRationaleExpanded = Boolean(expandedRationaleIds[habit.id]);
            const isEditingNote = editingNoteHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className={`rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-300/80 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                id={`habit-card-${habit.id}`}
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Title & Badges */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit.id)}
                      className="mt-0.5 shrink-0 focus:outline-hidden group"
                      aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'completed'}`}
                      id={`habit-checkbox-${habit.id}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950 transition-transform active:scale-90" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {renderHabitIcon(habit.icon, isCompleted)}
                        </div>
                        <h3
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`text-sm sm:text-base font-bold cursor-pointer transition-colors ${
                            isCompleted
                              ? 'line-through text-slate-500 dark:text-slate-400'
                              : 'text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400'
                          }`}
                        >
                          {isTelugu && habit.nameTe ? habit.nameTe : habit.name}
                        </h3>

                        {/* Endocrine Mechanism Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                          {isTelugu && habit.endocrineImpactTe ? habit.endocrineImpactTe : habit.endocrineImpact}
                        </span>

                        {habit.targetTime && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {habit.targetTime}
                          </span>
                        )}

                        {habit.isCustom && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Completed timestamp and reflection notes */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {isCompleted && entry.completedAt && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {isTelugu ? `పూర్తయింది (${entry.completedAt})` : `Completed at ${entry.completedAt}`}
                          </span>
                        )}

                        {entry.note && !isEditingNote && (
                          <span className="italic text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            &ldquo;{entry.note}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Note, Evidence Details, Custom Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Add/Edit Note Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditingNote) {
                          setEditingNoteHabitId(null);
                        } else {
                          setEditingNoteHabitId(habit.id);
                          setNoteText(entry.note || '');
                        }
                      }}
                      className="p-1.5 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
                      title="Add note or reflection"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{entry.note ? (isTelugu ? 'నోట్ సవరించు' : 'Edit Note') : (isTelugu ? '+ నోట్' : '+ Note')}</span>
                    </button>

                    {/* Expand Clinical Rationale */}
                    <button
                      type="button"
                      onClick={() => toggleRationale(habit.id)}
                      className="p-1.5 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
                      title="Why this matters for PCOS"
                    >
                      <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="hidden sm:inline">{isTelugu ? 'వైద్య ఆధారం' : 'PCOS Science'}</span>
                      {isRationaleExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {/* Delete if custom */}
                    {habit.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomHabit(habit.id)}
                        className="p-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete custom habit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Note Editor Box */}
                {isEditingNote && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder={isTelugu ? 'ఉదా: ఉదయాన్నే నీటితో తీసుకున్నాను, 2000mg...' : 'e.g., 2000mg taken with breakfast, slept by 10:30pm...'}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                      maxLength={120}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(habit.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                    >
                      {isTelugu ? 'సేవ్' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNoteHabitId(null)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Clinical Rationale Accordion Drawer */}
                {isRationaleExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {isTelugu ? 'PCOS ఎండోక్రైన్ మెకానిజం:' : 'PCOS Endocrine Mechanism:'}
                        </span>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                          {isTelugu && habit.clinicalRationaleTe ? habit.clinicalRationaleTe : habit.clinicalRationale}
                        </p>
                      </div>
                    </div>

                    {onAskAI && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onAskAI(`Explain why '${habit.name}' is scientifically recommended for PCOS patients and how it influences insulin, androgens, and ovulation.`)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>{isTelugu ? 'AI తో ఈ అలవాటు గురించి చర్చించండి' : 'Ask PCOSense AI about this habit'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 7. Footer Motivation & AI Prompt Card */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              {isTelugu ? 'అలవాట్ల స్థిరత్వం హార్మోన్లను శాంతింపజేస్తుంది' : 'Routine Consistency Heals PCOS Holistically'}
            </h4>
            <p className="text-xs text-teal-200/80 mt-0.5">
              {isTelugu
                ? '60-90 రోజుల స్థిరమైన దినచర్య ద్వారా ఇన్సులిన్ రెసిస్టెన్స్ మరియు ఆండ్రోజెన్ స్థాయిలు గణనీయంగా తగ్గుతాయి.'
                : 'Clinical endocrine recovery occurs over 60-90 days of consistent insulin-stabilizing daily routines.'}
            </p>
          </div>
        </div>

        {onAskAI && (
          <button
            type="button"
            onClick={() => onAskAI(isTelugu ? 'PCOS నియంత్రణ కోసం ఉత్తమ దినచర్య అలవాట్లను సూచించండి' : 'What are the top 5 most effective daily lifestyle habits to manage PCOS naturally?')}
            className="inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 whitespace-nowrap"
            id="habit-ask-ai-cta-btn"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isTelugu ? 'AI రొటీన్ సలహా పొందండి' : 'Ask AI Routine Tips'}</span>
          </button>
        )}
      </div>

      {/* 8. Add Custom Habit Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'కొత్త PCOS అలవాటును జోడించండి' : 'Add Custom PCOS Habit'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'అలవాటు పేరు' : 'Habit Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder={isTelugu ? 'ఉదా: దాల్చిన చెక్క నీరు తాగడం' : 'e.g., Drank Ceylon Cinnamon Tea, Took CoQ10'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'కేటగిరీ' : 'Category'}
                  </label>
                  <select
                    value={newHabitCategory}
                    onChange={e => setNewHabitCategory(e.target.value as PCOSHabitCategory)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="supplement">{isTelugu ? 'సప్లిమెంట్' : 'Supplement'}</option>
                    <option value="nutrition">{isTelugu ? 'పోషకాహారం' : 'Nutrition'}</option>
                    <option value="sleep">{isTelugu ? 'నిద్ర' : 'Sleep'}</option>
                    <option value="movement">{isTelugu ? 'వ్యాయామం' : 'Movement'}</option>
                    <option value="mindset">{isTelugu ? 'ఒత్తిడి నియంత్రణ' : 'Mindset'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'సమయం' : 'Suggested Time'}
                  </label>
                  <select
                    value={newHabitTiming}
                    onChange={e => setNewHabitTiming(e.target.value as 'morning' | 'afternoon' | 'evening' | 'anytime')}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="morning">{isTelugu ? 'ఉదయం' : 'Morning'}</option>
                    <option value="afternoon">{isTelugu ? 'మధ్యాహ్నం' : 'Afternoon'}</option>
                    <option value="evening">{isTelugu ? 'సాయంత్రం' : 'Evening'}</option>
                    <option value="anytime">{isTelugu ? 'ఎప్పుడైనా' : 'Anytime'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'హార్మోన్ల లక్ష్యం / ప్రభావం' : 'Endocrine Target (Optional)'}
                </label>
                <input
                  type="text"
                  value={newHabitEndocrineImpact}
                  onChange={e => setNewHabitEndocrineImpact(e.target.value)}
                  placeholder={isTelugu ? 'ఉదా: ఇన్సులిన్ నియంత్రణ & శక్తి' : 'e.g., Blood Sugar Blunting, Cellular Energy'}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'వైద్య ఆధారం లేదా కారణం' : 'Clinical Rationale (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={newHabitRationale}
                  onChange={e => setNewHabitRationale(e.target.value)}
                  placeholder={isTelugu ? 'ఈ అలవాటు మీ ఆరోగ్యానికి ఎందుకు మంచిది?' : 'How does this habit support your PCOS journey?'}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isTelugu ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {isTelugu ? 'అలవాటును సేవ్ చేయండి' : 'Save Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
