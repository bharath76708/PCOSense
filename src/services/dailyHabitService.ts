import {
  PCOSHabitDefinition,
  DailyHabitsDayRecord,
  DailyHabitEntry,
  PCOSHabitCategory
} from '../types';
import {
  saveFirestoreDailyHabits,
  getFirestoreDailyHabits,
  getFirestoreRecentHabits
} from './firestoreService';

const HABITS_LOCAL_KEY_PREFIX = 'pcosense_habits_';
const CUSTOM_HABITS_KEY = 'pcosense_custom_habits';

/**
 * Core clinically-vetted PCOS wellness habits based on endocrine evidence
 */
export const DEFAULT_PCOS_HABITS: PCOSHabitDefinition[] = [
  {
    id: 'habit_inositol',
    name: 'Took Inositol (40:1 Ratio)',
    nameTe: 'ఇనోసిటాల్ సప్లిమెంట్ తీసుకున్నారు (40:1 నిష్పత్తి)',
    category: 'supplement',
    icon: 'pill',
    clinicalRationale:
      'The physiological 40:1 ratio of Myo-Inositol to D-Chiro-Inositol restores intracellular insulin signaling, balances LH/FSH secretion, and promotes regular follicular maturation and spontaneous ovulation.',
    clinicalRationaleTe:
      'మయో-ఇనోసిటాల్ మరియు డి-కైరో-ఇనోసిటాల్ (40:1) ఇన్సులిన్ సున్నితత్వాన్ని పెంచుతాయి, హార్మోన్ల సమతుల్యతను పునరుద్ధరిస్తాయి మరియు అండోత్సర్గంలో సహాయపడతాయి.',
    endocrineImpact: 'Insulin Signaling & Ovulation Restoration',
    endocrineImpactTe: 'ఇన్సులిన్ పనితీరు & అండోత్సర్గ పునరుద్ధరణ',
    targetTime: 'morning',
    defaultHabit: true
  },
  {
    id: 'habit_sleep_8hrs',
    name: 'Got 8 Hours of Restorative Sleep',
    nameTe: '8 గంటల నాణ్యమైన నిద్ర తీసుకున్నారు',
    category: 'sleep',
    icon: 'moon',
    clinicalRationale:
      'Chronobiology studies reveal that sleeping under 7 hours induces acute peripheral insulin resistance by 25-30% and triggers elevated evening cortisol, heightening adrenal androgen output.',
    clinicalRationaleTe:
      '7 గంటల కంటే తక్కువ నిద్ర ఇన్సులిన్ రెసిస్టెన్స్‌ను 30% వరకు పెంచుతుంది మరియు కార్టిసాల్ వల్ల ఆండ్రోజెన్ హార్మోన్లను ప్రేరేపిస్తుంది.',
    endocrineImpact: 'HPA Axis & Cortisol Regulation',
    endocrineImpactTe: 'కార్టిసాల్ నియంత్రణ & మెటబాలిక్ రికవరీ',
    targetTime: 'morning',
    defaultHabit: true
  },
  {
    id: 'habit_avoid_refined_sugar',
    name: 'Avoided Refined Sugars & Sweeteners',
    nameTe: 'శుద్ధి చేసిన చక్కెరలు & స్వీట్లను నివారించారు',
    category: 'nutrition',
    icon: 'cookie',
    clinicalRationale:
      'Eliminating high-glycemic sucrose and high-fructose syrups prevents aggressive postprandial insulin surges. High insulin acts synergistically with LH to provoke ovarian theca cells into producing excess testosterone.',
    clinicalRationaleTe:
      'చక్కెరలు వేగంగా రక్తంలో ఇన్సులిన్‌ను పెంచుతాయి, ఇది అండాశయాలు అధిక టెస్టోస్టెరాన్ ఉత్పత్తి చేయడానికి దారితీస్తుంది.',
    endocrineImpact: 'Androgen Suppression & Glycemic Stability',
    endocrineImpactTe: 'ఆండ్రోజెన్ తగ్గింపు & గ్లూకోజ్ నియంత్రణ',
    targetTime: 'anytime',
    defaultHabit: true
  },
  {
    id: 'habit_spearmint_tea',
    name: 'Drank Spearmint Tea (Anti-Androgen)',
    nameTe: 'స్పియర్‌మింట్ టీ తాగారు (యాంటీ-ఆండ్రోజెన్)',
    category: 'nutrition',
    icon: 'coffee',
    clinicalRationale:
      'Multiple double-blind RCTs have demonstrated that 2 cups of organic spearmint tea daily significantly suppresses free circulating testosterone and decreases subjective hirsutism (excessive facial/body hair).',
    clinicalRationaleTe:
      'రోజుకు 2 కప్పుల స్పియర్‌మింట్ టీ తాగడం వల్ల ఫ్రీ టెస్టోస్టెరాన్ స్థాయిలు తగ్గి అవాంఛిత రోమాల సమస్యను తగ్గిస్తుంది.',
    endocrineImpact: 'Anti-Androgenic & Follicular Calming',
    endocrineImpactTe: 'టెస్టోస్టెరాన్ తగ్గింపు & రోమాల నియంత్రణ',
    targetTime: 'evening',
    defaultHabit: true
  },
  {
    id: 'habit_movement_30min',
    name: '30 Min Low-Impact Movement or Yoga',
    nameTe: '30 నిమిషాల వాకింగ్ లేదా రెస్టోరేటివ్ యోగా',
    category: 'movement',
    icon: 'footprints',
    clinicalRationale:
      'Low-impact movement (brisk walking, swimming, restorative yoga) stimulates skeletal muscle GLUT4 glucose uptake independent of insulin without triggering the cortisol spikes associated with excessive HIIT.',
    clinicalRationaleTe:
      'స్వల్ప-తీవ్రత గల వ్యాయామం కార్టిసాల్ పెరగకుండా కండరాల ద్వారా గ్లూకోజ్ శోషణను పెంచుతుంది, ఇన్సులిన్ భారాన్ని తగ్గిస్తుంది.',
    endocrineImpact: 'GLUT4 Translocation & Metabolic Clearance',
    endocrineImpactTe: 'కండరాల గ్లూకోజ్ శోషణ & చురుకుదనం',
    targetTime: 'morning',
    defaultHabit: true
  },
  {
    id: 'habit_vitd_magnesium',
    name: 'Took Vitamin D3 & Magnesium',
    nameTe: 'విటమిన్ D3 & మెగ్నీషియం తీసుకున్నారు',
    category: 'supplement',
    icon: 'sun',
    clinicalRationale:
      'Vitamin D3 regulates antimüllerian hormone (AMH) and gene expression in ovarian granulosa cells, while Magnesium is an obligatory catalytic cofactor for insulin receptor kinase activity.',
    clinicalRationaleTe:
      'విటమిన్ డి3 అండాశయ కణాల అభివృద్ధికి మరియు మెగ్నీషియం ఇన్సులిన్ పనితీరుకు కీలకమైన సహకారి.',
    endocrineImpact: 'Folliculogenesis & Mineral Metabolism',
    endocrineImpactTe: 'అండాశయ కణాల ఆరోగ్యం & ఖనిజ లభ్యత',
    targetTime: 'morning',
    defaultHabit: true
  },
  {
    id: 'habit_high_fiber_breakfast',
    name: 'Ate High-Fiber & Protein Breakfast',
    nameTe: 'అధిక ఫైబర్ & ప్రోటీన్ అల్పాహారం తీసుకున్నారు',
    category: 'nutrition',
    icon: 'apple',
    clinicalRationale:
      'Beginning the day with 25g+ protein and soluble fiber (chia, oats, sprouts) dampens morning glucose spikes, enhances GLP-1/PYY satiety hormones, and prevents mid-day hypoglycemic cravings.',
    clinicalRationaleTe:
      'ఉదయం 25 గ్రాములకు పైగా ప్రోటీన్ మరియు ఫైబర్ తీసుకోవడం వల్ల రోజంతా ఆకలి మరియు షుగర్ క్రేవింగ్స్ తగ్గుతాయి.',
    endocrineImpact: 'Morning Glycemic Blunting & Satiety',
    endocrineImpactTe: 'మార్నింగ్ గ్లూకోజ్ నియంత్రణ & సంతృప్తి',
    targetTime: 'morning',
    defaultHabit: true
  },
  {
    id: 'habit_post_meal_walk',
    name: '10-Min Post-Meal Digestive Walk',
    nameTe: 'భోజనం తర్వాత 10 నిమిషాల నడక',
    category: 'movement',
    icon: 'footprints',
    clinicalRationale:
      'A gentle 10-15 minute walk immediately following main meals lowers the peak 60-minute postprandial blood glucose excursion by up to 22%, protecting against insulin hypersecretion.',
    clinicalRationaleTe:
      'భోజనం తర్వాత 10 నిమిషాల నడక తిన్న తర్వాత పెరిగే రక్తంలో చక్కెరను 22% వరకు తగ్గిస్తుంది.',
    endocrineImpact: 'Postprandial Insulin Reduction',
    endocrineImpactTe: 'భోజనానంతర ఇన్సులిన్ రక్షణ',
    targetTime: 'afternoon',
    defaultHabit: true
  },
  {
    id: 'habit_mindful_breathing',
    name: '10 Min Mindful Breathing or Meditation',
    nameTe: '10 నిమిషాల ప్రాణాయామం లేదా ధ్యానం',
    category: 'mindset',
    icon: 'heart',
    clinicalRationale:
      'Deep diaphragmatic breathing activates the parasympathetic vagal brake, reducing sympathetic noradrenaline and downstream adrenal DHEA-S (an androgen frequently elevated in PCOS).',
    clinicalRationaleTe:
      'గాఢ శ్వాస వ్యాయామాలు వేగస్ నాడిని ప్రేరేపించి మానసిక ఒత్తిడి మరియు DHEA-S హార్మోన్ల ఉధృతిని తగ్గిస్తాయి.',
    endocrineImpact: 'Parasympathetic Tone & Adrenal DHEA-S Suppression',
    endocrineImpactTe: 'ఒత్తిడి తగ్గింపు & అడ్రినల్ నియంత్రణ',
    targetTime: 'evening',
    defaultHabit: true
  }
];

