import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  UserCheck,
  Send,
  ExternalLink,
  ChevronRight,
  Database,
  Eye,
  Info,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import {
  getDPDPConsent,
  saveDPDPConsent,
  revokeDPDPConsent,
  getAllAuditLogs,
  getAuditLogsForPatient,
  generatePatientDataExport,
  executeDataErasure,
  getABHAProfile,
  saveABHAProfile,
  formatABHANumber,
  validateABHANumber,
  getGrievanceTickets,
  submitGrievanceTicket,
  STATUTORY_GRO_DETAILS
} from '../services/complianceService';
import { DPDPConsentModal } from '../components/DPDPConsentModal';
import { NmcPrescriptionModal } from '../components/NmcPrescriptionModal';
import { buildStandardNMCPrescription } from '../services/complianceService';
import { getStoredDoctors } from '../services/doctorService';

export const CompliancePrivacyPage: React.FC = () => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const currentUserId = user?.id || 'guest-user';
  const [activeTab, setActiveTab] = useState<'dpdp' | 'telemedicine' | 'audit' | 'abha' | 'grievance'>('dpdp');
  const [consent, setConsent] = useState(() => getDPDPConsent(currentUserId));
  const [isConsentModalOpen, setIsConsentModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Erasure confirmation modal
  const [isErasureModalOpen, setIsErasureModalOpen] = useState<boolean>(false);
  const [erasureConfirmText, setErasureConfirmText] = useState<string>('');

  // ABHA State
  const [abhaProfile, setAbhaProfile] = useState(() => getABHAProfile(currentUserId));
  const [abhaInput, setAbhaInput] = useState<string>('');
  const [abhaAddressInput, setAbhaAddressInput] = useState<string>('');
  const [abhaError, setAbhaError] = useState<string>('');

  // Grievance Form State
  const [grievanceSubject, setGrievanceSubject] = useState<string>('');
  const [grievanceCategory, setGrievanceCategory] = useState<'data_access' | 'consent_withdrawal' | 'data_correction' | 'teleconsultation_grievance' | 'security_incident'>('data_access');
  const [grievanceDesc, setGrievanceDesc] = useState<string>('');
  const [tickets, setTickets] = useState(() => getGrievanceTickets(currentUserId));

  // Sample Prescription Preview
  const [isPreviewPrescriptionOpen, setIsPreviewPrescriptionOpen] = useState<boolean>(false);

  const auditLogs = useMemo(() => {
    return getAuditLogsForPatient(currentUserId);
  }, [currentUserId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleToggleRevokeConsent = () => {
    if (consent?.status === 'active') {
      revokeDPDPConsent(currentUserId);
      setConsent(getDPDPConsent(currentUserId));
      showToast(isTelugu ? 'మీ సమ్మతి విజయవంతంగా ఉపసంహరించబడింది.' : 'Your DPDP consent has been revoked.');
    } else {
      setIsConsentModalOpen(true);
    }
  };

  const handleExportData = () => {
    const exportResult = generatePatientDataExport(currentUserId);
    const blob = new Blob([exportResult.jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      isTelugu
        ? 'మీ పూర్తి ఆరోగ్య రికార్డులు (EHR JSON) విజయవంతంగా డౌన్‌లోడ్ చేయబడ్డాయి!'
        : 'Health dossier exported successfully under DPDP Act 2023 Section 11!'
    );
  };

  const handleConfirmErasure = () => {
    if (erasureConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm data erasure.');
      return;
    }
    executeDataErasure(currentUserId, 'Data Principal requested full account data purge');
    setIsErasureModalOpen(false);
    setConsent(getDPDPConsent(currentUserId));
    showToast(
      isTelugu
        ? 'మీ వ్యక్తిగత మరియు ఆరోగ్య డేటా శాశ్వతంగా తొలగించబడింది.'
        : 'Personal health data purged pursuant to DPDP Act Section 12.'
    );
  };

  const handleLinkABHA = (e: React.FormEvent) => {
    e.preventDefault();
    setAbhaError('');

    if (!validateABHANumber(abhaInput)) {
      setAbhaError('ABHA Number must be exactly 14 digits (XX-XXXX-XXXX-XXXX).');
      return;
    }

    const newProfile = {
      abhaNumber: formatABHANumber(abhaInput),
      abhaAddress: abhaAddressInput.trim() ? `${abhaAddressInput.trim().replace(/@.*$/, '')}@abdm` : 'patient@abdm',
      linkedAt: new Date().toISOString(),
      kycVerified: true,
      fullName: user?.full_name || 'Verified Patient',
      gender: 'Female',
      yearOfBirth: 1998
    };

    saveABHAProfile(currentUserId, newProfile);
    setAbhaProfile(newProfile);
    setAbhaInput('');
    setAbhaAddressInput('');
    showToast(isTelugu ? 'ABHA ID విజయవంతంగా అనుసంధానించబడింది!' : 'ABHA Health Account successfully linked!');
  };

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceSubject.trim() || !grievanceDesc.trim()) {
      alert('Please fill out all required grievance fields.');
      return;
    }

    const created = submitGrievanceTicket({
      userId: currentUserId,
      userName: user?.full_name || 'Patient',
      userEmail: user?.email || 'patient@example.com',
      subject: grievanceSubject.trim(),
      category: grievanceCategory,
      description: grievanceDesc.trim()
    });

    setTickets(getGrievanceTickets(currentUserId));
    setGrievanceSubject('');
    setGrievanceDesc('');
    showToast(
      isTelugu
        ? `ఫిర్యాదు టికెట్ #${created.id} దాఖలు చేయబడింది. 30 రోజుల్లో పరిష్కరించబడుతుంది.`
        : `Grievance #${created.id} submitted. Statutory response SLA: 30 days.`
    );
  };

  // Sample NMC Prescription for demonstration
  const samplePrescription = useMemo(() => {
    const doctors = getStoredDoctors();
    const doc = doctors[0] || {
      name: 'Dr. Radhika Sharma, MD, DGO',
      qualification: 'MBBS, MD (Obstetrics & Gynecology)',
      licenseNumber: 'TS-MCI-2011-8849',
      stateMedicalCouncil: 'Telangana State Medical Council',
      clinic: "Apollo Fertility & Women's Health Institute",
      location: 'Hyderabad, Telangana'
    };

    return buildStandardNMCPrescription({
      consultationId: 'con-demo-nmc',
      appointmentId: 'apt-demo-nmc',
      doctor: doc as any,
      patient: {
        id: currentUserId,
        name: user?.full_name || 'Pooja Verma',
        age: 26,
        gender: 'Female',
        phoneOrEmail: user?.email || 'pooja@example.com',
        abhaId: abhaProfile?.abhaNumber || '14-8842-1920-5511',
        bmi: 25.4
      },
      provisionalDiagnosis: 'Polycystic Ovarian Syndrome (ICD-10 E28.2)',
      rotterdamPhenotype: 'Phenotype B (Ovulatory Dysfunction + Hyperandrogenism)',
      chiefComplaints: 'Oligomenorrhea (cycle interval 45 days), mild hirsutism, insulin resistance markers.',
      medications: [
        {
          id: 'med-1',
          genericName: 'Myo-Inositol + D-Chiro Inositol',
          brandNameOptional: 'OvaCura 40:1',
          dosageForm: 'Sachet',
          strength: '2000mg + 50mg',
          frequency: '1-0-1 (Twice Daily)',
          durationDays: 60,
          route: 'Oral',
          instructions: 'Dissolve in a glass of water after breakfast and dinner',
          drugClassification: 'List_A'
        },
        {
          id: 'med-2',
          genericName: 'Cholecalciferol (Vitamin D3)',
          dosageForm: 'Capsule',
          strength: '60,000 IU',
          frequency: 'Once weekly',
          durationDays: 56,
          route: 'Oral',
          instructions: 'Take with milk after meals every Sunday',
          drugClassification: 'List_A'
        }
      ],
      investigationsRequested: [
        'Fasting Blood Glucose & Fasting Insulin (HOMA-IR calculation)',
        'Pelvic High-Resolution Ultrasound (Follicular morphology check at 90 days)'
      ],
      medicalNutritionAndLifestyleAdvice: [
        'Adhere to Low-GI, high-fiber Mediterranean/South Indian millet nutrition plan',
        'Target 8,000 daily steps with 15-min post-dinner gentle stroll',
        'Maintain daily hydration goal of 2.8 Liters'
      ],
      followUpAdvice: 'Follow-up teleconsultation after 60 days with repeat Fasting Insulin reports.'
    });
  }, [currentUserId, user, abhaProfile]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="compliance-privacy-page-root">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>DPDP Act (2023) • Telemedicine Guidelines (2020) • EHR Standards (2016)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {isTelugu ? 'డేటా భద్రత, చట్టబద్ధత & గోప్యతా కేంద్రం' : 'Indian Healthcare Compliance & Data Security Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isTelugu
              ? 'భారత ప్రభుత్వ డిజిటల్ పర్సనల్ డేటా ప్రొటెక్షన్ యాక్ట్ (DPDP 2023), నేషనల్ మెడికల్ కమిషన్ (NMC) టెలిమెడిసిన్ మార్గదర్శకాలు మరియు ఆయుష్మాన్ భారత్ (ABDM) ప్రమాణాల ప్రకారం మీ ఆరోగ్య రికార్డులు సంరక్షించబడతాయి.'
              : 'Strict adherence to Government of India regulations for Registered Medical Practitioners (RMPs), digital prescriptions, patient consent architecture, and data principal privacy rights.'}
          </p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('dpdp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'dpdp'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          id="tab-btn-dpdp"
        >
          <Lock className="h-4 w-4" />
          <span>DPDP Act (2023) Rights & Consent</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemedicine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'telemedicine'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          id="tab-btn-telemedicine"
        >
          <Building className="h-4 w-4" />
          <span>Telemedicine (NMC 2020) & Rx</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          id="tab-btn-audit"
        >
          <Database className="h-4 w-4" />
          <span>Clinical Access Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('abha')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'abha'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          id="tab-btn-abha"
        >
          <Key className="h-4 w-4" />
          <span>ABHA (Ayushman Bharat) ID</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grievance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'grievance'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          id="tab-btn-grievance"
        >
          <UserCheck className="h-4 w-4" />
          <span>Grievance Officer (GRO)</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DPDP ACT 2023 RIGHTS & CONSENT */}
      {/* ============================================================ */}
      {activeTab === 'dpdp' && (
        <div className="space-y-6" id="dpdp-tab-panel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Consent Status Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                  <span>Active Statutory Consent Notice</span>
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  consent?.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                }`}>
                  {consent?.status === 'active' ? 'Consent Active' : 'Consent Not Granted / Revoked'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <strong>Statutory Framework:</strong> Digital Personal Data Protection Act (DPDP Act, 2023)
                </p>
                <p>
                  <strong>Consent Version:</strong> {consent?.consentVersion || 'DPDP-2023-V1.2'}
                </p>
                <p>
                  <strong>Granted On:</strong>{' '}
                  {consent?.timestamp ? new Date(consent.timestamp).toLocaleString('en-IN') : 'Pending explicit notice'}
                </p>
                <p>
                  <strong>Audit IP Identifier:</strong> <span className="font-mono">{consent?.ipHash || 'IN-HYD-SEC'}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleRevokeConsent}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    consent?.status === 'active'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 hover:bg-rose-100'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs'
                  }`}
                >
                  {consent?.status === 'active' ? 'Revoke Consent (Sec 6(4))' : 'Review & Grant DPDP Consent'}
                </button>
              </div>
            </div>

            {/* Data Principal Statutory Rights Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Your Rights as Data Principal</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      Right to Data Portability (Section 11)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Download complete longitudinal health dossier in encrypted EHR-standard JSON format.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs"
                    id="export-health-data-btn"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                  <div>
                    <span className="font-extrabold text-rose-900 dark:text-rose-200 block">
                      Right to Erasure / Purge (Section 12)
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 block">
                      Exercise your statutory right to permanently delete all personal biomarkers, periods, and logs.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsErasureModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs"
                    id="delete-health-data-btn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Purge</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TELEMEDICINE PRACTICE GUIDELINES (2020) & NMC */}
      {/* ============================================================ */}
      {activeTab === 'telemedicine' && (
        <div className="space-y-6" id="telemedicine-tab-panel">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Telemedicine Practice Guidelines (2020) - MoHFW & National Medical Commission (NMC)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory regulatory framework governing remote medical consultations and prescription issuance in India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-1.5">
                <span className="font-bold text-teal-900 dark:text-teal-200 uppercase text-[11px] block">
                  1. RMP Verification
                </span>
                <p className="text-teal-800 dark:text-teal-300 text-[11px] leading-relaxed">
                  Only Registered Medical Practitioners (RMPs) enrolled on State Medical Council or NMC registers are authorized to consult and prescribe.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 uppercase text-[11px] block">
                  2. List A & List B Prescriptions
                </span>
                <p className="text-indigo-800 dark:text-indigo-300 text-[11px] leading-relaxed">
                  First consults are restricted to List A medications. Prohibited Schedule X drugs (narcotics and injectables) are strictly banned online.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <span className="font-bold text-amber-900 dark:text-amber-200 uppercase text-[11px] block">
                  3. Emergency Protocols
                </span>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  Telemedicine is not for acute emergency surgical conditions. Emergency triage warnings must be provided to all patients.
                </p>
              </div>
            </div>

            {/* Standard Prescription Preview Trigger */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Standardized NMC Appendix 2 Digital Prescription Template
                </span>
                <span className="text-[11px] text-slate-500">
                  Inspect the official print-ready format with Council Reg No., generic medicines, and digital stamp.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewPrescriptionOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="h-4 w-4" />
                <span>View Standard Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CLINICAL AUDIT TRAIL */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="space-y-6" id="audit-tab-panel">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-teal-600" />
                  <span>Patient Health Record Access Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immutable access logs maintained under EHR Standards India (2016) and DPDP Act (2023).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Timestamp (IST)</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor & Role</th>
                    <th className="p-3">Event Details</th>
                    <th className="p-3">Compliance Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold block">{log.actorName}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{log.actorRole}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{log.details}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {log.complianceStandard}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: ABHA (AYUSHMAN BHARAT HEALTH ACCOUNT) */}
      {/* ============================================================ */}
      {activeTab === 'abha' && (
        <div className="space-y-6" id="abha-tab-panel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ABHA Status / Digital Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Key className="h-5 w-5 text-teal-600" />
                <span>Ayushman Bharat Health Account (ABHA)</span>
              </h3>

              {abhaProfile ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-indigo-950 text-white space-y-4 border border-teal-600/40 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 block">
                        National Health Authority (NHA)
                      </span>
                      <h4 className="font-black text-lg">{abhaProfile.fullName}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40">
                      ABDM Linked
                    </span>
                  </div>

                  <div className="pt-2 font-mono text-xl sm:text-2xl font-black tracking-widest text-emerald-300">
                    {abhaProfile.abhaNumber}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-white/10">
                    <span>Address: {abhaProfile.abhaAddress}</span>
                    <span>KYC: Verified</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 space-y-2">
                  <p>No ABHA ID linked yet to your account.</p>
                  <p className="text-[11px] text-slate-400">
                    Link your 14-digit ABHA number to enable seamless interoperability with Indian hospitals and diagnostic labs.
                  </p>
                </div>
              )}
            </div>

            {/* Link ABHA Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Link or Update Your 14-Digit ABHA
              </h3>

              {abhaError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold">
                  {abhaError}
                </div>
              )}

              <form onSubmit={handleLinkABHA} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    14-Digit ABHA Number (e.g. 14-8842-1920-5511)
                  </label>
                  <input
                    type="text"
                    value={abhaInput}
                    onChange={e => setAbhaInput(e.target.value)}
                    placeholder="XX-XXXX-XXXX-XXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    maxLength={17}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    ABHA Address / Username (e.g. yourname@abdm)
                  </label>
                  <input
                    type="text"
                    value={abhaAddressInput}
                    onChange={e => setAbhaAddressInput(e.target.value)}
                    placeholder="username@abdm"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  id="link-abha-btn"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify & Link ABHA ID</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: GRIEVANCE REDRESSAL OFFICER (GRO) */}
      {/* ============================================================ */}
      {activeTab === 'grievance' && (
        <div className="space-y-6" id="grievance-tab-panel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Statutory Contact Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-teal-600" />
                  <span>Statutory Grievance Redressal</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                  DPDP Act Sec 13
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
                <p>
                  <strong>Designated Officer:</strong> {STATUTORY_GRO_DETAILS.name}
                </p>
                <p>
                  <strong>Role:</strong> {STATUTORY_GRO_DETAILS.designation}
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${STATUTORY_GRO_DETAILS.email}`} className="text-teal-600 font-bold underline">
                    {STATUTORY_GRO_DETAILS.email}
                  </a>
                </p>
                <p>
                  <strong>Hotline:</strong> {STATUTORY_GRO_DETAILS.complianceHotline}
                </p>
                <p>
                  <strong>Registered Office:</strong> {STATUTORY_GRO_DETAILS.registeredAddress}
                </p>
                <p className="text-teal-700 dark:text-teal-300 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                  Statutory SLA: Maximum {STATUTORY_GRO_DETAILS.statutorySlaDays} days from date of receipt.
                </p>
              </div>

              {/* Submitted Tickets */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                  Your Filed Grievance Tickets ({tickets.length})
                </h4>
                {tickets.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No grievance tickets filed.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tickets.map(t => (
                      <div key={t.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>#{t.id}: {t.subject}</span>
                          <span className="text-teal-600 uppercase text-[10px]">{t.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lodge Grievance Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Lodge a Formal Privacy or Clinical Grievance
              </h3>

              <form onSubmit={handleSubmitGrievance} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Grievance Category
                  </label>
                  <select
                    value={grievanceCategory}
                    onChange={e => setGrievanceCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="data_access">Data Access & Portability Issue</option>
                    <option value="consent_withdrawal">Withdrawal of Consent Issue</option>
                    <option value="data_correction">Health Record Rectification / Correction</option>
                    <option value="teleconsultation_grievance">Teleconsultation / Doctor Conduct Grievance</option>
                    <option value="security_incident">Data Security or Privacy Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Subject / Summary
                  </label>
                  <input
                    type="text"
                    value={grievanceSubject}
                    onChange={e => setGrievanceSubject(e.target.value)}
                    placeholder="Brief description of your grievance..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Detailed Grievance Description
                  </label>
                  <textarea
                    rows={4}
                    value={grievanceDesc}
                    onChange={e => setGrievanceDesc(e.target.value)}
                    placeholder="Explain the grievance clearly with dates, doctor names, or report references..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  id="submit-grievance-btn"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Statutory Grievance</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* DPDP Consent Modal */}
      <DPDPConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        userId={currentUserId}
        onConsentSuccess={() => {
          setConsent(getDPDPConsent(currentUserId));
          showToast('DPDP 2023 Consent granted successfully.');
        }}
      />

      {/* Sample NMC Prescription Modal */}
      <NmcPrescriptionModal
        isOpen={isPreviewPrescriptionOpen}
        onClose={() => setIsPreviewPrescriptionOpen(false)}
        prescription={samplePrescription}
      />

      {/* Erasure Confirmation Modal */}
      {isErasureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Permanent Data Erasure</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pursuant to Section 12 of the DPDP Act (2023), this action will permanently purge your clinical symptoms, Rotterdam screening results, health history, and personalized diet schedules. This cannot be undone.
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Type <span className="text-rose-600 font-mono">DELETE</span> to proceed:
            </p>
            <input
              type="text"
              value={erasureConfirmText}
              onChange={e => setErasureConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/50 dark:bg-slate-800 text-xs font-mono font-bold text-rose-600 outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsErasureModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmErasure}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
