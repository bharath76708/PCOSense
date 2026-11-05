import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Info,
  CheckCircle2,
  CalendarCheck,
  Heart,
  Droplet,
  SunMedium
} from 'lucide-react';
import { DailySymptomLog, PatientRecord } from '../types';
import { useLanguage } from '../translations';
import { exportCyclePredictionsPDF } from '../utils/pdfExport';

interface UpcomingCyclePredictionWidgetProps {
  symptomLogs?: DailySymptomLog[];
  patientData?: PatientRecord | null;
  onOpenLogModal?: () => void;
}

export interface CyclePredictionData {
  lastPeriodStartDate: Date;
  lastPeriodFormatted: string;
  calculatedCycleLength: number;
  currentCycleDay: number;
  currentPhaseName: string;
  currentPhaseDesc: string;
  currentPhaseIcon: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  nextPeriodStartDate: Date;
  nextPeriodFormatted: string;
  daysUntilNextPeriod: number;
  subsequentCycles: {
    cycleNumber: number;
    startDate: Date;
    startFormatted: string;
    ovulationDate: Date;
    ovulationFormatted: string;
    pmsAlertDate: Date;
    pmsAlertFormatted: string;
  }[];
  confidenceLevel: 'High' | 'Moderate' | 'Irregular (PCOS Dynamic)';
  hasIrregularityFlag: boolean;
}

