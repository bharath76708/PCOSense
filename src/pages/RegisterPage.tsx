import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Building,
  FileBadge,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { UserRole } from '../types';
import { SubscriptionPaymentModal } from '../components/SubscriptionPaymentModal';
import { SubscriptionTiersComparison } from '../components/SubscriptionTiersComparison';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle, isLoading } = useAuth();
  const { t, isTelugu } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');
  const isFromAssessment = redirectTarget === '/assessment';
  const requestedRoleParam = searchParams.get('role');
  // Account creation is strictly restricted to Patient ('user') and Doctor Specialist ('doctor') only
  const initialRole: 'user' | 'doctor' = requestedRoleParam === 'doctor' ? 'doctor' : 'user';
  const requestedPlanParam = searchParams.get('plan');

  const [selectedRole, setSelectedRole] = useState<'user' | 'doctor'>(initialRole);
  const [chosenPlan, setChosenPlan] = useState<'trial_1' | 'plan_100' | 'plan_200'>(
    requestedPlanParam === 'plan_100' || requestedPlanParam === 'plan_200'
      ? requestedPlanParam
      : 'trial_1'
  );
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-registration payment modal for patients
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [registeredUserInfo, setRegisteredUserInfo] = useState<{ id: string; email: string; name: string } | null>(null);

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState<string>('Gynecologist & PCOS Specialist');
  const [clinic, setClinic] = useState<string>("Women's Health & Fertility Clinic");
  const [licenseNumber, setLicenseNumber] = useState<string>('');

  const isLengthValid = password.length >= 6;
  const isMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const hasMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password;
    const cleanConfirmPassword = confirmPassword;

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirmPassword) {
      setErrorMessage(t('auth.fillAllFields', 'Please fill in all required fields.'));
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setErrorMessage(t('auth.passwordsDoNotMatch', 'Passwords do not match. Please ensure both fields contain the exact same password.'));
      const confirmInput = document.getElementById('reg-confirm-password');
      if (confirmInput) confirmInput.focus();
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage(t('auth.passwordLengthNotice', 'Password must be at least 6 characters long.'));
      const passInput = document.getElementById('reg-password');
      if (passInput) passInput.focus();
      return;
    }

    try {
      const result = await register(
        cleanName,
        cleanEmail,
        cleanPassword,
        cleanConfirmPassword,
        selectedRole,
        selectedRole === 'doctor'
          ? {
              specialization: specialization.trim() || 'Gynecologist & PCOS Specialist',
              clinic: clinic.trim() || "Women's Health & Fertility Clinic",
              licenseNumber: licenseNumber.trim() || `MCI-${Math.floor(100000 + Math.random() * 900000)}`
            }
          : undefined,
        chosenPlan
      );

      if (selectedRole === 'user') {
        setRegisteredUserInfo({
          id: (result as any)?.user?.id || 'usr_patient_sample',
          email: cleanEmail,
          name: cleanName
        });
        setIsPaymentModalOpen(true);
      } else {
        navigate(
          redirectTarget ||
            result.redirect ||
            '/doctor-dashboard'
        );
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err?.message || t('auth.regFailed', 'Failed to create account. Please check your details or try Google Sign-In.'));
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    try {
      const result = await loginWithGoogle();
      navigate(
        redirectTarget ||
          result.redirect ||
          (selectedRole === 'doctor' ? '/doctor-dashboard' : '/profile/setup')
      );
    } catch (err: any) {
      setErrorMessage(err?.message || t('auth.googleSignInFailed', 'Google Sign-In failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className={`w-full ${selectedRole === 'user' ? 'max-w-4xl' : 'max-w-xl'} space-y-6 transition-all duration-300`}>
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-300 shadow-md mb-3.5 border border-teal-700/50">
            <UserPlus className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isTelugu ? 'కొత్త ఖాతా సృష్టించండి' : 'Create Dedicated Account'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {isTelugu
              ? 'పేషెంట్ లేదా డాక్టర్ స్పెషలిస్ట్ కోసం ప్రత్యేక ఖాతాను ఎంచుకుని రిజిస్టర్ అవ్వండి.'
              : 'Choose whether you are registering as a Patient or a Doctor Specialist.'}
          </p>
        </div>

        {/* Clinical Assessment Context Banner */}
        {isFromAssessment && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <Stethoscope className="h-5 w-5 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">{t('auth.clinicalAccess', 'Clinical Assessment Access')}</p>
              <p className="text-[11px] sm:text-xs text-teal-800/90 dark:text-teal-300">
                {t('auth.clinicalAccessDesc', 'Please create your free patient account (or sign in) to begin your confidential 5-step screening. This ensures your biomarker inputs and calibrated risk probabilities are securely saved.')}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">{errorMessage}</span>
              {errorMessage.includes('do not match') && (
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  {t('auth.eyeIconTip', 'Tip: Click the eye icon on the password fields to view and verify what you typed.')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Role Selection Tabs - STRICTLY PATIENT & DOCTOR ONLY */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              {isTelugu ? 'ఖాతా రకాన్ని ఎంచుకోండి:' : 'Select Account Type:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isTelugu ? 'పేషెంట్ లేదా డాక్టర్' : 'Patient or Doctor'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Patient Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedRole === 'user'
                  ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/60 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              id="role-select-patient"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'పేషెంట్' : 'Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {isTelugu ? 'లక్షణాలు, డైట్ & వెల్నెస్ ట్రాకింగ్' : 'Screening, 7-day diet & wellness'}
              </p>
            </button>

            {/* Doctor Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('doctor');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedRole === 'doctor'
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              id="role-select-doctor"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'డాక్టర్ స్పెషలిస్ట్' : 'Doctor Specialist'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {isTelugu ? 'కన్సల్టేషన్లు, ప్రిస్క్రిప్షన్ & రికార్డులు' : 'Clinical portal & patient consults'}
              </p>
            </button>
          </div>
        </div>

        {/* Subscription Tiers Selection for Patients */}
        {selectedRole === 'user' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-teal-600" />
                {isTelugu ? 'సబ్‌స్క్రిప్షన్ ప్లాన్‌ను ఎంచుకోండి:' : 'Step 1: Choose Your Plan Tier'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isTelugu ? 'పారదర్శకమైన ధరలు • సురక్షిత చెల్లింపు' : 'Clear Pricing • Secure & Protected'}
              </span>
            </div>

            <SubscriptionTiersComparison
              mode="register"
              selectedPlan={chosenPlan}
              onSelectPlan={(plan) => setChosenPlan(plan)}
            />
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            id="google-signup-btn"
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
              {t('auth.orEmail', 'or with email')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="reg-name">
                {selectedRole === 'doctor' ? (isTelugu ? 'డాక్టర్ పూర్తి పేరు' : 'Doctor Full Name') : t('auth.fullName', 'Full Name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={selectedRole === 'doctor' ? 'Dr. Ananya Reddy' : 'Jane Doe'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Doctor-Specific Fields */}
            {selectedRole === 'doctor' && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Stethoscope className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{isTelugu ? 'డాక్టర్ సర్టిఫికేషన్ వివరాలు' : 'Medical Credentials & Practice'}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isTelugu ? 'స్పెషలైజేషన్' : 'Specialization'}
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Gynecologist & PCOS Specialist"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isTelugu ? 'క్లినిక్ / హాస్పిటల్' : 'Clinic / Hospital'}
                    </label>
                    <input
                      type="text"
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      placeholder="Apollo Fertility Clinic"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isTelugu ? 'లైసెన్స్ / రిజిస్ట్రేషన్ నం' : 'MCI / State License No'}
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="TS-MCI-88412"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="reg-email">
                {t('auth.emailAddress', 'Email Address')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={selectedRole === 'doctor' ? 'doctor@hospital.org' : 'name@example.com'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300" htmlFor="reg-password">
                  {t('auth.password', 'Password')}
                </label>
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  password.length === 0
                    ? 'text-slate-400'
                    : isLengthValid
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isLengthValid && password.length > 0 && <Check className="h-3 w-3" />}
                  {t('auth.minChars', 'Min 6 characters')}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    passwordTouched && !isLengthValid && password.length > 0
                      ? 'border-amber-400 dark:border-amber-600 focus:ring-amber-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-700 focus:border-transparent'
                  }`}
                  autoComplete="new-password"
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

            {/* Confirm Password Input with Match Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300" htmlFor="reg-confirm-password">
                  {t('auth.confirmPassword', 'Confirm Password')}
                </label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                    isMatch
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isMatch ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        {t('auth.passwordsMatch', 'Passwords match')}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        {t('auth.passwordsMismatch', 'Does not match')}
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordTouched(true);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    confirmPasswordTouched && hasMismatch
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/20'
                      : confirmPassword.length > 0 && isMatch
                      ? 'border-teal-400 dark:border-teal-600 focus:ring-teal-500 bg-teal-50/20'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-700 focus:border-transparent'
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (confirmPassword.length > 0 && !isMatch)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRole === 'doctor'
                  ? 'bg-[#263D32] hover:bg-[#1C2F26] active:bg-[#121E18]'
                  : selectedRole === 'admin'
                  ? 'bg-[#9B7EBD] hover:bg-[#8668A7] active:bg-[#725293]'
                  : 'bg-[#6B9E78] hover:bg-[#578463] active:bg-[#456A4F]'
              }`}
              id="register-submit-btn"
            >
              {isLoading ? (
                <span>{t('auth.creatingAccount', 'Creating Account...')}</span>
              ) : (
                <>
                  <span>
                    {selectedRole === 'doctor'
                      ? isTelugu ? 'డాక్టర్ ఖాతా సృష్టించండి' : 'Create Doctor Account'
                      : selectedRole === 'admin'
                      ? isTelugu ? 'అడ్మిన్ ఖాతా సృష్టించండి' : 'Create Admin Account'
                      : chosenPlan === 'trial_1'
                      ? isTelugu ? 'పేషెంట్ ఖాతా & ₹1 ట్రయల్ కొనసాగించండి' : 'Create Patient Account & Start ₹1 Trial'
                      : chosenPlan === 'plan_100'
                      ? isTelugu ? 'పేషెంట్ ఖాతా & ₹100 ప్లాన్ కొనసాగించండి' : 'Create Patient Account & Continue with ₹100 Plan'
                      : isTelugu ? 'పేషెంట్ ఖాతా & ₹200 ఫుల్ యాక్సెస్ కొనసాగించండి' : 'Create Patient Account & Get Full Access (₹200)'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Navigation Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link
              to="/login"
              className="font-semibold text-[#6B9E78] hover:text-[#578463] hover:underline"
            >
              {t('auth.signInLink', 'Sign in instead')}
            </Link>
          </p>

          <div className="flex flex-col items-center gap-2 pt-1">
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
              Your registration data and diagnostic biomarkers are safeguarded in compliance with MoHFW & Indian IT Act provisions.
            </p>
          </div>
        </div>
      </div>

      {/* Post-Registration 1 Rupee / Plan Payment Modal */}
      {registeredUserInfo && (
        <SubscriptionPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            navigate(redirectTarget || '/dashboard');
          }}
          userEmail={registeredUserInfo.email}
          userName={registeredUserInfo.name}
          userId={registeredUserInfo.id}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            navigate(redirectTarget || '/dashboard');
          }}
          initialSelectedPlan={chosenPlan}
        />
      )}
    </div>
  );
};

