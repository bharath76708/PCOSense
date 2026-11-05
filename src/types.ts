/**
 * PCOSense - Types and Data Models
 * Grounded in notebook feature catalog & ML pipeline
 */

export interface PCOSFeatureMeta {
  name: string;
  label: string;
  category: 'personal' | 'menstrual' | 'symptoms' | 'lifestyle' | 'biomarkers';
  type: 'numeric' | 'binary' | 'categorical';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
  description: string;
  options?: { label: string; value: number }[];
  importanceRank?: number;
  importanceWeight?: number;
  isKeyClinicalMarker?: boolean;
}

export interface PatientRecord {
  // Step 1: Personal Information
  'Age (yrs)': number;
  'Weight (Kg)': number;
  'Height(Cm)': number;
  'BMI': number;
  'Blood Group': number;
  'Pulse rate(bpm)': number;
  'RR (breaths/min)': number;
  'BP _Systolic (mmHg)': number;
  'BP _Diastolic (mmHg)': number;
  'Hb(g/dl)': number;

  // Step 2: Menstrual & Gynecological Profile
  'Cycle(R/I)': number;
  'Cycle length(days)': number;
  'Marraige Status (Yrs)': number;
  'Pregnant(Y/N)': number;
  'No. of aborptions': number;

  // Step 3: Clinical & Dermatological Symptoms
  'Weight gain(Y/N)': number;
  'hair growth(Y/N)': number;
  'Skin darkening (Y/N)': number;
  'Hair loss(Y/N)': number;
  'Pimples(Y/N)': number;

  // Step 4: Lifestyle & Laboratory Biomarkers
  'Fast food (Y/N)': number;
  'Reg.Exercise(Y/N)': number;
  'RBS(mg/dl)': number;
  'TSH (mIU/L)': number;
  'AMH(ng/mL)': number;
  'PRL(ng/mL)': number;
  'Vit D3 (ng/mL)': number;
  'PRG(ng/mL)': number;
  'FSH(mIU/mL)': number;
  'LH(mIU/mL)': number;
  'FSH/LH': number;
  'Hip(inch)': number;
  'Waist(inch)': number;
  'Waist:Hip Ratio': number;
  'I beta-HCG(mIU/mL)': number;
  'II beta-HCG(mIU/mL)': number;
  'Follicle No. (L)': number;
  'Follicle No. (R)': number;
  'Avg. F size (L) (mm)': number;
  'Avg. F size (R) (mm)': number;
  'Endometrium (mm)': number;
}

export type RiskLevel = 'Low' | 'Moderate' | 'Elevated';

export interface FeatureContribution {
  feature: string;
  label: string;
  category: string;
  rawValue: number;
  formattedValue: string;
  coefficient: number;
  standardizedValue: number;
  contributionScore: number; // impact on log-odds z
  direction: 'increase' | 'decrease';
  clinicalSummary: string;
}

export interface PredictionResponse {
  prediction: 0 | 1;
  probability: number; // 0.00 to 1.00
  probabilityPercentage: number; // 0.00% to 100.00%
  risk_level: RiskLevel;
  model_name: string;
  model_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  key_risk_drivers: FeatureContribution[];
  protective_factors: FeatureContribution[];
  all_contributions: FeatureContribution[];
  timestamp: string;
  assessment_id: string;
}

export interface WhatIfRequest {
  baseline: Partial<PatientRecord>;
  modified: Partial<PatientRecord>;
}

export interface WhatIfResponse {
  baselineProbability: number;
  baselineRiskLevel: RiskLevel;
  simulatedProbability: number;
  simulatedRiskLevel: RiskLevel;
  deltaProbability: number;
  direction: 'reduced' | 'increased' | 'neutral';
  changedFeatures: {
    feature: string;
    label: string;
    from: number;
    to: number;
    fromFormatted: string;
    toFormatted: string;
    riskImpactDelta: number;
  }[];
}

export type UserRole = 'user' | 'doctor' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  photo_url?: string;
  provider?: string;
  doctorId?: string;
}

