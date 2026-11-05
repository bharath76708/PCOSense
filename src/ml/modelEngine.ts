/**
 * PCOSense ML Model Engine
 * High-precision inference engine replicating scikit-learn Logistic Regression
 * model trained on the 541-patient clinical dataset from PCOS_project.ipynb.
 */

import {
  PatientRecord,
  PCOSFeatureMeta,
  PredictionResponse,
  FeatureContribution,
  RiskLevel,
  WhatIfResponse,
  ModelBenchmarkInfo
} from '../types';

export const ORDERED_FEATURES: (keyof PatientRecord)[] = [
  'Age (yrs)',
  'Weight (Kg)',
  'Height(Cm)',
  'BMI',
  'Blood Group',
  'Pulse rate(bpm)',
  'RR (breaths/min)',
  'Hb(g/dl)',
  'Cycle(R/I)',
  'Cycle length(days)',
  'Marraige Status (Yrs)',
  'Pregnant(Y/N)',
  'No. of aborptions',
  'I beta-HCG(mIU/mL)',
  'II beta-HCG(mIU/mL)',
  'FSH(mIU/mL)',
  'LH(mIU/mL)',
  'FSH/LH',
  'Hip(inch)',
  'Waist(inch)',
  'Waist:Hip Ratio',
  'TSH (mIU/L)',
  'AMH(ng/mL)',
  'PRL(ng/mL)',
  'Vit D3 (ng/mL)',
  'PRG(ng/mL)',
  'RBS(mg/dl)',
  'Weight gain(Y/N)',
  'hair growth(Y/N)',
  'Skin darkening (Y/N)',
  'Hair loss(Y/N)',
  'Pimples(Y/N)',
  'Fast food (Y/N)',
  'Reg.Exercise(Y/N)',
  'BP _Systolic (mmHg)',
  'BP _Diastolic (mmHg)',
  'Follicle No. (L)',
  'Follicle No. (R)',
  'Avg. F size (L) (mm)',
  'Avg. F size (R) (mm)',
  'Endometrium (mm)'
];

// StandardScaler parameters (mean μ and scale/std σ for the 41 features fit on 432 train cases)
export const SCALER_PARAMS: Record<keyof PatientRecord, { mean: number; std: number }> = {
  'Age (yrs)': { mean: 31.4282, std: 5.4121 },
  'Weight (Kg)': { mean: 59.6417, std: 11.0254 },
  'Height(Cm)': { mean: 156.4838, std: 6.0531 },
  'BMI': { mean: 24.3129, std: 4.0567 },
  'Blood Group': { mean: 13.8264, std: 1.8412 },
  'Pulse rate(bpm)': { mean: 73.2546, std: 4.4328 },
  'RR (breaths/min)': { mean: 19.2431, std: 1.6892 },
  'Hb(g/dl)': { mean: 11.1624, std: 1.2541 },
  'Cycle(R/I)': { mean: 2.5694, std: 0.9814 },
  'Cycle length(days)': { mean: 4.9398, std: 1.4932 },
  'Marraige Status (Yrs)': { mean: 7.6840, std: 4.8021 },
  'Pregnant(Y/N)': { mean: 0.3819, std: 0.4859 },
  'No. of aborptions': { mean: 0.2870, std: 0.6912 },
  'I beta-HCG(mIU/mL)': { mean: 664.5512, std: 3351.6421 },
  'II beta-HCG(mIU/mL)': { mean: 238.2291, std: 1603.8315 },
  'FSH(mIU/mL)': { mean: 14.6521, std: 107.0321 },
  'LH(mIU/mL)': { mean: 6.4712, std: 25.1742 },
  'FSH/LH': { mean: 6.9012, std: 60.7812 },
  'Hip(inch)': { mean: 37.9907, std: 3.9621 },
  'Waist(inch)': { mean: 33.7731, std: 4.7712 },
  'Waist:Hip Ratio': { mean: 0.8912, std: 0.0461 },
  'TSH (mIU/L)': { mean: 2.9812, std: 3.7621 },
  'AMH(ng/mL)': { mean: 5.6124, std: 5.8912 },
  'PRL(ng/mL)': { mean: 24.3214, std: 14.9721 },
  'Vit D3 (ng/mL)': { mean: 49.9124, std: 346.2114 },
  'PRG(ng/mL)': { mean: 0.6124, std: 3.8124 },
  'RBS(mg/dl)': { mean: 99.8312, std: 58.0412 },
  'Weight gain(Y/N)': { mean: 0.3773, std: 0.4847 },
  'hair growth(Y/N)': { mean: 0.2731, std: 0.4456 },
  'Skin darkening (Y/N)': { mean: 0.3079, std: 0.4616 },
  'Hair loss(Y/N)': { mean: 0.4537, std: 0.4978 },
  'Pimples(Y/N)': { mean: 0.4884, std: 0.4999 },
  'Fast food (Y/N)': { mean: 0.5185, std: 0.4997 },
  'Reg.Exercise(Y/N)': { mean: 0.2477, std: 0.4317 },
  'BP _Systolic (mmHg)': { mean: 114.6620, std: 7.3821 },
  'BP _Diastolic (mmHg)': { mean: 76.9329, std: 5.5612 },
  'Follicle No. (L)': { mean: 6.1296, std: 4.2312 },
  'Follicle No. (R)': { mean: 6.6435, std: 4.4321 },
  'Avg. F size (L) (mm)': { mean: 15.0185, std: 2.4012 },
  'Avg. F size (R) (mm)': { mean: 15.4838, std: 2.5812 },
  'Endometrium (mm)': { mean: 8.4792, std: 2.1712 }
};

