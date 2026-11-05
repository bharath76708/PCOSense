import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Brain,
  Sliders,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  BookOpen,
  Cpu,
  BarChart2,
  Layers,
  HeartPulse,
  Award,
  TrendingUp,
  Flame,
  Database,
  PieChart as PieIcon,
  ChevronRight,
  UserCheck,
  FileSpreadsheet,
  Zap,
  Info,
  Check,
  HelpCircle,
  AlertTriangle,
  FileText,
  Dna,
  RefreshCw,
  GitBranch,
  Target,
  ArrowUpRight,
  ChevronDown,
  CheckCircle,
  Search,
  Filter,
  CreditCard,
  Lock,
  Scale,
  Receipt,
  Smile,
  Heart,
  Apple,
  Video,
  X as CloseIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { PRESET_PROFILES } from '../ml/modelEngine';
import { useAssessment } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../translations';
import { Footer } from '../components/Footer';
import { SimpleWelcomeSection } from '../components/SimpleWelcomeSection';
import { SubscriptionTiersComparison } from '../components/SubscriptionTiersComparison';
import { HowItWorksTimeline } from '../components/HowItWorksTimeline';
import { IntroPCOSenseVideo } from '../components/IntroPCOSenseVideo';

// EDA Dataset Visualizations from PCOS_Infertility.ipynb (541 clinical cases)
const FOLLICLE_DISTRIBUTION_DATA = [
  { range: '0-4 Follicles', NonPCOS: 48, PCOS: 2, total: 50 },
  { range: '5-8 Follicles', NonPCOS: 182, PCOS: 12, total: 194 },
  { range: '9-12 Follicles', NonPCOS: 96, PCOS: 46, total: 142 },
  { range: '13-16 Follicles', NonPCOS: 32, PCOS: 68, total: 100 },
  { range: '17+ Follicles', NonPCOS: 6, PCOS: 49, total: 55 }
];

const CORRELATION_RANKING_DATA = [
  { feature: 'Follicle No. (R)', correlation: 0.603, category: 'Pelvic Ultrasound', color: '#0d9488' },
  { feature: 'Follicle No. (L)', correlation: 0.598, category: 'Pelvic Ultrasound', color: '#0d9488' },
  { feature: 'Skin Darkening', correlation: 0.475, category: 'Clinical Dermatological', color: '#6366f1' },
  { feature: 'Hair Growth (Hirsutism)', correlation: 0.465, category: 'Clinical Androgen', color: '#6366f1' },
  { feature: 'Weight Gain', correlation: 0.441, category: 'Metabolic Profile', color: '#f59e0b' },
  { feature: 'Cycle Irregularity (R/I)', correlation: 0.402, category: 'Menstrual History', color: '#ec4899' },
  { feature: 'Fast Food Regularity', correlation: 0.378, category: 'Lifestyle Factor', color: '#f59e0b' },
  { feature: 'Pimples / Severe Acne', correlation: 0.321, category: 'Clinical Androgen', color: '#6366f1' },
  { feature: 'AMH Hormone Level', correlation: 0.264, category: 'Endocrine Assay', color: '#8b5cf6' },
  { feature: 'BMI (Body Mass Index)', correlation: 0.198, category: 'Metabolic Profile', color: '#f59e0b' }
];

const HORMONAL_COMPARISON_DATA = [
  { marker: 'AMH (ng/mL)', NonPCOS: 2.8, PCOS: 6.9, unit: 'ng/mL' },
  { marker: 'LH / FSH Ratio', NonPCOS: 1.05, PCOS: 2.34, unit: 'ratio' },
  { marker: 'FSH Level', NonPCOS: 5.8, PCOS: 5.2, unit: 'mIU/mL' },
  { marker: 'LH Level', NonPCOS: 6.1, PCOS: 12.2, unit: 'mIU/mL' }
];

const SYMPTOM_PREVALENCE_DATA = [
  { symptom: 'Hirsutism / Hair Growth', NonPCOS: 17.6, PCOS: 71.8 },
  { symptom: 'Skin Darkening (Acanthosis)', NonPCOS: 14.8, PCOS: 68.4 },
  { symptom: 'Weight Gain', NonPCOS: 22.0, PCOS: 63.8 },
  { symptom: 'Pimples / Acne', NonPCOS: 25.8, PCOS: 58.2 },
  { symptom: 'Irregular Cycle (R/I=4)', NonPCOS: 14.3, PCOS: 82.5 },
  { symptom: 'Fast Food Habit', NonPCOS: 31.9, PCOS: 64.4 }
];

const MODEL_BENCHMARKS_DATA = [
  { model: 'Logistic Regression (Active)', accuracy: 88.99, sensitivity: 86.11, specificity: 90.41, roc: 95.09, highlight: true },
  { model: 'Random Forest Classifier', accuracy: 87.16, sensitivity: 80.56, specificity: 90.41, roc: 93.42, highlight: false },
  { model: 'Support Vector Machine (SVM)', accuracy: 85.32, sensitivity: 77.78, specificity: 89.04, roc: 91.80, highlight: false },
  { model: 'K-Nearest Neighbors (KNN)', accuracy: 82.57, sensitivity: 75.00, specificity: 86.30, roc: 88.65, highlight: false },
  { model: 'Decision Tree Classifier', accuracy: 79.82, sensitivity: 72.22, specificity: 83.56, roc: 77.89, highlight: false }
];

