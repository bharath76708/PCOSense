/**
 * Centralized API Service for PCOSense
 * Dispatches to /api endpoints and Cloud Firestore for user-isolated data persistence,
 * with fallback to client-side ML engine and local RAG.
 */

import {
  PatientRecord,
  PredictionResponse,
  WhatIfResponse,
  AssessmentHistoryItem,
  ModelBenchmarkInfo,
  User,
  UserProfile,
  SummaryInsightsData
} from '../types';
import {
  generatePredictionResponse,
  runWhatIfSimulation,
  MODEL_BENCHMARK_DATA,
  ORDERED_FEATURES,
  FEATURE_METADATA,
  PRESET_PROFILES,
  getDefaultPatientRecord
} from '../ml/modelEngine';
import { PCOS_KNOWLEDGE_BASE, generateLocalRAGResponse, KnowledgeTopic } from '../ml/ragKnowledge';
import { auth } from '../lib/firebase';
import {
  saveFirestorePrediction,
  getFirestorePredictions,
  deleteFirestorePrediction,
  getFirestoreUserProfile,
  saveFirestoreUserProfile
} from './firestoreService';

const API_BASE = '/api';
const TOKEN_KEY = 'pcosense_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================================
// AUTHENTICATION SERVICES
// ============================================================

export async function registerAccount(
  fullName: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<{ user: User; token: string; profile_completed: boolean; redirect: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Registration failed. Please check your credentials.');
  }

  setStoredToken(json.data.token);
  return json.data;
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ user: User; token: string; profile_completed: boolean; redirect: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Invalid email or password.');
  }

  setStoredToken(json.data.token);
  return json.data;
}

export async function logoutAccount(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // ignore
  } finally {
    removeStoredToken();
  }
}

export async function getCurrentUserSession(): Promise<{
  user: User;
  profile_completed: boolean;
  completion_percentage: number;
} | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      removeStoredToken();
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// PROFILE MANAGEMENT SERVICES (FIRESTORE FIRST)
// ============================================================

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    try {
      const firestoreProf = await getFirestoreUserProfile(currentUid);
      if (firestoreProf) return firestoreProf;
    } catch (err) {
      console.warn('Firestore profile load error, falling back:', err);
    }
  }

  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.error('Error in fetchUserProfile:', err);
    return null;
  }
}

export async function saveUserProfile(data: Partial<PatientRecord>): Promise<UserProfile> {
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    return await saveFirestoreUserProfile(currentUid, data, {
      full_name: auth.currentUser?.displayName || 'Patient',
      email: auth.currentUser?.email || ''
    });
  }

  const res = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to save profile. Please try again.');
  }

  return json.data;
}

// ============================================================
// MODEL, PREDICTION & ASSESSMENT SERVICES
// ============================================================

export async function getHealthStatus(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return {
      status: 'healthy (client runtime)',
      service: 'PCOSense Risk Screening & Awareness Engine'
    };
  }
}

