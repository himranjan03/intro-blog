import React, { useState } from 'react';
import { Briefcase, GraduationCap, MapPin, Calendar, CheckCircle2, FileDown } from 'lucide-react';

export default function CareerSection({ career = [], resumeUrl }) {
  const [filter, setFilter] = useState('all');

  const filteredCareer = career.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <section id="career" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Briefcase size={14} />
            <span>Career Roadmap</span>
          </span>
          <h2 className="section-title">Experience & Journey</h2>
          <p className="section-subtitle">
            A chronological timeline of roles, engineering impact, and key systems I've architected across industry and academia.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="timeline-filter-tabs">
          <button 
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Milestones
          </button>
          <button 
            className={`tab-btn ${filter === 'work' ? 'active' : ''}`}
            onClick={() => setFilter('work')}
          >
            Work Experience
          </button>
          <button 
            className={`tab-btn ${filter === 'education' ? 'active' : ''}`}
            onClick={() => setFilter('education')}
          >
            Education
          </button>
        </div>

        {/* Career Timeline */}
        <div className="timeline-list">
          {filteredCareer.map((item) => (
            <div key={item.id} className="timeline-item animate-fade-in">
              <div className="timeline-node"></div>
              
              <div className="glass-card timeline-card">
                <div className="timeline-header">
                  <h3 className="timeline-role">{item.role}</h3>
                  <div className="timeline-period">
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>{item.period}</span>
                  </div>
                </div>

                <div className="timeline-company">
                  <span>{item.company}</span>
                  {item.location && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.85rem' }}>
                      • <MapPin size={12} style={{ display: 'inline', margin: '0 2px' }} /> {item.location}
                    </span>
                  )}
                </div>

                {item.summary && (
                  <p className="timeline-summary">{item.summary}</p>
                )}

                {item.achievements && item.achievements.length > 0 && (
                  <ul className="timeline-achievements">
                    {item.achievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                )}

                {item.technologies && item.technologies.length > 0 && (
                  <div className="software-tags" style={{ marginTop: '1rem', marginBottom: 0 }}>
                    {item.technologies.map((t, idx) => (
                      <span key={idx} className="badge badge-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resume Action */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a 
            href={resumeUrl || '#'} 
            className="btn btn-secondary"
            onClick={(e) => {
              if (!resumeUrl || resumeUrl === '#') {
                e.preventDefault();
                alert('You can upload or link your PDF resume anytime in the Admin Studio!');
              }
            }}
          >
            <FileDown size={17} />
            <span>Download Detailed Resume</span>
          </a>
        </div>
      </div>
    </section>
  );
}
