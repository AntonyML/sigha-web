// src/services/specializedAppointmentService.ts
// CRUD for specialized appointments (links a patient to an area and staff).

import { httpClient } from './httpClient';

export interface SpecializedAppointment {
  id?: number;
  sa_appointment_date: string;
  sa_appointment_type: 'checkup' | 'evaluation' | 'therapy' | 'follow_up' | 'emergency';
  sa_priority: 'low' | 'medium' | 'high' | 'urgent';
  sa_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  sa_notes?: string | null;
  sa_observations?: string | null;
  sa_duration_minutes?: number | null;
  sa_next_appointment?: string | null;
  id_area: number;
  id_patient: number;
  id_staff: number;
  create_at?: string;
}

export const specializedAppointmentService = {
  getAll: () =>
    httpClient.get<SpecializedAppointment[]>('/specialized-appointments').then((r) => r.data),

  getById: (id: number) =>
    httpClient
      .get<SpecializedAppointment>(`/specialized-appointments/${id}`)
      .then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<SpecializedAppointment[]>(`/nursing/patients/${olderAdultId}/appointments`)
      .then((r) => r.data),

  schedule: (payload: Partial<SpecializedAppointment>) =>
    httpClient
      .post<SpecializedAppointment>('/specialized-appointments', payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<SpecializedAppointment>) =>
    httpClient
      .patch<SpecializedAppointment>(`/specialized-appointments/${id}`, payload)
      .then((r) => r.data),

  cancel: (id: number) =>
    httpClient.delete(`/specialized-appointments/${id}`).then((r) => r.data),
};
