import axios from 'axios';
import type {
  User,
  UpdateUserData,
  UserChangePasswordData
} from '../types/user';

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

export const profileService = {
  /**
   * Obtener perfil propio
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  /**
   * Actualizar perfil propio (campos limitados)
   */
  updateProfile: async (data: Partial<UpdateUserData>): Promise<User> => {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  /**
   * Cambiar contraseña propia
   */
  changePassword: async (data: UserChangePasswordData): Promise<void> => {
    await apiClient.post('/users/change-password', data);
  },
};