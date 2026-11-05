import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isLargeText: boolean;
  isHighContrast: boolean;
  isEasyRead: boolean;
  isAnyActive: boolean;
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  toggleEasyRead: () => void;
  setLargeText: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setEasyRead: (enabled: boolean) => void;
  enableAllAccessibility: () => void;
  resetAccessibility: () => void;
  simplifyTerm: (key: string, defaultText: string, easyText?: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const EASY_READ_DICTIONARY: Record<string, { en: string; te: string }> = {
  pcos: {
    en: 'Hormone & Period Health (PCOS)',
    te: 'హార్మోన్ల & పీరియడ్స్ ఆరోగ్యం (PCOS)'
  },
  assessment: {
    en: 'Simple 3-Minute Health Check',
    te: 'సులువైన 3 నిమిషాల ఆరోగ్య పరీక్ష'
  },
  screening: {
    en: 'Symptom & Period Check',
    te: 'లక్షణాలు & పీరియడ్స్ పరీక్ష'
  },
  riskEstimate: {
    en: 'Clear Health Risk Estimate',
    te: 'స్పష్టమైన ఆరోగ్య రిస్క్ అంచనా'
  },
  rotterdam: {
    en: 'International Doctor Checklist',
    te: 'అంతర్జాతీయ వైద్యుల ప్రమాణాలు'
  },
  phenotype: {
    en: 'Health Category & Pattern',
    te: 'ఆరోగ్య నమూనా & రకం'
  },
  hyperandrogenism: {
    en: 'Extra Male Hormones (Hair/Acne)',
    te: 'అదనపు హార్మోన్లు (రోమాలు/మొటిమలు)'
  },
  hirsutism: {
    en: 'Thicker Chin/Body Hair',
    te: 'ముఖం/శరీరంపై అదనపు రోమాలు'
  },
  acanthosis: {
    en: 'Dark Velvety Skin Patches',
    te: 'మెడ/చర్మంపై నల్లటి మచ్చలు'
  },
  biomarkers: {
    en: 'Lab Test Numbers & Body Signs',
    te: 'ల్యాబ్ పరీక్షలు & శారీరక సంకేతాలు'
  },
  follicleCount: {
    en: 'Small Follicles in Ovary Scan',
    te: 'అండాశయ స్కానింగ్‌లో చిన్న ఫోలికల్స్'
  },
  insulinResistance: {
    en: 'Blood Sugar & Insulin Response',
    te: 'రక్తంలో షుగర్ & ఇన్సులిన్ స్థాయి'
  },
  wellnessPlan: {
    en: 'Home Food, Yoga & Daily Habits',
    te: 'ఇంటి ఆహారం, యోగా & మంచి అలవాట్లు'
  },
  telehealth: {
    en: 'Chat or Video Call with Doctor',
    te: 'డాక్టర్‌తో చాట్ లేదా వీడియో సంభాషణ'
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcosense_large_text') === 'true';
    } catch {
      return false;
    }
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcosense_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const [isEasyRead, setIsEasyRead] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcosense_easy_read') === 'true';
    } catch {
      return false;
    }
  });

  // Apply classes globally to documentElement
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    if (isLargeText) {
      root.classList.add('text-comfort');
      root.setAttribute('data-font-size', 'large');
      try {
        localStorage.setItem('pcosense_large_text', 'true');
      } catch {}
    } else {
      root.classList.remove('text-comfort');
      root.removeAttribute('data-font-size');
      try {
        localStorage.setItem('pcosense_large_text', 'false');
      } catch {}
    }

    // High contrast
    if (isHighContrast) {
      root.classList.add('high-contrast');
      root.setAttribute('data-high-contrast', 'true');
      try {
        localStorage.setItem('pcosense_high_contrast', 'true');
      } catch {}
    } else {
      root.classList.remove('high-contrast');
      root.removeAttribute('data-high-contrast');
      try {
        localStorage.setItem('pcosense_high_contrast', 'false');
      } catch {}
    }

    // Easy-Read plain language mode
    if (isEasyRead) {
      root.classList.add('easy-read');
      root.setAttribute('data-easy-read', 'true');
      try {
        localStorage.setItem('pcosense_easy_read', 'true');
      } catch {}
    } else {
      root.classList.remove('easy-read');
      root.removeAttribute('data-easy-read');
      try {
        localStorage.setItem('pcosense_easy_read', 'false');
      } catch {}
    }
  }, [isLargeText, isHighContrast, isEasyRead]);

  const toggleLargeText = () => setIsLargeText(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const toggleEasyRead = () => setIsEasyRead(prev => !prev);

  const setLargeText = (enabled: boolean) => setIsLargeText(enabled);
  const setHighContrast = (enabled: boolean) => setIsHighContrast(enabled);
  const setEasyRead = (enabled: boolean) => setIsEasyRead(enabled);

  const enableAllAccessibility = () => {
    setIsLargeText(true);
    setIsHighContrast(true);
    setIsEasyRead(true);
  };

  const resetAccessibility = () => {
    setIsLargeText(false);
    setIsHighContrast(false);
    setIsEasyRead(false);
  };

  const simplifyTerm = (key: string, defaultText: string, customEasyText?: string): string => {
    if (!isEasyRead) return defaultText;
    if (customEasyText) return customEasyText;
    const lookup = EASY_READ_DICTIONARY[key.toLowerCase()];
    if (lookup) {
      return lookup.en;
    }
    return defaultText;
  };

  const isAnyActive = isLargeText || isHighContrast || isEasyRead;

  return (
    <AccessibilityContext.Provider
      value={{
        isLargeText,
        isHighContrast,
        isEasyRead,
        isAnyActive,
        toggleLargeText,
        toggleHighContrast,
        toggleEasyRead,
        setLargeText,
        setHighContrast,
        setEasyRead,
        enableAllAccessibility,
        resetAccessibility,
        simplifyTerm
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      isLargeText: false,
      isHighContrast: false,
      isEasyRead: false,
      isAnyActive: false,
      toggleLargeText: () => {},
      toggleHighContrast: () => {},
      toggleEasyRead: () => {},
      setLargeText: () => {},
      setHighContrast: () => {},
      setEasyRead: () => {},
      enableAllAccessibility: () => {},
      resetAccessibility: () => {},
      simplifyTerm: (_key: string, defaultText: string, easyText?: string) => easyText || defaultText
    };
  }
  return context;
};
