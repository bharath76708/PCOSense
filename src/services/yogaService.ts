/**
 * PCOSense - Yoga & Exercise Module Service
 * Curated YouTube video embeds for PCOS symptom management,
 * cortisol reduction, pelvic circulation, and gentle metabolic movement.
 */

import { YogaVideoItem } from '../types';
import { db, doc, setDoc, deleteDoc, collection, getDocs } from '../lib/firebase';
import { handleFirestoreError, OperationType } from './firestoreService';

const YOGA_VIDEOS_STORAGE_KEY = 'pcosense_yoga_videos_db';

export const INITIAL_YOGA_VIDEOS: YogaVideoItem[] = [
  // --- TELUGU PLAYLIST (Top YouTubers: Manthena Satyanarayana Raju & Healthyday Yoga Telugu) ---
  {
    id: 'yoga-te-1',
    title: '15 Min Daily Yoga for PCOS/PCOD Relief | Balance Hormones Naturally (Telugu)',
    titleTe: '15 నిమిషాల PCOS యోగా: హార్మోన్ల సమతుల్యత & రుతుక్రమ పరిష్కారం',
    description: 'Guided therapeutic yoga poses for irregular periods, pelvic congestion, and natural hormonal balance by Healthyday Yoga Telugu.',
    descriptionTe: 'PCOS సమస్యల నివారణ, క్రమబద్ధమైన పీరియడ్స్ మరియు హార్మోన్ల సమతుల్యత కోసం హెల్తీడే యోగా తెలుగు వారి ప్రత్యేక యోగాసనాలు.',
    youtubeVideoId: 'G2KmINshKgk',
    duration: '15 min',
    category: 'Yoga',
    difficulty: 'Beginner',
    thumbnail: 'https://img.youtube.com/vi/G2KmINshKgk/hqdefault.jpg',
    benefits: ['Baddha Konasana for pelvic blood circulation', 'Stimulates sluggish ovaries', 'Reduces abdominal cramping'],
    benefitsTe: ['పెల్విక్ రక్త ప్రసరణను వేగవంతం చేస్తుంది', 'అండాశయాల పనితీరు మెరుగుపడుతుంది', 'కటి నొప్పిని తగ్గిస్తుంది'],
    language: 'te',
    channelName: 'Healthyday Yoga Telugu',
    isActive: true
  },
  {
    id: 'yoga-te-2',
    title: 'Cure PCOS, PCOD Problem Permanently in 7 Steps | Dr Manthena Satyanarayana Raju',
    titleTe: 'PCOS / PCOD సమస్యను శాశ్వతంగా తగ్గించే 7 మార్గాలు | డాక్టర్ మంతెన సత్యనారాయణ రాజు',
    description: 'Dr. Manthena Satyanarayana Raju explains natural lifestyle, water therapy, and diet changes to reverse ovarian cysts and insulin resistance naturally.',
    descriptionTe: 'డాక్టర్ మంతెన సత్యనారాయణ రాజు గారి ప్రకృతి చికిత్సా విధానం ద్వారా హార్మోన్ల అసమతుల్యత, సిస్టులు మరియు PCOS నియంత్రణ.',
    youtubeVideoId: 'DmMg1YwoUkQ',
    duration: '18 min',
    category: 'PCOS-friendly Movement',
    difficulty: 'Gentle',
    thumbnail: 'https://img.youtube.com/vi/DmMg1YwoUkQ/hqdefault.jpg',
    benefits: ['Natural hormonal regulation without synthetic medications', 'Supports cellular detox', 'Reduces visceral and ovarian fat'],
    benefitsTe: ['సహజ జీవన విధానం ద్వారా హార్మోన్ల సమతుల్యత', 'శరీర డీటాక్స్ ప్రక్రియ', 'అదనపు బరువును తగ్గిస్తుంది'],
    language: 'te',
    channelName: 'Dr Manthena Satyanarayana Raju',
    isActive: true
  },
  {
    id: 'yoga-te-3',
    title: 'PCOS తగ్గి Periods Natural గా రావటానికి solution | Causes and Cure',
    titleTe: 'PCOS తగ్గి పీరియడ్స్ సహజంగా రావడానికి యోగా & జీవనశైలి మార్గాలు',
    description: 'Targeted yogic butterfly pose, bhujangasana, and deep breathing sequences by Healthyday Yoga Telugu to restore regular menstrual cycles.',
    descriptionTe: 'భట్టర్‌ఫ్లై ఆసనం, భుజంగాసనం మరియు నాడీశోధన ప్రాణాయామం ద్వారా సహజ రుతుక్రమాన్ని తిరిగి పొందండి.',
    youtubeVideoId: '-p6cOV4TfuE',
    duration: '16 min',
    category: 'Beginner Yoga',
    difficulty: 'Beginner',
    thumbnail: 'https://img.youtube.com/vi/-p6cOV4TfuE/hqdefault.jpg',
    benefits: ['Balances estrogen and progesterone', 'Reduces menstrual delay', 'Improves core endocrine stability'],
    benefitsTe: ['ఈస్ట్రోజెన్, ప్రొజెస్టిరాన్ సమతుల్యత', 'రుతుచక్రం క్రమబద్ధీకరణ', 'ఎండోక్రైన్ బలం పెరుగుతుంది'],
    language: 'te',
    channelName: 'Healthyday Yoga Telugu',
    isActive: true
  },
  {
    id: 'yoga-te-4',
    title: 'PCOS & PCOD Exercises to Reduce Period Problems & Ovarian Cysts | Dr. Manthena Official',
    titleTe: 'పీరియడ్స్ సమస్యలు & ఓవేరియన్ సిస్టులు తగ్గించే వ్యాయామాలు | డాక్టర్ మంతెన అఫీషియల్',
    description: 'Clinical yoga asanas and therapeutic pelvic movements demonstrated on Dr. Manthena Official channel for ovarian health.',
    descriptionTe: 'డాక్టర్ మంతెన అఫీషియల్ ఛానెల్ ద్వారా ఓవేరియన్ సిస్టులు మరియు హార్మోన్ల సమస్యలకు ప్రత్యేక వ్యాయామాలు.',
    youtubeVideoId: 'YqIWYcWYUmg',
    duration: '22 min',
    category: 'Yoga',
    difficulty: 'Beginner',
    thumbnail: 'https://img.youtube.com/vi/YqIWYcWYUmg/hqdefault.jpg',
    benefits: ['Pelvic floor release', 'Lowers elevated androgen production', 'Enhances insulin receptor response'],
    benefitsTe: ['కటి కండరాల సడలింపు', 'హైపర్-ఆండ్రోజెన్ తీవ్రత తగ్గింపు', 'ఇన్సులిన్ సున్నితత్వం పెరుగుతుంది'],
    language: 'te',
    channelName: 'Dr. Manthena Official',
    isActive: true
  },
  {
    id: 'yoga-te-5',
    title: 'PCOD Problem Solution In Telugu | Symptoms & Treatment | Manthena Satyanarayana Raju',
    titleTe: 'PCOD సమస్యకు పూర్తి పరిష్కారం | లక్షణాలు మరియు చికిత్సా విధానం',
    description: 'Dr. Manthena Satyanarayana Raju provides in-depth Telugu masterclass on managing symptoms, hormonal testing, and daily health habits.',
    descriptionTe: 'లక్షణాలు, ఆహార నియమాలు మరియు వ్యాయామాల ద్వారా PCOD కి సమగ్ర సహజ చికిత్స.',
    youtubeVideoId: 'pDgQsVXECW8',
    duration: '20 min',
    category: 'PCOS-friendly Movement',
    difficulty: 'Gentle',
    thumbnail: 'https://img.youtube.com/vi/pDgQsVXECW8/hqdefault.jpg',
    benefits: ['Comprehensive dietary guidance', 'Stress-reduction principles', 'Daily habit rhythm for endocrine balance'],
    benefitsTe: ['సహజ ఆహార నియమాలు', 'ఒత్తిడి నివారణ సూత్రాలు', 'దినచర్య క్రమబద్ధీకరణ'],
    language: 'te',
    channelName: 'Dr Manthena Satyanarayana Raju',
    isActive: true
  },
  {
    id: 'yoga-te-6',
    title: 'Yoga tho regular periods enduku vastaayi? | Healthyday Yoga Telugu',
    titleTe: 'యోగాతో రెగ్యులర్ పీరియడ్స్ ఎందుకు వస్తాయి? | హెల్తీడే యోగా తెలుగు',
    description: 'Scientific and experiential breakdown of how yogic stretches activate the ovaries, pitutary-ovarian axis, and regulate menstrual periods.',
    descriptionTe: 'యోగాసనాలు అండాశయాలను ఎలా ఉత్తేజితం చేస్తాయో వివరించే విజ్ఞానాత్మక విశ్లేషణ.',
    youtubeVideoId: 'ONMmS83fji8',
    duration: '14 min',
    category: 'Breathing Exercises',
    difficulty: 'Gentle',
    thumbnail: 'https://img.youtube.com/vi/ONMmS83fji8/hqdefault.jpg',
    benefits: ['Activates pituitary-gonadal signaling', 'Alleviates hypothalamic amenorrhea', 'Calms chronic nervous agitation'],
    benefitsTe: ['హైపోథాలమస్-పిట్యూటరీ యాక్సిస్ ప్రేరణ', 'రుతుక్రమ క్రమం', 'నాడీ వ్యవస్థ విశ్రాంతి'],
    language: 'te',
    channelName: 'Healthyday Yoga Telugu',
    isActive: true
  },

  // --- ENGLISH PLAYLIST (Clinical & Restorative PCOS Movement) ---
  {
    id: 'yoga-en-1',
    title: 'PCOS Yoga: 20-Minute Gentle Hormone Balancing Routine',
    titleTe: 'PCOS యోగా: 20 నిమిషాల హార్మోన్ బ్యాలెన్సింగ్ ఆసనాలు',
    description: 'Gentle restorative yoga targeting pelvic congestion, ovarian blood flow, and cortisol regulation with supported Butterfly pose and Child pose.',
    descriptionTe: 'పెల్విక్ రక్త ప్రసరణను మెరుగుపరిచి ఒత్తిడిని తగ్గించే సులువైన యోగాసనాలు.',
    youtubeVideoId: 'sTANio_2E0Q',
    duration: '20 min',
    category: 'Yoga',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600',
    benefits: ['Improves ovarian blood circulation', 'Reduces evening cortisol & stress', 'Relieves lower pelvic cramping'],
    benefitsTe: ['అండాశయాలకు రక్త ప్రసరణ మెరుగుపరుస్తుంది', 'ఒత్తిడిని తగ్గిస్తుంది', 'కటి నొప్పిని తగ్గిస్తుంది'],
    language: 'en',
    channelName: 'Yoga With Adriene',
    isActive: true
  },
  {
    id: 'yoga-en-2',
    title: 'Beginner Friendly PCOS Yoga for Ovulatory Stimulation',
    titleTe: 'బిగినర్స్ కోసం అండాల విడుదలను ప్రేరేపించే యోగా',
    description: 'Slow-paced, beginner-friendly stretches specifically curated for irregular menstrual cycles and insulin sensitivity.',
    descriptionTe: 'అసక్రమ రుతుక్రమం మరియు ఇన్సులిన్ సున్నితత్వం కోసం ప్రత్యేక యోగా వ్యాయామాలు.',
    youtubeVideoId: '4pKly2JojMw',
    duration: '15 min',
    category: 'Beginner Yoga',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    benefits: ['Low glycemic impact', 'Safe for joint stiffness', 'Promotes endocrine gland stimulation'],
    benefitsTe: ['కీళ్ల నొప్పులకు మంచిది', 'ఎండోక్రైన్ గ్రంథులను ప్రేరేపిస్తుంది'],
    language: 'en',
    channelName: 'PCOS Sisters Yoga',
    isActive: true
  },
  {
    id: 'yoga-en-3',
    title: 'Pelvic Floor Relaxation & Deep Hip Opening Stretch',
    titleTe: 'పెల్విక్ ఫ్లోర్ రిలాక్సేషన్ & హిప్ ఓపెనింగ్ స్ట్రెచ్',
    description: 'Release deep pelvic floor tension and reduce sympathetic nervous system tone using gentle Malasana and Supta Baddha Konasana variations.',
    descriptionTe: 'కటి భాగం యొక్క ఒత్తిడిని తొలగించి విశ్రాంతినిచ్చే సులువైన స్ట్రెచెస్.',
    youtubeVideoId: 'COp7BR_Dvps',
    duration: '18 min',
    category: 'Stretching',
    difficulty: 'Gentle',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
    benefits: ['Releases pelvic floor hypertonicity', 'Alleviates chronic abdominal bloating', 'Aids restful REM sleep'],
    benefitsTe: ['కడుపు ఉబ్బరాన్ని తగ్గిస్తుంది', 'మంచి నిద్రకు సహాయపడుతుంది'],
    language: 'en',
    channelName: 'Restorative Wellness',
    isActive: true
  },
  {
    id: 'yoga-en-4',
    title: 'Pranayama: 10-Minute Stress & Cortisol Reset Breathwork',
    titleTe: 'ప్రాణాయామం: 10 నిమిషాల ఒత్తిడి నివారణ శ్వాసక్రియ',
    description: 'Anulom Vilom and Bhramari breathing practices shown in clinical trials to reduce HPA-axis hyperreactivity and lower androgen triggers in PCOS.',
    descriptionTe: 'అనులోమ విలోమ మరియు భ్రామరీ ప్రాణాయామం ద్వారా హార్మోన్లను సమతుల్యం చేయండి.',
    youtubeVideoId: 'L39lbLD2IPE',
    duration: '10 min',
    category: 'Breathing Exercises',
    difficulty: 'Gentle',
    thumbnail: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600',
    benefits: ['Calms the nervous system in 5 minutes', 'Lowers sympathetic androgen surge', 'Can be done seated anywhere'],
    benefitsTe: ['5 నిమిషాల్లో నాడీ వ్యవస్థను శాంతింపజేస్తుంది', 'హైపర్-ఆండ్రోజెన్ తీవ్రతను తగ్గిస్తుంది'],
    language: 'en',
    channelName: 'Breath & Hormone Institute',
    isActive: true
  },
  {
    id: 'yoga-en-5',
    title: 'Low-Impact Cardio: Gentle PCOS Fat Burn & Glucose Clearing',
    titleTe: 'తక్కువ-ప్రభావ కార్డియో: గ్లూకోజ్ నియంత్రణ వ్యాయామాలు',
    description: 'No jumping, no high-cortisol exhaustion. Slow resistance walking and bodyweight flow designed to sensitize muscle GLUT-4 glucose transporters.',
    descriptionTe: 'దూకడం లేకుండా, గుండెపై భారం పడకుండా గ్లూకోజ్ తగ్గించే సులువైన వ్యాయామం.',
    youtubeVideoId: 'v7AYKMP6rOE',
    duration: '22 min',
    category: 'Low Impact Exercise',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600',
    benefits: ['Clears post-meal blood sugar safely', 'Zero cortisol spike compared to HIIT', 'Joint-friendly fat burning'],
    benefitsTe: ['భోజనం తర్వాత చక్కెరను తగ్గిస్తుంది', 'కార్టిసాల్ ఒత్తిడిని పెంచదు'],
    language: 'en',
    channelName: 'Gentle Cardio Works',
    isActive: true
  },
  {
    id: 'yoga-en-6',
    title: 'Mindful Indoor Walking: 15-Minute 2,000 Step Post-Meal Stride',
    titleTe: 'ఇండోర్ వాకింగ్: భోజనం తర్వాత 15 నిమిషాల నడక',
    description: 'An easy, guided indoor walking session you can do right in your living room immediately after lunch or dinner to flatten insulin spikes.',
    descriptionTe: 'ఇంట్లోనే భోజనం తర్వాత చేయగల 15 నిమిషాల సులువైన వాకింగ్ సెషన్.',
    youtubeVideoId: 'inpok4MKVLM',
    duration: '15 min',
    category: 'Walking',
    difficulty: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600',
    benefits: ['Adds 2,000 steps seamlessly', 'Decreases postprandial glucose spike by 34%', 'No equipment needed'],
    benefitsTe: ['2,000 అడుగులు వేయడానికి సులువు', 'షుగర్ లెవెల్స్ పెరగకుండా కాపాడుతుంది'],
    language: 'en',
    channelName: 'Walk At Home Daily',
    isActive: true
  },
  {
    id: 'yoga-en-7',
    title: 'Somatic Pelvic Alignment & Ovarian Circulation Flow',
    titleTe: 'సోమాటిక్ మూవ్‌మెంట్: అండాశయ రక్తప్రసరణ వ్యాయామం',
    description: 'Gentle undulating somatic movements that restore sacroiliac joint mobility, relieve lumbar stress, and balance pelvic diaphragm rhythm.',
    descriptionTe: 'నడుము నొప్పి మరియు కటి కండరాల బిగుతును తొలగించే సోమాటిక్ మూవ్‌మెంట్.',
    youtubeVideoId: 'VaoV1PrYft4',
    duration: '16 min',
    category: 'PCOS-friendly Movement',
    difficulty: 'Gentle',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    benefits: ['Alleviates lower back lumbar tension', 'Mobilizes stagnant pelvic lymphatic flow', 'Reassures autonomic nervous system'],
    benefitsTe: ['నడుము నొప్పిని తగ్గిస్తుంది', 'శోషరస ప్రసరణను పెంచుతుంది'],
    language: 'en',
    channelName: 'Somatic Therapy Flow',
    isActive: true
  }
];