export interface UserProfile {
  user_id: string;
  full_name?: string;
  email?: string;
  role?: UserRole;
  profile_completed: boolean;
  completion_percentage: number;
  patientData: PatientRecord;
  updated_at: string;
  // WhatsApp Consent & Communication Settings
  whatsapp_opt_in?: boolean;
  phone_number?: string;
  preferred_language?: 'en' | 'te';
  notification_preferences?: WhatsAppNotificationPreferences;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AssessmentHistoryItem {
  id: string;
  user_id?: string;
  timestamp: string;
  dateFormatted: string;
  probability: number;
  risk_level: RiskLevel;
  prediction: 0 | 1;
  bmi: number;
  cycleStatus: string;
  follicleCountRight: number;
  model_name?: string;
  notes?: string;
  inputSnapshot?: Partial<PatientRecord>;
  keyDrivers?: FeatureContribution[];
}

export interface ModelBenchmarkInfo {
  dataset: {
    name: string;
    totalRows: number;
    totalFeatures: number;
    positiveCases: number;
    negativeCases: number;
    imbalanceRatio: string;
    split: string;
  };
  models: {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
    isSelected: boolean;
    reason: string;
  }[];
  crossValidationFolds: {
    fold: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  }[];
  confusionMatrix: {
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    truePositive: number;
  };
  topFeatures: {
    rank: number;
    name: string;
    label: string;
    importance: number;
    direction: '+' | '-';
    description: string;
  }[];
}

export interface SummaryInsightsPattern {
  category: string;
  trend: 'improving' | 'stable' | 'attention';
  title: string;
  description: string;
}

export interface SummaryInsightsData {
  headline: string;
  summary: string;
  keyPatterns: SummaryInsightsPattern[];
  actionFocus: string[];
  riskTrajectory: 'improving' | 'stable' | 'elevated' | 'insufficient_data';
  model: string;
  generatedAt: string;
  assessmentsCount: number;
  timeframeDays: number;
}

export interface CommunityResourceItem {
  id: string;
  title: string;
  category: 'research' | 'specialist' | 'guideline' | 'nutrition' | 'support';
  authorOrOrg: string;
  publicationOrType: string;
  year?: string;
  description: string;
  keyTakeaways: string[];
  url: string;
  badge: string;
  isPeerReviewed?: boolean;
  doiOrPubMed?: string;
}

export type AccentColor = 'teal' | 'emerald' | 'rose' | 'indigo' | 'amber' | 'cyan';

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  accentColor: AccentColor;
  fontSize: 'normal' | 'large';
}

export interface DailySymptomLog {
  id: string;
  userId?: string;
  timestamp: string; // ISO date string
  dateFormatted: string; // e.g. "Oct 24, 2025"
  dateKey: string; // e.g. "2025-10-24" for unique indexing per day
  
  // Physical Symptom ratings (0-5 scale: 0=None, 1=Minimal, 2=Mild, 3=Moderate, 4=Severe, 5=Extreme)
  pelvicPain: number;
  bloating: number;
  fatigue: number;
  acne: number;
  headaches: number;
  hirsutismFlare: boolean;
  hairLossNoticed: boolean;

  // Emotional & Mental ratings (0-5 scale)
  moodSwings: number;
  anxiety: number;
  brainFog: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  sleepHours: number; // e.g. 7.5
  sugarCravings: number; // 0-5

  // Menstrual status
  menstrualFlow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  cycleDay?: number; // e.g. Day 14
  cycleIrregularity?: 'none' | 'delayed_period' | 'missed_period' | 'spotting_mid_cycle' | 'prolonged_flow' | 'ovulation_pain';
  moodState?: 'calm' | 'happy' | 'irritable' | 'anxious' | 'low' | 'swings';
  symptomsCount?: number;
  basalTempCelsius?: number; // e.g. 36.6

  // Lifestyle inputs
  exerciseMinutes: number; // e.g. 30
  waterIntakeLiters: number; // e.g. 2.5
  fastFoodConsumed: boolean;

  // Calculated aggregate scores
  overallSeverityScore: number; // 0 - 100 aggregate index
  physicalScore: number; // 0 - 100
  emotionalScore: number; // 0 - 100

  notes?: string;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  teluguTitle?: string;
  description: string;
  teluguDescription?: string;
  category: 'symptoms' | 'screening' | 'consistency' | 'clinical' | 'education';
  icon: string;
  earned: boolean;
  earnedAt?: string;
  progress: number; // 0 to 100
  currentValue: number;
  targetValue: number;
  unit: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpPoints: number;
}

export interface UserMilestonesData {
  userId: string;
  totalXp: number;
  level: number;
  streakDays: number;
  totalSymptomLogs: number;
  totalAssessments: number;
  badges: MilestoneBadge[];
  recentUnlock?: MilestoneBadge | null;
}

export interface HealthcareSpecialist {
  id: string;
  name: string;
  title: string; // e.g. "Consultant Gynecologist & Reproductive Endocrinologist"
  clinicOrHospital: string;
  specialties: ('pcos' | 'gynecology' | 'endocrinology' | 'fertility' | 'nutrition')[];
  rating: number; // e.g. 4.9
  reviewCount: number;
  experienceYears: number;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  phone: string;
  email?: string;
  website?: string;
  acceptsTelehealth: boolean;
  acceptsInsurance: boolean;
  consultationFee: string;
  availableDays: string[];
  pcosServices: string[];
  badges: string[];
  isVerified: boolean;
}

