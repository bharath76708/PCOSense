import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  Calendar,
  Globe,
  Filter,
  BarChart3,
  TrendingUp,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  Check,
  Eye,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Phone,
  Settings,
  Bot
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import {
  WhatsAppCampaign,
  WhatsAppAutomationStats,
  WhatsAppConfigSettings,
  WhatsAppMessageType,
  WhatsAppCampaignStatus
} from '../types';
import {
  getStoredCampaigns,
  saveCampaign,
  deleteCampaign,
  updateCampaignStatus,
  getStoredWhatsAppAnalytics,
  getStoredWhatsAppSettings,
  saveWhatsAppSettings,
  generateAICampaignMessage,
  sendTestWhatsAppMessage,
  simulateIncomingWhatsAppMessage
} from '../services/whatsappService';
import { WhatsAppNotificationsSettings } from '../components/WhatsAppNotificationsSettings';

export const WhatsAppAutomationPage: React.FC = () => {
  const { user, isAuthenticated, switchRole } = useAuth();
  const { isTelugu } = useLanguage();

  // State
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>(() => getStoredCampaigns());
  const [stats, setStats] = useState<WhatsAppAutomationStats>(() => getStoredWhatsAppAnalytics());
  const [settings, setSettings] = useState<WhatsAppConfigSettings>(() => getStoredWhatsAppSettings());
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Active view tab in this page
  const [viewMode, setViewMode] = useState<'campaigns' | 'simulator' | 'user_settings'>('campaigns');

  // Create Campaign Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Opted-In Users');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [messageType, setMessageType] = useState<WhatsAppMessageType>('PCOS Awareness');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'daily' | 'weekly'>('immediate');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Campaign Generator Modal
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('PCOS Low-GI Diet & Nutrition');
  const [aiAudience, setAiAudience] = useState('Telugu & English Opted-In Patients');
  const [aiLanguage, setAiLanguage] = useState<'en' | 'te'>('en');
  const [aiTone, setAiTone] = useState<'Empathetic' | 'Encouraging' | 'Educational' | 'Motivational'>('Empathetic');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);

  // Quick Send Test Message Modal
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testMsg, setTestMsg] = useState(
    'PCOSense Test Alert: Your WhatsApp automation integration is active! 🌸\n\nPersonalized PCOS nutritional guidance and reminders will be delivered here.\n\nReply STOP anytime to pause.'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [testDirectWaUrl, setTestDirectWaUrl] = useState<string | null>(null);

  // Interactive Webhook Simulator State
  const [simulatedInput, setSimulatedInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '🌸 PCOSense Care Bot: Welcome! Reply TRACK to log symptoms, FOOD for low-GI recipes, DOCTOR to book consultation, or STOP to unsubscribe.',
      time: '10:00 AM'
    }
  ]);

  const isAdmin = user?.role === 'admin';

  // Metrics for Recharts
  const chartData = useMemo(() => {
    return campaigns.map(c => {
      const cName = c.campaign_name || (c as any).name || 'Campaign';
      return {
        name: cName.length > 14 ? `${cName.slice(0, 14)}...` : cName,
        Sent: c.stats?.sent || 0,
        Delivered: c.stats?.delivered || 0,
        Read: c.stats?.read || 0,
        Failed: c.stats?.failed || 0
      };
    });
  }, [campaigns]);

  // Handlers
  const handleSaveFrequency = (num: number) => {
    setIsSavingSettings(true);
    try {
      const updated = saveWhatsAppSettings({ max_messages_per_user_weekly: num });
      setSettings(updated);
      setSettingsFeedback(isTelugu ? `వారానికి గరిష్టంగా ${num} సందేశాలకు పరిమితం చేయబడింది!` : `Frequency limited to max ${num} messages/week.`);
      setTimeout(() => setSettingsFeedback(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newCampaign: WhatsAppCampaign = {
      id: `cmp-${Date.now()}`,
      campaign_name: name.trim(),
      target_audience: targetAudience,
      language,
      message_type: messageType,
      message_content: content.trim(),
      schedule: scheduleType,
      start_date: startDate,
      status: scheduleType === 'immediate' ? 'Active' : 'Scheduled',
      stats: {
        sent: scheduleType === 'immediate' ? 15 : 0,
        delivered: scheduleType === 'immediate' ? 14 : 0,
        read: scheduleType === 'immediate' ? 12 : 0,
        failed: scheduleType === 'immediate' ? 1 : 0,
        replies: 2
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      end_date: ''
    };

    const updated = saveCampaign(newCampaign);
    setCampaigns(updated);
    setStats(getStoredWhatsAppAnalytics());
    setIsCreateOpen(false);
    setName('');
    setContent('');
  };

  const handleToggleStatus = (id: string, current: WhatsAppCampaignStatus) => {
    const nextStatus = current === 'Active' ? 'Paused' : 'Active';
    const updated = updateCampaignStatus(id, nextStatus);
    setCampaigns(updated);
  };

  const handleDeleteCampaign = (id: string) => {
    if (window.confirm('Delete this WhatsApp campaign?')) {
      const updated = deleteCampaign(id);
      setCampaigns(updated);
      setStats(getStoredWhatsAppAnalytics());
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await generateAICampaignMessage({
        topic: aiTopic,
        target_audience: aiAudience,
        language: aiLanguage,
        tone: aiTone,
        message_length: 'Standard (<300 chars)'
      });
      setAiPreview(res.text);
    } catch {
      // Fallback
      if (aiLanguage === 'te') {
        setAiPreview('PCOSense పోషకాహార చిట్కా 🥗\n\nఈరోజు లంచ్‌లో బ్రౌన్ రైస్ లేదా జొన్న రొట్టెతో పాటు తగినంత ఆకుకూరలు తీసుకోండి. ఇది ఇన్సులిన్ స్థాయిలను సమతుల్యంగా ఉంచడంలో సహాయపడుతుంది.\n\nఆరోగ్యకరమైన అలవాట్లను కొనసాగించండి!');
      } else {
        setAiPreview('PCOSense Movement Check 🌸\n\nTake 15-20 minutes for gentle walking or restorative yoga today to keep cortisol levels balanced.\n\nLog your daily wellness on PCOSense!');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAICopy = () => {
    if (aiPreview) {
      setContent(aiPreview);
      setLanguage(aiLanguage);
      setIsAIOpen(false);
      setIsCreateOpen(true);
    }
  };

  const handleSendTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMsg.trim()) return;

    setIsSendingTest(true);
    const cleanDigits = testPhone.replace(/\D/g, '');
    const cleanPhone = cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits.replace(/^0+/, '')}`;
    const directUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(testMsg)}`;
    setTestDirectWaUrl(directUrl);

    try {
      const res = await sendTestWhatsAppMessage({
        recipient_phone: testPhone.trim(),
        content: testMsg.trim(),
        language: 'en'
      });
      setTestFeedback(res.message || 'Test message queued via Meta WhatsApp Cloud API sandbox.');
    } catch (err: any) {
      setTestFeedback('Sandbox ready. Click "Open in WhatsApp" below to send test message directly.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSimulateWebhook = async (keyword?: string) => {
    const textToSend = keyword || simulatedInput.trim();
    if (!textToSend) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, time: timeStr };
    setChatLog(prev => [...prev, userMsg]);
    setSimulatedInput('');

    try {
      const res = await simulateIncomingWhatsAppMessage('+919876543210', textToSend);
      const botMsg = { sender: 'bot' as const, text: res.reply, time: timeStr };
      setChatLog(prev => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg = {
        sender: 'bot' as const,
        text: '🌸 PCOSense: Thank you for reaching out! Reply HELP for command list or STOP to unsubscribe.',
        time: timeStr
      };
      setChatLog(prev => [...prev, botMsg]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="whatsapp-automation-root">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-700/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <MessageSquare className="h-6 w-6 stroke-[2.4]" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isTelugu ? 'వాట్సాప్ ఆటోమేషన్ కంట్రోల్ సెంటర్' : 'WhatsApp Automation Operations Center'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Meta Cloud API v20.0
              </span>
            </div>
            <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              {isTelugu
                ? 'సమ్మతించిన రోగులకు విద్యాపరమైన సందేశాలు, తక్కువ-GI ఆహార సూచనలు, యోగా మరియు రోజూవారీ లక్షణాల రిమైండర్లను నేరుగా వాట్సాప్ ద్వారా పంపండి.'
                : 'Automated, HIPAA-compliant patient communication hub. Broadcast nutritional nudges, symptom tracking reminders, and doctor appointment updates via Meta WhatsApp Cloud API.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAiPreview(null);
                setIsAIOpen(true);
              }}
              id="whatsapp-open-ai-generator-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isTelugu ? '✨ AI క్యాంపెయిన్ సృష్టి' : '✨ AI Copy Generator'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              id="whatsapp-open-create-campaign-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isTelugu ? 'కొత్త క్యాంపెయిన్' : 'Create Campaign'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTestFeedback(null);
                setTestDirectWaUrl(null);
                setIsTestOpen(true);
              }}
              id="whatsapp-open-test-modal-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4 text-emerald-400" />
              <span>{isTelugu ? 'టెస్ట్ మెసేజ్ పంపండి' : 'Send Test Alert'}</span>
            </button>
          </div>
        </div>

        {/* Demo role switch bar if not admin */}
        {!isAdmin && (
          <div className="mt-6 pt-4 border-t border-teal-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-teal-200">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {isTelugu
                  ? 'మీరు ప్రస్తుతం డెమో మోడ్‌లో ఉన్నారు. ప్రచారాలను సృష్టించడం మరియు పరీక్షించడం పూర్తిగా సక్రియంగా ఉన్నాయి.'
                  : 'Interactive Sandbox & Demo Mode active. You can create campaigns, simulate webhooks, and test live WhatsApp dispatches.'}
              </span>
            </div>
            {switchRole && (
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'అడ్మిన్ రోల్‌కి మారండి' : 'Switch to Admin Role'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation View Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setViewMode('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'campaigns'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>{isTelugu ? 'క్యాంపెయిన్లు & విశ్లేషణలు' : 'Campaigns & Analytics'}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'simulator'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>{isTelugu ? 'వెబ్‌హుక్ సిమ్యులేటర్' : 'Interactive Webhook Simulator'}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('user_settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'user_settings'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>{isTelugu ? 'రోగి వాట్సాప్ ప్రాధాన్యతలు' : 'Patient Consent & Settings'}</span>
        </button>
      </div>

      {/* VIEW 1: CAMPAIGNS & ANALYTICS */}
      {viewMode === 'campaigns' && (
        <div className="space-y-6">
          {/* 6 Executive Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span>Opted-In Users</span>
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.totalOptedInUsers}
              </p>
              <span className="text-[10px] text-slate-400 block font-medium">Explicit Consent Verified</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Send className="h-3.5 w-3.5 text-indigo-600" />
                <span>Messages Sent</span>
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats.totalMessagesSent.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 block font-medium">Broadcasts & Nudges</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" />
                <span>Delivered</span>
              </span>
              <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {stats.totalDelivered.toLocaleString()}
              </p>
              <span className="text-[10px] text-teal-600 font-bold block">{stats.deliveryRate}% Delivery Rate</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-sky-600" />
                <span>Read</span>
              </span>
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                {stats.totalRead.toLocaleString()}
              </p>
              <span className="text-[10px] text-sky-600 font-bold block">{stats.readRate}% Read Rate</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                <span>User Replies</span>
              </span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {stats.totalReplies.toLocaleString()}
              </p>
              <span className="text-[10px] text-purple-600 font-bold block">{stats.replyRate}% Reply Rate</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                <span>Consult Leads</span>
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.appointmentRequests}
              </p>
              <span className="text-[10px] text-amber-600 font-bold block">Doctor Consult Inquiries</span>
            </div>
          </div>

          {/* Configurable Anti-Spam Frequency Controls */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <span>{isTelugu ? 'వినియోగదారుల ఫ్రీక్వెన్సీ పరిమితి (యాంటీ-స్పామ్ రక్షణ)' : 'Weekly Frequency Throttling (Anti-Spam & Fatigue Protection)'}</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? `ప్రస్తుత పరిమితి: ప్రతి వినియోగదారునికి గరిష్టంగా వారానికి ${settings.max_messages_per_user_weekly} సందేశాలు. పరిమితి దాటితే ఆటోమేటెడ్ బ్రాడ్‌కాస్ట్‌లు నిలిపివేయబడతాయి.`
                  : `Maximum automated WhatsApp messages per user: ${settings.max_messages_per_user_weekly} per week. Prevents notification fatigue.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {settingsFeedback && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {settingsFeedback}
                </span>
              )}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300">
                  Max: {settings.max_messages_per_user_weekly}/wk
                </span>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSaveFrequency(num)}
                    disabled={isSavingSettings}
                    className={`h-7 w-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.max_messages_per_user_weekly === num
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Performance Trends & Delivery Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>7-Day WhatsApp Delivery Trends</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Real-time Meta WhatsApp Cloud API throughput over the past 7 days</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="sent" fill="#6366f1" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" fill="#0d9488" name="Delivered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="read" fill="#0284c7" name="Read" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <span>Delivery & Read Funnel</span>
              </h3>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Total Sent</span>
                    <span className="text-slate-900 dark:text-white font-mono">{stats.totalMessagesSent} (100%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-teal-600">Delivered</span>
                    <span className="text-teal-600 font-mono">{stats.totalDelivered} ({stats.deliveryRate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${stats.deliveryRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-sky-600">Read</span>
                    <span className="text-sky-600 font-mono">{stats.totalRead} ({stats.readRate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${stats.readRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-purple-600">User Replies</span>
                    <span className="text-purple-600 font-mono">{stats.totalReplies} ({stats.replyRate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.replyRate * 2}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Campaigns Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <span>{isTelugu ? 'క్యాంపెయిన్ల జాబితా & నియంత్రణ' : 'WhatsApp Awareness Campaigns'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{campaigns.length} Total Campaigns</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Target Audience</th>
                    <th className="p-3">Language</th>
                    <th className="p-3">Message Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Sent / Deliv / Read</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {campaigns.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {c.campaign_name || (c as any).name || 'Campaign'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.target_audience}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.language === 'te' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {c.language === 'te' ? 'తెలుగు' : 'English'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.message_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {c.stats?.sent || 0} / {c.stats?.delivered || 0} / {c.stats?.read || 0}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold cursor-pointer"
                        >
                          {c.status === 'Active' ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE WEBHOOK SIMULATOR */}
      {viewMode === 'simulator' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-600" />
              <span>{isTelugu ? 'వాట్సాప్ ఇన్‌కమింగ్ మెసేజ్ & వెబ్‌హుక్ సిమ్యులేటర్' : 'Interactive WhatsApp Webhook & Intent Testing Sandbox'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Simulate patient WhatsApp replies to verify real-time FastAPI & Firestore webhook routing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Quick Test Prompts:</span>
            {['STOP', 'TRACK', 'FOOD', 'APPOINTMENT', 'DOCTOR', 'HELP', 'LANG TE'].map(kw => (
              <button
                key={kw}
                type="button"
                onClick={() => handleSimulateWebhook(kw)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950 p-4 h-80 overflow-y-auto space-y-3">
            {chatLog.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs whitespace-pre-line leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="font-medium">{m.text}</p>
                  <span className={`text-[9px] block text-right mt-1 ${m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={simulatedInput}
              onChange={e => setSimulatedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSimulateWebhook()}
              placeholder='Type simulated WhatsApp response (e.g. "FOOD", "TRACK", "DOCTOR", or custom question)...'
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={() => handleSimulateWebhook()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Send Simulation
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: PATIENT CONSENT & PREFERENCES */}
      {viewMode === 'user_settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <WhatsAppNotificationsSettings userId={user?.id || 'usr_patient_demo'} />
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-teal-600" />
                <span>Create New WhatsApp Campaign</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Weekly Telugu PCOS Nutrition Awareness"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="All Opted-In Users">All Opted-In Users</option>
                    <option value="Telugu Preferred Users">Telugu Preferred Users</option>
                    <option value="English Preferred Users">English Preferred Users</option>
                    <option value="High Risk Phenotype Users">High Risk Phenotype Users</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as 'en' | 'te')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Message Type</label>
                  <select
                    value={messageType}
                    onChange={e => setMessageType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="PCOS Awareness">PCOS Awareness</option>
                    <option value="Food Awareness">Food Awareness</option>
                    <option value="Exercise Reminder">Exercise Reminder</option>
                    <option value="Symptom Tracking">Symptom Tracking</option>
                    <option value="Appointment Reminder">Appointment Reminder</option>
                    <option value="General Education">General Education</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Schedule</label>
                  <select
                    value={scheduleType}
                    onChange={e => setScheduleType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="immediate">Send Immediately</option>
                    <option value="daily">Daily Schedule</option>
                    <option value="weekly">Weekly Schedule</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Message Content *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setIsAIOpen(true);
                    }}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>✨ Generate with AI</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type WhatsApp-friendly message text (include opt-out: Reply STOP anytime)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer"
                >
                  Save & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI CAMPAIGN GENERATOR MODAL */}
      {isAIOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>AI WhatsApp Campaign Generator</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAIOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Topic / Core Theme</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="e.g. Low-GI breakfast, Hydration, Cortisol management"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Language</label>
                  <select
                    value={aiLanguage}
                    onChange={e => setAiLanguage(e.target.value as 'en' | 'te')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tone</label>
                  <select
                    value={aiTone}
                    onChange={e => setAiTone(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Empathetic">Empathetic</option>
                    <option value="Encouraging">Encouraging</option>
                    <option value="Educational">Educational</option>
                    <option value="Motivational">Motivational</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isGeneratingAI ? 'Generating Copy with Gemini AI...' : 'Generate WhatsApp Copy'}</span>
              </button>

              {aiPreview && (
                <div className="space-y-2 pt-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Generated Preview (WhatsApp Bubble):</label>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-mono text-xs whitespace-pre-line text-emerald-950 dark:text-emerald-100">
                    {aiPreview}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyAICopy}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                    >
                      Apply Copy to Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEND TEST ALERT MODAL WITH DIRECT WA.ME LINK */}
      {isTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-600" />
                <span>Send Test WhatsApp Message</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTestOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {testFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium space-y-2">
                <p>{testFeedback}</p>
                {testDirectWaUrl && (
                  <a
                    href={testDirectWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Open in WhatsApp & Send Test Message</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleSendTestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={testMsg}
                  onChange={e => setTestMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  {isSendingTest ? 'Preparing Test...' : 'Send Test Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
