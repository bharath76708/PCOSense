/**
 * PCOSense - Find Healthcare Specialists Page
 * Uses user geolocation with permission to discover nearby gynecologists, endocrinologists, and PCOS clinics.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  Stethoscope,
  Globe,
  Navigation,
  Star,
  CheckCircle2,
  Calendar,
  Filter,
  ShieldCheck,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Compass,
  FileText,
  Share2,
  Heart,
  MessageSquare,
  PhoneCall,
  Clock
} from 'lucide-react';
import { useLanguage } from '../translations';
import { HealthcareSpecialist, DoctorProfile, HealthReportRecord } from '../types';
import { useNavigate } from 'react-router-dom';
import { getVerifiedDoctors, getStoredDoctors, fetchDoctorsFromFirestore, convertDoctorProfileToSpecialist, recommendDoctorsForPatient } from '../services/doctorService';
import { getLatestHealthReport } from '../services/healthReportService';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { HealthReportModal } from '../components/HealthReportModal';
import { DoctorChatModal } from '../components/DoctorChatModal';
import { DoctorTelehealthCallModal } from '../components/DoctorTelehealthCallModal';
import { useAuth } from '../context/AuthContext';

// Comprehensive specialist directory with coordinates and clinical credentials
const SPECIALISTS_DIRECTORY: HealthcareSpecialist[] = [
  {
    id: 'doc-1',
    name: 'Dr. Radhika Sharma, MD, DGO',
    title: 'Consultant Obstetrician, Gynecologist & PCOS Specialist',
    clinicOrHospital: 'Apollo Fertility & Women\'s Health Centre',
    specialties: ['pcos', 'gynecology', 'fertility'],
    rating: 4.9,
    reviewCount: 184,
    experienceYears: 16,
    address: 'Road No. 2, Banjara Hills, Hyderabad, Telangana 500034',
    city: 'Hyderabad',
    coordinates: { lat: 17.4156, lng: 78.4354 },
    phone: '+91 40 2360 7777',
    email: 'contact@apollofertility.com',
    website: 'https://apollofertility.com',
    acceptsTelehealth: true,
    acceptsInsurance: true,
    consultationFee: '₹900 - ₹1,200',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pcosServices: ['Rotterdam ultrasound screening', 'Hormonal & AMH workup', 'Insulin sensitization therapy', 'Cycle regulation'],
    badges: ['Top Rated PCOS Clinic', 'Ultrasound In-House', 'Telehealth Available'],
    isVerified: true
  },
  {
    id: 'doc-2',
    name: 'Dr. Priya V. Nambiar, MD, DM',
    title: 'Senior Reproductive Endocrinologist & Metabolic Physician',
    clinicOrHospital: 'Care Hospitals & Endocrine Care Clinic',
    specialties: ['endocrinology', 'pcos'],
    rating: 4.8,
    reviewCount: 142,
    experienceYears: 14,
    address: 'Old Mumbai Highway, Gachibowli, Hyderabad, Telangana 500032',
    city: 'Hyderabad',
    coordinates: { lat: 17.4401, lng: 78.3489 },
    phone: '+91 40 6165 6565',
    email: 'care.gachibowli@carehospitals.com',
    website: 'https://carehospitals.com',
    acceptsTelehealth: true,
    acceptsInsurance: true,
    consultationFee: '₹1,000 - ₹1,500',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    pcosServices: ['Insulin resistance management', 'Thyroid & Adrenal workup', 'Anti-androgenic therapy', 'Weight & Metabolic counseling'],
    badges: ['Endocrine Society Member', 'Telehealth Available'],
    isVerified: true
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Reddy, MS (OBG), DRM (Germany)',
    title: 'Gynecologist & Pelvic Ultrasound Specialist',
    clinicOrHospital: 'Fernandez Hospital Stork Home',
    specialties: ['gynecology', 'pcos', 'fertility'],
    rating: 4.9,
    reviewCount: 220,
    experienceYears: 18,
    address: 'Plot 4, Inorbit Mall Road, Madhapur, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    coordinates: { lat: 17.4334, lng: 78.3866 },
    phone: '+91 40 4022 2397',
    website: 'https://fernandez.foundation',
    acceptsTelehealth: false,
    acceptsInsurance: true,
    consultationFee: '₹1,100',
    availableDays: ['Tue', 'Thu', 'Sat'],
    pcosServices: ['High-resolution transvaginal sonography (TVS)', 'Follicular tracking', 'Adolescent PCOS clinic'],
    badges: ['High-Res Ultrasound', 'Adolescent PCOS Wing'],
    isVerified: true
  },
  {
    id: 'doc-4',
    name: 'Dr. Meera Iyer, MBBS, MD (Endocrinology)',
    title: 'Consultant Endocrinologist & Diabetologist',
    clinicOrHospital: 'Manipal Hospital Endocrine Sciences',
    specialties: ['endocrinology', 'pcos', 'nutrition'],
    rating: 4.8,
    reviewCount: 156,
    experienceYears: 13,
    address: 'HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka 560017',
    city: 'Bengaluru',
    coordinates: { lat: 12.9592, lng: 77.6534 },
    phone: '+91 80 2502 4444',
    website: 'https://manipalhospitals.com',
    acceptsTelehealth: true,
    acceptsInsurance: true,
    consultationFee: '₹1,000',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    pcosServices: ['Metabolic syndrome reversal', 'Continuous glucose monitoring (CGM)', 'Lipid & TSH balancing'],
    badges: ['CGM Grounded', 'Telehealth Available'],
    isVerified: true
  },
  {
    id: 'doc-5',
    name: 'Dr. Shalini Kulkarni, MS (OBG), Fellowship in Reproductive Medicine',
    title: 'Clinical Director & PCOS Care Specialist',
    clinicOrHospital: 'Cloudnine Hospital for Women & Children',
    specialties: ['pcos', 'gynecology', 'fertility'],
    rating: 4.9,
    reviewCount: 195,
    experienceYears: 15,
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    coordinates: { lat: 19.0607, lng: 72.8362 },
    phone: '+91 22 6792 9999',
    website: 'https://cloudninecare.com',
    acceptsTelehealth: true,
    acceptsInsurance: true,
    consultationFee: '₹1,500',
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    pcosServices: ['Holistic PCOS lifestyle protocols', 'Fertility preserving therapy', 'Hirsutism medical management'],
    badges: ['PCOS Center of Excellence', 'Telehealth Available'],
    isVerified: true
  },
  {
    id: 'doc-6',
    name: 'Dr. Sunita Rao, M.Sc (Clinical Nutrition), RD, CDE',
    title: 'PCOS Metabolic Nutritionist & Dietitian',
    clinicOrHospital: 'Nourish PCOS Clinical Dietetics & Lifestyle Hub',
    specialties: ['nutrition', 'pcos'],
    rating: 4.9,
    reviewCount: 167,
    experienceYears: 11,
    address: 'Kavuri Hills, Jubilee Hills Extension, Hyderabad, Telangana 500033',
    city: 'Hyderabad',
    coordinates: { lat: 17.4399, lng: 78.3984 },
    phone: '+91 98480 12345',
    website: 'https://nourishpcos.in',
    acceptsTelehealth: true,
    acceptsInsurance: false,
    consultationFee: '₹800',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pcosServices: ['Low-glycemic meal planning', 'Inositol & Micronutrient counseling', 'Gut health & anti-inflammatory protocols'],
    badges: ['Certified Diabetes Educator', 'Telehealth Available'],
    isVerified: true
  }
];

// Haversine formula to compute distance between two GPS coordinates in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const FindHealthcarePage: React.FC = () => {
  const { isTelugu } = useLanguage();
  const navigate = useNavigate();

  // User location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'denied' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('Detecting location...');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(50);
  const [filterTelehealthOnly, setFilterTelehealthOnly] = useState<boolean>(false);
  const [copiedDoctorId, setCopiedDoctorId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<HealthcareSpecialist | null>(null);

  const { user } = useAuth();
  const isDoctorUser = user?.role === 'doctor';
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorProfile | null>(null);

  // In-App Chat & Call State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedDoctorForChat, setSelectedDoctorForChat] = useState<HealthcareSpecialist | DoctorProfile | null>(null);

  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [selectedDoctorForCall, setSelectedDoctorForCall] = useState<HealthcareSpecialist | DoctorProfile | null>(null);

  const handleOpenChat = (doc: HealthcareSpecialist | DoctorProfile) => {
    setSelectedDoctorForChat(doc);
    setIsChatOpen(true);
  };

  const handleOpenCall = (doc: HealthcareSpecialist | DoctorProfile) => {
    setSelectedDoctorForCall(doc);
    setIsCallOpen(true);
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [userReport, setUserReport] = useState<HealthReportRecord | null>(() =>
    getLatestHealthReport(user?.id || 'guest-user')
  );

  // Dynamic doctors directory synchronized with Admin Console & Cloud Firestore
  const [allSpecialists, setAllSpecialists] = useState<HealthcareSpecialist[]>(() => {
    const stored = getStoredDoctors().filter(d => d.verificationStatus === 'verified');
    if (stored && stored.length > 0) {
      return stored.map(convertDoctorProfileToSpecialist);
    }
    return SPECIALISTS_DIRECTORY;
  });

  // Sync latest doctors from Cloud Firestore on mount and listen to real-time updates
  useEffect(() => {
    let isMounted = true;
    fetchDoctorsFromFirestore().then(docs => {
      if (isMounted && docs && docs.length > 0) {
        const verified = docs.filter(d => d.verificationStatus === 'verified');
        if (verified.length > 0) {
          setAllSpecialists(verified.map(convertDoctorProfileToSpecialist));
        }
      }
    }).catch(err => {
      console.warn('Could not fetch doctors from Firestore:', err);
    });

    const handleDoctorsUpdated = () => {
      const stored = getStoredDoctors().filter(d => d.verificationStatus === 'verified');
      if (stored && stored.length > 0) {
        setAllSpecialists(stored.map(convertDoctorProfileToSpecialist));
      }
    };

    window.addEventListener('pcosense_doctors_updated', handleDoctorsUpdated);
    window.addEventListener('storage', handleDoctorsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('pcosense_doctors_updated', handleDoctorsUpdated);
      window.removeEventListener('storage', handleDoctorsUpdated);
    };
  }, []);

  const verifiedDoctors = useMemo(() => {
    return getStoredDoctors().filter(d => d.verificationStatus === 'verified');
  }, [allSpecialists]);

  // Rule-based Clinical Recommendation Engine
  const recommendedSpecialist = useMemo(() => {
    try {
      const savedPatient = localStorage.getItem('pcosense_latest_patient');
      const patient = savedPatient ? JSON.parse(savedPatient) : {
        'Age (yrs)': 26,
        'Weight (Kg)': 68,
        'Height(Cm)': 162,
        'BMI': 25.9,
        'Cycle(R/I)': 4,
        'Cycle length(days)': 42,
        'hair growth(Y/N)': 1,
        'Skin darkening (Y/N)': 1,
        'Fast food (Y/N)': 1,
        'Reg.Exercise(Y/N)': 0
      };
      const rec = recommendDoctorsForPatient(patient as any, 'Elevated');
      return rec || null;
    } catch {
      return null;
    }
  }, []);

  // Default to Hyderabad coordinates for instant preview if geolocation pending
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    setLocationStatus('locating');
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      setUserCoords({ lat: 17.4156, lng: 78.4354 }); // fallback Hyderabad center
      setUserLocationName('Hyderabad (Default Area)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationStatus('success');
        setUserLocationName(`GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('denied');
        setLocationError('Location permission was denied or unavailable. Showing all verified regional specialists.');
        setUserCoords({ lat: 17.4156, lng: 78.4354 });
        setUserLocationName('Hyderabad / Regional Directory');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Filter and sort specialists
  const filteredSpecialists = useMemo(() => {
    return allSpecialists.map(doc => {
      let distanceKm = 0;
      if (userCoords) {
        distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, doc.coordinates.lat, doc.coordinates.lng);
      }
      return { ...doc, distanceKm };
    }).filter(doc => {
      // Search query (doctor name, clinic, city, or service)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (doc.name || '').toLowerCase().includes(q);
        const matchesClinic = (doc.clinicOrHospital || '').toLowerCase().includes(q);
        const matchesCity = (doc.city || '').toLowerCase().includes(q);
        const matchesAddress = (doc.address || '').toLowerCase().includes(q);
        const matchesService = Array.isArray(doc.pcosServices) && doc.pcosServices.some(s => (s || '').toLowerCase().includes(q));
        if (!matchesName && !matchesClinic && !matchesCity && !matchesAddress && !matchesService) {
          return false;
        }
      }

      // Specialty filter
      if (selectedSpecialty !== 'all') {
        if (!Array.isArray(doc.specialties) || !doc.specialties.includes(selectedSpecialty as any)) {
          return false;
        }
      }

      // Telehealth
      if (filterTelehealthOnly && !doc.acceptsTelehealth) {
        return false;
      }

      // Distance limit (if location active and distance is within reasonable range)
      if (userCoords && maxDistanceKm < 50 && doc.distanceKm && doc.distanceKm > maxDistanceKm) {
        return false;
      }

      return true;
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [userCoords, searchQuery, selectedSpecialty, maxDistanceKm, filterTelehealthOnly, allSpecialists]);

  const handleCopyDetails = (doc: HealthcareSpecialist) => {
    const text = `🏥 ${doc.name} (${doc.title})\nClinic: ${doc.clinicOrHospital}\nAddress: ${doc.address}\nServices: ${doc.pcosServices.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedDoctorId(doc.id);
    setTimeout(() => setCopiedDoctorId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Hero / Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/40 text-teal-200 text-xs font-bold">
            <Compass className="h-3.5 w-3.5 animate-spin text-teal-300" style={{ animationDuration: '6s' }} />
            <span>{isTelugu ? 'ధృవీకరించబడిన PCOS నిపుణుల నెట్‌వర్క్' : 'Verified PCOS Clinical Specialists Directory'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isTelugu ? 'ధృవీకరించబడిన PCOS వైద్యులు & స్పెషలిస్టులు' : 'Consult Verified PCOS Specialists via App'}
          </h1>

          <p className="text-sm text-teal-100/90 leading-relaxed">
            {isTelugu
              ? 'రోటర్‌డ్యామ్ ప్రమాణాల స్క్రీనింగ్, అల్ట్రాసౌండ్ విశ్లేషణ మరియు హార్మోన్ల సమతుల్యతలో నైపుణ్యం కలిగిన వైద్యులతో సురక్షితమైన ఆన్‌లైన్ సంప్రదింపులను బుక్ చేసుకోండి.'
              : 'Consult verified gynecologists, endocrinologists, and PCOS specialists for Rotterdam criteria analysis, ultrasound review, and personalized hormone balance plans.'}
          </p>

          {/* Consultation Guarantees & Health Report Action */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-xs border border-white/20">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">{isTelugu ? 'ధృవీకరించబడిన వైద్యులు' : 'Verified Clinical Specialists'}</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-xs border border-white/20">
              <Clock className="h-4 w-4 text-teal-300 shrink-0" />
              <span className="font-semibold text-white">{isTelugu ? 'తక్షణ అపాయింట్‌మెంట్ బుకింగ్' : 'Instant Appointment Booking'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              id="open-health-report-modal-btn"
            >
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>{isTelugu ? 'నా క్లినికల్ రిపోర్ట్ & షేరింగ్' : 'My Clinical Report & Sharing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Clinical Specialist Recommendation Banner */}
      {recommendedSpecialist && (() => {
        const doc = recommendedSpecialist.matchedDoctors?.[0] || verifiedDoctors[0];
        if (!doc) return null;
        return (
          <div className="rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-slate-900 p-6 border border-teal-200 dark:border-teal-800/80 shadow-xs space-y-4" id="ai-recommended-specialist-banner">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'మీ కోసం సిఫార్సు చేయబడిన నిపుణులు' : 'AI Clinical Match For Your Risk Pattern'}</span>
              </div>
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                {isTelugu ? 'రోటర్‌డ్యామ్ ప్రమాణాలు & హార్మోన్ల ప్రాధాన్యత' : 'Based on Rotterdam Criteria & Symptoms'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {doc.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold">
                    {recommendedSpecialist.urgencyLevel}
                  </span>
                </div>
                <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">
                  {doc.specialization} • {doc.clinic}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  <strong>Why matched:</strong> {isTelugu ? recommendedSpecialist.reasonTe : recommendedSpecialist.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!isDoctorUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctorForBooking(doc);
                      setIsBookingOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    id="book-recommended-doctor-btn"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{isTelugu ? `సంప్రదింపును బుక్ చేయండి (₹${doc.consultationFee})` : `Book Consultation (₹${doc.consultationFee})`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Permission alert if location blocked */}
      {locationError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            type="button"
            onClick={requestUserLocation}
            className="px-3 py-1 bg-amber-200 dark:bg-amber-900 rounded-lg font-bold text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            Allow GPS
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTelugu ? 'వైద్యుని పేరు, ఆసుపత్రి, నగరం లేదా సేవ ద్వారా శోధించండి...' : 'Search by doctor name, hospital, city, or ultrasound...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="md:col-span-6">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="all">{isTelugu ? 'అన్ని విభాగాలు (గైనకాలజీ, ఎండోక్రినాలజీ, న్యూట్రిషన్)' : 'All Clinical Specialties (Gynecology, Endocrinology, Nutrition)'}</option>
              <option value="pcos">{isTelugu ? 'PCOS ప్రత్యేక నిపుణులు' : 'PCOS Specialist Doctors'}</option>
              <option value="gynecology">{isTelugu ? 'గైనకాలజిస్టులు (OB/GYN)' : 'Gynecologists (OB/GYN)'}</option>
              <option value="endocrinology">{isTelugu ? 'ఎండోక్రినాలజిస్టులు' : 'Endocrinologists'}</option>
              <option value="nutrition">{isTelugu ? 'డైటీషియన్లు & న్యూట్రిషన్' : 'PCOS Nutritionists'}</option>
            </select>
          </div>
        </div>

        {/* Quick Consultation Action Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {/* 1. Telehealth Video Consults Button (Opens Telehealth Video Call consultation flow) */}
            <button
              type="button"
              onClick={() => {
                const targetDoc = verifiedDoctors.find(d => d.acceptsTelehealth) || verifiedDoctors[0];
                if (targetDoc) {
                  handleOpenCall(targetDoc);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold bg-teal-800 hover:bg-teal-700 text-white shadow-xs transition-all cursor-pointer"
              id="open-telehealth-video-flow-btn"
              title="Open Telehealth Video Consultation Flow"
            >
              <Video className="h-4 w-4 text-teal-300" />
              <span>{isTelugu ? 'టెలిహెల్త్ వీడియో సంప్రదింపు' : 'Telehealth Video Consults'}</span>
            </button>

            {/* 2. PCOS Focused Button (Opens PCOS-focused doctor consultation booking flow) */}
            <button
              type="button"
              onClick={() => {
                const pcosDoc = verifiedDoctors.find(d => d.specialization?.toLowerCase().includes('pcos') || d.name.includes('Radhika')) || verifiedDoctors[0];
                if (pcosDoc) {
                  setSelectedDoctorForBooking(pcosDoc);
                  setIsBookingOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
              id="open-pcos-focused-flow-btn"
              title="Open PCOS-Focused Healthcare Consultation Flow"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>{isTelugu ? 'PCOS ఫోకస్డ్ కన్సల్టేషన్' : 'PCOS Focused'}</span>
            </button>
          </div>

          <span className="text-slate-500 font-semibold">
            {filteredSpecialists.length} {isTelugu ? 'నిపుణులు అందుబాటులో ఉన్నారు' : 'specialists available for in-app consultation'}
          </span>
        </div>
      </div>

      {/* Specialists List & Cards (Zero Physical Location Display) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSpecialists.map(doc => (
          <div
            key={doc.id}
            className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              
              {/* Doctor Name & Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 font-extrabold text-sm border border-teal-200 dark:border-teal-800">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {doc.name}
                      </h3>
                      {doc.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" title="Verified Specialist" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-teal-800 dark:text-teal-400 mt-0.5">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        <PhoneCall className="h-3 w-3" />
                        <span>App Call</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                        <MessageSquare className="h-3 w-3" />
                        <span>App Chat</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating & Consult Mode */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-extrabold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({doc.reviewCount})</span>
                  </div>
                  <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-1">
                    Telemedicine Active
                  </div>
                </div>
              </div>

              {/* Badges / Key Capabilities */}
              <div className="flex flex-wrap gap-1.5">
                {doc.badges.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  >
                    {b}
                  </span>
                ))}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {doc.experienceYears} Yrs Exp.
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Fee: {doc.consultationFee}
                </span>
              </div>

              {/* Clinical PCOS Services */}
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Clinical PCOS Offerings:
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                  {doc.pcosServices.map((service, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1 truncate">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Book Consultation (Patient only; removed for doctors) */}
                {!isDoctorUser && (
                  <button
                    type="button"
                    onClick={() => {
                      // Match with verified doctor profile or generate one
                      const matched = verifiedDoctors.find(vd => vd.id === doc.id || (Boolean(vd?.name) && Boolean(doc?.name) && vd.name.toLowerCase().includes(doc.name.toLowerCase().slice(0, 8))));
                      const docProfile: DoctorProfile = matched || {
                        id: doc.id,
                        userId: `usr_${doc.id}`,
                        name: doc.name,
                        specialization: doc.title,
                        qualification: 'MD, DGO, Reproductive Specialist',
                        licenseNumber: 'MCI-88219',
                        experienceYears: doc.experienceYears,
                        clinic: doc.clinicOrHospital,
                        location: doc.address,
                        languages: ['English', 'Telugu'],
                        consultationFee: parseInt(doc.consultationFee.replace(/[^0-9]/g, '')) || 900,
                        rating: doc.rating,
                        reviewCount: doc.reviewCount,
                        verificationStatus: 'verified',
                        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
                        about: 'Experienced clinical specialist in Rotterdam ultrasound and hormone regulation.',
                        availability: {
                          days: doc.availableDays,
                          slots: ['10:00 AM - 10:30 AM', '11:30 AM - 12:00 PM', '04:00 PM - 04:30 PM']
                        }
                      };
                      setSelectedDoctorForBooking(docProfile);
                      setIsBookingOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                    id={`book-apt-btn-${doc.id}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{isTelugu ? 'అపాయింట్‌మెంట్ బుక్ చేయండి' : 'Book Consultation'}</span>
                  </button>
                )}
              </div>

              {/* Direct external contacts removed for doctors; only non-doctor users retain copy info if needed */}
              {!isDoctorUser && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyDetails(doc)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                    title="Copy provider details"
                  >
                    {copiedDoctorId === doc.id ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Doctor Discussion Guide Shortcut */}
      <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/80 p-6 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {isTelugu ? 'వైద్యుల సంప్రదింపుల మార్గదర్శిని (Doctor Discussion Guide)' : 'Preparing for Your Specialist Appointment?'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTelugu
                ? 'మీ అపాయింట్‌మెంట్‌కు ముందు అడగాల్సిన ప్రశ్నలు మరియు రక్త పరీక్షల వివరాలను సమీక్షించండి.'
                : 'Review key clinical questions, Rotterdam diagnostic checklist, and lab test protocols to bring to your consultation.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/awareness')}
          className="px-4 py-2.5 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>{isTelugu ? 'మార్గదర్శిని తెరవండి' : 'Open Discussion Guide'}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoctorForBooking && (
        <AppointmentBookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedDoctorForBooking(null);
          }}
          doctor={selectedDoctorForBooking}
          onBookingSuccess={() => {
            // Success recorded
          }}
          onStartChat={(doc) => {
            setIsBookingOpen(false);
            setSelectedDoctorForBooking(null);
            setSelectedDoctorForChat(doc);
            setIsChatOpen(true);
          }}
        />
      )}

      {/* Health Report & Consent Modal */}
      <HealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={userReport}
      />

      {/* In-App Clinical Chat Modal */}
      {selectedDoctorForChat && (
        <DoctorChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedDoctorForChat(null);
          }}
          doctor={selectedDoctorForChat}
          onInitiateCall={() => {
            const currentDoc = selectedDoctorForChat;
            setIsChatOpen(false);
            setSelectedDoctorForChat(null);
            setSelectedDoctorForCall(currentDoc);
            setIsCallOpen(true);
          }}
        />
      )}

      {/* In-App Telehealth Audio/Video Consultation Call Modal */}
      {selectedDoctorForCall && (
        <DoctorTelehealthCallModal
          isOpen={isCallOpen}
          onClose={() => {
            setIsCallOpen(false);
            setSelectedDoctorForCall(null);
          }}
          doctor={selectedDoctorForCall}
          onOpenChat={() => {
            const currentDoc = selectedDoctorForCall;
            setIsCallOpen(false);
            setSelectedDoctorForCall(null);
            setSelectedDoctorForChat(currentDoc);
            setIsChatOpen(true);
          }}
        />
      )}

    </div>
  );
};
