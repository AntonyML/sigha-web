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
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const backendData = {
      uIdentification: data.uIdentification,
      uName: data.uName,
      uFLastName: data.uFLastName,
      uSLastName: data.uSLastName || undefined,
      uEmail: data.uEmail,
      uPassword: data.uPassword,
      roleId: data.roleId
    };

    const response = await apiClient.post<User>('/users', backendData);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  searchUsers: async (searchTerm: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', {
      params: { term: searchTerm }
    });
    return response.data;
  },

  getUsersByRole: async (roleId: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/users/by-role/${roleId}`);
    return response.data;
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },
};
