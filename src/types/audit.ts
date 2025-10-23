// ==================== Audit Types ====================

/**
 * Tipo de acción realizada en el sistema
 */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'EXPORT'
  | 'IMPORT'
  | 'VIEW'
  | 'OTHER';

/**
 * Entidades del sistema que pueden ser auditadas
 */
export type AuditEntity =
  | 'USER'
  | 'ROLE'
  | 'VIRTUAL_FILE'
  | 'ENTRANCE_EXIT'
  | 'PROGRAM'
  | 'CLINICAL_HISTORY'
  | 'FAMILY'
  | 'MEDICATION'
  | 'AUTH'
  | 'SYSTEM'
  | 'OTHER';

/**
 * Registro de auditoría
 * Campos sincronizados con backend NestJS (prefijo 'a' para audit)
 */
export interface Audit {
  id: number;
  aAction: AuditAction;
  aEntity: AuditEntity;
  aEntityId?: number | null;
  aDescription: string;
  aIpAddress?: string | null;
  aUserAgent?: string | null;
  aOldValues?: Record<string, any> | null;
  aNewValues?: Record<string, any> | null;
  aUserId?: number | null;
  aUsername?: string | null;
  createAt: string;
  updateAt?: string;
}

/**
 * DTO para crear un registro de auditoría
 */
export interface CreateAuditData {
  aAction: AuditAction;
  aEntity: AuditEntity;
  aEntityId?: number;
  aDescription: string;
  aIpAddress?: string;
  aUserAgent?: string;
  aOldValues?: Record<string, any>;
  aNewValues?: Record<string, any>;
}

/**
 * Parámetros de búsqueda/filtrado de auditorías
 */
export interface AuditSearchParams {
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: number;
  userId?: number;
  username?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createAt' | 'aAction' | 'aEntity';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada de auditorías
 */
export interface AuditListResponse {
  data: Audit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Estadísticas de auditoría
 */
export interface AuditStats {
  totalActions: number;
  actionsByType: Record<AuditAction, number>;
  actionsByEntity: Record<AuditEntity, number>;
  topUsers: Array<{
    userId: number;
    username: string;
    actionCount: number;
  }>;
  recentActivity: Audit[];
}

/**
 * Resumen de cambios para mostrar en UI
 */
export interface AuditChangeSummary {
  field: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}
