import React, { useState, useMemo } from 'react';
import { DesignItem, SectionColors, SectionAnimationSettings, SectionHeadings } from '../types';
import { Palette, X, Maximize2, Tag, Calendar, User, ExternalLink } from 'lucide-react';

interface DesignPortfolioProps {
  designs: DesignItem[];
  categories: string[];
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
  sectionHeadings?: SectionHeadings['designs'];
}

export const DesignPortfolio: React.FC<DesignPortfolioProps> = ({
  designs,
  categories,
  colors,
  animation,
  sectionHeadings
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<DesignItem | null>(null);

  // Filter published designs
  const publishedDesigns = useMemo(() => {
    return designs
      .filter(d => d.status === 'published' || d.status === undefined)
      .sort((a, b) => a.order - b.order);
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    if (selectedCategory === 'All') return publishedDesigns;
    return publishedDesigns.filter(d => d.category === selectedCategory);
  }, [publishedDesigns, selectedCategory]);

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
      id="graphic-design"
      className={`py-20 md:py-28 border-b border-neutral-200 dark:border-white/5 relative transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || 'var(--sec-designs-bg, var(--color-site-bg, #0A0A0A))',
        color: colors?.text || 'var(--sec-designs-text, var(--color-site-text, #F3F4F6))',
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 mb-3">
            <Palette className="w-3.5 h-3.5" />
            <span>{sectionHeadings?.badge || 'Visual Branding & Graphic Design'}</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: colors?.heading || 'var(--sec-designs-heading, var(--color-site-heading, #FFFFFF))' }}
          >
            {sectionHeadings?.title || 'Graphic Design Showcase'}
          </h2>
          <p
            className="text-base mt-3 leading-relaxed"
            style={{ color: colors?.muted || colors?.text || 'var(--sec-designs-muted, var(--color-site-muted, #9CA3AF))' }}
          >
            {sectionHeadings?.subtitle || 'High CTR YouTube thumbnails, logo brand systems, social media banners, and promotional print assets.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const count = cat === 'All'
              ? publishedDesigns.length
              : publishedDesigns.filter(d => d.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedCategory === cat
                    ? 'shadow-md scale-102 font-bold'
                    : 'hover:opacity-85'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat
                    ? (colors?.buttonBg || 'var(--sec-designs-btn-bg, var(--color-site-btn-bg, #F59E0B))')
                    : (colors?.cardBg || 'var(--sec-designs-card, var(--color-site-card, #141414))'),
                  borderColor: colors?.border || 'var(--sec-designs-border, var(--color-site-border, #262626))',
                  color: selectedCategory === cat
                    ? (colors?.buttonText || 'var(--sec-designs-btn-text, var(--color-site-btn-text, #0A0A0A))')
                    : (colors?.text || 'var(--sec-designs-text, var(--color-site-text, #F3F4F6))')
                }}
              >
                <span>{cat}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px]"
                  style={{
                    backgroundColor: selectedCategory === cat ? 'rgba(0,0,0,0.15)' : 'rgba(128,128,128,0.15)',
                    color: selectedCategory === cat
                      ? (colors?.buttonText || 'var(--sec-designs-btn-text, #0A0A0A)')
                      : (colors?.muted || 'var(--sec-designs-muted, #9CA3AF)')
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Designs Grid: Mobile exactly 2 posts per row, Desktop preserved lg:grid-cols-3 gap-8 */}
        {filteredDesigns.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-neutral-900/40">
            <Palette className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-base text-neutral-400">No designs found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            {filteredDesigns.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/70 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl cursor-pointer flex flex-col ${
                  animation?.hoverEffect !== false ? 'hover-lift' : ''
                }`}
                style={{
                  backgroundColor: colors?.cardBg || 'var(--sec-designs-card, var(--color-site-card, #141414))',
                  borderColor: colors?.border || 'var(--sec-designs-border, var(--color-site-border, #262626))'
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/Gemini_Generated_Image_skq52gskq52gskq5_c6cd0d86.jfif';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Hover Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-bold bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                      {item.category}
                    </span>
                  </div>

                  {/* Client Tag */}
                  {item.clientName && (
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-[10px] sm:text-xs text-neutral-200 truncate font-medium">
                      {item.clientName}
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-xs sm:text-base md:text-lg font-bold group-hover:text-amber-400 transition-colors line-clamp-1"
                      style={{ color: colors?.heading || undefined }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed"
                      style={{ color: colors?.muted || undefined }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1.5 pt-3 border-t border-white/5 mt-3">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-950 text-neutral-400 border border-neutral-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setActiveModalItem(null)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-900/80">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  {activeModalItem.category}
                </span>
                <h3 className="text-base font-bold text-neutral-100 truncate">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-center bg-black/50">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/Gemini_Generated_Image_skq52gskq52gskq5_c6cd0d86.jfif';
                }}
              />
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-400 max-w-xl">{activeModalItem.description}</p>
                {activeModalItem.clientName && (
                  <p className="text-xs text-amber-400 font-semibold mt-1">Client: {activeModalItem.clientName}</p>
                )}
              </div>

              <a
                href={activeModalItem.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <span>View Full Resolution</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