export interface CalendarEventPayload {
  title: string;
  description: string;
  location?: string;
  startDate: string; // YYYY-MM-DD or ISO
  endDate?: string;
  startTime?: string; // HH:mm
  endTime?: string;
  allDay?: boolean;
  reminderMinutesBefore?: number;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  url?: string;
}

export interface DoctorSharePayload {
  shareId: string;
  userId?: string;
  patientName: string;
  patientAge?: number;
  generatedAt: string;
  expiresAt: string;
  expirationHours: number; // e.g. 24, 72, 168 (7 days)
  pinProtected: boolean;
  pinHash?: string;
  shareUrl: string;
  assessmentData?: {
    latestRiskScore: number;
    riskLevel: RiskLevel;
    timestamp: string;
    bmi: number;
    cycleStatus: string;
    keyDrivers?: FeatureContribution[];
    follicleCountRight?: number;
    follicleCountLeft?: number;
    vitalSigns?: {
      bloodPressure: string;
      pulseRate: number;
      respiratoryRate: number;
      glucoseRBS?: number;
      tsh?: number;
      amh?: number;
      lhFshRatio?: number;
    };
    symptomsList?: {
      hirsutism: boolean;
      acne: boolean;
      hairLoss: boolean;
      weightGain: boolean;
      skinDarkening: boolean;
    };
    rotterdamCriteriaMet?: {
      oligoAnovulation: boolean;
      hyperandrogenism: boolean;
      polycysticOvaries: boolean;
      criteriaCount: number;
    };
    notes?: string;
  };
}

// ============================================================
// PERSONALIZED RISK REASONS & MECHANISMS
// ============================================================

export interface PersonalizedRiskReason {
  id: string;
  category: 'menstrual' | 'metabolic' | 'androgenic' | 'lifestyle' | 'biomarker';
  title: string;
  titleTe?: string;
  reportedValue: string | number;
  healthyBenchmark: string;
  severity: 'high' | 'moderate' | 'mild';
  whyItsARisk: string;
  whyItsARiskTe?: string;
  biologicalMechanism: string;
  biologicalMechanismTe?: string;
  dietaryAction: string;
  dietaryActionTe?: string;
  keyNutrients: string[];
}

// ============================================================
// DIET PLAN & RECIPE MODELS
// ============================================================

export type MealCategory =
  | 'breakfast'
  | 'mid_morning'
  | 'lunch'
  | 'evening_snack'
  | 'dinner'
  | 'bedtime_drink';

export type CravingType =
  | 'spicy'
  | 'sweet'
  | 'hot'
  | 'special'
  | 'crunchy'
  | 'comfort';

export type DietPreference =
  | 'all'
  | 'vegetarian'
  | 'non_vegetarian'
  | 'vegan'
  | 'south_indian';

export interface RecipeIngredient {
  item: string;
  amount: string;
  pcosBenefit?: string;
}

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Advanced';
export type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Advanced';
export type DietaryTagFilter = 'Gluten-Free' | 'Low-Glycemic' | 'Dairy-Free';

export interface RecipeItem {
  id: string;
  name: string;
  nameTe?: string;
  tagline: string;
  taglineTe?: string;
  mealType: MealCategory;
  cravingType?: CravingType;
  preference: DietPreference;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  glycemicIndex: 'Low' | 'Medium';
  difficulty?: RecipeDifficulty;
  pcosHormoneBenefits: string[];
  pcosHormoneBenefitsTe?: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  instructionsTe?: string[];
  proTips: string[];
  proTipsTe?: string[];
  tags: string[];
  imageUrl?: string;
  isSaved?: boolean;
}

export interface DailyDietPlan {
  dayNumber: number; // 1 to 7
  dayName: string;
  dayNameTe?: string;
  theme: string;
  themeTe?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  primaryHormoneGoal: string;
  primaryHormoneGoalTe?: string;
  meals: {
    breakfast: RecipeItem;
    midMorning: RecipeItem;
    lunch: RecipeItem;
    eveningSnack: RecipeItem;
    dinner: RecipeItem;
    bedtimeDrink: RecipeItem;
  };
  alternativeMeals?: {
    breakfast: RecipeItem;
    midMorning: RecipeItem;
    lunch: RecipeItem;
    eveningSnack: RecipeItem;
    dinner: RecipeItem;
    bedtimeDrink: RecipeItem;
  };
}

export type GroceryCategory =
  | 'produce'
  | 'grains_seeds'
  | 'proteins_dairy'
  | 'spices_herbs'
  | 'pantry_fats';

export interface GroceryItem {
  id: string;
  name: string;
  nameTe?: string;
  category: GroceryCategory;
  amount: string;
  weeklyEstAmount?: string;
  pcosBenefit?: string;
  usedInMeals: {
    dayNumber: number;
    mealType: MealCategory;
    recipeName: string;
  }[];
  checked?: boolean;
}

