import React, { useRef, useState, useEffect } from 'react';

interface FadeUpSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  delayMs?: number;
}

export const FadeUpSection: React.FC<FadeUpSectionProps> = ({
  children,
  id,
  className = '',
  style,
  delayMs = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(() => delayMs === 0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.04,
        rootMargin: '120px 0px -20px 0px'
      }
    );

    observer.observe(el);

    // Guaranteed visibility fallback timer
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`transition-all ${isVisible ? 'section-fade-up-active' : 'section-fade-up-init'} ${className}`}
      style={{
        ...style,
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms'
      }}
    >
      {children}
    </div>
  );
};