const DELETED_YOGA_VIDEOS_STORAGE_KEY = 'pcosense_deleted_yoga_videos_db';

function getDeletedYogaVideoIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_YOGA_VIDEOS_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function markYogaVideoDeleted(id: string): void {
  const ids = getDeletedYogaVideoIds();
  ids.add(id);
  try {
    localStorage.setItem(DELETED_YOGA_VIDEOS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function unmarkYogaVideoDeleted(id: string): void {
  const ids = getDeletedYogaVideoIds();
  if (ids.has(id)) {
    ids.delete(id);
    try {
      localStorage.setItem(DELETED_YOGA_VIDEOS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {}
  }
}

export function getStoredYogaVideos(): YogaVideoItem[] {
  try {
    const raw = localStorage.getItem(YOGA_VIDEOS_STORAGE_KEY);
    const deletedIds = getDeletedYogaVideoIds();
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let modified = false;
        // Check if Telugu videos exist, otherwise prepend them
        const hasTelugu = parsed.some(v => v.language === 'te' || v.id.startsWith('yoga-te'));
        let workingList = [...parsed].filter(v => !deletedIds.has(v.id));
        if (!hasTelugu) {
          const teluguInitials = INITIAL_YOGA_VIDEOS.filter(v => v.language === 'te' && !deletedIds.has(v.id));
          workingList = [...teluguInitials, ...workingList];
          modified = true;
        }

        const migrated = workingList.map(v => {
          if (v.youtubeVideoId === '6fD5UssZ52k') {
            modified = true;
            return { ...v, youtubeVideoId: 'L39lbLD2IPE' };
          }
          return v;
        });

        if (modified) {
          saveYogaVideosToStorage(migrated, false);
        }
        return migrated;
      }
    }
  } catch (err) {
    console.error('Error reading yoga videos:', err);
  }
  saveYogaVideosToStorage(INITIAL_YOGA_VIDEOS, false);
  return INITIAL_YOGA_VIDEOS;
}

export function saveYogaVideosToStorage(videos: YogaVideoItem[], syncToFirestore = true): void {
  try {
    localStorage.setItem(YOGA_VIDEOS_STORAGE_KEY, JSON.stringify(videos));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pcosense_yoga_videos_updated', { detail: videos }));
    }
  } catch (err) {
    console.error('Error saving yoga videos:', err);
  }

  if (syncToFirestore) {
    // Non-blocking sync to Firestore
    videos.forEach(v => {
      const docRef = doc(db, 'yogaVideos', v.id);
      setDoc(docRef, v, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `yogaVideos/${v.id}`);
      });
    });
  }
}

