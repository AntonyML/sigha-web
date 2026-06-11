/**
 * Clinical Medication Flow
 *
 * Conectado a clinicalMedicationService — CRÍTICO-1 resuelto.
 */

import { clinicalMedicationService } from '../../../services/clinicalMedicationService';
import type { ClinicalMedicationApi, CreateClinicalMedicationDto, UpdateClinicalMedicationDto } from '../../../types/clinicalMedication';
import { validateClinicalMedicationData, validateClinicalMedicationId, getClinicalMedicationErrorMessage } from './validation/medicationValidations';

export interface ClinicalMedicationFlowResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const clinicalMedicationFlow = {
    async getAllMedications(clinicalHistoryId?: number): Promise<ClinicalMedicationFlowResult<ClinicalMedicationApi[]>> {
        try {
            const data = await clinicalMedicationService.getAll(clinicalHistoryId);
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en clinicalMedicationFlow.getAllMedications:', error);
            return { success: false, error: getClinicalMedicationErrorMessage('getAll', error) };
        }
    },

    async getMedicationById(id: string | number): Promise<ClinicalMedicationFlowResult<ClinicalMedicationApi>> {
        try {
            const idError = validateClinicalMedicationId(id);
            if (idError) return { success: false, error: idError };
            const data = await clinicalMedicationService.getById(Number(id));
            return { success: true, data };
        } catch (error: unknown) {
            console.error('Error en clinicalMedicationFlow.getMedicationById:', error);
            return { success: false, error: getClinicalMedicationErrorMessage('getById', error) };
        }
    },

    async createMedication(data: CreateClinicalMedicationDto): Promise<ClinicalMedicationFlowResult<ClinicalMedicationApi>> {
        try {
            const validationError = validateClinicalMedicationData(data);
            if (validationError) return { success: false, error: validationError };
            const result = await clinicalMedicationService.create(data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en clinicalMedicationFlow.createMedication:', error);
            return { success: false, error: getClinicalMedicationErrorMessage('create', error) };
        }
    },

    async updateMedication(id: string | number, data: UpdateClinicalMedicationDto): Promise<ClinicalMedicationFlowResult<ClinicalMedicationApi>> {
        try {
            const idError = validateClinicalMedicationId(id);
            if (idError) return { success: false, error: idError };
            const result = await clinicalMedicationService.update(Number(id), data);
            return { success: true, data: result };
        } catch (error: unknown) {
            console.error('Error en clinicalMedicationFlow.updateMedication:', error);
            return { success: false, error: getClinicalMedicationErrorMessage('update', error) };
        }
    },

    async deleteMedication(id: string | number): Promise<ClinicalMedicationFlowResult<void>> {
        try {
            const idError = validateClinicalMedicationId(id);
            if (idError) return { success: false, error: idError };
            await clinicalMedicationService.remove(Number(id));
            return { success: true };
        } catch (error: unknown) {
            console.error('Error en clinicalMedicationFlow.deleteMedication:', error);
            return { success: false, error: getClinicalMedicationErrorMessage('delete', error) };
        }
    },
};
