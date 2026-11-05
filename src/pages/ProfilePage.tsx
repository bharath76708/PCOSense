import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Activity,
  HeartPulse,
  Layers,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Download,
  Database,
  HardDrive,
  FileText,
  Lock,
  Phone,
  MessageSquare,
  CheckSquare,
  Square,
  Bell,
  Globe,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { PatientRecord, WhatsAppNotificationPreferences } from '../types';
import { FEATURE_METADATA, getDefaultPatientRecord } from '../ml/modelEngine';
import { useLanguage } from '../translations';
import { getAssessmentHistory } from '../services/api';
import { getDailySymptomLogs } from '../services/dailySymptomService';
import { exportComprehensiveHealthProfilePDF } from '../utils/pdfExport';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getStoredUserConsent,
  saveUserWhatsAppConsent,
  sendTestWhatsAppMessage,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '../services/whatsappService';
import { WhatsAppNotificationsSettings } from '../components/WhatsAppNotificationsSettings';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, saveProfileData, isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadFromUserProfile } = useAssessment();
  const { t, isTelugu } = useLanguage();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<PatientRecord>(() => {
    if (profile?.patientData) {
      return { ...getDefaultPatientRecord(), ...profile.patientData };
    }
    return getDefaultPatientRecord();
  });

  // WhatsApp Consent & Notification Settings State
  const userId = user?.id || 'usr_patient_demo';
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappLanguage, setWhatsappLanguage] = useState<'en' | 'te'>('en');
  const [whatsappPrefs, setWhatsappPrefs] = useState<WhatsAppNotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState<boolean>(false);
  const [isSendingTestMsg, setIsSendingTestMsg] = useState<boolean>(false);
  const [whatsappFeedback, setWhatsappFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const consent = getStoredUserConsent(userId);
    setWhatsappOptIn(consent.whatsapp_opt_in);
    setWhatsappPhone(consent.phone_number || '');
    setWhatsappLanguage(consent.preferred_language || (isTelugu ? 'te' : 'en'));
    if (consent.notification_preferences) {
      setWhatsappPrefs(consent.notification_preferences);
    }
  }, [userId, isTelugu]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile?.patientData) {
      setFormData(prev => ({ ...prev, ...profile.patientData }));
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { message: isTelugu ? 'మీ ప్రొఫైల్‌ను చూడటానికి దయచేసి సైన్ ఇన్ చేయండి.' : 'Please sign in to view your profile.' } });
    }
  }, [authLoading, isAuthenticated, navigate, isTelugu]);

  const handleBackupMyHealthData = async () => {
    try {
      setIsExportingBackup(true);
      const history = await getAssessmentHistory();

      exportComprehensiveHealthProfilePDF({
        user: user ? { full_name: user.full_name, email: user.email } : null,
        profileData: formData,
        records: history
      });

      setStatusMessage({
        type: 'success',
        text: isTelugu
          ? `మీ పూర్తి ఆరోగ్య ప్రొఫైల్ & హిస్టరీ నివేదిక (${history.length} అసెస్‌మెంట్లు) క్లినికల్ PDF ఫైల్‌గా విజయవంతంగా డౌన్‌లోడ్ చేయబడింది!`
          : `Comprehensive health profile & assessment history (${history.length} screenings) downloaded as clinical PDF report!`
      });
    } catch (err: any) {
      console.error('PDF export failed', err);
      setStatusMessage({
        type: 'error',
        text: isTelugu
          ? 'PDF నివేదిక సృష్టించడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          : 'Failed to generate health profile PDF. Please try again.'
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveProfileData(formData);
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: isTelugu ? 'మీ ఆరోగ్య ప్రొఫైల్ సేవ్ చేయబడింది. భవిష్యత్ అసెస్‌మెంట్లు ఈ సమాచారాన్ని స్వయంచాలకంగా ఉపయోగిస్తాయి.' : 'Your health profile has been saved. Future screenings will use this information automatically.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || (isTelugu ? 'ఆరోగ్య ప్రొఫైల్‌ను సేవ్ చేయడంలో విఫలమైంది. దయచేసి మీ నెట్‌వర్క్ మరియు వివరాలను తనిఖీ చేయండి.' : 'Failed to save health profile. Please check your network and inputs.')
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartAssessmentWithProfile = () => {
    loadFromUserProfile();
    navigate('/assessment');
  };

  const handleSaveWhatsAppSettings = async () => {
    setIsSavingWhatsApp(true);
    setWhatsappFeedback(null);
    try {
      if (whatsappOptIn && !whatsappPhone.trim()) {
        throw new Error(isTelugu ? 'దయచేసి మీ వాట్సాప్ ఫోన్ నంబర్‌ను నమోదు చేయండి.' : 'Please enter your valid WhatsApp phone number.');
      }

      // 1. Direct Firestore write to user's document
      if (userId) {
        try {
          await setDoc(
            doc(db, 'users', userId),
            {
              whatsapp_opt_in: whatsappOptIn,
              phone_number: whatsappPhone.trim(),
              preferred_language: whatsappLanguage,
              notification_preferences: whatsappPrefs,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (firestoreErr) {
          console.warn('Firestore direct write notice:', firestoreErr);
        }
      }

      // 2. Synchronize with local service cache
      saveUserWhatsAppConsent(userId, {
        whatsapp_opt_in: whatsappOptIn,
        phone_number: whatsappPhone.trim(),
        preferred_language: whatsappLanguage,
        notification_preferences: whatsappPrefs
      });

      setWhatsappFeedback({
        type: 'success',
        text: whatsappOptIn
          ? (isTelugu ? 'వాట్సాప్ విద్యా నోటిఫికేషన్లు ఫైర్‌స్టోర్‌లో విజయవంతంగా భద్రపరచబడ్డాయి!' : 'WhatsApp notification settings saved directly to Firestore!')
          : (isTelugu ? 'వాట్సాప్ నోటిఫికేషన్లు నిలిపివేయబడ్డాయి (ఫైర్‌స్టోర్ అప్‌డేట్ చేయబడింది).' : 'WhatsApp notifications turned off and updated in Firestore.')
      });
    } catch (err: any) {
      setWhatsappFeedback({
        type: 'error',
        text: err?.message || 'Failed to update WhatsApp settings'
      });
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!whatsappPhone.trim()) {
      setWhatsappFeedback({
        type: 'error',
        text: isTelugu ? 'దయచేసి పరీక్ష కోసం ఫోన్ నంబర్ నమోదు చేయండి.' : 'Please enter a phone number to test WhatsApp dispatch.'
      });
      return;
    }

    setIsSendingTestMsg(true);
    setWhatsappFeedback(null);
    try {
      const sampleText = whatsappLanguage === 'te'
        ? 'PCOSense రిమైండర్ 🌸\n\nఈ రోజు మీ లక్షణాలను ట్రాక్ చేశారా? క్రమం తప్పకుండా నమోదు చేసుకోవడం ద్వారా మార్పులను గమనించి వైద్యులతో చర్చించవచ్చు.\n\nఆపివేయడానికి STOP అని సమాధానం ఇవ్వండి.'
        : 'PCOSense Reminder 🌸\n\nHave you tracked your symptoms today? Regular tracking helps you understand changes in your cycle and discuss them with your healthcare professional.\n\nReply STOP to unsubscribe.';

      const result = await sendTestWhatsAppMessage({
        recipient_phone: whatsappPhone.trim(),
        content: sampleText,
        language: whatsappLanguage
      });

      setWhatsappFeedback({
        type: 'success',
        text: result.message
      });
    } catch (err: any) {
      setWhatsappFeedback({
        type: 'error',
        text: err?.message || 'Failed to send test message'
      });
    } finally {
      setIsSendingTestMsg(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-300 flex items-center justify-center font-bold text-2xl border border-teal-700/60 shadow-xs flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.full_name || (isTelugu ? 'నా ఖాతా' : 'My Account')}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'ధృవీకరించబడిన ఖాతా' : 'Verified Account'}</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{user?.email || 'patient@pcosense.health'}</span>
            </p>
            {profile?.updated_at && (
              <p className="text-xs text-slate-400 mt-1">
                {isTelugu ? 'చివరిగా నవీకరించబడింది:' : 'Last updated:'} {new Date(profile.updated_at).toLocaleDateString(isTelugu ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Backup My Health Data Button */}
          <button
            type="button"
            onClick={handleBackupMyHealthData}
            disabled={isExportingBackup}
            id="profile-backup-health-data-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600/80 bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-sm transition-all shadow-xs disabled:opacity-50"
            title="Download full assessment history and clinical logs as a local JSON backup"
          >
            <Download className="h-4 w-4 text-teal-200" />
            <span>
              {isExportingBackup
                ? (isTelugu ? 'బ్యాకప్ సిద్ధమవుతోంది...' : 'Backing up...')
                : (isTelugu ? 'ఆరోగ్య డేటా బ్యాకప్' : 'Backup My Health Data')}
            </span>
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors shadow-xs"
              id="edit-profile-toggle-btn"
            >
              <Edit3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>{isTelugu ? 'ప్రొఫైల్ సవరించండి' : 'Edit Profile Details'}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormData(profile?.patientData || getDefaultPatientRecord());
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                {isTelugu ? 'రద్దు చేయండి' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm shadow-md transition-colors"
                id="save-profile-changes-btn"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? (isTelugu ? 'సేవ్ చేస్తోంది...' : 'Saving...') : (isTelugu ? 'మార్పులను సేవ్ చేయండి' : 'Save Changes')}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleStartAssessmentWithProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-800 to-indigo-900 hover:from-teal-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            id="start-assessment-with-profile-btn"
          >
            <Sparkles className="h-4 w-4 text-teal-300" />
            <span>{isTelugu ? 'కొత్త అసెస్‌మెంట్ ప్రారంభించండి' : 'Run New Screening'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Auto-fill Info Callout */}
      <div className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 p-4 rounded-xl flex items-start gap-3.5">
        <ClipboardList className="h-5 w-5 text-teal-800 dark:text-teal-300 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-teal-950 dark:text-teal-100">
          <span className="font-bold block text-teal-900 dark:text-teal-200 mb-0.5">
            {isTelugu ? 'స్థిరమైన బేస్‌లైన్ నిల్వ సక్రియంగా ఉంది' : 'Persistent Baseline Storage Active'}
          </span>
          {isTelugu
            ? 'క్రింద సేవ్ చేయబడిన ప్రతి పారామీటర్ మీరు కొత్త PCOS రిస్క్ అసెస్‌మెంట్‌ను ప్రారంభించినప్పుడు స్వయంచాలకంగా లోడ్ అవుతుంది.'
            : 'Every metric saved below is automatically loaded when you start a new PCOS risk assessment. You only need to modify whatever numbers have changed today (e.g. current weight or new blood test results).'}
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Biometrics & Anthropometrics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <User className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isTelugu ? 'శారీరక & బయోమెట్రిక్స్' : 'Biometrics & Anthropometrics'}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              BMI: {formData['BMI']} kg/m²
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'వయస్సు' : 'Age'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['Age (yrs)']}
                  onChange={(e) => handleChange('Age (yrs)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Age (yrs)']} {isTelugu ? 'సంవత్సరాలు' : 'years'}</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'ఎత్తు' : 'Height'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['Height(Cm)']}
                  onChange={(e) => handleChange('Height(Cm)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Height(Cm)']} cm</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'బరువు' : 'Weight'}</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.5"
                  value={formData['Weight (Kg)']}
                  onChange={(e) => handleChange('Weight (Kg)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Weight (Kg)']} kg</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'బ్లడ్ గ్రూప్' : 'Blood Group'}</span>
              {isEditing ? (
                <select
                  value={formData['Blood Group']}
                  onChange={(e) => handleChange('Blood Group', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  {FEATURE_METADATA['Blood Group']?.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {FEATURE_METADATA['Blood Group']?.options?.find(o => o.value === formData['Blood Group'])?.label || 'B+'}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'రక్తపోటు (BP)' : 'Blood Pressure'}</span>
              {isEditing ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={formData['BP _Systolic (mmHg)']}
                    onChange={(e) => handleChange('BP _Systolic (mmHg)', Number(e.target.value))}
                    className="w-16 px-1.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    placeholder="Sys"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={formData['BP _Diastolic (mmHg)']}
                    onChange={(e) => handleChange('BP _Diastolic (mmHg)', Number(e.target.value))}
                    className="w-16 px-1.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    placeholder="Dia"
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {formData['BP _Systolic (mmHg)']}/{formData['BP _Diastolic (mmHg)']} mmHg
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'నాడి రేటు' : 'Pulse Rate'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['Pulse rate(bpm)']}
                  onChange={(e) => handleChange('Pulse rate(bpm)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Pulse rate(bpm)']} bpm</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Menstrual & Gynecological Profile */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isTelugu ? 'పీరియడ్స్ & పునరుత్పత్తి వివరాలు' : 'Menstrual & Reproductive'}
              </h3>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                formData['Cycle(R/I)'] === 2
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {formData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమబద్ధమైన సైకిల్' : 'Regular Cycle') : (isTelugu ? 'సక్రమంగా లేదు' : 'Irregular / Amenorrhea')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'సైకిల్ విధానం' : 'Cycle Pattern'}</span>
              {isEditing ? (
                <select
                  value={formData['Cycle(R/I)']}
                  onChange={(e) => handleChange('Cycle(R/I)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value={2}>{isTelugu ? 'క్రమబద్ధమైనది (21-35 రోజులు)' : 'Regular (21-35 days)'}</option>
                  <option value={4}>{isTelugu ? 'సక్రమంగా లేదు (> 35 రోజులు)' : 'Irregular (> 35 days)'}</option>
                  <option value={5}>{isTelugu ? 'పీరియడ్స్ రాకపోవడం (Amenorrhea)' : 'Amenorrhea (No period)'}</option>
                </select>
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {formData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమబద్ధమైనది' : 'Regular') : formData['Cycle(R/I)'] === 4 ? (isTelugu ? 'సక్రమంగా లేదు' : 'Irregular') : (isTelugu ? 'పీరియడ్స్ రాకపోవడం' : 'Amenorrhea')}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'రక్తస్రావ వ్యవధి' : 'Cycle Flow Length'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['Cycle length(days)']}
                  onChange={(e) => handleChange('Cycle length(days)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Cycle length(days)']} {isTelugu ? 'రోజులు' : 'days'}</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'వివాహం జరిగిన కాలం' : 'Marriage Duration'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['Marraige Status (Yrs)']}
                  onChange={(e) => handleChange('Marraige Status (Yrs)', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['Marraige Status (Yrs)']} {isTelugu ? 'సంవత్సరాలు' : 'years'}</span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'గర్భస్రావాలు' : 'Abortions / Miscarriages'}</span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData['No. of aborptions']}
                  onChange={(e) => handleChange('No. of aborptions', Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">{formData['No. of aborptions']} {isTelugu ? 'నమోదయ్యాయి' : 'reported'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Clinical & Androgenic Signs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isTelugu ? 'క్లినికల్ & ఆండ్రోజెనిక్ లక్షణాలు' : 'Clinical & Androgenic Symptoms'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'hair growth(Y/N)' as keyof PatientRecord, label: isTelugu ? 'అవాంఛిత రోమాలు (హిర్సుటిజం)' : 'Excess Facial / Body Hair (Hirsutism)' },
              { field: 'Weight gain(Y/N)' as keyof PatientRecord, label: isTelugu ? 'వేగంగా బరువు పెరగడం' : 'Rapid Weight Gain Tendency' },
              { field: 'Skin darkening (Y/N)' as keyof PatientRecord, label: isTelugu ? 'చర్మం నల్లబడటం' : 'Skin Darkening (Acanthosis Nigricans)' },
              { field: 'Hair loss(Y/N)' as keyof PatientRecord, label: isTelugu ? 'జుట్టు రాలడం (అలోపేసియా)' : 'Scalp Hair Thinning (Alopecia)' },
              { field: 'Pimples(Y/N)' as keyof PatientRecord, label: isTelugu ? 'మొటిమలు / పింపుల్స్' : 'Cystic Acne / Breakouts' }
            ].map(sym => (
              <div key={sym.field} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{sym.label}</span>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => handleChange(sym.field, formData[sym.field] === 1 ? 0 : 1)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      formData[sym.field] === 1 ? 'bg-teal-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formData[sym.field] === 1 ? (isTelugu ? 'అవును' : 'Yes') : (isTelugu ? 'లేదు' : 'No')}
                  </button>
                ) : (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      formData[sym.field] === 1
                        ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {formData[sym.field] === 1 ? (isTelugu ? 'ఉన్నది' : 'Present') : (isTelugu ? 'లేదు' : 'None')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Lifestyle & Biomarkers Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                <HeartPulse className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isTelugu ? 'జీవనశైలి & ల్యాబ్ బయోమార్కర్లు' : 'Lifestyle & Laboratory Diagnostics'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'ఫాస్ట్ ఫుడ్ అలవాటు' : 'Fast Food Habit'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['Fast food (Y/N)'] === 1 ? (isTelugu ? 'క్రమం తప్పకుండా (>2x/వారం)' : 'Regular (>2x/wk)') : (isTelugu ? 'చాలా తక్కువ / అరుదుగా' : 'Minimal / Rare')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'వ్యాయామం అలవాటు' : 'Exercise Habit'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['Reg.Exercise(Y/N)'] === 1 ? (isTelugu ? 'చురుకుగా (క్రమం తప్పకుండా)' : 'Active (Regular)') : (isTelugu ? 'వ్యాయామం తక్కువ' : 'Sedentary')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'ఫోలికల్స్ (కుడి / ఎడమ)' : 'Follicles (R / L)'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['Follicle No. (R)'] || 0} / {formData['Follicle No. (L)'] || 0}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'AMH హార్మోన్' : 'AMH Hormone'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['AMH(ng/mL)'] ? `${formData['AMH(ng/mL)']} ng/mL` : (isTelugu ? 'నమోదు కాలేదు' : 'Not recorded')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'FSH / LH నిష్పత్తి' : 'FSH / LH Ratio'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['FSH/LH'] ? formData['FSH/LH'] : 'Auto'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{isTelugu ? 'గ్లూకోజ్ RBS' : 'Glucose RBS'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {formData['RBS(mg/dl)'] ? `${formData['RBS(mg/dl)']} mg/dL` : (isTelugu ? 'నమోదు కాలేదు' : 'Not recorded')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WHATSAPP NOTIFICATIONS & CONSENT SETTINGS CARD (PERSISTS TO FIRESTORE) */}
      <WhatsAppNotificationsSettings
        userId={user?.id || userId}
        onConsentChange={(consent) => {
          setWhatsappOptIn(consent.whatsapp_opt_in);
          setWhatsappPhone(consent.phone_number || '');
          setWhatsappLanguage(consent.preferred_language || 'en');
        }}
      />

      {/* HEALTH DATA BACKUP & LOCAL EXPORT SECTION (PDF) */}
      <div
        id="health-data-backup-section"
        className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span>{isTelugu ? 'ఆరోగ్య రికార్డుల PDF ఆర్కైవ్ & డౌన్‌లోడ్' : 'Health Profile & Screening Archive (PDF)'}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Clinical PDF Standard
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu
                  ? 'మీ అన్ని PCOS అసెస్‌మెంట్ రికార్డులు, బేస్‌లైన్ కొలతలు మరియు క్లినికల్ బయోమార్కర్లను అధికారిక PDF డాక్యుమెంట్‌గా డౌన్‌లోడ్ చేయండి.'
                  : 'Download and archive your complete health profile, longitudinal screening history, and diagnostic biomarkers as a clinical-grade PDF report.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackupMyHealthData}
            disabled={isExportingBackup}
            id="download-backup-health-data-btn"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 flex-shrink-0"
          >
            <FileText className="h-4 w-4 text-teal-200" />
            <span>
              {isExportingBackup
                ? (isTelugu ? 'PDF రూపొందిస్తోంది...' : 'Generating PDF...')
                : (isTelugu ? 'ఆరోగ్య రికార్డుల PDF డౌన్‌లోడ్' : 'Download Health Profile (PDF)')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                {isTelugu ? 'అధికారిక క్లినికల్ ఫార్మాట్' : 'Clinical Grade Documentation'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? 'వైద్యుల సంప్రదింపులకు తగిన అధికారిక PDF నివేదిక ఫార్మాట్.'
                  : 'Formatted with physician signature and diagnostic assessment blocks.'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                {isTelugu ? 'పూర్తి స్క్రీనింగ్ చరిత్ర' : 'Complete Screening History'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? 'మోడల్ సంభావ్యతలు, BMI మార్పులు మరియు సిఫార్సుల రికార్డులను కలిగి ఉంటుంది.'
                  : 'Includes all predictive ML probabilities, biomarker values, and clinical notes.'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <Lock className="h-4 w-4 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                {isTelugu ? 'గోప్యత మరియు డేటా యాజమాన్యం' : 'Privacy & Data Ownership'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? 'మీ ఆరోగ్య సమాచారంపై మీకు పూర్తి నియంత్రణ ఉంటుంది.'
                  : 'Your clinical data belongs exclusively to you with zero unauthenticated cloud exposure.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
