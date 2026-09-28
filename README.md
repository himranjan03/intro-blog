# Personal Space & Portfolio Platform 🚀

A modern, high-performance, and interactive personal website featuring:
- **Personal Technical Blog** (Markdown support, categories, search, reading times, tags).
- **Career Roadmap & Timeline** (Industry roles, achievements, skills filter, education).
- **Software Showcase with Living Version Tracking** (Version badges, release highlights, interactive changelogs, GitHub & Demo links).
- **Social & Professional Links** (LinkedIn, GitHub, X/Twitter, direct email with copy-to-clipboard).
- **Admin Studio** (Protected dashboard to publish blog posts, push software versions, add career milestones, and edit profile live without writing code).
- **Process Manager (PM2)** (Production-ready daemon supervisor with zero-downtime hot reload, log rotation, and memory leak protection).
- **Zero Cloud Lock-in** (Open-source libraries, fast Express backend, atomic JSON persistence, and modern Vanilla CSS).

---

## ⚡ Quick Start

The platform is already built and running live locally on **http://localhost:3000** via **PM2**!

### 1. View Website
Open your browser and navigate to:
```bash
http://localhost:3000
```

### 2. Admin Studio
- Click the **"Studio"** button in the top right navbar (or footer).
- Enter the default Admin Key: `admin123` (configured in `.env`).
- You can now:
  - 🏷️ **Push a new software release**: Choose a software project, input the new version (e.g. `v2.6.0`), and bullet points. It immediately updates live on the website!
  - ✍️ **Write and publish blog articles**: Full markdown formatting with code blocks and cover images.
  - 💼 **Add career milestones**: Roles, achievements, and tech stack.
  - 👤 **Update your profile**: Name, tagline, bio, LinkedIn, GitHub, email, and avatar.
  - 📈 **PM2 Telemetry**: View live process status, memory consumption (RSS), and incoming contact messages.

---

## 🛠️ PM2 Management Commands

Use these built-in npm scripts to manage the application in production:

| Command | Description |
| :--- | :--- |
| `npm run pm2:status` | View PM2 process table, status, memory, and CPU usage |
| `npm run pm2:logs` | Stream live production logs (`./logs/pm2-out.log` and `pm2-error.log`) |
| `npm run pm2:restart` | Gracefully restart application with zero connection drops |
| `npm run pm2:stop` | Stop the PM2 process |
| `npm run pm2:start` | Start the platform daemon via `ecosystem.config.cjs` |

---

## 💻 Development Mode

If you wish to make code modifications to the frontend with Hot Module Replacement (HMR):

```bash
# Terminal 1: Start backend
npm run dev:server

# Terminal 2: Start Vite client dev server with API proxy
npm run dev:client
```

To re-compile the production bundle after code edits:
```bash
npm run build
npm run pm2:restart
```

---

## 🌐 Deploying to Production / Going Live

This repository is ready to go live on any cloud VPS (Ubuntu, Debian, macOS, DigitalOcean, Hetzner, AWS, etc.):

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env to set your desired PORT and strong ADMIN_SECRET
   nano .env
   ```

3. **Build & Start via PM2**:
   ```bash
   npm run build
   npm run pm2:start
   ```

4. **Make PM2 Auto-Start on System Boot**:
   ```bash
   npx pm2 startup
   npx pm2 save
   ```

5. **(Optional) Nginx Reverse Proxy**:
   Point your domain name (e.g. `yourname.com`) to `http://localhost:3000`:
   ```nginx
   server {
       server_name yourname.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 📁 Project Architecture

```
├── client/                     # Modern React + Vite frontend
│   ├── src/
│   │   ├── components/         # Hero, Career, Software, Blog, AdminStudio, Modals
│   │   ├── styles/             # Component styles & Glassmorphism
│   │   ├── index.css           # Core Design System (OKLCH, gradients, animations)
│   │   ├── App.jsx             # Main interactive application
│   │   └── main.jsx
│   └── dist/                   # Compiled production bundle
├── data/
│   └── db.json                 # Atomic JSON persistence (posts, software, profile)
├── server/
│   ├── db.js                   # Database controller & transaction helper
│   └── index.js                # Express API & SPA static server with graceful shutdown
├── logs/                       # PM2 stdout & stderr log files
├── ecosystem.config.cjs        # Production PM2 process configuration
├── .env                        # Port & Admin Key credentials
└── package.json                # Project scripts & open-source dependencies
```

---

## 🎨 Changing Site Name & Details

You can change the site name and branding anytime:
1. In the **Admin Studio** under the **Profile & Links** tab.
2. Or by editing `SITE_NAME` in [`.env`](file:///Users/himanshuranjan/anti-blog/.env) or [`data/db.json`](file:///Users/himanshuranjan/anti-blog/data/db.json).
