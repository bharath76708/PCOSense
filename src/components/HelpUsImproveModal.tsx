import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Star,
  MessageSquare,
  CheckCircle2,
  X,
  Heart,
  ThumbsUp,
  Award,
  Send,
  HelpCircle,
  Stethoscope,
  Smile,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { UserFeedback } from '../types';
import { saveFirestoreFeedback } from '../services/firestoreService';
import { playNotificationSound } from '../services/soundService';

interface HelpUsImproveModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  assessmentCount?: number;
  forceShow?: boolean;
}

const FEEDBACK_TAGS = [
  { id: 'ml_accuracy', labelEn: 'ML Risk Accuracy & Insights', labelTe: 'రిస్క్ అంచనా ఖచ్చితత్వం' },
  { id: 'diet_plans', labelEn: 'Anti-Inflammatory Meal Plans', labelTe: 'యాంటీ-ఇన్‌ఫ్లమేటరీ డైట్ ప్లాన్స్' },
  { id: 'walking_water', labelEn: 'Walking & Hydration Trackers', labelTe: 'నడక & వాటర్ ట్రాకింగ్' },
  { id: 'ai_assistant', labelEn: 'Voice AI Assistant', labelTe: 'వాయిస్ AI అసిస్టెంట్' },
  { id: 'doctor_guide', labelEn: 'Doctor Sharing & Reports', labelTe: 'డాక్టర్ రిపోర్ట్ సారాంశం' },
  { id: 'telugu_support', labelEn: 'Telugu Language Experience', labelTe: 'తెలుగు భాషా అనువాదం' }
];

