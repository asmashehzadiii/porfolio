import React, { useState } from 'react';
import { ContactSettings, SectionColors, SectionAnimationSettings, SectionHeadings } from '../types';
import {
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Send,
  MapPin,
  CheckCircle,
  Copy,
  Youtube,
  Instagram,
  Linkedin,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ContactProps {
  contact: ContactSettings;
  colors?: SectionColors;
  animation?: SectionAnimationSettings;
  contactHeadings?: SectionHeadings['contact'];
}

export const ContactSection: React.FC<ContactProps> = ({ contact, colors, animation, contactHeadings }) => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Short-Form Reels',
    budget: '$500 - $1,500',
    message: ''
  });

  const copyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  // Build WhatsApp URL with pre-filled message
  const cleanPhone = contact.whatsappNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(contact.whatsappMessage || 'Hi Asma! I want to work with you.');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

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
      id="contact"
      className={`py-20 md:py-28 px-4 md:px-8 relative overflow-hidden transition-colors ${animClass}`}
      style={{
        backgroundColor: colors?.bg || 'var(--sec-contact-bg, var(--color-site-bg, #0A0A0A))',
        color: colors?.text || 'var(--sec-contact-text, var(--color-site-text, #F3F4F6))',
        animationDuration: animation?.enabled ? `${animation.duration || 0.7}s` : undefined,
        animationDelay: animation?.enabled ? `${animation.delay || 0}s` : undefined
      }}
    >
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{contactHeadings?.badge || "Let's Create Together"}</span>
            </div>

            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: colors?.heading || 'var(--sec-contact-heading, var(--color-site-heading, #FFFFFF))' }}
            >
              {contactHeadings?.title || 'Ready to elevate your visual content?'}
            </h2>

            <p
              className="text-base leading-relaxed"
              style={{ color: colors?.muted || colors?.text || 'var(--sec-contact-muted, var(--color-site-muted, #9CA3AF))' }}
            >
              {contactHeadings?.subtitle || 'Have an upcoming video project, YouTube channel launch, or branding redesign? Send a message directly or schedule a call.'}
            </p>

            {/* Status pill */}
            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{
                backgroundColor: colors?.cardBg || 'var(--sec-contact-card, rgba(6, 78, 59, 0.2))',
                borderColor: colors?.border || 'rgba(16, 185, 129, 0.3)'
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Current Availability</p>
                <p className="text-sm font-semibold" style={{ color: colors?.text || '#E5E7EB' }}>
                  {contact.workStatus || 'Available for freelance & full-time'}
                </p>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="space-y-3 pt-2">
              {/* WhatsApp direct */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-between shadow-lg transition-all hover:scale-102 active:scale-98 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-emerald-100 font-medium">Quickest Response</div>
                    <div className="text-base font-bold">Chat on WhatsApp</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Email direct */}
              <div
                className="p-4 rounded-2xl border flex items-center justify-between"
                style={{
                  backgroundColor: colors?.cardBg || 'var(--sec-contact-card, var(--color-site-card, #141414))',
                  borderColor: colors?.border || 'var(--sec-contact-border, var(--color-site-border, #262626))'
                }}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs" style={{ color: colors?.muted || 'var(--sec-contact-muted, #9CA3AF)' }}>
                      Direct Email
                    </div>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm md:text-base font-bold hover:text-amber-400 transition-colors truncate block"
                      style={{ color: colors?.heading || '#FFFFFF' }}
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={copyEmail}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  style={{
                    borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                    color: colors?.text || '#E5E7EB'
                  }}
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Location info */}
              {contact.location && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs" style={{ color: colors?.muted || '#9CA3AF' }}>
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{contact.location}</span>
                </div>
              )}
            </div>

            {/* Social channels */}
            <div
              className="pt-4 border-t"
              style={{ borderColor: colors?.border || 'rgba(255,255,255,0.1)' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: colors?.muted || 'var(--sec-contact-muted, #9CA3AF)' }}
              >
                Follow My Work
              </p>
              <div className="flex flex-wrap gap-2">
                {contact.socialLinks.filter(s => s.isVisible).map((soc, i) => (
                  <a
                    key={i}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5"
                    style={{
                      backgroundColor: colors?.cardBg || 'var(--sec-contact-card, rgba(20,20,20,0.6))',
                      borderColor: colors?.border || 'rgba(255,255,255,0.1)',
                      color: colors?.text || '#E5E7EB'
                    }}
                  >
                    <span>{soc.label}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div
              className="p-6 md:p-10 rounded-3xl border backdrop-blur-xl shadow-2xl"
              style={{
                backgroundColor: colors?.cardBg || 'var(--sec-contact-card, var(--color-site-card, #141414))',
                borderColor: colors?.border || 'var(--sec-contact-border, var(--color-site-border, #262626))'
              }}
            >
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: colors?.heading || 'var(--sec-contact-heading, var(--color-site-heading, #FFFFFF))' }}
              >
                Send a Project Inquiry
              </h3>
              <p
                className="text-xs md:text-sm mb-8"
                style={{ color: colors?.muted || colors?.text || 'var(--sec-contact-muted, var(--color-site-muted, #9CA3AF))' }}
              >
                Tell me about your project, timeline, and goals. I respond within 12 hours.
              </p>

              {formSubmitted ? (
                <div className="p-8 text-center rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                  <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
                  <h4 className="text-xl font-bold text-neutral-100">Thank you for your message!</h4>
                  <p className="text-sm text-neutral-300 max-w-md mx-auto">
                    Your inquiry has been received. You can also message me immediately on WhatsApp for an instant response.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" /> Open WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: colors?.text || '#E5E7EB' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none"
                        style={{
                          backgroundColor: colors?.bg || 'rgba(0,0,0,0.4)',
                          borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                          color: colors?.text || '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: colors?.text || '#E5E7EB' }}>
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none"
                        style={{
                          backgroundColor: colors?.bg || 'rgba(0,0,0,0.4)',
                          borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                          color: colors?.text || '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: colors?.text || '#E5E7EB' }}>
                        Project Category
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={{
                          backgroundColor: colors?.bg || 'rgba(0,0,0,0.4)',
                          borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                          color: colors?.text || '#FFFFFF'
                        }}
                      >
                        <option value="Short-Form Reels">Viral Short-Form Reels / TikToks</option>
                        <option value="YouTube Long-Form">YouTube Long-Form & Documentary</option>
                        <option value="Talking Head">Talking Head & Podcasts</option>
                        <option value="Commercial Ad">Commercial Video Ad & Motion Graphics</option>
                        <option value="Thumbnails & Design">Thumbnails & Graphic Design</option>
                        <option value="Monthly Retainer">Monthly Video Retainer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: colors?.text || '#E5E7EB' }}>
                        Estimated Budget
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                        style={{
                          backgroundColor: colors?.bg || 'rgba(0,0,0,0.4)',
                          borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                          color: colors?.text || '#FFFFFF'
                        }}
                      >
                        <option value="Under $500">Under $500</option>
                        <option value="$500 - $1,500">$500 - $1,500</option>
                        <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                        <option value="$3,000+">$3,000+ (Ongoing Retainer)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: colors?.text || '#E5E7EB' }}>
                      Project Details & Vision *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share video links, raw footage details, expected delivery date, or references..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border text-sm resize-none transition-colors outline-none"
                      style={{
                        backgroundColor: colors?.bg || 'rgba(0,0,0,0.4)',
                        borderColor: colors?.border || 'rgba(255,255,255,0.15)',
                        color: colors?.text || '#FFFFFF'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-101 active:scale-99 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: colors?.buttonBg || 'var(--sec-contact-btn-bg, var(--color-site-btn-bg, #F59E0B))',
                      color: colors?.buttonText || 'var(--sec-contact-btn-text, var(--color-site-btn-text, #0A0A0A))'
                    }}
                  >
                    <span>Send Project Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
