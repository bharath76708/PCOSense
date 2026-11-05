import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Trash2,
  Download,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  FileText,
  Stethoscope,
  User,
  Edit3,
  Sliders,
  HelpCircle,
  RotateCcw,
  Mic,
  MessageSquare,
  Layers,
  Info,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
  History,
  BookOpen,
  Share2,
  Palette,
  QrCode,
  Heart,
  Moon,
  MapPin,
  Award,
  Utensils,
  Camera
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../translations';
import { getAssessmentHistory, deleteAssessmentHistory } from '../services/api';
import { AssessmentHistoryItem, DailySymptomLog } from '../types';
import { PipelineFlowVisualizer } from '../components/PipelineFlowVisualizer';
import { DoctorDiscussionGuide } from '../components/DoctorDiscussionGuide';
import { RiskThresholdManager, ThresholdSettings, DEFAULT_THRESHOLDS } from '../components/RiskThresholdManager';
import { ProactiveLifestyleTipsWidget } from '../components/ProactiveLifestyleTipsWidget';
import { HealthGoalsManager, getStoredUserStreak } from '../components/HealthGoalsManager';
import { SummaryInsightsCard } from '../components/SummaryInsightsCard';
import { CommunityResourcesWidget } from '../components/CommunityResourcesWidget';
import { QuickHelpMetricsGuide, MetricTooltipTrigger } from '../components/QuickHelpMetricsGuide';
import { WeeklySummaryEmailOptIn } from '../components/WeeklySummaryEmailOptIn';
import { ShareWithDoctorModal } from '../components/ShareWithDoctorModal';
import { WalkingHydrationDashboardWidget } from '../components/WalkingHydrationDashboardWidget';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { DailySymptomTrackerModal } from '../components/DailySymptomTrackerModal';
import { SymptomTrendsChart } from '../components/SymptomTrendsChart';
import { SymptomRiskHeatmap } from '../components/SymptomRiskHeatmap';
import { MilestoneBadgesCard } from '../components/MilestoneBadgesCard';
import { DailyAffirmationCard } from '../components/DailyAffirmationCard';
import { HealthChallengesSection } from '../components/HealthChallengesSection';
import { QuickSymptomLogWidget } from '../components/QuickSymptomLogWidget';
import { DietPlanDashboardWidget } from '../components/DietPlanDashboardWidget';
import { HydrationActivityConsistencyChart } from '../components/HydrationActivityConsistencyChart';
import { WellnessGoalsModule } from '../components/WellnessGoalsModule';
import { HelpUsImproveModal } from '../components/HelpUsImproveModal';
import { DailyHabitTrackerSection } from '../components/DailyHabitTrackerSection';
import { HowItWorksTimeline } from '../components/HowItWorksTimeline';
import { getDailySymptomLogs } from '../services/dailySymptomService';
import { exportComprehensiveHealthProfilePDF } from '../utils/pdfExport';
import { WellnessTrendsDashboard } from '../components/WellnessTrendsDashboard';
import { SymptomDailyLog } from '../components/SymptomDailyLog';
import { WeeklyTrendsSection } from '../components/WeeklyTrendsSection';

