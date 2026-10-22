import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import multer from 'multer';
import { initialWebsiteData } from './src/data/initialData';
import { WebsiteData, CloudStorageSettings } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio_db.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth_config.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialWebsiteData, null, 2), 'utf-8');
}

// Ensure auth file exists with default credentials
interface AuthConfig {
  username: string;
  passwordHash: string;
  tokenSecret: string;
}

// Password hashing utilities with random salt
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function verifyPassword(candidate: string, stored: string, salt: string): boolean {
  if (!candidate || !stored) return false;
  if (stored.startsWith('sha256:')) {
    const parts = stored.split(':');
    if (parts.length === 3) {
      const storedSalt = parts[1];
      const storedHash = parts[2];
      return hashPassword(candidate, storedSalt) === storedHash;
    }
  }
  // Support initial default password migration
  return candidate === stored;
}

const DEFAULT_SALT = crypto.randomBytes(16).toString('hex');
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'editor2026';
const DEFAULT_AUTH: AuthConfig = {
  username: process.env.ADMIN_USERNAME || 'admin',
  passwordHash: `sha256:${DEFAULT_SALT}:${hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT)}`,
  tokenSecret: crypto.randomBytes(24).toString('hex')
};

if (!fs.existsSync(AUTH_FILE)) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(DEFAULT_AUTH, null, 2), 'utf-8');
}

function getAuthConfig(): AuthConfig {
  try {
    const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.username && parsed.passwordHash) {
      return parsed;
    }
    return DEFAULT_AUTH;
  } catch {
    return DEFAULT_AUTH;
  }
}

function saveAuthConfig(config: AuthConfig) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

const JWT_SECRET = process.env.JWT_SECRET || 'the-editor-asma-shehzadi-jwt-secret-2026';

function generateToken(payload: { username: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

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

function getDb(): WebsiteData {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, falling back to initial data:', err);
    return initialWebsiteData;
  }
}

function saveDb(data: WebsiteData) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving (both /uploads and /api/media-raw for seamless compatibility with Netlify)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/media-raw', express.static(UPLOADS_DIR));

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos and high-res designs
  }
});

// Auth middleware for protected routes
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);
  if (!verified.valid) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
    return;
  }
  next();
}

// ==========================================
// AUTH ROUTES
// ==========================================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const auth = getAuthConfig();

  const cleanUser = (username || '').trim().toLowerCase();
  const validUser = (auth.username || '').trim().toLowerCase();

  const isUserMatch = cleanUser === validUser;
  const isPassMatch = verifyPassword(password, auth.passwordHash, auth.tokenSecret);

  if (!isUserMatch || !isPassMatch) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = generateToken({
    username: auth.username,
    role: 'Super Admin'
  });

  res.json({
    success: true,
    token,
    user: {
      username: auth.username,
      name: 'Asma Shehzadi',
      role: 'Super Admin'
    }
  });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ valid: false });
    return;
  }
  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);
  if (verified.valid) {
    const auth = getAuthConfig();
    res.json({ valid: true, user: { username: auth.username, name: 'Asma Shehzadi', role: 'Super Admin' } });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

app.post('/api/auth/change-credentials', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const auth = getAuthConfig();

  if (!verifyPassword(currentPassword, auth.passwordHash, auth.tokenSecret)) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  if (newUsername && newUsername.trim()) {
    auth.username = newUsername.trim();
  }
  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    auth.passwordHash = `sha256:${newSalt}:${hashPassword(newPassword.trim(), newSalt)}`;
  }

  saveAuthConfig(auth);

  // Generate a fresh session token with updated username
  const newToken = generateToken({
    username: auth.username,
    role: 'Super Admin'
  });

  res.json({
    success: true,
    message: 'Admin credentials updated and saved successfully! Old credentials will no longer work.',
    token: newToken,
    user: {
      username: auth.username,
      name: 'Asma Shehzadi',
      role: 'Super Admin'
    }
  });
});

// ==========================================
// WEBSITE CONTENT ROUTES
// ==========================================

