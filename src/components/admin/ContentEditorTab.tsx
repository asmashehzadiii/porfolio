import React, { useState } from 'react';
import { WebsiteData, HeroSection, AboutSection, SectionHeadings } from '../../types';
import { Sparkles, Image, Upload, Plus, Trash2, CheckCircle2, User, FileText, Type, Film, Monitor, Smartphone, Palette, Wrench, MessageSquare, Mail, Layers } from 'lucide-react';
import { uploadMediaFile, updateWebsiteData } from '../../services/api';

interface ContentEditorTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const ContentEditorTab: React.FC<ContentEditorTabProps> = ({ data, onChange, token }) => {
  const [subTab, setSubTab] = useState<'hero' | 'headings' | 'about'>('hero');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const hero = data.hero;
  const about = data.about;
  const headings = data.sectionHeadings || {};

  const updateHeading = <K extends keyof SectionHeadings>(section: K, field: string, value: string) => {
    onChange({
      ...data,
      sectionHeadings: {
        ...data.sectionHeadings,
        [section]: {
          ...(data.sectionHeadings?.[section] || {}),
          [field]: value
        }
      }
    });
  };

  const updateHero = (field: keyof HeroSection, value: any) => {
    onChange({
      ...data,
      hero: { ...data.hero, [field]: value }
    });
  };

