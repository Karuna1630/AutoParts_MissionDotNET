import { apiClient } from './api';

const API_URL = '/admin/purchase-invoices';

export const getInvoices = async (pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get(API_URL, {
            params: { pageNumber, pageSize }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        throw error;
    }
};

export const addInvoice = async (invoiceData) => {
    try {
        // invoiceData should match CreatePurchaseInvoiceDto
        const response = await apiClient.post(API_URL, invoiceData);
        return response.data;
    } catch (error) {
        console.error('Error adding invoice:', error);
        throw error;
    }
};

// Note: Update and Delete might not be needed for stock purchase records 
// to maintain audit trail, but we can add them if required later.
