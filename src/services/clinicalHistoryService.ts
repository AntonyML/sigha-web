// src/services/clinicalHistoryService.ts
// ⚠️ No existe un endpoint /clinical-histories en el backend.
// El historial clínico del adulto mayor es parte del expediente virtual y se gestiona
// mediante GET /virtual-records/:id (response.clinicalHistory). Para evitar puntos
// de acoplamiento inexistentes este servicio expone solo helpers basados en el
// expediente virtual.

import { httpClient } from './httpClient';

export interface ClinicalHistory {
  ch_frequent_falls: boolean;
  ch_weight?: number | null;
  ch_height?: number | null;
  ch_imc?: number | null;
  ch_blood_pressure?: string | null;
  ch_neoplasms: boolean;
  ch_neoplasms_description?: string | null;
  ch_observations?: string | null;
  ch_rcvg?: string;
  ch_vision_problems: boolean;
  ch_vision_hearing: boolean;
  conditions?: Array<{ id: number }>;
  vaccines?: Array<{ id: number }>;
  medications?: Array<{
    m_medication: string;
    m_dosage: string;
    m_treatment_type: string;
  }>;
}

export const clinicalHistoryService = {
  async getByOlderAdult(olderAdultId: number): Promise<ClinicalHistory | null> {
    const response = await httpClient.get(`/virtual-records/${olderAdultId}`);
    return response.data?.data?.clinicalHistory ?? response.data?.clinicalHistory ?? null;
  },
};