/**
 * Format Date to YYYY-MM-DD
 */
export function getFormattedDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Load all habit definitions (defaults + custom habits)
 */
export function getAllHabitDefinitions(userId?: string): PCOSHabitDefinition[] {
  const customKey = `${CUSTOM_HABITS_KEY}_${userId || 'default'}`;
  try {
    const saved = localStorage.getItem(customKey);
    if (saved) {
      const custom: PCOSHabitDefinition[] = JSON.parse(saved);
      return [...DEFAULT_PCOS_HABITS, ...custom];
    }
  } catch {
    // fallback
  }
  return DEFAULT_PCOS_HABITS;
}

/**
 * Save custom habit definition
 */
export function saveCustomHabitDefinition(
  userId: string | undefined,
  habit: Omit<PCOSHabitDefinition, 'id' | 'isCustom' | 'defaultHabit'>
): PCOSHabitDefinition {
  const customKey = `${CUSTOM_HABITS_KEY}_${userId || 'default'}`;
  const newHabit: PCOSHabitDefinition = {
    ...habit,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    isCustom: true,
    defaultHabit: false
  };

  try {
    const current = getAllHabitDefinitions(userId).filter(h => h.isCustom);
    current.push(newHabit);
    localStorage.setItem(customKey, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save custom habit:', err);
  }

  return newHabit;
}

/**
 * Delete custom habit definition
 */
export function deleteCustomHabitDefinition(userId: string | undefined, habitId: string): void {
  const customKey = `${CUSTOM_HABITS_KEY}_${userId || 'default'}`;
  try {
    const current = getAllHabitDefinitions(userId).filter(h => h.isCustom && h.id !== habitId);
    localStorage.setItem(customKey, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to delete custom habit:', err);
  }
}

/**
 * Get habit record for a specific day
 */
export function getDailyHabitsForDay(
  userId: string | undefined,
  dateKey: string = getFormattedDateKey()
): DailyHabitsDayRecord {
  const uId = userId || 'default';
  const localKey = `${HABITS_LOCAL_KEY_PREFIX}${uId}_${dateKey}`;
  const allHabits = getAllHabitDefinitions(userId);

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed: DailyHabitsDayRecord = JSON.parse(raw);
      // Ensure all current habits are initialized
      let hasNew = false;
      allHabits.forEach(h => {
        if (!parsed.habits[h.id]) {
          parsed.habits[h.id] = { habitId: h.id, completed: false };
          hasNew = true;
        }
      });
      if (hasNew) {
        parsed.totalHabitsCount = allHabits.length;
        parsed.completedCount = Object.values(parsed.habits).filter(h => h.completed).length;
        parsed.completionRate = Math.round((parsed.completedCount / parsed.totalHabitsCount) * 100);
      }
      return parsed;
    }
  } catch {
    // fallback
  }

  // Generate blank record for day
  const initialHabits: Record<string, DailyHabitEntry> = {};
  allHabits.forEach(h => {
    initialHabits[h.id] = {
      habitId: h.id,
      completed: false
    };
  });

  return {
    id: `${uId}_${dateKey}`,
    userId: uId,
    dateKey,
    habits: initialHabits,
    completedCount: 0,
    totalHabitsCount: allHabits.length,
    completionRate: 0,
    streakCount: calculateUserStreak(userId),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Toggle a habit for a day with optimistic update and cloud sync
 */
export async function toggleHabitForDay(
  userId: string | undefined,
  dateKey: string,
  habitId: string,
  note?: string
): Promise<DailyHabitsDayRecord> {
  const record = getDailyHabitsForDay(userId, dateKey);
  const current = record.habits[habitId] || { habitId, completed: false };
  const nextCompleted = !current.completed;

  record.habits[habitId] = {
    habitId,
    completed: nextCompleted,
    completedAt: nextCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    note: note !== undefined ? note : current.note
  };

  const completedList = Object.values(record.habits).filter(h => h.completed);
  record.completedCount = completedList.length;
  record.totalHabitsCount = Object.keys(record.habits).length;
  record.completionRate = record.totalHabitsCount > 0 ? Math.round((record.completedCount / record.totalHabitsCount) * 100) : 0;
  record.lastUpdated = new Date().toISOString();

  // Save to localStorage immediately
  const uId = userId || 'default';
  const localKey = `${HABITS_LOCAL_KEY_PREFIX}${uId}_${dateKey}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(record));
  } catch {
    // ignore
  }

  // Recalculate and update streak
  record.streakCount = calculateUserStreak(userId);

  // Sync to Firestore asynchronously
  if (userId) {
    saveFirestoreDailyHabits(userId, record).catch(err => {
      console.warn('Background Firestore habit sync warning:', err);
    });
  }

  return record;
}

/**
 * Update a habit note or reflection
 */
export async function updateHabitNote(
  userId: string | undefined,
  dateKey: string,
  habitId: string,
  note: string
): Promise<DailyHabitsDayRecord> {
  const record = getDailyHabitsForDay(userId, dateKey);
  if (record.habits[habitId]) {
    record.habits[habitId].note = note;
    record.lastUpdated = new Date().toISOString();
    const uId = userId || 'default';
    const localKey = `${HABITS_LOCAL_KEY_PREFIX}${uId}_${dateKey}`;
    try {
      localStorage.setItem(localKey, JSON.stringify(record));
    } catch {
      // ignore
    }
    if (userId) {
      saveFirestoreDailyHabits(userId, record).catch(() => {});
    }
  }
  return record;
}

/**
 * Calculate user consistency streak (consecutive days with ≥ 50% habit completion)
 */
export function calculateUserStreak(userId: string | undefined): number {
  const uId = userId || 'default';
  let streak = 0;
  const today = new Date();

  // Check today first. If not completed yet today, check starting from yesterday
  const todayKey = getFormattedDateKey(today);
  const todayRaw = localStorage.getItem(`${HABITS_LOCAL_KEY_PREFIX}${uId}_${todayKey}`);
  let startOffset = 1;

  if (todayRaw) {
    try {
      const todayRecord: DailyHabitsDayRecord = JSON.parse(todayRaw);
      if (todayRecord.completionRate >= 50) {
        streak += 1;
        startOffset = 1;
      } else {
        startOffset = 1;
      }
    } catch {
      startOffset = 1;
    }
  }

  // Check past 30 days
  for (let i = startOffset; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = getFormattedDateKey(d);
    const raw = localStorage.getItem(`${HABITS_LOCAL_KEY_PREFIX}${uId}_${key}`);
    if (!raw) {
      // If today wasn't completed, yesterday must be checked
      if (i === 1 && streak === 0) {
        continue;
      }
      break;
    }
    try {
      const parsed: DailyHabitsDayRecord = JSON.parse(raw);
      if (parsed.completionRate >= 50) {
        streak += 1;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return streak;
}

/**
 * Get 7-day habit consistency history for Recharts visualization
 */
export interface HabitDaySummary {
  dateKey: string;
  dayLabel: string;
  dayLabelTe: string;
  isToday: boolean;
  completionRate: number;
  completedCount: number;
  totalCount: number;
}

export function getPast7DaysHabitHistory(userId: string | undefined): HabitDaySummary[] {
  const uId = userId || 'default';
  const history: HabitDaySummary[] = [];
  const today = new Date();
  const todayKey = getFormattedDateKey(today);

  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesTe = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = getFormattedDateKey(d);
    const dayOfWeek = d.getDay();
    const isToday = key === todayKey;

    const record = getDailyHabitsForDay(userId, key);

    history.push({
      dateKey: key,
      dayLabel: isToday ? 'Today' : dayNamesEn[dayOfWeek],
      dayLabelTe: isToday ? 'ఈరోజు' : dayNamesTe[dayOfWeek],
      isToday,
      completionRate: record.completionRate,
      completedCount: record.completedCount,
      totalCount: record.totalHabitsCount
    });
  }

  return history;
}

/**
 * Synthesize gentle harmonious acoustic chime via Web Audio API
 */
export function playHabitChime(type: 'check' | 'allCompleted' = 'check'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'check') {
      // Soft gentle high ding
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Harmonic 3-note celebration chord for completing all habits
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    }
  } catch {
    // audio context may be muted or blocked by policy
  }
}
