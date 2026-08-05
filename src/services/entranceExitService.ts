import axios from 'axios';
import type {
  EntranceExitApiPayload,
  EntranceExitResponse
} from '../types/entranceExit';
import type {
  EntranceExitListResponse,
  EntranceExitSearchParams
} from '../types/entranceExitApi';
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

type AxiosErrorLike = {
  response?: {
    status?: number;
    statusText?: string;
    data?: { message?: string; error?: string };
  };
  config?: { url?: string; method?: string };
};

export const entranceExitService = {
  getAllEntranceExits: async (): Promise<EntranceExitResponse[]> => {
    // No generic "get all" endpoint exists on the backend (the controller only
    // exposes /open-entrances, /open-exits and /closed-records). Aggregate
    // those three existing endpoints instead of calling the non-existent
    // root GET /entrances-exits (which returns 404).
    const [openEntrances, openExits, closedRecords] = await Promise.all([
      apiClient.get<EntranceExitResponse[]>('/entrances-exits/open-entrances'),
      apiClient.get<EntranceExitResponse[]>('/entrances-exits/open-exits'),
      apiClient.get<EntranceExitResponse[]>('/entrances-exits/closed-records'),
    ]);

    return [
      ...(Array.isArray(openEntrances.data) ? openEntrances.data : []),
      ...(Array.isArray(openExits.data) ? openExits.data : []),
      ...(Array.isArray(closedRecords.data) ? closedRecords.data : []),
    ];
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
      eeDatetimeExit: new Date().toISOString(),
      eeObservations: "Ciclo cerrado automáticamente"
    };
    const response = await apiClient.patch<EntranceExitResponse>(`/entrances-exits/${id}/close-cycle`, updateData);
    return response.data;
  },

  finalizeEntranceRecord: async (id: number): Promise<EntranceExitResponse> => {
    const now = new Date().toISOString();
    const updateData = {
      eeDatetimeExit: now,
      eeObservations: "Ciclo de entrada cerrado automáticamente",
      eeClose: true
    };
    
    try {
      
      const response = await apiClient.patch<EntranceExitResponse>(`/entrances-exits/${id}/close-cycle`, updateData);
      return response.data;
    } catch (error: unknown) {
      const e = error as AxiosErrorLike;
      console.error('❌ Full Error Object:', error);
      console.error('❌ Server Response Message:', e.response?.data?.message);
      console.error('❌ Complete Error Details:', {
        status: e.response?.status,
        statusText: e.response?.statusText,
        serverMessage: e.response?.data?.message,
        serverError: e.response?.data?.error,
        fullData: e.response?.data,
        url: e.config?.url,
        method: e.config?.method,
        payload: updateData
      });
      throw error;
    }
  },

  finalizeExitRecord: async (id: number): Promise<EntranceExitResponse> => {
    const updateData = {
      eeObservations: "Ciclo de salida cerrado automáticamente", 
      eeClose: true
    };
    
    try {
      console.log('🔄 Finalizing exit cycle - ID:', id);
      console.log('📤 Payload being sent:', JSON.stringify(updateData, null, 2));
      
      const response = await apiClient.patch<EntranceExitResponse>(`/entrances-exits/${id}/close-cycle`, updateData);
      console.log('✅ Response received:', response.data);
      return response.data;
    } catch (error: unknown) {
      const e = error as AxiosErrorLike;
      console.error('❌ Error details:', {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        url: e.config?.url,
        method: e.config?.method,
        payload: updateData
      });
      throw error;
    }
  },

  deleteEntranceExit: async (id: number): Promise<void> => {
    await apiClient.delete(`/entrances-exits/${id}`);
  },

  searchEntranceExits: async (params: EntranceExitSearchParams): Promise<EntranceExitListResponse> => {
    const response = await apiClient.get<EntranceExitListResponse>('/entrances-exits/search', { params });
    return response.data;
  },

  getClosedRecords: async (): Promise<EntranceExitResponse[]> => {
    try {
      console.log('Fetching closed records...');
      const response = await apiClient.get<EntranceExitResponse[]>('/entrances-exits/closed-records');
      console.log(' Closed records response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.warn('Response is not an array for closed records:', response.data);
        return [];
      }
      
      console.log('Returning closed records array:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching closed records:', error);
      return [];
    }
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