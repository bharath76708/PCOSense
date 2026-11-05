import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  Zap,
  Clock,
  HeartPulse
} from 'lucide-react';
import { AssessmentHistoryItem, PredictionResponse, UserProfile, SummaryInsightsData } from '../types';
import { fetchSummaryInsights } from '../services/api';
import { useLanguage } from '../translations';

interface SummaryInsightsCardProps {
  history: AssessmentHistoryItem[];
  currentAssessment?: PredictionResponse | null;
  streak?: number;
  patientProfile?: UserProfile | null;
  onAskAI?: (prompt?: string) => void;
  isDark?: boolean;
}

export const SummaryInsightsCard: React.FC<SummaryInsightsCardProps> = ({
  history,
  currentAssessment,
  streak = 0,
  patientProfile,
  onAskAI,
  isDark = false
}) => {
  const { t, isTelugu } = useLanguage();
  const [data, setData] = useState<SummaryInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadInsights = useCallback(async (forced: boolean = false) => {
    if (forced) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchSummaryInsights({
        history,
        currentAssessment,
        streak,
        patientProfile,
        timeframeDays: 30
      });
      setData(result);
    } catch (err) {
      console.error('Failed to load 30-day summary insights:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [history, currentAssessment, streak, patientProfile]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleCopySummary = () => {
    if (!data) return;
    const formatted = `PCOSense 30-Day Clinical Summary (${new Date().toLocaleDateString()}):\n` +
      `Headline: ${data.headline}\n\n` +
      `Summary:\n${data.summary}\n\n` +
      `Key Health Patterns:\n` +
      data.keyPatterns.map(p => `- ${p.category} (${p.title}): ${p.description}`).join('\n') +
      `\n\nNext 30-Day Action Items:\n` +
      data.actionFocus.map(a => `- ${a}`).join('\n') +
      `\n\nGenerated via PCOSense AI (${data.model})`;

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const getTrendBadge = (trend: 'improving' | 'stable' | 'attention') => {
    switch (trend) {
      case 'improving':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <TrendingDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>{isTelugu ? 'మెరుగవుతోంది' : 'Improving'}</span>
          </span>
        );
      case 'attention':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span>{isTelugu ? 'శ్రద్ధ అవసరం' : 'Attention'}</span>
          </span>
        );
      case 'stable':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Activity className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'స్థిరంగా ఉంది' : 'Stable'}</span>
          </span>
        );
    }
  };

  return (
    <div
      id="summary-insights-card"
      className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-all overflow-hidden"
    >
      {/* Decorative subtle background gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative space-y-5">
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-teal-800 dark:bg-teal-700 text-teal-200 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="h-5 w-5 text-teal-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isTelugu ? '30-రోజుల ఆరోగ్య గమనం & AI సారాంశం' : '30-Day Health Trajectory & AI Summary'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <HeartPulse className="h-2.5 w-2.5 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'క్లినికల్ ఇంటెలిజెన్స్' : 'Clinical Intelligence'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{isTelugu ? 'AI అసిస్టెంట్ ద్వారా రూపొందించబడింది' : `Synthesized by ${data?.model || 'Gemini AI Assistant'}`}</span>
                <span>•</span>
                <span>{isTelugu ? 'గత 30 రోజుల విశ్లేషణ' : 'Last 30 days active analysis'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={loading || !data}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
              title="Copy 30-day summary to clipboard for doctor visits"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">{isTelugu ? 'కాపీ చేయబడింది!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{isTelugu ? 'డాక్టర్ కోసం కాపీ చేయండి' : 'Copy for Doctor'}</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadInsights(true)}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold transition-all disabled:opacity-50"
              title="Regenerate analysis with latest data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden xs:inline">{isTelugu ? 'విశ్లేషణను రిఫ్రెష్ చేయండి' : 'Refresh Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="space-y-4 animate-pulse py-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-4/6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"></div>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Headline Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
                <h4 className="text-sm sm:text-base font-extrabold text-teal-950 dark:text-teal-100 tracking-tight">
                  {data.headline}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.summary}
              </p>
            </div>

            {/* 3 Key Health Patterns Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'గత 30 రోజులలో గుర్తించబడిన ముఖ్య ఆరోగ్య అంశాలు' : 'Most Significant Detected Health Patterns (Last 30 Days)'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {data.assessmentsCount} {isTelugu ? 'అసెస్‌మెంట్‌లు విశ్లేషించబడ్డాయి' : `assessment${data.assessmentsCount === 1 ? '' : 's'} analyzed`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.keyPatterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {pattern.category}
                      </span>
                      {getTrendBadge(pattern.trend)}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {pattern.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pattern.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next 30 Days Action Focus & Interactive Prompts */}
            <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'రాబోయే 30 రోజుల ప్రాధాన్యతలు' : 'Clinical Action Priorities for Upcoming 30 Days'}</span>
                </span>
                <div className="space-y-1">
                  {data.actionFocus.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <ArrowRight className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive AI Prompt Chips */}
              <div className="space-y-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {isTelugu ? 'ఈ సారాంశం గురించి AIని అడగండి:' : 'Ask AI About This Summary:'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAskAI?.(`Based on my 30-day summary (${data.headline}), what are the most impactful lifestyle changes I should make this month?`)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-900 dark:hover:text-teal-200 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {isTelugu ? 'జీవనశైలి దశలు' : 'Actionable Lifestyle Steps'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAskAI?.(`Draft 3 specific questions for my gynecologist based on my 30-day patterns: ${data.summary}`)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-900 dark:hover:text-teal-200 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {isTelugu ? 'డాక్టర్ ప్రశ్నలు' : 'Doctor Questions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAskAI?.(`Explain how my metabolic patterns and cycle status connect to Rotterdam diagnostic criteria in simple terms.`)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-900 dark:hover:text-teal-200 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {isTelugu ? 'రోటర్‌డామ్ ప్రమాణాలు' : 'Rotterdam Connection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
