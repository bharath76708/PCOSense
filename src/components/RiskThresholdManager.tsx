import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Sparkles,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  HeartPulse,
  Scale,
  Bell,
  Check
} from 'lucide-react';

export interface ThresholdSettings {
  lowThreshold: number; // e.g. 30%
  highThreshold: number; // e.g. 70%
  preset: 'rotterdam' | 'early_screening' | 'conservative' | 'custom';
  enableAlertBanner: boolean;
  criticalAlertThreshold: number; // e.g. 85%
}

export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  lowThreshold: 30,
  highThreshold: 70,
  preset: 'rotterdam',
  enableAlertBanner: true,
  criticalAlertThreshold: 85
};

export const PRESET_CONFIGS: Record<
  'rotterdam' | 'early_screening' | 'conservative',
  { name: string; tag: string; low: number; high: number; description: string }
> = {
  rotterdam: {
    name: 'Standard Rotterdam Consensus (Recommended)',
    tag: 'International Benchmark',
    low: 30,
    high: 70,
    description: 'Balanced sensitivity & specificity aligned with 2003 Rotterdam and 2023 Monash International Evidence-Based Guidelines.'
  },
  early_screening: {
    name: 'High Sensitivity / Early Detection',
    tag: 'Proactive Monitoring',
    low: 20,
    high: 50,
    description: 'Lower decision boundaries to trigger earlier clinical inquiry and lifestyle intervention for patients with subtle symptoms.'
  },
  conservative: {
    name: 'High Specificity / Confirmatory',
    tag: 'Conservative',
    low: 40,
    high: 80,
    description: 'Higher thresholds requiring stronger multi-marker concordance before classifying as elevated risk, reducing false alarms.'
  }
};

interface RiskThresholdManagerProps {
  currentScore?: number;
  currentRiskLevel?: string;
  onThresholdsChange?: (settings: ThresholdSettings) => void;
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

export const RiskThresholdManager: React.FC<RiskThresholdManagerProps> = ({
  currentScore,
  onThresholdsChange,
  onAskAI
}) => {
  const [settings, setSettings] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem('pcosense_threshold_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_THRESHOLDS;
  });

  const [activeTab, setActiveTab] = useState<'tiers' | 'customize' | 'guidance'>('tiers');
  const [selectedTierDetail, setSelectedTierDetail] = useState<'low' | 'moderate' | 'elevated'>('elevated');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({
    low: false,
    moderate: true,
    elevated: true
  });

