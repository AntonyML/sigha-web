// src/services/clinicalMedicationService.ts
// CRUD for clinical medications tied to a clinical history.

import { httpClient } from './httpClient';

export interface ClinicalMedication {
  id?: number;
  m_medication: string;
  m_dosage: string;
  m_treatment_type: 'temporary' | 'chronic' | 'preventive' | 'other';
  id_clinical_history: number;
}

export const clinicalMedicationService = {
  getAll: () =>
    httpClient.get<ClinicalMedication[]>('/clinical-medications').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<ClinicalMedication>(`/clinical-medications/${id}`).then((r) => r.data),

  getByHistory: (historyId: number) =>
    httpClient
      .get<ClinicalMedication[]>(`/clinical-histories/${historyId}/medications`)
      .then((r) => r.data),

  create: (payload: Partial<ClinicalMedication>) =>
    httpClient.post<ClinicalMedication>('/clinical-medications', payload).then((r) => r.data),

  update: (id: number, payload: Partial<ClinicalMedication>) =>
    httpClient
      .patch<ClinicalMedication>(`/clinical-medications/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/clinical-medications/${id}`).then((r) => r.data),
};
