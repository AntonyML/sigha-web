/**
 * AuditFlow - Flujo de gestión de auditoría modularizado
 *
 * SINCRONIZADO CON BACKEND NestJS audit.service.ts
 * Endpoints disponibles:
 * - POST /audit/digital-records
 * - GET /audit/digital-records/search
 * - GET /audit/digital-records/:id
 * - GET /audit/statistics
 *
 * Encapsula toda la lógica de consulta y análisis de registros de auditoría (digital records),
 * incluyendo búsquedas, filtrado, estadísticas y exportación.
 */

// Interfaces
export type {
  AuditFlowResult,
  GetDigitalRecordFlowResult,
  GetDigitalRecordsFlowResult,
  CreateDigitalRecordFlowResult,
  GetAuditStatisticsFlowResult,
} from './interfaces';

// Helpers
export {
  formatAuditDate,
  getActionLabel,
  getTableLabel,
  getActionBadgeClass,
  isCriticalAudit,
  getActionIcon,
} from './helpers';

// Main operations
import {
  searchDigitalRecords,
  getDigitalRecordById,
  createDigitalRecord,
  getAuditStatistics,
  exportDigitalRecords,
} from './main';

// Reports operations
import {
  getAuditReports,
  getAuditReportById,
  generateAuditReport,
  deleteAuditReport,
} from './reports';

// Specialized operations
import {
  getAuditsByUser,
  getAuditsByEntity,
  getAllAudits,
  getDigitalRecordHistory,
  searchOlderAdultUpdates,
} from './specialized';

// Helpers
import {
  formatAuditDate,
  getActionLabel,
  getTableLabel,
  getActionBadgeClass,
  isCriticalAudit,
  getActionIcon,
} from './helpers';

/**
 * AuditFlow principal - Objeto que agrupa todas las operaciones
 */
export const auditFlow = {
  // Main operations
  searchDigitalRecords,
  getDigitalRecordById,
  createDigitalRecord,
  getAuditStatistics,
  exportDigitalRecords,

  // Reports operations
  getAuditReports,
  getAuditReportById,
  generateAuditReport,
  deleteAuditReport,

  // Specialized operations
  getAuditsByUser,
  getAuditsByEntity,
  getAllAudits,
  getDigitalRecordHistory,
  searchOlderAdultUpdates,

  // Helpers
  formatAuditDate,
  getActionLabel,
  getTableLabel,
  getActionBadgeClass,
  isCriticalAudit,
  getActionIcon,
};