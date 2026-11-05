import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccentColor, ThemeSettings } from '../types';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  highContrast: boolean;
  accentColor: AccentColor;
  fontSize: 'normal' | 'large';
  setTheme: (theme: Theme) => void;
  setHighContrast: (enabled: boolean) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: 'normal' | 'large') => void;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
  resetThemeSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_PALETTES: Record<AccentColor, {
  name: string;
  badge: string;
  primary: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  ring: string;
}> = {
  teal: {
    name: 'Clinical Teal (Default)',
    badge: 'bg-teal-600',
    primary: '#0d9488',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/70',
    textLight: 'text-teal-900',
    textDark: 'dark:text-teal-200',
    borderLight: 'border-teal-300',
    borderDark: 'dark:border-teal-700',
    ring: 'ring-teal-400'
  },
  emerald: {
    name: 'Sage Emerald',
    badge: 'bg-emerald-600',
    primary: '#059669',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/70',
    textLight: 'text-emerald-900',
    textDark: 'dark:text-emerald-200',
    borderLight: 'border-emerald-300',
    borderDark: 'dark:border-emerald-700',
    ring: 'ring-emerald-400'
  },
  rose: {
    name: 'Berry Rose',
    badge: 'bg-rose-600',
    primary: '#e11d48',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/70',
    textLight: 'text-rose-900',
    textDark: 'dark:text-rose-200',
    borderLight: 'border-rose-300',
    borderDark: 'dark:border-rose-700',
    ring: 'ring-rose-400'
  },
  indigo: {
    name: 'Royal Indigo',
    badge: 'bg-indigo-600',
    primary: '#4f46e5',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/70',
    textLight: 'text-indigo-900',
    textDark: 'dark:text-indigo-200',
    borderLight: 'border-indigo-300',
    borderDark: 'dark:border-indigo-700',
    ring: 'ring-indigo-400'
  },
  amber: {
    name: 'Sunset Amber',
    badge: 'bg-amber-600',
    primary: '#d97706',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/70',
    textLight: 'text-amber-900',
    textDark: 'dark:text-amber-200',
    borderLight: 'border-amber-300',
    borderDark: 'dark:border-amber-700',
    ring: 'ring-amber-400'
  },
  cyan: {
    name: 'Ocean Cyan',
    badge: 'bg-cyan-600',
    primary: '#0891b2',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/70',
    textLight: 'text-cyan-900',
    textDark: 'dark:text-cyan-200',
    borderLight: 'border-cyan-300',
    borderDark: 'dark:border-cyan-700',
    ring: 'ring-cyan-400'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pcosense_theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        return savedTheme;
      }
      return 'system';
    }
    return 'system';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedHC = localStorage.getItem('pcosense_high_contrast');
      return savedHC === 'true';
    }
    return false;
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const savedAccent = localStorage.getItem('pcosense_accent_color') as AccentColor | null;
      if (savedAccent && ['teal', 'emerald', 'rose', 'indigo', 'amber', 'cyan'].includes(savedAccent)) {
        return savedAccent;
      }
    }
    return 'teal';
  });

  const [fontSize, setFontSizeState] = useState<'normal' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem('pcosense_font_size');
      return savedSize === 'large' ? 'large' : 'normal';
    }
    return 'normal';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pcosense_theme') as Theme | null;
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme classes and attributes to documentElement
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateActualTheme = () => {
      const effectiveDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);

      setIsDark(effectiveDark);

      if (effectiveDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }

      // High contrast toggle
      if (highContrast) {
        root.classList.add('high-contrast');
        root.setAttribute('data-high-contrast', 'true');
      } else {
        root.classList.remove('high-contrast');
        root.removeAttribute('data-high-contrast');
      }

      // Accent color classes
      ['accent-teal', 'accent-emerald', 'accent-rose', 'accent-indigo', 'accent-amber', 'accent-cyan'].forEach(c => {
        root.classList.remove(c);
      });
      root.classList.add(`accent-${accentColor}`);
      root.setAttribute('data-accent', accentColor);

      // Font size scale
      if (fontSize === 'large') {
        root.classList.add('text-comfort');
        root.setAttribute('data-font-size', 'large');
      } else {
        root.classList.remove('text-comfort');
        root.removeAttribute('data-font-size');
      }
    };

    updateActualTheme();

    const handleMediaChange = () => {
      if (theme === 'system') {
        updateActualTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme, highContrast, accentColor, fontSize]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('pcosense_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      localStorage.setItem('pcosense_high_contrast', String(enabled));
    } catch {
      // ignore
    }
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    try {
      localStorage.setItem('pcosense_accent_color', color);
    } catch {
      // ignore
    }
  };

  const setFontSize = (size: 'normal' | 'large') => {
    setFontSizeState(size);
    try {
      localStorage.setItem('pcosense_font_size', size);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const resetThemeSettings = () => {
    setTheme('system');
    setHighContrast(false);
    setAccentColor('teal');
    setFontSize('normal');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        highContrast,
        accentColor,
        fontSize,
        setTheme,
        setHighContrast,
        setAccentColor,
        setFontSize,
        toggleTheme,
        toggleHighContrast,
        resetThemeSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

