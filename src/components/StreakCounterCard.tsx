import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Trophy,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Award,
  Zap,
  Star,
  PartyPopper,
  X
} from 'lucide-react';
import { calculateStreak, StreakData } from '../services/streakService';
import { useLanguage } from '../translations';
import { playNotificationSound } from '../services/soundService';
import { DailySymptomLog } from '../types';

interface StreakCounterCardProps {
  logs?: DailySymptomLog[];
  onOpenLogModal?: () => void;
}

export const StreakCounterCard: React.FC<StreakCounterCardProps> = ({
  logs,
  onOpenLogModal
}) => {
  const { isTelugu } = useLanguage();
  const [streakData, setStreakData] = useState<StreakData>(() => calculateStreak(logs));
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<number>(7);

  useEffect(() => {
    const updated = calculateStreak(logs);
    setStreakData(updated);

    // Check if celebration was already shown for current streak in session storage
    if (updated.currentStreak === 7 || updated.currentStreak === 30) {
      const storageKey = `pcosense_streak_celebrated_${updated.currentStreak}_${new Date().toISOString().split('T')[0]}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');
        setCelebrationMilestone(updated.currentStreak);
        setShowCelebrationModal(true);
        playNotificationSound('milestone-unlocked');
      }
    }
  }, [logs]);

  const handleManualCelebrate = (milestoneNumber: number) => {
    setCelebrationMilestone(milestoneNumber);
    setShowCelebrationModal(true);
    playNotificationSound('milestone-unlocked');
  };

  const getMilestoneTitle = (milestone: number) => {
    if (milestone >= 30) {
      return isTelugu ? '30 రోజుల PCOS ఛాంపియన్!' : '30-Day PCOS Champion!';
    }
    if (milestone >= 14) {
      return isTelugu ? '14 రోజుల స్థిరత్వ నిపుణత!' : '14-Day Consistency Master!';
    }
    return isTelugu ? '7 రోజుల గోల్డెన్ స్ట్రీక్ స్టార్!' : '7-Day Golden Streak Star!';
  };

  const getMilestoneBadgeDesc = (milestone: number) => {
    if (milestone >= 30) {
      return isTelugu
        ? 'అద్భుతం! 30 రోజుల పాటు రోజువారీ లక్షణాలను రికార్డ్ చేయడం ద్వారా మీ హార్మోన్ల నమూనాలను ఖచ్చితంగా అర్థం చేసుకోవడానికి అవసరమైన క్లినికల్ డేటాను నిర్మించారు.'
        : 'Incredible dedication! 30 consecutive days of logging gives your healthcare provider a high-fidelity hormonal map to identify true trigger patterns.';
    }
    return isTelugu
      ? 'అభినందనలు! పూర్తి వారం పాటు నిరంతరాయంగా మీ శ్రేయస్సును ట్రాక్ చేశారు. స్థిరమైన ట్రాకింగ్ ఖచ్చితమైన ప్రిడిక్షన్లకు ఆధారం.'
      : 'Congratulations! A full consecutive week of symptom check-ins powers superior trigger analytics and longitudinal trend precision.';
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-teal-500/10 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-teal-950/30 border border-amber-200/80 dark:border-amber-900/50 p-5 sm:p-6 shadow-sm transition-all"
      id="dashboard-streak-counter-widget"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Left Side: Flame & Streak count */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleManualCelebrate(streakData.currentStreak >= 30 ? 30 : 7)}
            className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/25 shrink-0 cursor-pointer group"
            title={isTelugu ? 'మైలురాయి వేడుక జరుపుకోండి!' : 'Click to trigger streak milestone celebration!'}
            id="streak-flame-badge-btn"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                filter: ['drop-shadow(0 0 2px rgba(255,255,255,0.4))', 'drop-shadow(0 0 8px rgba(255,255,255,0.8))', 'drop-shadow(0 0 2px rgba(255,255,255,0.4))']
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              <Flame className="h-8 w-8 text-amber-100 fill-amber-200/80" />
            </motion.div>
            <span className="text-[10px] font-black tracking-wider uppercase text-amber-100/90 -mt-1">
              Streak
            </span>
          </motion.div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {streakData.currentStreak} {isTelugu ? 'రోజుల స్ట్రీక్' : 'Day Streak'}
              </h3>
              
              {streakData.currentStreak >= 7 && (
                <button
                  type="button"
                  onClick={() => handleManualCelebrate(streakData.currentStreak >= 30 ? 30 : 7)}
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:scale-105 transition-transform"
                >
                  <Sparkles className="h-3 w-3 text-amber-600 animate-spin" />
                  <span>{streakData.currentStreak >= 30 ? '30-Day Star' : '7-Day Milestone'}</span>
                </button>
              )}

              {streakData.loggedToday ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>{isTelugu ? 'ఈరోజు నమోదైంది' : 'Logged Today'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                  <Zap className="h-3 w-3 text-amber-600" />
                  <span>{isTelugu ? 'ఈరోజు లాగ్ చేయండి' : 'Check-In Due Today'}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {streakData.loggedToday
                ? (isTelugu
                    ? `అద్భుతం! వరుసగా ${streakData.currentStreak} రోజులు నమోదు చేశారు. తదుపరి మైలురాయి: ${streakData.nextMilestone} రోజులు.`
                    : `Great momentum! ${streakData.currentStreak} consecutive days logged. Next milestone: Day ${streakData.nextMilestone}.`)
                : (isTelugu
                    ? 'ఈరోజు శీఘ్ర లక్షణ నమోదును పూర్తి చేసి మీ స్ట్రీక్‌ను సజీవంగా ఉంచండి!'
                    : 'Log today\'s 1-minute check-in to preserve your daily tracking momentum!')}
            </p>
          </div>
        </div>

        {/* Right Side: 7-Day Matrix & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          {/* Recent 7 Days Mini Matrix */}
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {streakData.recent7Days.map((day, idx) => (
              <div
                key={day.dateKey}
                className={`flex flex-col items-center justify-center w-8 h-10 rounded-xl transition-all ${
                  day.logged
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : day.isToday
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-dashed border-amber-400 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium'
                }`}
                title={`${day.dateKey}: ${day.logged ? 'Logged' : 'No entry'}`}
              >
                <span className="text-[9px] uppercase leading-none opacity-80 mb-0.5">{day.dayLabel}</span>
                <span className="text-xs leading-none">{day.dayNum}</span>
              </div>
            ))}
          </div>

          {/* Quick Check-In CTA or Celebrate CTA */}
          {!streakData.loggedToday && onOpenLogModal && (
            <button
              type="button"
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold shadow-md shadow-orange-500/20 hover:scale-102 transition-all shrink-0"
              id="streak-log-today-btn"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>{isTelugu ? 'ఈరోజు నమోదు చేయండి' : 'Log Today (+1 Streak)'}</span>
            </button>
          )}

          {streakData.loggedToday && (
            <button
              type="button"
              onClick={() => handleManualCelebrate(streakData.currentStreak >= 30 ? 30 : 7)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all shadow-2xs shrink-0"
              id="streak-view-milestones-btn"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>{isTelugu ? 'మైలురాళ్ళు' : 'Milestones'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Milestone Progress Bar */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>{isTelugu ? 'తదుపరి మైలురాయి లక్ష్యం:' : 'Next Milestone Goal:'} {streakData.nextMilestone} {isTelugu ? 'రోజులు' : 'Days'}</span>
            </span>
            <span className="text-amber-800 dark:text-amber-400 font-extrabold">
              {streakData.currentStreak} / {streakData.nextMilestone} ({streakData.milestoneProgressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${streakData.milestoneProgressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
            {isTelugu ? 'మొత్తం రికార్డులు' : 'Total Days Logged'}
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {streakData.totalDaysLogged} {isTelugu ? 'రోజులు' : 'Days'}
          </span>
        </div>
      </div>

      {/* CELEBRATORY CONFETTI MILESTONE POPUP MODAL */}
      <AnimatePresence>
        {showCelebrationModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Celebratory Floating Confetti Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: -20,
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{
                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                    x: `+=${(Math.random() - 0.5) * 200}`,
                    rotate: Math.random() * 720,
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 2,
                    ease: 'easeOut',
                    delay: Math.random() * 0.5
                  }}
                  className={`absolute w-3 h-3 rounded-sm ${
                    ['bg-amber-400', 'bg-teal-400', 'bg-rose-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-orange-400'][i % 6]
                  }`}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 p-6 sm:p-8 shadow-2xl text-center space-y-5 z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowCelebrationModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close celebration"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Big Animated Icon */}
              <div className="relative mx-auto h-24 w-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/30">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Trophy className="h-12 w-12 text-amber-100 fill-amber-200/80" />
                </motion.div>
                <PartyPopper className="h-6 w-6 text-yellow-200 absolute -top-2 -right-2 animate-bounce" />
              </div>

              {/* Title and details */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>{celebrationMilestone}-Day Milestone Reached</span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {getMilestoneTitle(celebrationMilestone)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                  {getMilestoneBadgeDesc(celebrationMilestone)}
                </p>
              </div>

              {/* Stat callouts */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Current Streak</span>
                  <span className="text-base font-black text-amber-900 dark:text-amber-300">{streakData.currentStreak} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Longest Streak</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{streakData.longestStreak} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Total Logs</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{streakData.totalDaysLogged}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 transition-all"
                >
                  {isTelugu ? 'అద్భుతం! కొనసాగించండి' : 'Awesome! Keep Tracking'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
