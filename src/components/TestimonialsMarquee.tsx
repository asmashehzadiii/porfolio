import React, { useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TestimonialItem, SectionColors, SectionAnimationSettings } from '../types';

interface TestimonialsMarqueeProps {
  testimonials: TestimonialItem[];
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
}

export const TestimonialsMarquee: React.FC<TestimonialsMarqueeProps> = ({ testimonials, colors, animation }) => {
  const published = testimonials.filter(t => t.isPublished !== false).sort((a, b) => a.order - b.order);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  if (published.length === 0) return null;

  // Duplicate items for continuous marquee loop
  const marqueeItems = [...published, ...published, ...published];

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 380;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const animClass = animation?.enabled && animation.type !== 'none'
    ? animation.type === 'fade-in' ? 'anim-fade-in' :
      animation.type === 'fade-up' ? 'anim-fade-up' :
      animation.type === 'fade-down' ? 'anim-fade-down' :
      animation.type === 'slide-left' ? 'anim-slide-left' :
      animation.type === 'slide-right' ? 'anim-slide-right' :
      animation.type === 'zoom-in' ? 'anim-zoom-in' : ''
    : '';

  return (
    <div
      className={`relative w-full overflow-hidden py-4 transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || undefined,
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 mb-4 px-4 md:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => scroll('left')}
          className="p-2.5 rounded-full border border-white/10 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all shadow-md active:scale-95"
          aria-label="Previous Testimonials"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-2.5 rounded-full border border-white/10 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all shadow-md active:scale-95"
          aria-label="Next Testimonials"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Marquee Track */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-8 py-2 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div
          className="flex gap-6 shrink-0 animate-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            willChange: 'transform'
          }}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[340px] md:w-[400px] shrink-0 p-6 rounded-2xl border shadow-xl backdrop-blur-md hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group"
              style={{
                backgroundColor: colors?.cardBg || 'var(--sec-testimonials-card, var(--color-site-card, #141414))',
                borderColor: colors?.border || 'var(--sec-testimonials-border, var(--color-site-border, #262626))'
              }}
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        style={{
                          color: i < item.rating ? (colors?.accent || '#F59E0B') : 'rgba(255,255,255,0.2)',
                          fill: i < item.rating ? (colors?.accent || '#F59E0B') : 'transparent'
                        }}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 opacity-30 group-hover:opacity-60 transition-colors" style={{ color: colors?.accent || '#F59E0B' }} />
                </div>

                {/* Review Text */}
                <p
                  className="text-sm md:text-base leading-relaxed italic mb-6 line-clamp-4 transition-colors"
                  style={{ color: colors?.text || 'var(--sec-testimonials-text, #E5E7EB)' }}
                >
                  "{item.reviewText}"
                </p>
              </div>

              {/* Client Info */}
              <div
                className="pt-4 border-t flex items-center gap-3"
                style={{ borderColor: colors?.border || 'rgba(255,255,255,0.08)' }}
              >
                <img
                  src={item.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  alt={item.clientName}
                  className="w-11 h-11 rounded-full object-cover border-2"
                  style={{ borderColor: colors?.accent || 'rgba(245,158,11,0.4)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
                  }}
                />
                <div className="truncate">
                  <h4
                    className="text-sm font-bold truncate transition-colors"
                    style={{ color: colors?.heading || 'var(--sec-testimonials-heading, #FFFFFF)' }}
                  >
                    {item.clientName}
                  </h4>
                  <p
                    className="text-xs truncate"
                    style={{ color: colors?.muted || 'var(--sec-testimonials-muted, #9CA3AF)' }}
                  >
                    {item.clientRole} {item.clientCompany ? `• ${item.clientCompany}` : ''}
                  </p>
                  {item.projectType && (
                    <span
                      className="inline-block mt-0.5 text-[11px] font-medium"
                      style={{ color: colors?.accent || '#F59E0B' }}
                    >
                      {item.projectType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
