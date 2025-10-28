/**
 * AuditFlow - Flujo de gestión de auditoría modularizado
 *
 * SINCRONIZADO CON BACKEND NestJS audit.service.ts
 * Endpoints disponibles:
 * - GET /audits/reports
 * - GET /audits/stats
 * - POST /audits/reports
 * - DELETE /audits/reports/:id
 *
 * Encapsula toda la lógica de consulta y análisis de registros de auditoría,
 * incluyendo búsquedas, filtrado, estadísticas y exportación.
 */

// Interfaces
export type {
  AuditFlowResult,
  GetAuditReportFlowResult,
  GetAuditReportsFlowResult,
  GetAuditStatisticsFlowResult,
} from './interfaces';

// Main operations
import {
  searchAuditReports,
  getAuditReportById,
  getAuditStatistics,
  exportAuditReports,
} from './main';

export {
  searchAuditReports,
  getAuditReportById,
  getAuditStatistics,
  exportAuditReports,
};

// Helpers
import {
  formatAuditDate,
  getActionLabel,
  getTableLabel,
  getActionBadgeClass,
  getActionIcon,
  getAuditReportDescription,
} from './helpers';

/**
 * AuditFlow principal - Objeto que agrupa todas las operaciones
 */
export const auditFlow = {
  // Main operations
  searchAuditReports,
  getAuditReportById,
  getAuditStatistics,
  exportAuditReports,

  // Helpers
  formatAuditDate,
  getActionLabel,
  getTableLabel,
  getActionBadgeClass,
  getActionIcon,
  getAuditReportDescription,
};