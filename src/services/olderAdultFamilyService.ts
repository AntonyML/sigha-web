// src/services/olderAdultFamilyService.ts
// CRUD sincronizado con backend: controller/older-adult-family/older-adult-family.controller.ts
// Endpoints:
//   POST   /older-adult-family
//   GET    /older-adult-family
//   GET    /older-adult-family/:id
//   PATCH  /older-adult-family/:id
//   DELETE /older-adult-family/:id

import { httpClient } from './httpClient';

export type KinshipType =
  | 'son'
  | 'daughter'
  | 'grandson'
  | 'granddaughter'
  | 'brother'
  | 'sister'
  | 'nephew'
  | 'niece'
  | 'husband'
  | 'wife'
  | 'legal guardian'
  | 'other'
  | 'not specified';

export interface OlderAdultFamilyApi {
  id: number;
  pfIdentification: string;
  pfName: string;
  pfFLastName: string;
  pfSLastName: string;
  pfPhoneNumber?: string | null;
  pfEmail?: string | null;
  pfKinship: KinshipType;
  pfIsActive?: boolean;
  createAt?: string;
}

export interface CreateOlderAdultFamilyDto {
  pfIdentification: string;
  pfName: string;
  pfFLastName: string;
  pfSLastName: string;
  pfKinship: KinshipType;
  pfPhoneNumber?: string;
  pfEmail?: string;
}

export interface UpdateOlderAdultFamilyDto {
  pfIdentification?: string;
  pfName?: string;
  pfFLastName?: string;
  pfSLastName?: string;
  pfKinship?: KinshipType;
  pfPhoneNumber?: string;
  pfEmail?: string;
}

export const olderAdultFamilyService = {
  getAll(): Promise<OlderAdultFamilyApi[]> {
    return httpClient
      .get<OlderAdultFamilyApi[]>('/older-adult-family')
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  getById(id: number): Promise<OlderAdultFamilyApi> {
    return httpClient
      .get<OlderAdultFamilyApi>(`/older-adult-family/${id}`)
      .then((r) => r.data?.data ?? r.data);
  },

  create(payload: CreateOlderAdultFamilyDto): Promise<OlderAdultFamilyApi> {
    return httpClient
      .post<OlderAdultFamilyApi>('/older-adult-family', payload)
      .then((r) => r.data?.data ?? r.data);
  },

  update(id: number, payload: UpdateOlderAdultFamilyDto): Promise<OlderAdultFamilyApi> {
    return httpClient
      .patch<OlderAdultFamilyApi>(`/older-adult-family/${id}`, payload)
      .then((r) => r.data?.data ?? r.data);
  },

  remove(id: number): Promise<void> {
    return httpClient.delete(`/older-adult-family/${id}`).then(() => undefined);
  },
};
