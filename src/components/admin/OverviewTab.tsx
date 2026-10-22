import React from 'react';
import { WebsiteData } from '../../types';
import {
  Film,
  Palette,
  Layers,
  Wrench,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  HardDrive,
  Settings,
  Clock
} from 'lucide-react';

interface OverviewTabProps {
  data: WebsiteData;
  onNavigateTab: (tabId: string) => void;
  onViewLive: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onNavigateTab, onViewLive }) => {
  const publishedVideos = data.videos.filter(v => v.status === 'published').length;
  const publishedDesigns = data.designs.filter(d => d.status === 'published').length;

  const statCards = [
    {
      title: 'Video Portfolio',
      value: `${publishedVideos} / ${data.videos.length}`,
      sub: `${data.videoCategories.length - 1} Categories`,
      icon: <Film className="w-6 h-6 text-amber-400" />,
      tab: 'videos',
      actionText: 'Manage Videos'
    },
    {
      title: 'Graphic Designs',
      value: `${publishedDesigns} / ${data.designs.length}`,
      sub: `${data.designCategories.length - 1} Categories`,
      icon: <Palette className="w-6 h-6 text-amber-400" />,
      tab: 'designs',
      actionText: 'Manage Designs'
    },
    {
      title: 'Dynamic Sections',
      value: `${data.dynamicSections.length}`,
      sub: `${data.dynamicSections.filter(s => s.isEnabled).length} Active on Site`,
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      tab: 'sections',
      actionText: 'Build Sections'
    },
    {
      title: 'Client Reviews',
      value: `${data.testimonials.length}`,
      sub: `${data.testimonials.filter(t => t.isPublished).length} Published in Slider`,
      icon: <MessageSquare className="w-6 h-6 text-amber-400" />,
      tab: 'testimonials',
      actionText: 'Manage Reviews'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Admin CMS Connected & Synced</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-100">
            Welcome, Asma Shehzadi!
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl">
            You have full real-time control over every section, video, thumbnail, dynamic layout, and color theme. Changes persist directly to the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onViewLive}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Live Site</span>
          </button>
          <button
            onClick={() => onNavigateTab('sections')}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-amber-400/50 bg-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-white/10 bg-neutral-900/80 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {card.title}
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
              <div className="text-3xl font-black text-neutral-100">{card.value}</div>
              <div className="text-xs text-amber-400 font-medium mt-1">{card.sub}</div>
            </div>

            <button
              onClick={() => onNavigateTab(card.tab)}
              className="mt-6 pt-3 border-t border-white/5 text-xs font-bold text-neutral-400 hover:text-amber-400 flex items-center justify-between transition-colors"
            >
              <span>{card.actionText}</span>
              <span>→</span>
            </button>
          </div>
        ))}
      </div>

      {/* Quick Launch Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Quick Content Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateTab('videos')}
              className="p-4 rounded-xl border border-white/5 bg-neutral-950/60 hover:border-amber-400/40 text-left transition-all group"
            >
              <Film className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-neutral-200 group-hover:text-amber-400">
                Upload New Video
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                MP4 upload or YouTube/Vimeo
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('designs')}
              className="p-4 rounded-xl border border-white/5 bg-neutral-950/60 hover:border-amber-400/40 text-left transition-all group"
            >
              <Palette className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-neutral-200 group-hover:text-amber-400">
                Add Graphic Project
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Thumbnails, logos, mockups
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('theme')}
              className="p-4 rounded-xl border border-white/5 bg-neutral-950/60 hover:border-amber-400/40 text-left transition-all group"
            >
              <Settings className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-neutral-200 group-hover:text-amber-400">
                Theme & Colors
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Dark & Light gold palette
              </p>
            </button>
          </div>
        </div>

        {/* Database & Storage Status */}
        <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-4">
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            System & Storage Health
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-white/5">
              <span className="text-neutral-400">Database Engine</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Persistent JSON DB
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-white/5">
              <span className="text-neutral-400">Media Uploads</span>
              <span className="font-bold text-emerald-400">Ready (100MB Max)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-white/5">
              <span className="text-neutral-400">Last Database Sync</span>
              <span className="font-medium text-neutral-300">
                {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
