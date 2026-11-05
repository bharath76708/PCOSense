import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Apple,
  Dumbbell,
  Moon,
  HeartPulse,
  Flame,
  ArrowRight,
  ChevronRight,
  Info,
  Layers,
  Filter,
  RefreshCw,
  Compass,
  MessageSquare,
  Coffee,
  Check,
  Zap,
  TrendingDown,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';

export interface LifestyleTip {
  id: string;
  title: string;
  category: 'nutrition' | 'movement' | 'sleep' | 'hormones' | 'stress';
  riskTier: 'low' | 'moderate' | 'elevated' | 'all';
  summary: string;
  actionStep: string;
  scientificWhy: string;
  effort: 'Quick (2-5 min)' | 'Easy (10-15 min)' | 'Moderate (20-30 min)';
  impact: 'High Impact' | 'Foundational' | 'Targeted';
  geminiPrompt: string;
}

const LIFESTYLE_TIPS_DATABASE: LifestyleTip[] = [
  // ELEVATED & MODERATE RISK TIPS (Insulin, Androgens, Glycemic)
  {
    id: 'tip-protein-fiber-first',
    title: 'Eat Veggies & Protein Before Starches',
    category: 'nutrition',
    riskTier: 'elevated',
    summary: 'Sequencing your meal by eating fiber and protein before carbohydrates significantly flattens post-meal glucose and insulin spikes.',
    actionStep: 'At your next meal, eat your salad, broccoli, or protein portion first. Leave rice, bread, or pasta for the final 5 minutes.',
    scientificWhy: 'Soluble fiber forms a viscous mesh in the small intestine, slowing gastric emptying and glucose absorption. This lowers peak insulin demand by up to 35-40%, mitigating hyperinsulinemia-driven ovarian androgen synthesis.',
    effort: 'Quick (2-5 min)',
    impact: 'High Impact',
    geminiPrompt: 'Explain the physiological science of food sequencing (fiber/protein before carbohydrates) for PCOS and insulin resistance, and give me 3 practical lunch examples.'
  },
  {
    id: 'tip-post-meal-stroll',
    title: '10-Minute Post-Meal Walking',
    category: 'movement',
    riskTier: 'elevated',
    summary: 'A brief, low-intensity 10-minute walk within 30 minutes after lunch or dinner pulls glucose into muscle cells without demanding excess insulin.',
    actionStep: 'Set a timer after finishing your main meal today to take a leisurely 10-minute stroll around your block or home.',
    scientificWhy: 'Skeletal muscle contraction activates non-insulin dependent GLUT4 glucose transporter translocation, directly disposing of blood glucose and reducing pancreatic beta-cell strain.',
    effort: 'Easy (10-15 min)',
    impact: 'High Impact',
    geminiPrompt: 'How does light post-meal walking activate non-insulin dependent GLUT4 transporters in women with PCOS, and what are alternative low-impact indoor routines?'
  },
  {
    id: 'tip-spearmint-infusion',
    title: 'Two Cups of Organic Spearmint Tea',
    category: 'hormones',
    riskTier: 'elevated',
    summary: 'Spearmint (Mentha spicata) has clinical randomized-trial evidence demonstrating mild anti-androgenic properties.',
    actionStep: 'Brew a warm mug of pure spearmint tea in the afternoon or evening as a calming coffee alternative.',
    scientificWhy: 'Clinical trials in women with PCOS have shown spearmint tea can significantly lower free and total testosterone levels while slightly elevating LH and FSH, helping manage mild hirsutism and acne.',
    effort: 'Quick (2-5 min)',
    impact: 'Targeted',
    geminiPrompt: 'What is the clinical evidence behind spearmint tea for reducing free testosterone in PCOS? How long does it typically take to observe effects?'
  },
  {
    id: 'tip-strength-over-cardio',
    title: 'Prioritize Resistance / Strength Training',
    category: 'movement',
    riskTier: 'elevated',
    summary: 'Building lean muscle mass improves total body metabolic rate and long-term insulin sensitivity far more effectively than prolonged high-intensity cardio.',
    actionStep: 'Complete 2 to 3 sessions of bodyweight or dumbbell strength exercises (squats, glute bridges, push-ups) this week for 20 minutes.',
    scientificWhy: 'Muscle tissue is the primary site of glucose clearance (~80%). Unlike prolonged exhaustive HIIT or chronic cardio which can elevate cortisol and aggravate adrenal androgen output, progressive resistance training stimulates insulin sensitivity with minimal adrenal stress.',
    effort: 'Moderate (20-30 min)',
    impact: 'High Impact',
    geminiPrompt: 'Create a beginner-friendly 3-day weekly strength training program designed specifically for PCOS and insulin sensitivity that avoids cortisol spikes.'
  },
  {
    id: 'tip-vinegar-or-lemon-water',
    title: '1 Tbsp Apple Cider Vinegar or Lemon Water Before High-Carb Meals',
    category: 'nutrition',
    riskTier: 'moderate',
    summary: 'Diluted organic apple cider vinegar or lemon water in 1 glass of water before meals slows carbohydrate breakdown.',
    actionStep: 'Mix 1 tablespoon of apple cider vinegar in 250ml of water and drink with a straw 10 minutes before a starchy meal.',
    scientificWhy: 'Acetic acid temporarily inhibits salivary and pancreatic alpha-amylase enzymes and enhances muscular glucose uptake, reducing postprandial glucose curves.',
    effort: 'Quick (2-5 min)',
    impact: 'Targeted',
    geminiPrompt: 'What is the biological mechanism of acetic acid / apple cider vinegar on glycemic control in insulin resistance, and what are the best practices for dental safety?'
  },
  {
    id: 'tip-circadian-darkness',
    title: '7-9 Hours Sleep with Dark Bedroom Environment',
    category: 'sleep',
    riskTier: 'moderate',
    summary: 'Quality deep sleep regulates leptin, ghrelin, and overnight insulin sensitivity, directly impacting daytime cravings and LH pulsatility.',
    actionStep: 'Keep your bedroom cool (65-68°F / 18-20°C), turn off blue-light screens 45 minutes before sleep, and aim for consistent bedtime.',
    scientificWhy: 'Even one night of partial sleep deprivation can reduce whole-body insulin sensitivity by 20-25% and elevate morning fasting cortisol, worsening androgenic symptoms.',
    effort: 'Easy (10-15 min)',
    impact: 'Foundational',
    geminiPrompt: 'How does circadian misalignment and sleep deprivation exacerbate insulin resistance and hormonal dysregulation in PCOS? What is an ideal bedtime routine?'
  },
  {
    id: 'tip-omega3-seeds',
    title: 'Add Flaxseed or Chia for Lignan & Omega-3 Support',
    category: 'nutrition',
    riskTier: 'moderate',
    summary: 'Ground flaxseeds contain dietary lignans and ALA omega-3 fatty acids that support sex hormone binding globulin (SHBG).',
    actionStep: 'Stir 1-2 tablespoons of freshly ground flaxseed into morning yogurt, oatmeal, or a green smoothie.',
    scientificWhy: 'Lignans act as phytoestrogens and stimulate liver production of SHBG. Higher SHBG binds more circulating free testosterone, reducing active androgenic symptoms.',
    effort: 'Quick (2-5 min)',
    impact: 'Targeted',
    geminiPrompt: 'How do dietary flaxseeds and lignans increase SHBG to bind excess free testosterone in PCOS? Provide 3 easy ways to incorporate them daily.'
  },
  {
    id: 'tip-magnesium-evening',
    title: 'Magnesium-Rich Whole Foods in the Evening',
    category: 'nutrition',
    riskTier: 'moderate',
    summary: 'Magnesium is a critical enzymatic cofactor in cellular insulin receptor phosphorylation and neuromuscular relaxation.',
    actionStep: 'Include a handful of pumpkin seeds, a serving of dark leafy spinach, or 1 square of 85%+ dark chocolate with your dinner.',
    scientificWhy: 'Women with PCOS and insulin resistance frequently exhibit lower intracellular magnesium levels. Magnesium supports both insulin receptor tyrosine kinase activity and GABAergic relaxation for deep sleep.',
    effort: 'Quick (2-5 min)',
    impact: 'Foundational',
    geminiPrompt: 'Why are women with PCOS often deficient in magnesium? What are the top dietary sources of bioavailable magnesium for metabolic health?'
  },

  // LOW / PREVENTATIVE RISK TIPS
  {
    id: 'tip-cycle-tracking',
    title: 'Track Cycle Day 1 & Ovulation Cues',
    category: 'hormones',
    riskTier: 'low',
    summary: 'Maintaining an accurate calendar of menstrual cycle length (standard 21-35 days) provides early detection for any subtle ovulatory shifts.',
    actionStep: 'Log the start date of your period and note any mid-cycle fertile cervical mucus or basal temperature changes.',
    scientificWhy: 'Early identification of cycle lengthening (>35 days) or luteal phase defect allows proactive lifestyle intervention before full oligomenorrhea develops.',
    effort: 'Quick (2-5 min)',
    impact: 'Foundational',
    geminiPrompt: 'What are the subtle signs of anovulation or delayed ovulation in an otherwise regular cycle, and how can I track ovulatory biomarkers effectively?'
  },
  {
    id: 'tip-mindful-box-breathing',
    title: '5 Minutes of Diaphragmatic Box Breathing',
    category: 'stress',
    riskTier: 'low',
    summary: 'Vagal nerve stimulation via slow 4-count box breathing immediately shifts autonomic tone from sympathetic fight-or-flight to parasympathetic rest-and-digest.',
    actionStep: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat for 5 cycles during midday work breaks or before dinner.',
    scientificWhy: 'Chronic low-grade mental stress triggers hypothalamic CRH and adrenal DHEA-S secretion. Parasympathetic activation reduces adrenal hyper-reactivity.',
    effort: 'Quick (2-5 min)',
    impact: 'Foundational',
    geminiPrompt: 'How does chronic stress and elevated adrenal DHEA-S contribute to non-classic PCOS phenotypes, and what breathing or vagal exercises help most?'
  },
  {
    id: 'tip-colorful-polyphenols',
    title: 'Rainbow Polyphenols & Antioxidant Diversity',
    category: 'nutrition',
    riskTier: 'low',
    summary: 'Consuming deeply pigmented berries, green tea, and cruciferous vegetables combats ovarian oxidative stress.',
    actionStep: 'Aim for at least 3 distinct plant colors on your dinner plate (e.g., blueberries, dark greens, purple cabbage, orange bell peppers).',
    scientificWhy: 'Ovarian follicles are susceptible to oxidative damage. Polyphenols like EGCG, quercetin, and anthocyanins upregulate endogenous glutathione and protect follicular quality.',
    effort: 'Quick (2-5 min)',
    impact: 'Foundational',
    geminiPrompt: 'What are the best antioxidant-rich and polyphenol-dense foods to protect ovarian follicle quality and metabolic vitality?'
  },
  {
    id: 'tip-hydration-electrolytes',
    title: 'Consistent Hydration with Electrolyte Balance',
    category: 'nutrition',
    riskTier: 'all',
    summary: 'Proper cellular hydration supports liver detoxification pathways and prevents pseudo-hunger cues that trigger sugary snacking.',
    actionStep: 'Drink a large glass of filtered water upon waking, and maintain 2 to 2.5 liters throughout the day.',
    scientificWhy: 'Adequate hydration supports microvascular blood flow to endocrine glands and ensures optimal clearance of hepatic estrogen and androgen metabolites.',
    effort: 'Quick (2-5 min)',
    impact: 'Foundational',
    geminiPrompt: 'How does optimal hydration support hormonal clearance and metabolic regulation in women prone to insulin fluctuations?'
  }
];

