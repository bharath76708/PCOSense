import React from 'react';
import {
  FileText,
  Printer,
  X,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { PredictionResponse, PatientRecord } from '../types';
import { useLanguage } from '../translations';

interface DoctorDiscussionGuideProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResponse | null;
  patientData: PatientRecord;
}

export const DoctorDiscussionGuide: React.FC<DoctorDiscussionGuideProps> = ({
  isOpen,
  onClose,
  prediction,
  patientData
}) => {
  const { t, isTelugu } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isElevated = prediction?.risk_level === 'Elevated';
  const isModerate = prediction?.risk_level === 'Moderate';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isTelugu ? 'డాక్టర్ చర్చా మార్గదర్శి & మూల్యాంకన సారాంశం' : 'Doctor Discussion & Assessment Summary'}
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-400">
                {isTelugu ? 'మీ కన్సల్టేషన్ కోసం మీ లక్షణాలు మరియు ప్రశ్నల నిర్మాణాత్మక సారాంశం' : 'A structured summary of your reported symptoms and questions to bring to your consultation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>{isTelugu ? 'ప్రింట్ / PDF సేవ్' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          {/* NOTICE BANNER */}
          <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 dark:text-teal-300 space-y-1">
              <strong className="font-bold">{isTelugu ? 'క్లినికల్ చర్చా సహాయం:' : 'Clinical Discussion Aid:'}</strong>
              <p className="text-teal-800 dark:text-teal-400/90">
                {isTelugu
                  ? 'ఈ పత్రం రోగి స్వయంగా నివేదించిన లక్షణాలు మరియు PCOSense అల్గోరిథమిక్ రిస్క్ వర్గీకరణను సంగ్రహిస్తుంది. రోటర్‌డామ్ 2003 ప్రమాణాల ప్రకారం వైద్యుల సంప్రదింపులను సులభతరం చేయడానికి ఇది రూపొందించబడింది.'
                  : 'This document summarizes patient self-reported symptoms and algorithmic risk stratification from the PCOSense platform. It is formatted to facilitate concise clinical evaluation per the Rotterdam 2003 diagnostic consensus.'}
              </p>
            </div>
          </div>

          {/* PATIENT & ASSESSMENT HEADER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                {isTelugu ? 'అసెస్‌మెంట్ ID' : 'Assessment ID'}
              </span>
              <span className="font-mono font-bold text-xs text-slate-900 dark:text-teal-300">{prediction?.assessment_id || 'PCO-DRAFT'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                {isTelugu ? 'రూపొందించిన తేదీ' : 'Date Generated'}
              </span>
              <span className="font-semibold text-xs text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                {isTelugu ? 'అంచనా రిస్క్ స్థాయి' : 'Estimated Risk Tier'}
              </span>
              <span className={`font-bold text-xs ${isElevated ? 'text-rose-700 dark:text-rose-400' : isModerate ? 'text-amber-700 dark:text-amber-400' : 'text-teal-700 dark:text-teal-400'}`}>
                {prediction?.risk_level === 'Low' ? (isTelugu ? 'తక్కువ రిస్క్' : 'Low') : prediction?.risk_level === 'Moderate' ? (isTelugu ? 'మధ్యస్థ రిస్క్' : 'Moderate') : (isTelugu ? 'ఎక్కువ రిస్క్' : 'Elevated')} ({prediction?.probabilityPercentage || 0}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                {isTelugu ? 'వయస్సు & BMI' : 'Age & BMI'}
              </span>
              <span className="font-semibold text-xs text-slate-900 dark:text-white">{patientData['Age (yrs)']} {isTelugu ? 'సంవత్సరాలు' : 'yrs'} | BMI {patientData['BMI']}</span>
            </div>
          </div>

          {/* SECTION 1: REPORTED SYMPTOMS ACCORDING TO ROTTERDAM CRITERIA */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-2">
              <span>{isTelugu ? '1. రోటర్‌డామ్ లక్షణాల పరిశీలన' : '1. Symptomatic Findings (Rotterdam Evaluation)'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'పీరియడ్స్ క్రమం' : 'Menstrual Regularity'}
                </span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {patientData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమబద్ధమైనది (21-35 రోజులు)' : 'Regular (21-35 days)') : (isTelugu ? 'సక్రమంగా లేనిది (>35 రోజులు)' : 'Irregular (>35 days / Oligomenorrhea)')}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                  {isTelugu ? 'రక్తస్రావ వ్యవధి:' : 'Bleeding Duration:'} {patientData['Cycle length(days)']} {isTelugu ? 'రోజులు' : 'days'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'ఆండ్రోజెనిక్ సంకేతాలు' : 'Androgenic Signs'}
                </span>
                <ul className="text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                  <li>- {isTelugu ? 'అవాంఛిత రోమాలు (హిర్సుటిజం):' : 'Hirsutism (Excess Hair):'} <strong className="text-slate-900 dark:text-slate-200">{patientData['hair growth(Y/N)'] ? (isTelugu ? 'ఉన్నాయి' : 'Reported') : (isTelugu ? 'లేవు' : 'None')}</strong></li>
                  <li>- {isTelugu ? 'మొటిమలు (యాక్నె):' : 'Persistent Acne:'} <strong className="text-slate-900 dark:text-slate-200">{patientData['Pimples(Y/N)'] ? (isTelugu ? 'ఉన్నాయి' : 'Reported') : (isTelugu ? 'లేవు' : 'None')}</strong></li>
                  <li>- {isTelugu ? 'జుట్టు రాలడం:' : 'Hair Thinning / Alopecia:'} <strong className="text-slate-900 dark:text-slate-200">{patientData['Hair loss(Y/N)'] ? (isTelugu ? 'ఉన్నాయి' : 'Reported') : (isTelugu ? 'లేవు' : 'None')}</strong></li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isTelugu ? 'జీవక్రియ & అల్ట్రాసౌండ్' : 'Metabolic & Ultrasound'}
                </span>
                <ul className="text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                  <li>- {isTelugu ? 'చర్మం నల్లబడటం:' : 'Skin Darkening (Acanthosis):'} <strong className="text-slate-900 dark:text-slate-200">{patientData['Skin darkening (Y/N)'] ? (isTelugu ? 'ఉన్నది' : 'Reported') : (isTelugu ? 'లేదు' : 'None')}</strong></li>
                  <li>- {isTelugu ? 'ఫోలికల్స్ (కుడి / ఎడమ):' : 'Follicles (R / L):'} <strong className="text-slate-900 dark:text-slate-200">{patientData['Follicle No. (R)'] || 'N/A'} / {patientData['Follicle No. (L)'] || 'N/A'}</strong></li>
                  <li>- {isTelugu ? 'ఫాస్ట్ ఫుడ్ అలవాటు:' : 'Fast Food Habit:'} <strong className="text-slate-900 dark:text-slate-200">{patientData['Fast food (Y/N)'] ? (isTelugu ? 'ఎక్కువ' : 'Frequent') : (isTelugu ? 'తక్కువ' : 'Infrequent')}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 2: TOP MODEL FACTOR CONTRIBUTIONS */}
          {prediction && prediction.key_risk_drivers && prediction.key_risk_drivers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                {isTelugu ? '2. స్క్రీనింగ్ మోడల్ గుర్తించిన ప్రధాన కారకాలు' : '2. Key Influencing Factors Identified by Screening Model'}
              </h4>
              <div className="space-y-1.5">
                {prediction.key_risk_drivers.slice(0, 4).map((f, i) => (
                  <div key={`driver-${f.featureName}-${i}`} className="flex items-center justify-between text-xs bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 rounded-xl p-2.5">
                    <span className="font-medium text-rose-950 dark:text-rose-200">{f.featureName}</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">+{f.contribution.toFixed(2)} {isTelugu ? 'రిస్క్ ప్రభావం' : 'Risk Weight'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: RECOMMENDED QUESTIONS FOR YOUR DOCTOR */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
              {isTelugu ? '3. మీ డాక్టర్‌ను అడగవలసిన ముఖ్యమైన ప్రశ్నలు' : '3. Suggested Questions to Ask During Your Visit'}
            </h4>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">{isTelugu ? 'హార్మోన్ రక్త పరీక్షలు:' : 'Hormone Blood Panel:'}</strong> {isTelugu ? '"థైరాయిడ్ మరియు ఇతర సమస్యలను మినహాయించడానికి డే 3 హార్మోన్ ప్యానెల్ (టెస్టోస్టెరాన్, DHEA-S, LH, FSH, TSH) చేయవచ్చా?"' : '"Could we evaluate a comprehensive Day 3 hormone panel including Total/Free Testosterone, DHEA-S, LH, FSH, Estradiol, and TSH to rule out thyroid issues?"'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">{isTelugu ? 'పెల్విక్ అల్ట్రాసౌండ్:' : 'Pelvic Ultrasound:'}</strong> {isTelugu ? '"నా అండాశయాలలో ఫోలికల్స్ సంఖ్య మరియు ఎండోమెట్రియం మందాన్ని తనిఖీ చేయడానికి పెల్విక్ అల్ట్రాసౌండ్ అవసరమా?"' : '"Would a transvaginal or pelvic ultrasound be appropriate to check my ovarian follicle count and endometrial lining?"'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">{isTelugu ? 'ఇన్సులిన్ & జీవక్రియ పరీక్షలు:' : 'Metabolic & Insulin Testing:'}</strong> {isTelugu ? '"ఇన్సులిన్ నిరోధకతను గుర్తించడానికి ఫాస్టింగ్ ఇన్సులిన్, గ్లూకోజ్, HbA1c లేదా లిపిడ్ ప్రొఫైల్ పరీక్షలు చేయాలా?"' : '"Should we check fasting insulin, fasting glucose, HbA1c, or a lipid profile to screen for metabolic insulin resistance?"'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-[11px] shrink-0">4</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">{isTelugu ? 'వ్యక్తిగత చికిత్సా ప్రణాళిక:' : 'Personalized Treatment Strategy:'}</strong> {isTelugu ? '"నా లక్షణాలు మరియు జీవనశైలి ఆధారంగా నాకు సరిపోయే ఆహారం, ఇనోసిటాల్ సప్లిమెంట్లు లేదా మందులు ఏమిటి?"' : '"Based on my symptoms (cycle regularity, hair/skin, weight management), what lifestyle interventions, inositol supplements, or medications are best suited for my goals?"'}
                </div>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
            {isTelugu ? '* ఈ నివేదిక కేవలం అవగాహన మరియు వైద్యుల సంప్రదింపుల సన్నద్ధత కోసం మాత్రమే PCOSense ద్వారా రూపొందించబడింది. ఇది అధికారిక రోగ నిర్ధారణ కాదు.' : '* This report is generated by PCOSense for educational self-screening and medical appointment preparation. It does not constitute a formal diagnosis or laboratory finding.'}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">PCOSense v1.0.0 Clinical Summary</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 dark:hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              {isTelugu ? 'ప్రింట్ / PDF సేవ్' : 'Print / Save PDF'}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              {isTelugu ? 'మూసివేయి' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
