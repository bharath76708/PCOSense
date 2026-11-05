import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  RotateCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Quote,
  Share2,
  Sun,
  ShieldCheck,
  Smile,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../translations';

export interface Affirmation {
  id: string;
  category: 'resilience' | 'body_compassion' | 'hormonal_balance' | 'mindset' | 'patience' | 'empowerment';
  categoryLabelEn: string;
  categoryLabelTe: string;
  textEn: string;
  textTe: string;
  authorEn: string;
  authorTe: string;
  actionPromptEn: string;
  actionPromptTe: string;
}

const PCOS_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff-1',
    category: 'body_compassion',
    categoryLabelEn: 'Body Compassion',
    categoryLabelTe: 'శరీరం పట్ల సానుభూతి',
    textEn: 'My worth is not defined by hormone numbers or ultrasound images. My body is doing its best every single day to support and protect me.',
    textTe: 'నా విలువ హార్మోన్ల గణాంకాలు లేదా అల్ట్రాసౌండ్ ఫలితాలపై ఆధారపడి ఉండదు. నా శరీరం ప్రతిరోజూ నన్ను సంరక్షించడానికి తన వంతు కృషి చేస్తోంది.',
    authorEn: 'PCOS Wellness Collective',
    authorTe: 'PCOS వెల్నెస్ కలెక్టివ్',
    actionPromptEn: 'Take 3 deep, grounding breaths and place a hand over your heart with kindness.',
    actionPromptTe: '3 సార్లు లోతైన శ్వాస తీసుకోండి మరియు మీ గుండెపై చేతిని ఉంచి ప్రశాంతతను అనుభవించండి.'
  },
  {
    id: 'aff-2',
    category: 'hormonal_balance',
    categoryLabelEn: 'Hormonal Healing',
    categoryLabelTe: 'హార్మోన్ల సమతుల్యత',
    textEn: 'Every nourishing meal, restorative sleep, and mindful walk is a gentle signal of safety and healing to my endocrine system.',
    textTe: 'ప్రతి పోషక ఆహారం, ప్రశాంతమైన నిద్ర మరియు నడక నా హార్మోన్ల వ్యవస్థకు స్వస్థత మరియు స్థిరత్వాన్ని చేకూరుస్తాయి.',
    authorEn: 'Integrative Endocrinology Guidance',
    authorTe: 'ఇంటిగ్రేటివ్ ఎండోక్రినాలజీ గైడెన్స్',
    actionPromptEn: 'Celebrate one nourishing choice you made for your body today.',
    actionPromptTe: 'ఈరోజు మీ శరీరం కోసం మీరు తీసుకున్న ఒక మంచి నిర్ణయాన్ని గుర్తుచేసుకోండి.'
  },
  {
    id: 'aff-3',
    category: 'patience',
    categoryLabelEn: 'Patience & Grace',
    categoryLabelTe: 'ఓర్పు & సహనం',
    textEn: 'Hormonal healing is not an overnight race; it is a gentle, gradual journey of consistent everyday care and self-patience.',
    textTe: 'హార్మోన్ల స్వస్థత అనేది ఒక్క రాత్రిలో జరిగేది కాదు; ఇది ప్రతిరోజూ నిరంతర సంరక్షణ మరియు సహనంతో కూడిన అందమైన ప్రయాణం.',
    authorEn: 'Reproductive Health Journey',
    authorTe: 'రీప్రొడక్టివ్ హెల్త్ జర్నీ',
    actionPromptEn: 'Remind yourself: Progress is measured in months of steady habits, not single-day fluctuations.',
    actionPromptTe: 'గుర్తుంచుకోండి: పురోగతి అనేది స్థిరమైన అలవాట్లలో కొలుస్తారు, ఒక్క రోజు మార్పులలో కాదు.'
  },
  {
    id: 'aff-4',
    category: 'empowerment',
    categoryLabelEn: 'Patient Empowerment',
    categoryLabelTe: 'ఆరోగ్య సాధికారత',
    textEn: 'I am an informed, proactive partner in my healthcare. I have the right to ask questions, seek second opinions, and be heard.',
    textTe: 'నా ఆరోగ్య సంరక్షణలో నేను పూర్తి అవగాహన కలిగిన భాగస్వామిని. ప్రశ్నలు అడిగే, వైద్య సలహాలు పొందే పూర్తి హక్కు నాకుంది.',
    authorEn: 'PCOS Advocacy Network',
    authorTe: 'PCOS అడ్వొకసీ నెట్‌వర్క్',
    actionPromptEn: 'Write down any symptom or question you want to bring up with your doctor.',
    actionPromptTe: 'మీ వైద్యుడిని అడగాలనుకుంటున్న ఏదైనా లక్షణం లేదా సందేహాన్ని రాసి పెట్టుకోండి.'
  },
  {
    id: 'aff-5',
    category: 'resilience',
    categoryLabelEn: 'Emotional Resilience',
    categoryLabelTe: 'మానసిక దృఢత్వం',
    textEn: 'It is okay to feel tired or frustrated on challenging cycle days. Honoring my feelings without self-judgment is part of healing.',
    textTe: 'కష్టమైన రోజులలో అలసట లేదా నిరాశ కలగడం సహజం. నన్ను నేను నిందించుకోకుండా నా భావోద్వేగాలను గౌరవించడమే అసలైన స్వస్థత.',
    authorEn: 'Mind-Body Care Research',
    authorTe: 'మైండ్-బాడీ కేర్ రీసెర్చ్',
    actionPromptEn: 'Give yourself permission to take a 10-minute quiet pause today.',
    actionPromptTe: 'ఈరోజు 10 నిమిషాలు ప్రశాంతంగా విశ్రాంతి తీసుకోవడానికి సమయం కేటాయించండి.'
  },
  {
    id: 'aff-6',
    category: 'mindset',
    categoryLabelEn: 'Mindset & Peace',
    categoryLabelTe: 'శాంతియుత మనస్తత్వం',
    textEn: 'My cycle does not define my beauty, femininity, or capacity for joyful living. I am vibrant, capable, and resilient.',
    textTe: 'నా రుతుక్రమం నా అందాన్ని లేదా నా సామర్థ్యాన్ని నిర్వచించలేదు. నేను ఎల్లప్పుడూ ఉత్సాహంగా, దృఢంగా మరియు ఆనందంగా ఉండగలను.',
    authorEn: 'PCOS Support Circle',
    authorTe: 'PCOS సపోర్ట్ సర్కిల్',
    actionPromptEn: 'Smile at your reflection and speak one kind compliment to yourself.',
    actionPromptTe: 'అద్దంలో చూసుకుని చిరునవ్వుతో మీకు మీరే ఒక ప్రశంస చెప్పుకోండి.'
  },
  {
    id: 'aff-7',
    category: 'hormonal_balance',
    categoryLabelEn: 'Hormonal Balance',
    categoryLabelTe: 'హార్మోన్ల సమతుల్యత',
    textEn: 'When I reduce stress and prioritize restful sleep, my cortisol lowers and my natural reproductive rhythms find their harmony.',
    textTe: 'నేను ఒత్తిడిని తగ్గించి ప్రశాంతంగా నిద్రించినప్పుడు, నా శరీరంలో కార్టిసాల్ తగ్గి సహజ లయలు తిరిగి సమతుల్యం అవుతాయి.',
    authorEn: 'Circadian Endocrine Biology',
    authorTe: 'సిర్కాడియన్ ఎండోక్రైన్ బయాలజీ',
    actionPromptEn: 'Plan a relaxing wind-down routine 30 minutes before bedtime tonight.',
    actionPromptTe: 'ఈ రాత్రి పడుకోవడానికి 30 నిమిషాల ముందు ఫోన్ పక్కన పెట్టి ప్రశాంతంగా ఉండటానికి సిద్ధం అవ్వండి.'
  },
  {
    id: 'aff-8',
    category: 'body_compassion',
    categoryLabelEn: 'Body Compassion',
    categoryLabelTe: 'శరీర సంరక్షణ',
    textEn: 'I treat my skin, hair, and weight with gentleness. Symptom flares are simply my body asking for support, not a personal failure.',
    textTe: 'నా చర్మం, జుట్టు మరియు బరువు పట్ల నేను దయతో ఉంటాను. లక్షణాలు పెరిగినప్పుడు నా శరీరం సంరక్షణను కోరుతోంది తప్ప అది నా వైఫల్యం కాదు.',
    authorEn: 'Clinical Psychology & PCOS',
    authorTe: 'క్లినికల్ సైకాలజీ & PCOS',
    actionPromptEn: 'Acknowledge three things your body made possible for you today.',
    actionPromptTe: 'ఈరోజు మీ శరీరం మీకు సాధ్యం చేసిన 3 మంచి విషయాలను గుర్తు చేసుకోండి.'
  }
];

