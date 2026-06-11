import { auditService } from '../../../services/auditService';
import type {
  SearchAuditReportsDto,
  PaginatedAuditReportsResponse,
  AuditStatistics,
} from '../../../types/audit';
import {
  getAuditErrorMessage
} from './validation/auditValidations';
import {
  validateSearchParams,
  validateAuditReportId
} from './validation/mainValidations';
import type {
  AuditFlowResult,
  GetAuditReportFlowResult,
  GetAuditReportsFlowResult,
  GetAuditStatisticsFlowResult,
} from './interfaces';
import { AxiosError } from 'axios';

/**
 * Flujo para buscar reportes de auditoría con filtros
 * Backend: getAuditReports()
 *
 * Maneja:
 * - Búsqueda con filtros (entityName, action, fechas)
 * - Paginación
 * - Validación de fechas
 * - Manejo de errores
 *
 * @param params - Parámetros de búsqueda
 * @returns GetAuditReportsFlowResult con reportes encontrados
 */
export async function searchAuditReports(params?: SearchAuditReportsDto): Promise<GetAuditReportsFlowResult> {
  try {
    // Validar parámetros de búsqueda si se proporcionan
    if (params) {
      const validationError = validateSearchParams(params);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }
    }

    const response: PaginatedAuditReportsResponse = await auditService.searchAuditReports(params);

    // Backend SIEMPRE retorna: { records, total, page, limit, totalPages }
    const records = response.records || [];
    const total = response.total || 0;
    const page = response.page || 1;
    const totalPages = response.totalPages || 1;

    if (records.length === 0) {
      return {
        success: true,
        records: [],
        total: 0,
        page,
        totalPages,
        message: 'No se encontraron registros que coincidan con los criterios de búsqueda',
      };
    }

    return {
      success: true,
      records,
      total,
      page,
      totalPages,
      message: `${records.length} registros encontrados`,
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.searchAuditReports:', error);
    return {
      success: false,
      error: getAuditErrorMessage(error),
    };
  }
}

/**
 * Flujo para obtener un reporte de auditoría por ID
 * Backend: getAuditReportById()
 *
 * Maneja:
 * - Validación del ID
 * - Obtención del reporte
 * - Manejo de errores 404
 *
 * @param id - ID del reporte de auditoría
 * @returns GetAuditReportFlowResult con el reporte encontrado
 */
export async function getAuditReportById(id: number): Promise<GetAuditReportFlowResult> {
  try {
    const validationError = validateAuditReportId(id);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const report = await auditService.getAuditReportById(id);

    return {
      success: true,
      report,
      message: 'Reporte de auditoría obtenido exitosamente',
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.getAuditReportById:', error);

    const axiosError = error as AxiosError;
    if (axiosError?.response?.status === 404) {
      return {
        success: false,
        error: 'Reporte de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: getAuditErrorMessage(error),
    };
  }
}


/**
 * Flujo para obtener estadísticas de auditoría
 * Backend: getAuditStatistics()
 *
 * Maneja:
 * - Obtención de estadísticas con filtro de fechas opcional
 * - Validación de fechas
 * - Formateo de estadísticas
 * - Manejo de errores
 *
 * @param startDate - Fecha de inicio (opcional)
 * @param endDate - Fecha de fin (opcional)
 * @returns GetAuditStatisticsFlowResult con estadísticas
 */
export async function getAuditStatistics(
  startDate?: string,
  endDate?: string
): Promise<GetAuditStatisticsFlowResult> {
  try {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return {
          success: false,
          error: 'La fecha de inicio no puede ser mayor que la fecha de fin',
        };
      }
    }

    const stats = await auditService.getAuditStatistics(startDate, endDate);

    // Backend retorna: { totalActions, actionsByType, actionsByEntity, topUsers, recentActivity }
    // Validación defensiva
    const safeStats: AuditStatistics = {
      totalActions: stats?.totalActions || 0,
      actionsByType: stats?.actionsByType || {},
      actionsByEntity: stats?.actionsByEntity || {},
      topUsers: Array.isArray(stats?.topUsers) ? stats.topUsers : [],
      recentActivity: Array.isArray(stats?.recentActivity) ? stats.recentActivity : [],
    };

    return {
      success: true,
      stats: safeStats,
      message: 'Estadísticas de auditoría obtenidas exitosamente',
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.getAuditStatistics:', error);
    return {
      success: false,
      error: getAuditErrorMessage(error),
    };
  }
}

/**
 * Flujo para exportar reportes de auditoría a CSV
 *
 * Maneja:
 * - Exportación con filtros
 * - Generación de CSV en frontend
 * - Descarga del archivo
 * - Manejo de errores
 *
 * @param params - Parámetros de filtrado
 * @param filename - Nombre del archivo a descargar
 * @returns AuditFlowResult indicando éxito o error
 */
export async function exportAuditReports(
  params?: SearchAuditReportsDto,
  filename: string = 'auditorias.csv'
): Promise<AuditFlowResult> {
  try {
    const blob = await auditService.exportAuditReports(params);

    // Crear link de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Reportes de auditoría exportados exitosamente',
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.exportAuditReports:', error);
    return {
      success: false,
      error: getAuditErrorMessage(error),
    };
  }
}