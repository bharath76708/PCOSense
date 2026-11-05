import {
  DailyHydrationRecord,
  WaterDrinkEntry,
  HydrationReminderSettings
} from '../types';
export type { DailyHydrationRecord, WaterDrinkEntry, HydrationReminderSettings };
import { saveFirestoreHydrationRecord, getFirestoreHydrationRecords } from './firestoreService';
import { playNotificationSound } from './soundService';
import { auth } from '../lib/firebase';

const HYDRATION_STORAGE_KEY_PREFIX = 'pcosense_hydration_';
const SETTINGS_STORAGE_KEY = 'pcosense_hydration_settings';

export const DEFAULT_HYDRATION_CHECKPOINTS = [
  {
    time: '07:30',
    label: 'Morning Wake-Up Detox & Flush',
    labelTe: 'ఉదయం మేల్కొన్న తర్వాత విషపదార్థాల తొలగింపు',
    amountMl: 250,
    pcosBenefit: 'Stimulates kidney filtration, activates morning bowel motility and reduces fasting insulin resistance.',
    pcosBenefitTe: 'కిడ్నీల పనితీరును మెరుగుపరుస్తుంది, జీర్ణక్రియను ప్రేరేపిస్తుంది.'
  },
  {
    time: '09:30',
    label: 'Post-Breakfast Metabolic Priming',
    labelTe: 'అల్పాహారం తర్వాత జీవక్రియ ఉత్తేజితం',
    amountMl: 250,
    pcosBenefit: 'Aids nutrient absorption and dampens postprandial glucose spike.',
    pcosBenefitTe: 'పోషకాల శోషణకు తోడ్పడుతుంది, గ్లూకోజ్ పెరుగుదలను తగ్గిస్తుంది.'
  },
  {
    time: '11:30',
    label: 'Mid-Morning Craving & Androgen Defense',
    labelTe: 'మధ్యాహ్నానికి ముందు ఆకలి నియంత్రణ',
    amountMl: 250,
    pcosBenefit: 'Distinguishes false thirst from sugar cravings, assisting cortisol management.',
    pcosBenefitTe: 'తీపి తినాలనే కోరికను నియంత్రిస్తుంది, కార్టిసాల్‌ను సమతుల్యం చేస్తుంది.'
  },
  {
    time: '13:30',
    label: 'Post-Lunch Cellular Hydration',
    labelTe: 'భోజనం తర్వాత కణాల హైడ్రేషన్',
    amountMl: 250,
    pcosBenefit: 'Enhances cellular water balance and prevents afternoon energy crash.',
    pcosBenefitTe: 'అలసటను తగ్గించి రోజంతా శక్తిని అందిస్తుంది.'
  },
  {
    time: '15:30',
    label: 'Afternoon Slump Buster & Cortisol Reset',
    labelTe: 'మధ్యాహ్నం శక్తి పునరుద్ధరణ',
    amountMl: 250,
    pcosBenefit: 'Reduces brain fog and supports liver clearance of circulating androgens.',
    pcosBenefitTe: 'మెదడు చురుకుదనాన్ని పెంచుతుంది, హార్మోన్ల సమతుల్యతకు సహాయపడుతుంది.'
  },
  {
    time: '17:30',
    label: 'Pre-Evening Activity Prep',
    labelTe: 'సాయంత్రం వ్యాయామ సన్నద్ధత',
    amountMl: 250,
    pcosBenefit: 'Optimal muscular hydration for walking, mobility, or yoga sessions.',
    pcosBenefitTe: 'నడక, యోగా కోసం కండరాలకు తగినంత తేమను అందిస్తుంది.'
  },
  {
    time: '19:30',
    label: 'Dinner Digestive Support',
    labelTe: 'రాత్రి భోజనం జీర్ణక్రియ మద్దతు',
    amountMl: 250,
    pcosBenefit: 'Soothes gut inflammation and assists metabolic breakdown of evening meals.',
    pcosBenefitTe: 'జీర్ణవ్యవస్థ వాపును తగ్గించి సుఖ జీర్ణానికి తోడ్పడుతుంది.'
  },
  {
    time: '21:00',
    label: 'Night Electrolyte & Skin Cellular Repair',
    labelTe: 'రాత్రి చర్మ కణాల పునరుద్ధరణ',
    amountMl: 250,
    pcosBenefit: 'Supports overnight tissue hydration, clearing sebum pores and cystic acne.',
    pcosBenefitTe: 'మొటిమలు రాకుండా చర్మాన్ని రక్షిస్తుంది, రాత్రి నిద్రలో కణాల మరమ్మత్తు చేస్తుంది.'
  },
  {
    time: '22:15',
    label: 'Pre-Sleep Gentle Sip',
    labelTe: 'నిద్రకు ముందు తేలికపాటి గుక్క',
    amountMl: 150,
    pcosBenefit: 'Prevents nighttime throat dryness and regulates sleep temperature.',
    pcosBenefitTe: 'సుఖనిద్రకు దోహదపడుతుంది.'
  }
];

