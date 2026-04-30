import axios from 'axios';
import { API_BASE_URL } from '../utils/constants.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const getAuthToken = () => {
  return localStorage.getItem('mediguard-token') || localStorage.getItem('token');
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('mediguard-token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