  const saveSettings = (newSettings: ThresholdSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('pcosense_threshold_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    if (onThresholdsChange) {
      onThresholdsChange(newSettings);
    }
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2200);
  };

  const handlePresetSelect = (presetKey: 'rotterdam' | 'early_screening' | 'conservative') => {
    const config = PRESET_CONFIGS[presetKey];
    saveSettings({
      ...settings,
      preset: presetKey,
      lowThreshold: config.low,
      highThreshold: config.high
    });
  };

  const handleCustomLowChange = (val: number) => {
    const newLow = Math.min(Math.max(val, 5), settings.highThreshold - 5);
    saveSettings({
      ...settings,
      preset: 'custom',
      lowThreshold: newLow
    });
  };

  const handleCustomHighChange = (val: number) => {
    const newHigh = Math.max(Math.min(val, 95), settings.lowThreshold + 5);
    saveSettings({
      ...settings,
      preset: 'custom',
      highThreshold: newHigh
    });
  };

  const handleResetDefaults = () => {
    saveSettings(DEFAULT_THRESHOLDS);
  };

  const toggleAccordion = (tier: string) => {
    setExpandedAccordions(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  // Determine current active tier based on current score
  const getEvaluatedTier = (score: number) => {
    if (score <= settings.lowThreshold) {
      return {
        key: 'low',
        label: 'Low Risk Tier',
        color: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
        range: `0% – ${settings.lowThreshold}%`,
        headline: 'Biomarkers within standard physiological baseline'
      };
    } else if (score >= settings.highThreshold) {
      return {
        key: 'elevated',
        label: 'Elevated Risk Tier',
        color: 'text-rose-700 dark:text-rose-300',
        badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800',
        range: `${settings.highThreshold}% – 100%`,
        headline: 'Significant concordance with Rotterdam PCOS phenotypes'
      };
    } else {
      return {
        key: 'moderate',
        label: 'Moderate / Intermediate Tier',
        color: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
        range: `${settings.lowThreshold + 1}% – ${settings.highThreshold - 1}%`,
        headline: 'Sub-clinical or borderline physiological indicator profile'
      };
    }
  };

  const userTier = currentScore !== undefined ? getEvaluatedTier(currentScore) : null;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-colors">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                  Clinical Alert Thresholds & Risk Boundaries
                </h3>
                {isSavedToast && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure decision cutoffs for Low, Moderate, and Elevated risk ranges with evidence-based clinical context.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tiers'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Clinical Tiers ({settings.lowThreshold}% / {settings.highThreshold}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'customize'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Customize Cutoffs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guidance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guidance'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Consensus Protocols
          </button>
        </div>
      </div>

      {/* Active User Status Banner if Score is Present */}
      {userTier && currentScore !== undefined && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${userTier.badgeBg}`}>
              {userTier.key === 'low' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : userTier.key === 'moderate' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <HeartPulse className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Your Latest Assessment Score: <strong className="text-sm font-extrabold">{currentScore.toFixed(1)}%</strong>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${userTier.badgeBg}`}>
                  {userTier.label} ({userTier.range})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {userTier.headline}. Evaluated against the <strong className="font-semibold text-slate-800 dark:text-slate-200">{settings.preset.replace('_', ' ').toUpperCase()}</strong> threshold model.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAskAI && (
              <button
                type="button"
                onClick={() =>
                  onAskAI(
                    `Explain what my PCOS risk score of ${currentScore.toFixed(1)}% signifies under my configured ${settings.preset} alert threshold range (${userTier.range}). What specific clinical tests and lifestyle steps should I discuss with my doctor?`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 text-white text-xs font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                <span>Explain My Score</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: CLINICAL TIERS & EVIDENCE SIGNIFICANCE */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          
          {/* Visual Range Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Risk Spectrum Calibration</span>
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                Low: ≤{settings.lowThreshold}% | Moderate: {settings.lowThreshold + 1}–{settings.highThreshold - 1}% | Elevated: ≥{settings.highThreshold}%
              </span>
            </div>

            <div className="relative h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {/* Low Risk Segment */}
              <div
                style={{ width: `${settings.lowThreshold}%` }}
                className="bg-emerald-500/80 hover:bg-emerald-500 transition-all flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                title={`Low Risk: 0% to ${settings.lowThreshold}%`}
              >
                {settings.lowThreshold >= 20 ? `Low (0–${settings.lowThreshold}%)` : 'Low'}
              </div>

              {/* Moderate Risk Segment */}
              <div
                style={{ width: `${settings.highThreshold - settings.lowThreshold}%` }}
                className="bg-amber-500/80 hover:bg-amber-500 transition-all flex items-center justify-center text-[10px] font-bold text-white tracking-wide border-x border-white/20"
                title={`Moderate Risk: ${settings.lowThreshold + 1}% to ${settings.highThreshold - 1}%`}
              >
                {settings.highThreshold - settings.lowThreshold >= 25 ? `Moderate (${settings.lowThreshold + 1}–${settings.highThreshold - 1}%)` : 'Mod'}
              </div>

              {/* Elevated Risk Segment */}
              <div
                style={{ width: `${100 - settings.highThreshold}%` }}
                className="bg-rose-500/80 hover:bg-rose-500 transition-all flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                title={`Elevated Risk: ${settings.highThreshold}% to 100%`}
              >
                {100 - settings.highThreshold >= 20 ? `Elevated (≥${settings.highThreshold}%)` : 'Elevated'}
              </div>

              {/* Current Score Indicator Pin if available */}
              {currentScore !== undefined && (
                <div
                  style={{ left: `${Math.min(Math.max(currentScore, 2), 98)}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg ring-2 ring-slate-950 transform -translate-x-1/2 z-10"
                  title={`Current Score: ${currentScore}%`}
                />
              )}
            </div>
          </div>

          {/* Detailed Tier Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Low Risk Tier Card */}
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  0% – {settings.lowThreshold}%
                </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Low Risk
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Physiological Baseline
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Calculated probability reflects hormonal, metabolic, and clinical features within expected normative population parameters.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-[11px] uppercase tracking-wider">
                  Clinical Significance:
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Regular ovulatory cycles (21–35 days)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Normal LH:FSH ratio (~1:1)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>No clinical signs of hyperandrogenism</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Action: Annual routine gynecological checkup</span>
              </div>
            </div>

            {/* Moderate Risk Tier Card */}
            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  {settings.lowThreshold + 1}% – {settings.highThreshold - 1}%
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Moderate Risk
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Borderline / Sub-Clinical
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Indicates intermediate feature combinations. May show 1 Rotterdam criterion (e.g. cycle delays or mild androgenic cues) without full phenotype.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-xs">
                <span className="font-bold text-amber-950 dark:text-amber-200 block text-[11px] uppercase tracking-wider">
                  Clinical Significance:
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Mild cycle irregularity or luteal phase defect</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Potential insulin resistance or elevated BMI</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Early androgenic changes (acne, mild hirsutism)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Action: Fasting insulin, DHEA-S & 3-mo re-evaluation</span>
              </div>
            </div>

            {/* Elevated Risk Tier Card */}
            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                  <HeartPulse className="h-3 w-3" />
                  {settings.highThreshold}% – 100%
                </span>
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  Elevated Risk
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  High Rotterdam Concordance
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Strong probabilistic concordance with PCOS phenotypes (A, B, C, or D), characterized by hyperandrogenism, polycystic ovaries, and oligo/anovulation.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-xs">
                <span className="font-bold text-rose-950 dark:text-rose-200 block text-[11px] uppercase tracking-wider">
                  Clinical Significance:
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Elevated antral follicle count (≥12–20 follicles)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>LH:FSH inversion (≥2:1) & high AMH (&gt;4.5 ng/mL)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Metabolic syndrome & insulin resistance risk</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-rose-900 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span>Action: OB-GYN pelvic ultrasound & 75g OGTT</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZE THRESHOLDS & PRESETS */}
      {activeTab === 'customize' && (
        <div className="space-y-6">
          
          {/* Preset Buttons Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              1. Select Clinical Guideline Preset
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(PRESET_CONFIGS) as Array<'rotterdam' | 'early_screening' | 'conservative'>).map(key => {
                const config = PRESET_CONFIGS[key];
                const isSelected = settings.preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-600/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-950 dark:text-white">
                        {config.name}
                      </span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 mb-1">
                      Low: ≤{config.low}% | Elevated: ≥{config.high}%
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Sliders for Custom Cutoffs */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  2. Fine-Tune Exact Cutoff Percentiles
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag the sliders or input exact values to customize boundary cutoffs for your personal clinician protocol.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              
              {/* Low Risk Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Low Risk Boundary (Upper Limit)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-extrabold">
                    ≤ {settings.lowThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={settings.lowThreshold}
                  onChange={(e) => handleCustomLowChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Scores from 0% up to {settings.lowThreshold}% will be classified as Low Risk / Routine Baseline.
                </p>
              </div>

              {/* Elevated Risk Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4" />
                    Elevated Risk Boundary (Lower Limit)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-extrabold">
                    ≥ {settings.highThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={1}
                  value={settings.highThreshold}
                  onChange={(e) => handleCustomHighChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Scores of {settings.highThreshold}% or higher trigger clinical alert status and diagnostic ultrasound recommendations.
                </p>
              </div>

            </div>

            {/* Alert Banner Toggle */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Show Dashboard Alert Notification on High Risk
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Display prioritized clinical next-step action cards whenever your latest screening enters the elevated tier.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableAlertBanner}
                onChange={(e) =>
                  saveSettings({
                    ...settings,
                    enableAlertBanner: e.target.checked
                  })
                }
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICAL CONSENSUS & PROTOCOL GUIDELINES */}
      {activeTab === 'guidance' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/70 text-xs text-teal-950 dark:text-teal-200 leading-relaxed flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm mb-0.5">International Diagnostic Reference Frameworks</strong>
              PCOSense calibrations are grounded in the 2003 Rotterdam ESHRE/ASRM Consensus Workshop and the 2023 Monash International Evidence-Based Guidelines for the Assessment and Management of Polycystic Ovary Syndrome.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-teal-600" />
                The 3 Core Rotterdam Criteria
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Diagnosis requires at least <strong>2 out of 3</strong> criteria after excluding other androgen excess etiologies (Cushing's, CAH, thyroid dysfunction):
              </p>
              <ol className="list-decimal pl-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <li><strong>Oligo- or Anovulation:</strong> Menstrual cycles &gt;35 days or &lt;8 cycles/year.</li>
                <li><strong>Clinical and/or Biochemical Hyperandrogenism:</strong> Hirsutism (Ferriman-Gallwey &ge;4-6), androgenic alopecia, persistent cystic acne, or elevated Free Androgen Index / Total Testosterone.</li>
                <li><strong>Polycystic Ovarian Morphology (PCOM):</strong> Pelvic ultrasound displaying &ge;20 follicles (2-9mm) per ovary or ovarian volume &gt;10 cm&sup3;.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                Recommended Diagnostic Workup Schedule
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>Day 2–4 Follicular Bloods:</strong> Total Testosterone, Free Testosterone, DHEA-S, LH, FSH, Estradiol, Prolactin, TSH.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>Metabolic Screening:</strong> Fasting Lipid Panel, Fasting Insulin, HbA1c or 2-hour 75g OGTT.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span><strong>Pelvic Ultrasonography:</strong> Transvaginal (or transabdominal if non-coital) follicular count & volume.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
