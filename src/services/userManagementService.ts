import axios from 'axios';
import type {
  User,
  CreateUserData,
  UpdateUserData
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

export const userManagementService = {
  /**
   * Obtener todos los usuarios
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  /**
   * Obtener usuario por ID
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  /**
   * Actualizar usuario (solo admins)
   */
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Buscar usuarios
   */
  searchUsers: async (searchTerm: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', {
      params: { term: searchTerm }
    });
    return response.data;
  },

  /**
   * Obtener usuarios por rol
   */
  getUsersByRole: async (roleId: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/users/by-role/${roleId}`);
    return response.data;
  },

  /**
   * Activar/Desactivar usuario (solo admins)
   */
  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },
};