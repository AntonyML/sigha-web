// src/services/emergencyContactService.ts
// CRUD for emergency contacts of an older adult.

import { httpClient } from './httpClient';

export interface EmergencyContact {
  id?: number;
  en_phone_number: string;
  en_contact_name?: string | null;
  id_older_adult: number;
  create_at?: string;
}

export const emergencyContactService = {
  getAll: () =>
    httpClient.get<EmergencyContact[]>('/emergency-contacts').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<EmergencyContact>(`/emergency-contacts/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<EmergencyContact[]>(`/virtual-records/${olderAdultId}/emergency-contacts`)
      .then((r) => r.data),

  create: (payload: Partial<EmergencyContact>) =>
    httpClient.post<EmergencyContact>('/emergency-contacts', payload).then((r) => r.data),

  update: (id: number, payload: Partial<EmergencyContact>) =>
    httpClient
      .patch<EmergencyContact>(`/emergency-contacts/${id}`, payload)
      .then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/emergency-contacts/${id}`).then((r) => r.data),

  toggle: (id: number) =>
    httpClient
      .patch<EmergencyContact>(`/emergency-contacts/${id}/toggle`)
      .then((r) => r.data),
};
