import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Eye,
  Palette,
  Type,
  X,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Shield,
  Download,
  Volume2,
  VolumeX,
  Bell
} from 'lucide-react';
import { useTheme, ACCENT_PALETTES } from '../context/ThemeContext';
import { useLanguage } from '../translations';
import { AccentColor } from '../types';
import {
  isSoundEnabled,
  setSoundEnabled,
  getSoundVolume,
  setSoundVolume,
  playNotificationSound
} from '../services/soundService';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    theme,
    isDark,
    highContrast,
    accentColor,
    fontSize,
    setTheme,
    setHighContrast,
    setAccentColor,
    setFontSize,
    resetThemeSettings
  } = useTheme();

  const { t, isTelugu } = useLanguage();

  const [soundEnabled, setLocalSoundEnabled] = useState<boolean>(isSoundEnabled());
  const [soundVol, setLocalSoundVol] = useState<number>(getSoundVolume());

  useEffect(() => {
    setLocalSoundEnabled(isSoundEnabled());
    setLocalSoundVol(getSoundVolume());
  }, [isOpen]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setLocalSoundEnabled(next);
    setSoundEnabled(next);
    if (next) {
      playNotificationSound('symptom-logged', true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setLocalSoundVol(newVol);
    setSoundVolume(newVol);
  };

  const handleTestChime = () => {
    playNotificationSound('ai-reply', true);
  };

  if (!isOpen) return null;

  const accentList: { id: AccentColor; label: string; desc: string; color: string; hex: string }[] = [
    { id: 'teal', label: 'Clinical Teal', desc: 'Balanced medical standard', color: 'bg-teal-600', hex: '#0d9488' },
    { id: 'emerald', label: 'Sage Emerald', desc: 'Calming natural wellness', color: 'bg-emerald-600', hex: '#059669' },
    { id: 'rose', label: 'Berry Rose', desc: 'Warm supportive tone', color: 'bg-rose-600', hex: '#e11d48' },
    { id: 'indigo', label: 'Royal Indigo', desc: 'High visual authority', color: 'bg-indigo-600', hex: '#4f46e5' },
    { id: 'amber', label: 'Sunset Amber', desc: 'Energizing high-focus', color: 'bg-amber-600', hex: '#d97706' },
    { id: 'cyan', label: 'Ocean Cyan', desc: 'Crisp modern clarity', color: 'bg-cyan-600', hex: '#0891b2' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-settings-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Palette className="h-5 w-5 text-teal-200" />
            </div>
            <div>
              <h2 id="user-settings-title" className="text-lg font-extrabold text-slate-950 dark:text-white">
                {isTelugu ? 'డిస్‌ప్లే & యాక్సెసిబిలిటీ సెట్టింగ్‌లు' : 'Display & Accessibility Settings'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTelugu ? 'రంగు థీమ్, అధిక కాంట్రాస్ట్ మరియు దృశ్య ప్రాధాన్యతలను అనుకూలీకరించండి.' : 'Personalize your color palette, contrast modes, and accessibility comfort.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-400 focus:outline-none"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: HIGH CONTRAST MODE */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                    {isTelugu ? 'హై కాంట్రాస్ట్ మోడ్ (WCAG AAA)' : 'High Contrast Mode (WCAG AAA)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isTelugu 
                    ? 'స్పష్టమైన దృశ్య గ్రాహ్యత కోసం సరిహద్దులను 2px కు పెంచుతుంది, గరిష్ట కాంట్రాస్ట్ (7:1+) టెక్స్ట్ రంగులను మరియు ఫోకస్ రింగ్‌లను అందిస్తుంది.'
                    : 'Increases element border weights, sharpens color contrasts, and renders ultra-visible focus rings for reduced eye strain and enhanced readability.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only peer"
                  id="high-contrast-toggle"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {highContrast && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-100/70 dark:bg-teal-950 border border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-200 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" />
                <span>{isTelugu ? 'హై కాంట్రాస్ట్ మోడ్ సక్రియంగా ఉంది.' : 'High contrast accessibility borders and pure contrast values are now active.'}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: CUSTOM PRIMARY ACCENT PALETTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'ప్రైమరీ యాక్సెంట్ రంగు' : 'Primary Accent Palette'}</span>
              </label>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                {ACCENT_PALETTES[accentColor]?.name || 'Teal'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {accentList.map(item => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccentColor(item.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-900 dark:border-white shadow-sm ring-2 ring-teal-400/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`h-6 w-6 rounded-full ${item.color} shadow-xs border-2 border-white dark:border-slate-800 flex items-center justify-center`}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: THEME APPEARANCE (Light / Dark / System) */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{isTelugu ? 'కలర్ థీమ్ మోడ్' : 'Base Color Theme'}</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  theme === 'light'
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="h-5 w-5 mb-1 text-amber-500" />
                <span className="text-xs font-bold">{isTelugu ? 'లైట్' : 'Light'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  theme === 'dark'
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="h-5 w-5 mb-1 text-indigo-400" />
                <span className="text-xs font-bold">{isTelugu ? 'డార్క్' : 'Dark'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  theme === 'system'
                    ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-400 dark:border-teal-600 text-teal-950 dark:text-teal-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Laptop className="h-5 w-5 mb-1 text-teal-500" />
                <span className="text-xs font-bold">{isTelugu ? 'సిస్టమ్' : 'System Auto'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: TEXT COMFORT / FONT SIZE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Type className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'టెక్స్ట్ సౌకర్యం (ఫాంట్ పరిమాణం)' : 'Text Reading Comfort'}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  fontSize === 'normal'
                    ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-400 dark:border-teal-600 text-teal-950 dark:text-teal-200 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-xs font-bold block">{isTelugu ? 'ప్రామాణిక (16px)' : 'Standard (16px)'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{isTelugu ? 'డిఫాల్ట్ UI లేఅవుట్' : 'Default application density'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  fontSize === 'large'
                    ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-400 dark:border-teal-600 text-teal-950 dark:text-teal-200 font-bold'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-sm font-bold block">{isTelugu ? 'పెద్దది (17px+ సౌకర్యం)' : 'Comfortable (17px+)'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{isTelugu ? 'సులభ పఠనం కోసం పెద్ద ఫాంట్' : 'Enhanced legibility scale'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: AUDIO NOTIFICATIONS (AI Replies & Symptom Reminders) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>{isTelugu ? 'ఆడియో నోటిఫికేషన్‌లు & శబ్దాలు' : 'Sound & Audio Notifications'}</span>
              </label>

              <button
                type="button"
                onClick={handleTestChime}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isTelugu ? 'పరీక్షించండి' : 'Test Chime'}</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {isTelugu ? 'AI ప్రతిస్పందన & లాగ్ శబ్దాలు' : 'Subtle Audio Feedback'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isTelugu ? 'AI ప్రత్యుత్తరం వచ్చినప్పుడు మరియు శీఘ్ర లాగ్ సేవ్ అయినప్పుడు ఆహ్లాదకరమైన శబ్దం' : 'Gentle chimes when AI responds or symptoms are logged'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-teal-700 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                  aria-label="Toggle audio feedback"
                >
                  <div className="bg-white w-4.5 h-4.5 rounded-full shadow-md" />
                </button>
              </div>

              {soundEnabled && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                      <Volume2 className="h-3.5 w-3.5" />
                      {isTelugu ? 'శబ్దం స్థాయి (వాల్యూమ్)' : 'Chime Volume'}
                    </span>
                    <span className="font-bold text-teal-800 dark:text-teal-300">{Math.round(soundVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={soundVol}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={resetThemeSettings}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{isTelugu ? 'డిఫాల్ట్‌లకు రీసెట్ చేయండి' : 'Reset to Defaults'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-800 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-xs"
          >
            {isTelugu ? 'పూర్తయింది' : 'Save & Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