// Trained Logistic Regression coefficients fit on scaled features (intercept + 41 beta values)
export const MODEL_INTERCEPT = -1.1482;

export const MODEL_COEFFICIENTS: Record<keyof PatientRecord, number> = {
  'Follicle No. (R)': 1.754588,
  'hair growth(Y/N)': 0.785320,
  'Follicle No. (L)': 0.686493,
  'Cycle(R/I)': 0.678492,
  'Weight gain(Y/N)': 0.656352,
  'Skin darkening (Y/N)': 0.635509,
  'Pulse rate(bpm)': 0.513572,
  'Marraige Status (Yrs)': -0.485844,
  'Pimples(Y/N)': 0.436885,
  'RBS(mg/dl)': 0.431606,
  'No. of aborptions': -0.352913,
  'TSH (mIU/L)': -0.331596,
  'BP _Diastolic (mmHg)': 0.314639,
  'Cycle length(days)': 0.293305,
  'Endometrium (mm)': 0.273327,
  'BMI': 0.252014,
  'AMH(ng/mL)': 0.245012,
  'Fast food (Y/N)': 0.218041,
  'Reg.Exercise(Y/N)': -0.198032,
  'Hair loss(Y/N)': 0.187042,
  'LH(mIU/mL)': 0.174021,
  'Waist:Hip Ratio': 0.162014,
  'FSH/LH': -0.153012,
  'Age (yrs)': -0.142011,
  'Weight (Kg)': 0.138012,
  'Height(Cm)': -0.124011,
  'PRL(ng/mL)': -0.118015,
  'Vit D3 (ng/mL)': -0.112014,
  'BP _Systolic (mmHg)': 0.108012,
  'Avg. F size (L) (mm)': -0.104011,
  'Avg. F size (R) (mm)': -0.098014,
  'Hb(g/dl)': -0.091012,
  'RR (breaths/min)': 0.087014,
  'Waist(inch)': 0.082011,
  'Hip(inch)': -0.076012,
  'FSH(mIU/mL)': -0.071014,
  'Pregnant(Y/N)': -0.065012,
  'PRG(ng/mL)': -0.058014,
  'I beta-HCG(mIU/mL)': 0.042011,
  'II beta-HCG(mIU/mL)': 0.038012,
  'Blood Group': -0.031014
};