export interface SevenDayDietPlan {
  id: string;
  createdAt: string;
  patientRiskLevel: RiskLevel;
  preference: DietPreference;
  primaryTarget: string;
  calorieTarget: number;
  days: DailyDietPlan[];
  guidelines: {
    title: string;
    description: string;
  }[];
}

// ============================================================
// NUTRIENT GAP & NEARBY GROCERY TYPES
// ============================================================

export interface NutrientGapItem {
  id: string;
  name: string;
  nameTe: string;
  category: 'fiber' | 'micronutrient';
  dailyTargetText: string;
  dailyTargetValue: number;
  unit: string;
  sevenDayAvg: number;
  daysMetCount: number;
  totalDays: number;
  status: 'gap' | 'borderline' | 'optimal';
  clinicalMechanism: string;
  clinicalMechanismTe: string;
  pcosPathologyFocus: string;
  pcosPathologyFocusTe?: string;
  topFoodBoosters: {
    item: string;
    itemTe?: string;
    portion: string;
    nutrientYield: string;
    benefit: string;
  }[];
  recommendedRecipeSwap?: {
    mealCategory: MealCategory;
    recipeName: string;
    recipeNameTe?: string;
    boostText: string;
  };
}

export interface SevenDayNutrientGapReport {
  overallScore: number; // 0 - 100
  gapsCount: number;
  borderlineCount: number;
  optimalCount: number;
  fiberGapIdentified: boolean;
  nutrients: NutrientGapItem[];
  highPriorityGapText: string;
  highPriorityGapTextTe: string;
}

export interface NearbyGroceryStore {
  id: string;
  name: string;
  nameTe?: string;
  type: 'farmers_market' | 'health_food_store' | 'organic_supermarket' | 'herbal_apothecary';
  typeLabel: string;
  typeLabelTe?: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  openingHoursText: string;
  phone?: string;
  website?: string;
  googleMapsUri: string;
  pcosSpecialties: string[];
  pcosSpecialtiesTe?: string[];
  matchedGroceryCategories: GroceryCategory[];
  verifiedOrganic: boolean;
}

// ============================================================
// WALKING & STEP COUNT ACTIVITY MODELS
// ============================================================

export interface HourlyStepBlock {
  hour: number; // 0 - 23
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface DailyStepRecord {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  dateFormatted?: string;
  steps: number;
  distanceKm: number;
  caloriesBurned: number;
  activeMinutes: number;
  goalSteps: number;
  hourlyBreakdown: HourlyStepBlock[];
  lastUpdated: string;
  pcosInsulinImpactScore: number; // 0 - 100 insulin sensitivity booster score
  postMealWalkDone?: boolean;
}

export interface ActivitySummaryReport {
  period: 'day' | 'week' | 'month';
  totalSteps: number;
  avgDailySteps: number;
  totalDistanceKm: number;
  totalCaloriesBurned: number;
  totalActiveMinutes: number;
  goalAchievementRate: number; // percentage
  daysMetGoal: number;
  totalDays: number;
  bestDay: { dateKey: string; steps: number };
  chartData: {
    label: string;
    dateKey: string;
    steps: number;
    goal: number;
    distanceKm: number;
    calories: number;
  }[];
}

// ============================================================
// HYDRATION & SMART WATER INTAKE ALERT MODELS
// ============================================================

export interface WaterDrinkEntry {
  id: string;
  time: string; // e.g. "09:30 AM"
  timestamp: string;
  amountMl: number; // e.g. 250ml per glass
  type?: 'glass' | 'bottle' | 'sipper';
  checkpointLabel?: string; // e.g. "Morning Wake-Up Glow", "Post-Breakfast", "Mid-Day Metabolism"
}

export interface DailyHydrationRecord {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  totalMl: number;
  targetMl: number;
  glassesConsumed: number;
  targetGlasses: number;
  entries: WaterDrinkEntry[];
  lastDrunkAt?: string;
  streakDays: number;
}

export interface HydrationReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // e.g. 60, 90, 120
  targetMl: number; // default 2500 - 3000 ml
  glassSizeMl: number; // default 250 ml
  wakeUpTime: string; // "07:00"
  bedTime: string; // "22:30"
  soundEnabled: boolean;
  scheduledCheckpoints: {
    time: string;
    label: string;
    labelTe?: string;
    amountMl: number;
    pcosBenefit: string;
    pcosBenefitTe?: string;
  }[];
}

// ============================================================
// PCOS WELLNESS, YOGA & EXERCISE WORKOUT MODELS
// ============================================================

export type WorkoutIntensity = 'Gentle' | 'Moderate' | 'Energizing';
export type RoutineCategory = 'yoga' | 'strength' | 'low_impact_cardio' | 'pilates' | 'restorative';
export type UserFitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseStep {
  name: string;
  nameTe?: string;
  durationMinutes: number;
  description: string;
  descriptionTe?: string;
  postureTips: string[];
}

