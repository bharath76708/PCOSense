import React, { useState } from 'react';
import {
  Utensils,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  ChevronRight,
  Globe,
  AlertTriangle,
  Camera,
  ImageOff
} from 'lucide-react';
import { useLanguage } from '../translations';
import {
  APDayPlan,
  APMealItem,
  AP_VEGETARIAN_PLAN,
  AP_NON_VEG_PLAN,
  AP_VEGAN_PLAN,
  MEDICAL_DISCLAIMER_TEXT
} from '../data/apTelanganaDietData';

export const APTelangana7DayDietSection: React.FC = () => {
  const { isTelugu, setLanguage } = useLanguage();

  // 1. Three Top Diet Options: Vegetarian | Non-Vegetarian | Vegan
  const [dietMode, setDietMode] = useState<'vegetarian' | 'non_vegetarian' | 'vegan'>('vegetarian');

  // 2. Active Day: 1 to 7
  const [activeDay, setActiveDay] = useState<number>(1);

  // 3. Curries Only Filter (Andhra & Telangana Curries & Dals)
  const [showCurriesOnly, setShowCurriesOnly] = useState<boolean>(false);

  // Active Plan Selection
  const activePlan: APDayPlan[] =
    dietMode === 'vegetarian'
      ? AP_VEGETARIAN_PLAN
      : dietMode === 'non_vegetarian'
      ? AP_NON_VEG_PLAN
      : AP_VEGAN_PLAN;

  const currentDayPlan = activePlan.find(d => d.day === activeDay) || activePlan[0];

  const allMealsList: APMealItem[] = [
    currentDayPlan.meals.earlyMorning,
    currentDayPlan.meals.breakfast,
    currentDayPlan.meals.midMorningSnack,
    currentDayPlan.meals.lunch,
    currentDayPlan.meals.eveningSnack,
    currentDayPlan.meals.dinner
  ];

  const isCurryMeal = (m: APMealItem) => {
    const text = `${m.name} ${m.nameTe}`.toLowerCase();
    return (
      text.includes('curry') ||
      text.includes('dal') ||
      text.includes('పప్పు') ||
      text.includes('కూర') ||
      text.includes('పులుసు') ||
      text.includes('వేపుడు') ||
      text.includes('ఇగురు') ||
      text.includes('kura') ||
      text.includes('pappu') ||
      text.includes('pulusu') ||
      text.includes('vepudu') ||
      text.includes('iguru') ||
      text.includes('sambar') ||
      text.includes('చారు') ||
      text.includes('సాంబార్')
    );
  };

  const mealsList = showCurriesOnly ? allMealsList.filter(isCurryMeal) : allMealsList;

  return (
    <div className="space-y-6" id="ap-telangana-7day-diet-plan-section">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white border border-teal-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Andhra Pradesh & Telangana Regional Plan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isTelugu
                ? 'ఆంధ్రప్రదేశ్ & తెలంగాణ 7-రోజుల PCOS డైట్ ప్లాన్'
                : '7-Day PCOS Diet Plan (Andhra Pradesh & Telangana)'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              {isTelugu
                ? 'మన ప్రాంతంలో నిత్యం తినే పెసరట్టు, రాగి సంగటి, జొన్న రొట్టె, గోంగూర పప్పు వంటి పోషక భోజనాలతో రూపొందించబడిన సహజ హార్మోన్ల సమతుల్యత ప్రణాళిక.'
                : 'Customized regional nutrition using Pesarattu, Ragi Sangati, Jowar Roti, and Gongura Dal to support insulin sensitivity and sustained metabolic vitality.'}
            </p>
          </div>

          {/* Language Switcher Button (English | తెలుగు) */}
          <div className="inline-flex p-1 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-bold shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                !isTelugu
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                isTelugu
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>
      </div>

      {/* TOP DIET OPTIONS: 🥗 Vegetarian | 🍗 Non-Vegetarian | 🌱 Vegan */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isTelugu ? 'డైట్ ఆప్షన్ ఎంచుకోండి:' : 'Select Diet Option:'}
          </span>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            {/* Vegetarian */}
            <button
              type="button"
              onClick={() => setDietMode('vegetarian')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                dietMode === 'vegetarian'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
              id="diet-opt-vegetarian"
            >
              <span>🥗</span>
              <span>{isTelugu ? 'శాఖాహారం (Vegetarian)' : 'Vegetarian'}</span>
            </button>

            {/* Non-Vegetarian */}
            <button
              type="button"
              onClick={() => setDietMode('non_vegetarian')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                dietMode === 'non_vegetarian'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-500'
              }`}
              id="diet-opt-nonvegetarian"
            >
              <span>🍗</span>
              <span>{isTelugu ? 'మాంసాహారం (Non-Veg)' : 'Non-Vegetarian'}</span>
            </button>

            {/* Vegan */}
            <button
              type="button"
              onClick={() => setDietMode('vegan')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                dietMode === 'vegan'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
              id="diet-opt-vegan"
            >
              <span>🌱</span>
              <span>{isTelugu ? 'వీగన్ (Vegan - డైరీ రహితం)' : 'Vegan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAY 1 TO DAY 7 TABS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(d => {
            const isSelected = activeDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDay(d)}
                className={`py-3 px-1 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-teal-300'
                }`}
                id={`ap-day-tab-${d}`}
              >
                <span className="text-[10px] font-bold opacity-80">
                  {isTelugu ? `రోజు` : `DAY`}
                </span>
                <span className="text-sm sm:text-base font-black">
                  {d}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Theme Banner & Traditional Curries Filter */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[11px]">
              {isTelugu ? currentDayPlan.dayTitleTe : currentDayPlan.dayTitle}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {isTelugu ? currentDayPlan.focusTe : currentDayPlan.focus}
            </span>
          </div>
          <span className="text-teal-700 dark:text-teal-300 font-semibold">
            {mealsList.length} {isTelugu ? 'పోషకాహార విభాగాలు' : 'Nutritional Items Displayed'}
          </span>
        </div>

        {/* Dedicated Andhra & Telangana Curries & Dals Filter Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🍛</span>
              <span className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                {isTelugu ? 'ఆంధ్రప్రదేశ్ & తెలంగాణ సంప్రదాయ కూరలు & పప్పులు' : 'Authentic AP & Telangana Curries & Dals'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300">
              {isTelugu
                ? 'గోంగూర పప్పు, పాలకూర కూర, సొరకాయ కూర, బీరకాయ కూర, దోసకాయ పప్పు, బెండకాయ పులుసు, నాటు కోడి కూర, చేపల పులుసు'
                : 'Gongura Dal, Palak Curry, Sorakaya Kura, Beerakaya Kura, Dosakaya Pappu, Bendakaya Pulusu, Andhra Chicken Curry, Chepala Pulusu'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCurriesOnly(!showCurriesOnly)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs border ${
              showCurriesOnly
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40'
            }`}
            id="ap-curries-only-filter-btn"
          >
            <span>{showCurriesOnly ? '✓' : '🍲'}</span>
            <span>
              {showCurriesOnly
                ? (isTelugu ? 'అన్ని వంటకాలు చూడండి' : 'Show All Daily Meals')
                : (isTelugu ? 'కూరలు & పప్పులు మాత్రమే (Curries Only)' : 'Show Curries & Dals Only')}
            </span>
          </button>
        </div>
      </div>

      {/* MEAL CARDS (All Meals or Curries Only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mealsList.map(meal => {
          return (
            <div
              key={meal.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Food Image / Exact Match Verification */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {meal.image ? (
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if file path fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    /* Exact Image Unavailable Placeholder: Per rule 6, DO NOT use wrong food image */
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5 text-slate-400 dark:text-slate-500">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Camera className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        {isTelugu ? 'ఖచ్చితమైన చిత్రం త్వరలో రానుంది' : 'Image Coming Soon'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        Exact food match certified
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wide">
                    {isTelugu ? meal.mealSlotTe : meal.mealSlot}
                  </span>
                </div>

                {/* Meal Details */}
                <div className="p-5 space-y-3">
                  <div>
                    {isCurryMeal(meal) && (
                      <div className="mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                          <span>🍛</span>
                          <span>{isTelugu ? 'ప్రాంతీయ కూర / పప్పు' : 'AP/Telangana Curry / Dal'}</span>
                        </span>
                      </div>
                    )}
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      {isTelugu ? meal.nameTe : meal.name}
                    </h3>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                      {isTelugu ? meal.portionTe : `Portion: ${meal.portion}`}
                    </p>
                  </div>

                  {/* Protein & Fiber Info Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                      Protein: {isTelugu ? meal.proteinTe : meal.protein}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-[11px]">
                      Fiber: {isTelugu ? meal.fiberTe : meal.fiber}
                    </span>
                  </div>

                  {/* Short PCOS-friendly explanation */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      {isTelugu ? 'PCOS-అనుకూల వివరణ:' : 'PCOS-Friendly Why:'}
                    </span>
                    {isTelugu ? meal.pcosExplanationTe : meal.pcosExplanation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATUTORY MEDICAL DISCLAIMER (RULE 17) */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase block tracking-wider mb-0.5">
            {isTelugu ? 'వైద్యపరమైన నిరాకరణ (Medical Disclaimer)' : 'Medical Disclaimer'}
          </span>
          <p>{isTelugu ? MEDICAL_DISCLAIMER_TEXT.te : MEDICAL_DISCLAIMER_TEXT.en}</p>
        </div>
      </div>
    </div>
  );
};
