import React, { useState } from 'react';
import { Mail, Send, Check, Copy, MessageSquare, Sparkles, Phone, MapPin } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './SocialIcons';
import confetti from 'canvas-confetti';

export default function ContactSection({ profile }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const email = profile?.email || 'himanshuranjan3@gmail.com';
  const phone = profile?.phone || '+91 9801134694';
  const location = profile?.location || 'Patna, India';
  const linkedin = profile?.social?.linkedin;
  const github = profile?.social?.github;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch message');
      }

      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', message: '' });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Mail size={14} />
            <span>Connect</span>
          </span>
          <h2 className="section-title">Let's Build Something Great</h2>
          <p className="section-subtitle">
            Have a project in mind, want to discuss systems architecture, or collaborate on open source? Send a direct message below.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          maxWidth: 960,
          margin: '0 auto'
        }}>
          {/* Direct channels & Quick Connect */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="var(--primary)" />
              <span>Direct Channels</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              I usually reply within 24 hours. Feel free to copy my direct email or connect through professional networks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Copy Email Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Mail size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {email}
                  </span>
                </div>
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={handleCopyEmail}
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Direct Phone Box */}
              {phone && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Phone size={16} color="var(--secondary)" />
                    <a 
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}
                    >
                      {phone}
                    </a>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={handleCopyPhone}
                    title="Copy phone to clipboard"
                  >
                    {copiedPhone ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              {/* Location indicator */}
              {location && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <MapPin size={15} color="var(--emerald)" />
                  <span>Based in {location} (Open to Global & Remote Roles)</span>
                </div>
              )}

              {/* LinkedIn Button */}
              {linkedin && (
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <LinkedinIcon size={18} color="#0a66c2" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}

              {/* GitHub Button */}
              {github && (
                <a 
                  href={github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <GithubIcon size={18} />
                  <span>Explore GitHub Activity</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Name</label>
                <input 
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input 
                  id="contact-email"
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea 
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Tell me about your project, idea, or questions..."
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {status.error && (
                <p style={{ color: 'var(--rose)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {status.error}
                </p>
              )}

              {status.success && (
                <p style={{ color: 'var(--emerald)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={16} />
                  <span>Message delivered successfully! Thank you.</span>
                </p>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={status.loading}
              >
                {status.loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Direct Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
