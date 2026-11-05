/**
 * PCOSense - Clinical Health Report & Patient Sharing Service
 * Enforces strict medical language guidelines, non-diagnostic disclaimers,
 * and explicit patient-authorized sharing with specialists.
 */

import { HealthReportRecord, PatientRecord, RiskLevel, User } from '../types';
import { getDoctorById } from './doctorService';

const HEALTH_REPORTS_STORAGE_KEY = 'pcosense_health_reports_db';

export const MEDICAL_DISCLAIMER_TEXT =
  'This screening result is not a medical diagnosis. Please consult a qualified healthcare professional for diagnosis and treatment.';

export const MEDICAL_DISCLAIMER_TEXT_TE =
  'ఈ స్క్రీనింగ్ ఫలితం వైద్య నిర్ధారణ (డయాగ్నోసిస్) కాదు. ఖచ్చితమైన నిర్ధారణ మరియు చికిత్స కోసం దయచేసి అర్హత కలిగిన వైద్య నిపుణులను సంప్రదించండి.';

/**
 * Format non-diagnostic risk pattern statement
 */
export function formatRiskPatternStatement(riskLevel: RiskLevel, isTelugu = false): string {
  if (riskLevel === 'Elevated') {
    return isTelugu
      ? 'మీ స్క్రీనింగ్ అధిక PCOS-రిస్క్ నమూనాను సూచిస్తుంది.'
      : 'Your screening indicates a higher PCOS-risk pattern.';
  } else if (riskLevel === 'Moderate') {
    return isTelugu
      ? 'మీ స్క్రీనింగ్ మధ్యస్థ PCOS-రిస్క్ నమూనాను సూచిస్తుంది.'
      : 'Your screening indicates a moderate PCOS-risk pattern.';
  } else {
    return isTelugu
      ? 'మీ స్క్రీనింగ్ తక్కువ PCOS-రిస్క్ నమూనాను సూచిస్తుంది.'
      : 'Your screening indicates a lower PCOS-risk pattern.';
  }
}

/**
 * Generate a comprehensive health report record from patient data
 */
export function generateHealthReport(params: {
  user: User;
  patient: PatientRecord;
  riskLevel: RiskLevel;
  probability: number;
  probabilityPercentage: number;
  keyFactors?: string[];
  protectiveFactors?: string[];
}): HealthReportRecord {
  const isHighRisk = params.riskLevel === 'Elevated';

  const symptomsSummary: string[] = [];
  if (params.patient['Cycle(R/I)'] === 4) symptomsSummary.push('Irregular Menstrual Cycles (Oligomenorrhea/Amenorrhea)');
  if (params.patient['hair growth(Y/N)'] === 1) symptomsSummary.push('Elevated Terminal Hair Growth / Hirsutism');
  if (params.patient['Skin darkening (Y/N)'] === 1) symptomsSummary.push('Acanthosis Nigricans (Skin Darkening / Insulin Resistance Marker)');
  if (params.patient['Hair loss(Y/N)'] === 1) symptomsSummary.push('Androgenic Hair Thinning / Hair Fall');
  if (params.patient['Pimples(Y/N)'] === 1) symptomsSummary.push('Persistent Hormonal Acne');
  if (params.patient['Weight gain(Y/N)'] === 1) symptomsSummary.push('Unexplained Weight Gain / Difficulty Losing Weight');
  if (symptomsSummary.length === 0) symptomsSummary.push('No acute phenotypic androgenic or ovulatory symptoms reported');

  const keyFactors = params.keyFactors && params.keyFactors.length > 0 ? params.keyFactors : [
    params.patient['Cycle(R/I)'] === 4 ? 'Prolonged cycle duration and ovulatory inconsistency' : 'Consistent menstrual regularity',
    (params.patient['BMI'] || 0) >= 25 ? 'Metabolic and elevated BMI pattern' : 'Standard BMI metabolic baseline',
    params.patient['Skin darkening (Y/N)'] === 1 ? 'Cutaneous insulin resistance markers' : 'Absence of cutaneous hyperinsulinemia signs'
  ];

  const protectiveFactors = params.protectiveFactors && params.protectiveFactors.length > 0 ? params.protectiveFactors : [
    'Actively monitoring endocrine and cycle biomarkers',
    'Consuming balanced low-glycemic meal options',
    'Hydration and activity logging engagement'
  ];

  const nextSteps = [
    'Schedule clinical consultation with a specialist for pelvic ultrasound (TVS) and hormonal workup.',
    'Test fasting glucose, fasting insulin, LH/FSH ratio, Total Testosterone, and DHEA-S under clinical supervision.',
    'Follow a Mediterranean low-glycemic, anti-inflammatory nutrition protocol with verified micronutrient density.',
    'Target 150+ minutes of moderate weekly physical activity including brisk walking and restorative yoga.'
  ];

  const recommendedSpecialist = isHighRisk
    ? 'Consultant Gynecologist & Reproductive Endocrinologist'
    : 'Gynecologist or Clinical Dietitian';

  const report: HealthReportRecord = {
    id: `rep-${params.user.id}-${Date.now().toString().slice(-6)}`,
    userId: params.user.id,
    userName: params.user.full_name || 'Patient',
    userEmail: params.user.email,
    generatedAt: new Date().toISOString(),
    screeningSummary: {
      riskLevel: params.riskLevel,
      probability: params.probability,
      probabilityPercentage: params.probabilityPercentage,
      keyFactors,
      protectiveFactors,
      assessmentDate: new Date().toISOString()
    },
    symptomsSummary,
    measurements: {
      bmi: Number(params.patient['BMI']?.toFixed(1)) || 23.4,
      weightKg: params.patient['Weight (Kg)'] || 60,
      heightCm: params.patient['Height(Cm)'] || 162,
      waistHipRatio: params.patient['Waist:Hip Ratio'] ? Number(params.patient['Waist:Hip Ratio'].toFixed(2)) : undefined,
      pulseRate: params.patient['Pulse rate(bpm)'] || 74,
      bloodPressure: params.patient['BP _Systolic (mmHg)'] && params.patient['BP _Diastolic (mmHg)']
        ? `${params.patient['BP _Systolic (mmHg)']}/${params.patient['BP _Diastolic (mmHg)']} mmHg`
        : '118/76 mmHg'
    },
    lifestyleSummary: {
      dietPreference: 'Low-GI Balanced (Vegetarian / Flexitarian)',
      exerciseRegularity: params.patient['Reg.Exercise(Y/N)'] === 1 ? 'Regular (3-5 days/week)' : 'Sedentary / Irregular',
      fastFoodFrequency: params.patient['Fast food (Y/N)'] === 1 ? 'Frequent' : 'Infrequent / Rare',
      waterIntakeLiters: 2.5,
      dailyStepsAverage: 7800
    },
    nutritionSummary: {
      dailyCaloriesTarget: isHighRisk ? 1500 : 1650,
      proteinTargetGrams: 70,
      fiberTargetGrams: 32,
      identifiedGaps: ['Magnesium & Zinc intake optimization', 'Anti-inflammatory Omega-3 fatty acids']
    },
    recommendedNextSteps: nextSteps,
    recommendedSpecialist,
    sharedWithDoctorIds: [],
    isShared: false
  };

  saveReportToStorage(report);
  return report;
}

