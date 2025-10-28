// ==================== Audit Types ====================
// Sincronizado con backend NestJS: audit.service.ts
// Endpoints: POST /audits/log, GET /audits/search, GET /audits/stats

/**
 * Enums de auditoría - Sincronizados con backend NestJS
 * Usando const objects para compatibilidad con erasableSyntaxOnly
 */

/**
 * Tipos de reporte de auditoría
 * Sincronizado con backend enum AuditReportType
 */
export const AuditReportType = {
  GENERAL_ACTIONS: 'general_actions',
  ROLE_CHANGES: 'role_changes',
  OLDER_ADULT_UPDATES: 'older_adult_updates',
  SYSTEM_ACCESS: 'system_access',
  LOGIN_ATTEMPTS: 'login_attempts',
  PASSWORD_RESETS: 'password_resets',
  CLINICAL_RECORD_CHANGES: 'clinical_record_changes',
  NOTIFICATIONS: 'notifications',
  OTHER: 'other'
} as const;

export type AuditReportType = typeof AuditReportType[keyof typeof AuditReportType];

/**
 * Acciones de auditoría
 * Sincronizado con backend enum AuditAction
 */
export const AuditAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  OTHER: 'other'
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

/**
 * Tipo de acción (type alias para compatibilidad)
 * @deprecated Usar AuditAction enum en su lugar
 */
export type AuditActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'other';

/**
 * Request para registrar auditoría usando stored procedure
 * Sincronizado con LogAuditDto del backend
 * Endpoint: POST /audits/log
 */
export interface LogAuditRequest {
  type: AuditReportType;           // Requerido - tipo de reporte
  action: AuditAction;             // Requerido - acción realizada
  entityName?: string;             // Opcional - nombre de tabla (ej: 'users', 'older_adult')
  entityId?: number;               // Opcional - ID del registro afectado
  oldValue?: string;               // Opcional - valor anterior (JSON string)
  newValue?: string;               // Opcional - valor nuevo (JSON string)
  ipAddress?: string;              // Opcional - IP del cliente (backend lo obtiene si no se envía)
  userAgent?: string;              // Opcional - navegador/app
  observations?: string;           // Opcional - descripción/notas
}

/**
 * Response de logging de auditoría
 * Sincronizado con backend response
 */
export interface LogAuditResponse {
  success: boolean;
  message: string;
}

/**
 * Reporte de auditoría - Sincronizado con tabla audit_report del backend
 * Estructura ACTUALIZADA que mapea directamente con la tabla audit_report
 */
export interface AuditReport {
  id: number;
  ar_audit_number?: string;
  ar_type: string;                    // login_attempts, role_changes, older_adult_updates, etc.
  ar_entity_name: string;             // users, older_adults, medications, etc.
  ar_entity_id?: number;
  ar_action: string;                  // login, logout, create, update, delete, view, export
  ar_old_value?: string;              // JSON string del valor anterior
  ar_new_value?: string;              // JSON string del valor nuevo
  ar_observations?: string;           // Descripción del cambio
  ar_start_date?: string;
  ar_end_date?: string;
  ar_duration_seconds?: number;
  ar_ip_address?: string;
  ar_user_agent?: string;
  create_at: string;
  id_generator?: number;
  // Campos adicionales del usuario (si el backend los incluye con JOIN)
  user_name?: string;
  user_email?: string;
}

/**
 * Parámetros de búsqueda de reportes de auditoría
 * Sincronizado con backend para tabla audit_report
 */
export interface SearchAuditReportsDto {
  type?: string;           // ar_type: login_attempts, role_changes, etc.
  entityName?: string;     // ar_entity_name: users, older_adults, etc.
  entityId?: string;       // ar_entity_id (enviado como string al backend)
  action?: string;         // ar_action: login, logout, create, update, delete
  startDate?: string;
  endDate?: string;
  page?: string;           // Número de página (enviado como string al backend)
  limit?: string;          // Límite de registros por página (enviado como string al backend)
}

/**
 * Respuesta paginada de reportes de auditoría
 * Sincronizado con backend para tabla audit_report
 */
export interface PaginatedAuditReportsResponse {
  records: AuditReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Estadísticas de auditoría
 * Sincronizado con getAuditStatistics del backend
 */
export interface AuditStatistics {
  totalActions: number;
  actionsByType: Record<string, number>;      // { login: 45, create: 23, delete: 12, ... }
  actionsByEntity: Record<string, number>;    // { older_adult: 34, users: 21, programs: 10, ... }
  topUsers: Array<{
    userId: number;
    username: string;
    actionCount: number;
  }>;
  recentActivity: AuditReport[];
}
