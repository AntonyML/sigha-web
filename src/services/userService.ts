import axios from 'axios';
import type {
  User,
  UserRole,
  CreateUserData,
  UpdateUserData,
  UserChangePasswordData,
  UserSearchParams,
  UserApiResponse
} from '../types/user';

const API_BASE_URL = 'http://localhost:9999/api';

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

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UserApiResponse>('/users');
    return response.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },

  changeUserPassword: async (id: number, data: UserChangePasswordData): Promise<void> => {
    await apiClient.patch(`/users/${id}/password`, data);
  },

  searchUsers: async (params: UserSearchParams): Promise<UserApiResponse> => {
    const response = await apiClient.get<UserApiResponse>('/users/search', { params });
    return response.data;
  },

  getAllRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles');
    return response.data;
  },

  getCurrentUserProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  updateCurrentUserProfile: async (data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },
};