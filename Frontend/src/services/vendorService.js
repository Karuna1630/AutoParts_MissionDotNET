import { apiClient } from './api';

export const getVendors = async (pageNumber = 1, pageSize = 10, search = '') => {
  const params = { pageNumber, pageSize };
  if (search) {
    params.search = search;
  }
  const response = await apiClient.get('/vendors', { params });
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await apiClient.get(`/vendors/${id}`);
  return response.data;
};

export const createVendor = async (payload) => {
  const response = await apiClient.post('/vendors', payload);
  return response.data;
};

export const updateVendor = async (id, payload) => {
  const response = await apiClient.put(`/vendors/${id}`, payload);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await apiClient.delete(`/vendors/${id}`);
  return response.data;
};
