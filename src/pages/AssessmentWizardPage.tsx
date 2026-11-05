import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Sparkles,
  HeartPulse,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { FEATURE_METADATA, PRESET_PROFILES } from '../ml/modelEngine';
import { PipelineFlowVisualizer } from '../components/PipelineFlowVisualizer';
import { useLanguage } from '../translations';

export const AssessmentWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, isTelugu } = useLanguage();
  const {
    patientData,
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
    updateField,
    loadPreset,
    loadFromUserProfile,
    isProfileAutoLoaded,
    hasModifiedSinceLoad,
    resetAssessment,
    submitPrediction,
    isLoading,
    error
  } = useAssessment();

  const [showAdvancedLabs, setShowAdvancedLabs] = useState<boolean>(false);
  const [assessmentNotes, setAssessmentNotes] = useState<string>('');
  const [syncWithProfile, setSyncWithProfile] = useState<boolean>(true);

  const steps = [
    { 
      number: 1, 
      title: isTelugu ? 'ప్రాథమిక సమాచారం' : 'Basic Information', 
      icon: User, 
      desc: isTelugu ? 'వయస్సు, ఎత్తు, బరువు, BMI మరియు నాడి' : 'Age, Height, Weight, BMI & Vitals' 
    },
    { 
      number: 2, 
      title: isTelugu ? 'రుతుచక్ర సమాచారం' : 'Menstrual Information', 
      icon: Calendar, 
      desc: isTelugu ? 'పీరియడ్స్ క్రమం, వ్యవధి మరియు పునరుత్పత్తి' : 'Cycle Regularity & History' 
    },
    { 
      number: 3, 
      title: isTelugu ? 'లక్షణాలు / క్లినికల్ వివరాలు' : 'Symptoms & Clinical', 
      icon: Sparkles, 
      desc: isTelugu ? 'లక్షణాలు, జీవనశైలి మరియు ల్యాబ్స్' : 'Symptoms, Lifestyle & Labs' 
    },
    { 
      number: 4, 
      title: isTelugu ? 'సమాచార సమీక్ష' : 'Review Information', 
      icon: Activity, 
      desc: isTelugu ? 'డేటా సమీక్ష మరియు రిస్క్ లెక్కింపు' : 'Summary & Risk Estimation' 
    }
  ];

  const handlePredictAndNavigate = async () => {
    const res = await submitPrediction(assessmentNotes, syncWithProfile && isAuthenticated);
    if (res) {
      navigate('/results');
    }
  };

  // Live BMI category helper
  const bmi = patientData['BMI'] || 22.0;
  let bmiCategory = isTelugu ? 'సాధారణ బరువు' : 'Normal Weight';
  let bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (bmi < 18.5) {
    bmiCategory = isTelugu ? 'తక్కువ బరువు' : 'Underweight';
    bmiColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = isTelugu ? 'అధిక బరువు' : 'Overweight';
    bmiColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (bmi >= 30) {
    bmiCategory = isTelugu ? 'ఊబకాయం' : 'Obesity Class';
    bmiColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Presets bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200/80 dark:border-teal-800/80 mb-1">
              <Stethoscope className="h-3.5 w-3.5" /> {isTelugu ? 'PCOS రిస్క్ అసెస్‌మెంట్ విజార్డ్' : 'PCOS Risk Assessment Wizard'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              {t('assessment.title', 'Clinical Assessment')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={loadFromUserProfile}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/70 px-3 py-1.5 text-xs font-semibold text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors shadow-2xs"
                title={isTelugu ? 'సేవ్ చేసిన ప్రొఫైల్ లోడ్ చేయండి' : 'Reload your saved baseline health profile'}
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                <span>{isTelugu ? 'ప్రొఫైల్ లోడ్ చేయి' : 'Reload Profile'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetAssessment}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title={isTelugu ? 'అన్ని విలువలను రీసెట్ చేయండి' : 'Reset all inputs to default'}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'రీసెట్' : 'Reset'}</span>
            </button>

            <div className="relative group">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-lg">
                <Zap className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" /> {isTelugu ? 'ప్రిసెట్లు' : 'Presets'}
              </span>
              <div className="absolute right-0 top-full mt-1 w-64 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-xl border border-slate-200 dark:border-slate-800 hidden group-hover:block group-focus-within:block z-20">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase">
                  {isTelugu ? 'క్లినికల్ ప్రొఫైల్ ఎంచుకోండి' : 'Load Notebook Profile'}
                </p>
                {PRESET_PROFILES.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => loadPreset(preset.id)}
                    className="w-full text-left rounded-lg p-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-900 dark:hover:text-teal-200 transition-colors"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{isTelugu && preset.nameTe ? preset.nameTe : preset.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{isTelugu && preset.badgeTe ? preset.badgeTe : preset.badge}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Profile Auto-Fill Banner */}
        {isAuthenticated && (
          <div className="mb-6 rounded-2xl bg-teal-50/90 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 p-4 flex items-start justify-between gap-3 text-xs sm:text-sm text-teal-950 dark:text-teal-100 shadow-2xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-teal-900 dark:text-teal-200">{isTelugu ? 'సేవ్ చేసిన ఆరోగ్య ప్రొఫైల్ యాక్టివ్‌గా ఉంది' : 'Saved Health Profile Active'}</span>
                <span>
                  {isTelugu ? 'మీ మునుపటి ఆరోగ్య వివరాలు ఆటోమేటిక్‌గా నింపబడ్డాయి. ఏవైనా మార్పులు ఉంటే మాత్రం సరిదిద్దండి.' : 'Your medical indicators are automatically pre-filled. You only need to adjust any values that have changed today.'}
                </span>
              </div>
            </div>
            <button
              onClick={loadFromUserProfile}
              className="text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-900 bg-white dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 transition-colors whitespace-nowrap"
            >
              {isTelugu ? 'ప్రొఫైల్‌కు రీసెట్' : 'Reset to Profile'}
            </button>
          </div>
        )}

        {/* Visual Progress Stepper: Clinical Data Collection Phases */}
        <div className="mb-8 rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800" aria-label="Assessment Progress">
          {/* Header Status & Percentage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                {isTelugu ? `క్లినికల్ దశ ${currentStep} / 4` : `Clinical Phase ${currentStep} of 4`}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white mt-1">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {steps[currentStep - 1].desc}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  {Math.round(((currentStep) / 4) * 100)}% {isTelugu ? 'పూర్తయింది' : 'Completed'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {currentStep === 4 ? (isTelugu ? 'తుది సమీక్ష దశ' : 'Final Step') : (isTelugu ? `${4 - currentStep} దశలు మిగిలి ఉన్నాయి` : `${4 - currentStep} phases remaining`)}
                </span>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-2xs">
                {currentStep}/4
              </div>
            </div>
          </div>

          {/* Stepper Node Flow with Connected Progress Bars */}
          <div className="relative">
            {/* Desktop & Tablet Connected Stepper Grid */}
            <div className="grid grid-cols-4 gap-3 relative">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = s.number === currentStep;
                const isPassed = s.number < currentStep;
                const isUpcoming = s.number > currentStep;

                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setCurrentStep(s.number)}
                    id={`step-tab-${s.number}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${s.number}: ${s.title}`}
                    className={`relative flex flex-col items-start p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                      isCurrent
                        ? 'bg-teal-50/90 dark:bg-teal-950/70 border-teal-400 dark:border-teal-600 shadow-sm ring-1 ring-teal-400/50'
                        : isPassed
                        ? 'bg-slate-50/90 dark:bg-slate-800/60 border-emerald-300/80 dark:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-80'
                    }`}
                  >
                    {/* Node Header: Step Number / Status Icon */}
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-transform ${
                          isCurrent
                            ? 'bg-teal-800 dark:bg-teal-600 text-white shadow-xs scale-105 ring-2 ring-teal-300 dark:ring-teal-500'
                            : isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span>0{s.number}</span>
                        )}
                      </div>

                      {/* Small Status Pill */}
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isCurrent
                            ? 'bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200 animate-pulse'
                            : isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {isCurrent
                          ? (isTelugu ? 'ప్రస్తుతం' : 'Active')
                          : isPassed
                          ? (isTelugu ? 'పూర్తయింది' : 'Done')
                          : (isTelugu ? 'తదుపరి' : 'Pending')}
                      </span>
                    </div>

                    {/* Step Title */}
                    <p
                      className={`text-xs font-bold truncate w-full ${
                        isCurrent
                          ? 'text-teal-950 dark:text-teal-100'
                          : isPassed
                          ? 'text-slate-900 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.title}
                    </p>

                    {/* Step Micro Description */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full mt-0.5 hidden sm:block">
                      {s.desc}
                    </p>

                    {/* Active Accent Bottom Bar */}
                    {isCurrent && (
                      <div className="absolute bottom-0 left-3 right-3 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Seamless Overall Progress Track Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-500 dark:to-emerald-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Container Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          
          {/* STEP 1: PERSONAL & PHYSICAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{isTelugu ? 'దశ 1: వ్యక్తిగత & శారీరక బయోమెట్రిక్స్' : 'Step 1: Personal & Physical Biometrics'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'సాధారణ శారీరక కొలతలు మరియు నాడి సంబంధిత వివరాలు.' : 'General physical measurements and resting vital signs.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-age">
                    {isTelugu ? 'వయస్సు (సంవత్సరాలు) *' : 'Age (Years) *'}
                  </label>
                  <input
                    id="input-age"
                    type="number"
                    min={18}
                    max={55}
                    value={patientData['Age (yrs)']}
                    onChange={e => updateField('Age (yrs)', parseFloat(e.target.value) || 28)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'సాధారణ పునరుత్పత్తి వయస్సు: 18 - 48' : 'Typical reproductive age: 18 - 48'}</p>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-blood-group">
                    {isTelugu ? 'రక్త సమూహం *' : 'Blood Group *'}
                  </label>
                  <select
                    id="input-blood-group"
                    value={patientData['Blood Group']}
                    onChange={e => updateField('Blood Group', parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden bg-white dark:bg-slate-800"
                  >
                    {FEATURE_METADATA['Blood Group'].options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-weight">
                    {isTelugu ? 'శరీర బరువు (కిలోలు) *' : 'Body Weight (kg) *'}
                  </label>
                  <input
                    id="input-weight"
                    type="number"
                    step="0.5"
                    min={30}
                    max={150}
                    value={patientData['Weight (Kg)']}
                    onChange={e => updateField('Weight (Kg)', parseFloat(e.target.value) || 60)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-height">
                    {isTelugu ? 'ఎత్తు (సెం.మీ.) *' : 'Standing Height (cm) *'}
                  </label>
                  <input
                    id="input-height"
                    type="number"
                    step="0.5"
                    min={120}
                    max={210}
                    value={patientData['Height(Cm)']}
                    onChange={e => updateField('Height(Cm)', parseFloat(e.target.value) || 160)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Live BMI Banner */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{isTelugu ? 'గణించిన BMI' : 'Calculated BMI'}</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {patientData['BMI']} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg/m²</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${bmiColor}`}>
                  {bmiCategory}
                </span>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-pulse">
                    {isTelugu ? 'విశ్రాంతి నాడి రేటు (bpm)' : 'Resting Pulse Rate (bpm)'}
                  </label>
                  <input
                    id="input-pulse"
                    type="number"
                    min={50}
                    max={130}
                    value={patientData['Pulse rate(bpm)']}
                    onChange={e => updateField('Pulse rate(bpm)', parseInt(e.target.value, 10) || 72)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'సాధారణం: 60 - 85 bpm' : 'Normal: 60 - 85 bpm'}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-bp-sys">
                    {isTelugu ? 'సిస్టోలిక్ బీపీ (mmHg)' : 'BP Systolic (mmHg)'}
                  </label>
                  <input
                    id="input-bp-sys"
                    type="number"
                    min={80}
                    max={180}
                    value={patientData['BP _Systolic (mmHg)']}
                    onChange={e => updateField('BP _Systolic (mmHg)', parseInt(e.target.value, 10) || 115)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'ఆదర్శం: 110 - 120' : 'Ideal: 110 - 120'}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-bp-dia">
                    {isTelugu ? 'డయాస్టోలిక్ బీపీ (mmHg)' : 'BP Diastolic (mmHg)'}
                  </label>
                  <input
                    id="input-bp-dia"
                    type="number"
                    min={50}
                    max={120}
                    value={patientData['BP _Diastolic (mmHg)']}
                    onChange={e => updateField('BP _Diastolic (mmHg)', parseInt(e.target.value, 10) || 75)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'ఆదర్శం: 70 - 80' : 'Ideal: 70 - 80'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MENSTRUAL & REPRODUCTIVE PROFILE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{isTelugu ? 'దశ 2: రుతుచక్ర & గైనకాలజీ ప్రొఫైల్' : 'Step 2: Menstrual & Gynecological Profile'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'రోటర్‌డ్యామ్ ప్రమాణాల ప్రకారం పీరియడ్స్ క్రమం ప్రధాన సూచిక.' : 'Cycle regularity is a cornerstone indicator in the Rotterdam consensus.'}</p>
              </div>

              {/* Cycle Regularity Radio Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isTelugu ? 'రుతుచక్ర క్రమత *' : 'Menstrual Cycle Regularity *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: 2,
                      title: isTelugu ? 'క్రమమైనది (21 – 35 రోజులు)' : 'Regular (21 – 35 days)',
                      desc: isTelugu ? 'ప్రతి నెలా స్థిరంగా, సమయానికి వచ్చే పీరియడ్స్.' : 'Predictable, consistent menstrual periods occurring each month.'
                    },
                    {
                      value: 4,
                      title: isTelugu ? 'క్రమం తప్పినది (ఆలస్యం / అరుదుగా)' : 'Irregular (Delayed / Infrequent)',
                      desc: isTelugu ? '35 రోజుల కంటే ఎక్కువ వ్యవధి లేదా మిస్ అయిన పీరియడ్స్.' : 'Cycles longer than 35 days, unpredictable delays, or missed periods.'
                    },
                    {
                      value: 5,
                      title: isTelugu ? 'తీవ్రమైన అస్థిరత (>3 నెలల ఆలస్యం)' : 'Significantly Irregular / Variable',
                      desc: isTelugu ? '3 నెలల కంటే ఎక్కువ ఆలస్యం లేదా పూర్తిగా అస్థిరమైన చక్రం.' : 'Prolonged intervals (>3 months) or variable cycle length.'
                    }
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                        patientData['Cycle(R/I)'] === option.value
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/60 shadow-2xs ring-1 ring-teal-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{option.title}</span>
                        <input
                          type="radio"
                          name="cycle_regularity"
                          value={option.value}
                          checked={patientData['Cycle(R/I)'] === option.value}
                          onChange={() => updateField('Cycle(R/I)', option.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{option.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                
                {/* Bleeding Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-cycle-len">
                    {isTelugu ? 'రక్తస్రావ వ్యవధి (రోజులు)' : 'Bleeding Duration (Days)'}
                  </label>
                  <input
                    id="input-cycle-len"
                    type="number"
                    min={1}
                    max={15}
                    value={patientData['Cycle length(days)']}
                    onChange={e => updateField('Cycle length(days)', parseInt(e.target.value, 10) || 5)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'సగటు పీరియడ్ వ్యవధి: 4 - 7 రోజులు' : 'Average period bleeding: 4 - 7 days'}</p>
                </div>

                {/* Years of Marriage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-marriage">
                    {isTelugu ? 'వివాహమైన సంవత్సరాలు (అవివాహితురాలైతే 0)' : 'Years of Marriage (0 if unmarried)'}
                  </label>
                  <input
                    id="input-marriage"
                    type="number"
                    step="0.5"
                    min={0}
                    max={35}
                    value={patientData['Marraige Status (Yrs)']}
                    onChange={e => updateField('Marraige Status (Yrs)', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* Pregnant */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isTelugu ? 'ప్రస్తుత గర్భధారణ స్థితి' : 'Confirmed Current Pregnancy'}
                  </label>
                  <div className="flex gap-4 pt-1">
                    {[
                      { label: isTelugu ? 'కాదు (No)' : 'No', value: 0 },
                      { label: isTelugu ? 'అవును (Yes)' : 'Yes', value: 1 }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="pregnant_status"
                          checked={patientData['Pregnant(Y/N)'] === opt.value}
                          onChange={() => updateField('Pregnant(Y/N)', opt.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Previous Miscarriages */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-abortions">
                    {isTelugu ? 'మునుపటి గర్భస్రావాలు / నష్టాలు' : 'Previous Miscarriages / Pregnancy Losses'}
                  </label>
                  <input
                    id="input-abortions"
                    type="number"
                    min={0}
                    max={10}
                    value={patientData['No. of aborptions']}
                    onChange={e => updateField('No. of aborptions', parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: SYMPTOMS, LIFESTYLE & CLINICAL BIOMARKERS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{isTelugu ? 'దశ 3: లక్షణాలు & క్లినికల్ వివరాలు' : 'Step 3: Symptoms & Clinical Profile'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'ఆండ్రోజెన్ లక్షణాలు, ఆహారపు అలవాట్లు, వ్యాయామం మరియు ల్యాబ్ వివరాలు.' : 'Hyperandrogenic features, lifestyle factors, and optional clinical lab parameters.'}</p>
              </div>

              {/* Core Symptoms Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isTelugu ? 'భౌతిక లక్షణాలు (వర్తించే వాటిని ఎంచుకోండి)' : 'Physical & Dermatological Symptoms (Select all that apply)'}
                </label>
                <div className="space-y-2.5">
                  {[
                    {
                      key: 'hair growth(Y/N)' as const,
                      title: isTelugu ? 'ముఖం లేదా శరీరంపై అధిక రోమాలు (హిర్సుటిజం)' : 'Excess Facial or Body Hair (Hirsutism)',
                      desc: isTelugu ? 'పైపెదవి, గడ్డం, ఛాతీ లేదా పొట్టపై ముతక రోమాలు.' : 'Coarse dark hair on upper lip, chin, chest, lower abdomen.'
                    },
                    {
                      key: 'Weight gain(Y/N)' as const,
                      title: isTelugu ? 'అకస్మాత్తుగా లేదా వేగంగా బరువు పెరగడం' : 'Sudden or Stubborn Weight Gain',
                      desc: isTelugu ? 'ముఖ్యంగా పొట్ట చుట్టూ కొవ్వు చేరడం, తగ్గడానికి కష్టంగా ఉండటం.' : 'Weight accumulation around abdomen resistant to normal diet.'
                    },
                    {
                      key: 'Skin darkening (Y/N)' as const,
                      title: isTelugu ? 'చర్మం నల్లబడటం (అకాంతోసిస్ నైగ్రికాన్స్)' : 'Darkened Skin Patches (Acanthosis Nigricans)',
                      desc: isTelugu ? 'మెడ వెనుక భాగం లేదా చంకల్లో నల్లటి చారలు.' : 'Velvety dark hyperpigmentation in skin folds or neck creases.'
                    },
                    {
                      key: 'Pimples(Y/N)' as const,
                      title: isTelugu ? 'తీవ్రమైన మొటిమలు / పింపుల్స్ (యాక్నే)' : 'Persistent Adult Acne / Breakouts',
                      desc: isTelugu ? 'దవడల వెంబడి మరియు గడ్డంపై తరచుగా వచ్చే మొటిమలు.' : 'Chronic cystic acne concentrated along jawline and chin.'
                    },
                    {
                      key: 'Hair loss(Y/N)' as const,
                      title: isTelugu ? 'జుట్టు రాలడం లేదా పలుచబడటం (అలోపేసియా)' : 'Scalp Hair Thinning (Alopecia)',
                      desc: isTelugu ? 'పాపిట వెడల్పు కావడం లేదా తల మధ్యలో జుట్టు పలుచబడటం.' : 'Diffuse hair shedding or widening midline crown parting.'
                    }
                  ].map(symptom => {
                    const isChecked = patientData[symptom.key] === 1;
                    return (
                      <div
                        key={symptom.key}
                        onClick={() => updateField(symptom.key, isChecked ? 0 : 1)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/60 shadow-2xs ring-1 ring-teal-500'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="pr-4">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{symptom.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{symptom.desc}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            isChecked ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {isChecked ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'కాదు' : 'No')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle Habits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Fast Food */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'తరచుగా ఫాస్ట్ ఫుడ్ తినడం' : 'Frequent Fast Food Consumption'}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'వేయించిన లేదా అధిక చక్కెర గల ఆహారాలు.' : 'Regular intake of fried or high-sugar processed meals.'}</p>
                  <div className="flex gap-4 pt-1">
                    {[
                      { label: isTelugu ? 'అరుదుగా / లేదు' : 'Rare / No', value: 0 },
                      { label: isTelugu ? 'తరచుగా / అవును' : 'Frequent / Yes', value: 1 }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="fast_food_choice"
                          checked={patientData['Fast food (Y/N)'] === opt.value}
                          onChange={() => updateField('Fast food (Y/N)', opt.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Regular Exercise */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'క్రమమైన శారీరక వ్యాయామం' : 'Regular Physical Exercise'}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'వారానికి ≥150 నిమిషాల వ్యాయామం లేదా నడక.' : '≥150 mins structured exercise or brisk walking per week.'}</p>
                  <div className="flex gap-4 pt-1">
                    {[
                      { label: isTelugu ? 'లేదు (నిష్క్రియ)' : 'No (Sedentary)', value: 0 },
                      { label: isTelugu ? 'అవును (చురుకుగా)' : 'Yes (Active)', value: 1 }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="exercise_choice"
                          checked={patientData['Reg.Exercise(Y/N)'] === opt.value}
                          onChange={() => updateField('Reg.Exercise(Y/N)', opt.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glucose & TSH Labs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-rbs">
                    {isTelugu ? 'రాండమ్ బ్లడ్ షుగర్ - RBS (mg/dL)' : 'Random Blood Sugar (mg/dL)'}
                  </label>
                  <input
                    id="input-rbs"
                    type="number"
                    min={60}
                    max={300}
                    value={patientData['RBS(mg/dl)']}
                    onChange={e => updateField('RBS(mg/dl)', parseFloat(e.target.value) || 95)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'సాధారణం: <140 mg/dL' : 'Normal non-fasting: <140 mg/dL'}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="input-tsh">
                    {isTelugu ? 'థైరాయిడ్ హార్మోన్ - TSH (mIU/L)' : 'TSH - Thyroid Stimulating (mIU/L)'}
                  </label>
                  <input
                    id="input-tsh"
                    type="number"
                    step="0.1"
                    min={0.1}
                    max={25}
                    value={patientData['TSH (mIU/L)']}
                    onChange={e => updateField('TSH (mIU/L)', parseFloat(e.target.value) || 2.3)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{isTelugu ? 'సాధారణ పరిధి: 0.4 - 4.0 mIU/L' : 'Normal reference: 0.4 - 4.0 mIU/L'}</p>
                </div>
              </div>

              {/* Collapsible Advanced Clinical Laboratory & Ultrasound Section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAdvancedLabs(!showAdvancedLabs)}
                  className="flex items-center justify-between w-full py-2 text-xs font-bold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100"
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>{isTelugu ? 'అల్ట్రాసౌండ్ & హార్మోన్ల బయోమార్కర్లు (ఐచ్ఛికం / ల్యాబ్ నివేదిక)' : 'Ultrasound & Hormonal Biomarkers (Optional / Clinical Lab Panel)'}</span>
                  </span>
                  {showAdvancedLabs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showAdvancedLabs && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in-50 duration-150">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isTelugu 
                        ? 'ఆరోగ్యకరమైన క్లినికల్ మీడియన్ విలువలు ముందుగానే పూరించబడ్డాయి. మీ వద్ద ల్యాబ్ లేదా పెల్విక్ అల్ట్రాసౌండ్ నివేదికలు ఉంటే క్రింద నమోదు చేయండి:'
                        : 'Pre-filled with healthy clinical median defaults. If you have laboratory blood test or pelvic ultrasound reports, enter the exact values below:'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {isTelugu ? 'కుడి అండాశయం ఫోలికల్స్ *' : 'Right Ovary Follicles *'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={patientData['Follicle No. (R)']}
                          onChange={e => updateField('Follicle No. (R)', parseInt(e.target.value, 10) || 5)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{isTelugu ? '>10-12 PCOM ని సూచిస్తుంది' : '>10-12 indicates PCOM'}</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {isTelugu ? 'ఎడమ అండాశయం ఫోలికల్స్' : 'Left Ovary Follicles'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={patientData['Follicle No. (L)']}
                          onChange={e => updateField('Follicle No. (L)', parseInt(e.target.value, 10) || 4)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          AMH (ng/mL)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0.1}
                          max={30}
                          value={patientData['AMH(ng/mL)']}
                          onChange={e => updateField('AMH(ng/mL)', parseFloat(e.target.value) || 3.5)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{isTelugu ? 'PCOS లో ఎక్కువ: >4.0 ng/mL' : 'High in PCOS: >4.0 ng/mL'}</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          LH (mIU/mL)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={patientData['LH(mIU/mL)']}
                          onChange={e => updateField('LH(mIU/mL)', parseFloat(e.target.value) || 3.5)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          FSH (mIU/mL)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={patientData['FSH(mIU/mL)']}
                          onChange={e => updateField('FSH(mIU/mL)', parseFloat(e.target.value) || 5.0)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {isTelugu ? 'ఎండోమెట్రియం మందం (mm)' : 'Endometrium (mm)'}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={patientData['Endometrium (mm)']}
                          onChange={e => updateField('Endometrium (mm)', parseFloat(e.target.value) || 7.5)}
                          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & ESTIMATE RISK */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{isTelugu ? 'దశ 4: సమాచార సమీక్ష & రిస్క్ లెక్కింపు' : 'Step 4: Review Information & Compute Risk'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'మెషిన్ లెర్నింగ్ మోడల్ రన్ చేయడానికి ముందు మీ డేటాను నిర్ధారించండి.' : 'Verify your self-reported profile before running the machine learning model.'}</p>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> {isTelugu ? 'బయోమెట్రిక్స్ సారాంశం' : 'Biometrics Summary'}
                  </span>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>{isTelugu ? 'వయస్సు:' : 'Age:'}</span> <strong className="text-slate-900 dark:text-white">{patientData['Age (yrs)']} {isTelugu ? 'సంవత్సరాలు' : 'years'}</strong></div>
                    <div className="flex justify-between"><span>{isTelugu ? 'బరువు / ఎత్తు:' : 'Weight / Height:'}</span> <strong className="text-slate-900 dark:text-white">{patientData['Weight (Kg)']} kg / {patientData['Height(Cm)']} cm</strong></div>
                    <div className="flex justify-between"><span>BMI:</span> <strong className="text-slate-900 dark:text-white">{patientData['BMI']} kg/m² ({bmiCategory})</strong></div>
                    <div className="flex justify-between"><span>{isTelugu ? 'రక్తపోటు:' : 'Blood Pressure:'}</span> <strong className="text-slate-900 dark:text-white">{patientData['BP _Systolic (mmHg)']}/{patientData['BP _Diastolic (mmHg)']} mmHg</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> {isTelugu ? 'రుతుచక్రం & లక్షణాలు' : 'Menstrual & Symptoms'}
                  </span>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>{isTelugu ? 'రుతుచక్ర క్రమత:' : 'Cycle Regularity:'}</span>
                      <strong className={patientData['Cycle(R/I)'] === 2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                        {patientData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమమైనది' : 'Regular') : (isTelugu ? 'క్రమం తప్పినది' : 'Irregular')}
                      </strong>
                    </div>
                    <div className="flex justify-between"><span>{isTelugu ? 'అధిక రోమాలు (హిర్సుటిజం):' : 'Hirsutism (Hair Growth):'}</span> <strong>{patientData['hair growth(Y/N)'] ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'కాదు' : 'No')}</strong></div>
                    <div className="flex justify-between"><span>{isTelugu ? 'చర్మం నల్లబడటం (అకాంతోసిస్):' : 'Acanthosis (Skin Darkening):'}</span> <strong>{patientData['Skin darkening (Y/N)'] ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'కాదు' : 'No')}</strong></div>
                    <div className="flex justify-between"><span>{isTelugu ? 'బరువు పెరుగుదల / మొటిమలు:' : 'Weight Gain / Acne:'}</span> <strong>{patientData['Weight gain(Y/N)'] ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'కాదు' : 'No')} / {patientData['Pimples(Y/N)'] ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'కాదు' : 'No')}</strong></div>
                  </div>
                </div>

              </div>

              {/* Patient Notes & Profile Sync Options */}
              <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1" htmlFor="screening-notes">
                    {isTelugu ? 'స్క్రీనింగ్ గమనికలు లేదా డాక్టర్ పరిశీలన (ఐచ్ఛికం)' : 'Screening Notes or Doctor Observation (Optional)'}
                  </label>
                  <input
                    id="screening-notes"
                    type="text"
                    value={assessmentNotes}
                    onChange={(e) => setAssessmentNotes(e.target.value)}
                    placeholder={isTelugu ? 'ఉదా. జీవనశైలి మార్పులు చేసిన 3 నెలల తర్వాత, కొత్త ల్యాబ్ ఫలితాలు' : 'e.g. 3 months post lifestyle change, new lab test values'}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                {isAuthenticated && (
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={syncWithProfile}
                      onChange={(e) => setSyncWithProfile(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-700 h-4 w-4"
                    />
                    <span>{isTelugu ? 'ఈ నవీకరించబడిన విలువలను నా ప్రొఫైల్‌లో శాశ్వతంగా సేవ్ చేయండి' : 'Automatically save these updated values to my permanent account profile'}</span>
                  </label>
                )}
              </div>

              {/* Architecture & Pipeline Flow Visualizer */}
              <PipelineFlowVisualizer currentStepId="assessment_form" />

              {/* Model Execution Disclaimer */}
              <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/60 p-4 border border-teal-200/80 dark:border-teal-800 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
                  <p className="font-bold">{isTelugu ? 'లాజిస్టిక్ రిగ్రెషన్ మోడల్ సిద్ధంగా ఉంది (88.99% ఖచ్చితత్వం, 95.09% ROC-AUC)' : 'Logistic Regression Model Ready (88.99% Accuracy, 95.09% ROC-AUC)'}</p>
                  <p className="text-teal-900 dark:text-teal-300 mt-0.5">
                    {isTelugu 
                      ? 'క్రింది బటన్‌ను క్లిక్ చేయడం ద్వారా మీ ఫీచర్ వెక్టర్‌ను ప్రామాణీకరించి, వివరణాత్మక PCOS రిస్క్ సంభావ్యతను గణిస్తుంది.'
                      : 'Clicking the button below will standardize your feature vector and calculate the estimated PCOS risk probability with full feature-level explainability.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-3.5 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Wizard Control Navigation Buttons */}
        <div className="flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              id="wizard-prev-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isTelugu ? 'వెనుకకు' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              id="wizard-next-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 dark:bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              <span>{isTelugu ? 'తదుపరి దశ' : 'Next Step'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePredictAndNavigate}
              disabled={isLoading}
              id="wizard-submit-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-700 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>{isTelugu ? 'రిస్క్ గణిస్తోంది...' : 'Calculating Risk...'}</span>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  <span>{isTelugu ? 'రిస్క్ అంచనాను రూపొందించండి' : 'Generate Risk Prediction'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

