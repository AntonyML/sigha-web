import { auditService } from '../../../services/auditService';
import type { AuditFlowResult } from './interfaces';
import { validateAuditReportId } from './validation/reportsValidations';

/**
 * Flujo para obtener reportes de auditoría generados
 * Backend: getAuditReports()
 * Endpoint: GET /audits/reports
 *
 * @param params - Filtros de reportes (opcional)
 * @returns Resultado con reportes generados
 */
export async function getAuditReports(params?: any): Promise<any> {
  try {
    const response = await auditService.getAuditReports(params);

    return {
      success: true,
      reports: response.records || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getAuditReports:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener reportes de auditoría',
    };
  }
}

/**
 * Flujo para obtener detalle de un reporte específico
 * Backend: getAuditReportDetail()
 * Endpoint: GET /audits/reports/:id
 *
 * @param id - ID del reporte
 * @returns Resultado con detalle del reporte
 */
export async function getAuditReportById(id: number): Promise<any> {
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
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getAuditReportById:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: 'Reporte de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener el reporte de auditoría',
    };
  }
}

/**
 * Flujo para generar un nuevo reporte de auditoría
 * Backend: generateAuditReport()
 * Endpoint: POST /audits/reports
 *
 * @param generateDto - Datos para generar el reporte
 * @returns Resultado con reporte generado
 */
export async function generateAuditReport(generateDto: any): Promise<any> {
  try {
    const report = await auditService.generateAuditReport(generateDto);

    return {
      success: true,
      report,
      message: 'Reporte de auditoría generado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en auditFlow.generateAuditReport:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al generar reporte de auditoría',
    };
  }
}

/**
 * Flujo para eliminar un reporte de auditoría
 * Backend: deleteAuditReport()
 * Endpoint: DELETE /audits/reports/:id
 *
 * @param id - ID del reporte
 * @returns Resultado de la operación
 */
export async function deleteAuditReport(id: number): Promise<AuditFlowResult> {
  try {
    if (!id || id <= 0) {
      return {
        success: false,
        error: 'ID de reporte inválido',
      };
    }

    await auditService.deleteAuditReport(id);

    return {
      success: true,
      message: 'Reporte de auditoría eliminado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en auditFlow.deleteAuditReport:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        error: 'Reporte de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Error al eliminar el reporte de auditoría',
    };
  }
}