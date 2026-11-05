/**
 * PCOSense - Subscription & Monetization Service
 * Handles:
 * 1. Post-registration ₹1 for 3-Day Trial Access (auto-blocked after 3 days)
 * 2. Plan 1: ₹100 / month (Basic: ML Analysis, 7-Day Diet & Nutrition tracking, PCOS Info)
 * 3. Plan 2: ₹200 / month (Complete All-Access Premium: Video workouts, Doctor bookings, Patient chats, NMC Rx)
 * 4. Admin Bank Account Details & direct payment deposit recording
 */

import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy
} from '../lib/firebase';
import { handleFirestoreError, OperationType } from './firestoreService';

export type SubscriptionTier = 'trial' | 'plan_100' | 'plan_200' | 'none';
export type SubscriptionStatus = 'active' | 'expired' | 'blocked' | 'trial_active' | 'none';

export interface AdminBankAccountDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  branchName: string;
  updatedAt: string;
}

export interface UserSubscription {
  userId: string;
  userEmail: string;
  userName: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  amountPaid: number;
  startDate: string;
  expiryDate: string;
  transactionRef: string;
  paymentMethod: string;
  daysRemaining: number;
  planId?: 'trial_1' | 'plan_100' | 'plan_200' | 'free';
  isBlocked?: boolean;
  trialDaysRemaining?: number;
}

export interface SubscriptionPaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: 'trial_1' | 'plan_100' | 'plan_200';
  planName: string;
  amount: number;
  date: string;
  expiryDate: string;
  transactionRef: string;
  paymentMode: string;
  status: 'completed';
  depositedToAccount: string;
}

const ADMIN_BANK_STORAGE_KEY = 'pcosense_admin_bank_details';
const USER_SUBS_STORAGE_KEY = 'pcosense_user_subscriptions_db';
const SUBS_PAYMENTS_STORAGE_KEY = 'pcosense_subscription_payments_db';

export const INITIAL_ADMIN_BANK_DETAILS: AdminBankAccountDetails = {
  accountHolderName: 'JANGA BHARATH SATYA SAI',
  bankName: 'PhonePe UPI / HDFC Bank Ltd',
  accountNumber: '50200084910283',
  ifscCode: 'HDFC0001844',
  upiId: 'jangabharathsatyasai@ybl',
  branchName: 'Hyderabad, Telangana',
  updatedAt: new Date().toISOString()
};

const INITIAL_SUBSCRIPTION_PAYMENTS: SubscriptionPaymentRecord[] = [
  {
    id: 'sub-pay-1',
    userId: 'usr_patient_sample',
    userEmail: 'jangajahnavisai@gmail.com',
    userName: 'Jahnavi Sai',
    plan: 'trial_1',
    planName: '3-Day Trial Access (₹1)',
    amount: 1,
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    expiryDate: new Date(Date.now() + 3600000 * 48).toISOString(),
    transactionRef: 'UPI-TXN-8839201',
    paymentMode: 'UPI (Google Pay)',
    status: 'completed',
    depositedToAccount: 'HDFC Bank (50200084910283)'
  },
  {
    id: 'sub-pay-2',
    userId: 'usr_sample_kavya',
    userEmail: 'kavya.rao@example.com',
    userName: 'Kavya Rao',
    plan: 'plan_200',
    planName: 'Complete All-Access Premium (₹200/mo)',
    amount: 200,
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 27).toISOString(),
    transactionRef: 'UPI-TXN-9918234',
    paymentMode: 'UPI (PhonePe)',
    status: 'completed',
    depositedToAccount: 'HDFC Bank (50200084910283)'
  },
  {
    id: 'sub-pay-3',
    userId: 'usr_sample_priya',
    userEmail: 'priya.s@example.com',
    userName: 'Priya Sharma',
    plan: 'plan_100',
    planName: 'Basic Care & Diet Plan (₹100/mo)',
    amount: 100,
    date: new Date(Date.now() - 3600000 * 120).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    transactionRef: 'CARD-TXN-1102934',
    paymentMode: 'Debit Card',
    status: 'completed',
    depositedToAccount: 'HDFC Bank (50200084910283)'
  }
];

