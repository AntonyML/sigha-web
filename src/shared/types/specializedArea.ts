/**
 * Specialized Area Types
 *
 * Tipos e interfaces para el manejo de áreas especializadas.
 * Includes legacy UI enums + backend DTOs (sa_*).
 */

export const SpecializedAreaStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed',
} as const;
export type SpecializedAreaStatus = typeof SpecializedAreaStatus[keyof typeof SpecializedAreaStatus];

export const MedicalSpecialty = {
  GERIATRICS: 'geriatrics',
  CARDIOLOGY: 'cardiology',
  NEUROLOGY: 'neurology',
  PSYCHIATRY: 'psychiatry',
  PHYSIOTHERAPY: 'physiotherapy',
  NUTRITION: 'nutrition',
  DENTISTRY: 'dentistry',
  OPHTHALMOLOGY: 'ophthalmology',
  DERMATOLOGY: 'dermatology',
  GENERAL_MEDICINE: 'general_medicine',
} as const;
export type MedicalSpecialty = typeof MedicalSpecialty[keyof typeof MedicalSpecialty];

export const CareLevel = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  INTENSIVE: 'intensive',
  CRITICAL: 'critical',
} as const;
export type CareLevel = typeof CareLevel[keyof typeof CareLevel];

export interface SpecializedArea {
  id: number;
  name: string;
  description?: string;
  specialty: MedicalSpecialty;
  care_level: CareLevel;
  max_capacity: number;
  current_occupancy: number;
  location?: string;
  status: SpecializedAreaStatus;
  coordinator_id?: number;
  assigned_staff?: number[];
  equipment?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSpecializedAreaData {
  name: string;
  description?: string;
  specialty: MedicalSpecialty;
  care_level: CareLevel;
  max_capacity: number;
  location?: string;
  status?: SpecializedAreaStatus;
  coordinator_id?: number;
  assigned_staff?: number[];
  equipment?: string[];
  notes?: string;
}

export interface UpdateSpecializedAreaData {
  name?: string;
  description?: string;
  specialty?: MedicalSpecialty;
  care_level?: CareLevel;
  max_capacity?: number;
  location?: string;
  status?: SpecializedAreaStatus;
  coordinator_id?: number;
  assigned_staff?: number[];
  equipment?: string[];
  notes?: string;
}

export interface SpecializedAreaSearchParams {
  specialty?: MedicalSpecialty;
  care_level?: CareLevel;
  status?: SpecializedAreaStatus;
  coordinator_id?: number;
  name_search?: string;
  available_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'specialty' | 'care_level' | 'current_occupancy' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface SpecializedAreaApiResponse {
  data: SpecializedArea[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SpecializedAreaSingleApiResponse {
  data: SpecializedArea;
}

export interface AreaOccupancyStats {
  area_id: number;
  area_name: string;
  max_capacity: number;
  current_occupancy: number;
  occupancy_percentage: number;
  patients_by_care_level: Record<CareLevel, number>;
  status: SpecializedAreaStatus;
}

export interface PatientAreaAssignment {
  id: number;
  patient_id: number;
  area_id: number;
  assigned_at: string;
  discharged_at?: string;
  assignment_reason?: string;
  notes?: string;
  assigned_by: number;
  status: 'active' | 'transferred' | 'discharged';
}

export interface CreatePatientAreaAssignmentData {
  patient_id: number;
  area_id: number;
  assignment_reason?: string;
  notes?: string;
  assigned_by: number;
}

export const MEDICAL_SPECIALTY_LABELS: Record<MedicalSpecialty, string> = {
  [MedicalSpecialty.GERIATRICS]: 'Geriatría',
  [MedicalSpecialty.CARDIOLOGY]: 'Cardiología',
  [MedicalSpecialty.NEUROLOGY]: 'Neurología',
  [MedicalSpecialty.PSYCHIATRY]: 'Psiquiatría',
  [MedicalSpecialty.PHYSIOTHERAPY]: 'Fisioterapia',
  [MedicalSpecialty.NUTRITION]: 'Nutrición',
  [MedicalSpecialty.DENTISTRY]: 'Odontología',
  [MedicalSpecialty.OPHTHALMOLOGY]: 'Oftalmología',
  [MedicalSpecialty.DERMATOLOGY]: 'Dermatología',
  [MedicalSpecialty.GENERAL_MEDICINE]: 'Medicina General',
};

export const CARE_LEVEL_LABELS: Record<CareLevel, string> = {
  [CareLevel.BASIC]: 'Básico',
  [CareLevel.INTERMEDIATE]: 'Intermedio',
  [CareLevel.INTENSIVE]: 'Intensivo',
  [CareLevel.CRITICAL]: 'Crítico',
};

export const defaultCreateSpecializedAreaData: CreateSpecializedAreaData = {
  name: '',
  specialty: MedicalSpecialty.GERIATRICS,
  care_level: CareLevel.BASIC,
  max_capacity: 10,
  status: SpecializedAreaStatus.ACTIVE,
  assigned_staff: [],
  equipment: [],
};

export const defaultSpecializedAreaSearchParams: SpecializedAreaSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'name',
  sort_order: 'asc',
  available_only: false,
};

// ---- Backend API types ----
export const SpecializedAreaName = {
  NURSING: 'nursing',
  PHYSIOTHERAPY: 'physiotherapy',
  PSYCHOLOGY: 'psychology',
  SOCIAL_WORK: 'social_work',
  NOT_SPECIFIED: 'not specified',
} as const;
export type SpecializedAreaName = typeof SpecializedAreaName[keyof typeof SpecializedAreaName];

export interface SpecializedAreaApi {
  id: number;
  saName?: SpecializedAreaName;
  saDescription?: string;
  saContactEmail?: string;
  saContactPhone?: string;
  saIsActive?: boolean;
  idManager?: number;
}

export interface CreateSpecializedAreaDto {
  saName?: SpecializedAreaName;
  saDescription?: string;
  saContactEmail?: string;
  saContactPhone?: string;
  saIsActive?: boolean;
  idManager?: number;
}

export interface UpdateSpecializedAreaDto {
  saName?: SpecializedAreaName;
  saDescription?: string;
  saContactEmail?: string;
  saContactPhone?: string;
  saIsActive?: boolean;
  idManager?: number;
}
