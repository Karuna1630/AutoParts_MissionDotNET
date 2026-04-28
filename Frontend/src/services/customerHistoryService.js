import { apiClient } from './api';

export const customerHistoryService = {
  getPurchaseHistory: async (params) => {
    const response = await apiClient.get('/customers/history/purchases', { params });
    return response.data;
  },

  getServiceHistory: async (params) => {
    const response = await apiClient.get('/customers/history/services', { params });
    return response.data;
  },

  getCombinedHistory: async () => {
    const response = await apiClient.get('/customers/history/all');
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get('/customers/history/summary');
    return response.data;
  },

  exportHistoryPdf: async () => {
    const response = await apiClient.get('/customers/history/export', { responseType: 'blob' });
    return response.data;
  },

  downloadInvoicePdf: async (invoiceId) => {
    const response = await apiClient.get(`/customers/history/invoice/${invoiceId}/download`, { responseType: 'blob' });
    return response.data;
  }
};
