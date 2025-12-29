// API Client for Student Card Management System
// This file handles all API calls to the backend

const DEFAULT_LOCAL_API = 'http://localhost:3000/api';

function normalizeBaseUrl(value) {
  if (!value || typeof value !== 'string') return null;
  let sanitized = value.trim();
  if (!sanitized) return null;

  // If it's a relative path (starts with /), return as-is
  if (sanitized.startsWith('/')) {
    return sanitized.replace(/\/+$/, '');
  }

  // Allow values without protocol (e.g., //api.example.com or api.example.com)
  if (!/^https?:\/\//i.test(sanitized) && !/^\/\//.test(sanitized)) {
    sanitized = `https://${sanitized}`;
  }
  if (/^\/\//.test(sanitized)) {
    const protocol =
      typeof window !== 'undefined' &&
        window.location &&
        window.location.protocol
        ? window.location.protocol
        : 'https:';
    sanitized = `${protocol}${sanitized}`;
  }
  sanitized = sanitized.replace(/\/+$/, '');
  return sanitized;
}

function resolveBaseFromWindow() {
  if (typeof window === 'undefined') return null;
  try {
    const candidates = [];
    if (window.StudentCardConfig && window.StudentCardConfig.apiBaseUrl) {
      candidates.push(window.StudentCardConfig.apiBaseUrl);
    }
    const stored = window.localStorage ? window.localStorage.getItem('sv_api_base_url') : null;
    if (stored) candidates.push(stored);

    const meta = window.document && window.document.querySelector
      ? window.document.querySelector('meta[name="student-card-api-base"]')
      : null;
    if (meta && meta.content) {
      candidates.push(meta.content);
    }

    for (const candidate of candidates) {
      const normalized = normalizeBaseUrl(candidate);
      if (normalized) return normalized;
    }

    if (window.location && /^(localhost|127(\.\d+){0,2}\.\d+)$/.test(window.location.hostname)) {
      return DEFAULT_LOCAL_API;
    }
  } catch (error) {
    console.warn('Unable to resolve API base URL from window context:', error);
  }
  return null;
}

function resolveBaseFromProcess() {
  if (typeof process === 'undefined' || !process.env) return null;
  const envCandidate =
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.RENDER_API_BASE_URL;
  return normalizeBaseUrl(envCandidate);
}

function resolveApiBaseUrl() {
  return (
    resolveBaseFromWindow() ||
    resolveBaseFromProcess() ||
    DEFAULT_LOCAL_API
  );
}

const API_BASE_URL = resolveApiBaseUrl();



if (typeof window !== 'undefined') {
  window.StudentCardConfig = window.StudentCardConfig || {};
  window.StudentCardConfig.apiBaseUrl = API_BASE_URL;
  window.StudentCardConfig.setApiBaseUrl = function setApiBaseUrl(url, options = { persist: true }) {
    const normalized = normalizeBaseUrl(url);
    if (!normalized) {
      console.warn('setApiBaseUrl: provided URL is invalid');
      return;
    }
    window.StudentCardConfig.apiBaseUrl = normalized;
    if (options.persist && window.localStorage) {
      window.localStorage.setItem('sv_api_base_url', normalized);
    }
  };
}

// Get auth token from localStorage (check multiple possible keys)
function getAuthToken() {
  return localStorage.getItem('sv_auth_token') ||
    localStorage.getItem('sv_parent_token') ||
    localStorage.getItem('sv_admin_token');
}

// Set auth token in localStorage
function setAuthToken(token) {
  localStorage.setItem('sv_auth_token', token);
}

// Remove auth token from localStorage
function removeAuthToken() {
  localStorage.removeItem('sv_auth_token');
  localStorage.removeItem('sv_user_data');
}

// Make API request
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Check if response is JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const helpMessage = `
Cannot connect to backend server at ${API_BASE_URL}

Quick Fix Steps:
1. Set Netlify environment variable: API_BASE_URL = https://student-card-management-api.onrender.com/api
2. Redeploy your Netlify site
3. Wait 30-60 seconds if backend is sleeping (Render free tier)
4. Test: Visit /public/api-test.html for diagnostics

Current API URL: ${API_BASE_URL}
Backend Health: ${API_BASE_URL.replace('/api', '/api/health')}
      `.trim();
      throw new Error(helpMessage);
    }
    throw error;
  }
}

// Authentication API
const authAPI = {
  async login(email, password, userType = 'admin') {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem('sv_user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const data = await apiRequest('/auth/me');
      return data.user;
    } catch (error) {
      return null;
    }
  },

  logout(redirectPath) {
    removeAuthToken();
    const fallback = '/index.html';
    try {
      const target =
        redirectPath ||
        (window.StudentCardConfig && window.StudentCardConfig.logoutRedirectPath) ||
        fallback;
      window.location.href = target;
    } catch (error) {
      window.location.href = fallback;
    }
  },

  isAuthenticated() {
    return !!getAuthToken();
  },
};

// Students API
const studentsAPI = {
  async getAll() {
    return apiRequest('/students');
  },

  async getById(id) {
    return apiRequest(`/students/${id}`);
  },

  async getMyStudents() {
    return apiRequest('/students/parent/my-students');
  },

  async create(studentData) {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async update(id, studentData) {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  async delete(id) {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// Parents API
const parentsAPI = {
  async getAll() {
    return apiRequest('/parents');
  },

  async getById(id) {
    return apiRequest(`/parents/${id}`);
  },

  async getMyProfile() {
    return apiRequest('/parents/me/profile');
  },

  async updateMyProfile(parentData) {
    return apiRequest('/parents/me/profile', {
      method: 'PUT',
      body: JSON.stringify(parentData),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return apiRequest('/parents/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async create(parentData) {
    return apiRequest('/parents', {
      method: 'POST',
      body: JSON.stringify(parentData),
    });
  },

  async update(id, parentData) {
    return apiRequest(`/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(parentData),
    });
  },

  async delete(id) {
    return apiRequest(`/parents/${id}`, {
      method: 'DELETE',
    });
  },

  async linkStudents(admissions = []) {
    return apiRequest('/parents/me/students/link', {
      method: 'POST',
      body: JSON.stringify({ admissions }),
    });
  },
};

// Staff API
const staffAPI = {
  async getAll() {
    return apiRequest('/staff');
  },

  async getById(id) {
    return apiRequest(`/staff/${id}`);
  },

  async create(staffData) {
    return apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  async update(id, staffData) {
    return apiRequest(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  async delete(id) {
    return apiRequest(`/staff/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export API objects
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authAPI, studentsAPI, parentsAPI, staffAPI };
}

// Make available globally for browser use
window.authAPI = authAPI;
window.studentsAPI = studentsAPI;
window.parentsAPI = parentsAPI;
window.staffAPI = staffAPI;

