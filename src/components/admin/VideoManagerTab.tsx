import React, { useState } from 'react';
import { WebsiteData, VideoItem, VideoType, VideoAspectRatio, PublishStatus } from '../../types';
import {
  Film,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Play,
  Copy,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Smartphone,
  Monitor,
  Tag,
  Clock,
  CheckCircle2,
  FolderPlus,
  AlertCircle,
  ExternalLink,
  Check
} from 'lucide-react';
import { uploadMediaFile, updateWebsiteData } from '../../services/api';
import { parseVideoUrl } from '../../utils/videoUtils';
import { VideoModal } from '../VideoModal';

interface VideoManagerTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const VideoManagerTab: React.FC<VideoManagerTabProps> = ({ data, onChange, token }) => {
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showHeadingsEditor, setShowHeadingsEditor] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const videos = data.videos || [];
  const categories = data.videoCategories || ['All', 'Talking Head', 'Short-Form Reels', 'YouTube Long-Form'];
  const videoHeadings = data.sectionHeadings?.videos || {};

  const updateVideoHeadings = (field: string, value: string) => {
    const updatedData = {
      ...data,
      sectionHeadings: {
        ...data.sectionHeadings,
        videos: {
          ...(data.sectionHeadings?.videos || {}),
          [field]: value
        }
      }
    };
    onChange(updatedData);
  };

  const updateVideos = async (newVideos: VideoItem[]) => {
    const updatedData = {
      ...data,
      videos: newVideos
    };
    onChange(updatedData);
    if (token) {
      await updateWebsiteData(token, updatedData);
    }
  };

  const handleStartNewVideo = () => {
    const fresh: VideoItem = {
      id: `vid-${Date.now()}`,
      title: 'New Video Project',
      description: 'Dynamic pacing, custom sound design, and retention hooks.',
      category: categories[1] || 'Talking Head',
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: '',
      aspectRatio: '16:9',
      duration: '02:30',
      clientName: '',
      featured: true,
      order: videos.length + 1,
      status: 'published',
      viewsCount: '100K Views',
      tags: ['Editing', 'Color Grade', 'SFX'],
      createdAt: new Date().toISOString()
    };
    setEditingVideo(fresh);
    setIsCreating(true);
  };

  const handleSaveVideo = async (videoToSave: VideoItem) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      // Auto-detect and normalize video type and thumbnail
      const parsed = parseVideoUrl(videoToSave.videoUrl, videoToSave.videoType);
      let normalizedVideo: VideoItem = { ...videoToSave };
      if (parsed.type === 'youtube' || parsed.type === 'vimeo' || parsed.type === 'loom') {
        normalizedVideo.videoType = parsed.type;
        if (!normalizedVideo.thumbnailUrl && parsed.defaultThumbnail) {
          normalizedVideo.thumbnailUrl = parsed.defaultThumbnail;
        }
      } else if (parsed.type === 'drive') {
        normalizedVideo.videoType = 'direct_url';
      }

      let updatedList: VideoItem[];
      if (isCreating) {
        updatedList = [normalizedVideo, ...videos];
      } else {
        updatedList = videos.map(v => (v.id === normalizedVideo.id ? normalizedVideo : v));
      }
      updatedList = updatedList.map((v, idx) => ({ ...v, order: idx + 1 }));
      await updateVideos(updatedList);
      setEditingVideo(null);
      setIsCreating(false);
      setSaveStatus('Video project saved and published to live website!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus('Error saving video: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video project?')) {
      const filtered = videos.filter(v => v.id !== id).map((v, idx) => ({ ...v, order: idx + 1 }));
      await updateVideos(filtered);
      if (editingVideo?.id === id) setEditingVideo(null);
      setSaveStatus('Video deleted successfully from live website.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDuplicateVideo = async (vid: VideoItem) => {
    const clone: VideoItem = {
      ...vid,
      id: `vid-${Date.now()}`,
      title: `${vid.title} (Copy)`,
      order: videos.length + 1
    };
    await updateVideos([clone, ...videos]);
    setSaveStatus('Video duplicated successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const moveVideo = async (index: number, direction: 'up' | 'down') => {
    const list = [...videos];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((v, idx) => ({ ...v, order: idx + 1 }));
    await updateVideos(reordered);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    if (!categories.includes(cat)) {
      onChange({
        ...data,
        videoCategories: [...categories, cat]
      });
    }
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'All') return;
    if (confirm(`Delete category "${cat}"? Videos in this category won't be deleted.`)) {
      onChange({
        ...data,
        videoCategories: categories.filter(c => c !== cat)
      });
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file || !editingVideo) return;
    setUploadingFile(targetField);
    try {
      const res = await uploadMediaFile(token, file);
      let updatedVideo: VideoItem;
      if (targetField === 'video') {
        updatedVideo = {
          ...editingVideo,
          videoUrl: res.url,
          videoType: 'upload'
        };
      } else {
        updatedVideo = {
          ...editingVideo,
          thumbnailUrl: res.url
        };
      }
      setEditingVideo(updatedVideo);

      // If editing an existing video project, auto-save immediately to database so changes are live
      if (!isCreating) {
        const updatedList = videos.map(v => (v.id === updatedVideo.id ? updatedVideo : v));
        await updateVideos(updatedList);
        setSaveStatus(targetField === 'video' ? 'Video uploaded and saved to live website!' : 'Custom thumbnail uploaded and saved to live website!');
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingFile(null);
      e.target.value = '';
    }
  };

  const handleQuickThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, videoItem: VideoItem) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMediaFile(token, file);
      const updated = { ...videoItem, thumbnailUrl: res.url };
      const updatedList = videos.map(v => (v.id === updated.id ? updated : v));
      await updateVideos(updatedList);
      setSaveStatus(`Thumbnail updated and saved for "${videoItem.title}"!`);
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      alert('Thumbnail upload failed: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const filteredList = filterCategory === 'All'
    ? videos
    : videos.filter(v => v.category === filterCategory);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            Video Portfolio Manager
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Upload videos directly from your computer, link YouTube/Vimeo, upload custom thumbnails, configure 16:9 or 9:16 reels, and publish.
          </p>
        </div>
        <button
          onClick={handleStartNewVideo}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video Project</span>
        </button>
      </div>

      {/* Save Notification Banner */}
      {saveStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
            saveStatus.includes('Error')
              ? 'bg-red-950/40 border-red-500/30 text-red-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {saveStatus.includes('Error') ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 16:9 Showcase & Video Headings Editor */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-neutral-900/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-neutral-100">16:9 Showcase Title & Video Headings</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              Editable
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHeadingsEditor(!showHeadingsEditor)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold self-start sm:self-auto"
          >
            {showHeadingsEditor ? 'Hide Title Controls ▲' : 'Edit Section Titles & 16:9 Text ▼'}
          </button>
        </div>

        {showHeadingsEditor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10 animate-in fade-in">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                16:9 Cinematic Productions Title (Displayed directly above the 16:9 continuous video slider)
              </label>
              <input
                type="text"
                value={videoHeadings.longFormTitle ?? 'Long-Form & Cinematic Productions (16:9)'}
                onChange={(e) => updateVideoHeadings('longFormTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-neutral-950 text-neutral-100 text-sm focus:border-amber-400 focus:outline-none font-bold"
                placeholder="Long-Form & Cinematic Productions (16:9)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                16:9 Optional Subtitle (Keep empty if you only want the title)
              </label>
              <input
                type="text"
                value={videoHeadings.longFormSubtitle ?? ''}
                onChange={(e) => updateVideoHeadings('longFormSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Leave blank for no subtitle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                9:16 Vertical Reels Slider Title
              </label>
              <input
                type="text"
                value={videoHeadings.reelsTitle ?? 'Viral Short-Form Reels & TikToks (9:16)'}
                onChange={(e) => updateVideoHeadings('reelsTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Viral Short-Form Reels & TikToks (9:16)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Main Video Section Title
              </label>
              <input
                type="text"
                value={videoHeadings.title ?? 'Selected Video Projects'}
                onChange={(e) => updateVideoHeadings('title', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Selected Video Projects"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Section Badge Pill Text
              </label>
              <input
                type="text"
                value={videoHeadings.badge ?? 'Video Editing Showcase'}
                onChange={(e) => updateVideoHeadings('badge', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Video Editing Showcase"
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center group">
                <button
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterCategory === cat
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
                {cat !== 'All' && (
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 px-1 transition-opacity text-xs"
                    title={`Delete category ${cat}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category..."
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center gap-1"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Videos Table / Grid */}
      <div className="space-y-3">
        {filteredList.map((video, idx) => (
          <div
            key={video.id}
            className="p-4 rounded-2xl border border-white/10 bg-neutral-950/90 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Thumbnail + info */}
            <div className="flex items-center gap-4">
              <div
                className="relative w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 group cursor-pointer"
                onClick={() => setPreviewVideo(video)}
              >
                <img
                  src={
                    video.thumbnailUrl ||
                    parseVideoUrl(video.videoUrl, video.videoType).defaultThumbnail ||
                    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    {video.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      video.aspectRatio === '9:16'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {video.aspectRatio === '9:16' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                    {video.aspectRatio}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      video.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {video.status}
                  </span>
                  {video.featured && (
                    <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                      ★ Featured
                    </span>
                  )}
                </div>

                <h3 className="text-sm md:text-base font-bold text-neutral-100">{video.title}</h3>

                <div className="text-xs text-neutral-400 flex items-center gap-3">
                  {video.clientName && (
                    <span>
                      Client: <strong>{video.clientName}</strong>
                    </span>
                  )}
                  {video.duration && <span>{video.duration}</span>}
                  {video.viewsCount && <span className="text-amber-400">{video.viewsCount}</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                onClick={() => setPreviewVideo(video)}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 bg-neutral-900 text-xs text-neutral-300 hover:text-white flex items-center gap-1"
                title="Preview Video Player"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Play</span>
              </button>

              <label
                className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 bg-neutral-900 text-xs text-neutral-300 hover:text-amber-400 cursor-pointer flex items-center gap-1 transition-colors"
                title="Upload or Change Custom Thumbnail"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Thumbnail</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleQuickThumbnailUpload(e, video)}
                />
              </label>

              <button
                onClick={() => moveVideo(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
                title="Move Up"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveVideo(idx, 'down')}
                disabled={idx === videos.length - 1}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
                title="Move Down"
              >
                <MoveDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDuplicateVideo(video)}
                className="p-1.5 text-neutral-400 hover:text-white"
                title="Duplicate Video"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setEditingVideo({ ...video });
                  setIsCreating(false);
                }}
                className="p-1.5 text-amber-400 hover:text-amber-300"
                title="Edit Video"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="p-1.5 text-neutral-500 hover:text-red-400"
                title="Delete Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/80">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>{isCreating ? 'Add New Portfolio Video' : 'Edit Video Project'}</span>
              </h3>
              <button onClick={() => setEditingVideo(null)} className="text-xs text-neutral-400 hover:text-white">
                Cancel
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-sm text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Video Source Type */}
              <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-300">Video Source / Hosting</label>
                  <span className="text-[11px] text-amber-400">Direct file upload or embed link</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['upload', 'youtube', 'vimeo', 'direct_url'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditingVideo({ ...editingVideo, videoType: type })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                        editingVideo.videoType === type
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-950 text-neutral-400 border border-white/5'
                      }`}
                    >
                      {type === 'upload' ? 'Upload from Computer (.mp4)' : type}
                    </button>
                  ))}
                </div>

                {/* Upload from Computer Box */}
                {editingVideo.videoType === 'upload' && (
                  <div className="pt-2 space-y-2">
                    <label className="w-full p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer flex flex-col items-center justify-center gap-2 text-center transition-colors">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <div className="text-xs font-bold text-amber-300">
                        {uploadingFile === 'video'
                          ? 'Uploading Video to Cloud Storage...'
                          : 'Click to Select & Upload Video File (.mp4, .webm, .mov)'}
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Uploads to permanent cloud storage. Will be saved to database and live website.
                      </p>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/m4v"
                        disabled={uploadingFile === 'video'}
                        className="hidden"
                        onChange={(e) => handleDirectUpload(e, 'video')}
                      />
                    </label>

                    {editingVideo.videoUrl && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Active Permanent Video: {editingVideo.videoUrl}</span>
                        </span>
                        <a
                          href={editingVideo.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline shrink-0 flex items-center gap-1 font-bold text-[11px] ml-2"
                        >
                          <span>Test</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Video URL Input */}
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {editingVideo.videoType === 'upload'
                      ? 'Video Storage URL'
                      : 'Video Link (YouTube, Vimeo, Loom, or direct .mp4/.webm URL)'}
                  </label>
                  <input
                    type="text"
                    value={editingVideo.videoUrl}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      const parsed = parseVideoUrl(newUrl);
                      let updated: VideoItem = { ...editingVideo, videoUrl: newUrl };
                      if (parsed.type === 'youtube' || parsed.type === 'vimeo' || parsed.type === 'loom' || parsed.type === 'drive') {
                        updated.videoType = parsed.type;
                        if (!updated.thumbnailUrl && parsed.defaultThumbnail) {
                          updated.thumbnailUrl = parsed.defaultThumbnail;
                        }
                      }
                      setEditingVideo(updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                    placeholder="https://www.youtube.com/watch?v=... or https://res.cloudinary.com/.../video.mp4"
                  />
                </div>

                {/* Live Real-Time Link Detection & Error Display */}
                {editingVideo.videoUrl && (
                  <div className="pt-1">
                    {(() => {
                      const parsed = parseVideoUrl(editingVideo.videoUrl, editingVideo.videoType);
                      if (parsed.isValid) {
                        return (
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Valid {parsed.label} source detected</span>
                            </span>
                            {parsed.defaultThumbnail && !editingVideo.thumbnailUrl && (
                              <button
                                type="button"
                                onClick={() => setEditingVideo({ ...editingVideo, thumbnailUrl: parsed.defaultThumbnail! })}
                                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Auto-Fill Thumbnail</span>
                              </button>
                            )}
                          </div>
                        );
                      } else if (parsed.type === 'unsupported') {
                        return (
                          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">{parsed.errorMessage}</p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                Please provide an embeddable YouTube, Vimeo, or direct video file (.mp4).
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Custom Thumbnail Upload & Preview */}
              <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-300">Custom Thumbnail Image</label>
                  <span className="text-[11px] text-neutral-400">Uploaded thumbnails take priority over auto-generated</span>
                </div>

                {/* Thumbnail Preview Box if set */}
                {editingVideo.thumbnailUrl && (
                  <div className="relative aspect-video max-h-40 rounded-xl overflow-hidden border border-white/15 bg-neutral-950 group">
                    <img
                      src={editingVideo.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Custom Thumbnail Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingVideo({ ...editingVideo, thumbnailUrl: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-950/90 text-neutral-400 hover:text-red-400 text-xs border border-white/10 shadow-md"
                      title="Clear Custom Thumbnail"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingVideo.thumbnailUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                    placeholder="Thumbnail URL or upload image from computer..."
                  />
                  <label className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingFile === 'thumbnail' ? 'Uploading...' : 'Upload from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingFile === 'thumbnail'}
                      className="hidden"
                      onChange={(e) => handleDirectUpload(e, 'thumbnail')}
                    />
                  </label>
                </div>
              </div>

              {/* Category & Aspect Ratio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Format Aspect Ratio</label>
                  <select
                    value={editingVideo.aspectRatio}
                    onChange={(e) => setEditingVideo({ ...editingVideo, aspectRatio: e.target.value as VideoAspectRatio })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  >
                    <option value="16:9">16:9 Long-Form Widescreen</option>
                    <option value="9:16">9:16 Short-Form Vertical Reel</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>
              </div>

              {/* Client, Duration, Views */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editingVideo.clientName || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                    placeholder="e.g. Alex Thorne"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingVideo.duration || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                    placeholder="e.g. 03:45"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Views Count Badge</label>
                  <input
                    type="text"
                    value={editingVideo.viewsCount || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, viewsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                    placeholder="e.g. 1.2M Views"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Project Description</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 resize-none"
                />
              </div>

              {/* Status & Featured */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-neutral-300">Publishing Status:</label>
                  <select
                    value={editingVideo.status}
                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as PublishStatus })}
                    className="px-2.5 py-1 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVideo.featured}
                    onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Show as Featured</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-neutral-900/80">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveVideo(editingVideo)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {isSaving ? (
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? 'Saving & Publishing...' : 'Save & Publish Video'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && <VideoModal video={previewVideo} onClose={() => setPreviewVideo(null)} />}
    </div>
  );
};
