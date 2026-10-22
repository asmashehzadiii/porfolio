import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  Film,
  Image,
  RefreshCw,
  FileText,
  Cloud,
  Settings,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';
import {
  getMediaLibrary,
  deleteMediaFile,
  uploadMediaFile,
  getStorageConfig,
  saveLocalCloudStorageConfig,
  getLocalCloudStorageConfig
} from '../../services/api';

interface MediaLibraryTabProps {
  token: string;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({ token }) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [showConfig, setShowConfig] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // Storage Settings form state
  const localConfig = getLocalCloudStorageConfig();
  const [cloudName, setCloudName] = useState(localConfig?.cloudinaryCloudName || '');
  const [uploadPreset, setUploadPreset] = useState(localConfig?.cloudinaryUploadPreset || '');
  const [supabaseUrl, setSupabaseUrl] = useState(localConfig?.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(localConfig?.supabaseAnonKey || '');
  const [supabaseBucket, setSupabaseBucket] = useState(localConfig?.supabaseBucket || 'portfolio-media');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const items = await getMediaLibrary(token);
      setMediaList(items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const cfg = await getStorageConfig();
      setConfigStatus(cfg);
      if (cfg.cloudinary?.cloudName && !cloudName) {
        setCloudName(cfg.cloudinary.cloudName);
      }
      if (cfg.cloudinary?.uploadPreset && !uploadPreset) {
        setUploadPreset(cfg.cloudinary.uploadPreset);
      }
    } catch {}
  };

