import React from 'react';
import { AboutSection as AboutType, SectionColors, SectionAnimationSettings } from '../types';
import { User, CheckCircle2, Sparkles, Award, HeartHandshake, Eye } from 'lucide-react';

interface AboutProps {
  about: AboutType;
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
}

export const AboutSection: React.FC<AboutProps> = ({ about, colors, animation }) => {
  const animClass = animation?.enabled && animation.type !== 'none'
    ? animation.type === 'fade-in' ? 'anim-fade-in' :
      animation.type === 'fade-up' ? 'anim-fade-up' :
      animation.type === 'fade-down' ? 'anim-fade-down' :
      animation.type === 'slide-left' ? 'anim-slide-left' :
      animation.type === 'slide-right' ? 'anim-slide-right' :
      animation.type === 'zoom-in' ? 'anim-zoom-in' : ''
    : '';

  return (
    <section
      id="about-section"
      className={`py-20 md:py-28 px-4 md:px-8 border-b border-white/5 relative overflow-hidden transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || 'var(--sec-about-bg, var(--color-site-bg, #0A0A0A))',
        color: colors?.text || 'var(--sec-about-text, var(--color-site-text, #F3F4F6))',
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Portrait Avatar */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur-2xl opacity-25 group-hover:opacity-50 transition duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-amber-400/40 shadow-2xl bg-neutral-950">
                <img
                  src={about.profileImage || '/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png'}
                  alt={about.title}
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png';
                  }}
                />

                {/* Floating Experience Ribbon */}
                <div
                  className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md border flex items-center justify-between"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-about-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-about-border, var(--color-site-border, #262626))'
                  }}
                >
                  <div>
                    <span className="text-xs block font-medium" style={{ color: colors?.muted || 'var(--sec-about-muted, var(--color-site-muted, #9CA3AF))' }}>
                      Industry Experience
                    </span>
                    <span className="text-xl font-extrabold" style={{ color: colors?.accent || 'var(--sec-about-accent, var(--color-site-accent, #F59E0B))' }}>
                      {about.experienceYears || '5+ Years'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs block font-medium" style={{ color: colors?.muted || 'var(--sec-about-muted, var(--color-site-muted, #9CA3AF))' }}>
                      Completed Projects
                    </span>
                    <span className="text-xl font-extrabold" style={{ color: colors?.heading || 'var(--sec-about-heading, var(--color-site-heading, #FFFFFF))' }}>
                      {about.completedProjects || '450+'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User className="w-3.5 h-3.5" />
              <span>{about.badge || 'Meet The Creator'}</span>
            </div>

            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: colors?.heading || 'var(--sec-about-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {about.title}
            </h2>

            <p
              className="text-base md:text-lg font-medium leading-relaxed"
              style={{ color: colors?.accent || 'var(--sec-about-accent, #F59E0B)' }}
            >
              {about.subtitle}
            </p>

            <div
              className="space-y-4 text-sm md:text-base leading-relaxed"
              style={{ color: colors?.text || 'var(--sec-about-text, var(--color-site-text, #F3F4F6))' }}
            >
              {about.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Highlights List */}
            {about.highlights && about.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {about.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs md:text-sm"
                    style={{ color: colors?.text || 'var(--sec-about-text, #F3F4F6)' }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: colors?.accent || '#F59E0B' }}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Signature */}
            {about.signatureText && (
              <div
                className="pt-6 border-t flex items-center justify-between"
                style={{ borderColor: colors?.border || 'var(--sec-about-border, rgba(255,255,255,0.1))' }}
              >
                <div>
                  <div
                    className="font-serif italic text-2xl font-bold tracking-wide"
                    style={{ color: colors?.accent || '#F59E0B' }}
                  >
                    {about.signatureText}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: colors?.muted || 'var(--sec-about-muted, #9CA3AF)' }}
                  >
                    Lead Video Editor & Graphic Designer
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
