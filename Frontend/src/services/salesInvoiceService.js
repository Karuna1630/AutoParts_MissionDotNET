import { apiClient } from './api';

const API_URL = '/SalesInvoice';

export const getSalesInvoices = async () => {
  const response = await apiClient.get(API_URL);
  return response.data;
};

export const getSalesInvoiceById = async (id) => {
  const response = await apiClient.get(`${API_URL}/${id}`);
  return response.data;
};

export const createSalesInvoice = async (payload) => {
  const response = await apiClient.post(API_URL, payload);
  return response.data;
};
