import { DailySymptomLog } from '../types';
import { saveFirestoreSymptomLog, deleteFirestoreSymptomLog, getFirestoreSymptomLogs } from './firestoreService';
import { auth } from '../lib/firebase';

const STORAGE_KEY = 'pcosense_daily_symptoms';

// Helper to count the number of active distinct symptoms experienced on a given day
export function countDailySymptoms(log: Partial<DailySymptomLog>): number {
  let count = 0;
  if ((log.fatigue ?? 0) > 0) count++;
  if ((log.moodSwings ?? 0) > 0 || (log.anxiety ?? 0) > 0) count++;
  if (log.cycleIrregularity && log.cycleIrregularity !== 'none') count++;
  else if (log.menstrualFlow === 'spotting' || log.menstrualFlow === 'heavy') count++;
  if ((log.pelvicPain ?? 0) > 0) count++;
  if ((log.bloating ?? 0) > 0) count++;
  if ((log.acne ?? 0) > 0) count++;
  if ((log.headaches ?? 0) > 0) count++;
  if (log.hirsutismFlare) count++;
  if (log.hairLossNoticed) count++;
  if ((log.brainFog ?? 0) > 0) count++;
  if ((log.sugarCravings ?? 0) > 1) count++;
  return count;
}

// Helper to calculate aggregate scores from symptom points
export function calculateSymptomScores(data: {
  pelvicPain: number;
  bloating: number;
  fatigue: number;
  acne: number;
  headaches: number;
  hirsutismFlare: boolean;
  hairLossNoticed: boolean;
  moodSwings: number;
  anxiety: number;
  brainFog: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  sugarCravings: number;
}): { overallSeverityScore: number; physicalScore: number; emotionalScore: number } {
  // Physical items: pelvicPain(5), bloating(5), fatigue(5), acne(5), headaches(5), hirsutism(3), hairLoss(3) => total max 31
  const physicalRaw =
    data.pelvicPain +
    data.bloating +
    data.fatigue +
    data.acne +
    data.headaches +
    (data.hirsutismFlare ? 3 : 0) +
    (data.hairLossNoticed ? 3 : 0);
  const physicalScore = Math.min(100, Math.round((physicalRaw / 31) * 100));

  // Sleep quality score: poor=5, fair=3, good=1, excellent=0
  const sleepFactor =
    data.sleepQuality === 'poor' ? 5 : data.sleepQuality === 'fair' ? 3 : data.sleepQuality === 'good' ? 1 : 0;

  // Emotional items: moodSwings(5), anxiety(5), brainFog(5), sugarCravings(5), sleepFactor(5) => total max 25
  const emotionalRaw = data.moodSwings + data.anxiety + data.brainFog + data.sugarCravings + sleepFactor;
  const emotionalScore = Math.min(100, Math.round((emotionalRaw / 25) * 100));

  // Overall aggregate weighted index
  const overallSeverityScore = Math.round(physicalScore * 0.55 + emotionalScore * 0.45);

  return {
    overallSeverityScore,
    physicalScore,
    emotionalScore
  };
}

