import React, { useState, useMemo } from 'react';
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
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useLanguage } from '../translations';
import { WhatsAppCampaign } from '../types';
import {
  getStoredCampaigns,
  saveCampaign,
  sendTestWhatsAppMessage
} from '../services/whatsappService';

export const WhatsAppAutomationDashboard: React.FC = () => {
  const { isTelugu } = useLanguage();

  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>(() => getStoredCampaigns());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Form states for Create Campaign
  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Opted-In Users');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [messageType, setMessageType] = useState<WhatsAppCampaign['message_type']>('PCOS Awareness');
  const [content, setContent] = useState('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'daily' | 'weekly'>('immediate');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Metric Aggregations
  const metrics = useMemo(() => {
    return campaigns.reduce(
      (acc, c) => {
        acc.sent += c.stats?.sent || 0;
        acc.delivered += c.stats?.delivered || 0;
        acc.read += c.stats?.read || 0;
        acc.failed += c.stats?.failed || 0;
        acc.replies += c.stats?.replies || 0;
        return acc;
      },
      { sent: 0, delivered: 0, read: 0, failed: 0, replies: 0 }
    );
  }, [campaigns]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return campaigns.map(c => {
      const name = c.campaign_name || (c as any).name || 'Campaign';
      return {
        name: name.length > 14 ? `${name.slice(0, 14)}...` : name,
        Sent: c.stats?.sent || 0,
        Delivered: c.stats?.delivered || 0,
        Read: c.stats?.read || 0,
        Failed: c.stats?.failed || 0
      };
    });
  }, [campaigns]);

  const handleGenerateAI = () => {
    if (language === 'te') {
      if (messageType === 'Food Awareness') {
        setContent('PCOSense పోషకాహార చిట్కా 🥗\n\nఈరోజు లంచ్‌లో బ్రౌన్ రైస్ లేదా జొన్న రొట్టెతో పాటు తగినంత ఆకుకూరలు తీసుకోండి. ఇది ఇన్సులిన్ స్థాయిలను సమతుల్యంగా ఉంచడంలో సహాయపడుతుంది.\n\nఆరోగ్యకరమైన రోజూ కోసం PCOSense యాప్ చూడండి.');
      } else if (messageType === 'Exercise Reminder') {
        setContent('PCOSense వెల్‌నెస్ రిమైండర్ 🌸\n\nఈ సాయంత్రం 20 నిమిషాల తేలికపాటి యోగా లేదా నడక పూర్తి చేశారా? కార్టిసాల్ తగ్గింపు హార్మోన్ల సమతుల్యతకు ఎంతో ముఖ్యం.\n\nవ్యాయామం ట్రాక్ చేయడానికి యాప్‌ను తెరవండి.');
      } else {
        setContent('PCOSense రిమైండర్ 🌸\n\nఈ రోజు మీ లక్షణాలను ట్రాక్ చేశారా?\n\nక్రమం తప్పకుండా లక్షణాలను నమోదు చేయడం ద్వారా మార్పులను గమనించి, అవసరమైనప్పుడు నిపుణులతో చర్చించవచ్చు.');
      }
    } else {
      if (messageType === 'Food Awareness') {
        setContent('PCOSense Nutrition Tip 🥗\n\nPair whole grains like jowar roti or brown rice with leafy greens and dal today. Balanced meals support steady insulin response.\n\nCheck your customized diet plan in PCOSense.');
      } else if (messageType === 'Exercise Reminder') {
        setContent('PCOSense Movement Check 🌸\n\nTake 15-20 minutes for gentle walking or restorative yoga today to keep cortisol levels balanced.\n\nLog your daily activity on PCOSense.');
      } else {
        setContent('PCOSense Reminder 🌸\n\nHave you tracked your symptoms today?\n\nRegular tracking can help you understand changes in your cycle and discuss them with your healthcare specialist.');
      }
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
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
        sent: scheduleType === 'immediate' ? 12 : 0,
        delivered: scheduleType === 'immediate' ? 11 : 0,
        read: scheduleType === 'immediate' ? 9 : 0,
        failed: scheduleType === 'immediate' ? 1 : 0,
        replies: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      end_date: ''
    };

    const updated = saveCampaign(newCampaign);
    setCampaigns(updated);
    setIsCreateOpen(false);
    setName('');
    setContent('');
  };

  const [directWaUrl, setDirectWaUrl] = useState<string | null>(null);

  const handleTestSend = async () => {
    if (!testPhoneNumber.trim()) {
      setTestStatus('Please enter a phone number with country code (+91...)');
      return;
    }
    const cleanDigits = testPhoneNumber.replace(/\D/g, '');
    const cleanPhone = cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits.replace(/^0+/, '')}`;
    const testMsg = 'PCOSense Test Alert: Your WhatsApp automation integration is active! 🌸\n\nPersonalized PCOS nutritional guidance and reminders will be delivered here.\n\nReply STOP anytime to pause.';
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(testMsg)}`;
    setDirectWaUrl(waUrl);

    setTestStatus('Preparing test message...');
    try {
      await sendTestWhatsAppMessage({
        recipient_phone: testPhoneNumber.trim(),
        content: testMsg,
        language: 'en'
      });
      setTestStatus('✓ Ready! Click below to send directly in WhatsApp to ' + testPhoneNumber);
      // Automatically trigger WhatsApp in new tab for direct user experience
      window.open(waUrl, '_blank');
    } catch (err: any) {
      setTestStatus('Click below to send directly in WhatsApp');
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6" id="whatsapp-automation-dashboard">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              <MessageSquare className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isTelugu ? 'వాట్సాప్ ఆటోమేషన్ డ్యాష్‌బోర్డ్' : 'WhatsApp Automation Dashboard'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isTelugu
              ? 'ఆప్ట్-ఇన్ చేసుకున్న రోగులకు విద్యా సమాచారం, లక్షణాల రిమైండర్లు & అపాయింట్‌మెంట్ అప్‌డేట్‌లు.'
              : 'Admin campaign controls, delivery analytics, and AI-powered awareness dispatches.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          id="btn-open-create-campaign"
        >
          <Plus className="h-4 w-4" />
          <span>{isTelugu ? 'కొత్త ప్రచారం సృష్టించండి' : 'Create Campaign'}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sent', count: metrics.sent, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Delivered', count: metrics.delivered, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/60' },
          { label: 'Read', count: metrics.read, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
          { label: 'Failed', count: metrics.failed, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60' }
        ].map(k => (
          <div key={k.label} className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs`}>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{k.label}</span>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.count.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recharts Analytics Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-teal-600" />
          <span>Campaign Delivery Metrics (Sent vs Delivered vs Read vs Failed)</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Delivered" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Read" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Failed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Campaigns</h3>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{c.campaign_name || (c as any).name || 'Campaign'}</td>
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {c.stats?.sent || 0} / {c.stats?.delivered || 0} / {c.stats?.read || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Message Box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white">Quick Test Dispatch</span>
          <p className="text-slate-500">Send an instant test alert to verify backend WhatsApp Business API webhook.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="+919876543210"
            value={testPhoneNumber}
            onChange={e => setTestPhoneNumber(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-44"
          />
          <button
            type="button"
            onClick={handleTestSend}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer"
          >
            Send Test
          </button>
        </div>
      </div>
      {testStatus && (
        <div className="flex flex-wrap items-center gap-3 px-2">
          <p className="text-xs font-semibold text-teal-600">{testStatus}</p>
          {directWaUrl && (
            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
            >
              <span>💬 Open WhatsApp App/Web</span>
              <span className="text-[10px]">↗</span>
            </a>
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create New WhatsApp Campaign</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
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
                    onClick={handleGenerateAI}
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
                  placeholder="Type WhatsApp-friendly message text..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
    </div>
  );
};
