import { apiClient } from './api';

export const customerHistoryService = {
  getSummary: async () => {
    const res = await apiClient.get('/CustomerHistory/summary');
    return res.data;
  },

  getCombinedHistory: async () => {
    const res = await apiClient.get('/CustomerHistory/combined');
    return res.data;
  },

  getMyOrderRequests: async () => {
    const res = await apiClient.get('/OrderRequests/my-orders');
    return res.data;
  },

  downloadInvoicePdf: async (invoiceId) => {
    const res = await apiClient.get(`/CustomerHistory/invoice/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return res.data;
  },

  exportHistoryPdf: async () => {
    const res = await apiClient.get('/CustomerHistory/export/pdf', {
      responseType: 'blob'
    });
    return res.data;
  }
};
