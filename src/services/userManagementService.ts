import axios from 'axios';
import type {
  User,
  CreateUserData,
  UpdateUserData
} from '../types/user';
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
    // El backend espera camelCase, no snake_case
    const backendData = {
      uIdentification: data.uIdentification,
      uName: data.uName,
      uFLastName: data.uFLastName,
      uSLastName: data.uSLastName || undefined,
      uEmail: data.uEmail,
      uPassword: data.uPassword,
      roleId: data.roleId
    };

    console.log('Enviando datos al backend (camelCase):', backendData);
    const response = await apiClient.post<User>('/users', backendData);
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