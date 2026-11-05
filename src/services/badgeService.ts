/**
 * PCOSense - Milestone Badge & Gamified Consistency Rewards System
 * Tracks user consistency across symptom tracking, clinical assessments, and learning.
 */

import { MilestoneBadge, UserMilestonesData, DailySymptomLog, AssessmentHistoryItem } from '../types';
import { getDailySymptomLogs } from './dailySymptomService';
import { getAssessmentHistory } from './api';

const BADGE_STORAGE_KEY = 'pcosense_milestone_badges_v1';
const UNLOCK_NOTIFICATIONS_KEY = 'pcosense_unlocked_badge_popups';

const INITIAL_BADGE_DEFINITIONS: Omit<MilestoneBadge, 'earned' | 'progress' | 'currentValue' | 'earnedAt'>[] = [
  {
    id: 'first_step',
    title: 'First Step',
    teluguTitle: 'మొదటి అడుగు',
    description: 'Complete your first clinical assessment or daily symptom log.',
    teluguDescription: 'మీ మొదటి క్లినికల్ అసెస్‌మెంట్ లేదా రోజువారీ లక్షణాల లాగ్‌ను పూర్తి చేయండి.',
    category: 'symptoms',
    icon: 'Footprints',
    targetValue: 1,
    unit: 'activity',
    tier: 'bronze',
    xpPoints: 50
  },
  {
    id: 'streak_3',
    title: '3-Day Consistency Streak',
    teluguTitle: '3 రోజుల స్థిరత్వ పరంపర',
    description: 'Log daily symptoms for 3 consecutive days to build baseline data.',
    teluguDescription: 'ప్రాథమిక డేటాను రూపొందించడానికి వరుసగా 3 రోజులు లక్షణాలను నమోదు చేయండి.',
    category: 'consistency',
    icon: 'Zap',
    targetValue: 3,
    unit: 'days',
    tier: 'bronze',
    xpPoints: 100
  },
  {
    id: 'streak_7',
    title: '7-Day Rhythm Master',
    teluguTitle: '7 రోజుల లయ సాధకుడు',
    description: 'Maintain a 7-day daily symptom check-in streak.',
    teluguDescription: 'వరుసగా 7 రోజుల లక్షణాల తనిఖీని విజయవంతంగా నిర్వహించండి.',
    category: 'consistency',
    icon: 'Flame',
    targetValue: 7,
    unit: 'days',
    tier: 'silver',
    xpPoints: 250
  },
  {
    id: 'longitudinal_champion',
    title: 'Longitudinal Health Champion',
    teluguTitle: 'దీర్ఘకాలిక ఆరోగ్య ఛాంపియన్',
    description: 'Log 14+ daily symptom check-ins to build high-confidence trigger correlation data.',
    teluguDescription: 'లక్షణాల సంబంధాల విశ్లేషణ కోసం 14 కంటే ఎక్కువ రోజువారీ లాగ్‌లను నమోదు చేయండి.',
    category: 'symptoms',
    icon: 'Award',
    targetValue: 14,
    unit: 'logs',
    tier: 'gold',
    xpPoints: 500
  },
  {
    id: 'active_monitor',
    title: 'Active Risk Monitor',
    teluguTitle: 'చురుకైన రిస్క్ మానిటర్',
    description: 'Complete 3 longitudinal PCOS risk assessment screenings over time.',
    teluguDescription: 'కాలక్రమంలో 3 వేర్వేరు PCOS రిస్క్ అసెస్‌మెంట్‌లను పూర్తి చేయండి.',
    category: 'screening',
    icon: 'ShieldCheck',
    targetValue: 3,
    unit: 'screens',
    tier: 'silver',
    xpPoints: 300
  },
  {
    id: 'clinical_collaborator',
    title: 'Clinical Collaborator',
    teluguTitle: 'క్లినికల్ సహకారి',
    description: 'Export a formatted Doctor PDF report or generate a secure QR Share summary.',
    teluguDescription: 'డాక్టర్ PDF నివేదికను డౌన్‌లోడ్ చేయండి లేదా సురక్షిత QR షేర్ కోడ్‌ను రూపొందించండి.',
    category: 'clinical',
    icon: 'Stethoscope',
    targetValue: 1,
    unit: 'share',
    tier: 'silver',
    xpPoints: 150
  },
  {
    id: 'whatif_explorer',
    title: 'What-If? Simulator Explorer',
    teluguTitle: 'వాట్-ఇఫ్ సిమ్యులేటర్ అన్వేషకుడు',
    description: 'Simulate BMI or exercise lifestyle interventions in the ML simulator.',
    teluguDescription: 'మెషిన్ లెర్నింగ్ సిమ్యులేటర్‌లో జీవనశైలి మార్పులను పరీక్షించండి.',
    category: 'education',
    icon: 'Sliders',
    targetValue: 1,
    unit: 'simulations',
    tier: 'bronze',
    xpPoints: 100
  },
  {
    id: 'calendar_strategist',
    title: 'Calendar Health Planner',
    teluguTitle: 'క్యాలెండర్ ఆరోగ్య ప్రణాళికకర్త',
    description: 'Export cycle predictions or medical appointments to your device calendar.',
    teluguDescription: 'ఋతు చక్ర అంచనాలు లేదా అపాయింట్‌మెంట్‌లను మీ క్యాలెండర్‌కు జోడించండి.',
    category: 'clinical',
    icon: 'Calendar',
    targetValue: 1,
    unit: 'export',
    tier: 'bronze',
    xpPoints: 100
  }
];

