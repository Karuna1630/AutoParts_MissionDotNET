import axios from 'axios';

const API_URL = 'http://localhost:5052/api/PurchaseInvoice';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getInvoices = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const addInvoice = async (invoice) => {
    try {
        const response = await axios.post(API_URL, invoice, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error adding invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (id, invoice) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, invoice, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
};
