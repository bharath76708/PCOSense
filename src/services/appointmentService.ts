/**
 * PCOSense - Appointment & Platform Commission Service
 * Manages patient bookings, time slots, payment statuses, and
 * 20% Platform Commission calculations on completed consultations.
 */

import { AppointmentRecord, AppointmentStatus, ConsultationRecord, PaymentStatus, NMCPrescription } from '../types';
import { logAuditEvent } from './complianceService';
import { sendAppointmentWhatsAppNotification } from './whatsappService';

const APPOINTMENTS_STORAGE_KEY = 'pcosense_appointments_db';
const CONSULTATIONS_STORAGE_KEY = 'pcosense_consultations_db';
export const PLATFORM_COMMISSION_PERCENTAGE = 20; // 20% Platform Commission

// Seed initial sample appointments for realistic platform preview
const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-seed-1',
    userId: 'usr_patient_sample',
    userName: 'Jahnavi Sai',
    userEmail: 'jangajahnavisai@gmail.com',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    doctorSpecialization: 'Gynecologist & PCOS Specialist',
    doctorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    clinic: "Apollo Fertility & Women's Health Institute",
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlot: '10:30 AM - 11:00 AM',
    amount: 900,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'UPI (Google Pay)',
    paymentTransactionId: 'TXN-UPI-992381',
    notes: 'Experiencing irregular 42-day cycles and suspected ovarian cysts. Requesting pelvic ultrasound review.',
    hasSharedHealthReport: true,
    sharedHealthReportId: 'rep-jahnavi-latest',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'apt-seed-2',
    userId: 'usr_patient_2',
    userName: 'Kavya Rao',
    userEmail: 'kavya.rao@example.com',
    doctorId: 'doc-priya-nambiar',
    doctorName: 'Dr. Priya V. Nambiar, MD, DM',
    doctorSpecialization: 'Reproductive Endocrinologist',
    doctorPhoto: 'https://images.unsplash.com/photo-1594824813681-30c239460a4f?auto=format&fit=crop&q=80&w=400',
    clinic: 'Care Hospitals Endocrine Sciences Wing',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '11:30 AM - 12:00 PM',
    amount: 1000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    paymentTransactionId: 'TXN-CARD-441209',
    notes: 'Insulin fasting workup and thyroid TSH review.',
    hasSharedHealthReport: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'apt-seed-3',
    userId: 'usr_patient_3',
    userName: 'Pooja Verma',
    userEmail: 'pooja.v@example.com',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    doctorSpecialization: 'Gynecologist & PCOS Specialist',
    doctorPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    clinic: "Apollo Fertility & Women's Health Institute",
    appointmentDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    timeSlot: '04:00 PM - 04:30 PM',
    amount: 900,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    paymentTransactionId: 'TXN-UPI-102948',
    notes: 'Follow-up on cycle regularisation with inositol and myo-d-chiro ratio.',
    hasSharedHealthReport: true,
    sharedHealthReportId: 'rep-pooja-prev',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Seed initial consultation records for completed visits
const INITIAL_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'con-seed-1',
    userId: 'usr_patient_3',
    userName: 'Pooja Verma',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    appointmentId: 'apt-seed-3',
    amount: 900,
    status: 'completed',
    paymentStatus: 'paid',
    commissionPercentage: 20,
    commissionAmount: 180, // 20% platform commission
    doctorAmount: 720, // 80% doctor payout
    clinicalNotes: 'Ultrasound confirmed mild bilateral polycystic ovarian morphology without dominant follicles. Advised 40:1 Myo-to-D-Chiro Inositol supplementation, Mediterranean low-GI diet, and 30 mins brisk walking.',
    prescription: '1. Myo-Inositol + D-Chiro Inositol (40:1) 2000mg twice daily with meals\n2. Vitamin D3 60,000 IU once weekly for 8 weeks\n3. Omega-3 Fish Oil 1000mg daily',
    recommendations: [
      'Maintain 8,000+ daily steps consistency',
      'Follow low-GI anti-inflammatory nutrition plan',
      'Repeat pelvic ultrasound after 90 days'
    ],
    completedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export function getStoredAppointments(): AppointmentRecord[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading appointments:', err);
  }
  saveAppointmentsToStorage(INITIAL_APPOINTMENTS);
  return INITIAL_APPOINTMENTS;
}

export function saveAppointmentsToStorage(appointments: AppointmentRecord[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error('Error saving appointments:', err);
  }
}

export function getStoredConsultations(): ConsultationRecord[] {
  try {
    const raw = localStorage.getItem(CONSULTATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading consultations:', err);
  }
  saveConsultationsToStorage(INITIAL_CONSULTATIONS);
  return INITIAL_CONSULTATIONS;
}

export function saveConsultationsToStorage(consultations: ConsultationRecord[]): void {
  try {
    localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(consultations));
  } catch (err) {
    console.error('Error saving consultations:', err);
  }
}

/**
 * Book a new appointment
 */
export function bookAppointment(params: {
  userId: string;
  userName: string;
  userEmail?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorPhoto?: string;
  clinic?: string;
  appointmentDate: string;
  timeSlot: string;
  amount: number;
  notes?: string;
  paymentMethod?: string;
  hasSharedHealthReport?: boolean;
  sharedHealthReportId?: string;
}): AppointmentRecord {
  const all = getStoredAppointments();
  const newAppointment: AppointmentRecord = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    doctorSpecialization: params.doctorSpecialization,
    doctorPhoto: params.doctorPhoto,
    clinic: params.clinic,
    appointmentDate: params.appointmentDate,
    timeSlot: params.timeSlot,
    amount: params.amount,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: params.paymentMethod || 'UPI',
    paymentTransactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: params.notes,
    hasSharedHealthReport: !!params.hasSharedHealthReport,
    sharedHealthReportId: params.sharedHealthReportId,
    createdAt: new Date().toISOString()
  };

  all.unshift(newAppointment);
  saveAppointmentsToStorage(all);

  // Send WhatsApp confirmation if user has opted in
  try {
    sendAppointmentWhatsAppNotification(newAppointment, params.userId).catch(() => {});
  } catch (err) {
    console.warn('WhatsApp appointment notification error:', err);
  }

  return newAppointment;
}

