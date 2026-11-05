import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HeartPulse,
  Activity,
  Calendar,
  Layers,
  HelpCircle,
  Check,
  Info,
  Apple,
  Clock,
  ShieldCheck,
  ChevronRight,
  Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { PatientRecord } from '../types';
import { FEATURE_METADATA, computeBMI, computeWaistHipRatio, getDefaultPatientRecord } from '../ml/modelEngine';
import { useLanguage } from '../translations';
import { useAccessibility } from '../context/AccessibilityContext';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, saveProfileData, isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadFromUserProfile } = useAssessment();
  const { t, isTelugu } = useLanguage();
  const { isEasyRead } = useAccessibility();

  // 1 to 5 Conversational Steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<PatientRecord>(() => {
    if (profile?.patientData) {
      return { ...getDefaultPatientRecord(), ...profile.patientData };
    }
    return getDefaultPatientRecord();
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with profile if loaded late
  useEffect(() => {
    if (profile?.patientData) {
      setFormData(prev => ({ ...prev, ...profile.patientData }));
    }
  }, [profile]);

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', {
        state: {
          message: isTelugu
            ? 'మీ ప్రొఫైల్‌ను సెటప్ చేయడానికి దయచేసి లాగిన్ అవ్వండి.'
            : 'Please log in to set up your profile.'
        }
      });
    }
  }, [authLoading, isAuthenticated, navigate, isTelugu]);

  const handleChange = (field: keyof PatientRecord, value: number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      if (field === 'Height(Cm)' || field === 'Weight (Kg)') {
        const h = (field === 'Height(Cm)' ? value : next['Height(Cm)']) / 100;
        const w = field === 'Weight (Kg)' ? value : next['Weight (Kg)'];
        if (h > 0 && w > 0) {
          next['BMI'] = Math.round((w / (h * h)) * 10) / 10;
        }
      }

      if (field === 'Waist(inch)' || field === 'Hip(inch)') {
        const waist = field === 'Waist(inch)' ? value : next['Waist(inch)'];
        const hip = field === 'Hip(inch)' ? value : next['Hip(inch)'];
        if (hip > 0 && waist > 0) {
          next['Waist:Hip Ratio'] = Math.round((waist / hip) * 1000) / 1000;
        }
      }

      return next;
    });
  };

  const calculateCompletion = (): number => {
    const required: (keyof PatientRecord)[] = [
      'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'Cycle(R/I)', 'Cycle length(days)',
      'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)', 'Hair loss(Y/N)',
      'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)'
    ];
    let filled = 0;
    for (const f of required) {
      if (formData[f] !== undefined && formData[f] !== null) filled++;
    }
    return Math.min(100, Math.round((filled / required.length) * 100));
  };

  const completionPct = calculateCompletion();

  const handleSave = async (redirectTarget: '/dashboard' | '/assessment') => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await saveProfileData(formData);
      setSaveSuccess(true);
      loadFromUserProfile();

      setTimeout(() => {
        navigate(redirectTarget);
      }, 700);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (isTelugu
            ? 'ఆరోగ్య ప్రొఫైల్‌ను సేవ్ చేయడంలో విఫలమైంది. దయచేసి అన్ని వివరాలను తనిఖీ చేయండి.'
            : 'Failed to save health profile. Please check all inputs.')
      );
      setIsSaving(false);
    }
  };

  const stepsList = [
    { num: 1, label: isTelugu ? 'మీ గురించి' : 'About You', icon: User },
    { num: 2, label: isTelugu ? 'పీరియడ్స్ చక్రం' : 'Monthly Cycle', icon: Calendar },
    { num: 3, label: isTelugu ? 'చర్మం & సంకేతాలు' : 'Body & Skin Signs', icon: Activity },
    { num: 4, label: isTelugu ? 'రోజువారీ అలవాట్లు' : 'Daily Habits', icon: HeartPulse },
    { num: 5, label: isTelugu ? 'ల్యాబ్స్ (ఐచ్ఛికం)' : 'Labs & Scans (Optional)', icon: Layers }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Onboarding Welcome Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-teal-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'దశలవారీ సులభ గైడ్' : 'Conversational Step-by-Step Setup'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isTelugu ? 'స్వాగతం, ' : 'Welcome, '}{user?.full_name || (isTelugu ? 'మహిళా సోదరి' : 'Friend')}!
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              {isTelugu
                ? 'మేము మిమ్మల్ని కొన్ని సులభమైన ప్రశ్నలు అడుగుతాము. ప్రతి ప్రశ్నకు ఎందుకు అవసరమో స్పష్టమైన వివరణ ఉంటుంది.'
                : 'We will guide you through a few simple questions. Every single input includes a plain-language explanation of why it matters for your hormone health.'}
            </p>
          </div>

          <div className="bg-teal-950/80 p-4 rounded-2xl border border-teal-700/60 text-center flex-shrink-0 min-w-[150px]">
            <div className="text-xs text-teal-300 font-semibold">{isTelugu ? 'పూర్తయిన శాతం' : 'Profile Progress'}</div>
            <div className="text-3xl font-black text-white mt-0.5">{completionPct}%</div>
            <div className="w-full bg-teal-900 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-sm flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
          <span>{isTelugu ? 'ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది! దారి మళ్లిస్తోంది...' : 'Profile saved successfully! Redirecting...'}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-center gap-3 animate-fadeIn shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Progress Tracker Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                id={`profile-step-nav-${step.num}`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCurrent ? 'bg-white text-teal-800' : isCompleted ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Conversational Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        {/* ================= STEP 1: ABOUT YOU ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>{isTelugu ? 'దశ 1 / 5' : 'Step 1 of 5'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isTelugu ? 'మొదట, మీ శరీర కొలతలు & ప్రాథమిక వివరాలు' : 'First, tell us about yourself & body basics'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'మీ వయస్సు మరియు ఎత్తు-బరువు ఆధారంగా మీ శరీర తత్వాన్ని అంచనా వేస్తాము.'
                  : 'Basic physical numbers that set the baseline for your metabolism and body mass.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'మీ వయస్సు ఎంత? (Age in Years) *' : 'How old are you? (Age in Years) *'}
                  </label>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{formData['Age (yrs)']} yrs</span>
                </div>
                <input
                  type="number"
                  min="16"
                  max="60"
                  value={formData['Age (yrs)']}
                  onChange={(e) => handleChange('Age (yrs)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-age"
                />
                {/* Why we need this pill */}
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'PCOS లక్షణాలు వయస్సును బట్టి (యుక్తవయస్సు నుండి పెద్దరికం వరకు) మారుతుంటాయి. మీ వయస్సుకు తగిన రిస్క్ మోడల్‌ను రూపొందించడానికి ఇది సహాయపడుతుంది.'
                      : 'Hormone levels and cycle rhythms vary significantly across life stages. Age helps calibrate your specific Rotterdam risk baseline.'}
                  </span>
                </div>
              </div>

              {/* Height */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'మీ ఎత్తు ఎంత? (Height in cm) *' : 'What is your height? (in cm) *'}
                  </label>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{formData['Height(Cm)']} cm</span>
                </div>
                <input
                  type="number"
                  min="120"
                  max="210"
                  value={formData['Height(Cm)']}
                  onChange={(e) => handleChange('Height(Cm)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-height"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'మీ ఎత్తు మరియు బరువు కలిపి బాడీ మాస్ ఇండెక్స్ (BMI) ను గణించడానికి అవసరం.'
                      : 'Combined with body weight to accurately determine your Body Mass Index (BMI).'}
                  </span>
                </div>
              </div>

              {/* Weight */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'మీ బరువు ఎంత? (Weight in kg) *' : 'What is your current weight? (in kg) *'}
                  </label>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{formData['Weight (Kg)']} kg</span>
                </div>
                <input
                  type="number"
                  min="30"
                  max="160"
                  step="0.5"
                  value={formData['Weight (Kg)']}
                  onChange={(e) => handleChange('Weight (Kg)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-weight"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'అధిక ఇన్సులిన్ వల్ల బరువు పెరగడం PCOS లో సాధారణం. అయితే సన్నగా ఉన్న మహిళలకు కూడా PCOS ఉండవచ్చు (Lean PCOS).'
                      : 'Weight gives insight into insulin storage tendencies. Note: PCOS also affects lean individuals (Lean PCOS phenotype).'}
                  </span>
                </div>
              </div>

              {/* Auto BMI Card */}
              <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    {isTelugu ? 'స్వయంచాలక BMI లెక్క' : 'Your Computed BMI'}
                  </span>
                  <div className="text-3xl font-black text-teal-950 dark:text-white mt-1">
                    {formData['BMI']} <span className="text-sm font-normal text-slate-500">kg/m²</span>
                  </div>
                  <p className="text-xs text-teal-900/80 dark:text-teal-200/80 mt-1">
                    {formData['BMI'] < 18.5
                      ? (isTelugu ? 'తక్కువ బరువు (Underweight)' : 'Underweight category')
                      : formData['BMI'] < 24.9
                      ? (isTelugu ? 'ఆరోగ్యకరమైన సాధారణ పరిధి (Normal BMI)' : 'Healthy normal range')
                      : formData['BMI'] < 29.9
                      ? (isTelugu ? 'అధిక బరువు పరిధి (Overweight)' : 'Overweight range')
                      : (isTelugu ? 'ఊబకాయం పరిధి (Obese Category)' : 'Obese range')}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-teal-200/60 dark:border-teal-800/60 text-[10px] text-teal-800 dark:text-teal-300 font-medium">
                  {isTelugu ? 'ఎత్తు & బరువుతో ఆటోమేటిక్‌గా అప్‌డేట్ అవుతుంది' : 'Dynamically calculated as weight(kg) / height(m)²'}
                </div>
              </div>

              {/* Blood Group */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? 'మీ బ్లడ్ గ్రూప్ (Blood Group)' : 'Your Blood Group'}
                </label>
                <select
                  value={formData['Blood Group']}
                  onChange={(e) => handleChange('Blood Group', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-blood-group"
                >
                  {FEATURE_METADATA['Blood Group']?.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'మీ వ్యక్తిగత ఆరోగ్య కార్డులో భద్రపరచడానికి ఉపయోగిస్తాము.' : 'Stored for your complete clinical health summary and clinical reference.'}
                  </span>
                </div>
              </div>

              {/* Resting Pulse */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'విశ్రాంతి సమయంలో నాడి రేటు (Pulse bpm)' : 'Resting Pulse Rate (bpm)'}
                  </label>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{formData['Pulse rate(bpm)']} bpm</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={formData['Pulse rate(bpm)']}
                  onChange={(e) => handleChange('Pulse rate(bpm)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-pulse"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'గుండె ఆరోగ్యం మరియు జీవక్రియ చురుకుదనాన్ని తెలుపుతుంది (సాధారణం 60–90 bpm).' : 'Reflects resting autonomic tone and cardiovascular baseline (normal 60–90 bpm).'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MONTHLY CYCLE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>{isTelugu ? 'దశ 2 / 5' : 'Step 2 of 5'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isTelugu ? 'మీ పీరియడ్స్ చక్రం ఎలా ఉంటుంది?' : 'How do your monthly periods behave?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'పీరియడ్స్ క్రమబద్ధత అనేది PCOS నిర్ధారణలో అత్యంత ముఖ్యమైన రోటర్‌డ్యామ్ ప్రమాణం.'
                  : 'Cycle predictability is the single most important diagnostic signal for ovulation consistency.'}
              </p>
            </div>

            <div className="space-y-6">
              {/* Cycle Regularity */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="text-base font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? 'మీ పీరియడ్స్ సమయానికి వస్తున్నాయా? *' : 'Do your periods arrive regularly? *'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      val: 2,
                      title: isTelugu ? 'క్రమబద్ధమైనవి (Regular)' : 'Regular (Predictable)',
                      desc: isTelugu ? 'ప్రతి 21–35 రోజులకు ఒకసారి వస్తాయి.' : 'Arrives predictably every 21–35 days'
                    },
                    {
                      val: 4,
                      title: isTelugu ? 'సక్రమంగా లేవు (Irregular)' : 'Irregular (> 35 days)',
                      desc: isTelugu ? 'చాలా ఆలస్యంగా రావడం లేదా నెలలు దాటడం.' : 'Delayed by weeks or unpredictable'
                    },
                    {
                      val: 5,
                      title: isTelugu ? 'రావడం లేదు (Missed)' : 'Missed (> 3-6 months)',
                      desc: isTelugu ? 'గత 3–6 నెలలుగా పీరియడ్స్ రాలేదు.' : 'No period for 3 or more months'
                    }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleChange('Cycle(R/I)', opt.val)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        formData['Cycle(R/I)'] === opt.val
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                      }`}
                      id={`cycle-reg-btn-${opt.val}`}
                    >
                      <div className="font-extrabold text-sm">{opt.title}</div>
                      <div className={`text-xs mt-1 ${formData['Cycle(R/I)'] === opt.val ? 'text-teal-100' : 'text-slate-500'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'పీరియడ్స్ ఆలస్యం కావడం అంటే అండాశయం నుండి ప్రతి నెలా అండం విడుదల కాకపోవడం (అనోవ్యులేషన్). ఇది PCOS యొక్క ప్రధాన లక్షణం.'
                      : 'Irregular or absent periods indicate that an egg may not be released each month (anovulation), which is the cardinal marker of PCOS.'}
                  </span>
                </div>
              </div>

              {/* Cycle Length (Days) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'రెండు పీరియడ్స్ మధ్య ఎన్ని రోజులు ఉంటాయి? (Cycle Length) *' : 'Typical number of days between periods? *'}
                  </label>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400">{formData['Cycle length(days)']} days</span>
                </div>

                <input
                  type="number"
                  min="2"
                  max="14"
                  value={formData['Cycle length(days)']}
                  onChange={(e) => handleChange('Cycle length(days)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="profile-input-cycle-days"
                />

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'రక్తస్రావం సాధారణంగా 4 నుండి 6 రోజులు ఉండాలి. అంతకంటే తక్కువ లేదా ఎక్కువ రోజులు ఉంటే హార్మోన్ల అసమతుల్యత ఉండవచ్చు.'
                      : 'Normal flow duration spans 3 to 7 days. Excessively short or prolonged bleeding signals erratic estrogen-progesterone ratios.'}
                  </span>
                </div>
              </div>

              {/* Currently Pregnant */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? 'మీరు ప్రస్తుతం గర్భవతా?' : 'Are you currently pregnant?'}
                </label>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('Pregnant(Y/N)', 1)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      formData['Pregnant(Y/N)'] === 1
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isTelugu ? 'అవును (Yes)' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('Pregnant(Y/N)', 0)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      formData['Pregnant(Y/N)'] === 0
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isTelugu ? 'కాదు (No)' : 'No'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'గర్భధారణ హార్మోన్లు పీరియడ్స్ ఆగిపోవడానికి సహజ కారణం.' : 'Pregnancy naturally suspends ovulation and requires separate prenatal tracking.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PHYSICAL & SKIN SIGNS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>{isTelugu ? 'దశ 3 / 5' : 'Step 3 of 5'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isTelugu ? 'శరీరం, చర్మం మరియు జుట్టులో మార్పులు' : 'Have you noticed any changes in your skin, hair, or weight?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'ఆండ్రోజెన్ హార్మోన్లు మరియు ఇన్సులిన్ స్థాయిలను సూచించే అత్యంత ముఖ్యమైన శారీరక సంకేతాలు ఇవి.'
                  : 'These everyday physical signs give direct biological clues about androgen and insulin levels.'}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  field: 'hair growth(Y/N)' as keyof PatientRecord,
                  title: isTelugu ? 'గడ్డం, పైపెదవి లేదా శరీరంపై మందపాటి రోమాలు (Hirsutism)' : 'Thicker Hair on Chin, Upper Lip, or Chest (Hirsutism)',
                  why: isTelugu
                    ? 'స్త్రీల శరీరంలో పురుష హార్మోన్లు (ఆండ్రోజెన్లు) కొద్దిగా పెరిగినప్పుడు వెంట్రుకల కుదుళ్లు ఉత్తేజితమై మందపాటి రోమాలు వస్తాయి.'
                    : 'Elevated circulating androgen hormones stimulate hair follicles in male-pattern zones like the chin, abdomen, and upper lip.'
                },
                {
                  field: 'Skin darkening (Y/N)' as keyof PatientRecord,
                  title: isTelugu ? 'మెడ లేదా చంకల వద్ద చర్మం నల్లగా మారడం (Acanthosis Nigricans)' : 'Darkened, Velvety Skin on Neck or Underarms (Acanthosis Nigricans)',
                  why: isTelugu
                    ? 'శరీరం ఎక్కువ ఇన్సులిన్ తయారు చేస్తున్నప్పుడు చర్మ కణాలు మందంగా, నల్లగా మారతాయి. ఇది ఇన్సులిన్ రెసిస్టెన్స్‌కు ప్రధాన నిదర్శనం.'
                    : 'Excess insulin promotes rapid epidermal cell growth, creating dark velvety patches along neck folds and armpits.'
                },
                {
                  field: 'Weight gain(Y/N)' as keyof PatientRecord,
                  title: isTelugu ? 'సులభంగా బరువు పెరగడం లేదా తగ్గడం కష్టంగా ఉండటం' : 'Unexplained Rapid Weight Gain (Especially Around Abdomen)',
                  why: isTelugu
                    ? 'ఇన్సులిన్ అనేది కొవ్వును నిల్వ చేసే హార్మోన్. ఇన్సులిన్ ఎక్కువగా ఉన్నప్పుడు కొవ్వు కరగడం ఆగిపోయి బరువు పెరుగుతుంది.'
                    : 'Insulin locks dietary energy into fat storage and blocks lipolysis (fat breakdown), making weight gain exceptionally stubborn.'
                },
                {
                  field: 'Pimples(Y/N)' as keyof PatientRecord,
                  title: isTelugu ? 'దవడ లేదా ముఖంపై తీవ్రమైన మొటిమలు / పింపుల్స్ (Adult Acne)' : 'Persistent Breakouts or Cystic Acne Along Jawline',
                  why: isTelugu
                    ? 'ఆండ్రోజెన్లు చర్మంలోని నూనె గ్రంథులను (సిబేషియస్ గ్లాండ్స్) అధిక నూనెను తయారు చేసేలా చేస్తాయి, తద్వారా మొటిమలు వస్తాయి.'
                    : 'Androgens stimulate facial oil glands, leading to stubborn, tender inflammatory breakouts along the lower third of the face.'
                },
                {
                  field: 'Hair loss(Y/N)' as keyof PatientRecord,
                  title: isTelugu ? 'తల పైభాగంలో లేదా పాపిట వద్ద జుట్టు పలుచబడటం (Hair Thinning)' : 'Hair Thinning Along the Crown or Part Line (Alopecia)',
                  why: isTelugu
                    ? 'ఆండ్రోజెన్ హార్మోన్ల వల్ల తలపైని వెంట్రుకల కుదుళ్లు చిన్నవిగా మారి జుట్టు రాలిపోవడం లేదా పలుచబడటం జరుగుతుంది.'
                    : 'Hormonal sensitivity causes hair follicles on the scalp crown to miniaturize over time.'
                }
              ].map(symptom => {
                const isYes = formData[symptom.field] === 1;
                return (
                  <div
                    key={symptom.field}
                    className={`p-5 rounded-2xl border transition-all ${
                      isYes
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
                          {symptom.title}
                        </h4>
                      </div>

                      {/* Yes / No Toggle buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleChange(symptom.field, 1)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isYes
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                          }`}
                          id={`symptom-${symptom.field}-yes`}
                        >
                          <Check className={`h-3.5 w-3.5 ${isYes ? 'opacity-100' : 'opacity-0'}`} />
                          <span>{isTelugu ? 'అవును (Yes)' : 'Yes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange(symptom.field, 0)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            !isYes
                              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                          }`}
                          id={`symptom-${symptom.field}-no`}
                        >
                          <span>{isTelugu ? 'లేదు (No)' : 'No'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Why we need this explanation */}
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-teal-900 dark:text-teal-300">{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                        {symptom.why}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: DAILY HABITS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>{isTelugu ? 'దశ 4 / 5' : 'Step 4 of 5'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isTelugu ? 'మీ రోజువారీ ఆహారం & శారీరక వ్యాయామం' : 'Your daily nutrition & movement habits'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'సరైన జీవనశైలి మార్పులు హార్మోన్లను సహజంగా పునరుద్ధరించడానికి అత్యంత శక్తివంతమైన సాధనాలు.'
                  : 'Daily habits directly shape glucose spikes and insulin sensitivity.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Fast Food */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-950 dark:text-white">
                      {isTelugu ? 'ఫాస్ట్ ఫుడ్, బేకరీ వస్తువులు లేదా తీపి పదార్థాలు తరచుగా తీసుకుంటారా?' : 'Do you frequently eat fast food, bakery items, or sweets?'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isTelugu ? 'వారానికి 2 లేదా అంతకంటే ఎక్కువ సార్లు మైదా, కూల్ డ్రింక్స్, వేపుళ్ళు తినడం.' : 'Consuming deep-fried snacks, processed foods, or sweetened tea/soda ≥ 2 times/week.'}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleChange('Fast food (Y/N)', 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData['Fast food (Y/N)'] === 1
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                      id="habit-fast-food-yes"
                    >
                      {isTelugu ? 'అవును (తరచుగా)' : 'Yes (Often)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('Fast food (Y/N)', 0)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData['Fast food (Y/N)'] === 0
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                      id="habit-fast-food-no"
                    >
                      {isTelugu ? 'లేదు (తక్కువ)' : 'Rarely / No'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'మైదా మరియు చక్కెరలు రక్తంలో గ్లూకోజ్ స్థాయిని వేగంగా పెంచుతాయి, ఇది అండాశయాలు ఎక్కువ పురుష హార్మోన్లను ఉత్పత్తి చేయడానికి కారణమవుతుంది.'
                      : 'High-glycemic refined carbs and sweets create rapid insulin surges, which directly stimulate ovarian androgen excess.'}
                  </span>
                </div>
              </div>

              {/* Regular Exercise */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-950 dark:text-white">
                      {isTelugu ? 'వారంలో క్రమం తప్పకుండా నడక లేదా వ్యాయామం చేస్తారా?' : 'Do you engage in regular physical exercise or brisk walking?'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isTelugu ? 'వారానికి కనీసం 150 నిమిషాలు వేగంగా నడవడం, యోగా లేదా తేలికపాటి వ్యాయామం.' : 'At least 150 minutes of moderate activity, brisk walking, or yoga per week.'}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleChange('Reg.Exercise(Y/N)', 1)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData['Reg.Exercise(Y/N)'] === 1
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                      id="habit-exercise-yes"
                    >
                      {isTelugu ? 'అవును (చేస్తాను)' : 'Yes (Active)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('Reg.Exercise(Y/N)', 0)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData['Reg.Exercise(Y/N)'] === 0
                          ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                      id="habit-exercise-no"
                    >
                      {isTelugu ? 'కాదు (వ్యాయామం తక్కువ)' : 'Sedentary / No'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu
                      ? 'నడక మరియు కండరాల కదలిక వల్ల కణాలు అదనపు ఇన్సులిన్ లేకుండానే గ్లూకోజ్‌ను గ్రహిస్తాయి, తద్వారా హార్మోన్లు సమతుల్యం అవుతాయి.'
                      : 'Physical activity naturally increases GLUT4 glucose transporters in muscle cells, clearing sugar without requiring extra insulin.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: CLINICAL LABS (OPTIONAL) ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <span>{isTelugu ? 'దశ 5 / 5 (పూర్తిగా ఐచ్ఛికం)' : 'Step 5 of 5 (Completely Optional)'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isTelugu ? 'మీ వద్ద డాక్టర్ అల్ట్రాసౌండ్ లేదా ల్యాబ్ రిపోర్టులు ఉన్నాయా?' : 'Do you have recent ultrasound or lab test records?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'మీ వద్ద ఎలాంటి రిపోర్టులు లేకపోయినా పర్వాలేదు! మీరు దీనిని దాటవేసి నేరుగా స్క్రీనింగ్ ఫలితాన్ని పొందవచ్చు.'
                  : 'No worries if you do not have medical scans! You can skip this step and still receive an accurate preliminary screening.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Follicle Count */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'అల్ట్రాసౌండ్ ఫోలికల్స్ సంఖ్య (కుడి/ఎడమ)' : 'Ultrasound Follicles per Ovary (FNPO)'}
                  </label>
                  <span className="text-xs font-bold text-teal-600">{formData['Follicle No. (R)']}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formData['Follicle No. (R)']}
                  onChange={(e) => handleChange('Follicle No. (R)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. 14"
                  id="profile-input-follicle-count"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'ఒక్కో అండాశయంలో ≥12 ఫోలికల్స్ ఉండటం పాలీసిస్టిక్ ఓవరీ రూపాన్ని ధృవీకరిస్తుంది.' : '≥12-20 follicles per ovary confirms Polycystic Ovarian Morphology on ultrasound.'}
                  </span>
                </div>
              </div>

              {/* AMH */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'యాంటీ-ముల్లెరియన్ హార్మోన్ (AMH ng/mL)' : 'Anti-Müllerian Hormone (AMH ng/mL)'}
                  </label>
                  <span className="text-xs font-bold text-teal-600">{formData['AMH(ng/mL)']}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="35"
                  step="0.1"
                  value={formData['AMH(ng/mL)']}
                  onChange={(e) => handleChange('AMH(ng/mL)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. 5.2"
                  id="profile-input-amh"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'అధిక AMH అండాశయంలో ఎక్కువ అండాల నిల్వను సూచిస్తుంది.' : 'Elevated AMH strongly correlates with high ovarian follicle density.'}
                  </span>
                </div>
              </div>

              {/* Fasting Glucose / Blood Sugar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'రక్తంలో గ్లూకోజ్ (RBS mg/dl)' : 'Random Blood Sugar (RBS mg/dl)'}
                  </label>
                  <span className="text-xs font-bold text-teal-600">{formData['RBS(mg/dl)']}</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={formData['RBS(mg/dl)']}
                  onChange={(e) => handleChange('RBS(mg/dl)', Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. 98"
                  id="profile-input-rbs"
                />
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isTelugu ? 'ఇది ఎందుకు అవసరం: ' : 'Why we need this: '}</strong>
                    {isTelugu ? 'శరీరం రక్తంలో షుగర్‌ను ఎంత సమర్థవంతంగా నియంత్రిస్తుందో తెలుపుతుంది.' : 'Measures how effectively your body processes circulating glucose.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP NAVIGATION CONTROLS ================= */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors shadow-xs"
                id="profile-step-back-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isTelugu ? 'వెనుకటి దశ' : 'Previous Step'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                {isTelugu ? 'దశ 1 / 5' : 'Step 1 of 5'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                id="profile-step-next-btn"
              >
                <span>{isTelugu ? 'తదుపరి దశకు వెళ్లండి' : 'Save & Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('/dashboard')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors shadow-xs"
                  id="profile-save-dashboard-btn"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? (isTelugu ? 'సేవ్ చేస్తోంది...' : 'Saving...') : (isTelugu ? 'డ్యాష్‌బోర్డ్' : 'Go to Dashboard')}</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('/assessment')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-lg transition-all"
                  id="profile-save-assessment-btn"
                >
                  <span>{isSaving ? (isTelugu ? 'సేవ్ చేస్తోంది...' : 'Saving...') : (isTelugu ? 'పూర్తి చేసి స్క్రీనింగ్ ప్రారంభించండి' : 'Finish & Start Screening')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