interface ProactiveLifestyleTipsWidgetProps {
  currentRiskScore: number;
  currentRiskLevel: string;
  bmi?: number;
  cycleStatus?: string;
  onAskAI: (prompt: string) => void;
  isDark?: boolean;
}

export const ProactiveLifestyleTipsWidget: React.FC<ProactiveLifestyleTipsWidgetProps> = ({
  currentRiskScore,
  currentRiskLevel,
  bmi,
  cycleStatus,
  onAskAI,
  isDark = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedTips, setCompletedTips] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`pcosense_habits_${today}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Save completed habits for today in localStorage
  const toggleTipCompletion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTips(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`pcosense_habits_${today}`, JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
      return updated;
    });
  };

  // Determine current risk tier
  const riskTier: 'low' | 'moderate' | 'elevated' =
    currentRiskScore <= 30 ? 'low' : currentRiskScore >= 70 ? 'elevated' : 'moderate';

  // Filter tips based on risk tier relevance and category
  const filteredTips = LIFESTYLE_TIPS_DATABASE.filter(tip => {
    // Category match
    if (selectedCategory !== 'all' && tip.category !== selectedCategory) {
      return false;
    }
    // Tier relevance match (show relevant to user tier or general tips)
    if (riskTier === 'elevated') {
      return tip.riskTier === 'elevated' || tip.riskTier === 'moderate' || tip.riskTier === 'all';
    } else if (riskTier === 'moderate') {
      return tip.riskTier === 'moderate' || tip.riskTier === 'elevated' || tip.riskTier === 'all';
    } else {
      return tip.riskTier === 'low' || tip.riskTier === 'moderate' || tip.riskTier === 'all';
    }
  });

  // Calculate completion percentage for today
  const totalShown = filteredTips.length;
  const completedCount = filteredTips.filter(t => completedTips[t.id]).length;
  const progressPercent = totalShown > 0 ? Math.round((completedCount / totalShown) * 100) : 0;

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Compass },
    { id: 'nutrition', label: 'Nutrition & Glycemic', icon: Apple },
    { id: 'movement', label: 'Movement & GLUT4', icon: Dumbbell },
    { id: 'hormones', label: 'Hormones & Androgens', icon: HeartPulse },
    { id: 'sleep', label: 'Sleep & Circadian', icon: Moon },
    { id: 'stress', label: 'Stress & Cortisol', icon: Flame }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'movement':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'hormones':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'sleep':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'stress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition':
        return <Apple className="h-3.5 w-3.5" />;
      case 'movement':
        return <Dumbbell className="h-3.5 w-3.5" />;
      case 'hormones':
        return <HeartPulse className="h-3.5 w-3.5" />;
      case 'sleep':
        return <Moon className="h-3.5 w-3.5" />;
      case 'stress':
        return <Flame className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const handleAskAIPersonalized = () => {
    const prompt = `Based on my latest PCOSense screening score of ${currentRiskScore.toFixed(1)}% (${currentRiskLevel} Risk), BMI of ${bmi || 24}, and cycle status '${cycleStatus || 'Regular'}', please create a customized, evidence-based 1-day lifestyle and nutrition routine with 3 specific micro-habits to balance insulin and androgen markers.`;
    onAskAI(prompt);
  };

  return (
    <section
      id="proactive-lifestyle-tips-widget"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-all"
    >
      {/* Header & Score Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-teal-900 dark:bg-teal-700 text-teal-300 flex items-center justify-center shrink-0 shadow-xs border border-teal-700/50">
            <Sparkles className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Proactive Lifestyle & Metabolic Tips
              </h2>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                riskTier === 'elevated'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : riskTier === 'low'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                Tailored for {currentRiskLevel} Risk ({currentRiskScore.toFixed(1)}%)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Targeted, low-friction micro-adjustments grounded in Rotterdam PCOS physiology to enhance insulin sensitivity, optimize ovulatory health, and buffer adrenal stress.
            </p>
          </div>
        </div>

        {/* AI Action Button */}
        <button
          type="button"
          onClick={handleAskAIPersonalized}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-700 hover:to-teal-600 text-white text-xs font-bold shadow-sm transition-all shrink-0 hover:shadow-md active:scale-98"
          id="lifestyle-ask-ai-custom-plan-btn"
        >
          <Sparkles className="h-4 w-4 text-teal-300 animate-pulse" />
          <span>Ask AI for Personalized Plan</span>
        </button>
      </div>

      {/* Daily Alignment Tracker Progress Bar */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Today's PCOS Habit Completion: <span className="text-teal-700 dark:text-teal-400">{completedCount} of {totalShown} Completed ({progressPercent}%)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click the checkmark on any micro-adjustment to log your daily progress.
            </p>
          </div>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-teal-900 text-white border-teal-900 dark:bg-teal-700 dark:border-teal-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Actionable Tip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.map((tip) => {
          const isDone = !!completedTips[tip.id];
          const isExpanded = expandedTipId === tip.id;

          return (
            <div
              key={tip.id}
              onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between group ${
                isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                  : isExpanded
                  ? 'bg-slate-50/90 dark:bg-slate-800/80 border-teal-300 dark:border-teal-700 shadow-md ring-1 ring-teal-200 dark:ring-teal-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges & Checkbox */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(tip.category)}`}>
                      {getCategoryIcon(tip.category)}
                      <span>{tip.category}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {tip.effort}
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                      {tip.impact}
                    </span>
                  </div>

                  {/* Habit Completion Toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleTipCompletion(tip.id, e)}
                    className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={isDone ? 'Mark as not done' : 'Mark done for today'}
                    aria-label={isDone ? 'Mark as not done' : 'Mark done for today'}
                  >
                    {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Circle className="h-4 w-4" />}
                  </button>
                </div>

                {/* Title */}
                <h3 className={`text-sm font-bold transition-colors ${
                  isDone
                    ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-80'
                    : 'text-slate-900 dark:text-slate-100 group-hover:text-teal-800 dark:group-hover:text-teal-300'
                }`}>
                  {tip.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tip.summary}
                </p>

                {/* Action Step Box */}
                <div className="rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 p-3 text-xs text-teal-950 dark:text-teal-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-teal-900 dark:text-teal-300 text-[11px] uppercase tracking-wider">
                    <Zap className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                    <span>Micro Action:</span>
                  </div>
                  <p className="leading-snug">{tip.actionStep}</p>
                </div>

                {/* Expanded Scientific Rationale */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
                    <div className="space-y-1 bg-slate-100/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Info className="h-3 w-3 text-slate-500" />
                        <span>Physiological Mechanism:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {tip.scientificWhy}
                      </p>
                    </div>

                    {/* AI Prompt Trigger Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAI(tip.geminiPrompt);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-900 dark:bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                      <span>Deep Dive with AI Assistant</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  {isExpanded ? 'Click to collapse' : 'Click for scientific rationale'}
                </span>
                <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  {isExpanded ? 'Show less' : 'Learn why'} <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Quick AI Questions related to Lifestyle */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-50/70 via-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-teal-100 dark:border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Explore More with PCOSense AI Assistant
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">One-click AI queries</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            {
              label: '🥗 1-Day Low-Glycemic PCOS Meal Plan',
              prompt: `Provide a realistic 1-day meal plan with breakfast, lunch, dinner, and 2 snacks specifically formulated for insulin sensitivity with my risk score of ${currentRiskScore.toFixed(1)}%.`
            },
            {
              label: '🌿 Best Evidence-Backed Supplements (Inositol, Berberine, Omega-3)',
              prompt: 'What are the top evidence-backed supplements for PCOS (like Myo-Inositol, D-Chiro Inositol, Berberine, and Omega-3), their typical dosages in studies, and safety caveats?'
            },
            {
              label: '🏃‍♀️ Cortisol-Safe Workout Routine',
              prompt: 'Explain why high-intensity chronic cardio can sometimes worsen PCOS symptoms by elevating cortisol, and outline a 4-day low-cortisol strength and walking schedule.'
            },
            {
              label: '☕ Coffee vs Matcha & Blood Sugar Timing',
              prompt: 'How does caffeine on an empty stomach affect morning cortisol and glucose spikes in women with PCOS? What are better breakfast-first coffee habits?'
            }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAskAI(item.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-all hover:border-teal-300 dark:hover:border-teal-600 shadow-2xs hover:shadow-xs"
            >
              <span>{item.label}</span>
              <ArrowRight className="h-3 w-3 text-teal-600 dark:text-teal-400 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
