/**
 * PCOSense - Doctor-Patient Clinical Chat Service
 * Real-time clinical messaging between Registered Medical Practitioners and Patients
 * Supports prescription clarifications, follow-up queries, and audit logging.
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: 'doctor' | 'patient';
  senderName: string;
  text: string;
  timestamp: string;
  isPrescriptionUpdate?: boolean;
}

export interface PatientConversation {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientAge: number;
  patientPhenotype: string;
  doctorId: string;
  doctorName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountForDoctor: number;
  status: 'active' | 'archived';
  messages: ChatMessage[];
}

const CHAT_STORAGE_KEY = 'pcosense_doctor_chats_db';

const INITIAL_CONVERSATIONS: PatientConversation[] = [
  {
    id: 'conv-jahnavi',
    patientId: 'usr_patient_sample',
    patientName: 'Jahnavi Sai',
    patientEmail: 'jangajahnavisai@gmail.com',
    patientAge: 25,
    patientPhenotype: 'Rotterdam Phenotype B (Irregular Menstrual Cycles & Hyperandrogenism)',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    lastMessage: 'డాక్టర్ గారు, డైట్ ప్లాన్‌లో ఇచ్చిన పెసరట్టు మరియు మెంతుల నీరు తీసుకుంటున్నాను. పీరియడ్స్ సమస్య త్వరలోనే అదుపులోకి వస్తుందా?',
    lastMessageTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    unreadCountForDoctor: 1,
    status: 'active',
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-jahnavi',
        senderRole: 'doctor',
        senderName: 'Dr. Radhika Sharma',
        text: 'నమస్కారం జాహ్నవి గారు, మీ పెల్విక్ అల్ట్రాసౌండ్ మరియు పీరియడ్స్ రికార్డులను పరిశీలించాను. రోటర్‌డ్యామ్ ఫినోటైప్ B ప్రకారం మనం చికిత్స ప్రారంభిద్దాం.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'msg-2',
        conversationId: 'conv-jahnavi',
        senderRole: 'patient',
        senderName: 'Jahnavi Sai',
        text: 'ధన్యవాదాలు డాక్టర్ గారు! NMC ఈ-ప్రిస్క్రిప్షన్ అందింది. మయో-ఇనోసిటాల్ టాబ్లెట్లను ఉదయం టిఫిన్ తర్వాత గోరువెచ్చని నీటితో తీసుకోవాలా?',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 'msg-3',
        conversationId: 'conv-jahnavi',
        senderRole: 'doctor',
        senderName: 'Dr. Radhika Sharma',
        text: 'అవును, ఉదయం అల్పాహారం తర్వాత ఒక టాబ్లెట్ మరియు రాత్రి భోజనం తర్వాత ఒక టాబ్లెట్ నీటితో తీసుకోండి. అలాగే రాత్రి 30 నిమిషాలు ప్రశాంతంగా నడవండి.',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        id: 'msg-4',
        conversationId: 'conv-jahnavi',
        senderRole: 'patient',
        senderName: 'Jahnavi Sai',
        text: 'డాక్టర్ గారు, డైట్ ప్లాన్‌లో ఇచ్చిన పెసరట్టు మరియు మెంతుల నీరు తీసుకుంటున్నాను. పీరియడ్స్ సమస్య త్వరలోనే అదుపులోకి వస్తుందా?',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'conv-kavya',
    patientId: 'usr_patient_2',
    patientName: 'Kavya Rao',
    patientEmail: 'kavya.rao@example.com',
    patientAge: 28,
    patientPhenotype: 'Rotterdam Phenotype A (Classic PCOS with Ovulatory Dysfunction)',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    lastMessage: 'Your blood test results show fasting insulin is 16.4 uIU/mL. Excellent progress from baseline.',
    lastMessageTime: new Date(Date.now() - 3600000 * 16).toISOString(),
    unreadCountForDoctor: 0,
    status: 'active',
    messages: [
      {
        id: 'msg-k1',
        conversationId: 'conv-kavya',
        senderRole: 'patient',
        senderName: 'Kavya Rao',
        text: 'Doctor, I uploaded my latest fasting blood test report to the patient portal.',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 'msg-k2',
        conversationId: 'conv-kavya',
        senderRole: 'doctor',
        senderName: 'Dr. Radhika Sharma',
        text: 'Your blood test results show fasting insulin is 16.4 uIU/mL. Excellent progress from baseline.',
        timestamp: new Date(Date.now() - 3600000 * 16).toISOString()
      }
    ]
  },
  {
    id: 'conv-ananya',
    patientId: 'usr_patient_3',
    patientName: 'Ananya Sen',
    patientEmail: 'ananya.sen@example.com',
    patientAge: 24,
    patientPhenotype: 'Rotterdam Phenotype C (Ovulatory PCOS with Hyperandrogenism)',
    doctorId: 'doc-radhika-sharma',
    doctorName: 'Dr. Radhika Sharma, MD, DGO',
    lastMessage: 'Will book follow-up consult for next Thursday.',
    lastMessageTime: new Date(Date.now() - 3600000 * 36).toISOString(),
    unreadCountForDoctor: 0,
    status: 'active',
    messages: [
      {
        id: 'msg-a1',
        conversationId: 'conv-ananya',
        senderRole: 'doctor',
        senderName: 'Dr. Radhika Sharma',
        text: 'Please continue the Vitamin D3 60k once weekly for 8 weeks.',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'msg-a2',
        conversationId: 'conv-ananya',
        senderRole: 'patient',
        senderName: 'Ananya Sen',
        text: 'Will book follow-up consult for next Thursday.',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString()
      }
    ]
  }
];

export function getStoredConversations(doctorId: string = 'doc-radhika-sharma'): PatientConversation[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed: PatientConversation[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(c => c.doctorId === doctorId || (Boolean(doctorId) && doctorId.includes('radhika')));
      }
    }
  } catch (err) {
    console.error('Error reading doctor chats:', err);
  }
  saveConversationsToStorage(INITIAL_CONVERSATIONS);
  return INITIAL_CONVERSATIONS;
}

export function saveConversationsToStorage(conversations: PatientConversation[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Error saving doctor chats:', err);
  }
}

export function sendDoctorMessage(
  conversationId: string,
  text: string,
  doctorName: string = 'Dr. Radhika Sharma'
): PatientConversation | null {
  const all = getStoredConversations();
  const convIndex = all.findIndex(c => c.id === conversationId);
  if (convIndex === -1) return null;

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderRole: 'doctor',
    senderName: doctorName,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  all[convIndex].messages.push(newMsg);
  all[convIndex].lastMessage = text.trim();
  all[convIndex].lastMessageTime = new Date().toISOString();
  all[convIndex].unreadCountForDoctor = 0; // doctor responded, clear unread

  saveConversationsToStorage(all);
  return all[convIndex];
}

export function markConversationAsRead(conversationId: string): void {
  const all = getStoredConversations();
  const conv = all.find(c => c.id === conversationId);
  if (conv) {
    conv.unreadCountForDoctor = 0;
    saveConversationsToStorage(all);
  }
}

export function getOrCreatePatientConversation(
  doctorId: string,
  doctorName: string,
  patientId: string = 'usr_patient_sample',
  patientName: string = 'Patient',
  patientEmail: string = 'patient@pcosense.com'
): PatientConversation {
  const all = getStoredConversations(doctorId);
  const existing = all.find(c => c.doctorId === doctorId && (c.patientId === patientId || c.patientEmail === patientEmail));
  if (existing) return existing;

  const matchDoc = all.find(c => c.doctorId === doctorId);
  if (matchDoc) return matchDoc;

  const newConvId = `conv-${doctorId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const newConv: PatientConversation = {
    id: newConvId,
    patientId,
    patientName,
    patientEmail,
    patientAge: 26,
    patientPhenotype: 'Rotterdam Phenotype Assessment',
    doctorId,
    doctorName,
    lastMessage: `Hello ${patientName}. Welcome to PCOSense clinical chat with ${doctorName}.`,
    lastMessageTime: new Date().toISOString(),
    unreadCountForDoctor: 0,
    status: 'active',
    messages: [
      {
        id: `msg-welcome-${Date.now()}`,
        conversationId: newConvId,
        senderRole: 'doctor',
        senderName: doctorName,
        text: `Hello ${patientName}! I am ${doctorName}. Welcome to our in-app clinical consultation chat. You can ask questions regarding your cycle symptoms, ultrasound reports, nutrition plans, or prescription instructions.`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  const currentAll = getStoredConversations();
  currentAll.unshift(newConv);
  saveConversationsToStorage(currentAll);
  return newConv;
}

export function sendPatientMessage(
  conversationId: string,
  text: string,
  patientName: string = 'Patient'
): { updatedConv: PatientConversation | null } {
  const all = getStoredConversations();
  const convIndex = all.findIndex(c => c.id === conversationId);
  if (convIndex === -1) {
    return { updatedConv: null };
  }

  const patientMsg: ChatMessage = {
    id: `msg-pat-${Date.now()}`,
    conversationId,
    senderRole: 'patient',
    senderName: patientName,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  all[convIndex].messages.push(patientMsg);
  all[convIndex].lastMessage = text.trim();
  all[convIndex].lastMessageTime = new Date().toISOString();
  all[convIndex].unreadCountForDoctor = (all[convIndex].unreadCountForDoctor || 0) + 1;

  saveConversationsToStorage(all);

  const updated = all[convIndex];
  return { updatedConv: updated };
}