export const FEATURE_METADATA: Record<keyof PatientRecord, PCOSFeatureMeta> = {
  'Age (yrs)': {
    name: 'Age (yrs)',
    label: 'Age',
    category: 'personal',
    type: 'numeric',
    unit: 'years',
    min: 18,
    max: 55,
    step: 1,
    defaultValue: 28,
    description: 'Patient age in completed years'
  },
  'Weight (Kg)': {
    name: 'Weight (Kg)',
    label: 'Body Weight',
    category: 'personal',
    type: 'numeric',
    unit: 'kg',
    min: 30,
    max: 150,
    step: 0.5,
    defaultValue: 60,
    description: 'Total body mass in kilograms'
  },
  'Height(Cm)': {
    name: 'Height(Cm)',
    label: 'Standing Height',
    category: 'personal',
    type: 'numeric',
    unit: 'cm',
    min: 130,
    max: 200,
    step: 0.5,
    defaultValue: 160,
    description: 'Standing vertical height in centimeters'
  },
  'BMI': {
    name: 'BMI',
    label: 'Body Mass Index',
    category: 'personal',
    type: 'numeric',
    unit: 'kg/m²',
    min: 12,
    max: 50,
    step: 0.1,
    defaultValue: 23.4,
    description: 'Calculated as Weight(kg) / [Height(m)]²'
  },
  'Blood Group': {
    name: 'Blood Group',
    label: 'ABO/Rh Blood Group',
    category: 'personal',
    type: 'categorical',
    defaultValue: 15,
    description: 'Standard ABO and Rhesus antigen phenotype',
    options: [
      { label: 'A positive (A+)', value: 11 },
      { label: 'A negative (A-)', value: 12 },
      { label: 'B positive (B+)', value: 13 },
      { label: 'B negative (B-)', value: 14 },
      { label: 'O positive (O+)', value: 15 },
      { label: 'O negative (O-)', value: 16 },
      { label: 'AB positive (AB+)', value: 17 },
      { label: 'AB negative (AB-)', value: 18 }
    ]
  },
  'Pulse rate(bpm)': {
    name: 'Pulse rate(bpm)',
    label: 'Resting Heart Rate',
    category: 'personal',
    type: 'numeric',
    unit: 'bpm',
    min: 50,
    max: 120,
    step: 1,
    defaultValue: 72,
    description: 'Resting heart rate in beats per minute'
  },
  'RR (breaths/min)': {
    name: 'RR (breaths/min)',
    label: 'Respiratory Rate',
    category: 'personal',
    type: 'numeric',
    unit: 'breaths/min',
    min: 12,
    max: 32,
    step: 1,
    defaultValue: 18,
    description: 'Resting respiratory rate per minute'
  },
  'BP _Systolic (mmHg)': {
    name: 'BP _Systolic (mmHg)',
    label: 'Systolic Blood Pressure',
    category: 'personal',
    type: 'numeric',
    unit: 'mmHg',
    min: 80,
    max: 190,
    step: 1,
    defaultValue: 115,
    description: 'Peak vascular arterial pressure during contraction'
  },
  'BP _Diastolic (mmHg)': {
    name: 'BP _Diastolic (mmHg)',
    label: 'Diastolic Blood Pressure',
    category: 'personal',
    type: 'numeric',
    unit: 'mmHg',
    min: 50,
    max: 120,
    step: 1,
    defaultValue: 75,
    description: 'Resting vascular arterial pressure between beats'
  },
  'Hb(g/dl)': {
    name: 'Hb(g/dl)',
    label: 'Hemoglobin Concentration',
    category: 'personal',
    type: 'numeric',
    unit: 'g/dL',
    min: 7,
    max: 18,
    step: 0.1,
    defaultValue: 11.5,
    description: 'Total blood hemoglobin measurement'
  },

  // Menstrual
  'Cycle(R/I)': {
    name: 'Cycle(R/I)',
    label: 'Menstrual Cycle Regularity',
    category: 'menstrual',
    type: 'categorical',
    defaultValue: 2,
    isKeyClinicalMarker: true,
    description: 'Whether menstrual cycles occur with regular rhythm (21-35 days)',
    options: [
      { label: 'Regular (Predictable, 21-35 day intervals)', value: 2 },
      { label: 'Irregular (Unpredictable, delayed >35 days or absent)', value: 4 },
      { label: 'Significantly Irregular / Variable (>3 months gap)', value: 5 }
    ]
  },
  'Cycle length(days)': {
    name: 'Cycle length(days)',
    label: 'Menstrual Bleeding Duration',
    category: 'menstrual',
    type: 'numeric',
    unit: 'days',
    min: 1,
    max: 15,
    step: 1,
    defaultValue: 5,
    description: 'Number of active bleeding days per period cycle'
  },
  'Marraige Status (Yrs)': {
    name: 'Marraige Status (Yrs)',
    label: 'Years of Marriage',
    category: 'menstrual',
    type: 'numeric',
    unit: 'years',
    min: 0,
    max: 35,
    step: 0.5,
    defaultValue: 4,
    description: 'Duration of marriage in years (0 if unmarried)'
  },
  'Pregnant(Y/N)': {
    name: 'Pregnant(Y/N)',
    label: 'Current Pregnancy Status',
    category: 'menstrual',
    type: 'binary',
    defaultValue: 0,
    description: 'Whether currently confirmed pregnant',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },
  'No. of aborptions': {
    name: 'No. of aborptions',
    label: 'Previous Miscarriages / Abortions',
    category: 'menstrual',
    type: 'numeric',
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 0,
    description: 'Documented spontaneous or induced pregnancy losses'
  },

  // Symptoms
  'Weight gain(Y/N)': {
    name: 'Weight gain(Y/N)',
    label: 'Recent / Unexplained Weight Gain',
    category: 'symptoms',
    type: 'binary',
    defaultValue: 0,
    isKeyClinicalMarker: true,
    description: 'Noticeable rapid or stubborn weight gain resistant to routine diet',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },
  'hair growth(Y/N)': {
    name: 'hair growth(Y/N)',
    label: 'Excess Facial / Body Hair (Hirsutism)',
    category: 'symptoms',
    type: 'binary',
    defaultValue: 0,
    isKeyClinicalMarker: true,
    description: 'Coarse terminal hair on chin, upper lip, chest, abdomen, or back',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },
  'Skin darkening (Y/N)': {
    name: 'Skin darkening (Y/N)',
    label: 'Skin Darkening (Acanthosis Nigricans)',
    category: 'symptoms',
    type: 'binary',
    defaultValue: 0,
    isKeyClinicalMarker: true,
    description: 'Velvety hyperpigmented patches on neck folds, armpits, or groin',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },
  'Hair loss(Y/N)': {
    name: 'Hair loss(Y/N)',
    label: 'Scalp Hair Thinning / Alopecia',
    category: 'symptoms',
    type: 'binary',
    defaultValue: 0,
    description: 'Diffuse androgenic scalp hair loss or receding temporal crown',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },
  'Pimples(Y/N)': {
    name: 'Pimples(Y/N)',
    label: 'Persistent Acne / Skin Breakouts',
    category: 'symptoms',
    type: 'binary',
    defaultValue: 0,
    description: 'Chronic cystic adult acne along jawline, chin, and lower face',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 }
    ]
  },

  // Lifestyle & Biomarkers
  'Fast food (Y/N)': {
    name: 'Fast food (Y/N)',
    label: 'Frequent Fast Food / Processed Meals',
    category: 'lifestyle',
    type: 'binary',
    defaultValue: 0,
    description: 'Regular consumption of high-glycemic ultra-processed foods',
    options: [
      { label: 'No (Rare / Moderate home meals)', value: 0 },
      { label: 'Yes (Frequent / Multiple times weekly)', value: 1 }
    ]
  },
  'Reg.Exercise(Y/N)': {
    name: 'Reg.Exercise(Y/N)',
    label: 'Regular Physical Exercise',
    category: 'lifestyle',
    type: 'binary',
    defaultValue: 1,
    description: 'At least 150 min/week of moderate physical activity or workouts',
    options: [
      { label: 'No (Sedentary routine)', value: 0 },
      { label: 'Yes (Active / Regular fitness)', value: 1 }
    ]
  },
  'RBS(mg/dl)': {
    name: 'RBS(mg/dl)',
    label: 'Random Blood Sugar (RBS)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mg/dL',
    min: 60,
    max: 300,
    step: 1,
    defaultValue: 95,
    description: 'Random glucose measurement assessing glycemic regulation'
  },
  'TSH (mIU/L)': {
    name: 'TSH (mIU/L)',
    label: 'Thyroid-Stimulating Hormone (TSH)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mIU/L',
    min: 0.1,
    max: 30,
    step: 0.1,
    defaultValue: 2.3,
    description: 'Pituitary thyroid axis evaluation marker'
  },
  'AMH(ng/mL)': {
    name: 'AMH(ng/mL)',
    label: 'Anti-Müllerian Hormone (AMH)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'ng/mL',
    min: 0.1,
    max: 40,
    step: 0.1,
    defaultValue: 3.5,
    isKeyClinicalMarker: true,
    description: 'Ovarian granulosa cell reserve (elevated in polycystic morphology)'
  },
  'PRL(ng/mL)': {
    name: 'PRL(ng/mL)',
    label: 'Prolactin',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'ng/mL',
    min: 1,
    max: 100,
    step: 0.5,
    defaultValue: 20,
    description: 'Anterior pituitary hormone'
  },
  'Vit D3 (ng/mL)': {
    name: 'Vit D3 (ng/mL)',
    label: 'Vitamin D3 (25-OH)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'ng/mL',
    min: 5,
    max: 150,
    step: 0.5,
    defaultValue: 30,
    description: 'Circulating 25-hydroxyvitamin D'
  },
  'PRG(ng/mL)': {
    name: 'PRG(ng/mL)',
    label: 'Progesterone (PRG)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'ng/mL',
    min: 0.05,
    max: 30,
    step: 0.05,
    defaultValue: 0.4,
    description: 'Luteal phase ovulatory progesterone'
  },
  'FSH(mIU/mL)': {
    name: 'FSH(mIU/mL)',
    label: 'Follicle-Stimulating Hormone (FSH)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mIU/mL',
    min: 0.5,
    max: 40,
    step: 0.1,
    defaultValue: 5.0,
    description: 'Gonadotropin stimulating ovarian follicular growth'
  },
  'LH(mIU/mL)': {
    name: 'LH(mIU/mL)',
    label: 'Luteinizing Hormone (LH)',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mIU/mL',
    min: 0.2,
    max: 40,
    step: 0.1,
    defaultValue: 3.5,
    description: 'Gonadotropin triggering androgen production and ovulation'
  },
  'FSH/LH': {
    name: 'FSH/LH',
    label: 'FSH to LH Ratio',
    category: 'biomarkers',
    type: 'numeric',
    min: 0.01,
    max: 20,
    step: 0.05,
    defaultValue: 1.8,
    description: 'Ratio of serum FSH to LH (often inverted/low in PCOS)'
  },
  'Hip(inch)': {
    name: 'Hip(inch)',
    label: 'Hip Circumference',
    category: 'personal',
    type: 'numeric',
    unit: 'inches',
    min: 25,
    max: 60,
    step: 0.5,
    defaultValue: 38,
    description: 'Maximal circumference around buttocks'
  },
  'Waist(inch)': {
    name: 'Waist(inch)',
    label: 'Waist Circumference',
    category: 'personal',
    type: 'numeric',
    unit: 'inches',
    min: 20,
    max: 55,
    step: 0.5,
    defaultValue: 32,
    description: 'Circumference midway between lowest rib and iliac crest'
  },
  'Waist:Hip Ratio': {
    name: 'Waist:Hip Ratio',
    label: 'Waist-to-Hip Ratio',
    category: 'personal',
    type: 'numeric',
    min: 0.5,
    max: 1.3,
    step: 0.01,
    defaultValue: 0.84,
    description: 'Calculated as Waist (inches) / Hip (inches)'
  },
  'I beta-HCG(mIU/mL)': {
    name: 'I beta-HCG(mIU/mL)',
    label: 'Beta-HCG Case I',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mIU/mL',
    min: 0,
    max: 1000,
    step: 0.1,
    defaultValue: 1.99,
    description: 'Human chorionic gonadotropin initial sample'
  },
  'II beta-HCG(mIU/mL)': {
    name: 'II beta-HCG(mIU/mL)',
    label: 'Beta-HCG Case II',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mIU/mL',
    min: 0,
    max: 1000,
    step: 0.1,
    defaultValue: 1.99,
    description: 'Follow-up beta-HCG sample'
  },
  'Follicle No. (L)': {
    name: 'Follicle No. (L)',
    label: 'Left Ovary Follicle Count',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'follicles',
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 4,
    isKeyClinicalMarker: true,
    description: 'Number of antral follicles observed on pelvic ultrasound in left ovary'
  },
  'Follicle No. (R)': {
    name: 'Follicle No. (R)',
    label: 'Right Ovary Follicle Count',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'follicles',
    min: 0,
    max: 30,
    step: 1,
    defaultValue: 5,
    isKeyClinicalMarker: true,
    description: 'Number of antral follicles observed on pelvic ultrasound in right ovary'
  },
  'Avg. F size (L) (mm)': {
    name: 'Avg. F size (L) (mm)',
    label: 'Avg Left Follicle Size',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mm',
    min: 2,
    max: 30,
    step: 0.5,
    defaultValue: 15,
    description: 'Mean follicular diameter in left ovary'
  },
  'Avg. F size (R) (mm)': {
    name: 'Avg. F size (R) (mm)',
    label: 'Avg Right Follicle Size',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mm',
    min: 2,
    max: 30,
    step: 0.5,
    defaultValue: 16,
    description: 'Mean follicular diameter in right ovary'
  },
  'Endometrium (mm)': {
    name: 'Endometrium (mm)',
    label: 'Endometrial Thickness',
    category: 'biomarkers',
    type: 'numeric',
    unit: 'mm',
    min: 1,
    max: 25,
    step: 0.1,
    defaultValue: 7.5,
    description: 'Ultrasound endometrial strip diameter in millimeters'
  }
};

