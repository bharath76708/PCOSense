import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  HeartPulse,
  Apple,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { useAccessibility } from '../context/AccessibilityContext';

interface HowItWorksTimelineProps {
  variant?: 'full' | 'compact' | 'dashboard';
  className?: string;
}

export const HowItWorksTimeline: React.FC<HowItWorksTimelineProps> = ({
  variant = 'full',
  className = ''
}) => {
  const { isTelugu } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { predictionResult } = useAssessment();
  const { isEasyRead } = useAccessibility();

  const hasCompletedAssessment = Boolean(predictionResult);

  const steps = [
    {
      stepNumber: 1,
      title: isEasyRead
        ? (isTelugu ? 'దశ 1: సులువైన ప్రశ్నలు' : 'Step 1: Simple Questions')
        : (isTelugu ? 'దశ 1: లక్షణాల నమోదు (Symptom Entry)' : 'Step 1: Symptom Entry'),
      subtitle: isTelugu ? '3 నిమిషాల సులభ సర్వే' : 'Quick 3-Minute Questionnaire',
      desc: isTelugu
        ? 'మీ పీరియడ్స్ సైకిల్, చర్మ మార్పులు మరియు రోజువారీ అలవాట్ల గురించి కొన్ని సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వండి. ఎలాంటి ల్యాబ్ రిపోర్టులు లేకుండానే ప్రారంభించవచ్చు.'
        : 'Answer simple, reassuring questions about your monthly cycle, skin changes, and daily habits. No complex lab tests or prior records needed to begin.',
      duration: isTelugu ? '~3 నిమిషాలు' : '~3 mins',
      tag: isTelugu ? 'ప్రారంభం' : 'Easy Start',
      icon: ClipboardCheck,
      color: 'teal',
      linkText: isTelugu ? 'ప్రశ్నాపత్రం ప్రారంభించండి' : 'Start Questionnaire',
      linkTo: isAuthenticated ? '/assessment' : '/register?redirect=/assessment',
      isCompleted: hasCompletedAssessment
    },
    {
      stepNumber: 2,
      title: isEasyRead
        ? (isTelugu ? 'దశ 2: మీ ఆరోగ్య అంచనా' : 'Step 2: Clear Risk Estimate')
        : (isTelugu ? 'దశ 2: రిస్క్ అంచనా (Risk Estimate)' : 'Step 2: Risk Estimate'),
      subtitle: isTelugu ? 'వెంటనే రంగుల చార్ట్' : 'Instant Reassuring Assessment',
      desc: isTelugu
        ? 'అంతర్జాతీయ రోటర్‌డ్యామ్ ప్రమాణాల ప్రకారం మీ సమాచారాన్ని విశ్లేషించి, తక్కువ, మధ్యస్థ లేదా అధిక రిస్క్ స్థాయిని స్పష్టమైన శాతంతో మీకు చూపిస్తుంది.'
        : 'Our clinically validated AI evaluates your responses against international Rotterdam criteria, delivering an instant, color-coded low, moderate, or high risk score.',
      duration: isTelugu ? 'క్షణాల్లో' : 'Instant',
      tag: isTelugu ? 'AI విశ్లేషణ' : 'Validated AI',
      icon: HeartPulse,
      color: 'amber',
      linkText: hasCompletedAssessment
        ? (isTelugu ? 'మీ రిపోర్ట్ చూడండి' : 'View Your Report')
        : (isTelugu ? 'నమూనా చూడండి' : 'See How It Works'),
      linkTo: hasCompletedAssessment ? '/results' : (isAuthenticated ? '/assessment' : '/register?redirect=/assessment'),
      isCompleted: hasCompletedAssessment
    },
    {
      stepNumber: 3,
      title: isEasyRead
        ? (isTelugu ? 'దశ 3: ఆహారం, యోగా & డాక్టర్' : 'Step 3: Food, Yoga & Care')
        : (isTelugu ? 'దశ 3: వెల్‌నెస్ ప్రణాళిక (Wellness Planning)' : 'Step 3: Wellness Planning'),
      subtitle: isTelugu ? 'డైట్, యోగా & వైద్యుల సాయం' : 'Personal Diet, Yoga & Doctor Care',
      desc: isTelugu
        ? 'సులభమైన భారతీయ వంటకాలతో 7 రోజుల డైట్ ప్లాన్, హార్మోన్ల సమతుల్యతకు తేలికపాటి యోగా వ్యాయామాలు మరియు అవసరమైతే అర్హులైన స్త్రీల వైద్యులను సంప్రదించండి.'
        : 'Access personalized 7-day Indian meal plans, gentle restorative yoga videos, daily hydration tracking, and connect directly with verified specialists.',
      duration: isTelugu ? 'నిరంతర సంరక్షణ' : 'Ongoing Care',
      tag: isTelugu ? 'సంపూర్ణ ఆరోగ్యం' : 'Whole-Body Wellness',
      icon: Apple,
      color: 'emerald',
      linkText: isTelugu ? 'డైట్ & వెల్‌నెస్ ప్రారంభించండి' : 'Explore Wellness Plan',
      linkTo: '/diet-plan',
      isCompleted: false
    }
  ];

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all ${className}`}
      id="how-it-works-timeline"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'సరళమైన ప్రయాణం • 3 ప్రధాన దశలు' : 'How PCOSense Works • 3 Clear Milestones'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
            {isTelugu
              ? 'లక్షణాల నమోదు నుండి సంపూర్ణ ఆరోగ్యం వరకు'
              : 'From Symptom Entry to Clear Risk & Wellness Planning'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isTelugu
              ? 'PCOSense మీ ప్రయాణాన్ని అత్యంత సులభంగా మరియు ఒత్తిడి లేకుండా ఎలా నడిపిస్తుందో చూడండి:'
              : 'Our simple 3-stage pathway guides you through early detection, clear risk clarity, and daily healing.'}
          </p>
        </div>

        {variant === 'dashboard' && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {hasCompletedAssessment 
                ? (isTelugu ? 'దశ 1 పూర్తయింది' : 'Step 1 Complete') 
                : (isTelugu ? 'దశ 1 ఇంకా పూర్తి కాలేదు' : 'Ready for Step 1')}
            </span>
          </div>
        )}
      </div>

      {/* Visual Timeline Grid */}
      <div className="mt-8 relative">
        {/* Desktop Connector Line Behind Cards */}
        <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-1 -translate-y-8 bg-gradient-to-r from-teal-200 via-amber-200 to-emerald-200 dark:from-teal-900 dark:via-amber-900 dark:to-emerald-900 z-0 rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                id={`timeline-step-${step.stepNumber}`}
              >
                <div>
                  {/* Top Bar with Number & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center shadow-xs">
                        {step.stepNumber}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {step.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{step.duration}</span>
                    </div>
                  </div>

                  {/* Icon Circle */}
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Plain Language Description */}
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Action / Status */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  {step.isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isTelugu ? 'పూర్తయింది' : 'Completed'}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {step.stepNumber === 1
                        ? (isTelugu ? 'మొదటి అడుగు' : 'First Step')
                        : (isTelugu ? 'తదుపరి దశ' : 'Next Step')}
                    </span>
                  )}

                  <Link
                    to={step.linkTo}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 group-hover:translate-x-0.5 transition-transform"
                    id={`timeline-step-${step.stepNumber}-cta`}
                  >
                    <span>{step.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empathetic Bottom Reassurance */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isTelugu
              ? 'PCOSense అనేది అవగాహన మరియు స్క్రీనింగ్ సాధనం. తుది వైద్య నిర్ధారణ కోసం అర్హులైన వైద్యులను సంప్రదించండి.'
              : 'PCOSense provides evidence-backed risk estimation and wellness tools. Always consult a qualified physician for clinical diagnosis.'}
          </span>
        </div>

        <Link
          to={isAuthenticated ? '/assessment' : '/register?redirect=/assessment'}
          className="font-bold text-teal-700 dark:text-teal-400 hover:underline shrink-0"
        >
          {isTelugu ? 'ఇప్పుడే ప్రారంభించండి →' : 'Begin Step 1 Now →'}
        </Link>
      </div>
    </div>
  );
};
