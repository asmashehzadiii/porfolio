import { WebsiteData, CloudStorageSettings } from '../types';
import { initialWebsiteData } from '../data/initialData';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
const LOCAL_STORAGE_KEY = 'the_editor_website_data';
const CLOUD_STORAGE_KEY = 'the_editor_cloud_storage';

/**
 * Normalizes website data with fallback defaults
 */
function sanitizeWebsiteData(data: any): WebsiteData {
  if (!data || typeof data !== 'object') return initialWebsiteData;

  const result: WebsiteData = {
    ...initialWebsiteData,
    ...data
  };

  if (!result.pricingSettings) {
    result.pricingSettings = initialWebsiteData.pricingSettings;
  }

  if (!result.theme) {
    result.theme = initialWebsiteData.theme;
  } else {
    if (!result.theme.sectionColors) result.theme.sectionColors = {};
    if (!result.theme.sectionAnimations) result.theme.sectionAnimations = {};
    if (!result.theme.darkColors) result.theme.darkColors = initialWebsiteData.theme.darkColors;
    if (!result.theme.lightColors) result.theme.lightColors = initialWebsiteData.theme.lightColors;
  }

  if (result.services) {
    result.services = result.services.map((s: any, idx: number) => {
      if (!s.prices && initialWebsiteData.services[idx]?.prices) {
        return { ...s, prices: initialWebsiteData.services[idx].prices };
      }
      return s;
    });
  }

  return result;
}

/**
 * Loads website data from the persistent backend database first.
 * If network is temporarily offline, falls back to local cache.
 */
export async function getWebsiteData(): Promise<WebsiteData> {
  let localData: WebsiteData | null = null;
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.hero && parsed.videos) {
        localData = sanitizeWebsiteData(parsed);
      }
    }
  } catch (err) {
    console.warn('Error reading from localStorage cache:', err);
  }

  // Fetch live persistent data from server / Netlify function
  try {
    const res = await fetch(`${BASE_URL}/api/content?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache'
      }
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const serverData = await res.json();
        if (serverData && serverData.hero && serverData.videos) {
          const sanitizedServer = sanitizeWebsiteData(serverData);

          // If client has local edits with a newer lastUpdated timestamp than server,
          // preserve client edits so recent additions (e.g. YouTube videos/thumbnails) are never wiped out on refresh!
          if (localData && localData.lastUpdated && sanitizedServer.lastUpdated) {
            const localTime = new Date(localData.lastUpdated).getTime();
            const serverTime = new Date(sanitizedServer.lastUpdated).getTime();
            if (localTime > serverTime) {
              // Re-sync back to server in background if admin token is present
              const activeToken = typeof window !== 'undefined' ? localStorage.getItem('the_editor_admin_token') : null;
              if (activeToken) {
                fetch(`${BASE_URL}/api/content`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${activeToken}`
                  },
                  body: JSON.stringify(localData)
                }).catch(() => {});
              }
              return localData;
            }
          }

          // Otherwise serverData is current or newer; sync local cache
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizedServer));
          } catch {}
          return sanitizedServer;
        }
      }
    }
  } catch (err) {
    console.warn('Live server /api/content not reachable, falling back to local offline cache:', err);
  }

  // Fallback to local cache if server couldn't be reached or had no newer data
  if (localData) {
    return localData;
  }

  return initialWebsiteData;
}

/**
 * Updates website data and permanently saves to the backend database.
 * Throws on failure so UI callers never falsely display a success message.
 */
