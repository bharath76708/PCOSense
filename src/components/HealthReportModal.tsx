import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  ShieldCheck,
  User,
  Heart,
  Activity,
  Flame,
  Stethoscope,
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { HealthReportRecord, DoctorProfile } from '../types';
import {
  MEDICAL_DISCLAIMER_TEXT,
  MEDICAL_DISCLAIMER_TEXT_TE,
  formatRiskPatternStatement,
  authorizeReportSharing,
  revokeReportSharing
} from '../services/healthReportService';
import { getVerifiedDoctors } from '../services/doctorService';
import { useLanguage } from '../translations';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HealthReportRecord | null;
  onReportUpdated?: (updated: HealthReportRecord) => void;
}

export const HealthReportModal: React.FC<HealthReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onReportUpdated
}) => {
  const { isTelugu } = useLanguage();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isConfirmingShare, setIsConfirmingShare] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  if (!isOpen || !report) return null;

  const verifiedDoctors = getVerifiedDoctors();
  const riskStatement = formatRiskPatternStatement(report.screeningSummary.riskLevel, isTelugu);
  const isHighRisk = report.screeningSummary.riskLevel === 'Elevated';

  const handleInitiateShare = () => {
    if (!selectedDoctorId) {
      setFeedbackMsg(isTelugu ? 'దయచేసి వైద్యుడిని ఎంచుకోండి' : 'Please select a specialist first');
      return;
    }
    setIsConfirmingShare(true);
  };

  const handleConfirmShare = () => {
    if (!report || !selectedDoctorId) return;
    const updated = authorizeReportSharing(report.id, selectedDoctorId);
    if (updated) {
      if (onReportUpdated) onReportUpdated(updated);
      setFeedbackMsg(isTelugu ? 'రిపోర్ట్ డాక్టర్‌తో విజయవంతంగా షేర్ చేయబడింది' : 'Report securely shared with selected specialist');
      setIsConfirmingShare(false);
    }
  };

  const handleRevokeShare = (docId: string) => {
    if (!report) return;
    const updated = revokeReportSharing(report.id, docId);
    if (updated) {
      if (onReportUpdated) onReportUpdated(updated);
      setFeedbackMsg(isTelugu ? 'యాక్సెస్ విజయవంతంగా రద్దు చేయబడింది' : 'Access successfully revoked');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      id="health-report-modal-backdrop"
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        id="health-report-printable-container"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isTelugu ? 'క్లినికల్ హెల్త్ & స్క్రీనింగ్ రిపోర్ట్' : 'Clinical Health & Screening Report'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu ? 'జనరేట్ చేసిన తేదీ:' : 'Generated on:'} {new Date(report.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              id="print-health-report-btn"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{isTelugu ? 'ప్రింట్ / పిడిఎఫ్' : 'Print / PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
              id="close-health-report-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* CRITICAL MEDICAL DISCLAIMER BANNER */}
          <div
            className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3.5"
            id="report-medical-disclaimer-banner"
          >
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {isTelugu ? 'ముఖ్యమైన వైద్య నిరాకరణ (Medical Disclaimer)' : 'Important Clinical Disclaimer'}
              </h4>
              <p className="text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                {isTelugu ? MEDICAL_DISCLAIMER_TEXT_TE : MEDICAL_DISCLAIMER_TEXT}
              </p>
            </div>
          </div>

          {/* Patient Details & Risk Pattern Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {isTelugu ? 'రోగి వివరాలు' : 'Patient Name'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <User className="h-4 w-4 text-teal-500" />
                {report.userName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{report.userEmail}</p>
            </div>

            <div
              className={`p-4 rounded-2xl border md:col-span-2 flex flex-col justify-center ${
                isHighRisk
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {isTelugu ? 'స్క్రీనింగ్ ఫలితాలు' : 'Screening Evaluation'}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold mt-1">{riskStatement}</h3>
              <p className="text-xs opacity-80 mt-1">
                {isTelugu
                  ? `పరిశీలించిన సూచికలు: ${report.screeningSummary.probabilityPercentage}% సంభావ్యత నమూనా.`
                  : `Risk Probability Index: ${report.screeningSummary.probabilityPercentage}% pattern match.`}
              </p>
            </div>
          </div>

          {/* Clinical Measurements */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-teal-500" />
              {isTelugu ? 'శారీరక కొలతలు (Clinical Biomarkers)' : 'Clinical Biomarkers & Anthropometrics'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">BMI</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">{report.measurements.bmi} kg/m²</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'బరువు / ఎత్తు' : 'Weight / Height'}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {report.measurements.weightKg} kg / {report.measurements.heightCm} cm
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'రక్తపోటు (BP)' : 'Blood Pressure'}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">{report.measurements.bloodPressure}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400">{isTelugu ? 'నాడి వేగం' : 'Pulse Rate'}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white">{report.measurements.pulseRate} bpm</p>
              </div>
            </div>
          </div>

          {/* Reported Symptoms Profile */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-rose-500" />
              {isTelugu ? 'నమోదైన లక్షణాలు (Reported Symptoms)' : 'Reported Symptoms Profile'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.symptomsSummary.map((sym, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle & Nutrition Targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-amber-500" />
                {isTelugu ? 'జీవనశైలి & అలవాట్లు' : 'Lifestyle Habits'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>{isTelugu ? 'వ్యాయామం' : 'Exercise Regularity'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{report.lifestyleSummary.exerciseRegularity}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>{isTelugu ? 'జంక్ ఫుడ్ ఫ్రీక్వెన్సీ' : 'Fast Food Intake'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{report.lifestyleSummary.fastFoodFrequency}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>{isTelugu ? 'రోజువారీ నీరు' : 'Hydration Intake'}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{report.lifestyleSummary.waterIntakeLiters} Liters/day</span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
                <Stethoscope className="h-4 w-4 text-teal-500" />
                {isTelugu ? 'సిఫార్సు చేయబడిన నిపుణులు' : 'Recommended Specialist'}
              </h4>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                {report.recommendedSpecialist}
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {report.recommendedNextSteps.slice(0, 2).map((step, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">•</span>
                    <span>{step}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* EXPLICIT PATIENT AUTHORIZATION: SHARE WITH DOCTOR */}
          <div
            className="border-2 border-teal-500/30 rounded-2xl p-5 bg-gradient-to-r from-teal-500/5 via-teal-500/10 to-indigo-500/5 space-y-4"
            id="share-report-section"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'వైద్యుడితో రిపోర్ట్ షేరింగ్ (రోగి అనుమతితో మాత్రమే)' : 'Specialist Clinical Access Authorization'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {isTelugu
                    ? 'మీ స్పష్టమైన అనుమతి లేకుండా ఏ వైద్యుడు కూడా మీ ఆరోగ్య నివేదికను చూడలేరు. మీరు ఎప్పుడైనా షేరింగ్‌ను రద్దు చేసుకోవచ్చు.'
                    : 'Specialists cannot view your health assessment unless explicitly authorized by you. You retain full control to grant or revoke access anytime.'}
                </p>
              </div>
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Existing Shared Doctors */}
            {report.sharedWithDoctorIds && report.sharedWithDoctorIds.length > 0 && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {isTelugu ? 'ప్రస్తుతం యాక్సెస్ ఉన్న వైద్యులు:' : 'Currently Authorized Specialists:'}
                </p>
                <div className="space-y-1.5">
                  {report.sharedWithDoctorIds.map(docId => {
                    const doc = verifiedDoctors.find(d => d.id === docId);
                    return (
                      <div key={docId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {doc?.name || docId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRevokeShare(docId)}
                          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold text-xs underline"
                        >
                          {isTelugu ? 'యాక్సెస్ రద్దు చేయండి' : 'Revoke Access'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                id="select-doctor-to-share"
              >
                <option value="">{isTelugu ? '-- నిపుణుడిని ఎంచుకోండి --' : '-- Select Verified Specialist --'}</option>
                {verifiedDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc?.name || 'Doctor'} ({doc?.specialization || 'Specialist'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleInitiateShare}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all shrink-0"
                id="initiate-share-btn"
              >
                <Share2 className="h-4 w-4" />
                <span>{isTelugu ? 'డాక్టర్‌తో షేర్ చేయండి' : 'Share with Doctor'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {isConfirmingShare && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-6 z-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'ఆరోగ్య సమాచారం షేరింగ్ అనుమతి' : 'Authorize Clinical Record Sharing'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isTelugu
                    ? 'మీరు ఈ నిపుణుడితో మీ PCOS స్క్రీనింగ్ మరియు జీవనశైలి వివరాలను షేర్ చేయబోతున్నారు. కొనసాగించాలా?'
                    : 'You are about to share your health screening and wellness information with this doctor.'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingShare(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {isTelugu ? 'రద్దు చేయండి' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmShare}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all"
                  id="confirm-share-doctor-btn"
                >
                  {isTelugu ? 'అనుమతించండి' : 'Share Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
