import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import '../admin.css';

const AdminDashboard = ({ defaultTab = 'resume' }) => {
  const navigate = useNavigate();

  // State - default to 'resume' tab
  const [activeTab, setActiveTab] = useState(defaultTab); // 'resume' | 'projects' | 'settings'
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Project Form State (Add / Edit)
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech: '',
    githubUrl: '',
    liveUrl: '',
    order: 0,
  });
  const [submittingProject, setSubmittingProject] = useState(false);

  // Resume State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Show notification banner
  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 4500);
  };

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      showNotification('error', 'Failed to load projects from server.');
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  // Fetch Resume Metadata
  const fetchResumeInfo = useCallback(async () => {
    try {
      const data = await api.getResumeInfo();
      setResumeInfo(data);
    } catch (err) {
      console.warn('Resume info fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchResumeInfo();
  }, [fetchProjects, fetchResumeInfo]);

  // Handle Back to Portfolio
  const handleLogout = () => {
    navigate('/');
  };

  // Handle Project Form Submission (Add or Update)
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.description.trim() || !projectForm.tech.trim()) {
      showNotification('error', 'Please fill in Title, Description, and Tech Stack.');
      return;
    }

    try {
      setSubmittingProject(true);
      if (editingProjectId) {
        await api.updateProject(editingProjectId, projectForm);
        showNotification('success', 'Project updated successfully!');
      } else {
        await api.createProject(projectForm);
        showNotification('success', 'New project added successfully!');
      }

      // Reset form
      setProjectForm({
        title: '',
        description: '',
        tech: '',
        githubUrl: '',
        liveUrl: '',
        order: 0,
      });
      setEditingProjectId(null);
      fetchProjects();
    } catch (err) {
      showNotification('error', err.message || 'Failed to save project.');
    } finally {
      setSubmittingProject(false);
    }
  };

  // Prepare project for editing
  const handleEditClick = (proj) => {
    setEditingProjectId(proj._id);
    setProjectForm({
      title: proj.title || '',
      description: proj.description || '',
      tech: proj.tech || '',
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      order: proj.order || 0,
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      description: '',
      tech: '',
      githubUrl: '',
      liveUrl: '',
      order: 0,
    });
  };

  // Handle Delete Project
  const handleDeleteClick = async (id, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await api.deleteProject(id);
      showNotification('success', `Deleted project "${title}" successfully.`);
      fetchProjects();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete project.');
    }
  };

  // Handle Resume File Upload
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showNotification('error', 'Please choose a PDF file to upload.');
      return;
    }

    if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
      showNotification('error', 'Only PDF files (.pdf) are accepted.');
      return;
    }

    try {
      setUploadingResume(true);
      const result = await api.uploadResume(resumeFile);
      showNotification('success', result.message || 'Resume uploaded successfully!');
      setResumeFile(null);
      fetchResumeInfo();
    } catch (err) {
      showNotification('error', err.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New password and confirmation do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification('error', 'New password should be at least 6 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');

      showNotification('success', 'Admin password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification('error', err.message || 'Password update failed.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Top Navigation */}
      <header className="admin-nav">
        <div className="admin-nav-brand">
          <h2>Shivani's Portfolio Admin</h2>
          <span className="admin-badge">Resume & Project Manager</span>
        </div>
        <div className="admin-nav-actions">
          <Link to="/" className="btn-secondary">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            View Live Site
          </Link>
          <button onClick={handleLogout} className="btn-logout">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Back to Portfolio
          </button>
        </div>
      </header>

      {/* Global Toast Alert */}
      {feedback.message && (
        <div className={`admin-toast ${feedback.type}`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          📄 Resume Manager
        </button>
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
          </svg>
          Manage Projects ({projects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Account & Security
        </button>
      </div>

      <main className="admin-content">
        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
          <div className="tab-pane">
            {/* Add / Edit Form Card */}
            <div className="admin-card form-card">
              <div className="card-header">
                <h3>{editingProjectId ? '✏️ Edit Project' : '➕ Add New Project'}</h3>
                {editingProjectId && (
                  <button onClick={handleCancelEdit} className="btn-cancel">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProjectSubmit} className="project-editor-form">
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. AI-Powered Healthcare Assistant"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Tech Stack * (Comma separated)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. React, Node.js, MongoDB, Tailwind"
                      value={projectForm.tech}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Description *</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    placeholder="Describe what this project does, key features, and your contribution..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>GitHub Repository URL (Optional)</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://github.com/your-username/repo-name"
                      value={projectForm.githubUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Live Demo URL (Optional)</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://your-demo-url.vercel.app"
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    />
                  </div>
                </div>

                {projectForm.tech && (
                  <div className="tech-stack-preview">
                    <span className="preview-label">Live Tags Preview:</span>
                    {projectForm.tech.split(',').map((t, i) => {
                      const trimmed = t.trim();
                      if (!trimmed) return null;
                      return <span key={i} className="tech-pill">{trimmed}</span>;
                    })}
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-admin-primary" disabled={submittingProject}>
                    {submittingProject
                      ? 'Saving...'
                      : editingProjectId
                      ? 'Update Project'
                      : 'Publish Project'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Projects List */}
            <div className="admin-card">
              <div className="card-header">
                <h3>Live Portfolio Projects ({projects.length})</h3>
              </div>

              {loadingProjects ? (
                <div className="admin-loading-state">Loading projects from database...</div>
              ) : projects.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No projects found in database yet. Add your first project above!</p>
                </div>
              ) : (
                <div className="admin-project-grid">
                  {projects.map((proj) => (
                    <div key={proj._id} className="admin-project-item">
                      <div className="project-item-header">
                        <h4>{proj.title}</h4>
                        <div className="project-item-actions">
                          <button
                            onClick={() => handleEditClick(proj)}
                            className="btn-action edit"
                            title="Edit project"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(proj._id, proj.title)}
                            className="btn-action delete"
                            title="Delete project"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="project-item-desc">{proj.description}</p>
                      <div className="tech-stack">
                        {proj.tech &&
                          proj.tech.split(',').map((t, i) => (
                            <span key={i} className="tech-pill">
                              {t.trim()}
                            </span>
                          ))}
                      </div>
                      {(proj.githubUrl || proj.liveUrl) && (
                        <div className="project-item-links">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="link-item">
                              GitHub ↗
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="link-item">
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- RESUME TAB --- */}
        {activeTab === 'resume' && (
          <div className="tab-pane">
            <div className="admin-card">
              <div className="card-header">
                <h3>📄 Resume Management</h3>
              </div>
              <p className="card-desc">
                Upload your updated PDF resume here. Any newly uploaded PDF will automatically become the active file downloaded by visitors clicking <strong>"View Resume PDF"</strong> on your portfolio.
              </p>

              {/* Current Resume Metadata */}
              <div className="resume-status-box">
                <h4>Current Active Resume:</h4>
                {resumeInfo?.exists ? (
                  <div className="resume-meta">
                    <p><strong>File:</strong> Resume.pdf</p>
                    {resumeInfo.sizeBytes && (
                      <p><strong>File Size:</strong> {(resumeInfo.sizeBytes / 1024).toFixed(1)} KB</p>
                    )}
                    {resumeInfo.updatedAt && (
                      <p><strong>Last Updated:</strong> {new Date(resumeInfo.updatedAt).toLocaleString()}</p>
                    )}
                    <a
                      href={
                        resumeInfo.downloadUrl && !resumeInfo.downloadUrl.startsWith('/api')
                          ? resumeInfo.downloadUrl
                          : `${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')}${resumeInfo.downloadUrl || '/api/resume/download'}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ marginTop: '0.5rem', display: 'inline-block' }}
                    >
                      Preview Current Resume ↗
                    </a>
                  </div>
                ) : (
                  <p style={{ color: 'var(--cyan-foam)' }}>Default resume in public directory.</p>
                )}
              </div>

              {/* Upload Form */}
              <form onSubmit={handleResumeUpload} className="resume-upload-form">
                <div className="file-upload-zone">
                  <label htmlFor="resume-file" className="file-label">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                    </svg>
                    <span>{resumeFile ? resumeFile.name : 'Select or drop a new Resume PDF'}</span>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={!resumeFile || uploadingResume}
                  style={{ marginTop: '1.5rem' }}
                >
                  {uploadingResume ? 'Uploading & Updating...' : 'Upload & Replace Resume'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="tab-pane">
            <div className="admin-card">
              <div className="card-header">
                <h3>🔒 Change Admin Password</h3>
              </div>
              <p className="card-desc">
                Update your admin credentials securely. Your new password will be hashed with bcrypt.
              </p>

              <form onSubmit={handlePasswordChange} className="password-change-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="admin-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="admin-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-admin-primary" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
