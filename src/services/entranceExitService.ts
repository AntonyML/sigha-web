import axios from 'axios';
import type {
  EntranceExitApiPayload,
  EntranceExitResponse
} from '../types/entranceExit';
import type {
  EntranceExitListResponse,
  EntranceExitSearchParams
} from '../types/entranceExitApi';

const API_BASE_URL = 'http://localhost:3000';

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

export const entranceExitService = {
  getAllEntranceExits: async (): Promise<EntranceExitResponse[]> => {
    const response = await apiClient.get<EntranceExitListResponse>('/entrances-exits');
    return response.data.data;
  },

  getEntranceExitById: async (id: number): Promise<EntranceExitResponse> => {
    const response = await apiClient.get<EntranceExitResponse>(`/entrances-exits/${id}`);
    return response.data;
  },

  createEntranceExit: async (data: EntranceExitApiPayload): Promise<EntranceExitResponse> => {
    const response = await apiClient.post<EntranceExitResponse>('/entrances-exits', data);
    return response.data;
  },

  updateEntranceExit: async (id: number, data: Partial<EntranceExitApiPayload>): Promise<EntranceExitResponse> => {
    const response = await apiClient.put<EntranceExitResponse>(`/entrances-exits/${id}`, data);
    return response.data;
  },

  finalizeEntranceExit: async (id: number): Promise<EntranceExitResponse> => {
    const updateData = {
      eeClose: true,
      eeDatetimeExit: new Date().toISOString()
    };
    const response = await apiClient.patch<EntranceExitResponse>(`/entrances-exits/${id}/finalize`, updateData);
    return response.data;
  },

  deleteEntranceExit: async (id: number): Promise<void> => {
    await apiClient.delete(`/entrances-exits/${id}`);
  },

  searchEntranceExits: async (params: EntranceExitSearchParams): Promise<EntranceExitListResponse> => {
    const response = await apiClient.get<EntranceExitListResponse>('/entrances-exits/search', { params });
    return response.data;
  },

  getActiveEntrances: async (): Promise<EntranceExitResponse[]> => {
    try {
      const response = await apiClient.get<EntranceExitResponse[]>('/entrances-exits/open-entrances');
      if (!Array.isArray(response.data)) {
        return [];
      }
      return response.data;
    } catch (error) {
      console.error(' Error :', error);
      return [];
    }
  },

  getActiveExits: async (): Promise<EntranceExitResponse[]> => {
    try {
      console.log('🔍 Fetching open exits...');
      const response = await apiClient.get<EntranceExitResponse[]>('/entrances-exits/open-exits');
      console.log('📥 Open exits response:', response.data);
    
      if (!Array.isArray(response.data)) {
        console.warn('Response is not an array for exits:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error :', error);
      return [];
    }
  }
};