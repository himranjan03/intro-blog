import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CareerSection from './components/CareerSection';
import SoftwareSection from './components/SoftwareSection';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ChangelogModal from './components/ChangelogModal';
import PostReaderModal from './components/PostReaderModal';
import AdminStudioModal from './components/AdminStudioModal';
import './styles/components.css';

export default function App() {
  const [data, setData] = useState({
    profile: null,
    career: [],
    software: [],
    posts: [],
    settings: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Active Selections
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [targetSoftwareForRelease, setTargetSoftwareForRelease] = useState(null);

  // Admin Auth State
  const [adminPin, setAdminPin] = useState(() => sessionStorage.getItem('admin_pin') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Track active scroll section
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch initial bundle from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/all');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const payload = await res.json();
      setData(payload);
      setError(null);
    } catch (err) {
      console.error('Failed to load platform data:', err);
      setError('Could not connect to the backend server. Make sure node server/index.js is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check persisted admin pin
  useEffect(() => {
    if (adminPin) {
      sessionStorage.setItem('admin_pin', adminPin);
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin })
      })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) setIsAuthenticated(true);
        else setIsAuthenticated(false);
      })
      .catch(() => {});
    }
  }, [adminPin]);

  // Intersection observer for navigation active states
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'career', 'software', 'blog', 'contact'];
      const scrollPos = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleOpenContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenNewRelease = (softItem) => {
    setTargetSoftwareForRelease(softItem);
    setStudioOpen(true);
  };

  if (loading && !data.profile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)'
      }}>
        <div className="live-dot" style={{ width: 14, height: 14, marginBottom: '1.5rem' }}></div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Starting Personal Platform...</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Loading articles, career milestones & software releases</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <Navbar 
        siteName={data.settings?.siteName || data.profile?.name}
        activeSection={activeSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenStudio={() => { setTargetSoftwareForRelease(null); setStudioOpen(true); }}
        isAdmin={isAuthenticated}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero & About Profile */}
        <Hero 
          profile={data.profile} 
          onOpenContact={handleOpenContact}
        />

        {/* 2. Career Experience Roadmap */}
        <CareerSection 
          career={data.career} 
          resumeUrl={data.profile?.resumeUrl}
        />

        {/* 3. Software Showcase & Version Releases */}
        <SoftwareSection 
          software={data.software} 
          onSelectSoftware={(s) => setSelectedSoftware(s)}
          onOpenNewRelease={handleOpenNewRelease}
          isAdmin={isAuthenticated}
        />

        {/* 4. Technical Blog */}
        <BlogSection 
          posts={data.posts} 
          onSelectPost={(p) => setSelectedPost(p)}
          onNewPost={() => setStudioOpen(true)}
          isAdmin={isAuthenticated}
        />

        {/* 5. Contact & Socials */}
        <ContactSection 
          profile={data.profile} 
        />
      </main>

      {/* Footer */}
      <Footer 
        profile={data.profile}
        settings={data.settings}
        onOpenStudio={() => { setTargetSoftwareForRelease(null); setStudioOpen(true); }}
      />

      {/* Modals */}
      {/* Changelog Modal */}
      {selectedSoftware && (
        <ChangelogModal 
          software={selectedSoftware}
          onClose={() => setSelectedSoftware(null)}
        />
      )}

      {/* Blog Article Reader Modal */}
      {selectedPost && (
        <PostReaderModal 
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Admin Studio Modal */}
      <AdminStudioModal 
        isOpen={studioOpen}
        onClose={() => { setStudioOpen(false); setTargetSoftwareForRelease(null); }}
        adminPin={adminPin}
        setAdminPin={setAdminPin}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        onRefreshData={fetchData}
        initialData={data}
        targetSoftwareForRelease={targetSoftwareForRelease}
        setTargetSoftwareForRelease={setTargetSoftwareForRelease}
      />
    </div>
  );
}
