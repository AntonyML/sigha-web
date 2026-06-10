// src/services/physiotherapyService.ts
// CRUD for physiotherapy sessions.

import { httpClient } from './httpClient';

export interface PhysiotherapySession {
  id?: number;
  ps_date: string;
  ps_type: 'evaluation' | 'therapy' | 'follow_up';
  ps_mobility_level: 'high' | 'moderate' | 'low' | 'none';
  ps_pain_level?: number | null;
  ps_treatment_description?: string | null;
  ps_exercise_plan?: string | null;
  ps_progress_notes?: string | null;
  id_appointment: number;
  create_at?: string;
}

export const physiotherapyService = {
  getAll: () =>
    httpClient.get<PhysiotherapySession[]>('/physiotherapy-sessions').then((r) => r.data),

  getById: (id: number) =>
    httpClient
      .get<PhysiotherapySession>(`/physiotherapy-sessions/${id}`)
      .then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<PhysiotherapySession[]>(`/physiotherapy-sessions?patient=${olderAdultId}`)
      .then((r) => r.data),

  create: (payload: Partial<PhysiotherapySession>) =>
    httpClient
      .post<PhysiotherapySession>('/physiotherapy-sessions', payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<PhysiotherapySession>) =>
    httpClient
      .patch<PhysiotherapySession>(`/physiotherapy-sessions/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/physiotherapy-sessions/${id}`).then((r) => r.data),
};
