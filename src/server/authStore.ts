/**
 * PCOSense - Auth & User Profile Data Management Engine
 * Handles user credentials, bcrypt password hashing, JWT creation & verification,
 * isolated user profiles, and historical assessment tracking.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PatientRecord, AssessmentHistoryItem, RiskLevel } from '../types';
import { getDefaultPatientRecord, computeBMI, computeWaistHipRatio } from '../ml/modelEngine';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRecord {
  user_id: string;
  profile_completed: boolean;
  completion_percentage: number;
  patientData: PatientRecord;
  updated_at: string;
}

// Secret key for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'pcosense-production-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '7d';

// Core essential fields required for valid ML risk prediction
export const CORE_PROFILE_FIELDS: (keyof PatientRecord)[] = [
  'Age (yrs)',
  'Weight (Kg)',
  'Height(Cm)',
  'Cycle(R/I)',
  'Cycle length(days)',
  'Weight gain(Y/N)',
  'hair growth(Y/N)',
  'Skin darkening (Y/N)',
  'Hair loss(Y/N)',
  'Pimples(Y/N)',
  'Fast food (Y/N)',
  'Reg.Exercise(Y/N)'
];

// Helper to calculate profile completion percentage
export function calculateProfileCompletion(data: Partial<PatientRecord>): number {
  if (!data) return 0;
  let filledCount = 0;
  for (const field of CORE_PROFILE_FIELDS) {
    if (data[field] !== undefined && data[field] !== null) {
      filledCount++;
    }
  }
  return Math.min(100, Math.round((filledCount / CORE_PROFILE_FIELDS.length) * 100));
}

// In-memory Database Stores
const usersStore = new Map<string, UserRecord>();
const profilesStore = new Map<string, UserProfileRecord>();
const assessmentsStore = new Map<string, AssessmentHistoryItem[]>();

// Seed default demo user for instant testing & evaluation
export async function seedDemoData() {
  const demoId = 'usr-demo-pcos-001';
  const demoEmail = 'demo@pcosense.health';
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  const demoUser: UserRecord = {
    id: demoId,
    full_name: 'Dr. Sarah Jenkins',
    email: demoEmail,
    password_hash: passwordHash,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  };
  usersStore.set(demoId, demoUser);

  const defaultRecord = getDefaultPatientRecord();
  const demoPatientData: PatientRecord = {
    ...defaultRecord,
    'Age (yrs)': 26,
    'Weight (Kg)': 68.5,
    'Height(Cm)': 162,
    'BMI': 26.1,
    'Blood Group': 15, // O+
    'Pulse rate(bpm)': 74,
    'RR (breaths/min)': 18,
    'Hb(g/dl)': 12.1,
    'Cycle(R/I)': 4, // Irregular
    'Cycle length(days)': 7,
    'Marraige Status (Yrs)': 2,
    'Pregnant(Y/N)': 0,
    'No. of aborptions': 0,
    'Weight gain(Y/N)': 1,
    'hair growth(Y/N)': 1,
    'Skin darkening (Y/N)': 1,
    'Hair loss(Y/N)': 1,
    'Pimples(Y/N)': 1,
    'Fast food (Y/N)': 1,
    'Reg.Exercise(Y/N)': 0,
    'BP _Systolic (mmHg)': 118,
    'BP _Diastolic (mmHg)': 78,
    'Follicle No. (L)': 14,
    'Follicle No. (R)': 16,
    'Avg. F size (L) (mm)': 14.5,
    'Avg. F size (R) (mm)': 15.0,
    'Endometrium (mm)': 8.2,
    'FSH(mIU/mL)': 5.2,
    'LH(mIU/mL)': 12.8,
    'FSH/LH': 0.41,
    'AMH(ng/mL)': 8.9,
    'PRL(ng/mL)': 22.4,
    'Vit D3 (ng/mL)': 18.5,
    'PRG(ng/mL)': 0.45,
    'RBS(mg/dl)': 108,
    'TSH (mIU/L)': 3.4,
    'I beta-HCG(mIU/mL)': 1.99,
    'II beta-HCG(mIU/mL)': 1.99,
    'Hip(inch)': 39,
    'Waist(inch)': 34,
    'Waist:Hip Ratio': 0.87
  };

  profilesStore.set(demoId, {
    user_id: demoId,
    profile_completed: true,
    completion_percentage: 100,
    patientData: demoPatientData,
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  });

  assessmentsStore.set(demoId, [
    {
      id: 'PCO-HIST-9021',
      user_id: demoId,
      timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
      dateFormatted: new Date(Date.now() - 86400000 * 14).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      probability: 78.4,
      risk_level: 'Elevated',
      prediction: 1,
      bmi: 26.1,
      cycleStatus: 'Irregular',
      follicleCountRight: 16,
      model_name: 'Logistic Regression (Calibrated)',
      notes: 'Initial clinical assessment following 6-month cycle irregularity',
      inputSnapshot: { ...demoPatientData }
    },
    {
      id: 'PCO-HIST-9022',
      user_id: demoId,
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      dateFormatted: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      probability: 68.2,
      risk_level: 'Moderate',
      prediction: 1,
      bmi: 25.4,
      cycleStatus: 'Irregular',
      follicleCountRight: 12,
      model_name: 'Logistic Regression (Calibrated)',
      notes: 'Follow-up assessment after beginning lifestyle modifications',
      inputSnapshot: { ...demoPatientData, 'Weight (Kg)': 66.5, 'BMI': 25.4 }
    }
  ]);
}

// Seed on startup
seedDemoData();

// ============================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================

export function generateToken(user: UserRecord): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.full_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): { userId: string; email: string; fullName: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; fullName: string };
    return payload;
  } catch (err) {
    return null;
  }
}

export async function registerUser(fullName: string, email: string, password: string): Promise<{ user: UserRecord; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  for (const user of usersStore.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      throw new Error('An account with this email address already exists.');
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newUser: UserRecord = {
    id: userId,
    full_name: fullName.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    is_active: true,
    created_at: now,
    updated_at: now
  };

  usersStore.set(userId, newUser);

  // Initialize blank profile
  const blankPatientData = getDefaultPatientRecord();
  const newProfile: UserProfileRecord = {
    user_id: userId,
    profile_completed: false,
    completion_percentage: 0,
    patientData: blankPatientData,
    updated_at: now
  };
  profilesStore.set(userId, newProfile);
  assessmentsStore.set(userId, []);

  const token = generateToken(newUser);
  return { user: newUser, token };
}

export async function loginUser(email: string, password: string): Promise<{ user: UserRecord; token: string; profileCompleted: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();

  let targetUser: UserRecord | null = null;
  for (const user of usersStore.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      targetUser = user;
      break;
    }
  }

  if (!targetUser) {
    throw new Error('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, targetUser.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  const profile = profilesStore.get(targetUser.id);
  const profileCompleted = profile ? profile.profile_completed : false;
  const token = generateToken(targetUser);

  return {
    user: targetUser,
    token,
    profileCompleted
  };
}

export function getUserById(userId: string): UserRecord | null {
  return usersStore.get(userId) || null;
}

// ============================================================
// PROFILE MANAGEMENT (ISOLATED TO AUTHENTICATED USER)
// ============================================================

export function getUserProfile(userId: string): { profile: UserProfileRecord; user: UserRecord } {
  const user = usersStore.get(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  let profile = profilesStore.get(userId);
  if (!profile) {
    profile = {
      user_id: userId,
      profile_completed: false,
      completion_percentage: 0,
      patientData: getDefaultPatientRecord(),
      updated_at: new Date().toISOString()
    };
    profilesStore.set(userId, profile);
  }

  return { profile, user };
}

export function saveOrUpdateProfile(userId: string, incomingData: Partial<PatientRecord>): UserProfileRecord {
  const user = usersStore.get(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  let existingProfile = profilesStore.get(userId);
  const currentData = existingProfile ? { ...existingProfile.patientData } : getDefaultPatientRecord();

  // Merge updated values
  const updatedPatientData: PatientRecord = {
    ...currentData,
    ...incomingData
  };

  // Re-compute derived parameters
  if (updatedPatientData['Weight (Kg)'] && updatedPatientData['Height(Cm)']) {
    updatedPatientData['BMI'] = computeBMI(updatedPatientData['Weight (Kg)'], updatedPatientData['Height(Cm)']);
  }
  if (updatedPatientData['Waist(inch)'] && updatedPatientData['Hip(inch)']) {
    updatedPatientData['Waist:Hip Ratio'] = computeWaistHipRatio(
      updatedPatientData['Waist(inch)'],
      updatedPatientData['Hip(inch)']
    );
  }

  const completionPct = calculateProfileCompletion(updatedPatientData);
  const isCompleted = completionPct >= 80;

  const updatedProfile: UserProfileRecord = {
    user_id: userId,
    profile_completed: isCompleted,
    completion_percentage: completionPct,
    patientData: updatedPatientData,
    updated_at: new Date().toISOString()
  };

  profilesStore.set(userId, updatedProfile);
  return updatedProfile;
}

// ============================================================
// ASSESSMENT HISTORY MANAGEMENT (ISOLATED TO AUTHENTICATED USER)
// ============================================================

export function getUserAssessments(userId: string): AssessmentHistoryItem[] {
  return assessmentsStore.get(userId) || [];
}

export function getAssessmentById(userId: string, assessmentId: string): AssessmentHistoryItem | null {
  const userList = assessmentsStore.get(userId) || [];
  return userList.find(a => a.id === assessmentId) || null;
}

export function saveAssessmentRecord(userId: string, assessment: AssessmentHistoryItem): AssessmentHistoryItem {
  const existing = assessmentsStore.get(userId) || [];
  const updated = [assessment, ...existing.slice(0, 49)];
  assessmentsStore.set(userId, updated);
  return assessment;
}

export function deleteAssessmentRecord(userId: string, assessmentId: string): AssessmentHistoryItem[] {
  const existing = assessmentsStore.get(userId) || [];
  const updated = existing.filter(a => a.id !== assessmentId);
  assessmentsStore.set(userId, updated);
  return updated;
}
