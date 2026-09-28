import React, { useState } from 'react';
import { Terminal, Moon, Sun, Shield, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ 
  siteName, 
  activeSection, 
  theme, 
  onToggleTheme, 
  onOpenStudio, 
  isAdmin 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Career', href: '#career' },
    { label: 'Software & Versions', href: '#software' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <a href="#" className="nav-brand">
            <div className="nav-logo-icon">
              <Terminal size={20} />
            </div>
            <span>{siteName || 'Himanshu Ranjan'}</span>
          </a>

          {/* Desktop Nav */}
          <nav className="nav-links">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className={`nav-link ${activeSection === item.href.slice(1) ? 'active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: Theme Toggle + Studio + Mobile Menu */}
          <div className="nav-actions">
            <button 
              className="icon-btn" 
              onClick={onToggleTheme} 
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              className={`btn btn-sm ${isAdmin ? 'btn-primary' : 'btn-secondary'}`}
              onClick={onOpenStudio}
              title="Admin Studio (Write blogs, update versions)"
            >
              <Shield size={15} />
              <span>{isAdmin ? 'Studio Active' : 'Studio'}</span>
            </button>

            <button 
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="mobile-nav animate-fade-in">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', padding: '0.4rem 0' }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
