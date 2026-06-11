import axios from 'axios';
import type { OlderAdultUpdate } from '../types/olderAdultUpdates';
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

export const olderAdultUpdatesService = {
  getAll: async (olderAdultId?: number, fieldChanged?: string, changedBy?: number): Promise<OlderAdultUpdate[]> => {
    const params: Record<string, unknown> = {};
    if (olderAdultId) params.olderAdultId = olderAdultId;
    if (fieldChanged) params.fieldChanged = fieldChanged;
    if (changedBy) params.changedBy = changedBy;
    const response = await apiClient.get('/older-adult-updates', { params });
    return response.data?.data ?? response.data ?? [];
  },

  getByOlderAdult: async (olderAdultId: number): Promise<OlderAdultUpdate[]> => {
    const response = await apiClient.get(`/older-adult-updates/by-older-adult/${olderAdultId}`);
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<OlderAdultUpdate> => {
    const response = await apiClient.get(`/older-adult-updates/${id}`);
    return response.data?.data ?? response.data;
  },
};
