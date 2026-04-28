import { apiClient } from './api';

export const getAdminStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

export const getAllUsers = async (role = '') => {
  const params = role ? { role } : {};
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await apiClient.put(`/admin/users/${id}/toggle-status`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

export const createStaff = async (payload) => {
  const response = await apiClient.post('/auth/staff', payload);
  return response.data;
};
