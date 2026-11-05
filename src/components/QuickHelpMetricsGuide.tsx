import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Info,
  Sparkles,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Scale,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Search,
  ChevronRight
} from 'lucide-react';

export interface MetricHelpItem {
  id: string;
  name: string;
  category: 'Risk Model' | 'Biomarkers & Lab' | 'Ultrasound & Morphology' | 'Symptoms & Phenotypes';
  shortSummary: string;
  clinicalMeaning: string;
  normalRange: string;
  pcosPattern: string;
  whyItMatters: string;
  aiPrompt: string;
}

export const METRIC_HELP_ITEMS: MetricHelpItem[] = [
  {
    id: 'risk-score',
    name: 'Estimated Risk Probability (%)',
    category: 'Risk Model',
    shortSummary: 'Logistic regression ML model output quantifying aggregate alignment with Rotterdam PCOS features.',
    clinicalMeaning: 'A probabilistic estimate calculated across 40+ clinical, sonographic, metabolic, and symptom attributes weighted against clinical trial cohorts.',
    normalRange: '< 40.0% (Low probability cutoff; physiological baseline)',
    pcosPattern: '≥ 70.0% (Elevated clinical probability warranting physician diagnostic evaluation)',
    whyItMatters: 'Combines non-linear risk factors like androgen excess, oligomenorrhea, and follicle distribution into a single actionable screening metric.',
    aiPrompt: 'Explain how my estimated PCOS risk score is calculated and what factors contribute most heavily to it.'
  },
  {
    id: 'cycle-rhythm',
    name: 'Menstrual Cycle Rhythm (Regular vs Irregular)',
    category: 'Symptoms & Phenotypes',
    shortSummary: 'Primary indicator of chronic anovulation or delayed follicular maturation.',
    clinicalMeaning: 'Regular cycles occur predictably every 21–35 days. Irregular cycles (>35 days interval or <8 cycles/year) indicate anovulatory or oligo-ovulatory cycles.',
    normalRange: '21 to 35 days consistent interval between menses',
    pcosPattern: 'Oligomenorrhea (>35 days), polymenorrhea (<21 days), or amenorrhea (>90 days without menses)',
    whyItMatters: 'Chronic anovulation leads to unopposed estrogen exposure without luteal progesterone production, increasing endometrial hyperplasia risk.',
    aiPrompt: 'What causes irregular menstrual cycles in PCOS and how can lifestyle or inositol restore regular ovulation?'
  },
  {
    id: 'bmi-metabolic',
    name: 'Body Mass Index (BMI) & Metabolic Load',
    category: 'Biomarkers & Lab',
    shortSummary: 'Ratio of body mass to height, closely correlated with hyperinsulinemia and insulin resistance.',
    clinicalMeaning: 'BMI (kg/m²) serves as an anthropometric proxy for metabolic syndrome risk. Elevated visceral adipose tissue secretes pro-inflammatory cytokines and promotes compensatory insulin hypersecretion.',
    normalRange: '18.5 – 24.9 kg/m² (WHO standard) / 18.5 – 22.9 kg/m² (Asian-specific threshold)',
    pcosPattern: 'Overweight (≥25.0 kg/m²) or Obese (≥30.0 kg/m²), though "Lean PCOS" affects ~20-30% of patients with normal BMI but high visceral fat',
    whyItMatters: 'Hyperinsulinemia directly stimulates ovarian theca cells to overproduce androgens and suppresses hepatic Sex Hormone-Binding Globulin (SHBG).',
    aiPrompt: 'How does BMI and insulin resistance impact ovarian androgen production in PCOS?'
  },
  {
    id: 'hirsutism-androgens',
    name: 'Hyperandrogenism & Hirsutism Markers',
    category: 'Symptoms & Phenotypes',
    shortSummary: 'Excess circulation of testosterone, androstenedione, or DHEA-S causing terminal hair growth or androgenic alopecia.',
    clinicalMeaning: 'Assessed clinically via the modified Ferriman-Gallwey (mFG) score assessing coarse hair growth on androgen-sensitive areas (upper lip, chin, chest, midline abdomen).',
    normalRange: 'mFG score < 4–6 depending on ethnicity; Total Testosterone < 45–50 ng/dL; Free Testosterone < 5 pg/mL',
    pcosPattern: 'mFG score ≥ 6–8, elevated free androgen index (FAI), cystic adult acne along jawline, or temporal hair thinning',
    whyItMatters: 'Key diagnostic pillar under all major international consensus criteria (Rotterdam, AE-PCOS, NIH).',
    aiPrompt: 'What is the biological mechanism behind hirsutism and elevated androgens in PCOS, and how is it managed?'
  },
  {
    id: 'antral-follicles',
    name: 'Antral Follicle Count (AFC) & Ovarian Volume',
    category: 'Ultrasound & Morphology',
    shortSummary: 'High-resolution transvaginal/pelvic ultrasound measurement of small (2–9mm) arrested follicles.',
    clinicalMeaning: 'PCOS ovaries typically exhibit a "string of pearls" peripheral distribution of immature follicles arrested prior to dominant follicle selection.',
    normalRange: '< 20 follicles per whole ovary; Ovarian volume < 10.0 mL per ovary',
    pcosPattern: '≥ 20 follicles per ovary on modern ultrasound (or ≥12 on older transducers) or ovarian volume ≥ 10.0 mL without a dominant cyst (>10mm)',
    whyItMatters: 'Morphological feature representing follicular arrest driven by elevated local intra-ovarian androgens and AMH levels.',
    aiPrompt: 'What does high antral follicle count on an ultrasound mean for PCOS diagnosis?'
  },
  {
    id: 'lh-fsh-ratio',
    name: 'LH / FSH Gonadotropin Ratio',
    category: 'Biomarkers & Lab',
    shortSummary: 'Ratio between Luteinizing Hormone (LH) and Follicle-Stimulating Hormone (FSH) in early follicular phase (Day 2–4).',
    clinicalMeaning: 'In PCOS, rapid GnRH pulsatility in the hypothalamus increases pituitary LH secretion relative to FSH, leading to an elevated ratio.',
    normalRange: '1:1 ratio during early follicular phase (Day 2–4 of menses)',
    pcosPattern: 'Elevated ratio > 2:1 or > 3:1 (LH significantly higher than FSH)',
    whyItMatters: 'Elevated LH drives ovarian theca cells to synthesize androstenedione while insufficient FSH impairs aromatization to estradiol.',
    aiPrompt: 'Why is the LH to FSH ratio often high in PCOS and what does it indicate for ovulation?'
  },
  {
    id: 'habit-streak',
    name: 'Daily Habit Streak & Lifestyle Consistency',
    category: 'Risk Model',
    shortSummary: 'Consecutive days of completing target metabolic, hydration, and nutritional lifestyle behaviors.',
    clinicalMeaning: 'Tracks adherence to the core non-pharmacological first-line interventions recommended by the 2023 International Monash Guidelines.',
    normalRange: 'Consistent 7+ day streaks correlate with stabilized fasting glucose and lower chronic inflammation',
    pcosPattern: 'Intermittent or interrupted lifestyle intervention reduces long-term insulin sensitivity gains',
    whyItMatters: 'Lifestyle modifications (low-glycemic index nutrition, myo-inositol supplementation, circadian sleep, resistance training) produce sustained metabolic improvements.',
    aiPrompt: 'How do daily health habits like hydration, inositol, and walking improve PCOS symptoms over 90 days?'
  }
];

