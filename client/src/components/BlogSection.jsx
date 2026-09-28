import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, Calendar, Clock, Tag } from 'lucide-react';

export default function BlogSection({ posts = [], onSelectPost, onNewPost, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract categories dynamically
  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      post.title?.toLowerCase().includes(term) ||
      post.summary?.toLowerCase().includes(term) ||
      post.tags?.some(t => t.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="blog" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <BookOpen size={14} />
            <span>Technical Blog</span>
          </span>
          <h2 className="section-title">Articles & Insights</h2>
          <p className="section-subtitle">
            Deep dives into distributed architecture, process supervision with PM2, modern web platform patterns, and engineering craftsmanship.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div className="blog-controls">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              className="search-input"
              placeholder="Search articles, tags, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="blog-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No articles found matching your criteria.</p>
            <button className="btn btn-sm btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="glass-card post-card animate-fade-in"
                onClick={() => onSelectPost(post)}
              >
                {post.coverImage && (
                  <div className="post-cover-wrapper">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="post-cover-img"
                      loading="lazy"
                    />
                    {post.category && (
                      <span className="post-category-tag">
                        {post.category}
                      </span>
                    )}
                  </div>
                )}

                <div className="post-content-box">
                  <div className="post-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-summary">{post.summary}</p>

                  <div className="post-footer">
                    <span>Read Article</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
