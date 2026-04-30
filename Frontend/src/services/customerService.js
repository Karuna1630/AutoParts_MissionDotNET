import { apiClient } from './api';

export const getCustomers = async () => {
  const response = await apiClient.get('/user/customers');
  return response.data;
};
