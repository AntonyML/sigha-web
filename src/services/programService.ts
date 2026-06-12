import axios from 'axios';
import type {
  Program,
  CreateProgramData,
  UpdateProgramData,
  ProgramApiResponse
} from '../types/program';
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

export const programService = {

  getAllPrograms: async (): Promise<Program[]> => {
    try {
      console.log('🔍 Conectando con backend para obtener programas...');
      const response = await apiClient.get('/programs');
      console.log('✅ Respuesta del backend (programas):', response.data);
      
      // El backend devuelve los datos en response.data.data según el controller
      const rawPrograms = response.data.data || [];
      
      // Filtrar y validar que los programas tengan las propiedades necesarias
      const programs = rawPrograms.filter((program: any) => 
        program && 
        typeof program === 'object' && 
        program.pName && 
        typeof program.pName === 'string'
      );
      
      console.log(`📋 ${programs.length} programas válidos cargados con sus subprogramas desde el backend`);
      return programs;
    } catch (error) {
      console.error('❌ Error conectando con el backend de programas:', error);
      console.warn('⚠️ Usando datos mock como respaldo');
      
      // Datos mock como respaldo con la nueva estructura
      return [
        {
          id: 1,
          pName: 'Hogar de Larga Instancia',
          createAt: new Date().toISOString(),
          subPrograms: [
            { id: 1, spName: 'Cuidado General', idProgram: 1 },
            { id: 2, spName: 'Fisioterapia', idProgram: 1 }
          ]
        },
        {
          id: 2,
          pName: 'Actividades Recreativas',
          createAt: new Date().toISOString(),
          subPrograms: [
            { id: 3, spName: 'Música y Arte', idProgram: 2 },
            { id: 4, spName: 'Juegos de Mesa', idProgram: 2 }
          ]
        },
        {
          id: 3,
          pName: 'Educación Continua',
          createAt: new Date().toISOString(),
          subPrograms: []
        }
      ];
    }
  },

  getProgramById: async (id: number): Promise<Program> => {
    try {
      const response = await apiClient.get<Program>(`/programs/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo programa:', error);
      throw error;
    }
  },

  createProgram: async (data: CreateProgramData): Promise<Program> => {
    try {
      console.log('📤 Creando programa en el backend:', data);
      const response = await apiClient.post('/programs', data);
      console.log('✅ Programa creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando programa:', error);
      throw error; // Propagar el error para que la UI lo maneje
    }
  },

  updateProgram: async (id: number, data: UpdateProgramData): Promise<Program> => {
    try {
      const response = await apiClient.put<Program>(`/programs/${id}`, data);
      return response.data;
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

  searchPrograms: async (params: { pName?: string; [k: string]: unknown }): Promise<ProgramApiResponse> => {
    try {
      const response = await apiClient.get<ProgramApiResponse>('/programs/search', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando programas:', error);
      throw error;
    }
  },
};