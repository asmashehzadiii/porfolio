import React, { useState, useEffect, useRef } from 'react';
import { SkillItem, ServiceItem, CurrencyCode, PricingSettings, SectionColors, SectionAnimationSettings, SectionHeadings } from '../types';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Film,
  Image,
  Palette,
  Volume2,
  Cpu,
  Layers,
  Smartphone,
  Youtube,
  Zap,
  DollarSign
} from 'lucide-react';

interface SkillsSectionProps {
  skills: SkillItem[];
  services: ServiceItem[];
  pricingSettings?: PricingSettings;
  skillsHeadings?: SectionHeadings['skills'];
  servicesHeadings?: SectionHeadings['services'];
  skillsColors?: SectionColors;
  servicesColors?: SectionColors;
  skillsAnimation?: SectionAnimationSettings;
  servicesAnimation?: SectionAnimationSettings;
  onSelectService?: (service: ServiceItem) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  services,
  pricingSettings,
  skillsHeadings,
  servicesHeadings,
  skillsColors,
  servicesColors,
  skillsAnimation,
  servicesAnimation,
  onSelectService
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Video Editing' | 'Graphic Design' | 'Motion Graphics' | 'Tools & Software'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(pricingSettings?.defaultCurrency || 'USD');

  // Mobile scroll animation trigger for Skills section
  const skillsRef = useRef<HTMLDivElement>(null);
  const [isMobileSkillsVisible, setIsMobileSkillsVisible] = useState(false);

