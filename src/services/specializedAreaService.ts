// src/services/specializedAreaService.ts
// CRUD for specialized areas (nursing, physiotherapy, psychology, social work).

import { httpClient } from './httpClient';

export interface SpecializedArea {
  id?: number;
  sa_name: 'nursing' | 'physiotherapy' | 'psychology' | 'social_work' | 'not specified';
  sa_description?: string | null;
  sa_contact_email?: string | null;
  sa_contact_phone?: string | null;
  sa_is_active: boolean;
  id_manager?: number | null;
  create_at?: string;
}

export const specializedAreaService = {
  getAll: () =>
    httpClient.get<SpecializedArea[]>('/specialized-areas').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<SpecializedArea>(`/specialized-areas/${id}`).then((r) => r.data),

  create: (payload: Partial<SpecializedArea>) =>
    httpClient.post<SpecializedArea>('/specialized-areas', payload).then((r) => r.data),

  update: (id: number, payload: Partial<SpecializedArea>) =>
    httpClient
      .patch<SpecializedArea>(`/specialized-areas/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/specialized-areas/${id}`).then((r) => r.data),
};
