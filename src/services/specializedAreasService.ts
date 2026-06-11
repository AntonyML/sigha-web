import axios from 'axios';
import type {
  SpecializedAreaApi,
  CreateSpecializedAreaDto,
  UpdateSpecializedAreaDto,
} from '../types/specializedArea';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export const specializedAreasService = {
  getAll: async (onlyActive?: boolean): Promise<SpecializedAreaApi[]> => {
    const params = onlyActive !== undefined ? { onlyActive: String(onlyActive) } : {};
    const response = await apiClient.get('/specialized-areas', { params });
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<SpecializedAreaApi> => {
    const response = await apiClient.get(`/specialized-areas/${id}`);
    return response.data?.data ?? response.data;
  },

  create: async (data: CreateSpecializedAreaDto): Promise<SpecializedAreaApi> => {
    const response = await apiClient.post('/specialized-areas', data);
    return response.data?.data ?? response.data;
  },

  update: async (id: number, data: UpdateSpecializedAreaDto): Promise<SpecializedAreaApi> => {
    const response = await apiClient.patch(`/specialized-areas/${id}`, data);
    return response.data?.data ?? response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/specialized-areas/${id}`);
  },
};
