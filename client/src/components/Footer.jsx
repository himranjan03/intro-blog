import { Terminal, Mail, Heart, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';

export default function Footer({ profile, settings, onOpenStudio }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteName || profile?.name || 'Himanshu Ranjan';
  const social = profile?.social || {};

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="nav-logo-icon">
                <Terminal size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                {siteName}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {profile?.tagline || 'Crafting resilient backend architectures, intuitive developer tools, and high-performance digital experiences.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {social.github && (
                <a href={social.github} target="_blank" rel="noopener noreferrer" className="icon-btn" title="GitHub">
                  <GithubIcon size={17} />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="icon-btn" title="LinkedIn">
                  <LinkedinIcon size={17} color="#0a66c2" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="icon-btn" title="Twitter / X">
                  <TwitterIcon size={17} color="#38bdf8" />
                </a>
              )}
              {social.email && (
                <a href={social.email} className="icon-btn" title="Email">
                  <Mail size={17} color="#c084fc" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><a href="#about" className="nav-link">About & Bio</a></li>
              <li><a href="#career" className="nav-link">Career Experience</a></li>
              <li><a href="#software" className="nav-link">Software & Versions</a></li>
              <li><a href="#blog" className="nav-link">Technical Blog</a></li>
              <li><a href="#contact" className="nav-link">Contact Me</a></li>
            </ul>
          </div>

          {/* Infrastructure & Status */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Production Stack
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Managed with <strong>PM2</strong> supervisor. Zero-downtime hot reload, structured JSON atomic persistence, and Vite frontend.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
              <span className="live-dot" style={{ width: 7, height: 7 }}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
                SYSTEM HEALTHY (100%)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div>
            © {currentYear} {profile?.name || 'Himanshu Ranjan'}. All rights reserved. Built with Node.js & React.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={onOpenStudio} 
              style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              Admin Studio
            </button>
            <button 
              className="icon-btn" 
              onClick={scrollToTop} 
              title="Back to top"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
