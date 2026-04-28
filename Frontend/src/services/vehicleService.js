import { apiClient } from './api';

export const getMyVehicles = async () => {
  const response = await apiClient.get('/customers/vehicles');
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await apiClient.get(`/customers/vehicles/${id}`);
  return response.data;
};

export const addVehicle = async (formData) => {
  const response = await apiClient.post('/customers/vehicles', formData);
  return response.data;
};

export const updateVehicle = async (id, formData) => {
  const response = await apiClient.post(`/customers/vehicles/${id}/update`, formData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await apiClient.delete(`/customers/vehicles/${id}`);
  return response.data;
};

export const setPrimaryVehicle = async (id) => {
  const response = await apiClient.patch(`/customers/vehicles/${id}/primary`);
  return response.data;
};
