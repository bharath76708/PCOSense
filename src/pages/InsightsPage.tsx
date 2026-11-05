import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Sparkles,
  Bot
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useAssessment } from '../context/AssessmentContext';
import { useTheme } from '../context/ThemeContext';
import { PipelineFlowVisualizer } from '../components/PipelineFlowVisualizer';
import { useLanguage } from '../translations';

export const InsightsPage: React.FC = () => {
  const { predictionResult } = useAssessment();
  const { isDark } = useTheme();
  const { isTelugu } = useLanguage();
  const [filterTab, setFilterTab] = useState<'all' | 'increasing' | 'decreasing'>('all');

  if (!predictionResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {isTelugu ? 'వివరించడానికి ఎటువంటి అంచనా లేదు' : 'No Prediction to Explain'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
          {isTelugu ? 'వివరణాత్మక కారణాల విశ్లేషణను చూడటానికి ఒక అసెస్‌మెంట్‌ను అమలు చేయండి.' : 'Run an assessment to view detailed model feature attributions.'}
        </p>
        <Link
          to="/assessment"
          className="rounded-xl bg-teal-600 dark:bg-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
        >
          {isTelugu ? 'అసెస్‌మెంట్ ప్రారంభించండి' : 'Start Assessment'}
        </Link>
      </div>
    );
  }

  const { probabilityPercentage, risk_level, all_contributions } = predictionResult;

  // Prepare chart data for top 12 contributors
  const chartData = all_contributions.slice(0, 12).map(item => ({
    name: item.label.length > 22 ? `${item.label.substring(0, 20)}...` : item.label,
    fullName: item.label,
    score: item.contributionScore,
    rawValue: item.formattedValue,
    direction: item.direction,
    category: item.category
  }));

  const filteredList = all_contributions.filter(item => {
    if (filterTab === 'increasing') return item.direction === 'increase';
    if (filterTab === 'decreasing') return item.direction === 'decrease';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              {isTelugu ? 'వివరణాత్మక AI (XAI) • ఫ్యాక్టర్ అట్రిబ్యూషన్ (SHAP సమలేఖనం)' : 'Explainable AI (XAI) • Factor Attribution (SHAP Alignment)'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
              {isTelugu ? 'మోడల్ ఈ అంచనాను ఎందుకు ఇచ్చింది?' : 'Why did the model produce this estimate?'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                {isTelugu ? 'ప్రస్తుత సంభావ్యత' : 'Current Probability'}
              </span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-teal-300">
                {probabilityPercentage.toFixed(1)}% ({risk_level === 'Low' ? (isTelugu ? 'తక్కువ' : 'Low') : risk_level === 'Moderate' ? (isTelugu ? 'మధ్యస్థం' : 'Moderate') : (isTelugu ? 'ఎక్కువ' : 'High')})
              </div>
            </div>
            <Link
              to="/what-if"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-800 dark:hover:bg-teal-700"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'కౌంటర్‌ఫ్యాక్చువల్ సిమ్యులేటర్' : 'What-If Simulator'}</span>
            </Link>
          </div>
        </div>

        {/* Explainability Guidance Banner */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5">
          <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5">
            <p>
              <strong className="text-slate-900 dark:text-white font-semibold">
                {isTelugu ? 'ఫ్యాక్టర్ అట్రిబ్యూషన్‌ను ఎలా అర్థం చేసుకోవాలి: ' : 'How to Read Factor Attribution: '}
              </strong>
              {isTelugu
                ? 'ప్రామాణిక లాజిస్టిక్ రిగ్రెషన్‌లో, ప్రతి సహకారం స్కోరు ఫీచర్ విలువ మరియు మోడల్ గుణకం యొక్క గుణకారాన్ని సూచిస్తుంది. '
                : 'In standardized Logistic Regression, each contribution score equals the standardized feature value multiplied by the model coefficient (β_i · z_i). '}
              <strong className="text-rose-700 dark:text-rose-400 font-bold ml-1">
                {isTelugu ? 'ఎరుపు రంగు బార్‌లు' : 'Red bars'}
              </strong> {isTelugu ? 'రిస్క్‌ను పెంచే అంశాలు, మరియు ' : 'push the estimated risk higher, while '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                {isTelugu ? 'ఆకుపచ్చ రంగు బార్‌లు' : 'green bars'}
              </strong> {isTelugu ? 'రక్షణాత్మక అంశాలను సూచిస్తాయి.' : 'represent protective factors pulling your risk probability down.'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-300">{isTelugu ? 'గణాంక సంబంధం vs కారణం: ' : 'Statistical Attribution vs Physiological Causation: '}</strong>
              {isTelugu 
                ? 'ఈ బార్‌లు క్లినికల్ మోడల్ గుర్తించిన గణాంక సంబంధాన్ని మాత్రమే చూపుతాయి, ప్రత్యక్ష శారీరక కారణాన్ని కాదు. ఇది వైద్య సలహాకు ప్రత్యామ్నాయం కాదు.'
                : 'These values show statistical associations in the model\'s trained cohort distribution, not direct individual medical causation.'}
            </p>
          </div>
        </div>

        {/* Chart Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {isTelugu ? 'మీ అంచనాను ప్రభావితం చేసే ముఖ్యమైన 12 అంశాలు' : 'Top 12 Factors Influencing Your Prediction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu ? 'గణిత ప్రభావం తీవ్రత ప్రకారం ర్యాంక్ చేయబడింది.' : 'Ranked by absolute mathematical magnitude on log-odds score.'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-500 inline-block" /> {isTelugu ? 'రిస్క్ పెంచే అంశాలు (+)' : 'Risk Drivers (Positive Weight)'}
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500 inline-block" /> {isTelugu ? 'రక్షణాత్మక అంశాలు (-)' : 'Protective Factors (Negative Weight)'}
              </span>
            </div>
          </div>

          {/* Recharts Bar Visualization */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  domain={[-2, 2.5]}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 600 }}
                  width={110}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700 p-3 text-white shadow-xl text-xs space-y-1">
                          <p className="font-bold text-teal-300">{data.fullName}</p>
                          <p>{isTelugu ? 'మీ విలువ' : 'Your Value'}: <span className="font-semibold text-white">{data.rawValue}</span></p>
                          <p>{isTelugu ? 'ప్రభావం' : 'Contribution Impact'}: <span className={data.score >= 0 ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>{data.score > 0 ? `+${data.score}` : data.score}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={0} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth={1.5} />
                <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 0 ? '#f43f5e' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIPELINE VISUALIZER (CURRENT: STEP 6 SHAP EXPLANATION) */}
        <PipelineFlowVisualizer currentStepId="shap_explanation" />

        {/* Detailed Breakdown Cards with Filter Tabs */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                {isTelugu ? 'పూర్తి ఫీచర్ సహకార పట్టిక' : 'Complete Feature Contributions Table'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu ? 'ప్రతి ఇన్పుట్ పారామీటర్ ప్రామాణిక విలువ మరియు గుణకంతో చూపబడింది.' : 'Every input parameter mapped to its standardized value and linear model coefficient.'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isTelugu ? `అన్ని అంశాలు (${all_contributions.length})` : `All Features (${all_contributions.length})`}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('increasing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'increasing' ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isTelugu ? 'రిస్క్ కారకాలు' : 'Risk Drivers'}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('decreasing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'decreasing' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {isTelugu ? 'రక్షణాత్మకమైనవి' : 'Protective'}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredList.map((item) => {
              const isPositive = item.contributionScore >= 0;
              return (
                <div
                  key={item.feature}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isTelugu ? 'నమోదైనది: ' : 'Reported: '}<strong className="text-slate-800 dark:text-slate-200">{item.formattedValue}</strong> • {isTelugu ? 'ప్రామాణిక Z: ' : 'Standardized Z: '}<span className="font-mono text-slate-700 dark:text-slate-300">{item.standardizedValue}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`font-extrabold font-mono text-sm ${isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isPositive ? `+${item.contributionScore.toFixed(3)}` : item.contributionScore.toFixed(3)}
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase">{isTelugu ? 'ప్రభావ బరువు' : 'Impact Weight'}</span>
                    </div>

                    <span className={`p-2 rounded-xl ${isPositive ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/results"
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ← {isTelugu ? 'అసెస్‌మెంట్ ఫలితానికి తిరిగి వెళ్లండి' : 'Back to Assessment Outcome'}
          </Link>

          <Link
            to="/what-if"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 dark:hover:bg-teal-700"
          >
            <span>{isTelugu ? 'కౌంటర్‌ఫ్యాక్చువల్ సిమ్యులేటర్‌కు వెళ్లండి' : 'Proceed to What-If Simulator'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
