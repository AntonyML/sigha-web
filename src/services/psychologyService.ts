// src/services/psychologyService.ts
// CRUD for psychology sessions.

import { httpClient } from './httpClient';

export interface PsychologySession {
  id?: number;
  psy_date: string;
  psy_session_type: 'evaluation' | 'therapy' | 'follow_up' | 'group therapy';
  psy_mood: 'stable' | 'anxious' | 'depressed' | 'irritable' | 'other';
  psy_cognitive_status: 'normal' | 'mild impairment' | 'moderate impairment' | 'severe impairment';
  psy_observations?: string | null;
  psy_therapy_goal?: string | null;
  psy_progress?: string | null;
  id_appointment: number;
  create_at?: string;
}

export const psychologyService = {
  getAll: () =>
    httpClient.get<PsychologySession[]>('/psychology-sessions').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<PsychologySession>(`/psychology-sessions/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<PsychologySession[]>(`/psychology-sessions?patient=${olderAdultId}`)
      .then((r) => r.data),

  create: (payload: Partial<PsychologySession>) =>
    httpClient
      .post<PsychologySession>('/psychology-sessions', payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<PsychologySession>) =>
    httpClient
      .patch<PsychologySession>(`/psychology-sessions/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/psychology-sessions/${id}`).then((r) => r.data),
};
