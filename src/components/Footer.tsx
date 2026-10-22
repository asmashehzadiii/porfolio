import React from 'react';
import { NavigationSettings, SectionColors } from '../types';
import { ArrowUp, Sparkles, Shield, Heart } from 'lucide-react';

interface FooterProps {
  navigation: NavigationSettings;
  colors?: SectionColors;
  onNavigateToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigation, colors, onNavigateToAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footer = navigation.footer || {
    tagline: 'Turning ideas into visual stories with premium video editing and distinctive graphic design.',
    copyrightText: '© 2026 The Editor — Asma Shehzadi. All rights reserved.',
    showSocials: true,
    columns: []
  };

  return (
    <footer
      className="border-t py-16 px-4 md:px-8 relative transition-colors"
      style={{
        backgroundColor: colors?.bg || 'var(--sec-footer-bg, var(--color-site-bg, #0A0A0A))',
        borderColor: colors?.border || 'var(--sec-footer-border, var(--color-site-border, rgba(255,255,255,0.1)))',
        color: colors?.text || 'var(--sec-footer-text, var(--color-site-muted, #9CA3AF))'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b"
          style={{ borderColor: colors?.border || 'rgba(255,255,255,0.08)' }}
        >
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={navigation.logoImageUrl || '/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png'}
                alt={navigation.logoText}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
              />
              <div>
                <span
                  className="text-lg font-bold block"
                  style={{ color: colors?.heading || '#FFFFFF' }}
                >
                  {navigation.logoText || 'THE EDITOR'}
                </span>
                <span
                  className="text-xs font-semibold tracking-wider uppercase block"
                  style={{ color: colors?.accent || '#F59E0B' }}
                >
                  {navigation.logoSubtitle || 'Asma Shehzadi'}
                </span>
              </div>
            </div>

            <p
              className="text-xs md:text-sm leading-relaxed max-w-sm"
              style={{ color: colors?.muted || colors?.text || '#9CA3AF' }}
            >
              {footer.tagline}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onNavigateToAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: colors?.cardBg || 'rgba(255,255,255,0.05)',
                  borderColor: colors?.border || 'rgba(255,255,255,0.1)',
                  color: colors?.text || '#E5E7EB'
                }}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin CMS Panel</span>
              </button>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {footer.columns && footer.columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: colors?.heading || '#E5E7EB' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs md:text-sm">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.url === '#/admin' ? (
                      <button
                        onClick={onNavigateToAdmin}
                        className="hover:text-amber-400 transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.url}
                        target={link.isExternal ? '_blank' : '_self'}
                        rel={link.isExternal ? 'noopener noreferrer' : undefined}
                        className="hover:text-amber-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>{footer.copyrightText}</div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline" /> for Visual Storytellers
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg border border-white/10 hover:border-amber-400/50 bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
