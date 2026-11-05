import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Trash2,
  History,
  Printer,
  Flame,
  Activity,
  Leaf,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Sliders,
  Search,
  FileText,
  X,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Heart,
  HelpCircle,
  Maximize2,
  ExternalLink,
  ChevronDown,
  Check,
  Utensils,
  MessageSquare,
  Send
} from 'lucide-react';
import { useLanguage } from '../translations';
import { useAuth } from '../context/AuthContext';
import { FoodScanResult, FoodRiskEstimation } from '../types';
import {
  analyzeFoodImageWithAI,
  optimizeImageForAnalysis,
  getScanHistory,
  deleteScanFromHistory,
  clearAllScanHistory,
  SAMPLE_FOOD_PRESETS,
  FoodSamplePreset,
  calculateFoodRiskEstimation
} from '../services/foodScanService';
import { sendFoodScanSummaryToWhatsApp, getStoredUserConsent } from '../services/whatsappService';

type ScannerMode = 'upload' | 'camera' | 'samples';
type ActiveTab = 'scanner' | 'history';

export const ScanFoodPage: React.FC = () => {
  const { t, isTelugu } = useLanguage();
  const { user } = useAuth();

  // Active view tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [scannerMode, setScannerMode] = useState<ScannerMode>('upload');

  // Input States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState<string>('');
  const [dietaryPref, setDietaryPref] = useState<string>('all');

  // Camera stream states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Loading & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<FoodScanResult[]>([]);
  const [showHistoryDetail, setShowHistoryDetail] = useState<FoodScanResult | null>(null);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendWhatsAppSummary = async () => {
    const target = showHistoryDetail || scanResult;
    if (!target) return;
    setIsSendingWhatsApp(true);
    try {
      // Build nicely formatted WhatsApp message
      const mealText = isTelugu
        ? `🥗 *PCOSense పోషకాహార విశ్లేషణ: ${target.dishName}*\n\n• గ్లైసిమిక్ ఇండెక్స్: ${target.glycemicIndex?.rating || 'Moderate'}\n• PCOS అనుకూలత: ${target.pcosSuitability?.score || 8}/10 (${target.pcosSuitability?.rating || 'Good'})\n• కేలరీలు: ~${target.estimatedNutrition?.calories || 320} kcal | ప్రొటీన్: ~${target.estimatedNutrition?.proteinG || 12}g\n• కార్బోహైడ్రేట్లు: ~${target.estimatedNutrition?.carbsG || 35}g | ఫైబర్: ~${target.estimatedNutrition?.fiberG || 7}g\n\n💡 *సూచన:* ${target.foodRisk?.riskExplanation || 'ఇన్సులిన్ సమతుల్యత కొరకు భోజనంలో తగినంత పప్పులు, ఫైబర్ చేర్చండి.'}\n\nPCOSense హెల్త్ ట్రాకర్ 🌸`
        : `🥗 *PCOSense Meal Nutrition Summary: ${target.dishName}*\n\n• Glycemic Index: ${target.glycemicIndex?.rating || 'Moderate'}\n• PCOS Suitability: ${target.pcosSuitability?.score || 8}/10 (${target.pcosSuitability?.rating || 'Good'})\n• Est. Calories: ~${target.estimatedNutrition?.calories || 320} kcal | Protein: ~${target.estimatedNutrition?.proteinG || 12}g\n• Carbs: ~${target.estimatedNutrition?.carbsG || 35}g | Dietary Fiber: ~${target.estimatedNutrition?.fiberG || 7}g\n\n💡 *Clinical Guidance:* ${target.foodRisk?.riskExplanation || 'Pair carbohydrates with fiber & protein to support steady insulin response.'}\n\nPCOSense Health Suite 🌸`;

      // 1. Sync via backend service
      try {
        await sendFoodScanSummaryToWhatsApp(target, user?.id || 'guest');
      } catch {}

      // 2. Direct WhatsApp launch (opens WhatsApp app on phone, or WhatsApp Web on desktop)
      const consent = getStoredUserConsent(user?.id || 'guest');
      const cleanDigits = (consent.phone_number || '').replace(/\D/g, '');
      const waUrl = cleanDigits
        ? `https://wa.me/${cleanDigits.startsWith('91') ? cleanDigits : '91' + cleanDigits}?text=${encodeURIComponent(mealText)}`
        : `https://wa.me/?text=${encodeURIComponent(mealText)}`;

      window.open(waUrl, '_blank');
      showToast(isTelugu ? 'భోజన సారాంశం వాట్సాప్‌లో సిద్ధమైంది! 🌸' : `Meal summary for "${target.dishName}" opened in WhatsApp! 🌸`);
    } catch {
      showToast(isTelugu ? 'వాట్సాప్ సందేశం తెరవడంలో విఫలమైంది.' : 'Failed to launch WhatsApp.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Load history on mount
  useEffect(() => {
    setHistoryList(getScanHistory());
  }, []);

  // AI Loading steps cycle
  const loadingSteps = useMemo(() => [
    isTelugu ? 'చిత్రంలో ఆహారాన్ని గుర్తిస్తోంది...' : 'Validating food contents in image...',
    isTelugu ? 'పదార్థాలు & పరిమాణాన్ని విశ్లేషిస్తోంది...' : 'Identifying ingredients and culinary preparation...',
    isTelugu ? 'గ్లైసిమిక్ ఇండెక్స్ (GI) లెక్కిస్తోంది...' : 'Calculating Glycemic Index (GI) & Glycemic Load (GL)...',
    isTelugu ? 'PCOS హార్మోన్ల ప్రభావాన్ని అంచనా వేస్తోంది...' : 'Evaluating insulin spike & PCOS hormonal suitability...'
  ], [isTelugu]);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, loadingSteps.length]);

  // Clean up camera stream when component unmounts or camera stops
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Initialize Camera
  const startCamera = async (facingMode: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser/device.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setScannerMode('camera');
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err?.message || 'Unable to access device camera. Please check camera permissions or use file upload.'
      );
      setIsCameraActive(false);
      setScannerMode('upload');
    }
  };

  // Toggle Front / Back Camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture Snapshot from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      stopCameraStream();
      setPreviewImage(dataUrl);
      setSelectedFile(null);
      setScannerMode('upload');
    } catch (err: any) {
      console.error('Failed to capture snapshot:', err);
      setErrorMessage('Failed to capture photo from camera. Please try again.');
    }
  };

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    try {
      setErrorMessage(null);
      setSelectedFile(file);
      const optimized = await optimizeImageForAnalysis(file);
      setPreviewImage(optimized.base64);
      stopCameraStream();
    } catch (err: any) {
      setErrorMessage('Failed to process the selected image. Please try another photo.');
    }
  };

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage('Please drop a valid food image file.');
      return;
    }
    try {
      setErrorMessage(null);
      setSelectedFile(file);
      const optimized = await optimizeImageForAnalysis(file);
      setPreviewImage(optimized.base64);
      stopCameraStream();
    } catch (err: any) {
      setErrorMessage('Failed to process image. Please try again.');
    }
  };

  // Apply a sample dish preset
  const handleApplyPreset = (preset: FoodSamplePreset) => {
    stopCameraStream();
    setPreviewImage(preset.sampleImageDataUrl);
    setDishHint(preset.hint);
    setSelectedFile(null);
    setErrorMessage(null);
    setScanResult(null);
  };

  // Trigger AI Analysis
  const handleAnalyzeImage = async () => {
    if (!previewImage) {
      setErrorMessage('Please capture or upload a photo of your dish first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const result = await analyzeFoodImageWithAI({
        imageBase64: previewImage,
        dietaryPreference: dietaryPref,
        language: isTelugu ? 'te' : 'en',
        dishHint: dishHint.trim()
      });

      setScanResult(result);
      // Refresh history list
      setHistoryList(getScanHistory());

      if (!result.isFood) {
        showToast(isTelugu ? 'ఆహారం కాదని గుర్తించబడింది.' : 'Non-food image detected.');
      } else {
        showToast(isTelugu ? 'ఆహార విశ్లేషణ పూర్తయింది!' : 'Food analyzed successfully!');
      }
    } catch (err: any) {
      console.error('Food scan error:', err);
      setErrorMessage(
        err?.message || 'Failed to analyze food photo. Please check your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset Scanner for a new photo
  const handleResetScanner = () => {
    stopCameraStream();
    setSelectedFile(null);
    setPreviewImage(null);
    setDishHint('');
    setScanResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete Scan item
  const handleDeleteScan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScanFromHistory(id);
    setHistoryList(getScanHistory());
    if (showHistoryDetail?.id === id) {
      setShowHistoryDetail(null);
    }
    showToast('Scan removed from history');
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your scanned meals history?')) {
      clearAllScanHistory();
      setHistoryList([]);
      setShowHistoryDetail(null);
      showToast('Scan history cleared');
    }
  };

  // Helper for GI rating colors
  const getGiColor = (rating?: 'Low' | 'Medium' | 'High' | null) => {
    switch (rating) {
      case 'Low':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500'
        };
      case 'High':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/60',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500'
        };
    }
  };

  // Helper for PCOS Suitability badge
  const getSuitabilityColor = (rating?: string | null) => {
    const r = (rating || '').toLowerCase();
    if (r.includes('optimal') || r.includes('high benefit') || r.includes('low risk') || r.includes('safe') || r.includes('good')) {
      return {
        badge: 'bg-[#E8F2EA] dark:bg-[#1A3022] text-[#263D32] dark:text-[#E8F2EA] border-[#C8DEC3] dark:border-[#2D4C37]',
        bar: 'bg-[#6B9E78]'
      };
    }
    if (r.includes('moderate') || r.includes('balanced') || r.includes('medium') || r.includes('fair')) {
      return {
        badge: 'bg-[#FFF4DF] dark:bg-[#33240D] text-[#7A510A] dark:text-[#FFE6B3] border-[#F1DCB0] dark:border-[#5A4016]',
        bar: 'bg-[#D9822B]'
      };
    }
    if (r.includes('caution') || r.includes('not recommended') || r.includes('avoid') || r.includes('spike')) {
      return {
        badge: 'bg-[#FDF2F3] dark:bg-[#36171B] text-[#9E2B35] dark:text-[#F8C3CA] border-[#F6CAD0] dark:border-[#5C272E]',
        bar: 'bg-[#D96C75]'
      };
    }
    return {
      badge: 'bg-[#E8F2EA] dark:bg-[#1A3022] text-[#263D32] dark:text-[#E8F2EA] border-[#C8DEC3] dark:border-[#2D4C37]',
      bar: 'bg-[#6B9E78]'
    };
  };

  // Helper for Food Risk badge & spectrum
  const getFoodRiskColor = (riskLevel?: string | null) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return {
          badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'moderate':
        return {
          badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
          dot: 'bg-amber-500',
          bar: 'bg-amber-500',
          text: 'text-amber-700 dark:text-amber-300'
        };
      case 'elevated':
      case 'high':
        return {
          badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
          dot: 'bg-rose-500',
          bar: 'bg-rose-500',
          text: 'text-rose-700 dark:text-rose-300'
        };
      default:
        return {
          badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          text: 'text-emerald-700 dark:text-emerald-300'
        };
    }
  };

  const activeResult = showHistoryDetail || scanResult;

  // Clinically calibrated Risk Estimation for the active food
  const activeRisk = useMemo<FoodRiskEstimation | null>(() => {
    if (!activeResult || !activeResult.isFood) return null;
    if (activeResult.foodRisk && activeResult.foodRisk.riskLevel) {
      return activeResult.foodRisk;
    }
    return calculateFoodRiskEstimation(activeResult);
  }, [activeResult]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#142019] text-[#263D32] dark:text-[#E8F2EA] pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#263D32] text-white px-4 py-2.5 shadow-xl text-xs font-semibold animate-fadeIn border border-[#3A5547]">
          <Sparkles className="h-4 w-4 text-[#8FB899]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-[#E5E9E4] dark:border-[#243A2F] bg-white dark:bg-[#1C2B22] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F2EA] dark:bg-[#1A3022] text-[#263D32] dark:text-[#E8F2EA] border border-[#C8DEC3] dark:border-[#2D4C37]">
                  <Sparkles className="h-3.5 w-3.5 text-[#6B9E78]" />
                  {isTelugu ? 'జెమిని AI ఆహార స్కానర్' : 'Gemini 3.8 Multimodal AI'}
                </span>
                <span className="text-xs text-[#527060] dark:text-[#A8C7B1] font-medium">
                  {isTelugu ? 'గ్లైసిమిక్ ఇండెక్స్ & హార్మోన్ల విశ్లేషణ' : 'GI & PCOS Hormonal Health'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263D32] dark:text-white tracking-tight">
                {isTelugu ? 'ఆహారాన్ని స్కాన్ చేయండి' : 'Scan Your Food'}
              </h1>
              <p className="mt-1 text-sm text-[#527060] dark:text-[#C1D7C7] max-w-2xl">
                {isTelugu
                  ? 'మీ వండిన భోజనం లేదా వంటకం యొక్క ఫోటోను అప్‌లోడ్ చేయండి. AI గ్లైసిమిక్ ఇండెక్స్ (GI), ఇన్సులిన్ ప్రతిస్పందన మరియు PCOS అనుకూలతను తక్షణమే లెక్కిస్తుంది.'
                  : 'Capture or upload a photo of your meal. PCOSense AI identifies the dish, calculates its Glycemic Index (GI), and evaluates its insulin and hormonal impact on PCOS.'}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-[#E8F2EA]/60 dark:bg-[#16241D] p-1.5 rounded-2xl border border-[#C8DEC3] dark:border-[#243A2F]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('scanner');
                  setShowHistoryDetail(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'scanner' && !showHistoryDetail
                    ? 'bg-[#6B9E78] text-white shadow-xs'
                    : 'text-[#263D32] dark:text-[#E8F2EA] hover:bg-white/60 dark:hover:bg-[#1E3027]'
                }`}
                id="scan-food-tab-btn"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'ఆహార స్కానర్' : 'Food Scanner'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'history' || showHistoryDetail
                    ? 'bg-[#6B9E78] text-white shadow-xs'
                    : 'text-[#263D32] dark:text-[#E8F2EA] hover:bg-white/60 dark:hover:bg-[#1E3027]'
                }`}
                id="scan-history-tab-btn"
              >
                <History className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'స్కాన్ చరిత్ర' : 'Scan History'}</span>
                {historyList.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'history' || showHistoryDetail
                      ? 'bg-white text-[#263D32]'
                      : 'bg-[#E8F2EA] text-[#263D32]'
                  }`}>
                    {historyList.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Clinical Context Pill */}
          <div className="mt-4 p-3 rounded-xl bg-teal-50/70 dark:bg-slate-800/60 border border-teal-200/60 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-200">
            <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>{isTelugu ? 'PCOS లో GI ఎందుకు ముఖ్యం?' : 'Why GI Matters in PCOS:'}</strong>{' '}
              {isTelugu
                ? 'అధిక గ్లైసిమిక్ ఇండెక్స్ (High GI) కలిగిన ఆహారాలు ఇన్సులిన్ స్థాయిలను వేగంగా పెంచుతాయి. అధిక ఇన్సులిన్ అండాశయాలలో టెస్టోస్టెరాన్ ఉత్పత్తిని ప్రేరేపించి పీరియడ్స్ అసాధారణత మరియు మొటిమలను పెంచుతుంది.'
                : 'High Glycemic Index (GI) meals trigger sharp post-prandial insulin surges. Excess circulating insulin directly stimulates ovarian theca cells to overproduce androgens (testosterone), exacerbating irregular cycles, hirsutism, and acne.'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* ========================================================================= */}
        {/* VIEW 1: SCANNER & ANALYSIS */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && !showHistoryDetail && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input & Capture (lg: 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>{isTelugu ? 'ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి' : 'Capture or Upload Dish'}</span>
                  </h2>

                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        setScannerMode('upload');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        scannerMode === 'upload'
                          ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title="File Upload"
                    >
                      <UploadCloud className="h-3.5 w-3.5 inline mr-1" />
                      {isTelugu ? 'ఫైల్' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        scannerMode === 'camera'
                          ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title="Live Camera"
                    >
                      <Camera className="h-3.5 w-3.5 inline mr-1" />
                      {isTelugu ? 'కెమెరా' : 'Camera'}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {cameraError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* 1. Camera Live Stream Mode */}
                {scannerMode === 'camera' && isCameraActive && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-teal-500 shadow-md">
                      <video
                        ref={videoRef}
                        playsInline
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Viewfinder Target Graphic */}
                      <div className="absolute inset-8 border border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-[11px] font-bold text-white/80 bg-black/50 px-2 py-1 rounded-md backdrop-blur-xs">
                          {isTelugu ? 'వంటకాన్ని మధ్యలో ఉంచండి' : 'Frame food in center'}
                        </span>
                      </div>

                      {/* Camera Flip Control */}
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        title="Flip Camera"
                        aria-label="Flip camera"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                        id="capture-photo-btn"
                      >
                        <Camera className="h-4 w-4" />
                        <span>{isTelugu ? 'ఫోటో తీయండి' : 'Capture Snapshot'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopCameraStream();
                          setScannerMode('upload');
                        }}
                        className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {isTelugu ? 'రద్దు' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Upload / Image Selected Mode */}
                {(scannerMode === 'upload' || (!isCameraActive && scannerMode === 'camera')) && (
                  <div className="space-y-4">
                    {previewImage ? (
                      /* Preview of Selected/Captured Image */
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-4/3 group">
                        <img
                          src={previewImage}
                          alt="Scanned dish preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition-colors"
                          >
                            {isTelugu ? 'మార్చండి' : 'Change'}
                          </button>
                          <button
                            type="button"
                            onClick={handleResetScanner}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                            {isTelugu ? 'తొలగించు' : 'Remove'}
                          </button>
                        </div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                          {selectedFile ? selectedFile.name : 'Captured photo ready'}
                        </span>
                      </div>
                    ) : (
                      /* Dropzone Area */
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 group"
                        id="food-upload-dropzone"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="hidden"
                          id="food-image-input"
                        />
                        <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {isTelugu ? 'ఫోటోను ఇక్కడ వేయండి లేదా క్లిక్ చేయండి' : 'Tap to upload dish photo'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {isTelugu ? 'మొబైల్ కెమెరా లేదా గ్యాలరీ (JPEG, PNG)' : 'Supports mobile camera snapshot or file upload'}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                            <Camera className="h-3 w-3" />
                            {isTelugu ? 'కెమెరా ఎంచుకోండి' : 'Click to Take Photo'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Optional Dish Hint & Cooking Style */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isTelugu ? 'వంటకం పేరు / గమనిక (ఐచ్ఛికం):' : 'Dish name or home cooking notes (optional):'}
                      </label>
                      <input
                        type="text"
                        value={dishHint}
                        onChange={(e) => setDishHint(e.target.value)}
                        placeholder={isTelugu ? 'ఉదా. తక్కువ నూనెతో పాలకూర పనీర్' : 'e.g., Palak paneer with less oil and brown rice'}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        id="dish-hint-input"
                      />
                    </div>

                    {/* Dietary Preference Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isTelugu ? 'ఆహార ప్రాధాన్యత:' : 'Dietary Profile:'}
                      </label>
                      <select
                        value={dietaryPref}
                        onChange={(e) => setDietaryPref(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        id="diet-pref-select"
                      >
                        <option value="all">Standard / All</option>
                        <option value="vegetarian">Vegetarian (Lacto/Ovo)</option>
                        <option value="vegan">100% Plant-Based (Vegan)</option>
                        <option value="gluten_free">Gluten-Sensitive / Celiac-Safe</option>
                        <option value="dairy_free">Dairy-Free (PCOS Anti-Acne)</option>
                      </select>
                    </div>

                    {/* Action: Analyze with AI Button */}
                    <button
                      type="button"
                      disabled={!previewImage || isAnalyzing}
                      onClick={handleAnalyzeImage}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm shadow-sm transition-all ${
                        !previewImage || isAnalyzing
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-[#6B9E78] hover:bg-[#578463] text-white active:scale-98'
                      }`}
                      id="analyze-food-btn"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                          <span>{isTelugu ? 'విశ్లేషిస్తోంది...' : 'Analyzing Dish with AI...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-[#E8F2EA]" />
                          <span>{isTelugu ? 'PCOS & GI విశ్లేషించండి' : 'Analyze Food with AI'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Food Presets & Test Cases Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isTelugu ? 'నమూనా ఆహారాలు & పరీక్షలు' : 'Try Instant Samples & Test Cases'}
                  </h3>
                  <span className="text-[10px] text-slate-400">One-tap test</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {isTelugu
                    ? 'ఫోటో లేదా కెమెరా అందుబాటులో లేకుంటే, ఈ నమూనా ఆహారాలను లేదా ఆహారేతర పరీక్ష చిత్రాన్ని క్లిక్ చేయండి.'
                    : 'Select a sample meal or test the non-food detection filter with one tap:'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_FOOD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all hover:scale-[1.02] group"
                    >
                      <span className="text-xl shrink-0">{preset.thumbnailEmoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {preset.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {preset.category !== 'non_food' && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              preset.category === 'optimal'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : preset.category === 'moderate'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}>
                              {preset.category === 'optimal' ? 'Low Risk' : preset.category === 'moderate' ? 'Moderate Risk' : 'High GI'}
                            </span>
                          )}
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            preset.category === 'non_food'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {preset.category === 'non_food' ? 'Non-Food Test' : `GI: ${preset.giRating}`}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Results & Clinical Insights (lg: 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* State A: Loading Analysis Animation */}
              {isAnalyzing && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-teal-200 dark:border-teal-900 text-center shadow-lg animate-fadeIn">
                  <div className="mx-auto h-20 w-20 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 relative">
                    <Sparkles className="h-10 w-10 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                    {isTelugu ? 'AI మీ భోజనాన్ని విశ్లేషిస్తోంది' : 'Analyzing Food Composition & PCOS Impact'}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 h-6 transition-all duration-300">
                    {loadingSteps[loadingStepIndex]}
                  </p>
                  <div className="w-full max-w-xs mx-auto bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full transition-all duration-500 w-3/4 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
                    Evaluating glycemic curve, theca cell androgen stimulation, and nutrient density
                  </p>
                </div>
              )}

              {/* State B: Error Message */}
              {errorMessage && !isAnalyzing && (
                <div className="bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 text-rose-800 dark:text-rose-200 shadow-sm animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">
                        {isTelugu ? 'విశ్లేషణ విఫలమైంది' : 'Food Analysis Error'}
                      </h4>
                      <p className="mt-1 text-xs">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={handleAnalyzeImage}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                      >
                        {isTelugu ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry Analysis'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State C: RESULT - CASE 1: NOT A FOOD IMAGE (CRITICAL SPEC REQUIREMENT) */}
              {scanResult && !scanResult.isFood && !isAnalyzing && (
                <div className="bg-white dark:bg-[#1C2B22] rounded-3xl p-6 sm:p-8 border-2 border-[#D9822B] shadow-lg animate-fadeIn" id="non-food-rejection-card">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-[#E5E9E4] dark:border-[#2C3E33] pb-5">
                    <div className="h-14 w-14 rounded-2xl bg-[#FFF4DF] dark:bg-[#33240D] text-[#D9822B] flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#FFF4DF] dark:bg-[#33240D] text-[#7A510A] dark:text-[#FFE6B3] border border-[#F1DCB0] dark:border-[#5A4016] uppercase tracking-wide">
                          {isTelugu ? 'ఆహార చిత్రం కాదు' : 'Not a food image'}
                        </span>
                        {scanResult.detectedNonFoodType && (
                          <span className="text-xs text-[#527060] dark:text-[#A8C7B1] font-medium">
                            Detected: <strong>{scanResult.detectedNonFoodType}</strong>
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold text-[#263D32] dark:text-white mt-1">
                        {isTelugu ? 'దయచేసి మీ భోజన చిత్రాన్ని అప్‌లోడ్ చేయండి' : 'Please Upload a Photo of Your Food'}
                      </h3>
                    </div>
                  </div>

                  {/* Detailed Rejection Message */}
                  <div className="mt-5 p-4 rounded-2xl bg-[#FFF4DF] dark:bg-[#33240D] border border-[#F1DCB0] dark:border-[#5A4016] text-[#6C4405] dark:text-[#FFE6B3] text-sm leading-relaxed">
                    <p className="font-bold text-[#7A510A] dark:text-[#FFE6B3] mb-1">
                      {isTelugu ? 'AI గుర్తింపు గమనిక:' : 'PCOSense AI Detection Note:'}
                    </p>
                    <p>
                      {scanResult.rejectionMessage ||
                        (isTelugu
                          ? 'ఈ ఫోటో ఆహారంగా కనిపించడం లేదు. PCOSense AI మీ ఆహార పదార్థాలు మరియు భోజనాన్ని మాత్రమే విశ్లేషిస్తుంది. దయచేసి మీ వండిన వంటకం లేదా పదార్థాల ఫోటోను అప్‌లోడ్ చేయండి.'
                          : 'The uploaded image does not appear to be food. PCOSense AI is designed specifically to analyze prepared dishes, meals, snacks, and edible ingredients to calculate Glycemic Index (GI) and PCOS suitability. Please upload or capture a photo of your food instead.')}
                    </p>
                  </div>

                  {/* Thumbnail of what was rejected */}
                  {scanResult.imagePreviewUrl && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <img
                        src={scanResult.imagePreviewUrl}
                        alt="Scanned item"
                        className="h-16 w-16 rounded-lg object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {isTelugu ? 'స్కాన్ చేసిన చిత్రం' : 'Uploaded Image Sample'}
                        </p>
                        <p className="text-[11px] mt-0.5">
                          {scanResult.detectedNonFoodType
                            ? `Classified as ${scanResult.detectedNonFoodType}`
                            : 'Identified as non-edible subject'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Direct Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetScanner();
                        fileInputRef.current?.click();
                      }}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm shadow-md transition-all"
                      id="upload-food-retry-btn"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>{isTelugu ? 'ఆహార ఫోటోను అప్‌లోడ్ చేయండి' : 'Upload a Food Photo Instead'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(SAMPLE_FOOD_PRESETS[0])}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                    >
                      <span>{isTelugu ? 'నమూనా వంటకాన్ని పరీక్షించండి (పాలకూర పనీర్)' : 'Try Sample Dish (Palak Paneer)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* State D: RESULT - CASE 2: FOOD IDENTIFIED & COMPREHENSIVE PCOS GI ANALYSIS */}
              {activeResult && activeResult.isFood && !isAnalyzing && (
                <div className="space-y-6 animate-fadeIn" id="food-analysis-result-panel">
                  {/* Hero Dish Title & Meta Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {activeResult.imagePreviewUrl && (
                          <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                            <img
                              src={activeResult.imagePreviewUrl}
                              alt={activeResult.dishName || 'Food image'}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                              {activeResult.cuisine || 'Clinical Diet Analysis'}
                            </span>
                            {activeResult.servingSizeEstimate && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {activeResult.servingSizeEstimate}
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {activeResult.dishName || 'Identified Dish'}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Analyzed on {new Date(activeResult.analyzedAt).toLocaleDateString()} at{' '}
                            {new Date(activeResult.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Overall Risk & Suitability Badges */}
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        {/* Primary Food Risk Badge */}
                        {activeRisk && (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-3 py-1 rounded-xl text-xs font-black border shadow-2xs flex items-center gap-1.5 ${
                              getFoodRiskColor(activeRisk.riskLevel).badge
                            }`}>
                              <span className={`h-2 w-2 rounded-full ${getFoodRiskColor(activeRisk.riskLevel).dot}`} />
                              {activeRisk.riskLevel === 'Low'
                                ? (isTelugu ? 'తక్కువ ప్రమాదం (Low Risk)' : 'Low Food Risk')
                                : activeRisk.riskLevel === 'Moderate'
                                ? (isTelugu ? 'మధ్యస్థ ప్రమాదం (Moderate Risk)' : 'Moderate Risk')
                                : (isTelugu ? 'ఎక్కువ ప్రమాదం (Elevated Risk)' : 'Elevated Risk')}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                              {activeRisk.riskScore}%
                            </span>
                          </div>
                        )}

                        {/* PCOS Hormone Suitability Pill */}
                        {activeResult.pcosSuitability && (
                          <div className="flex flex-col items-start sm:items-end">
                            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border shadow-2xs ${
                              getSuitabilityColor(activeResult.pcosSuitability.rating).badge
                            }`}>
                              {activeResult.pcosSuitability.badge || `${activeResult.pcosSuitability.rating} for PCOS`}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                              Hormone Score: <strong className="text-slate-900 dark:text-white">{activeResult.pcosSuitability.score}/10</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 0: Comprehensive Food Risk Estimation (Calibrated to Avoid False High Risk) */}
                  {activeRisk && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4" id="food-risk-estimation-section">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-2xl ${
                            activeRisk.riskLevel === 'Low'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : activeRisk.riskLevel === 'Moderate'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}>
                            {activeRisk.riskLevel === 'Low' ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : activeRisk.riskLevel === 'Moderate' ? (
                              <Activity className="h-5 w-5" />
                            ) : (
                              <ShieldAlert className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{isTelugu ? 'ఆహార ప్రమాద స్థాయి అంచనా' : 'Food Risk Level Estimation'}</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {isTelugu
                                ? 'గ్లైసిమిక్ లోడ్, పీచు మరియు ప్రోటీన్ బఫర్ ఆధారంగా ఖచ్చితమైన అంచనా'
                                : 'Accurate estimation based on Glycemic Load, dietary fiber buffer & protein shielding'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 shadow-2xs ${
                            getFoodRiskColor(activeRisk.riskLevel).badge
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${getFoodRiskColor(activeRisk.riskLevel).dot}`} />
                            {activeRisk.riskLevel === 'Low'
                              ? (isTelugu ? 'తక్కువ ప్రమాదం (Low Risk)' : 'Low Risk Meal')
                              : activeRisk.riskLevel === 'Moderate'
                              ? (isTelugu ? 'మధ్యస్థ ప్రమాదం (Moderate Risk)' : 'Moderate Risk Meal')
                              : (isTelugu ? 'ఎక్కువ ప్రమాదం (Elevated Risk)' : 'Elevated Risk Meal')}
                          </span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {activeRisk.riskScore}/100 Risk Score
                          </span>
                        </div>
                      </div>

                      {/* Visual Risk Spectrum Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {isTelugu ? '0-35% తక్కువ ప్రమాదం (Low Risk)' : '0-35% Low Risk'}
                          </span>
                          <span className="text-amber-700 dark:text-amber-400">
                            {isTelugu ? '36-65% మధ్యస్థ ప్రమాదం (Moderate Risk)' : '36-65% Moderate Risk'}
                          </span>
                          <span className="text-rose-700 dark:text-rose-400">
                            {isTelugu ? '66-100% ఎక్కువ ప్రమాదం (Elevated Risk)' : '66-100% Elevated Risk'}
                          </span>
                        </div>

                        <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <div className="h-full w-full rounded-full flex">
                            <div className="h-full w-[35%] bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-90" />
                            <div className="h-full w-[30%] bg-gradient-to-r from-amber-400 to-amber-500 opacity-90" />
                            <div className="h-full w-[35%] bg-gradient-to-r from-rose-400 to-rose-600 opacity-90" />
                          </div>

                          {/* Current meal indicator needle */}
                          <div
                            className="absolute top-0 bottom-0 w-3 bg-slate-900 dark:bg-white rounded-full shadow-md -translate-x-1/2 border-2 border-white dark:border-slate-900 transition-all duration-700"
                            style={{ left: `${Math.min(97, Math.max(3, activeRisk.riskScore))}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                          <span>{isTelugu ? 'ఇన్సులిన్ స్థిరంగా ఉంటుంది' : 'Stable glucose & gentle insulin curve'}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isTelugu ? 'ఈ ఆహార ప్రమాద స్కోరు' : 'Meal estimated at'}: <strong className="text-slate-900 dark:text-white font-extrabold">{activeRisk.riskScore}%</strong>
                          </span>
                          <span>{isTelugu ? 'పీచు/ప్రోటీన్ జత చేయాలి' : 'Refined carbs need fiber pairing'}</span>
                        </div>
                      </div>

                      {/* Risk Rationale / Clinical Explanation */}
                      <div className={`p-4 rounded-2xl border ${
                        activeRisk.riskLevel === 'Low'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : activeRisk.riskLevel === 'Moderate'
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      }`}>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          {isTelugu ? (activeRisk.riskTitleTe || activeRisk.riskTitle) : activeRisk.riskTitle}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          {isTelugu ? (activeRisk.riskExplanationTe || activeRisk.riskExplanation) : activeRisk.riskExplanation}
                        </p>
                      </div>

                      {/* 3 Pillars of Risk Estimation */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Glycemic Surge Risk */}
                        <div className="p-3.5 rounded-2xl bg-[#E8F2EA]/70 dark:bg-[#1A3022]/70 border border-[#C8DEC3] dark:border-[#2D4C37]">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {isTelugu ? 'గ్లూకోజ్ స్పైక్ ప్రమాదం' : 'Glucose Surge Risk'}
                          </p>
                          <p className="text-sm font-extrabold text-[#263D32] dark:text-[#E8F2EA] mt-0.5">
                            {activeRisk.glycemicSurgeRisk} Risk
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Carbohydrate digestion rate
                          </p>
                        </div>

                        {/* 2. Insulin Spike Probability */}
                        <div className="p-3.5 rounded-2xl bg-[#FFF4DF]/70 dark:bg-[#33240D]/70 border border-[#F1DCB0] dark:border-[#5A4016]">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {isTelugu ? 'ఇన్సులిన్ స్పైక్ సంభావ్యత' : 'Insulin Surge Probability'}
                          </p>
                          <p className="text-sm font-extrabold text-[#7A510A] dark:text-[#FFE6B3] mt-0.5">
                            {activeRisk.insulinSpikeProbability}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Impact on ovarian androgen production
                          </p>
                        </div>

                        {/* 3. Metabolic Fiber & Protein Buffer */}
                        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {isTelugu ? 'పీచు & ప్రోటీన్ రక్షణ' : 'Fiber & Protein Shield'}
                          </p>
                          <p className="text-sm font-extrabold text-teal-800 dark:text-teal-200 mt-0.5">
                            {activeRisk.metabolicBufferRating}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Slows gastric emptying & absorption
                          </p>
                        </div>
                      </div>

                      {/* Mitigating Factors Highlights */}
                      {activeRisk.mitigatingFactors && activeRisk.mitigatingFactors.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            {isTelugu ? 'ఈ భోజనాన్ని సురక్షితంగా ఉంచే అంశాలు:' : 'Factors Keeping This Food Balanced & Safe:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {activeRisk.mitigatingFactors.map((factor, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                              >
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{factor}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 1: Glycemic Index (GI) & Blood Sugar Curve Meter */}
                  {activeResult.glycemicIndex && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getGiColor(activeResult.glycemicIndex.rating).dot}`} />
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {isTelugu ? 'గ్లైసిమిక్ ఇండెక్స్ (GI) విశ్లేషణ' : 'Glycemic Index (GI) & Glucose Response'}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${getGiColor(activeResult.glycemicIndex.rating).bg} ${getGiColor(activeResult.glycemicIndex.rating).text} ${getGiColor(activeResult.glycemicIndex.rating).border}`}>
                          {activeResult.glycemicIndex.rating} GI ({activeResult.glycemicIndex.valueEstimate})
                        </span>
                      </div>

                      {/* Visual 3-Level GI Spectrum Gauge */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400">Low GI (&le; 55)</span>
                          <span className="text-amber-600 dark:text-amber-400">Medium GI (56-69)</span>
                          <span className="text-rose-600 dark:text-rose-400">High GI (&ge; 70)</span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-200 dark:border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              activeResult.glycemicIndex.rating === 'Low'
                                ? 'bg-emerald-500 w-1/3 shadow-sm'
                                : 'bg-emerald-200 dark:bg-emerald-950 w-1/3 opacity-40'
                            }`}
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              activeResult.glycemicIndex.rating === 'Medium'
                                ? 'bg-amber-500 w-1/3 shadow-sm'
                                : 'bg-amber-200 dark:bg-amber-950 w-1/3 opacity-40'
                            }`}
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              activeResult.glycemicIndex.rating === 'High'
                                ? 'bg-rose-500 w-1/3 shadow-sm'
                                : 'bg-rose-200 dark:bg-rose-950 w-1/3 opacity-40'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Glycemic Load & Blood Sugar Impact Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {isTelugu ? 'గ్లైసిమిక్ లోడ్ (GL):' : 'Glycemic Load (GL) Estimate:'}
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {activeResult.glycemicIndex.glycemicLoad} GL ({activeResult.glycemicIndex.glEstimate})
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Portion-adjusted glucose surge calculation
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {isTelugu ? 'రక్తంలో గ్లూకోజ్ ప్రభావం:' : 'Post-Prandial Glucose Curve:'}
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                            {activeResult.glycemicIndex.bloodSugarImpact}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 2: PCOS Hormonal Suitability Breakdown */}
                  {activeResult.pcosSuitability && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span>{isTelugu ? 'PCOS హార్మోన్ల అనుకూలత' : 'PCOS Endocrine & Hormonal Suitability'}</span>
                        </h3>
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                          Clinical Rating: {activeResult.pcosSuitability.rating}
                        </span>
                      </div>

                      {/* Clinical Summary */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeResult.pcosSuitability.summary}
                      </p>

                      {/* 4 Pillars of PCOS Nutrition */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {/* 1. Insulin Resistance - Light Green */}
                        <div className="p-4 rounded-2xl bg-[#E8F2EA] dark:bg-[#1A3022] border border-[#C8DEC3] dark:border-[#2D4C37]">
                          <p className="text-xs font-bold text-[#263D32] dark:text-[#E8F2EA] flex items-center gap-1.5 mb-1">
                            <Activity className="h-3.5 w-3.5 text-[#6B9E78]" />
                            <span>{isTelugu ? 'ఇన్సులిన్ నిరోధకత & GLUT4' : 'Insulin Resistance & GLUT4'}</span>
                          </p>
                          <p className="text-xs text-[#527060] dark:text-[#C1D7C7] leading-relaxed">
                            {activeResult.pcosSuitability.insulinResistanceImpact}
                          </p>
                        </div>

                        {/* 2. Androgen / Ovarian Balance - Lavender */}
                        <div className="p-4 rounded-2xl bg-[#F1ECF7] dark:bg-[#2A1D3A] border border-[#DFD3EC] dark:border-[#4B3167]">
                          <p className="text-xs font-bold text-[#6C4E8F] dark:text-[#E4D7F2] flex items-center gap-1.5 mb-1">
                            <Heart className="h-3.5 w-3.5 text-[#9B7EBD]" />
                            <span>{isTelugu ? 'ఆండ్రోజెన్లు & అండాశయ సమతుల్యత' : 'Androgens & Ovarian Theca Balance'}</span>
                          </p>
                          <p className="text-xs text-[#5C427B] dark:text-[#DFD3EC] leading-relaxed">
                            {activeResult.pcosSuitability.androgenAndOvaryImpact}
                          </p>
                        </div>

                        {/* 3. Anti-Inflammatory Index - Soft Pink */}
                        <div className="p-4 rounded-2xl bg-[#F8EDF1] dark:bg-[#341A22] border border-[#F2D8E0] dark:border-[#5B2939]">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-[#8C384F] dark:text-[#F3D7E0] flex items-center gap-1.5">
                              <Leaf className="h-3.5 w-3.5 text-[#E8A6B8]" />
                              <span>{isTelugu ? 'యాంటీ ఇన్‌ఫ్లమేటరీ స్కోరు' : 'Anti-Inflammatory Profile'}</span>
                            </p>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E8A6B8]/30 dark:bg-[#E8A6B8]/20 text-[#8C384F] dark:text-[#F8D1DC]">
                              {activeResult.pcosSuitability.antiInflammatoryScore}
                            </span>
                          </div>
                          <p className="text-xs text-[#7A3648] dark:text-[#F2D8E0] leading-relaxed">
                            {activeResult.pcosSuitability.antiInflammatoryDetails || 'Evaluates antioxidant spices, omega fats, and absence of refined pro-inflammatory seed oils.'}
                          </p>
                        </div>

                        {/* 4. Gut Health & Estrogen Clearance - Amber */}
                        <div className="p-4 rounded-2xl bg-[#FFF4DF] dark:bg-[#33240D] border border-[#F1DCB0] dark:border-[#5A4016]">
                          <p className="text-xs font-bold text-[#7A510A] dark:text-[#FFE6B3] flex items-center gap-1.5 mb-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#D9822B]" />
                            <span>{isTelugu ? 'జీర్ణక్రియ & ఈస్ట్రోజెన్ తొలగింపు' : 'Gut Health & Estrogen Clearance'}</span>
                          </p>
                          <p className="text-xs text-[#704A08] dark:text-[#FFE6B3] leading-relaxed">
                            {activeResult.pcosSuitability.gutHealthAndFiber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Detailed Macronutrient Breakdown (Protein, Carbs, Fats, Fiber) */}
                  {activeResult.estimatedNutrition && (() => {
                    const nutrition = activeResult.estimatedNutrition;
                    const carbs = Number(nutrition.carbsG) || 0;
                    const protein = Number(nutrition.proteinG) || 0;
                    const fat = Number(nutrition.fatG) || 0;
                    const fiber = Number(nutrition.fiberG) || 0;
                    const netCarbs = nutrition.netCarbsG !== undefined ? nutrition.netCarbsG : Math.max(0, carbs - fiber);
                    const calories = nutrition.calories || ((carbs * 4) + (protein * 4) + (fat * 9));

                    const carbCal = carbs * 4;
                    const proteinCal = protein * 4;
                    const fatCal = fat * 9;
                    const totalCal = carbCal + proteinCal + fatCal || 1;

                    const proteinPct = nutrition.macroPercentages?.protein ?? Math.round((proteinCal / totalCal) * 100);
                    const carbsPct = nutrition.macroPercentages?.carbs ?? Math.round((carbCal / totalCal) * 100);
                    const fatPct = nutrition.macroPercentages?.fat ?? Math.max(0, 100 - (proteinPct + carbsPct));

                    return (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>{isTelugu ? 'వివరణాత్మక పోషకాల విశ్లేషణ (Macronutrient Breakdown)' : 'Detailed Macronutrient Breakdown & Energy Distribution'}</span>
                          </h3>
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {calories} kcal Total Energy
                          </span>
                        </div>

                        {/* Macro Ratio Distribution Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span>{isTelugu ? 'కెలొరీల నిష్పత్తి (Macro Ratio)' : 'Caloric Energy Share:'}</span>
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400">
                                <span className="h-2 w-2 rounded-full bg-teal-500" />
                                Protein: {proteinPct}%
                              </span>
                              <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Carbs: {carbsPct}%
                              </span>
                              <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                Fats: {fatPct}%
                              </span>
                            </div>
                          </div>

                          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                            <div
                              style={{ width: `${proteinPct}%` }}
                              className="bg-teal-500 h-full transition-all duration-500"
                              title={`Protein: ${proteinPct}%`}
                            />
                            <div
                              style={{ width: `${carbsPct}%` }}
                              className="bg-amber-400 h-full transition-all duration-500"
                              title={`Carbs: ${carbsPct}%`}
                            />
                            <div
                              style={{ width: `${fatPct}%` }}
                              className="bg-indigo-400 h-full transition-all duration-500"
                              title={`Healthy Fats: ${fatPct}%`}
                            />
                          </div>
                        </div>

                        {/* 4 Primary Macronutrient Cards: Protein, Carbs, Fats, Fiber */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                          
                          {/* 1. Protein Card */}
                          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide">Protein</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-200/60 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200">
                                {proteinPct}% kcal
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-teal-950 dark:text-teal-100">{protein}</span>
                              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">grams</span>
                            </div>
                            <p className="text-[11px] text-teal-700 dark:text-teal-300 leading-snug">
                              {isTelugu ? 'కండరాల రక్షణ & ఇన్సులిన్ స్థాయిల స్థిరత్వం' : 'Satiety hormone GLP-1 & insulin stabilizing buffer'}
                            </p>
                          </div>

                          {/* 2. Total & Net Carbohydrates Card */}
                          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Carbohydrates</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                                {netCarbs}g Net
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-amber-950 dark:text-amber-100">{carbs}</span>
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">grams</span>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">
                              {isTelugu ? `${netCarbs} గ్రాములు రక్తంలో శోషించబడే గ్లూకోజ్` : `${netCarbs}g active carbohydrates post-fiber subtraction`}
                            </p>
                          </div>

                          {/* 3. Dietary Fiber Card */}
                          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Dietary Fiber</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                                Shield
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">{fiber}</span>
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">grams</span>
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug">
                              {isTelugu ? 'జీర్ణక్రియ నెమ్మదిస్తుంది & చక్కెర స్పైక్‌ను తగ్గిస్తుంది' : 'Viscous buffer that blunts glycemic curve'}
                            </p>
                          </div>

                          {/* 4. Total Healthy Fats Card */}
                          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Fats</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200">
                                {fatPct}% kcal
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100">{fat}</span>
                              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">grams</span>
                            </div>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-snug">
                              {isTelugu ? 'హార్మోన్ల తయారీ & విటమిన్ శోషణకు తోడ్పడుతుంది' : 'Steroid hormone synthesis & slow gastric emptying'}
                            </p>
                          </div>

                        </div>

                        {/* Clinical Macronutrient Summary Note */}
                        {(nutrition.macroBreakdownSummary || nutrition.macroBreakdownSummaryTe) && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            <strong className="text-slate-900 dark:text-white mr-1.5">
                              {isTelugu ? 'క్లినికల్ పోషక నిష్పత్తి విశ్లేషణ:' : 'Endocrine Macro Ratio Insight:'}
                            </strong>
                            {isTelugu
                              ? (nutrition.macroBreakdownSummaryTe || nutrition.macroBreakdownSummary)
                              : nutrition.macroBreakdownSummary}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Section 4: Identified Ingredients */}
                  {activeResult.ingredientsIdentified && activeResult.ingredientsIdentified.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                        {isTelugu ? 'గుర్తించిన పదార్థాలు (Ingredients)' : 'Identified Food Components'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeResult.ingredientsIdentified.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            <Check className="h-3 w-3 text-teal-500" />
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 5: Clinical Kitchen Tweaks for PCOS */}
                  {activeResult.clinicalTweaks && activeResult.clinicalTweaks.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-200 dark:border-teal-900/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {isTelugu ? 'PCOS కోసం వంట సలహాలు (Clinical Tweaks)' : 'Clinical PCOS Tweaks & Ingredient Swaps'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {isTelugu
                          ? 'ఈ వంటకాన్ని మీ హార్మోన్లకు మరింత అనుకూలంగా మార్చడానికి చిన్న మార్పులు:'
                          : 'Simple, actionable culinary adjustments to flatten post-meal glucose spikes even further:'}
                      </p>

                      <div className="space-y-3">
                        {activeResult.clinicalTweaks.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/70 dark:border-slate-700 flex items-start gap-3"
                          >
                            <span className="h-6 w-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.tweak}
                              </p>
                              <p className="text-xs text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
                                <strong>Why:</strong> {item.benefit}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 6: Recommended Pairings & Habits */}
                  {activeResult.suggestedPairings && activeResult.suggestedPairings.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>{isTelugu ? 'సిఫార్సు చేసిన జతలు & అలవాట్లు' : 'Optimal Pairings & Micro-Habits'}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeResult.suggestedPairings.map((pairing, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                            <span>{pairing}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetScanner}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{isTelugu ? 'మరొక వంటకాన్ని స్కాన్ చేయండి' : 'Scan Another Meal'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendWhatsAppSummary}
                        disabled={isSendingWhatsApp}
                        id="send-food-whatsapp-summary-btn"
                        className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold text-xs transition-colors shadow-2xs disabled:opacity-50"
                        title="Send meal summary and nutrition guidance to your WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {isSendingWhatsApp
                            ? (isTelugu ? 'పంపుతోంది...' : 'Sending...')
                            : (isTelugu ? 'వాట్సాప్ సారాంశం' : 'Send to WhatsApp')}
                        </span>
                      </button>

                      <Link
                        to="/nutrition"
                        className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                      >
                        <Utensils className="h-3.5 w-3.5 text-teal-600" />
                        <span>{isTelugu ? 'న్యూట్రిషన్ ట్రాకర్' : 'Log in Nutrition Tracker'}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                        title="Print / Save Meal Report"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State E: Initial Empty State */}
              {!activeResult && !isAnalyzing && !errorMessage && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                    <Utensils className="h-8 w-8 stroke-[1.8]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'భోజన విశ్లేషణ ఫలితం ఇక్కడ కనిపిస్తుంది' : 'Your Meal Analysis Will Appear Here'}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {isTelugu
                      ? 'ఎడమ వైపున మీ భోజన ఫోటోను తీయండి లేదా అప్‌లోడ్ చేసి "విశ్లేషించండి" క్లిక్ చేయండి.'
                      : 'Snap or upload a photo on the left, or tap any of the sample dishes to see immediate PCOS suitability and Glycemic Index ratings.'}
                  </p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Step 1</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Photo Capture</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Take photo or upload meal</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Step 2</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Food Validation</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">AI confirms food presence</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Step 3</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">GI & Hormones</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Full PCOS impact metrics</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SCAN HISTORY */}
        {/* ========================================================================= */}
        {(activeTab === 'history' || showHistoryDetail) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>{isTelugu ? 'గతంలో స్కాన్ చేసిన భోజనాలు' : 'Scanned Meals History'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {historyList.length} {historyList.length === 1 ? 'meal analyzed' : 'meals analyzed'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoryDetail(null);
                    setActiveTab('scanner');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-colors"
                >
                  <Camera className="h-3.5 w-3.5 inline mr-1" />
                  {isTelugu ? 'కొత్త స్కాన్' : 'New Scan'}
                </button>

                {historyList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                    {isTelugu ? 'అన్నీ తొలగించు' : 'Clear All'}
                  </button>
                )}
              </div>
            </div>

            {historyList.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <History className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {isTelugu ? 'స్కాన్ చరిత్ర ఖాళీగా ఉంది' : 'No Scanned Meals Yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  {isTelugu
                    ? 'మీరు స్కాన్ చేసే ఆహారాలు ఇక్కడ స్వయంచాలకంగా సేవ్ చేయబడతాయి.'
                    : 'Dishes you photograph and analyze will be recorded here so you can review your nutritional glycemic trends over time.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('scanner');
                    setShowHistoryDetail(null);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-600 transition-colors"
                >
                  {isTelugu ? 'మొదటి భోజనాన్ని స్కాన్ చేయండి' : 'Scan Your First Meal'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowHistoryDetail(item);
                      setActiveTab('scanner');
                    }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
                      !item.isFood
                        ? 'border-amber-300 dark:border-amber-850 bg-amber-50/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.imagePreviewUrl && (
                        <img
                          src={item.imagePreviewUrl}
                          alt={item.dishName || 'Meal'}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {item.foodRisk && (
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                item.foodRisk.riskLevel === 'Low'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : item.foodRisk.riskLevel === 'Moderate'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              }`}>
                                {item.foodRisk.riskLevel} Risk
                              </span>
                            )}
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              !item.isFood
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : item.glycemicIndex?.rating === 'Low'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : item.glycemicIndex?.rating === 'Medium'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}>
                              {!item.isFood ? 'Non-Food' : `GI: ${item.glycemicIndex?.rating || 'Est'}`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteScan(item.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                          {!item.isFood ? 'Non-Food Photo' : item.dishName || 'Scanned Meal'}
                        </p>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(item.analyzedAt).toLocaleDateString()}
                        </p>

                        {item.pcosSuitability && (
                          <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 mt-1 truncate">
                            {item.pcosSuitability.badge}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanFoodPage;
