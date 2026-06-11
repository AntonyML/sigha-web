import axios from 'axios';
import type {
  EmergencyContactApi,
  CreateEmergencyContactDto,
  UpdateEmergencyContactDto,
} from '../types/emergencyContact';
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

export const emergencyContactsService = {
  getAll: async (olderAdultId?: number): Promise<EmergencyContactApi[]> => {
    const params = olderAdultId ? { olderAdultId } : {};
    const response = await apiClient.get('/emergency-contacts', { params });
    return response.data?.data ?? response.data ?? [];
  },

  getByOlderAdult: async (olderAdultId: number): Promise<EmergencyContactApi[]> => {
    const response = await apiClient.get(`/emergency-contacts/by-older-adult/${olderAdultId}`);
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<EmergencyContactApi> => {
    const response = await apiClient.get(`/emergency-contacts/${id}`);
    return response.data?.data ?? response.data;
  },

  create: async (data: CreateEmergencyContactDto): Promise<EmergencyContactApi> => {
    const response = await apiClient.post('/emergency-contacts', data);
    return response.data?.data ?? response.data;
  },

  update: async (id: number, data: UpdateEmergencyContactDto): Promise<EmergencyContactApi> => {
    const response = await apiClient.patch(`/emergency-contacts/${id}`, data);
    return response.data?.data ?? response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/emergency-contacts/${id}`);
  },
};
