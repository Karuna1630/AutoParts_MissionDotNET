import { apiClient } from './api';

const API_URL = '/PurchaseInvoice';

export const getInvoices = async () => {
    try {
        const response = await apiClient.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const addInvoice = async (invoice) => {
    try {
        const response = await apiClient.post(API_URL, invoice);
        return response.data;
    } catch (error) {
        console.error('Error adding invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (id, invoice) => {
    try {
        const response = await apiClient.put(`${API_URL}/${id}`, invoice);
        return response.data;
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
};
