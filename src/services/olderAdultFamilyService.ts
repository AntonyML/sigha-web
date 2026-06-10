// src/services/olderAdultFamilyService.ts
// CRUD for older-adult family members.

import { httpClient } from './httpClient';

export interface OlderAdultFamily {
  id?: number;
  pf_identification: string;
  pf_name: string;
  pf_f_last_name: string;
  pf_s_last_name: string;
  pf_phone_number?: string | null;
  pf_email?: string | null;
  pf_kinship:
    | 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'brother' | 'sister'
    | 'nephew' | 'niece' | 'husband' | 'wife' | 'legal guardian' | 'other' | 'not specified';
  pf_is_active?: boolean;
  create_at?: string;
}

export const olderAdultFamilyService = {
  getAll: () =>
    httpClient.get<OlderAdultFamily[]>('/older-adult-family').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<OlderAdultFamily>(`/older-adult-family/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<OlderAdultFamily[]>(`/virtual-records/${olderAdultId}/family`)
      .then((r) => r.data),

  create: (payload: Partial<OlderAdultFamily>) =>
    httpClient.post<OlderAdultFamily>('/older-adult-family', payload).then((r) => r.data),

  update: (id: number, payload: Partial<OlderAdultFamily>) =>
    httpClient
      .patch<OlderAdultFamily>(`/older-adult-family/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/older-adult-family/${id}`).then((r) => r.data),

  toggle: (id: number) =>
    httpClient
      .patch<OlderAdultFamily>(`/older-adult-family/${id}/toggle`)
      .then((r) => r.data),
};
