import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { config } from '@/shared/config/app.config';
import type {
  PlantillaPerfil,
  PerfilDigital,
  SeccionCampo,
  DefinicionCampo,
  CrearSeccionPayload,
  CrearCampoPayload,
} from '@/shared/types/perfilDigital';

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

export const perfilDigitalService = {
  getPlantillaVigente: async (rol: string = 'RESIDENTE'): Promise<PlantillaPerfil> => {
    const response = await apiClient.get<PlantillaPerfil>('/perfil-digital/plantilla/vigente', {
      params: { rol },
    });
    return response.data;
  },

  getByPerfilId: async (
    perfilId: string,
  ): Promise<{
    perfilDigital: PerfilDigital | null;
    esquema: PlantillaPerfil | null;
  }> => {
    const response = await apiClient.get<{
      perfilDigital: PerfilDigital | null;
      esquema: PlantillaPerfil | null;
    }>(`/perfil-digital/${perfilId}`);
    return response.data;
  },

  saveDatos: async (
    perfilId: string,
    payload: {
      datos: Record<string, any>;
      metadata?: Record<string, any>;
      plantillaId?: string;
    },
  ): Promise<PerfilDigital> => {
    const response = await apiClient.put<PerfilDigital>(`/perfil-digital/${perfilId}`, payload);
    return response.data;
  },

  createSeccion: async (payload: CrearSeccionPayload): Promise<SeccionCampo> => {
    const response = await apiClient.post<SeccionCampo>('/perfil-digital/secciones', payload);
    return response.data;
  },

  createCampo: async (payload: CrearCampoPayload): Promise<DefinicionCampo> => {
    const response = await apiClient.post<DefinicionCampo>('/perfil-digital/campos', payload);
    return response.data;
  },

  updateCampo: async (
    campoId: string,
    payload: Partial<CrearCampoPayload>,
  ): Promise<DefinicionCampo> => {
    const response = await apiClient.patch<DefinicionCampo>(
      `/perfil-digital/campos/${campoId}`,
      payload,
    );
    return response.data;
  },

  deleteCampo: async (campoId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/perfil-digital/campos/${campoId}`,
    );
    return response.data;
  },
};
