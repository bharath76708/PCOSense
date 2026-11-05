import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  CreditCard,
  Building,
  Copy,
  Check,
  ArrowRight,
  Clock,
  AlertCircle,
  QrCode,
  Smartphone,
  Calendar,
  DollarSign,
  Code2
} from 'lucide-react';
import {
  getUserSubscription,
  getAdminBankAccountDetails,
  processMockPaymentGateway,
  UserSubscription,
  AdminBankAccountDetails,
  SubscriptionPaymentRecord
} from '../services/subscriptionService';
import { PaymentGatewayIntegrationGuideModal } from './PaymentGatewayIntegrationGuideModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';

interface SubscriptionPlansProps {
  onPlanActivated?: (sub: UserSubscription) => void;
  compact?: boolean;
  highlightPlan?: 'trial_1' | 'plan_100' | 'plan_200';
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onPlanActivated,
  compact = false,
  highlightPlan
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const userId = user?.id || 'usr_patient_sample';
  const userEmail = user?.email || 'jangajahnavisai@gmail.com';
  const userName = user?.full_name || 'Jahnavi Sai';

  const [currentSub, setCurrentSub] = useState<UserSubscription>(() => getUserSubscription(userEmail || userId));
  const [isGatewayGuideOpen, setIsGatewayGuideOpen] = useState(false);

  useEffect(() => {
    setCurrentSub(getUserSubscription(userEmail || userId));
  }, [userEmail, userId]);

