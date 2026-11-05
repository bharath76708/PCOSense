import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Sliders,
  BookOpen,
  LayoutDashboard,
  Info,
  Menu,
  X,
  Sparkles,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  UserCheck,
  Cpu,
  Stethoscope,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { AccessibilityToggle } from './AccessibilityToggle';
import { useLanguage } from '../translations';

interface NavbarProps {
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAssistant
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { t, isTelugu } = useLanguage();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const navLinks = isAdmin
    ? [
        { path: '/admin', label: isTelugu ? 'అడ్మిన్ సెంటర్' : 'Admin Operations', icon: ShieldCheck },
        { path: '/find-care', label: isTelugu ? 'స్పెషలిస్ట్ నెట్‌వర్క్' : 'Doctors Directory', icon: UserCheck },
        { path: '/model', label: t('nav.modelInformation', 'Model Reference'), icon: Cpu },
        { path: '/about', label: t('nav.about', 'Platform Info'), icon: Info }
      ]
    : isDoctor
    ? [
        { path: '/doctor-dashboard', label: isTelugu ? 'డాక్టర్ పోర్టల్' : 'Doctor Portal', icon: Stethoscope },
        { path: '/find-care', label: isTelugu ? 'వైద్యుల నెట్‌వర్క్' : 'Network Directory', icon: UserCheck },
        { path: '/model', label: t('nav.modelInformation', 'Clinical Model'), icon: Cpu },
        { path: '/about', label: t('nav.about', 'Methodology'), icon: Info }
      ]
    : [
        { path: '/', label: t('nav.overview', 'Overview'), icon: Activity },
        { path: '/what-if', label: t('nav.whatIf', 'What-If?'), icon: Sliders },
        { path: '/education', label: t('nav.awareness', 'Awareness'), icon: BookOpen },
        { path: '/about', label: t('nav.about', 'About'), icon: Info }
      ];

