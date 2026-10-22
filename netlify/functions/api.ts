import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fs from 'fs';
import nodePath from 'path';
import crypto from 'crypto';
import { initialWebsiteData } from '../../src/data/initialData';

const JWT_SECRET = process.env.JWT_SECRET || 'the-editor-asma-shehzadi-jwt-secret-2026';

const IS_SERVERLESS = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NETLIFY_LOCAL
);

const LOCAL_DATA_DIR = nodePath.resolve(process.cwd(), 'data');
const TMP_DATA_DIR = nodePath.join('/tmp', 'data');
const DATA_DIR = IS_SERVERLESS ? TMP_DATA_DIR : LOCAL_DATA_DIR;

const SEED_AUTH_FILE = nodePath.join(LOCAL_DATA_DIR, 'auth_config.json');
const TMP_AUTH_FILE = nodePath.join(TMP_DATA_DIR, 'auth_config.json');
const AUTH_FILE = IS_SERVERLESS ? TMP_AUTH_FILE : SEED_AUTH_FILE;

const SEED_DB_FILE = nodePath.join(LOCAL_DATA_DIR, 'portfolio_db.json');
const TMP_DB_FILE = nodePath.join(TMP_DATA_DIR, 'portfolio_db.json');
const DB_FILE = IS_SERVERLESS ? TMP_DB_FILE : SEED_DB_FILE;

const LOCAL_UPLOADS_DIR = nodePath.resolve(process.cwd(), 'public/uploads');
const TMP_UPLOADS_DIR = nodePath.join('/tmp', 'uploads');

// Cloud storage environment variables for Netlify
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-media';

interface AuthConfig {
  username: string;
  passwordHash: string;
  tokenSecret: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function verifyPassword(candidate: string, stored: string): boolean {
  if (!candidate || !stored) return false;
  if (stored.startsWith('sha256:')) {
    const parts = stored.split(':');
    if (parts.length === 3) {
      const storedSalt = parts[1];
      const storedHash = parts[2];
      return hashPassword(candidate, storedSalt) === storedHash;
    }
  }
  return candidate === stored;
}

function splitBuffer(buf: Buffer, delim: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let idx: number;
  while ((idx = buf.indexOf(delim, start)) !== -1) {
    if (idx > start) {
      parts.push(buf.subarray(start, idx));
    }
    start = idx + delim.length;
  }
  if (start < buf.length) {
    parts.push(buf.subarray(start));
  }
  return parts;
}

const DEFAULT_SALT = crypto.randomBytes(16).toString('hex');
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'editor2026';
let inMemoryAuth: AuthConfig = {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordHash: `sha256:${DEFAULT_SALT}:${hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT)}`,
  tokenSecret: crypto.randomBytes(24).toString('hex')
};

function getAuthConfig(): AuthConfig {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
    if (fs.existsSync(SEED_AUTH_FILE)) {
      const raw = fs.readFileSync(SEED_AUTH_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch {}
  return inMemoryAuth;
}

function saveAuthConfig(config: AuthConfig) {
  inMemoryAuth = config;
  const dirs = [DATA_DIR, TMP_DATA_DIR, LOCAL_DATA_DIR];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(nodePath.join(dir, 'auth_config.json'), JSON.stringify(config, null, 2), 'utf-8');
      break;
    } catch {}
  }
}

// In-memory cache for fast serverless hits
let cachedWebsiteData: any = null;

// Safe helper for Netlify Blobs storage
async function getBlobStore(storeName: string) {
  try {
    const { getStore } = await import('@netlify/blobs');
    const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
    const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN;
    if (siteID && token) {
      return getStore({ name: storeName, siteID, token, consistency: 'strong' });
    }
    return getStore({ name: storeName, consistency: 'strong' });
  } catch (err) {
    return null;
  }
}

// Supabase REST helpers
async function saveToSupabase(bucket: string, filename: string, buffer: Buffer, mimeType: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': mimeType,
        'x-upsert': 'true'
      },
      body: new Uint8Array(buffer)
    });
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
    }
  } catch (e) {
    console.warn('Supabase storage write error:', e);
  }
  return null;
}