interface DashboardPageProps {
  onOpenAssistant?: (prompt?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAssistant }) => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { predictionResult, patientData, loadFromUserProfile } = useAssessment();
  const { isDark, highContrast } = useTheme();
  const { t, isTelugu } = useLanguage();

  const [historyList, setHistoryList] = useState<AssessmentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [showDoctorGuide, setShowDoctorGuide] = useState<boolean>(false);
  const [showShareDoctorModal, setShowShareDoctorModal] = useState<boolean>(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState<boolean>(false);
  const [showDailySymptomModal, setShowDailySymptomModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showWellnessGoalsModal, setShowWellnessGoalsModal] = useState<boolean>(false);
  
  // Daily symptoms state for Recharts visualization
  const [dailySymptoms, setDailySymptoms] = useState<DailySymptomLog[]>(() => getDailySymptomLogs(user?.id));

  const [chartMetric, setChartMetric] = useState<'risk' | 'dual_bmi'>('risk');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '5' | '3'>('all');
  const [showThresholds, setShowThresholds] = useState<boolean>(true);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [previewSampleData, setPreviewSampleData] = useState<boolean>(false);
  
  // Customizable alert threshold state (persisted in localStorage)
  const [thresholdSettings, setThresholdSettings] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem('pcosense_threshold_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_THRESHOLDS;
  });

  useEffect(() => {
    getAssessmentHistory().then(data => {
      setHistoryList(data);
      setLoadingHistory(false);
    });
    setDailySymptoms(getDailySymptomLogs(user?.id));
  }, [user]);

  const handleDelete = async (id: string) => {
    const updated = await deleteAssessmentHistory(id);
    setHistoryList(updated);
    if (selectedPointId === id) {
      setSelectedPointId(null);
    }
  };

  const handleStartAssessmentWithProfile = () => {
    loadFromUserProfile();
    navigate('/assessment');
  };

  const handleAskAI = (prompt?: string) => {
    if (onOpenAssistant) {
      onOpenAssistant(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('open-pcosense-ai', { detail: { prompt } }));
    }
  };

  const handleExportPDF = () => {
    exportComprehensiveHealthProfilePDF({
      user: user ? { full_name: user.full_name, email: user.email } : null,
      profileData: profile?.patientData || patientData,
      records: historyList
    });
  };

  // Sample data fallback for exploration when user has 0 assessments
  const sampleTimelineData: AssessmentHistoryItem[] = [
    {
      id: 'SAMPLE-001',
      timestamp: new Date(Date.now() - 90 * 86400000).toISOString(),
      dateFormatted: 'Nov 20, 2025',
      probability: 78.4,
      risk_level: 'Elevated',
      prediction: 1,
      bmi: 27.6,
      cycleStatus: 'Irregular (45d)',
      follicleCountRight: 14,
      model_name: 'Logistic Regression Baseline'
    },
    {
      id: 'SAMPLE-002',
      timestamp: new Date(Date.now() - 60 * 86400000).toISOString(),
      dateFormatted: 'Dec 18, 2025',
      probability: 71.2,
      risk_level: 'Elevated',
      prediction: 1,
      bmi: 26.8,
      cycleStatus: 'Irregular (38d)',
      follicleCountRight: 12,
      model_name: 'Logistic Regression Pipeline'
    },
    {
      id: 'SAMPLE-003',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
      dateFormatted: 'Jan 15, 2026',
      probability: 54.0,
      risk_level: 'Moderate',
      prediction: 1,
      bmi: 25.4,
      cycleStatus: 'Mild Irregular (34d)',
      follicleCountRight: 10,
      model_name: 'Logistic Regression Pipeline'
    },
    {
      id: 'SAMPLE-004',
      timestamp: new Date().toISOString(),
      dateFormatted: 'Feb 12, 2026',
      probability: 38.6,
      risk_level: 'Moderate',
      prediction: 0,
      bmi: 24.1,
      cycleStatus: 'Regular (30d)',
      follicleCountRight: 7,
      model_name: 'Logistic Regression Pipeline'
    }
  ];

  const activeSourceList = historyList.length > 0
    ? historyList
    : (previewSampleData ? sampleTimelineData : []);

  // Filter chronologically (oldest to newest for line chart timeline)
  let chronologicalList = [...activeSourceList].reverse();

  if (timeframeFilter === '3') {
    chronologicalList = chronologicalList.slice(-3);
  } else if (timeframeFilter === '5') {
    chronologicalList = chronologicalList.slice(-5);
  }

  // Summary Metrics calculations
  const totalScans = activeSourceList.length;
  const latestItem = activeSourceList[0];
  const oldestItem = activeSourceList[activeSourceList.length - 1];

  const getRiskCategory = (prob: number) => {
    if (prob <= thresholdSettings.lowThreshold) return 'Low';
    if (prob >= thresholdSettings.highThreshold) return 'Elevated';
    return 'Moderate';
  };

  const latestProb = latestItem ? latestItem.probability : (predictionResult ? predictionResult.probabilityPercentage : 68);
  const latestLevel = getRiskCategory(latestProb);

  const initialProb = oldestItem ? oldestItem.probability : latestProb;
  const riskDelta = totalScans >= 2 ? (latestProb - initialProb) : 0;
  const averageRisk = totalScans > 0
    ? (activeSourceList.reduce((acc, curr) => acc + curr.probability, 0) / totalScans).toFixed(1)
    : latestProb.toFixed(1);

  const chartData = chronologicalList.map((item, index) => ({
    name: item.dateFormatted || `Scan #${index + 1}`,
    shortDate: item.dateFormatted ? item.dateFormatted.split(',')[0] : `Scan #${index + 1}`,
    risk: Number(item.probability.toFixed(1)),
    bmi: item.bmi ? Number(item.bmi.toFixed(1)) : 24.0,
    cycle: item.cycleStatus || 'Regular',
    riskLevel: getRiskCategory(item.probability),
    id: item.id,
    follicles: item.follicleCountRight ?? 'N/A'
  }));

  const selectedAssessment = activeSourceList.find(item => item.id === selectedPointId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. User Greeting & Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-300 flex items-center justify-center font-bold text-xl border border-teal-700/60 dark:border-teal-600/60 shadow-xs flex-shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                {user 
                  ? (isTelugu ? `తిరిగి స్వాగతం, ${user.full_name}` : `Welcome back, ${user.full_name}`)
                  : (isTelugu ? 'అసెస్‌మెంట్ డ్యాష్‌బోర్డ్' : 'Assessment Dashboard')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isAuthenticated
                  ? (isTelugu 
                      ? 'మీ ప్రాథమిక ఆరోగ్య ప్రొఫైల్ మరియు స్క్రీనింగ్ చరిత్ర క్లౌడ్ ఫైర్‌స్టోర్‌లో సురక్షితంగా నిల్వ చేయబడ్డాయి.'
                      : 'Your baseline health profile and screening history are securely stored in Cloud Firestore.')
                  : (isTelugu 
                      ? 'స్క్రీనింగ్ మరియు దీర్ఘకాలిక ట్రాకింగ్ వేదిక. మీ రికార్డులను భద్రపరచడానికి లాగిన్ అవ్వండి.'
                      : 'Screening and longitudinal tracking hub. Sign in to save your profile permanently.')}
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-auto"
              id="view-profile-dashboard-btn"
            >
              <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>{isTelugu ? 'నా ప్రొఫైల్' : 'My Profile'}</span>
            </Link>
          )}
        </div>

        {/* Visual Roadmap / How It Works Timeline */}
        <HowItWorksTimeline variant="dashboard" />

        {/* 2. Latest Screening Summary Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'తాజా స్క్రీనింగ్ ఫలితం' : 'Latest Screening'}
                </span>
                <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full font-bold">
                  {isTelugu ? 'మెషిన్ లెర్నింగ్ మోడల్' : 'ML Model Estimated'}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isTelugu ? 'రిస్క్ స్థాయి' : 'Risk Level'}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center text-sm font-extrabold px-3 py-1 rounded-xl border ${
                      latestLevel === 'Low'
                        ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                        : latestLevel === 'Moderate'
                        ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}>
                      {isTelugu
                        ? (latestLevel === 'Low' ? 'తక్కువ రిస్క్ (Low)' : latestLevel === 'Moderate' ? 'మధ్యస్థ రిస్క్ (Moderate)' : 'అధిక రిస్క్ (Higher)')
                        : (latestLevel === 'Low' ? 'Low Risk' : latestLevel === 'Moderate' ? 'Moderate Risk' : 'Higher Risk')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isTelugu ? 'మోడల్ అంచనా' : 'Model Estimate'}</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                    {typeof latestProb === 'number' ? latestProb.toFixed(1) : latestProb}%
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{isTelugu ? 'చివరి అసెస్‌మెంట్' : 'Last Assessment'}</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{latestItem?.dateFormatted || (isTelugu ? 'ఈరోజు సక్రియం' : 'Active Profile')}</span>
                  </div>
                </div>
              </div>
            </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <Link
                  to="/results"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-4 py-2.5 text-xs font-bold text-teal-900 dark:text-teal-200 transition-colors shadow-2xs"
                  id="dashboard-view-result-btn"
                >
                  <ShieldAlert className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <span>{isTelugu ? 'ఫలితం చూడండి' : 'View Result'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleStartAssessmentWithProfile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition-colors shadow-xs"
                  id="dashboard-new-screening-top-btn"
                >
                  <Stethoscope className="h-4 w-4 text-teal-300" />
                  <span>{isTelugu ? 'కొత్త అసెస్‌మెంట్' : 'New Assessment'}</span>
                </button>
              </div>
          </div>
        </div>

        {/* DAILY AFFIRMATION & MENTAL WELLNESS ENCOURAGEMENT */}
        <div id="daily-affirmation-section">
          <DailyAffirmationCard onAskAI={handleAskAI} />
        </div>

        {/* COMPACT QUICK SYMPTOM LOG WIDGET */}
        <div id="quick-symptom-log-widget-section">
          <QuickSymptomLogWidget
            userId={user?.id}
            onOpenFullModal={() => setShowDailySymptomModal(true)}
            onLogSaved={(newLog) => {
              setDailySymptoms((prev) => {
                const existingIdx = prev.findIndex(l => l.dateKey === newLog.dateKey);
                if (existingIdx >= 0) {
                  const next = [...prev];
                  next[existingIdx] = newLog;
                  return next;
                }
                return [newLog, ...prev];
              });
            }}
          />
        </div>

        {/* 7-DAY DIET PLAN & TODAY'S MEAL BOARD */}
        <div id="diet-plan-dashboard-widget-section">
          <DietPlanDashboardWidget onOpenAssistant={onOpenAssistant} />
        </div>

        {/* 3. Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isTelugu ? 'త్వరిత చర్యలు' : 'Quick Actions'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-pcosense-emergency'))}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800"
                id="quick-action-emergency-trigger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'అత్యవసర సూచనలు' : 'Emergency Triage'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUserSettingsModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                id="quick-action-contrast-trigger"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'థీమ్ & కాంట్రాస్ట్' : 'Contrast & Themes'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {/* Action 1: Resume / New Assessment */}
            <button
              type="button"
              onClick={handleStartAssessmentWithProfile}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-new-assessment"
            >
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Stethoscope className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate w-full">
                {isTelugu ? 'కొత్త అసెస్‌మెంట్' : 'New Assessment'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? '4 దశల స్క్రీనింగ్' : 'Screening wizard'}
              </span>
            </button>

            {/* Action 2: View Latest Result */}
            <Link
              to="/results"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-view-latest-result"
            >
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate w-full">
                {isTelugu ? 'తాజా ఫలితం' : 'View Latest Result'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {typeof latestProb === 'number' ? `${latestProb.toFixed(1)}% score` : 'Clinical analysis'}
              </span>
            </Link>

            {/* Action 2.8: Trends & Regression Projection */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('trends-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all text-left group cursor-pointer"
              id="quick-action-view-trends-regression"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 truncate w-full">
                {isTelugu ? 'ట్రెండ్స్ & ప్రొజెక్షన్' : 'Weekly Trends'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'రిగ్రెషన్ & నిలకడ' : 'Regression forecast'}
              </span>
            </button>

            {/* Action 3: Check Symptom Trends & Quick Check-in */}
            <button
              type="button"
              onClick={() => setShowDailySymptomModal(true)}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-check-symptom-trends"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Activity className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate w-full">
                {isTelugu ? 'లక్షణాల నమోదు' : 'Daily Check-In'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'వాయిస్ / టచ్ లాగ్' : 'Voice & touch log'}
              </span>
            </button>

            {/* Action 3.5: 7-Day Diet Plan & Cravings */}
            <Link
              to="/diet-plan"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-diet-plan"
            >
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Utensils className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate w-full">
                {isTelugu ? 'డైట్ ప్లాన్ & బాట్' : '7-Day Diet'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'క్రేవింగ్స్ & మీల్స్' : 'Meals & cravings'}
              </span>
            </Link>

            {/* Action 3.55: Scan Your Food (Gemini Multimodal AI GI & PCOS Analyzer) */}
            <Link
              to="/scan-food"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#6B9E78] dark:hover:border-[#6B9E78] hover:shadow-sm transition-all text-left group"
              id="quick-action-scan-food"
            >
              <div className="h-9 w-9 rounded-xl bg-[#E8F2EA] dark:bg-[#1A3022] text-[#263D32] dark:text-[#E8F2EA] border border-[#C8DEC3] dark:border-[#2D4C37] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Camera className="h-4.5 w-4.5 text-[#6B9E78]" />
              </div>
              <span className="text-xs font-bold text-[#263D32] dark:text-white group-hover:text-[#6B9E78] dark:group-hover:text-[#8FB899] truncate w-full flex items-center justify-between">
                <span>{isTelugu ? 'ఆహార స్కానర్' : 'Scan Food'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E8F2EA] text-[#263D32] font-black border border-[#C8DEC3]">AI</span>
              </span>
              <span className="text-[10px] text-[#527060] dark:text-[#A8C7B1] mt-0.5 truncate w-full">
                {isTelugu ? 'GI & PCOS విశ్లేషణ' : 'GI & PCOS suit'}
              </span>
            </Link>

            {/* Action 3.7: PCOS Daily Habit Tracker (Inositol, Sleep, Sugar) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('daily-habits-tracker-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-daily-habits"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate w-full">
                {isTelugu ? 'రోజువారీ అలవాట్లు' : 'PCOS Habits'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'ఇనోసిటాల్ & నిద్ర' : 'Inositol & sleep logs'}
              </span>
            </button>

            {/* Action 4: Find Healthcare Specialists Nearby */}
            <Link
              to="/find-care"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-find-healthcare"
            >
              <div className="h-9 w-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <MapPin className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 truncate w-full">
                {isTelugu ? 'వైద్యులను కనుగొనండి' : 'Find Specialists'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'దగ్గరి గైనకాలజిస్టులు' : 'PCOS doctors near you'}
              </span>
            </Link>

            {/* Action 5: Share with Doctor (Encrypted QR Code) */}
            <button
              type="button"
              onClick={() => setShowShareDoctorModal(true)}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-share-doctor"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <QrCode className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 truncate w-full">
                {isTelugu ? 'డాక్టర్‌తో పంచుకోండి' : 'Share with Doctor'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'సురక్షిత QR & లింక్' : 'Encrypted QR & Brief'}
              </span>
            </button>

            {/* Action 6: Milestone Badges & Streaks */}
            <a
              href="#milestone-badges-section"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-milestone-badges"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Award className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate w-full">
                {isTelugu ? 'బ్యాడ్జ్‌లు & మైలురాళ్ళు' : 'Badges & XP'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'లక్ష్యాలు & పురోగతి' : 'Streak & levels'}
              </span>
            </a>

            {/* Action 7: Display & High Contrast Settings */}
            <button
              type="button"
              onClick={() => setShowUserSettingsModal(true)}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-user-settings"
            >
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Palette className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate w-full">
                {isTelugu ? 'డిస్‌ప్లే సెట్టింగ్‌లు' : 'User Settings'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'హై కాంట్రాస్ట్ & రంగులు' : 'High contrast'}
              </span>
            </button>

            {/* Action 8: Ask PCOSense AI */}
            <button
              type="button"
              onClick={() => handleAskAI(isTelugu ? 'నా అంచనా రిస్క్ ఫలితాన్ని వివరించండి' : 'Explain my prediction result in simple terms')}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-ask-ai"
            >
              <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400 truncate w-full">
                {isTelugu ? 'PCOSense AI' : 'Ask AI'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'సహాయం & వివరణ' : 'Voice assistant'}
              </span>
            </button>

            {/* Action 9: Wellness Goals Setup & Progress */}
            <a
              href="#wellness-goals-section"
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-wellness-goals"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Sliders className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate w-full">
                {isTelugu ? 'ఆరోగ్య లక్ష్యాలు' : 'Wellness Goals'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'అడుగులు & నీటి లక్ష్యాలు' : 'Targets & progress'}
              </span>
            </a>

            {/* Action 10: Help Us Improve Feedback */}
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-sm transition-all text-left group"
              id="quick-action-help-improve"
            >
              <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <MessageSquare className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 truncate w-full">
                {isTelugu ? 'అభిప్రాయం తెలపండి' : 'Help Us Improve'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full">
                {isTelugu ? 'సూచనలు & రేటింగ్' : 'Feedback & review'}
              </span>
            </button>
          </div>
        </div>

        {/* DAILY WALKING STEPS & SMART HYDRATION TRACKING WIDGET */}
        <div id="dashboard-walking-hydration-section">
          <WalkingHydrationDashboardWidget />
        </div>

        {/* PCOS DAILY HABIT TRACKER (INOSITOL, 8H SLEEP, AVOIDED REFINED SUGAR, ETC.) */}
        <div id="daily-habits-tracker-container">
          <DailyHabitTrackerSection
            userId={user?.id}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* PERSONAL WELLNESS GOALS & TARGETS MODULE WITH PROGRESS BARS */}
        <div id="wellness-goals-section">
          <WellnessGoalsModule
            userId={user?.id}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* TRENDS SECTION: WEEKLY CONSISTENCY IN LOGGING HYDRATION, YOGA & NUTRITION WITH OLS REGRESSION PROJECTION */}
        <div id="trends-section">
          <WeeklyTrendsSection
            userId={user?.id}
            isDark={isDark}
            onAskAI={handleAskAI}
            onOpenHydration={() => {
              const el = document.getElementById('hydration-activity-trend-section') || document.getElementById('wellness-goals-module');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenYoga={() => navigate('/yoga-exercises')}
            onOpenNutrition={() => navigate('/diet-plan')}
          />
        </div>

        {/* RECHARTS WELLNESS TRENDS DASHBOARD: ACTIVITY, HYDRATION & SYMPTOM FREQUENCY OVER TIME */}
        <div id="wellness-trends-dashboard-section">
          <WellnessTrendsDashboard
            userId={user?.id}
            onOpenSymptomLogger={() => {
              const el = document.getElementById('symptom-daily-log-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setShowDailySymptomModal(true);
              }
            }}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* NEW SYMPTOM DAILY LOG COMPONENT: RECORD MOOD, FATIGUE, CYCLE IRREGULARITIES & PERSIST IN DATABASE */}
        <div id="symptom-daily-log-section">
          <SymptomDailyLog
            userId={user?.id}
            onLogSaved={(newLog) => {
              setDailySymptoms((prev) => {
                const existingIdx = prev.findIndex(l => l.dateKey === newLog.dateKey || l.id === newLog.id);
                if (existingIdx >= 0) {
                  const next = [...prev];
                  next[existingIdx] = newLog;
                  return next;
                }
                return [newLog, ...prev];
              });
            }}
          />
        </div>

        {/* 7-DAY RECHARTS HYDRATION & ACTIVITY CONSISTENCY TREND LINE */}
        <div id="hydration-activity-trend-section">
          <HydrationActivityConsistencyChart
            userId={user?.id}
            onOpenGoalsModal={() => {
              const el = document.getElementById('wellness-goals-module');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* RECHARTS DAILY SYMPTOM & HORMONE TRENDS VISUALIZATION */}
        <div id="symptom-trends-section">
          <SymptomTrendsChart
            logs={dailySymptoms}
            onOpenLogger={() => setShowDailySymptomModal(true)}
            onLogsUpdated={(updated) => setDailySymptoms(updated)}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* SYMPTOM vs RISK FACTOR TRIGGER CORRELATION HEATMAP */}
        <div id="symptom-risk-heatmap-section">
          <SymptomRiskHeatmap
            logs={dailySymptoms}
            historyList={historyList}
            onOpenLogger={() => setShowDailySymptomModal(true)}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* MILESTONE BADGES & HABIT REWARDS SYSTEM */}
        <div id="milestone-badges-section">
          <MilestoneBadgesCard
            userId={user?.id}
            onOpenLogger={() => setShowDailySymptomModal(true)}
            onStartScreening={handleStartAssessmentWithProfile}
          />
        </div>

        {/* ACTIVE HEALTH CHALLENGES & STREAK OBJECTIVES */}
        <div id="health-challenges-section">
          <HealthChallengesSection
            userId={user?.id}
            onStartAssessment={handleStartAssessmentWithProfile}
            onOpenSymptomLogger={() => setShowDailySymptomModal(true)}
            onAskAI={handleAskAI}
          />
        </div>

        {/* 4. 30-DAY LONGITUDINAL HEALTH SUMMARY (AI Natural Language Synthesis) */}
        <SummaryInsightsCard
          history={historyList}
          currentAssessment={predictionResult}
          streak={getStoredUserStreak(user?.id || 'default')}
          patientProfile={profile}
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* PCOSENSE AI INTERACTIVE DASHBOARD SECTION */}
        <div className="rounded-3xl bg-[#263D32] dark:bg-[#1A2820] p-6 text-white shadow-md border border-[#3A5547] dark:border-[#2C3E33] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#35513D] border border-[#4D7058] flex items-center justify-center text-[#E8F2EA] flex-shrink-0 shadow-inner">
                <Sparkles className="h-6 w-6 text-[#A8C7B1]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">{isTelugu ? 'PCOSense AI చాట్‌బాట్' : 'Ask PCOSense AI Chatbot'}</h3>
                  <span className="text-[10px] bg-[#35513D] text-[#E8F2EA] border border-[#4D7058] px-2 py-0.5 rounded-full font-semibold">
                    {isTelugu ? 'వాయిస్ & ప్రశ్నలు' : 'Voice & Multi-Turn'}
                  </span>
                </div>
                <p className="text-xs text-[#D2E4D6] mt-0.5">
                  {isTelugu 
                    ? 'మీ రిస్క్ ఫలితం, లక్షణాలు, BMI, జీవనశైలి అలవాట్లు లేదా పోషకాహారం గురించి వాయిస్ లేదా టెక్స్ట్ ద్వారా అడగండి.'
                    : 'Ask questions about your risk prediction, symptoms, BMI, lifestyle habits, or nutrition with voice or text.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleAskAI()}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#6B9E78] hover:bg-[#578463] text-white font-bold text-xs transition-all shadow-sm active:scale-95 whitespace-nowrap"
              id="dashboard-open-chatbot-action-btn"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{isTelugu ? 'AI చాట్‌బాట్ తెరవండి' : 'Open AI Chatbot'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#3A5547] dark:border-[#2C3E33] flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#A8C7B1] font-medium">{isTelugu ? 'సూచించిన ప్రశ్నలు:' : 'Quick Prompts:'}</span>
            <button
              onClick={() => handleAskAI(isTelugu ? 'నా అంచనా రిస్క్ ఫలితాన్ని వివరించండి' : 'Explain my prediction result in simple terms')}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              {isTelugu ? 'నా ఫలితాన్ని వివరించండి' : 'Explain my prediction result'}
            </button>
            <button
              onClick={() => handleAskAI(isTelugu ? 'PCOS నియంత్రణకు మంచి ఆహారం ఏమిటి?' : 'What nutrition and diet changes help with PCOS?')}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              {isTelugu ? 'పోషకాహారం & డైట్ చిట్కాలు' : 'Nutrition & Diet Advice'}
            </button>
            <button
              onClick={() => handleAskAI(isTelugu ? 'నా BMI మరియు లక్షణాలు దేనిని సూచిస్తున్నాయి?' : 'What do my BMI and symptoms indicate?')}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              {isTelugu ? 'BMI & లక్షణాలు' : 'BMI & Symptoms'}
            </button>
            <button
              onClick={() => handleAskAI(isTelugu ? 'డాక్టర్‌ను నేను ఎలాంటి ప్రశ్నలు అడగాలి?' : 'What questions should I ask my doctor during a PCOS consultation?')}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              {isTelugu ? 'డాక్టర్ సంప్రదింపుల ప్రశ్నలు' : 'Doctor Consultation Questions'}
            </button>
          </div>
        </div>

        {/* CLINICAL ALERT TRIGGER BANNER (When score exceeds custom elevated threshold) */}
        {thresholdSettings.enableAlertBanner && latestProb >= thresholdSettings.highThreshold && (
          <div className="rounded-3xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                    Clinical Action Advisory
                  </span>
                  <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                    Estimated Risk ({latestProb.toFixed(1)}%) Meets or Exceeds Your Custom Alert Cutoff (≥{thresholdSettings.highThreshold}%)
                  </h3>
                </div>
                <p className="text-xs text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                  Your latest screening probability indicates significant alignment with Rotterdam PCOS diagnostic features (e.g. ovulatory irregularities, androgen excess markers, or elevated follicle count). We recommend scheduling a formal clinical consultation with a gynecologist or endocrinologist.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <button
                type="button"
                onClick={() => setShowDoctorGuide(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Stethoscope className="h-3.5 w-3.5 text-rose-200" />
                <span>Doctor Guide</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('risk-threshold-manager-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-100/50 dark:hover:bg-slate-700 text-rose-900 dark:text-rose-200 font-semibold text-xs transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Adjust Cutoffs</span>
              </button>
            </div>
          </div>
        )}

        {/* SAVED PROFILE SHORTCUT BANNER */}
        {isAuthenticated && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'క్లౌడ్ ఫైర్‌స్టోర్ ప్రొఫైల్ సక్రియంగా ఉంది' : 'Cloud Firestore Profile Active'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {isTelugu 
                    ? `మీ ఆరోగ్య సూచికలు (BMI, పీరియడ్స్ క్రమం, అల్ట్రాసౌండ్ మరియు లక్షణాలు) మీ Firebase ఖాతాలో సేవ్ అయ్యాయి.`
                    : `Your medical indicators (BMI, cycle regularity, ultrasound and symptoms) are saved to your Firebase account (UID: ${user?.id.substring(0, 10)}...).`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700 whitespace-nowrap"
              >
                {isTelugu ? 'వివరాలు మార్చండి' : 'Edit Saved Data'}
              </Link>
              <button
                onClick={handleStartAssessmentWithProfile}
                className="px-3.5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors whitespace-nowrap shadow-xs"
              >
                {isTelugu ? 'ప్రొఫైల్‌తో స్క్రీనింగ్' : 'Pre-Fill & Screen'}
              </button>
            </div>
          </div>
        )}

        {/* TOP STATUS CARDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Card 1: Latest Estimated Risk */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isTelugu ? 'అంచనా వేసిన రిస్క్' : 'Estimated Risk'}
              </span>
              <MetricTooltipTrigger metricId="risk-score" onAskAI={handleAskAI} isDark={isDark} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{typeof latestProb === 'number' ? latestProb.toFixed(1) : latestProb}%</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                latestLevel === 'Low'
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : latestLevel === 'Moderate'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {isTelugu
                  ? (latestLevel === 'Low' ? 'తక్కువ రిస్క్' : latestLevel === 'Moderate' ? 'మధ్యస్థ రిస్క్' : 'అధిక రిస్క్')
                  : latestLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTelugu ? 'లాజిస్టిక్ రిగ్రెషన్ పైప్‌లైన్ ద్వారా లెక్కింపు.' : 'Calculated using Logistic Regression pipeline.'}
            </p>
          </div>

          {/* Card 2: Key Model Drivers */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isTelugu ? 'యాక్టివ్ బేస్‌లైన్ ప్రొఫైల్' : 'Active Baseline Profile'}
              </span>
              <MetricTooltipTrigger metricId="cycle-rhythm" onAskAI={handleAskAI} isDark={isDark} />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{isTelugu ? 'పీరియడ్స్ క్రమం:' : 'Cycle Rhythm:'}</span>
                <div className="flex items-center gap-1">
                  <strong className="text-slate-900 dark:text-slate-200">
                    {patientData['Cycle(R/I)'] === 2 ? (isTelugu ? 'క్రమమైనది' : 'Regular') : (isTelugu ? 'అసక్రమమైనది' : 'Irregular')}
                  </strong>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{isTelugu ? 'శరీర ద్రవ్యరాశి (BMI):' : 'Body Mass Index:'}</span>
                <div className="flex items-center gap-1">
                  <strong className="text-slate-900 dark:text-slate-200">{patientData['BMI']} kg/m²</strong>
                  <MetricTooltipTrigger metricId="bmi-metabolic" onAskAI={handleAskAI} isDark={isDark} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{isTelugu ? 'అదనపు వెంట్రుకలు:' : 'Hirsutism Signs:'}</span>
                <div className="flex items-center gap-1">
                  <strong className="text-slate-900 dark:text-slate-200">
                    {patientData['hair growth(Y/N)'] ? (isTelugu ? 'ఉన్నాయి' : 'Reported') : (isTelugu ? 'లేవు' : 'None')}
                  </strong>
                  <MetricTooltipTrigger metricId="hirsutism-androgens" onAskAI={handleAskAI} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Recent Activity */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isTelugu ? 'అసెస్‌మెంట్ చరిత్ర' : 'Assessment History'}
              </span>
              <MetricTooltipTrigger metricId="habit-streak" onAskAI={handleAskAI} isDark={isDark} />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {historyList[0]?.dateFormatted || (isTelugu ? 'ఈరోజు సక్రియం' : 'Active Today')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTelugu 
                ? `${historyList.length} అసెస్‌మెంట్ రికార్డులు క్లౌడ్ ఫైర్‌స్టోర్‌లో భద్రపరచబడ్డాయి.`
                : `${historyList.length} assessment record${historyList.length === 1 ? '' : 's'} stored in Cloud Firestore.`}
            </p>
          </div>

        </div>

        {/* RISK HISTORY TREND LINE CHART */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          
          {/* Chart Header & Interactive Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  {isTelugu ? 'దీర్ఘకాలిక రిస్క్ స్కోర్ ట్రెండ్' : 'Longitudinal Risk Score Trajectory'}
                </h2>
                {previewSampleData && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full font-bold">
                    {isTelugu ? 'డెమో మోడ్' : 'Demo Mode'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu 
                  ? 'మెషిన్ లెర్నింగ్ ద్వారా అంచనా వేసిన రిస్క్ మరియు శారీరక మార్పుల విశ్లేషణ.'
                  : 'Visualizing ML-estimated PCOS probability and physiological marker changes across sequential screenings.'}
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartMetric('risk')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'risk'
                      ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isTelugu ? 'రిస్క్ స్కోర్ (%)' : 'Risk Score (%)'}
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('dual_bmi')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'dual_bmi'
                      ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isTelugu ? 'రిస్క్ + BMI డ్యూయల్ యాక్సిస్' : 'Risk + BMI Dual Axis'}
                </button>
              </div>

              {/* Timeframe Filter */}
              {chartData.length > 3 && (
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTimeframeFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      timeframeFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isTelugu ? 'అన్నీ' : 'All'} ({activeSourceList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframeFilter('5')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      timeframeFilter === '5'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isTelugu ? 'గడచిన 5' : 'Last 5'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframeFilter('3')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      timeframeFilter === '3'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isTelugu ? 'గడచిన 3' : 'Last 3'}
                  </button>
                </div>
              )}

              {/* Threshold Toggle & Customize Button */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowThresholds(!showThresholds)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    showThresholds
                      ? 'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                  title="Toggle clinical threshold reference lines on chart"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'పరిమితులు' : 'Thresholds'} ({thresholdSettings.lowThreshold}%/{thresholdSettings.highThreshold}%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('risk-threshold-manager-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  title="Customize Alert Cutoffs & Guidelines"
                >
                  <Sliders className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'మార్చండి' : 'Configure'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Longitudinal Trend KPI Summary Cards */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              
              {/* Stat 1: Latest Probability */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isTelugu ? 'తాజా స్కోరు' : 'Latest Score'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {typeof latestProb === 'number' ? latestProb.toFixed(1) : latestProb}%
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    latestLevel === 'Low'
                      ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                      : latestLevel === 'Moderate'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}>
                    {isTelugu
                      ? (latestLevel === 'Low' ? 'తక్కువ' : latestLevel === 'Moderate' ? 'మధ్యస్థ' : 'అధికం')
                      : latestLevel}
                  </span>
                </div>
              </div>

              {/* Stat 2: Trajectory Delta */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isTelugu ? 'ట్రెండ్ మార్పు' : 'Trajectory Delta'}
                </span>
                <div className="flex items-center gap-1">
                  {totalScans >= 2 ? (
                    <>
                      {riskDelta < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span className="text-base font-extrabold text-teal-700 dark:text-teal-300">
                            {riskDelta.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{isTelugu ? 'మెరుగుపడింది' : 'Improved'}</span>
                        </>
                      ) : riskDelta > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                            +{riskDelta.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{isTelugu ? 'పెరిగింది' : 'Increased'}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-4 w-4 text-slate-400" />
                          <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">0.0%</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{isTelugu ? 'స్థిరంగా ఉంది' : 'Stable'}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {isTelugu ? 'బేస్‌లైన్ నమోదు చేయబడింది' : 'Baseline established'}
                    </span>
                  )}
                </div>
              </div>

              {/* Stat 3: Average History */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isTelugu ? 'చారిత్రక సగటు' : 'Historical Mean'}
                </span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {averageRisk}%
                </div>
              </div>

              {/* Stat 4: Tracked Screenings */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isTelugu ? 'మొత్తం స్కాన్లు' : 'Data Points'}
                </span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {totalScans} {isTelugu ? 'స్కాన్లు' : `Scan${totalScans === 1 ? '' : 's'}`}
                </div>
              </div>

            </div>
          )}

          {/* Recharts LineChart Canvas */}
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-72 sm:h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 15, right: chartMetric === 'dual_bmi' ? 25 : 15, left: -5, bottom: 5 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length) {
                        const payload = e.activePayload[0].payload;
                        setSelectedPointId(payload.id);
                      }
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#1e293b' : '#f1f5f9'}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                    />

                    {/* Primary Left Y-Axis: Risk Score (%) */}
                    <YAxis
                      yAxisId="left"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                      unit="%"
                    />

                    {/* Secondary Right Y-Axis: BMI (kg/m²) */}
                    {chartMetric === 'dual_bmi' && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={['dataMin - 3', 'dataMax + 3']}
                        tick={{ fontSize: 11, fill: '#818cf8' }}
                        tickLine={{ stroke: '#818cf8' }}
                        axisLine={{ stroke: '#818cf8' }}
                        unit=" BMI"
                      />
                    )}

                    {/* Threshold Reference Lines */}
                    {showThresholds && (
                      <>
                        <ReferenceLine
                          yAxisId="left"
                          y={thresholdSettings.highThreshold}
                          stroke="#f43f5e"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `${isTelugu ? 'అధికం' : 'Elevated'} (≥${thresholdSettings.highThreshold}%)`,
                            position: 'insideTopRight',
                            fill: '#f43f5e',
                            fontSize: 10,
                            fontWeight: 700
                          }}
                        />
                        <ReferenceLine
                          yAxisId="left"
                          y={thresholdSettings.lowThreshold}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{
                            value: `${isTelugu ? 'తక్కువ' : 'Low'} (≤${thresholdSettings.lowThreshold}%)`,
                            position: 'insideBottomRight',
                            fill: '#10b981',
                            fontSize: 10,
                            fontWeight: 700
                          }}
                        />
                      </>
                    )}

                    {/* Custom Interactive Tooltip */}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isHigh = data.risk >= thresholdSettings.highThreshold;
                          const isLow = data.risk <= thresholdSettings.lowThreshold;
                          return (
                            <div className="rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 text-white shadow-2xl text-xs space-y-2 max-w-xs z-50">
                              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                                <div>
                                  <span className="font-bold text-slate-200 block text-xs">{data.name}</span>
                                  <span className="font-mono text-[10px] text-teal-400">{data.id}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  isLow
                                    ? 'bg-teal-900/80 text-teal-300 border border-teal-700'
                                    : isHigh
                                    ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                                    : 'bg-amber-900/80 text-amber-300 border border-amber-700'
                                }`}>
                                  {isTelugu
                                    ? (isLow ? 'తక్కువ రిస్క్' : isHigh ? 'అధిక రిస్క్' : 'మధ్యస్థ రిస్క్')
                                    : (data.riskLevel || (isLow ? 'Low' : isHigh ? 'Elevated' : 'Moderate'))}
                                </span>
                              </div>

                              <div className="space-y-1.5 pt-0.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">{isTelugu ? 'PCOS సంభావ్యత:' : 'PCOS Probability:'}</span>
                                  <strong className="text-sm font-black text-teal-300">{data.risk}%</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">{isTelugu ? 'శరీర ద్రవ్యరాశి (BMI):' : 'Body Mass Index:'}</span>
                                  <span className="font-semibold text-indigo-300">{data.bmi} kg/m²</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">{isTelugu ? 'రుతు క్రమం:' : 'Cycle Rhythm:'}</span>
                                  <span className="text-slate-200 font-medium">{data.cycle}</span>
                                </div>
                                {data.follicles !== 'N/A' && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">{isTelugu ? 'కుడి అండాశయ ఫోలికల్స్:' : 'Right Follicles:'}</span>
                                    <span className="text-slate-200 font-medium">{data.follicles} antral</span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400">
                                <Info className="h-3 w-3 text-teal-400 shrink-0" />
                                <span>{isTelugu ? 'వివరాలు చూడటానికి బిందువును క్లిక్ చేయండి' : 'Click point on line to inspect scan details'}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Legend */}
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />

                    {/* Primary Line: PCOS Risk (%) */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="risk"
                      name={isTelugu ? 'PCOS రిస్క్ స్కోరు (%)' : 'PCOS Risk Score (%)'}
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isSelected = payload.id === selectedPointId;
                        const fillColor = payload.risk >= thresholdSettings.highThreshold
                          ? '#f43f5e'
                          : payload.risk <= thresholdSettings.lowThreshold
                          ? '#10b981'
                          : '#f59e0b';
                        return (
                          <circle
                            key={`dot-${payload.id}`}
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 6.5 : 4.5}
                            fill={fillColor}
                            stroke={isDark ? '#0f172a' : '#ffffff'}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            className="cursor-pointer transition-all hover:scale-125"
                          />
                        );
                      }}
                      activeDot={{
                        r: 7,
                        stroke: isDark ? '#022c22' : '#ffffff',
                        strokeWidth: 2.5,
                        fill: '#0d9488'
                      }}
                    />

                    {/* Optional Secondary Line: BMI */}
                    {chartMetric === 'dual_bmi' && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bmi"
                        name={isTelugu ? 'BMI (kg/m²)' : 'BMI (kg/m²)'}
                        stroke="#6366f1"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3.5, fill: '#6366f1', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 1 }}
                        activeDot={{ r: 6, fill: '#6366f1' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Threshold Legend Guide */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isTelugu ? 'క్లినికల్ పరిమితులు' : 'Active Clinical Bands'} ({thresholdSettings.preset.toUpperCase()}):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{isTelugu ? 'తక్కువ రిస్క్' : 'Low Risk'} (0 – {thresholdSettings.lowThreshold}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>{isTelugu ? 'మధ్యస్థ రిస్క్' : 'Moderate Risk'} ({thresholdSettings.lowThreshold + 1} – {thresholdSettings.highThreshold - 1}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>{isTelugu ? 'అధిక రిస్క్' : 'Elevated Risk'} ({thresholdSettings.highThreshold} – 100%)</span>
                  </div>
                </div>

                {previewSampleData && (
                  <button
                    type="button"
                    onClick={() => setPreviewSampleData(false)}
                    className="text-teal-700 dark:text-teal-400 font-bold hover:underline"
                  >
                    {isTelugu ? 'డెమో డేటాను దాచండి' : 'Hide Demo Data'}
                  </button>
                )}
              </div>

              {/* Selected Point Deep Dive Card */}
              {selectedAssessment && (
                <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-950 dark:text-teal-100">
                        {isTelugu ? 'ఎంచుకున్న స్కాన్:' : 'Selected Scan:'} {selectedAssessment.dateFormatted}
                      </span>
                      <span className="font-mono text-[10px] text-teal-700 dark:text-teal-300">
                        ({selectedAssessment.id})
                      </span>
                    </div>
                    <p className="text-xs text-teal-900 dark:text-teal-200">
                      {isTelugu
                        ? `సంభావ్యత ${selectedAssessment.probability}% (${selectedAssessment.risk_level} రిస్క్), BMI ${selectedAssessment.bmi} kg/m² మరియు ${selectedAssessment.cycleStatus}.`
                        : `Probability was ${selectedAssessment.probability}% (${selectedAssessment.risk_level} Risk) with BMI ${selectedAssessment.bmi} kg/m² and ${selectedAssessment.cycleStatus}.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAskAI(isTelugu ? `${selectedAssessment.dateFormatted} నాటి అసెస్‌మెంట్ (${selectedAssessment.probability}% రిస్క్) విశ్లేషించండి.` : `Analyze my assessment from ${selectedAssessment.dateFormatted} where risk was ${selectedAssessment.probability}%`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 dark:bg-teal-700 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-2xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                      <span>{isTelugu ? 'ఈ స్కాన్ గురించి AI ని అడగండి' : 'Ask AI About This Scan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPointId(null)}
                      className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                      title="Dismiss selection"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Empty State when no assessments exist yet */
            <div className="py-12 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'ఇంకా ఎలాంటి రికార్డులు నమోదు కాలేదు' : 'No Longitudinal Data Points Recorded Yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu
                    ? 'మీ మొదటి క్లినికల్ స్క్రీనింగ్‌ను పూర్తి చేయండి. తర్వాతి అసెస్‌మెంట్లు మీ దీర్ఘకాలిక మార్పులను ఈ చార్టులో చూపిస్తాయి.'
                    : 'Complete your first clinical screening to establish your baseline. Subsequent assessments will plot your longitudinal trajectory over time on this Recharts line chart.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleStartAssessmentWithProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 text-white text-xs font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-xs"
                >
                  <Stethoscope className="h-3.5 w-3.5 text-teal-300" />
                  <span>{isTelugu ? 'మొదటి అసెస్‌మెంట్ ప్రారంభించండి' : 'Start First Assessment'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSampleData(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Activity className="h-3.5 w-3.5 text-slate-400" />
                  <span>{isTelugu ? 'డెమో ట్రెండ్ కర్వ్ ప్రివ్యూ' : 'Preview Demo Trend Curve'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* DAILY HEALTH GOALS & HABIT STREAK MANAGER */}
        <HealthGoalsManager
          userId={user?.id || 'guest'}
          currentRiskScore={latestProb}
          currentRiskLevel={latestLevel}
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* PROACTIVE LIFESTYLE & METABOLIC TIPS WIDGET */}
        <ProactiveLifestyleTipsWidget
          currentRiskScore={latestProb}
          currentRiskLevel={latestLevel}
          bmi={patientData['BMI'] || 24.2}
          cycleStatus={patientData['Cycle(R/I)'] === 4 || patientData['Cycle(R/I)'] === 5 ? 'Irregular' : 'Regular'}
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* QUICK HELP & HEALTH RISK METRICS INTERACTIVE GUIDE */}
        <QuickHelpMetricsGuide
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* WEEKLY DIGEST & HEALTH GOALS PROGRESS EMAIL OPT-IN */}
        <WeeklySummaryEmailOptIn
          userEmail={user?.email || 'patient@example.com'}
          history={historyList}
          currentRiskScore={latestProb}
          streak={getStoredUserStreak(user?.id || 'default')}
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* COMMUNITY & CLINICAL RESOURCES DIRECTORY */}
        <CommunityResourcesWidget
          onAskAI={handleAskAI}
          isDark={isDark}
        />

        {/* CLINICAL ALERT THRESHOLDS & BOUNDARY CUSTOMIZER */}
        <div id="risk-threshold-manager-section">
          <RiskThresholdManager
            currentScore={latestProb}
            currentRiskLevel={latestLevel}
            onThresholdsChange={(newSettings) => setThresholdSettings(newSettings)}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        </div>

        {/* PIPELINE VISUALIZATION COMPONENT */}
        <PipelineFlowVisualizer currentStepId="dashboard" />

        {/* SAVED ASSESSMENTS TABLE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {isTelugu ? 'నమోదైన అసెస్‌మెంట్ రికార్డులు' : 'Logged Assessment Records'}
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
                id="dashboard-export-pdf-btn"
                title={isTelugu ? 'క్లినికల్ PDF నివేదికను డౌన్‌లోడ్ చేయండి' : 'Download comprehensive clinical PDF report'}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'PDF నివేదిక' : 'Export PDF'}</span>
              </button>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {historyList.length} {isTelugu ? 'మొత్తం' : 'Total'}
              </span>
            </div>
          </div>

          {historyList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 pr-4">{isTelugu ? 'ఐడీ' : 'Assessment ID'}</th>
                    <th className="pb-3 px-4">{isTelugu ? 'తేదీ' : 'Date'}</th>
                    <th className="pb-3 px-4">{isTelugu ? 'రిస్క్ స్థాయి' : 'Risk Level'}</th>
                    <th className="pb-3 px-4">{isTelugu ? 'మోడల్ శాతం' : 'Model Probability'}</th>
                    <th className="pb-3 px-4">{isTelugu ? 'పీరియడ్స్' : 'Cycle'}</th>
                    <th className="pb-3 pl-4 text-right">{isTelugu ? 'చర్యలు' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historyList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-teal-300">{item.id}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.dateFormatted}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.risk_level === 'Low'
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            : item.risk_level === 'Moderate'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {isTelugu 
                            ? (item.risk_level === 'Low' ? 'తక్కువ' : item.risk_level === 'Moderate' ? 'మధ్యస్థ' : 'అధికం')
                            : item.risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.probability}%</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.cycleStatus}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {isTelugu ? 'నమోదైన అసెస్‌మెంట్ రికార్డులు లేవు.' : 'No saved assessment records.'}
            </div>
          )}
        </div>

        {/* Doctor Discussion Guide Modal */}
        <DoctorDiscussionGuide
          isOpen={showDoctorGuide}
          onClose={() => setShowDoctorGuide(false)}
          prediction={predictionResult}
          patientData={patientData}
        />

        {/* Share With Doctor (QR Code & Encrypted Provider Link) Modal */}
        <ShareWithDoctorModal
          isOpen={showShareDoctorModal}
          onClose={() => setShowShareDoctorModal(false)}
          latestAssessment={latestItem}
          onAskAI={handleAskAI}
        />

        {/* User Accessibility & Custom Palette Settings Modal */}
        <UserSettingsModal
          isOpen={showUserSettingsModal}
          onClose={() => setShowUserSettingsModal(false)}
        />

        {/* 1-Minute Daily Symptom & Hormone Check-In Modal */}
        <DailySymptomTrackerModal
          isOpen={showDailySymptomModal}
          onClose={() => setShowDailySymptomModal(false)}
          onSaved={(newLog) => {
            setDailySymptoms((prev) => {
              const existingIdx = prev.findIndex(l => l.dateKey === newLog.dateKey);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = newLog;
                return next;
              }
              return [newLog, ...prev];
            });
          }}
        />

        {/* Subtle Help Us Improve Modal (automatically triggers on 5th assessment or via user action) */}
        <HelpUsImproveModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          assessmentCount={historyList.length || 5}
        />

        {/* Wellness Goals Modal View if requested */}
        {showWellnessGoalsModal && (
          <WellnessGoalsModule
            userId={user?.id}
            isModal={true}
            onClose={() => setShowWellnessGoalsModal(false)}
            onAskAI={handleAskAI}
            isDark={isDark}
          />
        )}

      </div>
    </div>
  );
};
