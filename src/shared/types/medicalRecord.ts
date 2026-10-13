// Tipos sincronizados con backend: controller/nursing/medical-record.controller.ts
// Tabla real: medical_record (columnas mr_*)

export interface OlderAdultPatient {
  id: number;
  oa_identification?: string;
  oa_name?: string;
  oa_f_last_name?: string;
  oa_s_last_name?: string;
}

export interface MedicalRecordStaff {
  id: number;
  u_name?: string;
  u_f_last_name?: string;
  u_email?: string;
}

export interface MedicalRecord {
  id: number;
  mr_record_date: string;
  mr_summary: string;
  mr_diagnosis?: string;
  mr_treatment?: string;
  mr_observations?: string;
  mr_origin_area: string;
  mr_signed_by?: string;
  create_at?: string;
  id_older_adult?: OlderAdultPatient;
  id_appointment?: { id: number; saAppointmentDate?: string };
  id_staff?: MedicalRecordStaff;
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
}

export type UpdateMedicalRecordDto = Partial<CreateMedicalRecordDto>;

export interface MedicalRecordFilterDto {
  patientId?: number;
}

export interface MedicalRecordApiResponse {
  message: string;
  data: MedicalRecord[];
}

export interface SingleMedicalRecordApiResponse {
  message: string;
  data: MedicalRecord;
}
