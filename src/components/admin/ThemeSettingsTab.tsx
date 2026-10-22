import React, { useState } from 'react';
import { WebsiteData, ThemeSettings, SectionColors, SectionKey, SectionAnimationSettings } from '../../types';
import { THEME_PRESETS, ThemePreset } from '../../data/themePresets';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  Sliders,
  Play,
  Layers,
  CheckCircle2,
  Film,
  Smartphone,
  Eye,
  Zap,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../ThemeManager';
import { updateWebsiteData } from '../../services/api';

interface ThemeSettingsTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token?: string;
  onSave?: () => Promise<void>;
}

export const ThemeSettingsTab: React.FC<ThemeSettingsTabProps> = ({ data, onChange, token, onSave }) => {
  const { isDark, toggleTheme, setTheme } = useTheme();
  const [activeMainTab, setActiveMainTab] = useState<'presets' | 'global' | 'sections' | 'animations' | 'geometry'>('presets');
  const [activeModeTab, setActiveModeTab] = useState<'dark' | 'light'>('dark');
  const [selectedSectionKey, setSelectedSectionKey] = useState<SectionKey>('hero');
  const [previewKey, setPreviewKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const theme = data.theme;
  const sectionColors = theme.sectionColors || {};
  const sectionAnimations = theme.sectionAnimations || {};

  const handleApplyPreset = (preset: ThemePreset) => {
    const updated: WebsiteData = {
      ...data,
      theme: {
        ...data.theme,
        activePreset: preset.id,
        lightColors: { ...preset.lightColors },
        darkColors: { ...preset.darkColors },
        defaultTheme: preset.recommendedMode,
        sectionColors: {} // Clear section overrides so all sections inherit the preset consistently
      }
    };
    onChange(updated);
    setTheme(preset.recommendedMode === 'dark');
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updated));
    } catch {}
    setSaveMessage(`Theme applied: "${preset.name}". Click "Save & Apply Colors" to persist permanently.`);
    setTimeout(() => setSaveMessage(null), 5000);
  };

  const handleResetToPresetDefaults = () => {
    const activeId = theme.activePreset || 'gold';
    const found = THEME_PRESETS.find(p => p.id === activeId) || THEME_PRESETS[0];
    handleApplyPreset(found);
    setSaveMessage(`Restored default palette for "${found.name}".`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const sectionOptions: { key: SectionKey; label: string; icon: string }[] = [
    { key: 'hero', label: 'Hero Section', icon: 'Sparkles' },
    { key: 'videos', label: 'Video Showcase (Reels & Dual Rows)', icon: 'Film' },
    { key: 'designs', label: 'Graphic Design Gallery', icon: 'Palette' },
    { key: 'skills', label: 'Skills & Software Mastery', icon: 'Zap' },
    { key: 'services', label: 'Services & Pricing Packages', icon: 'DollarSign' },
    { key: 'pricing', label: 'Pricing Cards Specific', icon: 'DollarSign' },
    { key: 'about', label: 'About Me Section', icon: 'User' },
    { key: 'testimonials', label: 'Client Reviews / Testimonials', icon: 'MessageSquare' },
    { key: 'contact', label: 'Contact & Inquiry Section', icon: 'Phone' },
    { key: 'navbar', label: 'Navigation Header Bar', icon: 'Sliders' },
    { key: 'footer', label: 'Footer Bar', icon: 'Layers' }
  ];

  const handleSaveTheme = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      if (onSave) {
        await onSave();
      } else if (token) {
        await updateWebsiteData(token, data);
      } else {
        localStorage.setItem('the_editor_website_data', JSON.stringify(data));
      }
      setSaveMessage('Theme colors successfully saved and applied to live website!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage('Save error: ' + (err.message || 'Failed to save'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateTheme = (field: keyof ThemeSettings, value: any) => {
    const updated = {
      ...data,
      theme: { ...data.theme, [field]: value }
    };
    onChange(updated);
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updated));
    } catch {}
  };

  const updateGlobalColor = (mode: 'dark' | 'light', key: string, value: string) => {
    const target = mode === 'dark' ? 'darkColors' : 'lightColors';
    const updated = {
      ...data,
      theme: {
        ...data.theme,
        [target]: {
          ...(data.theme as any)[target],
          [key]: value
        }
      }
    };
    onChange(updated);
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updated));
    } catch {}
  };

  const updateSectionColor = (secKey: SectionKey, colorKey: keyof SectionColors, value: string) => {
    const currentSec = sectionColors[secKey] || {};
    const updatedSecColors = {
      ...sectionColors,
      [secKey]: {
        ...currentSec,
        [colorKey]: value
      }
    };

    // Keep services & pricing synchronized
    if (secKey === 'services') {
      updatedSecColors.pricing = { ...(updatedSecColors.pricing || {}), [colorKey]: value };
    } else if (secKey === 'pricing') {
      updatedSecColors.services = { ...(updatedSecColors.services || {}), [colorKey]: value };
    }

    const updated = {
      ...data,
      theme: {
        ...data.theme,
        sectionColors: updatedSecColors
      }
    };
    onChange(updated);
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updated));
    } catch {}
  };

  const resetSectionColors = (secKey: SectionKey) => {
    const copy = { ...sectionColors };
    delete copy[secKey];
    if (secKey === 'services') delete copy['pricing'];
    if (secKey === 'pricing') delete copy['services'];

    const updated = {
      ...data,
      theme: {
        ...data.theme,
        sectionColors: copy
      }
    };
    onChange(updated);
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updated));
    } catch {}
  };

  const updateSectionAnimation = (secKey: SectionKey, updates: Partial<SectionAnimationSettings>) => {
    const current = sectionAnimations[secKey] || {
      enabled: false,
      type: 'none',
      duration: 0.7,
      delay: 0,
      hoverEffect: true
    };
    const updated = {
      ...sectionAnimations,
      [secKey]: {
        ...current,
        ...updates
      }
    };
    const updatedData = {
      ...data,
      theme: {
        ...data.theme,
        sectionAnimations: updated
      }
    };
    onChange(updatedData);
    setPreviewKey(prev => prev + 1);
    try {
      localStorage.setItem('the_editor_website_data', JSON.stringify(updatedData));
    } catch {}
  };

  const activeColors = activeModeTab === 'dark' ? theme.darkColors : theme.lightColors;
  const currentSectionCustom = sectionColors[selectedSectionKey] || {};
  const currentAnim = sectionAnimations[selectedSectionKey] || {
    enabled: false,
    type: 'none',
    duration: 0.7,
    delay: 0,
    hoverEffect: true
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner with Direct Save Button */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Theme, Section Colors & Animations
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Control global color palettes, individual section backgrounds, text, buttons, cards, and scroll animations. Changes are instantly applied to the live website.
          </p>
        </div>

        {/* Live Theme Toggle Trigger & Direct Save Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleTheme}
            className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs font-bold text-amber-400 flex items-center gap-2 hover:bg-neutral-900 transition-colors"
          >
            {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{isDark ? 'Preview: Dark' : 'Preview: Light'}</span>
          </button>

          <button
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save & Apply Colors'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
          saveMessage.includes('Error') || saveMessage.includes('error')
            ? 'bg-red-950/40 border-red-500/30 text-red-300'
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
        }`}>
          {saveMessage.includes('Error') || saveMessage.includes('error') ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveMainTab('presets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'presets'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ready-Made Color Themes</span>
        </button>

        <button
          onClick={() => setActiveMainTab('global')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'global'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Global Palette (Dark & Light)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('sections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'sections'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Per-Section Colors</span>
        </button>

        <button
          onClick={() => setActiveMainTab('animations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'animations'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Section Animations</span>
        </button>

        <button
          onClick={() => setActiveMainTab('geometry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'geometry'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Buttons & Cards Geometry</span>
        </button>
      </div>

      {/* ========================================================
          0. READY-MADE COLOR THEMES (CUSTOM PRESETS)
         ======================================================== */}
      {activeMainTab === 'presets' && (
        <div className="space-y-6">
          {/* Header & Reset Action */}
          <div className="p-5 md:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready-Made Color Themes</span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-neutral-100">
                Custom Color Themes
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Select a ready-made professional theme with one click to style section backgrounds, headings, body text, cards, buttons, links, navigation, and footer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetToPresetDefaults}
                className="px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-300 hover:text-white hover:bg-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Restore the original colors of the active preset"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Theme Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleSaveTheme}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save & Apply Theme'}</span>
              </button>
            </div>
          </div>

          {/* Theme Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {THEME_PRESETS.map((preset) => {
              const isActive = (theme.activePreset || 'gold') === preset.id;
              const pColors = isDark ? preset.darkColors : preset.lightColors;

              return (
                <div
                  key={preset.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-5 relative shadow-xl ${
                    isActive
                      ? 'border-amber-400 bg-neutral-900/90 ring-1 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                      : 'border-white/10 bg-neutral-900/50 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base md:text-lg font-black text-neutral-100">
                            {preset.name}
                          </h4>
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-400 mt-0.5">
                          {preset.subtitle}
                        </p>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-neutral-950 border border-white/5 text-neutral-400 shrink-0">
                        Primary: {preset.recommendedMode === 'light' ? 'Clean White' : 'Deep Obsidian'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="text-[11px] text-neutral-300 italic">
                      Overall Style: <strong className="text-neutral-200 not-italic">{preset.style}</strong>
                    </div>

                    {/* Color Swatches */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                        Theme Color Previews
                      </span>
                      <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg border border-black/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.bg }}
                          />
                          <span className="text-neutral-400 block truncate">Background</span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg border border-black/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.card }}
                          />
                          <span className="text-neutral-400 block truncate">Card</span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg border border-black/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.accent }}
                          />
                          <span className="text-neutral-400 block truncate">Accent</span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg border border-black/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.heading }}
                          />
                          <span className="text-neutral-400 block truncate">Headings</span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg border border-black/20 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.text }}
                          />
                          <span className="text-neutral-400 block truncate">Text</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Sample Box */}
                    <div
                      className="p-4 rounded-xl border space-y-2.5 transition-colors shadow-inner"
                      style={{
                        backgroundColor: pColors.bg,
                        borderColor: pColors.border,
                        color: pColors.text
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className="font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: pColors.cardBg,
                            color: pColors.accent,
                            borderColor: pColors.border
                          }}
                        >
                          Section Badge
                        </span>
                        <span style={{ color: pColors.textMuted }}>Sample Live Card</span>
                      </div>

                      <h5
                        className="text-sm font-bold"
                        style={{ color: pColors.heading }}
                      >
                        {preset.name}
                      </h5>

                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: pColors.textMuted }}
                      >
                        Section cards and typography render with balanced, high-contrast legibility.
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <div
                          className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                          style={{
                            backgroundColor: pColors.btnBg || pColors.accent,
                            color: pColors.btnText || (isDark ? '#0A0A0A' : '#FFFFFF')
                          }}
                        >
                          Button Preview
                        </div>

                        <span
                          className="text-xs font-semibold"
                          style={{ color: pColors.accent }}
                        >
                          $45 / reel
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md hover:scale-101'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
                          <span>Currently Applied Theme</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4" />
                          <span>Apply This Theme</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/40 text-xs text-neutral-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Tip: After selecting a theme, you can customize individual colors in the <strong>Per-Section Colors</strong> or <strong>Global Palette</strong> tabs. Click <strong>Reset to Theme Defaults</strong> anytime to restore the preset original colors.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          1. GLOBAL THEME PALETTE TAB
         ======================================================== */}
      {activeMainTab === 'global' && (
        <div className="space-y-6">
          {/* Global Theme Preferences */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Default Mode Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Default Visitor Theme
                </label>
                <select
                  value={theme.defaultTheme}
                  onChange={(e) => updateTheme('defaultTheme', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="dark">Dark Mode (Obsidian & Gold)</option>
                  <option value="light">Light Mode (Clean Soft White)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Visitor Theme Toggle Button
                </label>
                <select
                  value={theme.allowThemeToggle ? 'yes' : 'no'}
                  onChange={(e) => updateTheme('allowThemeToggle', e.target.value === 'yes')}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="yes">Enabled (Show in Navbar)</option>
                  <option value="no">Disabled (Enforce Default Theme)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Remember Visitor Choice
                </label>
                <select
                  value={theme.rememberPreference ? 'yes' : 'no'}
                  onChange={(e) => updateTheme('rememberPreference', e.target.value === 'yes')}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="yes">Yes (Save in Browser Cache)</option>
                  <option value="no">No (Always use default)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModeTab('dark')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeModeTab === 'dark'
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode Palette</span>
                </button>
                <button
                  onClick={() => setActiveModeTab('light')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeModeTab === 'light'
                      ? 'bg-amber-500 text-neutral-950 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light Mode Palette</span>
                </button>
              </div>

              <span className="text-[11px] text-neutral-400">
                Editing: <strong className="text-amber-400 uppercase">{activeModeTab}</strong> palette
              </span>
            </div>

            {/* Color Palette Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: 'bg', label: 'Page Background' },
                { key: 'cardBg', label: 'Card Surface Background' },
                { key: 'heading', label: 'Headings Text' },
                { key: 'text', label: 'Body Text' },
                { key: 'textMuted', label: 'Muted / Descriptions' },
                { key: 'accent', label: 'Accent Highlight' },
                { key: 'accentHover', label: 'Accent Hover' },
                { key: 'border', label: 'Dividers & Card Borders' },
                { key: 'btnBg', label: 'Button Background' },
                { key: 'btnText', label: 'Button Text Color' }
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                  <label className="block text-xs font-semibold text-neutral-300">{item.label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(activeColors as any)[item.key] || '#000000'}
                      onChange={(e) => updateGlobalColor(activeModeTab, item.key, e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={(activeColors as any)[item.key] || ''}
                      onChange={(e) => updateGlobalColor(activeModeTab, item.key, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. PER-SECTION COLORS TAB
         ======================================================== */}
      {activeMainTab === 'sections' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-neutral-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Individual Section Color Customizer
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Override global colors for any specific section. Unset fields inherit global theme colors automatically.
                </p>
              </div>

              {sectionColors[selectedSectionKey] && (
                <button
                  type="button"
                  onClick={() => resetSectionColors(selectedSectionKey)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-neutral-400 hover:text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Global Theme</span>
                </button>
              )}
            </div>

            {/* Select Section Dropdown & Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {sectionOptions.map((opt) => {
                const isSelected = selectedSectionKey === opt.key;
                const hasCustom = Boolean(sectionColors[opt.key]);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedSectionKey(opt.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-md scale-102'
                        : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-white/5'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {hasCustom && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Color Controls Grid */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>Color Controls for:</span>
                <span className="text-amber-400">{sectionOptions.find(o => o.key === selectedSectionKey)?.label}</span>
              </h4>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentSectionCustom.bg || 'var(--color-site-bg)' }}></span>
                <span>Live Swatch</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Section Background */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Section Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.bg || '#0A0A0A'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'bg', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.bg || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'bg', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Headings Color */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Section Headings</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.heading || '#FFFFFF'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'heading', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.heading || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'heading', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Body & Description Text */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Paragraphs & Descriptions</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.muted || currentSectionCustom.text || '#9CA3AF'}
                    onChange={(e) => {
                      updateSectionColor(selectedSectionKey, 'muted', e.target.value);
                      updateSectionColor(selectedSectionKey, 'text', e.target.value);
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.muted || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => {
                      updateSectionColor(selectedSectionKey, 'muted', e.target.value);
                      updateSectionColor(selectedSectionKey, 'text', e.target.value);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Card Surface Background */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Card Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.cardBg || '#141414'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'cardBg', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.cardBg || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'cardBg', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Card & Divider Border */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Border Lines</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.border || '#262626'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'border', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.border || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'border', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Button Background */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Button Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.buttonBg || '#F59E0B'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'buttonBg', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.buttonBg || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'buttonBg', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Button Text Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.buttonText || '#0A0A0A'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'buttonText', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.buttonText || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'buttonText', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">Section Accent</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentSectionCustom.accent || '#F59E0B'}
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'accent', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentSectionCustom.accent || ''}
                    placeholder="Inherit theme"
                    onChange={(e) => updateSectionColor(selectedSectionKey, 'accent', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-200 uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Section Mockup Preview */}
            <div
              className="p-6 rounded-2xl border space-y-3 transition-colors"
              style={{
                backgroundColor: currentSectionCustom.bg || 'var(--color-site-bg, #0A0A0A)',
                borderColor: currentSectionCustom.border || 'var(--color-site-border, #262626)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Live Section Swatch Preview
              </span>
              <h4
                className="text-lg font-bold"
                style={{ color: currentSectionCustom.heading || 'var(--color-site-heading, #FFFFFF)' }}
              >
                Sample Heading for {sectionOptions.find(o => o.key === selectedSectionKey)?.label}
              </h4>
              <p
                className="text-xs"
                style={{ color: currentSectionCustom.muted || currentSectionCustom.text || 'var(--color-site-muted, #9CA3AF)' }}
              >
                This paragraph previews how descriptions and body text will render in this section with your chosen colors.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                  style={{
                    backgroundColor: currentSectionCustom.buttonBg || 'var(--color-site-btn-bg, #F59E0B)',
                    color: currentSectionCustom.buttonText || 'var(--color-site-btn-text, #0A0A0A)'
                  }}
                >
                  Primary Action Button
                </div>
                <div
                  className="px-4 py-2 rounded-xl text-xs font-semibold border"
                  style={{
                    backgroundColor: currentSectionCustom.cardBg || 'var(--color-site-card, #141414)',
                    borderColor: currentSectionCustom.border || 'var(--color-site-border, #262626)',
                    color: currentSectionCustom.text || 'var(--color-site-text, #F3F4F6)'
                  }}
                >
                  Card Surface Item
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. SECTION ANIMATIONS TAB
         ======================================================== */}
      {activeMainTab === 'animations' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-neutral-900/60 space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Section Scroll & Entrance Animations
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Apply optional entrance and hover animations on a per-section basis. Sections without animations remain static.
              </p>
            </div>

            {/* Select Section Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {sectionOptions.map((opt) => {
                const isSelected = selectedSectionKey === opt.key;
                const hasAnim = sectionAnimations[opt.key]?.enabled && sectionAnimations[opt.key]?.type !== 'none';
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSelectedSectionKey(opt.key);
                      setPreviewKey(prev => prev + 1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-md scale-102'
                        : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-white/5'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {hasAnim && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animation Config Panel for Selected Section */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>Configuring Animation for:</span>
                <span className="text-amber-400">{sectionOptions.find(o => o.key === selectedSectionKey)?.label}</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewKey(prev => prev + 1)}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-neutral-950 text-amber-400 hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Replay Preview</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Enable / Disable Animation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Animation State
                </label>
                <select
                  value={currentAnim.enabled ? 'enabled' : 'disabled'}
                  onChange={(e) => updateSectionAnimation(selectedSectionKey, { enabled: e.target.value === 'enabled' })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="disabled">Disabled (No Animation)</option>
                  <option value="enabled">Enabled</option>
                </select>
              </div>

              {/* Animation Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Animation Type
                </label>
                <select
                  value={currentAnim.type || 'none'}
                  onChange={(e) => updateSectionAnimation(selectedSectionKey, {
                    type: e.target.value as any,
                    enabled: e.target.value !== 'none'
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="none">No Animation</option>
                  <option value="fade-in">Fade In</option>
                  <option value="fade-up">Fade In from Bottom to Top (Fade Up)</option>
                  <option value="fade-down">Fade In from Top to Bottom (Fade Down)</option>
                  <option value="slide-left">Slide from Left</option>
                  <option value="slide-right">Slide from Right</option>
                  <option value="zoom-in">Zoom In</option>
                  <option value="stagger">Stagger Item Cascade</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Duration</label>
                  <span className="text-xs font-bold text-amber-400">{currentAnim.duration || 0.7}s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={currentAnim.duration || 0.7}
                  onChange={(e) => updateSectionAnimation(selectedSectionKey, { duration: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Delay */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Delay</label>
                  <span className="text-xs font-bold text-amber-400">{currentAnim.delay || 0}s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.1"
                  value={currentAnim.delay || 0}
                  onChange={(e) => updateSectionAnimation(selectedSectionKey, { delay: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Optional Card Hover Effect */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                <input
                  type="checkbox"
                  checked={currentAnim.hoverEffect !== false}
                  onChange={(e) => updateSectionAnimation(selectedSectionKey, { hoverEffect: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-semibold">Interactive Card Hover Animation (Subtle 3D lift & soft glow)</span>
              </label>
            </div>

            {/* Interactive Animation Preview Box */}
            <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="uppercase font-bold tracking-wider">Live Animation Preview Box</span>
                <span>Type: <strong className="text-amber-400">{currentAnim.enabled ? currentAnim.type : 'none'}</strong></span>
              </div>

              <div
                key={previewKey}
                className={`p-6 rounded-2xl border border-amber-500/30 bg-neutral-900 shadow-xl ${
                  currentAnim.enabled && currentAnim.type === 'fade-in' ? 'anim-fade-in' :
                  currentAnim.enabled && currentAnim.type === 'fade-up' ? 'anim-fade-up' :
                  currentAnim.enabled && currentAnim.type === 'fade-down' ? 'anim-fade-down' :
                  currentAnim.enabled && currentAnim.type === 'slide-left' ? 'anim-slide-left' :
                  currentAnim.enabled && currentAnim.type === 'slide-right' ? 'anim-slide-right' :
                  currentAnim.enabled && currentAnim.type === 'zoom-in' ? 'anim-zoom-in' :
                  currentAnim.enabled && currentAnim.type === 'stagger' ? 'anim-fade-up' : ''
                } ${currentAnim.hoverEffect ? 'hover-lift cursor-pointer' : ''}`}
                style={{
                  animationDuration: `${currentAnim.duration || 0.7}s`,
                  animationDelay: `${currentAnim.delay || 0}s`
                }}
              >
                <h5 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Preview Card for {sectionOptions.find(o => o.key === selectedSectionKey)?.label}</span>
                </h5>
                <p className="text-xs text-neutral-400 mt-1">
                  {currentAnim.enabled
                    ? `Animation '${currentAnim.type}' running at ${currentAnim.duration || 0.7}s with ${currentAnim.delay || 0}s delay.`
                    : 'Animation is currently disabled for this section. It will render statically.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. BUTTONS & CARDS GEOMETRY TAB
         ======================================================== */}
      {activeMainTab === 'geometry' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
          <h3 className="text-base font-bold text-neutral-100">Button & Card Visual Geometry</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Button Corner Radius</label>
              <select
                value={theme.buttonStyle?.rounded || 'full'}
                onChange={(e) => updateTheme('buttonStyle', { ...theme.buttonStyle, rounded: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              >
                <option value="full">Pill (Fully Rounded)</option>
                <option value="lg">Soft Rounded (12px)</option>
                <option value="md">Medium (8px)</option>
                <option value="none">Sharp Edges (0px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Card Corner Radius</label>
              <select
                value={theme.cardStyle?.rounded || 'xl'}
                onChange={(e) => updateTheme('cardStyle', { ...theme.cardStyle, rounded: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              >
                <option value="2xl">Extra Rounded (24px)</option>
                <option value="xl">Modern Rounded (16px)</option>
                <option value="md">Subtle (8px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Card Border Style</label>
              <select
                value={theme.cardStyle?.borderStyle || 'subtle'}
                onChange={(e) => updateTheme('cardStyle', { ...theme.cardStyle, borderStyle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              >
                <option value="subtle">Subtle Glass Border</option>
                <option value="glow">Gold Ambient Glow</option>
                <option value="none">Borderless</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