/**
 * Calculates current streak in days from daily symptom logs
 */
export function calculateSymptomStreak(logs: DailySymptomLog[]): number {
  if (!logs || logs.length === 0) return 0;

  // Extract unique sorted date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(new Set(logs.map(l => l.dateKey))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If latest log is neither today nor yesterday, streak is broken
  const latestDate = uniqueDates[0];
  if (latestDate !== today && latestDate !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(latestDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevExpected = new Date(currentDate);
    prevExpected.setDate(prevExpected.getDate() - 1);
    const expectedStr = prevExpected.toISOString().split('T')[0];

    if (uniqueDates[i] === expectedStr) {
      streak++;
      currentDate = prevExpected;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Record a one-off achievement action (e.g. exported PDF, simulated What-If)
 */
export function recordMilestoneAction(action: 'clinical_collaborator' | 'whatif_explorer' | 'calendar_strategist' | 'symptom_logger'): void {
  try {
    const key = `pcosense_action_${action}`;
    const count = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(count));
  } catch {
    // ignore
  }
}

export function getActionCount(action: string): number {
  try {
    return Number(localStorage.getItem(`pcosense_action_${action}`) || '0');
  } catch {
    return 0;
  }
}

/**
 * Evaluates all user milestones, computes progress and XP
 */
export function evaluateUserMilestones(userId?: string): UserMilestonesData {
  const symptomLogs = getDailySymptomLogs(userId);
  const streakDays = calculateSymptomStreak(symptomLogs);
  const totalSymptomLogs = symptomLogs.length;

  let assessmentHistory: AssessmentHistoryItem[] = [];
  try {
    const saved = localStorage.getItem('pcosense_assessment_history');
    if (saved) {
      assessmentHistory = JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  const totalAssessments = assessmentHistory.length;

  // Track actions
  const clinicalShareCount = getActionCount('clinical_collaborator');
  const whatIfCount = getActionCount('whatif_explorer');
  const calendarCount = getActionCount('calendar_strategist');

  let earnedBadgesCount = 0;
  let totalXp = 0;
  let recentUnlock: MilestoneBadge | null = null;

  const badges: MilestoneBadge[] = INITIAL_BADGE_DEFINITIONS.map(def => {
    let currentValue = 0;

    switch (def.id) {
      case 'first_step':
        currentValue = (totalSymptomLogs > 0 || totalAssessments > 0) ? 1 : 0;
        break;
      case 'streak_3':
        currentValue = streakDays;
        break;
      case 'streak_7':
        currentValue = streakDays;
        break;
      case 'longitudinal_champion':
        currentValue = totalSymptomLogs;
        break;
      case 'active_monitor':
        currentValue = totalAssessments;
        break;
      case 'clinical_collaborator':
        currentValue = clinicalShareCount;
        break;
      case 'whatif_explorer':
        currentValue = whatIfCount;
        break;
      case 'calendar_strategist':
        currentValue = calendarCount;
        break;
      default:
        currentValue = 0;
    }

    const earned = currentValue >= def.targetValue;
    const progress = Math.min(100, Math.round((currentValue / def.targetValue) * 100));

    if (earned) {
      earnedBadgesCount++;
      totalXp += def.xpPoints;
    }

    return {
      ...def,
      earned,
      progress,
      currentValue,
      earnedAt: earned ? new Date().toISOString() : undefined
    };
  });

  // Level: 1 Level per 200 XP
  const level = Math.floor(totalXp / 200) + 1;

  return {
    userId: userId || 'default-user',
    totalXp,
    level,
    streakDays,
    totalSymptomLogs,
    totalAssessments,
    badges,
    recentUnlock
  };
}
