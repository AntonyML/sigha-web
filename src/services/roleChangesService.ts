import axios from 'axios';
import type {
  RoleChange,
  CreateRoleChangeData,
  SearchRoleChangesData,
  RoleChangesResponse,
  RoleChangeStatistics
} from '../types/roleChanges';
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

export const roleChangesService = {
  /**
   * Crear un nuevo registro de cambio de rol
   */
  createRoleChange: async (changeData: CreateRoleChangeData): Promise<RoleChange> => {
    const response = await apiClient.post<RoleChange>('/role-changes', changeData);
    return response.data;
  },

  /**
   * Obtener todos los cambios de roles con filtros opcionales
   */
  getAllRoleChanges: async (searchData?: SearchRoleChangesData): Promise<RoleChangesResponse> => {
    const params = new URLSearchParams();

    if (searchData) {
      if (searchData.page) params.append('page', searchData.page.toString());
      if (searchData.limit) params.append('limit', searchData.limit.toString());
      if (searchData.userId) params.append('userId', searchData.userId.toString());
      if (searchData.adminId) params.append('adminId', searchData.adminId.toString());
      if (searchData.roleId) params.append('roleId', searchData.roleId.toString());
      if (searchData.changeType) params.append('changeType', searchData.changeType);
      if (searchData.startDate) params.append('startDate', searchData.startDate);
      if (searchData.endDate) params.append('endDate', searchData.endDate);
    }

    const response = await apiClient.get<{ data: RoleChange[]; total: number; page: number; limit: number }>(
      `/role-changes?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Obtener cambios de roles para un usuario específico
   */
  getRoleChangesByUser: async (
    userId: number,
    searchData?: SearchRoleChangesData
  ): Promise<{ data: RoleChange[]; total: number; page: number; limit: number; totalPages: number }> => {
    const params = new URLSearchParams();

    if (searchData) {
      if (searchData.page) params.append('page', searchData.page.toString());
      if (searchData.limit) params.append('limit', searchData.limit.toString());
      if (searchData.adminId) params.append('adminId', searchData.adminId.toString());
      if (searchData.roleId) params.append('roleId', searchData.roleId.toString());
      if (searchData.changeType) params.append('changeType', searchData.changeType);
      if (searchData.startDate) params.append('startDate', searchData.startDate);
      if (searchData.endDate) params.append('endDate', searchData.endDate);
    }

    const response = await apiClient.get<{
      data: RoleChange[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/role-changes/by-user/${userId}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener cambios de roles realizados por un admin específico
   */
  getRoleChangesByAdmin: async (
    adminId: number,
    searchData?: SearchRoleChangesData
  ): Promise<{ data: RoleChange[]; total: number; page: number; limit: number; totalPages: number }> => {
    const params = new URLSearchParams();

    if (searchData) {
      if (searchData.page) params.append('page', searchData.page.toString());
      if (searchData.limit) params.append('limit', searchData.limit.toString());
      if (searchData.userId) params.append('userId', searchData.userId.toString());
      if (searchData.roleId) params.append('roleId', searchData.roleId.toString());
      if (searchData.changeType) params.append('changeType', searchData.changeType);
      if (searchData.startDate) params.append('startDate', searchData.startDate);
      if (searchData.endDate) params.append('endDate', searchData.endDate);
    }

    const response = await apiClient.get<{
      data: RoleChange[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/role-changes/by-admin/${adminId}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener un cambio de rol específico por ID
   */
  getRoleChangeById: async (id: number): Promise<RoleChange> => {
    const response = await apiClient.get<RoleChange>(`/role-changes/${id}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de cambios de roles
   */
  getRoleChangeStatistics: async (): Promise<RoleChangeStatistics> => {
    const response = await apiClient.get<RoleChangeStatistics>('/role-changes/statistics/summary');
    return response.data;
  },
};