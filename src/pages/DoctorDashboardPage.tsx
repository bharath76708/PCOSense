import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building,
  Star,
  Lock,
  ChevronRight,
  TrendingUp,
  Eye,
  Edit3,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  Award,
  Printer,
  AlertTriangle,
  MessageSquare,
  MessageCircle,
  User,
  LayoutDashboard,
  Percent,
  Check
} from 'lucide-react';
import {
  AppointmentRecord,
  ConsultationRecord,
  HealthReportRecord,
  DoctorProfile,
  NMCPrescription,
  PrescriptionMedicine
} from '../types';
import {
  getStoredAppointments,
  getStoredConsultations,
  completeConsultation,
  getDoctorEarnings,
  updateAppointmentStatus
} from '../services/appointmentService';
import { getDoctorById, getStoredDoctors } from '../services/doctorService';
import { getDoctorSharedReports } from '../services/healthReportService';
import {
  buildStandardNMCPrescription,
  checkMedicineTelemedicineLegality
} from '../services/complianceService';
import {
  getStoredConversations,
  sendDoctorMessage,
  markConversationAsRead,
  PatientConversation
} from '../services/doctorChatService';
import { HealthReportModal } from '../components/HealthReportModal';
import { NmcPrescriptionModal } from '../components/NmcPrescriptionModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const currentDoctorId = 'doc-radhika-sharma'; // Default active doctor profile
  // ONLY 5 pages/tabs as requested:
  // 1. Doctor Dashboard
  // 2. Patient Appointments
  // 3. Patient History
  // 4. Patient Chats
  // 5. Commission and Amount
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'history' | 'chats' | 'commission'>('dashboard');

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => getStoredAppointments());
  const [conversations, setConversations] = useState<PatientConversation[]>(() => getStoredConversations(currentDoctorId));
  const [activeChatConvId, setActiveChatConvId] = useState<string>('conv-jahnavi');
  const [chatReplyText, setChatReplyText] = useState<string>('');

  // Sync conversations dynamically when patient messages arrive
  React.useEffect(() => {
    const syncChats = () => {
      setConversations(getStoredConversations(currentDoctorId));
    };

    const interval = setInterval(syncChats, 2500);
    window.addEventListener('storage', syncChats);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncChats);
    };
  }, [currentDoctorId]);

  const [selectedReport, setSelectedReport] = useState<HealthReportRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // NMC Prescription Modal View
  const [viewingPrescription, setViewingPrescription] = useState<NMCPrescription | null>(null);
  const [isNmcModalOpen, setIsNmcModalOpen] = useState<boolean>(false);

  // Consultation completion state
  const [activeConsultationApt, setActiveConsultationApt] = useState<AppointmentRecord | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [icdCode, setIcdCode] = useState<string>('E28.2 (Polycystic Ovarian Syndrome - Rotterdam Phenotype B)');
  const [investigationsInput, setInvestigationsInput] = useState<string>('Pelvic Ultrasound (TVUS) in 90 days, Fasting Insulin + Fasting Glucose (HOMA-IR), Serum Ferritin & Vitamin D3 (25-OH)');
  const [recommendationsInput, setRecommendationsInput] = useState<string>('');
  const [followUpPeriod, setFollowUpPeriod] = useState<string>('90 days / 3 months post next cycle');
  const [successToast, setSuccessToast] = useState<string>('');

  // Structured Medicines for NMC compliance
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      genericName: 'Myo-Inositol + D-Chiro Inositol (40:1 ratio)',
      dosageForm: 'Tablet',
      strength: '2000mg + 50mg',
      frequency: 'Twice daily',
      duration: '90 days',
      instructions: 'Take 1 tablet after breakfast and 1 tablet after dinner with water',
      telemedicineList: 'List A'
    },
    {
      genericName: 'Cholecalciferol (Vitamin D3)',
      dosageForm: 'Capsule',
      strength: '60,000 IU',
      frequency: 'Once weekly',
      duration: '8 weeks',
      instructions: 'Take once weekly after breakfast with milk',
      telemedicineList: 'List A'
    }
  ]);

  // Temporary new medicine row
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedForm, setNewMedForm] = useState<string>('Tablet');
  const [newMedStrength, setNewMedStrength] = useState<string>('500mg');
  const [newMedFreq, setNewMedFreq] = useState<string>('Once daily');
  const [newMedDuration, setNewMedDuration] = useState<string>('30 days');
  const [newMedInstructions, setNewMedInstructions] = useState<string>('Take after meal');
  const [medLegalityWarning, setMedLegalityWarning] = useState<string | null>(null);

  const doctorProfile = useMemo(() => {
    return getDoctorById(currentDoctorId) || {
      id: currentDoctorId,
      name: 'Dr. Radhika Sharma, MD, DGO',
      specialization: 'Gynecologist & PCOS Specialist',
      clinic: "Apollo Fertility & Women's Health Institute",
      qualification: 'MBBS, MD (Obstetrics & Gynecology)',
      licenseNumber: 'TS-MCI-2011-8849',
      stateMedicalCouncil: 'Telangana State Medical Council',
      registrationYear: 2011,
      consultationFee: 900,
      verificationStatus: 'verified',
      rating: 4.9
    } as DoctorProfile;
  }, [currentDoctorId]);

  const doctorAppointments = useMemo(() => {
    return appointments.filter(a => a.doctorId === currentDoctorId || (Boolean(a.doctorId) && a.doctorId.includes('radhika')));
  }, [appointments, currentDoctorId]);

  const earningsStats = useMemo(() => {
    return getDoctorEarnings(currentDoctorId);
  }, [currentDoctorId, appointments]);

  const sharedReports = useMemo(() => {
    return getDoctorSharedReports(currentDoctorId);
  }, [currentDoctorId]);

  const consultationsList = useMemo(() => {
    return getStoredConsultations().filter(c => c.doctorId === currentDoctorId || (Boolean(c.doctorId) && c.doctorId.includes('radhika')));
  }, [currentDoctorId]);

  const currentSelectedChat = useMemo(() => {
    return conversations.find(c => c.id === activeChatConvId) || conversations[0];
  }, [conversations, activeChatConvId]);

  const handleOpenConsultation = (apt: AppointmentRecord) => {
    setActiveConsultationApt(apt);
    setClinicalNotes(
      apt.notes
        ? `Patient clinical note: ${apt.notes}\nClinical Impression: Pelvic examination & symptom review confirms Rotterdam Phenotype B PCOS with cycle irregularity and mild hirsutism.`
        : 'Clinical Impression: Pelvic symptom review confirms Rotterdam Phenotype B PCOS with cycle irregularity.'
    );
    setRecommendationsInput('1. Maintain low-GI anti-inflammatory nutrition with cruciferous greens\n2. 30-40 minutes daily aerobic or resistance exercise\n3. Consistent circadian sleep hygiene (7-8 hours)');
    setMedLegalityWarning(null);
  };

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;

    const legality = checkMedicineTelemedicineLegality(newMedName.trim());
    if (legality.isProhibited) {
      setMedLegalityWarning(legality.warningNote || 'Prohibited under Telemedicine Practice Guidelines (2020).');
      return;
    }

    setMedLegalityWarning(null);
    setMedicines(prev => [
      ...prev,
      {
        genericName: newMedName.trim(),
        dosageForm: newMedForm,
        strength: newMedStrength.trim(),
        frequency: newMedFreq,
        duration: newMedDuration.trim(),
        instructions: newMedInstructions.trim(),
        telemedicineList: legality.classification
      }
    ]);

    setNewMedName('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinishConsultation = () => {
    if (!activeConsultationApt) return;

    try {
      const recs = recommendationsInput
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const investigations = investigationsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Generate official NMC Standard Prescription (Telemedicine Practice Guidelines 2020)
      const officialRx = buildStandardNMCPrescription({
        consultationId: `cons-${Date.now()}`,
        appointmentId: activeConsultationApt.id,
        doctor: doctorProfile,
        patient: {
          id: activeConsultationApt.userId,
          name: activeConsultationApt.userName,
          age: 25,
          gender: 'Female',
          abhaId: activeConsultationApt.abhaId
        },
        chiefComplaints: activeConsultationApt.notes || 'Irregular menstrual cycles, weight fluctuations, follicular cystic morphology',
        provisionalDiagnosis: icdCode,
        medications: medicines,
        investigationsRequested: investigations,
        medicalNutritionAndLifestyleAdvice: recs,
        followUpAdvice: followUpPeriod
      });

      const summaryRxText = medicines
        .map((m, i) => `${i + 1}. [${m.dosageForm}] ${m.genericName} (${m.strength}) - ${m.frequency} for ${m.duration} (${m.instructions})`)
        .join('\n');

      completeConsultation({
        appointmentId: activeConsultationApt.id,
        clinicalNotes,
        prescription: summaryRxText,
        nmcPrescription: officialRx,
        recommendations: recs
      });

      setAppointments(getStoredAppointments());
      setActiveConsultationApt(null);
      setSuccessToast('Official NMC Telemedicine Prescription issued successfully and sent to patient portal.');
      setTimeout(() => setSuccessToast(''), 6000);
    } catch (err: any) {
      alert('Error finalizing consultation: ' + (err.message || err));
    }
  };

  const handleViewPrescriptionForAppointment = (apt: AppointmentRecord) => {
    const consultations = getStoredConsultations();
    const c = consultations.find(item => item.appointmentId === apt.id);
    if (c && c.nmcPrescription) {
      setViewingPrescription(c.nmcPrescription);
      setIsNmcModalOpen(true);
    } else {
      alert('Official prescription not found for this completed appointment.');
    }
  };

  const handleViewReport = (report: HealthReportRecord) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !activeChatConvId) return;

    const updated = sendDoctorMessage(activeChatConvId, chatReplyText, doctorProfile.name);
    if (updated) {
      setConversations(getStoredConversations(currentDoctorId));
      setChatReplyText('');
    }
  };

  const handleSelectConversation = (convId: string) => {
    setActiveChatConvId(convId);
    markConversationAsRead(convId);
    setConversations(getStoredConversations(currentDoctorId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="doctor-dashboard-root">
      
      {/* Doctor Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>NMC Registered Medical Practitioner (RMP)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
              State Council Verified
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {doctorProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90">
            {doctorProfile.specialization} • {doctorProfile.clinic}
          </p>
          <p className="text-[11px] text-teal-200/70 font-mono">
            Reg: {doctorProfile.licenseNumber} ({doctorProfile.stateMedicalCouncil})
          </p>
        </div>

        {/* Doctor Financial & Fee Pill */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 shrink-0">
          <div>
            <span className="text-[11px] text-slate-300 uppercase font-semibold block">{isTelugu ? 'కన్సల్టేషన్ ఫీజు' : 'Consult Fee'}</span>
            <span className="text-lg font-bold text-white">₹{doctorProfile.consultationFee}</span>
          </div>
          <div className="border-l border-white/20 pl-6">
            <span className="text-[11px] text-slate-300 uppercase font-semibold block">{isTelugu ? 'డాక్టర్ వాటా (80%)' : 'Net Payout (80%)'}</span>
            <span className="text-lg font-bold text-emerald-300">₹{Math.round((doctorProfile.consultationFee * 80) / 100)}</span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Strict 5 Navigation Tabs (No Slide Bars / Sliders) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { key: 'dashboard', label: isTelugu ? 'డాక్టర్ డాష్‌బోర్డ్' : 'Doctor Dashboard', icon: LayoutDashboard },
          { key: 'appointments', label: isTelugu ? 'రోగి అపాయింట్‌మెంట్లు' : 'Patient Appointments', icon: Calendar, badge: doctorAppointments.filter(a => a.status === 'confirmed').length },
          { key: 'history', label: isTelugu ? 'రోగుల చరిత్ర & నివేదికలు' : 'Patient History', icon: FileText, badge: sharedReports.length },
          { key: 'chats', label: isTelugu ? 'రోగుల చాట్‌లు' : 'Patient Chats', icon: MessageSquare, badge: conversations.reduce((acc, c) => acc + c.unreadCountForDoctor, 0) },
          { key: 'commission', label: isTelugu ? 'కమీషన్ & మొత్తం' : 'Commission & Amount', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
              }`}
              id={`doctor-tab-${tab.key}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-teal-900' : 'bg-teal-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: DOCTOR DASHBOARD (OVERVIEW & QUICK ACTIONS - NO SLIDERS)          */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" id="doctor-overview-page">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Upcoming Consults</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {doctorAppointments.filter(a => a.status === 'confirmed').length}
              </p>
              <span className="text-[11px] text-teal-600 font-medium">Ready for NMC Teleconsultation</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Completed Consultations</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {earningsStats.totalConsultations}
              </p>
              <span className="text-[11px] text-slate-400">Appendix 2 Rx Issued</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Patient Chats</span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {conversations.length}
              </p>
              <span className="text-[11px] text-slate-400">Direct clinical inquiries</span>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                Doctor Net Payout (80%)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                ₹{earningsStats.netDoctorEarnings}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Direct bank settlement</span>
            </div>
          </div>

          {/* Quick Action Clinical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Quick Card 1: Today's Consultation Queue */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Consultation Queue</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                  {doctorAppointments.filter(a => a.status === 'confirmed').length} Pending
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                View scheduled patients, review chief complaints and start statutory teleconsultations with standardized NMC Appendix 2 digital prescriptions.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Patient Appointments</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Card 2: Patient History & Clinical Reports */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>Patient Medical History</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  {sharedReports.length} Reports
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Inspect pelvic ultrasound reports, blood tests (LH/FSH, AMH, HOMA-IR), Rotterdam phenotypes, and past consultation dossiers shared by patients.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>View Patient History</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Card 3: Patient Chats */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Patient Direct Chats</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {conversations.length} Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Answer patient dosage questions, provide lifestyle clarification, and review lab updates directly without requiring an extra visit.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('chats')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Open Patient Chats</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* RMP Statutory Notice */}
          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Telemedicine Practice Guidelines (2020) Protocol Compliant
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Every consultation issues Appendix 2 standard e-prescriptions with State Medical Council registration stamps.
                </span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              RMP Status: Verified Active
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: PATIENT APPOINTMENTS ("patent oppintment")                         */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-6" id="doctor-appointments-page">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <span>{isTelugu ? 'రోగి అపాయింట్‌మెంట్లు' : 'Patient Appointments Schedule'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled consultations, chief complaints, and Telemedicine 2020 prescription issuance.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              {doctorAppointments.length} Total
            </span>
          </div>

          <div className="space-y-4">
            {doctorAppointments.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                {isTelugu ? 'షెడ్యూల్ చేయబడిన అపాయింట్‌మెంట్లు లేవు.' : 'No appointments currently scheduled.'}
              </div>
            ) : (
              doctorAppointments.map(apt => {
                const isCompleted = apt.status === 'completed';

                return (
                  <div
                    key={apt.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    id={`apt-card-${apt.id}`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{apt.userName}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                          }`}
                        >
                          {apt.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Fee: ₹{apt.amount} (80% Doctor Payout: ₹{Math.round((apt.amount * 80) / 100)})
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {apt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {apt.timeSlot}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Escrow Status: Paid ({apt.paymentMethod})
                        </span>
                      </p>

                      {apt.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl mt-1">
                          <strong>Chief Complaint:</strong> {apt.notes}
                        </p>
                      )}

                      {apt.hasSharedHealthReport && (
                        <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold pt-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Authorized Health Dossier Shared by Patient</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {!isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleOpenConsultation(apt)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-xs transition-all"
                          id={`start-consultation-btn-${apt.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>{isTelugu ? 'కన్సల్టేషన్ & ప్రిస్క్రిప్షన్' : 'Start Consult & Issue NMC Rx'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleViewPrescriptionForAppointment(apt)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 shadow-xs"
                          id={`view-prescription-btn-${apt.id}`}
                        >
                          <Award className="h-4 w-4 text-emerald-600" />
                          <span>View Issued NMC Rx</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveChatConvId('conv-jahnavi');
                          setActiveTab('chats');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: PATIENT HISTORY ("patenties history")                              */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6" id="doctor-patient-history-page">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <span>{isTelugu ? 'రోగుల వైద్య చరిత్ర & నివేదికలు' : 'Patient Clinical History & Dossiers'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified patient health records, Rotterdam phenotypic scores, ultrasound assessments, and past consultation history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sharedReports.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 md:col-span-2">
                No patient reports uploaded yet.
              </div>
            ) : (
              sharedReports.map(rep => (
                <div
                  key={rep.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Shared by user
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Generated: {new Date(rep.generatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{rep.userName}</h3>
                    <p className="text-xs text-slate-500">{rep.userEmail}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phenotype / Risk:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {rep.screeningSummary.riskLevel} ({rep.screeningSummary.probabilityPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vitals (BMI & BP):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rep.measurements.bmi} kg/m² • {rep.measurements.bloodPressure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Menstrual Cycle Interval:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rep.measurements.cycleLengthDays} Days (Irregular)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewReport(rep)}
                    className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Review Full Clinical Dossier</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Past Completed Consultations Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Previous Consultation Records ({consultationsList.length})
            </h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {consultationsList.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{c.patientName}</span>
                    <span className="text-slate-500">
                      Date: {new Date(c.completedAt).toLocaleDateString()} • ICD: {c.nmcPrescription?.provisionalDiagnosis || 'E28.2'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (c.nmcPrescription) {
                        setViewingPrescription(c.nmcPrescription);
                        setIsNmcModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-teal-50 hover:text-teal-700 text-xs"
                  >
                    View Issued Rx
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: PATIENT CHATS ("patent chats")                                    */}
      {/* ========================================================================= */}
      {activeTab === 'chats' && (
        <div className="space-y-4" id="doctor-patient-chats-page">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                <span>{isTelugu ? 'రోగుల సంప్రదింపు చాట్‌లు' : 'Patient Clinical Chats'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct 1-on-1 messaging for prescription dosage clarifications, symptom updates, and lifestyle guidance.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {conversations.length} Active Conversations
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
            
            {/* Conversations List (Left Side) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-2 overflow-y-auto max-h-[620px]">
              <div className="text-[11px] font-bold text-slate-400 uppercase px-2 mb-2">Patients Queue</div>
              {conversations.map(conv => {
                const isSelected = conv.id === activeChatConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-xs'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-teal-800 text-teal-200 flex items-center justify-center font-bold text-xs">
                          {conv.patientName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">{conv.patientName}</span>
                          <span className="text-[10px] text-slate-400">{conv.patientAge} Yrs</span>
                        </div>
                      </div>
                      {conv.unreadCountForDoctor > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-extrabold text-[10px]">
                          {conv.unreadCountForDoctor} new
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-2">
                      {conv.lastMessage}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Active Chat Conversation Area (Right Side) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between overflow-hidden shadow-xs">
              
              {/* Active Patient Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    {currentSelectedChat.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{currentSelectedChat.patientName}</span>
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                        Patient Verified
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      {currentSelectedChat.patientPhenotype}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    ● Encrypted Clinical Session
                  </span>
                </div>
              </div>

              {/* Messages History */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 max-h-[420px] bg-slate-50/20 dark:bg-slate-900/40">
                {currentSelectedChat.messages.map(msg => {
                  const isDoctor = msg.senderRole === 'doctor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                          isDoctor
                            ? 'bg-teal-700 text-white rounded-br-xs shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                          <span className="font-bold">{msg.senderName}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Clinical Advice Templates (Telugu & English) */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-bold shrink-0">
                  {isTelugu ? 'త్వరిత సలహాలు:' : 'Quick Templates:'}
                </span>
                {[
                  { en: 'Please take Myo-Inositol twice daily after food.', te: 'మయో-ఇనోసిటాల్ టాబ్లెట్లను ఉదయం టిఫిన్ తర్వాత తీసుకోండి.' },
                  { en: 'Please upload your recent fasting blood test report.', te: 'దయచేసి మీ తాజా ఫాస్టింగ్ బ్లడ్ టెస్ట్ రిపోర్టును అప్‌లోడ్ చేయండి.' },
                  { en: 'Practice 30 mins gentle yoga or walking to lower cortisol.', te: 'సాయంత్రం కార్టిసాల్ తగ్గించడానికి 30 నిమిషాలు నడక లేదా యోగా సాధన చేయండి.' },
                  { en: 'Continue prescribed low-GI diet plan without skipping meals.', te: 'ఆహార ప్రణాళికను క్రమం తప్పకుండా పాటిస్తూ తగినంత నీరు తాగండి.' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChatReplyText(isTelugu ? item.te : item.en)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 whitespace-nowrap cursor-pointer text-xs"
                    title={isTelugu ? item.te : item.en}
                  >
                    {(isTelugu ? item.te : item.en).slice(0, 36)}...
                  </button>
                ))}
              </div>

              {/* Reply Form Input with Full Unicode Telugu & English Support */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={chatReplyText}
                  onChange={(e) => setChatReplyText(e.target.value)}
                  placeholder={isTelugu ? 'రోగికి వైద్య సలహా లేదా సమాధానం టైప్ చేయండి (తెలుగు / English)...' : 'Type medical instruction or answer to patient in English or తెలుగు...'}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  dir="auto"
                />
                <button
                  type="submit"
                  disabled={!chatReplyText.trim()}
                  className="px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{isTelugu ? 'పంపండి' : 'Send'}</span>
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: COMMISSION & AMOUNT ("commision and amout")                       */}
      {/* ========================================================================= */}
      {activeTab === 'commission' && (
        <div className="space-y-6" id="doctor-commission-amount-page">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
              <span>{isTelugu ? 'డాక్టర్ కమీషన్ & సంపాదన మొత్తం' : 'Doctor Commission & Payout Statements'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Statutory 80% Doctor Net Payouts and 20% Platform Commission settlements under Section 31 CGST Act.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Gross Billings</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{earningsStats.grossBillings}</p>
              <span className="text-[11px] text-slate-400">From {earningsStats.totalConsultations} completed consultations</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <Percent className="h-3.5 w-3.5" />
                Platform Commission (20%)
              </span>
              <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">₹{earningsStats.platformCommissionDeducted}</p>
              <span className="text-[11px] text-slate-400">Retained for clinical platform operations</span>
            </div>

            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 uppercase font-semibold">
                Net Doctor Amount (80%)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">₹{earningsStats.netDoctorEarnings}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Deposited to registered account</span>
            </div>
          </div>

          {/* Doctor Registered Settlement Account Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-4 w-4 text-teal-600" />
              <span>Doctor Registered Bank Account for Direct Payouts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Beneficiary Name</span>
                <p className="font-bold text-slate-900 dark:text-white">{doctorProfile.name}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Account & IFSC</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white">**** 4910 (HDFC0001844)</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-semibold">Settlement Frequency</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">Daily IMPS Auto-Credit (T+1)</p>
              </div>
            </div>
          </div>

          {/* Itemized Settlements Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Itemized Consultations & Commission Ledger
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 font-bold grid grid-cols-12 gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="col-span-3">Patient</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-2">Gross Fee</span>
                <span className="col-span-2 text-teal-600">Platform Cut (20%)</span>
                <span className="col-span-3 text-emerald-600">Doctor Net (80%)</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {consultationsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No consultation payouts recorded yet.</div>
                ) : (
                  consultationsList.map(c => (
                    <div key={c.id} className="p-3 grid grid-cols-12 gap-2 items-center text-slate-800 dark:text-slate-200">
                      <span className="col-span-3 font-bold">{c.patientName}</span>
                      <span className="col-span-2 text-slate-400">{new Date(c.completedAt).toLocaleDateString()}</span>
                      <span className="col-span-2 font-mono">₹{c.amount}</span>
                      <span className="col-span-2 text-teal-600 font-mono">-₹{c.commissionAmount}</span>
                      <span className="col-span-3 text-emerald-600 font-bold font-mono">
                        +₹{c.doctorAmount} (Settled)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Active Consultation Modal - NMC Telemedicine Compliant */}
      {activeConsultationApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'NMC టెలిమెడిసిన్ కన్సల్టేషన్ & ప్రిస్క్రిప్షన్' : 'NMC Statutory Telemedicine Consultation & Rx'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                    Appendix 2 Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <strong className="text-slate-700 dark:text-slate-300">{activeConsultationApt.userName}</strong> | RMP: {doctorProfile.name} ({doctorProfile.licenseNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveConsultationApt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Financial Commission Preview Box */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1">
              <div className="flex justify-between">
                <span>Gross Consultation Fee:</span>
                <span className="font-bold">₹{activeConsultationApt.amount}</span>
              </div>
              <div className="flex justify-between text-teal-700 dark:text-teal-300">
                <span>Platform Commission (20%):</span>
                <span className="font-bold">-₹{Math.round((activeConsultationApt.amount * 20) / 100)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-teal-200 dark:border-teal-800 text-emerald-700 dark:text-emerald-300">
                <span>Net Doctor Payout (80%):</span>
                <span>₹{activeConsultationApt.amount - Math.round((activeConsultationApt.amount * 20) / 100)}</span>
              </div>
            </div>

            {/* Provisional Diagnosis / ICD-10 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                <span>Provisional Diagnosis / ICD-10</span>
                <span className="text-[10px] text-teal-600 font-semibold">WHO ICD-10 Standard</span>
              </label>
              <input
                type="text"
                value={icdCode}
                onChange={e => setIcdCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Clinical Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Clinical Findings & Examination Impression
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={e => setClinicalNotes(e.target.value)}
                placeholder="Pelvic ultrasound observations, menstrual history, phenotypic symptoms..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Structured Generic Medicines (NMC Guideline Appendix 2) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-teal-600" />
                  <span>Prescribed Generic Medicines (Telemedicine List A / B)</span>
                </label>
                <span className="text-[10px] text-slate-500">NMC Mandate: Write in Generic Names</span>
              </div>

              {/* Medicine Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 font-bold grid grid-cols-12 gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                  <span className="col-span-4">Generic Name</span>
                  <span className="col-span-2">Strength</span>
                  <span className="col-span-2">Frequency</span>
                  <span className="col-span-3">Instructions</span>
                  <span className="col-span-1 text-center">Del</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center text-slate-800 dark:text-slate-200">
                      <div className="col-span-4">
                        <span className="font-bold block">{m.genericName}</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                          {m.dosageForm} • {m.telemedicineList}
                        </span>
                      </div>
                      <span className="col-span-2 font-mono text-[11px]">{m.strength}</span>
                      <span className="col-span-2 text-[11px]">{m.frequency} ({m.duration})</span>
                      <span className="col-span-3 text-[11px] text-slate-600 dark:text-slate-400">{m.instructions}</span>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Medicine Form Row */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  + Add Generic Medication:
                </div>
                
                {medLegalityWarning && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{medLegalityWarning}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Generic Name"
                    value={newMedName}
                    onChange={e => setNewMedName(e.target.value)}
                    className="sm:col-span-2 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Strength (e.g. 500mg)"
                    value={newMedStrength}
                    onChange={e => setNewMedStrength(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={newMedFreq}
                    onChange={e => setNewMedFreq(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={newMedDuration}
                    onChange={e => setNewMedDuration(e.target.value)}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="p-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Diagnostic Investigations Requested */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Diagnostic Investigations Requested (Comma Separated)
              </label>
              <input
                type="text"
                value={investigationsInput}
                onChange={e => setInvestigationsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Medical Nutrition & Lifestyle Advice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Medical Nutrition & Lifestyle Advice (One per line)
              </label>
              <textarea
                rows={3}
                value={recommendationsInput}
                onChange={e => setRecommendationsInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveConsultationApt(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinishConsultation}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                id="submit-consultation-btn"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Complete & Issue Official NMC Rx</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Report Modal view */}
      <HealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={selectedReport}
      />

      {/* Official NMC Telemedicine Prescription Modal */}
      <NmcPrescriptionModal
        isOpen={isNmcModalOpen}
        onClose={() => setIsNmcModalOpen(false)}
        prescription={viewingPrescription}
      />
    </div>
  );
};
