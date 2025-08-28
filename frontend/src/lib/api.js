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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('token');
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
    localStorage.removeItem('token');
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
  return !!localStorage.getItem('token');
};

// Protected route helper
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

export default api;
