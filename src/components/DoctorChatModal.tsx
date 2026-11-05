import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Clock,
  User,
  Stethoscope,
  Info,
  ChevronRight
} from 'lucide-react';
import { HealthcareSpecialist, DoctorProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import {
  ChatMessage,
  PatientConversation,
  getOrCreatePatientConversation,
  sendPatientMessage
} from '../services/doctorChatService';

interface DoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: HealthcareSpecialist | DoctorProfile | null;
  onInitiateCall?: () => void;
}

export const DoctorChatModal: React.FC<DoctorChatModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onInitiateCall
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();
  const [conversation, setConversation] = useState<PatientConversation | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const patientName = user?.displayName || user?.email?.split('@')[0] || 'Patient';
  const patientId = user?.uid || user?.id || 'usr_patient_sample';
  const patientEmail = user?.email || 'patient@pcosense.com';

  const refreshChat = () => {
    if (!isOpen || !doctor) return;
    const conv = getOrCreatePatientConversation(
      doctor.id,
      doctor.name,
      patientId,
      patientName,
      patientEmail
    );
    setConversation({ ...conv });
  };

  useEffect(() => {
    if (isOpen && doctor) {
      refreshChat();
    }
  }, [isOpen, doctor?.id, patientId, patientName, patientEmail]);

  // Synchronize when the doctor replies from their dashboard
  useEffect(() => {
    if (!isOpen || !doctor) return;

    const interval = setInterval(() => {
      refreshChat();
    }, 2000);

    const handleStorageChange = () => {
      refreshChat();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isOpen, doctor?.id, patientId, patientName, patientEmail]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  if (!isOpen || !doctor) return null;

  const handleSendMessage = (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || !conversation) return;

    setInputText('');
    const { updatedConv } = sendPatientMessage(
      conversation.id,
      message,
      patientName
    );

    if (updatedConv) {
      setConversation({ ...updatedConv });
    }
  };

  const quickQuestions = isTelugu ? [
    'మయో-ఇనోసిటాల్ ఎలా వేసుకోవాలి?',
    'పీరియడ్స్ ఆలస్యమయ్యాయి, ఏమి చేయాలి?',
    'నా అల్ట్రాసౌండ్ రిపోర్ట్ చెక్ చేయగలరా?',
    'ఆహార నియమాలు మరియు వ్యాయామ సలహాలు'
  ] : [
    'How should I take Myo-Inositol sachet?',
    'Experiencing pelvic cramps after cycle, is this normal?',
    'Can you review my ultrasound scan report?',
    'Need low-GI diet guidance for insulin resistance'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      id="doctor-chat-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] max-h-[720px] overflow-hidden"
        id={`doctor-chat-modal-${doctor.id}`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-lg overflow-hidden">
                {'photoUrl' in doctor && doctor.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Stethoscope className="h-6 w-6" />
                )}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                title="Online Specialist"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {doctor.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                  <ShieldCheck className="h-3 w-3" />
                  {isTelugu ? 'ధృవీకరించబడింది' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {'title' in doctor ? doctor.title : ('specialization' in doctor ? doctor.specialization : 'PCOS Clinician')}
                {' • '}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {isTelugu ? 'ఆన్‌లైన్‌లో అందుబాటులో ఉంది' : 'Active In-App Chat'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onInitiateCall && (
              <button
                type="button"
                onClick={onInitiateCall}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 transition-colors"
                id="switch-to-call-from-chat"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'కాల్ ప్రారంభించండి' : 'Switch to Call'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Chat"
              id="close-doctor-chat-modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Clinical Advisory Banner */}
        <div className="px-4 py-2 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-200/50 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>
              {isTelugu
                ? 'డాక్టర్ ప్రత్యక్ష సందేశం: మీ వైద్యులు స్వయంగా డాక్టర్ పోర్టల్ నుండి ప్రత్యుత్తరం ఇస్తారు. ఎటువంటి ఆటోమేటిక్ రిప్లైలు ఉండవు.'
                : 'Direct Physician Messaging: Only your doctor replies directly from their clinical portal. No automated bots or auto-replies.'}
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            ABHA / DISHA Compliant
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
          {conversation?.messages.map((msg) => {
            const isPatient = msg.senderRole === 'patient';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isPatient ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isPatient && (
                  <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0 mt-0.5">
                    {'Dr'}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2.5 shadow-2xs ${
                    isPatient
                      ? 'bg-teal-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isPatient ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isPatient && <CheckCheck className="h-3 w-3 text-teal-200 ml-0.5" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            {isTelugu ? 'త్వరిత ప్రశ్నలు:' : 'Quick Qs:'}
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isTelugu
                  ? `${doctor.name} కి మీ ప్రశ్నను ఇక్కడ రాయండి...`
                  : `Type your message to ${doctor.name}...`
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              id="patient-chat-input"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
              id="send-patient-chat-btn"
            >
              <span>{isTelugu ? 'పంపు' : 'Send'}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