  useEffect(() => {
    fetchMedia();
    loadConfig();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMediaFile(token, files[i]);
      }
      await fetchMedia();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (confirm(`Delete file "${filename}" from server storage?`)) {
      try {
        await deleteMediaFile(token, filename);
        setMediaList(mediaList.filter(m => m.filename !== filename));
      } catch (err: any) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const copyToClipboard = (url: string) => {
    // If relative URL, make full URL for clipboard sharing
    const fullUrl = url.startsWith('/') && typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSaveStorageConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalCloudStorageConfig({
      provider: cloudName ? 'cloudinary' : supabaseUrl ? 'supabase' : 'server',
      cloudinaryCloudName: cloudName.trim(),
      cloudinaryUploadPreset: uploadPreset.trim(),
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      supabaseBucket: supabaseBucket.trim() || 'portfolio-media'
    });
    setSaveMsg('Cloud storage settings saved! They are now active for video and thumbnail uploads.');
    loadConfig();
    setTimeout(() => setSaveMsg(null), 4000);
  };

  const handleTestCloudinary = async () => {
    if (!cloudName) {
      setTestResult({ success: false, message: 'Please enter your Cloudinary Cloud Name first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // Test Cloudinary ping or unsigned preset
      const testUrl = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;
      // Small 1x1 test gif
      const testBlob = new Blob(
        [new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59])],
        { type: 'image/gif' }
      );
      const fd = new FormData();
      fd.append('file', testBlob, 'ping.gif');
      if (uploadPreset) {
        fd.append('upload_preset', uploadPreset.trim());
      }

      const res = await fetch(testUrl, { method: 'POST', body: fd });
      if (res.ok) {
        const json = await res.json();
        setTestResult({
          success: true,
          message: `Connection successful! Cloudinary cloud "${cloudName}" is connected and ready to accept media uploads directly.`
        });
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error?.message?.includes('upload_preset')) {
          setTestResult({
            success: false,
            message: `Cloud Name "${cloudName}" found, but upload preset "${uploadPreset}" was not found or not unsigned in Cloudinary.`
          });
        } else {
          setTestResult({
            success: false,
            message: `Cloudinary response: ${errJson.error?.message || 'Check Cloud Name or Upload Preset.'}`
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Could not connect to Cloudinary: ' + (err.message || 'Network error')
      });
    } finally {
      setTesting(false);
    }
  };

  const filteredMedia = mediaList.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const activeProvider = configStatus?.cloudinary?.isConfigured || cloudName
    ? 'Cloudinary CDN (Cloud Storage)'
    : configStatus?.supabase?.isConfigured || supabaseUrl
    ? 'Supabase Storage'
    : 'Netlify Blobs / Persistent Server';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            Media Storage & Uploads Library
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Active Provider: <strong className="text-amber-400">{activeProvider}</strong>. All uploads persist permanently and work across all devices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 rounded-xl border border-white/10 hover:border-amber-400/50 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>{showConfig ? 'Hide Cloud Settings' : 'Cloud Storage Settings'}</span>
          </button>

          <button
            onClick={fetchMedia}
            className="p-2.5 rounded-xl border border-white/10 bg-neutral-800 text-neutral-300 hover:text-white"
            title="Refresh library"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <label className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media Files'}</span>
            <input
              type="file"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Cloud Storage Settings Card */}
      {showConfig && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-neutral-900/80 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-neutral-100">Permanent Cloud Storage Configuration</h3>
            </div>
            <span className="text-[11px] text-neutral-400">Netlify-Compatible Storage</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            By default, your uploads are saved permanently to <strong>Netlify Blobs</strong> (on Netlify) or local server disk.
            For handling large video files (up to 100MB+) with global CDN delivery, we also support free <strong>Cloudinary</strong> or <strong>Supabase Storage</strong> directly.
          </p>

          {saveMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveMsg}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveStorageConfig} className="space-y-4">
            {/* Cloudinary Section */}
            <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Cloudinary (Recommended for large videos)
                </span>
                <a
                  href="https://cloudinary.com/users/register_free"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Free Cloudinary Account</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-300 mb-1">Cloud Name</label>
                  <input
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="e.g. dxyz123abc"
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-300 mb-1">
                    Upload Preset (Unsigned or Signed)
                  </label>
                  <input
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    placeholder="e.g. portfolio_preset or the_editor_uploads"
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={testing || !cloudName}
                  onClick={handleTestCloudinary}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing...' : 'Test Cloudinary Connection'}</span>
                </button>
              </div>
            </div>

            {/* Supabase Section */}
            <div className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-3">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Supabase Storage (Alternative)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-300 mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-300 mb-1">Anon / Public Key</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGci..."
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-300 mb-1">Storage Bucket Name</label>
                  <input
                    type="text"
                    value={supabaseBucket}
                    onChange={(e) => setSupabaseBucket(e.target.value)}
                    placeholder="portfolio-media"
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  You can also add <code className="text-amber-300">CLOUDINARY_CLOUD_NAME</code> and <code className="text-amber-300">CLOUDINARY_UPLOAD_PRESET</code> in your Netlify Environment Variables.
                </span>
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                Save Storage Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'image', 'video'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              filterType === type
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-white/10 bg-neutral-950">
          <HardDrive className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-xs text-neutral-400">No media files found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((media) => (
            <div
              key={media.filename}
              className="p-3 rounded-2xl border border-white/10 bg-neutral-950 flex flex-col justify-between group hover:border-amber-400/50 transition-all"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center border border-white/5">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.filename}
                    className="w-full h-full object-cover"
                  />
                ) : media.type === 'video' ? (
                  <div className="flex flex-col items-center gap-1 text-amber-400">
                    <Film className="w-8 h-8" />
                    <span className="text-[10px] font-bold text-neutral-300">Video MP4</span>
                  </div>
                ) : (
                  <FileText className="w-8 h-8 text-neutral-400" />
                )}
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-bold text-neutral-200 truncate" title={media.filename}>
                  {media.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500">
                  <span>{(media.size / 1024 / 1024).toFixed(1)} MB</span>
                  <span className="capitalize">{media.type}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => copyToClipboard(media.url)}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] font-semibold text-neutral-300 hover:text-amber-400 flex items-center gap-1"
                >
                  {copiedUrl === media.url ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-amber-400" />
                  )}
                  <span>{copiedUrl === media.url ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  onClick={() => handleDelete(media.filename)}
                  className="p-1 text-neutral-500 hover:text-red-400"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
