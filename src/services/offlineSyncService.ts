/**
 * Background Offline Sync & Reconciliation Service for PCOSense
 * Uses IndexedDB with localStorage fallback to store pending daily symptom logs,
 * assessment prediction history, and profile updates when offline.
 * Automatically reconciles and flushes queue to Firestore and local state once reconnected.
 */

import { DailySymptomLog, AssessmentHistoryItem } from '../types';
import { saveFirestorePrediction, saveFirestoreUserProfile } from './firestoreService';
import { getDailySymptomLogs } from './dailySymptomService';
import { playNotificationSound } from './soundService';

const DB_NAME = 'PCOSenseOfflineDB_v1';
const DB_VERSION = 1;

const STORES = {
  SYMPTOMS: 'pending_symptoms',
  ASSESSMENTS: 'pending_assessments',
  PROFILES: 'pending_profiles'
};

const LOCAL_FALLBACK_KEYS = {
  SYMPTOMS: 'pcosense_offline_pending_symptoms',
  ASSESSMENTS: 'pcosense_offline_pending_assessments',
  PROFILES: 'pcosense_offline_pending_profiles'
};

let dbInstance: IDBDatabase | null = null;

// Open IndexedDB safely
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.SYMPTOMS)) {
          db.createObjectStore(STORES.SYMPTOMS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
          db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          db.createObjectStore(STORES.PROFILES, { keyPath: 'userId' });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, falling back to localStorage');
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB error:', err);
      resolve(null);
    }
  });
}

// Helper for localStorage fallback operations
function getLocalQueue<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalQueue<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Queue a daily symptom log for background sync
 */
export async function queueSymptomForSync(log: DailySymptomLog): Promise<void> {
  const db = await openIndexedDB();

  if (db) {
    try {
      const tx = db.transaction(STORES.SYMPTOMS, 'readwrite');
      const store = tx.objectStore(STORES.SYMPTOMS);
      store.put(log);
    } catch (err) {
      console.warn('IndexedDB put symptom error:', err);
    }
  }

  // Also maintain local queue mirror
  const current = getLocalQueue<DailySymptomLog>(LOCAL_FALLBACK_KEYS.SYMPTOMS);
  const updated = [log, ...current.filter(item => item.id !== log.id)];
  setLocalQueue(LOCAL_FALLBACK_KEYS.SYMPTOMS, updated);

  notifySyncStatusChange();

  // If online, immediately attempt reconciliation
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    reconcilePendingSyncQueue().catch(() => {});
  }
}

/**
 * Queue an assessment prediction record for background sync
 */
export async function queueAssessmentForSync(userId: string, record: AssessmentHistoryItem): Promise<void> {
  const db = await openIndexedDB();
  const queueItem = { ...record, userId };

  if (db) {
    try {
      const tx = db.transaction(STORES.ASSESSMENTS, 'readwrite');
      const store = tx.objectStore(STORES.ASSESSMENTS);
      store.put(queueItem);
    } catch (err) {
      console.warn('IndexedDB put assessment error:', err);
    }
  }

  const current = getLocalQueue<AssessmentHistoryItem>(LOCAL_FALLBACK_KEYS.ASSESSMENTS);
  const updated = [queueItem, ...current.filter(item => item.id !== record.id)];
  setLocalQueue(LOCAL_FALLBACK_KEYS.ASSESSMENTS, updated);

  notifySyncStatusChange();

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    reconcilePendingSyncQueue().catch(() => {});
  }
}

/**
 * Queue a user profile update for background sync
 */
export async function queueProfileForSync(
  userId: string,
  patientData: any,
  userMeta?: { full_name?: string; email?: string }
): Promise<void> {
  const db = await openIndexedDB();
  const queueItem = {
    userId,
    patientData,
    userMeta,
    queuedAt: new Date().toISOString()
  };

  if (db) {
    try {
      const tx = db.transaction(STORES.PROFILES, 'readwrite');
      const store = tx.objectStore(STORES.PROFILES);
      store.put(queueItem);
    } catch (err) {
      console.warn('IndexedDB put profile error:', err);
    }
  }

  const current = getLocalQueue<any>(LOCAL_FALLBACK_KEYS.PROFILES);
  const updated = [queueItem, ...current.filter(item => item.userId !== userId)];
  setLocalQueue(LOCAL_FALLBACK_KEYS.PROFILES, updated);

  notifySyncStatusChange();

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    reconcilePendingSyncQueue().catch(() => {});
  }
}

/**
 * Get current pending items count across all stores
 */
