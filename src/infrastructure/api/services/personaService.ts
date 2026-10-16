import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { config } from '@/shared/config/app.config';
import type { Persona, CrearPersonaPayload } from '@/shared/types/persona';

const apiClient = createApiClient({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
  }
  return reqConfig;
});

export const personaService = {
  create: async (payload: CrearPersonaPayload): Promise<Persona> => {
    const response = await apiClient.post<Persona>('/personas', payload);
    return response.data;
  },

  list: async (params?: {
    rol?: string;
    estado?: string;
    busqueda?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; data: Persona[] }> => {
    try {
      const response = await apiClient.get<{ total: number; data: Persona[] }>('/personas', {
        params,
      });
      return response.data;
    } catch {
      return { total: 0, data: [] };
    }
  },

  getById: async (id: string): Promise<Persona> => {
    const response = await apiClient.get<Persona>(`/personas/${id}`);
    return response.data;
  },

  update: async (id: string, payload: Partial<CrearPersonaPayload>): Promise<Persona> => {
    const response = await apiClient.patch<Persona>(`/personas/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/personas/${id}`);
    return response.data;
  },
};
