import { auditService } from '../../../services/auditService';
import { AuditReportType, type AuditReport, type SearchAuditReportsDto } from '../../../types/audit';
import type { AuditFlowResult, GetAuditReportFlowResult } from './interfaces';
import { validateAuditReportId } from './validation/reportsValidations';
import type { AxiosError } from 'axios';

/**
 * Flujo para obtener reportes de auditoría generados
 * Backend: getAuditReports()
 * Endpoint: GET /audits/reports
 *
 * @param params - Filtros de reportes (opcional)
 * @returns Resultado con reportes generados
 */
export async function getAuditReports(params?: SearchAuditReportsDto): Promise<AuditFlowResult & { reports?: AuditReport[] }> {
  try {
    const reports = await auditService.getAuditReports(params);

    return {
      success: true,
      reports,
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.getAuditReports:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al obtener reportes de auditoría',
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
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.getAuditReportById:', error);

    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        error: 'Reporte de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al obtener el reporte de auditoría',
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
export async function generateAuditReport(generateDto: { type: AuditReportType; startDate: string; endDate: string; description?: string }): Promise<AuditFlowResult & { report?: any }> {
  try {
    const report = await auditService.generateAuditReport(generateDto);

    return {
      success: true,
      report,
      message: 'Reporte de auditoría generado exitosamente',
    };
  } catch (error: unknown) {
    console.error('Error en auditFlow.generateAuditReport:', error);
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al generar reporte de auditoría',
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
  } catch (error: unknown) {
    console.error('Error en auditFlow.deleteAuditReport:', error);

    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.status === 404) {
      return {
        success: false,
        error: 'Reporte de auditoría no encontrado',
      };
    }

    return {
      success: false,
      error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al eliminar el reporte de auditoría',
    };
  }
}