import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Laptop, ChevronDown, Check, Sparkles, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'simple' | 'dropdown' | 'pill' | 'switch';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'simple',
  className = ''
}) => {
  const { theme, isDark, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updatePref = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', updatePref);
    return () => mediaQuery.removeEventListener('change', updatePref);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3-way cycle for single button: Light -> Dark -> System Auto -> Light
  const handleCycleTheme = () => {
    setIsAnimating(true);
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Morphing Icon Subcomponent with smooth spring physics and OS Auto badge
  const AnimatedThemeIcon = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const iconDimensions = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

    return (
      <div className={`relative ${iconDimensions} flex items-center justify-center`}>
        {/* Subtle glowing halo on mode switch */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full pointer-events-none ${
                isDark ? 'bg-indigo-400/30 dark:bg-teal-400/30' : 'bg-amber-400/40'
              }`}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {theme === 'system' ? (
            <motion.div
              key="system"
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 22,
                mass: 0.8
              }}
              className="absolute inset-0 flex items-center justify-center text-teal-600 dark:text-teal-400"
            >
              <Monitor className={`${iconDimensions} stroke-[2.2]`} />
            </motion.div>
          ) : isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -120, scale: 0.3, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 120, scale: 0.3, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 22,
                mass: 0.8
              }}
              className="absolute inset-0 flex items-center justify-center text-indigo-400 dark:text-teal-300"
            >
              <Moon className={`${iconDimensions} fill-indigo-400/20 dark:fill-teal-300/20 stroke-[2.2]`} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 120, scale: 0.3, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -120, scale: 0.3, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 22,
                mass: 0.8
              }}
              className="absolute inset-0 flex items-center justify-center text-amber-500"
            >
              <Sun className={`${iconDimensions} fill-amber-500/20 stroke-[2.2]`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={handleCycleTheme}
        className={`relative inline-flex h-8 w-20 items-center justify-between rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          theme === 'system'
            ? 'bg-teal-900/60 border border-teal-500/50 shadow-inner'
            : isDark 
            ? 'bg-slate-800 border border-slate-700 shadow-inner' 
            : 'bg-amber-100 border border-amber-300 shadow-inner'
        } ${className}`}
        aria-label={`Current theme: ${theme}. Click to switch theme (Light, Dark, or System Preference)`}
        title={
          theme === 'system'
            ? `System Auto (Syncing with OS: ${systemPrefersDark ? 'Dark' : 'Light'})`
            : theme === 'dark'
            ? 'Dark Theme'
            : 'Light Theme'
        }
      >
        <span className="text-[10px] font-bold px-1.5 uppercase text-slate-400 dark:text-slate-300">
          {theme === 'system' ? 'Auto' : theme}
        </span>
        <motion.div
          className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-colors duration-300 ${
            theme === 'system'
              ? 'bg-teal-700 text-white'
              : isDark
              ? 'bg-slate-900 text-teal-300'
              : 'bg-white text-amber-500'
          }`}
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28
          }}
        >
          <AnimatedThemeIcon size="sm" />
        </motion.div>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors duration-300 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'light'
              ? 'text-teal-900 dark:text-teal-200'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Light Theme"
        >
          {theme === 'light' && (
            <motion.div
              layoutId="pill-active-theme"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-xs"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
            <span>Light</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'dark'
              ? 'text-teal-900 dark:text-teal-200'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title="Dark Theme"
        >
          {theme === 'dark' && (
            <motion.div
              layoutId="pill-active-theme"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-xs"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5 text-indigo-400 dark:text-teal-300 fill-indigo-400/20 dark:fill-teal-300/20" />
            <span>Dark</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'system'
              ? 'text-teal-900 dark:text-teal-200 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title={`System Preference (Auto-Detect OS Theme - currently ${systemPrefersDark ? 'Dark' : 'Light'})`}
        >
          {theme === 'system' && (
            <motion.div
              layoutId="pill-active-theme"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-xs"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>System</span>
            <span className="text-[9px] px-1 py-0.2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded font-bold">
              Auto
            </span>
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
          id="theme-dropdown-btn"
          aria-label="Select color theme"
          title={`Theme: ${theme === 'system' ? `System Auto (${systemPrefersDark ? 'Dark' : 'Light'})` : theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        >
          <AnimatedThemeIcon size="sm" />
          <span className="capitalize">
            {theme === 'system' ? 'System (Auto)' : theme}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 z-50"
            >
              <button
                onClick={() => {
                  setTheme('light');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  theme === 'light'
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                  <span>Light Theme</span>
                </div>
                {theme === 'light' && <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
              </button>

              <button
                onClick={() => {
                  setTheme('dark');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5 text-indigo-400 dark:text-teal-300 fill-indigo-400/20 dark:fill-teal-300/20" />
                  <span>Dark Theme</span>
                </div>
                {theme === 'dark' && <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
              </button>

              <button
                onClick={() => {
                  setTheme('system');
                  setDropdownOpen(false);
                }}
                className={`w-full flex flex-col items-start px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                  theme === 'system'
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span>System Preference</span>
                  </div>
                  {theme === 'system' && <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
                </div>
                <span className="text-[10px] text-slate-400 pl-5.5 mt-0.5">
                  Auto-sync ({systemPrefersDark ? 'OS Dark' : 'OS Light'})
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default simple icon button toggle with 3-way cycle (Light -> Dark -> System Auto)
  return (
    <motion.button
      type="button"
      onClick={handleCycleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.90 }}
      className={`relative p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700/90 transition-colors duration-300 shadow-2xs overflow-hidden group ${className}`}
      aria-label={`Theme: ${theme}. Click to switch between Light, Dark, and System Preference Auto-Detect`}
      title={
        theme === 'system'
          ? `System Preference Auto-Detect (Active: ${systemPrefersDark ? 'OS Dark' : 'OS Light'} mode). Click to switch.`
          : theme === 'dark'
          ? 'Dark Theme (Click to switch to System Auto)'
          : 'Light Theme (Click to switch to Dark)'
      }
      id="theme-toggle-btn"
    >
      <AnimatedThemeIcon size="sm" />
      {theme === 'system' && (
        <span
          className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-teal-500 border border-white dark:border-slate-900"
          title="System Auto Active"
        />
      )}
    </motion.button>
  );
};



