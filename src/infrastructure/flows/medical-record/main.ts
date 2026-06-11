/**
 * Medical Record Flow
 *
 * Conectado a medicalRecordService — CRÍTICO-1 resuelto.
 */

import { medicalRecordService } from '../../../services/medicalRecordService';
import type { MedicalRecord, CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../../../types/medicalRecord';
import { validateMedicalRecordData, validateMedicalRecordId, getMedicalRecordErrorMessage } from './validation/medicalRecordValidations';

export interface MedicalRecordFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const medicalRecordFlow = {
    async getAllMedicalRecords(patientId?: number): Promise<MedicalRecordFlowResult<MedicalRecord[]>> {
        try {
            const data = await medicalRecordService.getMedicalRecords(patientId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en medicalRecordFlow.getAllMedicalRecords:', error);
            return { success: false, error: getMedicalRecordErrorMessage('getAll', error) };
        }
    },

    async getMedicalRecordById(id: string | number): Promise<MedicalRecordFlowResult<MedicalRecord>> {
        try {
            const idError = validateMedicalRecordId(id);
            if (idError) return { success: false, error: idError };
            const data = await medicalRecordService.getMedicalRecordById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en medicalRecordFlow.getMedicalRecordById:', error);
            return { success: false, error: getMedicalRecordErrorMessage('getById', error) };
        }
    },

    async createMedicalRecord(data: CreateMedicalRecordDto): Promise<MedicalRecordFlowResult<MedicalRecord>> {
        try {
            const validationError = validateMedicalRecordData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await medicalRecordService.createMedicalRecord(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en medicalRecordFlow.createMedicalRecord:', error);
            return { success: false, error: getMedicalRecordErrorMessage('create', error) };
        }
    },

    async updateMedicalRecord(id: string | number, data: UpdateMedicalRecordDto): Promise<MedicalRecordFlowResult<MedicalRecord>> {
        try {
            const idError = validateMedicalRecordId(id);
            if (idError) return { success: false, error: idError };
            const result = await medicalRecordService.updateMedicalRecord(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en medicalRecordFlow.updateMedicalRecord:', error);
            return { success: false, error: getMedicalRecordErrorMessage('update', error) };
        }
    },

    async deleteMedicalRecord(id: string | number): Promise<MedicalRecordFlowResult<void>> {
        try {
            const idError = validateMedicalRecordId(id);
            if (idError) return { success: false, error: idError };
            await medicalRecordService.deleteMedicalRecord(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en medicalRecordFlow.deleteMedicalRecord:', error);
            return { success: false, error: getMedicalRecordErrorMessage('delete', error) };
        }
    },
};
