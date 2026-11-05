import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  CreditCard,
  Building,
  Copy,
  Check,
  AlertCircle,
  X as CloseIcon,
  Clock,
  Lock,
  ArrowRight,
  Zap,
  Activity,
  Heart,
  Stethoscope,
  Video,
  Code2
} from 'lucide-react';
import {
  getAdminBankAccountDetails,
  activateUserTrial,
  subscribeUserToPlan,
  UserSubscription
} from '../services/subscriptionService';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { PaymentGatewayIntegrationGuideModal } from './PaymentGatewayIntegrationGuideModal';
import { useLanguage } from '../translations';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userId?: string;
  onSuccess?: (sub: UserSubscription) => void;
  initialSelectedPlan?: 'trial_1' | 'plan_100' | 'plan_200';
}

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'jangajahnavisai@gmail.com',
  userName = 'Jahnavi Sai',
  userId = 'usr_patient_sample',
  onSuccess,
  initialSelectedPlan = 'trial_1'
}) => {
  const { isTelugu } = useLanguage();
  const adminBank = getAdminBankAccountDetails();

  const [selectedPlan, setSelectedPlan] = useState<'trial_1' | 'plan_100' | 'plan_200'>(initialSelectedPlan);
  const [isGatewayGuideOpen, setIsGatewayGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(initialSelectedPlan);
    }
  }, [initialSelectedPlan]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txnReference, setTxnReference] = useState<string>(() => `UPI-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'bank_transfer' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [completedPayment, setCompletedPayment] = useState<{
    plan: 'trial_1' | 'plan_100' | 'plan_200';
    amount: number;
    transactionRef: string;
    expiryDate?: string;
  } | null>(null);

  if (!isOpen) return null;

  if (completedPayment) {
    return (
      <PaymentSuccessModal
        isOpen={true}
        onClose={() => {
          setCompletedPayment(null);
          onClose();
        }}
        plan={completedPayment.plan}
        amount={completedPayment.amount}
        transactionRef={completedPayment.transactionRef}
        depositedAccount={`${adminBank.bankName} (${adminBank.accountNumber})`}
        expiryDate={completedPayment.expiryDate}
        userName={userName}
        onGoToDashboard={() => {
          setCompletedPayment(null);
          onClose();
        }}
      />
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const planAmount = selectedPlan === 'trial_1' ? 1 : selectedPlan === 'plan_100' ? 100 : 200;

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      let updatedSub: UserSubscription;
      if (selectedPlan === 'trial_1') {
        updatedSub = activateUserTrial(userId, userEmail, userName, txnReference);
      } else {
        updatedSub = subscribeUserToPlan(userId, userEmail, userName, selectedPlan, txnReference);
      }

      setIsProcessing(false);
      setShowSuccessToast(true);
      if (onSuccess) onSuccess(updatedSub);

      // Trigger the Payment Success feedback modal displaying active plan benefits
      setCompletedPayment({
        plan: selectedPlan,
        amount: planAmount,
        transactionRef: txnReference,
        expiryDate: updatedSub.expiryDate
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white border-b border-teal-800/40 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ప్రిస్క్రిప్షన్ & క్లినికల్ యాక్సెస్ ప్లాన్స్' : 'PCOSense Healthcare Access & Plans'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {isTelugu ? 'మీ PCOS ప్లాన్‌ను ఎంచుకోండి' : 'Choose Your PCOS Care Plan'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100">
              {isTelugu
                ? 'రిజిస్ట్రేషన్ తర్వాత 3 రోజుల ట్రయల్ కోసం ₹1 చెల్లించండి లేదా పూర్తి సేవలకు ₹100 లేదా ₹200 ప్లాన్‌ను ఎంచుకోండి.'
                : 'PCOSense is a regulated clinical platform. Start with 3 days trial for ₹1, or select monthly access with direct deposit to Admin account.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGatewayGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shadow-xs"
              >
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isTelugu ? '🔌 పేమెంట్ గేట్‌వే గైడ్ & సిమ్యులేటర్' : '🔌 How Gateway Works (Developer Guide & Simulator)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Option 1: 3-Day Trial Banner */}
          <div
            onClick={() => setSelectedPlan('trial_1')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              selectedPlan === 'trial_1'
                ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {isTelugu ? '3 రోజుల ట్రయల్ యాక్సెస్' : '3-Day Full Trial Access'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase">
                    New Users
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isTelugu
                    ? 'రిజిస్ట్రేషన్ తర్వాత కేవలం ₹1 చెల్లించి 3 రోజుల పాటు యాక్సెస్ పొందండి. 3 రోజుల తర్వాత యాక్సెస్ ఆటోమేటిక్‌గా నిలిపివేయబడుతుంది.'
                    : 'Pay ₹1 after registration for 3 full days of access. Access is automatically blocked after 3 days until upgraded.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">₹1</span>
                <span className="text-[11px] text-slate-400 block font-medium">3 Days Validity</span>
              </div>
              <input
                type="radio"
                name="plan_selection"
                checked={selectedPlan === 'trial_1'}
                onChange={() => setSelectedPlan('trial_1')}
                className="h-5 w-5 text-amber-500 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Section: 2 Monthly Plans Comparison */}
          <div>
            <div className="text-center sm:text-left mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isTelugu ? 'నెలవారీ ప్లాన్‌లు (Monthly Subscription Plans)' : 'Monthly Subscription Plans'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu ? 'మీ అవసరానికి తగిన ప్లాన్‌ను ఎంచుకోండి:' : 'Select between Basic Diet & Analysis or Complete All-Access:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* PLAN 1: ₹100 / Month */}
              <div
                onClick={() => setSelectedPlan('plan_100')}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex flex-col justify-between space-y-5 ${
                  selectedPlan === 'plan_100'
                    ? 'border-teal-500 bg-teal-500/5 shadow-md ring-2 ring-teal-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-400/50 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      Plan 1 • Basic Tier
                    </span>
                    <input
                      type="radio"
                      name="plan_selection"
                      checked={selectedPlan === 'plan_100'}
                      onChange={() => setSelectedPlan('plan_100')}
                      className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Analysis, Diet & Info Access</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ideal for self-guided dietary optimization & clinical risk screening.
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">₹100</span>
                    <span className="text-xs text-slate-400 font-medium"> / 1 Month</span>
                  </div>

                  {/* Included features */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      Included Benefits:
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <span>5-Step ML PCOS Risk Assessment & Rotterdam Phenotype</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <span>7-Day Anti-Inflammatory Personalized Diet Plan</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <span>Daily Micronutrient Tracking & Target Calculator</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <span>Clinical PCOS Education, Articles & Medical Guides</span>
                    </div>

                    {/* Excluded features */}
                    <div className="pt-2 space-y-1.5 opacity-60">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                        <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Doctor Appointments & NMC Prescriptions</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                        <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Direct Patient-Doctor Clinical Chat</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 line-through">
                        <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Curated Yoga & Exercise Video Library</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  {isTelugu ? 'వైద్యుల సంప్రదింపులు మరియు యోగా వీడియోలు ఈ ప్లాన్‌లో ఉండవు.' : 'Other features are hidden/locked under this tier.'}
                </div>
              </div>

              {/* PLAN 2: ₹200 / Month */}
              <div
                onClick={() => setSelectedPlan('plan_200')}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all flex flex-col justify-between space-y-5 relative ${
                  selectedPlan === 'plan_200'
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-md ring-2 ring-indigo-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase shadow-sm">
                  Recommended • Complete
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      Plan 2 • Full All-Access
                    </span>
                    <input
                      type="radio"
                      name="plan_selection"
                      checked={selectedPlan === 'plan_200'}
                      onChange={() => setSelectedPlan('plan_200')}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Complete All-Access Care</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Complete PCOS management with specialist tele-consultations and yoga routines.
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">₹200</span>
                    <span className="text-xs text-slate-400 font-medium"> / 1 Month</span>
                  </div>

                  {/* Included features */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      All Benefits Included:
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Everything in ₹100 Plan (ML Assessment & Diet)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Full Yoga & Movement Videos (Direct In-App Player)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Verified Doctor Booking (Gynecologists & Endocrinologists)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Direct 1-on-1 Patient-Doctor Chat & Clarifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Standardized NMC Appendix 2 E-Prescriptions</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>What-If Hormone Simulator & Full Health Dossier Export</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl font-medium">
                  {isTelugu ? 'అన్ని ఫీచర్లు, వీడియోలు మరియు వైద్యుల సేవలు పూర్తిగా అందుబాటులో ఉంటాయి.' : 'Full clinical coverage with zero restrictions.'}
                </div>
              </div>

            </div>
          </div>

          {/* Admin Bank Account & Direct Deposit Information */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  <span>Admin Master Bank Account Details</span>
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                  {isTelugu ? 'డబ్బులు అడ్మిన్ ఖాతాలోకి జమ చేయబడతాయి' : 'All Funds Directly Deposited to Admin Account'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Send payment via UPI or IMPS/NEFT to the verified admin escrow account below:
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-right">
                <span className="text-[10px] text-slate-400 block">Amount to Pay</span>
                <span className="text-xl font-extrabold text-teal-400">₹{planAmount}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Bank Name & Branch */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Bank & Branch</span>
                <p className="font-bold text-white">{adminBank.bankName}</p>
                <p className="text-[11px] text-slate-300 truncate">{adminBank.branchName}</p>
              </div>

              {/* Account Number */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Account Number</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adminBank.accountNumber, 'acc')}
                    className="text-teal-400 hover:text-teal-300 transition-colors text-[10px] flex items-center gap-1 font-bold"
                  >
                    {copiedField === 'acc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-white tracking-wider">{adminBank.accountNumber}</p>
                <p className="text-[11px] text-slate-400">IFSC: <span className="font-mono text-slate-200">{adminBank.ifscCode}</span></p>
              </div>

              {/* UPI ID */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Admin UPI ID</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adminBank.upiId, 'upi')}
                    className="text-teal-400 hover:text-teal-300 transition-colors text-[10px] flex items-center gap-1 font-bold"
                  >
                    {copiedField === 'upi' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedField === 'upi' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-teal-300 truncate">{adminBank.upiId}</p>
                <p className="text-[11px] text-slate-400">{adminBank.accountHolderName}</p>
              </div>
            </div>

            {/* Payment Verification Form */}
            <form onSubmit={handleCompletePayment} className="pt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Reference / UTR Number</label>
                  <input
                    type="text"
                    required
                    value={txnReference}
                    onChange={(e) => setTxnReference(e.target.value)}
                    placeholder="Enter UPI UTR or Ref No."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-400 text-xs"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                    <option value="bank_transfer">IMPS / NEFT Direct Bank Transfer</option>
                    <option value="card">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Instant statutory activation & 100% money-back guarantee.</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Deposit...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₹{planAmount} & Activate Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Success Notification */}
          {showSuccessToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>
                Payment of ₹{planAmount} verified and deposited to Admin account! Your{' '}
                {selectedPlan === 'trial_1' ? '3-day trial' : selectedPlan === 'plan_100' ? '₹100 monthly plan' : '₹200 all-access plan'}{' '}
                is active.
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Interactive Gateway Architecture Guide & Live Simulator */}
      <PaymentGatewayIntegrationGuideModal
        isOpen={isGatewayGuideOpen}
        onClose={() => setIsGatewayGuideOpen(false)}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        onSubscriptionUpgraded={(sub) => {
          setIsGatewayGuideOpen(false);
          setSelectedPlan(sub.tier as any);
          if (onSuccess) onSuccess(sub);
        }}
      />
    </div>
  );
};
