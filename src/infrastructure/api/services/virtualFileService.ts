import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
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
} from '@/shared/types/virtualFile';
import { transformVirtualFileToApiPayload, mapApiToVirtualFile } from '@/shared/types/virtualFile';
import { config } from '@/shared/config/app.config';
import axios from 'axios';

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


export const virtualFileService = {

  getAllVirtualFiles: async (): Promise<VirtualFile[]> => {
    const response = await apiClient.get<{ message: string; data: unknown[] }>('/virtual-records/all');
    return (response.data.data ?? []).map(mapApiToVirtualFile);
  },


  getVirtualFileById: async (id: number): Promise<VirtualFile> => {
    const response = await apiClient.get<{ message: string; data: unknown }>(`/virtual-records/${id}`);
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

      /* El backend exige el familiar responsable siempre (DTO + SQL 019):
         fallar aquí con mensaje claro en vez de provocar un 400. */
      const fam = apiPayload.family;
      if (!fam || !fam.pf_identification?.trim()) {
        throw new Error('La cédula del familiar es obligatoria.');
      }
      if (!fam.pf_name?.trim()) {
        throw new Error('El nombre del familiar es obligatorio.');
      }
      if (!fam.pf_f_last_name?.trim()) {
        throw new Error('El primer apellido del familiar es obligatorio.');
      }
      if (!fam.pf_s_last_name?.trim()) {
        throw new Error('El segundo apellido del familiar es obligatorio.');
      }
      if (!fam.pf_phone_number?.trim()) {
        throw new Error('El teléfono del familiar es obligatorio.');
      }
      if (!fam.pf_email?.trim()) {
        throw new Error('El correo del familiar es obligatorio.');
      }
      if (!fam.pf_kinship?.trim()) {
        throw new Error('El parentesco del familiar es obligatorio.');
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
    } catch (error: unknown) {
      console.error('❌ Error en createVirtualFile:', error);
      if (axios.isAxiosError(error) && error.response) {
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
    
    const response = await apiClient.put<{ message: string; data: unknown }>(`/virtual-records/${id}`, apiPayload);
    return mapApiToVirtualFile(response.data.data);
  },

  deleteVirtualFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/virtual-records/${id}`);
  },

  searchVirtualFiles: async (params: VirtualFileSearchParams): Promise<VirtualFileApiResponse> => {
    /* Contrato acordado web↔api: el API no expone GET /virtual-files/search
       (solo /virtual-records/search, /virtual-records/patients/search y
       /virtual-records/all). Este helper solo se usa para el chequeo de cédula
       duplicada, así que consulta /virtual-records/search?search=<cedula>. */
    const raw = (params.cedula || params.nombreApellido || '').trim()
    if (!raw) return { data: [], total: 0, page: 1, limit: 0 }
    const response = await apiClient.get<{ message: string; data: unknown[] }>(
      '/virtual-records/search',
      { params: { search: raw } },
    )
    const list = Array.isArray(response.data.data) ? response.data.data : []
    const items = list
      .map(mapApiToVirtualFile)
      .filter((item) => {
        const ced = (item as VirtualFile).cedula
        return !params.cedula || ced === params.cedula || ced === raw
      })
    return { data: items, total: items.length, page: 1, limit: items.length }
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