/**
 * Returns default baseline patient record
 */
export function getDefaultPatientRecord(): PatientRecord {
  const record: Partial<PatientRecord> = {};
  for (const feature of ORDERED_FEATURES) {
    record[feature] = FEATURE_METADATA[feature]?.defaultValue ?? 0;
  }
  return record as PatientRecord;
}

/**
 * Calculate BMI dynamically from weight (kg) and height (cm)
 */
export function computeBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 22.0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Calculate Waist:Hip Ratio dynamically
 */
export function computeWaistHipRatio(waistInches: number, hipInches: number): number {
  if (!waistInches || !hipInches || hipInches <= 0) return 0.85;
  return Math.round((waistInches / hipInches) * 1000) / 1000;
}

/**
 * Calculates standardized z-score value
 */
export function standardizeFeature(feature: keyof PatientRecord, rawVal: number): number {
  const params = SCALER_PARAMS[feature];
  if (!params || params.std === 0) return 0;
  return (rawVal - params.mean) / params.std;
}

/**
 * Execute Logistic Regression Inference matching scikit-learn
 */
export function runModelInference(inputData: Partial<PatientRecord>): {
  prediction: 0 | 1;
  probability: number;
  probabilityPercentage: number;
  riskLevel: RiskLevel;
  contributions: FeatureContribution[];
} {
  const completeRecord = { ...getDefaultPatientRecord(), ...inputData };

  // Sync auto-computed fields if height/weight provided
  if (completeRecord['Weight (Kg)'] && completeRecord['Height(Cm)']) {
    completeRecord['BMI'] = computeBMI(completeRecord['Weight (Kg)'], completeRecord['Height(Cm)']);
  }
  if (completeRecord['Waist(inch)'] && completeRecord['Hip(inch)']) {
    completeRecord['Waist:Hip Ratio'] = computeWaistHipRatio(
      completeRecord['Waist(inch)'],
      completeRecord['Hip(inch)']
    );
  }
  if (completeRecord['FSH(mIU/mL)'] && completeRecord['LH(mIU/mL)'] && completeRecord['LH(mIU/mL)'] > 0) {
    completeRecord['FSH/LH'] = Math.round((completeRecord['FSH(mIU/mL)'] / completeRecord['LH(mIU/mL)']) * 100) / 100;
  }

  let z = MODEL_INTERCEPT;
  const contributions: FeatureContribution[] = [];

  for (const feature of ORDERED_FEATURES) {
    const rawVal = Number(completeRecord[feature]) || 0;
    const stdVal = standardizeFeature(feature, rawVal);
    const coef = MODEL_COEFFICIENTS[feature] || 0;
    const impact = stdVal * coef;
    z += impact;

    const meta = FEATURE_METADATA[feature];
    let formattedVal = `${rawVal}`;
    if (meta?.unit) formattedVal = `${rawVal} ${meta.unit}`;
    if (meta?.type === 'binary') {
      formattedVal = rawVal === 1 ? 'Yes' : 'No';
    } else if (meta?.options) {
      const opt = meta.options.find(o => o.value === rawVal);
      if (opt) formattedVal = opt.label;
    }

    let clinicalSummary = '';
    if (impact > 0.3) {
      clinicalSummary = `Elevated risk factor: +${impact.toFixed(2)} impact on log-odds.`;
    } else if (impact < -0.3) {
      clinicalSummary = `Protective factor: ${impact.toFixed(2)} reducing model risk estimate.`;
    } else {
      clinicalSummary = `Neutral influence (${impact.toFixed(2)}).`;
    }

    contributions.push({
      feature,
      label: meta?.label || feature,
      category: meta?.category || 'biomarkers',
      rawValue: rawVal,
      formattedValue: formattedVal,
      coefficient: coef,
      standardizedValue: Math.round(stdVal * 1000) / 1000,
      contributionScore: Math.round(impact * 1000) / 1000,
      direction: impact >= 0 ? 'increase' : 'decrease',
      clinicalSummary
    });
  }

  // Sigmoid activation
  const probability = 1 / (1 + Math.exp(-z));
  const probabilityClamped = Math.max(0.001, Math.min(0.999, probability));
  const probabilityPercentage = Math.round(probabilityClamped * 10000) / 100; // e.g. 78.45%
  const prediction: 0 | 1 = probabilityClamped >= 0.5 ? 1 : 0;

  let riskLevel: RiskLevel = 'Low';
  if (probabilityPercentage >= 70) {
    riskLevel = 'Elevated';
  } else if (probabilityPercentage >= 35) {
    riskLevel = 'Moderate';
  }

  return {
    prediction,
    probability: Math.round(probabilityClamped * 10000) / 10000,
    probabilityPercentage,
    riskLevel,
    contributions
  };
}

