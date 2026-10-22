import React from 'react';
import { HeroSection, SectionColors, SectionAnimationSettings } from '../types';
import { Play, Sparkles, ArrowRight, Film, CheckCircle } from 'lucide-react';

interface HeroProps {
  hero: HeroSection;
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
  onExploreVideos: () => void;
  onOpenFeaturedVideo: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  hero,
  colors,
  animation,
  onExploreVideos,
  onOpenFeaturedVideo
}) => {
  // Animation classes
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
      id="hero"
      className={`relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-4 sm:pt-8 pb-14 sm:pb-20 px-4 md:px-8 overflow-hidden transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || 'var(--sec-hero-bg, var(--color-site-bg, #0A0A0A))',
        color: colors?.text || 'var(--sec-hero-text, var(--color-site-text, #F3F4F6))',
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      {/* Background ambient lighting - restrained on mobile to prevent overflow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-amber-600/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typography & CTAs with Staggered Entrance Animations */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
          {/* Badge */}
          {hero.badgeText && (
            <div className="hero-anim-1">
              <div
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border shadow-sm backdrop-blur-md"
                style={{
                  backgroundColor: colors?.cardBg || 'var(--sec-hero-card, var(--color-site-card, #141414))',
                  borderColor: colors?.border || 'var(--sec-hero-border, var(--color-site-border, #262626))'
                }}
              >
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: colors?.accent || 'var(--sec-hero-accent, var(--color-site-accent, #F59E0B))' }} />
                <span
                  className="text-[11px] sm:text-xs font-bold tracking-wide uppercase"
                  style={{ color: colors?.accent || 'var(--sec-hero-accent, var(--color-site-accent, #F59E0B))' }}
                >
                  {hero.badgeText}
                </span>
              </div>
            </div>
          )}

          {/* Subtitle / Name */}
          <div className="space-y-1 hero-anim-2">
            <p
              className="font-extrabold text-base sm:text-lg md:text-xl tracking-wider uppercase flex items-center justify-center lg:justify-start gap-2"
              style={{ color: colors?.accent || 'var(--sec-hero-accent, var(--color-site-accent, #F59E0B))' }}
            >
              <Sparkles className="w-4 h-4 shrink-0" /> {hero.subtitle || 'Asma Shehzadi'}
            </p>
            <h1
              className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.12] sm:leading-[1.08] break-words"
              style={{ color: colors?.heading || 'var(--sec-hero-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {hero.title || 'THE EDITOR'}
            </h1>
          </div>

          {/* Tagline */}
          {hero.tagline && (
            <div className="hero-anim-3">
              <p
                className="text-base sm:text-xl md:text-2xl font-semibold"
                style={{ color: colors?.accent || 'var(--sec-hero-accent, var(--color-site-accent, #F59E0B))' }}
              >
                {hero.tagline}
              </p>
            </div>
          )}

          {/* Bio Description */}
          <div className="hero-anim-4">
            <p
              className="text-xs sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              style={{ color: colors?.muted || colors?.text || 'var(--sec-hero-muted, var(--color-site-muted, #9CA3AF))' }}
            >
              {hero.description}
            </p>
          </div>

          {/* Buttons: Clean mobile stack & desktop inline row */}
          <div className="hero-anim-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
            <a
              href={hero.primaryBtnLink || '#contact'}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-extrabold text-sm sm:text-base transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              style={{
                backgroundColor: colors?.buttonBg || 'var(--sec-hero-btn-bg, var(--color-site-btn-bg, #F59E0B))',
                color: colors?.buttonText || 'var(--sec-hero-btn-text, var(--color-site-btn-text, #0A0A0A))'
              }}
            >
              <span>{hero.primaryBtnText || "Let's Work Together"}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            <button
              onClick={onExploreVideos}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-7 sm:py-4 rounded-full border hover:border-amber-400/60 font-semibold text-sm sm:text-base transition-all backdrop-blur-md flex items-center justify-center gap-2.5 active:scale-95"
              style={{
                backgroundColor: colors?.cardBg || 'var(--sec-hero-card, var(--color-site-card, #141414))',
                borderColor: colors?.border || 'var(--sec-hero-border, var(--color-site-border, #262626))',
                color: colors?.text || 'var(--sec-hero-text, var(--color-site-text, #F3F4F6))'
              }}
            >
              <Film className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{hero.secondaryBtnText || 'Explore Portfolio'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          {hero.stats && hero.stats.length > 0 && (
            <div
              className="hero-anim-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-neutral-200 dark:border-white/10"
              style={{ borderColor: colors?.border || 'var(--sec-hero-border, var(--color-site-border, #262626))' }}
            >
              {hero.stats.map((stat, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <div
                    className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
                    style={{ color: colors?.accent || 'var(--sec-hero-accent, var(--color-site-accent, #F59E0B))' }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[11px] sm:text-xs font-medium mt-0.5"
                    style={{ color: colors?.muted || 'var(--sec-hero-muted, var(--color-site-muted, #9CA3AF))' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Hero Visual Asset */}
        <div className="lg:col-span-5 relative flex items-center justify-center hero-anim-visual mt-4 lg:mt-0">
          <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto group">
            {/* Glowing frame backdrop */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700" />

            {/* Main Portrait Image */}
            <div
              className="relative rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl bg-neutral-950"
              style={{
                backgroundColor: colors?.cardBg || undefined,
                borderColor: colors?.border || undefined
              }}
            >
              <img
                src={hero.profileImage || '/assets/aistudio/ChatGPT_Image_Jul_30__2026__06_53_54_PM_9f4fe06f.png'}
                alt={hero.title}
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/ChatGPT_Image_Jul_30__2026__06_53_54_PM_9f4fe06f.png';
                }}
              />

              {/* Floating Showreel Play Button */}
              <button
                onClick={onOpenFeaturedVideo}
                className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-neutral-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.8)] transition-all hover:scale-110 active:scale-95 group/btn"
                aria-label="Play Featured Showreel"
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-neutral-950 ml-1 group-hover/btn:scale-110 transition-transform" />
              </button>

              {/* Floating Bottom Card */}
              <div
                className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 p-2.5 sm:p-3.5 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-neutral-100"
                style={{
                  backgroundColor: colors?.cardBg ? `${colors.cardBg}E6` : undefined,
                  borderColor: colors?.border || undefined
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold border border-amber-500/30 shrink-0">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-[11px] sm:text-xs font-bold text-white truncate">Senior Video Editor</h4>
                    <p className="text-[10px] sm:text-[11px] text-amber-400 font-medium truncate">Reels • YouTube • Commercial</p>
                  </div>
                </div>
                <span className="shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] text-neutral-300 bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
