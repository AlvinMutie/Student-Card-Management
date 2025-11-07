// API Client for Student Card Management System
// This file handles all API calls to the backend

const API_BASE_URL = 'http://localhost:3000/api';

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
      throw new Error('Cannot connect to backend server. Make sure the server is running on http://localhost:3000');
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

  logout() {
    removeAuthToken();
    window.location.href = '../index.html';
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

