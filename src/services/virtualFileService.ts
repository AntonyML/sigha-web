import axios from 'axios';
import type {
  VirtualFile,
  CreateVirtualFileData,
  UpdateVirtualFileData,
  VirtualFileSearchParams,
  VirtualFileApiResponse,
  ApiFamily,
  ApiMedication,
  PatientBasicInfo,
  SearchPatientsResponse
} from '../types/virtualFile';
import { transformVirtualFileToApiPayload, mapApiToVirtualFile } from '../types/virtualFile';
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


export const virtualFileService = {

  getAllVirtualFiles: async (): Promise<VirtualFile[]> => {
    const response = await apiClient.get<{ message: string; data: any[] }>('/virtual-records/all');
    return (response.data.data ?? []).map(mapApiToVirtualFile);
  },


  getVirtualFileById: async (id: number): Promise<VirtualFile> => {
    const response = await apiClient.get<{ message: string; data: any }>(`/virtual-records/${id}`);
    return mapApiToVirtualFile(response.data.data);
  },


  createVirtualFile: async (
    data: CreateVirtualFileData, 
    familyInfo?: ApiFamily, 
    medications?: ApiMedication[],
    programId?: number,
    vaccineIds?: number[],
    subProgramId?: number | null
  ): Promise<VirtualFile> => {
    try {
      // Convertir los datos del formulario al formato esperado por el API
      const apiPayload = transformVirtualFileToApiPayload(data as VirtualFile, {
        family: familyInfo,
        medications: medications || [],
        observations: data.otrasCondiciones,
        programId: programId || 1,
        vaccineIds: vaccineIds || [],
        subProgramId: subProgramId
      });
      
      console.log('📤 Payload enviado al API:', JSON.stringify(apiPayload, null, 2));
      
      // Validar campos requeridos antes de enviar
      if (!apiPayload.oa_identification) {
        throw new Error('La cédula es requerida');
      }
      if (!apiPayload.oa_name) {
        throw new Error('El nombre es requerido');
      }
      if (!apiPayload.oa_birthdate) {
        throw new Error('La fecha de nacimiento es requerida');
      }
      
      // Validar que clinical_history tenga valores numéricos válidos
      if (!apiPayload.clinical_history.ch_weight || apiPayload.clinical_history.ch_weight <= 0) {
        console.warn('⚠️ Peso inválido, usando valor por defecto');
      }
      if (!apiPayload.clinical_history.ch_height || apiPayload.clinical_history.ch_height <= 0) {
        console.warn('⚠️ Altura inválida, usando valor por defecto');
      }
      
      console.log('✅ Validaciones pasadas, enviando al backend...');
      
      const response = await apiClient.post<VirtualFile>('/virtual-records/create', apiPayload);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en createVirtualFile:', error);
      if (error.response) {
        console.error('📄 Respuesta del servidor:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  },

  updateVirtualFile: async (
    id: number, 
    data: UpdateVirtualFileData,
    familyInfo?: ApiFamily, 
    medications?: ApiMedication[]
  ): Promise<VirtualFile> => {
    // Convertir los datos del formulario al formato esperado por el API
    const apiPayload = transformVirtualFileToApiPayload(data as VirtualFile, {
      family: familyInfo,
      medications: medications || [],
      observations: data.otrasCondiciones
    });
    
    console.log('📤 Payload de actualización enviado al API:', JSON.stringify(apiPayload, null, 2));
    
    const response = await apiClient.put<{ message: string; data: any }>(`/virtual-records/${id}`, apiPayload);
    return mapApiToVirtualFile(response.data.data);
  },

  deleteVirtualFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/virtual-records/${id}`);
  },

  searchVirtualFiles: async (params: VirtualFileSearchParams): Promise<VirtualFileApiResponse> => {
    const response = await apiClient.get<VirtualFileApiResponse>('/virtual-files/search', { params });
    return response.data;
  },

  /**
   * Search patients with basic information only
   * 
   * Universal search across identification, name, and last names
   * Returns only essential patient information (no programs, family, or clinical data)
   * 
   * @param searchTerm Search term to find by identification, name, or last names
   * @returns Promise<PatientBasicInfo[]>
   * 
   * Endpoint: GET /virtual-records/patients/search
   * Query param: search (required)
   * 
   * @example
   * // Search by name
   * const patients = await virtualFileService.searchPatientsBasic('María');
   * 
   * // Search by identification
   * const patients = await virtualFileService.searchPatientsBasic('1-1234');
   * 
   * // Search by last name
   * const patients = await virtualFileService.searchPatientsBasic('González');
   */
  searchPatientsBasic: async (searchTerm: string): Promise<PatientBasicInfo[]> => {
    try {
      const response = await apiClient.get<SearchPatientsResponse>(
        '/virtual-records/patients/search',
        {
          params: { search: searchTerm }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error searching patients (basic):', error);
      throw error;
    }
  },
};