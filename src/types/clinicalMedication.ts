/**
 * Clinical Medication Types
 *
 * Tipos e interfaces para el manejo de medicamentos clínicos de pacientes.
 * Incluye interfaces para prescripciones, dosificación y administración de medicamentos.
 */

/**
 * Estado de una prescripción de medicamento
 */
export const MedicationStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;
export type MedicationStatus = typeof MedicationStatus[keyof typeof MedicationStatus];

/**
 * Frecuencia de administración del medicamento
 */
export const MedicationFrequency = {
  ONCE_DAILY: 'once_daily',
  TWICE_DAILY: 'twice_daily',
  THREE_TIMES_DAILY: 'three_times_daily',
  FOUR_TIMES_DAILY: 'four_times_daily',
  EVERY_4_HOURS: 'every_4_hours',
  EVERY_6_HOURS: 'every_6_hours',
  EVERY_8_HOURS: 'every_8_hours',
  EVERY_12_HOURS: 'every_12_hours',
  AS_NEEDED: 'as_needed',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const;
export type MedicationFrequency = typeof MedicationFrequency[keyof typeof MedicationFrequency];

/**
 * Vía de administración del medicamento
 */
export const MedicationRoute = {
  ORAL: 'oral',
  INTRAVENOUS: 'intravenous',
  INTRAMUSCULAR: 'intramuscular',
  SUBCUTANEOUS: 'subcutaneous',
  TOPICAL: 'topical',
  INHALATION: 'inhalation',
  RECTAL: 'rectal',
  OPHTHALMIC: 'ophthalmic',
  OTIC: 'otic',
  NASAL: 'nasal'
} as const;
export type MedicationRoute = typeof MedicationRoute[keyof typeof MedicationRoute];

/**
 * Unidad de dosificación
 */
export const DosageUnit = {
  MG: 'mg',
  ML: 'ml',
  MCG: 'mcg',
  IU: 'iu',
  TABLETS: 'tablets',
  CAPSULES: 'capsules',
  DROPS: 'drops',
  UNITS: 'units'
} as const;
export type DosageUnit = typeof DosageUnit[keyof typeof DosageUnit];

/**
 * Interface principal del medicamento clínico
 */
export interface ClinicalMedication {
  /** ID único del medicamento clínico */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del médico que prescribe */
  prescribed_by: number;

  /** Nombre del medicamento */
  medication_name: string;

  /** Dosis del medicamento */
  dosage: number;

  /** Unidad de dosificación */
  dosage_unit: DosageUnit;

  /** Frecuencia de administración */
  frequency: MedicationFrequency;

  /** Vía de administración */
  route: MedicationRoute;

  /** Duración del tratamiento en días */
  duration_days?: number;

  /** Fecha de inicio del tratamiento */
  start_date: string;

  /** Fecha de fin del tratamiento (calculada o especificada) */
  end_date?: string;

  /** Indicaciones para el paciente */
  instructions?: string;

  /** Notas adicionales del médico */
  notes?: string;

  /** Estado de la prescripción */
  status: MedicationStatus;

  /** Fecha de suspensión/cancelación */
  discontinued_date?: string;

  /** Razón de suspensión/cancelación */
  discontinuation_reason?: string;

  /** ID del profesional que suspendió */
  discontinued_by?: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Interface para crear una nueva prescripción de medicamento
 */
export interface CreateClinicalMedicationData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** ID del médico que prescribe (requerido) */
  prescribed_by: number;

  /** Nombre del medicamento (requerido) */
  medication_name: string;

  /** Dosis del medicamento (requerido) */
  dosage: number;

  /** Unidad de dosificación (requerido) */
  dosage_unit: DosageUnit;

  /** Frecuencia de administración (requerido) */
  frequency: MedicationFrequency;

  /** Vía de administración (requerido) */
  route: MedicationRoute;

  /** Duración del tratamiento en días */
  duration_days?: number;

  /** Fecha de inicio (opcional, por defecto hoy) */
  start_date?: string;

  /** Indicaciones para el paciente */
  instructions?: string;

  /** Notas adicionales del médico */
  notes?: string;

  /** Estado inicial (opcional, por defecto ACTIVE) */
  status?: MedicationStatus;
}

/**
 * Interface para actualizar una prescripción de medicamento
 */
export interface UpdateClinicalMedicationData {
  /** Nombre del medicamento */
  medication_name?: string;

  /** Dosis del medicamento */
  dosage?: number;

  /** Unidad de dosificación */
  dosage_unit?: DosageUnit;

  /** Frecuencia de administración */
  frequency?: MedicationFrequency;

  /** Vía de administración */
  route?: MedicationRoute;

  /** Duración del tratamiento en días */
  duration_days?: number;

  /** Fecha de inicio del tratamiento */
  start_date?: string;

  /** Fecha de fin del tratamiento */
  end_date?: string;

  /** Indicaciones para el paciente */
  instructions?: string;

  /** Notas adicionales del médico */
  notes?: string;

  /** Estado de la prescripción */
  status?: MedicationStatus;

  /** Fecha de suspensión/cancelación */
  discontinued_date?: string;

  /** Razón de suspensión/cancelación */
  discontinuation_reason?: string;

  /** ID del profesional que suspendió */
  discontinued_by?: number;
}

/**
 * Parámetros de búsqueda para medicamentos clínicos
 */
export interface ClinicalMedicationSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** ID del médico que prescribe */
  prescribed_by?: number;

  /** Estado de la prescripción */
  status?: MedicationStatus;

  /** Nombre del medicamento (búsqueda parcial) */
  medication_name?: string;

  /** Frecuencia de administración */
  frequency?: MedicationFrequency;

  /** Vía de administración */
  route?: MedicationRoute;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Solo medicamentos activos */
  active_only?: boolean;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'start_date' | 'created_at' | 'medication_name' | 'status';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para medicamentos clínicos
 */
export interface ClinicalMedicationApiResponse {
  /** Datos de los medicamentos clínicos */
  data: ClinicalMedication[];

  /** Total de registros encontrados */
  total: number;

  /** Página actual */
  page: number;

  /** Límite de registros por página */
  limit: number;

  /** Total de páginas */
  total_pages: number;
}

/**
 * Respuesta de la API para un medicamento clínico individual
 */
export interface ClinicalMedicationSingleApiResponse {
  /** Datos del medicamento clínico */
  data: ClinicalMedication;
}

/**
 * Interface para registro de administración de medicamento
 */
export interface MedicationAdministration {
  /** ID del registro de administración */
  id: number;

  /** ID del medicamento clínico */
  clinical_medication_id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del profesional que administra */
  administered_by: number;

  /** Fecha y hora de administración */
  administered_at: string;

  /** Dosis administrada */
  administered_dosage: number;

  /** Unidad de la dosis administrada */
  administered_unit: DosageUnit;

  /** Notas sobre la administración */
  administration_notes?: string;

  /** Estado de la administración */
  status: 'administered' | 'refused' | 'missed' | 'delayed';
}

/**
 * Interface para crear registro de administración
 */
export interface CreateMedicationAdministrationData {
  /** ID del medicamento clínico */
  clinical_medication_id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del profesional que administra */
  administered_by: number;

  /** Fecha y hora de administración */
  administered_at: string;

  /** Dosis administrada */
  administered_dosage: number;

  /** Unidad de la dosis administrada */
  administered_unit: DosageUnit;

  /** Notas sobre la administración */
  administration_notes?: string;

  /** Estado de la administración */
  status: 'administered' | 'refused' | 'missed' | 'delayed';
}

/**
 * Constantes para frecuencias de medicación
 */
export const MEDICATION_FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  [MedicationFrequency.ONCE_DAILY]: 'Una vez al día',
  [MedicationFrequency.TWICE_DAILY]: 'Dos veces al día',
  [MedicationFrequency.THREE_TIMES_DAILY]: 'Tres veces al día',
  [MedicationFrequency.FOUR_TIMES_DAILY]: 'Cuatro veces al día',
  [MedicationFrequency.EVERY_4_HOURS]: 'Cada 4 horas',
  [MedicationFrequency.EVERY_6_HOURS]: 'Cada 6 horas',
  [MedicationFrequency.EVERY_8_HOURS]: 'Cada 8 horas',
  [MedicationFrequency.EVERY_12_HOURS]: 'Cada 12 horas',
  [MedicationFrequency.AS_NEEDED]: 'Según sea necesario',
  [MedicationFrequency.WEEKLY]: 'Semanalmente',
  [MedicationFrequency.MONTHLY]: 'Mensualmente'
};

