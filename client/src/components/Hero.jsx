import React from 'react';
import { 
  Mail, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Code2, 
  Terminal,
  ExternalLink,
  Layers
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';

export default function Hero({ profile, onOpenContact }) {
  if (!profile) return null;

  const {
    name = 'Himanshu Ranjan',
    title = 'Software Engineer & System Architect',
    tagline = 'Crafting resilient backend architectures, intuitive developer tools, and high-performance digital experiences.',
    bio = '',
    avatar,
    phone,
    location,
    social = {},
    stats = [],
    skills = {},
    coreCompetencies = []
  } = profile;

  return (
    <section id="about" className="section" style={{ paddingTop: '2.5rem' }}>
      <div className="container">
        <div className="hero-wrapper">
          {/* Left Column: Text & Bio & CTAs */}
          <div className="hero-content">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div className="hero-status-pill" style={{ marginBottom: 0 }}>
                <span className="live-dot"></span>
                <span>Backend & AI/ML Engineer @ Winjit Technologies</span>
              </div>
              {location && (
                <span className="badge badge-tag" style={{ padding: '0.4rem 0.85rem' }}>
                  📍 {location}
                </span>
              )}
            </div>

            <h1 className="hero-name">
              Hey, I'm <br />
              <span className="gradient-text">{name}</span>
            </h1>

            <h2 className="hero-tagline">{title}</h2>
            <p className="hero-bio">{bio || tagline}</p>

            {/* Main Action Buttons */}
            <div className="hero-cta-group">
              <a href="#software" className="btn btn-primary">
                <span>Explore Software</span>
                <ArrowRight size={17} />
              </a>

              <a href="#blog" className="btn btn-secondary">
                <FileText size={17} />
                <span>Read Blog</span>
              </a>

              <button className="btn btn-outline" onClick={onOpenContact}>
                <Mail size={17} />
                <span>Get in Touch</span>
              </button>
            </div>

            {/* Social Links (LinkedIn, GitHub, Twitter, Email) */}
            <div className="hero-social-links">
              {social.linkedin && (
                <a 
                  href={social.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-badge"
                  title="Connect on LinkedIn"
                >
                  <LinkedinIcon size={18} color="#0a66c2" />
                  <span>LinkedIn</span>
                  <ExternalLink size={13} style={{ opacity: 0.6 }} />
                </a>
              )}

              {social.github && (
                <a 
                  href={social.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-badge"
                  title="Explore GitHub Repositories"
                >
                  <GithubIcon size={18} />
                  <span>GitHub</span>
                  <ExternalLink size={13} style={{ opacity: 0.6 }} />
                </a>
              )}

              {social.twitter && (
                <a 
                  href={social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-badge"
                  title="Follow on Twitter / X"
                >
                  <TwitterIcon size={18} color="#38bdf8" />
                  <span>X / Twitter</span>
                </a>
              )}

              {social.email && (
                <a 
                  href={social.email} 
                  className="social-badge"
                  title="Send an Email"
                >
                  <Mail size={18} color="#c084fc" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Visual Showcase & Stats */}
          <div className="hero-visual-col">
            <div className="hero-visual-card">
              <div className="hero-avatar-wrapper">
                <img 
                  src={avatar || '/profile.jpg'} 
                  alt={name} 
                  className="hero-avatar-img"
                  loading="eager"
                />
              </div>

              {/* Dynamic Stats Grid */}
              <div className="hero-floating-stat">
                {stats.map((s, idx) => (
                  <div key={idx} className="stat-box">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Competencies Cluster */}
        <div className="skills-cluster-section" style={{ marginTop: '3.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <span className="section-tag">
              <Layers size={14} />
              <span>Core Tech Stack</span>
            </span>
          </div>

          <div className="skills-grid">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="glass-card skill-category-card">
                <h3 className="skill-category-title">
                  <Code2 size={16} color="#38bdf8" />
                  <span>{category}</span>
                </h3>
                <div className="skill-pills">
                  {items.map((tech, i) => (
                    <span key={i} className="skill-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Competencies Matrix */}
        {coreCompetencies && coreCompetencies.length > 0 && (
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              ⚡ Core Engineering Competencies
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem',
              justifyContent: 'center',
              maxWidth: 900,
              margin: '0 auto'
            }}>
              {coreCompetencies.map((comp, idx) => (
                <span 
                  key={idx} 
                  className="badge badge-tag"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    background: 'var(--bg-glass-card)',
                    borderColor: 'var(--border-glass)',
                    color: 'var(--text-main)'
                  }}
                >
                  ✓ {comp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