// Public GET content
app.get('/api/content', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db);
});

// Protected bulk content update
app.put('/api/content', requireAuth, (req: Request, res: Response) => {
  const incoming = req.body as WebsiteData;
  if (!incoming || typeof incoming !== 'object') {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }
  saveDb(incoming);
  res.json({ success: true, data: incoming });
});

// Update specific sections (Hero, About, Theme, Nav, Contact, SEO)
app.put('/api/content/:sectionKey', requireAuth, (req: Request, res: Response) => {
  const { sectionKey } = req.params;
  const db = getDb();
  
  if (sectionKey in db) {
    (db as any)[sectionKey] = req.body;
    saveDb(db);
    res.json({ success: true, data: (db as any)[sectionKey] });
  } else {
    res.status(404).json({ error: `Section ${sectionKey} not found` });
  }
});

// ==========================================
// VIDEO ROUTES
// ==========================================
app.get('/api/videos', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.videos);
});

app.post('/api/videos', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const newVideo = {
    ...req.body,
    id: req.body.id || `vid-${Date.now()}`,
    order: db.videos.length + 1,
    createdAt: new Date().toISOString()
  };
  db.videos.unshift(newVideo);
  saveDb(db);
  res.status(201).json(newVideo);
});

app.put('/api/videos/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.videos.findIndex(v => v.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }
  db.videos[index] = { ...db.videos[index], ...req.body, id };
  saveDb(db);
  res.json(db.videos[index]);
});

app.delete('/api/videos/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.videos = db.videos.filter(v => v.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Video deleted' });
});

app.patch('/api/videos/reorder', requireAuth, (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: 'orderedIds array required' });
    return;
  }
  const db = getDb();
  const videoMap = new Map(db.videos.map(v => [v.id, v]));
  const reordered = orderedIds.map((id, index) => {
    const item = videoMap.get(id);
    if (item) {
      return { ...item, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as any[];

  // Append any that weren't in orderedIds
  db.videos.forEach(v => {
    if (!orderedIds.includes(v.id)) {
      reordered.push({ ...v, order: reordered.length + 1 });
    }
  });

  db.videos = reordered;
  saveDb(db);
  res.json(db.videos);
});

// Video categories
app.post('/api/categories/video', requireAuth, (req: Request, res: Response) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') {
    res.status(400).json({ error: 'Category name required' });
    return;
  }
  const db = getDb();
  if (!db.videoCategories.includes(category)) {
    db.videoCategories.push(category.trim());
    saveDb(db);
  }
  res.json(db.videoCategories);
});

app.delete('/api/categories/video/:category', requireAuth, (req: Request, res: Response) => {
  const category = decodeURIComponent(req.params.category);
  const db = getDb();
  if (category === 'All') {
    res.status(400).json({ error: 'Cannot delete default category "All"' });
    return;
  }
  db.videoCategories = db.videoCategories.filter(c => c !== category);
  saveDb(db);
  res.json(db.videoCategories);
});

// ==========================================
// GRAPHIC DESIGN ROUTES
// ==========================================
app.get('/api/designs', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.designs);
});

app.post('/api/designs', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const newDesign = {
    ...req.body,
    id: req.body.id || `des-${Date.now()}`,
    order: db.designs.length + 1,
    createdAt: new Date().toISOString()
  };
  db.designs.unshift(newDesign);
  saveDb(db);
  res.status(201).json(newDesign);
});

app.put('/api/designs/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.designs.findIndex(d => d.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Design item not found' });
    return;
  }
  db.designs[index] = { ...db.designs[index], ...req.body, id };
  saveDb(db);
  res.json(db.designs[index]);
});

app.delete('/api/designs/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.designs = db.designs.filter(d => d.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Design item deleted' });
});

// Design categories
app.post('/api/categories/design', requireAuth, (req: Request, res: Response) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') {
    res.status(400).json({ error: 'Category name required' });
    return;
  }
  const db = getDb();
  if (!db.designCategories.includes(category)) {
    db.designCategories.push(category.trim());
    saveDb(db);
  }
  res.json(db.designCategories);
});

