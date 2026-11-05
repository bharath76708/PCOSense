import React, { useState } from 'react';
import {
  Play,
  Film,
  Sparkles,
  Heart,
  Activity,
  Apple,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Globe,
  AlertTriangle,
  Flame,
  Sun
} from 'lucide-react';
import { useLanguage } from '../translations';
import { YouTubePlayer } from './YouTubePlayer';

interface EducationalVideoItem {
  id: string;
  topicTitleEn: string;
  topicTitleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  teluguVideoId: string;
  teluguTitle: string;
  teluguChannel: string;
  englishVideoId: string;
  englishTitle: string;
  englishChannel: string;
  icon: React.ElementType;
}

export const EDUCATIONAL_TOPICS: EducationalVideoItem[] = [
  {
    id: 'what-is-pcos',
    topicTitleEn: '1. What is PCOS?',
    topicTitleTe: '1. PCOS అంటే ఏమిటి?',
    descriptionEn: 'Clear medical explanation of polycystic ovary syndrome, hormonal imbalances, and why it is manageable.',
    descriptionTe: 'పాలీసిస్టిక్ ఓవరీ సిండ్రోమ్ (PCOS) అంటే ఏమిటి? హార్మోన్ల అసమతుల్యత మరియు సహజ నివారణ మార్గాలు.',
    teluguVideoId: 'pDgQsVXECW8',
    teluguTitle: 'PCOD Problem Solution In Telugu | Symptoms, Diet & Naturopathy',
    teluguChannel: 'Dr. Manthena Official',
    englishVideoId: 'IvbjjJdKWTg',
    englishTitle: 'Understanding PCOS | 3D Medical Animation',
    englishChannel: 'Dr. Paulien Moyaert (Osmosis Clinical)',
    icon: Heart
  },
  {
    id: 'pcos-symptoms',
    topicTitleEn: '2. PCOS Symptoms',
    topicTitleTe: '2. PCOS లక్షణాలు',
    descriptionEn: 'Recognizing early symptoms: irregular periods, acne breakouts, hirsutism, and metabolic weight shifts.',
    descriptionTe: 'పీరియడ్స్ ఆలస్యం, అవాంఛిత రోమాలు, మొటిమలు, మరియు వేగంగా బరువు పెరిగే ప్రారంభ లక్షణాల వివరణ.',
    teluguVideoId: 'YqIWYcWYUmg',
    teluguTitle: 'PCOS PCOD Exercises & Diet to Reduce Period Problems in Telugu',
    teluguChannel: 'Dr. Manthena Official',
    englishVideoId: 'jIPYtmIxFug',
    englishTitle: 'PCOS Warning Signs, Symptoms & Seed Cycling Strategies',
    englishChannel: 'Ryan Fernando (Sports & Clinical Nutritionist)',
    icon: Activity
  },
  {
    id: 'pcos-risks',
    topicTitleEn: '3. PCOS Risks / Risk Factors',
    topicTitleTe: '3. PCOS రిస్కులు & ప్రమాద కారకాలు',
    descriptionEn: 'Understanding long-term risks: insulin resistance, prediabetes, hormonal hypertension, and fertility factors.',
    descriptionTe: 'ఇన్సులిన్ నిరోధకత, మధుమేహం రిస్క్, అండోత్పత్తి మరియు దీర్ఘకాలిక ఆరోగ్య ప్రమాదాల నివారణ.',
    teluguVideoId: 'DmMg1YwoUkQ',
    teluguTitle: 'Cure PCOS, PCOD Problem Permanently in 7 Steps | Insulin & Diet',
    teluguChannel: 'HEALTH MANTRA (Dr. Manthena Raju)',
    englishVideoId: 'd7Xd7b471tM',
    englishTitle: 'How to Balance Your Plate for PCOS - Insulin Resistance & Metabolic Risk',
    englishChannel: 'PCOS Weight Loss (Clinical Nutrition)',
    icon: AlertTriangle
  },
  {
    id: 'daily-healing',
    topicTitleEn: '4. Daily Healing / Daily Wellness',
    topicTitleTe: '4. రోజువారీ నివారణ & వెల్‌నెస్',
    descriptionEn: 'Actionable daily routines: restorative pelvic yoga, stress reduction, and endocrine-balancing nutrition.',
    descriptionTe: 'నెలసరి క్రమబద్ధీకరణ కోసం రోజువారీ 15 నిమిషాల సులువైన యోగా, వాకింగ్ మరియు ఒత్తిడి తగ్గింపు రొటీన్లు.',
    teluguVideoId: '-p6cOV4TfuE',
    teluguTitle: 'PCOS తగ్గి Periods Natural గా రావటానికి solution ఈ video లో',
    teluguChannel: 'Healthyday Yoga Telugu',
    englishVideoId: 'sTANio_2E0Q',
    englishTitle: '20 min Full Body Stretch & Yoga for Stress & Endocrine Balance',
    englishChannel: 'MadFit',
    icon: Sun
  }
];