/**
 * Fetch yoga videos from Cloud Firestore and merge into local cache with timestamp comparison
 */
export async function fetchYogaVideosFromFirestore(): Promise<YogaVideoItem[]> {
  try {
    const colRef = collection(db, 'yogaVideos');
    const snap = await getDocs(colRef);
    const deletedIds = getDeletedYogaVideoIds();

    if (!snap.empty) {
      const remoteVideos = snap.docs.map(d => d.data() as YogaVideoItem);

      // Clean up remote items that were deleted locally
      remoteVideos.forEach(v => {
        if (deletedIds.has(v.id)) {
          deleteDoc(doc(db, 'yogaVideos', v.id)).catch(() => {});
        }
      });

      const validRemote = remoteVideos.filter(v => !deletedIds.has(v.id));
      const local = getStoredYogaVideos().filter(v => !deletedIds.has(v.id));

      const map = new Map<string, YogaVideoItem>();
      validRemote.forEach(v => map.set(v.id, v));

      local.forEach(l => {
        const remote = map.get(l.id);
        if (!remote) {
          map.set(l.id, l);
          setDoc(doc(db, 'yogaVideos', l.id), l, { merge: true }).catch(() => {});
        } else {
          const localTime = l.updatedAt ? new Date(l.updatedAt).getTime() : 0;
          const remoteTime = (remote as any).updatedAt ? new Date((remote as any).updatedAt).getTime() : 0;
          if (localTime >= remoteTime) {
            map.set(l.id, l);
            if (localTime > remoteTime) {
              setDoc(doc(db, 'yogaVideos', l.id), l, { merge: true }).catch(() => {});
            }
          }
        }
      });

      const merged = Array.from(map.values());
      saveYogaVideosToStorage(merged, false);
      return merged;
    } else {
      // Seed initial videos to Firestore
      const initials = getStoredYogaVideos().filter(v => !deletedIds.has(v.id));
      initials.forEach(v => {
        setDoc(doc(db, 'yogaVideos', v.id), v).catch(() => {});
      });
      return initials;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'yogaVideos');
  }
  return getStoredYogaVideos();
}