app.delete('/api/categories/design/:category', requireAuth, (req: Request, res: Response) => {
  const category = decodeURIComponent(req.params.category);
  const db = getDb();
  if (category === 'All') {
    res.status(400).json({ error: 'Cannot delete default category "All"' });
    return;
  }
  db.designCategories = db.designCategories.filter(c => c !== category);
  saveDb(db);
  res.json(db.designCategories);
});

// ==========================================
// DYNAMIC SECTION BUILDER ROUTES
// ==========================================
app.get('/api/sections', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.dynamicSections);
});

app.post('/api/sections', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const newSection = {
    ...req.body,
    id: req.body.id || `sec-${Date.now()}`,
    key: req.body.key || `section-${Date.now()}`,
    order: db.dynamicSections.length + 1,
    isEnabled: req.body.isEnabled !== false,
    blocks: req.body.blocks || []
  };
  db.dynamicSections.push(newSection);
  saveDb(db);
  res.status(201).json(newSection);
});

app.put('/api/sections/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.dynamicSections.findIndex(s => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Section not found' });
    return;
  }
  db.dynamicSections[index] = { ...db.dynamicSections[index], ...req.body, id };
  saveDb(db);
  res.json(db.dynamicSections[index]);
});

app.delete('/api/sections/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.dynamicSections = db.dynamicSections.filter(s => s.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Section removed' });
});

app.patch('/api/sections/reorder', requireAuth, (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: 'orderedIds array required' });
    return;
  }
  const db = getDb();
  const sectionMap = new Map(db.dynamicSections.map(s => [s.id, s]));
  const reordered = orderedIds.map((id, index) => {
    const item = sectionMap.get(id);
    if (item) {
      return { ...item, order: index + 1 };
    }
    return null;
  }).filter(Boolean) as any[];

  db.dynamicSections = reordered;
  saveDb(db);
  res.json(db.dynamicSections);
});

// ==========================================
// SKILLS & SERVICES ROUTES
// ==========================================
app.get('/api/skills', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.skills);
});

app.post('/api/skills', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const newSkill = {
    ...req.body,
    id: req.body.id || `sk-${Date.now()}`,
    order: db.skills.length + 1
  };
  db.skills.push(newSkill);
  saveDb(db);
  res.status(201).json(newSkill);
});

app.put('/api/skills/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.skills.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  db.skills[idx] = { ...db.skills[idx], ...req.body, id };
  saveDb(db);
  res.json(db.skills[idx]);
});

app.delete('/api/skills/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.skills = db.skills.filter(s => s.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Services
app.get('/api/services', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.services);
});

app.post('/api/services', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const newService = {
    ...req.body,
    id: req.body.id || `srv-${Date.now()}`,
    order: db.services.length + 1
  };
  db.services.push(newService);
  saveDb(db);
  res.status(201).json(newService);
});

app.put('/api/services/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.services.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  db.services[idx] = { ...db.services[idx], ...req.body, id };
  saveDb(db);
  res.json(db.services[idx]);
});

app.delete('/api/services/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.services = db.services.filter(s => s.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// ==========================================
// TESTIMONIALS ROUTES
// ==========================================
app.get('/api/testimonials', (_req: Request, res: Response) => {
  const db = getDb();
  res.json(db.testimonials);
});

app.post('/api/testimonials', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const item = {
    ...req.body,
    id: req.body.id || `test-${Date.now()}`,
    order: db.testimonials.length + 1,
    isPublished: req.body.isPublished !== false
  };
  db.testimonials.push(item);
  saveDb(db);
  res.status(201).json(item);
});

app.put('/api/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.testimonials.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }
  db.testimonials[idx] = { ...db.testimonials[idx], ...req.body, id };
  saveDb(db);
  res.json(db.testimonials[idx]);
});

