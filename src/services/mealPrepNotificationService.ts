import { RecipeItem, MealCategory } from '../types';

export interface MealScheduleTime {
  category: MealCategory;
  label: string;
  labelTe: string;
  defaultTime: string; // "HH:MM" 24h format
  hour: number;
  minute: number;
}

export const DEFAULT_MEAL_TIMES: Record<MealCategory, MealScheduleTime> = {
  breakfast: {
    category: 'breakfast',
    label: 'Breakfast',
    labelTe: 'ఉదయం అల్పాహారం (Breakfast)',
    defaultTime: '08:00',
    hour: 8,
    minute: 0
  },
  mid_morning: {
    category: 'mid_morning',
    label: 'Mid-Morning Booster',
    labelTe: 'మధ్యాహ్నానికి ముందు బూస్టర్',
    defaultTime: '11:00',
    hour: 11,
    minute: 0
  },
  lunch: {
    category: 'lunch',
    label: 'Lunch',
    labelTe: 'మధ్యాహ్న భోజనం (Lunch)',
    defaultTime: '13:00',
    hour: 13,
    minute: 0
  },
  evening_snack: {
    category: 'evening_snack',
    label: 'Evening Snack',
    labelTe: 'సాయంత్రం స్నాక్',
    defaultTime: '17:00',
    hour: 17,
    minute: 0
  },
  dinner: {
    category: 'dinner',
    label: 'Dinner',
    labelTe: 'రాత్రి భోజనం (Dinner)',
    defaultTime: '20:00',
    hour: 20,
    minute: 0
  },
  bedtime_drink: {
    category: 'bedtime_drink',
    label: 'Bedtime Hormone Elixir',
    labelTe: 'రాత్రి పానీయం (Bedtime Elixir)',
    defaultTime: '21:45',
    hour: 21,
    minute: 45
  }
};

export interface MealPrepReminder {
  id: string;
  mealCategory: MealCategory;
  mealLabel: string;
  mealLabelTe: string;
  recipeName: string;
  recipeNameTe?: string;
  recipeId: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  scheduledMealTime: string; // e.g. "08:00 AM"
  calculatedPrepTime: string; // e.g. "07:45 AM"
  calculatedPrepTimestamp: number; // epoch ms for today
  status: 'upcoming' | 'due' | 'completed' | 'dismissed';
}

export interface MealPrepNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
  leadTimeMinutes: number; // 0 = exactly when prep starts, 5 = 5 mins early
}

const SETTINGS_KEY = 'pcosense_meal_prep_notification_settings_v1';
const DISMISSED_ALERTS_KEY = 'pcosense_dismissed_prep_alerts_today';

export function getMealPrepSettings(): MealPrepNotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load meal prep settings:', e);
  }
  return {
    enabled: true,
    soundEnabled: true,
    browserNotifications: true,
    leadTimeMinutes: 0
  };
}

export function saveMealPrepSettings(settings: MealPrepNotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save meal prep settings:', e);
  }
}

/**
 * Synthesizes a soothing, gentle two-tone acoustic chime via Web Audio API.
 * 100% reliable across modern browsers with zero external audio assets.
 */
export function playGentleMealChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;

    // Tone 1 (Gentle high flute / chime: 587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.85);

    // Tone 2 (Harmonic major third: 739.99 Hz - F#5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(739.99, now + 0.2);

    gain2.gain.setValueAtTime(0.001, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.18, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.2);
    osc2.stop(now + 1.25);
  } catch (err) {
    console.warn('Audio chime playback omitted (browser policy or mute):', err);
  }
}

/**
 * Requests browser notification permission gracefully
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Dispatches a native browser notification if allowed
 */
export function dispatchBrowserNotification(title: string, body: string): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'pcosense-meal-prep',
        silent: false
      });
    } catch (err) {
      console.warn('Could not launch native notification (iframe restriction):', err);
    }
  }
}

/**
 * Calculates today's prep reminder schedule given today's meals.
 */
export function calculateTodayMealPrepSchedule(
  meals: Record<string, RecipeItem | undefined>,
  settings: MealPrepNotificationSettings = getMealPrepSettings()
): MealPrepReminder[] {
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  const mealCategoryKeys: MealCategory[] = [
    'breakfast',
    'mid_morning',
    'lunch',
    'evening_snack',
    'dinner',
    'bedtime_drink'
  ];

  return mealCategoryKeys
    .map(category => {
      const scheduleInfo = DEFAULT_MEAL_TIMES[category];
      const recipe = meals[category];
      if (!recipe) return null;

      const prepMinutes = recipe.prepTimeMinutes || 10;
      const totalLeadMinutes = prepMinutes + (settings.leadTimeMinutes || 0);

      // Meal target time today
      const mealDate = new Date();
      mealDate.setHours(scheduleInfo.hour, scheduleInfo.minute, 0, 0);

      // Prep start target time
      const prepDate = new Date(mealDate.getTime() - totalLeadMinutes * 60 * 1000);

      // Format strings
      const formatTime = (d: Date) => {
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
      };

      const scheduledMealTime = formatTime(mealDate);
      const calculatedPrepTime = formatTime(prepDate);
      const prepTimestamp = prepDate.getTime();

      const id = `${todayDateStr}_${category}_${recipe.id}`;

      let status: 'upcoming' | 'due' | 'completed' | 'dismissed' = 'upcoming';
      const currentTime = now.getTime();
      const diffMinutes = (prepTimestamp - currentTime) / (60 * 1000);

      if (diffMinutes <= 0 && diffMinutes >= -60) {
        status = 'due';
      } else if (diffMinutes < -60) {
        status = 'completed';
      }

      const reminderItem: MealPrepReminder = {
        id,
        mealCategory: category,
        mealLabel: scheduleInfo.label,
        mealLabelTe: scheduleInfo.labelTe,
        recipeName: recipe.name,
        recipeNameTe: recipe.nameTe,
        recipeId: recipe.id,
        prepTimeMinutes: prepMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes || 15,
        scheduledMealTime,
        calculatedPrepTime,
        calculatedPrepTimestamp: prepTimestamp,
        status
      };
      return reminderItem;
    })
    .filter((it): it is MealPrepReminder => it !== null);
}

// Global in-app event bus for meal prep alert banners
type AlertCallback = (reminder: MealPrepReminder) => void;
const listeners: Set<AlertCallback> = new Set();

export function subscribeToMealPrepAlerts(callback: AlertCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function triggerMealPrepAlert(reminder: MealPrepReminder): void {
  const settings = getMealPrepSettings();
  if (!settings.enabled) return;

  if (settings.soundEnabled) {
    playGentleMealChime();
  }

  if (settings.browserNotifications) {
    const body = `⏰ Time to start prepping ${reminder.recipeName}! Needs ${reminder.prepTimeMinutes} mins of prep before ${reminder.scheduledMealTime} ${reminder.mealLabel}.`;
    dispatchBrowserNotification('PCOSense Meal Prep Alert', body);
  }

  listeners.forEach(cb => {
    try {
      cb(reminder);
    } catch (err) {
      console.error('Error in meal prep alert callback:', err);
    }
  });
}
