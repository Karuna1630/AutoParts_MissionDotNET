import { apiClient } from './api';

export const getInventory = async () => {
  const response = await apiClient.get('/inventory');
  return response.data;
};

export const addInventoryItem = async (item) => {
  const response = await apiClient.post('/inventory', item);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await apiClient.delete(`/inventory/${id}`);
  return response.data;
};

export const updateInventoryItem = async (id, item) => {
  const response = await apiClient.put(`/inventory/${id}`, item);
  return response.data;
};
