import axios from 'axios';
import type {
  AuditReport,
  SearchAuditReportsDto,
  PaginatedAuditReportsResponse,
  AuditStatistics,
} from '../types/audit';
import { config } from '../config/app.config';

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Helper Functions ====================



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
  generateAuditReport: async (generateDto: any): Promise<any> => {
    const response = await apiClient.post('/audits/reports', generateDto);
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
   * Backend: getAuditReports() -> Cambiado a /audits/search para paginación
   * Endpoint: GET /audits/search (con paginación y filtros)
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

    const response = await apiClient.get<PaginatedAuditReportsResponse>(
      '/audits/search', // Cambiado de /audits/reports a /audits/search
      { params: queryParams }
    );
    return response.data;
  },

  /**
   *  Obtener estadísticas de auditoría
   * Backend: getAuditStats()
   * Endpoint: GET /audits/stats
   */
  getAuditStatistics: async (startDate?: string, endDate?: string): Promise<AuditStatistics> => {
    const response = await apiClient.get<AuditStatistics>('/audits/stats', {
      params: { startDate, endDate },
    });
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
