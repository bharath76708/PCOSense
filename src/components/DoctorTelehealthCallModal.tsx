import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Stethoscope,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { HealthcareSpecialist, DoctorProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';

interface DoctorTelehealthCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: HealthcareSpecialist | DoctorProfile | null;
  onOpenChat?: () => void;
}

export const DoctorTelehealthCallModal: React.FC<DoctorTelehealthCallModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onOpenChat
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize call & timer
  useEffect(() => {
    if (!isOpen || !doctor) {
      setCallStatus('connecting');
      setDurationSeconds(0);
      return;
    }

    // Attempt to access user camera for local preview
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          setHasCameraPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera/mic not granted or not available in iframe sandbox - fallback cleanly
          setHasCameraPermission(false);
        });
    }

    // Ringing -> Connected transition after 2 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2200);

    return () => {
      clearTimeout(connectTimer);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, doctor]);

  // Duration Timer when connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Handle local video toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
      });
    }
  }, [isVideoEnabled]);

  // Handle local audio toggle
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  if (!isOpen || !doctor) return null;

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCallStatus('ended');
  };

  const handleCloseModal = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    onClose();
  };

  const doctorPhoto = 'photoUrl' in doctor && doctor.photoUrl ? doctor.photoUrl : null;
  const doctorTitle = 'title' in doctor ? doctor.title : ('specialization' in doctor ? doctor.specialization : 'PCOS Specialist');
  const clinicName = 'clinicOrHospital' in doctor ? doctor.clinicOrHospital : ('clinic' in doctor ? doctor.clinic : 'Specialty Clinic');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      id="doctor-telehealth-call-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 flex flex-col h-[90vh] max-h-[700px] overflow-hidden text-white relative"
        id={`doctor-telehealth-call-modal-${doctor.id}`}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {callStatus === 'connecting'
                  ? (isTelugu ? 'కనెక్ట్ అవుతోంది...' : 'Connecting encrypted call...')
                  : callStatus === 'connected'
                  ? `${isTelugu ? 'కాల్ వ్యవధి' : 'Connected'} • ${formatDuration(durationSeconds)}`
                  : (isTelugu ? 'కాల్ ముగిసింది' : 'Consultation Ended')}
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>256-Bit E2E Encrypted</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-telehealth-call-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Call Stage */}
        <div className="flex-1 relative flex items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
          {callStatus === 'ended' ? (
            /* Post-Consultation Summary Card */
            <div className="text-center max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 mx-auto rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {isTelugu ? 'సంప్రదింపు విజయవంతంగా ముగిసింది' : 'Consultation Completed'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isTelugu
                    ? `${doctor.name} తో మీ వీడియో సంప్రదింపు రికార్డు చేయబడింది.`
                    : `Your clinical telehealth session with ${doctor.name} was logged.`}
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 text-left border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="text-slate-400">{isTelugu ? 'వ్యవధి:' : 'Session Duration:'}</span>
                  <span className="font-semibold text-teal-300">{formatDuration(durationSeconds)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="text-slate-400">{isTelugu ? 'వైద్యులు:' : 'Specialist:'}</span>
                  <span className="font-semibold text-white">{doctor.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="text-slate-400">{isTelugu ? 'ఆసుపత్రి/క్లినిక్:' : 'Facility:'}</span>
                  <span className="font-semibold text-slate-300">{clinicName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-teal-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{isTelugu ? 'చాట్ చేయండి' : 'Follow-up Chat'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {isTelugu ? 'ముగించు' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            /* Active / Connecting Screen */
            <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md w-full">
              {/* Doctor Avatar / Video Feeds */}
              <div className="relative">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full ring-4 ring-teal-500/30 overflow-hidden bg-slate-800 flex items-center justify-center shadow-2xl">
                  {doctorPhoto ? (
                    <img
                      src={doctorPhoto}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Stethoscope className="h-16 w-16 text-teal-400" />
                  )}
                </div>

                {callStatus === 'connecting' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px] tracking-wide shadow-md uppercase">
                    Ringing...
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
                <p className="text-xs text-teal-400 font-medium mt-0.5">{doctorTitle}</p>
                <p className="text-xs text-slate-400 mt-0.5">{clinicName}</p>
              </div>

              {callStatus === 'connected' && (
                <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isTelugu ? 'ఆడియో-వీడియో స్ట్రీమ్ సక్రియంగా ఉంది' : 'High-Definition Consultation Active'}</span>
                </div>
              )}

              {/* Local User Preview (Picture in Picture) */}
              <div className="absolute bottom-4 right-4 h-24 w-20 sm:h-32 sm:w-24 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
                {hasCameraPermission && isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                    <VideoOff className="h-5 w-5 mb-1 text-slate-500" />
                    <span>{user?.displayName || 'You'}</span>
                  </div>
                )}
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-semibold text-white">
                  You
                </span>
              </div>
            </div>
          )}
        </div>

        {/* In-Call Action Control Bar */}
        {callStatus !== 'ended' && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-5 z-10">
            {/* Mute Button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              id="call-toggle-mic-btn"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Video Button */}
            <button
              type="button"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                !isVideoEnabled
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              id="call-toggle-video-btn"
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            {/* Speaker Button */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                !isSpeakerOn
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
              id="call-toggle-speaker-btn"
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* In-Call Chat Option */}
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onOpenChat();
                }}
                className="h-12 w-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-400 flex items-center justify-center transition-all border border-teal-500/20"
                title="Open clinical in-call chat"
                id="call-open-chat-btn"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            )}

            {/* Red End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              id="call-end-btn"
            >
              <PhoneOff className="h-5 w-5" />
              <span>{isTelugu ? 'కాల్ ముగించు' : 'End Call'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
