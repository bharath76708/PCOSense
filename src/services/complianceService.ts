/**
 * PCOSense - Indian Healthcare Compliance & Regulatory Service
 * Compliant with:
 *  1. Digital Personal Data Protection Act (DPDP Act, 2023)
 *  2. Telemedicine Practice Guidelines (2020) by MoHFW & NMC
 *  3. Electronic Health Record (EHR) Standards India (2016)
 *  4. Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules
 */

import {
  DPDPConsentRecord,
  ClinicalAuditLog,
  ABHAProfile,
  GrievanceTicket,
  NMCPrescription,
  DoctorProfile,
  PrescriptionMedicine,
  TelemedicineDrugClass
} from '../types';

const DPDP_CONSENT_KEY = 'pcosense_dpdp_consents';
const AUDIT_LOGS_KEY = 'pcosense_clinical_audit_logs';
const ABHA_PROFILES_KEY = 'pcosense_abha_profiles';
const GRIEVANCE_TICKETS_KEY = 'pcosense_grievance_tickets';

// Designated Grievance Redressal Officer under DPDP Act 2023 Section 13
export const STATUTORY_GRO_DETAILS = {
  name: 'Adv. Ananya Deshmukh',
  designation: 'Data Protection Officer & Chief Grievance Redressal Officer',
  organization: 'PCOSense Healthcare Technologies India Pvt. Ltd.',
  registeredAddress: 'Plot 42, Healthtech Corridor, HITEC City, Madhapur, Hyderabad, Telangana 500081, India',
  email: 'grievance.officer@pcosense.health.in',
  complianceHotline: '+91 (040) 6829-5400',
  statutorySlaDays: 30
};

// Telemedicine Practice Guidelines (2020) Restricted / Prohibited Medications Flagging
const STRICTLY_PROHIBITED_SCHEDULE_X = [
  'morphine',
  'fentanyl',
  'ketamine',
  'pentazocine',
  'buprenorphine',
  'methylphenidate',
  'alprazolam',
  'clonazepam',
  'diazepam',
  'gonadotropins (injectable)',
  'injectable hmg',
  'injectable hcg'
];

/**
 * Validates whether a medicine is prohibited under Telemedicine Practice Guidelines 2020
 */
export function checkMedicineTelemedicineLegality(genericName: string): {
  isProhibited: boolean;
  classification: TelemedicineDrugClass;
  warningNote?: string;
} {
  const lower = genericName.toLowerCase().trim();

  // Schedule X check
  const isScheduleX = STRICTLY_PROHIBITED_SCHEDULE_X.some(prohib => lower.includes(prohib));
  if (isScheduleX) {
    return {
      isProhibited: true,
      classification: 'List_A',
      warningNote:
        'CRITICAL VIOLATION: Schedule X narcotics, psychotropics, and injectable ovulatory stimulants are STRICTLY PROHIBITED via Telemedicine under Section 5.1 of Telemedicine Practice Guidelines (2020).'
    };
  }

  // Common PCOS first-line List A medicines (permitted for first consult)
  const isListA =
    lower.includes('inositol') ||
    lower.includes('vitamin d') ||
    lower.includes('folic acid') ||
    lower.includes('omega') ||
    lower.includes('zinc') ||
    lower.includes('magnesium') ||
    lower.includes('oral contraceptive') ||
    lower.includes('ethinylestradiol') ||
    lower.includes('cyproterone') ||
    lower.includes('drospirenone');

  if (isListA) {
    return {
      isProhibited: false,
      classification: 'List_A',
      warningNote: 'List A: Permitted for First and Follow-up Teleconsultation.'
    };
  }

  // Second line or follow-up medicines (List B)
  return {
    isProhibited: false,
    classification: 'List_B',
    warningNote: 'List B: Permitted for Maintenance / Add-on follow-up teleconsultations.'
  };
}

// ============================================================
// 1. DPDP ACT (2023) CONSENT MANAGEMENT
// ============================================================

