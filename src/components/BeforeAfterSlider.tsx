import React, { useState, useRef, useCallback } from 'react';
import { Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Raw Footage',
  afterLabel = 'Color Graded Cut',
  title,
  subtitle
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && <h3 className="text-2xl font-bold tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm opacity-70 mt-1 max-w-xl mx-auto">{subtitle}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-video md:aspect-[16/9] max-h-[550px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-2xl bg-neutral-900 group"
      >
        {/* After (Graded/Edited) - Base layer */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Before (Raw) - Clipped layer */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover object-center max-w-none pointer-events-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: '100%'
            }}
          />
        </div>

        {/* Divider line and handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
            <Sliders className="w-4 h-4 rotate-90" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-semibold text-neutral-200 border border-white/10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
          {beforeLabel}
        </div>
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-xs font-semibold text-neutral-950 border border-amber-300 shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-950"></span>
          {afterLabel}
        </div>
      </div>

      <p className="text-center text-xs opacity-60 mt-3 flex items-center justify-center gap-2">
        <span>◀ Drag or swipe slider to compare ▶</span>
      </p>
    </div>
  );
};
