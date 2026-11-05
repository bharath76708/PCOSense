import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Flame,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Stethoscope,
  Activity,
  Award,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Share2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../translations';
import { getDailySymptomLogs } from '../services/dailySymptomService';
import { evaluateUserMilestones } from '../services/badgeService';
import { getStoredUserStreak } from './HealthGoalsManager';

export interface HealthChallenge {
  id: string;
  category: 'consistency' | 'education' | 'clinical' | 'lifestyle' | 'advocacy';
  categoryLabelEn: string;
  categoryLabelTe: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  icon: React.ComponentType<{ className?: string }>;
  targetValue: number;
  unitEn: string;
  unitTe: string;
  xpReward: number;
  actionUrl?: string;
  actionLabelEn: string;
  actionLabelTe: string;
  actionType?: 'link' | 'trigger_symptom_logger' | 'trigger_assessment' | 'trigger_doctor_guide';
}

const HEALTH_CHALLENGES: HealthChallenge[] = [
  {
    id: 'challenge_7day_streak',
    category: 'consistency',
    categoryLabelEn: 'Consistency',
    categoryLabelTe: 'స్థిరత్వం',
    titleEn: '7-Day Symptom Streak',
    titleTe: '7 రోజుల లక్షణాల లాగింగ్ స్ట్రీక్',
    descriptionEn: 'Log your physical and emotional symptoms for 7 consecutive days to reveal cyclic patterns.',
    descriptionTe: 'హార్మోన్ల మార్పుల సరళిని గుర్తించడానికి వరుసగా 7 రోజుల పాటు మీ లక్షణాలను నమోదు చేయండి.',
    icon: Flame,
    targetValue: 7,
    unitEn: 'days',
    unitTe: 'రోజులు',
    xpReward: 250,
    actionType: 'trigger_symptom_logger',
    actionLabelEn: 'Log Today',
    actionLabelTe: 'ఈరోజు నమోదు చేయండి'
  },
  {
    id: 'challenge_first_assessment',
    category: 'clinical',
    categoryLabelEn: 'Clinical Baseline',
    categoryLabelTe: 'క్లినికల్ బేస్‌లైన్',
    titleEn: 'Clinical Risk Baseline',
    titleTe: 'క్లినికల్ రిస్క్ బేస్‌లైన్ స్క్రీనింగ్',
    descriptionEn: 'Complete your comprehensive 4-step multi-factorial PCOS risk assessment with clinical markers.',
    descriptionTe: 'అన్ని క్లినికల్ సూచికలతో కూడిన పూర్తి 4-దశల PCOS రిస్క్ అసెస్‌మెంట్‌ను పూర్తి చేయండి.',
    icon: Stethoscope,
    targetValue: 1,
    unitEn: 'screening',
    unitTe: 'స్క్రీనింగ్',
    xpReward: 300,
    actionType: 'trigger_assessment',
    actionUrl: '/assessment',
    actionLabelEn: 'Start Screening',
    actionLabelTe: 'స్క్రీనింగ్ ప్రారంభించండి'
  },
  {
    id: 'challenge_first_education',
    category: 'education',
    categoryLabelEn: 'Patient Education',
    categoryLabelTe: 'ఆరోగ్య విద్య',
    titleEn: 'PCOS Scholar',
    titleTe: 'PCOS ఎడ్యుకేషన్ మాడ్యూల్',
    descriptionEn: 'Complete your first evidence-based PCOS knowledge module on Rotterdam criteria & insulin resistance.',
    descriptionTe: 'రాటర్‌డ్యామ్ ప్రమాణాలు & ఇన్సులిన్ రెసిస్టెన్స్‌పై మొదటి ఆధారిత ఎడ్యుకేషన్ మాడ్యూల్ చదవండి.',
    icon: BookOpen,
    targetValue: 1,
    unitEn: 'module',
    unitTe: 'మాడ్యూల్',
    xpReward: 150,
    actionUrl: '/education',
    actionLabelEn: 'Explore Modules',
    actionLabelTe: 'మాడ్యూల్స్ చూడండి'
  },
  {
    id: 'challenge_3_symptom_logs',
    category: 'consistency',
    categoryLabelEn: 'Tracker Kickstart',
    categoryLabelTe: 'ట్రాకర్ ప్రారంభం',
    titleEn: '3-Day Data Pioneer',
    titleTe: '3 రోజుల డేటా పయనీర్',
    descriptionEn: 'Record your daily symptoms 3 times to unlock your first personalized trigger heatmap analysis.',
    descriptionTe: 'ట్రిగ్గర్ హీట్‌మ్యాప్ విశ్లేషణను అన్‌లాక్ చేయడానికి 3 సార్లు రోజువారీ లక్షణాలను నమోదు చేయండి.',
    icon: Activity,
    targetValue: 3,
    unitEn: 'logs',
    unitTe: 'నమోదులు',
    xpReward: 120,
    actionType: 'trigger_symptom_logger',
    actionLabelEn: 'Log Symptoms',
    actionLabelTe: 'లక్షణాలు నమోదు'
  },
  {
    id: 'challenge_doctor_guide',
    category: 'advocacy',
    categoryLabelEn: 'Clinical Partner',
    categoryLabelTe: 'వైద్యుల సంప్రదింపు',
    titleEn: 'Doctor Discussion Ready',
    titleTe: 'డాక్టర్ డిస్కషన్ గైడ్ సిద్ధం',
    descriptionEn: 'Review or export your personalized Doctor Discussion Guide formatted for clinical consultations.',
    descriptionTe: 'వైద్యుల అపాయింట్‌మెంట్ కోసం మీ వ్యక్తిగతీకరించిన డాక్టర్ గైడ్‌ను సమీక్షించండి లేదా ఎగుమతి చేయండి.',
    icon: Calendar,
    targetValue: 1,
    unitEn: 'guide',
    unitTe: 'గైడ్',
    xpReward: 200,
    actionType: 'trigger_doctor_guide',
    actionLabelEn: 'Open Guide',
    actionLabelTe: 'గైడ్ తెరవండి'
  }
];

