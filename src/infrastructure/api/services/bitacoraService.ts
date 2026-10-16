import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { config } from '@/shared/config/app.config';
import type {
  BitacoraEntrada,
  BitacoraAcuse,
  BitacoraEstado,
  CrearBitacoraPayload,
} from '@/shared/types/bitacora';

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

export const bitacoraService = {
  getByPerfil: async (perfilId: string): Promise<BitacoraEntrada[]> => {
    try {
      const response = await apiClient.get<BitacoraEntrada[]>(`/bitacora/perfil/${perfilId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getByOlderAdult: async (olderAdultId: number): Promise<BitacoraEntrada[]> => {
    try {
      const response = await apiClient.get<BitacoraEntrada[]>(
        `/bitacora/older-adult/${olderAdultId}`,
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  create: async (payload: CrearBitacoraPayload): Promise<BitacoraEntrada> => {
    const response = await apiClient.post<BitacoraEntrada>('/bitacora', payload);
    return response.data;
  },

  updateStatus: async (
    id: number,
    estado: BitacoraEstado,
    comentario?: string,
  ): Promise<BitacoraEntrada> => {
    const response = await apiClient.patch<BitacoraEntrada>(`/bitacora/${id}/status`, {
      estado,
      comentario,
    });
    return response.data;
  },

  acknowledge: async (id: number, comentario?: string): Promise<BitacoraAcuse> => {
    const response = await apiClient.post<BitacoraAcuse>(`/bitacora/${id}/acknowledge`, {
      comentario,
    });
    return response.data;
  },

  getById: async (id: number): Promise<BitacoraEntrada> => {
    const response = await apiClient.get<BitacoraEntrada>(`/bitacora/${id}`);
    return response.data;
  },

  list: async (params?: {
    categoria?: string;
    visibilidad?: string;
    urgencia?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; data: BitacoraEntrada[] }> => {
    try {
      const response = await apiClient.get<{ total: number; data: BitacoraEntrada[] }>(
        '/bitacora',
        { params },
      );
      return response.data;
    } catch {
      return { total: 0, data: [] };
    }
  },
};
