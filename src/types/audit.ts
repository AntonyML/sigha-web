// ==================== Audit Types ====================
// Sincronizado con backend NestJS: audit.service.ts
// Endpoints: /audit/digital-records, /audit/statistics

/**
 * Tipo de acción realizada en el sistema
 * Sincronizado con backend enum AuditAction
 */
export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'other';

/**
 * Registro de auditoría digital (Digital Record)
 * Mapea a tabla digital_record en DB
 * Campos con prefijo 'dr' del backend
 */
export interface DigitalRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: AuditAction;
  tableName: string | null;       // Tabla afectada (ej: 'older_adult', 'users', 'programs')
  recordId: number | null;         // ID del registro afectado
  description: string | null;
  timestamp: string;               // drTimestamp del backend
}

/**
 * DTO para crear un registro de auditoría digital
 * Sincronizado con CreateDigitalRecordDto del backend
 */
export interface CreateDigitalRecordDto {
  action: AuditAction;
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
  action?: AuditAction;
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
  aAction: AuditAction;
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
