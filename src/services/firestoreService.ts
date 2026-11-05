/**
 * Cloud Firestore Service for PCOSense
 * Handles persistent storage of User Profiles and PCOS Assessment Prediction History.
 * Enforces per-user data isolation via Firebase Auth UID.
 */

import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from '../lib/firebase';
import {
  AssessmentHistoryItem,
  UserProfile,
  PatientRecord,
  DailySymptomLog,
  RecipeItem,
  DailyStepRecord,
  DailyHydrationRecord,
  UserFeedback,
  WellnessPersonalTargets,
  DailyHabitsDayRecord
} from '../types';
import { getDefaultPatientRecord } from '../ml/modelEngine';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Handled:', JSON.stringify(errInfo));
  return errInfo;
}

export interface FirestoreUserProfile {
  user_id: string;
  full_name: string;
  email: string;
  role?: 'user' | 'doctor' | 'admin';
  doctorId?: string;
  profile_completed: boolean;
  completion_percentage: number;
  patientData: PatientRecord;
  updated_at: string;
  created_at: string;
}

/**
 * Fetch a user's persistent medical profile from Cloud Firestore or local cache
 */
export async function getFirestoreUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
  if (!userId) return null;
  const localKey = `pcosense_profile_${userId}`;
  
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as FirestoreUserProfile;
      const profileResult: FirestoreUserProfile = {
        ...data,
        patientData: {
          ...getDefaultPatientRecord(),
          ...(data.patientData || {})
        }
      };
      try {
        localStorage.setItem(localKey, JSON.stringify(profileResult));
      } catch {
        // ignore
      }
      return profileResult;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved) as FirestoreUserProfile;
      return {
        ...parsed,
        patientData: {
          ...getDefaultPatientRecord(),
          ...(parsed.patientData || {})
        }
      };
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Save or update user's profile and baseline indicators in Cloud Firestore and local cache
 */
export async function saveFirestoreUserProfile(
  userId: string,
  patientData: Partial<PatientRecord>,
  userMeta?: { full_name?: string; email?: string; role?: 'user' | 'doctor' | 'admin'; doctorId?: string }
): Promise<FirestoreUserProfile> {
  if (!userId) throw new Error('User ID is required to save profile');

  const existing = await getFirestoreUserProfile(userId);
  const now = new Date().toISOString();

  const mergedData: PatientRecord = {
    ...getDefaultPatientRecord(),
    ...(existing?.patientData || {}),
    ...patientData
  };

  // Compute profile completion percentage
  let filledCount = 0;
  const criticalFields: (keyof PatientRecord)[] = [
    'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI', 'Blood Group',
    'Pulse rate(bpm)', 'RR (breaths/min)', 'Hb(g/dl)', 'Cycle(R/I)',
    'Cycle length(days)', 'Marraige Status (Yrs)', 'Pregnant(Y/N)',
    'No. of aborptions', 'FSH(mIU/mL)', 'LH(mIU/mL)', 'FSH/LH',
    'Hip(inch)', 'Waist(inch)', 'Waist:Hip Ratio', 'TSH (mIU/L)',
    'AMH(ng/mL)', 'PRL(ng/mL)', 'Vit D3 (ng/mL)', 'PRG(ng/mL)',
    'RBS(mg/dl)', 'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)',
    'Hair loss(Y/N)', 'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)',
    'Follicle No. (R)', 'Follicle No. (L)', 'Avg. F size (L) (mm)', 'Avg. F size (R) (mm)'
  ];

  for (const f of criticalFields) {
    if (mergedData[f] !== undefined && mergedData[f] !== 0) {
      filledCount++;
    }
  }

  const completionPercentage = Math.min(100, Math.round((filledCount / criticalFields.length) * 100));
  const profileCompleted = completionPercentage >= 40;

  const profileRecord: FirestoreUserProfile = {
    user_id: userId,
    full_name: userMeta?.full_name || existing?.full_name || 'Patient',
    email: userMeta?.email || existing?.email || '',
    role: userMeta?.role || existing?.role || 'user',
    doctorId: userMeta?.doctorId || existing?.doctorId,
    profile_completed: profileCompleted,
    completion_percentage: completionPercentage,
    patientData: mergedData,
    updated_at: now,
    created_at: existing?.created_at || now
  };

  // Save to localStorage immediately
  const localKey = `pcosense_profile_${userId}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(profileRecord));
  } catch {
    // ignore
  }

  // Attempt Firestore sync
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileRecord, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }

  return profileRecord;
}

/**
 * Save a new PCOS assessment prediction record to user's Firestore subcollection and local cache
 */
export async function saveFirestorePrediction(
  userId: string,
  record: AssessmentHistoryItem
): Promise<void> {
  if (!userId || !record.id) return;
  const historyKey = `pcosense_predictions_${userId}`;

  // Save to local storage first
  try {
    const existingRaw = localStorage.getItem(historyKey);
    const existingList: AssessmentHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updatedList = [record, ...existingList.filter(item => item.id !== record.id)];
    localStorage.setItem(historyKey, JSON.stringify(updatedList));
  } catch {
    // ignore
  }

  try {
    const predRef = doc(db, 'users', userId, 'predictions', record.id);
    await setDoc(predRef, {
      ...record,
      userId
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/predictions/${record.id}`);
  }
}

