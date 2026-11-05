import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ChefHat
} from 'lucide-react';
import { useLanguage } from '../translations';
import { RecipeItem, MealCategory } from '../types';
import {
  MealPrepReminder,
  MealPrepNotificationSettings,
  getMealPrepSettings,
  saveMealPrepSettings,
  calculateTodayMealPrepSchedule,
  triggerMealPrepAlert,
  subscribeToMealPrepAlerts,
  requestNotificationPermission,
  playGentleMealChime
} from '../services/mealPrepNotificationService';

interface MealPrepNotificationBannerProps {
  todayMeals: Record<string, RecipeItem | undefined>;
  onOpenRecipe: (recipe: RecipeItem) => void;
  onOpenCookingTimer?: (recipe: RecipeItem) => void;
}

export const MealPrepNotificationBanner: React.FC<MealPrepNotificationBannerProps> = ({
  todayMeals,
  onOpenRecipe,
  onOpenCookingTimer
}) => {
  const { isTelugu } = useLanguage();
  const [settings, setSettings] = useState<MealPrepNotificationSettings>(() => getMealPrepSettings());
  const [schedule, setSchedule] = useState<MealPrepReminder[]>([]);
  const [activeAlert, setActiveAlert] = useState<MealPrepReminder | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');
  const [hasTested, setHasTested] = useState(false);

  // Recalculate schedule whenever todayMeals or settings change
  useEffect(() => {
    const s = calculateTodayMealPrepSchedule(todayMeals, settings);
    setSchedule(s);
  }, [todayMeals, settings]);

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Subscribe to alert triggers
  useEffect(() => {
    const unsubscribe = subscribeToMealPrepAlerts(reminder => {
      setActiveAlert(reminder);
    });
    return () => unsubscribe();
  }, []);

  // Periodic check (every 30s) to see if an alert is due
  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      schedule.forEach(item => {
        // If within 1 minute of prep time and hasn't been fired/dismissed
        const diffMs = item.calculatedPrepTimestamp - now;
        if (diffMs >= -60000 && diffMs <= 30000 && item.status === 'upcoming') {
          triggerMealPrepAlert(item);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [schedule, settings.enabled]);

  const toggleEnabled = () => {
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    saveMealPrepSettings(next);
  };

  const toggleSound = () => {
    const next = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(next);
    saveMealPrepSettings(next);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
  };

  const handleTestAlert = () => {
    // Pick the first upcoming meal, or fallback to first available
    const targetMeal = schedule.find(s => s.status === 'upcoming') || schedule[0];
    if (targetMeal) {
      setHasTested(true);
      triggerMealPrepAlert({
        ...targetMeal,
        status: 'due'
      });
      setTimeout(() => setHasTested(false), 3000);
    }
  };

  // Find next upcoming meal prep
  const now = Date.now();
  const nextPrep = schedule.find(item => item.calculatedPrepTimestamp > now);

  const getMinutesUntil = (timestamp: number) => {
    const diff = Math.max(0, Math.round((timestamp - now) / 60000));
    if (diff < 60) return `${diff} min${diff === 1 ? '' : 's'}`;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <>
      {/* Interactive Active Alert Toast Banner */}
      {activeAlert && (
        <div
          id="active-meal-prep-alert-toast"
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-bounce-short bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-500 dark:border-teal-400 p-4 shadow-2xl space-y-3"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-300 dark:border-teal-700 shadow-2xs">
                <ChefHat className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {isTelugu ? 'వంట సన్నాహక హెచ్చరిక (Meal Prep Reminder)' : 'Meal Prep Reminder Alert'}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {isTelugu
                    ? `${activeAlert.mealLabelTe} కోసం సమయం ఆసన్నమైంది!`
                    : `Time to Start Prepping ${activeAlert.mealLabel}!`}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                  {isTelugu ? (
                    <>
                      <strong>{activeAlert.recipeNameTe || activeAlert.recipeName}</strong> తయారీకి <strong>{activeAlert.prepTimeMinutes} నిమిషాల</strong> సన్నాహక సమయం పడుతుంది. మీ భోజన సమయం: {activeAlert.scheduledMealTime}.
                    </>
                  ) : (
                    <>
                      <strong>{activeAlert.recipeName}</strong> requires <strong>{activeAlert.prepTimeMinutes} min</strong> prep before your scheduled {activeAlert.scheduledMealTime} meal.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Alert Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            {onOpenCookingTimer && (
              <button
                type="button"
                onClick={() => {
                  const recipe = todayMeals[activeAlert.mealCategory];
                  if (recipe) onOpenCookingTimer(recipe);
                  setActiveAlert(null);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{isTelugu ? `${activeAlert.prepTimeMinutes} ని. టైమర్ ప్రారంభించు` : `Start ${activeAlert.prepTimeMinutes}m Timer`}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const recipe = todayMeals[activeAlert.mealCategory];
                if (recipe) onOpenRecipe(recipe);
                setActiveAlert(null);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              {isTelugu ? 'వంట విధానం' : 'View Recipe'}
            </button>

            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="py-1.5 px-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold"
            >
              {isTelugu ? 'తర్వాత' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* Main Meal Prep Notification Ribbon in DietPlanPage */}
      <div
        id="meal-prep-notification-manager"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4.5 shadow-2xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                settings.enabled
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              {settings.enabled ? (
                <BellRing className="h-4.5 w-4.5 animate-pulse" />
              ) : (
                <Bell className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {isTelugu ? 'మీల్ ప్రిపరేషన్ రిమైండర్ అలర్ట్స్' : 'Meal Prep Time Reminders'}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    settings.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {settings.enabled ? (isTelugu ? 'యాక్టివ్' : 'Active') : (isTelugu ? 'పాజ్ చేయబడింది' : 'Paused')}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {nextPrep ? (
                  isTelugu ? (
                    <>
                      తదుపరి: <strong>{nextPrep.mealLabelTe}</strong> సన్నాహకం <strong>{nextPrep.calculatedPrepTime}</strong> వద్ద ({getMinutesUntil(nextPrep.calculatedPrepTimestamp)} లోపు)
                    </>
                  ) : (
                    <>
                      Next up: <strong>{nextPrep.mealLabel}</strong> prep starts at <strong>{nextPrep.calculatedPrepTime}</strong> (in {getMinutesUntil(nextPrep.calculatedPrepTimestamp)})
                    </>
                  )
                ) : (
                  isTelugu
                    ? 'నేటి అన్ని భోజనాల సన్నాహక సమయాలు పూర్తయ్యాయి!'
                    : "Today's scheduled prep alerts are completed!"
                )}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={settings.soundEnabled ? 'Mute Chime' : 'Enable Chime'}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
              id="toggle-prep-audio-btn"
            >
              {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Test Alert Button */}
            <button
              type="button"
              onClick={handleTestAlert}
              className="px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 hover:bg-teal-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              id="test-meal-prep-alert-btn"
            >
              <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span>{hasTested ? (isTelugu ? 'పరీక్షించబడింది!' : 'Triggered!') : (isTelugu ? 'టెస్ట్ అలర్ట్' : 'Test Alert')}</span>
            </button>

            {/* Browser Permission Prompt if not granted */}
            {permissionState !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all"
                id="enable-browser-notifications-btn"
              >
                {isTelugu ? 'బ్రౌజర్ నోటిఫికేషన్లు ఆన్ చేయండి' : 'Enable Browser Alerts'}
              </button>
            )}

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={toggleEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.enabled}
              id="toggle-meal-prep-master-btn"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Toggle Daily Schedule Drawer */}
            <button
              type="button"
              onClick={() => setIsScheduleOpen(prev => !prev)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
              title={isScheduleOpen ? 'Hide Prep Schedule' : 'View Prep Schedule'}
              id="toggle-prep-schedule-drawer-btn"
            >
              {isScheduleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Daily Prep Schedule Timeline Drawer */}
        {isScheduleOpen && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'నేటి వంట సన్నాహక కాలపట్టిక (Today\'s Prep Schedule):' : 'Today\'s Meal Prep Schedule & Lead Times:'}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isTelugu ? 'ప్రతి వంటకం ప్రిపరేషన్ సమయం ఆధారంగా లెక్కించబడింది' : 'Calculated strictly from each recipe\'s prep time indicator'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {schedule.map(item => {
                const isPassed = item.calculatedPrepTimestamp < now;
                const recipe = todayMeals[item.mealCategory];

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isPassed
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-500'
                        : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/70 dark:border-teal-900/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-teal-800 dark:text-teal-300">
                        {isTelugu ? item.mealLabelTe : item.mealLabel}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white">
                        {item.calculatedPrepTime}
                      </span>
                    </div>

                    <p className="font-semibold truncate text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                      {isTelugu && item.recipeNameTe ? item.recipeNameTe : item.recipeName}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/60 pt-1">
                      <span>{item.prepTimeMinutes}m prep • {item.cookTimeMinutes}m cook</span>
                      {recipe && (
                        <button
                          type="button"
                          onClick={() => onOpenRecipe(recipe)}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                        >
                          {isTelugu ? 'వంటకం చూడండి' : 'View'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
