// src/services/psychologyService.ts
// CRUD sincronizado con backend: controller/nursing/psychology.controller.ts
// Endpoints:
//   POST   /psychology/sessions
//   GET    /psychology/sessions?appointmentId=
//   GET    /psychology/sessions/:id
//   PUT    /psychology/sessions/:id
//   DELETE /psychology/sessions/:id

import { httpClient } from './httpClient';

export type PsychologySessionType = 'evaluation' | 'therapy' | 'follow_up' | 'group therapy';
export type Mood = 'stable' | 'anxious' | 'depressed' | 'irritable' | 'other';
export type CognitiveStatus =
  | 'normal'
  | 'mild impairment'
  | 'moderate impairment'
  | 'severe impairment';

export interface PsychologySessionApi {
  id: number;
  psy_date: string;
  psy_session_type: PsychologySessionType;
  psy_mood: Mood;
  psy_cognitive_status: CognitiveStatus;
  psy_observations?: string | null;
  psy_therapy_goal?: string | null;
  psy_progress?: string | null;
  id_appointment: number;
  create_at?: string;
}

export interface CreatePsychologySessionDto {
  psy_session_type: PsychologySessionType;
  psy_mood: Mood;
  psy_cognitive_status: CognitiveStatus;
  id_appointment: number;
  psy_date?: string;
  psy_observations?: string;
  psy_therapy_goal?: string;
  psy_progress?: string;
}

export interface UpdatePsychologySessionDto {
  psy_session_type?: PsychologySessionType;
  psy_mood?: Mood;
  psy_cognitive_status?: CognitiveStatus;
  psy_date?: string;
  psy_observations?: string;
  psy_therapy_goal?: string;
  psy_progress?: string;
}

export const psychologyService = {
  getSessions(appointmentId?: number): Promise<PsychologySessionApi[]> {
    const params = appointmentId !== undefined ? { appointmentId } : undefined;
    return httpClient
      .get<PsychologySessionApi[]>('/psychology/sessions', { params })
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  getSessionById(id: number): Promise<PsychologySessionApi> {
    return httpClient
      .get<PsychologySessionApi>(`/psychology/sessions/${id}`)
      .then((r) => r.data?.data ?? r.data);
  },

  createSession(payload: CreatePsychologySessionDto): Promise<PsychologySessionApi> {
    return httpClient
      .post<PsychologySessionApi>('/psychology/sessions', payload)
      .then((r) => r.data?.data ?? r.data);
  },

  updateSession(id: number, payload: UpdatePsychologySessionDto): Promise<PsychologySessionApi> {
    return httpClient
      .put<PsychologySessionApi>(`/psychology/sessions/${id}`, payload)
      .then((r) => r.data?.data ?? r.data);
  },

  deleteSession(id: number): Promise<void> {
    return httpClient.delete(`/psychology/sessions/${id}`).then(() => undefined);
  },
};
