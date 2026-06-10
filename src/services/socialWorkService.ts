// src/services/socialWorkService.ts
// CRUD for social work reports.

import { httpClient } from './httpClient';

export interface SocialWorkReport {
  id?: number;
  sw_date: string;
  sw_visit_type: 'home visit' | 'institutional visit' | 'interview' | 'follow_up';
  sw_family_relationship?: string | null;
  sw_economic_assessment?: string | null;
  sw_social_support?: string | null;
  sw_observations?: string | null;
  sw_recommendations?: string | null;
  id_appointment: number;
  create_at?: string;
}

export const socialWorkService = {
  getAll: () =>
    httpClient.get<SocialWorkReport[]>('/social-work-reports').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<SocialWorkReport>(`/social-work-reports/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<SocialWorkReport[]>(`/social-work-reports?patient=${olderAdultId}`)
      .then((r) => r.data),

  create: (payload: Partial<SocialWorkReport>) =>
    httpClient.post<SocialWorkReport>('/social-work-reports', payload).then((r) => r.data),

  update: (id: number, payload: Partial<SocialWorkReport>) =>
    httpClient
      .patch<SocialWorkReport>(`/social-work-reports/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/social-work-reports/${id}`).then((r) => r.data),
};
