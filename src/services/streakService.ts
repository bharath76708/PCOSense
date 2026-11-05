import { DailySymptomLog } from '../types';
import { getDailySymptomLogs } from './dailySymptomService';
import { recordMilestoneAction } from './badgeService';
import { playNotificationSound } from './soundService';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  loggedToday: boolean;
  loggedYesterday: boolean;
  totalDaysLogged: number;
  lastLoggedDateKey: string | null;
  recent7Days: {
    dateKey: string;
    dayLabel: string;
    dayNum: string;
    isToday: boolean;
    logged: boolean;
    severityScore?: number;
  }[];
  nextMilestone: number; // 7, 14, 30, 60, 100
  milestoneProgressPercent: number;
  milestoneAchieved: 7 | 30 | 60 | 100 | null;
}

export function calculateStreak(logs?: DailySymptomLog[]): StreakData {
  const allLogs = logs || getDailySymptomLogs();
  
  // Normalize date keys (YYYY-MM-DD)
  const loggedDateSet = new Set<string>();
  const dateToSeverity = new Map<string, number>();

  allLogs.forEach(log => {
    if (log.dateKey) {
      loggedDateSet.add(log.dateKey);
      dateToSeverity.set(log.dateKey, log.overallSeverityScore);
    } else if (log.timestamp) {
      const d = log.timestamp.split('T')[0];
      loggedDateSet.add(d);
      dateToSeverity.set(d, log.overallSeverityScore);
    }
  });

  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  const loggedToday = loggedDateSet.has(todayKey);
  const loggedYesterday = loggedDateSet.has(yesterdayKey);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(now);

  // If not logged today, start check from yesterday
  if (!loggedToday) {
    checkDate = new Date(yesterday);
  }

  while (true) {
    const key = checkDate.toISOString().split('T')[0];
    if (loggedDateSet.has(key)) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  // Calculate longest streak historically
  const sortedDates = Array.from(loggedDateSet).sort();
  let longestStreak = 0;
  let running = 0;
  let prevTimestamp: number | null = null;

  sortedDates.forEach(dateStr => {
    const time = new Date(dateStr).getTime();
    if (prevTimestamp === null) {
      running = 1;
    } else {
      const diffDays = Math.round((time - prevTimestamp) / 86400000);
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevTimestamp = time;
    if (running > longestStreak) {
      longestStreak = running;
    }
  });

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Build Recent 7 Days list (e.g. 6 days ago up to today)
  const recent7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
    const dayNum = String(d.getDate());
    const isToday = i === 0;
    const isLogged = loggedDateSet.has(key);

    recent7Days.push({
      dateKey: key,
      dayLabel,
      dayNum,
      isToday,
      logged: isLogged,
      severityScore: dateToSeverity.get(key)
    });
  }

  // Next milestone calculation
  const milestones = [7, 14, 30, 60, 100];
  let nextMilestone = 7;
  for (const m of milestones) {
    if (currentStreak < m) {
      nextMilestone = m;
      break;
    }
    nextMilestone = m;
  }

  // Milestone achieved check (exact 7 or 30 milestone hit or surpassed)
  let milestoneAchieved: 7 | 30 | 60 | 100 | null = null;
  if (currentStreak >= 100) milestoneAchieved = 100;
  else if (currentStreak >= 60) milestoneAchieved = 60;
  else if (currentStreak >= 30) milestoneAchieved = 30;
  else if (currentStreak >= 7) milestoneAchieved = 7;

  const milestoneProgressPercent = Math.min(100, Math.round((currentStreak / nextMilestone) * 100));

  // If milestone reached, reward badges
  if (currentStreak >= 7) {
    recordMilestoneAction('symptom_logger');
  }

  return {
    currentStreak,
    longestStreak,
    loggedToday,
    loggedYesterday,
    totalDaysLogged: loggedDateSet.size,
    lastLoggedDateKey: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
    recent7Days,
    nextMilestone,
    milestoneProgressPercent,
    milestoneAchieved
  };
}