export interface DifficultyVariation {
  durationMinutes: number;
  frequency: string;
  frequencyTe?: string;
  intensity: WorkoutIntensity;
  burnKcal: number;
  guidance: string;
  guidanceTe?: string;
}

export interface WellnessRoutine {
  id: string;
  title: string;
  titleTe?: string;
  category: RoutineCategory;
  categoryLabel: string;
  categoryLabelTe?: string;
  imageUrl: string;
  intensity: WorkoutIntensity;
  durationMinutes: number;
  recommendedFrequency: string; // e.g. "3-4 times / week"
  recommendedFrequencyTe?: string;
  estimatedCaloriesBurn: number; // e.g. 140 - 220 kcal
  fatLossInsight: string;
  fatLossInsightTe?: string;
  hormonalImpact: string;
  hormonalImpactTe?: string;
  bestTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  targetMuscleGroups: string[];
  equipmentNeeded: string[];
  steps: ExerciseStep[];
  suitabilityNote: string;
  // Video technique & demonstration
  videoUrl?: string;
  videoPoster?: string;
  videoDuration?: string;
  techniqueHighlights?: string[];
  techniqueHighlightsTe?: string[];
  // Dynamic variations per difficulty level
  difficultyVariations?: {
    Beginner: DifficultyVariation;
    Intermediate: DifficultyVariation;
    Advanced: DifficultyVariation;
  };
}

export interface CompletedYogaLog {
  id: string;
  routineId: string;
  routineTitle: string;
  category: RoutineCategory;
  dateKey: string; // YYYY-MM-DD
  durationMinutes: number;
  caloriesBurned: number;
  loggedAt: string;
  notes?: string;
  moodRating?: number; // 1 to 5
  // Post-workout feedback & exertion metadata
  exertionRPE?: number; // 1 to 10 (Rate of Perceived Exertion)
  exertionLabel?: string; // e.g. "Light Restorative", "Optimal Fat Burn", "High Exertion"
  pelvicComfort?: string; // e.g. "Pain-free / Relaxed", "Mild Relief", "Tension Released"
  energyLevel?: string; // e.g. "Recharged & Calm", "Metabolically Energized", "Ready for Sleep"
  fitnessLevelLogged?: UserFitnessLevel;
}

export interface WellnessAchievement {
  id: string;
  title: string;
  titleTe: string;
  description: string;
  descriptionTe: string;
  iconName: 'award' | 'flame' | 'sparkles' | 'calendar' | 'shield' | 'trophy' | 'zap' | 'heart';
  badgeCategory: 'streak' | 'consistency' | 'metabolism' | 'mastery' | 'milestone';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
  rarity: 'Common' | 'Silver' | 'Gold' | 'Diamond';
}

export interface WellnessReminderSettings {
  enabled: boolean;
  preferredTime: string; // e.g. "07:30"
  preferredPeriod: 'Morning' | 'Afternoon' | 'Evening';
  customDays: number[]; // 0 for Sun, 1 for Mon...
  soundEnabled: boolean;
  customMessage: string;
  browserNotificationGranted: boolean;
}

export interface UserFeedback {
  id: string;
  userId?: string;
  userEmail?: string;
  rating: number; // 1 to 5 stars
  npsScore?: number; // 1 to 10
  experienceTags: string[];
  feedbackText: string;
  submittedAt: string;
  completedAssessmentsCount: number;
}

export interface WellnessPersonalTargets {
  dailyStepTarget: number; // e.g. 8000
  dailyWaterTargetMl: number; // e.g. 2500
  weeklyActiveDaysTarget: number; // e.g. 5
  postMealWalksTarget: number; // e.g. 2
  updatedAt: string;
}

// ============================================================
// PCOS DAILY HABIT TRACKER INTERFACES
// ============================================================

export type PCOSHabitCategory = 'supplement' | 'nutrition' | 'sleep' | 'movement' | 'mindset';

export interface PCOSHabitDefinition {
  id: string;
  name: string;
  nameTe?: string;
  category: PCOSHabitCategory;
  icon: 'pill' | 'moon' | 'cookie' | 'coffee' | 'heart' | 'apple' | 'droplet' | 'footprints' | 'sparkles' | 'sun';
  clinicalRationale: string;
  clinicalRationaleTe?: string;
  endocrineImpact: string;
  endocrineImpactTe?: string;
  targetTime?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  isCustom?: boolean;
  defaultHabit: boolean;
}