/**
 * Constantes para vías de administración
 */
export const MEDICATION_ROUTE_LABELS: Record<MedicationRoute, string> = {
  [MedicationRoute.ORAL]: 'Oral',
  [MedicationRoute.INTRAVENOUS]: 'Intravenosa',
  [MedicationRoute.INTRAMUSCULAR]: 'Intramuscular',
  [MedicationRoute.SUBCUTANEOUS]: 'Subcutánea',
  [MedicationRoute.TOPICAL]: 'Tópica',
  [MedicationRoute.INHALATION]: 'Inhalación',
  [MedicationRoute.RECTAL]: 'Rectal',
  [MedicationRoute.OPHTHALMIC]: 'Oftálmica',
  [MedicationRoute.OTIC]: 'Ótica',
  [MedicationRoute.NASAL]: 'Nasal'
};

/**
 * Valores por defecto para crear medicamento clínico
 */
export const defaultCreateClinicalMedicationData: CreateClinicalMedicationData = {
  patient_id: 0,
  prescribed_by: 0,
  medication_name: '',
  dosage: 0,
  dosage_unit: DosageUnit.MG,
  frequency: MedicationFrequency.ONCE_DAILY,
  route: MedicationRoute.ORAL,
  status: MedicationStatus.ACTIVE,
  instructions: '',
  notes: ''
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultClinicalMedicationSearchParams: ClinicalMedicationSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'start_date',
  sort_order: 'desc',
  active_only: true
};