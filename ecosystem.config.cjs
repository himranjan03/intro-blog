/**
 * PM2 Process Manager Ecosystem Configuration
 * Usage:
 *   npx pm2 start ecosystem.config.cjs
 *   npx pm2 status
 *   npx pm2 logs personal-space
 *   npx pm2 restart personal-space
 *   npx pm2 stop personal-space
 */

module.exports = {
  apps: [
    {
      name: "personal-space",
      script: "./server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "350M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      min_uptime: "10s",
      max_restarts: 10
    }
  ]
};
