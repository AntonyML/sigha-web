import axios from 'axios';
import type { UserRole } from '../types/user';
import { config } from '../config/app.config';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
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