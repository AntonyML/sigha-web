import { httpClient } from '@/infrastructure/api/httpClient';

export type AdministrationRoute =
  | 'oral'
  | 'sublingual'
  | 'intramuscular'
  | 'intravenous'
  | 'subcutaneous'
  | 'topical'
  | 'inhalation'
  | 'ophthalmic'
  | 'otic'
  | 'nasal'
  | 'rectal'
  | 'other';

export type PrescriptionStatus = 'active' | 'completed' | 'suspended' | 'cancelled';
export type AdministrationStatus = 'scheduled' | 'administered' | 'omitted' | 'refused';

export interface MedicationCatalogItem {
  id: number;
  code?: string;
  name: string;
  genericName?: string;
  concentration?: string;
  presentation?: string;
  route: AdministrationRoute;
  isControlled: boolean;
  isActive: boolean;
}

export interface MedicationPrescriptionItem {
  id: number;
  idOlderAdult: number;
  idMedication: number;
  dose: string;
  route: AdministrationRoute;
  frequency: string;
  scheduleTimes?: string[];
  startDate: string;
  endDate?: string;
  indication?: string;
  status: PrescriptionStatus;
  medication?: MedicationCatalogItem;
}

export interface KardexAdministrationSlot {
  idSlot?: number;
  prescriptionId: number;
  olderAdultId: number;
  medicationName: string;
  dose: string;
  route: AdministrationRoute;
  scheduledDate: string;
  scheduledTime: string;
  status: AdministrationStatus;
  administeredAt?: string;
  administeredBy?: number;
  administeredByName?: string;
  notes?: string;
}

export interface CreatePrescriptionDto {
  idOlderAdult: number;
  idMedication: number;
  prescribedBy?: number;
  dose: string;
  route?: AdministrationRoute;
  frequency: string;
  scheduleTimes?: string[];
  startDate?: string;
  endDate?: string;
  indication?: string;
}

export interface RecordAdministrationDto {
  idSlot?: number;
  prescriptionId: number;
  olderAdultId: number;
  scheduledDate: string;
  scheduledTime: string;
  status: AdministrationStatus;
  notes?: string;
  administeredBy: number;
}

export const pharmacyService = {
  getMedications: (search?: string, activeOnly: boolean = true): Promise<MedicationCatalogItem[]> =>
    httpClient
      .get<{ message?: string; data?: MedicationCatalogItem[] }>('/pharmacy/medications', {
        params: { search, activeOnly: activeOnly ? 'true' : 'false' },
      })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  createMedication: (payload: Partial<MedicationCatalogItem>): Promise<MedicationCatalogItem> =>
    httpClient
      .post<{ message?: string; data?: MedicationCatalogItem }>('/pharmacy/medications', payload)
      .then((r) => r.data?.data ?? (r.data as unknown as MedicationCatalogItem)),

  getPrescriptionsByPatient: (patientId: number, activeOnly: boolean = true): Promise<MedicationPrescriptionItem[]> =>
    httpClient
      .get<{ message?: string; data?: MedicationPrescriptionItem[] }>(`/pharmacy/prescriptions/patient/${patientId}`, {
        params: { activeOnly: activeOnly ? 'true' : 'false' },
      })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  createPrescription: (payload: CreatePrescriptionDto): Promise<MedicationPrescriptionItem> =>
    httpClient
      .post<{ message?: string; data?: MedicationPrescriptionItem }>('/pharmacy/prescriptions', payload)
      .then((r) => r.data?.data ?? (r.data as unknown as MedicationPrescriptionItem)),

  getDailyKardex: (date: string, olderAdultId?: number): Promise<KardexAdministrationSlot[]> =>
    httpClient
      .get<{ message?: string; data?: KardexAdministrationSlot[] }>('/pharmacy/kardex/daily', {
        params: { date, olderAdultId },
      })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  recordAdministration: (payload: RecordAdministrationDto): Promise<unknown> =>
    httpClient
      .post('/pharmacy/kardex/administrations', payload)
      .then((r) => r.data),
};
