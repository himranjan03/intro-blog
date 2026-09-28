import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
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

// Security Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

/* ================= SECURITY & RATE LIMITING ================= */

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

// In-memory brute-force rate limiter for authentication
const authRateLimiter = new Map(); // ip -> { count, firstAttempt, blockedUntil }

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
}

function checkAuthRateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = authRateLimiter.get(ip);

  if (record && record.blockedUntil && now < record.blockedUntil) {
    const waitMins = Math.ceil((record.blockedUntil - now) / 60000);
    return res.status(429).json({ 
      error: `Too many failed login attempts. IP temporarily locked for ${waitMins} minute(s).` 
    });
  }
  next();
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const record = authRateLimiter.get(ip) || { count: 0, firstAttempt: now, blockedUntil: 0 };
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
    record.blockedUntil = 0;
  } else {
    record.count += 1;
    if (record.count >= 5) {
      record.blockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
      console.warn(`[SECURITY] IP ${ip} locked out after 5 consecutive failed auth attempts.`);
    }
  }
  authRateLimiter.set(ip, record);
}

function recordSuccessfulLogin(ip) {
  authRateLimiter.delete(ip);
}

// Contact form rate limiter (max 10 submissions per hour per IP)
const contactSubmissions = new Map();
function checkContactRateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const history = (contactSubmissions.get(ip) || []).filter(t => now - t < 60 * 60 * 1000);
  if (history.length >= 10) {
    return res.status(429).json({ error: 'Too many messages sent. Please wait before submitting again.' });
  }
  history.push(now);
  contactSubmissions.set(ip, history);
  next();
}

// Admin authentication middleware (header-only, constant-time)
const requireAdmin = (req, res, next) => {
  const ip = getClientIp(req);
  const pin = req.headers['x-admin-pin'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!pin || !constantTimeCompare(pin, ADMIN_SECRET)) {
    recordFailedLogin(ip);
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }
  recordSuccessfulLogin(ip);
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

// Auth check with brute-force rate limiting
app.post('/api/auth/verify', checkAuthRateLimit, (req, res) => {
  const ip = getClientIp(req);
  const { pin } = req.body || {};
  if (pin && constantTimeCompare(pin, ADMIN_SECRET)) {
    recordSuccessfulLogin(ip);
    return res.json({ authenticated: true, message: 'Admin verified successfully' });
  }
  recordFailedLogin(ip);
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

// Contact Form with rate limiting & input sanitization
app.post('/api/contact', checkContactRateLimit, (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanMessage = String(message).trim();

    if (cleanName.length > 100 || cleanEmail.length > 150 || cleanMessage.length > 5000) {
      return res.status(400).json({ error: 'Input exceeded maximum character limits' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const saved = db.saveContactMessage({ name: cleanName, email: cleanEmail, message: cleanMessage });
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