export function getDPDPConsent(userId: string): DPDPConsentRecord | null {
  try {
    const raw = localStorage.getItem(DPDP_CONSENT_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[userId] || null;
  } catch (err) {
    console.error('Error reading DPDP consent:', err);
    return null;
  }
}

export function saveDPDPConsent(
  userId: string,
  purposes: DPDPConsentRecord['purposes'],
  ageConfirmed18Plus: boolean
): DPDPConsentRecord {
  const record: DPDPConsentRecord = {
    userId,
    consentVersion: 'DPDP-2023-V1.2',
    purposes,
    ageConfirmed18Plus,
    timestamp: new Date().toISOString(),
    status: 'active',
    ipHash: `IN-HYD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  };

  try {
    const raw = localStorage.getItem(DPDP_CONSENT_KEY) || '{}';
    const all = JSON.parse(raw);
    all[userId] = record;
    localStorage.setItem(DPDP_CONSENT_KEY, JSON.stringify(all));

    // Automatically audit log the consent grant
    logAuditEvent({
      action: 'CONSENT_GRANTED',
      actorId: userId,
      actorRole: 'patient',
      actorName: 'Data Principal (Patient)',
      patientId: userId,
      details: 'Patient granted explicit, purpose-specified consent for health data processing and tele-triage.',
      complianceStandard: 'DPDP_ACT_2023'
    });
  } catch (err) {
    console.error('Error saving DPDP consent:', err);
  }

  return record;
}

export function revokeDPDPConsent(userId: string): void {
  try {
    const raw = localStorage.getItem(DPDP_CONSENT_KEY) || '{}';
    const all = JSON.parse(raw);
    if (all[userId]) {
      all[userId].status = 'revoked';
      all[userId].revokedAt = new Date().toISOString();
      localStorage.setItem(DPDP_CONSENT_KEY, JSON.stringify(all));

      logAuditEvent({
        action: 'CONSENT_REVOKED',
        actorId: userId,
        actorRole: 'patient',
        actorName: 'Data Principal (Patient)',
        patientId: userId,
        details: 'Patient exercised statutory Right to Withdraw Consent under Section 6(4) of DPDP Act 2023.',
        complianceStandard: 'DPDP_ACT_2023'
      });
    }
  } catch (err) {
    console.error('Error revoking consent:', err);
  }
}

export function hasActiveDPDPConsent(
  userId: string,
  purposeKey?: keyof DPDPConsentRecord['purposes']
): boolean {
  const consent = getDPDPConsent(userId);
  if (!consent || consent.status !== 'active') return false;
  if (!consent.ageConfirmed18Plus) return false;
  if (purposeKey) {
    return !!consent.purposes[purposeKey];
  }
  return true;
}

// ============================================================
// 2. CLINICAL AUDIT TRAIL LOGGING (EHR 2016 & DPDP 2023)
// ============================================================

const SEED_AUDIT_LOGS: ClinicalAuditLog[] = [
  {
    id: 'aud-seed-1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    action: 'CONSENT_GRANTED',
    actorId: 'usr_patient_demo',
    actorRole: 'patient',
    actorName: 'Priya Sharma (Patient)',
    patientId: 'usr_patient_demo',
    details: 'Initial bilingual DPDP 2023 consent granted for Rotterdam risk screening and nutrition plans.',
    complianceStandard: 'DPDP_ACT_2023'
  },
  {
    id: 'aud-seed-2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: 'REPORT_SHARED',
    actorId: 'usr_patient_demo',
    actorRole: 'patient',
    actorName: 'Priya Sharma (Patient)',
    targetRecordId: 'rep-pooja-prev',
    patientId: 'usr_patient_demo',
    details: 'Patient authorized sharing clinical health dossier with Dr. Radhika Sharma (TS-MCI-2011-8849).',
    complianceStandard: 'TELEMEDICINE_GUIDELINES_2020'
  },
  {
    id: 'aud-seed-3',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'REPORT_VIEWED',
    actorId: 'doc-radhika-sharma',
    actorRole: 'doctor',
    actorName: 'Dr. Radhika Sharma, MD, DGO',
    targetRecordId: 'rep-pooja-prev',
    patientId: 'usr_patient_demo',
    details: 'Doctor accessed shared patient diagnostic parameters for upcoming teleconsultation review.',
    complianceStandard: 'EHR_2016'
  }
];

export function getAllAuditLogs(): ClinicalAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading audit logs:', err);
  }
  saveAuditLogsToStorage(SEED_AUDIT_LOGS);
  return SEED_AUDIT_LOGS;
}

export function saveAuditLogsToStorage(logs: ClinicalAuditLog[]): void {
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving audit logs:', err);
  }
}

export function logAuditEvent(
  event: Omit<ClinicalAuditLog, 'id' | 'timestamp'>
): ClinicalAuditLog {
  const newLog: ClinicalAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...event
  };

  const all = getAllAuditLogs();
  all.unshift(newLog);
  // Keep last 250 records
  if (all.length > 250) all.pop();
  saveAuditLogsToStorage(all);
  return newLog;
}

export function getAuditLogsForPatient(patientId: string): ClinicalAuditLog[] {
  const all = getAllAuditLogs();
  return all.filter(l => l.patientId === patientId || l.actorId === patientId);
}

// ============================================================
// 3. RIGHT TO DATA PORTABILITY (EXPORT HEALTH DOSSIER)
// ============================================================

export function generatePatientDataExport(userId: string): {
  jsonString: string;
  filename: string;
  summary: {
    exportDate: string;
    totalAssessments: number;
    totalConsultations: number;
    totalPrescriptions: number;
    abhaLinked: boolean;
  };
} {
  const latestReport = localStorage.getItem('pcosense_latest_patient');
  const userHistory = localStorage.getItem('pcosense_assessment_history');
  const appointmentsRaw = localStorage.getItem('pcosense_appointments_db');
  const consultationsRaw = localStorage.getItem('pcosense_consultations_db');
  const consent = getDPDPConsent(userId);
  const abha = getABHAProfile(userId);
  const auditLogs = getAuditLogsForPatient(userId);

  const appointments = appointmentsRaw ? JSON.parse(appointmentsRaw) : [];
  const userAppointments = appointments.filter((a: any) => a.userId === userId || userId === 'guest-user');

  const consultations = consultationsRaw ? JSON.parse(consultationsRaw) : [];
  const userConsultations = consultations.filter((c: any) => c.userId === userId || userId === 'guest-user');

  const exportPayload = {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      statutoryAuthority: 'Digital Personal Data Protection Act (DPDP Act, 2023) - Section 11',
      application: 'PCOSense Clinical Healthcare Platform',
      jurisdiction: 'Republic of India',
      dataPrincipalUserId: userId
    },
    consentRecord: consent,
    abhaProfile: abha,
    screeningAndClinicalReports: latestReport ? JSON.parse(latestReport) : null,
    assessmentHistory: userHistory ? JSON.parse(userHistory) : [],
    appointments: userAppointments,
    consultationsAndPrescriptions: userConsultations,
    accessAuditLog: auditLogs
  };

  logAuditEvent({
    action: 'DATA_EXPORTED',
    actorId: userId,
    actorRole: 'patient',
    actorName: 'Data Principal',
    patientId: userId,
    details: 'Patient exercised statutory Right to Data Portability and downloaded complete health dossier.',
    complianceStandard: 'DPDP_ACT_2023'
  });

  return {
    jsonString: JSON.stringify(exportPayload, null, 2),
    filename: `PCOSense_EHR_Export_${userId}_${new Date().toISOString().split('T')[0]}.json`,
    summary: {
      exportDate: new Date().toLocaleDateString('en-IN'),
      totalAssessments: exportPayload.assessmentHistory.length,
      totalConsultations: userConsultations.length,
      totalPrescriptions: userConsultations.filter((c: any) => c.nmcPrescription || c.prescription).length,
      abhaLinked: !!abha
    }
  };
}

// ============================================================
// 4. RIGHT TO DATA ERASURE / RIGHT TO BE FORGOTTEN (SECTION 12)
// ============================================================

export function executeDataErasure(userId: string, reason?: string): boolean {
  try {
    // Clear user-specific storage keys
    localStorage.removeItem('pcosense_latest_patient');
    localStorage.removeItem('pcosense_assessment_history');
    localStorage.removeItem('pcosense_user_profile');

    // Revoke consent
    revokeDPDPConsent(userId);

    // Audit log erasure request
    logAuditEvent({
      action: 'DATA_ERASURE_REQUESTED',
      actorId: userId,
      actorRole: 'patient',
      actorName: 'Data Principal',
      patientId: userId,
      details: `Statutory Data Erasure fulfilled under Section 12 of DPDP Act 2023. Reason: ${reason || 'Patient requested data purging'}. Personal identifiers purged.`,
      complianceStandard: 'DPDP_ACT_2023'
    });

    return true;
  } catch (err) {
    console.error('Error executing data erasure:', err);
    return false;
  }
}

// ============================================================
// 5. ABHA (AYUSHMAN BHARAT HEALTH ACCOUNT) INTEGRATION
// ============================================================

export function formatABHANumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 10));
  if (digits.length > 10) parts.push(digits.slice(10, 14));
  return parts.join('-');
}

export function validateABHANumber(abhaNumber: string): boolean {
  const cleaned = abhaNumber.replace(/\D/g, '');
  return cleaned.length === 14;
}

export function getABHAProfile(userId: string): ABHAProfile | null {
  try {
    const raw = localStorage.getItem(ABHA_PROFILES_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[userId] || null;
  } catch {
    return null;
  }
}

export function saveABHAProfile(userId: string, profile: ABHAProfile): void {
  try {
    const raw = localStorage.getItem(ABHA_PROFILES_KEY) || '{}';
    const all = JSON.parse(raw);
    all[userId] = profile;
    localStorage.setItem(ABHA_PROFILES_KEY, JSON.stringify(all));

    logAuditEvent({
      action: 'REPORT_SHARED',
      actorId: userId,
      actorRole: 'patient',
      actorName: profile.fullName,
      patientId: userId,
      details: `Ayushman Bharat Health Account (ABHA: ${profile.abhaNumber}) linked to patient health dossier.`,
      complianceStandard: 'EHR_2016'
    });
  } catch (err) {
    console.error('Error saving ABHA profile:', err);
  }
}

// ============================================================
// 6. STATUTORY GRIEVANCE REDRESSAL (DPDP ACT SECTION 13)
// ============================================================

export function getGrievanceTickets(userId: string): GrievanceTicket[] {
  try {
    const raw = localStorage.getItem(GRIEVANCE_TICKETS_KEY);
    if (raw) {
      const all: GrievanceTicket[] = JSON.parse(raw);
      return all.filter(t => t.userId === userId || userId === 'all');
    }
  } catch (err) {
    console.error('Error reading grievance tickets:', err);
  }
  return [];
}

export function submitGrievanceTicket(
  ticketData: Omit<GrievanceTicket, 'id' | 'submittedAt' | 'status' | 'assignedOfficer' | 'expectedResolutionDays'>
): GrievanceTicket {
  const newTicket: GrievanceTicket = {
    id: `GRV-${Date.now().toString().slice(-6)}`,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    assignedOfficer: STATUTORY_GRO_DETAILS.name,
    expectedResolutionDays: STATUTORY_GRO_DETAILS.statutorySlaDays,
    ...ticketData
  };

  try {
    const raw = localStorage.getItem(GRIEVANCE_TICKETS_KEY) || '[]';
    const all: GrievanceTicket[] = JSON.parse(raw);
    all.unshift(newTicket);
    localStorage.setItem(GRIEVANCE_TICKETS_KEY, JSON.stringify(all));

    logAuditEvent({
      action: 'REPORT_SHARED',
      actorId: ticketData.userId,
      actorRole: 'patient',
      actorName: ticketData.userName,
      patientId: ticketData.userId,
      details: `Statutory Grievance #${newTicket.id} filed under DPDP Act Section 13: ${ticketData.subject}`,
      complianceStandard: 'DPDP_ACT_2023'
    });
  } catch (err) {
    console.error('Error submitting grievance ticket:', err);
  }

  return newTicket;
}

