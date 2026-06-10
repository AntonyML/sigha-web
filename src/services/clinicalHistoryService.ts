// src/services/clinicalHistoryService.ts
// CRUD for clinical history (per-older-adult medical history).
// Endpoints verified against backend/docs/api-endpoints.md.

import { httpClient } from './httpClient';

export interface ClinicalHistory {
  id?: number;
  ch_frequent_falls: boolean;
  ch_weight?: number | null;
  ch_height?: number | null;
  ch_imc?: number | null;
  ch_blood_pressure?: string | null;
  ch_neoplasms: boolean;
  ch_neoplasms_description?: string | null;
  ch_observations?: string | null;
  ch_rcvg?: string;
  ch_vision_problems: boolean;
  ch_vision_hearing: boolean;
  id_older_adult?: number | null;
  create_at?: string;
}

export const clinicalHistoryService = {
  getAll: () =>
    httpClient.get<ClinicalHistory[]>('/clinical-histories').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<ClinicalHistory>(`/clinical-histories/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<ClinicalHistory>(`/virtual-records/${olderAdultId}/clinical-history`)
      .then((r) => r.data),

  create: (payload: Partial<ClinicalHistory>) =>
    httpClient.post<ClinicalHistory>('/clinical-histories', payload).then((r) => r.data),

  update: (id: number, payload: Partial<ClinicalHistory>) =>
    httpClient.patch<ClinicalHistory>(`/clinical-histories/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/clinical-histories/${id}`).then((r) => r.data),

  addCondition: (historyId: number, conditionId: number) =>
    httpClient
      .post(`/clinical-histories/${historyId}/conditions/${conditionId}`)
      .then((r) => r.data),

  removeCondition: (historyId: number, conditionId: number) =>
    httpClient
      .delete(`/clinical-histories/${historyId}/conditions/${conditionId}`)
      .then((r) => r.data),

  addVaccine: (historyId: number, vaccineId: number) =>
    httpClient
      .post(`/clinical-histories/${historyId}/vaccines/${vaccineId}`)
      .then((r) => r.data),

  removeVaccine: (historyId: number, vaccineId: number) =>
    httpClient
      .delete(`/clinical-histories/${historyId}/vaccines/${vaccineId}`)
      .then((r) => r.data),
};
