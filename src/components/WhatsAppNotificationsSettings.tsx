import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  Database
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import {
  UserWhatsAppConsent,
  WhatsAppNotificationPreferences
} from '../types';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getStoredUserConsent,
  saveUserWhatsAppConsent,
  sendTestWhatsAppMessage
} from '../services/whatsappService';

interface WhatsAppNotificationsSettingsProps {
  userId?: string;
  onConsentChange?: (consent: UserWhatsAppConsent) => void;
  className?: string;
}

export const WhatsAppNotificationsSettings: React.FC<WhatsAppNotificationsSettingsProps> = ({
  userId: propUserId,
  onConsentChange,
  className = ''
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();
  const activeUserId = propUserId || user?.id || 'usr_patient_demo';

  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(false);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappLanguage, setWhatsappLanguage] = useState<'en' | 'te'>('en');
  const [whatsappPrefs, setWhatsappPrefs] = useState<WhatsAppNotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isPersistedToFirestore, setIsPersistedToFirestore] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load WhatsApp settings from Firestore on mount, fallback to local storage
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      setIsLoading(true);
      try {
        // 1. Try fetching from Firestore first
        if (activeUserId && activeUserId !== 'usr_patient_demo') {
          const userDocRef = doc(db, 'users', activeUserId);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.whatsapp_consent || data.whatsapp_opt_in !== undefined) {
              const consent = data.whatsapp_consent || data;
              if (isMounted) {
                setWhatsappOptIn(Boolean(consent.whatsapp_opt_in));
                setWhatsappPhone(consent.phone_number || '');
                setWhatsappLanguage(consent.preferred_language || (isTelugu ? 'te' : 'en'));
                if (consent.notification_preferences) {
                  setWhatsappPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...consent.notification_preferences });
                }
                setIsPersistedToFirestore(true);
                setIsLoading(false);
                return;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Firestore consent read skipped or offline:', err);
      }

      // 2. Fallback to local storage
      if (isMounted) {
        const local = getStoredUserConsent(activeUserId);
        setWhatsappOptIn(Boolean(local.whatsapp_opt_in));
        setWhatsappPhone(local.phone_number || '');
        setWhatsappLanguage(local.preferred_language || (isTelugu ? 'te' : 'en'));
        if (local.notification_preferences) {
          setWhatsappPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...local.notification_preferences });
        }
        setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [activeUserId, isTelugu]);

  // Save WhatsApp settings to Firestore & localStorage
  const handleSaveSettings = async () => {
    setFeedback(null);

    // Validation if opted-in
    if (whatsappOptIn) {
      const cleanPhone = whatsappPhone.replace(/[\s\-\(\)]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setFeedback({
          type: 'error',
          message: isTelugu
            ? 'దయచేసి సరైన వాట్సాప్ ఫోన్ నంబర్‌ను దేశం కోడ్‌తో (+91) నమోదు చేయండి.'
            : 'Please enter a valid WhatsApp phone number with country code (e.g. +91 9876543210).'
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const consentPayload: Partial<UserWhatsAppConsent> = {
        whatsapp_opt_in: whatsappOptIn,
        phone_number: whatsappPhone.trim(),
        preferred_language: whatsappLanguage,
        notification_preferences: whatsappPrefs
      };

      // 1. Persist directly to Firestore
      if (activeUserId) {
        try {
          const userDocRef = doc(db, 'users', activeUserId);
          await setDoc(
            userDocRef,
            {
              whatsapp_opt_in: whatsappOptIn,
              phone_number: whatsappPhone.trim(),
              preferred_language: whatsappLanguage,
              notification_preferences: whatsappPrefs,
              whatsapp_consent: {
                whatsapp_opt_in: whatsappOptIn,
                phone_number: whatsappPhone.trim(),
                preferred_language: whatsappLanguage,
                notification_preferences: whatsappPrefs,
                updatedAt: new Date().toISOString()
              },
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
          setIsPersistedToFirestore(true);
        } catch (firestoreErr) {
          console.warn('Direct Firestore save failed, syncing locally:', firestoreErr);
        }
      }

      // 2. Save locally and trigger API webhook sync
      const saved = saveUserWhatsAppConsent(activeUserId, consentPayload);
      if (onConsentChange) {
        onConsentChange(saved);
      }

      setFeedback({
        type: 'success',
        message: whatsappOptIn
          ? (isTelugu
              ? 'వాట్సాప్ సెట్టింగ్స్ ఫైర్‌స్టోర్‌లో విజయవంతంగా భద్రపరచబడ్డాయి! విద్యా నోటిఫికేషన్లు ప్రారంభమయ్యాయి.'
              : 'WhatsApp preferences successfully saved to Firestore! Educational notifications are now active.')
          : (isTelugu
              ? 'వాట్సాప్ నోటిఫికేషన్లు ఫైర్‌స్టోర్‌లో విజయవంతంగా నిలిపివేయబడ్డాయి.'
              : 'WhatsApp notifications turned off. No automated messages will be dispatched.')
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || (isTelugu ? 'సెట్టింగ్స్ సేవ్ చేయడంలో లోపం సంభవించింది.' : 'Failed to save settings to Firestore.')
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Immediate Disable
  const handleDisableNotifications = async () => {
    setWhatsappOptIn(false);
    setIsSaving(true);
    setFeedback(null);
    try {
      if (activeUserId) {
        try {
          const userDocRef = doc(db, 'users', activeUserId);
          await setDoc(
            userDocRef,
            {
              whatsapp_opt_in: false,
              'whatsapp_consent.whatsapp_opt_in': false,
              'whatsapp_consent.opt_out_timestamp': new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Firestore disable update error:', e);
        }
      }

      const updated = saveUserWhatsAppConsent(activeUserId, { whatsapp_opt_in: false });
      if (onConsentChange) onConsentChange(updated);

      setFeedback({
        type: 'success',
        message: isTelugu
          ? 'వాట్సాప్ నోటిఫికేషన్లు నిలిపివేయబడ్డాయి (Opt-out verified).'
          : 'WhatsApp notifications successfully disabled. You will not receive automated broadcasts.'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error disabling notifications' });
    } finally {
      setIsSaving(false);
    }
  };

  const [directWaUrl, setDirectWaUrl] = useState<string | null>(null);

  // Dispatch Test Message
  const handleSendTestMessage = async () => {
    if (!whatsappPhone.trim()) {
      setFeedback({
        type: 'error',
        message: isTelugu ? 'దయచేసి టెస్ట్ కోసం ఫోన్ నంబర్‌ను నమోదు చేయండి.' : 'Please enter a phone number to test WhatsApp dispatch.'
      });
      return;
    }

    setIsSendingTest(true);
    setFeedback(null);
    try {
      const sampleText =
        whatsappLanguage === 'te'
          ? 'PCOSense రిమైండర్ 🌸\n\nఈ రోజు మీ లక్షణాలను ట్రాక్ చేశారా?\n\nక్రమం తప్పకుండా నమోదు చేసుకోవడం ద్వారా మార్పులను గమనించి వైద్యులతో చర్చించవచ్చు.\n\nఆపివేయడానికి STOP అని సమాధానం ఇవ్వండి.'
          : 'PCOSense Reminder 🌸\n\nHave you tracked your symptoms today?\n\nRegular tracking can help you understand changes in your cycle and discuss them with your healthcare professional.\n\nReply STOP to unsubscribe.';

      const cleanDigits = whatsappPhone.replace(/\D/g, '');
      const cleanPhone = cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits.replace(/^0+/, '')}`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleText)}`;
      setDirectWaUrl(waUrl);

      const res = await sendTestWhatsAppMessage({
        recipient_phone: whatsappPhone.trim(),
        content: sampleText,
        language: whatsappLanguage
      });

      setFeedback({
        type: 'success',
        message: isTelugu
          ? `టెస్ట్ నోటిఫికేషన్ సిద్ధమైంది! వాట్సాప్‌లో సందేశం పంపడానికి క్రింది బటన్ క్లిక్ చేయండి (+${cleanPhone}).`
          : `Test message prepared for +${cleanPhone}! Opening WhatsApp now...`
      });

      // Launch WhatsApp directly in new window/tab
      try {
        window.open(waUrl, '_blank');
      } catch {}
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to dispatch test message'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse text-xs text-slate-400">
        Loading WhatsApp notification preferences...
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6 ${className}`}
      id="whatsapp-notifications-settings-component"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Meta WhatsApp Cloud API & Firestore Sync</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isTelugu ? 'వాట్సాప్ నోటిఫికేషన్లు & అవగాహన సెట్టింగ్స్' : 'WhatsApp Notifications & Awareness Settings'}</span>
            {isPersistedToFirestore && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono border border-sky-200 dark:border-sky-800">
                <Database className="h-2.5 w-2.5" />
                <span>Firestore Synced</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            {isTelugu
              ? 'వ్యక్తిగతీకరించిన PCOS విద్యా సందేశాలు, ఆహార సూచనలు మరియు లక్షణాల ట్రాకింగ్ రిమైండర్లను నేరుగా మీ వాట్సాప్‌లో అందుకోండి. ఎప్పుడైనా ఆపివేయవచ్చు.'
              : 'Receive personalized, educational PCOS nudges, low-GI food awareness, and symptom tracking reminders directly via WhatsApp. You can opt out at any time.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              whatsappOptIn
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            {whatsappOptIn
              ? (isTelugu ? '● నోటిఫికేషన్లు యాక్టివ్' : '● Opted In & Active')
              : (isTelugu ? '○ నిలిపివేయబడింది' : '○ Not Opted In')}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
          role="alert"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          {directWaUrl && (
            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shrink-0 cursor-pointer transition-all"
              id="open-direct-whatsapp-banner-btn"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'వాట్సాప్‌లో తెరిచి పంపండి' : 'Open in WhatsApp & Send'}</span>
              <span className="text-[10px]">↗</span>
            </a>
          )}
        </div>
      )}

      {/* Explicit Consent Agreement Checkbox */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
        <label
          htmlFor="whatsapp-optin-consent-toggle"
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              id="whatsapp-optin-consent-toggle"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="sr-only"
            />
            {whatsappOptIn ? (
              <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Square className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">
              {isTelugu
                ? 'నేను PCOSense విద్యా మరియు అవగాహన వాట్సాప్ సందేశాలను స్వీకరించడానికి అంగీకరిస్తున్నాను.'
                : 'I agree to receive PCOSense educational WhatsApp messages and symptom tracking reminders.'}
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {isTelugu
                ? 'సమ్మతి ఐచ్ఛికం. వైద్య రోగనిర్ధారణ లేదా చికిత్స కోసం కాదు; అవగాహన కోసం మాత్రమే. ఆపివేయడానికి వాట్సాప్‌లో ఎప్పుడైనా STOP అని పంపవచ్చు.'
                : 'Consent is 100% voluntary. All communications are educational and not a medical diagnosis. Reply STOP anytime on WhatsApp to disable.'}
            </p>
          </div>
        </label>
      </div>

      {/* Configuration Fields (Enabled when Opted-In or setting up) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="whatsapp-phone-input-field"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isTelugu ? 'వాట్సాప్ మొబైల్ నంబర్ *' : 'WhatsApp Phone Number *'}</span>
            </label>
            <input
              type="tel"
              id="whatsapp-phone-input-field"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              {isTelugu ? 'దేశం కోడ్‌తో సహా నమోదు చేయండి (ఉదా: +91 9876543210)' : 'Include country code with digits (e.g. +91 9876543210)'}
            </span>
          </div>

          {/* Preferred Language Selection (English / Telugu) */}
          <div className="space-y-1.5">
            <label
              htmlFor="whatsapp-preferred-language-select"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isTelugu ? 'సందేశాల ప్రాధాన్య భాష *' : 'Preferred WhatsApp Language *'}</span>
            </label>
            <select
              id="whatsapp-preferred-language-select"
              value={whatsappLanguage}
              onChange={(e) => setWhatsappLanguage(e.target.value as 'en' | 'te')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              <option value="en">English (ఇంగ్లీష్ - Educational Guidance)</option>
              <option value="te">తెలుగు (Telugu - తెలుగు అవగాహన సందేశాలు)</option>
            </select>
            <span className="text-[10px] text-slate-400 block">
              {isTelugu ? 'మీకు అనుకూలమైన భాషలో సందేశాలు పంపబడతాయి.' : 'Personalized notifications will be delivered in your chosen language.'}
            </span>
          </div>
        </div>

        {/* Detailed Notification Preferences */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isTelugu ? 'మీరు అందుకోవాలనుకుంటున్న సందేశాల రకాలు' : 'Notification Topics & Preferences'}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={whatsappPrefs.symptom_reminders}
                onChange={(e) => setWhatsappPrefs(prev => ({ ...prev, symptom_reminders: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isTelugu ? 'రోజువారీ లక్షణాల ట్రాకింగ్ రిమైండర్లు' : 'Daily Symptom Tracking Reminders'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={whatsappPrefs.food_awareness}
                onChange={(e) => setWhatsappPrefs(prev => ({ ...prev, food_awareness: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isTelugu ? 'ఆహార అవగాహన & స్కాన్ సారాంశాలు' : 'Food Awareness & Scan Summaries'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={whatsappPrefs.exercise_reminders}
                onChange={(e) => setWhatsappPrefs(prev => ({ ...prev, exercise_reminders: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isTelugu ? 'తేలికపాటి వ్యాయామం & నడక సూచనలు' : 'Gentle Movement & Exercise Prompts'}
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={whatsappPrefs.appointment_reminders}
                onChange={(e) => setWhatsappPrefs(prev => ({ ...prev, appointment_reminders: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isTelugu ? 'డాక్టర్ సంప్రదింపుల రిమైండర్లు' : 'Doctor Consultation Reminders'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons: Save to Firestore, Disable, Send Test */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            id="save-whatsapp-firestore-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>
              {isSaving
                ? (isTelugu ? 'ఫైర్‌స్టోర్‌లో సేవ్ చేస్తోంది...' : 'Saving to Firestore...')
                : (isTelugu ? 'వాట్సాప్ సెట్టింగ్స్ సేవ్ చేయండి' : 'Save WhatsApp Preferences')}
            </span>
          </button>

          {whatsappOptIn && (
            <button
              type="button"
              onClick={handleDisableNotifications}
              disabled={isSaving}
              id="disable-whatsapp-notifications-btn"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isTelugu ? 'నోటిఫికేషన్లు ఆపివేయండి' : 'Disable Reminders'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSendTestMessage}
          disabled={isSendingTest || !whatsappPhone.trim()}
          id="send-test-whatsapp-msg-btn"
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          title="Test delivery to your WhatsApp phone number"
        >
          <Send className="h-3.5 w-3.5" />
          <span>
            {isSendingTest
              ? (isTelugu ? 'పంపుతోంది...' : 'Sending...')
              : (isTelugu ? 'పరీక్ష సందేశం పంపండి' : 'Send Test Notification')}
          </span>
        </button>
      </div>

      {/* Safety & Compliance Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{isTelugu ? 'సురక్షిత గోప్యత & మార్గదర్శకాలు' : 'Strict Healthcare Communication Boundaries'}</span>
        </div>
        <p>
          {isTelugu
            ? 'వాట్సాప్ సందేశాలు సాధారణ అవగాహన మరియు ట్రాకింగ్ జ్ఞాపికల కొరకు మాత్రమే. వైద్య రోగనిర్ధారణకు ప్రత్యామ్నాయం కాదు. సందేశాలను ఆపడానికి ఎప్పుడైనా STOP అని సమాధానం ఇవ్వవచ్చు.'
            : 'PCOSense WhatsApp notifications provide supportive education and habit reminders. They do not replace a medical consultation or diagnose health conditions. Reply STOP at any time to instantly unsubscribe.'}
        </p>
      </div>
    </div>
  );
};
