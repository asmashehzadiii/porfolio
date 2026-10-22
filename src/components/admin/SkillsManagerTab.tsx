import React, { useState } from 'react';
import { WebsiteData, SkillItem, ServiceItem, CurrencyCode, PricingSettings } from '../../types';
import {
  Wrench,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  Star,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Layers,
  DollarSign,
  Smartphone,
  Youtube,
  Zap,
  Film,
  Image,
  Palette,
  Volume2,
  Cpu,
  Clock,
  ArrowRight,
  Calculator,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface SkillsManagerTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
}

export const SkillsManagerTab: React.FC<SkillsManagerTabProps> = ({ data, onChange }) => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'skills'>('services');
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);

  const skills = data.skills || [];
  const services = data.services || [];
  const pricingSettings: PricingSettings = data.pricingSettings || {
    defaultCurrency: 'USD',
    enableCurrencySelector: true,
    ctaButtonText: 'Book This Service',
    ctaButtonLink: '#contact'
  };

  // ==========================================
  // PRICING SETTINGS HANDLERS
  // ==========================================
  const handleUpdatePricingSettings = (updates: Partial<PricingSettings>) => {
    const updated: PricingSettings = {
      ...pricingSettings,
      ...updates
    };
    onChange({
      ...data,
      pricingSettings: updated
    });
  };

  // ==========================================
  // SERVICES & PRICING PACKAGES HANDLERS
  // ==========================================
  const handleStartService = () => {
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      title: 'New Creative Package',
      subtitle: 'Tailored for creators & brands',
      description: 'High retention video editing with full sound design, dynamic cuts, and 4K color grading.',
      iconName: 'Smartphone',
      category: 'Short Form',
      deliverables: [
        'Hook retention optimization in first 3s',
        'Animated bold captions & zooms',
        'Full sound design & audio mastering',
        '4K multi-format export'
      ],
      turnaroundTime: '24 - 48 Hours',
      startingPrice: '$50 / reel',
      prices: {
        USD: '$50 / reel',
        PKR: 'Rs. 13,900 / reel',
        GBP: '£40 / reel',
        AED: '185 AED / reel'
      },
      ctaText: 'Book This Service',
      ctaLink: '#contact',
      isPublished: true,
      featured: false,
      order: services.length + 1
    };
    setEditingService(newService);
    setIsCreatingService(true);
  };

  const handleSaveService = (service: ServiceItem) => {
    // Ensure startingPrice reflects USD if prices.USD is present
    if (service.prices?.USD && service.prices.USD.trim() !== '') {
      service.startingPrice = service.prices.USD;
    }

    let updatedList: ServiceItem[];
    if (isCreatingService) {
      updatedList = [...services, { ...service, order: services.length + 1 }];
    } else {
      updatedList = services.map(s => (s.id === service.id ? service : s));
    }

    // Re-index orders cleanly
    updatedList = updatedList.map((s, idx) => ({ ...s, order: idx + 1 }));

    onChange({
      ...data,
      services: updatedList
    });
    setEditingService(null);
    setIsCreatingService(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this pricing package?')) {
      const updated = services.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
      onChange({
        ...data,
        services: updated
      });
    }
  };

  const handleDuplicateService = (service: ServiceItem) => {
    const copy: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
      title: `${service.title} (Copy)`,
      order: services.length + 1,
      deliverables: [...(service.deliverables || [])],
      prices: { ...(service.prices || {}) }
    };
    const updated = [...services, copy].map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange({
      ...data,
      services: updated
    });
  };

  const handleTogglePublishService = (id: string) => {
    const updated = services.map(s => {
      if (s.id === id) {
        return { ...s, isPublished: s.isPublished === false ? true : false };
      }
      return s;
    });
    onChange({ ...data, services: updated });
  };

  const handleToggleFeaturedService = (id: string) => {
    const updated = services.map(s => {
      if (s.id === id) {
        return { ...s, featured: !s.featured };
      }
      return s;
    });
    onChange({ ...data, services: updated });
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === services.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...services];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange({ ...data, services: updated });
  };

  // Helper to auto-calculate realistic conversions from USD
  const handleAutoConvertPrices = () => {
    if (!editingService) return;
    const usd = editingService.prices?.USD || editingService.startingPrice || '$50 / reel';
    const numMatch = usd.match(/\$?([0-9,.]+)/);
    const usdVal = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 50;
    const unitMatch = usd.replace(/^[^\s]*[0-9,.]+\s*/, '').trim();
    const unit = unitMatch ? ` ${unitMatch}` : '';

    const pkrVal = Math.round(usdVal * 278);
    const gbpVal = Math.round(usdVal * 0.79);
    const aedVal = Math.round(usdVal * 3.67);

    setEditingService({
      ...editingService,
      startingPrice: `$${usdVal}${unit}`,
      prices: {
        USD: `$${usdVal}${unit}`,
        PKR: `Rs. ${pkrVal.toLocaleString()}${unit}`,
        GBP: `£${gbpVal.toLocaleString()}${unit}`,
        AED: `${aedVal.toLocaleString()} AED${unit}`
      }
    });
  };

  // ==========================================
  // SKILLS HANDLERS
  // ==========================================
  const handleStartSkill = () => {
    const s: SkillItem = {
      id: `sk-${Date.now()}`,
      name: 'New Creative Skill',
      category: 'Video Editing',
      proficiency: 90,
      iconName: 'Film',
      description: 'Advanced pacing, multi-camera, and delivery.',
      featured: true,
      order: skills.length + 1
    };
    setEditingSkill(s);
    setIsCreatingSkill(true);
  };

  const handleSaveSkill = (skill: SkillItem) => {
    let updatedList: SkillItem[];
    if (isCreatingSkill) {
      updatedList = [...skills, { ...skill, order: skills.length + 1 }];
    } else {
      updatedList = skills.map(s => (s.id === skill.id ? skill : s));
    }
    updatedList = updatedList.map((s, idx) => ({ ...s, order: idx + 1 }));

    onChange({ ...data, skills: updatedList });
    setEditingSkill(null);
    setIsCreatingSkill(false);
  };

  const handleDeleteSkill = (id: string) => {
    if (confirm('Delete this skill?')) {
      const updated = skills.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
      onChange({ ...data, skills: updated });
    }
  };

  const getIconElement = (name: string) => {
    switch (name) {
      case 'Film': return <Film className="w-4 h-4 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Image': return <Image className="w-4 h-4 text-amber-400" />;
      case 'Palette': return <Palette className="w-4 h-4 text-amber-400" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'Youtube': return <Youtube className="w-4 h-4 text-amber-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      default: return <Wrench className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header & Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-neutral-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            <span>Pricing Packages & Skills Manager</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Control service packages, multi-currency rates (USD, PKR, GBP, AED), and technical skill proficiencies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-white/10">
            <button
              onClick={() => setActiveSubTab('services')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'services'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pricing Packages ({services.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('skills')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'skills'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Skills & Software ({skills.length})</span>
            </button>
          </div>

          <button
            onClick={activeSubTab === 'services' ? handleStartService : handleStartSkill}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'services' ? 'Add Package' : 'Add Skill'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SERVICES & PRICING PACKAGES SUBTAB
         ======================================================== */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          {/* Global Pricing & Currency Settings Panel */}
          <div className="p-5 md:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-100">
                  Global Currency & Pricing Settings
                </h3>
              </div>
              <span className="text-[11px] text-amber-400/90 font-medium">
                Changes apply instantly across live website
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Default Currency */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Default Display Currency
                </label>
                <select
                  value={pricingSettings.defaultCurrency || 'USD'}
                  onChange={(e) => handleUpdatePricingSettings({ defaultCurrency: e.target.value as CurrencyCode })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="PKR">PKR — Pakistani Rupee (Rs.)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="AED">AED — UAE Dirham (د.إ)</option>
                </select>
                <p className="text-[10px] text-neutral-500 mt-1">Pre-selected for new visitors</p>
              </div>

              {/* Currency Selector Toggle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Currency Switcher Bar
                </label>
                <div className="flex items-center gap-3 h-9 px-3 rounded-xl border border-white/10 bg-neutral-950">
                  <input
                    type="checkbox"
                    id="enableCurrencySelector"
                    checked={pricingSettings.enableCurrencySelector !== false}
                    onChange={(e) => handleUpdatePricingSettings({ enableCurrencySelector: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="enableCurrencySelector" className="text-xs text-neutral-200 cursor-pointer">
                    Show 4-Currency Selector
                  </label>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">USD, PKR, GBP, AED switcher tabs</p>
              </div>

              {/* Default CTA Button Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Default CTA Button Text
                </label>
                <input
                  type="text"
                  value={pricingSettings.ctaButtonText || 'Book This Service'}
                  onChange={(e) => handleUpdatePricingSettings({ ctaButtonText: e.target.value })}
                  placeholder="e.g. Book This Service"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Fallback button text</p>
              </div>

              {/* Default CTA Button Link */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Default CTA Button Link
                </label>
                <input
                  type="text"
                  value={pricingSettings.ctaButtonLink || '#contact'}
                  onChange={(e) => handleUpdatePricingSettings({ ctaButtonLink: e.target.value })}
                  placeholder="e.g. #contact or WhatsApp"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Section anchor or external URL</p>
              </div>
            </div>
          </div>

          {/* Pricing Packages Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const isPub = service.isPublished !== false;
              const prices = service.prices || {
                USD: service.startingPrice || '$45 / reel',
                PKR: 'Rs. 12,500 / reel',
                GBP: '£35 / reel',
                AED: '165 AED / reel'
              };

              return (
                <div
                  key={service.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                    isPub
                      ? service.featured
                        ? 'border-amber-400/60 bg-gradient-to-b from-neutral-900 to-amber-950/20 shadow-xl'
                        : 'border-white/10 bg-neutral-900/80 hover:border-amber-400/40 shadow-lg'
                      : 'border-white/5 bg-neutral-950/60 opacity-60'
                  }`}
                >
                  {/* Top Badges & Reorder Controls */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isPub
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 border border-white/10'
                        }`}
                      >
                        {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {isPub ? 'Published' : 'Hidden'}
                      </span>
                      {service.featured && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveService(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-md border border-white/10 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveService(index, 'down')}
                        disabled={index === services.length - 1}
                        title="Move Down"
                        className="p-1 rounded-md border border-white/10 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                          {getIconElement(service.iconName)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-neutral-100">{service.title}</h4>
                          <span className="text-xs font-semibold text-amber-400">{service.subtitle}</span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 shrink-0">
                        {service.category || 'Package'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* 4-Currency Prices Grid */}
                    <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-white/5 space-y-2">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Multi-Currency Pricing Rates
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-neutral-900 border border-white/5">
                          <span className="text-[10px] text-neutral-500 block">USD ($)</span>
                          <span className="font-extrabold text-amber-400 truncate block">
                            {prices.USD || service.startingPrice || '—'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-neutral-900 border border-white/5">
                          <span className="text-[10px] text-neutral-500 block">PKR (Rs.)</span>
                          <span className="font-extrabold text-neutral-200 truncate block">
                            {prices.PKR || '—'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-neutral-900 border border-white/5">
                          <span className="text-[10px] text-neutral-500 block">GBP (£)</span>
                          <span className="font-extrabold text-neutral-200 truncate block">
                            {prices.GBP || '—'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-neutral-900 border border-white/5">
                          <span className="text-[10px] text-neutral-500 block">AED (د.إ)</span>
                          <span className="font-extrabold text-neutral-200 truncate block">
                            {prices.AED || '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Deliverables preview */}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Features & Deliverables ({service.deliverables.length})
                        </span>
                        {service.deliverables.slice(0, 3).map((deliv, i) => (
                          <div key={i} className="text-xs text-neutral-300 flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{deliv}</span>
                          </div>
                        ))}
                        {service.deliverables.length > 3 && (
                          <span className="text-[11px] text-neutral-500 italic">
                            +{service.deliverables.length - 3} more deliverables
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-400" /> {service.turnaroundTime}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Visibility */}
                      <button
                        onClick={() => handleTogglePublishService(service.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isPub
                            ? 'border-white/10 text-neutral-400 hover:text-amber-400'
                            : 'border-emerald-500/30 text-emerald-400'
                        }`}
                        title={isPub ? 'Hide package' : 'Publish package'}
                      >
                        {isPub ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Toggle Featured */}
                      <button
                        onClick={() => handleToggleFeaturedService(service.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          service.featured
                            ? 'border-amber-400/40 text-amber-400 bg-amber-500/10'
                            : 'border-white/10 text-neutral-400 hover:text-amber-400'
                        }`}
                        title={service.featured ? 'Remove featured badge' : 'Mark as Most Popular'}
                      >
                        <Star className={`w-3.5 h-3.5 ${service.featured ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicateService(service)}
                        className="p-1.5 rounded-lg border border-white/10 bg-neutral-950 text-neutral-300 hover:text-amber-400 transition-colors"
                        title="Duplicate package"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingService({ ...service });
                          setIsCreatingService(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-bold flex items-center gap-1 text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 rounded-lg border border-white/10 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SKILLS & TOOLS SUBTAB
         ======================================================== */}
      {activeSubTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl border border-white/10 bg-neutral-950/80 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    {skill.category}
                  </span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {skill.proficiency}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-neutral-100">{skill.name}</h4>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{skill.description}</p>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  {getIconElement(skill.iconName)}
                  <span>{skill.iconName}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSkill({ ...skill });
                      setIsCreatingSkill(false);
                    }}
                    className="p-1.5 text-amber-400 hover:text-amber-300"
                    title="Edit skill"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400"
                    title="Delete skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          EDIT / CREATE SERVICE PACKAGE MODAL
         ======================================================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 p-6 md:p-8 rounded-3xl bg-neutral-950 border border-amber-500/30 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>{isCreatingService ? 'Add New Pricing Package' : 'Edit Pricing Package'}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure package details, features, and individual currency prices.
                </p>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Package Title *
                </label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  placeholder="e.g. Viral Short-Form Reels & TikToks"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Subtitle / Hook Tagline
                </label>
                <input
                  type="text"
                  value={editingService.subtitle}
                  onChange={(e) => setEditingService({ ...editingService, subtitle: e.target.value })}
                  placeholder="e.g. Engineered for retention and virality"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Category, Icon & Turnaround */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="Short Form">Short Form (Reels/TikTok)</option>
                  <option value="Long Form">Long Form & Documentary</option>
                  <option value="Graphic Design">Graphic Design & Thumbnails</option>
                  <option value="Commercial">Commercial Ads & Promo</option>
                  <option value="Motion Graphics">Motion Graphics</option>
                  <option value="Full Service">Full Service Package</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Icon
                </label>
                <select
                  value={editingService.iconName}
                  onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                >
                  <option value="Smartphone">Smartphone (Reels)</option>
                  <option value="Youtube">YouTube</option>
                  <option value="Layers">Layers (Thumbnails/Design)</option>
                  <option value="Zap">Zap (Commercial/Ads)</option>
                  <option value="Film">Film</option>
                  <option value="Sparkles">Sparkles</option>
                  <option value="Palette">Palette</option>
                  <option value="Volume2">Volume (Sound Design)</option>
                  <option value="Cpu">Cpu (AI/Tech)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Turnaround Time
                </label>
                <input
                  type="text"
                  value={editingService.turnaroundTime}
                  onChange={(e) => setEditingService({ ...editingService, turnaroundTime: e.target.value })}
                  placeholder="e.g. 24 - 48 Hours"
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Package Description
              </label>
              <textarea
                rows={2}
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                placeholder="Comprehensive description of the service and target outcome..."
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
              />
            </div>

            {/* ==============================================
                4-CURRENCY PRICING SECTION (CRITICAL FEATURE)
               ============================================== */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-neutral-900/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-100">
                    Pricing in 4 Supported Currencies
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoConvertPrices}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Auto-Calculate from USD</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* USD */}
                <div>
                  <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                    USD — US Dollar ($) *
                  </label>
                  <input
                    type="text"
                    value={editingService.prices?.USD || editingService.startingPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingService({
                        ...editingService,
                        startingPrice: val,
                        prices: {
                          ...editingService.prices,
                          USD: val
                        }
                      });
                    }}
                    placeholder="e.g. $45 / reel"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>

                {/* PKR */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    PKR — Pakistani Rupee (Rs.)
                  </label>
                  <input
                    type="text"
                    value={editingService.prices?.PKR || ''}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      prices: {
                        ...editingService.prices,
                        PKR: e.target.value
                      }
                    })}
                    placeholder="e.g. Rs. 12,500 / reel"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>

                {/* GBP */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    GBP — British Pound (£)
                  </label>
                  <input
                    type="text"
                    value={editingService.prices?.GBP || ''}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      prices: {
                        ...editingService.prices,
                        GBP: e.target.value
                      }
                    })}
                    placeholder="e.g. £35 / reel"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>

                {/* AED */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    AED — UAE Dirham (د.إ)
                  </label>
                  <input
                    type="text"
                    value={editingService.prices?.AED || ''}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      prices: {
                        ...editingService.prices,
                        AED: e.target.value
                      }
                    })}
                    placeholder="e.g. 165 AED / reel"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <p className="text-[10px] text-neutral-500">
                You can manually enter separate custom rates for each currency, or click "Auto-Calculate from USD" to apply standard rates (USD 1 = PKR 278, GBP 0.79, AED 3.67).
              </p>
            </div>

            {/* Deliverables / Features */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Features & Deliverables (one per line)
              </label>
              <textarea
                rows={3}
                value={editingService.deliverables?.join('\n') || ''}
                onChange={(e) => setEditingService({
                  ...editingService,
                  deliverables: e.target.value.split('\n').filter(l => l.trim() !== '')
                })}
                placeholder="Hook optimization in first 3 seconds&#10;Animated bold kinetic captions&#10;Full sound design & music ducking&#10;Color grading & 4K export"
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 font-mono leading-relaxed focus:border-amber-400 outline-none"
              />
            </div>

            {/* Custom CTA Text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom Button Text (Optional)
                </label>
                <input
                  type="text"
                  value={editingService.ctaText || ''}
                  onChange={(e) => setEditingService({ ...editingService, ctaText: e.target.value })}
                  placeholder={`Leave blank for default: ${pricingSettings.ctaButtonText || 'Book This Service'}`}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custom Button Link (Optional)
                </label>
                <input
                  type="text"
                  value={editingService.ctaLink || ''}
                  onChange={(e) => setEditingService({ ...editingService, ctaLink: e.target.value })}
                  placeholder={`Leave blank for default: ${pricingSettings.ctaButtonLink || '#contact'}`}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Checkboxes: Featured & Published */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                <input
                  type="checkbox"
                  checked={editingService.featured}
                  onChange={(e) => setEditingService({ ...editingService, featured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-semibold">Featured / "Most Popular" Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                <input
                  type="checkbox"
                  checked={editingService.isPublished !== false}
                  onChange={(e) => setEditingService({ ...editingService, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-semibold">Published on Live Website</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveService(editingService)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Save Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT / CREATE SKILL MODAL
         ======================================================== */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-100">
              {isCreatingSkill ? 'Add Creative Skill' : 'Edit Skill Details'}
            </h3>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">Skill Name</label>
              <input
                type="text"
                value={editingSkill.name}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-sm text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Category</label>
                <select
                  value={editingSkill.category}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                >
                  <option value="Video Editing">Video Editing</option>
                  <option value="Motion Graphics">Motion Graphics</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Audio & Color">Audio & Color</option>
                  <option value="Tools & Software">Tools & Software</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Proficiency: {editingSkill.proficiency}%</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={editingSkill.proficiency}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">Icon</label>
              <select
                value={editingSkill.iconName}
                onChange={(e) => setEditingSkill({ ...editingSkill, iconName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
              >
                <option value="Film">Film</option>
                <option value="Sparkles">Sparkles</option>
                <option value="Image">Image</option>
                <option value="Palette">Palette</option>
                <option value="Volume2">Volume2</option>
                <option value="Cpu">Cpu</option>
                <option value="Smartphone">Smartphone</option>
                <option value="Youtube">Youtube</option>
                <option value="Layers">Layers</option>
                <option value="Zap">Zap</option>
                <option value="Wrench">Wrench</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingSkill.description}
                onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingSkill(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSkill(editingSkill)}
                className="px-5 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                Save Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