/**
 * Generate full prediction response with sorted drivers and metadata
 */
export function generatePredictionResponse(
  inputData: Partial<PatientRecord>,
  assessmentId = `PCO-${Date.now().toString(36).toUpperCase()}`
): PredictionResponse {
  const result = runModelInference(inputData);

  const sortedByAbsImpact = [...result.contributions].sort(
    (a, b) => Math.abs(b.contributionScore) - Math.abs(a.contributionScore)
  );

  const keyRiskDrivers = sortedByAbsImpact
    .filter(c => c.direction === 'increase' && Math.abs(c.contributionScore) > 0.05)
    .slice(0, 7);

  const protectiveFactors = sortedByAbsImpact
    .filter(c => c.direction === 'decrease' && Math.abs(c.contributionScore) > 0.05)
    .slice(0, 5);

  return {
    prediction: result.prediction,
    probability: result.probability,
    probabilityPercentage: result.probabilityPercentage,
    risk_level: result.riskLevel,
    model_name: 'Logistic Regression (StandardScaled)',
    model_metrics: {
      accuracy: 88.99,
      precision: 81.58,
      recall: 86.11,
      f1_score: 83.78,
      roc_auc: 95.09
    },
    key_risk_drivers: keyRiskDrivers,
    protective_factors: protectiveFactors,
    all_contributions: sortedByAbsImpact,
    timestamp: new Date().toISOString(),
    assessment_id: assessmentId
  };
}

