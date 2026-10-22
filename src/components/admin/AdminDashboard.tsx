import React, { useState } from 'react';
import { WebsiteData } from '../../types';
import {
  LayoutDashboard,
  FileEdit,
  Layers,
  Film,
  Palette,
  Wrench,
  DollarSign,
  MessageSquare,
  HardDrive,
  Settings,
  Compass,
  Phone,
  Globe,
  Save,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../ThemeManager';
import { updateWebsiteData } from '../../services/api';

import { OverviewTab } from './OverviewTab';
import { ContentEditorTab } from './ContentEditorTab';
import { SectionBuilderTab } from './SectionBuilderTab';
import { VideoManagerTab } from './VideoManagerTab';
import { DesignManagerTab } from './DesignManagerTab';
import { SkillsManagerTab } from './SkillsManagerTab';
import { TestimonialsManagerTab } from './TestimonialsManagerTab';
import { MediaLibraryTab } from './MediaLibraryTab';
import { ThemeSettingsTab } from './ThemeSettingsTab';
import { NavigationEditorTab } from './NavigationEditorTab';
import { ContactSettingsTab } from './ContactSettingsTab';
import { SeoBackupTab } from './SeoBackupTab';

interface AdminDashboardProps {
  data: WebsiteData;
  token: string;
  onUpdateData: (newData: WebsiteData) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  token,
  onUpdateData,
  onExitAdmin,
  onLogout
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsaved, setHasUnsaved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleDataChange = (newData: WebsiteData) => {
    onUpdateData(newData);
    setHasUnsaved(true);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveToast(null);

    try {
      const updated = await updateWebsiteData(token, data);
      onUpdateData(updated);
      setHasUnsaved(false);
      setSaveToast({
        type: 'success',
        message: 'All website changes saved and published to live database!'
      });
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      setSaveToast({
        type: 'error',
        message: err.message || 'Failed to save changes'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'content', label: 'Hero & Content Editor', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'sections', label: 'Dynamic Section Builder', icon: <Layers className="w-4 h-4" />, count: data.dynamicSections?.length },
    { id: 'videos', label: 'Video Portfolio', icon: <Film className="w-4 h-4" />, count: data.videos?.length },
    { id: 'designs', label: 'Graphic Design', icon: <Palette className="w-4 h-4" />, count: data.designs?.length },
    { id: 'skills', label: 'Pricing & Skills Manager', icon: <DollarSign className="w-4 h-4" />, count: data.services?.length },
    { id: 'testimonials', label: 'Client Reviews', icon: <MessageSquare className="w-4 h-4" />, count: data.testimonials?.length },
    { id: 'media', label: 'Media Library', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'theme', label: 'Theme & Appearance', icon: <Settings className="w-4 h-4" /> },
    { id: 'navigation', label: 'Header & Navigation', icon: <Compass className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact & Socials', icon: <Phone className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO, Backup & Security', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-neutral-950/95 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg border border-white/10 text-neutral-400"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-neutral-950 text-xs shadow-md">
              E
            </div>
            <div>
              <span className="text-sm font-extrabold text-neutral-100 flex items-center gap-1.5">
                The Editor Admin CMS
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              </span>
              <span className="text-[10px] text-amber-400 font-medium block">
                Asma Shehzadi • Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unsaved indicator */}
          {hasUnsaved && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Unsaved Changes
            </span>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-white/10 bg-neutral-900 text-amber-400 hover:bg-neutral-800 transition-colors"
            title="Toggle Preview Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>

          {/* View Live Website */}
          <button
            onClick={onExitAdmin}
            className="hidden sm:flex px-3.5 py-2 rounded-xl border border-white/10 hover:border-amber-400/50 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>View Site</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 border ${
          saveToast.type === 'success'
            ? 'bg-neutral-900 text-emerald-400 border-emerald-500/40'
            : 'bg-neutral-900 text-red-400 border-red-500/40'
        }`}>
          {saveToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold text-neutral-100">{saveToast.message}</span>
        </div>
      )}

      {/* Admin Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-20 w-64 border-r border-white/10 bg-neutral-950 p-4 space-y-1.5 overflow-y-auto transition-transform duration-200 md:static md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-3 pb-2 pt-1">
            Dashboard Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-neutral-950' : 'text-amber-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-neutral-950/20 text-neutral-950 font-bold' : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-white/10 px-3">
            <button
              onClick={onExitAdmin}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-neutral-900 hover:bg-neutral-850 text-xs font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Back to Portfolio</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-950/50">
          <div className="max-w-6xl mx-auto pb-16">
            {activeTab === 'overview' && (
              <OverviewTab
                data={data}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onViewLive={onExitAdmin}
              />
            )}
            {activeTab === 'content' && (
              <ContentEditorTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'sections' && (
              <SectionBuilderTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'videos' && (
              <VideoManagerTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'designs' && (
              <DesignManagerTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'skills' && (
              <SkillsManagerTab data={data} onChange={handleDataChange} />
            )}
            {activeTab === 'testimonials' && (
              <TestimonialsManagerTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'media' && (
              <MediaLibraryTab token={token} />
            )}
            {activeTab === 'theme' && (
              <ThemeSettingsTab data={data} onChange={handleDataChange} token={token} onSave={handleSaveAll} />
            )}
            {activeTab === 'navigation' && (
              <NavigationEditorTab data={data} onChange={handleDataChange} token={token} />
            )}
            {activeTab === 'contact' && (
              <ContactSettingsTab data={data} onChange={handleDataChange} />
            )}
            {activeTab === 'seo' && (
              <SeoBackupTab data={data} onChange={handleDataChange} token={token} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