interface DailyAffirmationCardProps {
  onAskAI?: (prompt: string) => void;
  className?: string;
}

export const DailyAffirmationCard: React.FC<DailyAffirmationCardProps> = ({
  onAskAI,
  className = ''
}) => {
  const { isTelugu } = useLanguage();

  // Pick deterministic affirmation for today based on day of the year
  const defaultIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % PCOS_AFFIRMATIONS.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pcosense_favorite_affirmations');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const currentAffirmation = PCOS_AFFIRMATIONS[currentIndex];
  const isFavorited = Array.isArray(favorites) && Boolean(currentAffirmation?.id) && favorites.includes(currentAffirmation.id);

  // Cycle to next affirmation
  const handleNext = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentIndex((prev) => (prev + 1) % PCOS_AFFIRMATIONS.length);
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    setFavorites((prev) => {
      const updated = isFavorited
        ? prev.filter((id) => id !== currentAffirmation.id)
        : [...prev, currentAffirmation.id];
      try {
        localStorage.setItem('pcosense_favorite_affirmations', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const textToCopy = `"${isTelugu ? currentAffirmation.textTe : currentAffirmation.textEn}" — PCOSense Affirmation`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  // Read aloud via Web Speech API
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isTelugu ? currentAffirmation.textTe : currentAffirmation.textEn;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.lang = isTelugu ? 'te-IN' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-amber-50/50 dark:from-slate-900 dark:via-teal-950/40 dark:to-slate-900 border border-teal-200/80 dark:border-teal-800/60 p-5 sm:p-6 shadow-sm transition-all duration-300 ${className}`}
      id="daily-affirmation-card"
    >
      {/* Background Decorative Floral / Sun Accents */}
      <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-teal-200/30 dark:bg-teal-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-amber-200/30 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 border-b border-teal-100/80 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shadow-2xs">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  {isTelugu ? 'నేటి సానుకూల సందేశం' : 'Affirmation of the Day'}
                </h3>
                <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold border border-teal-200 dark:border-teal-800">
                  {isTelugu ? currentAffirmation.categoryLabelTe : currentAffirmation.categoryLabelEn}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu ? 'PCOS మానసిక ఆరోగ్యం & శరీర సానుకూలత' : 'PCOS Mental Health & Body Kindness'}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isSpeaking
                  ? 'bg-teal-600 text-white animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/40'
              }`}
              title={isSpeaking ? 'Stop Voice' : 'Read Aloud'}
              aria-label="Read affirmation aloud"
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isFavorited
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800'
              }`}
              title={isFavorited ? 'Saved in Favorites' : 'Save to Favorites'}
              aria-label="Save to favorites"
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
              title="Copy text"
              aria-label="Copy affirmation text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors group"
              title="Next Affirmation"
              aria-label="Next affirmation"
            >
              <RotateCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Affirmation Quote Body with Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAffirmation.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <Quote className="h-6 w-6 text-teal-400/80 dark:text-teal-500/40 shrink-0 rotate-180 -mt-1" />
              <div className="space-y-1.5">
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed italic">
                  "{isTelugu ? currentAffirmation.textTe : currentAffirmation.textEn}"
                </p>
                <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                  — {isTelugu ? currentAffirmation.authorTe : currentAffirmation.authorEn}
                </div>
              </div>
            </div>

            {/* Mindful Micro-Action Prompt */}
            <div className="flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-3 rounded-2xl border border-teal-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">
                  <strong className="text-slate-800 dark:text-white font-semibold">
                    {isTelugu ? 'నేటి చిట్కా: ' : 'Mindful Practice: '}
                  </strong>
                  {isTelugu ? currentAffirmation.actionPromptTe : currentAffirmation.actionPromptEn}
                </span>
              </div>

              {onAskAI && (
                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      isTelugu
                        ? `PCOS లో మానసిక ఒత్తిడిని తగ్గించి శరీరం పట్ల సానుభూతి పెంచేందుకు మరిన్ని చిట్కాలు ఇవ్వండి.`
                        : `Share mindfulness and stress-reduction tips for managing PCOS anxiety and body image.`
                    )
                  }
                  className="shrink-0 text-[10px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{isTelugu ? 'AI తో మాట్లాడండి' : 'Ask AI'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
