// src/services/physiotherapyService.ts
// CRUD sincronizado con backend: controller/nursing/physiotherapy.controller.ts
// Endpoints:
//   POST   /physiotherapy/sessions
//   GET    /physiotherapy/sessions?appointmentId=
//   GET    /physiotherapy/sessions/:id
//   PUT    /physiotherapy/sessions/:id
//   DELETE /physiotherapy/sessions/:id

import { httpClient } from './httpClient';

export type PhysiotherapyType = 'evaluation' | 'therapy' | 'follow_up';
export type MobilityLevel = 'high' | 'moderate' | 'low' | 'none';

export interface PhysiotherapySessionApi {
  id: number;
  ps_date: string;
  ps_type: PhysiotherapyType;
  ps_mobility_level: MobilityLevel;
  ps_pain_level?: number | null;
  ps_treatment_description?: string | null;
  ps_exercise_plan?: string | null;
  ps_progress_notes?: string | null;
  id_appointment: number;
  create_at?: string;
}

export interface CreatePhysiotherapySessionDto {
  ps_type: PhysiotherapyType;
  ps_mobility_level: MobilityLevel;
  id_appointment: number;
  ps_date?: string;
  ps_pain_level?: number;
  ps_treatment_description?: string;
  ps_exercise_plan?: string;
  ps_progress_notes?: string;
}

export interface UpdatePhysiotherapySessionDto {
  ps_type?: PhysiotherapyType;
  ps_mobility_level?: MobilityLevel;
  ps_date?: string;
  ps_pain_level?: number;
  ps_treatment_description?: string;
  ps_exercise_plan?: string;
  ps_progress_notes?: string;
}

export const physiotherapyService = {
  getSessions(appointmentId?: number): Promise<PhysiotherapySessionApi[]> {
    const params = appointmentId !== undefined ? { appointmentId } : undefined;
    return httpClient
      .get<PhysiotherapySessionApi[]>('/physiotherapy/sessions', { params })
      .then((r) => r.data ?? []);
  },

  getSessionById(id: number): Promise<PhysiotherapySessionApi> {
    return httpClient
      .get<PhysiotherapySessionApi>(`/physiotherapy/sessions/${id}`)
      .then((r) => r.data);
  },

  createSession(payload: CreatePhysiotherapySessionDto): Promise<PhysiotherapySessionApi> {
    return httpClient
      .post<PhysiotherapySessionApi>('/physiotherapy/sessions', payload)
      .then((r) => r.data);
  },

  updateSession(id: number, payload: UpdatePhysiotherapySessionDto): Promise<PhysiotherapySessionApi> {
    return httpClient
      .put<PhysiotherapySessionApi>(`/physiotherapy/sessions/${id}`, payload)
      .then((r) => r.data);
  },

  deleteSession(id: number): Promise<void> {
    return httpClient.delete(`/physiotherapy/sessions/${id}`).then(() => undefined);
  },
};