export async function getModelInfo(): Promise<{
  success: boolean;
  data: ModelBenchmarkInfo & { features: any[]; presets: typeof PRESET_PROFILES };
}> {
  try {
    const res = await fetch(`${API_BASE}/model-info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return await res.json();
  } catch {
    return {
      success: true,
      data: {
        ...MODEL_BENCHMARK_DATA,
        features: ORDERED_FEATURES.map((feat, idx) => ({
          index: idx + 1,
          name: feat,
          meta: FEATURE_METADATA[feat]
        })),
        presets: PRESET_PROFILES
      }
    };
  }
}

/**
 * Generate PCOS Risk Prediction and save to Cloud Firestore and local storage
 */
export async function predictPCOS(
  patientData: Partial<PatientRecord>,
  notes?: string
): Promise<PredictionResponse> {
  let prediction: PredictionResponse;

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patientData, notes })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        prediction = json.data;
      } else {
        prediction = generatePredictionResponse(patientData);
      }
    } else {
      prediction = generatePredictionResponse(patientData);
    }
  } catch {
    prediction = generatePredictionResponse(patientData);
  }

  // Create standardized AssessmentHistoryItem
  const historyItem: AssessmentHistoryItem = {
    id: prediction.assessment_id,
    user_id: auth.currentUser?.uid || 'anonymous',
    timestamp: prediction.timestamp,
    dateFormatted: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    probability: prediction.probabilityPercentage,
    risk_level: prediction.risk_level,
    prediction: prediction.prediction,
    bmi: Number(patientData['BMI']) || 24.1,
    cycleStatus: Number(patientData['Cycle(R/I)']) === 2 ? 'Regular' : 'Irregular',
    follicleCountRight: Number(patientData['Follicle No. (R)']) || 5,
    model_name: prediction.model_name,
    notes: notes || 'PCOS Risk Assessment Screening',
    inputSnapshot: { ...patientData },
    keyDrivers: prediction.key_risk_drivers
  };

  // 1. Persist to Cloud Firestore for authenticated user
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    try {
      await saveFirestorePrediction(currentUid, historyItem);
    } catch (err) {
      console.error('Failed to write prediction to Cloud Firestore:', err);
    }
  }

  // 2. Persist locally as fallback
  saveLocalHistory(prediction, patientData);

  return prediction;
}

/**
 * Explainable AI Feature Attribution
 */
export async function explainPCOS(patientData: Partial<PatientRecord>): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData)
    });
    if (!res.ok) throw new Error('Explainability API error');
    const json = await res.json();
    return json.data;
  } catch {
    const res = generatePredictionResponse(patientData);
    return {
      probability: res.probabilityPercentage,
      risk_level: res.risk_level,
      key_risk_drivers: res.key_risk_drivers,
      protective_factors: res.protective_factors,
      all_contributions: res.all_contributions
    };
  }
}

/**
 * Counterfactual What-If Simulator
 */
export async function simulateWhatIf(
  baseline: Partial<PatientRecord>,
  modified: Partial<PatientRecord>
): Promise<WhatIfResponse> {
  try {
    const res = await fetch(`${API_BASE}/what-if`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ baseline, modified })
    });
    if (!res.ok) throw new Error('What-if API error');
    const json = await res.json();
    return json.data;
  } catch {
    return runWhatIfSimulation(baseline, modified);
  }
}

/**
 * Retrieve assessment history from Cloud Firestore for the authenticated user
 */
export async function getAssessmentHistory(): Promise<AssessmentHistoryItem[]> {
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    try {
      const firestoreItems = await getFirestorePredictions(currentUid);
      if (firestoreItems && firestoreItems.length > 0) {
        return firestoreItems;
      }
    } catch (err) {
      console.warn('Error fetching Firestore history:', err);
    }
  }

  // Fallback to server REST API or localStorage
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // fallback
  }

  return getLocalHistory();
}

/**
 * Delete individual assessment record from Cloud Firestore and local storage
 */
export async function deleteAssessmentHistory(id: string): Promise<AssessmentHistoryItem[]> {
  const currentUid = auth.currentUser?.uid;
  if (currentUid) {
    try {
      await deleteFirestorePrediction(currentUid, id);
      const updated = await getFirestorePredictions(currentUid);
      removeLocalHistory(id);
      return updated;
    } catch (err) {
      console.error('Error deleting from Firestore:', err);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        removeLocalHistory(id);
        return json.data;
      }
    }
  } catch {
    // fallback
  }

  return removeLocalHistory(id);
}

/**
 * Ask Grounded PCOS Gemini AI Chatbot (with multi-turn history & language support)
 */
export async function askAIAssistant(
  message: string,
  patientContext?: any,
  history?: any[],
  language: string = 'en'
): Promise<{
  reply: string;
  matchedTopics?: KnowledgeTopic[];
  suggestedQuestions?: string[];
  model?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ai-assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, patientContext, history, language })
    });
    if (!res.ok) throw new Error('AI Assistant request failed');
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || 'Failed to get assistant response');
  } catch {
    // Grounded local RAG fallback
    const fallback = generateLocalRAGResponse(message, patientContext);
    let reply = fallback.answer;
    if (language === 'te') {
      reply = `నమస్కారం! PCOSense క్లినికల్ సమాచారం ప్రకారం: \n\n${fallback.answer}\n\n*గమనిక: ఈ సమాచారం అవగాహన కొరకు మాత్రమే. దయచేసి పూర్తి సలహా కోసం మీ గైనకాలజిస్ట్‌ను సంప్రదించండి.*`;
    }
    return {
      reply,
      matchedTopics: fallback.matchedTopics,
      suggestedQuestions: fallback.suggestedQuestions,
      model: 'PCOSense Knowledge Grounding Engine'
    };
  }
}

/**
 * Transcribe spoken voice question via Gemini Flash Audio Transcription
 */
export async function transcribeVoiceAudio(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to transcribe audio recording');
  }

  return json.data.text;
}

/**
 * Get Grounded RAG Knowledge Topics
 */
export async function getKnowledgeTopics(): Promise<KnowledgeTopic[]> {
  try {
    const res = await fetch(`${API_BASE}/rag/knowledge`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // fallback
  }
  return PCOS_KNOWLEDGE_BASE;
}

/**
 * Fetch AI 30-Day Longitudinal Summary Insights
 */
export async function fetchSummaryInsights(params: {
  history: AssessmentHistoryItem[];
  currentAssessment?: PredictionResponse | null;
  streak?: number;
  patientProfile?: UserProfile | null;
  timeframeDays?: number;
}): Promise<SummaryInsightsData> {
  try {
    const res = await fetch(`${API_BASE}/ai/summary-insights`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend summary insights request failed, calculating local fallback:', err);
  }

  // Client-side instant fallback if offline
  const latest = params.history[0] || (params.currentAssessment ? {
    probability: params.currentAssessment.probabilityPercentage,
    risk_level: params.currentAssessment.risk_level,
    bmi: 24.5,
    cycleStatus: 'Regular'
  } : null);

  const prob = latest ? Number(latest.probability) : 45;
  const isHigh = prob >= 65;

  return {
    headline: isHigh ? 'Elevated Rotterdam Pattern — Review With Specialist' : 'Stable Metabolic & Ovulatory Baseline',
    summary: `Over the past 30 days, your estimated PCOS statistical risk has maintained a consistent pattern at ${prob.toFixed(1)}% (${latest?.risk_level || 'Moderate'} risk). Engaging in daily habits such as post-meal walks and balanced hydration helps support your hormonal equilibrium and glycemic sensitivity.`,
    keyPatterns: [
      {
        category: 'Metabolic & Glycemic Balance',
        trend: 'stable',
        title: 'Glycemic Regulation',
        description: 'Consistent physical activity and fiber prioritization support normal insulin sensitivity.'
      },
      {
        category: 'Ovulatory & Cycle Regularity',
        trend: latest?.cycleStatus === 'Regular' ? 'improving' : 'attention',
        title: 'Menstrual Rhythm',
        description: 'Tracking cycle lengths over time allows accurate detection of anovulatory shifts.'
      },
      {
        category: 'Androgenic & Symptom Indicators',
        trend: isHigh ? 'attention' : 'stable',
        title: 'Androgen Influence',
        description: 'Dermatologic and follicular markers are key factors in your calibrated risk estimate.'
      }
    ],
    actionFocus: [
      'Incorporate 15 minutes of post-meal movement to optimize glucose utilization.',
      'Maintain your daily health goal streak and consult your physician with your 30-day timeline.'
    ],
    riskTrajectory: isHigh ? 'elevated' : 'stable',
    model: 'PCOSense Clinical Engine',
    generatedAt: new Date().toISOString(),
    assessmentsCount: params.history.length,
    timeframeDays: params.timeframeDays || 30
  };
}

// LocalStorage helpers
const STORAGE_KEY = 'pcosense_assessment_history_v1';

function getLocalHistory(): AssessmentHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalHistory(pred: PredictionResponse, input: Partial<PatientRecord>): void {
  try {
    const history = getLocalHistory();
    const item: AssessmentHistoryItem = {
      id: pred.assessment_id,
      timestamp: pred.timestamp,
      dateFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      probability: pred.probabilityPercentage,
      risk_level: pred.risk_level,
      prediction: pred.prediction,
      bmi: Number(input['BMI']) || 24.1,
      cycleStatus: Number(input['Cycle(R/I)']) === 2 ? 'Regular' : 'Irregular',
      follicleCountRight: Number(input['Follicle No. (R)']) || 5,
      model_name: pred.model_name,
      inputSnapshot: { ...input },
      keyDrivers: pred.key_risk_drivers
    };
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage error
  }
}

function removeLocalHistory(id: string): AssessmentHistoryItem[] {
  try {
    const history = getLocalHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

// ============================================================
// CRAVING & SPECIAL RECIPE AI GENERATION
// ============================================================

export async function generateAICravingRecipe(params: {
  craving: string;
  preference?: string;
  patientContext?: any;
  language?: string;
}): Promise<{ recipe: any; source: string; model?: string }> {
  try {
    const res = await fetch(`${API_BASE}/diet/craving-recipe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API error in generateAICravingRecipe, falling back to local search:', err);
  }

  // Fallback to local recipe search
  const { searchRecipesByCraving, MASTER_RECIPES } = await import('./dietPlanService');
  const matched = searchRecipesByCraving(params.craving);
  const selected = matched.length > 0 ? matched[0] : MASTER_RECIPES[0];

  return {
    recipe: selected,
    source: 'local_engine',
    model: 'PCOSense Clinical Engine'
  };
}

