import axios from 'axios';
import type {
  AuditReport,
  SearchAuditReportsDto,
  PaginatedAuditReportsResponse,
  AuditStatistics,
} from '../types/audit';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

/**
 * Respuesta del backend para registros digitales de auditoría
 */
interface DigitalRecordResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  tableName?: string;
  recordId?: number;
  description?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Respuesta paginada del backend para registros digitales
 */
interface PaginatedDigitalRecordsResponse {
  records: DigitalRecordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Cliente HTTP para el módulo de auditoría
 * Sincronizado con backend NestJS audit.service.ts
 */
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
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
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

/**
 * DTO para generar reportes de auditoría
 */
interface GenerateAuditReportDto {
  type: string;
  startDate: string;
  endDate: string;
}

/**
 * Respuesta de generación de reporte de auditoría
 */
interface GenerateAuditReportResponse {
  success: boolean;
  message: string;
  report: {
    id: number;
    auditNumber: number;
    type: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    generatedBy: {
      id: number;
      name: string;
      email: string;
    };
  };
  dataCount: number;
}



/**
 * Servicio de auditoría - Métodos principales y helpers
 * Endpoints sincronizados con backend NestJS audit.service.ts:
 * - GET /audits/search (búsqueda paginada de registros individuales)
 * - GET /audits/reports (lista de reportes generados)
 * - GET /audits/reports/:id (obtener reporte específico)
 * - GET /audits/stats (estadísticas)
 * - POST /audits/reports (generar reportes)
 * - DELETE /audits/reports/:id (eliminar reportes)
 */
export const auditService = {
  // ==================== ENDPOINTS UNIFICADOS DEL BACKEND ====================
  
  /**
   * 📊 Obtener lista de reportes de auditoría generados
   * Backend: getAuditReports()
   * Endpoint: GET /audits/reports (sin paginación, solo reportes generados)
   * 
   * IMPORTANTE: Este endpoint devuelve REPORTES GENERADOS, no registros individuales
   * Para registros individuales con paginación, usar searchAuditReports() -> /audits/search
   */
  getAuditReports: async (
    params?: SearchAuditReportsDto
  ): Promise<PaginatedAuditReportsResponse> => {
    const response = await apiClient.get<PaginatedAuditReportsResponse>(
      '/audits/reports',
      { params }
    );
    return response.data;
  },

  /**
   * 📄 Obtener detalles de un reporte de auditoría específico
   * Backend: getAuditReportDetail()
   * Endpoint: GET /audits/reports/:id
   */
  getAuditReportById: async (id: number): Promise<AuditReport> => {
    const response = await apiClient.get<AuditReport>(`/audits/reports/${id}`);
    return response.data;
  },

  /**
   * 📝 Generar un nuevo reporte de auditoría
   * Backend: generateAuditReport()
   * Endpoint: POST /audits/reports
   */
  generateAuditReport: async (generateDto: GenerateAuditReportDto): Promise<GenerateAuditReportResponse> => {
    const response = await apiClient.post<GenerateAuditReportResponse>('/audits/reports', generateDto);
    return response.data;
  },

  /**
   * 🗑️ Eliminar un reporte de auditoría (solo super admin)
   * Backend: deleteAuditReport()
   * Endpoint: DELETE /audits/reports/:id
   */
  deleteAuditReport: async (id: number): Promise<void> => {
    await apiClient.delete(`/audits/reports/${id}`);
  },

  /**
   * � Buscar reportes de auditoría con filtros unificados
   * Backend: searchDigitalRecords() -> GET /audits/search
   * Endpoint: GET /audits/search (con paginación y filtros)
   * 
   * Mapea la respuesta del backend (DigitalRecordResponse) al formato esperado por el frontend (AuditReport)
   */
  searchAuditReports: async (
    params?: SearchAuditReportsDto
  ): Promise<PaginatedAuditReportsResponse> => {
    // Convertir parámetros numéricos a strings para compatibilidad con backend
    // Solo incluir parámetros que no sean undefined, null, o strings vacías
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = String(value);
        }
      });
    }

    console.log('Llamando a /audits/search con parámetros:', queryParams);

    const response = await apiClient.get<PaginatedDigitalRecordsResponse>('/audits/search', { params: queryParams });
    const backendData = response.data;

    console.log('Respuesta cruda del backend:', backendData);

    // Mapear la respuesta del backend al formato esperado por el frontend
    const mappedRecords: AuditReport[] = (backendData.records || []).map((record: DigitalRecordResponse) => ({
      id: record.id,
      ar_audit_number: record.id.toString(), // Usar ID como número de auditoría
      ar_type: 'general_actions', // Tipo por defecto para registros individuales
      ar_entity_name: record.tableName || 'unknown', // Mapear tableName a ar_entity_name
      ar_entity_id: record.recordId,
      ar_action: record.action, // Mapear action a ar_action
      ar_old_value: undefined, // No disponible en digital records
      ar_new_value: undefined, // No disponible en digital records
      ar_observations: record.description, // Mapear description a ar_observations
      ar_start_date: undefined,
      ar_end_date: undefined,
      ar_duration_seconds: undefined,
      ar_ip_address: record.ipAddress,
      ar_user_agent: record.userAgent,
      create_at: record.timestamp, // Mapear timestamp a create_at
      id_generator: record.userId,
      user_name: record.userName, // Mapear userName a user_name
      user_email: record.userEmail, // Mapear userEmail a user_email
    }));

    console.log('Registros mapeados (primeros 3):', mappedRecords.slice(0, 3));

    return {
      records: mappedRecords,
      total: backendData.total || 0,
      page: backendData.page || 1,
      limit: backendData.limit || 25,
      totalPages: backendData.totalPages || 1,
    };
  },

  /**
   * 📊 Obtener estadísticas de auditoría
   * Backend: getAuditStatistics()
   * Endpoint: GET /audits/stats
   */
  getAuditStatistics: async (startDate?: string, endDate?: string): Promise<AuditStatistics> => {
    console.log('Llamando a getAuditStatistics con:', { startDate, endDate });
    const response = await apiClient.get<AuditStatistics>('/audits/stats', {
      params: { startDate, endDate },
    });
    console.log('Respuesta de estadísticas:', response.data);
    return response.data;
  },

  /**
   * Exportar auditorías a CSV (Frontend genera el CSV)
   * Usa searchAuditReports con limit alto y genera CSV localmente
   */
  exportAuditReports: async (params?: SearchAuditReportsDto): Promise<Blob> => {
    const data = await auditService.searchAuditReports({ ...params, limit: '10000' });
    
    // Generar CSV manualmente
    const headers = ['ID', 'Tipo', 'Entidad', 'ID Entidad', 'Acción', 'Usuario', 'Fecha'];
    const rows = data.records.map(record => [
      record.id,
      record.ar_type,
      record.ar_entity_name || 'N/A',
      record.ar_entity_id || 'N/A',
      record.ar_action,
      record.user_name || 'N/A',
      new Date(record.create_at).toLocaleString('es-CR'),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },
};
