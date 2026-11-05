import React, { useState, useEffect } from 'react';
import {
  Droplets,
  CheckCircle2,
  BellRing,
  X,
  Plus,
  Clock,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import {
  getTodayHydrationRecord,
  getHydrationSettings,
  logWaterIntake,
  getNextHydrationAlertInfo,
  DailyHydrationRecord,
  HydrationReminderSettings
} from '../services/hydrationService';
import { playNotificationSound } from '../services/soundService';

export const WaterReminderNotificationBar: React.FC = () => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  // Only keep water reminder notification on patient/user side; remove from doctor and admin sides
  const isDoctorOrAdmin =
    user?.role === 'doctor' ||
    user?.role === 'admin' ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/doctor') ||
      window.location.pathname.startsWith('/admin')
    ));

  const [record, setRecord] = useState<DailyHydrationRecord>(() => getTodayHydrationRecord(user?.uid));
  const [settings, setSettings] = useState<HydrationReminderSettings>(() => getHydrationSettings());
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [justDrank, setJustDrank] = useState<boolean>(false);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  // Sync record on mount and periodically
  useEffect(() => {
    if (isDoctorOrAdmin) {
      setIsAlertVisible(false);
      return;
    }

    const updateState = () => {
      const currentRec = getTodayHydrationRecord(user?.uid);
      const currentSet = getHydrationSettings();
      setRecord(currentRec);
      setSettings(currentSet);

      if (!currentSet.enabled) {
        setIsAlertVisible(false);
        return;
      }

      const alertInfo = getNextHydrationAlertInfo(currentRec, currentSet);
      const now = Date.now();

      // If alert is overdue and not temporarily dismissed
      if (alertInfo.isOverdue && now > dismissedUntil) {
        setIsAlertVisible(true);
      }
    };

    updateState();
    const interval = setInterval(updateState, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [user, dismissedUntil, isDoctorOrAdmin]);

  const handleTakeWater = (amountMl: number = 250, checkpointLabel?: string) => {
    const { updatedRecord } = logWaterIntake(amountMl, checkpointLabel, user?.uid);
    setRecord(updatedRecord);
    setJustDrank(true);
    setTimeout(() => {
      setJustDrank(false);
      setIsAlertVisible(false);
    }, 2400);
    // Dismiss reminder for the full interval duration
    setDismissedUntil(Date.now() + (settings.intervalMinutes || 90) * 60 * 1000);
  };

  const handleDismiss = () => {
    setIsAlertVisible(false);
    // Snooze for 15 minutes
    setDismissedUntil(Date.now() + 15 * 60 * 1000);
  };

  const alertInfo = getNextHydrationAlertInfo(record, settings);
  const percentComplete = Math.min(100, Math.round((record.totalMl / record.targetMl) * 100));

  // If doctor, admin, reminder not visible, or hydration disabled, render nothing
  if (isDoctorOrAdmin || (!isAlertVisible && !justDrank)) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-cyan-500/40 shadow-2xl p-4 backdrop-blur-md transition-all duration-200"
      id="water-hydration-alert-popup"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
            {justDrank ? (
              <CheckCircle2 className="h-6 w-6 text-slate-950" />
            ) : (
              <Droplets className="h-6 w-6 text-slate-950 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                {isTelugu ? 'హైడ్రేషన్ రిమైండర్' : 'Hydration Reminder'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60">
                {record.totalMl} / {record.targetMl} ml
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-white leading-snug">
              {justDrank
                ? (isTelugu ? 'అద్భుతం! నీటిని తాగారు 💧' : 'Great Job! Hydration Logged 💧')
                : (isTelugu ? 'నీరు త్రాగే సమయం వచ్చింది!' : 'Time for a Refreshing Glass of Water!')}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isTelugu ? 'తర్వాత గుర్తుచేయండి' : 'Snooze'}
          id="dismiss-water-alert-btn"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!justDrank && (
        <div className="mt-2.5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {alertInfo.suggestedCheckpoint
              ? (isTelugu ? alertInfo.suggestedCheckpoint.pcosBenefitTe || alertInfo.suggestedCheckpoint.pcosBenefit : alertInfo.suggestedCheckpoint.pcosBenefit)
              : (isTelugu ? 'తగినంత నీరు త్రాగడం వల్ల ఇన్సులిన్ నిరోధకత తగ్గి, హార్మోన్ల సమతుల్యత మెరుగవుతుంది.' : 'Drinking 250ml water now aids androgen clearance and prevents insulin spikes.')}
          </p>

          {/* Quick Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{isTelugu ? 'నేటి లక్ష్యం' : "Today's Target"} ({percentComplete}%)</span>
              <span>{record.glassesConsumed} / {record.targetGlasses} {isTelugu ? 'గ్లాసులు' : 'Glasses'}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Primary 1-Click "Taken" Action */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTakeWater(250, alertInfo.suggestedCheckpoint?.label || 'Water Alert Taken')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors"
              id="water-alert-take-glass-btn"
            >
              <Droplets className="h-4 w-4 fill-slate-950" />
              <span>{isTelugu ? 'నీరు త్రాగాను (+250ml)' : 'I Drank Water / Taken (+250ml)'}</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              {isTelugu ? '15 నిమిషాల తర్వాత' : '15m Later'}
            </button>
          </div>
        </div>
      )}

      {justDrank && (
        <div className="mt-2.5 p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-center text-xs font-bold text-cyan-300 animate-pulse">
          ✓ {isTelugu ? '250ml నమోదు చేయబడింది. తదుపరి రిమైండర్ షెడ్యూల్ చేయబడింది.' : '250ml recorded & synced! Next alert set.'}
        </div>
      )}
    </div>
  );
};
