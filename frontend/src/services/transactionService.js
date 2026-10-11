import api from './authService';

export const fetchTransactions = async () => api.get('/transactions');
export const createTransaction = async (payload) => api.post('/transactions', payload);
export const updateTransaction = async (id, payload) => api.put(`/transactions/${id}`, payload);
export const deleteTransaction = async (id) => api.delete(`/transactions/${id}`);