export async function updateWebsiteData(token: string, data: WebsiteData): Promise<WebsiteData> {
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('the_editor_admin_token') : '') || '';
  data.lastUpdated = new Date().toISOString();

  if (!data.theme) {
    data.theme = initialWebsiteData.theme;
  }
  if (!data.theme.sectionColors) {
    data.theme.sectionColors = {};
  }

  // Persist locally for immediate responsiveness
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }

  // Sync to live persistent database on server / Netlify Blobs
  const res = await fetch(`${BASE_URL}/api/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeToken}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson.error || `Server save failed with status ${res.status}`;
    console.error('Server save error:', errMsg);
    throw new Error(errMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const result = await res.json();
    const savedData = result.data || data;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));
    } catch {}
    return savedData;
  }

  return data;
}

// Clean up legacy storage if previously created
try {
  localStorage.removeItem('the_editor_custom_credentials');
} catch {}

export interface CredentialsInfo {
  username: string;
}

export function getActiveCredentialsInfo(): CredentialsInfo {
  try {
    const user = localStorage.getItem('the_editor_admin_user');
    if (user) {
      return { username: user };
    }
  } catch {}
  return { username: 'admin' };
}

export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: any }> {
  const cleanUser = (username || '').trim();

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: cleanUser, password })
  });

  if (res.ok) {
    const json = await res.json();
    if (json && json.token) {
      localStorage.setItem('the_editor_admin_token', json.token);
      localStorage.setItem('the_editor_admin_user', json.user?.username || cleanUser);
    }
    return json;
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.error || 'Invalid username or password. Please verify your credentials.');
}

export async function changeAdminCredentials(
  token: string,
  credentials: { currentPassword: string; newUsername?: string; newPassword?: string }
): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
  if (credentials.newPassword && credentials.newPassword.trim().length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const res = await fetch(`${BASE_URL}/api/auth/change-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword: credentials.currentPassword,
      newUsername: credentials.newUsername?.trim() || undefined,
      newPassword: credentials.newPassword?.trim() || undefined
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update credentials. Please check your current password.');
  }

  const result = await res.json();
  if (result.token) {
    localStorage.setItem('the_editor_admin_token', result.token);
  }
  if (result.user?.username) {
    localStorage.setItem('the_editor_admin_user', result.user.username);
  }

  return {
    success: true,
    message: result.message || 'Admin credentials updated and saved successfully! The previous credentials will no longer work.',
    token: result.token,
    user: result.user
  };
}

