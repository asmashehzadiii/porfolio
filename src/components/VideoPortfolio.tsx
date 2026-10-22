import React, { useState, useMemo, useRef } from 'react';
import { VideoItem, SectionColors, SectionAnimationSettings, SectionHeadings } from '../types';
import { Play, Eye, Clock, Film, Smartphone, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseVideoUrl } from '../utils/videoUtils';

interface VideoPortfolioProps {
  videos: VideoItem[];
  categories: string[];
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
  sectionHeadings?: SectionHeadings['videos'];
  onSelectVideo: (video: VideoItem) => void;
}

export const VideoPortfolio: React.FC<VideoPortfolioProps> = ({
  videos,
  categories,
  colors,
  animation,
  sectionHeadings,
  onSelectVideo
}) => {
  const [reelsPaused, setReelsPaused] = useState(false);
  const [row1Paused, setRow1Paused] = useState(false);
  const [row2Paused, setRow2Paused] = useState(false);

  // Helper to prioritize uploaded custom thumbnails over auto-generated thumbnails
  const getEffectiveThumbnail = (video: VideoItem, fallbackUrl: string): string => {
    if (video.thumbnailUrl && video.thumbnailUrl.trim() !== '') {
      return video.thumbnailUrl;
    }
    const parsed = parseVideoUrl(video.videoUrl, video.videoType);
    if (parsed.defaultThumbnail) {
      return parsed.defaultThumbnail;
    }
    return fallbackUrl;
  };

  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const row1ScrollRef = useRef<HTMLDivElement>(null);
  const row2ScrollRef = useRef<HTMLDivElement>(null);

  // Filter only published videos (or items without explicit draft/hidden status)
  const publishedVideos = useMemo(() => {
    return (videos || [])
      .filter(v => v.status === 'published' || v.status === undefined)
      .sort((a, b) => a.order - b.order);
  }, [videos]);

  // Separate Reels (Short-Form 9:16)
  const reelsVideos = useMemo(() => {
    const list = publishedVideos.filter(
      v => v.aspectRatio === '9:16' ||
           v.category.toLowerCase().includes('reel') ||
           v.category.toLowerCase().includes('short')
    );
    return list.length > 0 ? list : publishedVideos;
  }, [publishedVideos]);

  // Long-Form Videos (16:9)
  const longFormVideos = useMemo(() => {
    const list = publishedVideos.filter(
      v => v.aspectRatio !== '9:16' &&
           !v.category.toLowerCase().includes('reel') &&
           !v.category.toLowerCase().includes('short')
    );
    return list.length > 0 ? list : publishedVideos;
  }, [publishedVideos]);

  // Split long form videos into Row 1 and Row 2
  const { longFormRow1, longFormRow2 } = useMemo(() => {
    const r1: VideoItem[] = [];
    const r2: VideoItem[] = [];
    longFormVideos.forEach((v, idx) => {
      if (idx % 2 === 0) r1.push(v);
      else r2.push(v);
    });
    // Ensure both rows have items
    if (r2.length === 0 && r1.length > 0) {
      return { longFormRow1: r1, longFormRow2: r1 };
    }
    return { longFormRow1: r1, longFormRow2: r2 };
  }, [longFormVideos]);

  /**
   * Builds an exact seamless infinite looping array [Set 1, Set 2].
   * Set 1 and Set 2 are mathematically identical, guaranteeing that
   * translating from 0% to -50% (or -50% to 0%) loops infinitely
   * without any blank gap, sudden jump, or visual stutter.
   */
  const buildSeamlessLoop = (items: VideoItem[]) => {
    if (!items || items.length === 0) return [];
    let base = [...items];
    // Ensure the base sequence has enough cards to cover wide monitors (at least 8 items)
    while (base.length < 8) {
      base = [...base, ...items];
    }
    return [...base, ...base];
  };

  const repeatedReels = useMemo(() => buildSeamlessLoop(reelsVideos), [reelsVideos]);
  const repeatedRow1 = useMemo(() => buildSeamlessLoop(longFormRow1), [longFormRow1]);
  const repeatedRow2 = useMemo(() => buildSeamlessLoop(longFormRow2), [longFormRow2]);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = 360;
    ref.current.scrollBy({
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
    <section
      id="video-portfolio"
      className={`py-20 md:py-28 border-b border-neutral-200 dark:border-white/5 relative overflow-hidden transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || 'var(--sec-videos-bg, var(--color-site-bg, #0A0A0A))',
        color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))',
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <Film className="w-3.5 h-3.5" />
              <span>{sectionHeadings?.badge || 'Video Editing Showcase'}</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {sectionHeadings?.title || 'Selected Video Projects'}
            </h2>
            <p
              className="text-base max-w-xl"
              style={{ color: colors?.muted || colors?.text || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
            >
              {sectionHeadings?.subtitle || 'From viral short-form retention edits to immersive documentary storytelling and commercial campaigns.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Hover or touch to pause • Click card to play video
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {/* ========================================================
            1. REELS / SHORT-FORM INFINITE LOOPING SLIDER (Right-to-Left)
           ======================================================== */}
        <div className="space-y-4">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold tracking-tight"
                  style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
                >
                  {sectionHeadings?.reelsTitle || 'Viral Short-Form Reels & TikToks (9:16)'}
                </h3>
                {sectionHeadings?.reelsSubtitle && (
                  <p
                    className="text-xs"
                    style={{ color: colors?.muted || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
                  >
                    {sectionHeadings.reelsSubtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Manual Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollTrack(reelsScrollRef, 'left')}
                className="p-2 rounded-full border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                style={{
                  backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                  borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                  color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                }}
                aria-label="Previous Reels"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTrack(reelsScrollRef, 'right')}
                className="p-2 rounded-full border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                style={{
                  backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                  borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                  color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                }}
                aria-label="Next Reels"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reels Slider Track */}
          <div
            ref={reelsScrollRef}
            onMouseEnter={() => setReelsPaused(true)}
            onMouseLeave={() => setReelsPaused(false)}
            onTouchStart={() => setReelsPaused(true)}
            onTouchEnd={() => {
              setTimeout(() => setReelsPaused(false), 2000);
            }}
            className="w-full overflow-x-auto no-scrollbar scroll-smooth py-3 px-4 md:px-8 cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div
              className="flex gap-6 shrink-0 animate-marquee"
              style={{
                animationPlayState: reelsPaused ? 'paused' : 'running',
                willChange: 'transform'
              }}
            >
              {repeatedReels.map((video, index) => (
                <div
                  key={`reel-${video.id}-${index}`}
                  onClick={() => onSelectVideo(video)}
                  className="w-[260px] md:w-[290px] shrink-0 rounded-2xl overflow-hidden border shadow-xl hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group select-none"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))'
                  }}
                >
                  {/* Vertical 9:16 Video Box */}
                  <div className="relative aspect-[9/15] w-full overflow-hidden bg-black">
                    <img
                      src={getEffectiveThumbnail(video, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.8)] group-hover:scale-115 transition-all">
                        <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-neutral-950 shadow-md">
                        9:16 Reel
                      </span>
                    </div>

                    {video.duration && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 backdrop-blur-md text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {video.duration}
                      </div>
                    )}

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white pointer-events-none">
                      <span className="truncate max-w-[65%] font-medium opacity-90">
                        {video.clientName || video.category}
                      </span>
                      {video.viewsCount && (
                        <span className="flex items-center gap-1 font-bold text-amber-400 shrink-0">
                          <Eye className="w-3.5 h-3.5" /> {video.viewsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Title & Desc */}
                  <div className="p-4 space-y-1.5">
                    <h4
                      className="text-sm font-bold group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2"
                      style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
                    >
                      {video.title}
                    </h4>
                    <p
                      className="text-xs line-clamp-2"
                      style={{ color: colors?.muted || colors?.text || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
                    >
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            2. LONG-FORM CINEMATIC SHOWCASE (Dual Rows in Opposite Directions)
           ======================================================== */}
        <div className="space-y-6">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold tracking-tight"
                  style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
                >
                  {sectionHeadings?.longFormTitle || 'Long-Form & Cinematic Productions (16:9)'}
                </h3>
                {sectionHeadings?.longFormSubtitle ? (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: colors?.muted || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
                  >
                    {sectionHeadings.longFormSubtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* ROW 1: Moves Left to Right (animate-marquee-reverse) */}
          <div className="space-y-2">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-end">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollTrack(row1ScrollRef, 'left')}
                  className="p-1.5 rounded-full border transition-all shadow-sm active:scale-95 hover:bg-white/10"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                    color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                  }}
                  aria-label="Previous Row 1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollTrack(row1ScrollRef, 'right')}
                  className="p-1.5 rounded-full border transition-all shadow-sm active:scale-95 hover:bg-white/10"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                    color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                  }}
                  aria-label="Next Row 1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={row1ScrollRef}
              onMouseEnter={() => setRow1Paused(true)}
              onMouseLeave={() => setRow1Paused(false)}
              onTouchStart={() => setRow1Paused(true)}
              onTouchEnd={() => {
                setTimeout(() => setRow1Paused(false), 2000);
              }}
              className="w-full overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 md:px-8 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div
                className="flex gap-6 shrink-0 animate-marquee-reverse"
                style={{
                  animationPlayState: row1Paused ? 'paused' : 'running',
                  willChange: 'transform'
                }}
              >
                {repeatedRow1.map((video, index) => (
                  <div
                    key={`row1-${video.id}-${index}`}
                    onClick={() => onSelectVideo(video)}
                    className="w-[340px] md:w-[380px] shrink-0 rounded-2xl overflow-hidden border shadow-xl hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group select-none"
                    style={{
                      backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                      borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))'
                    }}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={getEffectiveThumbnail(video, 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80')}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-13 h-13 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                          <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                          {video.category}
                        </span>
                      </div>
                      {video.duration && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950/80 backdrop-blur-md text-neutral-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {video.duration}
                        </div>
                      )}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-neutral-200 pointer-events-none">
                        <span className="truncate max-w-[65%] font-medium">
                          {video.clientName || 'YouTube Edit'}
                        </span>
                        {video.viewsCount && (
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Eye className="w-3 h-3" /> {video.viewsCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4
                        className="text-sm md:text-base font-bold group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1"
                        style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
                      >
                        {video.title}
                      </h4>
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: colors?.muted || colors?.text || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
                      >
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: Moves Right to Left (animate-marquee) */}
          <div className="space-y-2">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-end">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollTrack(row2ScrollRef, 'left')}
                  className="p-1.5 rounded-full border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                    color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                  }}
                  aria-label="Previous Row 2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollTrack(row2ScrollRef, 'right')}
                  className="p-1.5 rounded-full border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                  style={{
                    backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                    borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))',
                    color: colors?.text || 'var(--sec-videos-text, var(--color-site-text, #F3F4F6))'
                  }}
                  aria-label="Next Row 2"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={row2ScrollRef}
              onMouseEnter={() => setRow2Paused(true)}
              onMouseLeave={() => setRow2Paused(false)}
              onTouchStart={() => setRow2Paused(true)}
              onTouchEnd={() => {
                setTimeout(() => setRow2Paused(false), 2000);
              }}
              className="w-full overflow-x-auto no-scrollbar scroll-smooth py-2 px-4 md:px-8 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div
                className="flex gap-6 shrink-0 animate-marquee"
                style={{
                  animationPlayState: row2Paused ? 'paused' : 'running',
                  willChange: 'transform'
                }}
              >
                {repeatedRow2.map((video, index) => (
                  <div
                    key={`row2-${video.id}-${index}`}
                    onClick={() => onSelectVideo(video)}
                    className="w-[340px] md:w-[380px] shrink-0 rounded-2xl overflow-hidden border shadow-xl hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col group select-none"
                    style={{
                      backgroundColor: colors?.cardBg || 'var(--sec-videos-card, var(--color-site-card, #141414))',
                      borderColor: colors?.border || 'var(--sec-videos-border, var(--color-site-border, #262626))'
                    }}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={getEffectiveThumbnail(video, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80')}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-13 h-13 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                          <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                          {video.category}
                        </span>
                      </div>
                      {video.duration && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950/80 backdrop-blur-md text-neutral-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {video.duration}
                        </div>
                      )}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-neutral-200 pointer-events-none">
                        <span className="truncate max-w-[65%] font-medium">
                          {video.clientName || 'Commercial Project'}
                        </span>
                        {video.viewsCount && (
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Eye className="w-3 h-3" /> {video.viewsCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4
                        className="text-sm md:text-base font-bold group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1"
                        style={{ color: colors?.heading || 'var(--sec-videos-heading, var(--color-site-heading, #FFFFFF))' }}
                      >
                        {video.title}
                      </h4>
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: colors?.muted || colors?.text || 'var(--sec-videos-muted, var(--color-site-muted, #9CA3AF))' }}
                      >
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
