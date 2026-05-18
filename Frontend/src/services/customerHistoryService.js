import { apiClient } from './api';

export const customerHistoryService = {
  getSummary: async () => {
    const res = await apiClient.get('/customers/history/summary');
    return res.data;
  },

  getCombinedHistory: async () => {
    const res = await apiClient.get('/customers/history/all');
    return res.data;
  },

  getMyOrderRequests: async () => {
    const res = await apiClient.get('/OrderRequests/my-orders');
    return res.data;
  },

  downloadInvoicePdf: async (invoiceId) => {
    const res = await apiClient.get(`/customers/history/invoice/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  },

  exportHistoryPdf: async () => {
    const res = await apiClient.get('/customers/history/export', {
      responseType: 'blob'
    });
    return res.data;
  }
};
