import { ThemeColors } from '../types';

export interface ThemePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  style: string;
  recommendedMode: 'light' | 'dark';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    heading: string;
    text: string;
    border: string;
  };
  lightColors: ThemeColors;
  darkColors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'maroon',
    name: 'White, Maroon and Black',
    subtitle: 'Classic Elegance & Editorial Polish',
    description: 'Clean white canvas with rich royal maroon accents, deep charcoal headings, and crisp white cards with subtle borders.',
    style: 'Premium, elegant, clean, and professional.',
    recommendedMode: 'light',
    previewColors: {
      bg: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#800020',
      heading: '#111827',
      text: '#2D3748',
      border: '#E5E7EB'
    },
    lightColors: {
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      heading: '#111827',
      text: '#2D3748',
      textMuted: '#6B7280',
      accent: '#800020',
      accentHover: '#5B0017',
      border: '#E5E7EB',
      btnBg: '#800020',
      btnText: '#FFFFFF'
    },
    darkColors: {
      bg: '#14090B',
      cardBg: '#1F1013',
      heading: '#FFFFFF',
      text: '#F5ECEE',
      textMuted: '#B89EA3',
      accent: '#A51D35',
      accentHover: '#800020',
      border: '#381C22',
      btnBg: '#A51D35',
      btnText: '#FFFFFF'
    }
  },
  {
    id: 'green',
    name: 'White, Green and Dark Green',
    subtitle: 'Fresh, Organic & Minimalist',
    description: 'Crisp white canvas, vibrant emerald green primary accents, deep forest dark green headings, and fresh modern card styling.',
    style: 'Fresh, modern, professional, and minimal.',
    recommendedMode: 'light',
    previewColors: {
      bg: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#16A34A',
      heading: '#0F3D24',
      text: '#2D3748',
      border: '#D1E7DD'
    },
    lightColors: {
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      heading: '#0F3D24',
      text: '#2D3748',
      textMuted: '#4B5563',
      accent: '#16A34A',
      accentHover: '#15803D',
      border: '#D1E7DD',
      btnBg: '#15803D',
      btnText: '#FFFFFF'
    },
    darkColors: {
      bg: '#0A150F',
      cardBg: '#12241A',
      heading: '#FFFFFF',
      text: '#E2ECE5',
      textMuted: '#8EA798',
      accent: '#22C55E',
      accentHover: '#16A34A',
      border: '#1F3A2B',
      btnBg: '#16A34A',
      btnText: '#FFFFFF'
    }
  },
  {
    id: 'blue',
    name: 'Blue and Dark Blue',
    subtitle: 'Trustworthy & High-Tech Corporate',
    description: 'Light subtle blue-tinted canvas with vibrant royal blue highlights, deep navy blue headings, and modern corporate precision.',
    style: 'Modern, trustworthy, premium, and professional.',
    recommendedMode: 'light',
    previewColors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#2563EB',
      heading: '#0F2744',
      text: '#334155',
      border: '#DBEAFE'
    },
    lightColors: {
      bg: '#F8FAFC',
      cardBg: '#FFFFFF',
      heading: '#0F2744',
      text: '#334155',
      textMuted: '#64748B',
      accent: '#2563EB',
      accentHover: '#1D4ED8',
      border: '#DBEAFE',
      btnBg: '#2563EB',
      btnText: '#FFFFFF'
    },
    darkColors: {
      bg: '#0B1120',
      cardBg: '#131D33',
      heading: '#FFFFFF',
      text: '#E2E8F0',
      textMuted: '#94A3B8',
      accent: '#3B82F6',
      accentHover: '#2563EB',
      border: '#1E293B',
      btnBg: '#2563EB',
      btnText: '#FFFFFF'
    }
  },
  {
    id: 'monochrome',
    name: 'Black and White',
    subtitle: 'High-Contrast Minimal Monochrome',
    description: 'Pitch-black obsidian canvas, pure white typography, dark charcoal cards with fine perimeter outlines, and striking monochrome buttons.',
    style: 'Elegant, premium, minimal, and high-contrast.',
    recommendedMode: 'dark',
    previewColors: {
      bg: '#0A0A0A',
      card: '#161616',
      accent: '#FFFFFF',
      heading: '#FFFFFF',
      text: '#E5E7EB',
      border: '#2E2E2E'
    },
    darkColors: {
      bg: '#0A0A0A',
      cardBg: '#161616',
      heading: '#FFFFFF',
      text: '#E5E7EB',
      textMuted: '#9CA3AF',
      accent: '#FFFFFF',
      accentHover: '#E5E7EB',
      border: '#2E2E2E',
      btnBg: '#FFFFFF',
      btnText: '#0A0A0A'
    },
    lightColors: {
      bg: '#FFFFFF',
      cardBg: '#F9FAFB',
      heading: '#000000',
      text: '#171717',
      textMuted: '#525252',
      accent: '#000000',
      accentHover: '#262626',
      border: '#E5E7EB',
      btnBg: '#000000',
      btnText: '#FFFFFF'
    }
  },
  {
    id: 'gold',
    name: 'Obsidian and Gold',
    subtitle: 'Signature Luxury & Creative Studio',
    description: 'Original signature aesthetic with deep obsidian surfaces, rich warm amber gold highlights, and cinematic studio depth.',
    style: 'Iconic, cinematic, warm luxury.',
    recommendedMode: 'dark',
    previewColors: {
      bg: '#0A0A0A',
      card: '#141414',
      accent: '#F59E0B',
      heading: '#FFFFFF',
      text: '#F3F4F6',
      border: '#262626'
    },
    darkColors: {
      bg: '#0A0A0A',
      cardBg: '#141414',
      heading: '#FFFFFF',
      text: '#F3F4F6',
      textMuted: '#9CA3AF',
      accent: '#F59E0B',
      accentHover: '#D97706',
      border: '#262626',
      btnBg: '#F59E0B',
      btnText: '#0A0A0A'
    },
    lightColors: {
      bg: '#F9FAFB',
      cardBg: '#FFFFFF',
      heading: '#111827',
      text: '#1F2937',
      textMuted: '#6B7280',
      accent: '#D97706',
      accentHover: '#B45309',
      border: '#E5E7EB',
      btnBg: '#D97706',
      btnText: '#FFFFFF'
    }
  }
];
