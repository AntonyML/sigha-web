import axios from 'axios';
import type {
  SubProgram,
  CreateSubProgramData,
  UpdateSubProgramData,
  SubProgramSearchParams,
  SubProgramApiResponse
} from '../types/subProgram';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

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

export const subProgramService = {

  getAllSubPrograms: async (): Promise<SubProgram[]> => {
    try {
      console.log('🔍 Conectando con backend para obtener subprogramas desde /programs...');
      const response = await apiClient.get('/programs');
      console.log('✅ Respuesta del backend (programas con subprogramas):', response.data);
      
      // Extraer todos los subprogramas de todos los programas
      const programs = Array.isArray(response.data) ? response.data : (response.data.data || []);
      const allSubPrograms: SubProgram[] = [];
      
      programs.forEach((program: any) => {
        if (program.subPrograms && Array.isArray(program.subPrograms)) {
          program.subPrograms.forEach((subProgram: any) => {
            allSubPrograms.push({
              id: subProgram.id,
              spName: subProgram.spName,
              programId: subProgram.idProgram || program.id, // usar idProgram del subprograma o id del programa padre
              program: {
                id: program.id,
                pName: program.pName
              }
            });
          });
        }
      });
      
      console.log(`📋 ${allSubPrograms.length} subprogramas extraídos desde la base de datos`);
      return allSubPrograms;
    } catch (error) {
      console.error('❌ Error conectando con el backend de subprogramas:', error);
      console.warn('⚠️ Usando datos mock como respaldo');
      
      // Datos mock como respaldo
      return [
        {
          id: 1,
          spName: 'Atención Médica Diaria',
          programId: 1,
          program: { id: 1, pName: 'Programa de Salud Integral' }
        },
        {
          id: 2,
          spName: 'Terapia Física',
          programId: 1,
          program: { id: 1, pName: 'Programa de Salud Integral' }
        },
        {
          id: 3,
          spName: 'Actividades Grupales',
          programId: 2,
          program: { id: 2, pName: 'Actividades Recreativas' }
        },
        {
          id: 4,
          spName: 'Juegos de Mesa',
          programId: 2,
          program: { id: 2, pName: 'Actividades Recreativas' }
        }
      ];
    }
  },

  getSubProgramsByProgram: async (programId: number): Promise<SubProgram[]> => {
    try {
      // Obtener todos los subprogramas y filtrar por programa
      const allSubPrograms = await subProgramService.getAllSubPrograms();
      return allSubPrograms.filter((sp: SubProgram) => sp.programId === programId);
    } catch (error) {
      console.error('❌ Error obteniendo subprogramas por programa:', error);
      return [];
    }
  },

  getSubProgramById: async (id: number): Promise<SubProgram> => {
    try {
      const response = await apiClient.get<SubProgram>(`/sub-programs/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo subprograma:', error);
      throw error;
    }
  },

  createSubProgram: async (data: CreateSubProgramData): Promise<SubProgram> => {
    try {
      console.log('📤 Creando subprograma en el backend:', data);
      const response = await apiClient.post('/sub-programs', data);
      console.log('✅ Subprograma creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando subprograma:', error);
      throw error; // Propagar el error para que la UI lo maneje
    }
  },

  updateSubProgram: async (id: number, data: UpdateSubProgramData): Promise<SubProgram> => {
    try {
      const response = await apiClient.put<SubProgram>(`/sub-programs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando subprograma:', error);
      throw error;
    }
  },

  deleteSubProgram: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/sub-programs/${id}`);
    } catch (error) {
      console.error('❌ Error eliminando subprograma:', error);
      throw error;
    }
  },

  searchSubPrograms: async (params: SubProgramSearchParams): Promise<SubProgramApiResponse> => {
    try {
      const response = await apiClient.get<SubProgramApiResponse>('/sub-programs/search', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando subprogramas:', error);
      throw error;
    }
  },
};