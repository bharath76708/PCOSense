import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  Calendar,
  Building,
  CreditCard,
  Heart,
  Video,
  FileText,
  MessageCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../translations';

export interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'trial_1' | 'plan_100' | 'plan_200';
  amount: number;
  transactionRef: string;
  depositedAccount?: string;
  expiryDate?: string;
  userName?: string;
  onGoToDashboard?: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  plan,
  amount,
  transactionRef,
  depositedAccount = 'HDFC Bank (Admin Master Treasury)',
  expiryDate,
  userName = 'Valued Patient',
  onGoToDashboard
}) => {
  const navigate = useNavigate();
  const { isTelugu } = useLanguage();

  if (!isOpen) return null;

  const handleDashboardClick = () => {
    onClose();
    if (onGoToDashboard) {
      onGoToDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  // Tier metadata and specific benefits list
  const tierConfig = {
    trial_1: {
      name: isTelugu ? '₹1 ట్రయల్ ప్లాన్ (3 రోజులు)' : '₹1 Trial Access Plan (3 Days)',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40',
      duration: isTelugu ? '3 రోజుల పూర్తి యాక్సెస్' : '3 Days Full Access',
      benefits: [
        {
          title: isTelugu ? 'పూర్తి లక్షణాల స్క్రీనింగ్' : 'Full Clinical Symptom Screening',
          desc: isTelugu ? 'రోటర్‌డ్యామ్ ప్రమాణాల ప్రకారం PCOS సంభావ్యత అంచనా' : 'Rotterdam Consensus phenotype & machine learning risk estimation'
        },
        {
          title: isTelugu ? 'వ్యక్తిగత విశ్లేషణ నివేదిక' : 'Instant Explainable Risk Breakdown',
          desc: isTelugu ? 'మీ శరీరానికి సంబంధించిన ముఖ్య ఆరోగ్య సూచికల విశ్లేషణ' : 'Key biomarker drivers and personalized health factor insights'
        },
        {
          title: isTelugu ? 'ప్రాథమిక ఆహార మార్గదర్శకాలు' : 'Introductory Nutrition & Habit Advice',
          desc: isTelugu ? 'హార్మోన్ల సమతుల్యత కోసం సులభమైన జీవనశైలి చిట్కాలు' : 'Endocrine-friendly dietary recommendations for metabolic health'
        },
        {
          title: isTelugu ? '3 రోజుల సమయ పరిమితి' : '3-Day Trial Window Notice',
          desc: isTelugu ? '3 రోజుల తర్వాత యాక్సెస్ స్వయంచాలకంగా నిలిపివేయబడుతుంది' : 'Access will automatically lock after 72 hours until renewed'
        }
      ]
    },
    plan_100: {
      name: isTelugu ? '₹100 లిమిటెడ్ ఇన్‌సైట్ ప్లాన్ (1 నెల)' : '₹100 Limited Insight Plan (1 Month)',
      badgeColor: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-400/40',
      duration: isTelugu ? '1 నెల (30 రోజులు)' : '1 Month (30 Days Active Access)',
      benefits: [
        {
          title: isTelugu ? 'పరిమితి లేని లక్షణాల స్క్రీనింగ్' : 'Unlimited Risk Screening & Re-tests',
          desc: isTelugu ? 'నెల మొత్తం మీ లక్షణాలను ఎప్పుడైనా మళ్లీ పరీక్షించుకోవచ్చు' : 'Track clinical trajectory across menstrual cycles with unlimited re-screens'
        },
        {
          title: isTelugu ? '7 రోజుల భారతీయ ఆహార ప్రణాళిక' : 'Personalized 7-Day Indian Diet Plan',
          desc: isTelugu ? 'ఇన్సులిన్ సెన్సిటివిటీని పెంచే రుచికరమైన లో-GI వంటకాలు' : 'Tailored South & North Indian Low-GI meal schedules & craving control'
        },
        {
          title: isTelugu ? 'నెలవారీ చక్ర & పోషకాహార ట్రాకర్' : 'Cycle Tracking & Nutrition Journal',
          desc: isTelugu ? 'పీరియడ్స్ క్రమం మరియు పోషకాహార సమతుల్యత నమోదు' : 'Monitor cycle irregularity, macronutrients, and symptom triggers'
        },
        {
          title: isTelugu ? 'ప్రింటబుల్ క్లినికల్ సారాంశం' : 'Downloadable Clinical Summary',
          desc: isTelugu ? 'మీ గైనకాలజిస్ట్‌కు చూపించడానికి వైద్య సారాంశ పత్రం' : 'Medical literacy PDF summary formatted for doctor consultations'
        }
      ]
    },
    plan_200: {
      name: isTelugu ? '₹200 ఫుల్ యాక్సెస్ ప్రీమియం ప్లాన్ (1 నెల)' : '₹200 Complete Full Access Plan (1 Month)',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/40',
      duration: isTelugu ? '1 నెల (30 రోజులు - పూర్తి అపరిమితం)' : '1 Month (30 Days - All Features Unlocked)',
      benefits: [
        {
          title: isTelugu ? 'కంప్లీట్ క్లినికల్ స్క్రీనింగ్ & డైట్' : 'Everything in Limited Plan + Diet',
          desc: isTelugu ? 'అన్ని స్క్రీనింగ్ టూల్స్ మరియు పూర్తి 7-రోజుల భోజన ప్రణాళిక' : 'Complete explainable ML risk analysis and South Indian PCOS diet plan'
        },
        {
          title: isTelugu ? 'యోగా & వ్యాయామ వీడియో లైబ్రరీ' : 'Full In-App Yoga & Restorative Exercise Library',
          desc: isTelugu ? 'కార్టిసాల్ నియంత్రణకు ప్రత్యేకంగా రూపొందించిన వీడియో ఆసనాలు' : 'Curated hormone-balancing, cortisol-reducing guided video sessions'
        },
        {
          title: isTelugu ? 'స్పెషలిస్ట్ డాక్టర్ టెలికన్సల్టేషన్' : 'Specialist Teleconsultation Booking',
          desc: isTelugu ? 'ధృవీకరించబడిన గైనకాలజిస్ట్‌లతో 1-ఆన్-1 వీడియో అపాయింట్‌మెంట్లు' : 'Connect with certified RMP female gynecologists under NMC guidelines'
        },
        {
          title: isTelugu ? 'డైరెక్ట్ డాక్టర్ చాట్ & డిజిటల్ ప్రిస్క్రిప్షన్' : 'Direct Doctor Chats & NMC Digital Prescriptions',
          desc: isTelugu ? 'డాక్టర్‌తో నేరుగా సందేశాలు మరియు చట్టబద్ధమైన డిజిటల్ మందుల చీటి' : 'Real-time messaging with your doctor & legally compliant e-prescriptions'
        }
      ]
    }
  };

  const currentTier = tierConfig[plan] || tierConfig.trial_1;

  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : plan === 'trial_1'
    ? '3 Days from Today'
    : '30 Days from Today';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      id="payment-success-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-success-title"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        id="payment-success-modal"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Close modal"
          id="payment-success-close-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header with Celebration Graphic */}
        <div className="pt-8 pb-6 px-6 sm:px-8 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent text-center border-b border-slate-100 dark:border-slate-800/80">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 ring-8 ring-emerald-500/10">
            <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border mb-2 border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'చెల్లింపు ధృవీకరించబడింది' : 'Payment Verified & Confirmed'}</span>
          </div>

          <h2 id="payment-success-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isTelugu ? 'మీ సబ్‌స్క్రిప్షన్ యాక్టివ్ చేయబడింది!' : 'Welcome to Your PCOS Care Plan!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
            {isTelugu
              ? `${userName} గారూ, మీ చెల్లింపు అడ్మిన్ అకౌంట్‌కు చేరింది. మీ ప్రయోజనాలు క్రింద ఇవ్వబడ్డాయి.`
              : `Thank you ${userName}. Your payment was routed to the Admin Treasury and your access plan is immediately active.`}
          </p>

          {/* Payment receipt strip */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Plan</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{currentTier.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount Paid</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{amount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Valid Until</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formattedExpiry}</span>
            </div>
          </div>
        </div>

        {/* Modal Body: Active Plan Benefits Breakdown */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'మీ ప్లాన్ ప్రయోజనాలు' : 'Your Unlocked Plan Benefits'}</span>
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentTier.badgeColor}`}>
                {currentTier.duration}
              </span>
            </div>

            <div className="space-y-2.5" id="payment-benefits-list">
              {currentTier.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3"
                >
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{benefit.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference transaction footer */}
          <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
            <span className="truncate">
              {isTelugu ? 'లావాదేవీ రెఫరెన్స్:' : 'Transaction Reference:'}{' '}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{transactionRef}</span>
            </span>
            <span className="shrink-0 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>Admin Verified</span>
            </span>
          </div>

          {/* Primary Action Button: 'Go to Dashboard' */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleDashboardClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer group"
              id="payment-success-go-dashboard-btn"
            >
              <span>{isTelugu ? 'డ్యాష్‌బోర్డ్‌కి వెళ్లండి' : 'Go to Dashboard'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors shrink-0"
              id="payment-success-dismiss-btn"
            >
              {isTelugu ? 'మూసివేయండి' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
