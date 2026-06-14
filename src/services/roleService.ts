import axios from 'axios';
import type { UserRole, CreateRoleData, UpdateRoleData } from '../types/user';
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
  getAllRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles');
    return response.data;
  },

  getRoleById: async (id: number): Promise<UserRole> => {
    const response = await apiClient.get<UserRole>(`/roles/${id}`);
    return response.data;
  },

  createRole: async (roleData: CreateRoleData): Promise<UserRole> => {
    const response = await apiClient.post<UserRole>('/roles', roleData);
    return response.data;
  },

  updateRole: async (id: number, roleData: UpdateRoleData): Promise<UserRole> => {
    const response = await apiClient.patch<UserRole>(`/roles/${id}`, roleData);
    return response.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};