export async function getPendingQueueStatus(): Promise<{
  symptomsCount: number;
  assessmentsCount: number;
  profilesCount: number;
  totalPending: number;
}> {
  const localSymptoms = getLocalQueue<DailySymptomLog>(LOCAL_FALLBACK_KEYS.SYMPTOMS);
  const localAssessments = getLocalQueue<AssessmentHistoryItem>(LOCAL_FALLBACK_KEYS.ASSESSMENTS);
  const localProfiles = getLocalQueue<any>(LOCAL_FALLBACK_KEYS.PROFILES);

  const symptomsCount = localSymptoms.length;
  const assessmentsCount = localAssessments.length;
  const profilesCount = localProfiles.length;
  const totalPending = symptomsCount + assessmentsCount + profilesCount;

  return {
    symptomsCount,
    assessmentsCount,
    profilesCount,
    totalPending
  };
}

let isReconciling = false;

/**
 * Reconciles all pending items from IndexedDB / Local queues to Cloud Firestore
 */
export async function reconcilePendingSyncQueue(): Promise<{
  syncedCount: number;
  errors: string[];
}> {
  if (isReconciling) {
    return { syncedCount: 0, errors: ['Sync already in progress'] };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { syncedCount: 0, errors: ['Device is offline'] };
  }

  isReconciling = true;
  notifySyncStatusChange(true);

  let syncedCount = 0;
  const errors: string[] = [];

  try {
    const db = await openIndexedDB();

    // 1. Reconcile Profiles
    const pendingProfiles = getLocalQueue<any>(LOCAL_FALLBACK_KEYS.PROFILES);
    for (const item of pendingProfiles) {
      try {
        await saveFirestoreUserProfile(item.userId, item.patientData, item.userMeta);
        syncedCount++;
      } catch (err: any) {
        errors.push(`Profile sync: ${err?.message || 'Unknown error'}`);
      }
    }
    setLocalQueue(LOCAL_FALLBACK_KEYS.PROFILES, []);
    if (db) {
      try {
        const tx = db.transaction(STORES.PROFILES, 'readwrite');
        tx.objectStore(STORES.PROFILES).clear();
      } catch {}
    }

    // 2. Reconcile Assessments
    const pendingAssessments = getLocalQueue<any>(LOCAL_FALLBACK_KEYS.ASSESSMENTS);
    for (const item of pendingAssessments) {
      try {
        if (item.userId) {
          await saveFirestorePrediction(item.userId, item);
          syncedCount++;
        }
      } catch (err: any) {
        errors.push(`Assessment sync: ${err?.message || 'Unknown error'}`);
      }
    }
    setLocalQueue(LOCAL_FALLBACK_KEYS.ASSESSMENTS, []);
    if (db) {
      try {
        const tx = db.transaction(STORES.ASSESSMENTS, 'readwrite');
        tx.objectStore(STORES.ASSESSMENTS).clear();
      } catch {}
    }

    // 3. Reconcile Symptom Logs
    const pendingSymptoms = getLocalQueue<DailySymptomLog>(LOCAL_FALLBACK_KEYS.SYMPTOMS);
    if (pendingSymptoms.length > 0) {
      // Sync into main daily symptom repository
      const existing = getDailySymptomLogs();
      const existingMap = new Map(existing.map(s => [s.id, s]));
      pendingSymptoms.forEach(s => existingMap.set(s.id, s));
      const merged = Array.from(existingMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      try {
        localStorage.setItem('pcosense_daily_symptoms', JSON.stringify(merged));
        syncedCount += pendingSymptoms.length;
      } catch {}
    }
    setLocalQueue(LOCAL_FALLBACK_KEYS.SYMPTOMS, []);
    if (db) {
      try {
        const tx = db.transaction(STORES.SYMPTOMS, 'readwrite');
        tx.objectStore(STORES.SYMPTOMS).clear();
      } catch {}
    }

    if (syncedCount > 0) {
      localStorage.setItem('pcosense_last_sync_time', new Date().toISOString());
    }
  } catch (err: any) {
    errors.push(err?.message || 'General sync failure');
  } finally {
    isReconciling = false;
    notifySyncStatusChange(false);
  }

  return { syncedCount, errors };
}

function notifySyncStatusChange(syncing: boolean = false): void {
  if (typeof window === 'undefined') return;
  getPendingQueueStatus().then(status => {
    const lastSync = localStorage.getItem('pcosense_last_sync_time');
    window.dispatchEvent(
      new CustomEvent('pcosense-sync-status', {
        detail: {
          ...status,
          isSyncing: syncing,
          lastSyncTime: lastSync
        }
      })
    );
  });
}

// Setup automated background sync event listeners
export function initOfflineSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnlineSync = () => {
    reconcilePendingSyncQueue().then(res => {
      if (res.syncedCount > 0) {
        console.log(`[PCOSense Sync] Background sync completed: ${res.syncedCount} items reconciled.`);
      }
    });
  };

  window.addEventListener('online', handleOnlineSync);

  // Check periodically every 60 seconds if online
  const intervalId = setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      getPendingQueueStatus().then(status => {
        if (status.totalPending > 0 && !isReconciling) {
          reconcilePendingSyncQueue();
        }
      });
    }
  }, 60000);

  // Perform initial reconciliation if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    reconcilePendingSyncQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnlineSync);
    clearInterval(intervalId);
  };
}
