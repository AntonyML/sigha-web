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
 * Registro de auditoría digital (Digital Record) - LEGACY
 * Mapea a tabla digital_record en DB
 * @deprecated Usar LogAuditRequest para nuevos registros
 */
export interface DigitalRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: AuditActionType;
  tableName: string | null;       // Tabla afectada (ej: 'older_adult', 'users', 'programs')
  recordId: number | null;         // ID del registro afectado
  description: string | null;
  timestamp: string;               // drTimestamp del backend
}

/**
 * DTO para crear un registro de auditoría digital - LEGACY
 * @deprecated Usar LogAuditRequest en su lugar
 * Sincronizado con CreateDigitalRecordDto del backend
 */
export interface CreateDigitalRecordDto {
  action: AuditActionType;
  tableName?: string;
  recordId?: number;
  description?: string;
}

/**
 * Parámetros de búsqueda de registros digitales
 * Sincronizado con SearchDigitalRecordsDto del backend
 */
export interface SearchDigitalRecordsDto {
  userId?: number;
  action?: AuditActionType;
  tableName?: string;
  recordId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada de registros digitales
 * Sincronizado con PaginatedDigitalRecordsResponse del backend
 */
export interface PaginatedDigitalRecordsResponse {
  records: DigitalRecord[];
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
  recentActivity: DigitalRecord[];
}

// ==================== Legacy Types (mantener compatibilidad) ====================

/**
 * @deprecated Usar DigitalRecord en su lugar
 * Mantener para compatibilidad con componentes existentes
 */
export interface Audit extends DigitalRecord {
  aAction: AuditActionType;
  aEntity: string;
  aEntityId: number | null;
  aDescription: string | null;
  aUserId: number;
  aUsername: string;
  createAt: string;
}

/**
 * @deprecated Usar PaginatedDigitalRecordsResponse
 */
export interface AuditListResponse {
  data: DigitalRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * @deprecated Usar AuditStatistics
 */
export interface AuditStats extends AuditStatistics {}
