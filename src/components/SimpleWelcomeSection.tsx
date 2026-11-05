import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Apple,
  Video,
  UserCheck,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Smile,
  HelpCircle,
  Check,
  PhoneCall,
  Play,
  Flame,
  ChevronRight,
  SunMedium,
  Activity,
  X,
  Leaf,
  Utensils,
  Dumbbell,
  Coffee,
  MessageCircle
} from 'lucide-react';
import { SubscriptionTiersComparison } from './SubscriptionTiersComparison';
import { IntroPCOSenseVideo } from './IntroPCOSenseVideo';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';

export const SimpleWelcomeSection: React.FC = () => {
  const { isTelugu } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [solutionModalProblem, setSolutionModalProblem] = useState<any | null>(null);

  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Stop speech synthesis or audio playback when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  }, [audioPlayer]);

  const handleReadAloud = () => {
    // If currently speaking or playing audio, stop immediately
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    const teluguSentences = [
      'స్వాగతం. పీసీఓఎస్ గురించి సులభంగా తెలుసుకోండి.',
      'పీసీఓఎస్ అనేది హార్మోన్ల అసమతుల్యత వల్ల వచ్చే సాధారణ సమస్య. ప్రతి ఐదుగురు మహిళల్లో ఒకరికి ఇది ఉంటుంది.',
      'మీ పీరియడ్స్ ఆలస్యంగా రావడం, బరువు పెరగడం, ముఖంపై మొటిమలు లేదా అవాంఛిత రోమాలు ఉంటే భయపడకండి.',
      'మొదటి దశ: రెండు నిమిషాల్లో సులువైన ప్రశ్నలకు సమాధానం ఇవ్వండి.',
      'రెండవ దశ: కేవలం ఒక రూపాయి చెల్లించి మూడు రోజుల పాటు అన్ని సేవలను ఉపయోగించండి.',
      'మూడవ దశ: సరైన ఆహార నియమాలు, సులువైన యోగా వీడియోలు మరియు అనుభవజ్ఞులైన లేడీ డాక్టర్ల సలహాలు పొందండి.',
      'ఈరోజే మీ ఆరోగ్యాన్ని మెరుగుపరుచుకోండి.'
    ];

    const englishText = `Welcome to PCOSense. We make PCOS simple and easy to understand for everyone. PCOS is a very common hormonal imbalance that affects one in every five women. If your periods are irregular, if you are struggling with weight, or have acne and facial hair, do not worry. Step 1: Answer simple questions in just two minutes. Step 2: Pay just 1 Rupee to try everything for 3 full days. Step 3: Get your personalized food plan, gentle video exercises, and consult real specialist doctors. Take the first step towards feeling healthier today.`;

    if (isTelugu) {
      // 1. Check if browser has native Telugu speech synthesis voice
      let nativeTeluguVoice: SpeechSynthesisVoice | null = null;
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices() || [];
        nativeTeluguVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('te') || 
          v.name.toLowerCase().includes('telugu')
        ) || null;
      }

      if (nativeTeluguVoice && 'speechSynthesis' in window) {
        // Use native Telugu voice
        const fullTeluguText = teluguSentences.join(' ');
        const utterance = new SpeechSynthesisUtterance(fullTeluguText);
        utterance.voice = nativeTeluguVoice;
        utterance.lang = nativeTeluguVoice.lang || 'te-IN';
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        return;
      }

      // 2. High-fidelity audio stream (Local /api/tts proxy to ensure audio works inside iframes and across all browsers)
      setIsSpeaking(true);
      let currentIndex = 0;
      const audio = new Audio();
      setAudioPlayer(audio);

      const playNextSentence = () => {
        if (currentIndex >= teluguSentences.length) {
          setIsSpeaking(false);
          return;
        }
        const chunk = teluguSentences[currentIndex];
        currentIndex++;
        // Use local /api/tts proxy to bypass iframe CORS restrictions, fallback to direct url if needed
        const audioUrl = `/api/tts?tl=te&q=${encodeURIComponent(chunk)}`;
        audio.src = audioUrl;
        audio.play().catch(err => {
          console.warn('Local Telugu TTS audio playback note, trying direct URL:', err);
          const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${encodeURIComponent(chunk)}`;
          const fallbackAudio = new Audio(fallbackUrl);
          fallbackAudio.onended = playNextSentence;
          fallbackAudio.play().catch(fallbackErr => {
            console.warn('Fallback audio also noted:', fallbackErr);
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(chunk);
              utterance.lang = 'te-IN';
              utterance.onend = playNextSentence;
              utterance.onerror = () => setIsSpeaking(false);
              window.speechSynthesis.speak(utterance);
            } else {
              setIsSpeaking(false);
            }
          });
        });
      };

      audio.onended = playNextSentence;
      audio.onerror = () => {
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(teluguSentences.join(' '));
          utterance.lang = 'te-IN';
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      };

      playNextSentence();
      return;
    }

    // English mode
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(englishText);
      utterance.lang = 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      alert('Voice speech is not supported on this browser.');
    }
  };

  const commonProblems = [
    {
      id: 1,
      icon: Calendar,
      titleEn: 'Irregular Periods',
      titleTe: 'పీరియడ్స్ ఆలస్యం కావడం',
      descEn: 'Periods coming late (after 35-60 days), skipping months, or heavy painful bleeding.',
      descTe: 'నెలసరి సమయానికి రాకపోవడం, రెండు మూడు నెలలు ఆలస్యం కావడం లేదా ఎక్కువ రక్తస్రావం.',
      color: 'from-rose-500/10 to-rose-500/20 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400',
      badge: isTelugu ? 'పీరియడ్స్ సమస్య' : 'Cycle Problem',
      whyEn: 'In PCOS, ovaries produce higher androgen levels and ovulation is delayed or skipped, leading to 35-60+ day cycles or missed periods.',
      whyTe: 'PCOS ఉన్నప్పుడు హార్మోన్ల అసమతుల్యత వల్ల అండం సరైన సమయానికి విడుదల కాదు. దీనివల్ల నెలసరి 35 నుండి 60 రోజుల వరకు ఆలస్యం కావడం లేదా అసలు రాకపోవడం జరుగుతుంది.',
      homeRemedyEn: 'Morning methi (fenugreek) water soaked overnight on an empty stomach. Evening spearmint herbal tea. Practice seed cycling (flax & pumpkin seeds).',
      homeRemedyTe: 'ఉదయం పరగడుపున రాత్రి నానబెట్టిన మెంతుల నీరు తాగడం. సాయంత్రం పుదీనా (Spearmint) హెర్బల్ టీ. అవిసె గింజలు (Flax seeds), గుమ్మడి గింజలు తీసుకోవడం.',
      dietFixEn: 'Protein- and fiber-rich AP/Telangana meals like Pesarattu with ginger chutney, Ragi Dosa, and Palak/Gongura Dal. Strictly avoid refined maida and white sugar.',
      dietFixTe: 'పెసరట్టు + అల్లం పచ్చడి, రాగి దోశ, తోటకూర/గోంగూర పప్పు లాంటి ఫైబర్ మరియు ప్రొటీన్ ఎక్కువగా ఉండే మన తెలుగు వంటకాలు తినండి. మైదా, పంచదార పూర్తిగా తగ్గించండి.',
      movementFixEn: '25-30 minutes of daily brisk walking and Butterfly pose (Bhadrasana) for 5-7 minutes to enhance pelvic blood circulation.',
      movementFixTe: 'రోజూ 25 నిమిషాల బ్రిస్క్ వాక్ మరియు 5 నిమిషాలు సీతాకోకచిలుక ఆసనం (Bhadrasana/Butterfly Pose) వేయడం వల్ల గర్భాశయ రక్తప్రసరణ మెరుగవుతుంది.',
      doctorCareEn: 'Schedule a private App Call or App Chat with a female PCOS Gynecologist to evaluate your hormonal profile and restore your natural cycle.',
      doctorCareTe: 'మా అనుభవజ్ఞులైన లేడీ గైనకాలజిస్ట్‌తో యాప్ కాల్ లేదా చాట్ ద్వారా సంప్రదించి సురక్షితమైన వైద్య సలహాలు పొందండి.',
      primaryCta: {
        labelEn: 'View 7-Day AP/Telangana Diet Plan',
        labelTe: '7 రోజుల ఆహార పట్టిక చూడండి',
        link: '/nutrition'
      },
      secondaryCta: {
        labelEn: 'Talk to Doctor (App Call / Chat)',
        labelTe: 'డాక్టర్‌తో మాట్లాడండి (యాప్ కాల్)',
        link: '/doctors'
      },
      tertiaryCta: {
        labelEn: 'Take 2-Min Health Assessment',
        labelTe: 'ఆరోగ్య పరీక్ష చేసుకోండి',
        link: '/assessment'
      }
    },
    {
      id: 2,
      icon: Flame,
      titleEn: 'Weight Not Reducing',
      titleTe: 'బరువు తగ్గకపోవడం',
      descEn: 'Belly fat increasing even when eating normal food, feeling slow metabolism.',
      descTe: 'సాధారణ ఆహారం తిన్నా పొట్ట భాగంలో బరువు పెరగడం, తగ్గించడం కష్టంగా అనిపించడం.',
      color: 'from-amber-500/10 to-amber-500/20 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400',
      badge: isTelugu ? 'బరువు & జీవక్రియ' : 'Metabolism',
      whyEn: '70-80% of women with PCOS suffer from insulin resistance. The body stores energy as stubborn abdominal fat instead of burning it for fuel.',
      whyTe: 'PCOS లో ఇన్సులిన్ రెసిస్టెన్స్ వల్ల శరీరం తీసుకున్న ఆహారాన్ని శక్తిగా మార్చలేక కొవ్వుగా (ముఖ్యంగా పొట్ట భాగంలో) నిల్వ చేస్తుంది. తక్కువ తిన్నా బరువు తగ్గడం కష్టమవుతుంది.',
      homeRemedyEn: 'Warm water with a pinch of pure Ceylon cinnamon powder 20 minutes before meals. Soaked chia or sabja seeds for gut satiety.',
      homeRemedyTe: 'భోజనానికి 20 నిమిషాల ముందు చిటికెడు దాల్చినచెక్క పొడితో గోరువెచ్చని నీరు. రాత్రి నానబెట్టిన సబ్జా లేదా చియా గింజలు తీసుకోవడం.',
      dietFixEn: 'Replace heavy white rice with Jowar Roti, Foxtail/Kodo Millet, and Brown rice. Eat protein first (sprouts, dal, boiled eggs or paneer/tofu) to halt glucose spikes.',
      dietFixTe: 'తెల్ల అన్నం తగ్గించి జొన్న రొట్టెలు, కొర్రలు లేదా బ్రౌన్ రైస్ తీసుకోండి. భోజనంలో మొలకెత్తిన గింజలు, గుడ్లు లేదా పప్పుతో మొదలుపెట్టండి.',
      movementFixEn: 'Take a brisk 10-15 minute walk (100 paces) immediately after lunch and dinner to clear post-meal glucose.',
      movementFixTe: 'మధ్యాహ్నం మరియు రాత్రి భోజనం తర్వాత 10-15 నిమిషాలు నెమ్మదిగా నడవడం (శతపాది) వల్ల షుగర్ లెవెల్స్ పెరగకుండా కొవ్వు కరుగుతుంది.',
      doctorCareEn: 'Consult a PCOS clinical nutritionist via App Chat to calculate your personal macros and reverse metabolic slowdown.',
      doctorCareTe: 'మా క్లినికల్ న్యూట్రిషనిస్ట్‌తో మాట్లాడి ఆకలి లేకుండా బరువు తగ్గే సులువైన తెలుగు ఆహార ప్లాన్ పొందండి.',
      primaryCta: {
        labelEn: 'View 7-Day AP/Telangana Diet Plan',
        labelTe: '7 రోజుల ఆహార పట్టిక చూడండి',
        link: '/nutrition'
      },
      secondaryCta: {
        labelEn: 'Consult Dietitian via App Chat',
        labelTe: 'న్యూట్రిషనిస్ట్‌తో యాప్ చాట్ చేయండి',
        link: '/doctors'
      },
      tertiaryCta: {
        labelEn: 'Watch Movement & Yoga Videos',
        labelTe: 'యోగా & వ్యాయామ వీడియోలు',
        link: '/yoga-exercise'
      }
    },
    {
      id: 3,
      icon: Sparkles,
      titleEn: 'Pimples & Facial Hair',
      titleTe: 'మొటిమలు & ముఖంపై వెంట్రుకలు',
      descEn: 'Hard pimples on cheeks and jaw, or dark hair growth on chin and upper lip.',
      descTe: 'గడ్డం, పైపెదవిపై నల్లటి రోమాలు రావడం, చెంపలపై తగ్గని గట్టి మొటిమలు రావడం.',
      color: 'from-purple-500/10 to-purple-500/20 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      badge: isTelugu ? 'చర్మం & హార్మోన్లు' : 'Skin & Hair',
      whyEn: 'Excess androgens (male hormones) stimulate facial hair follicles and trigger skin glands to produce sticky sebum, causing stubborn hormonal acne.',
      whyTe: 'హార్మోన్ల అసమతుల్యత (ఆండ్రోజెన్లు పెరగడం) వల్ల చర్మంపై జిడ్డు ఎక్కువై గట్టి మొటిమలు వస్తాయి. అలాగే గడ్డం, పైపెదవిపై అవాంఛిత రోమాలు పెరుగుతాయి.',
      homeRemedyEn: 'Drink organic spearmint tea twice daily (clinically proven to lower free testosterone). Besan + wild turmeric paste for gentle face cleansing.',
      homeRemedyTe: 'రోజుకు రెండుసార్లు స్పియర్‌మింట్ (పుదీనా) టీ తాగండి (ఇది టెస్తోస్టిరాన్ తగ్గించడంలో సహాయపడుతుంది). శనగపిండి + కస్తూరి పసుపుతో ముఖం శుభ్రం చేసుకోండి.',
      dietFixEn: 'Eliminate dairy (milk, paneer) and bakery items for 3 weeks. Snack on roasted pumpkin seeds (rich in zinc) and fresh guava/amla.',
      dietFixTe: 'డైరీ ఉత్పత్తులు (పాలు, పన్నీర్) మరియు బేకరీ స్వీట్స్ కొద్ది రోజులు ఆపండి. జింక్ పుష్కలంగా ఉండే గుమ్మడి గింజలు మరియు ఉసిరికాయ తినండి.',
      movementFixEn: 'Practice Viparita Karani (Legs-Up-The-Wall) for 10 minutes nightly to reduce adrenal cortisol that triggers androgen production.',
      movementFixTe: 'విపరీత కరణి (గోడపై కాళ్ళు పెట్టే యోగాసనం) రోజూ రాత్రి 10 నిమిషాలు వేయడం వల్ల ఒత్తిడి తగ్గి హార్మోన్లు సమతుల్యమవుతాయి.',
      doctorCareEn: 'Connect with a Dermatologist & PCOS Specialist via App Call for non-scarring acne regimens and hormonal balance.',
      doctorCareTe: 'చర్మ నిపుణులు మరియు గైనకాలజిస్ట్‌తో యాప్ కాల్ ద్వారా మాట్లాడి మొటిమలు మచ్చలు లేకుండా తగ్గించుకోండి.',
      primaryCta: {
        labelEn: 'Consult PCOS Specialist (App Call)',
        labelTe: 'స్పెషలిస్ట్‌తో మాట్లాడండి',
        link: '/doctors'
      },
      secondaryCta: {
        labelEn: 'Watch Calming Yoga Videos',
        labelTe: 'యోగా వీడియోలు చూడండి',
        link: '/yoga-exercise'
      },
      tertiaryCta: {
        labelEn: '7-Day Vegan & Dairy-Free Plan',
        labelTe: 'డైరీ-రహిత ఆహార ప్రణాళిక',
        link: '/nutrition'
      }
    },
    {
      id: 4,
      icon: Heart,
      titleEn: 'Tiredness & Mood Swings',
      titleTe: 'నీరసం, అలసట & మూడ్ మార్పులు',
      descEn: 'Feeling exhausted for no reason, sudden sadness, hair fall, or disturbed sleep.',
      descTe: 'ఎటువంటి పని చేయకపోయినా విపరీతమైన అలసట, నిద్రలేమి, జుట్టు రాలడం మరియు చిరాకు.',
      color: 'from-teal-500/10 to-teal-500/20 border-teal-300 dark:border-teal-800 text-teal-600 dark:text-teal-400',
      badge: isTelugu ? 'మానసిక ప్రశాంతత' : 'Mental Energy',
      whyEn: 'Constant blood sugar spikes and drops, along with low Vitamin D3, B12, and chronic low-grade inflammation lead to severe brain fog and sudden fatigue.',
      whyTe: 'శరీరంలో విటమిన్ D3, B12 లోపం, రక్తంలో షుగర్ హెచ్చుతగ్గులు మరియు నిరంతర ఆందోళన వల్ల ఎటువంటి పని చేయకపోయినా విపరీతమైన అలసట కలుగుతుంది.',
      homeRemedyEn: 'Warm water with crushed moringa leaves (munagaku) or ashwagandha before sleep. Soaked walnuts and dates for midday clean energy.',
      homeRemedyTe: 'రాత్రి పడుకునే ముందు అశ్వగంధ లేదా గోరువెచ్చని నీరు. మధ్యాహ్నం నీరసం వచ్చినప్పుడు నానబెట్టిన వాల్‌నట్స్, ఎండు ఖర్జూరం తీసుకోవడం.',
      dietFixEn: 'Include iron-rich Gongura / Palak dal, ragi malt or ragi sangati, and fresh pomegranate. Avoid sugary biscuits and afternoon chai.',
      dietFixTe: 'ఐరన్ పుష్కలంగా ఉండే గోంగూర పప్పు, రాగి అంబలి లేదా రాగి సంకటి, దానిమ్మ పండ్లు తినండి. బిస్కెట్లు, ఎక్కువ తీపి ఉండే టీ తగ్గించండి.',
      movementFixEn: 'Get 15 minutes of early morning gentle sunlight exposure and practice Anulom Vilom (alternate nostril breathing) for mental calm.',
      movementFixTe: 'ఉదయం 15 నిమిషాలు ఎండలో నడవడం మరియు 10 నిమిషాలు అనులోమ విలోమ ప్రాణాయామం చేయడం వల్ల మానసిక ప్రశాంతత, ఉల్లాసం లభిస్తాయి.',
      doctorCareEn: 'Book an App Call with our women\'s health physician to review essential vitamin levels and get tailored energy recovery steps.',
      doctorCareTe: 'మా మహిళా వైద్యులతో యాప్ కాల్ ద్వారా మాట్లాడి విటమిన్ లోపాలను సరిదిద్దుకునే పరిష్కారం పొందండి.',
      primaryCta: {
        labelEn: 'Watch Daily Healing & Yoga Videos',
        labelTe: 'వెల్నెస్ & యోగా వీడియోలు చూడండి',
        link: '/yoga-exercise'
      },
      secondaryCta: {
        labelEn: 'Consult Doctor (App Call)',
        labelTe: 'డాక్టర్‌తో యాప్ కాల్ మాట్లాడండి',
        link: '/doctors'
      },
      tertiaryCta: {
        labelEn: 'Take Health Assessment',
        labelTe: 'ఆరోగ్య పరీక్ష చేసుకోండి',
        link: '/assessment'
      }
    }
  ];

  const actionSteps = [
    {
      step: '1',
      icon: Smile,
      badge: isTelugu ? 'కేవలం 2 నిమిషాలు' : 'Step 1 • 2 Mins',
      titleEn: 'Step 1: Tell Us Your Symptoms',
      titleTe: 'దశ 1: మీ లక్షణాలను చెప్పండి',
      descEn: 'Click simple YES/NO cards with pictures. No blood tests or hard doctor terms needed.',
      descTe: 'ఫోటోలతో కూడిన సులువైన అవును / కాదు ప్రశ్నలు. ఎటువంటి రక్త పరీక్షలు లేదా కష్టమైన పదాలు అవసరం లేదు.'
    },
    {
      step: '2',
      icon: Activity,
      badge: isTelugu ? 'రిస్క్ స్క్రీనింగ్' : 'Step 2 • Risk Estimate',
      titleEn: 'Step 2: Get a Risk Estimate',
      titleTe: 'దశ 2: రిస్క్ అంచనా పొందండి',
      descEn: 'A clear, friendly color-coded meter shows if your symptoms match PCOS without confusing medical math.',
      descTe: 'ఎటువంటి గందరగోళం లేకుండా మీ శరీర లక్షణాలు PCOS కి సరిపోలుతున్నాయో లేదో స్పష్టమైన మీటర్‌తో తెలుసుకోండి.'
    },
    {
      step: '3',
      icon: Apple,
      badge: isTelugu ? 'వ్యక్తిగత వెల్నెస్' : 'Step 3 • Wellness Plan',
      titleEn: 'Step 3: Personalized Wellness',
      titleTe: 'దశ 3: వ్యక్తిగత ఆహారం & యోగా',
      descEn: 'Get everyday home-cooked meal guides, grocery tips, and gentle daily video exercises tailored for your body.',
      descTe: 'ఇంట్లోనే చేసుకునే బలమైన ఆహార పట్టిక, వంటకాలు మరియు తేలికపాటి రోజువారీ యోగా వీడియోలు పొందండి.'
    },
    {
      step: '4',
      icon: Stethoscope,
      badge: isTelugu ? 'డాక్టర్ సంప్రదింపు' : 'Step 4 • Doctor Care',
      titleEn: 'Step 4: Talk With Caring Doctors',
      titleTe: 'దశ 4: నిపుణులైన డాక్టర్లతో మాట్లాడండి',
      descEn: 'Book a friendly, private video consultation or chat with verified women\'s health doctors from home.',
      descTe: 'ఇంటి నుంచే లేడీ డాక్టర్లతో ప్రైవేట్ వీడియో సంభాషణ చేసి సురక్షితమైన వైద్య సలహాలు పొందండి.'
    }
  ];

  return (
    <div className="space-y-10" id="simple-welcome-section-root">
      
      {/* Friendly Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-teal-500/30">
        
        {/* Soft Background Warm Glow Circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Pill & Read Aloud Audio Voice Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-extrabold border border-emerald-400/30">
              <SunMedium className="h-4 w-4 text-emerald-400" />
              <span>
                {isTelugu ? 'అందరికీ సులభంగా అర్థమయ్యే గైడ్' : 'Super Easy & Clear Health Guide'}
              </span>
            </div>

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={handleReadAloud}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                isSpeaking
                  ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title={isTelugu ? 'వాయిస్ ద్వారా వినండి' : 'Listen with Audio'}
              id="voice-read-aloud-btn"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>{isTelugu ? 'వాయిస్ ఆపండి (Stop Audio)' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-300" />
                  <span>{isTelugu ? '🔊 వాయిస్ ద్వారా వినండి (Listen)' : '🔊 Read Aloud in Plain Language'}</span>
                </>
              )}
            </button>
          </div>

          {/* Main Big Friendly Heading */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isTelugu ? (
                <>
                  భయపడకండి! <span className="text-emerald-400">PCOS</span> ను సరైన ఆహారం మరియు నడకతో నయం చేసుకోవచ్చు.
                </>
              ) : (
                <>
                  Don't Worry! <span className="text-emerald-400">PCOS</span> Can Be Managed with Simple Food & Easy Habits.
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal">
              {isTelugu ? (
                'PCOS అంటే ఎటువంటి ప్రాణాంతకమైన వ్యాధి కాదు. ఇది శరీరంలో హార్మోన్ల అసమతుల్యత మాత్రమే. భారతదేశంలో ప్రతి 5 గురిలో ఒక మహిళకు ఇది ఉంది. ఎటువంటి కష్టమైన మందులు లేకుండా, మంచి ఆహారం మరియు తేలికపాటి వ్యాయామంతో పీరియడ్స్ మళ్లీ సమయానికి వచ్చేలా చేయవచ్చు.'
              ) : (
                'PCOS is NOT a dangerous disease. It is simply a very common hormone imbalance that 1 out of 5 women have. With healthy home food, regular daily walking, and friendly doctor advice, your periods can become regular again.'
              )}
            </p>
          </div>

          {/* 3 Main Big Friendly Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center gap-3.5">
            <Link
              to={isAuthenticated ? "/assessment" : "/register?redirect=/assessment"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg hover:shadow-emerald-500/25 transition-all"
              id="simple-start-test-btn"
            >
              <Smile className="h-5 w-5 text-slate-950" />
              <span>
                {isTelugu ? 'నా ఆరోగ్యాన్ని పరీక్షించండి (కేవలం ₹1 ట్రయల్)' : 'Check My Health Now (₹1 for 3-Day Trial)'}
              </span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/doctors"
              onClick={() => navigate('/doctors')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer"
              id="simple-talk-doctor-btn"
            >
              <Stethoscope className="h-5 w-5 text-emerald-300" />
              <span>
                {isTelugu ? 'లేడీ డాక్టర్లతో మాట్లాడండి' : 'Talk to a Doctor'}
              </span>
            </Link>

            <Link
              to="/nutrition"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all"
              id="simple-diet-btn"
            >
              <Apple className="h-5 w-5 text-emerald-300" />
              <span>
                {isTelugu ? 'ఏ ఆహారం తినాలో చూడండి' : 'See What Food to Eat'}
              </span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-teal-700/40 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-teal-200">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{isTelugu ? '100% మహిళల గోప్యత & భద్రత' : '100% Safe & Private for Women'}</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{isTelugu ? 'ప్రభుత్వ గుర్తింపు పొందిన వైద్యులు' : 'Verified Clinical Doctors'}</span>
            </span>
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>{isTelugu ? 'ఫోన్‌పే & గూగుల్ పే ద్వారా చెల్లింపు' : 'PhonePe & GPay Supported'}</span>
            </span>
          </div>

        </div>
      </div>

      {/* SECTION 1: "Do You Suffer from Any of These 4 Common Signs?" */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'లక్షణాలు గుర్తించండి' : 'Spot the Common Signs'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isTelugu
              ? 'మీకు ఈ 4 సమస్యలలో ఏమైనా ఉన్నాయా? (క్లిక్ చేసి చూడండి)'
              : 'Do You Have Any of These 4 Common Problems?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isTelugu
              ? 'కింది కార్డులపై క్లిక్ చేసి మీ లక్షణాన్ని సరిచూసుకోండి.'
              : 'Tap on any box below to see what it means and how you can cure it easily.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commonProblems.map((prob) => {
            const Icon = prob.icon;
            const isSelected = selectedProblem === prob.id;

            return (
              <div
                key={prob.id}
                onClick={() => {
                  setSelectedProblem(prob.id);
                  setSolutionModalProblem(prob);
                }}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg hover:-translate-y-0.5 group flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                }`}
                id={`problem-card-${prob.id}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${prob.color} flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {prob.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {isTelugu ? prob.titleTe : prob.titleEn}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {isTelugu ? prob.descTe : prob.descEn}
                  </p>
                </div>

                {/* Explicit Functional "How We Fix It →" Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProblem(prob.id);
                    setSolutionModalProblem(prob);
                  }}
                  className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/btn"
                  id={`how-we-fix-btn-${prob.id}`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-extrabold shadow-2xs group-hover/btn:bg-emerald-100 dark:group-hover/btn:bg-emerald-900/60">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span>{isTelugu ? 'పరిష్కారం చూడండి →' : 'How We Fix It →'}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* INLINE SOLUTION BREAKDOWN PANEL (Active when any problem is selected) */}
        {(() => {
          const activeProb = commonProblems.find((p) => p.id === (selectedProblem || 1));
          if (!activeProb) return null;
          const ActiveIcon = activeProb.icon;

          return (
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 p-6 sm:p-8 border-2 border-emerald-300/80 dark:border-emerald-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              
              {/* Header & Quick Problem Switcher Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${activeProb.color} flex items-center justify-center border shadow-xs`}>
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                        {isTelugu ? 'ప్రత్యేక పరిష్కార మార్గం' : 'Our Targeted Fix Plan'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {activeProb.badge}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {isTelugu
                        ? `${activeProb.titleTe} - సులువైన పరిష్కారం`
                        : `How We Fix: ${activeProb.titleEn}`}
                    </h3>
                  </div>
                </div>

                {/* Tabs to toggle between 4 problems */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {commonProblems.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProblem(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        (selectedProblem || 1) === p.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isTelugu ? p.titleTe.split(' ')[0] : p.titleEn.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* "Why This Happens" explanation card */}
              <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {isTelugu ? 'ఇది శరీరంలో ఎందుకు జరుగుతుంది?' : 'Why This Happens in Your Body'}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
                    {isTelugu ? activeProb.whyTe : activeProb.whyEn}
                  </p>
                </div>
              </div>

              {/* 4 Pillars of Fix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Pillar 1: Kitchen & Home Remedy */}
                <div className="rounded-2xl bg-white dark:bg-slate-950 p-4 border border-emerald-100 dark:border-slate-800 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Coffee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      {isTelugu ? '1. వంటింటి చిట్కా' : '1. Kitchen Remedy'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isTelugu ? activeProb.homeRemedyTe : activeProb.homeRemedyEn}
                  </p>
                </div>

                {/* Pillar 2: AP & Telangana Diet */}
                <div className="rounded-2xl bg-white dark:bg-slate-950 p-4 border border-emerald-100 dark:border-slate-800 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                    <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      {isTelugu ? '2. తెలుగు ఆహారం' : '2. AP/TS Diet Fix'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isTelugu ? activeProb.dietFixTe : activeProb.dietFixEn}
                  </p>
                </div>

                {/* Pillar 3: Movement & Yoga */}
                <div className="rounded-2xl bg-white dark:bg-slate-950 p-4 border border-emerald-100 dark:border-slate-800 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                      <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      {isTelugu ? '3. వ్యాయామం & యోగా' : '3. Movement & Yoga'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isTelugu ? activeProb.movementFixTe : activeProb.movementFixEn}
                  </p>
                </div>

                {/* Pillar 4: Doctor Care */}
                <div className="rounded-2xl bg-white dark:bg-slate-950 p-4 border border-emerald-100 dark:border-slate-800 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-wider">
                      {isTelugu ? '4. డాక్టర్ సంప్రదింపు' : '4. Doctor Care'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {isTelugu ? activeProb.doctorCareTe : activeProb.doctorCareEn}
                  </p>
                </div>

              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 border-t border-emerald-200/60 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to={activeProb.primaryCta.link}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-emerald-600/25 transition-all"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>{isTelugu ? activeProb.primaryCta.labelTe : activeProb.primaryCta.labelEn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to={activeProb.secondaryCta.link}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
                  >
                    <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isTelugu ? activeProb.secondaryCta.labelTe : activeProb.secondaryCta.labelEn}</span>
                  </Link>

                  <Link
                    to={activeProb.tertiaryCta.link}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>{isTelugu ? activeProb.tertiaryCta.labelTe : activeProb.tertiaryCta.labelEn}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setSolutionModalProblem(activeProb)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isTelugu ? 'పూర్తి వివరణ పాప్-అప్ చూడండి' : 'Open Full Guide Modal'}</span>
                </button>
              </div>

            </div>
          );
        })()}
      </div>

      {/* SECTION 2: "How PCOSense Works in 4 Clear Action Steps" */}
      <div className="rounded-3xl bg-slate-100 dark:bg-slate-900/80 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300 dark:border-teal-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isTelugu ? '4 సులువైన దశలు • సులభమైన ఆరోగ్యం' : 'Simple Action Steps • No Jargon'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isTelugu
              ? 'ఈ యాప్ ఎలా పనిచేస్తుంది? (4 సాధారణ దశలు)'
              : 'How PCOSense Works: 4 Simple Action Steps'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isTelugu
              ? 'లక్షణాలు చెప్పడం నుంచి డాక్టర్ సలహా వరకు - ప్రతి దశ మీ శ్రేయస్సు కోసమే రూపొందించబడింది.'
              : 'From sharing your symptoms to personalized food and kind doctor guidance, explained step-by-step.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actionSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl bg-white dark:bg-slate-950 p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {s.step}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-200 dark:border-teal-800">
                      {s.badge}
                    </span>
                  </div>

                  <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isTelugu ? s.titleTe : s.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isTelugu ? s.descTe : s.descEn}
                    </p>
                  </div>
                </div>

                {s.step === '4' ? (
                  <button
                    type="button"
                    onClick={() => navigate('/doctors')}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    id="welcome-step4-action-btn"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{isTelugu ? 'లేడీ డాక్టర్లతో మాట్లాడండి' : 'Talk to Caring Doctors'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <div className="pt-2 text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <span>{isTelugu ? 'సులభమైన విధానం' : 'Easy to Follow'}</span>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2.5: PCOS EDUCATIONAL VIDEOS (What is PCOS, Symptoms, Risks, Daily Healing) */}
      <IntroPCOSenseVideo />

      {/* SECTION 3: "Subscription Tiers Section" */}
      <SubscriptionTiersComparison mode="landing" />

      {/* HOW WE FIX IT - COMPREHENSIVE SOLUTION MODAL */}
      {solutionModalProblem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSolutionModalProblem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/30 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Banner */}
            <div className={`p-6 sm:p-7 bg-gradient-to-r ${solutionModalProblem.color} border-b border-slate-200 dark:border-slate-800 relative`}>
              <button
                type="button"
                onClick={() => setSolutionModalProblem(null)}
                className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4 pr-10">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md shrink-0">
                  {React.createElement(solutionModalProblem.icon, { className: 'h-7 w-7 text-emerald-600 dark:text-emerald-400' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                      {isTelugu ? 'పరిష్కార మార్గం' : 'How We Fix It'}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {solutionModalProblem.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {isTelugu ? solutionModalProblem.titleTe : solutionModalProblem.titleEn}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Why this happens in PCOS */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {isTelugu ? 'ఈ సమస్య ఎందుకు వస్తుంది? (Why It Happens)' : 'Root Cause: Why It Happens in PCOS'}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
                    {isTelugu ? solutionModalProblem.whyTe : solutionModalProblem.whyEn}
                  </p>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'మా 4 దశల సులువైన చికిత్స & ప్రణాళిక' : 'Our 4-Part Step-by-Step Fix'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Pillar 1 */}
                  <div className="rounded-2xl p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                        <Coffee className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <span className="font-extrabold text-xs">
                        {isTelugu ? '1. వంటింటి సహజ చిట్కా' : '1. Kitchen Remedy'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isTelugu ? solutionModalProblem.homeRemedyTe : solutionModalProblem.homeRemedyEn}
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="rounded-2xl p-4 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                      <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center">
                        <Utensils className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      </div>
                      <span className="font-extrabold text-xs">
                        {isTelugu ? '2. తెలుగు ఆహార మార్పులు' : '2. AP/TS Diet Solution'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isTelugu ? solutionModalProblem.dietFixTe : solutionModalProblem.dietFixEn}
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="rounded-2xl p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
                      <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center">
                        <Dumbbell className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                      </div>
                      <span className="font-extrabold text-xs">
                        {isTelugu ? '3. రోజువారీ యోగా / వ్యాయామం' : '3. Movement & Yoga'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isTelugu ? solutionModalProblem.movementFixTe : solutionModalProblem.movementFixEn}
                    </p>
                  </div>

                  {/* Pillar 4 */}
                  <div className="rounded-2xl p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                      <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-rose-700 dark:text-rose-400" />
                      </div>
                      <span className="font-extrabold text-xs">
                        {isTelugu ? '4. డాక్టర్ సలహా (యాప్ కాల్ / చాట్)' : '4. Doctor Care (App Call/Chat)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {isTelugu ? solutionModalProblem.doctorCareTe : solutionModalProblem.doctorCareEn}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <Link
                  to={solutionModalProblem.primaryCta.link}
                  onClick={() => setSolutionModalProblem(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all"
                >
                  <Utensils className="h-4 w-4" />
                  <span>{isTelugu ? solutionModalProblem.primaryCta.labelTe : solutionModalProblem.primaryCta.labelEn}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to={solutionModalProblem.secondaryCta.link}
                  onClick={() => setSolutionModalProblem(null)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-all"
                >
                  <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isTelugu ? solutionModalProblem.secondaryCta.labelTe : solutionModalProblem.secondaryCta.labelEn}</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
