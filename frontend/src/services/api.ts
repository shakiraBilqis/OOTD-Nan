import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request interceptor: attach token ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sintren_token') || localStorage.getItem('closette_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.error?.code;
      // Only auto-logout on session-related errors, not login failures
      if (code === 'INVALID_TOKEN' || code === 'SESSION_EXPIRED') {
        localStorage.removeItem('sintren_token');
        localStorage.removeItem('sintren_user');
        localStorage.removeItem('closette_token');
        localStorage.removeItem('closette_user');
        // Redirect to login without full page reload if possible
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