interface HealthChallengesSectionProps {
  userId?: string;
  assessmentCount?: number;
  onOpenSymptomLogger?: () => void;
  onOpenDoctorGuide?: () => void;
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

export const HealthChallengesSection: React.FC<HealthChallengesSectionProps> = ({
  userId = 'guest',
  assessmentCount = 0,
  onOpenSymptomLogger,
  onOpenDoctorGuide,
  onAskAI,
  isDark = false
}) => {
  const { isTelugu } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`pcosense_challenges_claimed_${userId}`);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Calculate live dynamic user progress for each challenge
  const symptomLogs = useMemo(() => getDailySymptomLogs(userId), [userId]);
  const milestoneData = useMemo(() => evaluateUserMilestones(userId), [userId]);
  const symptomStreak = milestoneData.streakDays;
  const habitStreak = useMemo(() => getStoredUserStreak(userId), [userId]);

  // Check if education was read
  const educationCompletedCount = useMemo(() => {
    try {
      const readModules = localStorage.getItem('pcosense_education_completed_modules');
      return readModules ? JSON.parse(readModules).length : 0;
    } catch {
      return 0;
    }
  }, []);

  // Check if doctor guide was viewed/exported
  const doctorGuideViewed = useMemo(() => {
    try {
      return localStorage.getItem('pcosense_doctor_guide_viewed') === 'true' ? 1 : 0;
    } catch {
      return 0;
    }
  }, []);

  const getChallengeProgress = (challenge: HealthChallenge): { current: number; target: number; percentage: number; isFinished: number } => {
    let current = 0;
    const target = challenge.targetValue;

    switch (challenge.id) {
      case 'challenge_7day_streak':
        current = Math.min(Math.max(symptomStreak, habitStreak), target);
        break;
      case 'challenge_first_assessment':
        current = Math.min(assessmentCount, target);
        break;
      case 'challenge_first_education':
        current = Math.min(educationCompletedCount > 0 ? 1 : 0, target);
        break;
      case 'challenge_3_symptom_logs':
        current = Math.min(symptomLogs.length, target);
        break;
      case 'challenge_doctor_guide':
        current = Math.min(doctorGuideViewed, target);
        break;
      default:
        current = 0;
    }

    const percentage = Math.min(Math.round((current / target) * 100), 100);
    const isFinished = percentage >= 100 ? 1 : 0;
    return { current, target, percentage, isFinished };
  };

