import React, { useState } from 'react';
import {
  User,
  ClipboardList,
  Binary,
  Cpu,
  Gauge,
  BarChart3,
  HeartPulse,
  Save,
  LayoutDashboard,
  Bot,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../translations';

interface StepDetail {
  id: string;
  stepNumber: number;
  title: string;
  titleTe: string;
  shortDesc: string;
  shortDescTe: string;
  detailedExplanation: string;
  detailedExplanationTe: string;
  clinicalMeaning: string;
  clinicalMeaningTe: string;
  technicalUnderpinning: string;
  icon: React.ElementType;
  badge: string;
  badgeTe: string;
  color: string;
}

const PIPELINE_STEPS: StepDetail[] = [
  {
    id: 'user_input',
    stepNumber: 1,
    title: '1. User Input',
    titleTe: '1. వినియోగదారు నమోదు',
    shortDesc: 'Patient profile, symptoms & lab biomarkers',
    shortDescTe: 'రోగి ప్రొఫైల్, లక్షణాలు & ల్యాబ్ బయోమార్కర్లు',
    detailedExplanation: 'The user enters physical biometrics (age, BMI, blood pressure), menstrual cycle patterns, dermatological androgen signs (hirsutism, acne, skin darkening), and optional laboratory/ultrasound results.',
    detailedExplanationTe: 'వినియోగదారు భౌతిక బయోమెట్రిక్స్ (వయస్సు, BMI, రక్తపోటు), ఋతు చక్రం సరళులు, చర్మ సంకేతాలు (అవాంఛిత రోమాలు, మొటిమలు, నల్లబడటం), మరియు ఐచ్ఛిక ప్రయోగశాల/అల్ట్రాసౌండ్ ఫలితాలను నమోదు చేస్తారు.',
    clinicalMeaning: 'Captures the cardinal symptomatic signs defined in the Rotterdam 2003 consensus and ACOG clinical practice guidelines.',
    clinicalMeaningTe: 'రొటర్‌డ్యామ్ 2003 మరియు ACOG క్లినికల్ మార్గదర్శకాలలో నిర్వచించబడిన ముఖ్యమైన లక్షణ సంకేతాలను సేకరిస్తుంది.',
    technicalUnderpinning: 'Collects 41 standardized patient features with client-side reactive calculations (BMI, Waist-to-Hip ratio, FSH/LH ratio).',
    icon: User,
    badge: 'Step 1: Ingestion',
    badgeTe: 'దశ 1: సమాచార సేకరణ',
    color: 'emerald'
  },
  {
    id: 'assessment_form',
    stepNumber: 2,
    title: '2. PCOS Assessment Form',
    titleTe: '2. PCOS అంచనా ఫారం',
    shortDesc: 'Guided 5-step wizard with validation',
    shortDescTe: 'ధృవీకరణతో కూడిన 5-దశల వి విజార్డ్',
    detailedExplanation: 'A multi-step structured intake wizard organizes information into logical clinical domains: Physical, Menstrual, Androgenic, Lifestyle, and Lab Panels, supported by one-click verified test presets.',
    detailedExplanationTe: 'బహుళ-దశల నిర్మాణాత్మక వి విజార్డ్ సమాచారాన్ని తార్కిక క్లినికల్ విభాగాలుగా విభజిస్తుంది: భౌతిక, ఋతుక్రమ, ఆండ్రోజెనిక్, జీవనశైలి మరియు ల్యాబ్ ప్యానెల్స్.',
    clinicalMeaning: 'Reduces patient cognitive load and eliminates clinical reporting errors through structured step-by-step guidance.',
    clinicalMeaningTe: 'నిర్మాణాత్మక దశల మార్గదర్శకత్వం ద్వారా రోగుల సంకోచాన్ని తగ్గిస్తుంది మరియు రిపోర్టింగ్ లోపాలను నివారిస్తుంది.',
    technicalUnderpinning: 'State machine in React context with sessionStorage auto-recovery and field-level validation boundaries.',
    icon: ClipboardList,
    badge: 'Step 2: Intake',
    badgeTe: 'దశ 2: నమోదు',
    color: 'teal'
  },
  {
    id: 'preprocessing',
    stepNumber: 3,
    title: '3. Preprocessing',
    titleTe: '3. డేటా ప్రాసెసింగ్',
    shortDesc: 'StandardScaler normalization & imputation',
    shortDescTe: 'StandardScaler సాధారణీకరణ & ఇంప్యుటేషన్',
    detailedExplanation: 'Raw patient features are transformed using exact mean (μ) and standard deviation (σ) parameters derived from the 541-patient training distribution. Missing values receive median imputation.',
    detailedExplanationTe: '541 మంది రోగుల శిక్షణ పంపిణీ నుండి తీసుకోబడిన ఖచ్చితమైన సగటు (μ) మరియు ప్రామాణిక విచలనం (σ) పారామితులను ఉపయోగించి ముడి లక్షణాలు మార్చబడతాయి.',
    clinicalMeaning: 'Ensures that continuous vitals (like blood pressure or AMH) and discrete binary indicators (like skin darkening) are evaluated on identical, unbiased scales.',
    clinicalMeaningTe: 'నిరంతర సంకేతాలు మరియు బైనరీ సూచికలు నిష్పాక్షికమైన ప్రమాణాలపై మూల్యాంకనం చేయబడతాయని నిర్ధారిస్తుంది.',
    technicalUnderpinning: 'z = (x - μ) / σ computed synchronously across all 41 feature indices with exact floating-point scikit-learn alignment.',
    icon: Binary,
    badge: 'Step 3: Transform',
    badgeTe: 'దశ 3: రూపాంతరం',
    color: 'cyan'
  },
  {
    id: 'ml_model',
    stepNumber: 4,
    title: '4. ML Model Engine',
    titleTe: '4. ML మోడల్ ఇంజిన్',
    shortDesc: 'Logistic Regression classifier (95.09% ROC-AUC)',
    shortDescTe: 'లాజిస్టిక్ రిగ్రెషన్ క్లాసిఫైయర్ (95.09% ROC-AUC)',
    detailedExplanation: 'The calibrated scikit-learn Logistic Regression engine computes the log-odds decision boundary (z = βᵀX + β₀) across all standardized clinical attributes.',
    detailedExplanationTe: 'ప్రామాణిక క్లినికల్ లక్షణాల ఆధారంగా లాగ్-ఆడ్స్ నిర్ణయ సరిహద్దును గణించే గణన ఇంజిన్.',
    clinicalMeaning: 'Evaluates the multidimensional synergistic interaction of reproductive, androgenic, and metabolic markers simultaneously.',
    clinicalMeaningTe: 'పునరుత్పత్తి, ఆండ్రోజెనిక్ మరియు జీవక్రియ మార్కర్ల పరస్పర చర్యలను ఏకకాలంలో మూల్యాంకనం చేస్తుంది.',
    technicalUnderpinning: 'Cross-validated benchmark model outperforming Random Forest and SVM on precision-recall balance (88.99% accuracy, 86.11% recall).',
    icon: Cpu,
    badge: 'Step 4: Inference',
    badgeTe: 'దశ 4: అంచనా',
    color: 'indigo'
  },
  {
    id: 'risk_estimation',
    stepNumber: 5,
    title: '5. Risk Estimation',
    titleTe: '5. ప్రమాద అంచనా',
    shortDesc: 'Probability mapping & risk stratification',
    shortDescTe: 'సంభావ్యత మ్యాపింగ్ & ప్రమాద వర్గీకరణ',
    detailedExplanation: 'The log-odds value is passed through the standard Sigmoid activation function [P(y=1) = 1 / (1 + e⁻ᶻ)] to calculate an exact risk percentage stratified into Low (<40%), Moderate (40-69%), or Elevated (≥70%) Risk.',
    detailedExplanationTe: 'సిగ్మోయిడ్ ఫంక్షన్ ద్వారా ఖచ్చితమైన ప్రమాద శాతాన్ని లెక్కించి తక్కువ (<40%), మధ్యస్థం (40-69%), లేదా పెరిగిన (≥70%) ప్రమాదంగా వర్గీకరిస్తుంది.',
    clinicalMeaning: 'Translates raw mathematical boundaries into intuitive, actionable clinical risk tiers with clear safety guardrails.',
    clinicalMeaningTe: 'గణిత విలువలను సులభంగా అర్థమయ్యే మరియు ఆచరణాత్మకమైన క్లినికల్ రిస్క్ స్థాయిలుగా మారుస్తుంది.',
    technicalUnderpinning: 'Sigmoid curve bounding output between 0.00% and 100.00% with strict non-diagnostic disclaimers.',
    icon: Gauge,
    badge: 'Step 5: Probability',
    badgeTe: 'దశ 5: సంభావ్యత',
    color: 'blue'
  },
  {
    id: 'shap_explanation',
    stepNumber: 6,
    title: '6. SHAP / Factor Attribution',
    titleTe: '6. ఫ్యాక్టర్ వివరణ (SHAP)',
    shortDesc: 'Exact mathematical explainability (β_i · z_i)',
    shortDescTe: 'ఖచ్చితమైన గణిత వివరణీయత (β_i · z_i)',
    detailedExplanation: 'Deconstructs the risk score into exact individual positive risk drivers (red) and protective factors (green). Users see precisely which factors pushed their probability up or down.',
    detailedExplanationTe: 'ప్రమాద స్కోర్‌ను పెంచే అంశాలు మరియు రక్షించే అంశాలుగా విభజించి స్పష్టంగా చూపుతుంది.',
    clinicalMeaning: 'Eliminates "black-box" AI opacity. Patients and clinicians see clearly whether irregular cycles, follicle counts, or BMI drove the risk score.',
    clinicalMeaningTe: 'బ్లాక్-బాక్స్ AI అస్పష్టతను తొలగిస్తుంది. క్రమరహిత చక్రాలు, ఫోలికల్స్ లేదా BMI ప్రమాదాన్ని పెంచాయో స్పష్టంగా తెలియజేస్తుంది.',
    technicalUnderpinning: 'Decomposed linear attribution score equal to the standardized z-score multiplied by the learned coefficient for each feature.',
    icon: BarChart3,
    badge: 'Step 6: XAI',
    badgeTe: 'దశ 6: XAI',
    color: 'violet'
  },
  {
    id: 'personalized_awareness',
    stepNumber: 7,
    title: '7. Personalized Awareness',
    titleTe: '7. వ్యక్తిగతీకరించిన అవగాహన',
    shortDesc: 'Tailored evidence-based nutrition & guidance',
    shortDescTe: 'వ్యక్తిగతీకరించిన పోషకాహార & జీవనశైలి సలహాలు',
    detailedExplanation: 'Generates individualized lifestyle, nutritional, and medical consultation action plans based on the patient’s specific risk profile, cycle regularity, and glycemic indicators.',
    detailedExplanationTe: 'రోగి యొక్క నిర్దిష్ట ప్రమాద ప్రొఫైల్ ఆధారంగా వ్యక్తిగత జీవనశైలి, పోషకాహార మరియు వైద్య సలహా ప్రణాళికలను రూపొందిస్తుంది.',
    clinicalMeaning: 'Empowers patients with evidence-based interventions: low-glycemic Mediterranean nutrition, resistance exercise, and sleep hygiene.',
    clinicalMeaningTe: 'తక్కువ-గ్లైసిమిక్ ఆహారం, వ్యాయామం మరియు సరైన నిద్ర వంటి సాక్ష్యాధారిత మార్గదర్శకాలను అందిస్తుంది.',
    technicalUnderpinning: 'Rule-based and guideline-indexed mapping matching international PCOS guidelines (ESHRE/ASRM 2023).',
    icon: HeartPulse,
    badge: 'Step 7: Awareness',
    badgeTe: 'దశ 7: అవగాహన',
    color: 'rose'
  },
  {
    id: 'save_result',
    stepNumber: 8,
    title: '8. Save Result',
    titleTe: '8. ఫలితాన్ని సేవ్ చేయండి',
    shortDesc: 'Persistent local storage & historical logging',
    shortDescTe: 'సురక్షిత లోకల్ స్టోరేజ్ & చరిత్ర రికార్డు',
    detailedExplanation: 'The full assessment snapshot (timestamp, risk score, key biomarkers, patient parameters) is securely persisted in the user’s local storage and backend history store.',
    detailedExplanationTe: 'పూర్తి అంచనా స్నాప్‌షాట్ సురక్షితంగా బ్రౌజర్ లోకల్ స్టోరేజ్ మరియు హిస్టరీలో నిల్వ చేయబడుతుంది.',
    clinicalMeaning: 'Enables patients to track symptom progression over time and monitor improvements before/after lifestyle adjustments.',
    clinicalMeaningTe: 'సమయం గడిచేకొద్దీ లక్షణాల మార్పులను ట్రాక్ చేయడానికి మరియు జీవనశైలి మెరుగుదలలను గమనించడానికి సహాయపడుతుంది.',
    technicalUnderpinning: 'Dual-tier storage syncing to browser localStorage with unique assessment hash identifiers (PCO-XXXXX).',
    icon: Save,
    badge: 'Step 8: Persistence',
    badgeTe: 'దశ 8: నిల్వ',
    color: 'amber'
  },
  {
    id: 'dashboard',
    stepNumber: 9,
    title: '9. Patient Dashboard',
    titleTe: '9. పేషెంట్ డ్యాష్‌బోర్డ్',
    shortDesc: 'Longitudinal trends & What-If counterfactuals',
    shortDescTe: 'ట్రెండ్స్ & సిమ్యులేటర్ విశ్లేషణ',
    detailedExplanation: 'An interactive analytical portal displaying historical risk trajectories, interactive What-If simulators, downloadable clinical summaries, and comparison views.',
    detailedExplanationTe: 'చరిత్ర ప్రమాద పథాలు, వాట్-ఇఫ్ సిమ్యులేటర్లు మరియు డౌన్‌లోడ్ చేసుకోగల నివేదికలను ప్రదర్శించే ఇంటరాక్టివ్ పోర్టల్.',
    clinicalMeaning: 'Allows proactive health monitoring and structured preparation for doctor consultations with printable summaries.',
    clinicalMeaningTe: 'ముందస్తు ఆరోగ్య పర్యవేక్షణ మరియు వైద్యుల సంప్రదింపుల కోసం ప్రింటబుల్ సారాంశాలతో సంసిద్ధతను అనుమతిస్తుంది.',
    technicalUnderpinning: 'Responsive SVG trend charts, counterfactual delta recalculation, and printable JSON/PDF export capabilities.',
    icon: LayoutDashboard,
    badge: 'Step 9: Analytics',
    badgeTe: 'దశ 9: విశ్లేషణలు',
    color: 'slate'
  },
  {
    id: 'ai_assistant',
    stepNumber: 10,
    title: '10. AI Awareness Assistant',
    titleTe: '10. AI అవగాహన అసిస్టెంట్',
    shortDesc: '24/7 Gemini-grounded clinical Q&A',
    shortDescTe: '24/7 Gemini ఆధారిత క్లినికల్ ప్రశ్నోత్తరాలు',
    detailedExplanation: 'An interactive conversational assistant powered by Google Gemini (gemini-3.7-flash) and grounded on clinical literature to explain any lab test, symptom, or question in plain language.',
    detailedExplanationTe: 'Google Gemini ఆధారిత సంభాషణా అసిస్టెంట్, ఏదైనా ల్యాబ్ పరీక్ష లేదా లక్షణాన్ని సరళమైన భాషలో వివరిస్తుంది.',
    clinicalMeaning: 'Provides instant, compassionate, jargon-free medical literacy support to help patients understand every single point.',
    clinicalMeaningTe: 'రోగులు ప్రతి అంశాన్ని అర్థం చేసుకోవడానికి తక్షణ, సులభమైన వైద్య అక్షరాస్యత మద్దతును అందిస్తుంది.',
    technicalUnderpinning: 'Server-side @google/genai integration with RAG retrieval from the Rotterdam 2003 clinical knowledge base.',
    icon: Bot,
    badge: 'Step 10: RAG Assistant',
    badgeTe: 'దశ 10: AI అసిస్టెంట్',
    color: 'teal'
  }
];

interface PipelineFlowVisualizerProps {
  currentStepId?: string;
  onSelectStep?: (stepId: string) => void;
}

export const PipelineFlowVisualizer: React.FC<PipelineFlowVisualizerProps> = ({
  currentStepId,
  onSelectStep
}) => {
  const [selectedStep, setSelectedStep] = useState<StepDetail>(
    PIPELINE_STEPS.find(s => s.id === currentStepId) || PIPELINE_STEPS[0]
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { isTelugu } = useLanguage();

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-6 transition-colors">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              {isTelugu ? 'PCOSense ఆర్కిటెక్చర్ & డేటా పైప్‌లైన్' : 'PCOSense Architecture & Data Pipeline'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isTelugu
              ? 'లక్షణాల నమోదు నుండి ML ప్రమాద అంచనా మరియు AI మద్దతు వరకు మొత్తం 10-దశల ప్రవాహం'
              : 'Visualizing the complete 10-step flow from user symptom intake to ML risk estimation and AI assistance'}
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto"
        >
          <span>{isExpanded ? (isTelugu ? 'కుదించు' : 'Compact View') : (isTelugu ? 'అన్ని దశలను చూడండి' : 'Explore All Steps')}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* HORIZONTAL STEP FLOW STRIP */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center min-w-[780px] gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = selectedStep.id === step.id;
            const isCurrent = currentStepId === step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setSelectedStep(step);
                    if (onSelectStep) onSelectStep(step.id);
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center shrink-0 w-32 sm:w-36 ${
                    isSelected
                      ? 'bg-teal-900 dark:bg-teal-950 text-white border-teal-800 dark:border-teal-700 shadow-md ring-2 ring-teal-500/30'
                      : isCurrent
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-700 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-750'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected
                        ? 'bg-white/20 text-teal-200'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold truncate w-full">
                    {isTelugu ? step.titleTe : step.title}
                  </span>
                  <span
                    className={`text-[9px] mt-0.5 truncate w-full ${
                      isSelected ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isTelugu ? step.badgeTe : step.badge}
                  </span>
                </button>

                {idx < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* DETAILED ACTIVE STEP EXPLANATION CARD */}
      {isExpanded && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-slate-950/60 dark:to-teal-950/20 border border-teal-100 dark:border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                {React.createElement(selectedStep.icon, { className: 'h-5 w-5' })}
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 tracking-wide uppercase">
                  {isTelugu ? `దశ ${selectedStep.stepNumber} (మొత్తం 10 లో)` : `Step ${selectedStep.stepNumber} of 10`}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {isTelugu ? selectedStep.titleTe : selectedStep.title}
                </h4>
              </div>
            </div>
            <span className="text-xs bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold px-3 py-1 rounded-full self-start sm:self-auto">
              {isTelugu ? selectedStep.shortDescTe : selectedStep.shortDesc}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {isTelugu ? selectedStep.detailedExplanationTe : selectedStep.detailedExplanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isTelugu ? 'క్లినికల్ & రోగ నిర్ధారణ అర్థం' : 'Clinical & Diagnostic Meaning'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isTelugu ? selectedStep.clinicalMeaningTe : selectedStep.clinicalMeaning}
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{isTelugu ? 'ఇంజనీరింగ్ & గణిత ప్రాతిపదిక' : 'Engineering & Math Underpinning'}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[11px]">
                {selectedStep.technicalUnderpinning}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
