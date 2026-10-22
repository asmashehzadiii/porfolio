/**
 * Video Source Detection and Embed Utilities
 * Supports: YouTube, Vimeo, Loom, Google Drive, Direct Video URLs (.mp4, .webm, .mov), Cloudinary, Supabase
 */

export interface ParsedVideoInfo {
  type: 'youtube' | 'vimeo' | 'loom' | 'drive' | 'direct_url' | 'upload' | 'unsupported' | 'invalid';
  videoId?: string;
  embedUrl: string;
  directUrl?: string;
  defaultThumbnail?: string;
  isValid: boolean;
  label: string;
  errorMessage?: string;
}

export function parseVideoUrl(rawUrl: string, explicitType?: string): ParsedVideoInfo {
  const url = (rawUrl || '').trim();

  if (!url) {
    return {
      type: 'invalid',
      embedUrl: '',
      isValid: false,
      label: 'Empty URL',
      errorMessage: 'Please provide a video URL or upload a file.'
    };
  }

  // 1. Check for YouTube (standard, short URL, shorts, embed, mobile)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`,
      defaultThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
      label: 'YouTube'
    };
  }

  // 2. Check for Vimeo
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|))(\d+)/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1`,
      isValid: true,
      label: 'Vimeo'
    };
  }

  // 3. Check for Loom
  const loomRegex = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i;
  const loomMatch = url.match(loomRegex);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      videoId,
      embedUrl: `https://www.loom.com/embed/${videoId}?autoplay=1`,
      isValid: true,
      label: 'Loom'
    };
  }

  // 4. Check for Google Drive Video
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      videoId: fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isValid: true,
      label: 'Google Drive'
    };
  }

  // 5. Check for Direct Video Files / Cloudinary / Supabase / Local Uploads
  const isVideoExt = /\.(mp4|webm|mov|m4v|ogv|ogg)(?:[\?#]|$)/i.test(url);
  const isCloudinaryVideo = /cloudinary\.com\/.*\/video\/upload\//i.test(url);
  const isSupabaseVideo = /supabase\.co\/storage\/v1\/object\/.*video/i.test(url);
  const isUploadPath = url.startsWith('/uploads/') || url.startsWith('/api/media-raw/') || url.startsWith('/.netlify/functions/api/media-raw/');
  const isExplicitUpload = explicitType === 'upload' || explicitType === 'direct_url';

  if (isVideoExt || isCloudinaryVideo || isSupabaseVideo || isUploadPath || isExplicitUpload) {
    return {
      type: isUploadPath || explicitType === 'upload' ? 'upload' : 'direct_url',
      embedUrl: url,
      directUrl: url,
      isValid: true,
      label: isCloudinaryVideo ? 'Cloudinary Video' : isSupabaseVideo ? 'Supabase Video' : 'Direct MP4/WebM Video'
    };
  }

  // 6. Generic or unsupported webpage URL (e.g. instagram.com, twitter.com, general site)
  try {
    const parsed = new URL(url);
    return {
      type: 'unsupported',
      embedUrl: url,
      isValid: false,
      label: parsed.hostname,
      errorMessage: `"${parsed.hostname}" is a webpage, not a supported direct video or embed link. Please provide a direct video URL (.mp4/.webm), YouTube, Vimeo, or upload your video file directly.`
    };
  } catch {
    return {
      type: 'invalid',
      embedUrl: '',
      isValid: false,
      label: 'Invalid URL',
      errorMessage: 'Invalid video URL. Please check the link.'
    };
  }
}