export const UpcomingCyclePredictionWidget: React.FC<UpcomingCyclePredictionWidgetProps> = ({
  symptomLogs = [],
  patientData,
  onOpenLogModal
}) => {
  const { isTelugu } = useLanguage();
  const [cycleDaysOverride, setCycleDaysOverride] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Compute Cycle Predictions from historical logs
  const prediction: CyclePredictionData = useMemo(() => {
    const defaultCycleLength = cycleDaysOverride || patientData?.['Cycle length(days)'] || 32;
    const now = new Date();

    // Find all flow start dates from logs
    const flowLogs = [...symptomLogs]
      .filter(l => l.menstrualFlow && l.menstrualFlow !== 'none')
      .sort((a, b) => new Date(a.dateKey || a.timestamp).getTime() - new Date(b.dateKey || b.timestamp).getTime());

    // Identify period start clusters (first day of flow with >= 15 day gap from previous)
    const cycleStarts: Date[] = [];
    let prevFlowTime = 0;

    flowLogs.forEach(log => {
      const logTime = new Date(log.dateKey || log.timestamp).getTime();
      if (prevFlowTime === 0 || (logTime - prevFlowTime) > 15 * 86400000) {
        cycleStarts.push(new Date(log.dateKey || log.timestamp));
      }
      prevFlowTime = logTime;
    });

    // Determine baseline start date
    let lastPeriodStart: Date;
    if (cycleStarts.length > 0) {
      lastPeriodStart = cycleStarts[cycleStarts.length - 1];
    } else {
      // Fallback: estimate last period was (defaultCycleLength - 14) days ago
      lastPeriodStart = new Date(now.getTime() - 14 * 86400000);
    }

    // Determine average cycle length if multiple cycles recorded
    let effectiveCycleLength = defaultCycleLength;
    let confidence: 'High' | 'Moderate' | 'Irregular (PCOS Dynamic)' = 'Moderate';
    let isIrregular = (patientData?.['Cycle(R/I)'] === 4) || defaultCycleLength > 38 || defaultCycleLength < 24;

    if (cycleStarts.length >= 2) {
      let totalGaps = 0;
      for (let i = 1; i < cycleStarts.length; i++) {
        const gap = Math.round((cycleStarts[i].getTime() - cycleStarts[i - 1].getTime()) / 86400000);
        totalGaps += gap;
      }
      const avgGap = Math.round(totalGaps / (cycleStarts.length - 1));
      if (avgGap >= 21 && avgGap <= 60 && !cycleDaysOverride) {
        effectiveCycleLength = avgGap;
        confidence = cycleStarts.length >= 3 ? 'High' : 'Moderate';
      }
    }

    if (isIrregular) {
      confidence = 'Irregular (PCOS Dynamic)';
    }

    // Current cycle day
    const diffMs = now.getTime() - lastPeriodStart.getTime();
    let currentCycleDay = Math.max(1, Math.floor(diffMs / 86400000) + 1);

    // If past estimated cycle length, wrap or mark delayed
    if (currentCycleDay > effectiveCycleLength) {
      // Still in luteal / delayed phase
    }

    // Phase determination
    let currentPhaseName = isTelugu ? 'లూటియల్ దశ (PMS విండో)' : 'Luteal Phase (PMS & Metabolic Window)';
    let currentPhaseDesc = isTelugu
      ? 'ప్రొజెస్టెరాన్ స్థాయిలు ఎక్కువగా ఉంటాయి. ఇన్సులిన్ సున్నితత్వం మరియు ఆహార కోరికలను పర్యవేక్షించండి.'
      : 'Progesterone dominant. Monitor insulin sensitivity, sugar cravings, and mild pelvic symptoms.';
    let currentPhaseIcon: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' = 'luteal';

    if (currentCycleDay <= 5) {
      currentPhaseName = isTelugu ? 'ఋతుస్రావ దశ (Menstrual Flow)' : 'Menstrual Phase (Active Flow)';
      currentPhaseDesc = isTelugu
        ? 'గర్భాశయ పొర విసర్జన జరుగుతుంది. విశ్రాంతి, హైడ్రేషన్ మరియు ఐరన్ అధికంగా ఉండే ఆహారం ముఖ్యం.'
        : 'Active uterine shedding. Prioritize restorative rest, warm fluids, and anti-inflammatory nutrition.';
      currentPhaseIcon = 'menstrual';
    } else if (currentCycleDay <= 12) {
      currentPhaseName = isTelugu ? 'ఫోలిక్యులర్ దశ (శక్తి పెంపు)' : 'Follicular Phase (Estrogen Rise)';
      currentPhaseDesc = isTelugu
        ? 'ఈస్ట్రోజెన్ స్థాయిలు పెరుగుతాయి. శక్తి, వ్యాయామ సామర్థ్యం మరియు మానసిక స్పష్టత ఎక్కువగా ఉంటాయి.'
        : 'Estrogen rises as follicles develop. Optimum window for strength training and high focus tasks.';
      currentPhaseIcon = 'follicular';
    } else if (currentCycleDay <= 17) {
      currentPhaseName = isTelugu ? 'అండోత్సర్గ విండో (Fertile Window)' : 'Ovulatory Window (Peak Fertility)';
      currentPhaseDesc = isTelugu
        ? 'LH హార్మోన్ గరిష్ట స్థాయికి చేరుకుంటుంది. తేలికపాటి పొత్తికడుపు నొప్పి లేదా ఉబ్బరం గమనించవచ్చు.'
        : 'LH surge triggers egg release. Body temperature and metabolic rate increase slightly.';
      currentPhaseIcon = 'ovulation';
    }

    // Calculate next period start date
    const nextPeriodStart = new Date(lastPeriodStart.getTime() + effectiveCycleLength * 86400000);
    const daysUntilNext = Math.round((nextPeriodStart.getTime() - now.getTime()) / 86400000);

    // Subsequent 3 cycles
    const subsequentCycles = [];
    for (let c = 1; c <= 3; c++) {
      const cycleStart = new Date(lastPeriodStart.getTime() + (effectiveCycleLength * c) * 86400000);
      const ovulation = new Date(cycleStart.getTime() - 14 * 86400000);
      const pmsAlert = new Date(cycleStart.getTime() - 4 * 86400000);

      subsequentCycles.push({
        cycleNumber: c,
        startDate: cycleStart,
        startFormatted: cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        ovulationDate: ovulation,
        ovulationFormatted: ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pmsAlertDate: pmsAlert,
        pmsAlertFormatted: pmsAlert.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return {
      lastPeriodStartDate: lastPeriodStart,
      lastPeriodFormatted: lastPeriodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      calculatedCycleLength: effectiveCycleLength,
      currentCycleDay,
      currentPhaseName,
      currentPhaseDesc,
      currentPhaseIcon,
      nextPeriodStartDate: nextPeriodStart,
      nextPeriodFormatted: nextPeriodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysUntilNextPeriod: daysUntilNext,
      subsequentCycles,
      confidenceLevel: confidence,
      hasIrregularityFlag: isIrregular
    };
  }, [symptomLogs, patientData, cycleDaysOverride, isTelugu]);

  const handleExportPredictionsPDF = () => {
    try {
      exportCyclePredictionsPDF({
        cycleLengthDays: prediction.calculatedCycleLength
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export PDF cycle predictions:', err);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return <Droplet className="h-4 w-4 text-rose-500 fill-rose-500/20" />;
      case 'follicular':
        return <SunMedium className="h-4 w-4 text-emerald-500" />;
      case 'ovulation':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <Heart className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-all text-slate-900 dark:text-slate-100"
      id="dashboard-upcoming-cycle-prediction-widget"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shadow-2xs shrink-0">
            <CalendarCheck className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                {isTelugu ? 'రాబోయే చక్రాల అంచనా కాలక్రమం' : 'Upcoming Cycle Predictions & Timeline'}
              </h2>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                prediction.confidenceLevel === 'High'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : prediction.confidenceLevel === 'Moderate'
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {prediction.confidenceLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? `చారిత్రక డేటా ఆధారంగా లెక్కించబడిన సగటు చక్రం: ${prediction.calculatedCycleLength} రోజులు`
                : `Calculated dynamic cycle interval: ${prediction.calculatedCycleLength} days (Cycle Day ${prediction.currentCycleDay})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export to PDF Button */}
          <button
            type="button"
            onClick={handleExportPredictionsPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-bold transition-colors shadow-2xs"
            id="cycle-widget-export-pdf-btn"
            title="Download cycle predictions as a clinical PDF report"
          >
            <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{downloadSuccess ? (isTelugu ? 'PDF డౌన్‌లోడ్ పూర్తయింది!' : 'Exported PDF!') : (isTelugu ? 'చక్రాల PDF ఎగుమతి' : 'Export 3 Cycles (PDF)')}</span>
          </button>

          {/* Quick cycle override selector */}
          <select
            value={prediction.calculatedCycleLength}
            onChange={(e) => setCycleDaysOverride(Number(e.target.value))}
            className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            aria-label="Adjust cycle length"
          >
            <option value={28}>28 Days</option>
            <option value={30}>30 Days</option>
            <option value={32}>32 Days</option>
            <option value={35}>35 Days</option>
            <option value={40}>40 Days (Oligo)</option>
            <option value={48}>48 Days (Irregular)</option>
          </select>
        </div>
      </div>

      {/* Active Phase Card & Next Period Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        
        {/* Next Period Countdown Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-cyan-500/10 dark:from-teal-950/60 dark:via-slate-900 dark:to-cyan-950/40 border border-teal-200 dark:border-teal-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {isTelugu ? 'తదుపరి అంచనా ఋతుచక్రం' : 'Expected Next Cycle'}
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200">
              {prediction.daysUntilNextPeriod > 0
                ? (isTelugu ? `${prediction.daysUntilNextPeriod} రోజుల్లో` : `In ${prediction.daysUntilNextPeriod} days`)
                : prediction.daysUntilNextPeriod === 0
                ? (isTelugu ? 'ఈరోజే అంచనా' : 'Expected Today')
                : (isTelugu ? `${Math.abs(prediction.daysUntilNextPeriod)} రోజులు ఆలస్యం` : `${Math.abs(prediction.daysUntilNextPeriod)} days overdue`)}
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {prediction.nextPeriodFormatted}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {isTelugu
                ? 'చివరి నమోదు ప్రారంభ తేదీ నుండి లెక్కించబడింది'
                : `Calculated from last period on ${prediction.lastPeriodFormatted}`}
            </p>
          </div>

          <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">PMS Watch Window</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">
              {prediction.subsequentCycles[0]?.pmsAlertFormatted}
            </span>
          </div>
        </div>

        {/* Current Active Biological Phase */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-2xs">
                {getPhaseIcon(prediction.currentPhaseIcon)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                  {isTelugu ? 'ప్రస్తుత శారీరక దశ' : 'Current Biological Phase'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {prediction.currentPhaseName}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                Cycle Day {prediction.currentCycleDay} of {prediction.calculatedCycleLength}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {prediction.currentPhaseDesc}
          </p>

          {/* Mini Phase Progression Bar */}
          <div className="space-y-1 pt-1">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, Math.round((prediction.currentCycleDay / prediction.calculatedCycleLength) * 100))}%` }}
                className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all"
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span>Day 1 (Menses)</span>
              <span>Day 14 (Ovulation)</span>
              <span>Day {prediction.calculatedCycleLength} (Next Cycle)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3-Cycle Horizontal Timeline View */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'రాబోయే 3 చక్రాల సమయ శ్రేణి (Timeline Projection)' : '3-Cycle Forward Projection Timeline'}</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            {isTelugu ? 'క్లినికల్ అంచనా' : 'Predicted Onset Windows'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {prediction.subsequentCycles.map((cycle, idx) => (
            <div
              key={cycle.cycleNumber}
              className={`p-3.5 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800/80 shadow-2xs'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                  Cycle #{cycle.cycleNumber}
                </span>
                {idx === 0 && (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Next Upcoming
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-rose-500" />
                    <span>Period Start:</span>
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {cycle.startFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>Est. Ovulation:</span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {cycle.ovulationFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    <span>PMS Symptom Alert:</span>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {cycle.pmsAlertFormatted}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PCOS Irregularity Clinical Context Note */}
        {prediction.hasIrregularityFlag && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Clinical Note:</strong> Due to PCOS ovulatory variation (oligomenorrhea), actual follicular phases can fluctuate. Daily logging of basal temperatures, pelvic pain, and cervical fluid changes will dynamically calibrate this timeline for greater precision.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