  const brandHomeLink = isAdmin ? '/admin' : isDoctor ? '/doctor-dashboard' : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E9E4] dark:border-[#2C3E33] bg-[#FAFAF7]/95 dark:bg-[#16241D]/95 backdrop-blur-md shadow-2xs transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <Link to={brandHomeLink} className="flex items-center gap-2.5 group flex-shrink-0" id="brand-logo-btn">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B9E78] text-white shadow-xs transition-transform group-hover:scale-105 border border-[#578463]/50">
            <Activity className="h-5 w-5 stroke-[2.2] text-[#E8F2EA]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#263D32] dark:text-white">
                PCO<span className="text-[#6B9E78] dark:text-[#8FB899]">Sense</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F2EA] dark:bg-[#1F3327] px-2 py-0.5 text-[10px] font-semibold text-[#263D32] dark:text-[#E8F2EA] border border-[#C8DEC3] dark:border-[#35513D]">
                <Sparkles className="h-2.5 w-2.5 text-[#9B7EBD]" /> {isAdmin ? 'Admin Portal' : isDoctor ? 'Doctor Portal' : 'ML v1.0'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#263D32]/70 dark:text-[#E8F2EA]/70 hidden sm:block">
              {isAdmin
                ? 'Platform Operations & Revenue Center'
                : isDoctor
                ? 'Specialist Clinical Practice & Consultations'
                : t('nav.tagline', 'Explainable PCOS Risk Screening')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E8F2EA] dark:bg-[#1F3327] text-[#263D32] dark:text-[#E8F2EA] font-semibold shadow-2xs border border-[#C8DEC3] dark:border-[#35513D]'
                    : 'text-[#263D32]/80 dark:text-[#E8F2EA]/80 hover:bg-[#E8F2EA]/60 dark:hover:bg-[#1F3327]/60 hover:text-[#263D32] dark:hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#6B9E78] dark:text-[#8FB899]' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions & Authentication Section */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Selector in Top Right */}
          <LanguageSelector />

          <ThemeToggle variant="simple" />

          {/* Dedicated Global Accessibility Toggle (Large Text, High Contrast, Easy-Read) */}
          <AccessibilityToggle />

          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] bg-[#E8F2EA] dark:bg-[#1F3327] hover:bg-[#D2E4D6] dark:hover:bg-[#2A4234] border border-[#C8DEC3] dark:border-[#35513D] px-3 py-2 rounded-xl transition-all shadow-2xs"
              title="Open PCOSense AI Awareness Assistant"
              id="header-ai-assistant-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#9B7EBD]" />
              <span>{t('common.askAI', 'Ask AI')}</span>
            </button>
          )}

          {/* Authentication State: Logged In vs Logged Out */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#E5E9E4] dark:border-[#2C3E33] hover:border-[#6B9E78] bg-white dark:bg-[#1F3327] text-[#263D32] dark:text-[#E8F2EA] text-xs font-semibold transition-all shadow-2xs"
                id="user-menu-dropdown-btn"
              >
                <div className="h-7 w-7 rounded-lg bg-[#6B9E78] text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{user.full_name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1C2B22] p-2 shadow-xl border border-[#E5E9E4] dark:border-[#2C3E33] z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-[#E5E9E4] dark:border-[#2C3E33] mb-1">
                    <p className="text-xs font-bold text-[#263D32] dark:text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] text-[#263D32]/70 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#25392D] rounded-xl transition-colors"
                  >
                    <User className="h-4 w-4 text-[#6B9E78]" />
                    <span>{t('nav.profile', 'My Health Profile')}</span>
                  </Link>

                  <Link
                    to="/profile/setup"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#25392D] rounded-xl transition-colors"
                  >
                    <ClipboardList className="h-4 w-4 text-[#6B9E78]" />
                    <span>{t('profile.setupTitle', 'Baseline Profile Setup')}</span>
                  </Link>

                  <Link
                    to="/scan-food"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#25392D] rounded-xl transition-colors"
                  >
                    <Camera className="h-4 w-4 text-[#6B9E78]" />
                    <span className="flex items-center gap-1.5">
                      <span>{t('nav.scanFood', 'Scan Your Food')}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#E8F2EA] dark:bg-[#1A3022] text-[#263D32] dark:text-[#E8F2EA] rounded-md border border-[#C8DEC3]">AI</span>
                    </span>
                  </Link>

                  <Link
                    to={isAdmin ? '/admin' : isDoctor ? '/doctor-dashboard' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#25392D] rounded-xl transition-colors"
                  >
                    {isAdmin ? (
                      <ShieldCheck className="h-4 w-4 text-[#9B7EBD]" />
                    ) : isDoctor ? (
                      <Stethoscope className="h-4 w-4 text-[#6B9E78]" />
                    ) : (
                      <LayoutDashboard className="h-4 w-4 text-[#6B9E78]" />
                    )}
                    <span>
                      {isAdmin
                        ? (isTelugu ? 'అడ్మిన్ సెంటర్' : 'Admin Operations')
                        : isDoctor
                        ? (isTelugu ? 'డాక్టర్ పోర్టల్' : 'Doctor Portal')
                        : t('nav.dashboard', 'Dashboard')}
                    </span>
                  </Link>

                  <div className="border-t border-[#E5E9E4] dark:border-[#2C3E33] my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#D96C75] hover:bg-[#FDF2F3] dark:hover:bg-[#36171B] rounded-xl transition-colors text-left"
                    id="logout-btn"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.logout', 'Sign Out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="header-login-btn"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E9E4] dark:border-[#2C3E33] bg-white dark:bg-[#1F3327] px-3.5 py-2 text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] hover:bg-[#E8F2EA] dark:hover:bg-[#2A4234] transition-colors shadow-2xs"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>{t('nav.login', 'Log In')}</span>
              </Link>

              <Link
                to="/register"
                id="header-create-account-btn"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6B9E78] hover:bg-[#578463] px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#E8F2EA]" />
                <span>{t('nav.register', 'Create Account')}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageSelector variant="compact" />
          <ThemeToggle variant="simple" />
          <AccessibilityToggle />

          {!isAuthenticated && (
            <Link
              to="/login"
              className="rounded-lg bg-[#6B9E78] hover:bg-[#578463] px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
            >
              {t('nav.login', 'Sign In')}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {/* Mobile Auth Banner */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-900 dark:bg-teal-700 text-teal-300 flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800"
              >
                {t('nav.logout', 'Sign Out')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 text-center bg-slate-50 dark:bg-slate-800"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t('nav.login', 'Log In')}</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 text-xs font-bold text-white text-center shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{t('nav.register', 'Create Account')}</span>
              </Link>
            </div>
          )}

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 font-semibold border border-teal-200/60 dark:border-teal-800/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 col-span-2 bg-teal-50/50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900"
              >
                <User className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>{t('nav.profile', 'Manage My Saved Profile')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Drawer Preferences (Language & Accessibility) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🌐</span>
              <span>{t('common.language', 'Language')} / భాష:</span>
            </span>
            <LanguageSelector />
          </div>

          {/* Assistant & Glossary in Mobile */}
          <div className="pt-2 flex gap-2">
            {onOpenAssistant && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAssistant();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-bold text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                <span>{t('common.askAI', 'Ask AI Assistant')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
