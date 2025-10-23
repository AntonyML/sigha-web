import axios from 'axios';
import type {
  DigitalRecord,
  CreateDigitalRecordDto,
  SearchDigitalRecordsDto,
  PaginatedDigitalRecordsResponse,
  AuditStatistics,
} from '../types/audit';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Cliente HTTP para el módulo de auditoría
 * Sincronizado con backend NestJS audit.service.ts
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401 (no autenticado)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio de auditoría
 * Endpoints sincronizados con backend NestJS:
 * - POST /audit/digital-records
 * - GET /audit/digital-records/search
 * - GET /audit/digital-records/:id
 * - GET /audit/statistics
 */
export const auditService = {
  /**
   * Buscar registros digitales con filtros
   * Backend: searchDigitalRecords()
   * Endpoint: GET /audit/digital-records/search
   */
  searchDigitalRecords: async (
    params?: SearchDigitalRecordsDto
  ): Promise<PaginatedDigitalRecordsResponse> => {
    const response = await apiClient.get<PaginatedDigitalRecordsResponse>(
      '/audit/digital-records/search',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener un registro digital por ID
   * Backend: getDigitalRecordById()
   * Endpoint: GET /audit/digital-records/:id
   */
  getDigitalRecordById: async (id: number): Promise<DigitalRecord> => {
    const response = await apiClient.get<DigitalRecord>(`/audit/digital-records/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo registro digital (auditoría)
   * Backend: createDigitalRecord()
   * Endpoint: POST /audit/digital-records
   * Nota: Requiere userId del usuario autenticado
   */
  createDigitalRecord: async (
    userId: number,
    data: CreateDigitalRecordDto
  ): Promise<DigitalRecord> => {
    const response = await apiClient.post<DigitalRecord>('/audit/digital-records', {
      userId,
      ...data,
    });
    return response.data;
  },

  /**
   * Obtener estadísticas de auditoría
   * Backend: getAuditStatistics()
   * Endpoint: GET /audit/statistics
   */
  getAuditStatistics: async (startDate?: string, endDate?: string): Promise<AuditStatistics> => {
    const response = await apiClient.get<AuditStatistics>('/audit/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Exportar auditorías a CSV (Frontend genera el CSV)
   * Usa searchDigitalRecords con limit alto y genera CSV localmente
   */
  exportDigitalRecords: async (params?: SearchDigitalRecordsDto): Promise<Blob> => {
    const data = await auditService.searchDigitalRecords({ ...params, limit: 10000 });
    
    // Generar CSV manualmente
    const headers = ['ID', 'Usuario', 'Acción', 'Tabla', 'ID Registro', 'Descripción', 'Fecha'];
    const rows = data.records.map(record => [
      record.id,
      record.userName,
      record.action,
      record.tableName || 'N/A',
      record.recordId || 'N/A',
      record.description || 'N/A',
      new Date(record.timestamp).toLocaleString('es-CR'),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },
};
