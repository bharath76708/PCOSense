import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Footprints,
  Droplets,
  Flame,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useLanguage } from '../translations';
import {
  getTodayStepRecord,
  logWalkingSteps,
  DailyStepRecord
} from '../services/walkingService';
import {
  getTodayHydrationRecord,
  logWaterIntake,
  getNextHydrationAlertInfo,
  getHydrationSettings,
  DailyHydrationRecord
} from '../services/hydrationService';

export const WalkingHydrationDashboardWidget: React.FC = () => {
  const { user } = useAuth();
  const { patientData } = useAssessment();
  const { isTelugu } = useLanguage();

  const heightCm = patientData?.['Height(Cm)'] || 162;
  const weightKg = patientData?.['Weight (Kg)'] || 62;

  const [stepRecord, setStepRecord] = useState<DailyStepRecord>(() =>
    getTodayStepRecord(user?.uid, heightCm, weightKg)
  );
  const [hydrationRecord, setHydrationRecord] = useState<DailyHydrationRecord>(() =>
    getTodayHydrationRecord(user?.uid)
  );
  const [customStepsInput, setCustomStepsInput] = useState<string>('');
  const [showCustomStepModal, setShowCustomStepModal] = useState<boolean>(false);
  const [recentlyDrank, setRecentlyDrank] = useState<boolean>(false);

  useEffect(() => {
    setStepRecord(getTodayStepRecord(user?.uid, heightCm, weightKg));
    setHydrationRecord(getTodayHydrationRecord(user?.uid));
  }, [user, heightCm, weightKg]);

  const handleAddSteps = (steps: number) => {
    const updated = logWalkingSteps(steps, user?.uid, heightCm, weightKg);
    setStepRecord(updated);
  };

  const handleDrinkWater = (amountMl: number = 250) => {
    const { updatedRecord } = logWaterIntake(amountMl, 'Dashboard Quick Taken', user?.uid);
    setHydrationRecord(updatedRecord);
    setRecentlyDrank(true);
    setTimeout(() => setRecentlyDrank(false), 2500);
  };

  const stepPercent = Math.min(100, Math.round((stepRecord.steps / stepRecord.goalSteps) * 100));
  const waterPercent = Math.min(100, Math.round((hydrationRecord.totalMl / hydrationRecord.targetMl) * 100));
  const settings = getHydrationSettings();
  const alertInfo = getNextHydrationAlertInfo(hydrationRecord, settings);

  return (
    <div
      className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden"
      id="dashboard-walking-hydration-widget"
    >
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-[11px]">
              <Sparkles className="h-3 w-3" />
              {isTelugu ? 'దినచర్య & లైఫ్‌స్టైల్ ట్రాకర్' : 'Daily Movement & Hydration Matrix'}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {stepRecord.dateFormatted}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isTelugu ? 'నడక & వాటర్ ట్రాకింగ్' : 'Walking Steps & Smart Hydration'}
          </h2>
        </div>

        <Link
          to="/activity-tracker"
          className="inline-flex items-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 hover:text-teal-200 border border-teal-500/40 text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
          id="view-full-activity-reports-btn"
        >
          <span>{isTelugu ? 'వారం / నెల నివేదికలు' : 'Day, Week & Month Reports'}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid: Walking vs Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
        {/* 1. WALKING ACTIVITY CARD */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-5 space-y-4 flex flex-col justify-between backdrop-blur-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black">
                  <Footprints className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isTelugu ? 'నేటి అడుగులు' : 'Today’s Walking Steps'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white font-mono">
                      {stepRecord.steps.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {stepRecord.goalSteps.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-teal-400 font-mono">
                  {stepPercent}%
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {isTelugu ? 'లక్ష్యం పూర్తయింది' : 'Goal Met'}
                </span>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-300"
                style={{ width: `${stepPercent}%` }}
              />
            </div>

            {/* Stats Trio: Distance, Calories, Active Minutes */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isTelugu ? 'దూరం' : 'Distance'}
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {stepRecord.distanceKm} <span className="text-[10px] font-normal text-slate-400">km</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isTelugu ? 'కేలరీలు' : 'Burned'}
                </span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {stepRecord.caloriesBurned} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  {isTelugu ? 'సమయం' : 'Active'}
                </span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {stepRecord.activeMinutes} <span className="text-[10px] font-normal text-slate-400">min</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Step Buttons */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              {isTelugu ? 'త్వరిత అడుగులు:' : 'Quick Log:'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddSteps(500)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-700/80 hover:bg-teal-600 hover:text-white text-slate-200 transition-colors"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleAddSteps(1000)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-700/80 hover:bg-teal-600 hover:text-white text-slate-200 transition-colors"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => handleAddSteps(2500)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-600/40 hover:bg-teal-500 text-teal-200 hover:text-slate-950 font-mono transition-colors"
              >
                +2,500
              </button>
            </div>
          </div>
        </div>

        {/* 2. SMART HYDRATION ALERT CARD */}
        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-5 space-y-4 flex flex-col justify-between backdrop-blur-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isTelugu ? 'నీటి హైడ్రేషన్' : 'Today’s Water Hydration'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white font-mono">
                      {hydrationRecord.totalMl.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {hydrationRecord.targetMl.toLocaleString()} ml
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-cyan-400 font-mono">
                  {waterPercent}%
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {hydrationRecord.glassesConsumed} / {hydrationRecord.targetGlasses} {isTelugu ? 'గ్లాసులు' : 'Glasses'}
                </span>
              </div>
            </div>

            {/* Hydration Progress Bar */}
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-300 rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            {/* Next Drinking Reminder Banner */}
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {isTelugu ? 'తదుపరి రిమైండర్' : 'Next Drinking Alert:'}
                  </span>
                  <span className="font-bold text-cyan-200">
                    {alertInfo.nextScheduledTime} ({alertInfo.minutesRemaining}m remaining)
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-900/60 text-cyan-300 font-bold">
                {isTelugu ? 'ఆండ్రోజెన్ ఫ్లష్' : 'PCOS Detox'}
              </span>
            </div>
          </div>

          {/* Instant "Taken" Action Button */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDrinkWater(250)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors"
              id="dashboard-widget-take-water-btn"
            >
              {recentlyDrank ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-slate-950" />
                  <span>{isTelugu ? 'నీరు తాగారు! (+250ml)' : 'Logged 250ml! 💧'}</span>
                </>
              ) : (
                <>
                  <Droplets className="h-4 w-4 fill-slate-950" />
                  <span>{isTelugu ? 'నీరు త్రాగాను / Taken (+250ml)' : 'I Drank Water / Taken (+250ml)'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDrinkWater(500)}
              className="px-3 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              title={isTelugu ? 'సీసా నీరు తాగండి (500ml)' : 'Log 1 Bottle (500ml)'}
            >
              +500ml
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