  const handleClaimChallenge = (challengeId: string) => {
    const safeList = Array.isArray(completedChallenges) ? completedChallenges : [];
    if (!safeList.includes(challengeId)) {
      const updated = [...safeList, challengeId];
      setCompletedChallenges(updated);
      try {
        localStorage.setItem(`pcosense_challenges_claimed_${userId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const challengeItems = useMemo(() => {
    const safeCompleted = Array.isArray(completedChallenges) ? completedChallenges : [];
    return HEALTH_CHALLENGES.map((ch) => {
      const progress = getChallengeProgress(ch);
      const isClaimed = safeCompleted.includes(ch.id);
      return {
        ...ch,
        ...progress,
        isClaimed
      };
    });
  }, [symptomLogs, symptomStreak, habitStreak, assessmentCount, educationCompletedCount, doctorGuideViewed, completedChallenges]);

  const filteredChallenges = useMemo(() => {
    if (filter === 'in_progress') {
      return challengeItems.filter((ch) => ch.percentage < 100);
    }
    if (filter === 'completed') {
      return challengeItems.filter((ch) => ch.percentage >= 100);
    }
    return challengeItems;
  }, [challengeItems, filter]);

  const totalXP = useMemo(() => {
    return challengeItems
      .filter((ch) => ch.isClaimed || ch.percentage >= 100)
      .reduce((sum, ch) => sum + ch.xpReward, 0);
  }, [challengeItems]);

  const completedCount = challengeItems.filter((ch) => ch.percentage >= 100).length;

  return (
    <div
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
      id="health-challenges-section"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-2xs shrink-0">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                {isTelugu ? 'ఆరోగ్య లక్ష్యాలు & ఛాలెంజ్‌లు' : 'Health Goals & Clinical Challenges'}
              </h2>
              <span className="text-xs bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                {completedCount}/{HEALTH_CHALLENGES.length} {isTelugu ? 'పూర్తయ్యాయి' : 'Completed'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isTelugu
                ? 'క్రమబద్ధమైన ట్రాకింగ్ మరియు అవగాహన ద్వారా మీ PCOS ప్రయాణంలో ప్రోగ్రెస్ సాధించండి.'
                : 'Build consistent daily logging habits, master clinical concepts, and unlock milestone rewards.'}
            </p>
          </div>
        </div>

        {/* Filter Controls & Total XP Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'అన్నీ' : 'All'} ({HEALTH_CHALLENGES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'in_progress'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'ప్రోగ్రెస్‌లో ఉన్నాయి' : 'In Progress'} ({HEALTH_CHALLENGES.length - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isTelugu ? 'పూర్తయినవి' : 'Completed'} ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-xs font-extrabold shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>{totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge) => {
          const IconComp = challenge.icon;
          const isDone = challenge.percentage >= 100;

          return (
            <div
              key={challenge.id}
              className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700'
              }`}
            >
              <div className="space-y-3">
                {/* Challenge Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border-slate-200 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <IconComp className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {isTelugu ? challenge.titleTe : challenge.titleEn}
                        </h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        {isTelugu ? challenge.categoryLabelTe : challenge.categoryLabelEn}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 shrink-0">
                    <Zap className="h-3 w-3 text-amber-600 fill-amber-600" />
                    <span>+{challenge.xpReward} XP</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isTelugu ? challenge.descriptionTe : challenge.descriptionEn}
                </p>

                {/* Progress Bar and Counts */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {isTelugu ? 'ప్రోగ్రెస్:' : 'Progress:'}{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {challenge.current} / {challenge.target} {isTelugu ? challenge.unitTe : challenge.unitEn}
                      </strong>
                    </span>
                    <span
                      className={`font-bold ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {challenge.percentage}%
                    </span>
                  </div>

                  {/* Visual Progress Track */}
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isDone
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                {isDone ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{isTelugu ? 'లక్ష్యం సాధించారు!' : 'Challenge Achieved!'}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {challenge.target - challenge.current} {isTelugu ? challenge.unitTe : challenge.unitEn}{' '}
                    {isTelugu ? 'మిగిలి ఉంది' : 'remaining'}
                  </span>
                )}

                {/* Contextual Action Link / Trigger */}
                <div>
                  {isDone && !challenge.isClaimed ? (
                    <button
                      type="button"
                      onClick={() => handleClaimChallenge(challenge.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                      <span>{isTelugu ? 'రివార్డ్ తీసుకోండి' : 'Claim Reward'}</span>
                    </button>
                  ) : challenge.actionType === 'trigger_symptom_logger' ? (
                    <button
                      type="button"
                      onClick={onOpenSymptomLogger}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <span>{isTelugu ? challenge.actionLabelTe : challenge.actionLabelEn}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : challenge.actionType === 'trigger_doctor_guide' ? (
                    <button
                      type="button"
                      onClick={onOpenDoctorGuide}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <span>{isTelugu ? challenge.actionLabelTe : challenge.actionLabelEn}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : challenge.actionUrl ? (
                    <Link
                      to={challenge.actionUrl}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <span>{isTelugu ? challenge.actionLabelTe : challenge.actionLabelEn}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