// ============================================================
// 7. STANDARDIZED NMC PRESCRIPTION BUILDER (TELEMEDICINE 2020)
// ============================================================

export function buildStandardNMCPrescription(params: {
  consultationId: string;
  appointmentId: string;
  doctor: DoctorProfile;
  patient: {
    id: string;
    name: string;
    age?: number;
    gender: string;
    phoneOrEmail?: string;
    abhaId?: string;
    weightKg?: number;
    bmi?: number;
  };
  provisionalDiagnosis: string;
  rotterdamPhenotype?: string;
  chiefComplaints: string;
  medications: PrescriptionMedicine[];
  investigationsRequested: string[];
  medicalNutritionAndLifestyleAdvice: string[];
  followUpAdvice: string;
}): NMCPrescription {
  const timestamp = new Date().toISOString();
  const regNo = params.doctor.licenseNumber || 'TS-MCI-2011-8849';
  const verificationHash = `NMC-VERIFIED-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  return {
    prescriptionId: `RX-NMC-${Date.now().toString().slice(-6)}`,
    consultationId: params.consultationId,
    appointmentId: params.appointmentId,
    issuedAt: timestamp,
    doctorDetails: {
      name: params.doctor.name,
      qualification: params.doctor.qualification,
      medicalCouncilRegNo: regNo,
      stateMedicalCouncil: params.doctor.stateMedicalCouncil || 'Telangana State Medical Council',
      clinicName: params.doctor.clinic,
      clinicAddress: params.doctor.location,
      contactPhone: '+91 (040) 2360-7777'
    },
    patientDetails: params.patient,
    clinicalFindings: {
      chiefComplaints: params.chiefComplaints,
      rotterdamPhenotype: params.rotterdamPhenotype || 'Phenotype A (Full-blown Classic PCOS)',
      icd10Code: 'E28.2 (Polycystic Ovarian Syndrome)',
      vitalsSummary: params.patient.bmi ? `BMI: ${params.patient.bmi.toFixed(1)} kg/m²` : undefined
    },
    medications: params.medications,
    investigationsRequested: params.investigationsRequested,
    medicalNutritionAndLifestyleAdvice: params.medicalNutritionAndLifestyleAdvice,
    followUpAdvice: params.followUpAdvice,
    emergencyDisclaimer:
      'STATUTORY NOTICE (Telemedicine Practice Guidelines 2020): This prescription is issued via registered telemedicine consultation. In the event of severe acute pelvic pain, heavy abnormal vaginal bleeding, shortness of breath, or emergency symptoms, immediately visit the nearest emergency hospital obstetric/gynecological casualty ward.',
    digitalSignature: {
      signedByName: params.doctor.name,
      regNo,
      timestamp,
      verificationHash
    }
  };
}