export const DEFAULT_HYDRATION_SETTINGS: HydrationReminderSettings = {
  enabled: true,
  intervalMinutes: 90,
  targetMl: 2500,
  glassSizeMl: 250,
  wakeUpTime: '07:00',
  bedTime: '22:30',
  soundEnabled: true,
  scheduledCheckpoints: DEFAULT_HYDRATION_CHECKPOINTS
};

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeAmPm(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function getHydrationSettings(): HydrationReminderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_HYDRATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_HYDRATION_SETTINGS;
}

export function saveHydrationSettings(settings: HydrationReminderSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getStoredHydrationRecords(userId: string = 'local-user'): Record<string, DailyHydrationRecord> {
  const storageKey = `${HYDRATION_STORAGE_KEY_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading hydration records:', err);
  }
  return {};
}

export function saveStoredHydrationRecords(userId: string = 'local-user', records: Record<string, DailyHydrationRecord>): void {
  const storageKey = `${HYDRATION_STORAGE_KEY_PREFIX}${userId}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving hydration records:', err);
  }
}

/**
 * Returns today's hydration record or builds an initial baseline with morning entries
 */
export function getTodayHydrationRecord(userId: string = 'local-user', customTargetMl?: number): DailyHydrationRecord {
  const records = getStoredHydrationRecords(userId);
  const todayKey = getTodayDateKey();
  const settings = getHydrationSettings();
  const targetMl = customTargetMl || settings.targetMl || 2500;
  const glassSize = settings.glassSizeMl || 250;
  const targetGlasses = Math.ceil(targetMl / glassSize);

  if (records[todayKey]) {
    return records[todayKey];
  }

  // Initial seed for today
  const initialEntries: WaterDrinkEntry[] = [
    {
      id: `entry-${Date.now() - 1000 * 60 * 180}`,
      time: '08:00 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      amountMl: 250,
      type: 'glass',
      checkpointLabel: 'Morning Wake-Up Detox & Flush'
    },
    {
      id: `entry-${Date.now() - 1000 * 60 * 90}`,
      time: '10:00 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      amountMl: 250,
      type: 'glass',
      checkpointLabel: 'Post-Breakfast Metabolic Priming'
    }
  ];

  const totalMl = initialEntries.reduce((sum, e) => sum + e.amountMl, 0);

  const newRecord: DailyHydrationRecord = {
    id: `water-${todayKey}-${userId}`,
    userId,
    dateKey: todayKey,
    totalMl,
    targetMl,
    glassesConsumed: initialEntries.length,
    targetGlasses,
    entries: initialEntries,
    lastDrunkAt: initialEntries[initialEntries.length - 1].timestamp,
    streakDays: 4
  };

  records[todayKey] = newRecord;
  saveStoredHydrationRecords(userId, records);

  const currentUser = auth.currentUser;
  if (currentUser?.uid) {
    saveFirestoreHydrationRecord(currentUser.uid, newRecord).catch(() => {});
  }

  return newRecord;
}

/**
 * Record a water intake event (e.g. user clicked "Taken / I drank it")
 */
