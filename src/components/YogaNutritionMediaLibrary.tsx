import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Film,
  Utensils,
  Activity,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Link2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
  Heart,
  X,
  Globe,
  Tv
} from 'lucide-react';
import { YouTubePlayer } from './YouTubePlayer';
import { useLanguage } from '../translations';
import { getStoredYogaVideos, saveYogaVideosToStorage, fetchYogaVideosFromFirestore } from '../services/yogaService';
import { YogaVideoItem } from '../types';

export interface MediaVideoItem {
  id: string;
  title: string;
  titleTe?: string;
  description: string;
  category: string;
  type: 'yoga' | 'nutrition';
  youtubeUrl: string;
  videoId: string;
  duration: string;
  intensity?: 'Gentle' | 'Moderate' | 'Restorative';
  benefits: string[];
  instructor?: string;
  channelName?: string;
  language?: 'en' | 'te';
  isCustom?: boolean;
}

const DEFAULT_NUTRITION_VIDEOS: MediaVideoItem[] = [
  // --- TELUGU NUTRITION & MASTERCLASSES (Top YouTubers) ---
  {
    id: 'nut-vid-te-1',
    title: 'PCOD Problem Solution In Telugu | Symptoms, Diet & Naturopathy | Manthena Satyanarayana Raju',
    titleTe: 'PCOD సమస్యకు పూర్తి ఆహార పరిష్కారం | డాక్టర్ మంతెన సత్యనారాయణ రాజు',
    description: 'Dr. Manthena Satyanarayana Raju explains natural salt-free low-GI nutrition, raw sprouts, and hydration principles to reverse ovarian cysts.',
    category: 'PCOS Diet & Naturopathy',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=pDgQsVXECW8',
    videoId: 'pDgQsVXECW8',
    duration: '20 mins',
    intensity: 'Gentle',
    benefits: ['Raw foods and sprouted lentils for insulin sensitivity', 'Natural cell detoxification', 'Reverses menstrual irregularity'],
    instructor: 'Dr Manthena Satyanarayana Raju',
    channelName: 'Dr Manthena Satyanarayana Raju',
    language: 'te'
  },
  {
    id: 'nut-vid-te-2',
    title: 'PCOS Causes, Natural Foods & Diet for Regular Periods | Healthyday Yoga Telugu',
    titleTe: 'PCOS సహజ ఆహారాలు & రుతుచక్ర క్రమబద్ధీకరణ | హెల్తీడే యోగా తెలుగు',
    description: 'Nutritional breakdown of seed cycling, fiber-rich whole grains, and gut health drinks by Healthyday Yoga Telugu for hormonal balance.',
    category: 'Beverages & Seeds',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=-p6cOV4TfuE',
    videoId: '-p6cOV4TfuE',
    duration: '16 mins',
    intensity: 'Gentle',
    benefits: ['Low glycemic load foods', 'Prebiotic fiber for gut microbiome', 'Natural hormone stabilization'],
    instructor: 'Healthyday Yoga Telugu',
    channelName: 'Healthyday Yoga Telugu',
    language: 'te'
  },
  {
    id: 'nut-vid-te-3',
    title: 'Cure PCOS, PCOD Problem Permanently in 7 Steps | Dr Manthena Satyanarayana Raju',
    titleTe: 'PCOS / PCOD సమస్యను శాశ్వతంగా తగ్గించే 7 ఆహార సూత్రాలు | డాక్టర్ మంతెన సత్యనారాయణ రాజు',
    description: 'Masterclass on daily dietary habits, water intake routine, and low-glycemic vegetable juices to heal insulin resistance in PCOS.',
    category: 'Gut Health & Detox',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=DmMg1YwoUkQ',
    videoId: 'DmMg1YwoUkQ',
    duration: '18 mins',
    intensity: 'Gentle',
    benefits: ['Stabilizes insulin response', 'Promotes healthy ovarian follicle release', 'Zero artificial stimulants'],
    instructor: 'Dr Manthena Satyanarayana Raju',
    channelName: 'Dr Manthena Satyanarayana Raju',
    language: 'te'
  },

  // --- ENGLISH NUTRITION MASTERCLASSES ---
  {
    id: 'nut-vid-1',
    title: 'Top 3 Anti-Inflammatory PCOS Breakfast Ideas',
    titleTe: 'యాంటీ-ఇన్‌ఫ్లమేటరీ PCOS బ్రేక్‌ఫాస్ట్ ప్రిపరేషన్',
    description: 'Easy, low-glycemic breakfast meals designed to balance insulin, regulate morning cortisol, and sustain energy without sugar crashes.',
    category: 'Breakfast',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=Ljpfjiotxjo',
    videoId: 'Ljpfjiotxjo',
    duration: '12 mins',
    intensity: 'Gentle',
    benefits: ['Low glycemic response', 'High soluble fiber for gut microbiome', 'Morning satiety without insulin spike'],
    instructor: 'PCOS Nutrition Specialist',
    channelName: 'Clinical Nutrition',
    language: 'en'
  },
  {
    id: 'nut-vid-2',
    title: 'PCOS Seed Cycling & Hormone Balancing Strategies',
    titleTe: 'సీడ్ సైక్లింగ్ & హార్మోన్ బ్యాలెన్సింగ్ తయారీ',
    description: 'How to practice seed cycling with pumpkin, flax, sunflower, and sesame seeds to balance estrogen, progesterone, and reduce androgens.',
    category: 'Beverages & Seeds',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=jIPYtmIxFug',
    videoId: 'jIPYtmIxFug',
    duration: '8 mins',
    intensity: 'Gentle',
    benefits: ['Zinc & lignan phytoestrogen balancing', 'Reduces excess sebum and hirsutism', 'Supports regular luteal phase'],
    instructor: 'Ryan Fernando',
    channelName: 'Ryan Fernando Nutrition',
    language: 'en'
  },
  {
    id: 'nut-vid-3',
    title: '5 PCOS Friendly Easy Healthy Dinners',
    titleTe: '15 నిమిషాల్లో హై-ప్రోటీన్ లో-GI రాత్రి భోజనం',
    description: 'Quick, delicious anti-inflammatory dinner recipes designed to stabilize glucose through the night and promote restful slow-wave sleep.',
    category: 'Dinner',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=cpJavLOoQos',
    videoId: 'cpJavLOoQos',
    duration: '15 mins',
    intensity: 'Gentle',
    benefits: ['Magnesium for restorative slow-wave sleep', 'Slow-release complex carbohydrates', 'No midnight hypoglycemia'],
    instructor: 'Molly Thompson',
    channelName: 'What Molly Made',
    language: 'en'
  },
  {
    id: 'nut-vid-4',
    title: 'How to Balance Your Plate for PCOS & Gut Health',
    titleTe: 'ఈస్ట్రోజెన్ జీవక్రియ కోసం గట్ మైక్రోబయోమ్ ఆహారాలు',
    description: 'Clinical breakdown of macronutrient ratios and gut microbiome foods to support liver Phase-2 detoxification and estrogen balance.',
    category: 'Gut Health',
    type: 'nutrition',
    youtubeUrl: 'https://www.youtube.com/watch?v=d7Xd7b471tM',
    videoId: 'd7Xd7b471tM',
    duration: '14 mins',
    intensity: 'Gentle',
    benefits: ['Promotes hepatic Phase-2 detoxification', 'Balances estrogen dominance', 'Prevents persistent bloating'],
    instructor: 'PCOS Dietitian',
    channelName: 'PCOS Weight Loss',
    language: 'en'
  }
];

