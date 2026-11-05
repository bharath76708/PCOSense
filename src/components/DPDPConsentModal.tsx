import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  AlertCircle,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../translations';
import { saveDPDPConsent, STATUTORY_GRO_DETAILS } from '../services/complianceService';

interface DPDPConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onConsentSuccess?: () => void;
}

export const DPDPConsentModal: React.FC<DPDPConsentModalProps> = ({
  isOpen,
  onClose,
  userId,
  onConsentSuccess
}) => {
  const { isTelugu } = useLanguage();

  const [clinicalScreening, setClinicalScreening] = useState<boolean>(true);
  const [lifestylePlanGeneration, setLifestylePlanGeneration] = useState<boolean>(true);
  const [doctorTeleconsultationSharing, setDoctorTeleconsultationSharing] = useState<boolean>(true);
  const [anonymizedResearchOptIn, setAnonymizedResearchOptIn] = useState<boolean>(false);
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ageConfirmed) {
      setErrorMsg(
        isTelugu
          ? 'దయచేసి మీరు 18 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ వయస్సు గలవారని ధృవీకరించండి (DPDP చట్టం 2023 సెక్షన్ 9).'
          : 'Please confirm that you are 18 years of age or older pursuant to Section 9 of the DPDP Act, 2023.'
      );
      return;
    }

    if (!clinicalScreening) {
      setErrorMsg(
        isTelugu
          ? 'PCOS రిస్క్ స్క్రీనింగ్ చేయడానికి ప్రాథమిక డేటా ప్రాసెసింగ్ సమ్మతి అవసరం.'
          : 'Basic clinical processing consent is required to calculate your PCOS risk profile.'
      );
      return;
    }

    saveDPDPConsent(
      userId,
      {
        clinicalScreening,
        lifestylePlanGeneration,
        doctorTeleconsultationSharing,
        anonymizedResearchOptIn
      },
      ageConfirmed
    );

    if (onConsentSuccess) onConsentSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      id="dpdp-consent-modal-backdrop"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        id="dpdp-consent-container"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-400/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>DPDP Act (2023) & Telemedicine Guidelines (2020)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {isTelugu ? 'రోగి డేటా గోప్యత & చికిత్సా సమ్మతి' : 'Patient Data Privacy & Telehealth Consent Notice'}
            </h2>
            <p className="text-xs text-slate-300">
              {isTelugu
                ? 'భారత ప్రభుత్వ నిబంధనల ప్రకారం స్పష్టమైన, పారదర్శకమైన సమ్మతి పత్రం.'
                : 'Statutory bilingual consent and purpose specification under Indian digital health laws.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Educational notice card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-teal-600" />
              <span>Data Principal Rights (DPDP Act, 2023)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              {isTelugu
                ? 'మీ వ్యక్తిగత మరియు ఆరోగ్య సమాచారం (పీరియడ్స్, బయోమార్కర్లు, రిపోర్టులు) అత్యంత గోప్యంగా ఉంచబడుతుంది. మీరు ఎప్పుడైనా మీ సమ్మతిని ఉపసంహరించుకోవచ్చు లేదా డేటాను పూర్తిగా తొలగించుకోవచ్చు.'
                : 'As a Data Principal under Section 11 & 12 of the DPDP Act 2023, you retain full ownership of your health records. You can access, export, rectify, or request complete deletion of your records anytime.'}
            </p>
          </div>

          {/* Granular Purpose Specification */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {isTelugu ? 'స్పష్టమైన ప్రయోజనాల కోసం అనుమతి:' : 'Granular Purpose Permissions:'}
            </h4>

            {/* Purpose 1: Clinical screening */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={clinicalScreening}
                onChange={e => setClinicalScreening(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? '1. PCOS లక్షణాలు & రోటర్డ్యామ్ స్క్రీనింగ్' : '1. PCOS Risk Stratification & Clinical Triage'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                  {isTelugu
                    ? 'మీ పీరియడ్ చక్రం, హార్మోన్ సూచికలు మరియు BMI ఆధారంగా రిస్క్ శాతాన్ని లెక్కించుటకు అనుమతి.'
                    : 'Process menstrual frequency, BMI, and clinical signs strictly to calculate educational risk categories.'}
                </span>
              </div>
            </label>

            {/* Purpose 2: Lifestyle & Diet */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={lifestylePlanGeneration}
                onChange={e => setLifestylePlanGeneration(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? '2. వైద్య పోషకాహార చికిత్స (MNT) & డైట్ ప్రణాళిక' : '2. Medical Nutrition Therapy (MNT) & Habit Tracking'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                  {isTelugu
                    ? 'తక్కువ-గ్లైసెమిక్ భోజనం, ఇన్సులిన్ సున్నితత్వాన్ని పెంచే ఆహారం మరియు వ్యాయామ సిఫార్సుల కోసం.'
                    : 'Personalize daily 7-day low-GI meal schedules, micronutrient calculations, and hydration checkpoints.'}
                </span>
              </div>
            </label>

            {/* Purpose 3: Doctor Teleconsultation Sharing */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={doctorTeleconsultationSharing}
                onChange={e => setDoctorTeleconsultationSharing(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {isTelugu ? '3. నమోదు చేసుకున్న వైద్యులతో రికార్డుల భాగస్వామ్యం' : '3. Secure Telemedicine Sharing with Verified Doctors'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                  {isTelugu
                    ? 'మీరు అపాయింట్‌మెంట్ బుక్ చేసిన NMC-ధృవీకరించబడిన వైద్యుడికి మాత్రమే మీ హెల్త్ రిపోర్టును షేర్ చేయుటకు.'
                    : 'Permit registered medical practitioners (RMPs) to view your clinical dossier solely during active teleconsultations.'}
                </span>
              </div>
            </label>
          </div>

          {/* Age Verification (Section 9 of DPDP Act 2023) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={e => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                id="dpdp-age-consent-checkbox"
              />
              <span className="font-bold text-amber-950 dark:text-amber-200 text-xs leading-snug">
                {isTelugu
                  ? 'నేను 18 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ వయస్సు గలవారినని లేదా చట్టబద్ధమైన సంరక్షకుడినని ధృవీకరిస్తున్నాను (DPDP చట్టం 2023 సెక్షన్ 9).'
                  : 'I confirm that I am 18 years of age or older, or authorized by a legal guardian under Section 9 of the DPDP Act, 2023.'}
              </span>
            </label>
          </div>

          {/* Grievance Redressal notice */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              Grievance Officer: <strong>{STATUTORY_GRO_DETAILS.name}</strong> ({STATUTORY_GRO_DETAILS.email})
            </span>
            <span className="font-medium text-teal-600 dark:text-teal-400">
              SLA: {STATUTORY_GRO_DETAILS.statutorySlaDays} Days Max
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isTelugu ? 'రద్దు చేయండి' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              id="confirm-dpdp-consent-btn"
            >
              <FileCheck className="h-4 w-4" />
              <span>{isTelugu ? 'సమ్మతిని ధృవీకరించండి' : 'Confirm & Accept Terms'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