export interface DailyHabitEntry {
  habitId: string;
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface DailyHabitsDayRecord {
  id: string; // e.g. `${userId}_${dateKey}`
  userId: string;
  dateKey: string; // YYYY-MM-DD
  habits: Record<string, DailyHabitEntry>;
  completedCount: number;
  totalHabitsCount: number;
  completionRate: number; // 0 to 100
  streakCount: number;
  lastUpdated: string;
}

// ============================================================
// DOCTOR, APPOINTMENT, CONSULTATION & HEALTHCARE PLATFORM MODELS
// ============================================================

export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  photoUrl: string;
  qualification: string;
  specialization: string;
  licenseNumber: string; // State Council / NMC Reg No. (e.g., TS-MCI-2011-8849)
  stateMedicalCouncil?: string; // e.g. "Telangana State Medical Council"
  registrationYear?: number; // e.g. 2011
  nmcVerificationId?: string; // National Medical Commission RMP verified ID
  experienceYears: number;
  clinic: string;
  location: string;
  languages: string[];
  consultationFee: number;
  availability: {
    days: string[];
    slots: string[];
  };
  about: string;
  verificationStatus: DoctorVerificationStatus;
  rating: number;
  totalReviews: number;
  digitalSignatureStamp?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface AppointmentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorPhoto?: string;
  clinic?: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 10:30 AM"
  amount: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  notes?: string;
  hasSharedHealthReport?: boolean;
  sharedHealthReportId?: string;
  telemedicineConsentRecorded?: boolean;
  consentTimestamp?: string;
  abhaId?: string;
  createdAt: string;
  updatedAt?: string;
}

// Telemedicine Practice Guidelines (2020) Drug Classification
export type TelemedicineDrugClass = 'List_A' | 'List_B' | 'Over_The_Counter';

export interface PrescriptionMedicine {
  id: string;
  genericName: string; // Mandatory generic name (e.g. Myo-Inositol + D-Chiro Inositol, Metformin)
  brandNameOptional?: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Sachet' | 'Syrup' | 'Topical Gel';
  strength: string; // e.g. "2000mg / 50mg" or "500mg ER"
  frequency: string; // e.g. "1-0-1 (Twice Daily)", "0-0-1 (Night)", "Once weekly"
  durationDays: number; // e.g. 30, 60, 90
  route: 'Oral' | 'Topical';
  instructions: string; // e.g. "Take with or immediately after meals"
  drugClassification: TelemedicineDrugClass;
}

export interface NMCPrescription {
  prescriptionId: string;
  consultationId: string;
  appointmentId: string;
  issuedAt: string;
  doctorDetails: {
    name: string;
    qualification: string;
    medicalCouncilRegNo: string;
    stateMedicalCouncil: string;
    clinicName: string;
    clinicAddress: string;
    contactPhone?: string;
  };
  patientDetails: {
    id: string;
    name: string;
    age?: number;
    gender: string;
    phoneOrEmail?: string;
    abhaId?: string;
    weightKg?: number;
    bmi?: number;
  };
  clinicalFindings: {
    chiefComplaints: string;
    rotterdamPhenotype?: string;
    icd10Code: string; // Default 'E28.2 (Polycystic Ovarian Syndrome)'
    vitalsSummary?: string;
    relevantLabResults?: string;
  };
  medications: PrescriptionMedicine[];
  investigationsRequested: string[];
  medicalNutritionAndLifestyleAdvice: string[];
  followUpAdvice: string;
  emergencyDisclaimer: string;
  digitalSignature: {
    signedByName: string;
    regNo: string;
    timestamp: string;
    verificationHash: string;
  };
}

export interface ConsultationRecord {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  amount: number;
  status: 'completed';
  paymentStatus: 'paid';
  commissionPercentage: number; // default 20
  commissionAmount: number;
  doctorAmount: number;
  clinicalNotes?: string;
  prescription?: string;
  nmcPrescription?: NMCPrescription;
  recommendations?: string[];
  completedAt: string;
}

// ============================================================
// DPDP ACT (2023), EHR STANDARDS & ABHA INTEGRATION MODELS
// ============================================================

export interface DPDPConsentRecord {
  userId: string;
  consentVersion: string; // e.g. "DPDP-2023-V1.2"
  purposes: {
    clinicalScreening: boolean;
    lifestylePlanGeneration: boolean;
    doctorTeleconsultationSharing: boolean;
    anonymizedResearchOptIn: boolean;
  };
  ageConfirmed18Plus: boolean;
  timestamp: string;
  status: 'active' | 'revoked';
  revokedAt?: string;
  ipHash?: string;
}

