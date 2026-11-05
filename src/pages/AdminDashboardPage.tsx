import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  DollarSign,
  Video,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Building,
  TrendingUp,
  Percent,
  Activity,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Play,
  Pause,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  MessageSquare,
  Send,
  Smartphone,
  RefreshCw,
  Sliders,
  Globe,
  Eye,
  Bot,
  Calendar,
  Tv,
  QrCode,
  Upload,
  Image as ImageIcon,
  Edit3,
  Camera,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { WhatsAppAutomationDashboard } from '../components/WhatsAppAutomationDashboard';
import {
  getStoredDoctors,
  updateDoctorVerificationStatus,
  deleteDoctor,
  addDoctor,
  registerDoctor,
  updateDoctor,
  fetchDoctorsFromFirestore
} from '../services/doctorService';
import { getPlatformFinancialStats, getStoredAppointments, getStoredConsultations } from '../services/appointmentService';
import {
  getStoredYogaVideos,
  addYogaVideo,
  deleteYogaVideo,
  fetchYogaVideosFromFirestore
} from '../services/yogaService';
import {
  getStoredRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  fetchRecipesFromFirestore
} from '../services/recipeNutritionService';
import {
  getAdminBankAccountDetails,
  saveAdminBankAccountDetails,
  fetchAdminBankAccountDetailsFromFirestore,
  getAllSubscriptionPayments,
  getTotalSubscriptionRevenue,
  getActiveSubscriptionsSummary,
  AdminBankAccountDetails,
  ActiveSubscriptionsSummary
} from '../services/subscriptionService';
import {
  getStoredCampaigns,
  saveCampaign,
  updateCampaignStatus,
  deleteCampaign,
  getStoredWhatsAppAnalytics,
  getStoredWhatsAppSettings,
  saveWhatsAppSettings,
  generateAICampaignMessage,
  sendTestWhatsAppMessage,
  simulateIncomingWhatsAppMessage
} from '../services/whatsappService';
import { YouTubePlayer } from '../components/YouTubePlayer';
import {
  DoctorProfile,
  YogaVideoItem,
  DetailedRecipeItem,
  WhatsAppCampaign,
  WhatsAppMessageType,
  WhatsAppCampaignStatus,
  WhatsAppAutomationStats,
  WhatsAppConfigSettings
} from '../types';
import { useLanguage } from '../translations';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isTelugu } = useLanguage();
  const [searchParams] = useSearchParams();

  // Admin tabs including WhatsApp Automation
  const [activeTab, setActiveTab] = useState<'commission' | 'admin_account' | 'doctors' | 'food' | 'yoga_exercise' | 'subscriptions' | 'whatsapp'>(() => {
    return searchParams.get('tab') === 'whatsapp' ? 'whatsapp' : 'commission';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'whatsapp') {
      setActiveTab('whatsapp');
    }
  }, [searchParams]);

  // State
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => getStoredDoctors());
  const [videos, setVideos] = useState<YogaVideoItem[]>(() => getStoredYogaVideos());
  const [adminVideoFilter, setAdminVideoFilter] = useState<'all' | 'te' | 'en'>('all');
  const [recipes, setRecipes] = useState<DetailedRecipeItem[]>(() => getStoredRecipes());
  const [financialStats, setFinancialStats] = useState(() => getPlatformFinancialStats());
  const [subRevenue, setSubRevenue] = useState(() => getTotalSubscriptionRevenue());
  const [subPayments, setSubPayments] = useState(() => getAllSubscriptionPayments());
  const [activeSubSummary, setActiveSubSummary] = useState<ActiveSubscriptionsSummary>(() => getActiveSubscriptionsSummary());

  // Admin Bank Account State
  const [adminBank, setAdminBank] = useState<AdminBankAccountDetails>(() => getAdminBankAccountDetails());
  const [bankSuccessToast, setBankSuccessToast] = useState<string>('');
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);

  // Doctor Form Modal
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('Gynecologist & PCOS Specialist');
  const [newDoctorClinic, setNewDoctorClinic] = useState('');
  const [newDoctorFee, setNewDoctorFee] = useState(900);
  const [newDoctorExperience, setNewDoctorExperience] = useState(10);
  const [newDoctorQualification, setNewDoctorQualification] = useState('MBBS, MD');
  const [newDoctorLicense, setNewDoctorLicense] = useState(`TS-MCI-2015-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newDoctorCouncil, setNewDoctorCouncil] = useState('Telangana State Medical Council');

  // Video Form Modal with Telugu / English playlist selection
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoTitleTe, setNewVideoTitleTe] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoLanguage, setNewVideoLanguage] = useState<'te' | 'en'>('te');
  const [newVideoChannel, setNewVideoChannel] = useState('Dr Manthena Satyanarayana Raju');
  const [newVideoCategory, setNewVideoCategory] = useState<'Yoga' | 'Beginner Yoga' | 'Stretching' | 'Breathing Exercises' | 'Low Impact Exercise' | 'Walking' | 'PCOS-friendly Movement'>('Yoga');
  const [newVideoDuration, setNewVideoDuration] = useState('15 min');
  const [newVideoDifficulty, setNewVideoDifficulty] = useState<'Gentle' | 'Beginner' | 'Intermediate'>('Beginner');
  const [newVideoBenefits, setNewVideoBenefits] = useState('Cortisol reduction, pelvic circulation, insulin sensitization');
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // Food / Recipe Form Modal
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodNameTe, setNewFoodNameTe] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage'>('Breakfast');
  const [newFoodCalories, setNewFoodCalories] = useState<number>(320);
  const [newFoodProtein, setNewFoodProtein] = useState<number>(14);
  const [newFoodCarbs, setNewFoodCarbs] = useState<number>(35);
  const [newFoodFat, setNewFoodFat] = useState<number>(10);
  const [newFoodFiber, setNewFoodFiber] = useState<number>(8);
  const [newFoodGI, setNewFoodGI] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [newFoodIngredients, setNewFoodIngredients] = useState('Foxtail millet, chia seeds, carrots, cold-pressed oil, turmeric');
  const [newFoodInstructions, setNewFoodInstructions] = useState('Rinse millet thoroughly, sauté with veggies and simmer for 12 minutes.');
  const [newFoodBenefits, setNewFoodBenefits] = useState('High soluble prebiotic fiber, low glycemic index, rich in plant inositol');
  const [newFoodImage, setNewFoodImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400');

  // Edit Existing Recipe / Menu Item State (Admin Edit Option with Images)
  const [editingRecipe, setEditingRecipe] = useState<DetailedRecipeItem | null>(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editFoodNameTe, setEditFoodNameTe] = useState('');
  const [editFoodCategory, setEditFoodCategory] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage'>('Breakfast');
  const [editFoodCalories, setEditFoodCalories] = useState<number>(320);
  const [editFoodProtein, setEditFoodProtein] = useState<number>(14);
  const [editFoodCarbs, setEditFoodCarbs] = useState<number>(35);
  const [editFoodFat, setEditFoodFat] = useState<number>(10);
  const [editFoodFiber, setEditFoodFiber] = useState<number>(8);
  const [editFoodGI, setEditFoodGI] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [editFoodIngredients, setEditFoodIngredients] = useState('');
  const [editFoodInstructions, setEditFoodInstructions] = useState('');
  const [editFoodBenefits, setEditFoodBenefits] = useState('');
  const [editFoodImage, setEditFoodImage] = useState('');

  // WhatsApp Automation State
  const [whatsappCampaigns, setWhatsappCampaigns] = useState<WhatsAppCampaign[]>(() => getStoredCampaigns());
  const [whatsappStats, setWhatsappStats] = useState<WhatsAppAutomationStats>(() => getStoredWhatsAppAnalytics());
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppConfigSettings>(() => getStoredWhatsAppSettings());
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Campaign Form Modal
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Opted-in Users');
  const [campaignLanguage, setCampaignLanguage] = useState<'en' | 'te' | 'both'>('both');
  const [messageType, setMessageType] = useState<WhatsAppMessageType>('PCOS Awareness');
  const [messageContent, setMessageContent] = useState('');
  const [messageContentTe, setMessageContentTe] = useState('');
  const [campaignSchedule, setCampaignSchedule] = useState('Immediately');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [campaignStatus, setCampaignStatus] = useState<WhatsAppCampaignStatus>('Active');

  // AI Campaign Generator Modal
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('PCOS symptom tracking');
  const [aiAudience, setAiAudience] = useState('Registered PCOSense users');
  const [aiLanguage, setAiLanguage] = useState<'en' | 'te'>('en');
  const [aiTone, setAiTone] = useState<'Empathetic' | 'Encouraging' | 'Educational' | 'Motivational'>('Empathetic');
  const [aiLength, setAiLength] = useState<'Short (<160 chars)' | 'Standard (<300 chars)' | 'Detailed'>('Standard (<300 chars)');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<string | null>(null);
  const [aiGeneratedModel, setAiGeneratedModel] = useState<string | null>(null);

  // Send Test Message Modal
  const [isTestMessageOpen, setIsTestMessageOpen] = useState(false);
  const [testRecipientPhone, setTestRecipientPhone] = useState('+91 98765 43210');
  const [testContent, setTestContent] = useState('');
  const [testLanguage, setTestLanguage] = useState<'en' | 'te'>('en');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [testDirectWaUrl, setTestDirectWaUrl] = useState<string | null>(null);

  // Webhook Simulator State
  const [simPhone, setSimPhone] = useState('919876543210');
  const [simInput, setSimInput] = useState('TRACK');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState<{ sender: 'user' | 'system'; text: string; intent?: string; timestamp: string }[]>([
    {
      sender: 'user',
      text: 'How can I track my symptoms?',
      intent: 'TRACK',
      timestamp: '10:02 AM'
    },
    {
      sender: 'system',
      text: 'Open PCOSense → Symptom Tracker → Click "Log Today\'s Symptoms" to record energy, cycle, mood, and sleep.',
      intent: 'TRACK',
      timestamp: '10:02 AM'
    }
  ]);

  // Helper to refresh data
  const refreshAll = () => {
    setDoctors(getStoredDoctors());
    setVideos(getStoredYogaVideos());
    setRecipes(getStoredRecipes());
    setFinancialStats(getPlatformFinancialStats());
    setSubRevenue(getTotalSubscriptionRevenue());
    setSubPayments(getAllSubscriptionPayments());
    setActiveSubSummary(getActiveSubscriptionsSummary());
    setAdminBank(getAdminBankAccountDetails());
    setWhatsappCampaigns(getStoredCampaigns());
    setWhatsappStats(getStoredWhatsAppAnalytics());
    setWhatsappSettings(getStoredWhatsAppSettings());
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchDoctorsFromFirestore().catch(() => getStoredDoctors()),
      fetchRecipesFromFirestore().catch(() => getStoredRecipes()),
      fetchYogaVideosFromFirestore().catch(() => getStoredYogaVideos()),
      fetchAdminBankAccountDetailsFromFirestore().catch(() => getAdminBankAccountDetails())
    ]).then(([d, r, v, b]) => {
      if (isMounted) {
        if (d && d.length > 0) setDoctors(d);
        if (r && r.length > 0) setRecipes(r);
        if (v && v.length > 0) setVideos(v);
        if (b) setAdminBank(b);
      }
    });

    const handleUpdate = () => {
      refreshAll();
    };

    window.addEventListener('pcosense_doctors_updated', handleUpdate);
    window.addEventListener('pcosense_recipes_updated', handleUpdate);
    window.addEventListener('pcosense_yoga_videos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('pcosense_doctors_updated', handleUpdate);
      window.removeEventListener('pcosense_recipes_updated', handleUpdate);
      window.removeEventListener('pcosense_yoga_videos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // WhatsApp Actions
  const handleSaveFrequencyLimit = (newLimit: number) => {
    setIsSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const updated = saveWhatsAppSettings({ max_messages_per_user_weekly: newLimit });
      setWhatsappSettings(updated);
      setSettingsFeedback(`Frequency limit updated to ${newLimit} messages / user / week`);
      setTimeout(() => setSettingsFeedback(null), 3000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !messageContent.trim()) {
      alert('Please provide campaign name and message content.');
      return;
    }

    const newCampaign: WhatsAppCampaign = {
      id: `cmp-${Date.now().toString(36)}`,
      campaign_name: campaignName.trim(),
      target_audience: targetAudience,
      language: campaignLanguage,
      message_type: messageType,
      message_content: messageContent.trim(),
      message_content_te: messageContentTe.trim() || undefined,
      schedule: campaignSchedule,
      start_date: startDate,
      end_date: endDate,
      status: campaignStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        sent: campaignStatus === 'Active' ? 140 : 0,
        delivered: campaignStatus === 'Active' ? 134 : 0,
        read: campaignStatus === 'Active' ? 98 : 0,
        failed: campaignStatus === 'Active' ? 6 : 0,
        replies: campaignStatus === 'Active' ? 18 : 0
      }
    };

    saveCampaign(newCampaign);
    setIsCreateCampaignOpen(false);
    setCampaignName('');
    setMessageContent('');
    setMessageContentTe('');
    refreshAll();
  };

  const handleRunAIGenerator = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await generateAICampaignMessage({
        topic: aiTopic,
        target_audience: aiAudience,
        language: aiLanguage,
        tone: aiTone,
        message_length: aiLength
      });
      setAiGeneratedPreview(res.text);
      setAiGeneratedModel(res.model);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAIToCampaign = () => {
    if (aiGeneratedPreview) {
      if (aiLanguage === 'te') {
        setMessageContentTe(aiGeneratedPreview);
        if (!messageContent) setMessageContent(aiGeneratedPreview);
      } else {
        setMessageContent(aiGeneratedPreview);
      }
      setIsAIGeneratorOpen(false);
    }
  };

  const handleSendTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientPhone.trim() || !testContent.trim()) {
      setTestFeedback('Please enter both a valid recipient phone number and message content.');
      return;
    }

    setIsSendingTest(true);
    setTestFeedback(null);
    try {
      const cleanDigits = testRecipientPhone.replace(/\D/g, '');
      const cleanPhone = cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits.replace(/^0+/, '')}`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(testContent.trim())}`;
      setTestDirectWaUrl(waUrl);

      const res = await sendTestWhatsAppMessage({
        recipient_phone: testRecipientPhone.trim(),
        content: testContent.trim(),
        language: testLanguage
      });

      setTestFeedback(
        `✓ Test notification generated for +${cleanPhone}! You can click "Open WhatsApp & Send Now" below to send it directly.`
      );

      // Attempt popup launch
      try {
        window.open(waUrl, '_blank');
      } catch {}
    } catch (err: any) {
      setTestFeedback(err?.message || 'Failed to dispatch test WhatsApp message');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSimulateWebhook = async (textToSimulate?: string) => {
    const text = textToSimulate || simInput;
    if (!text.trim()) return;

    setIsSimulating(true);
    const userMsg = {
      sender: 'user' as const,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSimLog(prev => [userMsg, ...prev]);

    try {
      const resp = await simulateIncomingWhatsAppMessage(simPhone, text.trim());
      const sysMsg = {
        sender: 'system' as const,
        text: resp.reply,
        intent: resp.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSimLog(prev => [sysMsg, ...prev]);
      if (resp.status === 'opted_out') {
        refreshAll();
      }
    } finally {
      setIsSimulating(false);
      setSimInput('');
    }
  };

  // Copy helper
  const copyText = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedBankField(field);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  // Doctor Actions
  const handleVerifyDoctor = (id: string) => {
    updateDoctorVerificationStatus(id, 'verified');
    refreshAll();
  };

  const handleRejectDoctor = (id: string) => {
    updateDoctorVerificationStatus(id, 'rejected');
    refreshAll();
  };

  const handleDeleteDoctor = (id: string) => {
    if (confirm('Are you sure you want to remove this doctor from the platform?')) {
      deleteDoctor(id);
      refreshAll();
    }
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim()) return;

    registerDoctor({
      userId: `usr_doc_${Date.now()}`,
      name: newDoctorName.trim(),
      specialization: newDoctorSpecialty,
      qualification: newDoctorQualification.trim(),
      licenseNumber: newDoctorLicense.trim(),
      stateMedicalCouncil: newDoctorCouncil.trim(),
      registrationYear: 2015,
      experienceYears: Number(newDoctorExperience),
      clinic: newDoctorClinic.trim() || 'Apollo Fertility & Women Health',
      location: 'Hyderabad, Telangana',
      languages: ['English', 'Telugu', 'Hindi'],
      consultationFee: Number(newDoctorFee),
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        slots: ['10:00 AM - 10:30 AM', '02:00 PM - 02:30 PM']
      },
      about: 'Verified clinical practitioner specializing in reproductive endocrinology and PCOS management.',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
    });

    setIsAddDoctorOpen(false);
    setNewDoctorName('');
    setNewDoctorClinic('');
    refreshAll();
  };

  // Video Actions
  const extractVideoId = (input: string): string => {
    const s = input || '';
    if (!s) return '';
    if (s.includes('v=')) {
      return s.split('v=')[1].split('&')[0];
    }
    if (s.includes('youtu.be/')) {
      return s.split('youtu.be/')[1].split('?')[0];
    }
    return s.trim();
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractVideoId(newVideoUrl);
    if (!newVideoTitle.trim() || !cleanId) {
      alert('Please provide video title and valid YouTube link or video ID.');
      return;
    }

    addYogaVideo({
      title: newVideoTitle.trim(),
      titleTe: newVideoTitleTe.trim() || undefined,
      description: 'Clinically guided PCOS restorative movement routine with direct in-website player.',
      youtubeVideoId: cleanId,
      duration: newVideoDuration,
      category: newVideoCategory,
      difficulty: newVideoDifficulty,
      thumbnail: `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
      benefits: newVideoBenefits.split(',').map(s => s.trim()).filter(Boolean),
      language: newVideoLanguage,
      channelName: newVideoChannel.trim() || (newVideoLanguage === 'te' ? 'Dr Manthena Satyanarayana Raju' : 'Clinical Practitioner'),
      isActive: true
    });

    setIsAddVideoOpen(false);
    setNewVideoTitle('');
    setNewVideoTitleTe('');
    setNewVideoUrl('');
    setNewVideoChannel('Dr Manthena Satyanarayana Raju');
    refreshAll();
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Delete video routine?')) {
      deleteYogaVideo(id);
      refreshAll();
    }
  };

  // Food / Recipe Actions
  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    addRecipe({
      name: newFoodName.trim(),
      nameTe: newFoodNameTe.trim() || undefined,
      description: `Clinically verified ${newFoodCategory} low-GI meal supporting endocrine insulin sensitivity.`,
      category: newFoodCategory,
      mealType: (newFoodCategory.toLowerCase() === 'breakfast' ? 'breakfast' : newFoodCategory.toLowerCase() === 'lunch' ? 'lunch' : newFoodCategory.toLowerCase() === 'dinner' ? 'dinner' : 'eveningSnack') as any,
      prepTime: '10 mins',
      cookTime: '15 mins',
      servingSize: '1 serving (250g)',
      ingredients: newFoodIngredients.split(',').map(s => s.trim()).filter(Boolean),
      instructions: newFoodInstructions.split('.').map(s => s.trim()).filter(Boolean),
      nutrition: {
        calories: Number(newFoodCalories),
        protein: Number(newFoodProtein),
        carbohydrates: Number(newFoodCarbs),
        fat: Number(newFoodFat),
        fiber: Number(newFoodFiber),
        calcium: 250,
        iron: 4.5,
        zinc: 2.8,
        magnesium: 120,
        potassium: 450,
        vitaminC: 25
      },
      image: newFoodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      tags: [newFoodGI, 'Anti-Inflammatory', newFoodCategory],
      pcosBenefits: newFoodBenefits || 'Stabilizes blood sugar and balances ovarian androgens',
      isActive: true
    });

    setIsAddFoodOpen(false);
    setNewFoodName('');
    setNewFoodNameTe('');
    refreshAll();
  };

  const handleOpenEditFood = (rec: DetailedRecipeItem) => {
    setEditingRecipe(rec);
    setEditFoodName(rec.name || '');
    setEditFoodNameTe(rec.nameTe || '');
    setEditFoodCategory((rec.category as any) || 'Breakfast');
    setEditFoodCalories(rec.nutrition?.calories ?? (rec as any).nutritionPerServing?.calories ?? 280);
    setEditFoodProtein(rec.nutrition?.protein ?? (rec as any).nutritionPerServing?.protein ?? 10);
    setEditFoodCarbs(rec.nutrition?.carbohydrates ?? (rec as any).nutritionPerServing?.carbohydrates ?? 35);
    setEditFoodFat(rec.nutrition?.fat ?? (rec as any).nutritionPerServing?.fat ?? 7);
    setEditFoodFiber(rec.nutrition?.fiber ?? (rec as any).nutritionPerServing?.fiber ?? 6);
    setEditFoodGI((rec.tags?.find(t => ['Low', 'Medium', 'High'].includes(t)) as any) || 'Low');
    setEditFoodIngredients(Array.isArray(rec.ingredients) ? rec.ingredients.join(', ') : '');
    setEditFoodInstructions(Array.isArray(rec.instructions) ? rec.instructions.join('. ') : '');
    setEditFoodBenefits(rec.pcosBenefits || '');
    setEditFoodImage(rec.image || '');
  };

  const handleSaveEditFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    updateRecipe(editingRecipe.id, {
      name: editFoodName.trim(),
      nameTe: editFoodNameTe.trim() || undefined,
      category: editFoodCategory,
      mealType: (editFoodCategory.toLowerCase() === 'breakfast' ? 'breakfast' : editFoodCategory.toLowerCase() === 'lunch' ? 'lunch' : editFoodCategory.toLowerCase() === 'dinner' ? 'dinner' : 'eveningSnack') as any,
      ingredients: editFoodIngredients.split(',').map(s => s.trim()).filter(Boolean),
      instructions: editFoodInstructions.split('.').map(s => s.trim()).filter(Boolean),
      nutrition: {
        ...(editingRecipe.nutrition || {}),
        calories: Number(editFoodCalories),
        protein: Number(editFoodProtein),
        carbohydrates: Number(editFoodCarbs),
        fat: Number(editFoodFat),
        fiber: Number(editFoodFiber),
        calcium: editingRecipe.nutrition?.calcium || 200,
        iron: editingRecipe.nutrition?.iron || 3.5,
        zinc: editingRecipe.nutrition?.zinc || 2.5,
        magnesium: editingRecipe.nutrition?.magnesium || 100,
        potassium: editingRecipe.nutrition?.potassium || 400,
        vitaminC: editingRecipe.nutrition?.vitaminC || 20
      },
      image: editFoodImage.trim() || editingRecipe.image || '/assets/foxtail_upma.jpg',
      tags: [editFoodGI, 'Anti-Inflammatory', editFoodCategory],
      pcosBenefits: editFoodBenefits || editingRecipe.pcosBenefits
    });

    setEditingRecipe(null);
    refreshAll();
  };

  const handleDeleteFood = (id: string) => {
    if (confirm('Delete this food item from catalog?')) {
      deleteRecipe(id);
      refreshAll();
    }
  };

  // Save Admin Bank Account Details
  const handleSaveAdminBank = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...adminBank,
      updatedAt: new Date().toISOString()
    };
    saveAdminBankAccountDetails(updated);
    setAdminBank(updated);
    setBankSuccessToast('Admin Master Bank Account details updated successfully! All patient subscription and consultation payments will deposit here.');
    setTimeout(() => setBankSuccessToast(''), 5000);
  };

  // Strict Role Verification: Only users with 'admin' role can access
  if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6" id="admin-access-restricted">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shadow-lg border border-rose-200 dark:border-rose-900">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isTelugu ? 'ప్రాప్యత పరిమితం చేయబడింది' : 'Administrator Access Restricted'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {isTelugu
              ? 'ఈ మాస్టర్ అడ్మిన్ కంట్రోల్ ప్యానెల్ మరియు వాట్సాప్ ఆటోమేషన్ సెంటర్ కేవలం ధృవీకరించబడిన "admin" రోల్ కలిగిన వినియోగదారులకు మాత్రమే అందుబాటులో ఉంటుంది.'
              : 'The PCOSense Master Admin Console & WhatsApp Automation Operations Center is strictly restricted to authenticated users with the "admin" role.'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isTelugu ? 'అడ్మిన్‌గా లాగిన్ చేయండి' : 'Sign in as Admin'}
          </Link>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
          >
            {isTelugu ? 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి' : 'Return to Dashboard'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="admin-dashboard-root">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>PCOSense Admin Operations & Treasury</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {isTelugu ? 'మాస్టర్ అడ్మిన్ కంట్రోల్ ప్యానెల్' : 'Master Administrator Operations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Financial commissions (20%), Admin bank account management, Doctor onboarding, Diet/Food catalog, and In-App Yoga & Exercise Video library.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold font-mono">
            Admin Account: Active
          </div>
        </div>
      </div>

      {/* Active Subscriptions Revenue & Tier Summary Widget */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5" id="admin-active-subscriptions-summary-widget">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isTelugu ? 'రియల్-టైమ్ యాక్టివ్ సబ్‌స్క్రిప్షన్లు' : 'Active Subscriptions Summary'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>{isTelugu ? 'యాక్టివ్ సబ్‌స్క్రిప్షన్ల ఆదాయం & ప్లాన్ల వివరాలు' : 'Active Subscriptions Revenue & Tier Summary'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu 
                ? 'ప్రస్తుతం యాక్టివ్‌గా ఉన్న సబ్‌స్క్రిప్షన్ల నుండి మొత్తం ఆదాయం మరియు ట్రయల్, లిమిటెడ్, ఫుల్ యాక్సెస్ ప్లాన్లలోని వినియోగదారుల సంఖ్య.' 
                : 'Real-time revenue calculated from currently active subscriptions with itemized user counts across Trial, Limited, and Full tiers.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors"
              id="admin-widget-view-subs-btn"
            >
              <span>{isTelugu ? 'సబ్‌స్క్రిప్షన్ల వివరాలు చూడండి' : 'Manage Subscriptions'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Card Executive Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Active Subscription Revenue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isTelugu ? 'యాక్టివ్ సబ్‌స్క్రిప్షన్ల ఆదాయం' : 'Active Sub Revenue'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {activeSubSummary.totalActiveUsers} {isTelugu ? 'వినియోగదారులు' : 'Active Users'}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                ₹{activeSubSummary.totalActiveRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isTelugu ? 'ట్రెజరీ అకౌంట్‌కు డిపాజిట్ అయిన మొత్తం' : 'Total collected from active subscribers'}
              </p>
            </div>
          </div>

          {/* Card 2: Trial Tier (₹1) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>{isTelugu ? 'ట్రయల్ టైర్ (₹1)' : 'Trial Tier'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                ₹1 / 3 Days
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeSubSummary.trialUsersCount}
                </p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'వినియోగదారులు' : 'users'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{isTelugu ? 'ఆదాయం' : 'Revenue'}: <strong className="text-slate-700 dark:text-slate-300 font-mono">₹{activeSubSummary.tierBreakdown.trial.revenue}</strong></span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">3-Day Window</span>
              </div>
            </div>
          </div>

          {/* Card 3: Limited Insight Tier (₹100) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'లిమిటెడ్ ఇన్‌సైట్ (₹100)' : 'Limited Tier'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                ₹100 / Month
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeSubSummary.limitedUsersCount}
                </p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'వినియోగదారులు' : 'users'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{isTelugu ? 'ఆదాయం' : 'Revenue'}: <strong className="text-slate-700 dark:text-slate-300 font-mono">₹{activeSubSummary.tierBreakdown.limited.revenue}</strong></span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Risk + Diet</span>
              </div>
            </div>
          </div>

          {/* Card 4: Full Access Tier (₹200) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>{isTelugu ? 'ఫుల్ యాక్సెస్ (₹200)' : 'Full Access Tier'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                ₹200 / Month
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeSubSummary.fullUsersCount}
                </p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'వినియోగదారులు' : 'users'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{isTelugu ? 'ఆదాయం' : 'Revenue'}: <strong className="text-slate-700 dark:text-slate-300 font-mono">₹{activeSubSummary.tierBreakdown.full.revenue}</strong></span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">All Features + Telehealth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Distribution Bar */}
        {activeSubSummary.totalActiveUsers > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{isTelugu ? 'యాక్టివ్ యూజర్ ప్లాన్ పంపిణీ' : 'Active Subscriber Tier Distribution'}</span>
              <span>
                {Math.round((activeSubSummary.fullUsersCount / activeSubSummary.totalActiveUsers) * 100)}% Full Access •{' '}
                {Math.round((activeSubSummary.limitedUsersCount / activeSubSummary.totalActiveUsers) * 100)}% Limited •{' '}
                {Math.round((activeSubSummary.trialUsersCount / activeSubSummary.totalActiveUsers) * 100)}% Trial
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(activeSubSummary.trialUsersCount / activeSubSummary.totalActiveUsers) * 100}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Trial Tier: ${activeSubSummary.trialUsersCount} users`}
              />
              <div
                style={{ width: `${(activeSubSummary.limitedUsersCount / activeSubSummary.totalActiveUsers) * 100}%` }}
                className="bg-teal-500 h-full transition-all"
                title={`Limited Tier: ${activeSubSummary.limitedUsersCount} users`}
              />
              <div
                style={{ width: `${(activeSubSummary.fullUsersCount / activeSubSummary.totalActiveUsers) * 100}%` }}
                className="bg-purple-600 h-full transition-all"
                title={`Full Access Tier: ${activeSubSummary.fullUsersCount} users`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Strict Admin Navigation Tabs (No Slide Bars) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { key: 'commission', label: isTelugu ? 'కమీషన్ & ఆర్థిక నివేదిక' : 'Commissions & Financials', icon: DollarSign },
          { key: 'whatsapp', label: isTelugu ? '📱 వాట్సాప్ ఆటోమేషన్' : '📱 WhatsApp Automation', icon: MessageSquare, badge: whatsappCampaigns.length },
          { key: 'admin_account', label: isTelugu ? 'అడ్మిన్ బ్యాంక్ వివరాలు' : 'Admin Bank Account Details', icon: Building },
          { key: 'doctors', label: isTelugu ? 'వైద్యుల నిర్వహణ' : 'Specialist Doctors', icon: Users, badge: doctors.length },
          { key: 'food', label: isTelugu ? 'ఆహార పదార్థాలు & వంటకాలు' : 'PCOS Food & Nutrition', icon: BookOpen, badge: recipes.length },
          { key: 'yoga_exercise', label: isTelugu ? 'యోగా & వ్యాయామ వీడియోలు' : 'Yoga & Exercise Videos', icon: Video, badge: videos.length },
          { key: 'subscriptions', label: isTelugu ? 'యూజర్ సబ్‌స్క్రిప్షన్లు (₹1, ₹100, ₹200)' : 'User Subscriptions & Trials', icon: CreditCard, badge: subPayments.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
              }`}
              id={`admin-tab-${tab.key}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-indigo-900' : 'bg-indigo-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMMISSIONS & FINANCIAL OVERVIEW ("comission page")                */}
      {/* ========================================================================= */}
      {activeTab === 'commission' && (
        <div className="space-y-6" id="admin-commission-page">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              <span>Platform Commission & Treasury Overview</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete financial summary: 20% platform commission on doctor consults + User subscription deposits into the Admin Bank Account.
            </p>
          </div>

          {/* High-level Revenue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Gross Consult Revenue</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{financialStats.totalGrossRevenue}</p>
              <span className="text-[11px] text-slate-400">{financialStats.completedConsultations} Completed Consultations</span>
            </div>

            <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase flex items-center gap-1">
                <Percent className="h-3.5 w-3.5" />
                Platform Commission (20%)
              </span>
              <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">₹{financialStats.totalPlatformCommission}</p>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Retained from doctor billings</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Doctor Payouts (80%)</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{financialStats.totalDoctorPayouts}</p>
              <span className="text-[11px] text-slate-400">Disbursed to verified RMP bank accounts</span>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
                User Subscription Revenue
              </span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">₹{subRevenue.totalGross}</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                ₹{subRevenue.trialRevenue} (₹1 trials) + ₹{subRevenue.plan100Revenue + subRevenue.plan200Revenue} (Monthly)
              </span>
            </div>
          </div>

          {/* Live Admin Bank Account Quick Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-indigo-400">Target Deposit Account</span>
                <h3 className="font-bold text-base text-white mt-0.5">
                  {adminBank.bankName} • {adminBank.accountNumber}
                </h3>
                <p className="text-xs text-slate-300">
                  Beneficiary: {adminBank.accountHolderName} | UPI: <span className="font-mono text-teal-300">{adminBank.upiId}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('admin_account')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Edit Account Details</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Itemized Consultation Commission Ledger */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Itemized Teleconsultation Commissions Ledger
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 font-bold grid grid-cols-12 gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="col-span-3">Patient</span>
                <span className="col-span-3">Attending Doctor</span>
                <span className="col-span-2">Gross Fee</span>
                <span className="col-span-2 text-indigo-600">Platform 20%</span>
                <span className="col-span-2 text-emerald-600">Doctor 80%</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {getStoredConsultations().map(c => (
                  <div key={c.id} className="p-3 grid grid-cols-12 gap-2 items-center text-slate-800 dark:text-slate-200">
                    <span className="col-span-3 font-bold">{(c as any).patientName || c.userName}</span>
                    <span className="col-span-3 text-slate-500 truncate">{c.doctorName}</span>
                    <span className="col-span-2 font-mono">₹{c.amount}</span>
                    <span className="col-span-2 text-indigo-600 font-bold font-mono">+₹{c.commissionAmount}</span>
                    <span className="col-span-2 text-emerald-600 font-mono">₹{c.doctorAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADMIN BANK ACCOUNT DETAILS ("admin add account details")           */}
      {/* ========================================================================= */}
      {activeTab === 'admin_account' && (
        <div className="space-y-6" id="admin-account-details-page">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-600" />
              <span>Admin Bank Account & Direct Deposit Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure the Master Bank Account where all user subscriptions (₹1 trial, ₹100, ₹200) and patient consultation payments deposit.
            </p>
          </div>

          {bankSuccessToast && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{bankSuccessToast}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Account Settings Form (Left) */}
            <form
              onSubmit={handleSaveAdminBank}
              className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Edit Bank & UPI Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Account Beneficiary / Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminBank.accountHolderName}
                    onChange={e => setAdminBank({ ...adminBank, accountHolderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={adminBank.bankName}
                      onChange={e => setAdminBank({ ...adminBank, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Branch Name</label>
                    <input
                      type="text"
                      required
                      value={adminBank.branchName}
                      onChange={e => setAdminBank({ ...adminBank, branchName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      value={adminBank.accountNumber}
                      onChange={e => setAdminBank({ ...adminBank, accountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={adminBank.ifscCode}
                      onChange={e => setAdminBank({ ...adminBank, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Master Admin UPI ID (Google Pay, PhonePe, Paytm, BHIM)
                  </label>
                  <input
                    type="text"
                    required
                    value={adminBank.upiId}
                    onChange={e => setAdminBank({ ...adminBank, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-teal-600 dark:text-teal-400 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Bank Details</span>
                </button>
              </div>
            </form>

            {/* Live Checkout Preview Card (Right) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-teal-400" />
                  <span>Live Patient Checkout Preview</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Verified Escrow
                </span>
              </div>

              <p className="text-xs text-slate-300">
                This verified account information is presented to patients during ₹1 trial activation, monthly plan purchase (₹100/₹200), and teleconsultations:
              </p>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Bank Name & Branch</span>
                  <p className="font-bold text-white text-sm">{adminBank.bankName}</p>
                  <p className="text-slate-400 text-[11px]">{adminBank.branchName}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Account Number</span>
                    <p className="font-mono font-bold text-white">{adminBank.accountNumber}</p>
                    <p className="text-slate-400 text-[11px]">IFSC: <span className="font-mono text-slate-200">{adminBank.ifscCode}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(adminBank.accountNumber, 'acc')}
                    className="p-1.5 rounded-lg bg-slate-800 text-teal-400 hover:bg-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBankField === 'acc' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">UPI ID</span>
                    <p className="font-mono font-bold text-teal-400">{adminBank.upiId}</p>
                    <p className="text-slate-400 text-[11px]">{adminBank.accountHolderName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(adminBank.upiId, 'upi')}
                    className="p-1.5 rounded-lg bg-slate-800 text-teal-400 hover:bg-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBankField === 'upi' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Complies with Section 31 CGST Act & DPDP Act (2023).</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCTOR MANAGEMENT & ADD DOCTOR ("doctor add")                      */}
      {/* ========================================================================= */}
      {activeTab === 'doctors' && (
        <div className="space-y-6" id="admin-doctors-page">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <span>Specialist Doctors & RMP Credentialing</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                State Medical Council verification, credentials audit, and consultation fee management.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
              id="admin-add-doctor-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Specialist Doctor</span>
            </button>
          </div>

          {/* Doctors Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 font-bold grid grid-cols-12 gap-3 text-slate-700 dark:text-slate-300 text-xs">
              <span className="col-span-4">Doctor Name & Specialization</span>
              <span className="col-span-3">State Medical Council Reg.</span>
              <span className="col-span-2">Consult Fee</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {doctors.map(doc => (
                <div key={doc.id} className="p-4 grid grid-cols-12 gap-3 items-center text-slate-800 dark:text-slate-200">
                  <div className="col-span-4 flex items-center gap-3">
                    <img
                      src={doc.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                      alt={doc.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{doc.name}</span>
                      <span className="text-[11px] text-slate-500">{doc.specialization} • {doc.qualification}</span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white block">{doc.licenseNumber}</span>
                    <span className="text-[11px] text-slate-500">{doc.stateMedicalCouncil || 'Telangana Medical Council'}</span>
                  </div>

                  <div className="col-span-2 font-mono">
                    <span className="font-bold">₹{doc.consultationFee}</span>
                    <span className="text-[10px] text-slate-400 block">80% Doctor: ₹{Math.round((doc.consultationFee * 80) / 100)}</span>
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        doc.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {doc.verificationStatus !== 'verified' ? (
                      <button
                        type="button"
                        onClick={() => handleVerifyDoctor(doc.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Verify Doctor"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verify</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRejectDoctor(doc.id)}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                        title="Suspend"
                      >
                        Suspend
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Remove Doctor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Doctor Modal */}
          {isAddDoctorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Specialist Doctor</h3>
                  <button type="button" onClick={() => setIsAddDoctorOpen(false)} className="text-slate-400 p-1">✕</button>
                </div>

                <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Doctor Full Name</label>
                    <input
                      type="text"
                      required
                      value={newDoctorName}
                      onChange={e => setNewDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Radhika Sharma, MD, DGO"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Specialization</label>
                      <input
                        type="text"
                        required
                        value={newDoctorSpecialty}
                        onChange={e => setNewDoctorSpecialty(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Qualifications</label>
                      <input
                        type="text"
                        required
                        value={newDoctorQualification}
                        onChange={e => setNewDoctorQualification(e.target.value)}
                        placeholder="MBBS, MD"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">State Council Reg. No.</label>
                      <input
                        type="text"
                        required
                        value={newDoctorLicense}
                        onChange={e => setNewDoctorLicense(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">State Medical Council</label>
                      <input
                        type="text"
                        required
                        value={newDoctorCouncil}
                        onChange={e => setNewDoctorCouncil(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Consult Fee (₹)</label>
                      <input
                        type="number"
                        required
                        value={newDoctorFee}
                        onChange={e => setNewDoctorFee(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Experience (Yrs)</label>
                      <input
                        type="number"
                        required
                        value={newDoctorExperience}
                        onChange={e => setNewDoctorExperience(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Hospital / Clinic</label>
                      <input
                        type="text"
                        value={newDoctorClinic}
                        onChange={e => setNewDoctorClinic(e.target.value)}
                        placeholder="Apollo Clinic"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDoctorOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Save Doctor Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ADD FOOD / NUTRITION CATALOG ("adding food")                       */}
      {/* ========================================================================= */}
      {activeTab === 'food' && (
        <div className="space-y-6" id="admin-food-page">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span>PCOS Anti-Inflammatory Food & Diet Catalog</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add and manage verified low-GI recipes, macro profiles, and micronutrient contents (Inositol, Zinc, Magnesium).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddFoodOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Food / Meal</span>
            </button>
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map(rec => {
              const calories = rec.nutrition?.calories ?? (rec as any).nutritionPerServing?.calories ?? 0;
              const protein = rec.nutrition?.protein ?? (rec as any).nutritionPerServing?.protein ?? 0;
              const carbs = rec.nutrition?.carbohydrates ?? (rec as any).nutritionPerServing?.carbohydrates ?? 0;
              const fiber = rec.nutrition?.fiber ?? (rec as any).nutritionPerServing?.fiber ?? 0;

              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-3">
                    {/* Recipe Image Thumbnail */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                      {rec.image ? (
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                          <Camera className="h-6 w-6 mb-1 text-slate-400" />
                          <span>No Image (Click Edit)</span>
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {rec.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                        {rec.tags?.find(t => ['Low', 'Medium', 'High'].includes(t)) || 'Low'} GI
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFood(rec)}
                          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                          title="Edit Menu Item & Image"
                          id={`edit-food-btn-${rec.id}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFood(rec.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete Food"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{rec.name}</h3>
                    {rec.nameTe && <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{rec.nameTe}</p>}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{rec.description}</p>

                    <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Calories</span>
                        <span className="font-bold text-slate-900 dark:text-white">{calories}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Protein</span>
                        <span className="font-bold text-emerald-600">{protein}g</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Carbs</span>
                        <span className="font-bold text-amber-600">{carbs}g</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Fiber</span>
                        <span className="font-bold text-indigo-600">{fiber}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                    <span>Prep: {rec.prepTime || '10m'} • Cook: {rec.cookTime || '15m'}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditFood(rec)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Change Photo / Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Food Modal */}
          {isAddFoodOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New PCOS Food / Meal</h3>
                  <button type="button" onClick={() => setIsAddFoodOpen(false)} className="text-slate-400 p-1">✕</button>
                </div>

                <form onSubmit={handleCreateFood} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Food / Recipe Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={newFoodName}
                      onChange={e => setNewFoodName(e.target.value)}
                      placeholder="e.g. Spiced Foxtail Millet Upma with Chia Seeds"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Name in Telugu (Optional)</label>
                      <input
                        type="text"
                        value={newFoodNameTe}
                        onChange={e => setNewFoodNameTe(e.target.value)}
                        placeholder="కొర్రల ఉప్మా"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Category & Meal Type</label>
                      <select
                        value={newFoodCategory}
                        onChange={e => setNewFoodCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  {/* Food Image URL & File Upload */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Recipe Image (Photo URL or Upload Device Photo)
                    </label>
                    <input
                      type="text"
                      value={newFoodImage}
                      onChange={e => setNewFoodImage(e.target.value)}
                      placeholder="https://... or /assets/..."
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                    />
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-300">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo From Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => {
                                if (ev.target?.result) setNewFoodImage(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {newFoodImage && (
                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-slate-300">
                          <img src={newFoodImage} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Calories</label>
                      <input
                        type="number"
                        value={newFoodCalories}
                        onChange={e => setNewFoodCalories(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Protein (g)</label>
                      <input
                        type="number"
                        value={newFoodProtein}
                        onChange={e => setNewFoodProtein(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Carbs (g)</label>
                      <input
                        type="number"
                        value={newFoodCarbs}
                        onChange={e => setNewFoodCarbs(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Fat (g)</label>
                      <input
                        type="number"
                        value={newFoodFat}
                        onChange={e => setNewFoodFat(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Fiber (g)</label>
                      <input
                        type="number"
                        value={newFoodFiber}
                        onChange={e => setNewFoodFiber(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Ingredients (Comma Separated)</label>
                    <textarea
                      rows={2}
                      value={newFoodIngredients}
                      onChange={e => setNewFoodIngredients(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Preparation Instructions</label>
                    <textarea
                      rows={2}
                      value={newFoodInstructions}
                      onChange={e => setNewFoodInstructions(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddFoodOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Save Food Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: EDIT EXISTING RECIPE / MENU ITEM (Admin Edit with Images) */}
          {editingRecipe && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Edit Existing Menu Item & Images
                    </h3>
                  </div>
                  <button type="button" onClick={() => setEditingRecipe(null)} className="text-slate-400 p-1">✕</button>
                </div>

                <form onSubmit={handleSaveEditFood} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Recipe Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={editFoodName}
                      onChange={e => setEditFoodName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Name in Telugu (తెలుగు)</label>
                      <input
                        type="text"
                        value={editFoodNameTe}
                        onChange={e => setEditFoodNameTe(e.target.value)}
                        placeholder="తెలుగు పేరు"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Category & Meal Slot</label>
                      <select
                        value={editFoodCategory}
                        onChange={e => setEditFoodCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  {/* EDIT IMAGE SECTION (URL or Device Upload) */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-indigo-600" />
                        <span>Menu Item Image & Photo</span>
                      </label>
                      <span className="text-[10px] text-indigo-600 font-semibold">Live Preview</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-20 w-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0">
                        {editFoodImage ? (
                          <img src={editFoodImage} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px]">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editFoodImage}
                          onChange={e => setEditFoodImage(e.target.value)}
                          placeholder="Paste image URL (e.g. /assets/foxtail_upma.jpg or web url)"
                          className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />

                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Image From PC / Phone</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  if (ev.target?.result) setEditFoodImage(ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Calories</label>
                      <input
                        type="number"
                        value={editFoodCalories}
                        onChange={e => setEditFoodCalories(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Protein (g)</label>
                      <input
                        type="number"
                        value={editFoodProtein}
                        onChange={e => setEditFoodProtein(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Carbs (g)</label>
                      <input
                        type="number"
                        value={editFoodCarbs}
                        onChange={e => setEditFoodCarbs(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Fat (g)</label>
                      <input
                        type="number"
                        value={editFoodFat}
                        onChange={e => setEditFoodFat(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-[10px]">Fiber (g)</label>
                      <input
                        type="number"
                        value={editFoodFiber}
                        onChange={e => setEditFoodFiber(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Ingredients</label>
                    <textarea
                      rows={2}
                      value={editFoodIngredients}
                      onChange={e => setEditFoodIngredients(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Preparation Instructions</label>
                    <textarea
                      rows={2}
                      value={editFoodInstructions}
                      onChange={e => setEditFoodInstructions(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">PCOS Health Benefits</label>
                    <input
                      type="text"
                      value={editFoodBenefits}
                      onChange={e => setEditFoodBenefits(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRecipe(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ADD YOGA & EXERCISE VIDEOS ("adding yoga videos using youtube...") */}
      {/* ========================================================================= */}
      {activeTab === 'yoga_exercise' && (
        <div className="space-y-6" id="admin-yoga-exercise-page">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                <span>Yoga & Exercise Videos (In-App Direct Playback)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organized into dedicated <strong>Telugu Playlist</strong> (Manthena Satyanarayana Raju, Healthyday Yoga Telugu) and <strong>English Playlist</strong>. All videos stream inside PCOSense.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Playlist Filter Buttons */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdminVideoFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    adminVideoFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  All ({videos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminVideoFilter('te')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                    adminVideoFilter === 'te'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Telugu Playlist: Manthena Satyanarayana Raju, Healthyday Yoga Telugu"
                >
                  <span>తెలుగు ({videos.filter(v => v.language === 'te' || v.id.includes('-te-')).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminVideoFilter('en')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    adminVideoFilter === 'en'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  English ({videos.filter(v => v.language !== 'te' && !v.id.includes('-te-')).length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAddVideoOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
                id="admin-add-video-btn"
              >
                <Plus className="h-4 w-4" />
                <span>Upload YouTube Video</span>
              </button>
            </div>
          </div>

          {/* Live In-App Player Preview */}
          {previewVideoId && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Direct In-App YouTube Player (Website Native)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewVideoId(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
                >
                  Close Player
                </button>
              </div>

              <div className="max-w-2xl mx-auto">
                <YouTubePlayer
                  videoId={previewVideoId}
                  title="Direct PCOS Workout Routine"
                  autoPlay={true}
                />
              </div>
            </div>
          )}

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos
              .filter(v => {
                if (adminVideoFilter === 'te') return v.language === 'te' || v.id.includes('-te-');
                if (adminVideoFilter === 'en') return v.language !== 'te' && !v.id.includes('-te-');
                return true;
              })
              .map(vid => (
              <div
                key={vid.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 group">
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPreviewVideoId(vid.youtubeVideoId)}
                        className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="Play in Website"
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-mono text-[10px]">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        vid.language === 'te' || vid.id.includes('-te-')
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                      }`}>
                        {vid.language === 'te' || vid.id.includes('-te-') ? 'తెలుగు (Telugu)' : 'English'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                        {vid.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{vid.title}</h3>
                    {vid.titleTe && <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{vid.titleTe}</p>}
                    {vid.channelName && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                        <Tv className="h-3 w-3" />
                        <span>{vid.channelName}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {vid.benefits?.slice(0, 2).map((b, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewVideoId(vid.youtubeVideoId)}
                  className="w-full py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play Directly in Website</span>
                </button>
              </div>
            ))}
          </div>

          {/* Add Video Modal */}
          {isAddVideoOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload YouTube Video to Playlist</h3>
                  <button type="button" onClick={() => setIsAddVideoOpen(false)} className="text-slate-400 p-1">✕</button>
                </div>

                <form onSubmit={handleCreateVideo} className="space-y-3.5 text-xs">
                  {/* Playlist Language Selection & YouTuber/Channel Field */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Upload to Playlist *
                      </label>
                      <select
                        value={newVideoLanguage}
                        onChange={e => setNewVideoLanguage(e.target.value as 'te' | 'en')}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="te">తెలుగు ప్లేలిస్ట్ (Telugu Playlist)</option>
                        <option value="en">English Playlist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Channel / YouTuber Name
                      </label>
                      <input
                        type="text"
                        value={newVideoChannel}
                        onChange={e => setNewVideoChannel(e.target.value)}
                        placeholder="e.g. Dr Manthena Satyanarayana Raju or Healthyday Yoga"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      YouTube Video Link or Video ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=DmMg1YwoUkQ or G2KmINshKgk"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Supports youtube.com/watch?v=, youtu.be/, or 11-char ID. When uploaded with Telugu selected, it will be added to the Telugu playlist.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Video Routine Title *</label>
                    <input
                      type="text"
                      required
                      value={newVideoTitle}
                      onChange={e => setNewVideoTitle(e.target.value)}
                      placeholder="e.g. 15 Min Daily Yoga for PCOS/PCOD Relief | Healthyday Yoga Telugu"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Title in Telugu (Optional)</label>
                    <input
                      type="text"
                      value={newVideoTitleTe}
                      onChange={e => setNewVideoTitleTe(e.target.value)}
                      placeholder="హార్మోన్ బ్యాలెన్సింగ్ ఆసనాలు"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={newVideoCategory}
                        onChange={e => setNewVideoCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Yoga">Yoga</option>
                        <option value="Beginner Yoga">Beginner Yoga</option>
                        <option value="Stretching">Stretching</option>
                        <option value="Breathing Exercises">Breathing Exercises</option>
                        <option value="Low Impact Exercise">Low Impact Exercise</option>
                        <option value="Walking">Walking</option>
                        <option value="PCOS-friendly Movement">PCOS Movement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Duration</label>
                      <input
                        type="text"
                        value={newVideoDuration}
                        onChange={e => setNewVideoDuration(e.target.value)}
                        placeholder="15 min"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Difficulty</label>
                      <select
                        value={newVideoDifficulty}
                        onChange={e => setNewVideoDifficulty(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Gentle">Gentle</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Targeted Health Benefits (Comma Separated)</label>
                    <input
                      type="text"
                      value={newVideoBenefits}
                      onChange={e => setNewVideoBenefits(e.target.value)}
                      placeholder="Reduces cortisol, Pelvic circulation, Relieves bloating"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddVideoOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                    >
                      Save Video to Platform
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: WHATSAPP AUTOMATION & ENGAGEMENT CAMPAIGNS                         */}
      {/* ========================================================================= */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6" id="admin-whatsapp-automation-page">
          <WhatsAppAutomationDashboard />
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Advanced Cloud API & Webhook Diagnostics</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                {isTelugu
                  ? 'సమ్మతించిన వినియోగదారులకు అధికారిక మెటా క్లౌడ్ API మరియు జెమిని AI ద్వారా తెలుగు మరియు ఇంగ్లీష్‌లలో వ్యక్తిగతీకరించిన PCOS సందేశాలు మరియు రిమైండర్లు పంపండి.'
                  : 'Broadcast personalized, educational WhatsApp awareness messages, symptom nudges, and appointment reminders to explicitly opted-in users.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAIGeneratorOpen(true)}
                id="admin-open-ai-generator-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isTelugu ? '✨ AI తో సందేశం రూపొందించండి' : '✨ Generate with AI'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCampaignName('');
                  setMessageContent('');
                  setMessageContentTe('');
                  setIsCreateCampaignOpen(true);
                }}
                id="admin-create-campaign-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>{isTelugu ? 'కొత్త క్యాంపెయిన్ సృష్టించండి' : 'Create Campaign'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTestMessageOpen(true)}
                id="admin-send-test-whatsapp-btn"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                title="Send test WhatsApp message"
              >
                <Send className="h-3.5 w-3.5 text-emerald-600" />
                <span>{isTelugu ? 'టెస్ట్ మెసేజ్' : 'Send Test'}</span>
              </button>
            </div>
          </div>

          {/* 6 Executive Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Total Opted-in Users */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                <span>Opted-In Users</span>
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {whatsappStats.totalOptedInUsers}
              </p>
              <span className="text-[10px] text-slate-400 block font-medium">Explicit Consent Verified</span>
            </div>

            {/* 2. Messages Sent */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Send className="h-3.5 w-3.5 text-indigo-600" />
                <span>Messages Sent</span>
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {whatsappStats.totalMessagesSent.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 block font-medium">Broadcasts & Nudges</span>
            </div>

            {/* 3. Delivered */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" />
                <span>Delivered</span>
              </span>
              <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {whatsappStats.totalDelivered.toLocaleString()}
              </p>
              <span className="text-[10px] text-teal-600 font-bold block">{whatsappStats.deliveryRate}% Delivery Rate</span>
            </div>

            {/* 4. Read */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-sky-600" />
                <span>Read</span>
              </span>
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                {whatsappStats.totalRead.toLocaleString()}
              </p>
              <span className="text-[10px] text-sky-600 font-bold block">{whatsappStats.readRate}% Read Rate</span>
            </div>

            {/* 5. User Replies */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                <span>User Replies</span>
              </span>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {whatsappStats.totalReplies.toLocaleString()}
              </p>
              <span className="text-[10px] text-purple-600 font-bold block">{whatsappStats.replyRate}% Reply Rate</span>
            </div>

            {/* 6. Appointment Requests */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                <span>Consult Requests</span>
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {whatsappStats.appointmentRequests}
              </p>
              <span className="text-[10px] text-amber-600 font-bold block">Doctor Consult Leads</span>
            </div>
          </div>

          {/* Configurable Frequency Limit & Compliance Guard Bar */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <span>{isTelugu ? 'వినియోగదారుల ఫ్రీక్వెన్సీ పరిమితి (యాంటీ-స్పామ్ రక్షణ)' : 'Weekly Frequency Throttling (Anti-Spam & Fatigue Protection)'}</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTelugu
                  ? `ప్రస్తుత పరిమితి: ప్రతి వినియోగదారునికి గరిష్టంగా వారానికి ${whatsappSettings.max_messages_per_user_weekly} సందేశాలు. పరిమితి దాటితే ఆటోమేటెడ్ బ్రాడ్‌కాస్ట్‌లు నిలిపివేయబడతాయి.`
                  : `Maximum automated WhatsApp messages per user: ${whatsappSettings.max_messages_per_user_weekly} per week. Prevents notification fatigue.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {settingsFeedback && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {settingsFeedback}
                </span>
              )}

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300">
                  Max: {whatsappSettings.max_messages_per_user_weekly}/wk
                </span>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSaveFrequencyLimit(num)}
                    disabled={isSavingSettings}
                    className={`h-7 w-7 rounded-xl text-xs font-bold transition-all ${
                      whatsappSettings.max_messages_per_user_weekly === num
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Analytics: Messages Sent per Day & Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Trends Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>{isTelugu ? 'రోజువారీ సందేశాల పంపిణీ & డెలివరీ' : 'Messages Sent, Delivered & Read per Day'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time Meta WhatsApp Cloud API throughput over the past 7 days
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Past 7 Days
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={whatsappStats.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="sent" fill="#6366f1" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="read" fill="#0ea5e9" name="Read" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="replies" fill="#a855f7" name="Replies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Performance Funnel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isTelugu ? 'క్యాంపెయిన్ నిశ్చితార్థం' : 'Campaign Engagement Funnel'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Conversion from sent to user replies
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Total Sent</span>
                    <span className="text-slate-900 dark:text-white font-mono">{whatsappStats.totalMessagesSent} (100%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Delivered</span>
                    <span className="text-teal-600 font-mono">{whatsappStats.totalDelivered} ({whatsappStats.deliveryRate}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${whatsappStats.deliveryRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Read</span>
                    <span className="text-sky-600 font-mono">{whatsappStats.totalRead} ({whatsappStats.readRate}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${whatsappStats.readRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">User Replies & Consults</span>
                    <span className="text-purple-600 font-mono">{whatsappStats.totalReplies} ({whatsappStats.replyRate}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${whatsappStats.replyRate * 2}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  💡 <strong>Compliance Note:</strong> High read rates reflect personalized timing and explicit opt-in consent. Zero unsolicited messages sent.
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Management Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs space-y-0">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>{isTelugu ? 'క్యాంపెయిన్ల జాబితా & నియంత్రణ' : 'WhatsApp Awareness Campaigns'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scheduled, Active, and Completed educational message broadcasts
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {whatsappCampaigns.length} {isTelugu ? 'క్యాంపెయిన్లు' : 'Total Campaigns'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 font-bold grid grid-cols-12 gap-3 text-slate-700 dark:text-slate-300 text-xs">
              <span className="col-span-4">Campaign Name & Type</span>
              <span className="col-span-2">Audience & Lang</span>
              <span className="col-span-2">Schedule</span>
              <span className="col-span-2">Status & Stats</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {whatsappCampaigns.map(c => (
                <div key={c.id} className="p-4 grid grid-cols-12 gap-3 items-center text-slate-800 dark:text-slate-200">
                  <div className="col-span-4 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">{c.campaign_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {c.message_type}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-900 dark:text-white font-medium block truncate">{c.target_audience}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Lang: {c.language === 'both' ? 'English + Telugu' : c.language.toUpperCase()}
                    </span>
                  </div>

                  <div className="col-span-2 space-y-0.5">
                    <span className="text-slate-800 dark:text-slate-200 font-medium block truncate">{c.schedule}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {c.start_date} to {c.end_date}
                    </span>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : c.status === 'Scheduled'
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                        : c.status === 'Paused'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      ● {c.status}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Sent: <strong className="text-slate-700 dark:text-slate-300 font-mono">{c.stats?.sent || 0}</strong> • Read: <strong className="text-sky-600 font-mono">{c.stats?.read || 0}</strong>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {c.status === 'Active' ? (
                      <button
                        type="button"
                        onClick={() => {
                          updateCampaignStatus(c.id, 'Paused');
                          refreshAll();
                        }}
                        className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                        title="Pause Campaign"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          updateCampaignStatus(c.id, 'Active');
                          refreshAll();
                        }}
                        className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        title="Resume / Activate Campaign"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setTestContent(c.message_content);
                        setTestLanguage(c.language === 'te' ? 'te' : 'en');
                        setIsTestMessageOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      title="Send Test of this Campaign"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete campaign "${c.campaign_name}"?`)) {
                          deleteCampaign(c.id);
                          refreshAll();
                        }
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive WhatsApp Webhook & Message Simulator (Section 8) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                  <Bot className="h-3 w-3" />
                  <span>Webhook Simulator</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                  {isTelugu ? 'వాట్సాప్ ఇన్‌కమింగ్ మెసేజ్ & వెబ్‌హుక్ సిమ్యులేటర్' : 'Interactive WhatsApp Webhook & Intent Testing Sandbox'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate user WhatsApp replies: "STOP", "TRACK", "FOOD", "APPOINTMENT", "DOCTOR", "HELP", "LANG TE" or custom questions to verify real-time FastAPI routing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Endpoint: /api/whatsapp/webhook
                </span>
              </div>
            </div>

            {/* Quick Keyword Test Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick Test Intents:</span>
              {[
                { label: 'STOP (Opt-Out)', val: 'STOP' },
                { label: 'START (Opt-In)', val: 'START' },
                { label: 'TRACK (Symptoms)', val: 'TRACK' },
                { label: 'FOOD (Nutrition)', val: 'FOOD' },
                { label: 'APPOINTMENT (Doctor)', val: 'APPOINTMENT' },
                { label: 'DOCTOR (Specialists)', val: 'DOCTOR' },
                { label: 'HELP (Menu)', val: 'HELP' },
                { label: 'LANG TE (Telugu)', val: 'LANG TE' }
              ].map(chip => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => handleSimulateWebhook(chip.val)}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Simulated Live Chat Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
              <div className="md:col-span-8 bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 max-h-72 overflow-y-auto font-sans">
                {simLog.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <div className="flex items-center justify-between gap-3 text-[9.5px] opacity-75 mt-1">
                        <span>{m.sender === 'user' ? 'User via WhatsApp' : 'PCOSense Webhook Bot'}</span>
                        {m.intent && <span className="font-mono bg-black/30 px-1 rounded">Intent: {m.intent}</span>}
                        <span>{m.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Console */}
              <div className="md:col-span-4 flex flex-col justify-between space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sender Phone Number
                  </label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />

                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
                    Type User Message / Question
                  </label>
                  <textarea
                    rows={3}
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    placeholder="e.g. STOP, or 'What should I eat for dinner with PCOS?'"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateWebhook()}
                  disabled={isSimulating || !simInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSimulating ? 'Processing Webhook...' : 'Simulate Incoming Message'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODAL 1: CREATE CAMPAIGN                                                  */}
          {/* ========================================================================= */}
          {isCreateCampaignOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    <span>Create WhatsApp Campaign</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreateCampaignOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaignSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Daily Menstrual Symptom Tracking Nudge"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      >
                        <option value="All Opted-in Users">All Opted-in Users</option>
                        <option value="High Risk Patients">High Risk Patients</option>
                        <option value="Irregular Cycle Patients">Irregular Cycle Patients</option>
                        <option value="New Signups">New Signups</option>
                        <option value="Inactive >7 Days">Inactive &gt;7 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Message Type
                      </label>
                      <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      >
                        <option value="PCOS Awareness">PCOS Awareness</option>
                        <option value="Food Awareness">Food Awareness</option>
                        <option value="Exercise Reminder">Exercise Reminder</option>
                        <option value="Symptom Tracking">Symptom Tracking</option>
                        <option value="Appointment Reminder">Appointment Reminder</option>
                        <option value="General Education">General Education</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Language
                      </label>
                      <select
                        value={campaignLanguage}
                        onChange={(e) => setCampaignLanguage(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option value="both">Both (EN + TE)</option>
                        <option value="en">English Only</option>
                        <option value="te">Telugu Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Schedule
                      </label>
                      <select
                        value={campaignSchedule}
                        onChange={(e) => setCampaignSchedule(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option value="Immediately">Immediately</option>
                        <option value="Daily 9:00 AM">Daily 9:00 AM</option>
                        <option value="Weekly (Mondays)">Weekly (Mondays)</option>
                        <option value="Custom Schedule">Custom Schedule</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Status
                      </label>
                      <select
                        value={campaignStatus}
                        onChange={(e) => setCampaignStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option value="Active">Active</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Message Content (English) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAiTopic(messageType);
                          setAiLanguage('en');
                          setIsAIGeneratorOpen(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Enter WhatsApp friendly message text (include opt-out reminder: Reply STOP to unsubscribe)..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans"
                    />
                  </div>

                  {(campaignLanguage === 'te' || campaignLanguage === 'both') && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Message Content (Telugu - తెలుగు)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAiTopic(messageType);
                            setAiLanguage('te');
                            setIsAIGeneratorOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Generate Telugu with AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={messageContentTe}
                        onChange={(e) => setMessageContentTe(e.target.value)}
                        placeholder="తెలుగు సందేశం నమోదు చేయండి (ఆపివేయడానికి STOP అని సమాధానం ఇవ్వండి)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreateCampaignOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                    >
                      Save Campaign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 2: AI CAMPAIGN GENERATOR (GEMINI)                                   */}
          {/* ========================================================================= */}
          {isAIGeneratorOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        AI WhatsApp Campaign Generator
                      </h3>
                      <p className="text-[11px] text-slate-500">Gemini Clinical Content Engine</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAIGeneratorOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campaign Topic *
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. PCOS symptom tracking, Low-GI breakfast, 15-min post-meal walk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Language
                      </label>
                      <select
                        value={aiLanguage}
                        onChange={(e) => setAiLanguage(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="en">English</option>
                        <option value="te">Telugu (తెలుగు)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tone
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="Empathetic">Empathetic & Supportive</option>
                        <option value="Encouraging">Encouraging</option>
                        <option value="Educational">Educational / Informative</option>
                        <option value="Motivational">Motivational</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={aiAudience}
                        onChange={(e) => setAiAudience(e.target.value)}
                        placeholder="Registered PCOSense users"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Message Length
                      </label>
                      <select
                        value={aiLength}
                        onChange={(e) => setAiLength(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="Short (<160 chars)">Short (&lt;160 chars)</option>
                        <option value="Standard (<300 chars)">Standard (&lt;300 chars)</option>
                        <option value="Detailed">Detailed</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRunAIGenerator}
                      disabled={isGeneratingAI || !aiTopic.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isGeneratingAI ? 'Generating with Gemini...' : 'Generate WhatsApp Copy'}</span>
                    </button>
                  </div>

                  {/* AI Output Preview in WhatsApp Bubble */}
                  {aiGeneratedPreview && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Preview (WhatsApp Bubble)</span>
                        {aiGeneratedModel && <span className="font-mono text-emerald-400">{aiGeneratedModel}</span>}
                      </div>

                      <div className="bg-[#128C7E]/20 p-3 rounded-2xl border border-[#128C7E]/30 text-white font-sans text-xs whitespace-pre-wrap leading-relaxed">
                        {aiGeneratedPreview}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleRunAIGenerator}
                          className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Regenerate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTestContent(aiGeneratedPreview);
                            setTestLanguage(aiLanguage);
                            setIsTestMessageOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Send className="h-3 w-3" />
                          <span>Send Test</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApplyAIToCampaign}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Use in Campaign
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL 3: SEND TEST WHATSAPP MESSAGE                                       */}
          {/* ========================================================================= */}
          {isTestMessageOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="h-4 w-4 text-emerald-600" />
                    <span>Send Test WhatsApp Message</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestMessageOpen(false);
                      setTestFeedback(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {testFeedback && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium space-y-2">
                    <p>{testFeedback}</p>
                    {testDirectWaUrl && (
                      <div className="pt-1 flex flex-col gap-1.5">
                        <a
                          href={testDirectWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Open in WhatsApp & Send Test Message Now</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSendTestSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={testRecipientPhone}
                      onChange={(e) => setTestRecipientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Message Body *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsTestMessageOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingTest}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      {isSendingTest ? 'Sending...' : 'Dispatch Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: USER SUBSCRIPTIONS & 3-DAY TRIAL ACCESS CONTROL                    */}
      {/* ========================================================================= */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6" id="admin-subscriptions-page">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <span>Patient Subscription Ledger & 3-Day Trial Access Control</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Users pay ₹1 for 3-Day Trial access (access blocked after 3 days). ₹100 for Analysis & Diet, or ₹200 for Complete All-Access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">₹1 Registration Trials</span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">₹{subRevenue.trialRevenue}</p>
              <span className="text-[11px] text-amber-600">3-Day Trial Window (Auto-blocked after 3 days)</span>
            </div>

            <div className="p-5 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase">Plan 1 (₹100 / Month)</span>
              <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">₹{subRevenue.plan100Revenue}</p>
              <span className="text-[11px] text-teal-600">Analysis, Diet & Info Access Only</span>
            </div>

            <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Plan 2 (₹200 / Month)</span>
              <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">₹{subRevenue.plan200Revenue}</p>
              <span className="text-[11px] text-indigo-600">Complete All-Access + Video Workouts & Consults</span>
            </div>
          </div>

          {/* Subscriptions Ledger Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 font-bold grid grid-cols-12 gap-3 text-slate-700 dark:text-slate-300 text-xs">
              <span className="col-span-3">Patient User</span>
              <span className="col-span-3">Active Plan</span>
              <span className="col-span-2">Amount Paid</span>
              <span className="col-span-2">Expiry Date</span>
              <span className="col-span-2 text-right">Deposited Account</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {subPayments.map(p => (
                <div key={p.id} className="p-4 grid grid-cols-12 gap-3 items-center text-slate-800 dark:text-slate-200">
                  <div className="col-span-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{p.userName}</span>
                    <span className="text-[11px] text-slate-500 truncate block">{p.userEmail}</span>
                  </div>

                  <div className="col-span-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">{p.planName}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Ref: {p.transactionRef}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400">₹{p.amount}</span>
                    <span className="text-[10px] text-slate-400 block">{p.paymentMode}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-700 dark:text-slate-300 block font-medium">
                      {new Date(p.expiryDate).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(p.expiryDate).getTime() > Date.now() ? 'Active Access' : 'Access Blocked'}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block font-mono">
                      {p.depositedToAccount}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">● Deposited to Admin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