async function getFromSupabase(bucket: string, filename: string): Promise<Buffer | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`);
    if (res.ok) {
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    }
  } catch (e) {
    console.warn('Supabase storage read error:', e);
  }
  return null;
}

// Read database from persistent store (Netlify Blobs -> Supabase -> local/tmp disk -> memory -> seed fallback)
async function loadPersistentDb(): Promise<any> {
  // 1. Try Netlify Blobs
  try {
    const store = await getBlobStore('portfolio-data');
    if (store) {
      const data = await store.get('portfolio_db', { type: 'json' });
      if (data && (data as any).hero && (data as any).videos) {
        cachedWebsiteData = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Netlify Blobs read error:', err);
  }

  // 2. Try Supabase storage
  try {
    const sbBuf = await getFromSupabase(SUPABASE_STORAGE_BUCKET, 'portfolio_db.json');
    if (sbBuf) {
      const parsed = JSON.parse(sbBuf.toString('utf-8'));
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {}

  // 3. Try in-memory cache
  if (cachedWebsiteData && cachedWebsiteData.hero) {
    return cachedWebsiteData;
  }

  // 4. Try /tmp/data/portfolio_db.json (if previously written in serverless)
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {}

  // 5. Try seed disk file from repository
  try {
    if (fs.existsSync(SEED_DB_FILE)) {
      const raw = fs.readFileSync(SEED_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {}

  // 6. Default to initial data
  return initialWebsiteData;
}

// Save database to persistent store
async function savePersistentDb(data: any): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  cachedWebsiteData = data;

  // 1. Save to Netlify Blobs
  try {
    const store = await getBlobStore('portfolio-data');
    if (store) {
      await store.setJSON('portfolio_db', data);
    }
  } catch (err) {
    console.warn('Netlify Blobs write error:', err);
  }

  // 2. Save to Supabase Storage if configured
  try {
    const jsonBuf = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
    await saveToSupabase(SUPABASE_STORAGE_BUCKET, 'portfolio_db.json', jsonBuf, 'application/json');
  } catch {}

  // 3. Save to writable disk (/tmp/data in serverless, data in local)
  const targetDirs = IS_SERVERLESS
    ? [TMP_DATA_DIR, LOCAL_DATA_DIR]
    : [LOCAL_DATA_DIR, TMP_DATA_DIR];

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(nodePath.join(dir, 'portfolio_db.json'), JSON.stringify(data, null, 2), 'utf-8');
      break;
    } catch {}
  }
}

// Stateless HMAC-SHA256 Token Generator
function generateToken(payload: { username: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days expiration
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Stateless Token Verifier
function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    if (!token) return { valid: false };
    if (token.startsWith('client.')) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.exp && payload.exp < Date.now()) return { valid: false };
        return { valid: true, payload };
      }
    }
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, body, signature] = parts;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return { valid: false };
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) return { valid: false };
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false };
  }
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Normalize path by stripping Netlify redirects prefix
  let reqPath = event.path
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');

  if (!reqPath.startsWith('/')) {
    reqPath = '/' + reqPath;
  }

  const method = event.httpMethod;
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  try {
    // 1. AUTH: LOGIN
    if (reqPath === '/auth/login' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;
      const auth = getAuthConfig();

      const cleanUser = (username || '').trim().toLowerCase();
      const validUser = (auth.username || '').trim().toLowerCase();
      const isUserMatch = cleanUser === validUser;
      const isPassMatch = verifyPassword(password, auth.passwordHash);

      if (!isUserMatch || !isPassMatch) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid username or password' })
        };
      }

      const signedToken = generateToken({
        username: auth.username,
        role: 'Super Admin'
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          token: signedToken,
          user: {
            username: auth.username,
            name: 'Asma Shehzadi',
            role: 'Super Admin'
          }
        })
      };
    }

    // 2. AUTH: VERIFY
    if (reqPath === '/auth/verify' && method === 'GET') {
      if (!token) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ valid: false })
        };
      }
      const verified = verifyToken(token);
      if (verified.valid) {
        const auth = getAuthConfig();
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            valid: true,
            user: { username: auth.username, name: 'Asma Shehzadi', role: 'Super Admin' }
          })
        };
      }
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ valid: false })
      };
    }

    // 3. AUTH: LOGOUT
    if (reqPath === '/auth/logout' && method === 'POST') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true })
      };
    }

    // 4. AUTH: CHANGE CREDENTIALS
    if (reqPath === '/auth/change-credentials' && method === 'POST') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      const { currentPassword, newUsername, newPassword } = body;
      const auth = getAuthConfig();

      if (!verifyPassword(currentPassword, auth.passwordHash)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Current password does not match' })
        };
      }

      let updatedUser = auth.username;
      if (newUsername && newUsername.trim()) {
        updatedUser = newUsername.trim();
        auth.username = updatedUser;
      }
      if (newPassword && newPassword.trim()) {
        if (newPassword.trim().length < 6) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'New password must be at least 6 characters long' })
          };
        }
        const newSalt = crypto.randomBytes(16).toString('hex');
        auth.passwordHash = `sha256:${newSalt}:${hashPassword(newPassword.trim(), newSalt)}`;
      }

      saveAuthConfig(auth);

      const newToken = generateToken({
        username: updatedUser,
        role: 'Super Admin'
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          token: newToken,
          message: 'Admin credentials updated and saved successfully! Old credentials will no longer work.',
          user: {
            username: updatedUser,
            name: 'Asma Shehzadi',
            role: 'Super Admin'
          }
        })
      };
    }

    // 5. CONTENT: GET
    if (reqPath === '/content' && method === 'GET') {
      const data = await loadPersistentDb();
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        },
        body: JSON.stringify(data)
      };
    }

    // 6. CONTENT: PUT
    if (reqPath === '/content' && method === 'PUT') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized: Authentication required.' })
        };
      }
      const incoming = event.body ? JSON.parse(event.body) : null;
      if (!incoming || typeof incoming !== 'object') {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid payload' })
        };
      }
      await savePersistentDb(incoming);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: incoming })
      };
    }

    // 7. STORAGE CONFIGURATION & SIGNING (Cloudinary & Supabase)
    if (reqPath === '/storage/config' && method === 'GET') {
      const db = await loadPersistentDb();
      const customSettings = db?.storageSettings || {};

      const hasCloudinary = Boolean(
        CLOUDINARY_CLOUD_NAME || customSettings.cloudinaryCloudName
      );
      const hasSupabase = Boolean(
        (SUPABASE_URL && SUPABASE_ANON_KEY) || (customSettings.supabaseUrl && customSettings.supabaseAnonKey)
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          provider: customSettings.provider || (hasCloudinary ? 'cloudinary' : hasSupabase ? 'supabase' : 'netlify-blobs'),
          cloudinary: {
            cloudName: CLOUDINARY_CLOUD_NAME || customSettings.cloudinaryCloudName || '',
            uploadPreset: CLOUDINARY_UPLOAD_PRESET || customSettings.cloudinaryUploadPreset || '',
            hasApiKey: Boolean(CLOUDINARY_API_KEY || customSettings.cloudinaryApiKey),
            isConfigured: hasCloudinary
          },
          supabase: {
            url: SUPABASE_URL || customSettings.supabaseUrl || '',
            bucket: SUPABASE_STORAGE_BUCKET || customSettings.supabaseBucket || 'portfolio-media',
            isConfigured: hasSupabase
          },
          netlifyBlobsAvailable: true
        })
      };
    }

    // Server-side Cloudinary signature generation for secure authorized direct uploads
    if (reqPath === '/storage/sign' && method === 'POST') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      const { paramsToSign = {} } = body;

      const secret = CLOUDINARY_API_SECRET;
      if (!secret) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'CLOUDINARY_API_SECRET is not configured on server' })
        };
      }

      const sortedKeys = Object.keys(paramsToSign).sort();
      const toSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + secret;
      const signature = crypto.createHash('sha1').update(toSign).digest('hex');

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          signature,
          apiKey: CLOUDINARY_API_KEY,
          cloudName: CLOUDINARY_CLOUD_NAME
        })
      };
    }

    // 8. FILE UPLOAD HANDLER
    if (reqPath === '/upload' && method === 'POST') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized: Authentication required.' })
        };
      }

      let fileName = 'upload_' + Date.now();
      let fileType = 'application/octet-stream';
      let fileBuffer: Buffer | null = null;

      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

      if (contentType.includes('application/json')) {
        const parsed = JSON.parse(event.body || '{}');
        if (parsed.base64Data) {
          fileName = parsed.fileName || fileName;
          fileType = parsed.fileType || fileType;
          const cleanBase64 = parsed.base64Data.replace(/^data:.*?;base64,/, '');
          fileBuffer = Buffer.from(cleanBase64, 'base64');
        }
      } else if (contentType.includes('multipart/form-data')) {
        // Parse multipart/form-data properly to extract clean binary file
        const rawBuffer = event.isBase64Encoded && event.body
          ? Buffer.from(event.body, 'base64')
          : Buffer.from(event.body || '', 'latin1');

        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]).trim() : '';

        if (boundary) {
          const boundaryBuffer = Buffer.from('--' + boundary);
          const parts = splitBuffer(rawBuffer, boundaryBuffer);
          for (const part of parts) {
            const headerEndIdx = part.indexOf('\r\n\r\n');
            const doubleNewlineIdx = part.indexOf('\n\n');
            const sepIdx = headerEndIdx !== -1 ? headerEndIdx : doubleNewlineIdx;
            const sepLen = headerEndIdx !== -1 ? 4 : 2;

            if (sepIdx !== -1) {
              const headerText = part.subarray(0, sepIdx).toString('utf-8');
              const filenameMatch = headerText.match(/filename="([^"]+)"/i);
              const typeMatch = headerText.match(/Content-Type:\s*([^\r\n;]+)/i);

              if (filenameMatch) {
                fileName = filenameMatch[1];
                if (typeMatch) {
                  fileType = typeMatch[1].trim();
                }
                let bodyPart = part.subarray(sepIdx + sepLen);
                if (bodyPart.subarray(bodyPart.length - 2).toString() === '\r\n') {
                  bodyPart = bodyPart.subarray(0, bodyPart.length - 2);
                } else if (bodyPart.subarray(bodyPart.length - 1).toString() === '\n') {
                  bodyPart = bodyPart.subarray(0, bodyPart.length - 1);
                }
                fileBuffer = bodyPart;
                break;
              }
            }
          }
        }
      } else if (event.isBase64Encoded && event.body) {
        fileBuffer = Buffer.from(event.body, 'base64');
      } else if (event.body) {
        fileBuffer = Buffer.from(event.body, 'binary');
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'No file data received' })
        };
      }

      const ext = nodePath.extname(fileName) || (fileType.includes('image') ? '.jpg' : '.mp4');
      const baseClean = nodePath.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `${baseClean}_${Date.now()}${ext}`;

      let storedSuccessfully = false;
      let cloudUrl: string | null = null;

      // 1. Store in Netlify Blobs
      try {
        const mediaStore = await getBlobStore('portfolio-media');
        if (mediaStore) {
          await mediaStore.set(safeFilename, new Uint8Array(fileBuffer), {
            metadata: {
              mimeType: fileType,
              originalName: fileName,
              size: fileBuffer.length.toString(),
              uploadedAt: new Date().toISOString()
            }
          });
          storedSuccessfully = true;
        }
      } catch (blobErr) {
        console.warn('Failed to save to Netlify Blobs:', blobErr);
      }

      // 2. Try Supabase Storage if configured
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const sbUrl = await saveToSupabase(SUPABASE_STORAGE_BUCKET, safeFilename, fileBuffer, fileType);
          if (sbUrl) {
            cloudUrl = sbUrl;
            storedSuccessfully = true;
          }
        } catch (sbErr) {
          console.warn('Failed to save to Supabase:', sbErr);
        }
      }

      // 3. Try saving to writable disk (/tmp/uploads in serverless, public/uploads in local)
      const uploadDirsToTry = IS_SERVERLESS
        ? [TMP_UPLOADS_DIR, LOCAL_UPLOADS_DIR]
        : [LOCAL_UPLOADS_DIR, TMP_UPLOADS_DIR];

      for (const dir of uploadDirsToTry) {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(nodePath.join(dir, safeFilename), fileBuffer);
          storedSuccessfully = true;
          break;
        } catch {}
      }

      if (!storedSuccessfully) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Could not write file to persistent storage' })
        };
      }

      const publicUrl = cloudUrl || `/api/media-raw/${safeFilename}`;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          url: publicUrl,
          filename: safeFilename,
          originalName: fileName,
          size: fileBuffer.length,
          mimetype: fileType
        })
      };
    }

    // 9. MEDIA STREAMING / SERVING ENDPOINT (/api/media-raw/:key)
    if (reqPath.startsWith('/media-raw/')) {
      const filename = reqPath.replace('/media-raw/', '');
      const safeFilename = nodePath.basename(filename);

      let fileBuffer: Buffer | null = null;
      let mimeType = 'application/octet-stream';

      // 1. Try reading from Netlify Blobs
      try {
        const mediaStore = await getBlobStore('portfolio-media');
        if (mediaStore) {
          const raw = await mediaStore.get(safeFilename, { type: 'arrayBuffer' });
          if (raw) {
            fileBuffer = Buffer.from(raw);
            const metadata = await mediaStore.getMetadata(safeFilename);
            if (metadata?.metadata?.mimeType) {
              mimeType = String(metadata.metadata.mimeType);
            }
          }
        }
      } catch {}

      // 2. Try reading from writable /tmp/uploads
      if (!fileBuffer) {
        try {
          const tmpFilePath = nodePath.join(TMP_UPLOADS_DIR, safeFilename);
          if (fs.existsSync(tmpFilePath)) {
            fileBuffer = fs.readFileSync(tmpFilePath);
          }
        } catch {}
      }

      // 3. Try reading from public/uploads
      if (!fileBuffer) {
        try {
          const localFilePath = nodePath.join(LOCAL_UPLOADS_DIR, safeFilename);
          if (fs.existsSync(localFilePath)) {
            fileBuffer = fs.readFileSync(localFilePath);
          }
        } catch {}
      }

      // 4. Try reading from Supabase
      if (!fileBuffer && SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const sbBuf = await getFromSupabase(SUPABASE_STORAGE_BUCKET, safeFilename);
          if (sbBuf) {
            fileBuffer = sbBuf;
          }
        } catch {}
      }

      if (!fileBuffer) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Media file not found' })
        };
      }

      if (mimeType === 'application/octet-stream') {
        const ext = nodePath.extname(safeFilename).toLowerCase();
        if (['.mp4', '.m4v'].includes(ext)) mimeType = 'video/mp4';
        else if (ext === '.webm') mimeType = 'video/webm';
        else if (ext === '.mov') mimeType = 'video/quicktime';
        else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        },
        body: fileBuffer.toString('base64'),
        isBase64Encoded: true
      };
    }

    // 10. MEDIA LIST (/api/media)
    if (reqPath === '/media' && method === 'GET') {
      const mediaList: any[] = [];
      const seenFiles = new Set<string>();

      // 1. From Netlify Blobs
      try {
        const mediaStore = await getBlobStore('portfolio-media');
        if (mediaStore) {
          const list = await mediaStore.list();
          for (const item of list.blobs) {
            seenFiles.add(item.key);
            const isVideo = /\.(mp4|webm|mov|mkv|m4v)$/i.test(item.key);
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.key);
            mediaList.push({
              filename: item.key,
              url: `/api/media-raw/${item.key}`,
              size: 0,
              type: isVideo ? 'video' : isImage ? 'image' : 'file',
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch {}

      // 2. From /tmp/uploads and public/uploads
      const scanDirs = [TMP_UPLOADS_DIR, LOCAL_UPLOADS_DIR];
      for (const dir of scanDirs) {
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            for (const filename of files) {
              if (!seenFiles.has(filename)) {
                seenFiles.add(filename);
                const filePath = nodePath.join(dir, filename);
                const stat = fs.statSync(filePath);
                const isVideo = /\.(mp4|webm|mov|mkv|m4v)$/i.test(filename);
                const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
                mediaList.push({
                  filename,
                  url: `/api/media-raw/${filename}`,
                  size: stat.size,
                  type: isVideo ? 'video' : isImage ? 'image' : 'file',
                  createdAt: stat.birthtime
                });
              }
            }
          }
        } catch {}
      }

      mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(mediaList)
      };
    }

    // 11. MEDIA DELETE
    if (reqPath.startsWith('/media/') && method === 'DELETE') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      const filename = reqPath.replace('/media/', '');
      const safeFilename = nodePath.basename(filename);

      try {
        const mediaStore = await getBlobStore('portfolio-media');
        if (mediaStore) {
          await mediaStore.delete(safeFilename);
        }
      } catch {}

      try {
        const tmpPath = nodePath.join(TMP_UPLOADS_DIR, safeFilename);
        if (fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
        }
      } catch {}

      try {
        const localPath = nodePath.join(LOCAL_UPLOADS_DIR, safeFilename);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch {}

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'File deleted' })
      };
    }

    // 12. BACKUP: GET
    if (reqPath === '/backup' && method === 'GET') {
      const data = await loadPersistentDb();
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Disposition': `attachment; filename=asma-shehzadi-portfolio-backup-${Date.now()}.json`
        },
        body: JSON.stringify(data, null, 2)
      };
    }

    // 13. RESTORE / RESET
    if (reqPath === '/restore' && method === 'POST') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      const backupData = event.body ? JSON.parse(event.body) : null;
      if (!backupData || !backupData.hero) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid backup format' })
        };
      }
      await savePersistentDb(backupData);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: backupData })
      };
    }

    if (reqPath === '/reset-demo' && method === 'POST') {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      await savePersistentDb(initialWebsiteData);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: initialWebsiteData })
      };
    }

    // Default 404 for unknown API route
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `API route ${method} ${reqPath} not found` })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    };
  }
};
