import { httpClient } from '@/infrastructure/api/httpClient';

export interface LifestyleAssessmentItem {
  id: number;
  idOlderAdult: number;
  assessedAt: string;
  assessedBy?: number;
  dietType: string;
  dietConsistency: string;
  dietAllergiesIntolerances?: string;
  mealsPerDay: number;
  appetite: string;
  dailyFluidIntakeMl: number;
  requiresFluidThickener: boolean;
  dietNotes?: string;
  sleepHoursPerNight: number;
  sleepQuality: string;
  sleepMedicationRequired: boolean;
  sleepNotes?: string;
  physicalActivityLevel: string;
  dailyWalkingMinutes: number;
  mobilityAssistanceRequired: boolean;
  physicalActivityNotes?: string;
  smokingStatus: string;
  smokingPacksYear?: number;
  alcoholStatus: string;
  lifestyleSummary?: string;
  createdAt: string;
  updatedAt: string;
  assessor?: {
    id: number;
    name?: string;
    email?: string;
  };
}

export interface CreateLifestyleAssessmentPayload {
  idOlderAdult: number;
  dietType?: string;
  dietConsistency?: string;
  dietAllergiesIntolerances?: string;
  mealsPerDay?: number;
  appetite?: string;
  dailyFluidIntakeMl?: number;
  requiresFluidThickener?: boolean;
  dietNotes?: string;
  sleepHoursPerNight?: number;
  sleepQuality?: string;
  sleepMedicationRequired?: boolean;
  sleepNotes?: string;
  physicalActivityLevel?: string;
  dailyWalkingMinutes?: number;
  mobilityAssistanceRequired?: boolean;
  physicalActivityNotes?: string;
  smokingStatus?: string;
  smokingPacksYear?: number;
  alcoholStatus?: string;
  lifestyleSummary?: string;
}

export const lifestyleService = {
  createAssessment: (payload: CreateLifestyleAssessmentPayload): Promise<LifestyleAssessmentItem> =>
    httpClient
      .post('/lifestyle/assessments', payload)
      .then((r) => r.data?.data ?? r.data),

  getLatestAssessment: (patientId: number): Promise<LifestyleAssessmentItem | null> =>
    httpClient
      .get(`/lifestyle/patient/${patientId}`)
      .then((r) => r.data?.data ?? r.data),

  getAssessmentHistory: (patientId: number): Promise<LifestyleAssessmentItem[]> =>
    httpClient
      .get(`/lifestyle/patient/${patientId}/history`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),
};
