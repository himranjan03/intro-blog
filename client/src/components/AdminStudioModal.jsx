import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Plus, 
  Check, 
  Tag, 
  BookOpen, 
  Briefcase, 
  Cpu, 
  Activity, 
  MessageSquare, 
  User, 
  Settings as SettingsIcon,
  Trash2,
  RefreshCw,
  GitCommit
} from 'lucide-react';

export default function AdminStudioModal({ 
  isOpen, 
  onClose, 
  adminPin, 
  setAdminPin, 
  isAuthenticated, 
  setIsAuthenticated,
  onRefreshData,
  initialData = {},
  targetSoftwareForRelease,
  setTargetSoftwareForRelease
}) {
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState(targetSoftwareForRelease ? 'releases' : 'releases');
  const [statusMsg, setStatusMsg] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [messages, setMessages] = useState([]);

  // Form states
  // 1. New Software Version Release
  const [releaseForm, setReleaseForm] = useState({
    softwareId: targetSoftwareForRelease?.id || '',
    version: '',
    highlight: '',
    changes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 2. New Software Creation
  const [softwareForm, setSoftwareForm] = useState({
    title: '',
    tagline: '',
    description: '',
    currentVersion: 'v1.0.0',
    status: 'Active',
    category: 'Developer Tools',
    icon: 'Cpu',
    githubUrl: '',
    demoUrl: '',
    tags: 'Node.js, Open Source'
  });

  // 3. New Blog Post
  const [postForm, setPostForm] = useState({
    title: '',
    summary: '',
    category: 'Architecture & DevOps',
    tags: 'DevOps, Architecture',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    content: '### New Article Heading\n\nWrite your markdown content here...'
  });

  // 4. Career Form
  const [careerForm, setCareerForm] = useState({
    role: '',
    company: '',
    period: '2026 - Present',
    type: 'work',
    summary: '',
    achievements: 'Architected scalable microservices\nImplemented automated PM2 zero-downtime reloads',
    technologies: 'Node.js, Express, PM2'
  });

  // 5. Profile Form
  const [profileForm, setProfileForm] = useState(initialData.profile || {});

  useEffect(() => {
    if (targetSoftwareForRelease) {
      setReleaseForm(prev => ({ ...prev, softwareId: targetSoftwareForRelease.id }));
      setActiveTab('releases');
    }
  }, [targetSoftwareForRelease]);

  useEffect(() => {
    if (initialData.profile) {
      setProfileForm(initialData.profile);
    }
  }, [initialData.profile]);

  // Fetch health telemetry and messages when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHealth();
      fetchMessages();
    }
  }, [isAuthenticated]);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: { 'x-admin-pin': adminPin }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {}
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAdminPin(pinInput);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid Admin Key. Check your .env file (default: admin123)');
      }
    } catch (err) {
      setAuthError('Connection failed: ' + err.message);
    }
  };

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Submit Software Release
  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!releaseForm.softwareId) {
      alert('Please select a software tool to update.');
      return;
    }

    try {
      const changesArr = releaseForm.changes.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/software/${releaseForm.softwareId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          version: releaseForm.version,
          highlight: releaseForm.highlight,
          changes: changesArr,
          date: releaseForm.date
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showFeedback(`Version ${releaseForm.version} released successfully!`);
      setReleaseForm({
        softwareId: releaseForm.softwareId,
        version: '',
        highlight: '',
        changes: '',
        date: new Date().toISOString().split('T')[0]
      });
      onRefreshData();
    } catch (err) {
      alert('Failed to release: ' + err.message);
    }
  };

  // Submit New Software Entry
  const handleSoftwareSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArr = softwareForm.tags.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/software', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          ...softwareForm,
          tags: tagsArr
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showFeedback(`Software "${softwareForm.title}" added!`);
      onRefreshData();
      setActiveTab('releases');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Submit New Blog Post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArr = postForm.tags.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          ...postForm,
          tags: tagsArr
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showFeedback(`Article "${postForm.title}" published!`);
      setPostForm({
        title: '',
        summary: '',
        category: 'Architecture & DevOps',
        tags: '',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        content: ''
      });
      onRefreshData();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Submit Career Entry
  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    try {
      const achArr = careerForm.achievements.split('\n').map(s => s.trim()).filter(Boolean);
      const techArr = careerForm.technologies.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          ...careerForm,
          achievements: achArr,
          technologies: techArr
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showFeedback('Career milestone added!');
      onRefreshData();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  // Submit Profile Updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showFeedback('Profile & social links updated live!');
      onRefreshData();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content studio-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Admin Studio</h3>
            {isAuthenticated && (
              <span className="badge badge-stable" style={{ fontSize: '0.75rem' }}>
                Authenticated
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAuthenticated && (
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => { onRefreshData(); fetchHealth(); fetchMessages(); }}
                title="Refresh Live Data"
              >
                <RefreshCw size={13} />
                <span>Sync</span>
              </button>
            )}
            <button className="icon-btn" onClick={onClose} aria-label="Close studio">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--primary-glow)',
              border: '1px solid var(--border-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--primary)'
            }}>
              <Key size={26} />
            </div>

            <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Enter Admin Key</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Unlock live editing to release software versions, publish blogs, and update your career roadmap.
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="password"
                  required
                  placeholder="Enter admin key (default: admin123)"
                  className="form-input"
                  style={{ textAlign: 'center', letterSpacing: '0.1em' }}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
              </div>

              {authError && (
                <p style={{ color: 'var(--rose)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {authError}
                </p>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Access Studio</span>
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Feedback notification toast */}
            {statusMsg && (
              <div style={{
                background: 'rgba(52, 211, 153, 0.15)',
                borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
                color: 'var(--emerald)',
                padding: '0.65rem 1.75rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Check size={16} />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="studio-tabs">
              <button 
                className={`studio-tab-btn ${activeTab === 'releases' ? 'active' : ''}`}
                onClick={() => setActiveTab('releases')}
              >
                <Tag size={15} style={{ display: 'inline', marginRight: 6 }} />
                Update Software Versions
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'new-software' ? 'active' : ''}`}
                onClick={() => setActiveTab('new-software')}
              >
                <Cpu size={15} style={{ display: 'inline', marginRight: 6 }} />
                Add Software
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                onClick={() => setActiveTab('blog')}
              >
                <BookOpen size={15} style={{ display: 'inline', marginRight: 6 }} />
                Write Blog Post
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'career' ? 'active' : ''}`}
                onClick={() => setActiveTab('career')}
              >
                <Briefcase size={15} style={{ display: 'inline', marginRight: 6 }} />
                Career
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={15} style={{ display: 'inline', marginRight: 6 }} />
                Profile & Links
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
                onClick={() => setActiveTab('health')}
              >
                <Activity size={15} style={{ display: 'inline', marginRight: 6 }} />
                PM2 & Telemetry
              </button>

              <button 
                className={`studio-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare size={15} style={{ display: 'inline', marginRight: 6 }} />
                Messages ({messages.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="studio-content">
              {/* TAB 1: PUSH SOFTWARE VERSION */}
              {activeTab === 'releases' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Push New Software Version Release
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    This will immediately bump the version badge on the live website and add a new changelog entry.
                  </p>

                  <form onSubmit={handleReleaseSubmit}>
                    <div className="form-group">
                      <label className="form-label">Select Software Tool</label>
                      <select 
                        className="form-select"
                        value={releaseForm.softwareId}
                        onChange={(e) => setReleaseForm({ ...releaseForm, softwareId: e.target.value })}
                        required
                      >
                        <option value="">-- Choose software --</option>
                        {(initialData.software || []).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title} (Current: {s.currentVersion})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">New Version (e.g. v2.5.0)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="v2.5.0"
                          className="form-input"
                          value={releaseForm.version}
                          onChange={(e) => setReleaseForm({ ...releaseForm, version: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Release Date</label>
                        <input 
                          type="date" 
                          required
                          className="form-input"
                          value={releaseForm.date}
                          onChange={(e) => setReleaseForm({ ...releaseForm, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Release Highlight</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 40% memory reduction & TLS connection reuse"
                        className="form-input"
                        value={releaseForm.highlight}
                        onChange={(e) => setReleaseForm({ ...releaseForm, highlight: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Changelog Bullet Points (one per line)</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="Added Redis cluster sentinel failover support&#10;Upgraded streaming buffer for payloads >50MB&#10;Fixed edge-case connection timeout"
                        className="form-textarea"
                        value={releaseForm.changes}
                        onChange={(e) => setReleaseForm({ ...releaseForm, changes: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                      <Tag size={16} />
                      <span>Publish Version Release</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: ADD NEW SOFTWARE */}
              {activeTab === 'new-software' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Add New Software or Open Source Project
                  </h4>
                  <form onSubmit={handleSoftwareSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Software Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. HyperRoute"
                          className="form-input"
                          value={softwareForm.title}
                          onChange={(e) => setSoftwareForm({ ...softwareForm, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Initial Version</label>
                        <input 
                          type="text" 
                          required
                          placeholder="v1.0.0"
                          className="form-input"
                          value={softwareForm.currentVersion}
                          onChange={(e) => setSoftwareForm({ ...softwareForm, currentVersion: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Short Tagline</label>
                      <input 
                        type="text" 
                        placeholder="Ultra-fast reverse proxy and API routing engine"
                        className="form-input"
                        value={softwareForm.tagline}
                        onChange={(e) => setSoftwareForm({ ...softwareForm, tagline: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Detailed Description</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="Explain architecture, purpose, and key highlights..."
                        className="form-textarea"
                        value={softwareForm.description}
                        onChange={(e) => setSoftwareForm({ ...softwareForm, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">GitHub URL</label>
                        <input 
                          type="url" 
                          placeholder="https://github.com/..."
                          className="form-input"
                          value={softwareForm.githubUrl}
                          onChange={(e) => setSoftwareForm({ ...softwareForm, githubUrl: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Demo or Documentation URL</label>
                        <input 
                          type="url" 
                          placeholder="https://..."
                          className="form-input"
                          value={softwareForm.demoUrl}
                          onChange={(e) => setSoftwareForm({ ...softwareForm, demoUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tags (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="Node.js, Proxy, Open Source"
                        className="form-input"
                        value={softwareForm.tags}
                        onChange={(e) => setSoftwareForm({ ...softwareForm, tags: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <Plus size={16} />
                      <span>Create Software Entry</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: WRITE BLOG POST */}
              {activeTab === 'blog' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Publish New Blog Article
                  </h4>
                  <form onSubmit={handlePostSubmit}>
                    <div className="form-group">
                      <label className="form-label">Article Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Scaling Node.js with PM2 and Redis"
                        className="form-input"
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Architecture & DevOps"
                          className="form-input"
                          value={postForm.category}
                          onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tags (comma-separated)</label>
                        <input 
                          type="text" 
                          placeholder="Node.js, PM2, Performance"
                          className="form-input"
                          value={postForm.tags}
                          onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cover Image URL</label>
                      <input 
                        type="url" 
                        placeholder="https://images.unsplash.com/..."
                        className="form-input"
                        value={postForm.coverImage}
                        onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Summary / Excerpt</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Brief overview of the article..."
                        className="form-textarea"
                        value={postForm.summary}
                        onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Article Content (Markdown supported)</label>
                      <textarea 
                        rows={9}
                        required
                        placeholder="Write your article in markdown. Code blocks, headers, and bullet points supported."
                        className="form-textarea"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <BookOpen size={16} />
                      <span>Publish Article</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: CAREER MILESTONES */}
              {activeTab === 'career' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Add Career Milestone
                  </h4>
                  <form onSubmit={handleCareerSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Role / Degree</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Lead Software Engineer"
                          className="form-input"
                          value={careerForm.role}
                          onChange={(e) => setCareerForm({ ...careerForm, role: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Company / Institution</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. CloudScale Labs"
                          className="form-input"
                          value={careerForm.company}
                          onChange={(e) => setCareerForm({ ...careerForm, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Period (e.g. 2024 - Present)</label>
                        <input 
                          type="text" 
                          required
                          className="form-input"
                          value={careerForm.period}
                          onChange={(e) => setCareerForm({ ...careerForm, period: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Milestone Type</label>
                        <select 
                          className="form-select"
                          value={careerForm.type}
                          onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                        >
                          <option value="work">Industry Work</option>
                          <option value="education">Education</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Summary Overview</label>
                      <input 
                        type="text" 
                        placeholder="Overview of scope and impact"
                        className="form-input"
                        value={careerForm.summary}
                        onChange={(e) => setCareerForm({ ...careerForm, summary: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bullet Point Achievements (one per line)</label>
                      <textarea 
                        rows={3}
                        className="form-textarea"
                        value={careerForm.achievements}
                        onChange={(e) => setCareerForm({ ...careerForm, achievements: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Technologies Used (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="Node.js, Docker, PM2"
                        className="form-input"
                        value={careerForm.technologies}
                        onChange={(e) => setCareerForm({ ...careerForm, technologies: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <Briefcase size={16} />
                      <span>Save Milestone</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: PROFILE & SOCIAL LINKS */}
              {activeTab === 'profile' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Profile & Social Networks
                  </h4>
                  <form onSubmit={handleProfileSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="form-input"
                          value={profileForm.name || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Headline / Title</label>
                        <input 
                          type="text" 
                          required
                          className="form-input"
                          value={profileForm.title || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tagline</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={profileForm.tagline || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bio Description</label>
                      <textarea 
                        rows={3}
                        className="form-textarea"
                        value={profileForm.bio || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">LinkedIn URL</label>
                        <input 
                          type="url" 
                          className="form-input"
                          value={profileForm.social?.linkedin || ''}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            social: { ...profileForm.social, linkedin: e.target.value }
                          })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">GitHub URL</label>
                        <input 
                          type="url" 
                          className="form-input"
                          value={profileForm.social?.github || ''}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            social: { ...profileForm.social, github: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                          type="email" 
                          className="form-input"
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Avatar Image URL</label>
                        <input 
                          type="url" 
                          className="form-input"
                          value={profileForm.avatar || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <Check size={16} />
                      <span>Save Profile Changes</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: PM2 & TELEMETRY */}
              {activeTab === 'health' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Server Health & PM2 Process Status
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Real-time operational metrics reported by the Express backend.
                  </p>

                  {healthData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div className="stat-box">
                        <div className="stat-value">{healthData.status?.toUpperCase()}</div>
                        <div className="stat-label">Backend Status</div>
                      </div>

                      <div className="stat-box">
                        <div className="stat-value">{healthData.uptimeSeconds}s</div>
                        <div className="stat-label">Process Uptime</div>
                      </div>

                      <div className="stat-box">
                        <div className="stat-value">{healthData.memoryUsageMB?.rss} MB</div>
                        <div className="stat-label">Memory (RSS)</div>
                      </div>

                      <div className="stat-box">
                        <div className="stat-value">{healthData.nodeVersion}</div>
                        <div className="stat-label">Node Runtime</div>
                      </div>
                    </div>
                  ) : (
                    <p>Loading telemetry...</p>
                  )}

                  <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      PM2 Management Quick Commands
                    </h5>
                    <pre style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>
                      npm run pm2:start    # Launch with PM2 cluster/fork daemon&#10;npm run pm2:status   # View running workers & memory&#10;npm run pm2:logs     # Stream live production logs&#10;npm run pm2:restart  # Zero-downtime hot reload
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 7: MESSAGES */}
              {activeTab === 'messages' && (
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Incoming Contact Messages ({messages.length})
                  </h4>

                  {messages.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No messages received yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {messages.map((m) => (
                        <div key={m.id} style={{
                          padding: '1.25rem',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong>{m.name} ({m.email})</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(m.date).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {m.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
