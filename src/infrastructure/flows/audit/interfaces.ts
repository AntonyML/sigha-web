import type {
  AuditReport,
  AuditStatistics,
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
 * Resultado de obtener un reporte de auditoría
 */
export interface GetAuditReportFlowResult extends AuditFlowResult {
  report?: AuditReport;
}

/**
 * Resultado de obtener lista de reportes de auditoría
 */
export interface GetAuditReportsFlowResult extends AuditFlowResult {
  records?: AuditReport[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Resultado de obtener estadísticas
 */
export interface GetAuditStatisticsFlowResult extends AuditFlowResult {
  stats?: AuditStatistics;
}