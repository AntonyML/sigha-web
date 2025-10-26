import { auditService } from '../../../services/auditService';
import type {
  CreateDigitalRecordDto,
  SearchDigitalRecordsDto,
  PaginatedDigitalRecordsResponse,
  AuditStatistics,
} from '../../../types/audit';
import {
  validateSearchAuditReportsDto,
  getAuditErrorMessage
} from './validation/auditValidations';
import type {
  AuditFlowResult,
  GetDigitalRecordFlowResult,
  GetDigitalRecordsFlowResult,
  CreateDigitalRecordFlowResult,
  GetAuditStatisticsFlowResult,
} from './interfaces';

/**
 * Flujo para buscar registros digitales con filtros
 * Backend: searchDigitalRecords()
 *
 * Maneja:
 * - Búsqueda con filtros (userId, action, tableName, recordId, fechas)
 * - Paginación
 * - Validación de fechas
 * - Manejo de errores
 *
 * @param params - Parámetros de búsqueda
 * @returns GetDigitalRecordsFlowResult con registros encontrados
 */
export async function searchDigitalRecords(params?: SearchDigitalRecordsDto): Promise<GetDigitalRecordsFlowResult> {
  try {
    // Validar parámetros de búsqueda si se proporcionan
    if (params) {
      const validationError = validateSearchAuditReportsDto(params as any);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }
    }

    // Validar fechas si se proporcionan
    if (params?.startDate && params?.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);

      if (start > end) {
        return {
          success: false,
          error: 'La fecha de inicio no puede ser mayor que la fecha de fin',
        };
      }
    }

    const response: PaginatedDigitalRecordsResponse = await auditService.searchDigitalRecords(params);

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
  } catch (error: any) {
    console.error('Error en auditFlow.searchDigitalRecords:', error);
    return {
      success: false,
      error: getAuditErrorMessage(error),
    };
  }
}

/**
 * Flujo para obtener un registro digital por ID
 * Backend: getDigitalRecordById()
 *
 * Maneja:
 * - Validación del ID
 * - Obtención del registro
 * - Manejo de errores 404
 *
 * @param id - ID del registro digital
 * @returns GetDigitalRecordFlowResult con el registro encontrado
 */
export async function getDigitalRecordById(id: number): Promise<GetDigitalRecordFlowResult> {
  try {
    if (!id || id <= 0) {
      return {
        success: false,
        error: 'ID de auditoría inválido',
      };
    }

    const record = await auditService.getDigitalRecordById(id);

    return {
      success: true,
      record,
      message: 'Registro de auditoría obtenido exitosamente',
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getDigitalRecordById:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: 'Registro de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener el registro de auditoría',
    };
  }
}

/**
 * Flujo para crear un registro digital manual
 * Backend: createDigitalRecord()
 *
 * Maneja:
 * - Validación de datos requeridos
 * - Creación del registro (backend obtiene userId del token JWT)
 * - Manejo de errores
 *
 * @param data - Datos del registro digital
 * @returns CreateDigitalRecordFlowResult con el registro creado
 */
export async function createDigitalRecord(data: CreateDigitalRecordDto): Promise<CreateDigitalRecordFlowResult> {
  try {
    // Validar datos requeridos
    if (!data.action) {
      return {
        success: false,
        error: 'La acción es requerida',
      };
    }

    // Backend obtiene userId automáticamente del token JWT
    const record = await auditService.createDigitalRecord(data);

    return {
      success: true,
      record,
      message: 'Registro de auditoría creado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en auditFlow.createDigitalRecord:', error);
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
  } catch (error: any) {
    console.error('Error en auditFlow.getAuditStatistics:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener estadísticas de auditoría',
    };
  }
}

/**
 * Flujo para exportar registros digitales a CSV
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
export async function exportDigitalRecords(
  params?: SearchDigitalRecordsDto,
  filename: string = 'auditorias.csv'
): Promise<AuditFlowResult> {
  try {
    const blob = await auditService.exportDigitalRecords(params);

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
      message: 'Auditorías exportadas exitosamente',
    };
  } catch (error: any) {
    console.error('Error en auditFlow.exportDigitalRecords:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al exportar auditorías',
    };
  }
}