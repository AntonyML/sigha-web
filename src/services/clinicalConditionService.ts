import axios from 'axios';
import type {
  ClinicalCondition,
  CreateClinicalConditionData,
  UpdateClinicalConditionData,
  ClinicalConditionSearchParams,
  ClinicalConditionApiResponse
} from '../types/clinicalCondition';

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

export const clinicalConditionService = {

  getAllClinicalConditions: async (): Promise<ClinicalCondition[]> => {
    try {
      console.log('🔍 Conectando con backend para obtener condiciones clínicas...');
      const response = await apiClient.get('/clinical-conditions');
      console.log('✅ Respuesta del backend (condiciones clínicas):', response.data);
      console.log('🔍 Estructura de response.data:', JSON.stringify(response.data, null, 2));
      
      // El backend devuelve los datos en response.data.data según el controller
      const rawConditions = response.data.data || [];
      console.log('🔍 Raw conditions array:', JSON.stringify(rawConditions, null, 2));
      
      // Verificar la estructura de las condiciones clínicas
      if (rawConditions.length > 0) {
        console.log('🔍 Primera condición estructura:', JSON.stringify(rawConditions[0], null, 2));
        console.log('🔍 Propiedades disponibles:', Object.keys(rawConditions[0] || {}));
      }
      
      // Filtrar y validar que las condiciones tengan las propiedades necesarias
      const conditions = rawConditions.filter((condition: any) => {
        const isValid = condition && 
          typeof condition === 'object' && 
          condition.ccName && 
          typeof condition.ccName === 'string';
        
        if (!isValid) {
          console.log('❌ Condición clínica inválida filtrada:', JSON.stringify(condition, null, 2));
        }
        return isValid;
      });
      
      console.log(`📋 ${conditions.length} condiciones clínicas válidas cargadas desde la base de datos`);
      return conditions;
    } catch (error) {
      console.error('❌ Error conectando con el backend de condiciones clínicas:', error);
      console.warn('⚠️ Usando datos mock como respaldo');
      
      // Datos mock como respaldo
      return [
        { id: 1, ccName: 'HTA' },
        { id: 2, ccName: 'DBT' },
        { id: 3, ccName: 'Dislipidemia' },
        { id: 4, ccName: 'IRC' },
        { id: 5, ccName: 'Cardiopatía Isquémica' },
        { id: 6, ccName: 'ACV' },
        { id: 7, ccName: 'Amputación' },
        { id: 8, ccName: 'Tabaquismo' },
        { id: 9, ccName: 'Alcoholismo' },
        { id: 10, ccName: 'Parkinson' },
        { id: 11, ccName: 'Demencia' },
        { id: 12, ccName: 'Prostatismo' },
        { id: 13, ccName: 'Incontinencia Urinaria' },
        { id: 14, ccName: 'Caídas Frecuentes' },
        { id: 15, ccName: 'Neoplasias' }
      ];
    }
  },

  getClinicalConditionById: async (id: number): Promise<ClinicalCondition> => {
    try {
      const response = await apiClient.get<ClinicalCondition>(`/clinical-conditions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo condición clínica:', error);
      throw error;
    }
  },

  createClinicalCondition: async (data: CreateClinicalConditionData): Promise<ClinicalCondition> => {
    try {
      console.log('📤 Creando condición clínica:', data);
      const response = await apiClient.post('/clinical-conditions', data);
      console.log('✅ Condición clínica creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando condición clínica:', error);
      throw error; // Propagar el error para que la UI lo maneje
    }
  },

  updateClinicalCondition: async (id: number, data: UpdateClinicalConditionData): Promise<ClinicalCondition> => {
    try {
      const response = await apiClient.put<ClinicalCondition>(`/clinical-conditions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando condición clínica:', error);
      throw error;
    }
  },

  deleteClinicalCondition: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/clinical-conditions/${id}`);
    } catch (error) {
      console.error('❌ Error eliminando condición clínica:', error);
      throw error;
    }
  },

  searchClinicalConditions: async (params: ClinicalConditionSearchParams): Promise<ClinicalConditionApiResponse> => {
    try {
      const response = await apiClient.get<ClinicalConditionApiResponse>('/clinical-conditions/search', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando condiciones clínicas:', error);
      throw error;
    }
  },
};