/**
 * Update appointment status (e.g. completed, cancelled)
 */
export function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): AppointmentRecord | null {
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === appointmentId);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    status,
    updatedAt: new Date().toISOString()
  };
  saveAppointmentsToStorage(all);

  // Send WhatsApp confirmation if status changed to confirmed
  if (status === 'confirmed') {
    try {
      sendAppointmentWhatsAppNotification(all[index], all[index].userId).catch(() => {});
    } catch {}
  }

  return all[index];
}

/**
 * Complete a consultation & calculate Platform Commission
 * Consultation fee: e.g. ₹500
 * Platform Commission (20%): ₹100
 * Doctor Earnings: ₹400
 */
export function completeConsultation(params: {
  appointmentId: string;
  clinicalNotes: string;
  prescription?: string;
  nmcPrescription?: NMCPrescription;
  recommendations?: string[];
}): ConsultationRecord {
  const appointments = getStoredAppointments();
  const aptIndex = appointments.findIndex(a => a.id === params.appointmentId);
  if (aptIndex === -1) {
    throw new Error('Appointment not found');
  }

  const apt = appointments[aptIndex];
  apt.status = 'completed';
  apt.updatedAt = new Date().toISOString();
  saveAppointmentsToStorage(appointments);

  const amount = apt.amount;
  const commissionPercentage = PLATFORM_COMMISSION_PERCENTAGE;
  const commissionAmount = Math.round((amount * commissionPercentage) / 100);
  const doctorAmount = amount - commissionAmount;

  const consultation: ConsultationRecord = {
    id: `con-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: apt.userId,
    userName: apt.userName,
    doctorId: apt.doctorId,
    doctorName: apt.doctorName,
    appointmentId: apt.id,
    amount,
    status: 'completed',
    paymentStatus: 'paid',
    commissionPercentage,
    commissionAmount,
    doctorAmount,
    clinicalNotes: params.clinicalNotes,
    prescription: params.prescription,
    nmcPrescription: params.nmcPrescription,
    recommendations: params.recommendations,
    completedAt: new Date().toISOString()
  };

  const consultations = getStoredConsultations();
  consultations.unshift(consultation);
  saveConsultationsToStorage(consultations);

  // Log clinical audit event per EHR Standards India (2016) & Telemedicine Practice Guidelines (2020)
  logAuditEvent({
    action: 'PRESCRIPTION_GENERATED',
    actorId: apt.doctorId,
    actorRole: 'doctor',
    actorName: apt.doctorName,
    targetRecordId: consultation.id,
    patientId: apt.userId,
    details: `Official Telemedicine Prescription (${params.nmcPrescription?.prescriptionId || 'Rx-NMC'}) issued with RMP verification hash under NMC 2020 guidelines.`,
    complianceStandard: 'TELEMEDICINE_GUIDELINES_2020'
  });

  return consultation;
}

/**
 * Get appointments filtered by User or Doctor
 */
export function getUserAppointments(userId: string): AppointmentRecord[] {
  const all = getStoredAppointments();
  return all.filter(a => a.userId === userId);
}

export function getDoctorAppointments(doctorId: string): AppointmentRecord[] {
  const all = getStoredAppointments();
  return all.filter(a => a.doctorId === doctorId || (Boolean(a.doctorId) && Boolean(doctorId) && a.doctorId.includes(doctorId)));
}

/**
 * Financial metrics for Admin Dashboard
 */
export interface PlatformFinancialStats {
  totalAppointments: number;
  completedConsultations: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  totalGrossRevenue: number;
  totalPlatformCommission: number; // 20%
  totalDoctorPayouts: number; // 80%
}

export function getPlatformFinancialStats(): PlatformFinancialStats {
  const appointments = getStoredAppointments();
  const consultations = getStoredConsultations();

  const totalAppointments = appointments.length;
  const completedConsultations = consultations.length;
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  const totalGrossRevenue = consultations.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalPlatformCommission = consultations.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);
  const totalDoctorPayouts = consultations.reduce((acc, c) => acc + (c.doctorAmount || 0), 0);

  return {
    totalAppointments,
    completedConsultations,
    upcomingAppointments,
    cancelledAppointments,
    totalGrossRevenue,
    totalPlatformCommission,
    totalDoctorPayouts
  };
}

/**
 * Doctor-specific earnings metrics
 */
export interface DoctorEarningsStats {
  totalConsultations: number;
  grossBillings: number;
  platformCommissionDeducted: number;
  netDoctorEarnings: number;
  pendingPayouts: number;
}

export function getDoctorEarnings(doctorId: string): DoctorEarningsStats {
  const consultations = getStoredConsultations().filter(c => c.doctorId === doctorId || (Boolean(c.doctorId) && Boolean(doctorId) && c.doctorId.includes(doctorId)));

  const totalConsultations = consultations.length;
  const grossBillings = consultations.reduce((acc, c) => acc + (c.amount || 0), 0);
  const platformCommissionDeducted = consultations.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);
  const netDoctorEarnings = consultations.reduce((acc, c) => acc + (c.doctorAmount || 0), 0);

  return {
    totalConsultations,
    grossBillings,
    platformCommissionDeducted,
    netDoctorEarnings,
    pendingPayouts: 0
  };
}
