// src/services/medicalRecordService.ts
// CRUD sincronizado con backend: controller/nursing/medical-record.controller.ts
// Endpoints:
//   POST   /medical-records
//   GET    /medical-records?olderAdultId=
//   GET    /medical-records/:id
//   PUT    /medical-records/:id
//   DELETE /medical-records/:id

import { httpClient } from './httpClient';

export interface MedicalRecordStaffRef {
  id: number;
  u_name?: string;
  u_f_last_name?: string;
  u_email?: string;
}

export interface MedicalRecordAppointmentRef {
  id: number;
  saAppointmentDate?: string;
}

export interface MedicalRecordPatientRef {
  id: number;
  oa_identification?: string;
  oa_name?: string;
  oa_f_last_name?: string;
  oa_s_last_name?: string;
}

export interface MedicalRecord {
  id: number;
  mr_record_date: string;
  mr_summary: string;
  mr_diagnosis?: string | null;
  mr_treatment?: string | null;
  mr_observations?: string | null;
  mr_origin_area: string;
  mr_signed_by?: string | null;
  create_at?: string;
  id_older_adult?: MedicalRecordPatientRef;
  id_appointment?: MedicalRecordAppointmentRef;
  id_staff?: MedicalRecordStaffRef;
}

export interface CreateMedicalRecordDto {
  mr_summary: string;
  mr_origin_area: string;
  id_older_adult: number;
  mr_record_date?: string;
  mr_diagnosis?: string;
  mr_treatment?: string;
  mr_observations?: string;
  mr_signed_by?: string;
  id_appointment?: number;
  id_staff?: number;
}

export interface UpdateMedicalRecordDto {
  mr_record_date?: string;
  mr_summary?: string;
  mr_diagnosis?: string;
  mr_treatment?: string;
  mr_observations?: string;
  mr_origin_area?: string;
  mr_signed_by?: string;
  id_appointment?: number;
  id_staff?: number;
}

export const medicalRecordService = {
  getMedicalRecords(olderAdultId?: number): Promise<MedicalRecord[]> {
    const params = olderAdultId !== undefined ? { olderAdultId } : undefined;
    return httpClient
      .get<MedicalRecord[]>('/medical-records', { params })
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  getMedicalRecordById(id: number): Promise<MedicalRecord> {
    return httpClient
      .get<MedicalRecord>(`/medical-records/${id}`)
      .then((r) => r.data?.data ?? r.data);
  },

  createMedicalRecord(payload: CreateMedicalRecordDto): Promise<MedicalRecord> {
    return httpClient
      .post<MedicalRecord>('/medical-records', payload)
      .then((r) => r.data?.data ?? r.data);
  },

  updateMedicalRecord(id: number, payload: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    return httpClient
      .put<MedicalRecord>(`/medical-records/${id}`, payload)
      .then((r) => r.data?.data ?? r.data);
  },

  deleteMedicalRecord(id: number): Promise<void> {
    return httpClient.delete(`/medical-records/${id}`).then(() => undefined);
  },
};
