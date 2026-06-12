/**
 * Psychology Flow
 *
 * Conectado a psychologyService — CRÍTICO-1 resuelto.
 */

import { psychologyService, type PsychologySessionApi, type CreatePsychologySessionDto, type UpdatePsychologySessionDto } from '../../../services/psychologyService';
import { validatePsychologyData, validatePsychologyId } from './validation/psychologyValidations';

export interface PsychologyFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const psychologyFlow = {
    async getAllSessions(appointmentId?: number): Promise<PsychologyFlowResult<PsychologySessionApi[]>> {
        try {
            const data = await psychologyService.getSessions(appointmentId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en psychologyFlow.getAllSessions:', error);
            return { success: false, error: 'Error al obtener sesiones de psicología' };
        }
    },

    async getSessionById(id: string | number): Promise<PsychologyFlowResult<PsychologySessionApi>> {
        try {
            const idValidation = validatePsychologyId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de sesión de psicología inválido' };
            const data = await psychologyService.getSessionById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en psychologyFlow.getSessionById:', error);
            return { success: false, error: 'Error al obtener sesión de psicología' };
        }
    },

    async createSession(data: CreatePsychologySessionDto): Promise<PsychologyFlowResult<PsychologySessionApi>> {
        try {
            const validationError = validatePsychologyData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await psychologyService.createSession(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en psychologyFlow.createSession:', error);
            return { success: false, error: 'Error al crear sesión de psicología' };
        }
    },

    async updateSession(id: string | number, data: UpdatePsychologySessionDto): Promise<PsychologyFlowResult<PsychologySessionApi>> {
        try {
            const idValidation = validatePsychologyId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de sesión de psicología inválido' };
            const validationError = validatePsychologyData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await psychologyService.updateSession(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en psychologyFlow.updateSession:', error);
            return { success: false, error: 'Error al actualizar sesión de psicología' };
        }
    },

    async deleteSession(id: string | number): Promise<PsychologyFlowResult<void>> {
        try {
            const idValidation = validatePsychologyId(id);
            if (!idValidation.isValid) return { success: false, error: 'ID de sesión de psicología inválido' };
            await psychologyService.deleteSession(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en psychologyFlow.deleteSession:', error);
            return { success: false, error: 'Error al eliminar sesión de psicología' };
        }
    },
};