/**
 * Retrieve all saved predictions for the authenticated user from Cloud Firestore / local cache
 */
export async function getFirestorePredictions(userId: string): Promise<AssessmentHistoryItem[]> {
  if (!userId) return [];
  const historyKey = `pcosense_predictions_${userId}`;

  try {
    const predictionsCol = collection(db, 'users', userId, 'predictions');
    const q = query(predictionsCol, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const items: AssessmentHistoryItem[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as AssessmentHistoryItem);
    });

    if (items.length > 0) {
      try {
        localStorage.setItem(historyKey, JSON.stringify(items));
      } catch {
        // ignore
      }
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/predictions`);
  }

  try {
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Delete a specific prediction record from Cloud Firestore / local cache
 */
export async function deleteFirestorePrediction(
  userId: string,
  predictionId: string
): Promise<void> {
  if (!userId || !predictionId) return;
  const historyKey = `pcosense_predictions_${userId}`;

  try {
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      const existingList: AssessmentHistoryItem[] = JSON.parse(saved);
      const filtered = existingList.filter(item => item.id !== predictionId);
      localStorage.setItem(historyKey, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  try {
    const predRef = doc(db, 'users', userId, 'predictions', predictionId);
    await deleteDoc(predRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/predictions/${predictionId}`);
  }
}

// ============================================================
// DAILY SYMPTOM LOGS FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreSymptomLog(userId: string, log: DailySymptomLog): Promise<void> {
  if (!userId || !log.id) return;
  try {
    const sympRef = doc(db, 'users', userId, 'symptoms', log.id);
    await setDoc(sympRef, {
      ...log,
      userId
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/symptoms/${log.id}`);
  }
}

export async function getFirestoreSymptomLogs(userId: string): Promise<DailySymptomLog[]> {
  if (!userId) return [];
  try {
    const sympCol = collection(db, 'users', userId, 'symptoms');
    const q = query(sympCol, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const results: DailySymptomLog[] = [];
    snap.forEach(d => {
      results.push(d.data() as DailySymptomLog);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/symptoms`);
    return [];
  }
}

export async function deleteFirestoreSymptomLog(userId: string, logId: string): Promise<void> {
  if (!userId || !logId) return;
  try {
    const sympRef = doc(db, 'users', userId, 'symptoms', logId);
    await deleteDoc(sympRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/symptoms/${logId}`);
  }
}

// ============================================================
// SAVED RECIPES FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreSavedRecipe(userId: string, recipe: RecipeItem): Promise<void> {
  if (!userId || !recipe.id) return;
  try {
    const recRef = doc(db, 'users', userId, 'saved_recipes', recipe.id);
    await setDoc(recRef, {
      ...recipe,
      userId,
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/saved_recipes/${recipe.id}`);
  }
}

