import axios from 'axios';
import type {
  Vaccine,
  CreateVaccineData,
  UpdateVaccineData,
  VaccineSearchParams,
  VaccineApiResponse
} from '../types/vaccine';

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

export const vaccineService = {

  getAllVaccines: async (): Promise<Vaccine[]> => {
    try {
      console.log('🔍 Conectando con backend para obtener vacunas...');
      const response = await apiClient.get('/vaccines');
      console.log('✅ Respuesta del backend (vacunas):', response.data);
      console.log('🔍 Estructura de response.data:', JSON.stringify(response.data, null, 2));
      
      // El backend puede devolver los datos directamente o en una estructura { data: [...] }
      const rawVaccines = Array.isArray(response.data) ? response.data : (response.data.data || []);
      console.log('🔍 Raw vaccines array:', JSON.stringify(rawVaccines, null, 2));
      
      // Verificar la estructura de las vacunas
      if (rawVaccines.length > 0) {
        console.log('🔍 Primera vacuna estructura:', JSON.stringify(rawVaccines[0], null, 2));
        console.log('🔍 Propiedades disponibles:', Object.keys(rawVaccines[0] || {}));
      }
      
      // Filtrar y validar que las vacunas tengan las propiedades necesarias
      const vaccines = rawVaccines.filter((vaccine: any) => {
        const isValid = vaccine && 
          typeof vaccine === 'object' && 
          vaccine.vName && 
          typeof vaccine.vName === 'string' &&
          vaccine.id !== undefined;
        
        if (!isValid) {
          console.log('❌ Vacuna inválida filtrada:', JSON.stringify(vaccine, null, 2));
        }
        return isValid;
      });
      
      console.log(`📋 ${vaccines.length} vacunas válidas cargadas desde la base de datos`);
      return vaccines;
    } catch (error) {
      console.error('❌ Error conectando con el backend de vacunas:', error);
      console.warn('⚠️ Usando datos mock como respaldo');
      
      // Datos mock como respaldo
      return [
        { id: 1, vName: 'Influenza (Gripe)' },
        { id: 2, vName: 'Neumococo' },
        { id: 3, vName: 'COVID-19' },
        { id: 4, vName: 'Hepatitis B' },
        { id: 5, vName: 'Tétanos y Difteria (Td)' },
        { id: 6, vName: 'Herpes Zóster' },
        { id: 7, vName: 'Hepatitis A' }
      ];
    }
  },

  getVaccineById: async (id: number): Promise<Vaccine> => {
    try {
      const response = await apiClient.get<Vaccine>(`/vaccines/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo vacuna:', error);
      throw error;
    }
  },

  createVaccine: async (data: CreateVaccineData): Promise<Vaccine> => {
    try {
      console.log('📤 Creando vacuna en el backend:', data);
      const response = await apiClient.post('/vaccines', data);
      console.log('✅ Vacuna creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando vacuna:', error);
      throw error; // Propagar el error para que la UI lo maneje
    }
  },

  updateVaccine: async (id: number, data: UpdateVaccineData): Promise<Vaccine> => {
    try {
      const response = await apiClient.put<Vaccine>(`/vaccines/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando vacuna:', error);
      throw error;
    }
  },

  deleteVaccine: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/vaccines/${id}`);
    } catch (error) {
      console.error('❌ Error eliminando vacuna:', error);
      throw error;
    }
  },

  searchVaccines: async (params: VaccineSearchParams): Promise<VaccineApiResponse> => {
    try {
      const response = await apiClient.get<VaccineApiResponse>('/vaccines/search', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando vacunas:', error);
      throw error;
    }
  },
};