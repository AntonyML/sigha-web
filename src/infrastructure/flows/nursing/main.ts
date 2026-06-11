/**
 * Nursing Flow
 *
 * Maneja la lógica de negocio para las citas y registros de enfermería.
 * Conectado a nursingService — CRÍTICO-1 resuelto.
 */

import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment } from '../../../types/nursing';
import type { GetNursingAppointmentsDto, CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, CompleteAppointmentDto } from '../../../types/nursing';
import { validateNursingAppointmentData, validateNursingRecordData, validateNursingId, getNursingErrorMessage, validateAppointmentCancellation, validateAppointmentCompletion } from './validation/nursingValidations';

export interface NursingFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const nursingFlow = {
    async getAllAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingFlowResult<NursingAppointment[]>> {
        try {
            const data = await nursingService.getNursingAppointments(filters);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getAllAppointments:', error);
            return { success: false, error: 'Error al obtener citas de enfermería' };
        }
    },

    async getPendingAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingFlowResult<NursingAppointment[]>> {
        try {
            const data = await nursingService.getPendingAppointments(filters);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getPendingAppointments:', error);
            return { success: false, error: 'Error al obtener citas pendientes de enfermería' };
        }
    },

    async getCompletedAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingFlowResult<NursingAppointment[]>> {
        try {
            const data = await nursingService.getCompletedAppointments(filters);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getCompletedAppointments:', error);
            return { success: false, error: 'Error al obtener citas completadas de enfermería' };
        }
    },

    async getCancelledAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingFlowResult<NursingAppointment[]>> {
        try {
            const data = await nursingService.getCancelledAppointments(filters);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getCancelledAppointments:', error);
            return { success: false, error: 'Error al obtener citas canceladas de enfermería' };
        }
    },

    async getAppointmentsByPatient(patientId: string | number): Promise<NursingFlowResult<NursingAppointment[]>> {
        try {
            const idValidation = validateNursingId(patientId);
            if (!idValidation.isValid) {
                return { success: false, error: getNursingErrorMessage(idValidation.error!) };
            }
            const data = await nursingService.getAppointmentsByPatientId(Number(patientId));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getAppointmentsByPatient:', error);
            return { success: false, error: 'Error al obtener citas del paciente' };
        }
    },

    async getRecordsByAppointment(appointmentId: string | number): Promise<NursingFlowResult<any[]>> {
        try {
            const idValidation = validateNursingId(appointmentId);
            if (!idValidation.isValid) {
                return { success: false, error: getNursingErrorMessage(idValidation.error!) };
            }
            const data = await nursingService.getNursingRecordsByAppointment(Number(appointmentId));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.getRecordsByAppointment:', error);
            return { success: false, error: 'Error al obtener registros de la cita' };
        }
    },

    async createAppointment(data: CreateAppointmentDto): Promise<NursingFlowResult<NursingAppointment>> {
        try {
            const validationError = validateNursingAppointmentData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await nursingService.createAppointment(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.createAppointment:', error);
            return { success: false, error: 'Error al crear cita de enfermería' };
        }
    },

    async updateAppointment(id: string | number, data: UpdateAppointmentDto): Promise<NursingFlowResult<NursingAppointment>> {
        try {
            const idValidation = validateNursingId(id);
            if (!idValidation.isValid) return { success: false, error: getNursingErrorMessage(idValidation.error!) };
            const result = await nursingService.updateAppointment(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.updateAppointment:', error);
            return { success: false, error: 'Error al actualizar cita de enfermería' };
        }
    },

    async cancelAppointment(id: string | number, reason?: string): Promise<NursingFlowResult<NursingAppointment>> {
        try {
            const idValidation = validateNursingId(id);
            if (!idValidation.isValid) return { success: false, error: getNursingErrorMessage(idValidation.error!) };
            const cancellationValidation = validateAppointmentCancellation(id, reason);
            if (!cancellationValidation.isValid) return { success: false, error: getNursingErrorMessage(cancellationValidation.error!) };
            const cancelDto: CancelAppointmentDto = { cancellationReason: reason };
            const result = await nursingService.cancelAppointment(Number(id), cancelDto);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.cancelAppointment:', error);
            return { success: false, error: 'Error al cancelar cita de enfermería' };
        }
    },

    async completeAppointment(id: string | number, recordData: CompleteAppointmentDto): Promise<NursingFlowResult<{ appointment: NursingAppointment; nursingRecord: any }>> {
        try {
            const idValidation = validateNursingId(id);
            if (!idValidation.isValid) return { success: false, error: getNursingErrorMessage(idValidation.error!) };
            const recordValidation = validateNursingRecordData(recordData);
            if (recordValidation) return { success: false, error: recordValidation };
            const completionValidation = validateAppointmentCompletion(id, recordData);
            if (!completionValidation.isValid) return { success: false, error: getNursingErrorMessage(completionValidation.error!) };
            const result = await nursingService.completeAppointment(Number(id), recordData);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en nursingFlow.completeAppointment:', error);
            return { success: false, error: 'Error al completar cita de enfermería' };
        }
    },
};