export function getActiveYogaVideos(): YogaVideoItem[] {
  const all = getStoredYogaVideos();
  return all.filter(v => v.isActive);
}

/**
 * Admin action: Add new Yoga Video
 */
export function addYogaVideo(videoData: Omit<YogaVideoItem, 'id'>): YogaVideoItem {
  const all = getStoredYogaVideos();
  const id = `yoga-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  unmarkYogaVideoDeleted(id);
  const now = new Date().toISOString();
  const newVideo: YogaVideoItem = {
    ...videoData,
    id,
    createdAt: (videoData as any).createdAt || now,
    updatedAt: now
  };
  all.unshift(newVideo);
  saveYogaVideosToStorage(all, true);
  return newVideo;
}

/**
 * Admin action: Update Yoga Video
 */
export function updateYogaVideo(id: string, updates: Partial<YogaVideoItem>): YogaVideoItem | null {
  const all = getStoredYogaVideos();
  const index = all.findIndex(v => v.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveYogaVideosToStorage(all, true);

  // Sync to Firestore immediately
  setDoc(doc(db, 'yogaVideos', id), all[index], { merge: true }).catch(err => {
    handleFirestoreError(err, OperationType.UPDATE, `yogaVideos/${id}`);
  });

  return all[index];
}

/**
 * Admin action: Delete Yoga Video
 */
export function deleteYogaVideo(id: string): boolean {
  markYogaVideoDeleted(id);
  const all = getStoredYogaVideos();
  const filtered = all.filter(v => v.id !== id);
  if (filtered.length !== all.length) {
    saveYogaVideosToStorage(filtered, false);
    deleteDoc(doc(db, 'yogaVideos', id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `yogaVideos/${id}`);
    });
    return true;
  }
  return false;
}
