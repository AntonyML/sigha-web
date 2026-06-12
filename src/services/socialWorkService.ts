// src/services/socialWorkService.ts
// CRUD sincronizado con backend: controller/nursing/social-work.controller.ts
// Endpoints:
//   POST   /social-work/reports
//   GET    /social-work/reports?patientId=
//   GET    /social-work/reports/:id
//   PUT    /social-work/reports/:id
//   DELETE /social-work/reports/:id

import { httpClient } from './httpClient';

export type SocialWorkVisitType =
  | 'home visit'
  | 'institutional visit'
  | 'interview'
  | 'follow_up';

export interface SocialWorkReportApi {
  id: number;
  sw_date?: string;
  sw_visit_type: SocialWorkVisitType;
  sw_family_relationship?: string | null;
  sw_economic_assessment?: string | null;
  sw_social_support?: string | null;
  sw_observations?: string | null;
  sw_recommendations?: string | null;
  id_appointment: number;
  create_at?: string;
}

export interface CreateSocialWorkReportDto {
  sw_visit_type: SocialWorkVisitType;
  id_appointment: number;
  sw_date?: string;
  sw_family_relationship?: string;
  sw_economic_assessment?: string;
  sw_social_support?: string;
  sw_observations?: string;
  sw_recommendations?: string;
}

export interface UpdateSocialWorkReportDto {
  sw_visit_type?: SocialWorkVisitType;
  id_appointment?: number;
  sw_date?: string;
  sw_family_relationship?: string;
  sw_economic_assessment?: string;
  sw_social_support?: string;
  sw_observations?: string;
  sw_recommendations?: string;
}

export const socialWorkService = {
  getReports(patientId?: number): Promise<SocialWorkReportApi[]> {
    const params = patientId !== undefined ? { patientId } : undefined;
    return httpClient
      .get<SocialWorkReportApi[]>('/social-work/reports', { params })
      .then((r) => r.data?.data ?? r.data ?? []);
  },

  getReportById(id: number): Promise<SocialWorkReportApi> {
    return httpClient
      .get<SocialWorkReportApi>(`/social-work/reports/${id}`)
      .then((r) => r.data?.data ?? r.data);
  },

  createReport(payload: CreateSocialWorkReportDto): Promise<SocialWorkReportApi> {
    return httpClient
      .post<SocialWorkReportApi>('/social-work/reports', payload)
      .then((r) => r.data?.data ?? r.data);
  },

  updateReport(id: number, payload: UpdateSocialWorkReportDto): Promise<SocialWorkReportApi> {
    return httpClient
      .put<SocialWorkReportApi>(`/social-work/reports/${id}`, payload)
      .then((r) => r.data?.data ?? r.data);
  },

  deleteReport(id: number): Promise<void> {
    return httpClient.delete(`/social-work/reports/${id}`).then(() => undefined);
  },
};
