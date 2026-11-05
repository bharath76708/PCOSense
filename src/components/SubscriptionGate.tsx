import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { canUserAccessFeature, getUserSubscription, UserSubscription } from '../services/subscriptionService';
import { SubscriptionPlans } from './SubscriptionPlans';

interface SubscriptionGateProps {
  feature: 'analysis' | 'diet' | 'info' | 'yoga' | 'yoga_exercises' | 'doctor' | 'doctor_consultations' | 'chat' | 'export';
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  feature,
  children,
  fallbackTitle,
  fallbackDescription
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const userId = user?.id || 'usr_patient_sample';
  const role = user?.role;

  // Doctors and Admins are always exempt from patient paywalls
  if (role === 'doctor' || role === 'admin') {
    return <>{children}</>;
  }

  const [sub, setSub] = useState<UserSubscription>(() => getUserSubscription(userId));

  useEffect(() => {
    setSub(getUserSubscription(userId));
  }, [userId]);

  const access = canUserAccessFeature(userId, feature);

  if (access.allowed) {
    return <>{children}</>;
  }

  // Access is blocked or limited
  const isTrialBlocked = sub.status === 'blocked' || sub.isBlocked;
  const isPlan100Restricted = sub.tier === 'plan_100' && (feature === 'yoga' || feature === 'yoga_exercises' || feature === 'doctor' || feature === 'doctor_consultations' || feature === 'chat');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6" id="subscription-gate-root">
      {/* Alert Barrier Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-400/20">
              <ShieldCheck className="h-3 w-3" />
              <span>
                {isTrialBlocked
                  ? isTelugu ? 'ట్రయల్ గడువు ముగిసింది - యాక్సెస్ నిరోధించబడింది' : '3-Day Trial Expired • Access Blocked'
                  : isTelugu ? 'ఈ ఫీచర్‌కు అప్‌గ్రేడ్ అవసరం' : 'Access Tier Restricted'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              {fallbackTitle || (
                isTrialBlocked
                  ? isTelugu ? 'మీ 3-రోజుల ఉచిత ట్రయల్ పూర్తయింది' : 'Your 3-Day Trial Period Has Ended'
                  : isTelugu ? 'ఈ ఫీచర్ ₹200 కంప్లీట్ ప్లాన్‌లో మాత్రమే అందుబాటులో ఉంది' : 'Requires the ₹200/Month Complete All-Access Plan'
              )}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {fallbackDescription || access.reason || (
            isTrialBlocked
              ? 'To continue accessing personalized PCOS risk analysis, structured diets, verified exercise videos, and specialist doctor appointments, select one of the subscription plans below.'
              : 'The ₹100/Month Basic Plan covers ML risk analysis, diet, and symptoms. Doctor telemedicine appointments, direct chat, and video workout libraries are included with the ₹200/Month Complete Plan.'
          )}
        </p>

        {isTrialBlocked && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              Your registration trial (₹1 for 3 days) has expired and is now automatically blocked as per platform policy.
            </span>
          </div>
        )}
      </div>

      {/* Subscription Plans Selection Card */}
      <SubscriptionPlans
        onPlanActivated={() => {
          setSub(getUserSubscription(userId));
        }}
        highlightPlan={access.requiredPlan === 'plan_200' ? 'plan_200' : 'plan_100'}
      />
    </div>
  );
};
