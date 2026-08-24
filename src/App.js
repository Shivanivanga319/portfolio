import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { api } from './services/api';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Initial fallback projects if database is disconnected or loading
const INITIAL_PROJECTS = [
  {
    title: 'Mini CRM',
    description:
      'A full-stack Client Lead Management System (Mini CRM) designed to securely store, track, and manage incoming prospect inquiries using a protected admin panel with real-time database syncing, dynamic search filtering, live analytics, and interactive follow-up note logging.',
    tech: 'React, Node.js, MongoDB, CSS',
  },
  {
    title: 'Portfolio',
    description:
      'A simple, responsive personal website built with React to showcase my projects, resume, and technical skills.',
    tech: 'React, CSS, Node.js, Express',
  },
];

const Navbar = () => (
  <nav className="navbar">
    <div className="logo">
      <h2>VANGA CHAITRA SHIVANI</h2>
    </div>
    <ul className="nav-links">
      <li><a href="#about">About</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#resume">Resume</a></li>
    </ul>
  </nav>
);

const About = () => (
  <section id="about" className="section">
    <h2>About Me</h2>
    <p>
      I am a final-year B.Tech Computer Science student building a solid foundation in software development. 
      My current focus spans full-stack web development.
    </p>
    <p>
      I enjoy creating practical, real-world projects and am actively expanding my knowledge through coursework 
      in emerging fields like Quantum Computing.
    </p>
  </section>
);

const Skills = () => {
  const technicalSkills = [
    'HTML & CSS', 'JavaScript', 'React',  
    'Node.js', 'Express', 'MongoDB', 'Python',
    'GitHub', 'REST APIs', 'JWT Auth'
  ];
  
  return (
    <section id="skills" className="section">
      <h2>Technical Skills</h2>
      <div className="skills-grid">
        {technicalSkills.map((skill, index) => (
          <div key={index} className="skill-badge">{skill}</div>
        ))}
      </div>
    </section>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const liveProjects = await api.getProjects();
        if (liveProjects && liveProjects.length > 0) {
          setProjects(liveProjects);
        }
      } catch (error) {
        console.info('Using fallback projects while backend connects.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      {loading && <p style={{ color: 'var(--cyan-foam)', opacity: 0.7 }}>Loading latest projects...</p>}
      <div className="project-container">
        {projects.map((proj, index) => (
          <div key={proj._id || index} className="project-card">
            <h3>{proj.title}</h3>
            <p>{proj.description}</p>
            <div className="tech-stack">
              {proj.tech &&
                proj.tech.split(',').map((t, i) => (
                  <span key={i} className="tech-pill">
                    {t.trim()}
                  </span>
                ))}
            </div>
            {(proj.githubUrl || proj.liveUrl) && (
              <div className="project-links" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--teal-wave)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    GitHub ↗
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--teal-wave)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const Resume = () => {
  const [resumeUrl, setResumeUrl] = useState('/Resume.pdf');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const info = await api.getResumeInfo();
        if (info && info.downloadUrl) {
          // If relative URL to backend
          const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          if (info.downloadUrl.startsWith('/api')) {
            setResumeUrl(`${backendUrl.replace('/api', '')}${info.downloadUrl}`);
          } else {
            setResumeUrl(info.downloadUrl);
          }
        }
      } catch (e) {
        setResumeUrl('/Resume.pdf');
      }
    };
    fetchResume();
  }, []);

  return (
    <section id="resume" className="section center-content">
      <h2>Resume</h2>
      <div className="resume-card">
        <h3>Want the full details?</h3>
        <p>Click below to view or download my complete academic and professional qualifications.</p>
        <a 
          href={resumeUrl} 
          target="_blank" 
          rel="noreferrer noopener" 
          className="btn-view-resume"
        >
          View Resume PDF
        </a>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <h3>Contact</h3>
      <div className="contact-blocks-container">
        {/* Email Block */}
        <a href="mailto:your.email@gmail.com" className="contact-block">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span>Email Me</span>
        </a>

        {/* LinkedIn Block */}
        <a href="https://www.linkedin.com/in/vanga-chaitra-shivani-1859bb2b9/" target="_blank" rel="noopener noreferrer" className="contact-block">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          <span>LinkedIn</span>
        </a>

        {/* GitHub Block */}
        <a href="https://github.com/Shivanivanga319" target="_blank" rel="noopener noreferrer" className="contact-block">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <p className="footer-copyright">© 2026 Vanga Chaitra Shivani. Built with React & Node.js.</p>
        <span style={{ opacity: 0.3 }}>|</span>
        <Link 
          to="/admin" 
          style={{ 
            color: 'var(--cyan-foam)', 
            fontSize: '0.85rem', 
            textDecoration: 'none', 
            opacity: 0.6,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.6'}
        >
          Admin Portal 🔒
        </Link>
      </div>
    </div>
  </footer>
);

// Main Public View Component
const PortfolioHome = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <About />
        <Skills />
        <Projects />
        <Resume />
      </main>
      <Footer />
    </div>
  );
};

// Top-Level App with Routing
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;