interface YogaNutritionMediaLibraryProps {
  defaultType?: 'yoga' | 'nutrition' | 'all';
  allowAdd?: boolean;
  className?: string;
}

export const YogaNutritionMediaLibrary: React.FC<YogaNutritionMediaLibraryProps> = ({
  defaultType = 'all',
  allowAdd = true,
  className = ''
}) => {
  const { isTelugu } = useLanguage();

  const [activeTab, setActiveTab] = useState<'yoga' | 'nutrition' | 'all'>(defaultType);
  // Video Language selection: 'all' | 'en' | 'te'
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'te'>(() => {
    return isTelugu ? 'te' : 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load videos from yogaService and local nutrition videos
  const [yogaVideos, setYogaVideos] = useState<YogaVideoItem[]>(() => getStoredYogaVideos());

  useEffect(() => {
    let isMounted = true;
    fetchYogaVideosFromFirestore().then(fetched => {
      if (isMounted && fetched && fetched.length > 0) {
        setYogaVideos(fetched.filter(v => v.isActive));
      }
    }).catch(err => {
      console.warn('Could not fetch yoga videos from Firestore:', err);
    });

    const handleUpdate = () => {
      setYogaVideos(getStoredYogaVideos());
    };

    window.addEventListener('pcosense_yoga_videos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('pcosense_yoga_videos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [nutritionVideos, setNutritionVideos] = useState<MediaVideoItem[]>(() => {
    try {
      const raw = localStorage.getItem('pcosense_nutrition_videos');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure Telugu nutrition items are present
          const hasTelugu = parsed.some((p: any) => p.language === 'te' || p.id?.includes('te'));
          if (!hasTelugu) {
            const teluguNut = DEFAULT_NUTRITION_VIDEOS.filter(v => v.language === 'te');
            const merged = [...teluguNut, ...parsed];
            localStorage.setItem('pcosense_nutrition_videos', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem('pcosense_nutrition_videos', JSON.stringify(DEFAULT_NUTRITION_VIDEOS));
    return DEFAULT_NUTRITION_VIDEOS;
  });

  // Track completed videos in local storage
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('pcosense_media_completed');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Form state for adding custom video via URL
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'yoga' | 'nutrition'>(defaultType === 'nutrition' ? 'nutrition' : 'yoga');
  const [formCategory, setFormCategory] = useState('PCOS Movement');
  const [formDuration, setFormDuration] = useState('15 mins');
  const [formBenefits, setFormBenefits] = useState('Lowers cortisol, enhances pelvic ovarian blood flow');
  const [formLanguage, setFormLanguage] = useState<'te' | 'en'>(isTelugu ? 'te' : 'en');
  const [formChannel, setFormChannel] = useState('');

  // Convert yogaService items to unified MediaVideoItem
  const unifiedYogaVideos: MediaVideoItem[] = useMemo(() => {
    return yogaVideos.map(y => {
      const vidId = y.youtubeVideoId || (y as any).youtubeId || '';
      return {
        id: y.id,
        title: y.title,
        titleTe: y.titleTe,
        description: y.description,
        category: y.category,
        type: 'yoga' as const,
        youtubeUrl: `https://www.youtube.com/watch?v=${vidId}`,
        videoId: vidId,
        duration: y.duration,
        intensity: (y as any).intensity || y.difficulty,
        benefits: y.benefits,
        instructor: y.channelName || (y as any).instructor,
        channelName: y.channelName || (y as any).instructor,
        language: y.language || (y.id.includes('-te-') ? 'te' : 'en')
      };
    });
  }, [yogaVideos]);

  const allVideos: MediaVideoItem[] = useMemo(() => {
    let list: MediaVideoItem[] = [];
    if (activeTab === 'yoga') list = unifiedYogaVideos;
    else if (activeTab === 'nutrition') list = nutritionVideos;
    else list = [...unifiedYogaVideos, ...nutritionVideos];

    // Filter by language if selected
    if (selectedLanguage === 'en') {
      return list.filter(v => v.language === 'en');
    }
    if (selectedLanguage === 'te') {
      return list.filter(v => v.language === 'te');
    }
    return list;
  }, [activeTab, unifiedYogaVideos, nutritionVideos, selectedLanguage]);

  // Selected video currently in player
  const [selectedVideo, setSelectedVideo] = useState<MediaVideoItem | null>(() => allVideos[0] || null);

  // When language or tab changes, keep selectedVideo in sync with matching language
  const handleLanguageSelect = (lang: 'all' | 'en' | 'te') => {
    setSelectedLanguage(lang);
    let candidateList = activeTab === 'yoga' ? unifiedYogaVideos : activeTab === 'nutrition' ? nutritionVideos : [...unifiedYogaVideos, ...nutritionVideos];
    if (lang === 'en') {
      candidateList = candidateList.filter(v => v.language === 'en');
    } else if (lang === 'te') {
      candidateList = candidateList.filter(v => v.language === 'te');
    }
    if (candidateList.length > 0) {
      setSelectedVideo(candidateList[0]);
    }
  };

  useEffect(() => {
    if (allVideos.length > 0) {
      if (!selectedVideo || !allVideos.some(v => v.id === selectedVideo.id)) {
        setSelectedVideo(allVideos[0]);
      }
    }
  }, [allVideos, selectedVideo]);

  // Categories for filter chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    allVideos.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [allVideos]);

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return allVideos.filter(v => {
      const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allVideos, selectedCategory, searchQuery]);

  const toggleCompleted = (id: string) => {
    const safeIds = Array.isArray(completedIds) ? completedIds : [];
    const updated = safeIds.includes(id)
      ? safeIds.filter(i => i !== id)
      : [...safeIds, id];
    setCompletedIds(updated);
    try {
      localStorage.setItem('pcosense_media_completed', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to extract clean youtube ID
  const extractYouTubeId = (url: string): string => {
    const u = url || '';
    if (!u) return 'dQw4w9WgXcQ';
    if (u.includes('v=')) {
      return u.split('v=')[1].split('&')[0];
    }
    if (u.includes('youtu.be/')) {
      return u.split('youtu.be/')[1].split('?')[0];
    }
    if (u.includes('embed/')) {
      return u.split('embed/')[1].split('?')[0];
    }
    return u.trim();
  };

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl || !formTitle) return;

    const ytId = extractYouTubeId(formUrl);
    const newId = `custom-vid-${Date.now()}`;
    const authorName = formChannel.trim() || (formLanguage === 'te' ? 'Telugu Health & Yoga' : 'Clinical Curator');
    const newVideo: MediaVideoItem = {
      id: newId,
      title: formTitle,
      description: formBenefits,
      category: formCategory,
      type: formType,
      youtubeUrl: formUrl,
      videoId: ytId,
      duration: formDuration || '15 mins',
      intensity: 'Gentle',
      benefits: formBenefits.split(',').map(s => s.trim()).filter(Boolean),
      instructor: authorName,
      channelName: authorName,
      language: formLanguage,
      isCustom: true
    };

    if (formType === 'nutrition') {
      const updated = [newVideo, ...nutritionVideos];
      setNutritionVideos(updated);
      try {
        localStorage.setItem('pcosense_nutrition_videos', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    } else {
      const yogaItem: YogaVideoItem = {
        id: newId,
        title: formTitle,
        category: formCategory as any,
        duration: formDuration || '15 mins',
        difficulty: 'Gentle',
        youtubeVideoId: ytId,
        description: formBenefits,
        benefits: formBenefits.split(',').map(s => s.trim()).filter(Boolean),
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        language: formLanguage,
        channelName: authorName,
        isActive: true
      };
      const updated = [yogaItem, ...yogaVideos];
      setYogaVideos(updated);
      saveYogaVideosToStorage(updated);
    }

    setSelectedVideo(newVideo);
    setSelectedLanguage(formLanguage);
    setIsAddModalOpen(false);
    setFormUrl('');
    setFormTitle('');
    setFormChannel('');
  };

  return (
    <div className={`space-y-6 ${className}`} id="yoga-nutrition-media-library-root">
      {/* Media Header & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <Film className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isTelugu ? 'క్లినికల్ యోగా & న్యూట్రిషన్ మీడియా లైబ్రరీ' : 'Clinical Video & Masterclass Player'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTelugu
              ? 'మంతెన సత్యనారాయణ రాజు, హెల్తీడే యోగా తెలుగు వంటి ప్రముఖుల వీడియోలు మరియు ఇంగ్లీష్ క్లినికల్ రొటీన్లు.'
              : 'Stream verified English & Telugu masterclasses from Dr. Manthena Satyanarayana Raju, Healthyday Yoga Telugu, and clinical practitioners.'}
          </p>
        </div>

        {/* Action Controls: Language Switcher Buttons + Media Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dedicated 🇮🇳 Telugu Videos vs 🇬🇧 English Videos Switcher Buttons */}
          <div className="inline-flex p-1.5 rounded-2xl bg-teal-50/90 dark:bg-slate-800/90 border border-teal-200/80 dark:border-teal-800 text-xs font-bold shadow-2xs gap-1">
            <button
              type="button"
              onClick={() => handleLanguageSelect('te')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                selectedLanguage === 'te'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-white/60 dark:hover:bg-slate-700'
              }`}
              id="media-lang-telugu-btn"
              title="తెలుగు యోగా & న్యూట్రిషన్ వీడియోలు: Manthena Satyanarayana Raju, Healthyday Yoga Telugu"
            >
              <span>🇮🇳</span>
              <span>Telugu Videos (తెలుగు)</span>
            </button>

            <button
              type="button"
              onClick={() => handleLanguageSelect('en')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                selectedLanguage === 'en'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-white/60 dark:hover:bg-slate-700'
              }`}
              id="media-lang-english-btn"
              title="English Yoga Videos: Yoga With Adriene, Brett Larkin"
            >
              <span>🇬🇧</span>
              <span>English Videos</span>
            </button>
          </div>

          {/* Media Category Tabs (Yoga / Nutrition) */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setSelectedCategory('All'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isTelugu ? 'అన్నీ' : 'All Types'}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('yoga'); setSelectedCategory('All'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'yoga'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'యోగా & వ్యాయామాలు' : 'Yoga & Movement'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('nutrition'); setSelectedCategory('All'); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'nutrition'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ఆహారం & న్యూట్రిషన్' : 'Food & Cooking'}</span>
            </button>
          </div>

          {allowAdd && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isTelugu ? 'యూట్యూబ్ లింక్ జోడించండి' : 'Add YouTube Video'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Theater View: Embedded Player on Left, Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedVideo ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              <YouTubePlayer
                videoId={selectedVideo.videoId}
                title={selectedVideo.title}
                autoPlay={false}
              />

              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {selectedVideo.type === 'yoga' ? 'Movement / Yoga' : 'Nutrition Masterclass'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      selectedVideo.language === 'te'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                    }`}>
                      {selectedVideo.language === 'te' ? 'తెలుగు (Telugu)' : 'English'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {selectedVideo.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{selectedVideo.duration}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedVideo.videoId ? `https://www.youtube.com/watch?v=${selectedVideo.videoId}` : (selectedVideo.youtubeUrl || '#')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Open on YouTube in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{isTelugu ? 'యూట్యూబ్‌లో' : 'YouTube'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleCompleted(selectedVideo.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        Array.isArray(completedIds) && completedIds.includes(selectedVideo.id)
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{Array.isArray(completedIds) && completedIds.includes(selectedVideo.id) ? 'Completed' : 'Mark as Completed'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                    {isTelugu && selectedVideo.titleTe ? selectedVideo.titleTe : selectedVideo.title}
                  </h4>
                  {(selectedVideo.channelName || selectedVideo.instructor) && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Tv className="h-3 w-3" />
                        <span>Channel / Doctor: {selectedVideo.channelName || selectedVideo.instructor}</span>
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedVideo.description}
                </p>

                {selectedVideo.benefits && selectedVideo.benefits.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Clinical Therapeutic Benefits:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVideo.benefits.map((b, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
              Select a video from the library to play
            </div>
          )}
        </div>

        {/* Right: Search, Categories & Video Playlist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search bar & Category filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isTelugu ? 'వీడియోలను శోధించండి...' : 'Search routines, recipes, topics...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs max-h-[540px] overflow-y-auto space-y-2">
            <div className="px-2 py-1 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedLanguage === 'te' ? 'తెలుగు వీడియోలు' : selectedLanguage === 'en' ? 'English Videos' : 'All Videos'}: {filteredVideos.length} Items
              </span>
              <span>{completedIds.length} Completed</span>
            </div>

            {filteredVideos.map(vid => {
              const isCurrent = selectedVideo?.id === vid.id;
              const isDone = Array.isArray(completedIds) && completedIds.includes(vid.id);

              return (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 border ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 shadow-xs ring-1 ring-teal-500/30'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Thumbnail snippet */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img
                      src={`https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white fill-current" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        vid.language === 'te'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                      }`}>
                        {vid.language === 'te' ? 'TE' : 'EN'}
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 truncate">
                        {vid.channelName || vid.category}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">• {vid.duration}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {isTelugu && vid.titleTe ? vid.titleTe : vid.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {vid.description}
                    </p>
                  </div>

                  {isDone && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                </div>
              );
            })}

            {filteredVideos.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No videos match your search or filter. Try switching between English and Telugu!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <Link2 className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Add YouTube Clinical Video
                  </h4>
                  <p className="text-xs text-slate-400">
                    Paste any YouTube URL to stream it directly inside PCOSense.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Video Playlist Language *
                  </label>
                  <select
                    value={formLanguage}
                    onChange={e => setFormLanguage(e.target.value as 'te' | 'en')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold"
                  >
                    <option value="te">తెలుగు ప్లేలిస్ట్ (Telugu Playlist)</option>
                    <option value="en">English Playlist</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Channel / YouTuber Name
                  </label>
                  <input
                    type="text"
                    value={formChannel}
                    onChange={e => setFormChannel(e.target.value)}
                    placeholder="e.g. Dr Manthena Satyanarayana Raju or Healthyday Yoga"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  YouTube Video Link or ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=DmMg1YwoUkQ or youtu.be/xyz"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Cortisol-Lowering Yoga Flow"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Media Type
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="yoga">Yoga & Exercise Movement</option>
                    <option value="nutrition">PCOS Food & Cooking</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    placeholder="e.g. Low Impact, Breakfast, Seed Cycling"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                  placeholder="e.g. 15 mins"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Key PCOS Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formBenefits}
                  onChange={e => setFormBenefits(e.target.value)}
                  placeholder="e.g. Insulin sensitization, pelvic blood flow, anti-inflammatory"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Add Video to {formLanguage === 'te' ? 'Telugu' : 'English'} Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
