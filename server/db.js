import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../data/db.json');
const DATA_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache with file mtime tracking
let dbCache = null;
let lastMtime = 0;

export function loadDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database file not found at ${DB_PATH}`);
    }
    const stat = fs.statSync(DB_PATH);
    if (!dbCache || stat.mtimeMs > lastMtime) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      dbCache = JSON.parse(raw);
      lastMtime = stat.mtimeMs;
    }
    return dbCache;
  } catch (err) {
    console.error('Error loading db.json:', err);
    if (dbCache) return dbCache;
    throw err;
  }
}

export function saveDb(data) {
  try {
    const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
    dbCache = data;
    try {
      lastMtime = fs.statSync(DB_PATH).mtimeMs;
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('Error saving db.json:', err);
    throw err;
  }
}

export function getDb() {
  return loadDb();
}

// Helper methods
export function getProfile() {
  const db = getDb();
  return db.profile || {};
}

export function updateProfile(newProfile) {
  const db = getDb();
  db.profile = {
    ...db.profile,
    ...newProfile,
    social: {
      ...(db.profile?.social || {}),
      ...(newProfile.social || {})
    }
  };
  saveDb(db);
  return db.profile;
}

export function getCareer() {
  const db = getDb();
  return db.career || [];
}

export function addCareerItem(item) {
  const db = getDb();
  const newItem = {
    id: `exp-${Date.now()}`,
    role: item.role || 'New Role',
    company: item.company || 'Company',
    location: item.location || '',
    period: item.period || '2026',
    type: item.type || 'work',
    summary: item.summary || '',
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
    technologies: Array.isArray(item.technologies) ? item.technologies : []
  };
  db.career = [newItem, ...(db.career || [])];
  saveDb(db);
  return newItem;
}

export function updateCareerItem(id, updates) {
  const db = getDb();
  const index = (db.career || []).findIndex(c => c.id === id);
  if (index === -1) return null;
  db.career[index] = { ...db.career[index], ...updates };
  saveDb(db);
  return db.career[index];
}

export function deleteCareerItem(id) {
  const db = getDb();
  const initialLength = (db.career || []).length;
  db.career = (db.career || []).filter(c => c.id !== id);
  saveDb(db);
  return db.career.length < initialLength;
}

// Software and version management
export function getSoftware() {
  const db = getDb();
  return db.software || [];
}

export function addSoftware(item) {
  const db = getDb();
  const newSoftware = {
    id: `soft-${Date.now()}`,
    title: item.title || 'Untitled Software',
    tagline: item.tagline || '',
    description: item.description || '',
    currentVersion: item.currentVersion || 'v1.0.0',
    status: item.status || 'Active',
    category: item.category || 'General',
    icon: item.icon || 'Cpu',
    githubUrl: item.githubUrl || '',
    demoUrl: item.demoUrl || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    releases: [
      {
        version: item.currentVersion || 'v1.0.0',
        date: new Date().toISOString().split('T')[0],
        highlight: 'Initial release',
        changes: ['Initial release of software.']
      }
    ]
  };
  db.software = [newSoftware, ...(db.software || [])];
  saveDb(db);
  return newSoftware;
}

export function updateSoftware(id, updates) {
  const db = getDb();
  const index = (db.software || []).findIndex(s => s.id === id);
  if (index === -1) return null;
  db.software[index] = { ...db.software[index], ...updates };
  saveDb(db);
  return db.software[index];
}

export function addSoftwareRelease(softwareId, releaseData) {
  const db = getDb();
  const index = (db.software || []).findIndex(s => s.id === softwareId);
  if (index === -1) return null;

  const target = db.software[index];
  const newRelease = {
    version: releaseData.version || `v${Date.now()}`,
    date: releaseData.date || new Date().toISOString().split('T')[0],
    highlight: releaseData.highlight || 'New version release',
    changes: Array.isArray(releaseData.changes)
      ? releaseData.changes
      : typeof releaseData.changes === 'string'
      ? releaseData.changes.split('\n').filter(Boolean)
      : ['General improvements and bug fixes.']
  };

  // Prepend release to history and update currentVersion
  target.currentVersion = newRelease.version;
  target.releases = [newRelease, ...(target.releases || [])];
  db.software[index] = target;
  saveDb(db);
  return target;
}

export function deleteSoftware(id) {
  const db = getDb();
  const initialLength = (db.software || []).length;
  db.software = (db.software || []).filter(s => s.id !== id);
  saveDb(db);
  return db.software.length < initialLength;
}

// Blog Posts
export function getPosts() {
  const db = getDb();
  return (db.posts || []).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPostBySlug(slug) {
  const db = getDb();
  return (db.posts || []).find(p => p.slug === slug) || null;
}

export function createPost(post) {
  const db = getDb();
  const slug = (post.slug || post.title || `post-${Date.now()}`)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const newPost = {
    id: `post-${Date.now()}`,
    slug,
    title: post.title || 'Untitled Post',
    summary: post.summary || '',
    category: post.category || 'General',
    tags: Array.isArray(post.tags) ? post.tags : (post.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    publishedAt: post.publishedAt || new Date().toISOString().split('T')[0],
    readTime: post.readTime || `${Math.max(1, Math.ceil((post.content || '').split(/\s+/).length / 200))} min read`,
    coverImage: post.coverImage || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: post.author || db.profile?.name || 'Himanshu Ranjan',
    content: post.content || ''
  };

  db.posts = [newPost, ...(db.posts || [])];
  saveDb(db);
  return newPost;
}

export function updatePost(id, updates) {
  const db = getDb();
  const index = (db.posts || []).findIndex(p => p.id === id);
  if (index === -1) return null;
  db.posts[index] = { ...db.posts[index], ...updates };
  saveDb(db);
  return db.posts[index];
}

export function deletePost(id) {
  const db = getDb();
  const initialLength = (db.posts || []).length;
  db.posts = (db.posts || []).filter(p => p.id !== id);
  saveDb(db);
  return db.posts.length < initialLength;
}

// Contact messages
export function saveContactMessage(msg) {
  const db = getDb();
  const newMsg = {
    id: `msg-${Date.now()}`,
    name: msg.name || 'Anonymous',
    email: msg.email || '',
    message: msg.message || '',
    date: new Date().toISOString(),
    read: false
  };
  db.messages = [newMsg, ...(db.messages || [])];
  saveDb(db);
  return newMsg;
}

export function getMessages() {
  const db = getDb();
  return db.messages || [];
}

export function markMessageRead(id) {
  const db = getDb();
  const msg = (db.messages || []).find(m => m.id === id);
  if (msg) {
    msg.read = true;
    saveDb(db);
  }
  return msg;
}

// Site settings
export function getSettings() {
  const db = getDb();
  return db.settings || {};
}

export function updateSettings(updates) {
  const db = getDb();
  db.settings = { ...db.settings, ...updates };
  saveDb(db);
  return db.settings;
}
