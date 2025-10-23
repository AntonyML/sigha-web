import axios from 'axios';
import {
  AuditAction,
  AuditReportType,
} from '../types/audit';
import type {
  DigitalRecord,
  CreateDigitalRecordDto,
  SearchDigitalRecordsDto,
  PaginatedDigitalRecordsResponse,
  AuditStatistics,
  LogAuditRequest,
  LogAuditResponse,
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

// ==================== Helper Functions ====================

/**
 * Obtiene la IP del cliente (simplificado)
 * En producción, el backend lo maneja desde req.ip
 */
const getClientIP = (): string | undefined => {
  return undefined; 
};

/**
 * Obtiene el User Agent del navegador
 */
const getUserAgent = (): string => {
  return navigator.userAgent;
};

/**
 * Servicio de auditoría - Métodos principales y helpers
 * Endpoints sincronizados con backend NestJS:
 * - POST /audits/log (PRINCIPAL - usar este para registrar auditorías)
 * - GET /audits/search (búsqueda legacy)
 * - GET /audits/:id (obtener por ID legacy)
 * - GET /audits/stats (estadísticas)
 * - GET /audits/user/:userId (por usuario)
 * - GET /audits/entity/:entity/:entityId (por entidad)
 */
export const auditService = {
  // ==================== MÉTODO PRINCIPAL ====================
  
  /**
   * 🎯 MÉTODO PRINCIPAL: Registra una acción de auditoría usando stored procedure
   * Backend: logAudit() con stored procedure sp_insert_audit_log
   * Endpoint: POST /audits/log
   * 
   * IMPORTANTE:
   * - NO enviar userId (el backend lo extrae del JWT automáticamente)
   * - ipAddress es opcional (backend lo obtiene de req.ip)
   * - userAgent se envía automáticamente
   * - oldValue y newValue deben ser JSON strings si son objetos
   * - NO debe interrumpir el flujo de la aplicación si falla
   * 
   * @param request - Datos de la auditoría
   * @returns Promise con el resultado del logging
   */
  logAudit: async (
    request: LogAuditRequest
  ): Promise<LogAuditResponse> => {
    try {
      const response = await apiClient.post<LogAuditResponse>(
        '/audits/log',
        {
          ...request,
          ipAddress: request.ipAddress || getClientIP(),
          userAgent: request.userAgent || getUserAgent(),
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error logging audit:', error);
      // No lanzar error para no interrumpir flujo de la app
      return { success: false, message: 'Failed to log audit' };
    }
  },

  // ==================== HELPERS ESPECÍFICOS ====================
  
  /**
   * 🔐 Helper para login exitoso
   */
  logLogin: async (observations?: string): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.LOGIN_ATTEMPTS,
      action: AuditAction.LOGIN,
      observations: observations || 'Ingreso al sistema',
    });
  },

  /**
   * 🚪 Helper para logout
   */
  logLogout: async (observations?: string): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.LOGIN_ATTEMPTS,
      action: AuditAction.LOGOUT,
      observations: observations || 'Cierre de sesión',
    });
  },

  /**
   * 👥 Helper para cambios de rol
   */
  logRoleChange: async (
    userId: number,
    oldRole: string,
    newRole: string,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.ROLE_CHANGES,
      action: AuditAction.UPDATE,
      entityName: 'users',
      entityId: userId,
      oldValue: oldRole,
      newValue: newRole,
      observations: observations || `Cambio de rol de ${oldRole} a ${newRole}`,
    });
  },

  /**
   * 👴 Helper para actualización de adulto mayor
   */
  logOlderAdultUpdate: async (
    adultId: number,
    fieldChanged: string,
    oldValue: unknown,
    newValue: unknown,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.OLDER_ADULT_UPDATES,
      action: AuditAction.UPDATE,
      entityName: 'older_adult',
      entityId: adultId,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      observations: observations || `Actualización de campo: ${fieldChanged}`,
    });
  },

  /**
   * 👁️ Helper para acceso a expedientes
   */
  logSystemAccess: async (
    entityName: string,
    entityId: number,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.SYSTEM_ACCESS,
      action: AuditAction.VIEW,
      entityName,
      entityId,
      observations: observations || `Acceso a ${entityName} #${entityId}`,
    });
  },

  /**
   * 🏥 Helper para cambios en historiales clínicos
   */
  logClinicalRecordChange: async (
    recordId: number,
    action: keyof typeof AuditAction,
    oldValue?: unknown,
    newValue?: unknown,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.CLINICAL_RECORD_CHANGES,
      action: AuditAction[action],
      entityName: 'clinical_history',
      entityId: recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      observations: observations || 'Cambio en historial clínico',
    });
  },

  /**
   * 🔑 Helper para reseteo de contraseña
   */
  logPasswordReset: async (
    userId: number,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.PASSWORD_RESETS,
      action: AuditAction.UPDATE,
      entityName: 'users',
      entityId: userId,
      observations: observations || 'Reseteo de contraseña',
    });
  },

  /**
   * 🔔 Helper para notificaciones
   */
  logNotification: async (
    notificationId: number,
    action: keyof typeof AuditAction,
    newValue?: unknown,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.NOTIFICATIONS,
      action: AuditAction[action],
      entityName: 'notifications',
      entityId: notificationId,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      observations: observations || 'Acción en notificación',
    });
  },

  /**
   * 📤 Helper para exportación de datos
   */
  logExport: async (
    entityName: string,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.GENERAL_ACTIONS,
      action: AuditAction.EXPORT,
      entityName,
      observations: observations || `Exportación de datos de ${entityName}`,
    });
  },

  /**
   * ➕ Helper para crear registros
   */
  logCreate: async (
    entityName: string,
    entityId: number,
    newValue?: unknown,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.GENERAL_ACTIONS,
      action: AuditAction.CREATE,
      entityName,
      entityId,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      observations: observations || `Creación de ${entityName} #${entityId}`,
    });
  },

  /**
   * ❌ Helper para eliminar registros
   */
  logDelete: async (
    entityName: string,
    entityId: number,
    oldValue?: unknown,
    observations?: string
  ): Promise<LogAuditResponse> => {
    return auditService.logAudit({
      type: AuditReportType.GENERAL_ACTIONS,
      action: AuditAction.DELETE,
      entityName,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
      observations: observations || `Eliminación de ${entityName} #${entityId}`,
    });
  },

  // ==================== MÉTODOS LEGACY (mantener para búsqueda) ====================
  /**
   * Buscar registros digitales con filtros (LEGACY)
   * Backend: searchDigitalRecords()
   * Endpoint: GET /audits/search
   * @deprecated Mantener solo para consultas. Para registrar use logAudit()
   */
  searchDigitalRecords: async (
    params?: SearchDigitalRecordsDto
  ): Promise<PaginatedDigitalRecordsResponse> => {
    const response = await apiClient.get<PaginatedDigitalRecordsResponse>(
      '/audits/search',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener un registro digital por ID (LEGACY)
   * Backend: getDigitalRecordById()
   * Endpoint: GET /audits/:id
   */
  getDigitalRecordById: async (id: number): Promise<DigitalRecord> => {
    const response = await apiClient.get<DigitalRecord>(`/audits/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo registro digital (auditoría) - LEGACY
   * @deprecated Usar logAudit() en su lugar
   * Backend: createDigitalRecord()
   * Endpoint: POST /audits
   * Nota: Backend obtiene userId del token JWT automáticamente
   */
  createDigitalRecord: async (
    data: CreateDigitalRecordDto
  ): Promise<DigitalRecord> => {
    console.warn('⚠️ createDigitalRecord está deprecado. Use logAudit() en su lugar.');
    const response = await apiClient.post<DigitalRecord>('/audits', data);
    return response.data;
  },

  /**
   * Obtener estadísticas de auditoría
   * Backend: getAuditStatistics()
   * Endpoint: GET /audits/stats
   */
  getAuditStatistics: async (startDate?: string, endDate?: string): Promise<AuditStatistics> => {
    const response = await apiClient.get<AuditStatistics>('/audits/stats', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Obtener auditorías por usuario
   * Backend: getAuditsByUser()
   * Endpoint: GET /audits/user/:userId
   */
  getAuditsByUser: async (userId: number): Promise<DigitalRecord[]> => {
    const response = await apiClient.get<DigitalRecord[]>(`/audits/user/${userId}`);
    return response.data;
  },

  /**
   * Obtener auditorías por entidad
   * Backend: getAuditsByEntity()
   * Endpoint: GET /audits/entity/:entity/:entityId
   */
  getAuditsByEntity: async (entity: string, entityId: number): Promise<DigitalRecord[]> => {
    const response = await apiClient.get<DigitalRecord[]>(`/audits/entity/${entity}/${entityId}`);
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
