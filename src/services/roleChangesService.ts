import axios from 'axios';
import type {
  RoleChange,
  RoleChangeStatistics,
  CreateRoleChangeData,
  SearchRoleChangesData
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

function buildQueryParams(searchData?: SearchRoleChangesData): URLSearchParams {
  const params = new URLSearchParams();
  if (!searchData) return params;

  if (searchData.idUser !== undefined) params.append('idUser', String(searchData.idUser));
  if (searchData.changedBy !== undefined) params.append('changedBy', String(searchData.changedBy));
  if (searchData.startDate) params.append('startDate', searchData.startDate);
  if (searchData.endDate) params.append('endDate', searchData.endDate);
  if (searchData.page !== undefined) params.append('page', String(searchData.page));
  if (searchData.limit !== undefined) params.append('limit', String(searchData.limit));

  return params;
}

export const roleChangesService = {
  getAllRoleChanges: async (searchData?: SearchRoleChangesData): Promise<{
    data: RoleChange[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = buildQueryParams(searchData);
    const response = await apiClient.get<{
      data: RoleChange[];
      total: number;
      page: number;
      limit: number;
    }>('/role-changes', { params });
    return response.data;
  },

  getRoleChangesByUser: async (userId: number, searchData?: SearchRoleChangesData): Promise<{
    data: RoleChange[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = buildQueryParams(searchData);
    const response = await apiClient.get<{
      data: RoleChange[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/role-changes/by-user/${userId}`, { params });
    return response.data;
  },

  getRoleChangesByAdmin: async (adminId: number, searchData?: SearchRoleChangesData): Promise<{
    data: RoleChange[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = buildQueryParams(searchData);
    const response = await apiClient.get<{
      data: RoleChange[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/role-changes/by-admin/${adminId}`, { params });
    return response.data;
  },

  getRoleChangeById: async (id: number): Promise<RoleChange> => {
    const response = await apiClient.get<RoleChange>(`/role-changes/${id}`);
    return response.data;
  },

  getRoleChangeStatistics: async (): Promise<RoleChangeStatistics> => {
    const response = await apiClient.get<RoleChangeStatistics>('/role-changes/statistics/summary');
    return response.data;
  },

  createRoleChange: async (data: CreateRoleChangeData): Promise<RoleChange> => {
    const response = await apiClient.post<RoleChange>('/role-changes', data);
    return response.data;
  },
};
