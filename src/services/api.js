import { saveLocalResume, getLocalResume } from './resumeStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- Auth Endpoints ---
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    }
    return data;
  },

  async verifyToken() {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        return null;
      }
      const data = await res.json();
      return data.admin;
    } catch (err) {
      console.warn('Verify token network error:', err.message);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },

  // --- Projects Endpoints ---
  async getProjects() {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (!res.ok) {
        throw new Error(`Error fetching projects (${res.status})`);
      }
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn('API getProjects failed:', err.message);
      throw err;
    }
  },

  async createProject(projectData) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create project');
    }
    return data.data;
  },

  async updateProject(id, projectData) {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update project');
    }
    return data.data;
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete project');
    }
    return data;
  },

  // --- Resume Endpoints ---
  async getResumeInfo() {
    // Check client-side storage first
    try {
      const local = await getLocalResume();
      if (local) return local;
    } catch (e) {
      // fallback to network
    }

    try {
      const res = await fetch(`${API_BASE_URL}/resume`);
      if (!res.ok) throw new Error('Error fetching resume info');
      return await res.json();
    } catch (err) {
      return { exists: true, downloadUrl: '/Resume.pdf' };
    }
  },

  async uploadResume(file) {
    // Save locally for instant preview & offline/Vercel support
    await saveLocalResume(file);

    // Try to sync with backend server if reachable
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (backendErr) {
      console.info('Backend server unreachable; updated locally in browser storage.');
    }

    return {
      success: true,
      message: 'Resume PDF uploaded successfully and activated!',
      downloadUrl: URL.createObjectURL(file),
      sizeBytes: file.size,
      updatedAt: new Date().toISOString(),
    };
  },
};
