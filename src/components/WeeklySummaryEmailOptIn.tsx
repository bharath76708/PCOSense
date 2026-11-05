import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  CheckCircle2,
  Bell,
  Sparkles,
  Calendar,
  Activity,
  Flame,
  Target,
  Send,
  Eye,
  Sliders,
  X,
  Clock,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { AssessmentHistoryItem } from '../types';

export interface WeeklyEmailSettings {
  enabled: boolean;
  email: string;
  deliveryDay: 'Sunday' | 'Monday' | 'Friday';
  deliveryTime: 'morning' | 'evening';
  includeRiskScore: boolean;
  includeGoalsProgress: boolean;
  includeHabitBreakdown: boolean;
  includeLifestyleTip: boolean;
  includeDoctorNotes: boolean;
  lastSentTimestamp?: string;
}

export const DEFAULT_WEEKLY_EMAIL_SETTINGS: WeeklyEmailSettings = {
  enabled: true,
  email: '',
  deliveryDay: 'Sunday',
  deliveryTime: 'evening',
  includeRiskScore: true,
  includeGoalsProgress: true,
  includeHabitBreakdown: true,
  includeLifestyleTip: true,
  includeDoctorNotes: true
};

interface WeeklySummaryEmailOptInProps {
  userEmail?: string;
  history?: AssessmentHistoryItem[];
  currentRiskScore?: number;
  streak?: number;
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

export const WeeklySummaryEmailOptIn: React.FC<WeeklySummaryEmailOptInProps> = ({
  userEmail = '',
  history = [],
  currentRiskScore = 32.4,
  streak = 5,
  onAskAI,
  isDark = false
}) => {
  const storageKey = 'pcosense_weekly_email_settings';

  const [settings, setSettings] = useState<WeeklyEmailSettings>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_WEEKLY_EMAIL_SETTINGS, ...parsed, email: parsed.email || userEmail };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_WEEKLY_EMAIL_SETTINGS, email: userEmail || 'patient@example.com' };
  });

  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Sync userEmail when updated
  useEffect(() => {
    if (userEmail && !settings.email) {
      setSettings(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  // Persist settings
  const updateSettings = (partial: Partial<WeeklyEmailSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Calculate 7-day average risk score
  const recentItems = history.slice(0, 5);
  const avgRiskScore =
    recentItems.length > 0
      ? recentItems.reduce((acc, item) => acc + item.probability, 0) / recentItems.length
      : currentRiskScore;

  // Simulate sending a test weekly digest email
  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      updateSettings({ lastSentTimestamp: new Date().toISOString() });
      setToastMessage(`Test weekly summary digest sent to ${settings.email || userEmail || 'your email'}!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    }, 1000);
  };

  return (
    <div
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 transition-all"
      id="weekly-summary-email-opt-in-widget"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <Mail className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Weekly Health Summary & Goals Progress Email
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  settings.enabled
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {settings.enabled ? 'Opted In' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Receive an automated weekly executive digest with your average risk score trajectory, active habit streaks, and proactive clinical recommendations.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`relative inline-flex h-7 w-13 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-700 ${
              settings.enabled ? 'bg-teal-700' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle weekly email digest"
            id="weekly-email-opt-in-toggle"
          >
            <motion.div
              className="h-5 w-5 rounded-full bg-white shadow-md"
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{ marginLeft: settings.enabled ? 'auto' : '0' }}
            />
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Configuration & Day Preference */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Recipient Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={settings.email}
                onChange={e => updateSettings({ email: e.target.value })}
                placeholder="name@example.com"
                disabled={!settings.enabled}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              We respect your privacy. Medical digests are securely dispatched directly to your inbox.
            </p>
          </div>

          {/* Delivery Schedule Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Delivery Day</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Sunday', 'Monday', 'Friday'] as const).map(day => (
                  <button
                    key={day}
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ deliveryDay: day })}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      settings.deliveryDay === day
                        ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    } disabled:opacity-50`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Preferred Time</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { key: 'morning', label: 'Morning (8 AM)' },
                    { key: 'evening', label: 'Evening (7 PM)' }
                  ] as const
                ).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    disabled={!settings.enabled}
                    onClick={() => updateSettings({ deliveryTime: t.key })}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      settings.deliveryTime === t.key
                        ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    } disabled:opacity-50`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
              id="preview-weekly-email-modal-btn"
            >
              <Eye className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Preview Sample Digest</span>
            </button>

            <button
              type="button"
              disabled={!settings.enabled || isSendingTest}
              onClick={handleSendTestEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              id="send-test-digest-btn"
            >
              {isSendingTest ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Test Digest Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Digest Inclusions Checklist */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Digest Report Inclusions
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Customizable</span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'includeRiskScore',
                label: '7-Day Average Risk Score & Trajectory',
                sub: `Calculated from your screenings (~${avgRiskScore.toFixed(1)}% current)`,
                checked: settings.includeRiskScore
              },
              {
                id: 'includeGoalsProgress',
                label: 'Daily Goals Completion Rate & Streak',
                sub: `Tracks adherence to your targets (${streak}-day streak active)`,
                checked: settings.includeGoalsProgress
              },
              {
                id: 'includeHabitBreakdown',
                label: 'Metabolic & Nutritional Habits Breakdown',
                sub: 'Hydration, inositol, low-GI meals, and resistance movement',
                checked: settings.includeHabitBreakdown
              },
              {
                id: 'includeLifestyleTip',
                label: 'Proactive Clinical Lifestyle Tip of the Week',
                sub: 'Evidence-based advice based on your Rotterdam phenotype',
                checked: settings.includeLifestyleTip
              },
              {
                id: 'includeDoctorNotes',
                label: 'Physician Discussion Prep Points',
                sub: 'Concise talking points for upcoming appointments',
                checked: settings.includeDoctorNotes
              }
            ].map(item => (
              <label
                key={item.id}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  disabled={!settings.enabled}
                  checked={item.checked}
                  onChange={e =>
                    updateSettings({ [item.id as keyof WeeklyEmailSettings]: e.target.checked })
                  }
                  className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600 dark:bg-slate-900 dark:border-slate-700"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {item.sub}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessToast(false)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Email Newsletter Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-100 dark:bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Email Digest Preview (HTML Client View)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Realistic Email Body Render */}
              <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-sans space-y-6">
                {/* Email Mock Container */}
                <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-left">
                  {/* Email Brand Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-black tracking-widest text-teal-800 dark:text-teal-400 uppercase">
                        PCOSense AI
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        Your Weekly Health & Progress Digest
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {settings.deliveryDay} Edition
                    </span>
                  </div>

                  {/* Greeting */}
                  <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Hello, {settings.email ? settings.email.split('@')[0] : 'Patient'} 👋
                    </p>
                    <p className="leading-relaxed">
                      Here is your personalized weekly PCOS metabolic overview and habit tracking summary for the past 7 days.
                    </p>
                  </div>

                  {/* Section 1: 7-Day Average Risk Score */}
                  {settings.includeRiskScore && (
                    <div className="rounded-2xl p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" />
                          <span>7-Day Average Risk Probability</span>
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                          {avgRiskScore < 40 ? 'Low Risk' : avgRiskScore < 70 ? 'Moderate' : 'Elevated'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-950 dark:text-white">
                          {avgRiskScore.toFixed(1)}%
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          ↓ -1.8% vs previous week
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your symptom profile and metabolic markers remain in a favorable trajectory with reduced fasting glucose variability.
                      </p>
                    </div>
                  )}

                  {/* Section 2: Goals Progress & Streak */}
                  {settings.includeGoalsProgress && (
                    <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Daily Health Goals Consistency</span>
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>{streak}-Day Active Streak</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          <span>Weekly Target Completion</span>
                          <span className="text-teal-700 dark:text-teal-300 font-bold">86% Done</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full w-[86%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Habits Breakdown */}
                  {settings.includeHabitBreakdown && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Top Habit Highlights
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="font-bold text-slate-900 dark:text-white">Hydration (2.5L)</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">7/7 days completed</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="font-bold text-slate-900 dark:text-white">Myo-Inositol (40:1)</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">6/7 days completed</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Proactive Lifestyle Tip */}
                  {settings.includeLifestyleTip && (
                    <div className="rounded-2xl p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        <span>Clinical Tip of the Week</span>
                      </span>
                      <p className="text-xs text-indigo-950 dark:text-indigo-200 font-semibold">
                        Post-Prandial Movement for Insulin Clearance
                      </p>
                      <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                        A 10–15 minute gentle walk immediately after dinner stimulates GLUT-4 transporter translocation in skeletal muscle without requiring insulin, significantly blunting nocturnal glucose spikes.
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center space-y-1">
                    <p>PCOSense AI Medical Screening Platform • Automated Weekly Digest</p>
                    <p>To update preferences or unsubscribe, manage settings in your Dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleSendTestEmail();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send This Digest Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
