/**
 * PCOSense - SymptomRiskHeatmap Component
 * Heatmap & Correlation Matrix comparing daily logged symptoms against PCOS risk factors and lifestyle triggers.
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Flame,
  Zap,
  Moon,
  Coffee,
  Heart,
  Sparkles,
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Grid,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DailySymptomLog } from '../types';
import { useLanguage } from '../translations';

interface SymptomRiskHeatmapProps {
  logs: DailySymptomLog[];
  onOpenLogger?: () => void;
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

interface RiskFactorDef {
  id: string;
  name: string;
  teluguName: string;
  icon: string;
  extractor: (log: DailySymptomLog) => number; // 0 or 1 or continuous normalized 0-1
}

interface SymptomOutcomeDef {
  id: string;
  name: string;
  teluguName: string;
  extractor: (log: DailySymptomLog) => number; // normalized 0-5
}

export const SymptomRiskHeatmap: React.FC<SymptomRiskHeatmapProps> = ({
  logs,
  onOpenLogger,
  onAskAI,
  isDark
}) => {
  const { isTelugu } = useLanguage();
  const [viewMode, setViewMode] = useState<'matrix' | 'calendar' | 'triggers'>('matrix');
  const [selectedCell, setSelectedCell] = useState<{ factor: string; symptom: string; correlation: number; sampleCount: number; insight: string } | null>(null);

  const riskFactors: RiskFactorDef[] = [
    {
      id: 'fastFood',
      name: 'High Fast Food / Sugar',
      teluguName: 'ఫాస్ట్ ఫుడ్ / చక్కెర',
      icon: 'Coffee',
      extractor: (l) => (l.fastFoodConsumed ? 1 : 0)
    },
    {
      id: 'lowSleep',
      name: 'Sleep Shortage (<6.5h / Poor)',
      teluguName: 'నిద్రలేమి (<6.5 గం)',
      icon: 'Moon',
      extractor: (l) => (l.sleepHours < 6.5 || l.sleepQuality === 'poor' ? 1 : 0)
    },
    {
      id: 'sedentary',
      name: 'Sedentary Day (<20m Walk)',
      teluguName: 'శారీరక శ్రమ లేకపోవడం',
      icon: 'Activity',
      extractor: (l) => (l.exerciseMinutes < 20 ? 1 : 0)
    },
    {
      id: 'lowWater',
      name: 'Low Hydration (<2.0L)',
      teluguName: 'తక్కువ నీరు (<2.0L)',
      icon: 'Droplet',
      extractor: (l) => (l.waterIntakeLiters < 2.0 ? 1 : 0)
    },
    {
      id: 'hirsutism',
      name: 'Androgen Flare Observed',
      teluguName: 'ఆండ్రోజెన్ పెరుగుదల',
      icon: 'Flame',
      extractor: (l) => (l.hirsutismFlare ? 1 : 0)
    }
  ];

  const symptomOutcomes: SymptomOutcomeDef[] = [
    { id: 'pelvicPain', name: 'Pelvic Cramps', teluguName: 'కటి నొప్పి', extractor: (l) => l.pelvicPain },
    { id: 'bloating', name: 'Bloating', teluguName: 'కడుపు ఉబ్బరం', extractor: (l) => l.bloating },
    { id: 'fatigue', name: 'Fatigue', teluguName: 'అలసట', extractor: (l) => l.fatigue },
    { id: 'acne', name: 'Acne Flares', teluguName: 'మొటిమలు', extractor: (l) => l.acne },
    { id: 'sugarCravings', name: 'Sugar Cravings', teluguName: 'తీపి కోరికలు', extractor: (l) => l.sugarCravings },
    { id: 'moodSwings', name: 'Mood Swings', teluguName: 'మూడ్ స్వింగ్స్', extractor: (l) => l.moodSwings },
    { id: 'brainFog', name: 'Brain Fog', teluguName: 'మెంటల్ ఫాగ్', extractor: (l) => l.brainFog }
  ];

  // Calculate Pearson correlation between factor and symptom
  const correlationMatrix = useMemo(() => {
    if (logs.length < 2) return [];

    return riskFactors.map(factor => {
      const row: { factor: RiskFactorDef; values: { symptom: SymptomOutcomeDef; correlation: number; avgWith: number; avgWithout: number }[] } = {
        factor,
        values: []
      };

      symptomOutcomes.forEach(symptom => {
        const xVals = logs.map(l => factor.extractor(l));
        const yVals = logs.map(l => symptom.extractor(l));

        const n = xVals.length;
        const sumX = xVals.reduce((a, b) => a + b, 0);
        const sumY = yVals.reduce((a, b) => a + b, 0);
        const sumXY = xVals.reduce((acc, x, i) => acc + x * yVals[i], 0);
        const sumX2 = xVals.reduce((acc, x) => acc + x * x, 0);
        const sumY2 = yVals.reduce((acc, y) => acc + y * y, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        let corr = denominator === 0 ? 0 : Number((numerator / denominator).toFixed(2));
        if (isNaN(corr)) corr = 0;

        // Compare average symptom score on days with factor vs without
        const withFactorLogs = logs.filter(l => factor.extractor(l) >= 0.5);
        const withoutFactorLogs = logs.filter(l => factor.extractor(l) < 0.5);

        const avgWith = withFactorLogs.length > 0
          ? Number((withFactorLogs.reduce((acc, l) => acc + symptom.extractor(l), 0) / withFactorLogs.length).toFixed(1))
          : 0;

        const avgWithout = withoutFactorLogs.length > 0
          ? Number((withoutFactorLogs.reduce((acc, l) => acc + symptom.extractor(l), 0) / withoutFactorLogs.length).toFixed(1))
          : 0;

        row.values.push({
          symptom,
          correlation: corr,
          avgWith,
          avgWithout
        });
      });

      return row;
    });
  }, [logs]);

  // Derived top trigger insights
  const topTriggers = useMemo(() => {
    const list: { factor: string; symptom: string; corr: number; avgWith: number; avgWithout: number; note: string }[] = [];

    correlationMatrix.forEach(row => {
      row.values.forEach(item => {
        if (item.correlation >= 0.35 || (item.avgWith - item.avgWithout >= 1.2)) {
          let clinicalReason = '';
          if (row.factor.id === 'fastFood' && (item.symptom.id === 'bloating' || item.symptom.id === 'sugarCravings' || item.symptom.id === 'acne')) {
            clinicalReason = 'High glycemic foods trigger rapid insulin surges that stimulate ovarian androgens and digestive water retention.';
          } else if (row.factor.id === 'lowSleep' && (item.symptom.id === 'fatigue' || item.symptom.id === 'brainFog' || item.symptom.id === 'moodSwings')) {
            clinicalReason = 'Sleep restriction elevates evening cortisol and disrupts prefrontal neurotransmitters, amplifying perceived pain and irritability.';
          } else if (row.factor.id === 'sedentary') {
            clinicalReason = 'Lack of physical movement decreases muscular glucose uptake, promoting insulin resistance and energy slumps.';
          } else {
            clinicalReason = 'Strong temporal association observed between this lifestyle factor and heightened symptom severity.';
          }

          list.push({
            factor: isTelugu ? row.factor.teluguName : row.factor.name,
            symptom: isTelugu ? item.symptom.teluguName : item.symptom.name,
            corr: item.correlation,
            avgWith: item.avgWith,
            avgWithout: item.avgWithout,
            note: clinicalReason
          });
        }
      });
    });

    return list.sort((a, b) => b.corr - a.corr).slice(0, 4);
  }, [correlationMatrix, isTelugu]);

  const getHeatmapColor = (corr: number) => {
    if (corr >= 0.6) return 'bg-rose-500 text-white font-black shadow-xs';
    if (corr >= 0.35) return 'bg-rose-400 text-white font-bold';
    if (corr >= 0.15) return 'bg-amber-300 dark:bg-amber-500/80 text-amber-950 dark:text-white font-semibold';
    if (corr >= -0.15) return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
    if (corr >= -0.35) return 'bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200';
    return 'bg-emerald-400 dark:bg-emerald-600 text-white font-bold';
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <Grid className="h-4 w-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {isTelugu ? 'లక్షణాల ట్రిగ్గర్ & రిస్క్ సంబంధాల హీట్‌మ్యాప్' : 'Symptom Trigger & Risk Correlation Matrix'}
            </h3>
            <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
              {logs.length} {isTelugu ? 'లాగ్‌ల ఆధారంగా' : 'Logs Analyzed'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isTelugu
              ? 'ఆహారం, నిద్ర, వ్యాయామం వంటి జీవనశైలి కారకాలు మీ PCOS లక్షణాలను (క్రాంప్స్, మొటిమలు, ఉబ్బరం) ఎలా ప్రభావితం చేస్తాయో గుర్తించండి.'
              : 'Identify personal triggers by correlating daily lifestyle factors (diet, sleep, activity) with symptom severity.'}
          </p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isTelugu ? 'హీట్‌మ్యాప్' : 'Heatmap Matrix'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('triggers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'triggers'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isTelugu ? 'ట్రిగ్గర్ విశ్లేషణ' : 'Key Triggers'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isTelugu ? 'రోజువారీ క్యాలెండర్' : 'Daily Calendar'}
          </button>
        </div>
      </div>

      {/* VIEW 1: CORRELATION MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-l-xl">
                    {isTelugu ? 'రిస్క్ / జీవనశైలి కారకం' : 'Lifestyle / Risk Factor'}
                  </th>
                  {symptomOutcomes.map(s => (
                    <th key={s.id} className="py-2.5 px-2 text-center text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                      {isTelugu ? s.teluguName : s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {correlationMatrix.map((row, rIdx) => (
                  <tr key={row.factor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      <span>{isTelugu ? row.factor.teluguName : row.factor.name}</span>
                    </td>
                    {row.values.map((v, cIdx) => (
                      <td key={cIdx} className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCell({
                              factor: isTelugu ? row.factor.teluguName : row.factor.name,
                              symptom: isTelugu ? v.symptom.teluguName : v.symptom.name,
                              correlation: v.correlation,
                              sampleCount: logs.length,
                              insight: v.correlation >= 0.3
                                ? `Days with "${row.factor.name}" saw average ${v.symptom.name} of ${v.avgWith}/5 vs ${v.avgWithout}/5 on days without.`
                                : `Mild or neutral correlation (${v.correlation > 0 ? '+' : ''}${v.correlation}) observed in current log history.`
                            });
                          }}
                          className={`w-11 h-8 rounded-lg text-[11px] transition-all flex items-center justify-center mx-auto hover:scale-110 ${getHeatmapColor(v.correlation)}`}
                          title={`Correlation: ${v.correlation > 0 ? '+' : ''}${v.correlation}`}
                        >
                          {v.correlation > 0 ? `+${v.correlation}` : v.correlation}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold">{isTelugu ? 'సంబంధ తీవ్రత:' : 'Correlation Legend:'}</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-3 rounded bg-emerald-500" />
                <span>Protective (&lt; -0.3)</span>
                <span className="inline-block w-4 h-3 rounded bg-slate-200 dark:bg-slate-700 ml-2" />
                <span>Neutral (0.0)</span>
                <span className="inline-block w-4 h-3 rounded bg-amber-400 ml-2" />
                <span>Moderate (+0.3)</span>
                <span className="inline-block w-4 h-3 rounded bg-rose-500 ml-2" />
                <span>Strong Trigger (&ge; +0.6)</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400">
              {isTelugu ? 'వివరాలను చూడడానికి సెల్‌పై క్లిక్ చేయండి' : 'Click cell for clinical explanation'}
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: TOP IDENTIFIED TRIGGERS */}
      {viewMode === 'triggers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topTriggers.length > 0 ? (
              topTriggers.map((trig, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {trig.factor} &rarr; {trig.symptom}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                      r = +{trig.corr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {trig.note}
                  </p>

                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>Severity on Trigger Days: <strong className="text-rose-600">{trig.avgWith}/5</strong></span>
                    <span>Baseline Days: <strong className="text-slate-700 dark:text-slate-300">{trig.avgWithout}/5</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-xs text-slate-500">
                Log more days with varying lifestyle habits to reveal strong correlation patterns.
              </div>
            )}
          </div>

          {onAskAI && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
                  {isTelugu ? 'ఈ ట్రిగ్గర్ల ఆధారంగా వ్యక్తిగత డైట్/జీవనశైలి సలహాలు పొందండి' : 'Ask PCOSense AI for personalized mitigation strategies based on these triggers'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onAskAI('Based on my symptom heatmap correlations (fast food, sleep shortage, pelvic pain), what targeted diet and supplement changes should I discuss with my doctor?')}
                className="px-3 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs whitespace-nowrap"
              >
                {isTelugu ? 'AI సలహా పొందండి' : 'Mitigate Triggers'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DAY-BY-DAY CALENDAR HEATMAP */}
      {viewMode === 'calendar' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
            <span>{isTelugu ? 'గత 14 రోజుల లక్షణ తీవ్రత కాలక్రమం' : '14-Day Longitudinal Symptom Load Timeline'}</span>
            <span>0 (None) &rarr; 100 (High Load)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
            {logs.slice(0, 14).reverse().map(log => {
              const score = log.overallSeverityScore;
              const bgClass =
                score < 25
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : score < 50
                  ? 'bg-teal-100 dark:bg-teal-950/80 border-teal-300 text-teal-900 dark:text-teal-200'
                  : score < 75
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 text-rose-900 dark:text-rose-200';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-transform hover:scale-105 shadow-2xs ${bgClass}`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>{log.dateKey.split('-').slice(1).join('/')}</span>
                    <span className="font-mono">{log.cycleDay ? `CD ${log.cycleDay}` : ''}</span>
                  </div>
                  <div className="text-xl font-black my-1">
                    {score}<span className="text-[10px] font-normal">/100</span>
                  </div>
                  <div className="text-[9px] font-semibold truncate">
                    {log.menstrualFlow !== 'none' ? `Flow: ${log.menstrualFlow}` : log.notes ? log.notes.substring(0, 18) + '...' : 'Check-in'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Cell Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedCell.factor} &times; {selectedCell.symptom}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Calculated from {selectedCell.sampleCount} check-in records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Correlation Coefficient (r):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedCell.correlation > 0 ? `+${selectedCell.correlation}` : selectedCell.correlation}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {selectedCell.insight}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
