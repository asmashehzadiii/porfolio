import React, { useState } from 'react';
import { NavigationSettings, ThemeSettings, SectionColors } from '../types';
import { useTheme } from './ThemeManager';
import { Sun, Moon, Menu, X, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface NavbarProps {
  navigation: NavigationSettings;
  themeSettings: ThemeSettings;
  colors?: SectionColors;
  onNavigateToAdmin: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  navigation,
  themeSettings,
  colors,
  onNavigateToAdmin,
  isAdminLoggedIn
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sortedMenuItems = [...(navigation.menuItems || [])]
    .filter(item => item.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors shadow-sm"
      style={{
        backgroundColor: colors?.bg || (isDark ? 'rgba(10, 10, 10, 0.88)' : 'rgba(255, 255, 255, 0.92)'),
        borderColor: colors?.border || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'),
        color: colors?.text || (isDark ? '#F3F4F6' : '#1F2937')
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          {navigation.logoImageUrl ? (
            <img
              src={navigation.logoImageUrl}
              alt={navigation.logoText}
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 group-hover:scale-105 transition-transform shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-neutral-950 shadow-md">
              E
            </div>
          )}
          <div className="flex flex-col">
            <span
              className="text-lg md:text-xl font-extrabold tracking-tight group-hover:text-amber-400 transition-colors flex items-center gap-1.5"
              style={{ color: colors?.heading || undefined }}
            >
              {navigation.logoText || 'THE EDITOR'}
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
            </span>
            <span
              className="text-[11px] font-medium tracking-wider uppercase"
              style={{ color: colors?.muted || undefined }}
            >
              {navigation.logoSubtitle || 'Asma Shehzadi'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {sortedMenuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.isExternal ? '_blank' : '_self'}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              className="px-3.5 py-2 text-sm font-medium rounded-lg hover:text-amber-400 hover:bg-white/5 transition-colors"
              style={{ color: colors?.text || undefined }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions: Theme Toggle, Admin Dashboard Link, CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher */}
          {themeSettings.allowThemeToggle && (
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-white/10 bg-neutral-900/60 hover:bg-neutral-800 text-amber-400 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Admin Dashboard Access */}
          <button
            onClick={onNavigateToAdmin}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isAdminLoggedIn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'border-white/10 hover:border-amber-400/50 text-neutral-400 hover:text-neutral-100'
            }`}
            title="Admin CMS Dashboard"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>

          {/* Hire Me CTA Button */}
          {navigation.ctaButton?.isVisible && (
            <a
              href={navigation.ctaButton.href || '#contact'}
              className="px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>{navigation.ctaButton.label || 'Hire Me'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          {themeSettings.allowThemeToggle && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-white/10 bg-neutral-900/60 text-amber-400"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-white/10 bg-neutral-900 text-neutral-200"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-6 border-b border-white/10 bg-neutral-950/95 backdrop-blur-xl animate-in slide-in-from-top-2 space-y-3">
          <nav className="flex flex-col space-y-1">
            {sortedMenuItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-200 hover:text-amber-400 hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAdmin();
              }}
              className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-sm font-semibold flex items-center justify-center gap-2 bg-amber-500/10"
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </button>
            {navigation.ctaButton?.isVisible && (
              <a
                href={navigation.ctaButton.href || '#contact'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-full bg-amber-500 text-neutral-950 text-sm font-bold text-center shadow-lg"
              >
                {navigation.ctaButton.label || 'Hire Me'}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
