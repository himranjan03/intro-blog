import React, { useState } from 'react';
import { X, Tag, Calendar, ExternalLink, Copy, Check, GitCommit } from 'lucide-react';

export default function ChangelogModal({ software, onClose }) {
  const [copiedVersion, setCopiedVersion] = useState(null);

  if (!software) return null;

  const handleCopy = (release) => {
    const text = `### ${software.title} ${release.version} (${release.date})\n\n**${release.highlight || ''}**\n\n${(release.changes || []).map(c => `- ${c}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedVersion(release.version);
    setTimeout(() => setCopiedVersion(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{software.title}</h3>
              <span className="badge badge-version">
                <Tag size={12} />
                <span>Current: {software.currentVersion}</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Historical version release logs and feature changes
            </p>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Releases List */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {(software.releases || []).map((rel, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: 'var(--primary)'
                  }}>
                    {rel.version}
                  </span>
                  {idx === 0 && (
                    <span className="badge badge-stable">Latest</span>
                  )}
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {rel.date}
                  </span>
                </div>

                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleCopy(rel)}
                  title="Copy release markdown"
                >
                  {copiedVersion === rel.version ? (
                    <>
                      <Check size={13} color="var(--emerald)" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>
              </div>

              {rel.highlight && (
                <p style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '0.75rem'
                }}>
                  {rel.highlight}
                </p>
              )}

              {rel.changes && rel.changes.length > 0 && (
                <ul style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  paddingLeft: '0.5rem'
                }}>
                  {rel.changes.map((ch, cIdx) => (
                    <li key={cIdx} style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <GitCommit size={14} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--secondary)' }} />
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
