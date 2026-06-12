// src/services/emergencyContactService.ts
// CRUD sincronizado con backend: controller/emergency-contacts/emergency-contacts.controller.ts
// Endpoints:
//   POST   /emergency-contacts
//   GET    /emergency-contacts?olderAdultId=
//   GET    /emergency-contacts/by-older-adult/:olderAdultId
//   GET    /emergency-contacts/:id
//   PATCH  /emergency-contacts/:id
//   DELETE /emergency-contacts/:id

import { httpClient } from './httpClient';

export interface EmergencyContactApi {
  id: number;
  enPhoneNumber: string;
  enContactName?: string | null;
  idOlderAdult?: number;
  createAt?: string;
}

export interface CreateEmergencyContactDto {
  enPhoneNumber: string;
  idOlderAdult?: number;
}

export interface UpdateEmergencyContactDto {
  enPhoneNumber?: string;
  idOlderAdult?: number;
}

export const emergencyContactService = {
  getAll(olderAdultId?: number): Promise<EmergencyContactApi[]> {
    const params = olderAdultId !== undefined ? { olderAdultId } : undefined;
    return httpClient
      .get<EmergencyContactApi[]>('/emergency-contacts', { params })
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  getById(id: number): Promise<EmergencyContactApi> {
    return httpClient
      .get<EmergencyContactApi>(`/emergency-contacts/${id}`)
      .then((r) => r.data?.data ?? r.data);
  },

  getByOlderAdult(olderAdultId: number): Promise<EmergencyContactApi[]> {
    return httpClient
      .get<EmergencyContactApi[]>(`/emergency-contacts/by-older-adult/${olderAdultId}`)
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  create(payload: CreateEmergencyContactDto): Promise<EmergencyContactApi> {
    return httpClient
      .post<EmergencyContactApi>('/emergency-contacts', payload)
      .then((r) => r.data?.data ?? r.data);
  },

  update(id: number, payload: UpdateEmergencyContactDto): Promise<EmergencyContactApi> {
    return httpClient
      .patch<EmergencyContactApi>(`/emergency-contacts/${id}`, payload)
      .then((r) => r.data?.data ?? r.data);
  },

  remove(id: number): Promise<void> {
    return httpClient.delete(`/emergency-contacts/${id}`).then(() => undefined);
  },
};
