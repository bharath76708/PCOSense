import React, { useState, useRef, useEffect } from 'react';
import { Eye, Check, X, Sparkles, Type, Contrast, BookOpen, RefreshCcw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../translations';

interface AccessibilityToggleProps {
  variant?: 'nav' | 'compact' | 'inline';
}

export const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({ variant = 'nav' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    isLargeText,
    isHighContrast,
    isEasyRead,
    isAnyActive,
    toggleLargeText,
    toggleHighContrast,
    toggleEasyRead,
    enableAllAccessibility,
    resetAccessibility
  } = useAccessibility();
  const { isTelugu } = useLanguage();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeCount = (isLargeText ? 1 : 0) + (isHighContrast ? 1 : 0) + (isEasyRead ? 1 : 0);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          isAnyActive
            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/40'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
        }`}
        id="global-accessibility-toggle-btn"
        aria-label="Open accessibility options"
        aria-expanded={isOpen}
      >
        <Eye className={`h-4 w-4 ${isAnyActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-500 dark:text-slate-400'}`} />
        <span className="hidden sm:inline">
          {isTelugu ? 'సౌలభ్యం' : 'Accessibility'}
        </span>
        {isAnyActive && (
          <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
          id="accessibility-options-menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                  {isTelugu ? 'సౌలభ్య ఎంపికలు (Accessibility)' : 'Accessibility & Comfort'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isTelugu ? 'అందరికీ చదవడానికి సులభంగా ఉండే సాధనాలు' : 'Easy reading tools for everyone'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Master 1-Click Toggle */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {isTelugu ? 'ఒకే క్లిక్‌తో సులభ మోడ్' : '1-Click All-Accessible Mode'}
                </span>
              </div>
              {activeCount === 3 ? (
                <button
                  type="button"
                  onClick={resetAccessibility}
                  className="text-[11px] font-bold text-amber-900 dark:text-amber-300 underline hover:no-underline flex items-center gap-1"
                >
                  <RefreshCcw className="h-3 w-3" />
                  {isTelugu ? 'రీసెట్' : 'Reset All'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={enableAllAccessibility}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-xs"
                  id="enable-all-accessibility-btn"
                >
                  {isTelugu ? 'అన్నీ ప్రారంభించు' : 'Enable All'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              {isTelugu
                ? 'పెద్ద అక్షరాలు, స్పష్టమైన రంగులు మరియు సాధారణ భాషను ఒకేసారి సక్రియం చేస్తుంది.'
                : 'Instantly enables larger fonts, high contrast, and simplified everyday language.'}
            </p>
          </div>

          {/* Individual Feature Controls */}
          <div className="mt-4 space-y-3">
            {/* 1. Large Font Size */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 max-w-[200px]">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'పెద్ద అక్షరాలు (18px+)' : 'Larger Font Size (18px+)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {isTelugu ? 'సులభంగా చదవడానికి అక్షరాల పరిమాణం పెరుగుతుంది' : 'Boosts text scale for effortless reading'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isLargeText}
                onClick={toggleLargeText}
                id="toggle-large-font-btn"
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  isLargeText ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isLargeText ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Global High Contrast */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 max-w-[200px]">
                <div className="flex items-center gap-2">
                  <Contrast className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'అధిక కాంట్రాస్ట్ (High Contrast)' : 'Boosted High Contrast'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {isTelugu ? 'ముదురు అక్షరాలు మరియు స్పష్టమైన బోర్డర్‌లు' : 'Sharp black/white tones with strong outlines'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isHighContrast}
                onClick={toggleHighContrast}
                id="toggle-high-contrast-btn"
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  isHighContrast ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isHighContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Easy-Read Plain Language Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 max-w-[200px]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isTelugu ? 'సరళ భాష మోడ్ (Easy-Read)' : 'Plain-Language "Easy-Read"'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {isTelugu ? 'వైద్య పదాలను సాధారణ తెలుగులోకి మారుస్తుంది' : 'Replaces clinical jargon with plain everyday words'}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isEasyRead}
                onClick={toggleEasyRead}
                id="toggle-easy-read-btn"
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  isEasyRead ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isEasyRead ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {isTelugu ? 'ప్రాధాన్యతలు స్వయంచాలకంగా సేవ్ చేయబడతాయి' : 'Preferences saved automatically'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isTelugu ? 'పూర్తయింది' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
