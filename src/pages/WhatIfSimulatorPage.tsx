import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Info,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  Save,
  BookmarkCheck,
  Trash2,
  Clock
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { runWhatIfSimulation, computeBMI } from '../ml/modelEngine';
import { PatientRecord } from '../types';
import { useLanguage } from '../translations';
import {
  saveFirestoreSimulationScenario,
  getFirestoreSimulationScenarios,
  SimulationScenarioRecord
} from '../services/firestoreService';

export const WhatIfSimulatorPage: React.FC = () => {
  const { patientData } = useAssessment();
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  // Local simulated state initialized with current patient profile
  const [simulatedData, setSimulatedData] = useState<PatientRecord>({ ...patientData });
  const [savedScenarios, setSavedScenarios] = useState<SimulationScenarioRecord[]>([]);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [scenarioTitle, setScenarioTitle] = useState<string>('');

  useEffect(() => {
    const userId = user?.uid || 'local-user';
    getFirestoreSimulationScenarios(userId).then(list => {
      setSavedScenarios(list);
    });
  }, [user]);

  // Run simulation in real-time
  const simulationResult = useMemo(() => {
    return runWhatIfSimulation(patientData, simulatedData);
  }, [patientData, simulatedData]);

  const updateSimulatedField = (field: keyof PatientRecord, value: number) => {
    setSimulatedData(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto compute BMI if weight or height changed
      if (field === 'Weight (Kg)' || field === 'Height(Cm)') {
        const heightM = next['Height(Cm)'] / 100;
        const weightKg = next['Weight (Kg)'];
        if (heightM > 0 && weightKg > 0) {
          next['BMI'] = computeBMI(weightKg, next['Height(Cm)']);
        }
      }

      return next;
    });
  };

  const handleReset = () => {
    setSimulatedData({ ...patientData });
  };

  const handleSaveScenario = async () => {
    const userId = user?.uid || 'local-user';
    const title = scenarioTitle.trim() || `Simulation ${new Date().toLocaleDateString()}`;
    const newRecord: SimulationScenarioRecord = {
      id: `sim-${Date.now()}`,
      userId,
      title,
      timestamp: new Date().toISOString(),
      baselineProbability: simulationResult.baselineProbability,
      simulatedProbability: simulationResult.simulatedProbability,
      deltaProbability: simulationResult.deltaProbability,
      direction: simulationResult.direction,
      changedFeatures: simulationResult.changedFeatures.map(f => ({
        feature: f.label,
        baselineValue: f.baselineValue,
        simulatedValue: f.simulatedValue
      }))
    };

    await saveFirestoreSimulationScenario(userId, newRecord);
    setSavedScenarios(prev => [newRecord, ...prev]);
    setIsSavedRecently(true);
    setScenarioTitle('');
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const {
    baselineProbability,
    baselineRiskLevel,
    simulatedProbability,
    simulatedRiskLevel,
    deltaProbability,
    direction,
    changedFeatures
  } = simulationResult;

  const translateRisk = (risk: string) => {
    if (!isTelugu) return `${risk} Risk`;
    if (risk === 'Low') return 'తక్కువ రిస్క్';
    if (risk === 'Moderate') return 'మధ్యస్థ రిస్క్';
    return 'అధిక రిస్క్';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {isTelugu ? 'ఇంటరాక్టివ్ కౌంటర్‌ఫ్యాక్చువల్ సిమ్యులేటర్' : 'Interactive Counterfactual Simulator'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
              {isTelugu ? 'పరిశీలించండి "ఒకవేళ ఇలా జరిగితే?"' : 'Explore "What If?"'}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'సిమ్యులేషన్ రీసెట్ చేయండి' : 'Reset Simulation'}</span>
          </button>
        </div>

        {/* Real-Time Outcome Comparison Banner */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Baseline Current Estimate */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isTelugu ? 'ప్రస్తుత మోడల్ అంచనా' : 'Current Model Estimate'}
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {baselineProbability}%
              </div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {translateRisk(baselineRiskLevel)}
              </span>
            </div>

            {/* Delta Indicator */}
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {isTelugu ? 'సిమ్యులేట్ మార్పు:' : 'Simulated Change:'}
                </span>
                <span className={`text-base font-extrabold font-mono flex items-center gap-0.5 ${
                  deltaProbability < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : deltaProbability > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {deltaProbability > 0 ? `+${deltaProbability}%` : `${deltaProbability}%`}
                  {deltaProbability < 0 ? <TrendingDown className="h-4 w-4" /> : deltaProbability > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {changedFeatures.length === 0
                  ? (isTelugu ? 'క్రింది స్లైడర్‌లు లేదా టోగుల్‌లను సర్దుబాటు చేయండి' : 'Adjust sliders or toggles below')
                  : (isTelugu ? `${changedFeatures.length} అంశాలు మార్చబడ్డాయి` : `${changedFeatures.length} attribute${changedFeatures.length > 1 ? 's' : ''} modified`)}
              </p>
            </div>

            {/* New Simulated Model Estimate */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                {isTelugu ? 'కొత్త మోడల్ అంచనా' : 'New Model Estimate'}
              </span>
              <div className="text-3xl font-extrabold text-teal-900 dark:text-teal-200">
                {simulatedProbability}%
              </div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-300">
                {translateRisk(simulatedRiskLevel)}
              </span>
            </div>

          </div>

          {/* Mandatory Simulator Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <Info className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                {isTelugu ? 'సిమ్యులేషన్ గమనిక: ' : 'Simulation Note: '}
              </strong>
              {isTelugu
                ? 'ఇన్‌పుట్ విలువలు గణితశాస్త్రపరంగా మారినప్పుడు మోడల్ అంచనా ఎలా మారుతుందో ఈ సిమ్యులేషన్ చూపుతుంది. ఇది వైద్య చికిత్స లేదా క్లినికల్ నివారణ కాదు.'
                : "This simulation shows how the model's prediction changes when input values change mathematically. It does not demonstrate medical treatment effectiveness or clinical cure."}
            </p>
          </div>
        </div>

        {/* Interactive Controls Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {isTelugu ? 'సర్దుబాటు చేయగల జీవనశైలి & క్లినికల్ వేరియబుల్స్' : 'Adjustable Clinical & Lifestyle Variables'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu ? 'మార్చదగిన పారామితులలో మార్పులతో ప్రయోగించండి.' : 'Experiment with changes in modifiable physical parameters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Regular Physical Exercise Toggle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'క్రమం తప్పని శారీరక వ్యాయామం' : 'Regular Physical Exercise'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  simulatedData['Reg.Exercise(Y/N)'] === 1
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {simulatedData['Reg.Exercise(Y/N)'] === 1 ? (isTelugu ? 'అవును (క్రియాశీల)' : 'Yes (Active)') : (isTelugu ? 'కాదు (వ్యాయామం లేదు)' : 'No (Sedentary)')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? 'ఇన్సులిన్ నిరోధకత మరియు గ్లూకోజ్ నియంత్రణను ప్రభావితం చేస్తుంది.' : 'Modulates peripheral insulin resistance and glucose clearance.'}
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { label: isTelugu ? 'వ్యాయామం లేదు (కాదు)' : 'Sedentary (No)', value: 0 },
                  { label: isTelugu ? 'క్రియాశీలం (≥150 నిమి/వారం)' : 'Active (≥150 min/wk)', value: 1 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSimulatedField('Reg.Exercise(Y/N)', opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      simulatedData['Reg.Exercise(Y/N)'] === opt.value
                        ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Fast Food Consumption */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'ఫాస్ట్ ఫుడ్ / ప్రాసెస్డ్ ఫుడ్ ఆహారం' : 'Fast Food / Ultra-Processed Meals'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  simulatedData['Fast food (Y/N)'] === 1
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {simulatedData['Fast food (Y/N)'] === 1 ? (isTelugu ? 'తరచుగా' : 'Frequent') : (isTelugu ? 'అరుదుగా / నియంత్రిత' : 'Rare / Controlled')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? 'ఆహారపు గ్లైసెమిక్ లోడ్ ఇన్సులిన్ స్థాయిలను ప్రభావితం చేస్తుంది.' : 'Dietary glycemic load cofactor impacting postprandial insulin spikes.'}
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { label: isTelugu ? 'అరుదుగా / ఇంట్లో ఆహారం (0)' : 'Rare / Home Meals (0)', value: 0 },
                  { label: isTelugu ? 'తరచుగా (1)' : 'Frequent (1)', value: 1 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSimulatedField('Fast food (Y/N)', opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      simulatedData['Fast food (Y/N)'] === opt.value
                        ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Body Weight & BMI Slider */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'శరీర బరువు & BMI' : 'Weight & BMI'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {simulatedData['Weight (Kg)']} kg (BMI: {simulatedData['BMI']})
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={120}
                step={0.5}
                value={simulatedData['Weight (Kg)']}
                onChange={e => updateSimulatedField('Weight (Kg)', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>40 kg</span>
                <span>{isTelugu ? 'ప్రస్తుత: ' : 'Current: '}{patientData['Weight (Kg)']} kg</span>
                <span>120 kg</span>
              </div>
            </div>

            {/* 4. Menstrual Cycle Regularity */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'రుతు చక్రం క్రమం' : 'Menstrual Cycle Rhythm'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {simulatedData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమమైనది (2)' : 'Regular (2)') : (isTelugu ? 'అక్రమమైనది (4)' : 'Irregular (4)')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? 'మోడల్‌లో ప్రధాన సానుకూల అంచనా సూచిక.' : 'Major positive predictor in model (|β| = 0.6785).'}
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { label: isTelugu ? 'క్రమమైనది (21-35 రోజులు)' : 'Regular (21-35 days)', value: 2 },
                  { label: isTelugu ? 'అక్రమమైనది (>35 రోజులు)' : 'Irregular (>35 days)', value: 4 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSimulatedField('Cycle(R/I)', opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      simulatedData['Cycle(R/I)'] === opt.value
                        ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Random Blood Sugar Slider */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'బ్లడ్ షుగర్ (RBS)' : 'Random Blood Sugar (RBS)'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {simulatedData['RBS(mg/dl)']} mg/dL
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={200}
                step={1}
                value={simulatedData['RBS(mg/dl)']}
                onChange={e => updateSimulatedField('RBS(mg/dl)', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>70 mg/dL</span>
                <span>{isTelugu ? 'ప్రస్తుత: ' : 'Current: '}{patientData['RBS(mg/dl)']} mg/dL</span>
                <span>200 mg/dL</span>
              </div>
            </div>

            {/* 6. Right Ovary Follicle Count Slider */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'కుడి అండాశయ ఫోలికల్ సంఖ్య' : 'Right Ovary Follicle Count'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {simulatedData['Follicle No. (R)']} {isTelugu ? 'ఫోలికల్స్' : 'follicles'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={1}
                value={simulatedData['Follicle No. (R)']}
                onChange={e => updateSimulatedField('Follicle No. (R)', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>1 ({isTelugu ? 'సాధారణం' : 'Normal'})</span>
                <span>{isTelugu ? 'ప్రస్తుత: ' : 'Current: '}{patientData['Follicle No. (R)']}</span>
                <span>25 ({isTelugu ? 'పాలిసిస్టిక్' : 'Polycystic'})</span>
              </div>
            </div>

          </div>
        </div>

        {/* Changes Summary Log & Save Action */}
        {changedFeatures.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                {isTelugu ? 'యాక్టివ్ కౌంటర్‌ఫ్యాక్చువల్ మార్పులు' : 'Active Counterfactual Modifications'}
              </h3>

              {/* Save Scenario Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scenarioTitle}
                  onChange={e => setScenarioTitle(e.target.value)}
                  placeholder={isTelugu ? 'సిమ్యులేషన్ పేరు (ఉదా: 5kg బరువు తగ్గినప్పుడు)' : 'Scenario name (e.g. 5kg weight loss)'}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 focus:outline-none w-56"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
                  id="save-simulation-scenario-btn"
                >
                  {isSavedRecently ? <BookmarkCheck className="h-3.5 w-3.5 text-teal-300" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{isSavedRecently ? (isTelugu ? 'సేవ్ అయింది!' : 'Saved!') : (isTelugu ? 'విశ్లేషణను సేవ్ చేయండి' : 'Save Analysis')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {changedFeatures.map(f => (
                <div key={f.feature} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.label}</span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {f.fromFormatted} → <strong className="text-teal-700 dark:text-teal-300">{f.toFormatted}</strong>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-xs ${f.riskImpactDelta < 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {f.riskImpactDelta > 0 ? `+${f.riskImpactDelta}` : f.riskImpactDelta} z-impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Simulation Scenarios History */}
        {savedScenarios.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isTelugu ? 'గతంలో సేవ్ చేసిన సిమ్యులేషన్ విశ్లేషణలు' : 'Saved Simulation Analyses History'}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {savedScenarios.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {savedScenarios.map(sc => (
                <div
                  key={sc.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white truncate">
                      {sc.title}
                    </span>
                    <span className={`font-mono font-black text-xs ${sc.deltaProbability < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {sc.deltaProbability > 0 ? `+${sc.deltaProbability}%` : `${sc.deltaProbability}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{new Date(sc.timestamp).toLocaleDateString()}</span>
                    <span>{sc.baselineProbability}% → <strong className="text-slate-800 dark:text-slate-200">{sc.simulatedProbability}%</strong></span>
                  </div>

                  {sc.changedFeatures && sc.changedFeatures.length > 0 && (
                    <div className="pt-1 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200/60 dark:border-slate-800">
                      {sc.changedFeatures.slice(0, 2).map((cf, idx) => (
                        <div key={idx} className="truncate">
                          • {cf.feature}: {cf.baselineValue} → {cf.simulatedValue}
                        </div>
                      ))}
                      {sc.changedFeatures.length > 2 && (
                        <div>+{sc.changedFeatures.length - 2} more modifications</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
