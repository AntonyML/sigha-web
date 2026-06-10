// src/services/olderAdultUpdateService.ts
// CRUD for older-adult change history.

import { httpClient } from './httpClient';

export interface OlderAdultUpdate {
  id?: number;
  oau_field_changed: string;
  oau_old_value?: string | null;
  oau_new_value?: string | null;
  changed_at?: string;
  id_older_adult: number;
  changed_by: number;
}

export const olderAdultUpdateService = {
  getAll: () =>
    httpClient.get<OlderAdultUpdate[]>('/older-adult-updates').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<OlderAdultUpdate>(`/older-adult-updates/${id}`).then((r) => r.data),

  getByPatient: (olderAdultId: number) =>
    httpClient
      .get<OlderAdultUpdate[]>(`/virtual-records/${olderAdultId}/updates`)
      .then((r) => r.data),

  create: (payload: Partial<OlderAdultUpdate>) =>
    httpClient
      .post<OlderAdultUpdate>('/older-adult-updates', payload)
      .then((r) => r.data),
};
