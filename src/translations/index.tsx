import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { te } from './te';

export type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isTelugu: boolean;
}

export const translations: Record<Language, any> = {
  en,
  te
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'pcosense_language_pref';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'te' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  /**
   * Translate helper: supports dot notation like 'nav.overview', 'auth.loginTitle'
   */
  const t = (path: string, fallback?: string): string => {
    const currentDict = translations[language] || translations.en;
    const englishDict = translations.en;

    const resolve = (dict: any, keyPath: string) => {
      const keys = keyPath.split('.');
      let current = dict;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    const translated = resolve(currentDict, path);
    if (translated !== undefined) return translated;

    const englishFallback = resolve(englishDict, path);
    if (englishFallback !== undefined) return englishFallback;

    return fallback !== undefined ? fallback : path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTelugu: language === 'te'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
