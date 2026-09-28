import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import * as db from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const CLIENT_DIST = path.resolve(__dirname, '../client/dist');

const app = express();

// Initialize DB
db.loadDb();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  const pin = req.headers['x-admin-pin'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.admin_pin;
  if (!pin || pin !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }
  next();
};

/* ================= API ROUTES ================= */

// Health & telemetry
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024)
    },
    pm2: {
      instanceId: process.env.INSTANCE_ID || 'standalone',
      app: process.env.name || 'personal-space'
    }
  });
});

// Single bundle fetch for rapid initial page load
app.get('/api/all', (req, res) => {
  try {
    const profile = db.getProfile();
    const career = db.getCareer();
    const software = db.getSoftware();
    const posts = db.getPosts();
    const settings = db.getSettings();

    res.json({
      profile,
      career,
      software,
      posts,
      settings: {
        siteName: settings.siteName || process.env.SITE_NAME || 'Himanshu Ranjan | Personal Space',
        siteDescription: settings.siteDescription || '',
        footerNote: settings.footerNote || ''
      }
    });
  } catch (err) {
    console.error('Error fetching initial payload:', err);
    res.status(500).json({ error: 'Failed to fetch platform data' });
  }
});

// Auth check
app.post('/api/auth/verify', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_SECRET) {
    return res.json({ authenticated: true, message: 'Admin verified successfully' });
  }
  return res.status(401).json({ authenticated: false, message: 'Invalid admin key' });
});

// Profile
app.get('/api/profile', (req, res) => {
  res.json(db.getProfile());
});

app.put('/api/profile', requireAdmin, (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Career Profile
app.get('/api/career', (req, res) => {
  res.json(db.getCareer());
});

app.post('/api/career', requireAdmin, (req, res) => {
  try {
    const item = db.addCareerItem(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add career item' });
  }
});

app.put('/api/career/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateCareerItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Career item not found' });
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update career item' });
  }
});

app.delete('/api/career/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteCareerItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Career item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete career item' });
  }
});

// Software & Version Tracker
app.get('/api/software', (req, res) => {
  res.json(db.getSoftware());
});

app.post('/api/software', requireAdmin, (req, res) => {
  try {
    const item = db.addSoftware(req.body);
    res.status(201).json({ success: true, software: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create software entry' });
  }
});

app.put('/api/software/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSoftware(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Software not found' });
    res.json({ success: true, software: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update software entry' });
  }
});

// Push a new software version release!
app.post('/api/software/:id/release', requireAdmin, (req, res) => {
  try {
    const { version, highlight, changes, date } = req.body;
    if (!version) {
      return res.status(400).json({ error: 'Version string is required (e.g. v2.1.0)' });
    }
    const updated = db.addSoftwareRelease(req.params.id, { version, highlight, changes, date });
    if (!updated) return res.status(404).json({ error: 'Software not found' });
    res.json({ success: true, software: updated, message: `Successfully released ${version}!` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to push release' });
  }
});

app.delete('/api/software/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteSoftware(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Software not found' });
    res.json({ success: true, message: 'Software deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete software' });
  }
});

// Blog Posts
app.get('/api/posts', (req, res) => {
  res.json(db.getPosts());
});

app.get('/api/posts/:slug', (req, res) => {
  const post = db.getPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.post('/api/posts', requireAdmin, (req, res) => {
  try {
    const newPost = db.createPost(req.body);
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

app.put('/api/posts/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updatePost(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Contact Form
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const saved = db.saveContactMessage({ name, email, message });
    res.status(201).json({ success: true, message: 'Message sent successfully!', id: saved.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/messages', requireAdmin, (req, res) => {
  res.json(db.getMessages());
});

app.patch('/api/messages/:id/read', requireAdmin, (req, res) => {
  const msg = db.markMessageRead(req.params.id);
  res.json({ success: true, message: msg });
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({
    siteName: settings.siteName || process.env.SITE_NAME || 'Himanshu Ranjan | Personal Space',
    siteDescription: settings.siteDescription || '',
    footerNote: settings.footerNote || ''
  });
});

app.put('/api/settings', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/* ================= STATIC ASSETS & SPA ROUTING ================= */

if (fs.existsSync(CLIENT_DIST)) {
  console.log(`Serving static production client from: ${CLIENT_DIST}`);
  app.use(express.static(CLIENT_DIST, {
    maxAge: '1d',
    etag: true
  }));

  // Fallback all other GET routes to index.html for React Router
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  console.log('Client dist folder not yet built. Run `npm run build` to generate it.');
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Backend Active</title></head>
        <body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#f8fafc;">
          <h2>API Server is running on port ${PORT}</h2>
          <p>Client build is not compiled yet. Run <code>npm run build</code> in the root directory.</p>
          <p>Check health at <a href="/api/health" style="color:#38bdf8;">/api/health</a></p>
        </body>
      </html>
    `);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ================= SERVER LIFECYCLE ================= */

const server = app.listen(PORT, () => {
  console.log(`
=============================================================
🚀 Personal Space Platform is live!
🌐 URL: http://localhost:${PORT}
⚡ Environment: ${process.env.NODE_ENV || 'production'}
🛡️ Admin Pin Default: ${ADMIN_SECRET}
=============================================================
  `);
});

// PM2 Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[${signal}] Initiating graceful shutdown...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forceful shutdown triggered after timeout.');
    process.exit(1);
  }, 8000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