export interface ClinicalAuditLog {
  id: string;
  timestamp: string;
  action:
    | 'CONSENT_GRANTED'
    | 'CONSENT_REVOKED'
    | 'REPORT_VIEWED'
    | 'REPORT_SHARED'
    | 'PRESCRIPTION_GENERATED'
    | 'PRESCRIPTION_VIEWED'
    | 'DATA_EXPORTED'
    | 'DATA_ERASURE_REQUESTED'
    | 'TELECONSULT_INITIATED';
  actorId: string;
  actorRole: 'patient' | 'doctor' | 'admin';
  actorName: string;
  targetRecordId?: string;
  patientId: string;
  details: string;
  complianceStandard: 'DPDP_ACT_2023' | 'TELEMEDICINE_GUIDELINES_2020' | 'EHR_2016';
}

export interface ABHAProfile {
  abhaNumber: string; // 14-digit format: XX-XXXX-XXXX-XXXX
  abhaAddress: string; // e.g. "priya.sharma@abdm"
  linkedAt: string;
  kycVerified: boolean;
  fullName: string;
  gender: string;
  yearOfBirth: number;
}

export interface GrievanceTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'data_access' | 'consent_withdrawal' | 'data_correction' | 'teleconsultation_grievance' | 'security_incident';
  description: string;
  status: 'submitted' | 'under_review' | 'resolved';
  submittedAt: string;
  assignedOfficer: string;
  expectedResolutionDays: number; // Max 30 days per Indian law
  resolutionNotes?: string;
}

export interface HealthReportRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  generatedAt: string;
  screeningSummary: {
    riskLevel: RiskLevel;
    probability: number;
    probabilityPercentage: number;
    keyFactors: string[];
    protectiveFactors: string[];
    assessmentDate: string;
  };
  symptomsSummary: string[];
  measurements: {
    bmi: number;
    weightKg: number;
    heightCm: number;
    waistHipRatio?: number;
    pulseRate?: number;
    bloodPressure?: string;
  };
  lifestyleSummary: {
    dietPreference?: string;
    exerciseRegularity?: string;
    fastFoodFrequency?: string;
    waterIntakeLiters?: number;
    dailyStepsAverage?: number;
  };
  nutritionSummary: {
    dailyCaloriesTarget: number;
    proteinTargetGrams: number;
    fiberTargetGrams: number;
    identifiedGaps: string[];
  };
  recommendedNextSteps: string[];
  recommendedSpecialist: string;
  sharedWithDoctorIds: string[];
  isShared: boolean;
  authorizedAt?: string;
}