// Generate sensible default 14-day sample history for realistic analytics demonstration
export function getSampleDailySymptomLogs(): DailySymptomLog[] {
  const now = Date.now();
  const oneDay = 86400000;

  const rawEntries = [
    {
      daysAgo: 13,
      cycleDay: 2,
      menstrualFlow: 'heavy' as const,
      pelvicPain: 4,
      bloating: 4,
      fatigue: 4,
      acne: 3,
      headaches: 2,
      hirsutismFlare: false,
      hairLossNoticed: false,
      moodSwings: 3,
      anxiety: 2,
      brainFog: 3,
      sleepQuality: 'poor' as const,
      sleepHours: 5.5,
      sugarCravings: 4,
      exerciseMinutes: 0,
      waterIntakeLiters: 1.5,
      fastFoodConsumed: true,
      notes: 'Heavy cramping and intense pelvic pain on cycle day 2.'
    },
    {
      daysAgo: 12,
      cycleDay: 3,
      menstrualFlow: 'medium' as const,
      pelvicPain: 3,
      bloating: 4,
      fatigue: 3,
      acne: 3,
      headaches: 1,
      hirsutismFlare: false,
      hairLossNoticed: false,
      moodSwings: 2,
      anxiety: 2,
      brainFog: 2,
      sleepQuality: 'fair' as const,
      sleepHours: 6.5,
      sugarCravings: 3,
      exerciseMinutes: 15,
      waterIntakeLiters: 1.8,
      fastFoodConsumed: false,
      notes: 'Flow tapering down slightly. Cramping moderated with heat pack.'
    },
    {
      daysAgo: 10,
      cycleDay: 5,
      menstrualFlow: 'light' as const,
      pelvicPain: 1,
      bloating: 2,
      fatigue: 2,
      acne: 2,
      headaches: 0,
      hirsutismFlare: false,
      hairLossNoticed: false,
      moodSwings: 1,
      anxiety: 1,
      brainFog: 1,
      sleepQuality: 'good' as const,
      sleepHours: 7.5,
      sugarCravings: 2,
      exerciseMinutes: 30,
      waterIntakeLiters: 2.2,
      fastFoodConsumed: false,
      notes: 'Energy returning. Completed a 30m brisk walk.'
    },
    {
      daysAgo: 8,
      cycleDay: 7,
      menstrualFlow: 'none' as const,
      pelvicPain: 0,
      bloating: 1,
      fatigue: 1,
      acne: 2,
      headaches: 0,
      hirsutismFlare: false,
      hairLossNoticed: false,
      moodSwings: 0,
      anxiety: 1,
      brainFog: 0,
      sleepQuality: 'good' as const,
      sleepHours: 8.0,
      sugarCravings: 1,
      exerciseMinutes: 40,
      waterIntakeLiters: 2.5,
      fastFoodConsumed: false,
      notes: 'Feeling balanced. Low inflammation day.'
    },
    {
      daysAgo: 6,
      cycleDay: 9,
      menstrualFlow: 'none' as const,
      pelvicPain: 1,
      bloating: 2,
      fatigue: 2,
      acne: 2,
      headaches: 1,
      hirsutismFlare: true,
      hairLossNoticed: false,
      moodSwings: 2,
      anxiety: 2,
      brainFog: 1,
      sleepQuality: 'fair' as const,
      sleepHours: 6.8,
      sugarCravings: 3,
      exerciseMinutes: 25,
      waterIntakeLiters: 2.0,
      fastFoodConsumed: true,
      notes: 'Mild sugar cravings in the evening.'
    },
    {
      daysAgo: 4,
      cycleDay: 11,
      menstrualFlow: 'none' as const,
      pelvicPain: 1,
      bloating: 1,
      fatigue: 1,
      acne: 1,
      headaches: 0,
      hirsutismFlare: false,
      hairLossNoticed: false,
      moodSwings: 1,
      anxiety: 1,
      brainFog: 0,
      sleepQuality: 'excellent' as const,
      sleepHours: 8.2,
      sugarCravings: 1,
      exerciseMinutes: 35,
      waterIntakeLiters: 2.7,
      fastFoodConsumed: false,
      notes: 'Excellent sleep score and mental clarity.'
    },
    {
      daysAgo: 2,
      cycleDay: 13,
      menstrualFlow: 'none' as const,
      pelvicPain: 2,
      bloating: 3,
      fatigue: 2,
      acne: 2,
      headaches: 1,
      hirsutismFlare: true,
      hairLossNoticed: false,
      moodSwings: 2,
      anxiety: 2,
      brainFog: 2,
      sleepQuality: 'fair' as const,
      sleepHours: 7.0,
      sugarCravings: 3,
      exerciseMinutes: 20,
      waterIntakeLiters: 2.0,
      fastFoodConsumed: false,
      notes: 'Mid-cycle follicular/ovulatory twinge noticed on right side.'
    },
    {
      daysAgo: 1,
      cycleDay: 14,
      menstrualFlow: 'spotting' as const,
      pelvicPain: 2,
      bloating: 3,
      fatigue: 3,
      acne: 3,
      headaches: 1,
      hirsutismFlare: true,
      hairLossNoticed: true,
      moodSwings: 2,
      anxiety: 2,
      brainFog: 2,
      sleepQuality: 'fair' as const,
      sleepHours: 6.5,
      sugarCravings: 3,
      exerciseMinutes: 25,
      waterIntakeLiters: 2.2,
      fastFoodConsumed: false,
      notes: 'Ovulation window spotting. Mild skin flare.'
    }
  ];

  return rawEntries.map((entry, idx) => {
    const timestampDate = new Date(now - entry.daysAgo * oneDay);
    const scores = calculateSymptomScores(entry);
    return {
      id: `sample-symptom-${idx + 1}`,
      userId: 'default-user',
      timestamp: timestampDate.toISOString(),
      dateFormatted: timestampDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateKey: timestampDate.toISOString().split('T')[0],
      ...entry,
      ...scores
    };
  });
}