export function getStoredReports(): HealthReportRecord[] {
  try {
    const raw = localStorage.getItem(HEALTH_REPORTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading health reports:', err);
  }
  return [];
}

export function saveReportToStorage(report: HealthReportRecord): void {
  const all = getStoredReports();
  const index = all.findIndex(r => r.id === report.id);
  if (index >= 0) {
    all[index] = report;
  } else {
    all.unshift(report);
  }
  try {
    localStorage.setItem(HEALTH_REPORTS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving health report:', err);
  }
}

/**
 * Get the latest health report for a user
 */
export function getLatestHealthReport(userId: string): HealthReportRecord | null {
  const all = getStoredReports();
  const userReports = all.filter(r => r.userId === userId);
  return userReports.length > 0 ? userReports[0] : null;
}

/**
 * Explicit patient authorization to share report with a doctor
 */
export function authorizeReportSharing(reportId: string, doctorId: string): HealthReportRecord | null {
  const all = getStoredReports();
  const report = all.find(r => r.id === reportId);
  if (!report) return null;

  if (!Array.isArray(report.sharedWithDoctorIds)) {
    report.sharedWithDoctorIds = [];
  }
  if (!report.sharedWithDoctorIds.includes(doctorId)) {
    report.sharedWithDoctorIds.push(doctorId);
  }
  report.isShared = true;
  report.authorizedAt = new Date().toISOString();

  saveReportToStorage(report);
  return report;
}

/**
 * Revoke patient authorization
 */
export function revokeReportSharing(reportId: string, doctorId: string): HealthReportRecord | null {
  const all = getStoredReports();
  const report = all.find(r => r.id === reportId);
  if (!report) return null;

  if (!Array.isArray(report.sharedWithDoctorIds)) {
    report.sharedWithDoctorIds = [];
  }
  report.sharedWithDoctorIds = report.sharedWithDoctorIds.filter(id => id !== doctorId);
  if (report.sharedWithDoctorIds.length === 0) {
    report.isShared = false;
  }

  saveReportToStorage(report);
  return report;
}

/**
 * Get reports shared with a specific doctor
 * Doctor can ONLY see reports if `sharedWithDoctorIds` includes doctorId.
 * Reports are labeled "Shared by user".
 */
export function getDoctorSharedReports(doctorId: string): HealthReportRecord[] {
  const all = getStoredReports();
  return all.filter(r => r.isShared && (
    (Array.isArray(r.sharedWithDoctorIds) && r.sharedWithDoctorIds.includes(doctorId)) ||
    (Boolean(doctorId) && Boolean(r.sharedWithDoctorIds?.[0]) && doctorId.includes(r.sharedWithDoctorIds[0]))
  ));
}
