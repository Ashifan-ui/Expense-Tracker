import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (payload) => api.post('/auth/register', payload);
export const loginUser = async (payload) => api.post('/auth/login', payload);
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('user');
    return null;
  }

  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export default api;