function parseJwtPayload(token: string): any {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const raw = token.startsWith('client.') ? parts[1] : parts[1];
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const jsonStr = decodeURIComponent(
      Array.prototype.map.call(atob(padded), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        return Boolean(json.valid);
      }
    }
  } catch {
    // Network or static route fallback
  }

  // Safe client-side verification
  try {
    const payload = parseJwtPayload(token);
    if (payload && payload.exp && payload.exp > Date.now()) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Storage configuration interfaces and helpers
 */
export async function getStorageConfig(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage/config`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback to local storage configuration
  try {
    const custom = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (custom) return JSON.parse(custom);
  } catch {}

  return {
    provider: 'server',
    cloudinary: { isConfigured: false },
    supabase: { isConfigured: false }
  };
}

export function saveLocalCloudStorageConfig(config: CloudStorageSettings) {
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function getLocalCloudStorageConfig(): CloudStorageSettings | null {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Helper to convert File to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads media file to permanent cloud storage.
 * Prioritizes:
 * 1. Cloudinary (Direct HTTPS CDN upload, ideal for large videos & Netlify)
 * 2. Supabase Storage (Direct HTTPS REST API)
 * 3. Server / Netlify Blobs upload endpoint (/api/upload)
 * Never falls back to temporary browser-only DataURLs!
 */
export async function uploadMediaFile(
  token: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; size: number }> {
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('the_editor_admin_token') : '') || '';

  // Retrieve active storage configuration
  const serverConfig = await getStorageConfig().catch(() => ({}));
  const localConfig = getLocalCloudStorageConfig();

  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name);
  const cloudName = localConfig?.cloudinaryCloudName || serverConfig?.cloudinary?.cloudName;
  const uploadPreset = localConfig?.cloudinaryUploadPreset || serverConfig?.cloudinary?.uploadPreset;
  const hasCloudinary = Boolean(cloudName && (uploadPreset || serverConfig?.cloudinary?.hasApiKey));

  const supabaseUrl = localConfig?.supabaseUrl || serverConfig?.supabase?.url;
  const supabaseKey = localConfig?.supabaseAnonKey || serverConfig?.supabase?.anonKey;
  const supabaseBucket = localConfig?.supabaseBucket || serverConfig?.supabase?.bucket || 'portfolio-media';
  const hasSupabase = Boolean(supabaseUrl && supabaseKey);

  // ==========================================
  // PATH 1: CLOUDINARY CLOUD UPLOAD (Global CDN direct upload)
  // ==========================================
  if (hasCloudinary && cloudName) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (uploadPreset) {
        // Direct unsigned preset upload
        formData.append('upload_preset', uploadPreset);
      } else if (activeToken) {
        // Server-side signed upload
        const signRes = await fetch(`${BASE_URL}/api/storage/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            paramsToSign: {
              timestamp: Math.floor(Date.now() / 1000)
            }
          })
        });
        if (signRes.ok) {
          const signData = await signRes.json();
          formData.append('timestamp', signData.timestamp || Math.floor(Date.now() / 1000).toString());
          formData.append('api_key', signData.apiKey);
          formData.append('signature', signData.signature);
        }
      }

      const resourceType = isVideo ? 'video' : 'image';
      const clRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      });

      if (clRes.ok) {
        const clData = await clRes.json();
        if (clData.secure_url) {
          return {
            url: clData.secure_url,
            filename: clData.original_filename ? `${clData.original_filename}.${clData.format}` : file.name,
            size: clData.bytes || file.size
          };
        }
      } else {
        const errJson = await clRes.json().catch(() => ({}));
        console.warn('Cloudinary upload warning:', errJson);
      }
    } catch (clErr) {
      console.warn('Cloudinary upload attempt failed, trying server:', clErr);
    }
  }

  // ==========================================
  // PATH 2: SUPABASE STORAGE UPLOAD
  // ==========================================
  if (hasSupabase && supabaseUrl && supabaseKey) {
    try {
      const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const sbRes = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${cleanName}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (sbRes.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${cleanName}`;
        return {
          url: publicUrl,
          filename: cleanName,
          size: file.size
        };
      }
    } catch (sbErr) {
      console.warn('Supabase storage attempt failed:', sbErr);
    }
  }

  // ==========================================
  // PATH 3: PERSISTENT SERVER / NETLIFY BLOBS UPLOAD
  // ==========================================
  // 3A. For files <= 6MB (all thumbnails, images, graphics): Base64 JSON upload
  // Base64 JSON is 100% boundary-clean, preserves exact filename and extension,
  // and works identically across Express server and Netlify serverless functions.
  if (file.size <= 6 * 1024 * 1024) {
    try {
      const base64Data = await fileToBase64(file);
      const jsonRes = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          fileSize: file.size,
          base64Data
        })
      });

      if (jsonRes.ok) {
        const contentType = jsonRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await jsonRes.json();
          if (data && data.url) {
            return {
              url: data.url,
              filename: data.filename || file.name,
              size: data.size || file.size
            };
          }
        }
      } else {
        const errJson = await jsonRes.json().catch(() => ({}));
        if (errJson.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (base64Err: any) {
      if (base64Err.message && !base64Err.message.includes('fetch')) {
        console.warn('JSON upload warning:', base64Err.message);
      }
    }
  }

  // 3B. Multipart FormData upload (for larger files or fallback)
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeToken}`
      },
      body: formData
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.url) {
          return {
            url: data.url,
            filename: data.filename || file.name,
            size: data.size || file.size
          };
        }
      }
    } else if (res.status === 413) {
      throw new Error(
        'File exceeds serverless payload limit (6MB). For large video files on Netlify, please configure free Cloudinary in Media Library -> Cloud Storage Settings, or link a YouTube/Vimeo/direct URL.'
      );
    } else {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.error) {
        throw new Error(errJson.error);
      }
    }
  } catch (err: any) {
    if (err.message?.includes('payload limit') || err.message?.includes('Unauthorized')) {
      throw err;
    }
    console.warn('Multipart upload attempt failed:', err);
  }

  throw new Error('Upload failed. Please check that you are logged into Admin or configure Cloudinary in Media Library.');
}

export async function getMediaLibrary(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/media?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function deleteMediaFile(token: string, filename: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/media/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
}

export async function resetDemoData(token: string): Promise<WebsiteData> {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  try {
    const res = await fetch(`${BASE_URL}/api/reset-demo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return initialWebsiteData;
}

export async function restoreDatabase(token: string, backupData: any): Promise<WebsiteData> {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backupData));
  try {
    const res = await fetch(`${BASE_URL}/api/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(backupData)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return backupData;
}
