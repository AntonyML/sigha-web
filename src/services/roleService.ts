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
  /**
   * Obtener todos los roles
   */
  getAllRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles');
    return response.data;
  },

  /**
   * Obtener roles administrativos
   */
  getAdminRoles: async (): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>('/roles/admin-roles');
    return response.data;
  },

  /**
   * Obtener un rol por ID
   */
  getRoleById: async (id: number): Promise<UserRole> => {
    const response = await apiClient.get<UserRole>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo rol
   */
  createRole: async (roleData: CreateRoleData): Promise<UserRole> => {
    const response = await apiClient.post<UserRole>('/roles', roleData);
    return response.data;
  },

  /**
   * Actualizar un rol existente
   */
  updateRole: async (id: number, roleData: UpdateRoleData): Promise<UserRole> => {
    const response = await apiClient.patch<UserRole>(`/roles/${id}`, roleData);
    return response.data;
  },

  /**
   * Eliminar un rol
   */
  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  /**
   * Verificar si un rol es administrativo
   */
  isAdminRole: async (id: number): Promise<boolean> => {
    const response = await apiClient.get<{ isAdmin: boolean }>(`/roles/${id}/is-admin`);
    return response.data.isAdmin;
  },

  /**
   * Verificar si un rol requiere 2FA
   */
  requiresTwoFactor: async (id: number): Promise<boolean> => {
    const response = await apiClient.get<{ requires2FA: boolean }>(`/roles/${id}/requires-2fa`);
    return response.data.requires2FA;
  },

  /**
   * Inicializar roles del sistema
   */
  initializeSystemRoles: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/roles/initialize-system-roles');
    return response.data;
  },
};