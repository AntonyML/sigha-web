import { httpClient } from '@/infrastructure/api/httpClient';

export type BarthelLevel =
  | 'total_dependence'
  | 'severe_dependence'
  | 'moderate_dependence'
  | 'mild_dependence'
  | 'independent';

export type GdsLevel = 'normal' | 'mild_depression' | 'moderate_depression' | 'severe_depression';
export type PfeifferLevel = 'intact' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
export type ApgarLevel = 'highly_functional' | 'mild_dysfunction' | 'severe_dysfunction';

export interface PhysiotherapyEvaluationItem {
  id: number;
  idOlderAdult: number;
  idEncounter?: number;
  evaluatorId: number;
  evaluationDate: string;
  barthelFeeding: number;
  barthelBathing: number;
  barthelGrooming: number;
  barthelDressing: number;
  barthelBowels: number;
  barthelBladder: number;
  barthelToiletUse: number;
  barthelTransfers: number;
  barthelMobility: number;
  barthelStairs: number;
  barthelTotalScore: number;
  dependenceLevel: BarthelLevel;
  tinettiGaitScore?: number;
  tinettiBalanceScore?: number;
  rehabilitationGoals?: string;
  treatmentPlan?: string;
  notes?: string;
  evaluator?: {
    id: number;
    name?: string;
  };
}

export interface PsychologyEvaluationItem {
  id: number;
  idOlderAdult: number;
  idEncounter?: number;
  evaluatorId: number;
  evaluationDate: string;
  yesavageGdsScore?: number;
  depressionSeverity?: GdsLevel;
  pfeifferErrorsScore?: number;
  cognitiveImpairment?: PfeifferLevel;
  emotionalState?: string;
  behavioralObservations?: string;
  interventionPlan?: string;
  notes?: string;
  evaluator?: {
    id: number;
    name?: string;
  };
}

export interface SocialWorkEvaluationItem {
  id: number;
  idOlderAdult: number;
  idEncounter?: number;
  evaluatorId: number;
  evaluationDate: string;
  apgarAdaptation: number;
  apgarPartnership: number;
  apgarGrowth: number;
  apgarAffection: number;
  apgarResolve: number;
  apgarTotalScore: number;
  familyFunctioning: ApgarLevel;
  familySupportNetwork?: string;
  socioeconomicAssessment?: string;
  institutionalRecommendations?: string;
  notes?: string;
  evaluator?: {
    id: number;
    name?: string;
  };
}

export const specialtiesEvaluationsService = {
  // Physiotherapy
  createPhysio: (payload: Partial<PhysiotherapyEvaluationItem>): Promise<PhysiotherapyEvaluationItem> =>
    httpClient
      .post('/specialties/physiotherapy', payload)
      .then((r) => r.data?.data ?? r.data),

  getPhysioByPatient: (patientId: number): Promise<PhysiotherapyEvaluationItem[]> =>
    httpClient
      .get(`/specialties/physiotherapy/patient/${patientId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  // Psychology
  createPsychology: (payload: Partial<PsychologyEvaluationItem>): Promise<PsychologyEvaluationItem> =>
    httpClient
      .post('/specialties/psychology', payload)
      .then((r) => r.data?.data ?? r.data),

  getPsychologyByPatient: (patientId: number): Promise<PsychologyEvaluationItem[]> =>
    httpClient
      .get(`/specialties/psychology/patient/${patientId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  // Social Work
  createSocialWork: (payload: Partial<SocialWorkEvaluationItem>): Promise<SocialWorkEvaluationItem> =>
    httpClient
      .post('/specialties/social-work', payload)
      .then((r) => r.data?.data ?? r.data),

  getSocialWorkByPatient: (patientId: number): Promise<SocialWorkEvaluationItem[]> =>
    httpClient
      .get(`/specialties/social-work/patient/${patientId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),
};
