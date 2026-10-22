import React from 'react';
import { WebsiteData, ContactSettings } from '../../types';
import { Phone, MessageCircle, Mail, MapPin, Globe, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface ContactSettingsTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
}

export const ContactSettingsTab: React.FC<ContactSettingsTabProps> = ({ data, onChange }) => {
  const contact = data.contact;

  const updateContact = (field: keyof ContactSettings, value: any) => {
    onChange({
      ...data,
      contact: { ...data.contact, [field]: value }
    });
  };

  const handleAddSocial = () => {
    const newSocial = {
      platform: 'youtube' as const,
      url: 'https://',
      label: 'New Platform',
      isVisible: true
    };
    updateContact('socialLinks', [...contact.socialLinks, newSocial]);
  };

  const updateSocial = (index: number, field: string, value: any) => {
    const list = [...contact.socialLinks];
    list[index] = { ...list[index], [field]: value };
    updateContact('socialLinks', list);
  };

  const deleteSocial = (index: number) => {
    updateContact('socialLinks', contact.socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Phone className="w-5 h-5 text-amber-400" />
          Contact & Social Channels Settings
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Configure direct WhatsApp button, email, current client availability status, and social profiles.
        </p>
      </div>

      {/* Direct Contact Details */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">WhatsApp & Direct Communication</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              WhatsApp Phone Number (with Country Code)
            </label>
            <input
              type="text"
              value={contact.whatsappNumber}
              onChange={(e) => updateContact('whatsappNumber', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              placeholder="+92 300 0000000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Direct Contact Email
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              placeholder="asmashehzadi200@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Location / Studio Base
            </label>
            <input
              type="text"
              value={contact.location}
              onChange={(e) => updateContact('location', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              placeholder="Pakistan (Serving Worldwide)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Client Availability Status
            </label>
            <input
              type="text"
              value={contact.workStatus}
              onChange={(e) => updateContact('workStatus', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              placeholder="Available for freelance & full-time"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1">
            Pre-Filled WhatsApp Message
          </label>
          <textarea
            rows={2}
            value={contact.whatsappMessage}
            onChange={(e) => updateContact('whatsappMessage', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            placeholder="Hi Asma! I want to discuss a video project..."
          />
        </div>
      </div>

      {/* Social Profiles */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-100">Social Media & Freelance Platforms</h3>
          <button
            onClick={handleAddSocial}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Social Link
          </button>
        </div>

        <div className="space-y-2">
          {contact.socialLinks.map((soc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-white/5 bg-neutral-950 flex items-center gap-3"
            >
              <input
                type="text"
                value={soc.label}
                onChange={(e) => updateSocial(idx, 'label', e.target.value)}
                className="w-1/4 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                placeholder="Platform name..."
              />
              <input
                type="text"
                value={soc.url}
                onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                placeholder="https://..."
              />
              <button
                onClick={() => updateSocial(idx, 'isVisible', !soc.isVisible)}
                className="p-1 text-neutral-400 hover:text-white"
                title={soc.isVisible ? 'Visible' : 'Hidden'}
              >
                {soc.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => deleteSocial(idx)}
                className="p-1 text-neutral-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
