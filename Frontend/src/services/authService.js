import { apiClient } from './api';

export const registerCustomer = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};


export const staffLogin = async (payload) => {
  const response = await apiClient.post('/StaffAuth/staff-login', payload);
  return response.data;
};
