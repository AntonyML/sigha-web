import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import type {
  Program,
  CreateProgramData,
  UpdateProgramData
} from '@/shared/types/program';
import { config } from '@/shared/config/app.config';

const apiClient = createApiClient({
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

export const programService = {

  getAllPrograms: async (): Promise<Program[]> => {
    try {
      // El backend devuelve los datos en response.data.data según el controller
      const response = await apiClient.get<{ message: string; data: Program[] }>('/programs');

      // Filtrar y validar que los programas tengan las propiedades necesarias
      return (response.data.data ?? []).filter(
        (program) =>
          program &&
          typeof program === 'object' &&
          typeof program.pName === 'string' &&
          program.pName.trim() !== ''
      );
    } catch (error) {
      console.error('❌ Error conectando con el backend de programas:', error);
      throw error;
    }
  },

  getProgramById: async (id: number): Promise<Program> => {
    try {
      const response = await apiClient.get<{ message: string; data: Program }>(`/programs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error obteniendo programa:', error);
      throw error;
    }
  },

  createProgram: async (data: CreateProgramData): Promise<Program> => {
    try {
      const response = await apiClient.post<{ message: string; data: Program }>('/programs', data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error creando programa:', error);
      throw error; // Propagar el error para que la UI lo maneje
    }
  },

  updateProgram: async (id: number, data: UpdateProgramData): Promise<Program> => {
    try {
      const response = await apiClient.put<{ message: string; data: Program }>(
        `/programs/${id}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ Error actualizando programa:', error);
      throw error;
    }
  },

  deleteProgram: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/programs/${id}`);
    } catch (error) {
      console.error('❌ Error eliminando programa:', error);
      throw error;
    }
  },
};