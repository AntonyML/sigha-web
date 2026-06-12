// src/services/olderAdultUpdatesService.ts
// Sincronizado con backend: controller/older-adult-updates/older-adult-updates.controller.ts
// Endpoints:
//   GET  /older-adult-updates?olderAdultId=&fieldChanged=&changedBy=
//   GET  /older-adult-updates/by-older-adult/:olderAdultId
//   GET  /older-adult-updates/:id

import axios from 'axios';
import { config } from '../config/app.config';

export interface OlderAdultUpdateApi {
  id: number;
  oauFieldChanged: string;
  oauOldValue?: string | null;
  oauNewValue?: string | null;
  changedAt: string;
  idOlderAdult: number;
  changedBy: number;
  changedByUser?: { id: number; uName: string; uFLastName: string; uEmail: string };
}

export interface OlderAdultUpdatesFilterParams {
  olderAdultId?: number;
  fieldChanged?: string;
  changedBy?: number;
}

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const olderAdultUpdatesService = {
  async getAll(filters: OlderAdultUpdatesFilterParams = {}): Promise<OlderAdultUpdateApi[]> {
    const params: Record<string, unknown> = {};
    if (filters.olderAdultId !== undefined) params.olderAdultId = filters.olderAdultId;
    if (filters.fieldChanged) params.fieldChanged = filters.fieldChanged;
    if (filters.changedBy !== undefined) params.changedBy = filters.changedBy;
    const response = await apiClient.get('/older-adult-updates', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getByOlderAdult(olderAdultId: number): Promise<OlderAdultUpdateApi[]> {
    const response = await apiClient.get(`/older-adult-updates/by-older-adult/${olderAdultId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getById(id: number): Promise<OlderAdultUpdateApi> {
    const response = await apiClient.get(`/older-adult-updates/${id}`);
    return response.data?.data ?? response.data;
  },
};
