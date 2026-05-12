import { apiClient as api } from './api';

export const createSalesInvoice = async (invoiceData) => {
  const response = await api.post('/pos/invoice', invoiceData);
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/pos/invoice/${id}`);
  return response.data;
};

export const getAllSalesInvoices = async () => {
  const response = await api.get('/pos/invoices');
  return response.data;
};

export const updatePaymentStatus = async (id, paymentData) => {
  const response = await api.put(`/pos/invoice/${id}/payment`, paymentData);
  return response.data;
};

// Reuse inventory search for POS
export const searchParts = async (query) => {
  const response = await api.get(`/pos/parts/search?query=${query}`);
  return response.data;
};

// Reuse customer search for POS
export const searchCustomersForSales = async (query) => {
  const response = await api.get(`/pos/customers/search?query=${query}`);
  return response.data;
};
