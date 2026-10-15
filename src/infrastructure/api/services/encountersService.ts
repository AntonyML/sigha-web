import { httpClient } from '@/infrastructure/api/httpClient';

export type EncounterClass = 'ambulatory' | 'inpatient' | 'emergency' | 'home_care';
export type EncounterStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type EncounterType = 'nursing' | 'medical' | 'physiotherapy' | 'psychology' | 'social_work' | 'specialized';
export type NursingShift = 'morning' | 'afternoon' | 'night';

export interface ClinicalEncounterItem {
  id: number;
  idOlderAdult: number;
  idProfessional?: number;
  encounterClass: EncounterClass;
  encounterType: EncounterType;
  status: EncounterStatus;
  startTime: string;
  endTime?: string;
  chiefComplaint?: string;
  soSubjective?: string;
  soObjective?: string;
  soAssessment?: string;
  soPlan?: string;
  isSigned: boolean;
  signedAt?: string;
  signedBy?: number;
  professional?: {
    id: number;
    name?: string;
    email?: string;
  };
  addendums?: ClinicalNoteAddendumItem[];
  vitalSigns?: ClinicalVitalSignsItem[];
}

export interface ClinicalNoteAddendumItem {
  id: number;
  idEncounter: number;
  authorId: number;
  addendumText: string;
  reasonForAddendum: string;
  signedAt: string;
  author?: {
    id: number;
    name?: string;
  };
}

export interface ClinicalVitalSignsItem {
  id: number;
  idOlderAdult: number;
  idEncounter?: number;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  glycemia?: number;
  painEva?: number;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
  recordedAt: string;
  recordedBy?: number;
}

export interface NursingRoundItem {
  id: number;
  idOlderAdult: number;
  idStaff: number;
  roundDate: string;
  shift: NursingShift;
  idVitalSigns?: number;
  generalCondition?: string;
  skinIntegrity?: string;
  nutritionHydration?: string;
  elimination?: string;
  mobilityComfort?: string;
  fallRisk: string;
  notes?: string;
  createdAt: string;
  staff?: {
    id: number;
    name?: string;
  };
  vitalSigns?: ClinicalVitalSignsItem;
  olderAdult?: {
    id: number;
    oaName?: string;
    oaFLastName?: string;
  };
}

export interface CreateEncounterPayload {
  idOlderAdult: number;
  idProfessional?: number;
  encounterClass?: EncounterClass;
  encounterType: EncounterType;
  chiefComplaint?: string;
  startTime?: string;
  idAppointment?: number;
}

export interface UpdateSoapPayload {
  status?: EncounterStatus;
  endTime?: string;
  soSubjective?: string;
  soObjective?: string;
  soAssessment?: string;
  soPlan?: string;
}

export interface RecordVitalSignsPayload {
  idOlderAdult: number;
  idEncounter?: number;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  spo2?: number;
  glycemia?: number;
  painEva?: number;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
  recordedBy?: number;
}

export interface RecordNursingRoundPayload {
  idOlderAdult: number;
  idStaff: number;
  roundDate?: string;
  shift: NursingShift;
  idVitalSigns?: number;
  generalCondition?: string;
  skinIntegrity?: string;
  nutritionHydration?: string;
  elimination?: string;
  mobilityComfort?: string;
  fallRisk?: string;
  notes?: string;
}

export const encountersService = {
  createEncounter: (payload: CreateEncounterPayload): Promise<ClinicalEncounterItem> =>
    httpClient
      .post('/clinical-encounters', payload)
      .then((r) => r.data?.data ?? r.data),

  getEncounterById: (id: number): Promise<ClinicalEncounterItem> =>
    httpClient
      .get(`/clinical-encounters/${id}`)
      .then((r) => r.data?.data ?? r.data),

  getEncountersByPatient: (patientId: number): Promise<ClinicalEncounterItem[]> =>
    httpClient
      .get(`/clinical-encounters/patient/${patientId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  updateSoap: (id: number, payload: UpdateSoapPayload): Promise<ClinicalEncounterItem> =>
    httpClient
      .patch(`/clinical-encounters/${id}/soap`, payload)
      .then((r) => r.data?.data ?? r.data),

  signEncounter: (id: number, signedBy: number): Promise<ClinicalEncounterItem> =>
    httpClient
      .post(`/clinical-encounters/${id}/sign`, { signedBy })
      .then((r) => r.data?.data ?? r.data),

  createAddendum: (
    id: number,
    payload: { authorId: number; addendumText: string; reasonForAddendum: string }
  ): Promise<ClinicalNoteAddendumItem> =>
    httpClient
      .post(`/clinical-encounters/${id}/addendums`, payload)
      .then((r) => r.data?.data ?? r.data),

  recordVitalSigns: (payload: RecordVitalSignsPayload): Promise<ClinicalVitalSignsItem> =>
    httpClient
      .post('/vital-signs', payload)
      .then((r) => r.data?.data ?? r.data),

  getVitalSignsByPatient: (patientId: number, limit: number = 20): Promise<ClinicalVitalSignsItem[]> =>
    httpClient
      .get(`/vital-signs/patient/${patientId}`, { params: { limit } })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  getLatestVitalSigns: (patientId: number): Promise<ClinicalVitalSignsItem | null> =>
    httpClient
      .get(`/vital-signs/patient/${patientId}/latest`)
      .then((r) => r.data?.data ?? r.data),

  recordNursingRound: (payload: RecordNursingRoundPayload): Promise<NursingRoundItem> =>
    httpClient
      .post('/nursing-rounds', payload)
      .then((r) => r.data?.data ?? r.data),

  getRoundsByPatient: (patientId: number): Promise<NursingRoundItem[]> =>
    httpClient
      .get(`/nursing-rounds/patient/${patientId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  getRoundsByDate: (date: string, shift?: NursingShift): Promise<NursingRoundItem[]> =>
    httpClient
      .get(`/nursing-rounds/date/${date}`, { params: { shift } })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),
};
