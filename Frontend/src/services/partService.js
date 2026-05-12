import { apiClient as api } from './api';

export const getAllParts = async () => {
  const response = await api.get('/parts');
  return response.data;
};

export const createPartRequest = async (formData) => {
  const response = await api.post('/partrequests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getMyPartRequests = async () => {
  const response = await api.get('/partrequests/my-requests');
  return response.data;
};
