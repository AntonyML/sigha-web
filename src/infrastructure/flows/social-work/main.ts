/**
 * Social Work Flow
 *
 * Conectado a socialWorkService — CRÍTICO-1 resuelto.
 */

import { socialWorkService, type SocialWorkReportApi, type CreateSocialWorkReportDto, type UpdateSocialWorkReportDto } from '../../../services/socialWorkService';
import { validateSocialWorkData, validateSocialWorkId } from './validation/socialWorkValidations';

export interface SocialWorkFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const socialWorkFlow = {
    async getAllReports(patientId?: number): Promise<SocialWorkFlowResult<SocialWorkReportApi[]>> {
        try {
            const data = await socialWorkService.getReports(patientId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en socialWorkFlow.getAllReports:', error);
            return { success: false, error: 'Error al obtener reportes de trabajo social' };
        }
    },

    async getReportById(id: string | number): Promise<SocialWorkFlowResult<SocialWorkReportApi>> {
        try {
            const idValidation = validateSocialWorkId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de reporte de trabajo social inválido' };
            const data = await socialWorkService.getReportById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en socialWorkFlow.getReportById:', error);
            return { success: false, error: 'Error al obtener reporte de trabajo social' };
        }
    },

    async createReport(data: CreateSocialWorkReportDto): Promise<SocialWorkFlowResult<SocialWorkReportApi>> {
        try {
            const validationError = validateSocialWorkData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await socialWorkService.createReport(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en socialWorkFlow.createReport:', error);
            return { success: false, error: 'Error al crear reporte de trabajo social' };
        }
    },

    async updateReport(id: string | number, data: UpdateSocialWorkReportDto): Promise<SocialWorkFlowResult<SocialWorkReportApi>> {
        try {
            const idValidation = validateSocialWorkId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de reporte de trabajo social inválido' };
            const validationError = validateSocialWorkData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await socialWorkService.updateReport(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en socialWorkFlow.updateReport:', error);
            return { success: false, error: 'Error al actualizar reporte de trabajo social' };
        }
    },

    async deleteReport(id: string | number): Promise<SocialWorkFlowResult<void>> {
        try {
            const idValidation = validateSocialWorkId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de reporte de trabajo social inválido' };
            await socialWorkService.deleteReport(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en socialWorkFlow.deleteReport:', error);
            return { success: false, error: 'Error al eliminar reporte de trabajo social' };
        }
    },
};
