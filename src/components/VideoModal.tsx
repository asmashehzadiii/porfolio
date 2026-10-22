import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Calendar, Eye, Tag, Film, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { parseVideoUrl } from '../utils/videoUtils';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (video) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setLoadError(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  const parsed = parseVideoUrl(video.videoUrl, video.videoType);
  const isVertical = video.aspectRatio === '9:16';
  const effectiveThumbnail = video.thumbnailUrl || parsed.defaultThumbnail || '';

  const isEmbedService = parsed.type === 'youtube' || parsed.type === 'vimeo' || parsed.type === 'loom' || parsed.type === 'drive';
  const isDirectVideo =
    !isEmbedService &&
    (parsed.type === 'direct_url' ||
      parsed.type === 'upload' ||
      video.videoType === 'upload' ||
      video.videoUrl.endsWith('.mp4') ||
      video.videoUrl.endsWith('.webm') ||
      video.videoUrl.includes('cloudinary.com') ||
      video.videoUrl.includes('/api/media-raw/'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full ${
          isVertical ? 'max-w-md' : 'max-w-5xl'
        } max-h-[92vh] flex flex-col rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-neutral-900/80">
          <div className="flex items-center gap-2.5 truncate">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {video.category}
            </span>
            <h3 className="text-base font-semibold text-neutral-100 truncate">{video.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div
          className={`w-full bg-black relative flex items-center justify-center ${
            isVertical ? 'aspect-[9/16] max-h-[60vh]' : 'aspect-video'
          }`}
        >
          {loadError ? (
            <div className="p-8 text-center space-y-3 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-bold text-neutral-100">Unable to stream video</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{loadError}</p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Open Video URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setLoadError(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : !parsed.isValid && parsed.type === 'unsupported' ? (
            <div className="p-8 text-center space-y-3 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-bold text-neutral-100">Unsupported Video URL</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {parsed.errorMessage ||
                  'This link points to a webpage rather than a supported video stream. Supported sources: YouTube, Vimeo, Loom, or direct video files (.mp4/.webm).'}
              </p>
              <div className="pt-2">
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold"
                >
                  <span>Open Page in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : isDirectVideo ? (
            <video
              key={video.videoUrl}
              src={parsed.embedUrl || video.videoUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={effectiveThumbnail}
              className="w-full h-full object-contain"
              onError={() => {
                setLoadError(
                  'The direct video file could not be loaded or is in an unsupported format. Please verify the URL or format.'
                );
              }}
            >
              <source src={parsed.embedUrl || video.videoUrl} type="video/mp4" />
              <source src={parsed.embedUrl || video.videoUrl} type="video/webm" />
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <iframe
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Meta & Description */}
        <div className="p-5 overflow-y-auto max-h-48 text-sm space-y-3 bg-neutral-950/95">
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
            {video.clientName && (
              <span className="flex items-center gap-1 text-neutral-300">
                <Film className="w-3.5 h-3.5 text-amber-400" /> Client: <strong>{video.clientName}</strong>
              </span>
            )}
            {video.viewsCount && (
              <span className="flex items-center gap-1 text-neutral-300">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> {video.viewsCount}
              </span>
            )}
            {video.duration && <span>Duration: {video.duration}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {video.createdAt?.slice(0, 10)}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-white/5 text-[10px] text-neutral-400 font-medium">
              Source: {parsed.label}
            </span>
          </div>

          <p className="text-neutral-300 text-sm leading-relaxed">{video.description}</p>

          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {video.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-neutral-900 text-xs text-neutral-400 border border-neutral-800 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-amber-400/70" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