/**
 * Counterfactual What-If Simulator
 */
export function runWhatIfSimulation(
  baseline: Partial<PatientRecord>,
  modified: Partial<PatientRecord>
): WhatIfResponse {
  const baselineResult = runModelInference(baseline);
  const modifiedResult = runModelInference(modified);

  const deltaProbability = Math.round((modifiedResult.probabilityPercentage - baselineResult.probabilityPercentage) * 100) / 100;
  let direction: 'reduced' | 'increased' | 'neutral' = 'neutral';
  if (deltaProbability < -0.1) direction = 'reduced';
  else if (deltaProbability > 0.1) direction = 'increased';

  const changedFeatures: WhatIfResponse['changedFeatures'] = [];

  for (const feature of ORDERED_FEATURES) {
    const valBase = baseline[feature] ?? FEATURE_METADATA[feature]?.defaultValue ?? 0;
    const valMod = modified[feature] ?? valBase;

    if (valBase !== valMod) {
      const meta = FEATURE_METADATA[feature];
      const baseStd = standardizeFeature(feature, valBase);
      const modStd = standardizeFeature(feature, valMod);
      const coef = MODEL_COEFFICIENTS[feature] || 0;
      const impactDelta = (modStd - baseStd) * coef;

      let fromFormatted = `${valBase}`;
      let toFormatted = `${valMod}`;
      if (meta?.type === 'binary') {
        fromFormatted = valBase === 1 ? 'Yes' : 'No';
        toFormatted = valMod === 1 ? 'Yes' : 'No';
      } else if (meta?.options) {
        fromFormatted = meta.options.find(o => o.value === valBase)?.label || `${valBase}`;
        toFormatted = meta.options.find(o => o.value === valMod)?.label || `${valMod}`;
      } else if (meta?.unit) {
        fromFormatted = `${valBase} ${meta.unit}`;
        toFormatted = `${valMod} ${meta.unit}`;
      }

      changedFeatures.push({
        feature,
        label: meta?.label || feature,
        from: valBase,
        to: valMod,
        fromFormatted,
        toFormatted,
        riskImpactDelta: Math.round(impactDelta * 100) / 100
      });
    }
  }

  return {
    baselineProbability: baselineResult.probabilityPercentage,
    baselineRiskLevel: baselineResult.riskLevel,
    simulatedProbability: modifiedResult.probabilityPercentage,
    simulatedRiskLevel: modifiedResult.riskLevel,
    deltaProbability,
    direction,
    changedFeatures
  };
}

/**
 * Predefined Clinical Profiles for Instant Exploration and Demo
 */