  const updateAbout = (field: keyof AboutSection, value: any) => {
    onChange({
      ...data,
      about: { ...data.about, [field]: value }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'heroProfile' | 'heroBanner' | 'aboutProfile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(target);
    try {
      const res = await uploadMediaFile(token, file);
      const updatedData = { ...data };
      if (target === 'heroProfile') {
        updatedData.hero = { ...updatedData.hero, profileImage: res.url };
      } else if (target === 'heroBanner') {
        updatedData.hero = { ...updatedData.hero, bannerImage: res.url };
      } else if (target === 'aboutProfile') {
        updatedData.about = { ...updatedData.about, profileImage: res.url };
      }
      onChange(updatedData);
      if (token) {
        await updateWebsiteData(token, updatedData);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setSubTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            subTab === 'hero'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Section</span>
        </button>
        <button
          onClick={() => setSubTab('headings')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            subTab === 'headings'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Section Titles & Headings</span>
        </button>
        <button
          onClick={() => setSubTab('about')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            subTab === 'about'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>About Me & Bio</span>
        </button>
      </div>

      {/* HERO EDITOR */}
      {subTab === 'hero' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Hero Branding & Headings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Main Title (Headline)</label>
                <input
                  type="text"
                  value={hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="THE EDITOR"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Subtitle / Full Name</label>
                <input
                  type="text"
                  value={hero.subtitle}
                  onChange={(e) => updateHero('subtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Asma Shehzadi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Tagline (Golden Text)</label>
                <input
                  type="text"
                  value={hero.tagline}
                  onChange={(e) => updateHero('tagline', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Your Ideas, My Edit"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Availability Badge Text</label>
                <input
                  type="text"
                  value={hero.badgeText}
                  onChange={(e) => updateHero('badgeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Available for Creative Projects"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Hero Lead Description</label>
              <textarea
                rows={3}
                value={hero.description}
                onChange={(e) => updateHero('description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Buttons & Links */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Hero Buttons & Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary Button Text</label>
                <input
                  type="text"
                  value={hero.primaryBtnText}
                  onChange={(e) => updateHero('primaryBtnText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary Button Target Link</label>
                <input
                  type="text"
                  value={hero.primaryBtnLink}
                  onChange={(e) => updateHero('primaryBtnLink', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="#contact"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Secondary Button Text</label>
                <input
                  type="text"
                  value={hero.secondaryBtnText}
                  onChange={(e) => updateHero('secondaryBtnText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Secondary Button Target Link</label>
                <input
                  type="text"
                  value={hero.secondaryBtnLink}
                  onChange={(e) => updateHero('secondaryBtnLink', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="#video-portfolio"
                />
              </div>
            </div>
          </div>

          {/* Hero Images */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-400" />
              Hero Visual Assets & Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile / Desk Image */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-300">
                  Featured Hero Photo (Editing Desk / Avatar)
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-950">
                  <img
                    src={hero.profileImage}
                    alt="Hero Desk"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hero.profileImage}
                    onChange={(e) => updateHero('profileImage', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                    placeholder="Image URL..."
                  />
                  <label className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage === 'heroProfile' ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'heroProfile')}
                    />
                  </label>
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-300">
                  Branding Banner Graphic
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-neutral-950">
                  <img
                    src={hero.bannerImage}
                    alt="Hero Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hero.bannerImage}
                    onChange={(e) => updateHero('bannerImage', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                    placeholder="Banner Image URL..."
                  />
                  <label className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage === 'heroBanner' ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'heroBanner')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Statistics Counters */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100">Hero Statistics Numbers</h3>
              <button
                onClick={() => {
                  const newStats = [...hero.stats, { label: 'New Stat', value: '100+' }];
                  updateHero('stats', newStats);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 hover:bg-amber-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Stat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hero.stats.map((stat, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-white/5 bg-neutral-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">Stat #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const newStats = hero.stats.filter((_, i) => i !== idx);
                        updateHero('stats', newStats);
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...hero.stats];
                      newStats[idx].value = e.target.value;
                      updateHero('stats', newStats);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-sm font-bold text-amber-400"
                    placeholder="e.g. 500+"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...hero.stats];
                      newStats[idx].label = e.target.value;
                      updateHero('stats', newStats);
                    }}
                    className="w-full px-3 py-1 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-300"
                    placeholder="Label..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION TITLES & HEADINGS EDITOR */}
      {subTab === 'headings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              Customize exact titles, badges, and subtitles for every section on your website. Changes apply immediately!
            </span>
          </div>

          {/* 1. Video Portfolio & 16:9 Showcase */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Video Showcase & 16:9 Slider Headings</h3>
                <p className="text-xs text-neutral-400">Configure the main video section titles, 16:9 horizontal slider title, and 9:16 reels title</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.videos?.badge ?? 'Video Editing Showcase'}
                  onChange={(e) => updateHeading('videos', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Video Editing Showcase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.videos?.title ?? 'Selected Video Projects'}
                  onChange={(e) => updateHeading('videos', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Selected Video Projects"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.videos?.subtitle ?? 'From viral short-form retention edits to immersive documentary storytelling and commercial campaigns.'}
                  onChange={(e) => updateHeading('videos', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="From viral short-form retention edits to immersive documentary storytelling..."
                />
              </div>

              {/* 16:9 Custom Title Box */}
              <div className="md:col-span-2 p-4 rounded-xl border border-amber-500/30 bg-neutral-950/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">16:9 Cinematic Showcase Slider Title</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">16:9 Title</label>
                    <input
                      type="text"
                      value={headings.videos?.longFormTitle ?? 'Long-Form & Cinematic Productions (16:9)'}
                      onChange={(e) => updateHeading('videos', 'longFormTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-white/15 bg-neutral-900 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none font-bold"
                      placeholder="Long-Form & Cinematic Productions (16:9)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">16:9 Optional Subtitle (Leave blank for no subtitle)</label>
                    <input
                      type="text"
                      value={headings.videos?.longFormSubtitle ?? ''}
                      onChange={(e) => updateHeading('videos', 'longFormSubtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-white/15 bg-neutral-900 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                      placeholder="Optional subtitle (or keep blank)"
                    />
                  </div>
                </div>
              </div>

              {/* 9:16 Custom Title Box */}
              <div className="md:col-span-2 p-4 rounded-xl border border-white/10 bg-neutral-950/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">9:16 Vertical Reels Slider Title</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">9:16 Title</label>
                    <input
                      type="text"
                      value={headings.videos?.reelsTitle ?? 'Viral Short-Form Reels & TikToks (9:16)'}
                      onChange={(e) => updateHeading('videos', 'reelsTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-white/15 bg-neutral-900 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                      placeholder="Viral Short-Form Reels & TikToks (9:16)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">9:16 Subtitle</label>
                    <input
                      type="text"
                      value={headings.videos?.reelsSubtitle ?? 'Continuous horizontal stream • Engineered for high hook retention and organic reach'}
                      onChange={(e) => updateHeading('videos', 'reelsSubtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-white/15 bg-neutral-900 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                      placeholder="Continuous horizontal stream..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Graphic Design Showcase */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Graphic Design Gallery Headings</h3>
                <p className="text-xs text-neutral-400">Headings for YouTube thumbnails, logos, and graphic design showcase</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.designs?.badge ?? 'Visual Branding & Graphic Design'}
                  onChange={(e) => updateHeading('designs', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Visual Branding & Graphic Design"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.designs?.title ?? 'Graphic Design Showcase'}
                  onChange={(e) => updateHeading('designs', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Graphic Design Showcase"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.designs?.subtitle ?? 'High CTR YouTube thumbnails, logo brand systems, social media banners, and promotional print assets.'}
                  onChange={(e) => updateHeading('designs', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="High CTR YouTube thumbnails, logo brand systems..."
                />
              </div>
            </div>
          </div>

          {/* 3. Skills & Software Mastery */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Skills & Tooling Headings</h3>
                <p className="text-xs text-neutral-400">Headings for skills, software proficiencies, and categories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.skills?.badge ?? 'Tools & Technical Capabilities'}
                  onChange={(e) => updateHeading('skills', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Tools & Technical Capabilities"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.skills?.title ?? 'Skills & Software Mastery'}
                  onChange={(e) => updateHeading('skills', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Skills & Software Mastery"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.skills?.subtitle ?? 'Industry-standard post-production suites paired with generative AI workflows for maximum speed and quality.'}
                  onChange={(e) => updateHeading('skills', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Services & Pricing Packages */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Services & Pricing Headings</h3>
                <p className="text-xs text-neutral-400">Headings for pricing packages and client deliverables</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.services?.badge ?? 'High Impact Deliverables'}
                  onChange={(e) => updateHeading('services', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="High Impact Deliverables"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.services?.title ?? 'Services & Pricing Packages'}
                  onChange={(e) => updateHeading('services', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Services & Pricing Packages"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.services?.subtitle ?? 'Tailored creative packages designed to elevate your personal brand, channel, or commercial campaigns.'}
                  onChange={(e) => updateHeading('services', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Testimonials & Client Reviews */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Client Reviews & Testimonials Headings</h3>
                <p className="text-xs text-neutral-400">Headings for client endorsements and feedback marquee</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.testimonials?.badge ?? 'Client Endorsements'}
                  onChange={(e) => updateHeading('testimonials', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Client Endorsements"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.testimonials?.title ?? 'What Creators & Brands Say'}
                  onChange={(e) => updateHeading('testimonials', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="What Creators & Brands Say"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.testimonials?.subtitle ?? 'Real feedback from YouTube creators, agencies, influencers, and luxury real estate partners.'}
                  onChange={(e) => updateHeading('testimonials', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Contact Section */}
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">Contact & Collaboration Headings</h3>
                <p className="text-xs text-neutral-400">Headings for the contact form, booking calendar, and project inquiry section</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Badge Pill</label>
                <input
                  type="text"
                  value={headings.contact?.badge ?? "Let's Create Together"}
                  onChange={(e) => updateHeading('contact', 'badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Let's Create Together"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Main Heading</label>
                <input
                  type="text"
                  value={headings.contact?.title ?? 'Ready to elevate your visual content?'}
                  onChange={(e) => updateHeading('contact', 'title', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                  placeholder="Ready to elevate your visual content?"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Subtitle / Description</label>
                <input
                  type="text"
                  value={headings.contact?.subtitle ?? 'Have an upcoming video project, YouTube channel launch, or branding redesign? Send a message directly or schedule a call.'}
                  onChange={(e) => updateHeading('contact', 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT EDITOR */}
      {subTab === 'about' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              About Me Titles & Persona
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Section Title</label>
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => updateAbout('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={about.subtitle}
                  onChange={(e) => updateAbout('subtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Experience Years</label>
                <input
                  type="text"
                  value={about.experienceYears}
                  onChange={(e) => updateAbout('experienceYears', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Signature Text</label>
                <input
                  type="text"
                  value={about.signatureText}
                  onChange={(e) => updateAbout('signatureText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio Paragraphs */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200">Biography Paragraphs</label>
                <button
                  onClick={() => updateAbout('bio', [...about.bio, ''])}
                  className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-amber-400 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Paragraph
                </button>
              </div>

              {about.bio.map((para, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <textarea
                    rows={2}
                    value={para}
                    onChange={(e) => {
                      const newBio = [...about.bio];
                      newBio[idx] = e.target.value;
                      updateAbout('bio', newBio);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-neutral-950 text-xs md:text-sm text-neutral-200 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newBio = about.bio.filter((_, i) => i !== idx);
                      updateAbout('bio', newBio);
                    }}
                    className="p-2 text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Profile Avatar Image */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <label className="block text-xs font-semibold text-neutral-300">
                About Avatar / Portrait Image
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={about.profileImage}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                />
                <input
                  type="text"
                  value={about.profileImage}
                  onChange={(e) => updateAbout('profileImage', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                />
                <label className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage === 'aboutProfile' ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'aboutProfile')}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