// Rotterdam Phenotype Data
const PHENOTYPES_DATA = [
  {
    id: 'A',
    name: 'Phenotype A: Classic / Complete PCOS',
    tag: 'Highest Metabolic Risk (50-60% of cases)',
    criteria: ['Hyperandrogenism (Clinical or Biochemical)', 'Ovulatory Dysfunction (Oligo/Anovulation)', 'Polycystic Ovarian Morphology (Ultrasound)'],
    description: 'The most severe presentation exhibiting all three Rotterdam cardinal criteria. Marked by prominent insulin resistance, elevated AMH, high testosterone, and frequent metabolic co-morbidities.',
    carePlan: 'Intensive metabolic screening (OGTT, lipid profile), lifestyle intervention with resistance training, inositol/metformin consideration, and cyclic progesterone or combined oral contraceptives for endometrial protection.',
    color: 'border-rose-500 bg-rose-50/40 text-rose-950',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 'B',
    name: 'Phenotype B: Classic Ovulatory PCOS',
    tag: 'Intermediate Metabolic Risk (15-20% of cases)',
    criteria: ['Hyperandrogenism (Clinical or Biochemical)', 'Ovulatory Dysfunction (Oligo/Anovulation)'],
    description: 'Presents with hyperandrogenism and irregular or absent cycles, but pelvic ultrasonography reveals normal ovarian morphology (fewer than 12-20 follicles per ovary).',
    carePlan: 'Comprehensive endocrine evaluation to rule out non-classic congenital adrenal hyperplasia (NCAH) and hyperprolactinemia. Focus on menstrual cycle regularity and androgen-lowering strategies.',
    color: 'border-amber-500 bg-amber-50/40 text-amber-950',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'C',
    name: 'Phenotype C: Ovulatory PCOS',
    tag: 'Mild-Moderate Metabolic Risk (10-15% of cases)',
    criteria: ['Hyperandrogenism (Clinical or Biochemical)', 'Polycystic Ovarian Morphology (Ultrasound)'],
    description: 'Characterized by signs of excess androgens and polycystic ovaries on ultrasound, but patients experience regular menstrual cycles (eumenorrhea) and preserved ovulatory function.',
    carePlan: 'Targeted management for cosmetic symptoms (hirsutism, acne, alopecia). Periodic surveillance for late-onset metabolic shifts or progression to anovulatory cycles.',
    color: 'border-teal-500 bg-teal-50/40 text-teal-950',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'D',
    name: 'Phenotype D: Non-Androgenic PCOS',
    tag: 'Lowest Androgen Risk (10-15% of cases)',
    criteria: ['Ovulatory Dysfunction (Oligo/Anovulation)', 'Polycystic Ovarian Morphology (Ultrasound)'],
    description: 'Displays irregular periods and polycystic ovaries without clinical or biochemical signs of hyperandrogenism. Often considered the mildest phenotype, but requires careful differential diagnosis.',
    carePlan: 'Endometrial protection against hyperplasia due to prolonged unopposed estrogen. Ovulation induction when fertility is desired.',
    color: 'border-indigo-500 bg-indigo-50/40 text-indigo-950',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
];

// Pathophysiology cascade steps
const PATHOPHYSIOLOGY_STEPS = [
  {
    step: 1,
    title: 'Insulin Resistance & Hyperinsulinemia',
    origin: 'Pancreas, Liver & Peripheral Tissue',
    mechanism: 'Post-receptor insulin signaling defects impair glucose uptake. In response, pancreatic β-cells hypersecrete insulin. Elevated fasting insulin directly suppresses hepatic Sex Hormone-Binding Globulin (SHBG) production, substantially increasing circulating free (bioactive) testosterone.',
    keyMarkers: ['Elevated Fasting Insulin', 'Suppressed SHBG', 'Acanthosis Nigricans']
  },
  {
    step: 2,
    title: 'Ovarian Theca Cell Hyper-Responsiveness',
    origin: 'Ovarian Stroma & Theca Cells',
    mechanism: 'Insulin acts synergistically with Luteinizing Hormone (LH) through the ovarian insulin/IGF-1 receptor complex. This upregulates steroidogenic enzymes (CYP17A1 / 17α-hydroxylase), driving massive androgen overproduction (androstenedione and testosterone).',
    keyMarkers: ['Elevated Total & Free Testosterone', 'Increased Androstenedione', 'DHEA-S']
  },
  {
    step: 3,
    title: 'Altered GnRH & Pituitary LH/FSH Pulsatility',
    origin: 'Hypothalamus & Anterior Pituitary',
    mechanism: 'Deficient central progesterone negative feedback speeds up hypothalamic GnRH pulse frequency. Fast GnRH pulses selectively stimulate anterior pituitary gonadotropes to hypersecrete LH while relatively suppressing FSH, producing the classic inverted LH:FSH ratio (>2:1).',
    keyMarkers: ['Elevated LH (>10 mIU/mL)', 'LH:FSH Ratio > 2.0', 'Suboptimal FSH']
  },
  {
    step: 4,
    title: 'Antral Follicular Arrest & AMH Hypersecretion',
    origin: 'Granulosa Cells of Small Antral Follicles',
    mechanism: 'Because FSH levels are inadequate and local androgen concentrations are high, antral follicles arrest at the 2–9 mm stage. Unable to select a dominant pre-ovulatory Graafian follicle, these numerous small follicles massively produce Anti-Müllerian Hormone (AMH), creating the polycystic "string of pearls" ultrasound morphology.',
    keyMarkers: ['AMH > 5.0 ng/mL', 'Follicles ≥ 12 per ovary', 'Anovulation']
  },
  {
    step: 5,
    title: 'Clinical Presentation & Long-Term Metabolic Cascades',
    origin: 'Skin, Hair Follicles, Endometrium & Vascular System',
    mechanism: 'Peripheral conversion by 5α-reductase converts testosterone to DHT in hair follicles (causing hirsutism and androgenic alopecia) and pilosebaceous units (causing cystic acne). Chronic anovulation leads to unopposed estrogen stimulation of the endometrium, while chronic hyperinsulinemia elevates lifetime risk of Type 2 Diabetes and Dyslipidemia.',
    keyMarkers: ['Hirsutism (FG Score ≥ 8)', 'Cystic Acne', 'Irregular Cycles (R/I=4)', 'Elevated WHR']
  }
];

// Lab Value & Biomarker Cheat Sheet
const BIOMARKER_GUIDE = [
  {
    name: 'Anti-Müllerian Hormone (AMH)',
    unit: 'ng/mL',
    normalRange: '1.0 – 3.5 ng/mL',
    pcosRange: '4.5 – 12.0+ ng/mL',
    significance: 'Directly reflects the total quantity of growing pre-antral and small antral follicles. Elevated AMH is a highly sensitive biochemical proxy for polycystic ovarian morphology.'
  },
  {
    name: 'LH / FSH Ratio',
    unit: 'Ratio',
    normalRange: '0.8 – 1.2 : 1 (Early Follicular)',
    pcosRange: '2.0 – 3.5+ : 1',
    significance: 'High LH relative to FSH causes excess ovarian theca androgen synthesis and prevents follicle selection for ovulation.'
  },
  {
    name: 'Total Serum Testosterone',
    unit: 'ng/dL',
    normalRange: '15 – 45 ng/dL',
    pcosRange: '50 – 90+ ng/dL',
    significance: 'Primary circulating androgen in females. Even modest elevations cause dermatological manifestations (acne, hirsutism).'
  },
  {
    name: 'Sex Hormone-Binding Globulin (SHBG)',
    unit: 'nmol/L',
    normalRange: '40 – 120 nmol/L',
    pcosRange: '15 – 35 nmol/L (Suppressed)',
    significance: 'Suppressed by hyperinsulinemia. Low SHBG leaves a higher proportion of testosterone unbound (free), increasing biological androgenic potency.'
  },
  {
    name: 'Fasting Glucose & Fasting Insulin',
    unit: 'mg/dL & µIU/mL',
    normalRange: 'Glucose < 100 mg/dL, Insulin < 10 µIU/mL',
    pcosRange: 'Insulin > 15 µIU/mL, HOMA-IR > 2.5',
    significance: 'Evaluates peripheral insulin resistance, which drives both ovarian dysfunction and long-term cardiometabolic risk.'
  },
  {
    name: 'Ultrasound Follicle Count (FNPO)',
    unit: 'Follicles per Ovary',
    normalRange: '3 – 8 follicles (2–9 mm)',
    pcosRange: '≥ 12 – 20+ follicles per ovary',
    significance: 'Defines Polycystic Ovarian Morphology (PCOM) per Rotterdam 2003 and 2023 international evidence-based guidelines.'
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadPreset, submitPrediction } = useAssessment();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { t, isTelugu } = useLanguage();
  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState<'simple' | 'clinical'>('simple');
  const [activeEdaTab, setActiveEdaTab] = useState<'follicles' | 'correlation' | 'hormones' | 'symptoms' | 'benchmarks'>('follicles');
  const [selectedPhenotype, setSelectedPhenotype] = useState<string>('A');
  const [activePathoStep, setActivePathoStep] = useState<number>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [selectedWorkflowTab, setSelectedWorkflowTab] = useState<'patient' | 'doctor' | 'business' | 'compliance'>('patient');

  // Live Symptom Simulator Sandbox State
  const [simCycleIrregular, setSimCycleIrregular] = useState<boolean>(true);
  const [simSkinDarkening, setSimSkinDarkening] = useState<boolean>(true);
  const [simHairGrowth, setSimHairGrowth] = useState<boolean>(true);
  const [simWeightGain, setSimWeightGain] = useState<boolean>(true);
  const [simPimples, setSimPimples] = useState<boolean>(false);
  const [simFollicleCount, setSimFollicleCount] = useState<number>(14);
  const [simBmi, setSimBmi] = useState<number>(27.5);

  // Calculate live simulator score approximation
  const calculateSimScore = () => {
    let logOdds = -2.8; // Baseline intercept
    if (simCycleIrregular) logOdds += 1.65;
    if (simSkinDarkening) logOdds += 1.85;
    if (simHairGrowth) logOdds += 1.55;
    if (simWeightGain) logOdds += 1.10;
    if (simPimples) logOdds += 0.85;
    
    // Follicle impact (normalized around mean ~7)
    const follicleDelta = simFollicleCount - 7;
    logOdds += follicleDelta * 0.28;
    
    // BMI impact (normalized around mean ~23)
    const bmiDelta = simBmi - 23;
    logOdds += bmiDelta * 0.08;

    // Sigmoid transformation
    const prob = 1 / (1 + Math.exp(-logOdds));
    return Math.min(Math.max(Math.round(prob * 100), 2), 99);
  };

  const simRiskScore = calculateSimScore();

  const handleSelectPreset = async (presetId: string) => {
    if (!isAuthenticated) {
      navigate('/register?redirect=/assessment');
      return;
    }
    loadPreset(presetId);
    await submitPrediction();
    navigate('/results');
  };

  const faqs = [
    {
      id: 1,
      category: 'diagnosis',
      categoryLabel: isTelugu ? 'నిర్ధారణ & మార్గదర్శకాలు' : 'Diagnosis & Guidelines',
      tag: isTelugu ? 'రోటర్‌డ్యామ్ 2023 మార్గదర్శకాలు' : 'Rotterdam 2023 Guidelines',
      q: isTelugu ? 'అంతర్జాతీయ మార్గదర్శకాల ప్రకారం PCOS ను ఎలా గుర్తిస్తారు?' : 'How is PCOS clinically diagnosed according to international guidelines?',
      a: isTelugu 
        ? 'రోటర్‌డ్యామ్ 2003 ప్రమాణాల (2023 అంతర్జాతీయ నిపుణుల మార్గదర్శకాల) ప్రకారం, ఈ 3 ప్రధాన లక్షణాలలో కనీసం 2 ఉన్నప్పుడు PCOS నిర్ధారణ చేయబడుతుంది: 1) అసాధారణ లేదా నిలిచిపోయిన పీరియడ్స్ (సంవత్సరానికి 8 కంటే తక్కువ లేదా 35+ రోజుల చక్రం), 2) పురుష హార్మోన్ల (ఆండ్రోజెన్) అధిక స్థాయి లేదా లక్షణాలు (ముఖం/శరీరంపై అధిక రోమాలు, తీవ్ర మొటిమలు), మరియు 3) పెల్విక్ అల్ట్రాసౌండ్‌లో పాలిసిస్టిక్ అండాశయాలు (ఒక్కో అండాశయంలో ≥12-20 ఫోలికల్స్) లేదా అధిక AMH స్థాయి.'
        : 'Under the Rotterdam 2003 Consensus Criteria (reaffirmed and refined by the 2023 International Evidence-based Guidelines), PCOS is diagnosed when at least 2 out of 3 cardinal features are confirmed (after ruling out differential diagnoses like thyroid disease, hyperprolactinemia, and congenital adrenal hyperplasia): 1) Oligo- or anovulation (cycles > 35 days, fewer than 8 cycles per year, or complete amenorrhea), 2) Clinical and/or biochemical hyperandrogenism (hirsutism on Ferriman-Gallwey scale, cystic acne, androgenic alopecia, or elevated serum total/free testosterone), and 3) Polycystic ovarian morphology (PCOM) on pelvic ultrasound (≥20 follicles per ovary or ovarian volume ≥10 mL) or significantly elevated serum AMH.'
    },
    {
      id: 2,
      category: 'diagnosis',
      categoryLabel: isTelugu ? 'నిర్ధారణ & మార్గదర్శకాలు' : 'Diagnosis & Guidelines',
      tag: isTelugu ? 'లీన్ PCOS' : 'Lean PCOS Archetype',
      q: isTelugu ? 'సన్నగా లేదా సాధారణ బరువు ఉన్నవారికి కూడా PCOS వస్తుందా?' : 'Can lean or normal-weight individuals develop PCOS?',
      a: isTelugu
        ? 'అవును. PCOS ఉన్న మహిళల్లో దాదాపు 20% నుండి 30% మంది సాధారణ బరువు (BMI < 25) కలిగి ఉంటారు. దీనిని "లీన్ PCOS" అంటారు. వీరిలో కూడా ఇన్సులిన్ రెసిస్టెన్స్, హార్మోన్ల అసమతుల్యత (LH/FSH అసమతుల్యత) మరియు అండం విడుదల కాకపోవడం వంటి లక్షణాలు ఉంటాయి. బరువు సాధారణంగా ఉండటం వల్ల వీరిలో వ్యాధిని ఆలస్యంగా గుర్తిస్తుంటారు.'
        : 'Yes. Approximately 20% to 30% of women diagnosed with PCOS have a normal BMI (< 25 kg/m²), known clinically as "Lean PCOS". Lean PCOS patients still frequently exhibit subtle cellular insulin resistance, marked LH/FSH hypersecretion, elevated androgens, and ovulatory arrest. Because body weight is normal, lean individuals are often underdiagnosed or experience multi-year diagnostic delays.'
    },
    {
      id: 3,
      category: 'diagnosis',
      categoryLabel: isTelugu ? 'నిర్ధారణ & మార్గదర్శకాలు' : 'Diagnosis & Guidelines',
      tag: isTelugu ? 'అల్ట్రాసౌండ్ పరీక్ష' : 'Ultrasound Morphology',
      q: isTelugu ? 'అల్ట్రాసౌండ్‌లో పాలిసిస్టిక్ అండాశయాలు కనిపిస్తే PCOS ఉన్నట్లేనా?' : 'Does having polycystic ovaries on ultrasound mean I definitely have PCOS?',
      a: isTelugu
        ? 'ఖచ్చితంగా కాదు. ఆరోగ్యకరమైన మహిళల్లో సుమారు 25% మందికి అల్ట్రాసౌండ్‌లో ఫోలికల్స్ ఎక్కువగా కనిపించవచ్చు. PCOS నిర్ధారణకు కేవలం స్కాన్ మాత్రమే సరిపోదు; క్రమం తప్పిన పీరియడ్స్ లేదా అధిక ఆండ్రోజెన్ లక్షణాలతో కలిపి కనీసం 2 ప్రమాణాలు పూర్తి కావాలి.'
        : 'No. Up to 25% of completely healthy women with regular menstrual cycles and normal androgen levels show polycystic-appearing ovarian morphology (PCOM) on pelvic ultrasound. Ultrasound morphology is only one of the three Rotterdam criteria. A diagnosis of PCOS strictly requires meeting at least two of the three cardinal criteria (i.e. polycystic ovaries PLUS either irregular periods or androgen excess).'
    },
    {
      id: 4,
      category: 'diagnosis',
      categoryLabel: isTelugu ? 'నిర్ధారణ & మార్గదర్శకాలు' : 'Diagnosis & Guidelines',
      tag: isTelugu ? 'PCOD vs PCOS తేడా' : 'PCOD vs PCOS Distinction',
      q: isTelugu ? 'PCOD మరియు PCOS మధ్య ఉన్న తేడా ఏమిటి?' : 'What is the clinical difference between PCOD and PCOS?',
      a: isTelugu
        ? 'PCOD అనేది అండాశయాలలో తాత్కాలికంగా అపరిపక్వ గుడ్లు చేరే పరిస్థితి, ఇది సాధారణంగా ఆహార జీవనశైలి మార్పులతో త్వరగా తగ్గుతుంది. కానీ PCOS అనేది ఎండోక్రైన్ మరియు జీవక్రియలకు సంబంధించిన పూర్తి వ్యవస్థాగత సమస్య. ఇది ఇన్సులిన్ రెసిస్టెన్స్, హార్మోన్ లోపాలు మరియు దీర్ఘకాలిక ఆరోగ్య ప్రమాదాలతో కూడుకుని ఉంటుంది.'
        : 'Polycystic Ovarian Disease (PCOD) historically refers to a localized anatomical state where the ovaries release immature or partially mature eggs that develop into small antral cysts, often manageable through basic lifestyle adjustments. Polycystic Ovary Syndrome (PCOS), by contrast, is an endocrine, metabolic, and systemic disorder characterized by complex hypothalamic-pituitary-ovarian axis dysregulation, chronic hyperandrogenism, and systemic insulin resistance carrying elevated risks for metabolic syndrome, gestational diabetes, and cardiovascular complications.'
    },
    {
      id: 5,
      category: 'symptoms',
      categoryLabel: isTelugu ? 'లక్షణాలు & హార్మోన్లు' : 'Symptoms & Hormones',
      tag: isTelugu ? 'హార్మోన్ల అసమతుల్యత' : 'Neuroendocrine Axis',
      q: isTelugu ? 'PCOS లో అధిక LH స్థాయిలు మరియు LH:FSH నిష్పత్తి ఎందుకు పెరుగుతుంది?' : 'Why do high LH levels and abnormal LH:FSH ratios (> 2:1) occur in PCOS?',
      a: isTelugu
        ? 'మెదడులోని పిట్యూటరీ గ్రంథి లూటినైజింగ్ హార్మోన్ (LH) ను అధికంగా విడుదల చేయడం వల్ల అండాశయాలు ఎక్కువ టెస్టోస్టెరాన్ ఉత్పత్తి చేస్తాయి. అదే సమయంలో FSH తక్కువగా ఉండటం వల్ల గుడ్లు పూర్తిగా పెరిగి విడుదల కాలేవు.'
        : 'In PCOS, impaired central progesterone negative feedback accelerates hypothalamic GnRH pulse frequency. Rapid GnRH pulses preferentially stimulate anterior pituitary gonadotropes to hypersecrete Luteinizing Hormone (LH) while relatively suppressing Follicle-Stimulating Hormone (FSH). High LH continuously overstimulates ovarian theca cells to synthesize androgens, while insufficient FSH halts follicle maturation before a dominant follicle can rupture for ovulation.'
    },
    {
      id: 6,
      category: 'symptoms',
      categoryLabel: isTelugu ? 'లక్షణాలు & హార్మోన్లు' : 'Symptoms & Hormones',
      tag: isTelugu ? 'చర్మ మార్పులు' : 'Dermatological Markers',
      q: isTelugu ? 'మెడ వెనుక నల్లబడటం (అకాంతోసిస్ నైగ్రికన్స్) ఎందుకు వస్తుంది?' : 'What causes Acanthosis Nigricans (skin darkening) and skin tags in PCOS?',
      a: isTelugu
        ? 'ఇది శరీరంలో ఇన్సులిన్ స్థాయిలు చాలా ఎక్కువగా ఉండటం వల్ల వస్తుంది (హైపర్‌ఇన్సులినిమియా). రక్తం లోని అధిక ఇన్సులిన్ చర్మ కణాలను వేగంగా పెరిగేలా చేసి మెడ, చంకలు మరియు గజ్జల్లో నల్లటి మందపాటి చర్మాన్ని ఏర్పరుస్తుంది.'
        : 'Acanthosis Nigricans—characterized by dark, velvety, hyperpigmented patches in flexural skin folds (such as the nape of the neck, axillae, under breasts, and groin)—is a direct dermatological manifestation of severe hyperinsulinemia. Extremely high circulating insulin crosses the epidermal basement membrane and binds to Insulin-like Growth Factor 1 (IGF-1) receptors on dermal fibroblasts and epidermal keratinocytes, stimulating excessive cellular proliferation.'
    },
    {
      id: 7,
      category: 'symptoms',
      categoryLabel: isTelugu ? 'లక్షణాలు & హార్మోన్లు' : 'Symptoms & Hormones',
      tag: isTelugu ? 'మొటిమలు & జుట్టు రాలడం' : 'Androgen Mediated Symptoms',
      q: isTelugu ? 'PCOS వల్ల మొటిమలు మరియు జుట్టు రాలడం ఎందుకు జరుగుతుంది?' : 'How does PCOS cause adult cystic acne and female pattern hair loss (alopecia)?',
      a: isTelugu
        ? 'అధిక ఆండ్రోజెన్లు (టెస్టోస్టెరాన్) చర్మంలోని నూనె గ్రంథులను ప్రేరేపించి దవడలు మరియు వెనుక భాగంలో గట్టి మొటిమలను కలిగిస్తాయి. అలాగే తలమీద వెంట్రుకల కుదుళ్లను బలహీనపరిచి జుట్టు రాలేలా చేస్తాయి.'
        : 'Excess ovarian and adrenal androgens (such as testosterone, androstenedione, and DHEA-S) are converted in target tissues by the enzyme 5α-reductase into Dihydrotestosterone (DHT), a potent androgen. In pilosebaceous units, DHT stimulates hyperactive sebum production and follicular hyperkeratinization, leading to deep inflammatory cystic acne along the jawline and back. In hair follicles on the scalp vertex, DHT induces follicular miniaturization and shortened anagen growth cycles, producing diffuse androgenic alopecia.'
    },
    {
      id: 8,
      category: 'symptoms',
      categoryLabel: isTelugu ? 'లక్షణాలు & హార్మోన్లు' : 'Symptoms & Hormones',
      tag: isTelugu ? 'హిర్సుటిజం' : 'Ferriman-Gallwey Score',
      q: isTelugu ? 'శరీరంపై అవాంఛిత రోమాలు (హిర్సుటిజం) అంటే ఏమిటి?' : 'What is the difference between Hirsutism and normal body hair?',
      a: isTelugu
        ? 'గడ్డం, పైపెదవి, ఛాతీ లేదా పొట్టపై పురుషుల తరహాలో మందపాటి, నల్లటి రోమాలు పెరగడాన్ని హిర్సుటిజం అంటారు. ఇది శరీరంలో ఆండ్రోజెన్ హార్మోన్లు ఎక్కువగా ఉన్నాయని సూచిస్తుంది.'
        : 'Hirsutism is defined as the growth of stiff, pigmented, coarse "terminal" hair in a male-pattern distribution on androgen-sensitive body areas—such as the chin, upper lip, chest, upper and lower abdomen, inner thighs, and lower back. It is quantified clinically using the modified Ferriman-Gallwey (mFG) visual scoring system, where a score ≥4–8 (varying by ethnicity) indicates significant clinical hyperandrogenism, contrasting with soft, unpigmented vellus hair.'
    },
    {
      id: 9,
      category: 'fertility',
      categoryLabel: isTelugu ? 'సంతానోత్పత్తి & గర్భధారణ' : 'Fertility & Ovulation',
      tag: isTelugu ? 'సహజ గర్భధారణ' : 'Reproductive Health',
      q: isTelugu ? 'PCOS ఉన్న మహిళలు సహజంగా గర్భం దాల్చవచ్చా?' : 'Can women with PCOS get pregnant naturally?',
      a: isTelugu
        ? 'ఖచ్చితంగా అవును. PCOS శాశ్వత వంధ్యత్వం కాదు. సరైన ఆహారం, వ్యాయామం, ఇన్సులిన్ స్థాయిలను నియంత్రించడం మరియు అవసరమైతే వైద్యుల పర్యవేక్షణలో మందుల ద్వారా చాలా మంది మహిళలు విజయవంతంగా గర్భం దాలుస్తారు.'
        : 'Yes, absolutely. PCOS is a leading cause of ovulatory subfertility, but it is NOT permanent sterility. Most women with PCOS have a plentiful ovarian reserve (high follicle pool and AMH). Restoring spontaneous ovulation through lifestyle modifications, insulin sensitization (such as inositol or metformin), and targeted first-line ovulation induction medications (like Letrozole or Clomiphene Citrate) results in high cumulative conception and live birth rates.'
    },
    {
      id: 10,
      category: 'fertility',
      categoryLabel: isTelugu ? 'సంతానోత్పత్తి & గర్భధారణ' : 'Fertility & Ovulation',
      tag: isTelugu ? 'గర్భధారణ జాగ్రత్తలు' : 'Pregnancy Considerations',
      q: isTelugu ? 'PCOS ఉన్నప్పుడు గర్భధారణలో ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?' : 'Why does PCOS increase the risk of early miscarriage and gestational complications?',
      a: isTelugu
        ? 'PCOS ఉన్నవారిలో గర్భధారణ సమయంలో షుగర్ (జెస్టేషనల్ డయాబెటిస్) మరియు రక్తపోటు పెరిగే అవకాశం ఉంటుంది. కాబట్టి గర్భం దాల్చక ముందే మరియు గర్భధారణ తొలి నెలల నుంచే రక్తంలో గ్లూకోజ్ స్థాయిలను క్రమం తప్పకుండా పరీక్షించుకోవాలి.'
        : 'Untreated hyperinsulinemia, elevated plasminogen activator inhibitor-1 (PAI-1), luteal phase progesterone insufficiency, and chronic low-grade inflammation can impair optimal endometrial decidualization and early placental vascularization. Women with PCOS also have a 3- to 4-fold higher risk of gestational diabetes mellitus (GDM), pre-eclampsia, and gestational hypertension, which is why early preconception metabolic optimization and early first-trimester glucose screening are strongly recommended.'
    },
    {
      id: 11,
      category: 'fertility',
      categoryLabel: isTelugu ? 'సంతానోత్పత్తి & గర్భధారణ' : 'Fertility & Ovulation',
      tag: isTelugu ? 'గర్భాశయ ఆరోగ్యం' : 'Endometrial Health',
      q: isTelugu ? 'పీరియడ్స్ చాలా నెలలు రాకపోతే గర్భాశయంపై ఎలాంటి ప్రభావం ఉంటుంది?' : 'How does endometrial hyperplasia develop in PCOS, and how is it prevented?',
      a: isTelugu
        ? 'పీరియడ్స్ రాని సమయంలో ఈస్ట్రోజెన్ హార్మోన్ ప్రభావం వల్ల గర్భాశయ లోపలి పొర (ఎండోమెట్రియం) మందంగా పెరుగుతుంది. ఇది భవిష్యత్తులో ప్రమాదాలకు దారితీయకుండా కనీసం 3-4 నెలలకు ఒకసారైనా రక్తస్రావం అయ్యేలా వైద్యుల సహాయం తీసుకోవాలి.'
        : 'When ovulation does not occur (chronic anovulation), the ovaries continuously produce estrogen without the regular post-ovulatory rise in progesterone. Unopposed estrogen causes the endometrial lining to continuously thicken (endometrial hyperplasia), which over years significantly increases the risk of endometrial cancer. Prevention involves ensuring regular endometrial shedding—either by restoring ovulation or using cyclical micronized progesterone or combined oral contraceptives at least every 3 to 4 months.'
    },
    {
      id: 12,
      category: 'metabolism',
      categoryLabel: isTelugu ? 'ఇన్సులిన్ & జీవక్రియ' : 'Insulin & Metabolism',
      tag: isTelugu ? 'ఇన్సులిన్ రెసిస్టెన్స్' : 'Dual Pathophysiology',
      q: isTelugu ? 'ఇన్సులిన్ రెసిస్టెన్స్ PCOS ను ఎలా పెంచుతుంది?' : 'How does Insulin Resistance directly trigger ovarian androgen overproduction?',
      a: isTelugu
        ? 'కణాలు ఇన్సులిన్‌కు సరిగ్గా స్పందించకపోవడం వల్ల ప్యాంక్రియాస్ ఎక్కువ ఇన్సులిన్ తయారు చేస్తుంది. ఈ అధిక ఇన్సులిన్ అండాశయాలను ఎక్కువ పురుష హార్మోన్లను తయారు చేసేలా ప్రేరేపిస్తుంది.'
        : 'Hyperinsulinemia acts through two synergistic mechanisms: 1) It directly binds to insulin and hybrid IGF-1 receptors on ovarian theca cells, upregulating CYP17A1 (17α-hydroxylase) enzyme activity to mass-produce testosterone and androstenedione; and 2) It suppresses Sex Hormone-Binding Globulin (SHBG) synthesis in the liver. Lower SHBG means a greater fraction of circulating testosterone remains unbound and biologically active (free testosterone).'
    },
    {
      id: 13,
      category: 'metabolism',
      categoryLabel: isTelugu ? 'ఇన్సులిన్ & జీవక్రియ' : 'Insulin & Metabolism',
      tag: isTelugu ? 'బరువు తగ్గడం' : 'Metabolic Rate & Lipogenesis',
      q: isTelugu ? 'PCOS ఉన్నవారికి బరువు తగ్గడం ఎందుకు కష్టంగా ఉంటుంది?' : 'Why is it exceptionally difficult for women with PCOS to lose weight?',
      a: isTelugu
        ? 'అధిక ఇన్సులిన్ శరీరంలో కొవ్వును నిల్వ చేయడానికి సహాయపడుతుంది మరియు కొవ్వు కరగడాన్ని అడ్డుకుంటుంది. జీవక్రియ రేటు నెమ్మదించడం మరియు ఆకలిని పెంచే హార్మోన్లు ఎక్కువ కావడం వల్ల బరువు తగ్గడం సవాలుగా మారుతుంది.'
        : 'Insulin is the body\'s primary fat-storage hormone. Chronic hyperinsulinemia preferentially channels dietary glucose into adipose tissue (lipogenesis) while strongly blocking the breakdown of stored body fat (lipolysis). Furthermore, studies demonstrate that women with PCOS often exhibit impaired postprandial secretion of satiety hormones (GLP-1 and PYY), elevated ghrelin (the hunger hormone), and reduced resting metabolic rates (up to 150–400 kcal/day lower than age-matched controls).'
    },
    {
      id: 14,
      category: 'metabolism',
      categoryLabel: isTelugu ? 'ఇన్సులిన్ & జీవక్రియ' : 'Insulin & Metabolism',
      tag: isTelugu ? 'పోషకాహారం' : 'Evidence-Based Nutrition',
      q: isTelugu ? 'PCOS కోసం ఎలాంటి ఆహార విధానం ఉత్తమమైనది?' : 'What dietary principles have the strongest clinical trial evidence for PCOS?',
      a: isTelugu
        ? 'తక్కువ గ్లైసెమిక్ ఇండెక్స్ (Low GI) గల ఆహారాలు, ఎక్కువ పీచు (ఫైబర్ - రోజుకు 25-30 గ్రాములు), మంచి ప్రోటీన్లు మరియు ఆరోగ్యకరమైన కొవ్వులు కలిగిన సమతుల్య ఆహారం రక్తంలో షుగర్ మరియు ఇన్సులిన్ పెరగకుండా కాపాడుతుంది.'
        : 'Clinical guidelines recommend a low-glycemic index (Low-GI), anti-inflammatory eating pattern modeled after the Mediterranean diet. Key components include: 1) Pairing complex carbohydrates with lean protein and healthy fats at every meal to flatten postprandial glucose and insulin spikes; 2) Consuming ≥28–35g of prebiotic dietary fiber daily to support the gut microbiome; and 3) Limiting ultra-processed foods, refined flours, and sugar-sweetened beverages. Extreme restrictive crash diets are discouraged as they increase cortisol and worsen metabolic adaptation.'
    },
    {
      id: 15,
      category: 'treatment',
      categoryLabel: isTelugu ? 'చికిత్సలు & సంరక్షణ' : 'Treatments & Care',
      tag: isTelugu ? 'ఇనోసిటాల్ సప్లిమెంట్' : 'Nutraceutical Evidence',
      q: isTelugu ? 'ఇనోసిటాల్ (Myo-Inositol) PCOS లో ఎలా పనిచేస్తుంది?' : 'What is the scientific role of Inositol (Myo-Inositol & D-Chiro-Inositol in 40:1 ratio)?',
      a: isTelugu
        ? 'ఇనోసిటాల్ కణాలలో ఇన్సులిన్ సమర్థవంతంగా పనిచేయడానికి సహాయపడుతుంది. 40:1 నిష్పత్తిలో Myo మరియు D-Chiro ఇనోసిటాల్ తీసుకోవడం వల్ల పీరియడ్స్ క్రమబద్ధం కావడం, అండాల నాణ్యత మెరుగవడం మరియు హార్మోన్ల సమతుల్యత వస్తుంది.'
        : 'Inositol isomers act as intracellular second messengers in the insulin signaling cascade. Myo-inositol promotes cellular glucose uptake and enhances FSH signaling in ovarian granulosa cells, while D-chiro-inositol modulates glycogen synthesis and androgen production. Randomized controlled trials demonstrate that supplementing with a physiological 40:1 Myo-to-D-Chiro Inositol ratio (typically 2000mg Myo + 50mg DCI twice daily) significantly improves insulin sensitivity, reduces serum LH and testosterone, restores spontaneous ovulatory cycles, and improves oocyte quality.'
    },
    {
      id: 16,
      category: 'treatment',
      categoryLabel: isTelugu ? 'చికిత్సలు & సంరక్షణ' : 'Treatments & Care',
      tag: isTelugu ? 'గర్భనిరోధక మాత్రలు' : 'Pharmacotherapy',
      q: isTelugu ? 'గర్భనిరోధక మాత్రలు PCOS ను పూర్తిగా నయం చేస్తాయా?' : 'Are combined oral contraceptive pills (birth control) a cure for PCOS?',
      a: isTelugu
        ? 'గర్భనిరోధక మాత్రలు లక్షణాలను (పీరియడ్స్ క్రమం, మొటిమలు, అధిక రోమాలు) నియంత్రించడంలో సహాయపడతాయి, కానీ అవి శాశ్వత నివారణ కాదు. జీవక్రియ మరియు ఆహారపు మార్పులు అత్యంత ముఖ్యం.'
        : 'Oral contraceptives are effective symptom-management medications, not a curative treatment. They suppress pituitary LH secretion, stimulate liver SHBG production (which reduces free testosterone by ~50%), regulate monthly bleeding patterns, clear androgenic acne, and protect the endometrium from hyperplasia. However, they do not resolve underlying insulin resistance or intrinsic steroidogenic theca cell defects, so comprehensive metabolic and lifestyle care remains essential.'
    },
    {
      id: 17,
      category: 'treatment',
      categoryLabel: isTelugu ? 'చికిత్సలు & సంరక్షణ' : 'Treatments & Care',
      tag: isTelugu ? 'మెట్‌ఫార్మిన్' : 'Insulin Sensitizer',
      q: isTelugu ? 'PCOS లో మెట్‌ఫార్మిన్ (Metformin) మందు పాత్ర ఏమిటి?' : 'What role does Metformin play in managing PCOS?',
      a: isTelugu
        ? 'మెట్‌ఫార్మిన్ కాలేయంలో గ్లూకోజ్ ఉత్పత్తిని తగ్గించి, కణాలు ఇన్సులిన్‌ను బాగా గ్రహించేలా చేస్తుంది. ఇది ఇన్సులిన్ స్థాయిలను తగ్గించి, అండం విడుదల కావడానికి మరియు బరువు నియంత్రణకు సహాయపడుతుంది.'
        : 'Metformin is an oral biguanide that inhibits hepatic gluconeogenesis and increases peripheral glucose uptake via AMPK activation. In PCOS, Metformin reduces fasting insulin, lowers circulating total and free testosterone, assists in modest weight reduction, and can induce spontaneous ovulation in women with insulin resistance or prediabetes. It is frequently combined with lifestyle interventions or inositol for synergistic metabolic support.'
    },
    {
      id: 18,
      category: 'ml-testing',
      categoryLabel: isTelugu ? 'పరీక్షలు & AI మోడల్' : 'Testing & ML Model',
      tag: isTelugu ? 'AI మోడల్ విశ్వసనీయత' : 'Algorithm & Data Privacy',
      q: isTelugu ? 'ఈ PCOSense మోడల్ రిస్క్ శాతాన్ని ఎలా గణిస్తుంది మరియు డేటా భద్రత ఎలా ఉంటుంది?' : 'How does the PCOSense machine learning engine calculate probability and protect privacy?',
      a: isTelugu
        ? '541 క్లినికల్ రికార్డులపై శిక్షణ పొందిన మెషిన్ లెర్నింగ్ మోడల్ మీ లక్షణాలను విశ్లేషించి రిస్క్ స్కోరును లెక్కిస్తుంది. మీ వ్యక్తిగత వివరాలు సురక్షితంగా మీ పరికరంలో మాత్రమే ప్రాసెస్ చేయబడతాయి.'
        : 'PCOSense runs a calibrated Logistic Regression classifier with L2 regularization and StandardScaler z-score normalization, cross-validated on 541 hospital clinical cases with an ROC-AUC of 95.09%. Each feature shifts mathematical log-odds according to proven empirical coefficients. All predictive inference occurs locally in your secure session, and personal health entries are never sold or transmitted to third-party ad networks.'
    },
    {
      id: 19,
      category: 'ml-testing',
      categoryLabel: isTelugu ? 'పరీక్షలు & AI మోడల్' : 'Testing & ML Model',
      tag: isTelugu ? 'రక్త పరీక్షల వివరాలు' : 'Diagnostic Workup Checklist',
      q: isTelugu ? 'వైద్యుల వద్ద ఏ ఏ రక్త పరీక్షలు చేయించుకోవాలి?' : 'What exact blood tests and biomarker panels should I request from my physician?',
      a: isTelugu
        ? 'పీరియడ్స్ వచ్చిన 2-5వ రోజుల్లో: టోటల్/ఫ్రీ టెస్టోస్టెరాన్, LH, FSH, AMH, థైరాయిడ్ (TSH), ప్రొలాక్టిన్, ఫాస్టింగ్ గ్లూకోజ్, ఫాస్టింగ్ ఇన్సులిన్ మరియు లిపిడ్ ప్రొఫైల్ పరీక్షలు చేయించుకోవాలి.'
        : 'Request an early follicular phase (Day 2 to 5 of bleeding) hormonal panel including: 1) Total & Free Testosterone and DHEA-S; 2) LH and FSH; 3) Estradiol (E2); 4) Serum Anti-Müllerian Hormone (AMH); 5) Thyroid-Stimulating Hormone (TSH) & Prolactin (to rule out mimic conditions); 6) Fasting Glucose & Fasting Insulin (or 75g 2-hour OGTT); and 7) Comprehensive Fasting Lipid Panel.'
    },
    {
      id: 20,
      category: 'ml-testing',
      categoryLabel: isTelugu ? 'పరీక్షలు & AI మోడల్' : 'Testing & ML Model',
      tag: isTelugu ? 'వయస్సు & మెనోపాజ్' : 'Long-Term Trajectory',
      q: isTelugu ? 'వయస్సు పెరిగే కొద్దీ PCOS లక్షణాలు తగ్గుతాయా?' : 'Can PCOS symptoms improve or change as women age or enter menopause?',
      a: isTelugu
        ? 'వయస్సు పెరిగే కొద్దీ అండాశయాలలోని ఫోలికల్స్ తగ్గి పీరియడ్స్ క్రమబద్ధం కావచ్చు. కానీ గుండె మరియు షుగర్ సంబంధిత జీవక్రియ ప్రమాదాలు కొనసాగే అవకాశం ఉన్నందున ఆరోగ్యకరమైన జీవనశైలిని పాటించడం అవసరం.'
        : 'Yes. As ovarian reserve naturally declines with age, the total antral follicle count decreases and serum AMH drops. Consequently, many women in their late 30s and 40s notice more regular menstrual cycles and improved spontaneous ovulation. However, metabolic vulnerabilities—including insulin resistance, central adiposity, dyslipidemia, and cardiovascular risks—often persist or worsen post-menopause without proactive cardiometabolic care.'
    }
  ];

  const FAQ_CATEGORIES = [
    { id: 'all', label: isTelugu ? 'అన్ని ప్రశ్నలు' : 'All Questions', count: faqs.length },
    { id: 'diagnosis', label: isTelugu ? 'నిర్ధారణ & రోటర్‌డ్యామ్' : 'Diagnosis & Rotterdam', count: faqs.filter(f => f.category === 'diagnosis').length },
    { id: 'symptoms', label: isTelugu ? 'లక్షణాలు & హార్మోన్లు' : 'Symptoms & Hormones', count: faqs.filter(f => f.category === 'symptoms').length },
    { id: 'fertility', label: isTelugu ? 'సంతానోత్పత్తి & అండం' : 'Fertility & Ovulation', count: faqs.filter(f => f.category === 'fertility').length },
    { id: 'metabolism', label: isTelugu ? 'ఇన్సులిన్ & జీవక్రియ' : 'Insulin & Metabolism', count: faqs.filter(f => f.category === 'metabolism').length },
    { id: 'treatment', label: isTelugu ? 'చికిత్సలు & సంరక్షణ' : 'Treatments & Care', count: faqs.filter(f => f.category === 'treatment').length },
    { id: 'ml-testing', label: isTelugu ? 'పరీక్షలు & AI ఇంజిన్' : 'Testing & ML Engine', count: faqs.filter(f => f.category === 'ml-testing').length },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    const query = faqSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      faq.q.toLowerCase().includes(query) || 
      faq.a.toLowerCase().includes(query) || 
      faq.tag.toLowerCase().includes(query) ||
      faq.categoryLabel.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Experience Mode Selector Banner (Always visible & interactive) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 relative z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {isTelugu 
                ? 'మీ సౌలభ్యం కోసం సులభమైన వివరణ సిద్ధంగా ఉంది:' 
                : 'PCOSense Welcome Experience Mode:'}
            </span>
          </div>

          <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'simple'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="view-mode-simple-btn"
            >
              <Smile className="h-3.5 w-3.5" />
              <span>{isTelugu ? '🌟 సులభ గైడ్ (అందరికీ సులువు)' : '🌟 Easy & Friendly Mode (Simple)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('clinical')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'clinical'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              id="view-mode-clinical-btn"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>{isTelugu ? '🔬 మెడికల్ పరిశోధన & ML' : '🔬 Clinical & Research ML'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 0. SIMPLE & ACCESSIBLE WELCOME SECTION (Enabled by default) */}
      {viewMode === 'simple' && (
        <section className="py-8 sm:py-12 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SimpleWelcomeSection />

            {/* Quick Transition to In-Depth Clinical View */}
            <div className="mt-12 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  {isTelugu ? 'వైద్యులు లేదా పరిశోధకుల కోసమా?' : 'Are you a Doctor, Clinician, or Researcher?'}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {isTelugu
                    ? '541 క్లినికల్ కేసుల డేటా, రోటర్‌డ్యామ్ ఫినోటైప్‌లు మరియు ROC-AUC గ్రాఫ్‌లను వీక్షించడానికి క్లినికల్ మోడ్‌కు మారండి.'
                    : 'Switch to Clinical Mode to examine the 541-patient hospital cohort, ROC curves (95.09%), and Rotterdam diagnostic phenotypes.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('clinical')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0"
              >
                <span>{isTelugu ? 'క్లినికల్ పరిశోధన చూడండి →' : 'Switch to Clinical View →'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/70 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 dark:bg-teal-950/80 px-3.5 py-1.5 text-xs font-bold text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-800 shadow-2xs"
              >
                <Heart className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                <span>{isTelugu ? 'దయతో కూడిన వివరణ • సరళమైన & సురక్షితమైన సంరక్షణ' : 'Gentle & Clear Guidance • Empathetic PCOS Care'}</span>
              </motion.div>

              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.08]"
                >
                  {isTelugu ? (
                    <>మీ ఆరోగ్యం కోసం <span className="text-teal-700 dark:text-teal-400">సులభమైన PCOS</span> మార్గదర్శకత్వం & స్క్రీనింగ్.</>
                  ) : (
                    <>Gentle, Clear & Reassuring <span className="text-teal-700 dark:text-teal-400">PCOS Guidance</span> for Everyone.</>
                  )}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto lg:mx-0"
                >
                  {isTelugu
                    ? 'మీకు ఏ లక్షణాలు ఉన్నా కంగారు పడవలసిన అవసరం లేదు. సులభమైన మాటల్లో మీ ఆరోగ్యాన్ని తెలుసుకోండి, రోజూ తినాల్సిన ఆహారాలు మరియు శ్రద్ధగల డాక్టర్ సలహాలను పొందండి.'
                    : 'You do not have to navigate PCOS alone or feel overwhelmed by difficult medical words. Tell us your symptoms in plain language, receive a gentle risk estimate, and get personalized meal routines with kind doctor support.'}
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                {isTelugu
                  ? 'కఠినమైన వైద్య పరీక్షలు లేకుండా ఇంట్లోనే మీ లక్షణాలను సులభంగా పరీక్షించుకోండి. ప్రతి దశ మీ సౌలభ్యం కోసం వివరంగా వివరించబడింది.'
                  : 'Designed with caring empathy and clear step-by-step guidance. Validated with clinical research so you get dependable, reassuring insights without stress.'}
              </motion.p>

              {/* Call to Actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    to={isAuthenticated ? "/assessment" : "/register?redirect=/assessment"}
                    id="hero-start-assessment-btn"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-800 dark:bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-teal-700 dark:hover:bg-teal-500 hover:shadow-lg transition-all"
                  >
                    <Stethoscope className="h-4 w-4 text-teal-300 dark:text-teal-100" />
                    <span>{t('landing.startAssessment', 'Start Clinical Assessment')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>

                {isAuthenticated ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      to="/dashboard"
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Activity className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      <span>{t('landing.goToDashboard', 'Go to My Dashboard')}</span>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      to="/register"
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <UserCheck className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      <span>{t('landing.createAccount', 'Create Free Patient Account')}</span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Research Metrics Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-left max-w-lg mx-auto lg:mx-0"
              >
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">541</p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t('landing.statCohortLabel', 'Hospital Patient Cohort')}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400">86.11%</p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t('landing.statSensitivityLabel', 'Clinical Sensitivity (Recall)')}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">95.09%</p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t('landing.statRocLabel', 'ROC-AUC Discriminator')}</p>
                </div>
              </motion.div>

            </motion.div>

            {/* Right Interactive Quick Clinical Presets Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    <span className="text-sm font-bold text-slate-950 dark:text-white">{t('landing.presetsTitle', 'Pre-Validated Patient Presets')}</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    {t('landing.liveInferenceDemo', 'Live Inference Demo')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 my-3">
                  {t('landing.presetsSubtitle', 'Select a pre-configured patient case from the clinical notebook dataset to test real-time risk calculation and factor attribution:')}
                </p>

                <div className="space-y-3">
                  {PRESET_PROFILES.map((preset, idx) => (
                    <motion.button
                      key={preset.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.08 }}
                      whileHover={{ scale: 1.015, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectPreset(preset.id)}
                      id={`preset-btn-${preset.id}`}
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-600 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-300">
                          {isTelugu && preset.nameTe ? preset.nameTe : preset.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {isTelugu && preset.badgeTe ? preset.badgeTe : preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isTelugu && preset.descriptionTe ? preset.descriptionTe : preset.description}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                    {t('landing.standardScalerPipeline', 'StandardScaler Pipeline')}
                  </span>
                  <Link
                    to={isAuthenticated ? "/assessment" : "/register?redirect=/assessment"}
                    className="font-bold text-teal-800 dark:text-teal-400 hover:text-teal-950 dark:hover:text-teal-300 flex items-center gap-1"
                  >
                    <span>{t('landing.customPatientInput', 'Custom Patient Input')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS VISUAL TIMELINE & INTRO VIDEO SECTION */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Visual User Journey Timeline: Symptom Entry -> Risk Estimate -> Wellness Planning */}
          <HowItWorksTimeline variant="landing" />

          {/* Intro to PCOSense Video & Interactive Empathetic Guide */}
          <IntroPCOSenseVideo />
        </div>
      </section>

      {/* 1.5 KEY BENEFITS AS 4 SIMPLE ACTION STEPS (Empathetic & Non-Technical) */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-950 px-3.5 py-1 text-xs font-bold text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-800">
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? '4 సులువైన దశలు • సంపూర్ణ అవగాహన' : 'Your Journey in 4 Simple Steps • No Jargon'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              {isTelugu ? 'ఆరోగ్యం దిశగా 4 సాధారణ దశలు' : 'How PCOSense Helps You in 4 Clear Steps'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isTelugu
                ? 'ఎటువంటి కంగారు లేకుండా ఇంట్లోనే మీ ఆరోగ్యాన్ని పరీక్షించుకోండి, సరైన ఆహారం తెలుసుకోండి మరియు నిపుణుల సలహాలు పొందండి.'
                : 'Every key benefit—from risk screening to personalized food and kind specialist care—explained with clarity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    {isTelugu ? 'సులభ ప్రశ్నలు' : 'Step 1: Intake'}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Smile className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'లక్షణాలు చెప్పండి' : 'Step 1: Tell Us Your Symptoms'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isTelugu
                      ? 'మీ పీరియడ్స్ చక్రం, చర్మ మార్పులు మరియు రోజువారీ అలసట గురించి సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వండి.'
                      : 'Share everyday details about your menstrual cycle, skin changes, and body comfort in plain words.'}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <span>{isTelugu ? 'ఎటువంటి పరీక్షలు అవసరం లేదు' : 'No Lab Reports Required'}</span>
                <Check className="h-3 w-3" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    {isTelugu ? 'తక్షణ రిస్క్ స్కోర్' : 'Step 2: Risk Screening'}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'రిస్క్ అంచనా పొందండి' : 'Step 2: Get a Risk Estimate'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isTelugu
                      ? 'మీకు PCOS ఉండే అవకాశం ఎంత శాతం ఉందో సరళమైన రంగుల చార్ట్‌తో అర్థమయ్యేలా చూపిస్తుంది.'
                      : 'Receive a reassuring, clear percentage breakdown explaining which signs are contributing to your score.'}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <span>{isTelugu ? 'స్పష్టమైన రంగు చార్ట్' : 'Plain-Language Explanation'}</span>
                <Check className="h-3 w-3" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    {isTelugu ? 'డైట్ & యోగా' : 'Step 3: Personalized'}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Apple className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isTelugu ? 'వ్యక్తిగత సంరక్షణ' : 'Step 3: Personalized Wellness'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isTelugu
                      ? 'ఇంట్లో లభించే కూరగాయలతో 7 రోజుల డైట్ ప్లాన్ మరియు సులువైన యోగా వ్యాయామాలు చూడండి.'
                      : 'Follow gentle 7-day home recipes, relaxing yoga video routines, and daily habit tips tailored to you.'}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <span>{isTelugu ? 'సులభమైన ఇంటి వంటకాలు' : 'Home Food & Yoga Guide'}</span>
                <Check className="h-3 w-3" />
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => navigate('/doctors')}
              className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border-2 border-slate-200 dark:border-slate-700/80 hover:border-teal-500 dark:hover:border-teal-400 space-y-4 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              id="landing-step4-talk-doctor-btn"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    4
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    {isTelugu ? 'డాక్టర్ సంప్రదింపు' : 'Step 4: Care'}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-100/70 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center justify-between">
                    <span>{isTelugu ? 'డాక్టర్లతో మాట్లాడండి' : 'Step 4: Talk with Caring Doctors'}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {isTelugu
                      ? 'మహిళా నిపుణులైన గైనకాలజిస్టులతో నేరుగా చాట్ చేయండి లేదా వీడియో కాల్ ద్వారా మాట్లాడండి.'
                      : 'Connect directly with verified female health specialists for video consults and compassionate reassurance.'}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-teal-700 dark:text-teal-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>{isTelugu ? 'నమ్మకమైన వైద్యులు' : 'Verified Specialists'}</span>
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-300 underline font-extrabold">
                  {isTelugu ? 'మాట్లాడండి →' : 'Talk to Doctor →'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE SYMPTOM & RISK ESTIMATOR SANDBOX */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/70 dark:bg-teal-950/80 px-3 py-1 text-xs font-bold text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-800">
              <Zap className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>{isTelugu ? 'ఇంటరాక్టివ్ తక్షణ సిమ్యులేటర్' : 'Interactive Instant Simulator'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              {isTelugu ? 'క్లినికల్ లక్షణాలు PCOS సంభావ్యతను ఎలా మారుస్తాయో పరీక్షించండి' : 'Test How Clinical Symptoms Shift PCOS Probability'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isTelugu 
                ? 'క్లినికల్ బయోమార్కర్లను ఆన్/ఆఫ్ చేయండి మరియు మెషిన్ లెర్నింగ్ ఇంజిన్ రిస్క్ శాతాన్ని ఎలా గణిస్తుందో ప్రత్యక్షంగా చూడండి.'
                : 'Toggle clinical biomarkers and watch the calibrated machine learning engine dynamically compute the real-time estimated risk percentage and explanatory insights.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                <span>{isTelugu ? 'క్లినికల్ ఫీచర్లను మార్చండి' : 'Adjust Clinical Features'}</span>
              </h3>

              {/* Symptom Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSimCycleIrregular(!simCycleIrregular)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    simCycleIrregular ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{isTelugu ? 'క్రమం తప్పిన పీరియడ్స్' : 'Irregular Menstrual Cycle'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? '35+ రోజుల చక్రం లేదా తప్పిన పీరియడ్స్' : 'Cycles > 35 days or skipped periods'}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    simCycleIrregular ? 'bg-teal-700 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {simCycleIrregular ? '✓' : ''}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSimSkinDarkening(!simSkinDarkening)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    simSkinDarkening ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{isTelugu ? 'చర్మం నల్లబడటం (అకాంతోసిస్)' : 'Skin Darkening (Acanthosis)'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'మెడ లేదా చంకలలో నల్లటి మచ్చలు' : 'Dark velvety patches on neck/groin'}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    simSkinDarkening ? 'bg-teal-700 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {simSkinDarkening ? '✓' : ''}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSimHairGrowth(!simHairGrowth)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    simHairGrowth ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{isTelugu ? 'అధిక రోమాలు (హిర్సుటిజం)' : 'Excess Hair Growth (Hirsutism)'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'గడ్డం, పైపెదవి లేదా పొట్టపై' : 'Chin, upper lip, chest, or abdomen'}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    simHairGrowth ? 'bg-teal-700 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {simHairGrowth ? '✓' : ''}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSimWeightGain(!simWeightGain)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    simWeightGain ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{isTelugu ? 'వేగంగా బరువు పెరగడం' : 'Rapid Unexplained Weight Gain'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'ముఖ్యంగా పొట్ట చుట్టూ కొవ్వు చేరడం' : 'Particularly central/abdominal adiposity'}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    simWeightGain ? 'bg-teal-700 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {simWeightGain ? '✓' : ''}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSimPimples(!simPimples)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all sm:col-span-2 ${
                    simPimples ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{isTelugu ? 'తీవ్రమైన మొటిమలు / పింపుల్స్' : 'Persistent Adult Acne / Pimples'}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isTelugu ? 'దవడల వెంబడి మరియు వెనుక భాగంలో' : 'Deep cystic breakouts along jawline and back'}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    simPimples ? 'bg-teal-700 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {simPimples ? '✓' : ''}
                  </div>
                </motion.button>

              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      {isTelugu ? 'అల్ట్రాసౌండ్ ఫోలికల్ సంఖ్య (ఒక్కో అండాశయం)' : 'Ultrasound Follicle Count (Per Ovary)'}
                    </span>
                    <span className="text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                      {simFollicleCount} {isTelugu ? 'ఫోలికల్స్' : 'follicles'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="24"
                    step="1"
                    value={simFollicleCount}
                    onChange={(e) => setSimFollicleCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                    <span>2 ({isTelugu ? 'సాధారణం' : 'Normal low'})</span>
                    <span className="text-slate-600 dark:text-slate-400">{isTelugu ? 'పరిమితి: ≥12' : 'Threshold: ≥12'}</span>
                    <span>24 ({isTelugu ? 'తీవ్రమైన పాలిసిస్టిక్' : 'Severe Polycystic'})</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      {isTelugu ? 'బాడీ మాస్ ఇండెక్స్ (BMI)' : 'Body Mass Index (BMI)'}
                    </span>
                    <span className="text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                      {simBmi} kg/m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="40"
                    step="0.5"
                    value={simBmi}
                    onChange={(e) => setSimBmi(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                    <span>18.5 ({isTelugu ? 'సాధారణ' : 'Normal'})</span>
                    <span>25.0 ({isTelugu ? 'అధిక బరువు' : 'Overweight'})</span>
                    <span>30.0+ ({isTelugu ? 'ఊబకాయం' : 'Obese'})</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Live Simulation Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  {isTelugu ? 'రిస్క్ అంచనా ఫలితం' : 'Calibrated Risk Output'}
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  {isTelugu ? 'లైవ్ ఇన్ఫరెన్స్' : 'Inference Active'}
                </span>
              </div>

              <div className="text-center space-y-2 py-4">
                <div className="inline-block relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={simRiskScore}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.15, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-6xl font-black tracking-tight text-white"
                    >
                      {simRiskScore}%
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="pt-1">
                  <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide transition-colors ${
                    simRiskScore >= 65
                      ? 'bg-rose-500 text-white'
                      : simRiskScore >= 35
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {simRiskScore >= 65 
                      ? (isTelugu ? 'అధిక రిస్క్ విభాగం' : 'High Risk Stratification')
                      : simRiskScore >= 35 
                      ? (isTelugu ? 'మధ్యస్థ రిస్క్ విభాగం' : 'Moderate Risk Stratification')
                      : (isTelugu ? 'తక్కువ రిస్క్ బేస్‌లైన్' : 'Low Risk Baseline')}
                  </span>
                </div>
              </div>

              {/* Dynamic Factors Explanation */}
              <div className="space-y-3 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 text-xs">
                <p className="font-bold text-slate-200">{isTelugu ? 'ప్రధాన కారకాల విశ్లేషణ:' : 'Mathematical Factor Breakdown:'}</p>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <AnimatePresence>
                    {simFollicleCount >= 12 && (
                      <motion.li
                        key="sim-factor-follicles"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 text-teal-300"
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isTelugu 
                            ? `ఫోలికల్ సంఖ్య (${simFollicleCount}) రోటర్‌డ్యామ్ ప్రమాణం (≥12) కంటే ఎక్కువగా ఉంది.`
                            : `Follicle count (${simFollicleCount}) exceeds the ≥12 Rotterdam diagnostic threshold.`}
                        </span>
                      </motion.li>
                    )}
                    {simSkinDarkening && (
                      <motion.li
                        key="sim-factor-skin-darkening"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 text-teal-300"
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isTelugu 
                            ? 'చర్మం నల్లబడటం ఇన్సులిన్ రెసిస్టెన్స్ (+0.475) ప్రభావం వల్ల రిస్క్‌ను పెంచుతోంది.'
                            : 'Acanthosis Nigricans contributes heavily due to strong insulin resistance correlation (+0.475).'}
                        </span>
                      </motion.li>
                    )}
                    {simCycleIrregular && (
                      <motion.li
                        key="sim-factor-cycle-irregular"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 text-teal-300"
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isTelugu 
                            ? 'క్రమం తప్పిన పీరియడ్స్ అండం విడుదల కాకపోవడాన్ని (+0.402) సూచిస్తున్నాయి.'
                            : 'Cycle irregularity strongly indicates anovulatory disruption (+0.402).'}
                        </span>
                      </motion.li>
                    )}
                    {simHairGrowth && (
                      <motion.li
                        key="sim-factor-hair-growth"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 text-teal-300"
                      >
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {isTelugu 
                            ? 'అధిక రోమాలు ఆండ్రోజెన్ హార్మోన్ల పెరుగుదలను (+0.465) సూచిస్తున్నాయి.'
                            : 'Hirsutism indicates active androgenic elevation (+0.465).'}
                        </span>
                      </motion.li>
                    )}
                  </AnimatePresence>
                </ul>
              </div>

              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={isAuthenticated ? "/assessment" : "/register?redirect=/assessment"}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md hover:bg-teal-400 transition-all"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>{t('landing.startAssessment', 'Run Full Clinical Assessment')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>

            </div>

          </div>
        </div>
      </motion.section>

      {/* 3. EXPLORATORY DATA ANALYSIS (EDA) VISUALIZATION CENTER */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 px-3 py-1 text-xs font-bold text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
              <Database className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
              <span>Grounded in PCOS_Infertility.ipynb Dataset</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Clinical Exploratory Data Analysis & Visualizations
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Visualizing the statistical distributions, correlation strengths, and biomarker differences between PCOS (n=177) and Non-PCOS (n=364) cohorts in the 541-patient dataset.
            </p>
          </div>

          {/* Visualization Tabs Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {[
              { id: 'follicles', label: 'Follicle Morphology (r = +0.603)', icon: Layers },
              { id: 'correlation', label: 'Feature Correlation Ranking', icon: BarChart2 },
              { id: 'hormones', label: 'Hormonal Biomarkers (AMH & LH/FSH)', icon: Flame },
              { id: 'symptoms', label: 'Symptom Prevalence Comparison', icon: PieIcon },
              { id: 'benchmarks', label: 'Model Benchmark Comparison', icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeEdaTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveEdaTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-800 dark:bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Tab 1: Follicle Count Distribution */}
          {activeEdaTab === 'follicles' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    <span>Follicle Count Distribution (Pelvic Ultrasound)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Patients with PCOS exhibit significantly higher follicle counts (typically 12-18+) compared to healthy controls (4-8 follicles).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">Non-PCOS (n=364)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-teal-600 dark:bg-teal-400" />
                    <span className="text-teal-800 dark:text-teal-300">PCOS Cohort (n=177)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FOLLICLE_DISTRIBUTION_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} label={{ value: 'Patient Count', angle: -90, position: 'insideLeft', fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                              <p className="font-bold border-b border-slate-800 dark:border-slate-700 pb-1">{label}</p>
                              <p className="text-teal-300 font-semibold">PCOS: {payload[1]?.value} patients</p>
                              <p className="text-slate-300">Non-PCOS: {payload[0]?.value} patients</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="NonPCOS" name="Non-PCOS Patients" fill={isDark ? '#64748b' : '#94a3b8'} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="PCOS" name="PCOS Positive Patients" fill={isDark ? '#14b8a6' : '#0d9488'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-200 flex items-start gap-3">
                <Info className="h-5 w-5 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Insight from Notebook:</strong> Right and Left Follicle counts show the strongest individual Pearson correlations with PCOS diagnosis (<strong className="text-teal-900 dark:text-teal-100">+0.603</strong> and <strong className="text-teal-900 dark:text-teal-100">+0.598</strong>), directly aligning with the Rotterdam criteria threshold of ≥12 follicles per ovary.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Feature Correlation Ranking */}
          {activeEdaTab === 'correlation' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    <span>Top 10 Biomarker Pearson Correlations (Target: PCOS (Y/N))</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Extracted from the 41-feature correlation matrix in the clinical notebook.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                  Sorted by Absolute Pearson r
                </span>
              </div>

              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CORRELATION_RANKING_DATA}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} horizontal={false} />
                    <XAxis type="number" domain={[0, 0.7]} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: isDark ? '#e2e8f0' : '#1e293b' }} width={150} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                              <p className="font-bold">{data.feature}</p>
                              <p>Category: <span className="text-slate-300">{data.category}</span></p>
                              <p>Pearson r: <strong className="text-teal-300">+{data.correlation}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="correlation" name="Correlation (r)" radius={[0, 6, 6, 0]}>
                      {CORRELATION_RANKING_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block">Ultrasound Follicles</span>
                  <span className="text-teal-700 dark:text-teal-400 text-[11px]">r = +0.603 (Highest)</span>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Hyperandrogenism</span>
                  <span className="text-indigo-700 dark:text-indigo-400 text-[11px]">r = +0.475 (Skin / Hair)</span>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-xl border border-pink-200 dark:border-pink-800">
                  <span className="font-bold text-pink-900 dark:text-pink-200 block">Cycle Irregularity</span>
                  <span className="text-pink-700 dark:text-pink-400 text-[11px]">r = +0.402 (Ovulatory)</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Metabolic Factors</span>
                  <span className="text-amber-700 dark:text-amber-400 text-[11px]">r = +0.441 (Weight/Diet)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Hormonal & Biochemical Biomarkers */}
          {activeEdaTab === 'hormones' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    <span>Endocrine & Hormonal Biomarker Levels</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Comparison of mean serum hormone concentrations between healthy controls and PCOS patients.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">Non-PCOS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-teal-600 dark:bg-teal-400" />
                    <span className="text-teal-800 dark:text-teal-300">PCOS Cohort</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={HORMONAL_COMPARISON_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="marker" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                              <p className="font-bold border-b border-slate-800 dark:border-slate-700 pb-1">{label}</p>
                              <p className="text-teal-300 font-semibold">PCOS: {item.PCOS} {item.unit}</p>
                              <p className="text-slate-300">Non-PCOS: {item.NonPCOS} {item.unit}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="NonPCOS" name="Non-PCOS Average" fill={isDark ? '#64748b' : '#94a3b8'} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="PCOS" name="PCOS Cohort Average" fill={isDark ? '#14b8a6' : '#0d9488'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Anti-Müllerian Hormone (AMH)</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Elevated in PCOS (average <strong>6.9 ng/mL</strong> vs <strong>2.8 ng/mL</strong>) due to the large pool of pre-antral and small antral follicles.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">LH to FSH Inversion</span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Luteinizing Hormone hypersecretion results in an LH:FSH ratio &gt; <strong>2.0</strong> in over 60% of PCOS cases in the training dataset.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Symptom Prevalence Comparison */}
          {activeEdaTab === 'symptoms' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    <span>Clinical Symptom Prevalence (%) in Dataset</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Percentage of patients reporting each clinical indicator across the 541-patient dataset.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">Non-PCOS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-teal-600 dark:bg-teal-400" />
                    <span className="text-teal-800 dark:text-teal-300">PCOS Positive</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SYMPTOM_PREVALENCE_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#475569' }} />
                    <YAxis dataKey="symptom" type="category" tick={{ fontSize: 10, fill: isDark ? '#e2e8f0' : '#1e293b' }} width={160} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                              <p className="font-bold">{d.symptom}</p>
                              <p className="text-teal-300 font-semibold">PCOS Prevalence: {d.PCOS}%</p>
                              <p className="text-slate-300">Non-PCOS: {d.NonPCOS}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="NonPCOS" name="Non-PCOS (%)" fill={isDark ? '#64748b' : '#94a3b8'} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="PCOS" name="PCOS Cohort (%)" fill={isDark ? '#14b8a6' : '#0d9488'} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 5: Model Benchmarks */}
          {activeEdaTab === 'benchmarks' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                  <span>Cross-Validated Machine Learning Model Benchmarks</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparison of 5 classifier algorithms evaluated during pipeline training in the Jupyter notebook.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4">Algorithm</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Sensitivity (Recall)</th>
                      <th className="py-3 px-4">Specificity</th>
                      <th className="py-3 px-4">ROC-AUC</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MODEL_BENCHMARKS_DATA.map(m => (
                      <tr key={m.model} className={m.highlight ? 'bg-teal-50/70 dark:bg-teal-950/40 font-semibold' : ''}>
                        <td className="py-3.5 px-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {m.highlight && <Check className="h-4 w-4 text-teal-700 dark:text-teal-400" />}
                          <span>{m.model}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">{m.accuracy}%</td>
                        <td className="py-3.5 px-4 text-teal-800 dark:text-teal-300 font-bold">{m.sensitivity}%</td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">{m.specificity}%</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-950 dark:text-white">{m.roc}%</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.highlight ? 'bg-teal-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {m.highlight ? 'Production Engine' : 'Evaluated'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </motion.section>

      {/* 4. INTERACTIVE PATHOPHYSIOLOGY CASCADE & HORMONAL FEEDBACK LOOPS */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Endocrine & Cellular Biology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Pathophysiology of Polycystic Ovary Syndrome
            </h2>
            <p className="text-sm text-slate-300">
              Explore the 5 interconnected endocrine, metabolic, and ovarian stages driving clinical symptoms.
            </p>
          </div>

          {/* Interactive Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-800 pb-4">
            {PATHOPHYSIOLOGY_STEPS.map((s) => {
              const isActive = activePathoStep === s.step;
              return (
                <motion.button
                  key={s.step}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePathoStep(s.step)}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg'
                      : 'bg-slate-800/60 dark:bg-slate-900/60 border-slate-700/60 dark:border-slate-800 text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-teal-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {s.step}
                    </span>
                    <span className="text-xs font-bold truncate">Stage {s.step}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300 mt-1 line-clamp-1">
                    {s.title}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Active Step Detailed Explanation */}
          <AnimatePresence mode="wait">
            {(() => {
              const currentStep = PATHOPHYSIOLOGY_STEPS.find(s => s.step === activePathoStep) || PATHOPHYSIOLOGY_STEPS[0];
              return (
                <motion.div
                  key={currentStep.step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-800/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-700 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-8 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                      <Dna className="h-3.5 w-3.5" />
                      <span>Primary Origin: {currentStep.origin}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Stage {currentStep.step}: {currentStep.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {currentStep.mechanism}
                    </p>
                  </div>

                  <div className="lg:col-span-4 bg-slate-900/90 dark:bg-slate-950/90 rounded-2xl p-5 border border-slate-700/80 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                      Diagnostic Key Biomarkers:
                    </span>
                    <div className="space-y-2">
                      {currentStep.keyMarkers.map((marker, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800/80 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 dark:border-slate-800">
                          <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                          <span>{marker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </div>
      </motion.section>

      {/* 5. ROTTERDAM 4 PHENOTYPES DEEP-DIVE MATRIX */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Rotterdam 2003 & 2023 Classification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              The 4 Clinical Phenotypes of PCOS
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              PCOS is not a homogenous condition. Depending on which combination of the 3 Rotterdam criteria are met, patients present across 4 distinct clinical phenotypes with varying metabolic risks.
            </p>
          </div>

          {/* Phenotype Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PHENOTYPES_DATA.map((p) => {
              const isSelected = selectedPhenotype === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPhenotype(p.id)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-teal-600 shadow-md ring-2 ring-teal-600/30'
                      : 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Phenotype {p.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                      Type {p.id}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">
                    {p.name.split(':')[1]}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Phenotype Content Card */}
          <AnimatePresence mode="wait">
            {(() => {
              const currentP = PHENOTYPES_DATA.find(p => p.id === selectedPhenotype) || PHENOTYPES_DATA[0];
              return (
                <motion.div
                  key={currentP.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                        {currentP.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mt-0.5">
                        {currentP.tag}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Criteria Met */}
                    <div className="lg:col-span-5 space-y-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        Required Diagnostic Criteria:
                      </span>
                      <div className="space-y-2">
                        {currentP.criteria.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Description & Care Plan */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Clinical Presentation:</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {currentP.description}
                        </p>
                      </div>

                      <div className="p-4 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-1.5">
                        <span className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                          <Stethoscope className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                          Evidence-Based Clinical Management Focus:
                        </span>
                        <p className="text-xs text-teal-900 dark:text-teal-300 leading-relaxed">
                          {currentP.carePlan}
                        </p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </div>
      </motion.section>

      {/* 6. COMPREHENSIVE BIOMARKER & LAB VALUES REFERENCE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Laboratory Diagnostics Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Key Biomarkers, Reference Ranges & Clinical Significance
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Understand standard clinical lab values used by gynecologists and reproductive endocrinologists to evaluate PCOS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-5">Biomarker / Assay</th>
                  <th className="py-4 px-5">Healthy Control Range</th>
                  <th className="py-4 px-5">Typical PCOS Presentation</th>
                  <th className="py-4 px-5">Diagnostic Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {BIOMARKER_GUIDE.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-950 dark:text-white">
                      <div>{b.name}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{b.unit}</span>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-300">{b.normalRange}</td>
                    <td className="py-4 px-5 font-bold text-teal-800 dark:text-teal-300 bg-teal-50/40 dark:bg-teal-950/30">{b.pcosRange}</td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">{b.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </motion.section>

      {/* 7. MACHINE LEARNING PIPELINE MATHEMATICAL ARCHITECTURE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Explainable AI System Design
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              5-Step Transparent Inference Pipeline
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              How PCOSense converts 41 clinical indicators into calibrated risk scores and instance-level factor attributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {[
              {
                step: '01',
                title: 'Feature Ingestion & Imputation',
                desc: 'Accepts continuous and categorical features. Missing laboratory values are imputed via median imputation trained on the 541 hospital records.'
              },
              {
                step: '02',
                title: 'StandardScaler Normalization',
                desc: 'Z-score transformation maps each raw feature into normalized space using training set parameters: z = (x - μ) / σ.'
              },
              {
                step: '03',
                title: 'L2 Regularized Log-Odds',
                desc: 'Computes linear logit combination z = β₀ + Σ(βᵢ · xᵢ) and applies sigmoid activation 1/(1 + e⁻ᶻ).'
              },
              {
                step: '04',
                title: 'Local Factor Attribution',
                desc: 'Evaluates each feature\'s contribution to positive/negative log-odds shift, computing relative percentage contribution for clinical explainability.'
              },
              {
                step: '05',
                title: 'Risk Stratification & Summary',
                desc: 'Stratifies output into Low (<35%), Moderate (35–65%), or High (>65%) risk tiers, mapped to actionable clinician consultation advice.'
              }
            ].map((p, idx) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 transition-shadow hover:shadow-md"
              >
                <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-black text-xs flex items-center justify-center">
                  {p.step}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </motion.section>

      {/* 8. END-TO-END BUSINESS & CLINICAL REGULATORY WORKFLOW ARCHITECTURE */}
      <motion.section
        id="business-workflow-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3.5 py-1 text-xs font-bold text-teal-300">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>{isTelugu ? 'భారత ప్రభుత్వ నిబంధనల వ్యాపార & క్లినికల్ వర్క్‌ఫ్లో' : 'Statutory Indian Healthcare Business & Clinical Architecture'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {isTelugu ? 'ఎండ్-టు-ఎండ్ వ్యాపార & క్లినికల్ వర్క్‌ఫ్లో' : 'End-to-End Business & Clinical Operating Workflow'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {isTelugu 
                ? 'DPDP చట్టం 2023, టెలిమెడిసిన్ మార్గదర్శకాలు 2020 మరియు భారత EHR ప్రమాణాలు 2016 క్రింద PCOSense ఎలా నడుస్తుందో తెలుసుకోండి.' 
                : 'Understand how PCOSense operates as a regulated Digital Health & Telemedicine platform spanning patient screening, verified RMP consultations, fee distribution, and statutory data principal protection.'}
            </p>
          </div>

          {/* Perspective Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 max-w-4xl mx-auto">
            {[
              { id: 'patient', label: isTelugu ? '1. రోగి ప్రయాణం (Patient)' : '1. Patient Clinical Journey', icon: UserCheck },
              { id: 'doctor', label: isTelugu ? '2. వైద్యుల విధివిధానాలు (Doctor)' : '2. Doctor / RMP Clinical Flow', icon: Stethoscope },
              { id: 'business', label: isTelugu ? '3. వ్యాపార & ఆదాయ మోడల్ (Revenue)' : '3. Revenue & Fee Distribution', icon: CreditCard },
              { id: 'compliance', label: isTelugu ? '4. చట్టబద్ధమైన నిబంధనలు (Legal)' : '4. Statutory Compliance Guardrails', icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedWorkflowTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedWorkflowTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Patient Clinical Journey */}
          {selectedWorkflowTab === 'patient' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">01</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">DPDP Consent</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Granular Statutory Notice & Consent</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under DPDP Act 2023 Sec 6(1), the patient reviews explicit purpose notices in English & regional language (Telugu) and provides granular opt-in for ML screening, nutritional triage, and clinical records.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Optional 14-digit ABHA ID integration</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">02</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">AI Screening</span>
                  </div>
                  <h3 className="text-base font-bold text-white">5-Step Explainable ML Screening</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Inputs 41 physical, metabolic, and ultrasonography markers to receive instant calibrated risk probability (Low/Moderate/High) with Rotterdam Phenotype grouping and mathematical local factor attribution.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <Brain className="h-3.5 w-3.5 text-teal-400" />
                    <span>Instance-level explainable factor contribution</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">03</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Diet & Lifestyle</span>
                  </div>
                  <h3 className="text-base font-bold text-white">7-Day Personalized Anti-Inflammatory Plan</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generates low-glycemic, anti-inflammatory meal schedules with nutrient gap alerts (Inositol, Vitamin D3, Omega-3), hydration pacing reminders, and local organic market locator.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <HeartPulse className="h-3.5 w-3.5 text-pink-400" />
                    <span>Evidence-based lifestyle first-line therapy</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">04</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Telemedicine</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Verified RMP Teleconsultation Booking</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Patient selects registered gynecologist or endocrinologist with verified State Medical Council credentials. Books appointment with mandatory Telemedicine 2020 consent and ABHA identification.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                    <span>₹800 – ₹1,500 held in secure platform escrow</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">05</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Prescription</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Standardized NMC E-Prescription Delivery</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Following secure video/audio consult, doctor issues standardized Appendix 2 bilingual prescription with generic medication names, lifestyle recommendations, and digital verification seal.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <FileText className="h-3.5 w-3.5 text-teal-400" />
                    <span>Schedule X narcotic prohibition verified</span>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">06</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Data Rights</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Data Portability, Erasure & Redressal</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Patient exercises statutory rights under DPDP Act 2023: one-click Health Dossier export (JSON), right to be forgotten (Sec 12), and direct ticketing to Grievance Redressal Officer (30-day statutory SLA).
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Complete control over personal health data</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Doctor / RMP Clinical Flow */}
          {selectedWorkflowTab === 'doctor' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">01</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Onboarding</span>
                  </div>
                  <h3 className="text-base font-bold text-white">RMP Credential Verification</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Doctor provides State Medical Council registration number (e.g. Telangana / Karnataka Medical Council), qualifying MBBS/MD degree, registration year, and digital signature credentials.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Mandatory NMC verification ID generation</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">02</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Clinical Triage</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Patient Clinical Dossier Review</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Doctor accesses patient intake history, Rotterdam phenotype classification, lab biomarker ratios (LH/FSH, AMH), and logged symptoms prior to initiating teleconsultation.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    <span>EHR Standards India 2016 formatted summary</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">03</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Consultation</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Real-Time Teleconsultation</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Doctor conducts HIPAA & CERT-In encrypted teleconsultation (video/voice/text). Determines consultation type (First Consult vs Follow-up) as mandated by MoHFW Telemedicine 2020 rules.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                    <span>Red flag emergency protocols & physical exam referral</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">04</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Drug Legality</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Schedule X & Narcotics Check</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Platform automatically validates prescribed medicines against Schedule X, NDPS, and List O/A/B categories. Blocks prohibited tele-prescriptions (e.g. Ketamine, Morphine, Pentazocine).
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Real-time safety blocker prevents illegal tele-Rx</span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">05</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Rx Issuance</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Appendix 2 Standardized E-Prescription</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Doctor issues standardized NMC prescription including doctor registration, provisional ICD-10 diagnosis, generic drug formulation, dosage frequency, dietary lifestyle guidance, and digital stamp.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Valid at licensed Indian pharmacies</span>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold text-xs flex items-center justify-center">06</span>
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Settlement</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Clinical Audit & Automated Payout</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every consultation automatically commits a 180-day tamper-evident audit record to compliance ledger. Escrow unlocks, depositing 80% net consultation fee directly to doctor's bank account.
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/60">
                    <Receipt className="h-3.5 w-3.5 text-teal-400" />
                    <span>Automated GST TDS reporting & settlement slip</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: Revenue & Fee Distribution */}
          {selectedWorkflowTab === 'business' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Card 1 */}
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-teal-500/40 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    80%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Doctor Professional Payout</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      80% of every teleconsultation fee is paid directly to the attending Registered Medical Practitioner (RMP) upon verified completion of consultation and e-prescription delivery.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-bold text-white">₹1,000</span>
                    </div>
                    <div className="flex justify-between text-teal-400 font-bold">
                      <span>Doctor Net Earnings:</span>
                      <span>₹800 (80%)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Settled to RMP verified bank account via automated IMPS/NEFT.
                    </div>
                  </div>
                </div>

                {/* Revenue Card 2 */}
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-indigo-500/40 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    20%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Platform Technology & Governance</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      20% platform commission funds continuous regulatory compliance, CERT-In audit logging, video streaming infrastructure, ML engine hosting, and statutory Grievance Redressal (GRO) operations.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform Share:</span>
                      <span className="font-bold text-indigo-300">₹200 (20%)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18% on tech fee):</span>
                      <span>₹36</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Covers 180-day secure audit vault and DPDP data principal services.
                    </div>
                  </div>
                </div>

                {/* Revenue Card 3 */}
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    ₹0
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Free Public Tier (Health Equity)</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Core explainable PCOS screening, educational clinical modules, Rotterdam criteria breakdown, and anti-inflammatory nutrition education remain 100% free and confidential for all patients.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Clinical Assessment:</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Nutrient Gap Analysis:</span>
                      <span>FREE</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Empowering Indian women with accessible evidence-based health guidance.
                    </div>
                  </div>
                </div>

              </div>

              {/* Invoicing & Regulatory Safeguards Bar */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Statutory GST & Telemedicine Invoicing Compliance</span>
                    <span className="text-slate-400">Invoices issued under SAC Code 999312 (Human health & telemedicine services) under Section 31 of CGST Act.</span>
                  </div>
                </div>
                <Link
                  to="/compliance"
                  className="shrink-0 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors whitespace-nowrap"
                >
                  View Regulatory Audit Hub
                </Link>
              </div>

            </div>
          )}

          {/* Tab 4: Statutory Compliance Guardrails */}
          {selectedWorkflowTab === 'compliance' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Guardrail 1 */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">DPDP Act (2023)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Notice, Consent & Erasure</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Explicit Section 6 notice before collection</li>
                    <li>Sec 6(4) instant consent withdrawal</li>
                    <li>Sec 11 Data Portability dossier export</li>
                    <li>Sec 12 Right to Erasure / Purging</li>
                  </ul>
                </div>

                {/* Guardrail 2 */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-teal-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Stethoscope className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Telemedicine 2020</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">NMC Clinical Guidelines</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>RMP state council registration verify</li>
                    <li>Appendix 2 standardized e-prescription</li>
                    <li>Schedule X drug blocker (Narcotics banned)</li>
                    <li>Mandatory First vs Follow-up triage</li>
                  </ul>
                </div>

                {/* Guardrail 3 */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">EHR India (2016)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">ABDM / ABHA Architecture</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>14-digit Ayushman Bharat Health Account</li>
                    <li>Structured ISO/TS 13606 data schemas</li>
                    <li>Secure patient consent artifacts</li>
                    <li>Cross-provider interoperable records</li>
                  </ul>
                </div>

                {/* Guardrail 4 */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Cpu className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">CERT-In Security</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Immutable Audit Vault</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>180-day tamper-evident audit trail</li>
                    <li>All sensitive actions signed & logged</li>
                    <li>256-bit AES cryptographic encryption</li>
                    <li>Statutory GRO SLA within 30 days</li>
                  </ul>
                </div>

              </div>

              {/* Direct interactive preview link */}
              <div className="p-6 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-teal-400" />
                    <span>Explore the Live Compliance & Data Protection Hub</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Test the live DPDP consent manager, download your patient health export, generate sample NMC Appendix 2 prescriptions, or inspect the clinical audit trail.
                  </p>
                </div>
                <Link
                  to="/compliance"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition-colors shadow-sm whitespace-nowrap"
                >
                  <span>Open Compliance Console</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </motion.section>

      {/* 9. CLINICAL FAQS & PATIENT GUIDANCE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Evidence-Based Answers • 20 Core Topics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Frequently Asked Clinical Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Straightforward, physician-aligned answers to essential questions regarding international diagnostic criteria, hormone imbalances, fertility, nutrition, and machine learning transparency.
            </p>
          </div>

          {/* Search and Category Filter Controls */}
          <div className="space-y-4 pt-2">
            {/* Search Input Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. AMH, fertility, insulin resistance, metformin, ultrasound, weight)..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-2xs"
              />
              {faqSearchQuery && (
                <button
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FAQ_CATEGORIES.map((cat) => {
                const isActive = faqCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setFaqCategory(cat.id);
                      setOpenFaqIndex(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                      isActive
                        ? 'bg-teal-900 dark:bg-teal-600 text-white border-teal-900 dark:border-teal-600 shadow-2xs'
                        : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-teal-700 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3 pt-1">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No questions found matching "{faqSearchQuery}"</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for keywords like "hormones", "pregnancy", "diet", or reset your category filter.</p>
                <button
                  onClick={() => {
                    setFaqSearchQuery('');
                    setFaqCategory('all');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 underline pt-1"
                >
                  Reset filters & view all {faqs.length} questions
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqIndex === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : faq.id)}
                      className="w-full flex items-start justify-between p-5 text-left font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors gap-3 cursor-pointer"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800">
                            {faq.tag}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {faq.categoryLabel}
                          </span>
                        </div>
                        <span className="block pt-1 text-slate-950 dark:text-white font-bold leading-snug">
                          {faq.q}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-teal-700 dark:text-teal-400' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`faq-accordion-body-${faq.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <p>{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Prompt to AI Assistant for Custom Clinical Queries */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-teal-200 dark:text-teal-100" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-100">Have a specific or personalized medical question?</h4>
                <p className="text-[11px] sm:text-xs text-teal-800/90 dark:text-teal-300">
                  Ask our Gemini-grounded AI Clinical Assistant for instant evidence summaries, lab explanations, or tailored advice.
                </p>
              </div>
            </div>
            <Link
              to="/assistant"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 dark:hover:bg-teal-500 transition-all shadow-xs"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

        </div>
      </motion.section>

      {/* 8.5 SUBSCRIPTION TIERS COMPARISON */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-t border-b border-slate-200 dark:border-slate-800" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SubscriptionTiersComparison mode="landing" />
        </div>
      </section>

      {/* 9. CALLOUT ACTION BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 bg-slate-50 dark:bg-slate-950"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-950 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-teal-700/50">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-400/30">
                <Award className="h-3.5 w-3.5" /> Confidential & Free Tool
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Ready to screen your PCOS risk profile?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Complete the 5-step confidential clinical intake in less than 3 minutes to receive your calibrated probability, personalized lifestyle roadmap, and printable doctor report.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={isAuthenticated ? "/assessment" : "/register?redirect=/assessment"}
                  id="cta-launch-assessment-bottom"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-7 py-4 text-sm font-extrabold text-teal-950 shadow-md hover:bg-teal-300 transition-all whitespace-nowrap"
                >
                  <span>Start Clinical Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FOOTER (Welcome / Landing Page only) */}
      <Footer />

    </div>
  );
};
