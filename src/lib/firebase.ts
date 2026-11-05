/**
 * Firebase Client Initialization & Utilities
 * Provides Firebase Authentication (Google Sign-In + Email/Password)
 * and Cloud Firestore integration for user profiles and prediction history.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore with forced long polling to ensure reliable connectivity in iframe sandboxes
const dbId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? firebaseConfigData.firestoreDatabaseId
  : undefined;

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);
} catch {
  firestoreDb = getFirestore(app, dbId);
}

export const db: Firestore = firestoreDb;

// Test Firestore connection on boot (non-blocking verification)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // Backend reached and evaluating rules
      return;
    }
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore operating in offline cache mode or connecting in background.");
    }
  }
}
testConnection();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  fbUpdateProfile,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy
};

export type { FirebaseUser };