export function getDailySymptomLogs(userId?: string): DailySymptomLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailySymptomLog[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sort descending by timestamp
        return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }
  } catch (err) {
    console.error('Failed to load daily symptoms:', err);
  }
  // If empty, return sample logs to populate analytics
  const samples = getSampleDailySymptomLogs();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch {
    // ignore
  }
  return samples;
}

export function saveDailySymptomLog(
  input: Omit<DailySymptomLog, 'id' | 'timestamp' | 'dateFormatted' | 'overallSeverityScore' | 'physicalScore' | 'emotionalScore'>
): DailySymptomLog {
  const currentLogs = getDailySymptomLogs(input.userId);
  const now = new Date();
  const dateKey = input.dateKey || now.toISOString().split('T')[0];
  const scores = calculateSymptomScores(input);

  // Check if log already exists for today / this dateKey
  const existingIdx = currentLogs.findIndex(l => l.dateKey === dateKey);

  const calculatedSymptomsCount = input.symptomsCount ?? countDailySymptoms(input);

  const newLog: DailySymptomLog = {
    ...input,
    symptomsCount: calculatedSymptomsCount,
    id: existingIdx >= 0 ? currentLogs[existingIdx].id : `symptom-${Date.now()}`,
    timestamp: now.toISOString(),
    dateFormatted: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dateKey,
    ...scores
  };

  let updatedLogs: DailySymptomLog[];
  if (existingIdx >= 0) {
    updatedLogs = [...currentLogs];
    updatedLogs[existingIdx] = newLog;
  } else {
    updatedLogs = [newLog, ...currentLogs];
  }

  // Sort descending
  updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (err) {
    console.error('Failed to save symptom log:', err);
  }

  // Persist to Cloud Firestore: use provided userId or active auth user UID
  const effectiveUserId = (input.userId && input.userId !== 'default-user') 
    ? input.userId 
    : auth.currentUser?.uid;

  if (effectiveUserId) {
    saveFirestoreSymptomLog(effectiveUserId, newLog).catch(err => {
      console.warn('Firestore symptom log sync deferred:', err);
    });
  }

  // Dispatch live browser event for UI reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pcosense_symptoms_updated', { detail: newLog }));
  }

  return newLog;
}

export function deleteDailySymptomLog(id: string, userId?: string): DailySymptomLog[] {
  const currentLogs = getDailySymptomLogs();
  const filtered = currentLogs.filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete symptom log:', err);
  }

  const effectiveUserId = (userId && userId !== 'default-user') ? userId : auth.currentUser?.uid;
  if (effectiveUserId) {
    deleteFirestoreSymptomLog(effectiveUserId, id).catch(err => {
      console.warn('Firestore symptom delete deferred:', err);
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pcosense_symptoms_updated', { detail: { deletedId: id } }));
  }

  return filtered;
}

export function getLatestSymptomLog(): DailySymptomLog | null {
  const logs = getDailySymptomLogs();
  return logs.length > 0 ? logs[0] : null;
}
