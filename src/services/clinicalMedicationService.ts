// src/services/clinicalMedicationService.ts
// CRUD sincronizado con backend: controller/nursing/clinical-medication.controller.ts
// Endpoints:
//   GET    /clinical-medication
//   GET    /clinical-medication/by-clinical-history/:clinicalHistoryId
//   GET    /clinical-medication/:id
//   POST   /clinical-medication
//   PATCH  /clinical-medication/:id
//   DELETE /clinical-medication/:id

import { httpClient } from './httpClient';

export type TreatmentType = 'temporary' | 'chronic' | 'preventive' | 'other';

export interface ClinicalMedicationApi {
  id: number;
  mMedication: string;
  mDosage: string;
  mTreatmentType?: TreatmentType;
  idClinicalHistory?: number;
}

export interface CreateClinicalMedicationDto {
  mMedication: string;
  mDosage: string;
  mTreatmentType?: TreatmentType;
  idClinicalHistory?: number;
}

export interface UpdateClinicalMedicationDto {
  mMedication?: string;
  mDosage?: string;
  mTreatmentType?: TreatmentType;
  idClinicalHistory?: number;
}

export const clinicalMedicationService = {
  getAll: (): Promise<ClinicalMedicationApi[]> =>
    httpClient.get<ClinicalMedicationApi[]>('/clinical-medication').then((r) => r.data ?? []),

  getById: (id: number): Promise<ClinicalMedicationApi> =>
    httpClient
      .get<ClinicalMedicationApi>(`/clinical-medication/${id}`)
      .then((r) => r.data),

  getByHistory: (clinicalHistoryId: number): Promise<ClinicalMedicationApi[]> =>
    httpClient
      .get<ClinicalMedicationApi[]>(`/clinical-medication/by-clinical-history/${clinicalHistoryId}`)
      .then((r) => r.data ?? []),

  create: (payload: CreateClinicalMedicationDto): Promise<ClinicalMedicationApi> =>
    httpClient
      .post<ClinicalMedicationApi>('/clinical-medication', payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateClinicalMedicationDto): Promise<ClinicalMedicationApi> =>
    httpClient
      .patch<ClinicalMedicationApi>(`/clinical-medication/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/clinical-medication/${id}`).then(() => undefined),
};
