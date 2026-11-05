import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  Stethoscope,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  WifiOff,
  Wifi,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LanguageProvider, useLanguage } from './translations';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { initOfflineSync } from './services/offlineSyncService';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssessmentWizardPage } from './pages/AssessmentWizardPage';
import { ResultsPage } from './pages/ResultsPage';
import { InsightsPage } from './pages/InsightsPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { EducationPage } from './pages/EducationPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { AboutPage } from './pages/AboutPage';
import { FindHealthcarePage } from './pages/FindHealthcarePage';
import { DietPlanPage } from './pages/DietPlanPage';
import { ScanFoodPage } from './pages/ScanFoodPage';
import { ActivityHydrationPage } from './pages/ActivityHydrationPage';
import { WellnessActivityPage } from './pages/WellnessActivityPage';
import { YogaExercisePage } from './pages/YogaExercisePage';
import { NutritionTrackingPage } from './pages/NutritionTrackingPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CompliancePrivacyPage } from './pages/CompliancePrivacyPage';
import { WhatsAppAutomationPage } from './pages/WhatsAppAutomationPage';
import { WaterReminderNotificationBar } from './components/WaterReminderNotificationBar';
import { EmergencyProceduresModal } from './components/EmergencyProceduresModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { t, isTelugu } = useLanguage();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);

  // Network Status State using Navigator API
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState<boolean>(false);
  const [offlineDismissed, setOfflineDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Start background sync listener and reconciliation interval
    const cleanupSync = initOfflineSync();

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
      setOfflineDismissed(false);
      setShowBackOnlineToast(true);

      const timer = setTimeout(() => {
        setShowBackOnlineToast(false);
      }, 4000);

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      setShowBackOnlineToast(false);
    };

    // Check initial online status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setShowOfflineToast(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof cleanupSync === 'function') {
        cleanupSync();
      }
    };
  }, []);

  const handleOpenAssistant = (prompt?: string) => {
    setAssistantPrompt(prompt);
    setIsAssistantOpen(true);
  };

  useEffect(() => {
    const handleCustomAIEvent = (e: any) => {
      const prompt = e.detail?.prompt;
      handleOpenAssistant(prompt);
    };
    const handleCustomEmergencyEvent = () => {
      setIsEmergencyModalOpen(true);
    };

    window.addEventListener('open-pcosense-ai', handleCustomAIEvent);
    window.addEventListener('open-pcosense-emergency', handleCustomEmergencyEvent);

    return () => {
      window.removeEventListener('open-pcosense-ai', handleCustomAIEvent);
      window.removeEventListener('open-pcosense-emergency', handleCustomEmergencyEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#142019] text-[#263D32] dark:text-[#E8F2EA] font-sans antialiased flex flex-col relative transition-colors duration-200">
      
      {/* Network Status Toast Notification (Offline Alert & Back Online Confirmation) */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {/* 1. Offline Alert Toast */}
        {(!isOnline || showOfflineToast) && !offlineDismissed && (
          <div
            id="network-offline-toast"
            className="pointer-events-auto rounded-2xl bg-[#FFF4DF] text-[#7A510A] p-4 shadow-xl border border-[#F1DCB0] transition-all duration-300 animate-in slide-in-from-top-2 flex items-start gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-[#F5DEB3] text-[#7A510A] flex items-center justify-center shrink-0 mt-0.5">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#6C4405] flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {isTelugu ? 'ఆఫ్‌లైన్ మోడ్ (నెట్‌వర్క్ డిస్‌కనెక్ట్ అయింది)' : 'Offline Mode (No Connection)'}
                </span>
                <button
                  type="button"
                  onClick={() => setOfflineDismissed(true)}
                  className="text-[#7A510A]/70 hover:text-[#7A510A] p-0.5 rounded-lg transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  aria-label="Dismiss offline notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[#6C4405]/90 mt-1 leading-relaxed text-[11px]">
                {isTelugu
                  ? 'మీ అసెస్‌మెంట్ డేటా మీ బ్రౌజర్ సెషన్‌లో సురక్షితంగా సేవ్ చేయబడింది. ఇంటర్నెట్ తిరిగి వచ్చినప్పుడు క్లౌడ్ సింక్ అవుతుంది.'
                  : 'Your assessment progress is safely preserved in local session memory. Cloud sync and AI assistant will resume once reconnected.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. Reconnected Back Online Toast */}
        {showBackOnlineToast && isOnline && (
          <div
            id="network-online-toast"
            className="pointer-events-auto rounded-2xl bg-[#E8F2EA] text-[#263D32] p-3.5 shadow-xl border border-[#C8DEC3] transition-all duration-300 animate-in slide-in-from-top-2 flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-[#6B9E78]/20 text-[#35513D] flex items-center justify-center shrink-0">
              <Wifi className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-[#263D32] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#6B9E78]" />
                {isTelugu ? 'ఇంటర్నెట్ కనెక్ట్ అయింది' : 'Back Online'}
              </span>
              <p className="text-[#35513D] text-[11px]">
                {isTelugu ? 'నెట్‌వర్క్ కనెక్షన్ పునరుద్ధరించబడింది.' : 'Network connection restored successfully.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBackOnlineToast(false)}
              className="text-[#35513D] hover:text-[#263D32] p-0.5 rounded-lg transition-colors focus:ring-2 focus:ring-[#6B9E78] focus:outline-none"
              aria-label="Dismiss online notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* AUTHENTICATED STATE: Sleek Sidebar Layout */}
      {isAuthenticated ? (
        <div className="flex min-h-screen">
          {/* Left Dedicated Sidebar Navigation */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpen={() => setSidebarOpen(true)}
            onOpenAssistant={() => handleOpenAssistant()}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          />

          {/* Main App Content Area */}
          <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
          }`}>
            
            {/* Logged-In Top Bar */}
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#E5E9E4] dark:border-[#2C3E33] bg-white/95 dark:bg-[#1A2820]/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl p-2 text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#22352A] md:hidden focus:ring-2 focus:ring-[#6B9E78] focus:outline-none"
                  aria-label="Open navigation sidebar"
                  id="mobile-sidebar-open-btn"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="hidden sm:block">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    user?.role === 'admin'
                      ? 'text-[#6C4E8F] dark:text-[#DFD3EC] bg-[#F1ECF7] dark:bg-[#2D1D3E] border-[#DFD3EC] dark:border-[#4C3268]'
                      : user?.role === 'doctor'
                      ? 'text-[#263D32] dark:text-[#E8F2EA] bg-[#E8F2EA] dark:bg-[#1F3327] border-[#C8DEC3] dark:border-[#35513D]'
                      : 'text-[#263D32] dark:text-[#E8F2EA] bg-[#E8F2EA] dark:bg-[#1F3327] border-[#C8DEC3] dark:border-[#35513D]'
                  }`}>
                    {user?.role === 'admin'
                      ? `Admin: ${user?.full_name || 'System Admin'}`
                      : user?.role === 'doctor'
                      ? `Doctor: ${user?.full_name || 'Clinical Practitioner'}`
                      : `${t('nav.loggedInAs', 'Logged in as')} ${user?.full_name || t('nav.patient', 'Patient')}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Visual offline indicator badge in header if offline */}
                {!isOnline && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#6C4405] bg-[#FFF4DF] px-2.5 py-1 rounded-lg border border-[#F1DCB0]">
                    <WifiOff className="h-3 w-3" />
                    <span>{isTelugu ? 'ఆఫ్‌లైన్' : 'Offline'}</span>
                  </span>
                )}

                <LanguageSelector />
                <ThemeToggle variant="simple" />

                {/* AI Assistant button for non-admin users */}
                {user?.role !== 'admin' && (
                  <button
                    onClick={() => handleOpenAssistant()}
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-950 dark:text-teal-200 bg-gradient-to-r from-teal-50 to-emerald-100 dark:from-teal-950 dark:to-slate-900 hover:from-teal-100 hover:to-emerald-200 dark:hover:from-teal-900 dark:hover:to-slate-800 border border-teal-300 dark:border-teal-700 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                    id="auth-topbar-ask-ai-btn"
                    aria-label={t('common.askAI', 'Ask PCOSense AI')}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                    <span>{t('common.askAI', 'Ask PCOSense AI')}</span>
                  </button>
                )}

                {/* Role-specific Action Button */}
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-600 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                    aria-label="Admin Operations Center"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-200" />
                    <span className="hidden sm:inline">Admin Center</span>
                  </Link>
                ) : user?.role === 'doctor' ? (
                  <Link
                    to="/doctor-dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                    aria-label="Doctor Clinical Portal"
                  >
                    <Stethoscope className="h-3.5 w-3.5 text-teal-300" />
                    <span className="hidden sm:inline">Doctor Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/assessment"
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                    aria-label={t('nav.screening', 'Start PCOS Screening')}
                  >
                    <Stethoscope className="h-3.5 w-3.5 text-teal-300" />
                    <span className="hidden sm:inline">{t('nav.screening', 'Screening')}</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="h-8 w-8 rounded-xl bg-teal-900 dark:bg-teal-800 text-teal-300 flex items-center justify-center font-bold text-xs shadow-xs border border-teal-700/50"
                  title={t('profile.title', 'My Health Profile')}
                  aria-label={t('profile.title', 'My Health Profile')}
                >
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Link>
              </div>
            </header>

            {/* Page Main Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<DashboardPage onOpenAssistant={handleOpenAssistant} />} />
                <Route path="/dashboard" element={<DashboardPage onOpenAssistant={handleOpenAssistant} />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/setup" element={<ProfileSetupPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/assessment" element={<AssessmentWizardPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/diet-plan" element={<DietPlanPage />} />
                <Route path="/scan-food" element={<ScanFoodPage />} />
                <Route path="/food-scan" element={<ScanFoodPage />} />
                <Route path="/nutrition" element={<NutritionTrackingPage />} />
                <Route path="/recipes" element={<NutritionTrackingPage />} />
                <Route path="/yoga" element={<YogaExercisePage />} />
                <Route path="/exercise" element={<YogaExercisePage />} />
                <Route path="/activity-tracker" element={<ActivityHydrationPage />} />
                <Route path="/wellness" element={<WellnessActivityPage />} />
                <Route path="/wellness-activity" element={<WellnessActivityPage />} />
                <Route path="/steps" element={<ActivityHydrationPage />} />
                <Route path="/hydration" element={<ActivityHydrationPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/what-if" element={<WhatIfSimulatorPage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/model" element={<ModelEvaluationPage />} />
                <Route path="/evaluation" element={<ModelEvaluationPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/find-care" element={<FindHealthcarePage />} />
                <Route path="/doctors" element={<FindHealthcarePage />} />
                <Route path="/find-doctors" element={<FindHealthcarePage />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
                <Route path="/doctor" element={<DoctorDashboardPage />} />
                <Route path="/yoga-exercise" element={<YogaExercisePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/whatsapp-automation" element={<WhatsAppAutomationPage />} />
                <Route path="/whatsapp" element={<WhatsAppAutomationPage />} />
                <Route path="/admin/whatsapp" element={<WhatsAppAutomationPage />} />
                <Route path="/compliance" element={<CompliancePrivacyPage />} />
                <Route path="/privacy" element={<CompliancePrivacyPage />} />
                <Route path="/welcome" element={<LandingPage />} />
                <Route path="/login" element={<DashboardPage onOpenAssistant={handleOpenAssistant} />} />
                <Route path="/register" element={<DashboardPage onOpenAssistant={handleOpenAssistant} />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        /* UNAUTHENTICATED PUBLIC STATE: Top Navigation + Public Landing & Auth + Footer */
        <div className="flex min-h-screen flex-col">
          <Navbar
            onOpenAssistant={() => handleOpenAssistant()}
          />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile/setup" element={<Navigate to="/login" replace />} />
              <Route path="/profile" element={<Navigate to="/login" replace />} />
              <Route path="/history" element={<Navigate to="/login" replace />} />
              <Route path="/assessment" element={<Navigate to="/register?redirect=/assessment" replace />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/diet-plan" element={<DietPlanPage />} />
              <Route path="/scan-food" element={<ScanFoodPage />} />
              <Route path="/food-scan" element={<ScanFoodPage />} />
              <Route path="/nutrition" element={<NutritionTrackingPage />} />
              <Route path="/recipes" element={<NutritionTrackingPage />} />
              <Route path="/yoga" element={<YogaExercisePage />} />
              <Route path="/exercise" element={<YogaExercisePage />} />
              <Route path="/activity-tracker" element={<ActivityHydrationPage />} />
              <Route path="/wellness" element={<WellnessActivityPage />} />
              <Route path="/wellness-activity" element={<WellnessActivityPage />} />
              <Route path="/steps" element={<ActivityHydrationPage />} />
              <Route path="/hydration" element={<ActivityHydrationPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/what-if" element={<WhatIfSimulatorPage />} />
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/model" element={<ModelEvaluationPage />} />
              <Route path="/evaluation" element={<ModelEvaluationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/find-care" element={<FindHealthcarePage />} />
              <Route path="/doctors" element={<FindHealthcarePage />} />
              <Route path="/find-doctors" element={<FindHealthcarePage />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
              <Route path="/doctor" element={<DoctorDashboardPage />} />
              <Route path="/yoga-exercise" element={<YogaExercisePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/whatsapp-automation" element={<WhatsAppAutomationPage />} />
              <Route path="/whatsapp" element={<WhatsAppAutomationPage />} />
              <Route path="/admin/whatsapp" element={<WhatsAppAutomationPage />} />
              <Route path="/compliance" element={<CompliancePrivacyPage />} />
              <Route path="/privacy" element={<CompliancePrivacyPage />} />
            </Routes>
          </main>
        </div>
      )}

      {/* Global Floating AI Assistant Button (when drawer is closed) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {!isAssistantOpen && (
          <button
            onClick={() => handleOpenAssistant()}
            className="flex items-center gap-2.5 bg-[#6B9E78] hover:bg-[#578463] text-white font-bold text-xs sm:text-sm px-4.5 py-3 rounded-full shadow-lg border border-[#578463]/40 hover:scale-105 transition-all group focus:ring-2 focus:ring-[#6B9E78] focus:outline-none"
            id="floating-ai-assistant-btn"
            title={t('common.askAI', 'Ask PCOSense AI')}
            aria-label={t('common.askAI', 'Ask PCOSense AI')}
          >
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <span>{t('common.askAI', 'Ask PCOSense AI')}</span>
          </button>
        )}
      </div>

      {/* Interactive AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        defaultPrompt={assistantPrompt}
      />

      {/* Global In-App Smart Water Reminder Alert Bar - User/Patient side only */}
      {user?.role !== 'doctor' && user?.role !== 'admin' && (
        <WaterReminderNotificationBar />
      )}

      {/* Global Emergency Procedures & Red Flag Triage Modal */}
      <EmergencyProceduresModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onAskAI={(prompt) => handleOpenAssistant(prompt)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <LanguageProvider>
          <AuthProvider>
            <AssessmentProvider>
              <Router>
                <AppContent />
              </Router>
            </AssessmentProvider>
          </AuthProvider>
        </LanguageProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}
