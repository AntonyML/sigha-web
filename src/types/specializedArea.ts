/**
 * Specialized Area Types
 *
 * Tipos e interfaces para el manejo de áreas especializadas del hogar de ancianos.
 * Incluye interfaces para especialidades médicas, capacidad y asignación de pacientes.
 */

/**
 * Estado de un área especializada
 */
export enum SpecializedAreaStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

/**
 * Tipo de especialidad médica
 */
export enum MedicalSpecialty {
  GERIATRICS = 'geriatrics',
  CARDIOLOGY = 'cardiology',
  NEUROLOGY = 'neurology',
  PSYCHIATRY = 'psychiatry',
  PHYSIOTHERAPY = 'physiotherapy',
  NUTRITION = 'nutrition',
  DENTISTRY = 'dentistry',
  OPHTHALMOLOGY = 'ophthalmology',
  DERMATOLOGY = 'dermatology',
  GENERAL_MEDICINE = 'general_medicine'
}

/**
 * Nivel de cuidado requerido
 */
export enum CareLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  INTENSIVE = 'intensive',
  CRITICAL = 'critical'
}

/**
 * Interface principal del área especializada
 */
export interface SpecializedArea {
  /** ID único del área especializada */
  id: number;

  /** Nombre del área */
  name: string;

  /** Descripción del área */
  description?: string;

  /** Especialidad médica */
  specialty: MedicalSpecialty;

  /** Nivel de cuidado que proporciona */
  care_level: CareLevel;

  /** Capacidad máxima de pacientes */
  max_capacity: number;

  /** Número actual de pacientes */
  current_occupancy: number;

  /** Ubicación física del área */
  location?: string;

  /** Estado del área */
  status: SpecializedAreaStatus;

  /** ID del coordinador/responsable del área */
  coordinator_id?: number;

  /** Equipo médico asignado (IDs de profesionales) */
  assigned_staff?: number[];

  /** Equipamiento disponible */
  equipment?: string[];

  /** Notas adicionales */
  notes?: string;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Interface para crear un nueva área especializada
 */
export interface CreateSpecializedAreaData {
  /** Nombre del área (requerido) */
  name: string;

  /** Descripción del área */
  description?: string;

  /** Especialidad médica (requerido) */
  specialty: MedicalSpecialty;

  /** Nivel de cuidado (requerido) */
  care_level: CareLevel;

  /** Capacidad máxima de pacientes (requerido) */
  max_capacity: number;

  /** Ubicación física del área */
  location?: string;

  /** Estado inicial (opcional, por defecto ACTIVE) */
  status?: SpecializedAreaStatus;

  /** ID del coordinador/responsable */
  coordinator_id?: number;

  /** Equipo médico asignado */
  assigned_staff?: number[];

  /** Equipamiento disponible */
  equipment?: string[];

  /** Notas adicionales */
  notes?: string;
}

/**
 * Interface para actualizar un área especializada existente
 */
export interface UpdateSpecializedAreaData {
  /** Nombre del área */
  name?: string;

  /** Descripción del área */
  description?: string;

  /** Especialidad médica */
  specialty?: MedicalSpecialty;

  /** Nivel de cuidado */
  care_level?: CareLevel;

  /** Capacidad máxima de pacientes */
  max_capacity?: number;

  /** Ubicación física del área */
  location?: string;

  /** Estado del área */
  status?: SpecializedAreaStatus;

  /** ID del coordinador/responsable */
  coordinator_id?: number;

  /** Equipo médico asignado */
  assigned_staff?: number[];

  /** Equipamiento disponible */
  equipment?: string[];

  /** Notas adicionales */
  notes?: string;
}

/**
 * Parámetros de búsqueda para áreas especializadas
 */
export interface SpecializedAreaSearchParams {
  /** Especialidad médica */
  specialty?: MedicalSpecialty;

  /** Nivel de cuidado */
  care_level?: CareLevel;

  /** Estado del área */
  status?: SpecializedAreaStatus;

  /** ID del coordinador */
  coordinator_id?: number;

  /** Búsqueda por nombre (parcial) */
  name_search?: string;

  /** Solo áreas con capacidad disponible */
  available_only?: boolean;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'name' | 'specialty' | 'care_level' | 'current_occupancy' | 'created_at';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para áreas especializadas
 */
export interface SpecializedAreaApiResponse {
  /** Datos de las áreas especializadas */
  data: SpecializedArea[];

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
 * Respuesta de la API para un área especializada individual
 */
export interface SpecializedAreaSingleApiResponse {
  /** Datos del área especializada */
  data: SpecializedArea;
}

/**
 * Interface para estadísticas de ocupación del área
 */
export interface AreaOccupancyStats {
  /** ID del área */
  area_id: number;

  /** Nombre del área */
  area_name: string;

  /** Capacidad máxima */
  max_capacity: number;

  /** Ocupación actual */
  current_occupancy: number;

  /** Porcentaje de ocupación */
  occupancy_percentage: number;

  /** Pacientes por nivel de cuidado */
  patients_by_care_level: Record<CareLevel, number>;

  /** Estado del área */
  status: SpecializedAreaStatus;
}

/**
 * Interface para asignación de paciente a área
 */
export interface PatientAreaAssignment {
  /** ID de la asignación */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del área especializada */
  area_id: number;

  /** Fecha de asignación */
  assigned_at: string;

  /** Fecha de salida (si aplica) */
  discharged_at?: string;

  /** Motivo de la asignación */
  assignment_reason?: string;

  /** Notas adicionales */
  notes?: string;

  /** ID del profesional que asignó */
  assigned_by: number;

  /** Estado de la asignación */
  status: 'active' | 'transferred' | 'discharged';
}

/**
 * Interface para crear asignación de paciente
 */
export interface CreatePatientAreaAssignmentData {
  /** ID del paciente */
  patient_id: number;

  /** ID del área especializada */
  area_id: number;

  /** Motivo de la asignación */
  assignment_reason?: string;

  /** Notas adicionales */
  notes?: string;

  /** ID del profesional que asigna */
  assigned_by: number;
}

/**
 * Constantes para etiquetas de especialidades
 */
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
  [MedicalSpecialty.GENERAL_MEDICINE]: 'Medicina General'
};

/**
 * Constantes para etiquetas de niveles de cuidado
 */
export const CARE_LEVEL_LABELS: Record<CareLevel, string> = {
  [CareLevel.BASIC]: 'Básico',
  [CareLevel.INTERMEDIATE]: 'Intermedio',
  [CareLevel.INTENSIVE]: 'Intensivo',
  [CareLevel.CRITICAL]: 'Crítico'
};

/**
 * Valores por defecto para crear área especializada
 */
export const defaultCreateSpecializedAreaData: CreateSpecializedAreaData = {
  name: '',
  specialty: MedicalSpecialty.GERIATRICS,
  care_level: CareLevel.BASIC,
  max_capacity: 10,
  status: SpecializedAreaStatus.ACTIVE,
  assigned_staff: [],
  equipment: []
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultSpecializedAreaSearchParams: SpecializedAreaSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'name',
  sort_order: 'asc',
  available_only: false
};