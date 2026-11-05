import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Target,
  Footprints,
  Droplets,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Sliders,
  Plus,
  RotateCcw,
  Save,
  Check,
  Zap,
  TrendingUp,
  X,
  ChevronRight,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { useAssessment } from '../context/AssessmentContext';
import {
  getWellnessTargets,
  saveWellnessTargets,
  getSevenDayConsistencyReport,
  WellnessPersonalTargets
} from '../services/wellnessTargetsService';
import { logWalkingSteps, getTodayStepRecord, DailyStepRecord } from '../services/walkingService';
import { logWaterIntake, getTodayHydrationRecord, DailyHydrationRecord } from '../services/hydrationService';
import { playNotificationSound } from '../services/soundService';

interface WellnessGoalsModuleProps {
  userId?: string;
  isDark?: boolean;
  onAskAI?: (prompt: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

const STEP_PRESETS = [
  { value: 5000, labelEn: '5k Gentle', labelTe: '5,000 ప్రారంభం', desc: 'Restorative & joint safe' },
  { value: 7500, labelEn: '7.5k Insulin Defense', labelTe: '7,500 ఇన్సులిన్ రక్షణ', desc: 'Activates skeletal GLUT4' },
  { value: 10000, labelEn: '10k Optimal Fat Burn', labelTe: '10,000 ఫ్యాట్ బర్న్', desc: 'Cardiometabolic peak' },
  { value: 12500, labelEn: '12.5k High Vitality', labelTe: '12,500 అత్యుత్తమ చురుకుదనం', desc: 'Androgen reduction' }
];

const WATER_PRESETS = [
  { value: 1800, labelEn: '1.8L Light', labelTe: '1.8 లీటర్లు', desc: '6-7 glasses / day' },
  { value: 2250, labelEn: '2.25L Balanced', labelTe: '2.25 లీటర్లు', desc: 'Standard hydration' },
  { value: 2750, labelEn: '2.75L Active PCOS', labelTe: '2.75 లీటర్లు', desc: 'Hepatic hormone clearance' },
  { value: 3200, labelEn: '3.2L High Activity', labelTe: '3.2 లీటర్లు', desc: 'Optimal during workouts' }
];

export const WellnessGoalsModule: React.FC<WellnessGoalsModuleProps> = ({
  userId,
  isDark = false,
  onAskAI,
  isModal = false,
  onClose
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();
  const { patientData } = useAssessment();
  const activeUserId = userId || user?.id || 'local-user';

  const heightCm = patientData?.['Height(Cm)'] || 162;
  const weightKg = patientData?.['Weight (Kg)'] || 62;

  const [targets, setTargets] = useState<WellnessPersonalTargets>(() =>
    getWellnessTargets(activeUserId)
  );

  // Edit state
  const [editingSteps, setEditingSteps] = useState<number>(targets.dailyStepTarget);
  const [editingWater, setEditingWater] = useState<number>(targets.dailyWaterTargetMl);
  const [editingWeeklyDays, setEditingWeeklyDays] = useState<number>(targets.weeklyActiveDaysTarget || 5);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Live Records
  const [stepRecord, setStepRecord] = useState<DailyStepRecord>(() =>
    getTodayStepRecord(activeUserId, heightCm, weightKg)
  );
  const [hydrationRecord, setHydrationRecord] = useState<DailyHydrationRecord>(() =>
    getTodayHydrationRecord(activeUserId, targets.dailyWaterTargetMl)
  );
  const [report, setReport] = useState(() => getSevenDayConsistencyReport(activeUserId));

  const refreshState = () => {
    const currentTargets = getWellnessTargets(activeUserId);
    setTargets(currentTargets);
    setEditingSteps(currentTargets.dailyStepTarget);
    setEditingWater(currentTargets.dailyWaterTargetMl);
    setEditingWeeklyDays(currentTargets.weeklyActiveDaysTarget);
    setStepRecord(getTodayStepRecord(activeUserId, heightCm, weightKg));
    setHydrationRecord(getTodayHydrationRecord(activeUserId, currentTargets.dailyWaterTargetMl));
    setReport(getSevenDayConsistencyReport(activeUserId));
  };

  useEffect(() => {
    refreshState();

    const handleUpdate = () => refreshState();
    window.addEventListener('pcosense_wellness_targets_changed', handleUpdate);
    window.addEventListener('pcosense_steps_updated', handleUpdate);
    window.addEventListener('pcosense_hydration_updated', handleUpdate);

    return () => {
      window.removeEventListener('pcosense_wellness_targets_changed', handleUpdate);
      window.removeEventListener('pcosense_steps_updated', handleUpdate);
      window.removeEventListener('pcosense_hydration_updated', handleUpdate);
    };
  }, [activeUserId, heightCm, weightKg]);

  const handleSaveTargets = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = saveWellnessTargets(
      {
        dailyStepTarget: Number(editingSteps) || 8000,
        dailyWaterTargetMl: Number(editingWater) || 2500,
        weeklyActiveDaysTarget: Number(editingWeeklyDays) || 5
      },
      activeUserId
    );

    setTargets(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    playNotificationSound('goal-achieved', true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleQuickAddSteps = (added: number = 1000) => {
    const updated = logWalkingSteps(added, activeUserId, heightCm, weightKg);
    setStepRecord(updated);
    playNotificationSound('button-click');
    if (updated.steps >= targets.dailyStepTarget && stepRecord.steps < targets.dailyStepTarget) {
      confetti({ particleCount: 50, spread: 60 });
      playNotificationSound('goal-achieved', true);
    }
  };

  const handleQuickAddWater = (addedMl: number = 250) => {
    const { updatedRecord } = logWaterIntake(addedMl, 'Goals Quick Log', activeUserId);
    setHydrationRecord(updatedRecord);
    playNotificationSound('button-click');
    if (updatedRecord.totalMl >= targets.dailyWaterTargetMl && hydrationRecord.totalMl < targets.dailyWaterTargetMl) {
      confetti({ particleCount: 50, spread: 60 });
      playNotificationSound('goal-achieved', true);
    }
  };

  // Calculations
  const stepPercent = Math.min(150, Math.round((stepRecord.steps / (targets.dailyStepTarget || 8000)) * 100));
  const waterPercent = Math.min(150, Math.round((hydrationRecord.totalMl / (targets.dailyWaterTargetMl || 2500)) * 100));
  const stepsRemaining = Math.max(0, targets.dailyStepTarget - stepRecord.steps);
  const waterRemainingMl = Math.max(0, targets.dailyWaterTargetMl - hydrationRecord.totalMl);

  // 7-day adherence percent
  const weeklyStepSuccessPercent = Math.round((report.stepGoalsMetCount / 7) * 100);
  const weeklyWaterSuccessPercent = Math.round((report.waterGoalsMetCount / 7) * 100);
  const weeklyOverallConsistency = report.avgConsistencyScore;

  const content = (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors ${
        isModal ? 'p-6 max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto' : 'p-6 sm:p-7 space-y-6'
      }`}
      id="wellness-goals-module"
    >
      {/* Header with Title and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 shadow-inner">
            <Target className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                {isTelugu ? 'వ్యక్తిగత లక్ష్యాలు' : 'Personal Targets & Progress'}
              </span>
              {saveSuccess && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <Check className="h-3 w-3" /> Saved!
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {isTelugu ? 'ఆరోగ్య & జీవనశైలి లక్ష్యాల మాడ్యూల్' : 'Wellness Goals & Consistency Engine'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isEditing
                ? 'bg-teal-800 dark:bg-teal-700 text-white border-teal-800'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{isEditing ? (isTelugu ? 'ఎడిట్ ముగించండి' : 'Close Editor') : (isTelugu ? 'లక్ష్యాలను మార్చండి' : 'Customize Targets')}</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* TARGET EDITING ACCORDION / FORM */}
      <AnimatePresence>
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveTargets}
            className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-800/60 pb-2">
              <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'మీ వ్యక్తిగత రోజువారీ పరిమితులను ఎంచుకోండి' : 'Configure Your Personal Daily Targets'}</span>
              </h4>
              <span className="text-[10px] text-teal-700 dark:text-teal-300">
                PCOS Metabolic Recommendations
              </span>
            </div>

            {/* Target 1: Daily Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Footprints className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isTelugu ? 'రోజువారీ నడక లక్ష్యం (అడుగులు):' : 'Daily Step Target:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3000"
                    max="25000"
                    step="500"
                    value={editingSteps}
                    onChange={(e) => setEditingSteps(Number(e.target.value))}
                    className="w-24 text-right px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-semibold text-slate-500">steps</span>
                </div>
              </div>

              {/* Step Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STEP_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditingSteps(preset.value)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      editingSteps === preset.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{isTelugu ? preset.labelTe : preset.labelEn}</div>
                    <div className={`text-[10px] truncate ${editingSteps === preset.value ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="3000"
                max="20000"
                step="500"
                value={editingSteps}
                onChange={(e) => setEditingSteps(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Target 2: Daily Water (mL) */}
            <div className="space-y-2 pt-2 border-t border-teal-200/50 dark:border-teal-800/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span>{isTelugu ? 'రోజువారీ నీటి లక్ష్యం (mL):' : 'Daily Water Intake Target:'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1200"
                    max="5000"
                    step="100"
                    value={editingWater}
                    onChange={(e) => setEditingWater(Number(e.target.value))}
                    className="w-24 text-right px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-semibold text-slate-500">mL</span>
                </div>
              </div>

              {/* Water Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WATER_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setEditingWater(preset.value)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      editingWater === preset.value
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{isTelugu ? preset.labelTe : preset.labelEn}</div>
                    <div className={`text-[10px] truncate ${editingWater === preset.value ? 'text-sky-100' : 'text-slate-400'}`}>
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="1200"
                max="4500"
                step="100"
                value={editingWater}
                onChange={(e) => setEditingWater(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Target 3: Weekly Active Days */}
            <div className="flex items-center justify-between pt-2 border-t border-teal-200/50 dark:border-teal-800/50">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'వారంలో లక్ష్య సాధన రోజులు:' : 'Weekly Active Days Goal:'}
                </label>
                <p className="text-[10px] text-slate-500">
                  {isTelugu ? 'కనీసం 5 రోజులు సిఫారసు చేయబడింది' : '5+ days recommended for insulin stabilization'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[3, 4, 5, 6, 7].map((daysCount) => (
                  <button
                    key={daysCount}
                    type="button"
                    onClick={() => setEditingWeeklyDays(daysCount)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all border ${
                      editingWeeklyDays === daysCount
                        ? 'bg-teal-800 dark:bg-teal-600 text-white border-teal-800'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {daysCount}d
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isTelugu ? 'రద్దు' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'లక్ష్యాలను భద్రపరచండి' : 'Save Personal Targets'}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 1. TODAY'S REAL-TIME PROGRESS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Progress Bar 1: Steps */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <Footprints className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'నేటి అడుగుల లక్ష్యం' : "Today's Steps Target"}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Target: {targets.dailyStepTarget.toLocaleString()} steps
                </p>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              stepPercent >= 100
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {stepPercent}% {stepPercent >= 100 && '🎉'}
            </span>
          </div>

          {/* Steps Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stepPercent >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : stepPercent >= 60
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, stepPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>
                <strong className="text-slate-900 dark:text-white font-bold">{stepRecord.steps.toLocaleString()}</strong> logged
              </span>
              <span>
                {stepsRemaining > 0 ? `${stepsRemaining.toLocaleString()} steps remaining` : 'Target Achieved!'}
              </span>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 font-semibold">{isTelugu ? 'త్వరిత నమోదు:' : 'Quick Add:'}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickAddSteps(500)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddSteps(1000)}
                className="px-2.5 py-1 rounded-lg bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                +1,000 steps
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar 2: Water Intake */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'నేటి నీటి లక్ష్యం' : "Today's Hydration Target"}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Target: {targets.dailyWaterTargetMl.toLocaleString()} mL ({Math.round(targets.dailyWaterTargetMl / 250)} glasses)
                </p>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              waterPercent >= 100
                ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {waterPercent}% {waterPercent >= 100 && '💧'}
            </span>
          </div>

          {/* Water Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  waterPercent >= 100
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                    : waterPercent >= 60
                    ? 'bg-gradient-to-r from-sky-500 to-blue-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, waterPercent)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <span>
                <strong className="text-slate-900 dark:text-white font-bold">{hydrationRecord.totalMl.toLocaleString()}</strong> mL logged
              </span>
              <span>
                {waterRemainingMl > 0 ? `${waterRemainingMl.toLocaleString()} mL left` : 'Optimal Hydration!'}
              </span>
            </div>
          </div>

          {/* Quick Water Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 font-semibold">{isTelugu ? 'త్వరిత నమోదు:' : 'Quick Drink:'}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickAddWater(250)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                +250 mL Glass
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddWater(500)}
                className="px-2.5 py-1 rounded-lg bg-sky-800 dark:bg-sky-700 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                +500 mL Bottle
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 2. 7-DAY SUCCESS OVER TIME PROGRESS & DAY CARDS */}
      <div className="p-5 rounded-3xl bg-teal-50/40 dark:bg-slate-800/40 border border-teal-200/70 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {isTelugu ? 'కాలక్రమేణా లక్ష్య సాధన ప్రగతి' : 'Success Over Time (7-Day Adherence Matrix)'}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isTelugu ? 'వారపు నిలకడ విశ్లేషణ' : 'Weekly Goal Attainment & Consistency Progress'}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-100 dark:bg-teal-950 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
              {report.stepGoalsMetCount} of 7 Step Days • {report.waterGoalsMetCount} of 7 Water Days
            </span>
          </div>
        </div>

        {/* 7-Day Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isTelugu ? 'మొత్తం నిలకడ సూచిక:' : 'Overall Habit Consistency:'}
            </span>
            <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
              {weeklyOverallConsistency}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${weeklyOverallConsistency}%` }}
            />
          </div>
        </div>

        {/* 7 Days Matrix Pill Checkers */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {report.days.map((day) => (
            <div
              key={day.dateKey}
              className={`p-2 rounded-xl text-center border transition-all ${
                day.isToday
                  ? 'bg-teal-100 dark:bg-teal-950 border-teal-400 dark:border-teal-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {day.dayLabel}
              </div>
              <div className="flex justify-center items-center gap-0.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    day.stepMet ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={`Steps: ${day.steps.toLocaleString()}`}
                />
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    day.waterMet ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={`Water: ${day.waterMl} mL`}
                />
              </div>
              <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                {day.consistencyScore}%
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Note on Habit Consistency */}
        <div className="flex items-center gap-2 pt-2 text-[11px] text-teal-900 dark:text-teal-200 border-t border-teal-200/60 dark:border-slate-700">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isTelugu
              ? 'వారంలో 5+ రోజులు మీ లక్ష్యాలను సాధించడం వల్ల ఇన్సులిన్ నిరోధకత తగ్గి, పీరియడ్స్ క్రమబద్ధత మెరుగుపడుతుంది.'
              : 'Consistent 5+ day adherence directly attenuates postprandial glucose surges and enhances follicular maturation.'}
          </span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        {content}
      </div>
    );
  }

  return content;
};
