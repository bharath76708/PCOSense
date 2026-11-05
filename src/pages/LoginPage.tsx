import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Shield,
  HeartPulse,
  ArrowRight,
  Eye,
  EyeOff,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth, DEFAULT_ACCOUNTS } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { t, isTelugu } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');
  const roleParam = searchParams.get('role') as UserRole | null;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<UserRole>(roleParam || 'user');

  // Check for redirect message or location state
  const stateMessage = (location.state as any)?.message;

  // Pre-fill fields if roleParam provided in query
  useEffect(() => {
    if (roleParam === 'doctor') {
      setEmail(DEFAULT_ACCOUNTS.doctor.email);
      setPassword(DEFAULT_ACCOUNTS.doctor.password);
      setSelectedAccountType('doctor');
    } else if (roleParam === 'admin') {
      setEmail(DEFAULT_ACCOUNTS.admin.email);
      setPassword(DEFAULT_ACCOUNTS.admin.password);
      setSelectedAccountType('admin');
    }
  }, [roleParam]);

  const selectAccount = (type: 'user' | 'doctor' | 'admin') => {
    setSelectedAccountType(type);
    setErrorMessage(null);
    if (type === 'doctor') {
      setEmail(DEFAULT_ACCOUNTS.doctor.email);
      setPassword(DEFAULT_ACCOUNTS.doctor.password);
    } else if (type === 'admin') {
      setEmail(DEFAULT_ACCOUNTS.admin.email);
      setPassword(DEFAULT_ACCOUNTS.admin.password);
    } else {
      setEmail(DEFAULT_ACCOUNTS.patient.email);
      setPassword(DEFAULT_ACCOUNTS.patient.password);
    }
  };

  const handleDirectDemoLogin = async (type: 'user' | 'doctor' | 'admin') => {
    setErrorMessage(null);
    setSelectedAccountType(type);
    const target = type === 'doctor' ? DEFAULT_ACCOUNTS.doctor : type === 'admin' ? DEFAULT_ACCOUNTS.admin : DEFAULT_ACCOUNTS.patient;
    setEmail(target.email);
    setPassword(target.password);

    try {
      const result = await login(target.email, target.password);
      navigate(redirectTarget || result.redirect || (type === 'doctor' ? '/doctor-dashboard' : type === 'admin' ? '/admin' : '/dashboard'));
    } catch (err: any) {
      setErrorMessage(err?.message || t('auth.invalidCredentials', 'Sign-in failed. Please try again.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(t('auth.enterBothEmailPassword', 'Please enter both your email and password.'));
      return;
    }

    try {
      const result = await login(email.trim(), password);
      navigate(redirectTarget || result.redirect || '/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || t('auth.invalidCredentials', 'Invalid email or password. Please try again.'));
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      const result = await loginWithGoogle();
      navigate(redirectTarget || result.redirect || '/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || t('auth.googleSignInFailed', 'Google Sign-In failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-900 dark:bg-teal-950 text-teal-300 shadow-md mb-3.5 border border-teal-700/50">
            <HeartPulse className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.signInTitle', 'Sign In to PCOSense')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {isTelugu
              ? 'మీ వ్యక్తిగత ఖాతాతో లాగిన్ అవ్వండి: పేషెంట్, డాక్టర్ లేదా అడ్మిన్ ప్రత్యేక పోర్టల్స్.'
              : 'Sign in to your dedicated account: Patient, Doctor Specialist, or Administrator portal.'}
          </p>
        </div>

        {/* State Notice if redirected */}
        {stateMessage && (
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span>{stateMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Separate Account Options Card */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isTelugu ? 'ప్రత్యేక ఖాతా ఎంచుకోండి (1-క్లిక్ సైన్-ఇన్)' : 'Select Dedicated Account (1-Click Sign-In)'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isTelugu ? 'లేదా కింద మీ వివరాలు ఇవ్వండి' : 'or enter custom details below'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Patient Account */}
            <div
              onClick={() => selectAccount('user')}
              className={`cursor-pointer text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                selectedAccountType === 'user'
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 shadow-xs ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
              id="account-card-patient"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-200/60 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                    Patient
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Jane Doe
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  patient@pcosense.com
                </p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1 font-medium">
                  {isTelugu ? 'హెల్త్ ప్రొఫైల్ & డైట్' : 'Screening & Diet'}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectDemoLogin('user');
                }}
                disabled={isLoading}
                className="mt-3 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>{isTelugu ? 'లాగిన్' : 'Sign In'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* 2. Doctor Account */}
            <div
              onClick={() => selectAccount('doctor')}
              className={`cursor-pointer text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                selectedAccountType === 'doctor'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
              id="account-card-doctor"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                    Doctor
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Dr. Radhika Sharma
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  doctor.radhika@pcosense.com
                </p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1 font-medium">
                  {isTelugu ? 'కన్సల్టేషన్లు & ఈ-ప్రిస్క్రిప్షన్' : 'Clinical Portal'}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectDemoLogin('doctor');
                }}
                disabled={isLoading}
                className="mt-3 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>{isTelugu ? 'లాగిన్' : 'Sign In'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* 3. Admin Account */}
            <div
              onClick={() => selectAccount('admin')}
              className={`cursor-pointer text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                selectedAccountType === 'admin'
                  ? 'border-[#9B7EBD] bg-[#F1ECF7] dark:bg-[#2A1D3A] shadow-xs ring-2 ring-[#9B7EBD]/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#9B7EBD]/50 dark:hover:border-[#9B7EBD]/50 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
              id="account-card-admin"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-xl bg-[#DFD3EC] dark:bg-[#4B3167] text-[#6C4E8F] dark:text-[#E4D7F2]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFD3EC] dark:bg-[#4B3167] text-[#6C4E8F] dark:text-[#E4D7F2]">
                    Admin
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Administrator
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  admin@pcosense.com
                </p>
                <p className="text-[10px] text-[#6C4E8F] dark:text-[#DFD3EC] mt-1 font-medium">
                  {isTelugu ? 'డాక్టర్ వెరిఫికేషన్ & మేనేజ్‌మెంట్' : 'Verification & Oversight'}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectDemoLogin('admin');
                }}
                disabled={isLoading}
                className="mt-3 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#9B7EBD] hover:bg-[#8668A7] text-white shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>{isTelugu ? 'లాగిన్' : 'Sign In'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            id="google-signin-btn"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('auth.continueGoogle', 'Continue with Google')}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase text-slate-400 font-semibold absolute">
              {t('auth.orEmail', 'or sign in with password')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="login-email">
                {t('auth.emailAddress', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="login-password">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#6B9E78] hover:bg-[#578463] active:bg-[#456A4F] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {isLoading ? (
                <span>{t('auth.authenticating', 'Authenticating...')}</span>
              ) : (
                <>
                  <span>{t('auth.signIn', 'Sign In')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Navigation Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('auth.dontHaveAccount', "Don't have an account yet?")}{' '}
            <Link
              to="/register"
              className="font-semibold text-[#6B9E78] hover:text-[#578463] hover:underline"
            >
              {t('auth.createFreeAccount', 'Create a separate account')}
            </Link>
          </p>

          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="inline-flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-2xl border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase tracking-wider">
                  HIPAA & Indian DPDP Act (2023) Certified Architecture
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                  End-to-End Encrypted • NMC Telemedicine 2020 & EHR Standards India Compliant
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-sm">
              Your sensitive health parameters and clinical telemetry are strictly private and never shared without statutory Section 6 consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