export function logWaterIntake(
  amountMl: number = 250,
  checkpointLabel?: string,
  userId: string = 'local-user'
): { updatedRecord: DailyHydrationRecord; newEntry: WaterDrinkEntry } {
  const records = getStoredHydrationRecords(userId);
  const todayKey = getTodayDateKey();
  const current = records[todayKey] || getTodayHydrationRecord(userId);

  const now = new Date();
  const newEntry: WaterDrinkEntry = {
    id: `water-entry-${Date.now()}`,
    time: formatTimeAmPm(now),
    timestamp: now.toISOString(),
    amountMl,
    type: amountMl >= 500 ? 'bottle' : 'glass',
    checkpointLabel: checkpointLabel || 'Hydration Interval Taken'
  };

  const updatedEntries = [newEntry, ...current.entries];
  const updatedTotalMl = current.totalMl + amountMl;
  const settings = getHydrationSettings();
  const glassSize = settings.glassSizeMl || 250;
  const updatedGlasses = Math.floor(updatedTotalMl / glassSize);

  const updatedRecord: DailyHydrationRecord = {
    ...current,
    totalMl: updatedTotalMl,
    glassesConsumed: updatedGlasses,
    entries: updatedEntries,
    lastDrunkAt: now.toISOString()
  };

  records[todayKey] = updatedRecord;
  saveStoredHydrationRecords(userId, records);

  // Play refreshing water bubble sound
  playNotificationSound('water-drank');

  const currentUser = auth.currentUser;
  if (currentUser?.uid) {
    saveFirestoreHydrationRecord(currentUser.uid, updatedRecord).catch(() => {});
  }

  return { updatedRecord, newEntry };
}

/**
 * Remove an entry if accidentally logged
 */
export function removeWaterDrinkEntry(entryId: string, userId: string = 'local-user'): DailyHydrationRecord {
  const records = getStoredHydrationRecords(userId);
  const todayKey = getTodayDateKey();
  const current = records[todayKey] || getTodayHydrationRecord(userId);

  const filteredEntries = current.entries.filter(e => e.id !== entryId);
  const updatedTotalMl = filteredEntries.reduce((sum, e) => sum + e.amountMl, 0);
  const settings = getHydrationSettings();
  const glassSize = settings.glassSizeMl || 250;

  const updatedRecord: DailyHydrationRecord = {
    ...current,
    totalMl: updatedTotalMl,
    glassesConsumed: Math.floor(updatedTotalMl / glassSize),
    entries: filteredEntries
  };

  records[todayKey] = updatedRecord;
  saveStoredHydrationRecords(userId, records);

  const currentUser = auth.currentUser;
  if (currentUser?.uid) {
    saveFirestoreHydrationRecord(currentUser.uid, updatedRecord).catch(() => {});
  }

  return updatedRecord;
}

/**
 * Computes next scheduled drinking time based on intervals and last drink
 */
export function getNextHydrationAlertInfo(record: DailyHydrationRecord, settings: HydrationReminderSettings): {
  isOverdue: boolean;
  minutesRemaining: number;
  nextScheduledTime: string;
  suggestedCheckpoint?: { label: string; labelTe?: string; amountMl: number; pcosBenefit: string; pcosBenefitTe?: string };
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next checkpoint
  const sortedCheckpoints = [...settings.scheduledCheckpoints].sort((a, b) => {
    const [ah, am] = a.time.split(':').map(Number);
    const [bh, bm] = b.time.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  const nextCp = sortedCheckpoints.find(cp => {
    const [h, m] = cp.time.split(':').map(Number);
    return h * 60 + m > currentMinutes;
  }) || sortedCheckpoints[0];

  let minutesSinceLastDrink = 999;
  if (record.lastDrunkAt) {
    const lastTime = new Date(record.lastDrunkAt).getTime();
    minutesSinceLastDrink = Math.floor((now.getTime() - lastTime) / (1000 * 60));
  }

  const interval = settings.intervalMinutes || 90;
  const minutesRemaining = Math.max(0, interval - minutesSinceLastDrink);
  const isOverdue = minutesSinceLastDrink >= interval;

  const nextAlertDate = new Date(now.getTime() + minutesRemaining * 60 * 1000);
  const nextScheduledTime = nextCp ? nextCp.time : formatTimeAmPm(nextAlertDate);

  return {
    isOverdue,
    minutesRemaining,
    nextScheduledTime,
    suggestedCheckpoint: nextCp
  };
}
