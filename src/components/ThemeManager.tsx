import React, { useEffect, useState } from 'react';
import { ThemeSettings } from '../types';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({
  themeSettings,
  children
}: {
  themeSettings?: ThemeSettings;
  children: React.ReactNode;
}) {
  const safeTheme = themeSettings || {
    defaultTheme: 'dark',
    allowThemeToggle: true,
    rememberPreference: true,
    darkColors: {
      bg: '#0A0A0A',
      cardBg: '#141414',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      heading: '#FFFFFF',
      accent: '#F59E0B',
      accentHover: '#D97706',
      border: '#262626'
    },
    lightColors: {
      bg: '#F9FAFB',
      cardBg: '#FFFFFF',
      text: '#1F2937',
      textMuted: '#6B7280',
      heading: '#111827',
      accent: '#D97706',
      accentHover: '#B45309',
      border: '#E5E7EB'
    },
    typography: { headingFont: 'Plus Jakarta Sans', bodyFont: 'Plus Jakarta Sans', baseFontSize: 'md' },
    buttonStyle: { rounded: 'full', shadow: true },
    cardStyle: { rounded: 'xl', borderStyle: 'subtle' }
  };

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (safeTheme.rememberPreference && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('the_editor_theme');
        if (saved) return saved === 'dark';
      } catch {}
    }
    return safeTheme.defaultTheme !== 'light';
  });

  useEffect(() => {
    if (safeTheme.rememberPreference && typeof window !== 'undefined') {
      try {
        localStorage.setItem('the_editor_theme', isDark ? 'dark' : 'light');
      } catch {}
    }

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Apply custom palette variables from admin theme settings
    const colors = isDark ? (safeTheme.darkColors || safeTheme.lightColors) : (safeTheme.lightColors || safeTheme.darkColors);
    if (colors) {
      root.style.setProperty('--color-site-bg', colors.bg);
      root.style.setProperty('--color-site-card', colors.cardBg);
      root.style.setProperty('--color-site-text', colors.text);
      root.style.setProperty('--color-site-muted', colors.textMuted);
      root.style.setProperty('--color-site-heading', colors.heading);
      root.style.setProperty('--color-site-accent', colors.accent);
      root.style.setProperty('--color-site-accent-hover', colors.accentHover);
      root.style.setProperty('--color-site-border', colors.border);
      root.style.setProperty('--color-site-btn-bg', colors.btnBg || colors.accent);
      root.style.setProperty('--color-site-btn-text', colors.btnText || (isDark ? '#0A0A0A' : '#FFFFFF'));
    }

    // Apply per-section custom CSS variables
    const sectionKeys = [
      'hero',
      'videos',
      'designs',
      'skills',
      'services',
      'pricing',
      'about',
      'testimonials',
      'contact',
      'navbar',
      'footer'
    ] as const;

    sectionKeys.forEach((secKey) => {
      // Allow pricing and services to share settings if either is set
      const secColors = safeTheme.sectionColors?.[secKey] ||
        (secKey === 'pricing' ? safeTheme.sectionColors?.services : undefined) ||
        (secKey === 'services' ? safeTheme.sectionColors?.pricing : undefined);

      root.style.setProperty(`--sec-${secKey}-bg`, secColors?.bg || colors?.bg || (isDark ? '#0A0A0A' : '#F8F9FA'));
      root.style.setProperty(`--sec-${secKey}-card`, secColors?.cardBg || colors?.cardBg || (isDark ? '#141414' : '#FFFFFF'));
      root.style.setProperty(`--sec-${secKey}-heading`, secColors?.heading || colors?.heading || (isDark ? '#FFFFFF' : '#111827'));
      root.style.setProperty(`--sec-${secKey}-text`, secColors?.text || colors?.text || (isDark ? '#F3F4F6' : '#1F2937'));
      root.style.setProperty(`--sec-${secKey}-muted`, secColors?.muted || colors?.textMuted || (isDark ? '#9CA3AF' : '#4B5563'));
      root.style.setProperty(`--sec-${secKey}-accent`, secColors?.accent || colors?.accent || '#F59E0B');
      root.style.setProperty(`--sec-${secKey}-border`, secColors?.border || colors?.border || (isDark ? '#262626' : '#E5E7EB'));
      root.style.setProperty(`--sec-${secKey}-btn-bg`, secColors?.buttonBg || colors?.btnBg || secColors?.accent || colors?.accent || '#F59E0B');
      root.style.setProperty(`--sec-${secKey}-btn-text`, secColors?.buttonText || colors?.btnText || (isDark ? '#0A0A0A' : '#FFFFFF'));
    });
  }, [isDark, themeSettings]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
