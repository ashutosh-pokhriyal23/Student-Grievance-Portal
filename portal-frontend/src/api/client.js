import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log("[API] Base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    console.error('[API Error]', status, url, error.response?.data || error.message);

    if (status === 401) {
      const isVerifyCall = url?.includes('/auth/verify');
      if (!isVerifyCall) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