export const HelpUsImproveModal: React.FC<HelpUsImproveModalProps> = ({
  isOpen: propIsOpen,
  onClose,
  assessmentCount = 5,
  forceShow = false
}) => {
  const { user } = useAuth();
  const { isTelugu } = useLanguage();

  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number>(9);
  const [selectedTags, setSelectedTags] = useState<string[]>(['ml_accuracy', 'walking_water']);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (propIsOpen !== undefined) {
      setInternalOpen(propIsOpen);
      return;
    }

    if (forceShow) {
      setInternalOpen(true);
      return;
    }

    // Auto-trigger on 5th assessment if not dismissed or already submitted
    try {
      const alreadySubmitted = localStorage.getItem('pcosense_feedback_submitted');
      const alreadyDismissed = localStorage.getItem('pcosense_feedback_dismissed_5th');
      
      if (assessmentCount >= 5 && !alreadySubmitted && !alreadyDismissed) {
        // Subtle delay to allow results/dashboard to render smoothly first
        const timer = setTimeout(() => {
          setInternalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [propIsOpen, forceShow, assessmentCount]);

  const handleDismiss = (neverShowAgain: boolean = false) => {
    try {
      if (neverShowAgain) {
        localStorage.setItem('pcosense_feedback_dismissed_5th', 'true');
      } else {
        sessionStorage.setItem('pcosense_feedback_snoozed_session', 'true');
      }
    } catch {}

    setInternalOpen(false);
    if (onClose) onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackRecord: UserFeedback = {
      id: `feedback-${Date.now()}-${user?.id || 'guest'}`,
      userId: user?.id,
      userEmail: user?.email,
      rating,
      npsScore,
      experienceTags: selectedTags,
      feedbackText: feedbackText.trim() || 'No additional comments provided.',
      submittedAt: new Date().toISOString(),
      completedAssessmentsCount: assessmentCount
    };

    try {
      await saveFirestoreFeedback(feedbackRecord);
      playNotificationSound('milestone-unlocked', true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 }
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return isTelugu ? 'మెరుగుపరచాలి' : 'Needs Significant Work';
      case 2:
        return isTelugu ? 'సంతృప్తికరంగా లేదు' : 'Fair / Could be Better';
      case 3:
        return isTelugu ? 'బాగుంది' : 'Good & Helpful';
      case 4:
        return isTelugu ? 'చాలా బాగుంది' : 'Very Good & Accurate';
      case 5:
      default:
        return isTelugu ? 'అద్భుతంగా ఉంది — ఆరోగ్యం పట్ల నమ్మకం పెరిగింది!' : 'Exceptional — Highly Valuable for PCOS Care!';
    }
  };

  if (!internalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-100 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 my-8"
          id="help-us-improve-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          {/* Header Visual Bar */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-5 text-white relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => handleDismiss(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close feedback dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-teal-200 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {isTelugu ? '5వ అసెస్‌మెంట్ మైలురాయి' : '5th Assessment Milestone'}
                  </span>
                </div>
                <h3 id="feedback-modal-title" className="text-base font-extrabold text-white mt-0.5">
                  {isTelugu ? 'PCOSense మెరుగుపరచడానికి మీ సూచనలు' : 'Help Us Improve PCOSense'}
                </h3>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="p-8 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు!' : 'Thank You for Your Valuable Feedback!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {isTelugu
                    ? 'మీ సలహాలు మా క్లినికల్ మోడల్స్ మరియు యూజర్ అనుభవాన్ని మరింత మెరుగుపరచడానికి ఎంతో సహాయపడతాయి.'
                    : 'Your insights directly empower us to enhance PCOSense clinical explainability, diet recommendations, and daily tracking tools.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDismiss(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {isTelugu ? 'పూర్తయింది' : 'Back to Experience'}
              </button>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
              {/* Context intro */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isTelugu
                  ? 'మీరు ఇప్పటివరకు 5 రిస్క్ అసెస్‌మెంట్లు పూర్తి చేసుకున్నారు! మీ అనుభవం మరియు సూచనలు PCOSense ని మరింత ఉపయోగకరంగా తీర్చిదిద్దడానికి చాలా ముఖ్యం.'
                  : `You have completed ${assessmentCount} risk evaluations with PCOSense. How is your experience so far, and how can we make it better for you?`}
              </p>

              {/* 1. Star Rating */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'మొత్తం అనుభవం రేటింగ్:' : 'Overall Experience Rating:'}
                  </label>
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg transition-transform hover:scale-115 focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. What features did you like most? */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'మీకు ఏ అంశాలు బాగా ఉపయోగపడ్డాయి?' : 'What parts of PCOSense have helped you most?'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isTelugu ? tag.labelTe : tag.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Recommendation likelihood (1-10) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'స్నేహితులకు సిఫారసు చేసే అవకాశం (NPS):' : 'Likelihood to recommend to others (1-10):'}
                  </span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{npsScore}/10</span>
                </div>
                <div className="grid grid-cols-10 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNpsScore(num)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all border ${
                        npsScore === num
                          ? 'bg-teal-800 dark:bg-teal-600 text-white border-teal-800 dark:border-teal-500 shadow-xs scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 px-0.5 pt-0.5">
                  <span>{isTelugu ? 'తక్కువ అవకాశం' : 'Not likely'}</span>
                  <span>{isTelugu ? 'ఖచ్చితంగా సిఫారసు చేస్తాను' : 'Extremely likely'}</span>
                </div>
              </div>

              {/* 4. Qualitative Comments */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  {isTelugu ? 'మేము మరింత మెరుగుపరచగల అంశాలు / కొత్త ఫీచర్లు:' : 'Suggestions for improvements or requested features:'}
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    isTelugu
                      ? 'ఉదా: డైట్ ప్లాన్లలో మరిన్ని భారతీయ వంటకాలు, లేదా మరింత లోతైన హార్మోన్ల విశ్లేషణ...'
                      : 'e.g., More regional recipes, hormone tracking lab integration, or reminders customization...'
                  }
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDismiss(true)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                >
                  {isTelugu ? 'మళ్లీ చూపవద్దు' : "Don't show again"}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleDismiss(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isTelugu ? 'తర్వాత' : 'Maybe Later'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? (isTelugu ? 'సమర్పిస్తోంది...' : 'Submitting...') : (isTelugu ? 'ఫీడ్‌బ్యాక్ పంపండి' : 'Submit Feedback')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
