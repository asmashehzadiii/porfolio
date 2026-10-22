import React, { useState } from 'react';
import { WebsiteData, NavigationSettings } from '../../types';
import { Compass, Plus, Trash2, MoveUp, MoveDown, Eye, EyeOff, Upload } from 'lucide-react';
import { uploadMediaFile } from '../../services/api';

interface NavigationEditorTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const NavigationEditorTab: React.FC<NavigationEditorTabProps> = ({ data, onChange, token }) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const nav = data.navigation;

  const updateNav = (field: keyof NavigationSettings, value: any) => {
    onChange({
      ...data,
      navigation: { ...data.navigation, [field]: value }
    });
  };

  const handleAddMenuItem = () => {
    const item = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      href: '#section',
      isExternal: false,
      isVisible: true,
      order: (nav.menuItems?.length || 0) + 1
    };
    updateNav('menuItems', [...(nav.menuItems || []), item]);
  };

  const updateMenuItem = (id: string, field: string, value: any) => {
    updateNav(
      'menuItems',
      nav.menuItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const deleteMenuItem = (id: string) => {
    updateNav(
      'menuItems',
      nav.menuItems.filter(item => item.id !== id)
    );
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await uploadMediaFile(token, file);
      updateNav('logoImageUrl', res.url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Navigation & Header Editor
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Customize website logo, navbar menu links, call to action button, and footer text.
        </p>
      </div>

      {/* Brand Logo Settings */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Brand Logo & Header Title</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Logo Brand Text</label>
            <input
              type="text"
              value={nav.logoText}
              onChange={(e) => updateNav('logoText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Subtitle</label>
            <input
              type="text"
              value={nav.logoSubtitle}
              onChange={(e) => updateNav('logoSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Logo Avatar / Icon Image</label>
          <div className="flex gap-2 items-center">
            <img
              src={nav.logoImageUrl}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
            />
            <input
              type="text"
              value={nav.logoImageUrl}
              onChange={(e) => updateNav('logoImageUrl', e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
            <label className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadLogo}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Menu Items */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-100">Navbar Menu Items</h3>
          <button
            onClick={handleAddMenuItem}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>

        <div className="space-y-2">
          {nav.menuItems?.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-white/5 bg-neutral-950 flex items-center gap-3"
            >
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                className="w-1/3 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                placeholder="Label..."
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateMenuItem(item.id, 'href', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                placeholder="#section or https://..."
              />
              <button
                onClick={() => updateMenuItem(item.id, 'isVisible', !item.isVisible)}
                className="p-1 text-neutral-400 hover:text-white"
                title={item.isVisible ? 'Visible' : 'Hidden'}
              >
                {item.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => deleteMenuItem(item.id)}
                className="p-1 text-neutral-500 hover:text-red-400"
                title="Delete Link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Navbar Call-to-Action (CTA) Button</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Button Label</label>
            <input
              type="text"
              value={nav.ctaButton?.label || 'Hire Me'}
              onChange={(e) => updateNav('ctaButton', { ...nav.ctaButton, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Link</label>
            <input
              type="text"
              value={nav.ctaButton?.href || '#contact'}
              onChange={(e) => updateNav('ctaButton', { ...nav.ctaButton, href: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Footer Text & Copyright</h3>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Footer Tagline</label>
          <input
            type="text"
            value={nav.footer?.tagline || ''}
            onChange={(e) => updateNav('footer', { ...nav.footer, tagline: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">Copyright Line</label>
          <input
            type="text"
            value={nav.footer?.copyrightText || ''}
            onChange={(e) => updateNav('footer', { ...nav.footer, copyrightText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
          />
        </div>
      </div>
    </div>
  );
};