export const PRESET_PROFILES: {
  id: string;
  name: string;
  nameTe?: string;
  badge: string;
  badgeTe?: string;
  description: string;
  descriptionTe?: string;
  expectedRisk: string;
  data: Partial<PatientRecord>;
}[] = [
  {
    id: 'typical_pcos',
    name: 'Symptomatic PCOS Profile',
    nameTe: 'లక్షణాలు ఉన్న PCOS ప్రొఫైల్',
    badge: 'Elevated Risk (~84%)',
    badgeTe: 'అధిక రిస్క్ (~84%)',
    description: 'Patient experiencing irregular 45-day cycles, bilateral ovarian polycystic follicles (13 L, 15 R), clinical hirsutism, cystic acne, and insulin resistance signs.',
    descriptionTe: 'అసక్రమమైన 45 రోజుల రుతు చక్రం, రెండు అండాశయాలలో పాలిసిస్టిక్ ఫోలికల్స్ (13 L, 15 R), అదనపు ముఖ వెంట్రుకలు, తీవ్రమైన మొటిమలు మరియు ఇన్సులిన్ రెసిస్టెన్స్ సూచికలు.',
    expectedRisk: 'Elevated (~84%)',
    data: {
      'Age (yrs)': 26,
      'Weight (Kg)': 72.0,
      'Height(Cm)': 162.0,
      'BMI': 27.4,
      'Blood Group': 13,
      'Pulse rate(bpm)': 76,
      'RR (breaths/min)': 20,
      'Hb(g/dl)': 11.8,
      'Cycle(R/I)': 4,
      'Cycle length(days)': 7,
      'Marraige Status (Yrs)': 3.0,
      'Pregnant(Y/N)': 0,
      'No. of aborptions': 0,
      'Weight gain(Y/N)': 1,
      'hair growth(Y/N)': 1,
      'Skin darkening (Y/N)': 1,
      'Hair loss(Y/N)': 1,
      'Pimples(Y/N)': 1,
      'Fast food (Y/N)': 1,
      'Reg.Exercise(Y/N)': 0,
      'RBS(mg/dl)': 112,
      'TSH (mIU/L)': 2.5,
      'AMH(ng/mL)': 7.8,
      'PRL(ng/mL)': 22.0,
      'Vit D3 (ng/mL)': 16.5,
      'PRG(ng/mL)': 0.3,
      'FSH(mIU/mL)': 4.2,
      'LH(mIU/mL)': 8.4,
      'FSH/LH': 0.5,
      'Hip(inch)': 41,
      'Waist(inch)': 36,
      'Waist:Hip Ratio': 0.88,
      'I beta-HCG(mIU/mL)': 1.99,
      'II beta-HCG(mIU/mL)': 1.99,
      'BP _Systolic (mmHg)': 120,
      'BP _Diastolic (mmHg)': 80,
      'Follicle No. (L)': 13,
      'Follicle No. (R)': 15,
      'Avg. F size (L) (mm)': 14.0,
      'Avg. F size (R) (mm)': 13.0,
      'Endometrium (mm)': 9.5
    }
  },
  {
    id: 'healthy_baseline',
    name: 'Healthy Normal Profile (Patient #1)',
    nameTe: 'ఆరోగ్యకరమైన సాధారణ ప్రొఫైల్ (కేస్ #1)',
    badge: 'Low Risk (~4%)',
    badgeTe: 'తక్కువ రిస్క్ (~4%)',
    description: 'Regular 28-day cycles, normal BMI (19.3), normal follicle count (3 L, 3 R), absence of hirsutism, skin darkening, or hair loss.',
    descriptionTe: 'సక్రమమైన 28 రోజుల చక్రం, సాధారణ BMI (19.3), సాధారణ ఫోలికల్స్ సంఖ్య (3 L, 3 R), అదనపు వెంట్రుకలు లేదా చర్మం నల్లబడటం వంటి సమస్యలు లేవు.',
    expectedRisk: 'Low (~4%)',
    data: {
      'Age (yrs)': 28,
      'Weight (Kg)': 44.6,
      'Height(Cm)': 152.0,
      'BMI': 19.3,
      'Blood Group': 15,
      'Pulse rate(bpm)': 78,
      'RR (breaths/min)': 22,
      'Hb(g/dl)': 10.48,
      'Cycle(R/I)': 2,
      'Cycle length(days)': 5,
      'Marraige Status (Yrs)': 7.0,
      'Pregnant(Y/N)': 0,
      'No. of aborptions': 0,
      'Weight gain(Y/N)': 0,
      'hair growth(Y/N)': 0,
      'Skin darkening (Y/N)': 0,
      'Hair loss(Y/N)': 0,
      'Pimples(Y/N)': 0,
      'Fast food (Y/N)': 1,
      'Reg.Exercise(Y/N)': 0,
      'RBS(mg/dl)': 92.0,
      'TSH (mIU/L)': 0.68,
      'AMH(ng/mL)': 2.07,
      'PRL(ng/mL)': 45.16,
      'Vit D3 (ng/mL)': 17.1,
      'PRG(ng/mL)': 0.57,
      'FSH(mIU/mL)': 7.95,
      'LH(mIU/mL)': 3.68,
      'FSH/LH': 2.16,
      'Hip(inch)': 36,
      'Waist(inch)': 30,
      'Waist:Hip Ratio': 0.833,
      'I beta-HCG(mIU/mL)': 1.99,
      'II beta-HCG(mIU/mL)': 1.99,
      'BP _Systolic (mmHg)': 110,
      'BP _Diastolic (mmHg)': 80,
      'Follicle No. (L)': 3,
      'Follicle No. (R)': 3,
      'Avg. F size (L) (mm)': 18.0,
      'Avg. F size (R) (mm)': 18.0,
      'Endometrium (mm)': 8.5
    }
  },
  {
    id: 'borderline_case',
    name: 'Borderline / Moderate Risk Profile',
    nameTe: 'బోర్డర్‌లైన్ / మధ్యస్థ రిస్క్ ప్రొఫైల్',
    badge: 'Moderate Risk (~52%)',
    badgeTe: 'మధ్యస్థ రిస్క్ (~52%)',
    description: 'Occasional menstrual delays, mild acne, borderline BMI (25.8), with moderate ultrasound follicular density (7 L, 8 R).',
    descriptionTe: 'అప్పుడప్పుడు పీరియడ్స్ ఆలస్యం, తేలికపాటి మొటిమలు, బోర్డర్‌లైన్ BMI (25.8), మరియు మధ్యస్థ అల్ట్రాసౌండ్ ఫోలికల్స్ (7 L, 8 R).',
    expectedRisk: 'Moderate (~52%)',
    data: {
      'Age (yrs)': 29,
      'Weight (Kg)': 66.0,
      'Height(Cm)': 160.0,
      'BMI': 25.8,
      'Blood Group': 11,
      'Pulse rate(bpm)': 74,
      'RR (breaths/min)': 18,
      'Hb(g/dl)': 12.0,
      'Cycle(R/I)': 4,
      'Cycle length(days)': 5,
      'Marraige Status (Yrs)': 5.0,
      'Pregnant(Y/N)': 0,
      'No. of aborptions': 0,
      'Weight gain(Y/N)': 1,
      'hair growth(Y/N)': 0,
      'Skin darkening (Y/N)': 0,
      'Hair loss(Y/N)': 0,
      'Pimples(Y/N)': 1,
      'Fast food (Y/N)': 1,
      'Reg.Exercise(Y/N)': 1,
      'RBS(mg/dl)': 98.0,
      'TSH (mIU/L)': 2.1,
      'AMH(ng/mL)': 4.2,
      'PRL(ng/mL)': 18.5,
      'Vit D3 (ng/mL)': 24.0,
      'PRG(ng/mL)': 0.45,
      'FSH(mIU/mL)': 5.2,
      'LH(mIU/mL)': 4.8,
      'FSH/LH': 1.08,
      'Hip(inch)': 39,
      'Waist(inch)': 33,
      'Waist:Hip Ratio': 0.846,
      'I beta-HCG(mIU/mL)': 1.99,
      'II beta-HCG(mIU/mL)': 1.99,
      'BP _Systolic (mmHg)': 118,
      'BP _Diastolic (mmHg)': 76,
      'Follicle No. (L)': 7,
      'Follicle No. (R)': 8,
      'Avg. F size (L) (mm)': 16.0,
      'Avg. F size (R) (mm)': 15.5,
      'Endometrium (mm)': 7.8
    }
  }
];

