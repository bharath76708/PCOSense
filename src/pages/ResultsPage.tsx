import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Sliders,
  RotateCcw,
  BookOpen,
  Calendar,
  Sparkles,
  HeartPulse,
  FileText,
  HelpCircle,
  Stethoscope,
  Printer,
  Download,
  Utensils
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { PipelineFlowVisualizer } from '../components/PipelineFlowVisualizer';
import { DoctorDiscussionGuide } from '../components/DoctorDiscussionGuide';
import { PersonalizedRiskReasonsCard } from '../components/PersonalizedRiskReasonsCard';
import { HelpUsImproveModal } from '../components/HelpUsImproveModal';
import { getAssessmentHistory } from '../services/api';
import { useLanguage } from '../translations';

export const ResultsPage: React.FC = () => {
  const { predictionResult, patientData } = useAssessment();
  const [showDoctorGuide, setShowDoctorGuide] = useState<boolean>(false);
  const [assessmentCount, setAssessmentCount] = useState<number>(5);
  const { t, isTelugu } = useLanguage();

  React.useEffect(() => {
    getAssessmentHistory().then(history => {
      setAssessmentCount(history.length);
    }).catch(() => {});
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!predictionResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">{isTelugu ? 'ఎటువంటి అసెస్‌మెంట్ దొరకలేదు' : 'No Assessment Found'}</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          {isTelugu ? 'మీ రిస్క్ ప్రొఫైల్ తెలుసుకోవడానికి 4-దశల రిస్క్ అసెస్‌మెంట్‌ను పూర్తి చేయండి.' : 'Please complete the 4-step risk assessment or select a clinical preset to generate your risk profile.'}
        </p>
        <Link
          to="/assessment"
          className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
        >
          {isTelugu ? 'అసెస్‌మెంట్ ప్రారంభించండి' : 'Start Assessment Now'}
        </Link>
      </div>
    );
  }

  const { probabilityPercentage, risk_level, model_name } = predictionResult;

  // Theme styling based on risk level
  let themeBg = 'from-teal-500/10 to-emerald-500/5';
  let themeBorder = 'border-teal-200';
  let gaugeColor = '#0d9488'; // teal-600
  let badgeBg = 'bg-teal-100 text-teal-900 border-teal-300';
  let RiskIcon = ShieldCheck;

  if (risk_level === 'Moderate') {
    themeBg = 'from-amber-500/10 to-orange-500/5';
    themeBorder = 'border-amber-200';
    gaugeColor = '#d97706'; // amber-600
    badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
    RiskIcon = AlertTriangle;
  } else if (risk_level === 'Elevated') {
    themeBg = 'from-rose-500/10 to-red-500/5';
    themeBorder = 'border-rose-200';
    gaugeColor = '#e11d48'; // rose-600
    badgeBg = 'bg-rose-100 text-rose-900 border-rose-300';
    RiskIcon = ShieldAlert;
  }

  // Calculate SVG circular stroke offset (circumference = 2 * PI * r = 2 * 3.14159 * 54 = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probabilityPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* DEDICATED CLINICAL PRINT HEADER (Only visible on browser print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-wide text-slate-950">
                PCOSENSE CLINICAL RISK ASSESSMENT SUMMARY & SCREENING REPORT
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Hospital Dataset Validated Machine Learning Screening Tool (88.99% Accuracy, 95.09% ROC-AUC)
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Assessment ID: {predictionResult.assessment_id}</div>
              <div className="text-slate-600">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Results Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {isTelugu ? 'అసెస్‌మెంట్ ఫలితం' : 'Assessment Outcome'} • ID: {predictionResult.assessment_id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
              {isTelugu ? 'మీ PCOS రిస్క్ అవగాహన ఫలితం' : 'Your PCOS Risk Awareness Result'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download PDF Report Button (triggers browser print to save PDF) */}
            <button
              type="button"
              onClick={handlePrint}
              id="download-pdf-report-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs"
              title="Download or print clinical screening results as a PDF document"
            >
              <Download className="h-4 w-4 text-teal-200" />
              <span>{isTelugu ? 'PDF రిపోర్ట్ డౌన్‌లోడ్' : 'Download PDF Report'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              id="results-print-report-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
              title="Print clinical summary formatted for doctor appointments"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>{isTelugu ? 'ప్రింట్' : 'Print'}</span>
            </button>

            <button
              onClick={() => setShowDoctorGuide(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-3.5 py-2 text-xs font-bold text-teal-900 dark:text-teal-200 transition-colors shadow-2xs"
            >
              <FileText className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              <span>{isTelugu ? 'డాక్టర్ చర్చా మార్గదర్శి' : 'Doctor Guide'}</span>
            </button>

            <Link
              to="/insights"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-teal-400" />
              <span>{isTelugu ? 'విశ్లేషణ' : 'Insights'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 1. PRIMARY RISK SCORECARD */}
        <div className={`rounded-3xl bg-gradient-to-br ${themeBg} bg-white dark:bg-slate-900 border ${themeBorder} p-6 sm:p-8 shadow-sm transition-all`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: Score Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
                  {/* Track circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-200/80 dark:text-slate-800"
                  />
                  {/* Active progress */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={gaugeColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    {probabilityPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    {isTelugu ? 'అంచనా మోడల్ సంభావ్యత' : 'Estimated Model Probability'}
                  </span>
                </div>
              </div>

              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badgeBg}`}>
                <RiskIcon className="h-3.5 w-3.5" />
                <span>
                  {risk_level === 'Low' 
                    ? (isTelugu ? 'తక్కువ రిస్క్ (Lower Risk)' : 'Lower Risk') 
                    : risk_level === 'Moderate' 
                    ? (isTelugu ? 'మధ్యస్థ రిస్క్ (Moderate Risk)' : 'Moderate Risk') 
                    : (isTelugu ? 'ఎక్కువ రిస్క్ (Higher Risk)' : 'Higher Risk')}
                </span>
              </div>
            </div>

            {/* Right: Clinical Interpretation Summary */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                  {risk_level === 'Low' && (isTelugu ? 'తక్కువ PCOS రిస్క్ సంకేతాలు (Lower Risk)' : 'Lower Statistical Risk of PCOS Profile')}
                  {risk_level === 'Moderate' && (isTelugu ? 'మధ్యస్థ రిస్క్: సంభావ్య అండోత్పత్తి లేదా జీవక్రియ సంకేతాలు' : 'Moderate Risk: Potential Ovulatory or Metabolic Indicators')}
                  {risk_level === 'Elevated' && (isTelugu ? 'ఎక్కువ రిస్క్: బహుళ రోటర్‌డామ్ సూచికలు కనుగొనబడ్డాయి' : 'Higher Risk: Multiple Rotterdam Features Observed')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                  {risk_level === 'Low' &&
                    (isTelugu
                      ? 'మీరు నివేదించిన పారామితులు (పీరియడ్స్ క్రమం, జీవక్రియ మరియు ఆండ్రోజెన్ సూచికలు) మోడల్ డేటాలో సాధారణ ఆరోగ్యకరమైన సమూహంతో సరిపోలుతున్నాయి.'
                      : 'Your reported parameters (cycle regularity, metabolic vitals, and androgenic indicators) align closely with baseline non-PCOS cohorts.')}
                  {risk_level === 'Moderate' &&
                    (isTelugu
                      ? 'మీ అసెస్‌మెంట్ కొన్ని ప్రత్యేక సంకేతాలను చూపుతోంది — ఉదాహరణకు పీరియడ్స్ హెచ్చుతగ్గులు లేదా అధిక BMI — ఇవి వైద్యుల పర్యవేక్షణ మరియు జీవనశైలి మార్పులను కోరుతున్నాయి.'
                      : 'Your assessment reflects isolated markers—such as cycle variability, elevated BMI, or mild androgenic signs—that warrant proactive clinical observation and routine monitoring.')}
                  {risk_level === 'Elevated' &&
                    (isTelugu
                      ? 'మీ వివరాలు PCOS తో బాధపడుతున్న సమూహాల గణాంక సంకేతాలతో (పీరియడ్స్ అక్రమత, అధిక ఆండ్రోజెన్, ఫోలికల్స్) గణనీయమైన సారూప్యతను సూచిస్తున్నాయి.'
                      : 'Your input profile demonstrates a high mathematical alignment with documented PCOS cases, particularly in cycle irregularities, follicle markers, and cutaneous hyperandrogenism.')}
                </p>
              </div>

              {/* Crucial Required Medical Disclaimer */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
                <p className="font-bold flex items-start gap-1.5">
                  <span className="text-sm leading-none">⚠️</span>
                  <span>
                    {isTelugu 
                      ? 'ఈ ఫలితం కేవలం ఆరోగ్య అవగాహన మరియు స్క్రీనింగ్ కొరకు మాత్రమే. ఇది వైద్య నిర్ధారణ (డయాగ్నసిస్) కాదు. క్లినికల్ మూల్యాంకనం కోసం దయచేసి అర్హతగల వైద్యుడిని సంప్రదించండి.'
                      : 'This result is for health awareness and screening purposes only. It is not a medical diagnosis. Please consult a qualified healthcare provider for clinical evaluation.'}
                  </span>
                </p>
                <p className="text-amber-800/80 dark:text-amber-300/80 text-[11px]">
                  {isTelugu ? '541 ఆసుపత్రి క్లినికల్ రికార్డులపై శిక్షణ పొందిన మెషిన్ లెర్నింగ్ మోడల్ ద్వారా అంచనా వేయబడింది.' : `Estimated via ${model_name} trained on 541 hospital clinical records (88.99% Accuracy, 95.09% ROC-AUC).`}
                </p>
              </div>

              {/* Quick Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl bg-white/80 border border-slate-200/80 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isTelugu ? 'BMI & నడుము' : 'BMI & Waist'}</span>
                  <span className="text-xs font-bold text-slate-900">{patientData['BMI']} kg/m²</span>
                  <span className="text-[10px] text-slate-500 block">{isTelugu ? 'నడుము:తుంటి నిష్పత్తి' : 'W:H Ratio'} {patientData['Waist:Hip Ratio']}</span>
                </div>

                <div className="rounded-xl bg-white/80 border border-slate-200/80 p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isTelugu ? 'పీరియడ్స్ సైకిల్' : 'Menstrual Cycle'}</span>
                  <span className="text-xs font-bold text-slate-900">
                    {patientData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమబద్ధమైనది' : 'Regular') : (isTelugu ? 'సక్రమంగా లేదు' : 'Irregular (Oligo)')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{patientData['Cycle length(days)']} {isTelugu ? 'రోజులు' : 'days'}</span>
                </div>

                <div className="rounded-xl bg-white/80 border border-slate-200/80 p-3 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isTelugu ? 'మోడల్ ప్రమాణం' : 'Model Benchmark'}</span>
                  <span className="text-xs font-bold text-slate-900">Logistic Regression</span>
                  <span className="text-[10px] text-teal-700 font-mono block">95.09% ROC-AUC</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 1b. PERSONALIZED RISK REASONS & ACTIONABLE NUTRITION BREAKDOWN */}
        <PersonalizedRiskReasonsCard
          patientData={patientData}
          prediction={predictionResult}
          riskLevel={risk_level}
        />

        {/* 2. PLAIN-ENGLISH INTERPRETATION & ROTTERDAM GUIDE */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HelpCircle className="h-5 w-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-950">
              {isTelugu ? 'మీ ఫలితాల ప్రతి అంశాన్ని ఎలా అర్థం చేసుకోవాలి' : 'How to Understand Every Point of Your Result'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-900 block">
                {isTelugu ? '1. సంభావ్యత శాతం (%) అంటే ఏమిటి?' : '1. What does the probability percentage mean?'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isTelugu
                  ? 'ఈ శాతం మీ శారీరక, పీరియడ్స్ మరియు ఇతర లక్షణాల ఆధారంగా PCOS వర్గానికి చెందిన సంభావ్యతను సూచిస్తుంది. ఇది రోగ నిర్ధారణ కాదు.'
                  : 'The percentage represents the statistical likelihood that a person with your exact combination of physical, menstrual, and lab features belongs to the PCOS cohort in our clinical reference dataset. It is not a diagnosis.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-900 block">
                {isTelugu ? '2. క్రమబద్ధమైన పీరియడ్స్ ఎందుకు ముఖ్యమైనవి?' : '2. Why are regular cycles so important?'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isTelugu
                  ? 'ప్రతి 21 నుండి 35 రోజులకు ఒకసారి వచ్చే క్రమబద్ధమైన పీరియడ్స్ సరైన అండోత్పత్తిని సూచిస్తాయి, ఇది PCOS నివారణలో బలమైన రక్షణ కారకం.'
                  : 'Regular cycles (every 21 to 35 days) indicate consistent monthly ovulation, which is one of the strongest protective factors against PCOS development.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-900 block">
                {isTelugu ? '3. రోటర్‌డామ్ 2003 ప్రమాణాలు ఏమిటి?' : '3. What is the Rotterdam 2003 criteria?'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isTelugu
                  ? 'PCOS నిర్ధారణకు 3 ప్రధాన అంశాలలో కనీసం 2 ఉండాలి: (1) అక్రమ లేదా లోపించిన అండోత్పత్తి, (2) ఆండ్రోజెన్ హార్మోన్ల పెరుగుదల, (3) అల్ట్రాసౌండ్‌లో పాలిసిస్టిక్ అండాశయాలు.'
                  : 'International clinical standards require at least 2 of 3 features for diagnosis: (1) Irregular/absent ovulation, (2) Clinical or biochemical androgen excess, (3) Polycystic ovaries on ultrasound.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="font-bold text-slate-900 block">
                {isTelugu ? '4. తరువాత తీసుకోవలసిన చర్యలు ఏమిటి?' : '4. What are the best next steps?'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isTelugu
                  ? 'మీ స్కోర్ మధ్యస్థంగా లేదా ఎక్కువగా ఉంటే, డాక్టర్ చర్చా మార్గదర్శిని ఉపయోగించి హార్మోన్ పరీక్షలు మరియు పెల్విక్ అల్ట్రాసౌండ్ కోసం గైనకాలజిస్ట్‌ను సంప్రదించండి.'
                  : 'If your score is moderate or elevated, print the Doctor Discussion Guide and request a baseline reproductive hormone panel (Day 3 FSH, LH, Estradiol, Total Testosterone) and pelvic ultrasound.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. PIPELINE STEP VISUALIZER (ACTIVE: STEP 5 RISK ESTIMATION & STEP 6 SHAP) */}
        <PipelineFlowVisualizer currentStepId="risk_estimation" />

        {/* 4. RISK PROFILE CATEGORY BREAKDOWN */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-950">
              {isTelugu ? 'విభాగాల వారీగా రిస్క్ ప్రొఫైల్ విశ్లేషణ' : 'Categorical Risk Profile Breakdown'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTelugu ? 'మీ ప్రస్తుత అసెస్‌మెంట్‌ను ప్రభావితం చేసే లక్షణాల విశ్లేషణ.' : 'Analysis of features influencing your current assessment.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Category 1: Menstrual & Ovulatory History */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Calendar className="h-4 w-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {isTelugu ? 'పీరియడ్స్ & అండోత్పత్తి ప్రొఫైల్' : 'Ovulatory & Cycle Profile'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patientData['Cycle(R/I)'] === 2
                  ? (isTelugu ? 'మీ పీరియడ్స్ క్రమబద్ధంగా ఉన్నాయి, ఇది ఆరోగ్యకరమైన అండోత్పత్తికి బలమైన సంకేతం.' : 'Your cycles follow a regular monthly interval, which is a significant protective factor against anovulation.')
                  : (isTelugu ? 'పీరియడ్స్ సక్రమంగా లేకపోవడం ఆలస్యమైన లేదా లోపించిన అండోత్పత్తిని సూచిస్తుంది.' : 'Reported cycle irregularity suggests delayed or absent ovulation, one of the primary Rotterdam criteria.')}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-slate-500">
                {isTelugu ? 'రక్తస్రావ వ్యవధి:' : 'Bleed duration:'} <span className="text-slate-900">{patientData['Cycle length(days)']} {isTelugu ? 'రోజులు' : 'days'}</span>
              </div>
            </div>

            {/* Category 2: Androgenic & Skin Symptoms */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {isTelugu ? 'ఆండ్రోజెనిక్ & చర్మ లక్షణాలు' : 'Androgenic & Cutaneous'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patientData['hair growth(Y/N)'] || patientData['Pimples(Y/N)'] || patientData['Skin darkening (Y/N)']
                  ? (isTelugu ? 'అవాంఛిత రోమాలు, మొటిమలు లేదా చర్మం నల్లబడటం ఆండ్రోజెన్ లేదా ఇన్సులిన్ ప్రభావాలను చూపుతాయి.' : 'Presence of hirsutism, cystic breakouts, or acanthosis nigricans reflects systemic androgen or insulin activity.')
                  : (isTelugu ? 'ఈ అసెస్‌మెంట్‌లో తక్కువ చర్మ సంబంధిత లక్షణాలు నమోదయ్యాయి.' : 'Minimal dermatological hyperandrogenism signs reported in this assessment.')}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-slate-500">
                {isTelugu ? 'చర్మం నల్లబడటం:' : 'Skin Darkening:'} <span className="text-slate-900">{patientData['Skin darkening (Y/N)'] ? (isTelugu ? 'ఉన్నది' : 'Yes') : (isTelugu ? 'లేదు' : 'No')}</span>
              </div>
            </div>

            {/* Category 3: Metabolic & Lifestyle */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <HeartPulse className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {isTelugu ? 'జీవక్రియ & జీవనశైలి' : 'Metabolic & Lifestyle'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patientData['Reg.Exercise(Y/N)']
                  ? (isTelugu ? 'క్రమమైన వ్యాయామం ఇన్సులిన్ సున్నితత్వాన్ని మరియు జీవక్రియ స్థిరత్వాన్ని పెంచుతుంది.' : 'Active regular exercise significantly boosts peripheral insulin sensitivity and metabolic stability.')
                  : (isTelugu ? 'వ్యాయామం లేకపోవడం లేదా ప్రాసెస్ చేసిన ఆహారాలు గ్లూకోజ్ అసమతుల్యతను పెంచుతాయి.' : 'Sedentary routine or frequent processed meals can amplify glucose intolerance.')}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-slate-500">
                {isTelugu ? 'వ్యాయామం:' : 'Exercise:'} <span className="text-slate-900">{patientData['Reg.Exercise(Y/N)'] ? (isTelugu ? 'క్రమం తప్పకుండా (చురుకుగా)' : 'Regular (Active)') : (isTelugu ? 'వ్యాయామం తక్కువ' : 'Sedentary')}</span>
              </div>
            </div>

          </div>
        </div>

        {/* CLINICAL SIGNATURE & VERIFICATION BLOCK (Only visible in Print) */}
        <div className="hidden print:block border border-slate-900 rounded-xl p-5 break-inside-avoid my-6 bg-white text-slate-900">
          <h4 className="text-xs font-black uppercase text-slate-950 border-b border-slate-300 pb-2 mb-3">
            Physician Consultation & Verification Sign-Off
          </h4>
          <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Consulting Physician Name</span>
                <div className="border-b border-slate-400 h-6 mt-1" />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Clinical Assessment Notes & Recommendations</span>
                <div className="border-b border-slate-300 h-6 mt-1" />
                <div className="border-b border-slate-300 h-6 mt-1" />
                <div className="border-b border-slate-300 h-6 mt-1" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Clinic / Hospital Affiliation & Stamp</span>
                <div className="border border-dashed border-slate-400 h-20 mt-1 rounded-lg" />
              </div>
              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Physician Signature</span>
                  <div className="border-b border-slate-400 w-36 h-6 mt-1" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Date</span>
                  <div className="border-b border-slate-400 w-24 h-6 mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. NEXT STEPS & EXPLORATION ACTIONS */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors no-print">
          <h3 className="text-base font-bold text-slate-950 dark:text-white mb-1">
            {isTelugu ? 'సూచించిన తదుపరి చర్యలు' : 'Recommended Next Steps'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {isTelugu ? 'మీ ఫలితాలను మరింత లోతుగా విశ్లేషించడానికి మరియు ఆరోగ్య అవగాహనను పెంచుకోవడానికి సాధనాలు.' : 'Interactive tools to explore model reasoning, consult AI guidance, and track history.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Action 0: 7-Day Anti-PCOS Diet Plan & Cravings */}
            <Link
              to="/diet-plan"
              id="results-to-diet-plan-btn"
              className="p-4 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/70 dark:hover:bg-teal-900/50 hover:border-teal-400 dark:hover:border-teal-600 transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? '7 రోజుల డైట్ ప్లాన్ & క్రేవింగ్స్' : '7-Day Diet Plan & Cravings'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {isTelugu ? 'మీ రిస్క్ తగ్గించడానికి అనుకూలమైన భోజనం మరియు క్రేవింగ్ రెసిపీలు.' : 'Personalized recipes & Craving Chef AI to improve risk factors.'}
                </p>
              </div>
            </Link>

            {/* Action 1: Understand My Result */}
            <Link
              to="/insights"
              id="results-to-insights-btn"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{isTelugu ? 'ఫలితాన్ని అర్థం చేసుకోండి' : 'Understand My Result'}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isTelugu ? 'రిస్క్ స్కోర్‌ను పెంచిన లేదా తగ్గించిన కారకాల విశ్లేషణను చూడండి.' : 'View feature importance and statistical attribution drivers.'}
                </p>
              </div>
            </Link>

            {/* Action 2: Ask PCOSense AI */}
            <Link
              to="/dashboard"
              id="results-to-ai-btn"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{isTelugu ? 'PCOSense AI ని అడగండి' : 'Ask PCOSense AI'}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isTelugu ? 'మీ ఫలితం మరియు ఆహార నియమాల గురించి AI అసిస్టెంట్‌తో మాట్లాడండి.' : 'Ask questions about your risk profile, labs, and nutrition.'}
                </p>
              </div>
            </Link>

            {/* Action 3: Learn About PCOS */}
            <Link
              to="/education"
              id="results-to-education-btn"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{isTelugu ? 'PCOS గురించి తెలుసుకోండి' : 'Learn About PCOS'}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isTelugu ? 'రోటర్‌డామ్ ప్రమాణాలు, హార్మోన్లు మరియు సంరక్షణ సమాచారం.' : 'Explore Rotterdam criteria, phenotypes, and guidelines.'}
                </p>
              </div>
            </Link>

            {/* Action 4: View History */}
            <Link
              to="/history"
              id="results-to-history-btn"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{isTelugu ? 'చరిత్ర చూడండి' : 'View History'}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isTelugu ? 'గత స్క్రీనింగ్‌లు మరియు కాలక్రమేణా మార్పులను ట్రాక్ చేయండి.' : 'Track longitudinal risk evolution over multiple screenings.'}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Doctor Discussion Guide Modal */}
        <DoctorDiscussionGuide
          isOpen={showDoctorGuide}
          onClose={() => setShowDoctorGuide(false)}
          prediction={predictionResult}
          patientData={patientData}
        />

        {/* Subtle Help Us Improve Modal (triggers on 5th assessment milestone) */}
        <HelpUsImproveModal assessmentCount={assessmentCount} />

      </div>
    </div>
  );
};
