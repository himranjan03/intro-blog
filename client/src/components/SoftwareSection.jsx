import React from 'react';
import { 
  Cpu, 
  Activity, 
  FileText, 
  Terminal, 
  ExternalLink, 
  History, 
  Tag, 
  Sparkles, 
  GitBranch, 
  PlusCircle 
} from 'lucide-react';
import { GithubIcon } from './SocialIcons';

export default function SoftwareSection({ software = [], onSelectSoftware, onOpenNewRelease, isAdmin }) {
  // Map icon strings to Lucide components
  const renderIcon = (name) => {
    switch (name) {
      case 'Activity': return <Activity size={22} />;
      case 'FileText': return <FileText size={22} />;
      case 'Terminal': return <Terminal size={22} />;
      case 'Cpu':
      default: return <Cpu size={22} />;
    }
  };

  return (
    <section id="software" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <GitBranch size={14} />
            <span>Software & Releases</span>
          </span>
          <h2 className="section-title">Open Source & Tools</h2>
          <p className="section-subtitle">
            Independently built developer tooling, high-throughput microservices, and web utilities. Track live version releases and changelogs.
          </p>
        </div>

        <div className="software-grid">
          {software.map((item) => {
            const latestRelease = item.releases?.[0];

            return (
              <div key={item.id} className="glass-card software-card animate-fade-in">
                <div>
                  {/* Card Header: Icon + Version + Status */}
                  <div className="software-header">
                    <div className="software-icon-box">
                      {renderIcon(item.icon)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-version">
                        <Tag size={12} />
                        <span>{item.currentVersion}</span>
                      </span>
                      {item.status && (
                        <span className="badge badge-stable">
                          <span className="live-dot" style={{ width: 6, height: 6 }}></span>
                          <span>{item.status}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="software-title">{item.title}</h3>
                  {item.tagline && <p className="software-tagline">{item.tagline}</p>}
                  <p className="software-desc">{item.description}</p>

                  {/* Latest Release Highlight Box */}
                  {latestRelease && (
                    <div className="software-latest-release-box">
                      <div className="release-row">
                        <strong style={{ color: 'var(--text-main)' }}>Latest: {latestRelease.version}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{latestRelease.date}</span>
                      </div>
                      <p className="release-highlight">
                        {latestRelease.highlight || 'Performance and stability improvements.'}
                      </p>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  {item.tags && (
                    <div className="software-tags">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="software-footer-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => onSelectSoftware(item)}
                    title="View historical changelogs"
                  >
                    <History size={14} />
                    <span>Changelog ({item.releases?.length || 1})</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {item.githubUrl && (
                      <a 
                        href={item.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="icon-btn"
                        title="View GitHub Repository"
                      >
                        <GithubIcon size={16} />
                      </a>
                    )}
                    {item.demoUrl && (
                      <a 
                        href={item.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="icon-btn"
                        title="View Live Demo or Docs"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {isAdmin && (
                      <button 
                        className="icon-btn" 
                        style={{ color: 'var(--primary)', borderColor: 'var(--border-glow)' }}
                        onClick={() => onOpenNewRelease(item)}
                        title="Push a new version release"
                      >
                        <PlusCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
