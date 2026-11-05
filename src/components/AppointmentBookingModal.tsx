import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  Building,
  Star,
  ShieldCheck,
  FileText,
  Lock,
  Loader2,
  Award,
  AlertTriangle,
  Zap,
  MessageSquare,
  AlertCircle,
  Video,
  PhoneCall
} from 'lucide-react';
import { DoctorProfile, AppointmentRecord } from '../types';
import { bookAppointment } from '../services/appointmentService';
import { getLatestHealthReport, authorizeReportSharing } from '../services/healthReportService';
import { logAuditEvent, getABHAProfile } from '../services/complianceService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { canUserAccessFeature, getUserSubscription } from '../services/subscriptionService';
import { SubscriptionPaymentModal } from './SubscriptionPaymentModal';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile | null;
  onBookingSuccess?: (appointment: AppointmentRecord) => void;
  onStartChat?: (doctor: DoctorProfile) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onBookingSuccess,
  onStartChat
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const [userSub, setUserSub] = useState(() => getUserSubscription(user?.id || 'usr_patient_sample'));
  const accessCheck = canUserAccessFeature(user?.id || 'usr_patient_sample', 'doctor_consultations');

  const refreshSub = () => {
    setUserSub(getUserSubscription(user?.id || 'usr_patient_sample'));
  };

  useEffect(() => {
    if (isOpen) {
      refreshSub();
    }
  }, [isOpen, user?.id]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(() => doctor?.availability.slots[0] || '10:00 AM - 10:30 AM');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [shareReport, setShareReport] = useState<boolean>(true);
  const [telemedConsent, setTelemedConsent] = useState<boolean>(true);
  const [abhaId, setAbhaId] = useState<string>(() => {
    const profile = getABHAProfile(user?.id || 'guest-user');
    return profile?.abhaNumber || '';
  });
  const [consultationMode, setConsultationMode] = useState<'app_call' | 'app_chat'>('app_call');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay / PhonePe)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookedAppointment, setBookedAppointment] = useState<AppointmentRecord | null>(null);

  if (!isOpen || !doctor) return null;

  // Doctors cannot book consultations for themselves
  const isDoctorUser = user?.role === 'doctor';
  if (isDoctorUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        id="booking-modal-backdrop"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isTelugu ? 'వైద్యుల ఖాతా పరిమితి' : 'Doctor Portal Restriction'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isTelugu
              ? 'వైద్యులు ఇతర వైద్యుల వద్ద సంప్రదింపులను బుక్ చేయలేరు. ఈ విభాగం రోగుల కోసం మాత్రమే రూపొందించబడింది.'
              : 'Consultation bookings are reserved for patients only. Doctors manage received appointments from their Doctor Dashboard.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            {isTelugu ? 'మూసివేయి' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const latestReport = user ? getLatestHealthReport(user.id) : null;

  const handleBook = () => {
    if (!accessCheck.allowed) {
      setIsSubModalOpen(true);
      return;
    }

    if (!telemedConsent) {
      alert(
        isTelugu
          ? 'దయచేసి టెలిమెడిసిన్ మరియు DPDP చట్ట నిబంధనలకు అంగీకరించండి.'
          : 'Please accept the statutory Telemedicine Practice Guidelines and DPDP Act consent to proceed.'
      );
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      let sharedReportId: string | undefined = undefined;
      if (shareReport && latestReport) {
        authorizeReportSharing(latestReport.id, doctor.id);
        sharedReportId = latestReport.id;
      }

      const appointment = bookAppointment({
        userId: user?.id || 'guest-user',
        userName: user?.full_name || 'Patient',
        userEmail: user?.email || 'patient@example.com',
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        doctorPhoto: doctor.photoUrl,
        clinic: doctor.clinic,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        amount: doctor.consultationFee,
        notes: patientNotes,
        paymentMethod,
        hasSharedHealthReport: shareReport && !!latestReport,
        sharedHealthReportId: sharedReportId
      });

      // Clinical Audit Trail log
      logAuditEvent({
        action: 'TELECONSULT_INITIATED',
        actorId: user?.id || 'guest-user',
        actorRole: 'patient',
        actorName: user?.full_name || 'Patient',
        targetRecordId: appointment.id,
        patientId: user?.id || 'guest-user',
        details: `Telemedicine appointment booked with RMP ${doctor.name} (${doctor.licenseNumber}) for ${selectedDate} ${selectedSlot}. Consent recorded.`,
        complianceStandard: 'TELEMEDICINE_GUIDELINES_2020'
      });

      setIsProcessing(false);
      setBookedAppointment(appointment);
      if (onBookingSuccess) onBookingSuccess(appointment);
    }, 900);
  };

  const handleResetAndClose = () => {
    setBookedAppointment(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      id="booking-modal-backdrop"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        id="appointment-booking-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isTelugu ? 'వైద్యుని అపాయింట్‌మెంట్ బుకింగ్' : 'Book Clinical Consultation'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu ? 'ధృవీకరించబడిన నిపుణుల సంప్రదింపు' : 'Direct booking with verified specialist'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
            id="close-booking-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm">
          {bookedAppointment ? (
            /* Success State */
            <div className="text-center py-6 space-y-4" id="booking-success-view">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {isTelugu ? 'అపాయింట్‌మెంట్ ధృవీకరించబడింది!' : 'Consultation Confirmed!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {isTelugu ? 'బుకింగ్ వివరాలు క్రింద ఇవ్వబడ్డాయి:' : 'Your appointment has been registered successfully.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isTelugu ? 'బుకింగ్ ఐడీ:' : 'Booking ID:'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{bookedAppointment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isTelugu ? 'వైద్యులు:' : 'Specialist:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{bookedAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isTelugu ? 'తేదీ & సమయం:' : 'Schedule:'}</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {bookedAppointment.appointmentDate} at {bookedAppointment.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isTelugu ? 'కన్సల్టేషన్ విధానం:' : 'Consultation Mode:'}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {consultationMode === 'app_call' ? '📞 App Call (Online Video/Audio)' : '💬 App Chat (Online Messaging)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isTelugu ? 'ఫీజు చెల్లింపు:' : 'Fee Paid:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{bookedAppointment.amount} ({bookedAppointment.paymentStatus.toUpperCase()})
                  </span>
                </div>
                {bookedAppointment.hasSharedHealthReport && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isTelugu ? 'ఆరోగ్య నివేదిక డాక్టర్‌తో షేర్ చేయబడింది' : 'Clinical Health Report shared by user'}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                {onStartChat && (
                  <button
                    type="button"
                    onClick={() => {
                      const docToChat = doctor;
                      handleResetAndClose();
                      onStartChat(docToChat);
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    id="start-chat-after-booking-btn"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{isTelugu ? 'డాక్టర్‌తో చాట్ ప్రారంభించండి' : 'Start In-App Chat Now'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                  id="finish-booking-btn"
                >
                  {isTelugu ? 'పూర్తయింది' : 'Done & Return'}
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <>
              {/* Doctor Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-teal-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{doctor.name}</h4>
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-bold shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {doctor.rating}
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate">{doctor.specialization}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                    <span>In-App Consultation Only (No Travel or Clinic Visit Required)</span>
                  </p>
                  
                  {/* Indian Regulatory Council & RMP Badge */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      <span>RMP Verified</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {doctor.licenseNumber}
                    </span>
                    <span className="text-slate-500 truncate">
                      {doctor.stateMedicalCouncil || 'State Medical Council'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 sm:self-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    {isTelugu ? 'ఫీజు' : 'Fee'}
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">₹{doctor.consultationFee}</p>
                </div>
              </div>

              {/* Consultation Option (App-Based Only: 📞 App Call | 💬 App Chat) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-teal-500" />
                    <span>{isTelugu ? 'కన్సల్టేషన్ విధానం (యాప్ ద్వారా మాత్రమే)' : 'Consultation Option (App-Based Only)'}</span>
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    100% In-App
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationMode('app_call')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      consultationMode === 'app_call'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                    id="booking-mode-app-call"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📞</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">App Call</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {isTelugu ? 'ప్రత్యక్ష వీడియో & ఆడియో సంభాషణ' : 'Live video/audio consultation in-app'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationMode('app_chat')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      consultationMode === 'app_chat'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                    id="booking-mode-app-chat"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💬</span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">App Chat</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {isTelugu ? 'ప్రత్యక్ష చాట్ & డాక్టర్ సమాధానం' : 'Direct physician chat messaging in-app'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-500" />
                  {isTelugu ? 'సంప్రదింపు తేదీని ఎంచుకోండి' : 'Select Consultation Date'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  id="appointment-date-input"
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-500" />
                  {isTelugu ? 'లభ్యత సమయాన్ని ఎంచుకోండి' : 'Select Time Slot'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.availability.slots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                        selectedSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* ABHA ID Input (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{isTelugu ? 'ABHA హెల్త్ ఐడీ (ఐచ్ఛికం)' : 'ABHA Health ID (Optional)'}</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">ABDM India</span>
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={e => setAbhaId(e.target.value)}
                  placeholder="14-digit ABHA (e.g. 14-8842-1920-5511)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Symptoms / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {isTelugu ? 'వైద్యునికి మీ ఆరోగ్య సమస్యలు / సందేహాలు' : 'Notes / Symptoms for Specialist (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={e => setPatientNotes(e.target.value)}
                  placeholder={isTelugu ? 'ఉదా. నెలసరి ఆలస్యం, అల్ట్రాసౌండ్ స్క్రీనింగ్ సమీక్ష మొదలైనవి...' : 'e.g., Irregular cycles, pelvic ultrasound review, fasting glucose check...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  id="patient-notes-input"
                />
              </div>

              {/* Explicit Health Report Sharing Consent Checkbox */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-share-report-checkbox"
                  checked={shareReport}
                  onChange={e => setShareReport(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <label htmlFor="consent-share-report-checkbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-bold block text-slate-900 dark:text-white">
                    {isTelugu ? 'నా PCOS ఆరోగ్య నివేదికను వైద్యుడితో షేర్ చేయండి' : 'Share my clinical health assessment with this doctor'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {isTelugu
                      ? 'డాక్టర్ మీ స్క్రీనింగ్ మార్కర్లను సమీక్షించి ఖచ్చితమైన సలహాలు ఇవ్వడానికి సహాయపడుతుంది.'
                      : 'Allows the doctor to review your metabolic markers and screening pattern before your consultation.'}
                  </span>
                </label>
              </div>

              {/* Statutory Telemedicine Guidelines (2020) & DPDP (2023) Consent */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-telemed-checkbox"
                  checked={telemedConsent}
                  onChange={e => setTelemedConsent(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <label htmlFor="consent-telemed-checkbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-bold block text-slate-900 dark:text-white">
                    {isTelugu
                      ? 'టెలిమెడిసిన్ ప్రాక్టీస్ గైడ్‌లైన్స్ (2020) & DPDP చట్టం (2023) సమ్మతి'
                      : 'Telemedicine Practice Guidelines (2020) & DPDP Act (2023) Consent'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-snug">
                    {isTelugu
                      ? 'నేను డాక్టర్తో టెలికన్సల్టేషన్ కోసం సమ్మతిస్తున్నాను. అత్యవసర లేదా తీవ్రమైన సమస్యలకు ఆన్‌లైన్ సంప్రదింపు సరిపోదని మరియు సమీప ఆసుపత్రిని సంప్రదించాలని నేను అర్థం చేసుకున్నాను.'
                      : 'I consent to teleconsultation with this Registered Medical Practitioner under MoHFW / NMC Guidelines. I understand that telemedicine does not replace emergency medical triage in case of acute symptoms.'}
                  </span>
                </label>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-teal-500" />
                  {isTelugu ? 'చెల్లింపు పద్ధతి' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {['UPI (Google Pay / PhonePe)', 'Credit / Debit Card', 'Net Banking'].map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        paymentMethod === pm
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isTelugu ? 'కన్సల్టేషన్ ఫీజు:' : 'Specialist Fee:'}</span>
                  <span>₹{doctor.consultationFee}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isTelugu ? 'ప్లాట్‌ఫారమ్ సురక్షిత సర్వీస్ ఛార్జీ:' : 'Platform Service Fee:'}</span>
                  <span className="text-emerald-600 font-semibold">{isTelugu ? 'ఉచితం' : 'Free (Waived)'}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <span>{isTelugu ? 'మొత్తం చెల్లించవలసినది:' : 'Total Payable:'}</span>
                  <span>₹{doctor.consultationFee}</span>
                </div>
              </div>

              {/* Subscription Notice for Doctor Booking */}
              {!accessCheck.allowed && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        {userSub?.isBlocked ? '3-Day Trial Expired (Access Blocked)' : 'Subscription Upgrade Required'}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        {accessCheck.reason || 'Doctor consultations and chats require either an active 3-Day Trial (₹1) or the ₹200/Month Complete Plan.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{userSub?.isBlocked ? 'Reactivate Access with ₹1 Trial or Plan' : 'Subscribe to ₹200 Complete Plan'}</span>
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleBook}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  !accessCheck.allowed
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                }`}
                id="pay-and-confirm-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isTelugu ? 'ధృవీకరిస్తోంది...' : 'Processing Secure Booking...'}</span>
                  </>
                ) : !accessCheck.allowed ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Subscribe to Unlock Booking (₹1 or ₹200)</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>
                      {isTelugu ? `₹${doctor.consultationFee} చెల్లించి బుక్ చేయండి` : `Pay ₹${doctor.consultationFee} & Confirm Consultation`}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionPaymentModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        userEmail={user?.email}
        userName={user?.full_name}
        userId={user?.id || 'usr_patient_sample'}
        onSuccess={() => refreshSub()}
        initialSelectedPlan={userSub?.isBlocked ? 'trial_1' : 'plan_200'}
      />
    </div>
  );
};
