import axios from 'axios';
import type {
  Audit,
  CreateAuditData,
  AuditSearchParams,
  AuditListResponse,
  AuditStats,
} from '../types/audit';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Cliente HTTP para el módulo de auditoría
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
 * Maneja todas las operaciones CRUD y consultas del módulo de auditoría
 */
export const auditService = {
  /**
   * Obtener todos los registros de auditoría con paginación
   */
  getAllAudits: async (params?: AuditSearchParams): Promise<AuditListResponse> => {
    const response = await apiClient.get<AuditListResponse>('/audits', { params });
    return response.data;
  },

  /**
   * Obtener un registro de auditoría por ID
   */
  getAuditById: async (id: number): Promise<Audit> => {
    const response = await apiClient.get<Audit>(`/audits/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo registro de auditoría
   * Nota: Normalmente esto lo hace el backend automáticamente,
   * pero puede ser útil para logging del frontend
   */
  createAudit: async (data: CreateAuditData): Promise<Audit> => {
    const response = await apiClient.post<Audit>('/audits', data);
    return response.data;
  },

  /**
   * Buscar auditorías con filtros avanzados
   */
  searchAudits: async (params: AuditSearchParams): Promise<AuditListResponse> => {
    const response = await apiClient.get<AuditListResponse>('/audits/search', { params });
    return response.data;
  },

  /**
   * Obtener auditorías de un usuario específico
   */
  getAuditsByUser: async (userId: number, params?: AuditSearchParams): Promise<AuditListResponse> => {
    const response = await apiClient.get<AuditListResponse>(`/audits/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Obtener auditorías de una entidad específica
   */
  getAuditsByEntity: async (
    entity: string,
    entityId: number,
    params?: AuditSearchParams
  ): Promise<AuditListResponse> => {
    const response = await apiClient.get<AuditListResponse>(
      `/audits/entity/${entity}/${entityId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de auditoría
   */
  getAuditStats: async (startDate?: string, endDate?: string): Promise<AuditStats> => {
    const response = await apiClient.get<AuditStats>('/audits/stats', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Exportar auditorías a CSV/Excel
   */
  exportAudits: async (params?: AuditSearchParams): Promise<Blob> => {
    const response = await apiClient.get('/audits/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Eliminar registros de auditoría antiguos (solo administrador)
   * Nota: Solo si el backend lo permite
   */
  deleteOldAudits: async (beforeDate: string): Promise<{ deleted: number }> => {
    const response = await apiClient.delete<{ deleted: number }>('/audits/cleanup', {
      params: { beforeDate },
    });
    return response.data;
  },
};
