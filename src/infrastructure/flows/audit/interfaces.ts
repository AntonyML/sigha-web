import type {
  DigitalRecord,
  CreateDigitalRecordDto,
  SearchDigitalRecordsDto,
  PaginatedDigitalRecordsResponse,
  AuditStatistics,
  AuditAction,
} from '../../../types/audit';

/**
 * Resultado genérico de operaciones de auditoría
 */
export interface AuditFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Resultado de obtener un registro digital
 */
export interface GetDigitalRecordFlowResult extends AuditFlowResult {
  record?: DigitalRecord;
}

/**
 * Resultado de obtener lista de registros digitales
 */
export interface GetDigitalRecordsFlowResult extends AuditFlowResult {
  records?: DigitalRecord[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Resultado de crear un registro digital
 */
export interface CreateDigitalRecordFlowResult extends AuditFlowResult {
  record?: DigitalRecord;
}

/**
 * Resultado de obtener estadísticas
 */
export interface GetAuditStatisticsFlowResult extends AuditFlowResult {
  stats?: AuditStatistics;
}