interface QuickHelpMetricsGuideProps {
  onAskAI?: (prompt: string) => void;
  isDark?: boolean;
}

export const QuickHelpMetricsGuide: React.FC<QuickHelpMetricsGuideProps> = ({
  onAskAI,
  isDark = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMetricId, setSelectedMetricId] = useState<string>(METRIC_HELP_ITEMS[0].id);

  const categories = ['All', 'Risk Model', 'Symptoms & Phenotypes', 'Biomarkers & Lab', 'Ultrasound & Morphology'];

  const filteredMetrics = METRIC_HELP_ITEMS.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clinicalMeaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const activeMetric = METRIC_HELP_ITEMS.find(m => m.id === selectedMetricId) || METRIC_HELP_ITEMS[0];

  return (
    <div
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
      id="quick-help-metrics-guide-widget"
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-teal-950/40 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HelpCircle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Help & Health Metrics Guide
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Context-Aware Tooltips
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Clear clinical explanations and reference ranges for every risk metric, biomarker, and card on your dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
            id="toggle-quick-help-guide-btn"
          >
            {isExpanded ? (
              <>
                <span>Collapse Guide</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Explore Metrics ({METRIC_HELP_ITEMS.length})</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Summary Chips Always Visible */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Instant Metric Explanations (Click to view full clinical details)</span>
          </span>
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI('Can you explain all the key metrics on my PCOSense dashboard in simple medical terms?')}
              className="text-[11px] text-teal-700 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Ask AI Overview</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {METRIC_HELP_ITEMS.slice(0, 4).map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedMetricId(item.id);
                setIsExpanded(true);
              }}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedMetricId === item.id && isExpanded
                  ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
              }`}
            >
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 block truncate">
                {item.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {item.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {item.shortSummary}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Interactive Detail Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 space-y-6"
          >
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search metric or lab..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Split View: Metrics List & Detail Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Metric Selector */}
              <div className="md:col-span-5 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredMetrics.map(item => {
                  const isSelected = item.id === selectedMetricId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMetricId(item.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-50 to-indigo-50/50 dark:from-teal-950/80 dark:to-slate-800 border-teal-400 dark:border-teal-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-950 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.shortSummary}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'text-teal-600 dark:text-teal-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}

                {filteredMetrics.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    No metrics match your search query.
                  </div>
                )}
              </div>

              {/* Right Column: Deep-Dive Card */}
              <div className="md:col-span-7 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      {activeMetric.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeMetric.name}
                    </h3>
                  </div>
                  {onAskAI && (
                    <button
                      type="button"
                      onClick={() => onAskAI(activeMetric.aiPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ask AI</span>
                    </button>
                  )}
                </div>

                {/* Clinical Meaning */}
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Clinical Meaning
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeMetric.clinicalMeaning}
                  </p>
                </div>

                {/* Normal vs PCOS Ranges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Healthy Reference</span>
                    </span>
                    <p className="text-xs font-medium text-emerald-950 dark:text-emerald-200">
                      {activeMetric.normalRange}
                    </p>
                  </div>

                  <div className="rounded-xl p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>PCOS-Associated Finding</span>
                    </span>
                    <p className="text-xs font-medium text-amber-950 dark:text-amber-200">
                      {activeMetric.pcosPattern}
                    </p>
                  </div>
                </div>

                {/* Why It Matters */}
                <div className="space-y-1 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Why It Matters For Your Health Plan
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeMetric.whyItMatters}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Reusable Metric Tooltip Trigger for Embedding inside Card Headers
 */
export const MetricTooltipTrigger: React.FC<{
  metricId: string;
  onAskAI?: (prompt: string) => void;
}> = ({ metricId, onAskAI }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const metric = METRIC_HELP_ITEMS.find(m => m.id === metricId) || METRIC_HELP_ITEMS[0];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={`Learn more about ${metric.name}`}
        title={`Click for clinical details on ${metric.name}`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 z-40 w-72 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl space-y-2 text-left"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                {metric.category}
              </span>
              <span className="text-[10px] text-slate-400">Clinical Guide</span>
            </div>

            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
              {metric.name}
            </h5>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {metric.shortSummary}
            </p>

            <div className="rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
              <div>
                <strong className="text-slate-900 dark:text-white">Normal:</strong> {metric.normalRange}
              </div>
            </div>

            {onAskAI && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onAskAI(metric.aiPrompt);
                  setIsOpen(false);
                }}
                className="w-full py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                <span>Ask AI About This Metric</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