export interface YogaVideoItem {
  id: string;
  title: string;
  titleTe?: string;
  description: string;
  descriptionTe?: string;
  youtubeVideoId: string;
  duration: string; // e.g. "15 min"
  category: 'Yoga' | 'Beginner Yoga' | 'Stretching' | 'Breathing Exercises' | 'Low Impact Exercise' | 'Walking' | 'PCOS-friendly Movement';
  difficulty: 'Beginner' | 'Intermediate' | 'Gentle';
  thumbnail: string;
  benefits: string[];
  benefitsTe?: string[];
  language?: 'en' | 'te';
  channelName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StructuredNutritionRecord {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  calcium: number; // mg
  iron: number; // mg
  zinc: number; // mg
  magnesium: number; // mg
  potassium: number; // mg
  vitaminC: number; // mg
}

export interface DetailedRecipeItem {
  id: string;
  name: string;
  nameTe?: string;
  description: string;
  descriptionTe?: string;
  category: string;
  mealType: 'breakfast' | 'midMorning' | 'lunch' | 'eveningSnack' | 'dinner' | 'bedtimeDrink';
  prepTime: string;
  cookTime: string;
  servingSize: string;
  ingredients: string[];
  ingredientsTe?: string[];
  instructions: string[];
  instructionsTe?: string[];
  nutrition: StructuredNutritionRecord;
  image: string;
  tags: string[];
  pcosBenefits: string;
  pcosBenefitsTe?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyNutritionLog {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  consumed: StructuredNutritionRecord;
  targets: StructuredNutritionRecord;
  completedMeals: {
    mealSlot: string;
    recipeId: string;
    recipeName: string;
    calories: number;
    loggedAt: string;
  }[];
  lastUpdated: string;
}

export type NotificationType =
  | 'assessment'
  | 'high_risk'
  | 'appointment_booked'
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_completed'
  | 'doctor_verification'
  | 'report_shared'
  | 'consultation_update';

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  titleTe?: string;
  message: string;
  messageTe?: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ==========================================
// AI FOOD SCAN & PCOS GLYCEMIC INDEX TYPES
// ==========================================

export type FoodRiskLevel = 'Low' | 'Moderate' | 'Elevated';

export interface FoodRiskEstimation {
  riskLevel: FoodRiskLevel;
  riskScore: number; // 0 - 100 (<= 35 Low Risk, 36-65 Moderate Risk, >65 Elevated Risk)
  riskTitle: string;
  riskTitleTe?: string;
  riskExplanation: string;
  riskExplanationTe?: string;
  glycemicSurgeRisk: 'Low' | 'Moderate' | 'High';
  insulinSpikeProbability: 'Low' | 'Moderate' | 'High';
  metabolicBufferRating: 'High Buffer' | 'Moderate Buffer' | 'Low Buffer';
  mitigatingFactors: string[];
}

export interface FoodScanGlycemicIndex {
  rating: 'Low' | 'Medium' | 'High';
  valueEstimate: string;
  glycemicLoad: 'Low' | 'Medium' | 'High';
  glEstimate: string;
  bloodSugarImpact: string;
}

export interface FoodScanPCOSSuitability {
  rating: 'Optimal' | 'Moderate' | 'Caution' | 'Not Recommended';
  score: number; // 1 - 10
  badge: string;
  summary: string;
  insulinResistanceImpact: string;
  androgenAndOvaryImpact: string;
  antiInflammatoryScore: 'High' | 'Moderate' | 'Low' | 'Pro-Inflammatory';
  antiInflammatoryDetails?: string;
  gutHealthAndFiber: string;
}

export interface FoodScanNutrition {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  fiberG: number;
  netCarbsG: number;
  macroPercentages?: {
    protein: number; // e.g. 20%
    carbs: number;   // e.g. 50%
    fat: number;     // e.g. 30%
  };
  macroBreakdownSummary?: string;
  macroBreakdownSummaryTe?: string;
}

export interface FoodScanClinicalTweak {
  tweak: string;
  benefit: string;
}

export interface FoodScanResult {
  id: string;
  isFood: boolean;
  detectedNonFoodType?: string | null;
  rejectionMessage?: string | null;
  dishName?: string | null;
  cuisine?: string | null;
  ingredientsIdentified?: string[];
  servingSizeEstimate?: string | null;
  foodRisk?: FoodRiskEstimation | null;
  glycemicIndex?: FoodScanGlycemicIndex | null;
  pcosSuitability?: FoodScanPCOSSuitability | null;
  estimatedNutrition?: FoodScanNutrition | null;
  clinicalTweaks?: FoodScanClinicalTweak[];
  suggestedPairings?: string[];
  confidenceScore?: number;
  analyzedAt: string;
  imagePreviewUrl?: string;
  source?: string;
}

// ==========================================
// WHATSAPP AUTOMATION & ENGAGEMENT TYPES
// ==========================================

export interface WhatsAppNotificationPreferences {
  symptom_reminders: boolean;
  food_awareness: boolean;
  exercise_reminders: boolean;
  appointment_reminders: boolean;
  general_education?: boolean;
}

export interface UserWhatsAppConsent {
  userId: string;
  whatsapp_opt_in: boolean;
  phone_number: string;
  preferred_language: 'en' | 'te';
  notification_preferences: WhatsAppNotificationPreferences;
  opt_in_timestamp?: string;
  opt_out_timestamp?: string;
  weekly_message_count?: number;
  last_message_sent_at?: string;
}

export type WhatsAppMessageType =
  | 'PCOS Awareness'
  | 'Food Awareness'
  | 'Exercise Reminder'
  | 'Symptom Tracking'
  | 'Appointment Reminder'
  | 'General Education';

export type WhatsAppCampaignStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Paused'
  | 'Completed';

export interface WhatsAppCampaign {
  id: string;
  campaign_name: string;
  target_audience: string;
  language: 'en' | 'te' | 'both';
  message_type: WhatsAppMessageType;
  message_content: string;
  message_content_te?: string;
  schedule: string; // e.g. "Immediately", "Daily 9:00 AM", "Weekly (Mondays)"
  start_date: string;
  end_date: string;
  status: WhatsAppCampaignStatus;
  created_at: string;
  updated_at: string;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    replies: number;
  };
}

export interface WhatsAppMessageLog {
  id: string;
  userId?: string;
  phoneNumber: string;
  recipientName?: string;
  campaignId?: string;
  campaignName?: string;
  messageType: WhatsAppMessageType | 'Incoming Query' | 'System Opt-Out' | 'Food Summary';
  content: string;
  language: 'en' | 'te';
  direction: 'outbound' | 'inbound';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  whatsappMessageId?: string;
  timestamp: string;
  error?: string;
  intentDetected?: string;
}

export interface WhatsAppAutomationStats {
  totalOptedInUsers: number;
  totalMessagesSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalReplies: number;
  appointmentRequests: number;
  deliveryRate: number; // percentage e.g. 96.2
  readRate: number;     // percentage e.g. 84.1
  replyRate: number;    // percentage e.g. 18.5
  dailyTrends: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    replies: number;
  }[];
}

export interface WhatsAppConfigSettings {
  max_messages_per_user_weekly: number;
  business_phone_number_id: string;
  business_account_id: string;
  verify_token: string;
  is_live_api_configured: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // "21:00"
  quiet_hours_end: string;   // "08:00"
}
