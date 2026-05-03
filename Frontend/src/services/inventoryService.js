import { apiClient } from './api';

export const getInventory = async () => {
  const response = await apiClient.get('/Inventory');
  return response.data;
};

export const addInventoryItem = async (formData) => {
  const response = await apiClient.post('/Inventory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateInventoryItem = async (id, formData) => {
  const response = await apiClient.put(`/Inventory/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await apiClient.delete(`/Inventory/${id}`);
  return response.data;
};
