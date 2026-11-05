import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Apple,
  Video,
  Stethoscope,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Heart,
  HelpCircle,
  Smile,
  Activity,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../translations';

export interface SubscriptionTiersComparisonProps {
  mode?: 'landing' | 'register';
  selectedPlan?: 'trial_1' | 'plan_100' | 'plan_200';
  onSelectPlan?: (plan: 'trial_1' | 'plan_100' | 'plan_200') => void;
  onOpenPaymentModal?: (plan: 'trial_1' | 'plan_100' | 'plan_200') => void;
  className?: string;
}

export const SubscriptionTiersComparison: React.FC<SubscriptionTiersComparisonProps> = ({
  mode = 'landing',
  selectedPlan = 'trial_1',
  onSelectPlan,
  onOpenPaymentModal,
  className = ''
}) => {
  const { isTelugu } = useLanguage();

  const plans = [
    {
      id: 'trial_1' as const,
      nameEn: 'Trial',
      nameTe: 'ట్రయల్ ప్లాన్',
      price: '₹1',
      durationEn: '3 Full Days',
      durationTe: '3 పూర్తి రోజులు',
      tagEn: 'Start Here',
      tagTe: 'ఇక్కడి నుంచే మొదలు',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400',
      valuePropEn: 'Test all features for 72 hours with just 1 Rupee.',
      valuePropTe: 'కేవలం ₹1 తో 3 రోజుల పాటు అన్ని సేవలను స్వయంగా పరీక్షించండి.',
      idealForEn: 'First-time visitors wanting quick risk insight',
      idealForTe: 'తొలిసారి వచ్చిన వారికి & రిస్క్ తెలుసుకోవడానికి',
      features: [
        { labelEn: 'Complete PCOS Risk Screening', labelTe: 'పూర్తి PCOS రిస్క్ స్క్రీనింగ్', icon: Activity, included: true },
        { labelEn: '7-Day Starter Meal & Nutrition Guide', labelTe: '7 రోజుల ఆహార పట్టిక & న్యూట్రిషన్ గైడ్', icon: Apple, included: true },
        { labelEn: 'Introductory Yoga & Breathing Videos', labelTe: 'ప్రారంభ యోగా & ప్రాణాయామ వీడియోలు', icon: Video, included: true },
        { labelEn: 'Doctor Appointment Booking Permission', labelTe: 'డాక్టర్ అపాయింట్‌మెంట్ బుక్ చేసుకునే అవకాశం', icon: Stethoscope, included: true },
        { labelEn: 'Unlimited Doctor Video Consultations', labelTe: 'అపరిమిత డాక్టర్ వీడియో కాల్స్', icon: Video, included: false },
        { labelEn: 'Ongoing 30-Day Symptom Tracking', labelTe: '30 రోజుల పాటు రోజువారీ సింప్టమ్ ట్రాకింగ్', icon: Calendar, included: false },
      ],
      ctaTextEn: 'Start Trial for ₹1',
      ctaTextTe: '₹1 తో ట్రయల్ ప్రారంభించండి',
      noteEn: 'Blocks automatically after 3 days if not renewed.',
      noteTe: '3 రోజుల తర్వాత ఈ ట్రయల్ దానంతట అదే ఆగుతుంది.'
    },
    {
      id: 'plan_100' as const,
      nameEn: 'Limited Insight',
      nameTe: 'లిమిటెడ్ ఇన్‌సైట్',
      price: '₹100',
      durationEn: '1 Month (30 Days)',
      durationTe: '1 నెల (30 రోజులు)',
      tagEn: 'Self-Care Focus',
      tagTe: 'డైట్ & రిస్క్ సమాచారం',
      icon: BookOpen,
      iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-700',
      badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
      cardBorder: 'border-slate-200 dark:border-slate-800 hover:border-teal-400',
      valuePropEn: 'Affordable monthly nutrition plans and detailed health screening reports.',
      valuePropTe: 'తక్కువ ఖర్చుతో నెల రోజుల ఆహార పట్టిక మరియు పూర్తి రిస్క్ రిపోర్టులు.',
      idealForEn: 'Those managing PCOS primarily through diet and home lifestyle',
      idealForTe: 'ఇంట్లోనే సరైన ఆహారంతో పీసీఓఎస్ తగ్గించుకోవాలనుకునే వారికి',
      features: [
        { labelEn: 'Complete PCOS Risk Screening', labelTe: 'పూర్తి PCOS రిస్క్ స్క్రీనింగ్', icon: Activity, included: true },
        { labelEn: 'Full 30-Day Anti-Inflammatory Meal Plans', labelTe: 'నెల రోజుల పోషకాహార & వంటకాల గైడ్', icon: Apple, included: true },
        { labelEn: 'Personalized Food Do\'s and Don\'ts', labelTe: 'తినవలసిన మరియు మానవలసిన ఆహారాల జాబితా', icon: Apple, included: true },
        { labelEn: 'Printable Health Dossier & Lab Checklists', labelTe: 'డౌన్‌లోడ్ చేసుకోగల హెల్త్ రిపోర్టులు', icon: BookOpen, included: true },
        { labelEn: 'Full Guided Yoga & Exercise Video Library', labelTe: 'పూర్తి యోగా & వ్యాయామ వీడియోలు', icon: Video, included: false },
        { labelEn: 'Live Doctor Teleconsultation Video Calls', labelTe: 'లైవ్ డాక్టర్ వీడియో సంభాషణ', icon: Stethoscope, included: false },
      ],
      ctaTextEn: 'Choose Limited Insight (₹100)',
      ctaTextTe: 'లిమిటెడ్ ఇన్‌సైట్ ఎంచుకోండి (₹100)',
      noteEn: 'Does not include doctor consults or guided video workouts.',
      noteTe: 'దీనిలో డాక్టర్ వీడియో కాల్స్ మరియు యోగా వీడియోలు ఉండవు.'
    },
    {
      id: 'plan_200' as const,
      nameEn: 'Full Access',
      nameTe: 'ఫుల్ యాక్సెస్',
      price: '₹200',
      durationEn: '1 Month (30 Days)',
      durationTe: '1 నెల (30 రోజులు)',
      tagEn: 'Best Value ★ Most Popular',
      tagTe: 'అత్యుత్తమ ఎంపిక ★ పూర్తి రక్షణ',
      icon: Crown,
      iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black shadow-xs',
      cardBorder: 'border-emerald-500 ring-2 ring-emerald-500/30 dark:border-emerald-400 shadow-xl',
      isPopular: true,
      valuePropEn: 'Complete 360° medical & wellness care with doctor video visits & yoga classes.',
      valuePropTe: 'వైద్యుల సంభాషణలు, వ్యాయామ వీడియోలు మరియు సంపూర్ణ సంరక్షణ.',
      idealForEn: 'Women seeking total healing with active medical supervision',
      idealForTe: 'డాక్టర్ సలహాలు, వ్యాయామం మరియు సమగ్ర సంరక్షణ కోరుకునే వారికి',
      features: [
        { labelEn: 'Complete PCOS Risk Screening', labelTe: 'పూర్తి PCOS రిస్క్ స్క్రీనింగ్', icon: Activity, included: true },
        { labelEn: 'Full 30-Day Anti-Inflammatory Meal Plans', labelTe: 'నెల రోజుల పోషకాహార & వంటకాల గైడ్', icon: Apple, included: true },
        { labelEn: 'Full Guided Yoga & Exercise Video Library', labelTe: 'అన్ని రకాల యోగా & లైట్ వర్కౌట్ వీడియోలు', icon: Video, included: true },
        { labelEn: 'Live Video Visits with Specialist Doctors', labelTe: 'లేడీ డాక్టర్లతో ప్రత్యక్ష వీడియో సంభాషణ', icon: Stethoscope, included: true },
        { labelEn: 'Direct Patient-Doctor Messaging & Q&A', labelTe: 'డాక్టర్‌తో నేరుగా సందేహాలు అడిగే చాట్', icon: Heart, included: true },
        { labelEn: 'Digital NMC E-Prescription Delivery', labelTe: 'డిజిటల్ మెడికల్ ప్రిస్క్రిప్షన్ అందజేత', icon: ShieldCheck, included: true },
      ],
      ctaTextEn: 'Get Full Access (₹200)',
      ctaTextTe: 'ఫుల్ యాక్సెస్ పొందండి (₹200)',
      noteEn: 'Everything included: food, video workouts, and doctor care.',
      noteTe: 'అన్నీ అందుబాటులో ఉంటాయి: డైట్, వ్యాయామం మరియు వైద్యులు.'
    }
  ];

  const handlePlanClick = (planId: 'trial_1' | 'plan_100' | 'plan_200') => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
    if (onOpenPaymentModal) {
      onOpenPaymentModal(planId);
    }
  };

  return (
    <div className={`space-y-8 ${className}`} id="subscription-tiers-section">
      
      {/* Header with simple, non-technical context */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isTelugu ? 'పారదర్శక ధరలు • దాచిన ఖర్చులు లేవు' : 'Simple, Transparent Pricing • Zero Hidden Fees'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {isTelugu ? (
            <>మీకు సరిపోయే <span className="text-emerald-600 dark:text-emerald-400">ప్లాన్‌ను</span> ఎంచుకోండి</>
          ) : (
            <>Choose Your <span className="text-emerald-600 dark:text-emerald-400">PCOS Care Plan</span></>
          )}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {isTelugu
            ? 'ప్రతి ఒక్కరికీ సులభంగా అందుబాటులో ఉండేలా ₹1 తో ప్రారంభించండి. తర్వాత మీకు అవసరమైన సహాయాన్ని బట్టి ప్లాన్‌ను కొనసాగించండి.'
            : 'Start with just ₹1 to experience how easy managing PCOS can be. Upgrade anytime with no long contracts or hidden charges.'}
        </p>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlan === p.id;

          return (
            <div
              key={p.id}
              onClick={() => mode === 'register' && onSelectPlan && onSelectPlan(p.id)}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative bg-white dark:bg-slate-900 shadow-md ${
                p.isPopular
                  ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-400'
                  : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${
                mode === 'register' ? 'cursor-pointer hover:shadow-lg' : ''
              } ${
                mode === 'register' && isSelected ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20 dark:bg-teal-950/20' : ''
              }`}
              id={`plan-card-${p.id}`}
            >
              {/* Most Popular Badge */}
              {p.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-black tracking-wide uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Crown className="h-3.5 w-3.5 text-slate-950" />
                  <span>{isTelugu ? p.tagTe : p.tagEn}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Plan Header */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {isTelugu ? p.nameTe : p.nameEn}
                      </span>
                      {!p.isPopular && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeBg}`}>
                          {isTelugu ? p.tagTe : p.tagEn}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-950 dark:text-white">
                        {p.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        / {isTelugu ? p.durationTe : p.durationEn}
                      </span>
                    </div>
                  </div>

                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-xs ${p.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Value Proposition */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {isTelugu ? p.valuePropTe : p.valuePropEn}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                    <Smile className="h-3 w-3" />
                    <span>{isTelugu ? p.idealForTe : p.idealForEn}</span>
                  </p>
                </div>

                {/* Simple Icon Feature Checklist */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    {isTelugu ? 'ఈ ప్లాన్‌లో ఏమున్నాయి:' : 'What You Get:'}
                  </span>

                  <ul className="space-y-2.5">
                    {p.features.map((feat, idx) => {
                      const FeatIcon = feat.icon;
                      return (
                        <li key={idx} className="flex items-start gap-2.5 text-xs">
                          {feat.included ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              feat.included
                                ? 'text-slate-800 dark:text-slate-200 font-medium'
                                : 'text-slate-400 dark:text-slate-500 line-through'
                            }
                          >
                            {isTelugu ? feat.labelTe : feat.labelEn}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Card Footer & Action CTA */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {mode === 'register' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectPlan) onSelectPlan(p.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-slate-950" />
                        <span>{isTelugu ? 'ఎంపిక చేయబడింది ✓' : 'Plan Selected ✓'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isTelugu ? p.ctaTextTe : p.ctaTextEn}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : onOpenPaymentModal ? (
                  <button
                    type="button"
                    onClick={() => handlePlanClick(p.id)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                      p.isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        : 'bg-teal-900 hover:bg-teal-800 text-white dark:bg-teal-700 dark:hover:bg-teal-600'
                    }`}
                  >
                    <span>{isTelugu ? p.ctaTextTe : p.ctaTextEn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    to={`/register?plan=${p.id}&redirect=/assessment`}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                      p.isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        : 'bg-teal-900 hover:bg-teal-800 text-white dark:bg-teal-700 dark:hover:bg-teal-600'
                    }`}
                  >
                    <span>{isTelugu ? p.ctaTextTe : p.ctaTextEn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  {isTelugu ? p.noteTe : p.noteEn}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
              {isTelugu ? 'భారతీయ బ్యాంకింగ్ & UPI ద్వారా నేరుగా డిపాజిట్' : 'Direct & Encrypted Deposit to Admin Account'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? 'ఫోన్‌పే, గూగుల్ పే, పేటీఎం సింపుల్ స్కానర్ లేదా నెట్ బ్యాంకింగ్ ద్వారా అదే మొత్తం చెల్లించి తక్షణమే యాక్టివేట్ చేసుకోండి.'
                : 'Simple UPI Scanner (PhonePe, GPay, Paytm) with exact amount pre-loaded or custom scanner.'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20 text-xs font-bold">
            <span>📱 Simple Scanner Ready</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span>{isTelugu ? 'ఎప్పుడైనా క్యాన్సల్ చేయవచ్చు' : 'Cancel Anytime'}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
