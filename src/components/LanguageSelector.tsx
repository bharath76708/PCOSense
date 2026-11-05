import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../translations';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'drawer' | 'pill';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const isCompact = variant === 'compact';

  return (
    <div
      className={`inline-flex items-center rounded-xl p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs transition-all ${className}`}
      role="group"
      aria-label="Language selection / భాష ఎంపిక"
      id="language-selector-container"
    >
      {/* Globe Icon Indicator */}
      <div className="pl-1.5 pr-1 text-slate-500 dark:text-slate-400 select-none flex items-center shrink-0">
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      </div>

      {/* English Option */}
      <button
        type="button"
        onClick={() => handleSelect('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
          language === 'en'
            ? 'bg-teal-600 text-white shadow-xs font-extrabold ring-1 ring-teal-500'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 font-semibold'
        }`}
        aria-pressed={language === 'en'}
        title="Switch to English"
        id="lang-btn-en"
      >
        <span className="text-xs">🇬🇧</span>
        <span>{isCompact ? 'EN' : 'English'}</span>
      </button>

      {/* Divider */}
      <span className="text-slate-300 dark:text-slate-600 px-0.5 select-none text-xs">|</span>

      {/* Telugu Option */}
      <button
        type="button"
        onClick={() => handleSelect('te')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
          language === 'te'
            ? 'bg-teal-600 text-white shadow-xs font-extrabold ring-1 ring-teal-500'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 font-semibold'
        }`}
        aria-pressed={language === 'te'}
        title="తెలుగులోకి మార్చండి"
        id="lang-btn-te"
      >
        <span className="text-xs">🇮🇳</span>
        <span>{isCompact ? 'తెలుగు' : 'తెలుగు'}</span>
      </button>
    </div>
  );
};
