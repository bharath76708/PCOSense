import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Maximize2,
  Minimize2,
  BookOpen,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  HelpCircle,
  Activity
} from 'lucide-react';
import { askAIAssistant, transcribeVoiceAudio } from '../services/api';
import { useAssessment } from '../context/AssessmentContext';
import { useLanguage } from '../translations';
import {
  playNotificationSound,
  isSoundEnabled,
  setSoundEnabled
} from '../services/soundService';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  matchedTopics?: any[];
  model?: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  defaultPrompt
}) => {
  const { patientData, predictionResult } = useAssessment();
  const { t, language } = useLanguage();

  const isTelugu = language === 'te';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isTelugu
        ? `నమస్కారం! నేను **PCOSense AI** — మీ PCOS అవగాహన మరియు సహాయకారిని.\n\nనేను మీకు వీటిలో సహాయపడగలను:\n- **మీ స్కోర్ & రిస్క్ విశ్లేషణ**\n- **లక్షణాలు, హార్మోన్లు (AMH, LH/FSH, అల్ట్రాసౌండ్)**\n- **BMI, పోషకాహారం & జీవనశైలి మార్పులు**\n- **మీ డాక్టర్‌ను అడగవలసిన ముఖ్యమైన ప్రశ్నలు**\n\n*గమనిక: ఈ AI కేవలం అవగాహన కోసం మాత్రమే, రోగ నిర్ధారణ లేదా మందులను ఇవ్వదు.* ఈరోజు నేను మీకు ఎలా సహాయపడగలను?`
        : `Hello! I am **PCOSense AI**, your dedicated Polycystic Ovary Syndrome awareness and education assistant.\n\nI can help you understand:\n- **Your Prediction Result & Risk Breakdown**\n- **Symptoms, Hormones & Lab Markers** (AMH, LH/FSH, Follicles)\n- **BMI, Nutrition & Lifestyle Strategies**\n- **Questions to Prepare for Your OB/GYN**\n\n*Note: PCOSense AI provides educational support only and does not diagnose or prescribe medication.* How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'Gemini 3.7 Flash'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  useEffect(() => {
    const handleSoundChange = (e: any) => {
      setSoundOn(e.detail?.enabled ?? isSoundEnabled());
    };
    window.addEventListener('pcosense-sound-pref-changed', handleSoundChange);
    return () => window.removeEventListener('pcosense-sound-pref-changed', handleSoundChange);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playNotificationSound('ai-reply', true);
    }
  };
  
  // Update welcome message if language switches and only welcome message is present
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'assistant',
            text: isTelugu
              ? `నమస్కారం! నేను **PCOSense AI** — మీ PCOS అవగాహన మరియు సహాయకారిని.\n\nనేను మీకు వీటిలో సహాయపడగలను:\n- **మీ స్కోర్ & రిస్క్ విశ్లేషణ**\n- **లక్షణాలు, హార్మోన్లు (AMH, LH/FSH, అల్ట్రాసౌండ్)**\n- **BMI, పోషకాహారం & జీవనశైలి మార్పులు**\n- **మీ డాక్టర్‌ను అడగవలసిన ముఖ్యమైన ప్రశ్నలు**\n\n*గమనిక: ఈ AI కేవలం అవగాహన కోసం మాత్రమే, రోగ నిర్ధారణ లేదా మందులను ఇవ్వదు.* ఈరోజు నేను మీకు ఎలా సహాయపడగలను?`
              : `Hello! I am **PCOSense AI**, your dedicated Polycystic Ovary Syndrome awareness and education assistant.\n\nI can help you understand:\n- **Your Prediction Result & Risk Breakdown**\n- **Symptoms, Hormones & Lab Markers** (AMH, LH/FSH, Follicles)\n- **BMI, Nutrition & Lifestyle Strategies**\n- **Questions to Prepare for Your OB/GYN**\n\n*Note: PCOSense AI provides educational support only and does not diagnose or prescribe medication.* How can I assist you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: 'Gemini 3.7 Flash'
          }
        ];
      }
      return prev;
    });
  }, [isTelugu]);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = isTelugu
    ? [
        'నా అంచనా రిస్క్ ఫలితాన్ని వివరించండి',
        'PCOS నియంత్రణకు మంచి ఆహారం మరియు వ్యాయామాలు ఏమిటి?',
        'నా BMI మరియు లక్షణాలు దేనిని సూచిస్తున్నాయి?',
        'అల్ట్రాసౌండ్‌లో ఫోలికల్స్ అంటే ఏమిటి?',
        'డాక్టర్‌ను నేను ఎలాంటి ప్రశ్నలు అడగాలి?'
      ]
    : [
        'Explain my prediction result in simple terms',
        'What lifestyle and diet changes help with PCOS?',
        'What do my BMI and symptoms indicate?',
        'How do follicles and ultrasound relate to PCOS?',
        'What questions should I ask my doctor?'
      ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isRecording, isTranscribing]);

  // Handle default prompt if passed
  useEffect(() => {
    if (defaultPrompt && isOpen) {
      handleSendMessage(defaultPrompt);
    }
  }, [defaultPrompt, isOpen]);

  // Cleanup audio recorder on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch {
        // ignore
      }
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Start Voice Recording
  const startVoiceRecording = async () => {
    setInput('');
    audioChunksRef.current = [];
    setRecordingDuration(0);

    // 1. Try Browser SpeechRecognition for instant live feedback
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setInput(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition notice:', event.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Live SpeechRecognition not supported in iframe, using MediaRecorder fallback:', err);
      }
    }

    // 2. MediaRecorder for Gemini Flash Audio Transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
          await processVoiceWithGemini(audioBlob, mimeType);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start duration counter
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setIsRecording(false);
      alert('Microphone access was denied or is not available. Please allow microphone permissions or type your question.');
    }
  };

  // Stop Voice Recording
  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  // Process audio Blob with Gemini Flash Transcription API
  const processVoiceWithGemini = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const transcribedText = await transcribeVoiceAudio(base64Data, mimeType);
          if (transcribedText && transcribedText.trim()) {
            setInput(transcribedText.trim());
          }
        } catch (err) {
          console.warn('Gemini transcription fallback, maintaining any speechRecognition text:', err);
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setIsTranscribing(false);
    }
  };

  // Send Chat Message to PCOSense Gemini Chatbot
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    if (isRecording) {
      stopVoiceRecording();
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const patientContext = {
        risk_level: predictionResult?.risk_level,
        probability: predictionResult?.probabilityPercentage,
        bmi: patientData?.['BMI'] || (patientData?.['Weight (Kg)'] && patientData?.['Height(Cm)'] ? (patientData['Weight (Kg)'] / Math.pow(patientData['Height(Cm)'] / 100, 2)).toFixed(1) : undefined),
        cycleStatus: patientData?.['Cycle(R/I)'] === 2 ? 'Regular (21-35 days)' : 'Irregular (>35 days)',
        keyDrivers: predictionResult?.key_risk_drivers,
        patientData: patientData
      };

      const res = await askAIAssistant(query, patientContext, updatedHistory, language);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedTopics: res.matchedTopics,
        model: res.model || 'Gemini 3.7 Flash'
      };

      setMessages(prev => [...prev, assistantMsg]);
      playNotificationSound('ai-reply');
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: isTelugu
            ? 'AI సేవను సంప్రదించడంలో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి లేదా ఎడ్యుకేషన్ విభాగం చూడండి.'
            : 'I encountered an issue connecting to the AI awareness service. Please try again or explore the Education and Glossary sections.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="pcosense-ai-chatbot-drawer"
      className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'inset-4 sm:inset-10 max-w-4xl mx-auto rounded-3xl'
          : 'w-full sm:w-[480px] h-[660px] max-h-[92vh] sm:right-6 sm:bottom-6 rounded-t-3xl sm:rounded-3xl'
      } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md border-b border-teal-800/40 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
            <Sparkles className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {t('common.askAI', 'Ask PCOSense AI')}
              </h3>
              <span className="bg-teal-500/30 border border-teal-400/40 text-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-teal-100/80 dark:text-teal-200/70 mt-0.5">
              {isTelugu ? 'PCOS ప్రశ్నలు, లక్షణాలు, BMI, ఆహారం & ఫలితాల వివరణ' : 'PCOS questions, symptoms, BMI, nutrition & result explanations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={toggleSound}
            className="p-2 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title={soundOn ? (isTelugu ? 'ధ్వని ఆన్ (మ్యూట్ చేయడానికి క్లిక్ చేయండి)' : 'Sound On (Click to Mute)') : (isTelugu ? 'ధ్వని మ్యూట్ (ఆన్ చేయడానికి క్లిక్ చేయండి)' : 'Sound Muted (Click to Unmute)')}
            id="chat-sound-toggle-btn"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-teal-300" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:flex p-2 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
            id="chat-expand-toggle-btn"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Close Assistant"
            id="chat-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ACTIVE PATIENT CONTEXT CHIP */}
      {predictionResult ? (
        <div className="bg-teal-50 dark:bg-teal-950/70 border-b border-teal-100 dark:border-teal-900/60 px-4 py-2 flex items-center justify-between text-xs text-teal-950 dark:text-teal-200 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Stethoscope className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <span className="font-medium truncate">
              {isTelugu ? 'ప్రస్తుత స్క్రీనింగ్:' : 'Active Assessment:'} <strong>{predictionResult.risk_level} {isTelugu ? 'రిస్క్' : 'Risk'}</strong> ({predictionResult.probabilityPercentage}%)
            </span>
          </div>
          <span className="text-[10px] bg-teal-200/80 dark:bg-teal-800 text-teal-900 dark:text-teal-100 px-2 py-0.5 rounded-md font-mono shrink-0">
            {predictionResult.assessment_id}
          </span>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 py-1.5 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
          <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>{isTelugu ? 'సాధారణ PCOS, ఆహార లేదా జీవనశైలి ప్రశ్నలు అడగండి.' : 'No active assessment loaded. Ask general PCOS, nutrition, or lifestyle questions.'}</span>
        </div>
      )}

      {/* CHAT MESSAGES BODY */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60 dark:bg-slate-950/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-800 dark:bg-teal-700 text-white rounded-tr-none shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm space-y-2'
              }`}
            >
              {/* Message text formatted with simple markdown simulation */}
              <div className="whitespace-pre-line space-y-1.5">
                {msg.text.split('\n\n').map((para, idx) => (
                  <p key={`para-${msg.id}-${idx}`} className="leading-relaxed">
                    {para.split('**').map((chunk, cIdx) => (
                      cIdx % 2 === 1 ? (
                        <strong key={`bold-${msg.id}-${idx}-${cIdx}`} className="font-semibold text-slate-950 dark:text-white">
                          {chunk}
                        </strong>
                      ) : (
                        <React.Fragment key={`text-${msg.id}-${idx}-${cIdx}`}>{chunk}</React.Fragment>
                      )
                    ))}
                  </p>
                ))}
              </div>

              {/* MODEL BADGE & REFERENCES */}
              {msg.model && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-teal-700 dark:text-teal-300">
                    <BookOpen className="h-3 w-3 text-teal-600 dark:text-teal-400" /> {isTelugu ? 'ప్రామాణిక PCOS క్లినికల్ డేటా' : 'Grounded PCOS Knowledge'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-700 dark:text-teal-400" />
              <span>{isTelugu ? 'PCOSense AI విశ్లేషిస్తోంది, దయచేసి వేచి ఉండండి...' : 'PCOSense AI is thinking & composing a clear explanation...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPT SUGGESTIONS */}
      <div className="px-3 sm:px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span>{isTelugu ? 'సూచించిన ప్రశ్నలు:' : 'Suggested Questions:'}</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading || isRecording}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/70 hover:text-teal-900 dark:hover:text-teal-200 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span>{q}</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* VOICE RECORDING ACTIVE OVERLAY */}
      {isRecording && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-t border-rose-200 dark:border-rose-800 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <span className="font-semibold">
              {isTelugu ? `వింటోంది... మీ ప్రశ్నను మాట్లాడండి (${recordingDuration}s)` : `Listening... Speak your question (${recordingDuration}s)`}
            </span>
          </div>
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <MicOff className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'మాట్లాడటం పూర్తయింది' : 'Done Speaking'}</span>
          </button>
        </div>
      )}

      {/* TRANSCRIBING STATE */}
      {isTranscribing && (
        <div className="bg-teal-50 dark:bg-teal-950/80 border-t border-teal-200 dark:border-teal-800 px-4 py-2 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-200 shrink-0">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600 dark:text-teal-400" />
          <span>{isTelugu ? 'మీ వాయిస్ ప్రశ్నను AI మారుస్తోంది...' : 'Converting your voice question with Gemini AI...'}</span>
        </div>
      )}

      {/* INPUT FORM WITH VOICE MICROPHONE BUTTON */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        id="ai-chatbot-input-form"
      >
        {/* Voice Input Microphone Button */}
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isLoading || isTranscribing}
          className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white shadow-md ring-4 ring-rose-200 dark:ring-rose-900 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/70 hover:text-teal-800 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
          title={isRecording ? 'Stop voice recording' : 'Voice Input: Ask your question using microphone'}
          id="voice-input-mic-btn"
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            isRecording
              ? (isTelugu ? 'మీ స్వరాన్ని వింటోంది...' : 'Listening to your voice...')
              : (isTelugu ? 'PCOS, లక్షణాలు, BMI, జీవనశైలి లేదా మీ స్కోర్ గురించి అడగండి...' : 'Ask about PCOS, symptoms, BMI, lifestyle, or your score...')
          }
          disabled={isLoading || isRecording}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          id="ai-chatbot-text-input"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isRecording}
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-teal-800 dark:bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-500 active:bg-teal-900 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
          id="ai-chatbot-send-btn"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* CLINICAL SAFETY DISCLAIMER */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-4 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 shrink-0">
        <ShieldAlert className="h-3 w-3 text-slate-400 dark:text-slate-500" />
        <span>{t('results.disclaimerNotice', 'For health awareness only. Does not diagnose or prescribe medication. Consult your healthcare provider.')}</span>
      </div>
    </div>
  );
};
