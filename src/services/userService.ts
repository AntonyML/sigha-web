import axios from 'axios';
import type {
  User,
  UserRole,
  CreateUserData,
  UpdateUserData,
  UserChangePasswordData,
  UserSearchParams,
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

export const userService = {
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
   * Actualizar usuario
   */
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Cambiar contraseña de usuario
   */
  changeUserPassword: async (id: number, data: UserChangePasswordData): Promise<void> => {
    await apiClient.patch(`/users/${id}/password`, data);
  },

  /**
   * Buscar usuarios (si el endpoint existe en el backend)
   */
  searchUsers: async (params: UserSearchParams): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', { params });
    return response.data;
  },

  /**
   * Obtener todos los roles (desde el módulo de roles)
   */
  getAllRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles');
    return response.data;
  },
};