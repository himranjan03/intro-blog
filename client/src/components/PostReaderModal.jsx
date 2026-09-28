import React, { useMemo } from 'react';
import { X, Calendar, Clock, User, Share2, Tag, Check } from 'lucide-react';
import { marked } from 'marked';

export default function PostReaderModal({ post, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!post) return null;

  // Safe parse markdown
  const htmlContent = useMemo(() => {
    try {
      return marked.parse(post.content || '');
    } catch (e) {
      return `<p>${post.content}</p>`;
    }
  }, [post.content]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content reader-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image Banner */}
        {post.coverImage && (
          <div style={{ position: 'relative', width: '100%', height: 260, overflow: 'hidden' }}>
            <img 
              src={post.coverImage} 
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 80%)'
            }} />
          </div>
        )}

        {/* Reader Header */}
        <div className="reader-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <span className="badge badge-version" style={{ fontSize: '0.8125rem' }}>
              {post.category || 'Engineering'}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="icon-btn" onClick={handleShare} title="Share article">
                {copied ? <Check size={16} color="var(--emerald)" /> : <Share2 size={16} />}
              </button>
              <button className="icon-btn" onClick={onClose} aria-label="Close article">
                <X size={18} />
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} color="var(--primary)" />
              {post.author || 'Himanshu Ranjan'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} />
              {post.publishedAt}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Markdown Rendered Content */}
        <div 
          className="reader-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Article Footer with Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            padding: '1.5rem 2rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <Tag size={15} color="var(--text-muted)" />
            {post.tags.map((tag, idx) => (
              <span key={idx} className="badge badge-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
