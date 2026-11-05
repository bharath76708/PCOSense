/**
 * PCOSense - MilestoneBadgesCard Component
 * Displays user consistency milestones, earned badge medals, level progress, and XP rewards.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  Flame,
  ShieldCheck,
  Stethoscope,
  Sliders,
  Calendar,
  Footprints,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Trophy,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { MilestoneBadge, UserMilestonesData } from '../types';
import { evaluateUserMilestones } from '../services/badgeService';

interface MilestoneBadgesCardProps {
  onOpenLogger?: () => void;
  onOpenAssessment?: () => void;
  isDark?: boolean;
}

export const MilestoneBadgesCard: React.FC<MilestoneBadgesCardProps> = ({
  onOpenLogger,
  onOpenAssessment,
  isDark
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();
  const [data, setData] = useState<UserMilestonesData>(() => evaluateUserMilestones(user?.id));
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);

  // Refresh milestones whenever user or storage changes
  useEffect(() => {
    setData(evaluateUserMilestones(user?.id));
  }, [user]);

  const earnedCount = data.badges.filter(b => b.earned).length;
  const nextLevelXp = data.level * 200;
  const currentLevelProgress = Math.round(((data.totalXp % 200) / 200) * 100);

  const getBadgeIcon = (iconName: string, earned: boolean, tier: string) => {
    const className = `h-5 w-5 ${
      earned
        ? tier === 'gold'
          ? 'text-amber-500'
          : tier === 'silver'
          ? 'text-slate-300 dark:text-slate-200'
          : 'text-amber-700 dark:text-amber-400'
        : 'text-slate-400'
    }`;

    switch (iconName) {
      case 'Footprints':
        return <Footprints className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'Calendar':
        return <Calendar className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const getTierBg = (tier: string, earned: boolean) => {
    if (!earned) {
      return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60';
    }
    switch (tier) {
      case 'gold':
        return 'bg-gradient-to-br from-amber-50 to-yellow-100/70 dark:from-amber-950/40 dark:to-yellow-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs';
      case 'silver':
        return 'bg-gradient-to-br from-slate-50 to-teal-50/60 dark:from-slate-800 dark:to-teal-950/30 border-teal-200 dark:border-teal-800 shadow-xs';
      default:
        return 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-slate-800 border-amber-200 dark:border-amber-800 shadow-xs';
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      
      {/* Header with Level and XP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                {isTelugu ? 'ఆరోగ్య స్థిరత్వ మైలురాళ్ళు & బ్యాడ్జీలు' : 'Consistency Milestones & Health Badges'}
              </h3>
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                {earnedCount}/{data.badges.length} {isTelugu ? 'అన్‌లాక్ చేయబడ్డాయి' : 'Unlocked'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? 'రోజువారీ లక్షణాల ట్రాకింగ్ మరియు క్లినికల్ స్క్రీనింగ్ ద్వారా స్థిరమైన ఆరోగ్య పరంపరలను నిర్మించండి.'
                : 'Earn milestone rewards by maintaining daily symptom tracking streaks and regular screening.'}
            </p>
          </div>
        </div>

        {/* Level & Streak Stats */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 px-2">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Streak</div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {data.streakDays} {isTelugu ? 'రోజులు' : 'Days'}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-1.5 px-2">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Level {data.level}</div>
              <div className="text-sm font-extrabold text-teal-700 dark:text-teal-400 leading-tight">
                {data.totalXp} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>{isTelugu ? `స్థాయి ${data.level} పురోగతి` : `Level ${data.level} Progression`}</span>
          <span>{data.totalXp % 200} / 200 XP to Level {data.level + 1}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${currentLevelProgress}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.badges.map(badge => {
          const isSelected = selectedBadge?.id === badge.id;
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative group ${getTierBg(badge.tier, badge.earned)} ${
                isSelected ? 'ring-2 ring-teal-500' : 'hover:scale-[1.02]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                    badge.earned
                      ? 'bg-white dark:bg-slate-800 shadow-2xs'
                      : 'bg-slate-200/70 dark:bg-slate-700'
                  }`}>
                    {getBadgeIcon(badge.icon, badge.earned, badge.tier)}
                  </div>
                  {badge.earned ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md">
                      <CheckCircle2 className="h-3 w-3" />
                      +{badge.xpPoints}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                      <Lock className="h-2.5 w-2.5" />
                      {badge.progress}%
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {isTelugu && badge.teluguTitle ? badge.teluguTitle : badge.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {isTelugu && badge.teluguDescription ? badge.teluguDescription : badge.description}
                </p>
              </div>

              {/* Mini progress if not earned */}
              {!badge.earned && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                    <span>{badge.currentValue}/{badge.targetValue} {badge.unit}</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 dark:bg-teal-400 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  {getBadgeIcon(selectedBadge.icon, selectedBadge.earned, selectedBadge.tier)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                    {selectedBadge.tier} Milestone
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isTelugu && selectedBadge.teluguTitle ? selectedBadge.teluguTitle : selectedBadge.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isTelugu && selectedBadge.teluguDescription ? selectedBadge.teluguDescription : selectedBadge.description}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className={selectedBadge.earned ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {selectedBadge.earned ? 'Unlocked & Earned' : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Progress</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit} ({selectedBadge.progress}%)
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Reward</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">+{selectedBadge.xpPoints} XP</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {!selectedBadge.earned && selectedBadge.category === 'symptoms' && onOpenLogger && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBadge(null);
                    onOpenLogger();
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                >
                  {isTelugu ? 'లక్షణాలను నమోదు చేయండి' : 'Log Today’s Symptoms'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                {isTelugu ? 'మూసివేయి' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
