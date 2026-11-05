import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Heart,
  Flame,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  Calendar,
  Smile,
  ShieldCheck,
  Lock,
  Zap,
  CreditCard
} from 'lucide-react';
import { YogaVideoItem } from '../types';
import { getActiveYogaVideos, fetchYogaVideosFromFirestore } from '../services/yogaService';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';
import { canUserAccessFeature, getUserSubscription } from '../services/subscriptionService';
import { SubscriptionPaymentModal } from '../components/SubscriptionPaymentModal';
import { YogaNutritionMediaLibrary } from '../components/YogaNutritionMediaLibrary';
import { SubscriptionPlans } from '../components/SubscriptionPlans';

export const YogaExercisePage: React.FC = () => {
  const { isTelugu } = useLanguage();
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const userSubKey = user?.email || user?.id || 'usr_patient_sample';
  const [userSub, setUserSub] = useState(() => getUserSubscription(userSubKey));
  const access = canUserAccessFeature(userSubKey, 'yoga_exercises');

  const refreshSub = () => {
    setUserSub(getUserSubscription(user?.email || user?.id || 'usr_patient_sample'));
  };

  useEffect(() => {
    refreshSub();
  }, [user?.email, user?.id]);

  useEffect(() => {
    const handleSubUpdated = () => {
      refreshSub();
    };
    window.addEventListener('subscription-updated', handleSubUpdated);
    return () => window.removeEventListener('subscription-updated', handleSubUpdated);
  }, [user?.email, user?.id]);

  const [videos, setVideos] = useState<YogaVideoItem[]>(() => getActiveYogaVideos());

  useEffect(() => {
    let isMounted = true;
    fetchYogaVideosFromFirestore().then(fetched => {
      if (isMounted && fetched && fetched.length > 0) {
        setVideos(fetched.filter(v => v.isActive));
      }
    }).catch(err => {
      console.warn('Could not fetch yoga videos from Firestore:', err);
    });

    const handleVideosUpdated = () => {
      setVideos(getActiveYogaVideos());
    };

    window.addEventListener('pcosense_yoga_videos_updated', handleVideosUpdated);
    window.addEventListener('storage', handleVideosUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('pcosense_yoga_videos_updated', handleVideosUpdated);
      window.removeEventListener('storage', handleVideosUpdated);
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVideo, setSelectedVideo] = useState<YogaVideoItem | null>(() => videos[0] || null);
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pcosense_completed_workouts');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const categories = [
    'All',
    'Yoga',
    'Beginner Yoga',
    'Stretching',
    'Breathing Exercises',
    'Low Impact Exercise',
    'Walking',
    'PCOS-friendly Movement'
  ];

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') return videos;
    return videos.filter(v => v.category === selectedCategory);
  }, [videos, selectedCategory]);

  const toggleCompleted = (id: string) => {
    const safeList = Array.isArray(completedVideos) ? completedVideos : [];
    const updated = safeList.includes(id)
      ? safeList.filter(item => item !== id)
      : [...safeList, id];
    setCompletedVideos(updated);
    try {
      localStorage.setItem('pcosense_completed_workouts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="yoga-exercise-page-root">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-teal-700/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'క్లినికల్ PCOS వ్యాయామం & యోగా' : 'Clinical Cortisol-Lowering Movement Protocol'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {isTelugu ? 'PCOS ఫ్రెండ్లీ యోగా & లో-ఇంపాక్ట్ వ్యాయామాలు' : 'PCOS Gentle Yoga & Restorative Exercise'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-2xl">
            {isTelugu
              ? 'తీవ్రమైన అధిక-కార్టిసాల్ వ్యాయామాలకు బదులుగా, పెల్విక్ రక్త ప్రసరణను పెంచే మరియు ఇన్సులిన్ నిరోధకతను తగ్గించే ప్రశాంతమైన ఆసనాలు మరియు నడకను ఆచరించండి.'
              : 'Curated clinical movement routines designed to avoid endocrine-exhausting cortisol spikes while stimulating muscle GLUT-4 glucose transporters and pelvic ovarian circulation.'}
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              {isTelugu ? 'జీరో జంపింగ్ & లో-కార్టిసాల్' : 'Zero High-Cortisol Exhaustion'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              {completedVideos.length} {isTelugu ? 'సెషన్లు పూర్తయ్యాయి' : 'Sessions Completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Access Gate Banner if Restricted */}
      {!access.allowed ? (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-amber-500/80 bg-amber-500/10 p-6 sm:p-8 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                      {userSub?.isBlocked ? '3-Day Trial Expired (Access Blocked)' : 'Complete Access Subscription Required'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs uppercase">
                      {userSub?.tier === 'plan_100' ? '₹100 Plan Active' : 'Premium Feature'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {userSub?.isBlocked
                      ? 'Your ₹1 3-day full access trial has ended. To continue viewing clinical yoga videos and practicing guided restorative exercises, please upgrade to the ₹200/Month Complete Plan.'
                      : userSub?.tier === 'plan_100'
                      ? 'Your ₹100/Month plan covers PCOS ML Risk Analysis, 7-Day Diet Plans & Clinical Info. Full Yoga Workouts and Direct Specialist Consultations require the ₹200/Month Complete Plan.'
                      : 'PCOSense requires an active plan for guided video streaming. All subscription funds deposit directly to the Admin Bank Account.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SubscriptionPlans
            onPlanActivated={() => refreshSub()}
            highlightPlan="plan_200"
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Integrated Clinical Yoga & Movement Media Library */}
          <YogaNutritionMediaLibrary defaultType="yoga" allowAdd={true} />

          {/* Quick Clinical Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Cortisol Rhythm</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Excessive high-intensity cardio spikes stress cortisol, triggering adrenal DHEA-S production and worsening acne. Gentle movement stabilizes hormones.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Pelvic Circulation</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Asanas like Supta Baddha Konasana (Reclined Butterfly) open the hips, alleviating pelvic congestion and nourishing dormant follicles.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-500" />
                <span>GLUT-4 Translocation</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Light isometric muscle contraction draws glucose into muscle tissue independent of insulin, directly relieving metabolic resistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal fallback */}
      <SubscriptionPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        userEmail={user?.email}
        userName={user?.full_name}
        userId={user?.id || 'usr_patient_sample'}
        onSuccess={() => refreshSub()}
        initialSelectedPlan={userSub?.isBlocked ? 'plan_200' : 'plan_200'}
      />
    </div>
  );
};
