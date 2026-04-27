import axios from 'axios';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawApiBaseUrl = configuredApiBaseUrl || '/api';
const baseApiUrlWithoutTrailingSlash = rawApiBaseUrl.replace(/\/+$/, '');

const API_BASE_URL = baseApiUrlWithoutTrailingSlash.endsWith('/api')
  ? baseApiUrlWithoutTrailingSlash
  : `${baseApiUrlWithoutTrailingSlash}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const getApiErrorMessage = (error, fallback = 'Request failed.') => {
  const apiError = error?.response?.data;

  if (error?.code === 'ERR_NETWORK') {
    return `Cannot reach API at ${API_BASE_URL}. Make sure the backend is running.`;
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