interface IntroPCOSenseVideoProps {
  className?: string;
}

export const IntroPCOSenseVideo: React.FC<IntroPCOSenseVideoProps> = ({ className = '' }) => {
  const { isTelugu } = useLanguage();

  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'te' | 'en'>(() => isTelugu ? 'te' : 'en');

  const currentTopic = EDUCATIONAL_TOPICS[activeTopicIndex] || EDUCATIONAL_TOPICS[0];
  const TopicIcon = currentTopic.icon;

  const currentVideoId = selectedLanguage === 'te' ? currentTopic.teluguVideoId : currentTopic.englishVideoId;
  const currentVideoTitle = selectedLanguage === 'te' ? currentTopic.teluguTitle : currentTopic.englishTitle;
  const currentChannelName = selectedLanguage === 'te' ? currentTopic.teluguChannel : currentTopic.englishChannel;

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all ${className}`}
      id="intro-pcosense-video-section"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 mb-2">
            <Film className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isTelugu ? 'PCOS విద్యా వీడియోలు • 4 ముఖ్య విభాగాలు' : 'PCOS Educational Videos • 4 Core Topics'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
            {isTelugu
              ? 'PCOS అవగాహన వీడియోలు: తెలుగు & ఇంగ్లీష్'
              : 'PCOS Educational Masterclasses: Telugu & English'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {isTelugu
              ? 'PCOS అంటే ఏమిటి, లక్షణాలు, ప్రమాదాలు మరియు రోజువారీ నివారణ వీడియోలను మీరు కోరుకున్న భాషలో ప్రత్యక్షంగా చూడండి.'
              : 'Explore verified clinical videos on What is PCOS, Symptoms, Health Risks, and Daily Healing. Toggle between Telugu and English anytime.'}
          </p>
        </div>

        {/* Global Language Switcher for Current Video */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSelectedLanguage('te')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedLanguage === 'te'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="video-lang-telugu-btn"
            title="Watch in Telugu"
          >
            <span>🇮🇳</span>
            <span>తెలుగు వీడియోలు (Telugu)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('en')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedLanguage === 'en'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="video-lang-english-btn"
            title="Watch in English"
          >
            <span>🇬🇧</span>
            <span>English Videos</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
            <YouTubePlayer
              videoId={currentVideoId}
              title={currentVideoTitle}
              autoPlay={false}
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedLanguage === 'te'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                }`}>
                  {selectedLanguage === 'te' ? '🇮🇳 తెలుగు (Telugu Audio)' : '🇬🇧 English (English Audio)'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Channel: <strong>{currentChannelName}</strong>
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                {currentVideoTitle}
              </h3>
            </div>

            {/* Quick in-player language switch buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLanguage('te')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedLanguage === 'te'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                🇮🇳 తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedLanguage === 'en'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        {/* Right: 4 Educational Topics Selection */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="h-4 w-4 text-teal-600" />
              <span>{isTelugu ? 'వీడియో విషయాలు ఎంచుకోండి' : 'Select Educational Topic:'}</span>
            </span>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
              4 / 4 {isTelugu ? 'వీడియోలు సిద్ధం' : 'Ready to Stream'}
            </span>
          </div>

          <div className="space-y-3">
            {EDUCATIONAL_TOPICS.map((topic, idx) => {
              const Icon = topic.icon;
              const isSelected = activeTopicIndex === idx;

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-sm ring-1 ring-teal-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => setActiveTopicIndex(idx)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {isTelugu ? topic.topicTitleTe : topic.topicTitleEn}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {isTelugu ? topic.descriptionTe : topic.descriptionEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two language buttons for each video card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isTelugu ? 'భాషను ఎంచుకోండి:' : 'Language:'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicIndex(idx);
                          setSelectedLanguage('te');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected && selectedLanguage === 'te'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                        }`}
                        title="Watch Telugu video"
                      >
                        <span>🇮🇳</span>
                        <span>తెలుగు (Telugu)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicIndex(idx);
                          setSelectedLanguage('en');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected && selectedLanguage === 'en'
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                        }`}
                        title="Watch English video"
                      >
                        <span>🇬🇧</span>
                        <span>English</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical educational disclaimer note */}
          <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
            <span>
              {isTelugu
                ? 'అన్ని వీడియోలు ధృవీకరించబడిన వైద్యులు మరియు ప్రముఖ యోగా నిపుణుల నుండి సేకరించబడినవి.'
                : 'All videos are verified clinical education sessions from certified medical doctors and top wellness instructors.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