export async function getFirestoreSavedRecipes(userId: string): Promise<RecipeItem[]> {
  if (!userId) return [];
  try {
    const recCol = collection(db, 'users', userId, 'saved_recipes');
    const snap = await getDocs(recCol);
    const results: RecipeItem[] = [];
    snap.forEach(d => {
      results.push(d.data() as RecipeItem);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/saved_recipes`);
    return [];
  }
}

export async function deleteFirestoreSavedRecipe(userId: string, recipeId: string): Promise<void> {
  if (!userId || !recipeId) return;
  try {
    const recRef = doc(db, 'users', userId, 'saved_recipes', recipeId);
    await deleteDoc(recRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/saved_recipes/${recipeId}`);
  }
}

// ============================================================
// WHAT-IF SIMULATION SCENARIOS FIRESTORE PERSISTENCE
// ============================================================

export interface SimulationScenarioRecord {
  id: string;
  userId: string;
  title: string;
  timestamp: string;
  baselineProbability: number;
  simulatedProbability: number;
  deltaProbability: number;
  direction: 'improved' | 'worsened' | 'unchanged';
  changedFeatures: { feature: string; baselineValue: number; simulatedValue: number }[];
}

export async function saveFirestoreSimulationScenario(
  userId: string,
  scenario: SimulationScenarioRecord
): Promise<void> {
  if (!userId || !scenario.id) return;
  const localKey = `pcosense_simulations_${userId}`;
  try {
    const raw = localStorage.getItem(localKey);
    const list: SimulationScenarioRecord[] = raw ? JSON.parse(raw) : [];
    const updated = [scenario, ...list.filter(s => s.id !== scenario.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch {
    // ignore
  }

  try {
    const simRef = doc(db, 'users', userId, 'simulations', scenario.id);
    await setDoc(simRef, scenario, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/simulations/${scenario.id}`);
  }
}

export async function getFirestoreSimulationScenarios(userId: string): Promise<SimulationScenarioRecord[]> {
  if (!userId) return [];
  const localKey = `pcosense_simulations_${userId}`;

  try {
    const simCol = collection(db, 'users', userId, 'simulations');
    const q = query(simCol, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const results: SimulationScenarioRecord[] = [];
    snap.forEach(d => {
      results.push(d.data() as SimulationScenarioRecord);
    });
    if (results.length > 0) {
      try {
        localStorage.setItem(localKey, JSON.stringify(results));
      } catch {
        // ignore
      }
      return results;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/simulations`);
  }

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  return [];
}

// ============================================================
// WALKING & STEP COUNT FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreStepRecord(userId: string, record: DailyStepRecord): Promise<void> {
  if (!userId || !record.id) return;
  const localKey = `pcosense_steps_${userId}_${record.dateKey}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(record));
  } catch {
    // ignore
  }

  try {
    const stepRef = doc(db, 'users', userId, 'steps', record.id);
    await setDoc(stepRef, record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/steps/${record.id}`);
  }
}

export async function getFirestoreStepRecords(userId: string): Promise<DailyStepRecord[]> {
  if (!userId) return [];
  try {
    const stepCol = collection(db, 'users', userId, 'steps');
    const q = query(stepCol, orderBy('dateKey', 'desc'));
    const snap = await getDocs(q);
    const results: DailyStepRecord[] = [];
    snap.forEach(d => {
      results.push(d.data() as DailyStepRecord);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/steps`);
    return [];
  }
}

// ============================================================
// HYDRATION & WATER TRACKING FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreHydrationRecord(userId: string, record: DailyHydrationRecord): Promise<void> {
  if (!userId || !record.id) return;
  const localKey = `pcosense_hydration_${userId}_${record.dateKey}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(record));
  } catch {
    // ignore
  }

  try {
    const waterRef = doc(db, 'users', userId, 'water', record.id);
    await setDoc(waterRef, record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/water/${record.id}`);
  }
}

export async function getFirestoreHydrationRecords(userId: string): Promise<DailyHydrationRecord[]> {
  if (!userId) return [];
  try {
    const waterCol = collection(db, 'users', userId, 'water');
    const q = query(waterCol, orderBy('dateKey', 'desc'));
    const snap = await getDocs(q);
    const results: DailyHydrationRecord[] = [];
    snap.forEach(d => {
      results.push(d.data() as DailyHydrationRecord);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/water`);
    return [];
  }
}

// ============================================================
// USER FEEDBACK FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreFeedback(feedback: UserFeedback): Promise<void> {
  const localKey = 'pcosense_user_feedback_latest';
  try {
    localStorage.setItem(localKey, JSON.stringify(feedback));
    localStorage.setItem('pcosense_feedback_submitted', 'true');
  } catch {
    // ignore
  }

  const userId = feedback.userId || auth.currentUser?.uid;
  if (!userId) return;

  try {
    const feedbackRef = doc(db, 'users', userId, 'feedback', feedback.id);
    await setDoc(feedbackRef, feedback, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/feedback/${feedback.id}`);
  }
}

// ============================================================
// WELLNESS PERSONAL TARGETS PERSISTENCE
// ============================================================

export async function saveFirestoreWellnessTargets(userId: string, targets: WellnessPersonalTargets): Promise<void> {
  if (!userId) return;
  try {
    const targetRef = doc(db, 'users', userId, 'wellnessTargets', 'current');
    await setDoc(targetRef, targets, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/wellnessTargets/current`);
  }
}

export async function getFirestoreWellnessTargets(userId: string): Promise<WellnessPersonalTargets | null> {
  if (!userId) return null;
  try {
    const targetRef = doc(db, 'users', userId, 'wellnessTargets', 'current');
    const snap = await getDoc(targetRef);
    if (snap.exists()) {
      return snap.data() as WellnessPersonalTargets;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/wellnessTargets/current`);
  }
  return null;
}

// ============================================================
// DAILY PCOS HABITS TRACKER FIRESTORE PERSISTENCE
// ============================================================

export async function saveFirestoreDailyHabits(userId: string, record: DailyHabitsDayRecord): Promise<void> {
  if (!userId || !record.dateKey) return;
  const localKey = `pcosense_habits_${userId}_${record.dateKey}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(record));
  } catch {
    // ignore
  }

  try {
    const habitRef = doc(db, 'users', userId, 'daily_habits', record.dateKey);
    await setDoc(habitRef, record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/daily_habits/${record.dateKey}`);
  }
}

export async function getFirestoreDailyHabits(userId: string, dateKey: string): Promise<DailyHabitsDayRecord | null> {
  if (!userId || !dateKey) return null;
  const localKey = `pcosense_habits_${userId}_${dateKey}`;
  try {
    const habitRef = doc(db, 'users', userId, 'daily_habits', dateKey);
    const snap = await getDoc(habitRef);
    if (snap.exists()) {
      const data = snap.data() as DailyHabitsDayRecord;
      try {
        localStorage.setItem(localKey, JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/daily_habits/${dateKey}`);
  }

  try {
    const local = localStorage.getItem(localKey);
    if (local) return JSON.parse(local) as DailyHabitsDayRecord;
  } catch {
    // ignore
  }
  return null;
}

export async function getFirestoreRecentHabits(userId: string, limitCount = 14): Promise<DailyHabitsDayRecord[]> {
  if (!userId) return [];
  try {
    const habitsCol = collection(db, 'users', userId, 'daily_habits');
    const q = query(habitsCol, orderBy('dateKey', 'desc'));
    const snap = await getDocs(q);
    const results: DailyHabitsDayRecord[] = [];
    snap.forEach(d => {
      results.push(d.data() as DailyHabitsDayRecord);
    });
    return results.slice(0, limitCount);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/daily_habits`);
    return [];
  }
}

