import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Small artificial delay to simulate network latency
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai_ppap_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add dev auth headers for backend's DevHeaderAuthFilter so method security works in dev
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const roles = (u?.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',');
        if (u?.username || u?.email) config.headers['X-User'] = u.username || u.email;
        if (roles) config.headers['X-Roles'] = roles;
      }
    } catch (_) {
      // ignore parsing issues; headers just won't be added
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  async (response) => {
    await sleep(400);
    return response;
  },
  async (error) => {
    await sleep(400);
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('ai_ppap_auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const loginUser = async (credentials) => {
  const response = await api.post('/v1/auth/authenticate', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/v1/auth/register', userData);
  return response.data;
};

export const logoutUser = async () => {
  try {
    const res = await api.post('/v1/auth/logout');
    return res.data;
  } catch (_) {
    // Even if server is unreachable, proceed with client-side cleanup
  } finally {
    localStorage.removeItem('ai_ppap_auth_token');
    localStorage.removeItem('user');
  }
};

// Password reset functions
export const forgotPassword = async (data) => {
  const response = await api.post('/v1/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/v1/auth/reset-password', data);
  return response.data;
};

export const verifyResetToken = async (token) => {
  const response = await api.get(`/v1/auth/verify-reset-token?token=${token}`);
  return response.data;
};

// Email verification functions
export const verifyEmail = async (token) => {
  const response = await api.post('/v1/auth/verify-email', { token });
  return response.data;
};

export const resendVerificationEmail = async (data) => {
  const response = await api.post('/v1/auth/resend-verification', data);
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Features API functions
export const getFeaturesPageData = async () => {
  const response = await api.get('/v1/features');
  return response.data;
};

export const getAllFeatures = async () => {
  const response = await api.get('/v1/features/list');
  return response.data;
};

export const getAllIntegrations = async () => {
  const response = await api.get('/v1/features/integrations');
  return response.data;
};

export const getAllWorkflowSteps = async () => {
  const response = await api.get('/v1/features/workflow');
  return response.data;
};

// User management
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('ai_ppap_auth_token');
};

// Self-evaluation
/**
 * Submits a self-evaluation
 * @param {Object} evaluationData - The evaluation data to submit
 * @returns {Promise<Object>} The API response
 */
export const submitEvaluation = async (evaluationData) => {
  const response = await api.post('/v1/evaluations/self', evaluationData);
  return response.data;
};

// Get user's self-evaluations
export const getUserEvaluations = async (userId) => {
  const response = await api.get(`/v1/evaluations/user/${userId}`);
  return response.data;
};

// Get a specific evaluation
export const getEvaluation = async (evaluationId) => {
  const response = await api.get(`/v1/evaluations/${evaluationId}`);
  return response.data;
};

// Protected route helper
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Admin: managers
export const getManagers = async () => {
  const res = await api.get('/v1/users/managers');
  return res.data;
};

// Admin: admins list
export const getAdmins = async () => {
  const res = await api.get('/v1/admin/admins');
  return res.data;
};

export const createManager = async ({ username, email, password, firstName, lastName, department }) => {
  // Backend expects request params, not JSON body
  const res = await api.post('/v1/users/managers', null, {
    params: { username, email, password, firstName, lastName, department },
  });
  return res.data;
};

// Projects
export const fetchProjects = async () => {
  const res = await api.get('/v1/projects');
  return res.data;
};

export const createProject = async ({ name }) => {
  const res = await api.post('/v1/projects', { name });
  return res.data;
};

export const assignUserProjects = async ({ userId, projectIds }) => {
  const res = await api.put(`/v1/users/${userId}/projects`, projectIds);
  return res.data;
};

export const assignManagedProjects = async ({ userId, projectIds }) => {
  const res = await api.put(`/v1/users/${userId}/managed-projects`, projectIds);
  return res.data;
};

export const assignMyProjects = async ({ identifier, projectIds }) => {
  // identifier can be username or email; backend resolves either
  const res = await api.put('/v1/users/me/projects', projectIds, {
    headers: {
      'X-User': identifier,
    },
  });
  return res.data;
};

export const getMyProjects = async ({ identifier }) => {
  const res = await api.get('/v1/users/me/projects', {
    headers: {
      'X-User': identifier,
    },
  });
  return res.data;
};

// Manager dashboard
export const getManagerDashboard = async () => {
  const res = await api.get('/v1/manager/dashboard');
  return res.data;
};

// Evaluations (admin/all)
export const getEvaluations = async () => {
  const res = await api.get('/v1/evaluations');
  return res.data;
};

export default api;
// KEQs (Admin CRUD)
export const getKEQs = async (params = {}) => {
  const res = await api.get('/v1/keqs', { params });
  return res.data;
};

export const createKEQ = async (payload) => {
  const res = await api.post('/v1/keqs', payload);
  return res.data;
};

export const updateKEQ = async (id, payload) => {
  const res = await api.put(`/v1/keqs/${id}`, payload);
  return res.data;
};

export const deleteKEQ = async (id) => {
  const res = await api.delete(`/v1/keqs/${id}`);
  return res.data;
};
