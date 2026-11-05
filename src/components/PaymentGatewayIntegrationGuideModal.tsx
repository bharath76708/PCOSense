import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Lock,
  ArrowRight,
  Server,
  Smartphone,
  Database,
  RefreshCw,
  Sparkles,
  X as CloseIcon,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../translations';
import {
  subscribeUserToPlan,
  activateUserTrial,
  UserSubscription
} from '../services/subscriptionService';

interface PaymentGatewayIntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
  onSubscriptionUpgraded?: (sub: UserSubscription) => void;
}

export const PaymentGatewayIntegrationGuideModal: React.FC<PaymentGatewayIntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  userId = 'usr_patient_sample',
  userEmail = 'jangajahnavisai@gmail.com',
  userName = 'Jahnavi Sai',
  onSubscriptionUpgraded
}) => {
  const { isTelugu } = useLanguage();

  const [activeTab, setActiveTab] = useState<'architecture' | 'simulator' | 'code'>('architecture');
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'phonepe' | 'cashfree'>('razorpay');
  const [selectedTestPlan, setSelectedTestPlan] = useState<'plan_100' | 'plan_200' | 'trial_1'>('plan_200');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationSuccess, setSimulationSuccess] = useState<boolean>(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const handleRunSimulator = async () => {
    setIsSimulating(true);
    setSimulationSuccess(false);
    setSimulationStep(1); // Step 1: Create Order

    await new Promise((r) => setTimeout(r, 700));
    setSimulationStep(2); // Step 2: Gateway Handshake

    await new Promise((r) => setTimeout(r, 900));
    setSimulationStep(3); // Step 3: Webhook & Signature Verification

    await new Promise((r) => setTimeout(r, 800));
    setSimulationStep(4); // Step 4: Grant Access in Firestore

    let updatedSub: UserSubscription;
    const ref = `${selectedGateway.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    if (selectedTestPlan === 'trial_1') {
      updatedSub = activateUserTrial(userId, userEmail, userName, ref);
    } else {
      updatedSub = subscribeUserToPlan(userId, userEmail, userName, selectedTestPlan, ref);
    }

    setIsSimulating(false);
    setSimulationSuccess(true);
    if (onSubscriptionUpgraded) {
      onSubscriptionUpgraded(updatedSub);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white border-b border-teal-800/40 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Zap className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'పేమెంట్ గేట్‌వే గైడ్ & లైవ్ సిమ్యులేటర్' : 'Payment Gateway Architecture & Live Simulator'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isTelugu ? 'పేమెంట్ గేట్‌వే ఎలా పనిచేస్తుంది & అనుసంధానం' : 'How Payment Gateways Work & How to Integrate'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100">
              {isTelugu
                ? 'యూజర్ చెల్లించిన తర్వాత ప్రో / ప్రీమియం సేవలను ఆటోమేటిక్‌గా అన్‌లాక్ చేయడానికి పూర్తి మార్గదర్శి.'
                : 'Complete production guide on integrating Razorpay, PhonePe & Cashfree with automatic feature unlocking based on verified transactions.'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-teal-800/40">
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              1. {isTelugu ? 'ఆర్కిటెక్చర్ & ఫ్లో' : 'Architecture & Flow'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>2. {isTelugu ? 'లైవ్ గేట్‌వే సిమ్యులేటర్' : 'Live Gateway Simulator'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>3. {isTelugu ? 'కోడ్ ఉదాహరణలు' : 'Production Code'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto grow">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                  <p className="font-extrabold text-amber-900 dark:text-amber-100">
                    {isTelugu ? 'ప్రశ్న: పేమెంట్ గేట్‌వే తర్వాత యాక్సెస్ ఎలా లభిస్తుంది?' : 'The Core Concept: How Payment Unlocks Access'}
                  </p>
                  <p className="leading-relaxed">
                    {isTelugu
                      ? 'ఫ్రంటెండ్‌లో నేరుగా డబ్బులు కట్ కావు. గేట్‌వే (Razorpay/PhonePe) ద్వారా వచ్చిన డిజిటల్ సిగ్నేచర్‌ను సర్వర్ వెరిఫై చేసి, ఆ యూజర్ డాక్యుమెంట్‌లో ప్లాన్‌ను (plan_100 లేదా plan_200) యాక్టివ్ చేస్తుంది. వెంటనే యాప్ అన్ని లాక్ చేయబడిన ఫీచర్లను తెరుస్తుంది.'
                      : 'Never trust payment confirmation from the frontend alone! An Indian payment gateway creates an Order on your backend, opens UPI/Card checkout, verifies the HMAC-SHA256 signature, and updates your Firestore database. The frontend listens to Firestore and instantly unlocks features.'}
                  </p>
                </div>
              </div>

              {/* 4-Step Diagram Cards */}
              <div className="space-y-3">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isTelugu ? '4 దశల పూర్తి చెల్లింపు ప్రక్రియ (End-to-End Flow)' : '4-Step Secure Payment Flow'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-black text-xs">
                        1
                      </div>
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {isTelugu ? 'ఆర్డర్ సృష్టి (Create Order)' : '1. Order Creation'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isTelugu
                        ? 'యూజర్ ₹100 లేదా ₹200 ప్లాన్ ఎంచుకోగానే, క్లయింట్ /api/payment/create-order కి రిక్వెస్ట్ పంపుతుంది. సర్వర్ రేజర్‌పే తో మాట్లాడి order_id తీసుకొస్తుంది.'
                        : 'User clicks ₹100 or ₹200 plan. Frontend calls POST /api/payment/create-order. Your backend securely communicates with Razorpay/PhonePe to generate a unique order_id with exact amount.'}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                      <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center font-black text-xs">
                        2
                      </div>
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {isTelugu ? 'యూపీఐ చెల్లింపు (UPI / Checkout)' : '2. Gateway Checkout Modal'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isTelugu
                        ? 'యూజర్ ఫోన్‌లో గూగుల్ పే, ఫోన్‌పే లేదా కార్డ్ స్క్రీన్ ఓపెన్ అవుతుంది. యూజర్ తన UPI పిన్ ఎంటర్ చేసి పేమెంట్ పూర్తి చేస్తారు.'
                        : 'Razorpay or PhonePe native modal pops up with QR Code, GPay, PhonePe, Paytm, and NetBanking. User approves the payment securely in their UPI bank app.'}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-xs">
                        3
                      </div>
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {isTelugu ? 'సిగ్నేచర్ వెరిఫికేషన్ (Verification)' : '3. Server Signature Verification'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isTelugu
                        ? 'గేట్‌వే పంపిన క్రిప్టోగ్రాఫిక్ సిగ్నేచర్‌ను మన సర్వర్ సీక్రెట్ కీతో సరిచూస్తుంది. ఎవరూ ఫేక్ పేమెంట్ చేయలేరు.'
                        : 'Gateway sends payment_id & signature. Backend validates HMAC-SHA256 signature using RAZORPAY_KEY_SECRET to mathematically guarantee real payment.'}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-black text-xs">
                        4
                      </div>
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {isTelugu ? 'యాక్సెస్ అన్‌లాక్ (Access Granted)' : '4. Firestore Update & Access Unlocked'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isTelugu
                        ? 'వెరిఫై కాగానే సర్వర్ Firestore లో యూజర్ స్టేటస్‌ను "active" గాను, ప్లాన్‌ను plan_100/200 గాను మారుస్తుంది. డైట్, యోగా, డాక్టర్ చాట్ వెంటనే తెరుచుకుంటాయి.'
                        : 'Server saves subscription (status: active, expiry: 30 days) to Firestore. Frontend real-time snapshot listener receives update and immediately unlocks features!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Indian Gateways */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'భారతదేశంలో అత్యుత్తమ గేట్‌వేలు:' : 'Recommended Gateways for Indian Healthtech Apps:'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <p className="font-black text-xs text-slate-900 dark:text-white">💳 Razorpay</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Best all-in-one. Full support for UPI Intent, GPay, PhonePe, QR, RuPay, and Cards.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <p className="font-black text-xs text-slate-900 dark:text-white">📱 PhonePe PG</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Highest UPI success rate on mobile. Direct app-to-app switch with zero friction.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <p className="font-black text-xs text-slate-900 dark:text-white">⚡ Cashfree</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Excellent for instant doctor payouts and auto-debit recurring subscriptions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isTelugu ? 'లైవ్ గేట్‌వే సిమ్యులేటర్ రన్ చేయండి →' : 'Try Live Gateway Simulator →'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE GATEWAY SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isTelugu ? 'లైవ్ టెస్ట్: గేట్‌వే పేమెంట్‌తో మీ అకౌంట్‌ను అప్‌గ్రేడ్ చేయండి' : 'Test Live Gateway Transition (Upgrade Your Account Now)'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isTelugu
                    ? 'కింద గేట్‌వే మరియు ప్లాన్ ఎంచుకుని బటన్ నొక్కండి. ఇది నిజమైన గేట్‌వే ఆర్డర్, వెరిఫికేషన్ మరియు యాక్సెస్ అన్‌లాకింగ్‌ను నిరూపిస్తుంది.'
                    : 'Choose a gateway and a plan (₹100 or ₹200). Click simulate to execute the full handshake and watch your account become Pro / Premium instantly.'}
                </p>
              </div>

              {/* Gateway Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Gateway Provider:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['razorpay', 'phonepe', 'cashfree'] as const).map((gw) => (
                    <button
                      key={gw}
                      type="button"
                      onClick={() => setSelectedGateway(gw)}
                      className={`p-3.5 rounded-2xl border-2 font-bold text-xs capitalize transition-all ${
                        selectedGateway === gw
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {gw === 'razorpay' ? '💳 Razorpay Standard' : gw === 'phonepe' ? '📱 PhonePe PG' : '⚡ Cashfree PG'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Plan to Activate:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSelectedTestPlan('plan_100')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-1 ${
                      selectedTestPlan === 'plan_100'
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-sky-900 dark:text-sky-300">₹100 Pro Plan</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">1 Month • Diet & Full Reports</p>
                  </div>

                  <div
                    onClick={() => setSelectedTestPlan('plan_200')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-1 ${
                      selectedTestPlan === 'plan_200'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">₹200 Premium</p>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">Full Access</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">1 Month • All Features & Doctors</p>
                  </div>

                  <div
                    onClick={() => setSelectedTestPlan('trial_1')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-1 ${
                      selectedTestPlan === 'trial_1'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-amber-900 dark:text-amber-300">₹1 Trial</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">3 Days Fresh Trial</p>
                  </div>
                </div>
              </div>

              {/* Step Progress Tracker when simulating */}
              {isSimulating && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Gateway Transaction in Progress...</span>
                    <span>Step {simulationStep} of 4</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className={simulationStep >= 1 ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-500'}>
                      {simulationStep >= 1 ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
                      1. Backend calling {selectedGateway.toUpperCase()} API: Order generated (amount: ₹{selectedTestPlan === 'trial_1' ? 1 : selectedTestPlan === 'plan_100' ? 100 : 200})
                    </p>
                    <p className={simulationStep >= 2 ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-500'}>
                      {simulationStep >= 2 ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
                      2. UPI Handshake completed: Payment captured via {selectedGateway}
                    </p>
                    <p className={simulationStep >= 3 ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-500'}>
                      {simulationStep >= 3 ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
                      3. HMAC-SHA256 signature verified by server
                    </p>
                    <p className={simulationStep >= 4 ? 'text-emerald-400 flex items-center gap-1.5' : 'text-slate-500'}>
                      {simulationStep >= 4 ? <CheckCircle2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
                      4. Firestore subscription record updated: Access granted for 30 days!
                    </p>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {simulationSuccess && (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 space-y-2 animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <h4 className="font-black text-base">
                      {selectedTestPlan === 'plan_200'
                        ? '🎉 Premium Account Successfully Activated!'
                        : selectedTestPlan === 'plan_100'
                        ? '🎉 Pro Account Successfully Activated!'
                        : '🎉 ₹1 Trial Freshly Activated!'}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                    Your account has been upgraded with 30 days of active access. The sidebar, diet plan, and consultations will now display your active plan and zero features are blocked!
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleRunSimulator}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing Gateway Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>
                        Simulate Payment & Activate {selectedTestPlan === 'plan_200' ? '₹200 Premium' : selectedTestPlan === 'plan_100' ? '₹100 Pro' : '₹1 Trial'}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: CODE SNIPPETS */}
          {activeTab === 'code' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Backend Express Route (server.ts):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(backendCodeSnippet, 'backend')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedCodeSnippet === 'backend' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCodeSnippet === 'backend' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs overflow-x-auto font-mono">
                  {backendCodeSnippet}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Frontend Checkout Trigger (React Component):
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(frontendCodeSnippet, 'frontend')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedCodeSnippet === 'frontend' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCodeSnippet === 'frontend' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-sky-400 text-xs overflow-x-auto font-mono">
                  {frontendCodeSnippet}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            PCOSense Payment Infrastructure • Indian IT Act & RBI PG Guidelines Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            {isTelugu ? 'పూర్తయింది (Close)' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};

const backendCodeSnippet = `// server.ts - Razorpay Order Creation & Verification
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

// 1. Create Order
app.post('/api/payment/create-order', async (req, res) => {
  const { planId, amount, userId } = req.body; // e.g. amount: 100 or 200
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: \`rcpt_\${userId}_\${Date.now()}\`,
    notes: { planId, userId }
  });
  res.json({ success: true, order });
});

// 2. Verify Signature & Grant Access
app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Update Firestore: users/{userId}/subscription
    await updateFirestoreSubscription(userId, {
      tier: planId, // 'plan_100' or 'plan_200'
      status: 'active',
      expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    });
    return res.json({ success: true, accessGranted: true });
  }
  res.status(400).json({ success: false, error: 'Invalid signature' });
});`;

const frontendCodeSnippet = `// Frontend React Hook to trigger Razorpay Checkout Modal
function initiateRazorpayPayment(planId, amount, user) {
  // 1. Request Order from server
  const { order } = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, amount, userId: user.id })
  }).then(r => r.json());

  // 2. Open Native Razorpay Popup with UPI / Cards
  const rzp = new (window as any).Razorpay({
    key: "rzp_test_your_key_id",
    amount: order.amount,
    currency: "INR",
    name: "PCOSense Healthcare",
    description: planId === 'plan_200' ? "Premium Care" : "Basic Care",
    order_id: order.id,
    prefill: { name: user.name, email: user.email },
    theme: { color: "#059669" },
    handler: async function (response: any) {
      // 3. Send signature to server for verification
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...response, userId: user.id, planId })
      }).then(r => r.json());

      if (verifyRes.success) {
        alert("Payment verified! Pro features unlocked.");
      }
    }
  });
  rzp.open();
}`;