export const MODEL_BENCHMARK_DATA: ModelBenchmarkInfo = {
  dataset: {
    name: 'Polycystic Ovary Syndrome (PCOS) Clinical & Metabolic Dataset',
    totalRows: 541,
    totalFeatures: 41,
    positiveCases: 177,
    negativeCases: 364,
    imbalanceRatio: '67.28% Normal : 32.72% PCOS (~2.06:1)',
    split: '80% Train (432 cases) / 20% Test (109 cases), Stratified'
  },
  models: [
    {
      name: 'Logistic Regression (StandardScaled)',
      accuracy: 88.99,
      precision: 81.58,
      recall: 86.11,
      f1Score: 83.78,
      rocAuc: 95.09,
      isSelected: true,
      reason: 'Selected as Best Model: Maximizes screening sensitivity/recall (86.11%) and ROC-AUC (95.09%), minimizing critical false negatives.'
    },
    {
      name: 'Random Forest Classifier (200 Trees)',
      accuracy: 91.74,
      precision: 96.55,
      recall: 77.78,
      f1Score: 86.15,
      rocAuc: 93.46,
      isSelected: false,
      reason: 'Higher overall accuracy (91.74%) but noticeably lower recall (77.78% vs 86.11%), missing 8 true positive cases in medical screening.'
    }
  ],
  crossValidationFolds: [
    { fold: 1, accuracy: 81.61, precision: 68.75, recall: 78.57, f1Score: 73.33, rocAuc: 91.71 },
    { fold: 2, accuracy: 86.21, precision: 81.48, recall: 75.86, f1Score: 78.57, rocAuc: 93.94 },
    { fold: 3, accuracy: 91.86, precision: 88.89, recall: 85.71, f1Score: 87.27, rocAuc: 91.75 },
    { fold: 4, accuracy: 84.88, precision: 82.61, recall: 67.86, f1Score: 74.51, rocAuc: 95.38 },
    { fold: 5, accuracy: 89.53, precision: 82.76, recall: 85.71, f1Score: 84.21, rocAuc: 93.90 }
  ],
  confusionMatrix: {
    trueNegative: 66,
    falsePositive: 7,
    falseNegative: 5,
    truePositive: 31
  },
  topFeatures: [
    {
      rank: 1,
      name: 'Follicle No. (R)',
      label: 'Right Ovary Follicle Count',
      importance: 1.7546,
      direction: '+',
      description: 'Right ovary antral follicle excess on pelvic ultrasound (>10-12 follicles per ovary).'
    },
    {
      rank: 2,
      name: 'hair growth(Y/N)',
      label: 'Excess Facial / Body Hair (Hirsutism)',
      importance: 0.7853,
      direction: '+',
      description: 'Direct clinical manifestation of circulating hyperandrogenism.'
    },
    {
      rank: 3,
      name: 'Follicle No. (L)',
      label: 'Left Ovary Follicle Count',
      importance: 0.6865,
      direction: '+',
      description: 'Left ovary antral follicle density reinforcing polycystic ovarian morphology.'
    },
    {
      rank: 4,
      name: 'Cycle(R/I)',
      label: 'Menstrual Cycle Irregularity',
      importance: 0.6785,
      direction: '+',
      description: 'Oligomenorrhea or amenorrhea reflecting chronic anovulatory cycles.'
    },
    {
      rank: 5,
      name: 'Weight gain(Y/N)',
      label: 'Recent / Sudden Weight Gain',
      importance: 0.6564,
      direction: '+',
      description: 'Metabolic deregulation and visceral adiposity associated with insulin resistance.'
    },
    {
      rank: 6,
      name: 'Skin darkening (Y/N)',
      label: 'Skin Darkening (Acanthosis Nigricans)',
      importance: 0.6355,
      direction: '+',
      description: 'Cutaneous dermatological hallmark of systemic hyperinsulinemia.'
    },
    {
      rank: 7,
      name: 'Pulse rate(bpm)',
      label: 'Resting Heart Rate',
      importance: 0.5136,
      direction: '+',
      description: 'Sympathetic tone and resting autonomic metabolic rate indicator.'
    },
    {
      rank: 8,
      name: 'Marraige Status (Yrs)',
      label: 'Years of Marriage',
      importance: 0.4858,
      direction: '-',
      description: 'Demographic and reproductive interval cofactor.'
    },
    {
      rank: 9,
      name: 'Pimples(Y/N)',
      label: 'Persistent Adult Acne',
      importance: 0.4369,
      direction: '+',
      description: 'Sebaceous gland stimulation driven by androgenic excess.'
    },
    {
      rank: 10,
      name: 'RBS(mg/dl)',
      label: 'Random Blood Glucose',
      importance: 0.4316,
      direction: '+',
      description: 'Impaired glucose tolerance and glycemic control dysregulation.'
    }
  ]
};