  // Universal Viewport Scroll-Reveal Fade-Up trigger for Pricing Section (Desktop, Laptop, Tablet & Mobile)
  const pricingRef = useRef<HTMLDivElement>(null);
  const [isPricingVisible, setIsPricingVisible] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPricingVisible(true);
      return;
    }

    const el = pricingRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsPricingVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsPricingVisible(true);
          observer.disconnect(); // Trigger smoothly on entry
        }
      },
      {
        threshold: 0.05,
        rootMargin: '100px 0px 50px 0px'
      }
    );

    observer.observe(el);

    // Guaranteed visibility fallback timer
    const timer = setTimeout(() => {
      setIsPricingVisible(true);
    }, 400);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsMobileSkillsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep selected currency synced if admin changes defaultCurrency in CMS
  useEffect(() => {
    if (pricingSettings?.defaultCurrency) {
      setSelectedCurrency(pricingSettings.defaultCurrency);
    }
  }, [pricingSettings?.defaultCurrency]);

  const filteredSkills = skills
    .filter(s => activeTab === 'all' || s.category === activeTab)
    .sort((a, b) => a.order - b.order);

  // Filter only published services (fallback to all services if none explicitly published)
  const publishedServices = services && services.length > 0
    ? (services.filter(s => s.isPublished !== false).length > 0
        ? services.filter(s => s.isPublished !== false).sort((a, b) => a.order - b.order)
        : services.sort((a, b) => a.order - b.order))
    : [];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Film': return <Film className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Image': return <Image className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Palette': return <Palette className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Volume2': return <Volume2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
      case 'Youtube': return <Youtube className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
      case 'Layers': return <Layers className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
      default: return <Wrench className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    }
  };

  // Helper to extract or convert price based on selected currency
  const getPriceForCurrency = (service: ServiceItem, curr: CurrencyCode): string => {
    if (service.prices && service.prices[curr] && service.prices[curr]?.trim() !== '') {
      return service.prices[curr]!;
    }

    const base = service.startingPrice || '$45 / reel';
    const numMatch = base.match(/\$?([0-9,.]+)/);
    const usdVal = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 45;
    const unitMatch = base.replace(/^[^\s]*[0-9,.]+\s*/, '').trim();
    const unit = unitMatch ? ` ${unitMatch}` : '';

    switch (curr) {
      case 'PKR': {
        const pkr = Math.round(usdVal * 278);
        return `Rs. ${pkr.toLocaleString()}${unit}`;
      }
      case 'GBP': {
        const gbp = Math.round(usdVal * 0.79);
        return `£${gbp.toLocaleString()}${unit}`;
      }
      case 'AED': {
        const aed = Math.round(usdVal * 3.67);
        return `${aed.toLocaleString()} AED${unit}`;
      }
      case 'USD':
      default:
        return base;
    }
  };

  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'USD', label: 'USD', symbol: '$' },
    { code: 'PKR', label: 'PKR', symbol: 'Rs.' },
    { code: 'GBP', label: 'GBP', symbol: '£' },
    { code: 'AED', label: 'AED', symbol: 'د.إ' }
  ];

  const skillsAnimClass = skillsAnimation?.enabled && skillsAnimation.type !== 'none'
    ? skillsAnimation.type === 'fade-in' ? 'anim-fade-in' :
      skillsAnimation.type === 'fade-up' ? 'anim-fade-up' :
      skillsAnimation.type === 'fade-down' ? 'anim-fade-down' :
      skillsAnimation.type === 'slide-left' ? 'anim-slide-left' :
      skillsAnimation.type === 'slide-right' ? 'anim-slide-right' :
      skillsAnimation.type === 'zoom-in' ? 'anim-zoom-in' : ''
    : '';

  const servicesAnimClass = servicesAnimation?.enabled && servicesAnimation.type !== 'none'
    ? servicesAnimation.type === 'fade-in' ? 'anim-fade-in' :
      servicesAnimation.type === 'fade-up' ? 'anim-fade-up' :
      servicesAnimation.type === 'fade-down' ? 'anim-fade-down' :
      servicesAnimation.type === 'slide-left' ? 'anim-slide-left' :
      servicesAnimation.type === 'slide-right' ? 'anim-slide-right' :
      servicesAnimation.type === 'zoom-in' ? 'anim-zoom-in' : ''
    : '';

  return (
    <div className="space-y-0 transition-colors">
      {/* 1. Skills & Software Mastery */}
      <section
        id="skills-section"
        ref={skillsRef}
        className={`py-20 md:py-28 px-4 md:px-8 border-b border-neutral-200 dark:border-white/5 transition-all ${skillsAnimClass} mobile-skills-ready ${isMobileSkillsVisible ? 'mobile-skills-enter' : ''}`}
        style={{
          backgroundColor: skillsColors?.bg || 'var(--sec-skills-bg, var(--color-site-bg, #0A0A0A))',
          color: skillsColors?.text || 'var(--sec-skills-text, var(--color-site-text, #F3F4F6))',
          animationDuration: skillsAnimation?.enabled ? `${skillsAnimation.duration || 0.7}s` : undefined,
          animationDelay: skillsAnimation?.enabled ? `${skillsAnimation.delay || 0}s` : undefined
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>{skillsHeadings?.badge || 'Tools & Technical Capabilities'}</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: skillsColors?.heading || 'var(--sec-skills-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {skillsHeadings?.title || 'Skills & Software Mastery'}
            </h2>
            <p
              className="text-base mt-3"
              style={{ color: skillsColors?.muted || skillsColors?.text || 'var(--sec-skills-muted, var(--color-site-muted, #9CA3AF))' }}
            >
              {skillsHeadings?.subtitle || 'Industry-standard post-production suites paired with generative AI workflows for maximum speed and quality.'}
            </p>

            {/* Filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {(['all', 'Video Editing', 'Motion Graphics', 'Graphic Design', 'Tools & Software'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activeTab === tab
                      ? 'shadow-md font-bold scale-102'
                      : 'hover:opacity-85'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab
                      ? (skillsColors?.buttonBg || 'var(--sec-skills-btn-bg, var(--color-site-btn-bg, #F59E0B))')
                      : (skillsColors?.cardBg || 'var(--sec-skills-card, var(--color-site-card, #141414))'),
                    borderColor: skillsColors?.border || 'var(--sec-skills-border, var(--color-site-border, #262626))',
                    color: activeTab === tab
                      ? (skillsColors?.buttonText || 'var(--sec-skills-btn-text, var(--color-site-btn-text, #0A0A0A))')
                      : (skillsColors?.text || 'var(--sec-skills-text, var(--color-site-text, #F3F4F6))')
                  }}
                >
                  {tab === 'all' ? 'All Skills' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSkills.map(skill => (
              <div
                key={skill.id}
                className={`p-5 rounded-2xl border backdrop-blur-md hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all hover:-translate-y-1 group shadow-sm dark:shadow-none ${
                  skillsAnimation?.hoverEffect !== false ? 'hover-lift' : ''
                }`}
                style={{
                  backgroundColor: skillsColors?.cardBg || 'var(--sec-skills-card, var(--color-site-card, #141414))',
                  borderColor: skillsColors?.border || 'var(--sec-skills-border, var(--color-site-border, #262626))'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(skill.iconName)}
                  </div>
                  <span
                    className="text-xs font-extrabold px-2 py-0.5 rounded-md border"
                    style={{
                      color: skillsColors?.accent || 'var(--sec-skills-accent, var(--color-site-accent, #F59E0B))',
                      backgroundColor: skillsColors?.cardBg ? `${skillsColors.cardBg}88` : undefined,
                      borderColor: skillsColors?.border || undefined
                    }}
                  >
                    {skill.proficiency}%
                  </span>
                </div>

                <h3
                  className="text-base font-bold group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors"
                  style={{ color: skillsColors?.heading || 'var(--sec-skills-heading, var(--color-site-heading, #FFFFFF))' }}
                >
                  {skill.name}
                </h3>
                <p
                  className="text-xs mt-1 line-clamp-2 leading-relaxed"
                  style={{ color: skillsColors?.muted || skillsColors?.text || 'var(--sec-skills-muted, var(--color-site-muted, #9CA3AF))' }}
                >
                  {skill.description}
                </p>

                {/* Progress bar */}
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden mt-4"
                  style={{ backgroundColor: skillsColors?.border || 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${skill.proficiency}%`,
                      backgroundColor: skillsColors?.accent || 'var(--sec-skills-accent, var(--color-site-accent, #F59E0B))'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 2. Services & Pricing Packages Section */}
      <section
        id="services-section"
        ref={pricingRef}
        className={`py-20 md:py-28 px-4 md:px-8 border-b border-neutral-200 dark:border-white/5 transition-all ${servicesAnimClass}`}
        style={{
          backgroundColor: servicesColors?.bg || 'var(--sec-services-bg, var(--color-site-bg, #0A0A0A))',
          color: servicesColors?.text || 'var(--sec-services-text, var(--color-site-text, #F3F4F6))',
          animationDuration: servicesAnimation?.enabled ? `${servicesAnimation.duration || 0.7}s` : undefined,
          animationDelay: servicesAnimation?.enabled ? `${servicesAnimation.delay || 0}s` : undefined
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-10 transition-all ${isPricingVisible ? 'pricing-reveal-active' : 'pricing-reveal-init'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{servicesHeadings?.badge || 'High Impact Deliverables'}</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: servicesColors?.heading || 'var(--sec-services-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {servicesHeadings?.title || 'Services & Pricing Packages'}
            </h2>
            <p
              className="text-base mt-3"
              style={{ color: servicesColors?.muted || servicesColors?.text || 'var(--sec-services-muted, var(--color-site-muted, #9CA3AF))' }}
            >
              {servicesHeadings?.subtitle || 'Tailored creative packages designed to elevate your personal brand, channel, or commercial campaigns.'}
            </p>

            {/* Professional Currency Selector */}
            {pricingSettings?.enableCurrencySelector !== false && (
              <div
                className="mt-8 inline-flex items-center p-1.5 rounded-2xl border shadow-md"
                style={{
                  backgroundColor: servicesColors?.cardBg || 'var(--sec-services-card, var(--color-site-card, #141414))',
                  borderColor: servicesColors?.border || 'var(--sec-services-border, var(--color-site-border, #262626))'
                }}
              >
                <span className="text-xs font-bold px-3 hidden sm:inline-flex items-center gap-1.5" style={{ color: servicesColors?.muted || undefined }}>
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Currency:
                </span>
                <div className="flex items-center gap-1">
                  {currencyOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setSelectedCurrency(opt.code)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedCurrency === opt.code
                          ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold scale-102'
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        backgroundColor: selectedCurrency === opt.code
                          ? (servicesColors?.buttonBg || 'var(--sec-services-btn-bg, #F59E0B)')
                          : undefined,
                        color: selectedCurrency === opt.code
                          ? (servicesColors?.buttonText || 'var(--sec-services-btn-text, #0A0A0A)')
                          : (servicesColors?.text || undefined)
                      }}
                      aria-label={`Select ${opt.label} currency`}
                    >
                      <span className="opacity-80 text-[11px]">{opt.symbol}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Cards Responsive Layout: 3 cards per row on laptop & desktop, smooth horizontal swipe carousel on narrow mobile screens */}
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 px-2 -mx-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:gap-6 sm:pb-0 sm:px-0 sm:mx-0">
            {publishedServices.map((service, idx) => {
              const displayPrice = getPriceForCurrency(service, selectedCurrency);
              const ctaText = service.ctaText || pricingSettings?.ctaButtonText || 'Book This Service';
              const ctaLink = service.ctaLink || pricingSettings?.ctaButtonLink || '#contact';

              return (
                <div
                  key={service.id}
                  className={`w-[85vw] max-w-[340px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink p-6 rounded-2xl border flex flex-col justify-between shadow-xl relative backdrop-blur-md transition-all ${
                    isPricingVisible ? 'pricing-reveal-active' : 'pricing-reveal-init'
                  } ${
                    service.featured
                      ? 'ring-1 ring-amber-500/40'
                      : 'hover:border-amber-400/50'
                  } ${servicesAnimation?.hoverEffect !== false ? 'hover-lift' : ''}`}
                  style={{
                    transitionDelay: isPricingVisible ? `${100 + idx * 120}ms` : '0ms',
                    backgroundColor: servicesColors?.cardBg || 'var(--sec-services-card, var(--color-site-card, #141414))',
                    borderColor: servicesColors?.border || 'var(--sec-services-border, var(--color-site-border, #262626))'
                  }}
                >
                  {service.featured && (
                    <div
                      className="absolute -top-3 right-5 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md"
                      style={{
                        backgroundColor: servicesColors?.buttonBg || 'var(--sec-services-btn-bg, #F59E0B)',
                        color: servicesColors?.buttonText || '#0A0A0A'
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-5">
                      {getIcon(service.iconName)}
                    </div>

                    <h3
                      className="text-xl font-bold mb-1"
                      style={{ color: servicesColors?.heading || 'var(--sec-services-heading, var(--color-site-heading, #FFFFFF))' }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-xs font-semibold mb-3"
                      style={{ color: servicesColors?.accent || 'var(--sec-services-accent, #F59E0B)' }}
                    >
                      {service.subtitle}
                    </p>
                    <p
                      className="text-xs leading-relaxed mb-6"
                      style={{ color: servicesColors?.muted || servicesColors?.text || 'var(--sec-services-muted, var(--color-site-muted, #9CA3AF))' }}
                    >
                      {service.description}
                    </p>

                    {/* Deliverables list */}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div
                        className="space-y-2 mb-6 pt-4 border-t"
                        style={{ borderColor: servicesColors?.border || 'var(--sec-services-border, var(--color-site-border, rgba(0,0,0,0.1)))' }}
                      >
                        {service.deliverables.map((deliv, delivIdx) => (
                          <div
                            key={delivIdx}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: servicesColors?.text || 'var(--sec-services-text, var(--color-site-text, #1F2937))' }}
                          >
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0 mt-0.5"
                              style={{ color: servicesColors?.accent || '#F59E0B' }}
                            />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & CTA */}
                  <div
                    className="pt-4 border-t space-y-3"
                    style={{ borderColor: servicesColors?.border || 'var(--sec-services-border, var(--color-site-border, rgba(0,0,0,0.1)))' }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{ color: servicesColors?.muted || 'var(--sec-services-muted, var(--color-site-muted, #9CA3AF))' }}
                      >
                        <Clock className="w-3 h-3 text-amber-500" style={{ color: servicesColors?.accent || undefined }} /> {service.turnaroundTime}
                      </span>
                      <span
                        className="text-base font-extrabold"
                        style={{ color: servicesColors?.accent || servicesColors?.heading || '#F59E0B' }}
                      >
                        {displayPrice}
                      </span>
                    </div>

                    <a
                      href={ctaLink}
                      className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      style={{
                        backgroundColor: servicesColors?.buttonBg || 'var(--sec-services-btn-bg, var(--color-site-btn-bg, #F59E0B))',
                        color: servicesColors?.buttonText || 'var(--sec-services-btn-text, var(--color-site-btn-text, #0A0A0A))'
                      }}
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
