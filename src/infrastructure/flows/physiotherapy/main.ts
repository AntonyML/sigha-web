/**
 * Physiotherapy Flow
 *
 * Conectado a physiotherapyService — CRÍTICO-1 resuelto.
 */

import { physiotherapyService } from '../../../services/physiotherapyService';
import type { PhysiotherapySession, CreatePhysiotherapySessionDto, UpdatePhysiotherapySessionDto } from '../../../types/physiotherapy';
import { validatePhysiotherapyData, validatePhysiotherapyId, getPhysiotherapyErrorMessage } from './validation/physiotherapyValidations';

export interface PhysiotherapyFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const physiotherapyFlow = {
    async getAllSessions(appointmentId?: number): Promise<PhysiotherapyFlowResult<PhysiotherapySession[]>> {
        try {
            const data = await physiotherapyService.getSessions(appointmentId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en physiotherapyFlow.getAllSessions:', error);
            return { success: false, error: 'Error al obtener sesiones de fisioterapia' };
        }
    },

    async getSessionById(id: string | number): Promise<PhysiotherapyFlowResult<PhysiotherapySession>> {
        try {
            const idValidation = validatePhysiotherapyId(id);
            if (!idValidation.isValid) return { success: false, error: getPhysiotherapyErrorMessage(idValidation.error!) };
            const data = await physiotherapyService.getSessionById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en physiotherapyFlow.getSessionById:', error);
            return { success: false, error: 'Error al obtener sesión de fisioterapia' };
        }
    },

    async createSession(data: CreatePhysiotherapySessionDto): Promise<PhysiotherapyFlowResult<PhysiotherapySession>> {
        try {
            const validationError = validatePhysiotherapyData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await physiotherapyService.createSession(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en physiotherapyFlow.createSession:', error);
            return { success: false, error: 'Error al crear sesión de fisioterapia' };
        }
    },

    async updateSession(id: string | number, data: UpdatePhysiotherapySessionDto): Promise<PhysiotherapyFlowResult<PhysiotherapySession>> {
        try {
            const idValidation = validatePhysiotherapyId(id);
            if (!idValidation.isValid) return { success: false, error: getPhysiotherapyErrorMessage(idValidation.error!) };
            const validationError = validatePhysiotherapyData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await physiotherapyService.updateSession(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en physiotherapyFlow.updateSession:', error);
            return { success: false, error: 'Error al actualizar sesión de fisioterapia' };
        }
    },

    async deleteSession(id: string | number): Promise<PhysiotherapyFlowResult<void>> {
        try {
            const idValidation = validatePhysiotherapyId(id);
            if (!idValidation.isValid) return { success: false, error: getPhysiotherapyErrorMessage(idValidation.error!) };
            await physiotherapyService.deleteSession(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en physiotherapyFlow.deleteSession:', error);
            return { success: false, error: 'Error al eliminar sesión de fisioterapia' };
        }
    },
};
