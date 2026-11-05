import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  X,
  Stethoscope,
  ChevronRight,
  HeartPulse,
  Activity,
  Flame,
  Printer,
  Copy,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
  FileText
} from 'lucide-react';
import { useLanguage } from '../translations';
import { playNotificationSound } from '../services/soundService';

interface EmergencyProceduresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

export const EmergencyProceduresModal: React.FC<EmergencyProceduresModalProps> = ({
  isOpen,
  onClose,
  onAskAI
}) => {
  const { isTelugu } = useLanguage();

  const [activeTab, setActiveTab] = useState<'guidelines' | 'triage' | 'contacts'>('guidelines');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    playNotificationSound('tap-click');
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const emergencyGuidelines = [
    {
      id: 'torsion',
      title: isTelugu ? 'తీవ్రమైన కడుపు/కటి నొప్పి (అండాశయ తిమ్మిరి / తిత్తి పగిలిపోవడం)' : 'Acute Severe Pelvic Pain (Ovarian Torsion / Ruptured Cyst)',
      severity: 'high',
      indicators: isTelugu
        ? [
            'ఒక్కసారిగా ప్రారంభమయ్యే తీవ్రమైన, కత్తిపోటులాంటి కటి నొప్పి',
            'వికారం, తీవ్రమైన వాంతులు మరియు చెమటలు పట్టడం',
            'నడుము లేదా తొడ వైపు నొప్పి ప్రసరించడం',
            'నిటారుగా నిలబడలేకపోవడం లేదా స్పృహ తప్పిపోయే భావన'
          ]
        : [
            'Sudden, sharp, stabbing lower quadrant or pelvic pain',
            'Nausea and severe repetitive vomiting',
            'Pain radiating to lower back or upper thigh',
            'Inability to stand upright or feeling faint'
          ],
      action: isTelugu
        ? 'తక్షణమే సమీపంలోని అత్యవసర విభాగం (ER/ఆసుపత్రి) లేదా గైనకాలజీ ఎమర్జెన్సీకి వెళ్ళండి. అండాశయ రక్తప్రసరణను కాపాడటానికి గంటల వ్యవధిలో డాప్లర్ అల్ట్రాసౌండ్ అవసరం.'
        : 'Seek IMMEDIATE Emergency Room (ER) care. Ovarian torsion requires emergency Doppler ultrasound and laparoscopic evaluation within hours to prevent ischemic ovarian loss.'
    },
    {
      id: 'flooding',
      title: isTelugu ? 'తీవ్రమైన గర్భాశయ రక్తస్రావం (హెవీ బ్లీడింగ్ / ఫ్లడ్డింగ్)' : 'Acute Severe Uterine Hemorrhaging (Flooding)',
      severity: 'high',
      indicators: isTelugu
        ? [
            'వరుసగా 2 గంటలపాటు ప్రతి గంటకు 2 లేదా అంతకంటే ఎక్కువ భారీ మ్యాక్సీ ప్యాడ్‌లు పూర్తిగా తడిసిపోవడం',
            'గోల్ఫ్ బాల్ లేదా నిమ్మకాయ సైజులో పెద్ద రక్త గడ్డలు (blood clots) పడటం',
            'తీవ్రమైన తలతిరగడం, పెదవులు పాలిపోవడం లేదా మూర్ఛపోవడం (syncope)',
            'విశ్రాంతి సమయంలో పల్స్ రేటు 110 bpm కంటే ఎక్కువగా ఉండటం'
          ]
        : [
            'Soaking through 2+ heavy maxi pads or tampons per hour for 2+ consecutive hours',
            'Passing large blood clots larger than a quarter or golf ball',
            'Extreme lightheadedness, pale skin, cold extremities, or fainting (syncope)',
            'Resting heart rate exceeding 110 beats per minute'
          ],
      action: isTelugu
        ? 'రక్తహీనత మరియు హైపోవోలెమిక్ షాక్ నివారించడానికి తక్షణ అత్యవసర వైద్య సంరక్షణ అవసరం. ప్యాడ్ల సంఖ్యను లెక్కించి డాక్టర్‌కు తెలియజేయండి.'
        : 'Go to the nearest emergency department or contact your on-call gynecologist immediately to stabilize acute hemorrhage.'
    },
    {
      id: 'ectopic',
      title: isTelugu ? 'ఎక్టోపిక్ గర్భధారణ హెచ్చరిక (క్రమరహిత పీరియడ్స్ నేపథ్యంలో)' : 'Suspected Ectopic Pregnancy Warning',
      severity: 'high',
      indicators: isTelugu
        ? [
            'ఒకవైపు మాత్రమే తీవ్రమైన కటి లేదా పొత్తికడుపు నొప్పి',
            'భుజం కొన వద్ద ఆకస్మిక తీవ్ర నొప్పి (డయాఫ్రాగమ్ రక్తస్రావ సూచిక)',
            'అసాధారణ బ్రౌన్ స్పాటింగ్ లేదా క్రమరహిత రక్తస్రావం',
            'రక్తపోటు పడిపోవడం మరియు మైకం'
          ]
        : [
            'Sharp, severe one-sided lower abdominal or pelvic pain',
            'Referred shoulder-tip pain (sign of internal diaphragmatic bleeding)',
            'Abnormal dark brown spotting or bleeding with missed period history',
            'Hypotension, dizziness, or confusion'
          ],
      action: isTelugu
        ? 'ప్రాణాంతక అంతర్గత రక్తస్రావం నివారించడానికి తక్షణ అత్యవసర మూల్యాంకనం (Emergency Ultrasound + Serum beta-hCG) చేయించుకోండి.'
        : 'Go immediately to emergency triage. Ectopic pregnancy rupture is life-threatening and requires immediate clinical intervention.'
    },
    {
      id: 'metabolic',
      title: isTelugu ? 'తీవ్రమైన మెటబాలిక్ / రక్తంలో చక్కెర సంక్షోభం (DKA / తీవ్ర హైపర్‌గ్లైసీమియా)' : 'Acute Metabolic / Severe Hyperglycemic Crisis',
      severity: 'medium',
      indicators: isTelugu
        ? [
            'రక్తంలో చక్కెర 300 mg/dL కంటే ఎక్కువ ఉండటం',
            'విపరీతమైన దాహం, గొంతు ఎండిపోవడం మరియు తరచుగా మూత్రవిసర్జన',
            'శ్వాసలో పండ్ల వాసన (కీటోన్స్) మరియు లోతైన వేగవంతమైన శ్వాస (Kussmaul శ్వాస)',
            'తీవ్రమైన అయోమయం లేదా మగత'
          ]
        : [
            'Blood glucose readings persistently exceeding 300 mg/dL',
            'Unquenchable severe thirst and extreme frequent urination',
            'Fruity breath odor, rapid deep breathing, or unexplained persistent vomiting',
            'Mental confusion, lethargy, or slurred speech'
          ],
      action: isTelugu
        ? 'ఎమర్జెన్సీ లేదా ఎండోక్రినాలజీ విభాగాన్ని వెంటనే సంప్రదించండి. డీహైడ్రేషన్ మరియు కీటోయాసిడోసిస్ చికిత్స అవసరం.'
        : 'Seek urgent medical attention at an emergency clinic for IV rehydration, insulin titration, and electrolyte monitoring.'
    },
    {
      id: 'infection',
      title: isTelugu ? 'కటి వాపు వ్యాధి (PID) / తీవ్రమైన ఇన్ఫెక్షన్' : 'Pelvic Inflammatory Disease (PID) / Sepsis Signs',
      severity: 'medium',
      indicators: isTelugu
        ? [
            'కటి నొప్పితో పాటు 101°F (38.3°C) కంటే ఎక్కువ జ్వరం మరియు వణుకు',
            'దుర్వాసనతో కూడిన అసాధారణ యోని స్రావాలు',
            'నడుస్తున్నప్పుడు లేదా కటి పరీక్ష సమయంలో భరించలేని నొప్పి'
          ]
        : [
            'Pelvic tenderness accompanied by fever >101°F (38.3°C) and chills',
            'Foul-smelling or discolored purulent vaginal discharge',
            'Intense pain during movement or pelvic examination'
          ],
      action: isTelugu
        ? 'అండాశయ మరియు ట్యూబ్ నష్టాన్ని నివారించడానికి 24 గంటల్లోపు గైనకాలజిస్ట్‌ను కలిసి యాంటీబయాటిక్ చికిత్స పొందండి.'
        : 'Contact your healthcare provider or urgent care within 24 hours to begin appropriate antibiotic therapy and prevent chronic tubal damage.'
    },
    {
      id: 'mental_health',
      title: isTelugu ? 'తీవ్రమైన మానసిక ఆరోగ్య సంక్షోభం & మద్దతు' : 'Mental Health Crisis & Emotional Urgency',
      severity: 'high',
      indicators: isTelugu
        ? [
            'తీవ్రమైన నిస్సహాయత లేదా ఆత్మహత్య ఆలోచనలు',
            'తీవ్రమైన హార్మోన్ల అస్థిరత వల్ల ఆందోళన పానిక్ అటాక్‌లు',
            'రోజువారీ పనులు చేయలేకపోవడం'
          ]
        : [
            'Overwhelming feelings of hopelessness or thoughts of self-harm',
            'Severe hormone-induced panic, dissociation, or acute depression',
            'Inability to function or cope safely'
          ],
      action: isTelugu
        ? 'మీరు ఒంటరిగా లేరు. తక్షణ సహాయం కోసం 24/7 టెలి-మానస్ (14416) లేదా కిరణ్ హెల్ప్‌లైన్ (1800-599-0019) కు కాల్ చేయండి.'
        : 'Immediate confidential support is available 24/7. Call or text 988 (US), Tele-MANAS 14416 (India), or Kiran 1800-599-0019.'
    }
  ];

  // Triage checklist items
  const triageOptions = [
    { id: 'stab_pain', text: isTelugu ? 'తీవ్రమైన ఆకస్మిక కటి నొప్పి (నిలబడలేకపోవడం)' : 'Sudden severe stabbing pelvic pain (unable to stand)', level: 1 },
    { id: 'vomit_pain', text: isTelugu ? 'నొప్పితో కూడిన వికారం & వాంతులు' : 'Nausea & vomiting accompanied by pelvic pain', level: 1 },
    { id: 'pad_soak', text: isTelugu ? 'గంటకు 2 కంటే ఎక్కువ ప్యాడ్‌లు తడిసిపోవడం (2+ గంటలు)' : 'Soaking 2+ pads/hr for 2+ consecutive hours', level: 1 },
    { id: 'faint', text: isTelugu ? 'స్పృహ తప్పడం, మైకం లేదా పాలిపోయిన చర్మం' : 'Fainting (syncope), severe dizziness, or pale clammy skin', level: 1 },
    { id: 'shoulder_pain', text: isTelugu ? 'కటి నొప్పితో పాటు భుజం కొన నొప్పి' : 'Shoulder tip pain along with pelvic cramping', level: 1 },
    { id: 'fever_pelvic', text: isTelugu ? '101°F కంటే ఎక్కువ జ్వరం మరియు కటి నొప్పి' : 'Fever >101°F (38.3°C) with pelvic tenderness', level: 2 },
    { id: 'foul_discharge', text: isTelugu ? 'దుర్వాసనతో కూడిన యోని స్రావం' : 'Foul-smelling or unusual purulent vaginal discharge', level: 2 },
    { id: 'mild_cramps', text: isTelugu ? 'సాధారణ పీరియడ్ నొప్పులు (హీట్ ప్యాక్‌తో తగ్గుతాయి)' : 'Mild to moderate menstrual cramping relieved by heat', level: 3 }
  ];

  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.includes(id) ? safePrev.filter(x => x !== id) : [...safePrev, id];
    });
    playNotificationSound('tap-click');
  };

  const highestTriageLevel = (Array.isArray(selectedSymptoms) ? selectedSymptoms : []).reduce((highest, sId) => {
    const opt = triageOptions.find(o => o.id === sId);
    if (!opt) return highest;
    return Math.min(highest, opt.level);
  }, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-500/30 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        
        {/* Urgent Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 text-white border-b border-rose-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
              <ShieldAlert className="h-5 w-5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="emergency-modal-title" className="text-base sm:text-lg font-extrabold tracking-tight">
                  {isTelugu ? 'PCOS అత్యవసర మార్గదర్శకాలు & విధానాలు' : 'Emergency Procedures & Triage Guidelines'}
                </h2>
                <span className="bg-rose-500/40 text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-rose-400/40 tracking-wider">
                  {isTelugu ? 'క్లినికల్ ప్రోటోకాల్' : 'Clinical Protocol'}
                </span>
              </div>
              <p className="text-xs text-rose-100/80">
                {isTelugu
                  ? 'తీవ్రమైన PCOS సమస్యలకు ఎప్పుడు అత్యవసర వైద్య సహాయం తీసుకోవాలో తెలుసుకోండి.'
                  : 'Identify red-flag symptoms and know when to seek immediate medical intervention.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-rose-200 hover:text-white hover:bg-white/10 transition-colors focus:ring-2 focus:ring-rose-400 focus:outline-none"
            aria-label="Close emergency modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`pb-3 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isTelugu ? 'అత్యవసర సంకేతాలు' : 'Emergency Red Flags'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('triage')}
            className={`pb-3 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'triage'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            <span>{isTelugu ? 'ఇంటరాక్టివ్ ట్రయాజ్ చెకర్' : 'Interactive Triage Checker'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`pb-3 px-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>{isTelugu ? 'హెల్ప్‌లైన్‌లు & నంబర్లు' : 'Crisis Helplines & Care'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {isTelugu
                    ? 'ముఖ్యమైన గమనిక: మీరు కింద పేర్కొన్న ఏదైనా లెవల్-1 సంకేతాలను అనుభవిస్తుంటే, ఇంట్లో వేచి ఉండకండి. వెంటనే సమీపంలోని ఆసుపత్రి ఎమర్జెన్సీని సంప్రదించండి.'
                    : 'Critical Note: If you are experiencing any acute Level-1 red flags below, do not wait. Go to the nearest emergency facility or call medical services immediately.'}
                </p>
              </div>

              <div className="space-y-3">
                {emergencyGuidelines.map(g => (
                  <div
                    key={g.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2.5 transition-all hover:border-rose-300 dark:hover:border-rose-700"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${g.severity === 'high' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                        {g.title}
                      </h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        g.severity === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {g.severity === 'high' ? 'Immediate ER' : 'Urgent Care'}
                      </span>
                    </div>

                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc marker:text-rose-500">
                      {g.indicators.map((ind, idx) => (
                        <li key={idx}>{ind}</li>
                      ))}
                    </ul>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-900 dark:text-rose-200">
                      <strong>{isTelugu ? 'తక్షణ చర్య: ' : 'Required Action: '}</strong>
                      {g.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRIAGE CHECKER */}
          {activeTab === 'triage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  {isTelugu ? 'మీ ప్రస్తుత లక్షణాలను ఎంచుకోండి' : 'Select Current Symptoms for Instant Triage'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'మీ అత్యవసర స్థాయిని అంచనా వేయడానికి ప్రస్తుతం మీరు ఎదుర్కొంటున్న సంకేతాలను తనిఖీ చేయండి.' : 'Check any symptoms you are experiencing right now to determine clinical urgency.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {triageOptions.map(opt => {
                  const isChecked = Array.isArray(selectedSymptoms) && selectedSymptoms.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleSymptom(opt.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                        isChecked
                          ? opt.level === 1
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-200 shadow-xs'
                            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-400 dark:border-slate-500'
                      }`}>
                        {isChecked && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Triage Decision Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border transition-all">
                {selectedSymptoms.length === 0 ? (
                  <div className="text-center py-3 text-slate-500 dark:text-slate-400 text-xs">
                    {isTelugu ? 'ట్రయాజ్ సిఫార్సు చూడటానికి పై లక్షణాలను ఎంచుకోండి.' : 'Select symptoms above to see tailored clinical triage guidance.'}
                  </div>
                ) : highestTriageLevel === 1 ? (
                  <div className="bg-rose-100 dark:bg-rose-950/80 border border-rose-400 dark:border-rose-700 p-4 rounded-2xl text-rose-950 dark:text-rose-100 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-extrabold text-sm">
                      <AlertTriangle className="h-5 w-5 animate-bounce" />
                      <span>{isTelugu ? 'స్థాయి 1: తక్షణ అత్యవసర వైద్య సంరక్షణ అవసరం!' : 'LEVEL 1: SEEK IMMEDIATE EMERGENCY CARE!'}</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {isTelugu
                        ? 'మీరు సూచించిన సంకేతాలు అండాశయ తిమ్మిరి, తిత్తి పగిలిపోవడం లేదా తీవ్రమైన రక్తస్రావాన్ని సూచిస్తున్నాయి. వెంటనే 108 / 112 / 911 కి కాల్ చేయండి లేదా ఎమర్జెన్సీ విభాగానికి వెళ్ళండి.'
                        : 'Your selected symptoms match acute clinical emergencies such as ovarian torsion, ruptured cyst, or acute hemorrhage. Call 108 / 112 / 911 or visit the nearest ER immediately.'}
                    </p>
                  </div>
                ) : highestTriageLevel === 2 ? (
                  <div className="bg-amber-100 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-700 p-4 rounded-2xl text-amber-950 dark:text-amber-100 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold text-sm">
                      <Clock className="h-5 w-5" />
                      <span>{isTelugu ? 'స్థాయి 2: 24 గంటల్లోపు అర్జెంట్ కేర్ / గైనకాలజిస్ట్‌ను కలవండి' : 'LEVEL 2: URGENT VISIT WITHIN 24 HOURS'}</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {isTelugu
                        ? 'ఈ లక్షణాలు ఇన్‌ఫెక్షన్ లేదా తీవ్రమవుతున్న సమస్యలకు సంకేతం కావచ్చు. అదే రోజు మీ వైద్యుడితో లేదా అర్జెంట్ కేర్ క్లినిక్‌తో అపాయింట్‌మెంట్ తీసుకోండి.'
                        : 'These symptoms require urgent clinical evaluation within 24 hours to prevent complications. Contact your gynecologist or visit urgent care.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-teal-100 dark:bg-teal-950/80 border border-teal-400 dark:border-teal-700 p-4 rounded-2xl text-teal-950 dark:text-teal-100 space-y-2">
                    <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-extrabold text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{isTelugu ? 'స్థాయి 3: సాధారణ / నాన్-ఎమర్జెన్సీ మద్దతు' : 'LEVEL 3: ROUTINE MONITORING & CONSULTATION'}</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {isTelugu
                        ? 'ప్రస్తుత లక్షణాలు తక్షణ అత్యవసర కేటగిరీలో లేవు. మీ తదుపరి షెడ్యూల్డ్ క్లినికల్ సంప్రదింపుల్లో వీటిని చర్చించండి మరియు డైలీ ట్రాకర్‌లో నమోదు చేస్తూ ఉండండి.'
                        : 'Your symptoms appear manageable with routine care. Continue logging in the Daily Tracker and discuss at your next scheduled visit.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTS & CRISIS HELPLINES */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Emergency Services */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
                  <span className="text-xs font-extrabold text-rose-900 dark:text-rose-200 uppercase tracking-wider block">
                    {isTelugu ? 'జాతీయ అత్యవసర నంబర్లు' : 'National Emergency Response'}
                  </span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          India Emergency (Medical / Ambulance)
                        </span>
                        <span className="text-base font-black text-rose-600">108 / 112</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('108')}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
                          title="Copy"
                        >
                          {copiedNumber === '108' ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a
                          href="tel:108"
                          className="p-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          US & Canada Emergency
                        </span>
                        <span className="text-base font-black text-rose-600">911</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('911')}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
                          title="Copy"
                        >
                          {copiedNumber === '911' ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a
                          href="tel:911"
                          className="p-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mental Health Lifelines */}
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
                  <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 uppercase tracking-wider block">
                    {isTelugu ? '24/7 మానసిక ఆరోగ్య హెల్ప్‌లైన్‌లు' : '24/7 Mental Health Crisis Lines'}
                  </span>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Tele-MANAS (India 24/7)
                        </span>
                        <span className="text-base font-black text-purple-600">14416</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('14416')}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
                          title="Copy"
                        >
                          {copiedNumber === '14416' ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a
                          href="tel:14416"
                          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          988 Suicide & Crisis Lifeline (US)
                        </span>
                        <span className="text-base font-black text-purple-600">988</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('988')}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
                          title="Copy"
                        >
                          {copiedNumber === '988' ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a
                          href="tel:988"
                          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to tell ER staff */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {isTelugu ? 'ఎమర్జెన్సీ స్టాఫ్‌కు ఏమి చెప్పాలి (క్విక్ చెక్‌లిస్ట్):' : 'What to Communicate to Emergency Room Doctors:'}
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {isTelugu
                    ? '1. నాకు PCOS ఉంది. 2. తీవ్రమైన నొప్పి ఎప్పుడు మొదలైంది. 3. చివరి పీరియడ్ తేదీ మరియు ప్రెగ్నెన్సీ అవకాశం. 4. ఉపయోగించే మందులు (Metformin, Hormones). 5. అండాశయ తిమ్మిరి లేదా తిత్తి పగిలిపోవడాన్ని నిర్ధారించడానికి పెల్విక్ అల్ట్రాసౌండ్ అభ్యర్థించండి.'
                    : '1. State your PCOS diagnosis clearly. 2. Note exact time pain began. 3. Provide date of last menstrual period. 4. List all hormone or insulin medications. 5. Explicitly request an urgent pelvic ultrasound to rule out ovarian torsion.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {onAskAI && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskAI(isTelugu ? 'PCOS అండాశయ తిమ్మిరి మరియు ఎమర్జెన్సీ లక్షణాల గురించి వివరించండి' : 'Explain PCOS ovarian torsion, cyst rupture, and when to go to the ER');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              <span>{isTelugu ? 'ఈ లక్షణాల గురించి PCOSense AIని అడగండి' : 'Ask PCOSense AI about these symptoms'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isTelugu ? 'ముద్రించండి' : 'Print Handout'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-white transition-colors"
            >
              {isTelugu ? 'మూసివేయి' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
