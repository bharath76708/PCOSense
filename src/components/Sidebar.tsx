import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Settings,
  History,
  Stethoscope,
  ShieldAlert,
  BarChart3,
  Sliders,
  BookOpen,
  Cpu,
  Info,
  LogOut,
  Sparkles,
  ChevronRight,
  Activity,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin,
  AlertTriangle,
  HeartPulse,
  Utensils,
  Footprints,
  Droplets,
  Video,
  ShieldCheck,
  CreditCard,
  Zap,
  Lock,
  Users,
  Camera,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { getUserSubscription } from '../services/subscriptionService';
import { SubscriptionPaymentModal } from './SubscriptionPaymentModal';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onOpenAssistant?: () => void;
  onOpenEmergency?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpen,
  onOpenAssistant,
  onOpenEmergency,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, isTelugu } = useLanguage();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userSub, setUserSub] = useState(() => getUserSubscription(user?.email || user?.id || 'usr_patient_sample'));

  useEffect(() => {
    setUserSub(getUserSubscription(user?.email || user?.id || 'usr_patient_sample'));
  }, [user?.email, user?.id, isPaymentModalOpen]);

  useEffect(() => {
    const handleSubUpdated = () => {
      setUserSub(getUserSubscription(user?.email || user?.id || 'usr_patient_sample'));
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    return () => window.removeEventListener('subscription-updated', handleSubUpdated);
  }, [user?.email, user?.id]);

  const sidebarRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Internal collapse state for desktop/tablet viewport if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Auto-collapse on tablet viewports (768px - 1023px)
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  };

  // Close drawer on mobile navigation click
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose();
    }
  };

  // Handle ESC key and Focus Trapping for Mobile Drawer mode
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isOpen && isMobile) {
      // Store currently focused element before opening
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Focus the close button or first interactive element after open
      const focusTimer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (sidebarRef.current) {
          const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
      }, 50);

      // Focus trap handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === 'Tab' && sidebarRef.current) {
          const focusableElements = sidebarRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement || !sidebarRef.current.contains(document.activeElement)) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement || !sidebarRef.current.contains(document.activeElement)) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    } else if (isOpen) {
      // On desktop, support Escape to dismiss if open
      const handleDesktopKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleDesktopKeyDown);
      return () => window.removeEventListener('keydown', handleDesktopKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open to prevent background scrolling
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = !isAdmin && !isDoctor;

  // Group 1: Patient MAIN (Dashboard, New Assessment, History)
  const patientMainNav = [
    { path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, id: 'sidebar-nav-dashboard' },
    { path: '/assessment', label: t('nav.newAssessment', 'New Assessment'), icon: Stethoscope, id: 'sidebar-nav-assessment' },
    { path: '/history', label: t('nav.history', 'History'), icon: History, id: 'sidebar-nav-history' },
  ];

  // Group 2: Patient UNDERSTAND (My Result, 7-Day Diet Plan, Nutrition Tracker, Yoga, Walking, Explainable AI, What-If?, PCOS Awareness)
  // Strictly for patients - completely removed from Admin and Doctor panels per user instructions
  const understandNav = [
    { path: '/results', label: t('nav.myResult', 'My Result'), icon: ShieldAlert, id: 'sidebar-nav-results' },
    { path: '/diet-plan', label: t('nav.dietPlan', '7-Day Diet Plan & Cravings'), icon: Utensils, id: 'sidebar-nav-diet-plan' },
    { path: '/scan-food', label: t('nav.scanFood', 'Scan Your Food'), icon: Camera, id: 'sidebar-nav-scan-food', badge: 'AI' },
    { path: '/nutrition', label: isTelugu ? 'పోషకాహార ట్రాకర్' : 'Nutrition & Recipes', icon: Utensils, id: 'sidebar-nav-nutrition' },
    { path: '/yoga', label: isTelugu ? 'యోగా & వ్యాయామం' : 'Yoga & Cortisol Relief', icon: Video, id: 'sidebar-nav-yoga' },
    { path: '/activity-tracker', label: isTelugu ? 'నడక & వాటర్ అలర్ట్స్' : 'Walking & Water Alerts', icon: Footprints, id: 'sidebar-nav-activity' },
    { path: '/insights', label: t('nav.explainableAI', 'Explainable AI'), icon: BarChart3, id: 'sidebar-nav-insights' },
    { path: '/what-if', label: t('nav.whatIf', 'What-If?'), icon: Sliders, id: 'sidebar-nav-what-if' },
    { path: '/education', label: t('nav.pcosAwareness', 'PCOS Awareness'), icon: BookOpen, id: 'sidebar-nav-education' },
  ];

  // Group 3: Patient TOOLS (Find Healthcare, Model Information, About & Methodology)
  const patientToolsNav = [
    { path: '/find-care', label: t('nav.findHealthcare', 'Find Healthcare'), icon: MapPin, id: 'sidebar-nav-find-care' },
    { path: '/model', label: t('nav.modelInformation', 'Model Information'), icon: Cpu, id: 'sidebar-nav-model' },
    { path: '/about', label: t('nav.aboutMethodology', 'About & Methodology'), icon: Info, id: 'sidebar-nav-about' },
  ];

  // ADMIN-ONLY NAV: Tailored specifically to Admin requirements
  const adminNav = [
    { path: '/admin', label: isTelugu ? 'అడ్మిన్ సెంటర్ (ఆపరేషన్స్)' : 'Admin Operations Center', icon: ShieldCheck, id: 'sidebar-nav-admin' },
    { path: '/admin?tab=whatsapp', label: isTelugu ? '📱 వాట్సాప్ ఆటోమేషన్' : '📱 WhatsApp Automation', icon: MessageSquare, id: 'sidebar-nav-admin-whatsapp' },
    { path: '/find-care', label: isTelugu ? 'స్పెషలిస్ట్ వైద్యులు' : 'Specialist Doctors Directory', icon: Users, id: 'sidebar-nav-admin-doctors' },
    { path: '/model', label: t('nav.modelInformation', 'Model Architecture'), icon: Cpu, id: 'sidebar-nav-admin-model' },
    { path: '/about', label: t('nav.aboutMethodology', 'Platform & Compliance'), icon: Info, id: 'sidebar-nav-admin-about' },
  ];

  // DOCTOR-ONLY NAV: Tailored specifically to Doctor clinical requirements
  const doctorNav = [
    { path: '/doctor-dashboard', label: isTelugu ? 'డాక్టర్ పోర్టల్ (కన్సల్టేషన్లు)' : 'Doctor Clinical Portal', icon: Stethoscope, id: 'sidebar-nav-doctor-portal' },
    { path: '/find-care', label: isTelugu ? 'వైద్యుల నెట్‌వర్క్' : 'Healthcare Network', icon: Users, id: 'sidebar-nav-doctor-find-care' },
    { path: '/model', label: t('nav.modelInformation', 'Clinical Model Reference'), icon: Cpu, id: 'sidebar-nav-doctor-model' },
    { path: '/about', label: t('nav.aboutMethodology', 'Medical Methodology'), icon: Info, id: 'sidebar-nav-doctor-about' },
  ];

  // Group 4: ACCOUNT (Profile, Settings/Baseline Setup)
  const accountNav = [
    { path: '/profile', label: t('nav.profile', 'Profile'), icon: User, id: 'sidebar-nav-profile' },
    { path: '/profile/setup', label: t('nav.settings', 'Settings'), icon: Settings, id: 'sidebar-nav-settings' },
  ];

  return (
    <>
      {/* 1. Mobile Backdrop overlay (Full-screen overlay on mobile screens) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
          id="sidebar-mobile-backdrop"
        />
      )}

      {/* 2. Responsive Sidebar Container (Slide-over drawer on mobile, collapsible side panel on tablet/desktop) */}
      <aside
        ref={sidebarRef}
        role={isOpen ? 'dialog' : 'navigation'}
        aria-modal={isOpen ? 'true' : undefined}
        aria-label={t('sidebar.clinicalWorkspace', 'PCOSense Clinical Workspace Navigation')}
        id="app-sidebar-panel"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#16241D] text-[#D2E4D6] border-r border-[#243A2F] transition-all duration-300 ease-in-out max-w-full overflow-hidden ${
          // Mobile state: slide-in drawer
          isOpen
            ? 'translate-x-0 w-80 max-w-[85vw] shadow-2xl md:shadow-none'
            : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop/Tablet collapsible state
          isCollapsed ? 'md:w-20' : 'md:w-72'
        }`}
      >
        {/* Brand & Workspace Header */}
        <div className={`flex h-16 shrink-0 items-center border-b border-[#243A2F] bg-[#121E18] px-4 ${
          isCollapsed ? 'justify-between md:justify-center' : 'justify-between'
        }`}>
          <Link
            to={isAdmin ? '/admin' : isDoctor ? '/doctor-dashboard' : '/dashboard'}
            onClick={handleNavClick}
            className="flex items-center gap-2.5 group overflow-hidden min-w-0"
            id="sidebar-brand-logo"
            aria-label="PCOSense Workspace"
            title="PCOSense Workspace"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6B9E78] text-white shadow-xs font-bold transition-transform group-hover:scale-105 shrink-0">
              <Activity className="h-5 w-5 stroke-[2.4]" aria-hidden="true" />
            </div>
            <div className={`min-w-0 transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <span className="text-lg font-extrabold text-white tracking-tight truncate block">
                PCO<span className="text-[#8FB899]">Sense</span>
              </span>
              <span className="text-[10px] block font-semibold text-[#8FB899] -mt-1 tracking-wider uppercase truncate">
                {isAdmin
                  ? (isTelugu ? 'అడ్మిన్ ఖజానా' : 'Admin Operations')
                  : isDoctor
                  ? (isTelugu ? 'డాక్టర్ పోర్టల్' : 'Clinical Practice')
                  : t('sidebar.clinicalWorkspace', 'Clinical Workspace')}
              </span>
            </div>
          </Link>

          {/* Desktop/Tablet Collapse & Expand Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-[#8FB899] hover:text-white hover:bg-[#1E3027] transition-colors shrink-0"
            title={isCollapsed ? t('sidebar.expandSidebar', 'Expand Sidebar') : t('sidebar.collapseSidebar', 'Collapse Sidebar')}
            id="sidebar-collapse-toggle-btn"
            aria-label={isCollapsed ? t('sidebar.expandSidebar', 'Expand Sidebar') : t('sidebar.collapseSidebar', 'Collapse Sidebar')}
            aria-expanded={!isCollapsed}
            aria-controls="app-sidebar-panel"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-[#8FB899]" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-[#8FB899] hover:text-white" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#8FB899] hover:bg-[#1E3027] hover:text-white md:hidden shrink-0 focus:ring-2 focus:ring-[#6B9E78] focus:outline-none"
            aria-label={t('nav.closeMenu', 'Close navigation menu')}
            id="sidebar-mobile-close-btn"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Navigation List with Flex/Grid Layout */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#243A2F]">
          
          {/* Patient Quick Actions (Hidden for Admin & Doctor) */}
          {isPatient && (
            <div className="w-full space-y-2">
              <Link
                to="/assessment"
                onClick={handleNavClick}
                className={`flex items-center justify-center gap-2 rounded-xl bg-[#6B9E78] hover:bg-[#578463] text-white font-bold shadow-sm active:scale-98 transition-all group focus:ring-2 focus:ring-[#6B9E78] focus:outline-none ${
                  isCollapsed ? 'w-full py-2.5 px-2 md:px-0 text-xs' : 'w-full py-2.5 px-4 text-xs'
                }`}
                id="sidebar-new-screening-cta"
                aria-label={t('sidebar.takeNewScreening', 'Take New Screening')}
                title={t('sidebar.takeNewScreening', 'Take New Screening')}
              >
                <Stethoscope className="h-4 w-4 stroke-[2.4] shrink-0 text-[#E8F2EA]" aria-hidden="true" />
                <span className={`truncate font-extrabold ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  {t('sidebar.takeNewScreening', 'Take New Screening')}
                </span>
              </Link>

              {/* Subscription Access & Plan Status Badge */}
              <div className={`rounded-xl border p-2.5 transition-all ${
                userSub?.isBlocked
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : userSub?.planId === 'plan_200'
                  ? 'bg-teal-950/40 border-teal-700/60 text-teal-300'
                  : userSub?.planId === 'plan_100'
                  ? 'bg-sky-950/40 border-sky-700/60 text-sky-300'
                  : 'bg-amber-950/40 border-amber-700/60 text-amber-300'
              }`}>
                <div className={`flex items-center justify-between gap-2 ${isCollapsed ? 'md:justify-center' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {userSub?.isBlocked ? (
                      <Lock className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    )}
                    <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                      <p className="text-[11px] font-extrabold truncate">
                        {userSub?.isBlocked
                          ? 'Trial Expired (Blocked)'
                          : userSub?.planId === 'plan_200'
                          ? '₹200 Premium Plan (Active)'
                          : userSub?.planId === 'plan_100'
                          ? '₹100 Pro Plan (Active)'
                          : userSub?.planId === 'trial_1'
                          ? `₹1 Trial (${userSub.trialDaysRemaining ?? 3}d left)`
                          : 'Free Preview'}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {userSub?.isBlocked
                          ? 'Upgrade to ₹100 or ₹200'
                          : userSub?.planId === 'plan_100'
                          ? 'Diet & Health Reports Active'
                          : userSub?.planId === 'plan_200'
                          ? 'All Features & Consults Unlocked'
                          : '3-Day Trial for ₹1'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all shrink-0 ${
                      userSub?.isBlocked
                        ? 'bg-rose-500 hover:bg-rose-400 text-white'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    } ${isCollapsed ? 'md:hidden' : 'inline-block'}`}
                  >
                    {userSub?.isBlocked ? 'Unlock' : userSub?.planId === 'free' ? 'Pay ₹1' : 'Upgrade'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Role Header Card */}
          {isAdmin && (
            <div className={`p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/50 text-indigo-200 ${isCollapsed ? 'md:p-1.5 text-center' : ''}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  <p className="text-[11px] font-bold text-white truncate">Master Treasury Active</p>
                  <p className="text-[9px] text-indigo-300 truncate">Platform Fee & User Subscriptions</p>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Role Header Card */}
          {isDoctor && (
            <div className={`p-2.5 rounded-xl bg-teal-950/40 border border-teal-700/50 text-teal-200 ${isCollapsed ? 'md:p-1.5 text-center' : ''}`}>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-400 shrink-0" />
                <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  <p className="text-[11px] font-bold text-white truncate">Clinical Practice</p>
                  <p className="text-[9px] text-teal-300 truncate">85% Consults & Patient Records</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ROLE-SPECIFIC VIEWS                                          */}
          {/* ============================================================ */}

          {/* 1. ADMIN PANEL VIEW: Only What Admin Wants (No 'Understand' clutter) */}
          {isAdmin && (
            <section className="space-y-1" aria-label="Admin Operations Navigation">
              <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
                isCollapsed ? 'md:justify-center md:px-0' : ''
              }`}>
                <span className={`text-[10px] font-extrabold tracking-wider text-indigo-400 uppercase ${
                  isCollapsed ? 'md:hidden' : 'block'
                }`}>
                  {isTelugu ? 'అడ్మిన్ ఆపరేషన్స్' : 'ADMIN OPERATIONS'}
                </span>
                <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                  isCollapsed ? 'md:hidden' : 'block'
                }`} />
                {isCollapsed && (
                  <span className="hidden md:inline-block w-4 h-0.5 bg-indigo-800 rounded-full my-0.5" title="ADMIN" />
                )}
              </div>

              <nav className="space-y-1" aria-label="Admin Links">
                {adminNav.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id={item.id}
                      onClick={handleNavClick}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.label}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none ${
                        isCollapsed
                          ? 'md:justify-center px-3 py-2.5 md:px-0'
                          : 'justify-between px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} aria-hidden="true" />
                        <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                      </div>
                      {isActive && !isCollapsed && (
                        <ChevronRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          )}

          {/* 2. DOCTOR PANEL VIEW: Only What Doctor Wants (No 'Understand' clutter) */}
          {isDoctor && (
            <section className="space-y-1" aria-label="Doctor Portal Navigation">
              <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
                isCollapsed ? 'md:justify-center md:px-0' : ''
              }`}>
                <span className={`text-[10px] font-extrabold tracking-wider text-teal-400 uppercase ${
                  isCollapsed ? 'md:hidden' : 'block'
                }`}>
                  {isTelugu ? 'డాక్టర్ పోర్టల్' : 'CLINICAL PRACTICE'}
                </span>
                <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                  isCollapsed ? 'md:hidden' : 'block'
                }`} />
                {isCollapsed && (
                  <span className="hidden md:inline-block w-4 h-0.5 bg-teal-800 rounded-full my-0.5" title="DOCTOR" />
                )}
              </div>

              <nav className="space-y-1" aria-label="Doctor Links">
                {doctorNav.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id={item.id}
                      onClick={handleNavClick}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.label}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                        isCollapsed
                          ? 'md:justify-center px-3 py-2.5 md:px-0'
                          : 'justify-between px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} aria-hidden="true" />
                        <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                      </div>
                      {isActive && !isCollapsed && (
                        <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          )}

          {/* 3. PATIENT VIEW: MAIN, UNDERSTAND, & TOOLS */}
          {isPatient && (
            <>
              {/* SECTION 1: MAIN */}
              <section className="space-y-1" aria-label="Main Navigation">
                <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}>
                  <span className={`text-[10px] font-extrabold tracking-wider text-slate-400 uppercase ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}>
                    {t('nav.main', 'MAIN')}
                  </span>
                  <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`} />
                  {isCollapsed && (
                    <span className="hidden md:inline-block w-4 h-0.5 bg-slate-800 rounded-full my-0.5" title="MAIN" />
                  )}
                </div>

                <nav className="space-y-1" aria-label="Main Links">
                  {patientMainNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        id={item.id}
                        onClick={handleNavClick}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                          isCollapsed
                            ? 'md:justify-center px-3 py-2.5 md:px-0'
                            : 'justify-between px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} aria-hidden="true" />
                          <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                        </div>
                        {isActive && !isCollapsed && (
                          <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </section>

              {/* SECTION 2: UNDERSTAND (Patient-only) */}
              <section className="space-y-1 pt-1" aria-label="Understand Navigation">
                <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}>
                  <span className={`text-[10px] font-extrabold tracking-wider text-slate-400 uppercase ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}>
                    {t('nav.understand', 'UNDERSTAND')}
                  </span>
                  <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`} />
                  {isCollapsed && (
                    <span className="hidden md:inline-block w-4 h-0.5 bg-slate-800 rounded-full my-0.5" title="UNDERSTAND" />
                  )}
                </div>

                <nav className="space-y-1" aria-label="Understand Links">
                  {understandNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        id={item.id}
                        onClick={handleNavClick}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                          isCollapsed
                            ? 'md:justify-center px-3 py-2.5 md:px-0'
                            : 'justify-between px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} aria-hidden="true" />
                          <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                        </div>
                        {isActive && !isCollapsed && (
                          <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </section>

              {/* SECTION 3: TOOLS (Patient-only) */}
              <section className="space-y-1 pt-1" aria-label="Tools Navigation">
                <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}>
                  <span className={`text-[10px] font-extrabold tracking-wider text-slate-400 uppercase ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`}>
                    {t('nav.tools', 'TOOLS')}
                  </span>
                  <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                    isCollapsed ? 'md:hidden' : 'block'
                  }`} />
                  {isCollapsed && (
                    <span className="hidden md:inline-block w-4 h-0.5 bg-slate-800 rounded-full my-0.5" title="TOOLS" />
                  )}
                </div>

                <nav className="space-y-1" aria-label="Tools Links">
                  {onOpenAssistant && (
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                        onOpenAssistant();
                      }}
                      title={isCollapsed ? t('common.askAI', 'Ask PCOSense AI') : undefined}
                      aria-label={t('common.askAI', 'Ask PCOSense AI')}
                      className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 transition-all text-left group focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                        isCollapsed
                          ? 'md:justify-center px-3 py-2.5 md:px-0'
                          : 'justify-between px-3 py-2.5'
                      }`}
                      id="sidebar-nav-ask-ai"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Sparkles className="h-4 w-4 text-teal-400 animate-pulse shrink-0" aria-hidden="true" />
                        <span className={`truncate group-hover:text-teal-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                          {t('common.askAI', 'Ask PCOSense AI')}
                        </span>
                      </div>
                      {!isCollapsed && <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />}
                    </button>
                  )}

                  {patientToolsNav.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        id={item.id}
                        onClick={handleNavClick}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                          isCollapsed
                            ? 'md:justify-center px-3 py-2.5 md:px-0'
                            : 'justify-between px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} aria-hidden="true" />
                          <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                        </div>
                        {isActive && !isCollapsed && (
                          <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Emergency Procedures & Red Flag Triage */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      if (onOpenEmergency) {
                        onOpenEmergency();
                      } else {
                        window.dispatchEvent(new CustomEvent('open-pcosense-emergency'));
                      }
                    }}
                    title={isCollapsed ? (t('nav.emergencyGuidelines', 'Emergency Procedures')) : undefined}
                    aria-label={t('nav.emergencyGuidelines', 'Emergency Procedures')}
                    className={`w-full flex items-center rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all text-left group border border-transparent hover:border-rose-800/40 focus:ring-2 focus:ring-rose-400 focus:outline-none ${
                      isCollapsed
                        ? 'md:justify-center px-3 py-2.5 md:px-0'
                        : 'justify-between px-3 py-2.5'
                    }`}
                    id="sidebar-nav-emergency-procedures"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <HeartPulse className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" aria-hidden="true" />
                      <span className={`truncate group-hover:text-rose-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                        {t('nav.emergencyGuidelines', 'Emergency Procedures')}
                      </span>
                    </div>
                    {!isCollapsed && <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/60">ER</span>}
                  </button>
                </nav>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* SECTION 4: ACCOUNT                                           */}
          {/* ============================================================ */}
          <section className="space-y-1 pt-1" aria-label="Account Navigation">
            {/* Visual Separator & Descriptive Section Header */}
            <div className={`px-2 pt-1 pb-1 flex items-center justify-between ${
              isCollapsed ? 'md:justify-center md:px-0' : ''
            }`}>
              <span className={`text-[10px] font-extrabold tracking-wider text-slate-400 uppercase ${
                isCollapsed ? 'md:hidden' : 'block'
              }`}>
                {t('nav.account', 'ACCOUNT')}
              </span>
              <div className={`h-px bg-slate-800/80 flex-1 ml-2 ${
                isCollapsed ? 'md:hidden' : 'block'
              }`} />
              {isCollapsed && (
                <span className="hidden md:inline-block w-4 h-0.5 bg-slate-800 rounded-full my-0.5" title="ACCOUNT" />
              )}
            </div>

            <nav className="space-y-1" aria-label="Account Links">
              {accountNav.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    id={item.id}
                    onClick={handleNavClick}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl text-xs font-semibold transition-all focus:ring-2 focus:ring-teal-400 focus:outline-none ${
                      isCollapsed
                        ? 'md:justify-center px-3 py-2.5 md:px-0'
                        : 'justify-between px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} aria-hidden="true" />
                      <span className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                    </div>
                    {isActive && !isCollapsed && (
                      <ChevronRight className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </section>

        </div>

        {/* Bottom Preferences & User Account Card Section */}
        <div className="p-3 border-t border-[#243A2F] bg-[#121E18] space-y-2.5 shrink-0" aria-label="Preferences and User Session">
          {/* Preferences: Language Selector */}
          <div className={`flex items-center ${isCollapsed ? 'md:flex-col md:gap-2 justify-between' : 'justify-between px-1'}`}>
            <span className={`text-[11px] font-semibold text-[#8FB899] ${isCollapsed ? 'md:hidden' : 'block'}`}>
              {t('common.language', 'Language')}
            </span>
            <LanguageSelector variant={isCollapsed ? 'compact' : 'header'} />
          </div>

          {/* Preferences: Theme Selector */}
          <div className={`flex items-center ${isCollapsed ? 'md:flex-col md:gap-2 justify-between' : 'justify-between px-1'}`}>
            <span className={`text-[11px] font-semibold text-[#8FB899] ${isCollapsed ? 'md:hidden' : 'block'}`}>
              {t('sidebar.theme', 'Theme')}
            </span>
            <ThemeToggle variant="pill" />
          </div>

          {/* User Account Row */}
          <div className={`flex items-center pt-2 border-t border-[#243A2F] ${
            isCollapsed ? 'md:flex-col md:gap-2 justify-between' : 'justify-between'
          }`}>
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity focus:ring-2 focus:ring-[#6B9E78] focus:outline-none rounded-lg p-0.5"
              title={user?.full_name || t('profile.title', 'My Profile')}
              aria-label={user?.full_name ? `Profile of ${user.full_name}` : 'My Profile'}
              id="sidebar-user-profile-link"
            >
              <div className="h-9 w-9 rounded-xl bg-[#6B9E78] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs" aria-hidden="true">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || t('nav.patient', 'Patient User')}
                </p>
                <p className="text-[10px] text-[#A8C7B1] truncate">
                  {user?.email || 'patient@pcosense.org'}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-[#A8C7B1] hover:text-[#D96C75] hover:bg-[#D96C75]/10 rounded-xl transition-colors shrink-0 focus:ring-2 focus:ring-[#D96C75] focus:outline-none"
              title={t('nav.logout', 'Sign Out')}
              id="sidebar-logout-btn"
              aria-label={t('nav.logout', 'Sign Out')}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </aside>

      {/* Subscription Payment & Upgrade Modal */}
      <SubscriptionPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        userEmail={user?.email}
        userName={user?.full_name}
        userId={user?.id || 'usr_patient_sample'}
        onSuccess={(sub) => setUserSub(sub)}
      />
    </>
  );
};