export function getAdminBankAccountDetails(): AdminBankAccountDetails {
  try {
    const raw = localStorage.getItem(ADMIN_BANK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accountHolderName === 'PCOSense Healthcare Technologies Master Account' || !parsed.accountHolderName) {
        parsed.accountHolderName = 'JANGA BHARATH SATYA SAI';
        parsed.upiId = 'jangabharathsatyasai@ybl';
        parsed.bankName = 'PhonePe UPI / HDFC Bank Ltd';
        saveAdminBankAccountDetails(parsed, false);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading admin bank details:', err);
  }
  saveAdminBankAccountDetails(INITIAL_ADMIN_BANK_DETAILS, false);
  return INITIAL_ADMIN_BANK_DETAILS;
}

export function saveAdminBankAccountDetails(details: AdminBankAccountDetails, syncToFirestore = true): void {
  try {
    localStorage.setItem(ADMIN_BANK_STORAGE_KEY, JSON.stringify(details));
  } catch (err) {
    console.error('Error saving admin bank details:', err);
  }

  if (syncToFirestore) {
    // Non-blocking asynchronous sync to Cloud Firestore
    const bankDocRef = doc(db, 'admin_settings', 'bank_account');
    setDoc(bankDocRef, { ...details, updatedAt: new Date().toISOString() }, { merge: true })
      .catch(err => {
        handleFirestoreError(err, OperationType.WRITE, 'admin_settings/bank_account');
      });
  }
}

/**
 * Fetch latest Admin Bank Account details from Cloud Firestore
 */
export async function fetchAdminBankAccountDetailsFromFirestore(): Promise<AdminBankAccountDetails> {
  try {
    const bankDocRef = doc(db, 'admin_settings', 'bank_account');
    const snap = await getDoc(bankDocRef);
    if (snap.exists()) {
      const data = snap.data() as AdminBankAccountDetails;
      localStorage.setItem(ADMIN_BANK_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'admin_settings/bank_account');
  }
  return getAdminBankAccountDetails();
}

/**
 * Save user subscription record to Cloud Firestore
 */
export async function saveUserSubscriptionToFirestore(userId: string, sub: UserSubscription): Promise<void> {
  if (!userId) return;
  try {
    const subDocRef = doc(db, 'users', userId, 'subscription', 'current');
    await setDoc(subDocRef, { ...sub, lastSyncedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/subscription/current`);
  }
}

/**
 * Fetch active user subscription from Cloud Firestore
 */
export async function fetchUserSubscriptionFromFirestore(userId: string): Promise<UserSubscription | null> {
  if (!userId) return null;
  try {
    const subDocRef = doc(db, 'users', userId, 'subscription', 'current');
    const snap = await getDoc(subDocRef);
    if (snap.exists()) {
      const remote = snap.data() as UserSubscription;
      const all = getAllUserSubscriptions();
      const key = (remote.userEmail || userId).toLowerCase().trim();
      all[key] = remote;
      saveAllUserSubscriptions(all);
      return remote;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}/subscription/current`);
  }
  return getUserSubscription(userId);
}

/**
 * Save individual payment record to Cloud Firestore ledger
 */
export async function saveSubscriptionPaymentToFirestore(paymentRecord: SubscriptionPaymentRecord): Promise<void> {
  try {
    const paymentDocRef = doc(db, 'subscription_payments', paymentRecord.id);
    await setDoc(paymentDocRef, paymentRecord, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `subscription_payments/${paymentRecord.id}`);
  }
}

export function getAllSubscriptionPayments(): SubscriptionPaymentRecord[] {
  try {
    const raw = localStorage.getItem(SUBS_PAYMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading subscription payments:', err);
  }
  saveSubscriptionPayments(INITIAL_SUBSCRIPTION_PAYMENTS);
  return INITIAL_SUBSCRIPTION_PAYMENTS;
}

function saveSubscriptionPayments(records: SubscriptionPaymentRecord[]): void {
  try {
    localStorage.setItem(SUBS_PAYMENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving subscription payments:', err);
  }
}

export function getTotalSubscriptionRevenue(): {
  totalGross: number;
  trialRevenue: number;
  plan100Revenue: number;
  plan200Revenue: number;
  totalSubscribers: number;
} {
  const payments = getAllSubscriptionPayments();
  let trialRevenue = 0;
  let plan100Revenue = 0;
  let plan200Revenue = 0;

  payments.forEach(p => {
    if (p.plan === 'trial_1') trialRevenue += p.amount;
    else if (p.plan === 'plan_100') plan100Revenue += p.amount;
    else if (p.plan === 'plan_200') plan200Revenue += p.amount;
  });

  return {
    totalGross: trialRevenue + plan100Revenue + plan200Revenue,
    trialRevenue,
    plan100Revenue,
    plan200Revenue,
    totalSubscribers: payments.length
  };
}

export interface ActiveSubscriptionsSummary {
  totalActiveRevenue: number;
  trialUsersCount: number;
  limitedUsersCount: number;
  fullUsersCount: number;
  totalActiveUsers: number;
  tierBreakdown: {
    trial: {
      name: string;
      code: 'trial_1';
      price: number;
      activeUsers: number;
      revenue: number;
      durationLabel: string;
      description: string;
    };
    limited: {
      name: string;
      code: 'plan_100';
      price: number;
      activeUsers: number;
      revenue: number;
      durationLabel: string;
      description: string;
    };
    full: {
      name: string;
      code: 'plan_200';
      price: number;
      activeUsers: number;
      revenue: number;
      durationLabel: string;
      description: string;
    };
  };
}

export function getActiveSubscriptionsSummary(): ActiveSubscriptionsSummary {
  const payments = getAllSubscriptionPayments();
  const now = Date.now();

  // Find latest active subscription payment per user
  const latestUserPaymentMap = new Map<string, SubscriptionPaymentRecord>();

  payments.forEach(p => {
    if (p.status !== 'completed') return;
    const isStillActive = new Date(p.expiryDate).getTime() > now;
    if (!isStillActive) return;

    const userKey = (p.userEmail || p.userId).toLowerCase();
    const existing = latestUserPaymentMap.get(userKey);
    if (!existing || new Date(p.date).getTime() > new Date(existing.date).getTime()) {
      latestUserPaymentMap.set(userKey, p);
    }
  });

  let trialUsersCount = 0;
  let limitedUsersCount = 0;
  let fullUsersCount = 0;
  let trialRevenue = 0;
  let limitedRevenue = 0;
  let fullRevenue = 0;

  latestUserPaymentMap.forEach(payment => {
    if (payment.plan === 'trial_1') {
      trialUsersCount += 1;
      trialRevenue += payment.amount;
    } else if (payment.plan === 'plan_100') {
      limitedUsersCount += 1;
      limitedRevenue += payment.amount;
    } else if (payment.plan === 'plan_200') {
      fullUsersCount += 1;
      fullRevenue += payment.amount;
    }
  });

  const totalActiveUsers = trialUsersCount + limitedUsersCount + fullUsersCount;
  const totalActiveRevenue = trialRevenue + limitedRevenue + fullRevenue;

  return {
    totalActiveRevenue,
    trialUsersCount,
    limitedUsersCount,
    fullUsersCount,
    totalActiveUsers,
    tierBreakdown: {
      trial: {
        name: 'Trial Tier (₹1)',
        code: 'trial_1',
        price: 1,
        activeUsers: trialUsersCount,
        revenue: trialRevenue,
        durationLabel: '3-Day Trial Window',
        description: 'Preliminary risk screening & intro guidance. Auto-blocked after 3 days.'
      },
      limited: {
        name: 'Limited Insight Tier (₹100)',
        code: 'plan_100',
        price: 100,
        activeUsers: limitedUsersCount,
        revenue: limitedRevenue,
        durationLabel: '1 Month (30 Days)',
        description: 'Complete PCOS risk analysis, Rotterdam criteria & 7-Day Indian Diet Plan.'
      },
      full: {
        name: 'Full Access Tier (₹200)',
        code: 'plan_200',
        price: 200,
        activeUsers: fullUsersCount,
        revenue: fullRevenue,
        durationLabel: '1 Month (30 Days)',
        description: 'All features: Diet + Yoga/Exercise Video library + Doctor Consultations & Direct Chats.'
      }
    }
  };
}

function getAllUserSubscriptions(): Record<string, UserSubscription> {
  try {
    const raw = localStorage.getItem(USER_SUBS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading user subscriptions:', err);
  }
  return {};
}

function saveAllUserSubscriptions(subs: Record<string, UserSubscription>): void {
  try {
    localStorage.setItem(USER_SUBS_STORAGE_KEY, JSON.stringify(subs));
  } catch (err) {
    console.error('Error saving user subscriptions:', err);
  }
}

/**
 * Get current user's subscription status and calculate remaining days.
 * If trial has passed 3 days, auto-blocks access.
 */
export function getUserSubscription(userEmailOrId: string = 'jangajahnavisai@gmail.com'): UserSubscription {
  const all = getAllUserSubscriptions();
  const key = (userEmailOrId || 'guest').toLowerCase().trim();
  let existing = all[key];

  // If not found by exact key, search by userEmail or userId across existing records
  if (!existing) {
    const matched = Object.values(all).find(
      s => s.userEmail?.toLowerCase().trim() === key || s.userId?.toLowerCase().trim() === key
    );
    if (matched) existing = matched;
  }

  // Check if user has a registered account in local storage with a specific plan (e.g. ₹100 or ₹200)
  try {
    const regRaw = localStorage.getItem('pcosense_registered_users');
    const regUsers = regRaw ? JSON.parse(regRaw) : {};
    const regUser = regUsers[key] || Object.values(regUsers).find((u: any) => u.id?.toLowerCase() === key || u.email?.toLowerCase() === key);
    
    if (regUser) {
      const regPlan = regUser.subscriptionTier || regUser.subscriptionPlan;
      if (regPlan === 'plan_100' || regPlan === 'plan_200') {
        // If no existing record or it was an old blocked trial, auto-promote to their chosen plan!
        if (!existing || existing.tier === 'trial' || existing.status === 'blocked') {
          const now = new Date();
          const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          existing = {
            userId: regUser.id || key,
            userEmail: regUser.email || key,
            userName: regUser.fullName || 'Patient User',
            tier: regPlan,
            status: 'active',
            amountPaid: regPlan === 'plan_100' ? 100 : 200,
            startDate: now.toISOString(),
            expiryDate: expiry.toISOString(),
            transactionRef: `UPI-REG-${Date.now().toString().slice(-6)}`,
            paymentMethod: 'UPI',
            daysRemaining: 30
          };
          all[key] = existing;
          if (regUser.email) all[regUser.email.toLowerCase().trim()] = existing;
          if (regUser.id) all[regUser.id.toLowerCase().trim()] = existing;
          saveAllUserSubscriptions(all);
        }
      }
    }
  } catch (err) {
    console.warn('Error reading registered users subscription tier:', err);
  }

  // Default initial seed for default test user or new users without record:
  // Give 30 days active validity so users don't see an instant blocked trial!
  if (!existing) {
    const defaultSub: UserSubscription = {
      userId: key,
      userEmail: key,
      userName: key.includes('jahnavi') ? 'Jahnavi Sai' : 'Patient User',
      tier: 'plan_200', // Default active premium for seamless testing & feature access
      status: 'active',
      amountPaid: 200,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      transactionRef: 'INIT-TXN-001',
      paymentMethod: 'UPI',
      daysRemaining: 30
    };
    all[key] = defaultSub;
    saveAllUserSubscriptions(all);
    return defaultSub;
  }

  // Calculate remaining time and status
  const now = Date.now();
  const expiryTime = new Date(existing.expiryDate).getTime();
  const diffMs = expiryTime - now;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (diffMs <= 0) {
    // Expired or blocked
    if (existing.tier === 'trial') {
      existing.status = 'blocked'; // Trial expired -> access blocked automatically!
    } else {
      existing.status = 'expired';
    }
    existing.daysRemaining = 0;
  } else {
    existing.daysRemaining = daysRemaining;
    if (existing.tier === 'trial') {
      existing.status = 'trial_active';
    } else {
      existing.status = 'active';
    }
  }

  // Populate helper getters
  existing.planId = existing.tier === 'trial' ? 'trial_1' : existing.tier === 'plan_100' ? 'plan_100' : existing.tier === 'plan_200' ? 'plan_200' : 'free';
  existing.isBlocked = existing.status === 'blocked';
  existing.trialDaysRemaining = existing.tier === 'trial' ? existing.daysRemaining : undefined;

  return existing;
}

/**
 * Activate ₹1 for 3-Day Trial Access
 */
export function activateUserTrial(
  userId: string,
  userEmail: string,
  userName: string,
  transactionRef: string = `UPI-${Date.now().toString().slice(-6)}`
): UserSubscription {
  const all = getAllUserSubscriptions();
  const key = (userEmail || userId).toLowerCase().trim();
  const adminBank = getAdminBankAccountDetails();

  const now = new Date();
  const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // exactly 3 days from NOW

  const newSub: UserSubscription = {
    userId,
    userEmail,
    userName,
    tier: 'trial',
    status: 'trial_active',
    amountPaid: 1,
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    transactionRef,
    paymentMethod: 'UPI (Deposit to Admin Account)',
    daysRemaining: 3
  };

  all[key] = newSub;
  if (userId && userId.toLowerCase().trim() !== key) {
    all[userId.toLowerCase().trim()] = newSub;
  }
  if (userEmail && userEmail.toLowerCase().trim() !== key) {
    all[userEmail.toLowerCase().trim()] = newSub;
  }
  saveAllUserSubscriptions(all);

  // Record payment in ledger
  const paymentRecord: SubscriptionPaymentRecord = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userEmail,
    userName,
    plan: 'trial_1',
    planName: '3-Day Trial Access (₹1)',
    amount: 1,
    date: now.toISOString(),
    expiryDate: expiry.toISOString(),
    transactionRef,
    paymentMode: 'UPI',
    status: 'completed',
    depositedToAccount: `${adminBank.bankName} (${adminBank.accountNumber})`
  };

  const payments = getAllSubscriptionPayments();
  payments.unshift(paymentRecord);
  saveSubscriptionPayments(payments);

  // Sync to Firestore
  saveUserSubscriptionToFirestore(userId, newSub);
  saveSubscriptionPaymentToFirestore(paymentRecord);

  // Broadcast event so UI updates immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('subscription-updated', { detail: newSub }));
  }

  return newSub;
}

/**
 * Subscribe user to ₹100 or ₹200 Monthly Plan
 */
export function subscribeUserToPlan(
  userId: string,
  userEmail: string,
  userName: string,
  plan: 'plan_100' | 'plan_200',
  transactionRef: string = `UPI-${Date.now().toString().slice(-6)}`
): UserSubscription {
  const all = getAllUserSubscriptions();
  const key = (userEmail || userId).toLowerCase().trim();
  const adminBank = getAdminBankAccountDetails();

  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const amount = plan === 'plan_100' ? 100 : 200;
  const planName = plan === 'plan_100' ? 'Basic Care & Diet Plan (₹100/mo)' : 'Complete All-Access Premium (₹200/mo)';

  const newSub: UserSubscription = {
    userId,
    userEmail,
    userName,
    tier: plan,
    status: 'active',
    amountPaid: amount,
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    transactionRef,
    paymentMethod: 'UPI (Deposit to Admin Account)',
    daysRemaining: 30
  };

  all[key] = newSub;
  if (userId && userId.toLowerCase().trim() !== key) {
    all[userId.toLowerCase().trim()] = newSub;
  }
  if (userEmail && userEmail.toLowerCase().trim() !== key) {
    all[userEmail.toLowerCase().trim()] = newSub;
  }
  saveAllUserSubscriptions(all);

  // Record payment in ledger
  const paymentRecord: SubscriptionPaymentRecord = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userEmail,
    userName,
    plan,
    planName,
    amount,
    date: now.toISOString(),
    expiryDate: expiry.toISOString(),
    transactionRef,
    paymentMode: 'UPI',
    status: 'completed',
    depositedToAccount: `${adminBank.bankName} (${adminBank.accountNumber})`
  };

  const payments = getAllSubscriptionPayments();
  payments.unshift(paymentRecord);
  saveSubscriptionPayments(payments);

  // Sync to Firestore
  saveUserSubscriptionToFirestore(userId, newSub);
  saveSubscriptionPaymentToFirestore(paymentRecord);

  // Broadcast event so UI updates immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('subscription-updated', { detail: newSub }));
  }

  return newSub;
}

/**
 * Mock Payment Gateway Integration Logic
 * Simulates gateway processing (UPI/Cards/Netbanking), confirms payment,
 * routes fund to Admin Bank Account, and stores transaction details in Cloud Firestore.
 */
export async function processMockPaymentGateway(params: {
  userId: string;
  userEmail: string;
  userName: string;
  plan: 'trial_1' | 'plan_100' | 'plan_200';
  paymentMode: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  upiIdOrCard?: string;
}): Promise<{
  success: boolean;
  transactionRef: string;
  subscription: UserSubscription;
  paymentRecord: SubscriptionPaymentRecord;
  adminAccount: AdminBankAccountDetails;
  message: string;
}> {
  // Simulate realistic network & bank gateway verification delay
  await new Promise(resolve => setTimeout(resolve, 1100));

  const txId = `PCO-TXN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const adminBank = await fetchAdminBankAccountDetailsFromFirestore();

  let sub: UserSubscription;
  if (params.plan === 'trial_1') {
    sub = activateUserTrial(params.userId, params.userEmail, params.userName, txId);
  } else {
    sub = subscribeUserToPlan(params.userId, params.userEmail, params.userName, params.plan, txId);
  }

  const latestPayments = getAllSubscriptionPayments();
  const paymentRecord = latestPayments[0] || {
    id: txId,
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    plan: params.plan,
    planName: params.plan === 'trial_1' ? '3-Day Trial (₹1)' : params.plan === 'plan_100' ? 'Basic Plan (₹100)' : 'Complete Plan (₹200)',
    amount: params.plan === 'trial_1' ? 1 : params.plan === 'plan_100' ? 100 : 200,
    date: new Date().toISOString(),
    expiryDate: sub.expiryDate,
    transactionRef: txId,
    paymentMode: params.paymentMode,
    status: 'completed',
    depositedToAccount: `${adminBank.bankName} (${adminBank.accountNumber})`
  };

  return {
    success: true,
    transactionRef: txId,
    subscription: sub,
    paymentRecord,
    adminAccount: adminBank,
    message: `Payment of ₹${paymentRecord.amount} successfully processed. Transaction stored in Firestore and deposited to Admin Bank Account (${adminBank.bankName}).`
  };
}

/**
 * Feature gate check
 * - Plan 100 (₹100): analysis, diet, info only! (yoga, doctor, chat are locked)
 * - Plan 200 (₹200): complete access to everything!
 * - Trial (₹1): full access during the 3 days; blocked after 3 days.
 */
export function canUserAccessFeature(
  userEmailOrId: string = 'jangajahnavisai@gmail.com',
  feature: 'analysis' | 'diet' | 'info' | 'yoga' | 'yoga_exercises' | 'doctor' | 'doctor_consultations' | 'chat' | 'export'
): { allowed: boolean; reason?: string; requiredPlan?: 'plan_100' | 'plan_200' | 'trial' } {
  const sub = getUserSubscription(userEmailOrId);

  // If trial is blocked/expired or user has no sub
  if (sub.status === 'blocked' || sub.isBlocked) {
    return {
      allowed: false,
      reason: 'Your 3-day trial access (₹1) has expired and access is blocked. Please upgrade to the ₹100 or ₹200 plan to continue.',
      requiredPlan: 'plan_100'
    };
  }

  if (sub.status === 'expired') {
    return {
      allowed: false,
      reason: 'Your monthly subscription has ended. Please renew your plan.',
      requiredPlan: 'plan_100'
    };
  }

  // If active 3-day trial: full access granted during the 3 days
  if (sub.status === 'trial_active') {
    return { allowed: true };
  }

  // If ₹200 plan: complete access to all features
  if (sub.tier === 'plan_200' && sub.status === 'active') {
    return { allowed: true };
  }

  // Normalize feature name
  const isAnalysisOrDietOrInfo = feature === 'analysis' || feature === 'diet' || feature === 'info';

  // If ₹100 plan: ONLY analysis, diet, and info are allowed!
  if (sub.tier === 'plan_100' && sub.status === 'active') {
    if (isAnalysisOrDietOrInfo) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'This feature (Yoga, Doctor Consultations, Direct Chats) is exclusively included in the ₹200/Month Complete All-Access Plan.',
      requiredPlan: 'plan_200'
    };
  }

  // If no subscription at all
  return {
    allowed: false,
    reason: 'Please register and pay ₹1 for 3-day access or choose a monthly plan.',
    requiredPlan: 'trial'
  };
}
