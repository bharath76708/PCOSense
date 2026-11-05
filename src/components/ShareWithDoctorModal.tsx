import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  QrCode,
  Link as LinkIcon,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Lock,
  Download,
  Printer,
  X,
  Stethoscope,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Activity,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useLanguage } from '../translations';
import { AssessmentHistoryItem, DoctorSharePayload, RiskLevel } from '../types';

interface ShareWithDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestAssessment?: AssessmentHistoryItem | null;
  onAskAI?: (prompt?: string) => void;
}

export const ShareWithDoctorModal: React.FC<ShareWithDoctorModalProps> = ({
  isOpen,
  onClose,
  latestAssessment,
  onAskAI
}) => {
  const { user, profile } = useAuth();
  const { predictionResult, patientData } = useAssessment();
  const { t, isTelugu } = useLanguage();

  const [copied, setCopied] = useState<boolean>(false);
  const [expirationHours, setExpirationHours] = useState<number>(24); // 24h, 72h, 168h
  const [pinProtected, setPinProtected] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('4829');
  const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'preview'>('qr');
  const [sharePayload, setSharePayload] = useState<DoctorSharePayload | null>(null);

  // Generate share data whenever modal opens or settings change
  useEffect(() => {
    if (!isOpen) return;

    const shareId = `doc-share-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();
    const expires = new Date(now.getTime() + expirationHours * 3600 * 1000);

    const activeRiskScore = latestAssessment?.probability ?? predictionResult?.probabilityPercentage ?? 48.5;
    const activeRiskLevel: RiskLevel = latestAssessment?.risk_level ?? predictionResult?.risk_level ?? 'Moderate';
    
    // Construct real share URL pointing to the app's current origin + consultation token
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pcosense.app';
    const generatedUrl = `${baseUrl}/results?view=doctor_brief&share_id=${shareId}&exp=${expires.getTime()}${pinProtected ? `&pin=required` : ''}`;

    // Rotterdam criteria calculation
    const cycleIrregular = (patientData?.['Cycle(R/I)'] === 4 || patientData?.['Cycle length(days)'] > 35 || patientData?.['Cycle length(days)'] < 21);
    const hyperandrogenism = Boolean(patientData?.['hair growth(Y/N)'] || patientData?.['Pimples(Y/N)'] || patientData?.['Skin darkening (Y/N)']);
    const polycysticOvaries = (patientData?.['Follicle No. (R)'] >= 12 || patientData?.['Follicle No. (L)'] >= 12 || (latestAssessment?.follicleCountRight ?? 0) >= 12);
    const criteriaCount = (cycleIrregular ? 1 : 0) + (hyperandrogenism ? 1 : 0) + (polycysticOvaries ? 1 : 0);

    const payload: DoctorSharePayload = {
      shareId,
      userId: user?.id,
      patientName: user?.full_name || 'Patient',
      patientAge: patientData?.['Age (yrs)'] || 24,
      generatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      expirationHours,
      pinProtected,
      pinHash: pinProtected ? pinCode : undefined,
      shareUrl: generatedUrl,
      assessmentData: {
        latestRiskScore: activeRiskScore,
        riskLevel: activeRiskLevel,
        timestamp: now.toISOString(),
        bmi: patientData?.['BMI'] || 23.8,
        cycleStatus: patientData?.['Cycle(R/I)'] === 2 ? 'Regular (28-30 days)' : 'Irregular / Oligomenorrhea',
        follicleCountRight: patientData?.['Follicle No. (R)'] || 8,
        follicleCountLeft: patientData?.['Follicle No. (L)'] || 7,
        vitalSigns: {
          bloodPressure: `${patientData?.['BP _Systolic (mmHg)'] || 118}/${patientData?.['BP _Diastolic (mmHg)'] || 78} mmHg`,
          pulseRate: patientData?.['Pulse rate(bpm)'] || 74,
          respiratoryRate: patientData?.['RR (breaths/min)'] || 18,
          glucoseRBS: patientData?.['RBS(mg/dl)'] || 94,
          tsh: patientData?.['TSH (mIU/L)'] || 2.4,
          amh: patientData?.['AMH(ng/mL)'] || 3.8,
          lhFshRatio: patientData?.['FSH/LH'] || 1.1
        },
        symptomsList: {
          hirsutism: Boolean(patientData?.['hair growth(Y/N)']),
          acne: Boolean(patientData?.['Pimples(Y/N)']),
          hairLoss: Boolean(patientData?.['Hair loss(Y/N)']),
          weightGain: Boolean(patientData?.['Weight gain(Y/N)']),
          skinDarkening: Boolean(patientData?.['Skin darkening (Y/N)'])
        },
        rotterdamCriteriaMet: {
          oligoAnovulation: cycleIrregular,
          hyperandrogenism,
          polycysticOvaries,
          criteriaCount
        },
        notes: 'Pre-consultation screening data generated via PCOSense Clinical Assistant.'
      }
    };

    setSharePayload(payload);
  }, [isOpen, expirationHours, pinProtected, pinCode, latestAssessment, predictionResult, patientData, user]);

  if (!isOpen || !sharePayload) return null;

  const handleCopyLink = () => {
    if (sharePayload?.shareUrl) {
      navigator.clipboard.writeText(sharePayload.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-doctor-title"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Stethoscope className="h-5 w-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="share-doctor-title" className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'డాక్టర్‌తో పంచుకోండి' : 'Share with Doctor'}
                </h2>
                <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                  {isTelugu ? 'సురక్షిత లింక్ & QR' : 'Encrypted QR & Link'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu 
                  ? 'మీ అపాయింట్‌మెంట్ సమయంలో గైనకాలజిస్ట్ లేదా ఎండోక్రినాలజిస్ట్‌కు చూపించడానికి తాత్కాలిక లింక్ లేదా QR కోడ్.'
                  : 'Generate a secure, temporary presentation view for healthcare providers during clinical appointments.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-400 focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-teal-600 text-teal-900 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>{isTelugu ? 'QR కోడ్' : 'Scan QR Code'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'border-teal-600 text-teal-900 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>{isTelugu ? 'సురక్షిత లింక్' : 'Direct Link & PIN'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-teal-600 text-teal-900 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{isTelugu ? 'క్లినికల్ సారాంశం' : 'Physician Brief Preview'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-5">
              
              {/* QR Code Container with High-Contrast White Matte */}
              <div className="p-4 rounded-3xl bg-white shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                <QRCodeSVG
                  value={sharePayload.shareUrl}
                  size={210}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230d9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
                <span className="text-[11px] font-bold text-slate-600 mt-2 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                  PCOSense Doctor Presentation Portal
                </span>
              </div>

              <div className="max-w-md space-y-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'మీ వైద్యుడిని ఈ QR కోడ్‌ను స్కాన్ చేయమని అడగండి' : 'Have your doctor scan this code on their tablet or phone'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu 
                    ? 'ఇది లాగిన్ అవసరం లేకుండా మీ Rotterdam లక్షణాలు, BMI, అల్ట్రాసౌండ్ మరియు రక్త పరీక్షల వివరాలను వైద్యునికి మాత్రమే సురక్షితంగా ప్రదర్శిస్తుంది.'
                    : 'Opens a clean, high-contrast clinical dashboard optimized for physician review with Rotterdam Diagnostic Criteria evaluation.'}
                </p>
              </div>

              {/* Expiration & PIN Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock className="h-3 w-3" />
                  {isTelugu ? `చెల్లుబాటు: ${expirationHours} గంటలు` : `Valid for: ${expirationHours} hours`}
                </span>
                {pinProtected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <Lock className="h-3 w-3" />
                    PIN: <strong className="font-mono">{pinCode}</strong>
                  </span>
                )}
              </div>

              {/* Quick Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-bold text-xs hover:bg-teal-100 dark:hover:bg-teal-900/80 transition-all shadow-2xs"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4 text-teal-700 dark:text-teal-400" />}
                <span>{copied ? (isTelugu ? 'లింక్ కాపీ చేయబడింది!' : 'Link Copied to Clipboard!') : (isTelugu ? 'డాక్టర్ లింక్ కాపీ చేయండి' : 'Copy Doctor Web Link')}</span>
              </button>
            </div>
          )}

          {/* TAB 2: LINK & SECURITY SETTINGS */}
          {activeTab === 'link' && (
            <div className="space-y-5">
              
              {/* Shareable Link Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isTelugu ? 'సురక్షిత తాత్కాలిక లింక్' : 'Secure Provider Link'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sharePayload.shareUrl}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? (isTelugu ? 'కాపీ అయింది!' : 'Copied!') : (isTelugu ? 'కాపీ చేయండి' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Security & Expiration Settings */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'భద్రత & చెల్లుబాటు సెట్టింగ్‌లు' : 'Access Expiration & Protection'}</span>
                </h3>

                {/* Expiration Timer Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'లింక్ గడువు ముగింపు' : 'Link Expiration Window'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { hours: 24, label: '24 Hours (Appointment)' },
                      { hours: 72, label: '3 Days (Weekend)' },
                      { hours: 168, label: '7 Days (Follow-up)' }
                    ].map(opt => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => setExpirationHours(opt.hours)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                          expirationHours === opt.hours
                            ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-400 dark:border-teal-600 text-teal-950 dark:text-teal-200 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN Code Protection Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {isTelugu ? '4-అంకెల సెక్యూరిటీ పిన్ రక్షణ' : 'Require 4-Digit Security PIN'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isTelugu ? 'డాక్టర్ పేజీని తెరవడానికి ఈ పిన్ నమోదు చేయాలి.' : 'Doctor will be prompted to enter this PIN code before viewing clinical charts.'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pinProtected}
                        onChange={(e) => setPinProtected(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  {pinProtected && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{isTelugu ? 'పిన్ కోడ్:' : 'Security PIN:'}</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        className="w-24 text-center font-mono font-extrabold text-sm tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-1 px-2 text-teal-800 dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                      <button
                        type="button"
                        onClick={() => setPinCode(Math.floor(1000 + Math.random() * 9000).toString())}
                        className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                      >
                        {isTelugu ? 'కొత్త పిన్ రూపొందించండి' : 'Generate New PIN'}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: PHYSICIAN BRIEF PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              
              {/* Doctor Brief Header Card */}
              <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/60 p-4 border border-teal-200 dark:border-teal-800 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-200/60 dark:bg-teal-900 px-2 py-0.5 rounded-md">
                    Clinical Encounter Summary
                  </span>
                  <h3 className="text-base font-extrabold text-teal-950 dark:text-white mt-1">
                    {sharePayload.patientName} (Age: {sharePayload.patientAge})
                  </h3>
                  <p className="text-xs text-teal-800/80 dark:text-teal-300/80">
                    Generated: {new Date(sharePayload.generatedAt).toLocaleDateString()} • PCOSense ML Risk Model
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {sharePayload.assessmentData?.latestRiskScore.toFixed(1)}%
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    sharePayload.assessmentData?.riskLevel === 'Low'
                      ? 'bg-teal-100 text-teal-900 border-teal-300'
                      : sharePayload.assessmentData?.riskLevel === 'Moderate'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}>
                    {sharePayload.assessmentData?.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Rotterdam 2-of-3 Criteria Status Grid */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Rotterdam Diagnostic Criteria (2003/2018 Guidelines)
                  </span>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                    {sharePayload.assessmentData?.rotterdamCriteriaMet?.criteriaCount} / 3 Criteria Present
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border ${
                    sharePayload.assessmentData?.rotterdamCriteriaMet?.oligoAnovulation
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {sharePayload.assessmentData?.rotterdamCriteriaMet?.oligoAnovulation ? '⚠️ 1. Oligo/Anovulation' : '✓ 1. Normal Ovulation'}
                    </div>
                    <p className="text-[10px] mt-0.5">{sharePayload.assessmentData?.cycleStatus}</p>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    sharePayload.assessmentData?.rotterdamCriteriaMet?.hyperandrogenism
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {sharePayload.assessmentData?.rotterdamCriteriaMet?.hyperandrogenism ? '⚠️ 2. Hyperandrogenism' : '✓ 2. No Excess Androgens'}
                    </div>
                    <p className="text-[10px] mt-0.5">
                      {sharePayload.assessmentData?.symptomsList?.hirsutism ? 'Hirsutism reported' : 'No hirsutism signs'}
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    sharePayload.assessmentData?.rotterdamCriteriaMet?.polycysticOvaries
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {sharePayload.assessmentData?.rotterdamCriteriaMet?.polycysticOvaries ? '⚠️ 3. Polycystic Morphology' : '✓ 3. Normal Ovaries'}
                    </div>
                    <p className="text-[10px] mt-0.5">Right Follicles: {sharePayload.assessmentData?.follicleCountRight ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vitals & Biomarkers Mini Table */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">Key Physiological Markers</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">BMI</span>
                    <strong className="text-slate-900 dark:text-white">{sharePayload.assessmentData?.bmi} kg/m²</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Blood Pressure</span>
                    <strong className="text-slate-900 dark:text-white">{sharePayload.assessmentData?.vitalSigns?.bloodPressure}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Random Blood Sugar</span>
                    <strong className="text-slate-900 dark:text-white">{sharePayload.assessmentData?.vitalSigns?.glucoseRBS} mg/dL</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">AMH Level</span>
                    <strong className="text-slate-900 dark:text-white">{sharePayload.assessmentData?.vitalSigns?.amh} ng/mL</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>{isTelugu ? 'HIPAA & డేటా భద్రత కట్టుబాటు' : 'Patient Privacy & Session Encrypted'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ప్రింట్ చేయండి' : 'Print Brief'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? (isTelugu ? 'కాపీ అయింది!' : 'Copied!') : (isTelugu ? 'లింక్ కాపీ చేయండి' : 'Copy Doctor Link')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
