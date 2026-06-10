// src/services/medicalRecordService.ts
// CRUD for the general medical record (per-older-adult timeline).

import { httpClient } from './httpClient';

export interface MedicalRecord {
  id?: number;
  mr_record_date: string;
  mr_summary: string;
  mr_diagnosis?: string | null;
  mr_treatment?: string | null;
  mr_observations?: string | null;
  mr_origin_area: string;
  mr_signed_by?: string | null;
  id_older_adult: number;
  id_appointment?: number | null;
  id_staff?: number | null;
  create_at?: string;
}

export const medicalRecordService = {
  getAll: () =>
    httpClient.get<MedicalRecord[]>('/medical-records').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<MedicalRecord>(`/medical-records/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<MedicalRecord[]>(`/virtual-records/${olderAdultId}/medical-record`)
      .then((r) => r.data),

  create: (payload: Partial<MedicalRecord>) =>
    httpClient.post<MedicalRecord>('/medical-records', payload).then((r) => r.data),

  update: (id: number, payload: Partial<MedicalRecord>) =>
    httpClient.patch<MedicalRecord>(`/medical-records/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/medical-records/${id}`).then((r) => r.data),
};
