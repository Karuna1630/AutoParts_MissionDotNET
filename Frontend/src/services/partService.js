import { apiClient as api } from './api';

export const searchParts = async (query = '') => {
  const response = await api.get(`/parts/search?query=${query}`);
  return response.data;
};

export const submitPartRequest = async (requestData) => {
  const response = await api.post('/partrequests', requestData);
  return response.data;
};

export const getMyPartRequests = async () => {
  const response = await api.get('/partrequests/my-requests');
  return response.data;
};

export const getAllPartRequests = async () => {
  const response = await api.get('/partrequests/all');
  return response.data;
};
