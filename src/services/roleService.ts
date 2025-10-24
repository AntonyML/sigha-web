import axios from 'axios';
import type { UserRole } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const roleService = {
  /**
   * Obtener todos los roles
   */
  getAllRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles');
    return response.data;
  },
};