import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  HelpCircle,
  Activity,
  Sparkles,
  Utensils,
  ChevronDown,
  ChevronUp,
  Flame,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { PatientRecord, PredictionResponse, PersonalizedRiskReason, RiskLevel } from '../types';
import { extractPersonalizedRiskReasons } from '../services/riskReasonService';
import { useLanguage } from '../translations';

interface PersonalizedRiskReasonsCardProps {
  patientData: Partial<PatientRecord>;
  prediction?: PredictionResponse | null;
  riskLevel?: RiskLevel;
  onOpenDietPlan?: () => void;
  showDietPlanCTA?: boolean;
}

export const PersonalizedRiskReasonsCard: React.FC<PersonalizedRiskReasonsCardProps> = ({
  patientData,
  prediction,
  riskLevel = 'Moderate',
  onOpenDietPlan,
  showDietPlanCTA = true
}) => {
  const { isTelugu } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reasons: PersonalizedRiskReason[] = extractPersonalizedRiskReasons(patientData, prediction);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getSeverityBadge = (severity: 'high' | 'moderate' | 'mild') => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
            <Flame className="h-3 w-3 text-rose-500" />
            {isTelugu ? 'ముఖ్యమైన రిస్క్ కారకం' : 'Primary Risk Factor'}
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            {isTelugu ? 'మధ్యస్థ కారకం' : 'Contributing Factor'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="h-3 w-3 text-teal-500" />
            {isTelugu ? 'సాధారణం' : 'Baseline Parameter'}
          </span>
        );
    }
  };

  return (
    <div
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
      id="personalized-risk-reasons-card"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  {isTelugu ? 'మీ వ్యక్తిగత రిస్క్ కారణాల విశ్లేషణ' : 'Why You Have This Risk: Personalized Clinical Breakdown'}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  {reasons.length} {isTelugu ? 'కీలక అంశాలు గుర్తించబడ్డాయి' : 'Key Drivers Identified'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isTelugu
                  ? 'మీరు నమోదు చేసిన లక్షణాలు మరియు శరీర కొలతల ఆధారంగా, ఈ క్రింది అంశాలు మీ హార్మోన్ల సమతుల్యత మరియు ఇన్సులిన్ పనితీరుపై ఎలాంటి ప్రభావం చూపుతున్నాయో క్రింద వివరించబడింది.'
                  : 'Based on your specific assessment inputs, here is the exact biological mechanism behind why each biomarker contributes to your calculated risk, along with targeted nutritional actions to reverse them.'}
              </p>
            </div>
          </div>

          {showDietPlanCTA && (
            <Link
              to="/diet-plan"
              onClick={onOpenDietPlan}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 shrink-0 self-start sm:self-center"
              id="cta-view-diet-plan-from-reasons"
            >
              <Utensils className="h-4 w-4" />
              <span>{isTelugu ? '7 రోజుల డైట్ ప్లాన్ చూడండి' : 'View 7-Day Diet Plan'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Reasons List */}
      <div className="p-4 sm:p-6 space-y-4">
        {reasons.map((reason, index) => {
          const isExpanded = expandedId === reason.id || (index === 0 && expandedId === null);

          return (
            <div
              key={reason.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-teal-300 dark:border-teal-800 bg-slate-50/70 dark:bg-slate-800/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Collapsed Header Summary */}
              <button
                type="button"
                onClick={() => toggleExpand(reason.id)}
                className="w-full p-4 sm:p-4.5 text-left flex items-start sm:items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-teal-400/50 rounded-xl"
                aria-expanded={isExpanded}
                id={`reason-toggle-${reason.id}`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {isTelugu && reason.titleTe ? reason.titleTe : reason.title}
                      </h4>
                      {getSeverityBadge(reason.severity)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300">{isTelugu ? 'మీ విలువ:' : 'Reported:'}</strong>{' '}
                        {reason.reportedValue}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>
                        <strong className="text-slate-700 dark:text-slate-300">{isTelugu ? 'ఆరోగ్యకర ప్రమాణం:' : 'Healthy Benchmark:'}</strong>{' '}
                        {reason.healthyBenchmark}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 shrink-0 mt-1 sm:mt-0">
                  <span className="text-xs font-semibold hidden md:inline">
                    {isExpanded ? (isTelugu ? 'కుదించు' : 'Hide Details') : (isTelugu ? 'వివరాలు' : 'Deep Dive')}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Expanded Deep Dive Details */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-3.5 border-t border-slate-200/60 dark:border-slate-800/80 text-xs sm:text-sm">
                  {/* Why it's a risk explanation */}
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-3.5 border border-amber-200/60 dark:border-amber-900/50">
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                          {isTelugu ? 'ఇది ఎందుకు రిస్క్‌గా మారుతుంది? (వైద్య వివరణ)' : 'Why This Is A Clinical Risk:'}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {isTelugu && reason.whyItsARiskTe ? reason.whyItsARiskTe : reason.whyItsARisk}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Biological Mechanism */}
                  <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-2.5">
                      <Zap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-200 block mb-0.5">
                          {isTelugu ? 'శరీరంలో జరిగే జీవ రసాయన ప్రక్రియ:' : 'Cellular & Hormonal Pathway:'}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                          {isTelugu && reason.biologicalMechanismTe ? reason.biologicalMechanismTe : reason.biologicalMechanism}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nutritional Action & Countermeasure */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-200/70 dark:border-emerald-900/50">
                    <div className="flex items-start gap-2.5">
                      <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                          {isTelugu ? 'తక్షణ ఆహార మరియు జీవనశైలి మార్పులు:' : 'Targeted Dietary Action to Reverse Risk:'}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                          {isTelugu && reason.dietaryActionTe ? reason.dietaryActionTe : reason.dietaryAction}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                            {isTelugu ? 'ముఖ్య పోషకాలు:' : 'Key Nutrients:'}
                          </span>
                          {reason.keyNutrients.map((nutr, nIdx) => (
                            <span
                              key={nIdx}
                              className="text-[10px] font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300/70 dark:border-emerald-800"
                            >
                              {nutr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isTelugu
              ? 'ఆహారంలో సరైన మార్పుల ద్వారా ఇన్సులిన్ మరియు ఆండ్రోజెన్ హార్మోన్లను సహజంగా నియంత్రించవచ్చు.'
              : 'Targeted medical nutrition therapy directly reduces insulin spikes and restores ovulatory cycles.'}
          </span>
        </div>

        {showDietPlanCTA && (
          <Link
            to="/diet-plan"
            onClick={onOpenDietPlan}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-xl transition-all shadow-xs"
            id="reasons-bottom-diet-btn"
          >
            <Utensils className="h-3.5 w-3.5 text-teal-300" />
            <span>{isTelugu ? '7 రోజుల డైట్ ప్లాన్‌ను రూపొందించండి' : 'Open Personalized 7-Day Diet Plan'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
