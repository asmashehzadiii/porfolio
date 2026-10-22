import React, { useState } from 'react';
import { WebsiteData, SeoSettings } from '../../types';
import { Globe, Download, Upload, RefreshCw, Key, Shield, CheckCircle2, AlertTriangle, AlertCircle, KeyRound, Info } from 'lucide-react';
import { resetDemoData, restoreDatabase, changeAdminCredentials, getActiveCredentialsInfo } from '../../services/api';

interface SeoBackupTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const SeoBackupTab: React.FC<SeoBackupTabProps> = ({ data, onChange, token }) => {
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: ''
  });
  const [credMsg, setCredMsg] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);
  const credsInfo = getActiveCredentialsInfo();
  const [activeUsername, setActiveUsername] = useState<string>(() => credsInfo.username || 'admin');

  const seo = data.seo;

  const updateSeo = (field: keyof SeoSettings, value: any) => {
    onChange({
      ...data,
      seo: { ...data.seo, [field]: value }
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-editor-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.hero || !parsed.videos) {
          throw new Error('Invalid JSON structure: missing hero or videos');
        }
        const restored = await restoreDatabase(token, parsed);
        onChange(restored);
        setSuccessMsg('Portfolio database successfully restored from JSON backup!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err: any) {
        alert('Restore error: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reset all portfolio data back to the original demo state? Any custom items will be overwritten.')) {
      setResetting(true);
      try {
        const restored = await resetDemoData(token);
        onChange(restored);
        setSuccessMsg('Portfolio reset to official demo data successfully!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } catch (err: any) {
        alert('Reset failed: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);
    setCredError(null);
    try {
      const res = await changeAdminCredentials(token, passwordState);
      if (passwordState.newUsername?.trim()) {
        setActiveUsername(passwordState.newUsername.trim());
      }
      setCredMsg(res.message || 'Admin credentials updated and saved successfully! The previous credentials will no longer work.');
      setPasswordState({ currentPassword: '', newUsername: '', newPassword: '' });
      setTimeout(() => setCredMsg(null), 6000);
    } catch (err: any) {
      setCredError(err.message || 'Failed to update credentials. Please check your current password.');
      setTimeout(() => setCredError(null), 6000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          SEO, Security & Data Backup
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Search engine metadata, social sharing cards, JSON backup and restore, and admin login security.
        </p>
      </div>

      {/* SEO Settings */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Search Engine Optimization (SEO)</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Website Meta Title (Browser Tab)
            </label>
            <input
              type="text"
              value={seo.metaTitle}
              onChange={(e) => updateSeo('metaTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Meta Description (Google Search Snippet)
            </label>
            <textarea
              rows={2}
              value={seo.metaDescription}
              onChange={(e) => updateSeo('metaDescription', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                OpenGraph Share Title
              </label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => updateSeo('ogTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Social Share Image (OG Image)
              </label>
              <input
                type="text"
                value={seo.ogImage}
                onChange={(e) => updateSeo('ogImage', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <h3 className="text-base font-bold text-neutral-100">Database Backup & Disaster Recovery</h3>
        <p className="text-xs text-neutral-400">
          Export your complete website content as a standalone JSON backup file. You can restore this anytime on any device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download Full JSON Backup</span>
          </button>

          <label className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-amber-400/50 bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-xs flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Restore From Backup JSON</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
            />
          </label>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 font-semibold text-xs flex items-center gap-2 ml-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>

      {/* Admin Security Settings */}
      <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Update Admin Credentials
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Change your admin username and password. Updated credentials take effect immediately and disable previous credentials.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-xs flex items-center gap-2 text-neutral-300">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Username: <strong className="text-amber-300 font-mono">{activeUsername}</strong></span>
          </div>
        </div>

        {credError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{credError}</span>
          </div>
        )}

        {credMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{credMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangeCredentials} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passwordState.currentPassword}
              onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">New Username (Optional)</label>
            <input
              type="text"
              value={passwordState.newUsername}
              onChange={(e) => setPasswordState({ ...passwordState, newUsername: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
              placeholder="e.g. asma or admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">New Password (min 6 chars)</label>
            <input
              type="password"
              value={passwordState.newPassword}
              onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100 focus:border-amber-400 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="md:col-span-3 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Save & Update Credentials</span>
            </button>

            <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>For Netlify deployments, you can also set <code className="text-amber-300 font-mono text-[10px]">ADMIN_USERNAME</code> and <code className="text-amber-300 font-mono text-[10px]">ADMIN_PASSWORD</code> in Netlify Environment Variables.</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
