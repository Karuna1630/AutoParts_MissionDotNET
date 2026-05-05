import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error, fallback = 'Request failed.') => {
  const apiError = error?.response?.data;
  const statusCode = error?.response?.status;

  if (error?.code === 'ERR_NETWORK') {
    return `Cannot reach API at ${API_BASE_URL}. Make sure the backend is running.`;
  }

  if (statusCode === 502) {
    return 'Frontend proxy cannot reach backend API. Start WebAPI on http://localhost:5052.';
  }

  if (statusCode === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (statusCode === 403) {
    return 'Access denied. You do not have permission for this action. Please sign out and sign in again, or contact an administrator.';
  }

  if (apiError?.errors && typeof apiError.errors === 'object') {
    return Object.values(apiError.errors).flat().join(' ');
  }

  if (Array.isArray(apiError?.errors) && apiError.errors.length > 0) {
    return apiError.errors.join(' ');
  }

  if (typeof apiError?.message === 'string' && apiError.message.trim()) {
    return apiError.message;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