app.delete('/api/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.testimonials = db.testimonials.filter(t => t.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// ==========================================
// FILE UPLOAD & MEDIA LIBRARY ROUTES
// ==========================================
app.post('/api/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  const file = (req as any).file;
  
  // If multipart file was uploaded
  if (file) {
    const publicUrl = `/api/media-raw/${file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });
    return;
  }

  // Handle base64 JSON upload fallback
  const { fileName, fileType, base64Data } = req.body || {};
  if (base64Data) {
    const cleanBase = base64Data.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(cleanBase, 'base64');
    const ext = path.extname(fileName || '') || (fileType?.includes('image') ? '.jpg' : '.mp4');
    const baseClean = path.basename(fileName || 'upload', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${baseClean}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    res.json({
      success: true,
      url: `/api/media-raw/${safeFilename}`,
      filename: safeFilename,
      originalName: fileName || safeFilename,
      size: buffer.length,
      mimetype: fileType || 'application/octet-stream'
    });
    return;
  }

  res.status(400).json({ error: 'No file uploaded' });
});

// Cloud storage configuration endpoint
app.get('/api/storage/config', (_req: Request, res: Response) => {
  const db = getDb();
  const custom: Partial<CloudStorageSettings> = db?.storageSettings || {};
  const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME || custom.cloudinaryCloudName);
  const hasSupabase = Boolean((process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) || (custom.supabaseUrl && custom.supabaseAnonKey));

  res.json({
    provider: custom.provider || (hasCloudinary ? 'cloudinary' : hasSupabase ? 'supabase' : 'server'),
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || custom.cloudinaryCloudName || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || custom.cloudinaryUploadPreset || '',
      hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY || custom.cloudinaryApiKey),
      isConfigured: hasCloudinary
    },
    supabase: {
      url: process.env.SUPABASE_URL || custom.supabaseUrl || '',
      bucket: process.env.SUPABASE_STORAGE_BUCKET || custom.supabaseBucket || 'portfolio-media',
      isConfigured: hasSupabase
    },
    serverUploadAvailable: true
  });
});

// Server-side Cloudinary signature for secure uploads
app.post('/api/storage/sign', requireAuth, (req: Request, res: Response) => {
  const { paramsToSign = {} } = req.body;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    res.status(400).json({ error: 'CLOUDINARY_API_SECRET is not configured on server' });
    return;
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const toSign = sortedKeys.map(k => `${k}=${paramsToSign[k]}`).join('&') + secret;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  res.json({
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || ''
  });
});

app.get('/api/media', requireAuth, (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const mediaList = files.map(filename => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stat = fs.statSync(filePath);
      const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(filename);
      const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
      return {
        filename,
        url: `/api/media-raw/${filename}`,
        size: stat.size,
        type: isVideo ? 'video' : isImage ? 'image' : 'file',
        createdAt: stat.birthtime
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(mediaList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read uploads directory' });
  }
});

app.delete('/api/media/:filename', requireAuth, (req: Request, res: Response) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const targetPath = path.join(UPLOADS_DIR, safeFilename);

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    res.json({ success: true, message: 'File deleted' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// ==========================================
// BACKUP & RESTORE ROUTES
// ==========================================
app.get('/api/backup', requireAuth, (_req: Request, res: Response) => {
  const db = getDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=asma-shehzadi-portfolio-backup-${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/restore', requireAuth, (req: Request, res: Response) => {
  const backupData = req.body as WebsiteData;
  if (!backupData || !backupData.hero || !backupData.videos) {
    res.status(400).json({ error: 'Invalid backup file structure' });
    return;
  }
  saveDb(backupData);
  res.json({ success: true, message: 'Database restored successfully', data: backupData });
});

app.post('/api/reset-demo', requireAuth, (_req: Request, res: Response) => {
  saveDb(initialWebsiteData);
  res.json({ success: true, message: 'Reset to demo data completed', data: initialWebsiteData });
});

// ==========================================
// INTEGRATE VITE (DEV) OR STATIC DIST (PROD)
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