  useEffect(() => {
    const handleSubUpdated = () => {
      setCurrentSub(getUserSubscription(userEmail || userId));
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    return () => window.removeEventListener('subscription-updated', handleSubUpdated);
  }, [userEmail, userId]);

  const [adminBank, setAdminBank] = useState<AdminBankAccountDetails>(() => getAdminBankAccountDetails());
  const [selectedPlan, setSelectedPlan] = useState<'trial_1' | 'plan_100' | 'plan_200'>(
    highlightPlan || (currentSub.status === 'blocked' ? 'plan_200' : 'plan_200')
  );

  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    txRef: string;
    amount: number;
    planName: string;
    bankName: string;
  } | null>(null);
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    setCurrentSub(getUserSubscription(userId));
    setAdminBank(getAdminBankAccountDetails());
  }, [userId]);

  const copyText = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedBankField(field);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  const handlePayNow = async () => {
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const result = await processMockPaymentGateway({
        userId,
        userEmail,
        userName,
        plan: selectedPlan,
        paymentMode,
        upiIdOrCard: upiIdInput || adminBank.upiId
      });

      if (result.success) {
        setCurrentSub(result.subscription);
        setSuccessReceipt({
          txRef: result.transactionRef,
          amount: result.paymentRecord.amount,
          planName: result.paymentRecord.planName,
          bankName: result.adminAccount.bankName
        });

        if (onPlanActivated) {
          onPlanActivated(result.subscription);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Payment could not be confirmed. Please verify your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'trial_1' as const,
      name: isTelugu ? '₹1 ట్రయల్ యాక్సెస్' : '3-Day Full Trial',
      price: 1,
      duration: isTelugu ? '3 రోజులు' : '3 Days',
      badge: isTelugu ? 'నూతన రిజిస్ట్రేషన్' : 'Registration Trial',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      description: isTelugu
        ? 'నమోదు చేసుకున్న మొదటి 3 రోజులు ప్లాట్‌ఫారమ్‌లోని అన్ని ఫీచర్లను పరిశీలించండి. 72 గంటల తర్వాత యాక్సెస్ ఆటోమేటిక్‌గా ఆగిపోతుంది.'
        : 'Complete full-platform access for 72 hours post-registration. Automatically blocks access after 3 days until a monthly plan is chosen.',
      features: [
        { text: isTelugu ? 'PCOS క్లినికల్ రిస్క్ విశ్లేషణ' : 'Full PCOS Risk Assessment', allowed: true },
        { text: isTelugu ? '7-రోజుల యాంటీ-ఇన్‌ఫ్లమేటరీ డైట్ ప్లాన్' : '7-Day Anti-Inflammatory Diet', allowed: true },
        { text: isTelugu ? 'యోగా & వ్యాయామ వీడియోలు' : 'Yoga & Movement Video Library', allowed: true },
        { text: isTelugu ? 'డాక్టర్ కన్సల్టేషన్ బుకింగ్ & చాట్' : 'Doctor Consultations & Chats', allowed: true }
      ],
      footnote: isTelugu ? 'గడువు: 72 గంటలు (ఆటో-బ్లాక్)' : 'Expires in 72 hours (auto-blocked)'
    },
    {
      id: 'plan_100' as const,
      name: isTelugu ? '₹100 బేసిక్ కేర్ ప్లాన్' : 'Basic Care Plan',
      price: 100,
      duration: isTelugu ? '1 నెల (30 రోజులు)' : '1 Month (30 Days)',
      badge: isTelugu ? 'ఎసెన్షియల్ కేర్' : 'Core Diagnostics',
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700',
      description: isTelugu
        ? 'PCOS రిస్క్ కాలిక్యులేటర్, మైక్రో-న్యూట్రిషన్ భోజన ప్రణాళికలు మరియు సింప్టమ్ ట్రాకింగ్ కోరుకునే వారికి అనుకూలం.'
        : 'Essential care for diet, symptom monitoring, and ML diagnostic risk analysis without live doctor teleconsultations.',
      features: [
        { text: isTelugu ? 'PCOS క్లినికల్ రిస్క్ విశ్లేషణ' : 'PCOS ML Risk Assessment & Insights', allowed: true },
        { text: isTelugu ? '7-రోజుల యాంటీ-ఇన్‌ఫ్లమేటరీ డైట్ & న్యూట్రిషన్' : '7-Day Low-GI Diet & Micronutrients', allowed: true },
        { text: isTelugu ? 'రోజువారీ లక్షణాలు & నీటి ట్రాకింగ్' : 'Daily Symptom & Water Tracking', allowed: true },
        { text: isTelugu ? 'యోగా & వ్యాయామ వీడియోలు' : 'Yoga & Movement Video Library', allowed: false, note: 'Plan 200 Only' },
        { text: isTelugu ? 'డాక్టర్ కన్సల్టేషన్ & చాట్' : 'Doctor Consultations & Chats', allowed: false, note: 'Plan 200 Only' }
      ],
      footnote: isTelugu ? 'వైద్యుల సంప్రదింపులు చేర్చబడలేదు' : 'Doctor consultations & Yoga locked'
    },
    {
      id: 'plan_200' as const,
      name: isTelugu ? '₹200 ప్రీమియం ఆల్-యాక్సెస్' : 'Complete All-Access',
      price: 200,
      duration: isTelugu ? '1 నెల (30 రోజులు)' : '1 Month (30 Days)',
      badge: isTelugu ? 'అత్యంత ప్రజాదరణ పొందినది' : 'Full Access Recommended',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      popular: true,
      description: isTelugu
        ? 'డాక్టర్ కన్సల్టేషన్లు, NMC ఈ-ప్రిస్క్రిప్షన్లు, డాక్టర్లతో ప్రత్యక్ష చాట్ మరియు యోగా వీడియోలతో సహా పూర్తి యాక్సెస్.'
        : 'Total clinical healthcare access including specialist doctor appointments, direct teleconsult chats, official NMC prescriptions, and all yoga videos.',
      features: [
        { text: isTelugu ? 'అన్ని బేసిక్ కేర్ ఫీచర్లు' : 'All Basic Care Features Included', allowed: true },
        { text: isTelugu ? 'యోగా & వ్యాయామ పూర్తి వీడియో లైబ్రరీ' : 'Full Yoga & Workout Video Library', allowed: true },
        { text: isTelugu ? 'నిపుణులైన గైనకాలజిస్టులతో కన్సల్టేషన్లు' : 'Verified Specialist Doctor Consults', allowed: true },
        { text: isTelugu ? 'డాక్టర్లతో డైరెక్ట్ కన్సల్ట్ చాట్' : 'Direct Real-Time Doctor Chat', allowed: true },
        { text: isTelugu ? 'NMC 2020 ప్రామాణిక ఈ-ప్రిస్క్రిప్షన్లు' : 'NMC 2020 Standard E-Prescriptions', allowed: true }
      ],
      footnote: isTelugu ? 'అన్ని ఫీచర్లు అన్‌లాక్ చేయబడ్డాయి' : 'Unlocks 100% of PCOSense features'
    }
  ];

  return (
    <div className="space-y-6" id="subscription-plans-root">
      {/* Current Subscription Status Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              {isTelugu ? 'ప్రస్తుత సబ్‌స్క్రిప్షన్ స్థితి' : 'Your Current Subscription'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                currentSub.status === 'blocked'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : currentSub.status === 'trial_active'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {currentSub.status === 'blocked'
                ? 'Trial Expired (Blocked)'
                : currentSub.status === 'trial_active'
                ? `3-Day Trial Active (${currentSub.daysRemaining} days left)`
                : `${currentSub.tier === 'plan_200' ? 'Complete Plan (₹200)' : 'Basic Plan (₹100)'} (${currentSub.daysRemaining} days left)`}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {currentSub.status === 'blocked'
              ? isTelugu
                ? 'మీ 3-రోజుల ట్రయల్ ముగిసింది. దయచేసి కొనసాగించడానికి ₹100 లేదా ₹200 ప్లాన్ ఎంచుకోండి.'
                : 'Your 3-day trial period has finished. UI components and doctor features are restricted until a monthly plan is selected.'
              : currentSub.tier === 'plan_100'
              ? isTelugu
                ? 'మీరు ₹100 బేసిక్ ప్లాన్‌లో ఉన్నారు. డాక్టర్లు మరియు యోగా వీడియోలు లాక్ చేయబడ్డాయి.'
                : 'You are on the ₹100 Basic Plan. Doctor consultations, chats, and yoga videos require the ₹200 Complete Plan.'
              : isTelugu
              ? 'మీ ప్లాన్ సక్రియంగా ఉంది. ప్లాట్‌ఫారమ్ పూర్తి యాక్సెస్ అన్‌లాక్ చేయబడింది.'
              : 'Your subscription is active. All platform and clinical modules are fully unlocked.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsGatewayGuideOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isTelugu ? 'గేట్‌వే గైడ్' : 'Gateway Architecture Guide'}</span>
          </button>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block uppercase">Settlement Account</span>
            <span className="text-xs font-mono font-bold text-teal-300">{adminBank.bankName}</span>
          </div>
        </div>
      </div>

      {/* Success Receipt Banner if just paid */}
      {successReceipt && (
        <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in border border-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">Payment Confirmed & Verified!</h4>
              <p className="text-xs text-emerald-100">
                Amount ₹{successReceipt.amount} deposited to Admin Account ({successReceipt.bankName}). Ref:{' '}
                <span className="font-mono font-bold">{successReceipt.txRef}</span>
              </p>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Saved to Cloud Firestore under <code className="font-mono">subscription_payments</code> ledger.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessReceipt(null)}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer self-end sm:self-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Tiers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isCurrentActivePlan =
            (plan.id === 'trial_1' && currentSub.status === 'trial_active') ||
            (plan.id === 'plan_100' && currentSub.tier === 'plan_100' && currentSub.status === 'active') ||
            (plan.id === 'plan_200' && currentSub.tier === 'plan_200' && currentSub.status === 'active');

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-6 transition-all cursor-pointer flex flex-col justify-between border-2 ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold shadow-sm">
                  Recommended
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  {isCurrentActivePlan && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      Current Plan
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>

                <div className="mt-2 mb-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    / {plan.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {plan.description}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 mb-4">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {feat.allowed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className={feat.allowed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 line-through'}>
                          {feat.text}
                        </span>
                      </div>
                      {feat.note && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          {feat.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <span>{plan.footnote}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{isSelected ? 'Selected' : 'Select Plan'}</span>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Gateway Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <span>Simulated Payment Gateway & Admin Settlement</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely routes payment directly to PCOSense Admin Bank Account and records receipt in Cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Escrow Verified</span>
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Method Selector (Left) */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              1. Choose Payment Method
            </span>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI' as const, label: 'UPI (GPay/PhonePe)', icon: Smartphone },
                { id: 'Card' as const, label: 'Debit / Credit Card', icon: CreditCard },
                { id: 'NetBanking' as const, label: 'Net Banking', icon: Building }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMode(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMode === m.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <m.icon className="h-4 w-4 mb-2 text-indigo-600" />
                  <span className="text-xs leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {paymentMode === 'UPI' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Your Virtual Payment Address (VPA) / UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                  value={upiIdInput}
                  onChange={e => setUpiIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Admin Beneficiary Account Card (Right) */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Direct Admin Settlement Account
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Secure Routing</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Beneficiary</span>
                <span className="font-bold text-white text-xs">{adminBank.accountHolderName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Bank</span>
                <span className="font-bold text-white text-xs">{adminBank.bankName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Account Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs">{adminBank.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyText(adminBank.accountNumber, 'acc')}
                    className="p-1 rounded bg-slate-800 text-teal-400 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedBankField === 'acc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">IFSC / UPI</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-teal-300 text-xs">{adminBank.ifscCode}</span>
                  <button
                    type="button"
                    onClick={() => copyText(adminBank.upiId, 'upi')}
                    className="p-1 rounded bg-slate-800 text-teal-400 hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedBankField === 'upi' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin UPI: <strong className="text-teal-300 font-mono">{adminBank.upiId}</strong></span>
              <span>Branch: {adminBank.branchName}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Selected Plan:{' '}
            <strong className="text-slate-900 dark:text-white">
              {selectedPlan === 'trial_1' ? '₹1 (3-Day Trial)' : selectedPlan === 'plan_100' ? '₹100 (1-Month Basic)' : '₹200 (1-Month Complete)'}
            </strong>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePayNow}
            className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isProcessing
                ? 'bg-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Processing Payment Gateway & Firestore Sync...</span>
              </>
            ) : (
              <>
                <span>
                  Pay ₹{selectedPlan === 'trial_1' ? 1 : selectedPlan === 'plan_100' ? 100 : 200} Now
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <PaymentGatewayIntegrationGuideModal
        isOpen={isGatewayGuideOpen}
        onClose={() => setIsGatewayGuideOpen(false)}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        onSubscriptionUpgraded={(sub) => {
          setIsGatewayGuideOpen(false);
          setCurrentSub(sub);
          if (onPlanActivated) onPlanActivated(sub);
        }}
      />
    </div>
  );
};
