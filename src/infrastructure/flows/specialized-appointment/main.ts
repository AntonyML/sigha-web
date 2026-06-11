/**
 * Specialized Appointment Flow
 *
 * Conectado a specializedAppointmentsService — CRÍTICO-1 resuelto.
 */

import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService';
import type { SpecializedAppointmentApi, CreateSpecializedAppointmentDto, UpdateSpecializedAppointmentDto } from '../../../types/specializedAppointment';
import { validateSpecializedAppointmentData, validateSpecializedAppointmentId, getSpecializedAppointmentErrorMessage } from './validation/appointmentValidations';

export interface SpecializedAppointmentFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const specializedAppointmentFlow = {
    async getAllAppointments(patientId?: number, areaId?: number): Promise<SpecializedAppointmentFlowResult<SpecializedAppointmentApi[]>> {
        try {
            const data = await specializedAppointmentsService.getAll(patientId, areaId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.getAllAppointments:', error);
            return { success: false, error: 'Error al obtener citas especializadas' };
        }
    },

    async getAppointmentsByPatient(patientId: number): Promise<SpecializedAppointmentFlowResult<SpecializedAppointmentApi[]>> {
        try {
            const idValidation = validateSpecializedAppointmentId(patientId);
            if (!idValidation.isValid) return { success: false, error: getSpecializedAppointmentErrorMessage(idValidation.error!) };
            const data = await specializedAppointmentsService.getByPatient(patientId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.getAppointmentsByPatient:', error);
            return { success: false, error: 'Error al obtener citas del paciente' };
        }
    },

    async getAppointmentById(id: string | number): Promise<SpecializedAppointmentFlowResult<SpecializedAppointmentApi>> {
        try {
            const idValidation = validateSpecializedAppointmentId(id);
            if (!idValidation.isValid) return { success: false, error: getSpecializedAppointmentErrorMessage(idValidation.error!) };
            const data = await specializedAppointmentsService.getById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.getAppointmentById:', error);
            return { success: false, error: 'Error al obtener cita especializada' };
        }
    },

    async createAppointment(data: CreateSpecializedAppointmentDto): Promise<SpecializedAppointmentFlowResult<SpecializedAppointmentApi>> {
        try {
            const validationError = validateSpecializedAppointmentData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await specializedAppointmentsService.create(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.createAppointment:', error);
            return { success: false, error: 'Error al crear cita especializada' };
        }
    },

    async updateAppointment(id: string | number, data: UpdateSpecializedAppointmentDto): Promise<SpecializedAppointmentFlowResult<SpecializedAppointmentApi>> {
        try {
            const idValidation = validateSpecializedAppointmentId(id);
            if (!idValidation.isValid) return { success: false, error: getSpecializedAppointmentErrorMessage(idValidation.error!) };
            const validationError = validateSpecializedAppointmentData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await specializedAppointmentsService.update(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.updateAppointment:', error);
            return { success: false, error: 'Error al actualizar cita especializada' };
        }
    },

    async deleteAppointment(id: string | number): Promise<SpecializedAppointmentFlowResult<void>> {
        try {
            const idValidation = validateSpecializedAppointmentId(id);
            if (!idValidation.isValid) return { success: false, error: getSpecializedAppointmentErrorMessage(idValidation.error!) };
            await specializedAppointmentsService.remove(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en specializedAppointmentFlow.deleteAppointment:', error);
            return { success: false, error: 'Error al eliminar cita especializada' };
        }
    },
};
