import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Calendar,
  Trash2,
  Download,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Printer,
  Activity,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { getAssessmentHistory, deleteAssessmentHistory } from '../services/api';
import { AssessmentHistoryItem } from '../types';
import { DoctorDiscussionGuide } from '../components/DoctorDiscussionGuide';
import { useLanguage } from '../translations';
import {
  exportAssessmentHistoryPDF,
  exportSingleAssessmentPDF,
  exportCyclePredictionsPDF,
  exportSpecialistAppointmentPrepPDF,
  exportDailyHabitTrackerPDF,
  exportComprehensiveHealthProfilePDF
} from '../utils/pdfExport';
import { recordMilestoneAction } from '../services/badgeService';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { loadFromUserProfile, predictionResult, patientData } = useAssessment();
  const { isTelugu } = useLanguage();

  const [historyList, setHistoryList] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Moderate' | 'High'>('All');
  const [selectedRecord, setSelectedRecord] = useState<AssessmentHistoryItem | null>(null);
  const [showDoctorGuide, setShowDoctorGuide] = useState<boolean>(false);

  // Calendar / PDF Schedule Export State
  const [calendarCycleDays, setCalendarCycleDays] = useState<number>(() => {
    return patientData?.['Cycle length(days)'] || 32;
  });
  const [calendarAppointmentDate, setCalendarAppointmentDate] = useState<string>(() => {
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    return nextWeek.toISOString().split('T')[0];
  });
  const [calendarAppointmentTime, setCalendarAppointmentTime] = useState<string>('10:00');
  const [calendarClinicName, setCalendarClinicName] = useState<string>('Apollo Fertility & Women\'s Health Centre');
  const [calendarSuccessMsg, setCalendarSuccessMsg] = useState<string | null>(null);

  const showCalendarToast = (msg: string) => {
    setCalendarSuccessMsg(msg);
    recordMilestoneAction('calendar_strategist');
    setTimeout(() => setCalendarSuccessMsg(null), 4000);
  };

  const handleExportCyclePredictionsPDF = () => {
    try {
      exportCyclePredictionsPDF({
        cycleLengthDays: calendarCycleDays,
        user: user ? { full_name: user.full_name, email: user.email } : null
      });
      showCalendarToast(
        isTelugu
          ? 'రాబోయే 3 చక్రాల అంచనాల PDF నివేదిక విజయవంతంగా డౌన్‌లోడ్ చేయబడింది!'
          : '3-Cycle predictions forecast downloaded as clinical PDF report!'
      );
    } catch (err) {
      console.error('Failed to generate cycle forecast PDF:', err);
    }
  };

  const handleExportDoctorAppointmentPDF = () => {
    try {
      exportSpecialistAppointmentPrepPDF({
        appointmentDate: calendarAppointmentDate,
        appointmentTime: calendarAppointmentTime,
        clinicName: calendarClinicName,
        user: user ? { full_name: user.full_name, email: user.email } : null,
        latestRecord: historyList[0] || null
      });
      showCalendarToast(
        isTelugu
          ? 'వైద్యుల సంప్రదింపుల తయారీ PDF డౌన్‌లోడ్ చేయబడింది!'
          : 'Doctor consultation prep checklist downloaded as PDF!'
      );
    } catch (err) {
      console.error('Failed to export appointment prep PDF:', err);
    }
  };

  const handleExportDailyTrackerPDF = () => {
    try {
      exportDailyHabitTrackerPDF({
        user: user ? { full_name: user.full_name, email: user.email } : null,
        targetSteps: 8000,
        targetWaterMl: 2500
      });
      showCalendarToast(
        isTelugu
          ? '30-రోజుల లక్షణాల ట్రాకింగ్ PDF షీట్ డౌన్‌లోడ్ చేయబడింది!'
          : '30-Day Symptom & Habit Tracking Log Sheet downloaded as PDF!'
      );
    } catch (err) {
      console.error('Failed to export daily tracker PDF:', err);
    }
  };

  useEffect(() => {
    getAssessmentHistory().then(data => {
      setHistoryList(data);
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm(isTelugu ? `మీరు ఈ అంచనాను తొలగించాలనుకుంటున్నారా ${id}?` : `Are you sure you want to delete assessment ${id}?`)) {
      const updated = await deleteAssessmentHistory(id);
      setHistoryList(updated);
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  const handleExportPDF = () => {
    try {
      setExportingPDF(true);
      exportAssessmentHistoryPDF({
        user: user ? { full_name: user.full_name, email: user.email } : null,
        records: historyList
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setExportingPDF(false), 500);
    }
  };

  const handleExportSinglePDF = (record: AssessmentHistoryItem) => {
    try {
      exportSingleAssessmentPDF({
        user: user ? { full_name: user.full_name, email: user.email } : null,
        singleRecord: record
      });
    } catch (err) {
      console.error('Failed to export single record PDF:', err);
    }
  };

  const handleExportComprehensivePDF = () => {
    try {
      exportComprehensiveHealthProfilePDF({
        user: user ? { full_name: user.full_name, email: user.email } : null,
        profileData: profile?.patientData || patientData,
        records: historyList
      });
      showCalendarToast(
        isTelugu
          ? 'పూర్తి ఆరోగ్య రికార్డుల PDF ఆర్కైవ్ డౌన్‌లోడ్ చేయబడింది!'
          : 'Comprehensive health profile & screening history downloaded as PDF!'
      );
    } catch (err) {
      console.error('Failed to export comprehensive PDF:', err);
    }
  };

  const filteredList = historyList.filter(item => {
    const matchesRisk = riskFilter === 'All' || item.risk_level === riskFilter;
    const matchesSearch =
      ((item.id || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.dateFormatted ? item.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (item.cycleStatus ? item.cycleStatus.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    return matchesRisk && matchesSearch;
  });

  const chartData = [...historyList].reverse().map((item, index) => ({
    name: item.dateFormatted || `#${index + 1}`,
    probability: item.probability,
    bmi: item.bmi,
    id: item.id,
    risk: item.risk_level
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-10 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title & Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-900 dark:bg-teal-800 text-teal-300 flex items-center justify-center font-bold text-xl border border-teal-700/50 shadow-xs flex-shrink-0">
              <History className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'అంచనా చరిత్ర' : 'Assessment History'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {historyList.length} {isTelugu ? 'రికార్డులు' : 'Records'}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isTelugu
                  ? 'మీ PCOS స్క్రీనింగ్ కాలక్రమం, రిస్క్ పురోగతి మరియు మునుపటి ఫలితాలను ట్రాక్ చేయండి లేదా వైద్యుడి నివేదికను PDF రూపంలో డౌన్‌లోడ్ చేయండి.'
                  : 'Track your longitudinal PCOS screening timeline, risk progression, or download formatted PDF reports for your healthcare provider.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Formatted PDF Report for Doctor */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={historyList.length === 0 || exportingPDF}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-3.5 py-2.5 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50"
              id="export-pdf-report-btn"
              title={isTelugu ? 'వైద్యుడి కోసం ఫార్మాట్ చేసిన PDF నివేదికను డౌన్‌లోడ్ చేయండి' : 'Download formatted PDF report for your healthcare provider'}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>
                {exportingPDF
                  ? (isTelugu ? 'నివేదిక తయారవుతోంది...' : 'Generating PDF...')
                  : (isTelugu ? 'డాక్టర్ PDF నివేదిక' : 'Export Doctor PDF')}
              </span>
            </button>

            {/* Doctor Discussion Guide Modal Button */}
            <button
              type="button"
              onClick={() => setShowDoctorGuide(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 px-3.5 py-2.5 text-xs font-bold text-teal-900 dark:text-teal-200 transition-colors shadow-2xs"
            >
              <Stethoscope className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>{isTelugu ? 'డాక్టర్ చర్చ గైడ్' : 'Discussion Guide'}</span>
            </button>

            {/* Export Comprehensive Health Archive PDF */}
            <button
              type="button"
              onClick={handleExportComprehensivePDF}
              disabled={historyList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs disabled:opacity-50"
              title={isTelugu ? 'పూర్తి ఆరోగ్య ఆర్కైవ్ PDF డౌన్‌లోడ్ చేయండి' : 'Export complete health profile & screening history PDF'}
              id="export-comprehensive-pdf-btn"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>{isTelugu ? 'పూర్తి హిస్టరీ PDF' : 'Full History PDF'}</span>
            </button>

            {/* New Assessment Link */}
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-xs"
              id="new-history-screening-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>{isTelugu ? 'కొత్త అంచనా' : 'New Assessment'}</span>
            </Link>
          </div>
        </div>

        {/* Success toast for Calendar / PDF Generation */}
        {calendarSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{calendarSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setCalendarSuccessMsg(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900"
            >
              &times;
            </button>
          </div>
        )}

        {/* Clinical PDF Schedules & Forecasts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'ఋతు చక్ర అంచనాలు & క్లినికల్ షెడ్యూల్ (PDF నివేదికలు)' : 'Cycle Predictions & Clinical Schedules (PDF)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu
                    ? 'రాబోయే పీరియడ్స్, అండోత్సర్గము విండో మరియు వైద్యుల సంప్రదింపుల చెక్‌లిస్ట్‌లను క్లినికల్ PDF నివేదికలుగా డౌన్‌లోడ్ చేయండి.'
                    : 'Export predicted menstrual cycles, fertile windows, and specialist consultation checklists directly as clinical-grade PDF reports.'}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
              Clinical PDF Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Action 1: Cycle & Ovulation Predictions PDF */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🩸 Next 3 Cycles Forecast</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                    PDF Report
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Generates 3 upcoming menstrual and estimated ovulatory windows with phase-based clinical guidelines.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Cycle Length:</label>
                  <select
                    value={calendarCycleDays}
                    onChange={(e) => setCalendarCycleDays(Number(e.target.value))}
                    className="py-1 px-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={28}>28 Days (Regular)</option>
                    <option value={30}>30 Days</option>
                    <option value={32}>32 Days</option>
                    <option value={35}>35 Days (Mild Oligo)</option>
                    <option value={42}>42 Days (Oligomenorrhea)</option>
                    <option value={50}>50 Days (Irregular)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCyclePredictionsPDF}
                className="w-full py-2 px-3 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                id="export-cycle-pdf-btn"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isTelugu ? '3 చక్రాల PDF ఎగుమతి' : 'Export 3 Cycles (PDF)'}</span>
              </button>
            </div>

            {/* Action 2: Doctor Appointment Prep Sheet PDF */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🩺 Specialist Appointment</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    Clinical Prep
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Downloads a doctor consultation prep guide with ultrasound & fasting lab checklist and doctor notes sheet.
                </p>
                <div className="mt-2 space-y-1.5">
                  <input
                    type="date"
                    value={calendarAppointmentDate}
                    onChange={(e) => setCalendarAppointmentDate(e.target.value)}
                    className="w-full py-1 px-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={calendarClinicName}
                    onChange={(e) => setCalendarClinicName(e.target.value)}
                    placeholder="Clinic or Hospital Name"
                    className="w-full py-1 px-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportDoctorAppointmentPDF}
                className="w-full py-2 px-3 rounded-xl bg-indigo-800 dark:bg-indigo-700 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                id="export-appointment-pdf-btn"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'అపాయింట్‌మెంట్ ప్రిపరేషన్ (PDF)' : 'Specialist Prep (PDF)'}</span>
              </button>
            </div>

            {/* Action 3: Daily Symptom & Habit Tracking Sheet PDF */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>⏰ Daily 8:00 PM Check-In</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                    30-Day Plan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Downloads a 30-day symptom tracking log sheet to record pelvic cramps, bloating, hydration, and energy.
                </p>
                <div className="mt-3 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[10px] text-amber-900 dark:text-amber-200">
                  Consistent daily logs build the data needed for high-confidence Trigger Correlation Heatmaps.
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportDailyTrackerPDF}
                className="w-full py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 dark:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                id="export-tracker-pdf-btn"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isTelugu ? '30-రోజుల ట్రాకర్ డౌన్‌లోడ్ (PDF)' : 'Download Tracker (PDF)'}</span>
              </button>
            </div>

          </div>
        </div>
        {/* PCOS RISK PROGRESSION LINE CHART (Recharts) */}
        {historyList.length > 0 && (
          <div
            id="pcos-risk-progression-chart-card"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'కాలక్రమ PCOS రిస్క్ స్కోర్ పురోగతి' : 'PCOS Risk Score Progression Over Time'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isTelugu
                    ? 'మీ స్క్రీనింగ్ తేదీలలో ML మోడల్ అంచనా వేసిన రిస్క్ శాతాల (0-100%) పురోగతిని ట్రాక్ చేయండి.'
                    : 'Visualizes your longitudinal PCOS probability score progression and clinical risk thresholds over time.'}
                </p>
              </div>

              {/* Stats Summary Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  &lt;40% {isTelugu ? 'తక్కువ' : 'Low'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  40-70% {isTelugu ? 'మధ్యస్థం' : 'Moderate'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  &gt;70% {isTelugu ? 'ఎక్కువ' : 'Elevated'}
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    unit="%"
                    tickLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const prob = Number(data.probability);
                        return (
                          <div className="rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 text-white shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[200px]">
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-1">
                              <span className="font-extrabold text-slate-200">{data.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{data.id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{isTelugu ? 'రిస్క్ సంభావ్యత' : 'Risk Probability'}:</span>
                              <span className={`font-black text-sm ${prob >= 70 ? 'text-rose-400' : prob >= 40 ? 'text-amber-400' : 'text-teal-300'}`}>
                                {data.probability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">{isTelugu ? 'రిస్క్ వర్గం' : 'Risk Category'}:</span>
                              <span className="font-bold text-slate-200">{data.risk}</span>
                            </div>
                            {data.bmi && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">BMI:</span>
                                <span className="font-semibold text-slate-300">{data.bmi} kg/m²</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Clinical Risk Reference Threshold Lines */}
                  <ReferenceLine
                    y={70}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: isTelugu ? 'ఎక్కువ రిస్క్ (70%)' : 'Elevated Risk (70%)',
                      fill: '#e11d48',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: isTelugu ? 'మధ్యస్థం (40%)' : 'Moderate (40%)',
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideBottomRight'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="probability"
                    name="PCOS Probability"
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isTelugu ? 'ID, తేదీ లేదా లక్షణం ద్వారా వెతకండి...' : 'Search by ID, date, or symptom...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> {isTelugu ? 'ఫిల్టర్:' : 'Filter:'}
            </span>
            {(['All', 'Low', 'Moderate', 'High'] as const).map(level => {
              const labelMap: Record<string, string> = {
                All: isTelugu ? 'అన్నీ' : 'All',
                Low: isTelugu ? 'తక్కువ' : 'Low',
                Moderate: isTelugu ? 'మధ్యస్థం' : 'Moderate',
                High: isTelugu ? 'ఎక్కువ' : 'High'
              };
              return (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    riskFilter === level
                      ? 'bg-teal-800 dark:bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {labelMap[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* History Table & Details Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              {isTelugu ? 'అంచనా రికార్డులను లోడ్ చేస్తోంది...' : 'Loading assessment records...'}
            </div>
          ) : filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3.5 pl-6 pr-4">{isTelugu ? 'రికార్డ్ ID' : 'Record ID'}</th>
                    <th className="py-3.5 px-4">{isTelugu ? 'తేదీ & సమయం' : 'Date & Time'}</th>
                    <th className="py-3.5 px-4">{isTelugu ? 'రిస్క్ వర్గం' : 'Risk Category'}</th>
                    <th className="py-3.5 px-4">{isTelugu ? 'లెక్కించిన రిస్క్' : 'Calculated Risk'}</th>
                    <th className="py-3.5 px-4">{isTelugu ? 'పీరియడ్ రకం' : 'Cycle Type'}</th>
                    <th className="py-3.5 px-4">BMI</th>
                    <th className="py-3.5 pr-6 text-right">{isTelugu ? 'చర్యలు' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map(record => (
                    <tr
                      key={record.id}
                      className={`hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition-colors ${
                        selectedRecord?.id === record.id ? 'bg-teal-50/60 dark:bg-teal-950/50' : ''
                      }`}
                    >
                      <td className="py-4 pl-6 pr-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {record.id}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{record.dateFormatted || (isTelugu ? 'ఇటీవల' : 'Recent')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          record.risk_level === 'Low'
                            ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                            : record.risk_level === 'Moderate'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                        }`}>
                          {record.risk_level === 'Low' ? (isTelugu ? 'తక్కువ రిస్క్' : 'Low Risk') : record.risk_level === 'Moderate' ? (isTelugu ? 'మధ్యస్థ రిస్క్' : 'Moderate Risk') : (isTelugu ? 'అధిక రిస్క్' : 'High Risk')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-950 dark:text-white text-sm">
                          {record.probability}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {record.cycleStatus || (isTelugu ? 'సాధారణం' : 'Regular (2)')}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {record.bmi || '--'} kg/m²
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          {/* Export Individual PDF Report */}
                          <button
                            type="button"
                            onClick={() => handleExportSinglePDF(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-semibold transition-colors"
                            title={isTelugu ? 'ఈ రికార్డ్ PDF నివేదికను డౌన్‌లోడ్ చేయండి' : 'Download this record as a formatted clinical PDF'}
                            aria-label={`Download clinical PDF for record ${record.id}`}
                          >
                            <FileText className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          {/* View details modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                            title={isTelugu ? 'రికార్డ్ వివరాలను చూడండి' : 'View record details'}
                            aria-label={`View details for record ${record.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span>{isTelugu ? 'వివరాలు' : 'Details'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title={isTelugu ? 'రికార్డును తొలగించండి' : 'Delete record'}
                            aria-label={`Delete record ${record.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <History className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{isTelugu ? 'అంచనా రికార్డులు ఏవీ కనుగొనబడలేదు.' : 'No assessment records found.'}</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || riskFilter !== 'All'
                  ? (isTelugu ? 'మీ శోధన లేదా ఫిల్టర్‌ని సర్దుబాటు చేసి ప్రయత్నించండి.' : 'Try adjusting your search query or filter criteria.')
                  : (isTelugu ? 'మీ మొదటి స్క్రీనింగ్ ఫలితాన్ని మీ ఖాతాలో నమోదు చేయడానికి కొత్త అంచనాను ప్రారంభించండి.' : 'Start a new assessment to log your first screening result into your account.')}
              </p>
              <Link
                to="/assessment"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-xs"
              >
                <span>{isTelugu ? 'కొత్త అంచనాను ప్రారంభించండి' : 'Run New Assessment'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Selected Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">{isTelugu ? 'రికార్డ్' : 'Record'} {selectedRecord.id}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRecord.dateFormatted}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1"
                  aria-label="Close details modal"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">{isTelugu ? 'మోడల్ సంభావ్యత' : 'Model Probability'}</span>
                  <span className="text-2xl font-extrabold text-slate-950 dark:text-white">{selectedRecord.probability}%</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">{isTelugu ? 'రిస్క్ వర్గీకరణ' : 'Risk Classification'}</span>
                  <span className="text-lg font-bold text-teal-800 dark:text-teal-300">{selectedRecord.risk_level}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">{isTelugu ? 'పీరియడ్ క్రమం' : 'Menstrual Rhythm'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.cycleStatus}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">BMI</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRecord.bmi} kg/m²</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleExportSinglePDF(selectedRecord)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 text-xs font-bold transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                  <span>{isTelugu ? 'ఈ రికార్డ్ PDF నివేదిక' : 'Export Clinical PDF'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {isTelugu ? 'మూసివేయి' : 'Close'}
                  </button>
                  <Link
                    to="/results"
                    className="px-4 py-2 rounded-xl bg-teal-800 dark:bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 text-xs font-bold text-white shadow-xs"
                  >
                    {isTelugu ? 'పూర్తి ఫలితాల వీక్షణ' : 'View Results'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Discussion Guide Modal */}
        <DoctorDiscussionGuide
          isOpen={showDoctorGuide}
          onClose={() => setShowDoctorGuide(false)}
          prediction={predictionResult}
          patientData={patientData}
        />

      </div>
    </div>
  );
};
