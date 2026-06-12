/**
 * Clinical History Types
 *
 * Tipos e interfaces para el manejo del historial clínico de pacientes.
 * Incluye interfaces para operaciones CRUD y respuestas de API.
 */

/**
 * Estado de un historial clínico
 */
export const ClinicalHistoryStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
} as const;
export type ClinicalHistoryStatus = typeof ClinicalHistoryStatus[keyof typeof ClinicalHistoryStatus];

/**
 * Tipo de entrada en el historial clínico
 */
export const ClinicalHistoryEntryType = {
  INITIAL_ASSESSMENT: 'initial_assessment',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
  ROUTINE_CHECK: 'routine_check',
  SPECIALIST_REFERRAL: 'specialist_referral',
} as const;
export type ClinicalHistoryEntryType = typeof ClinicalHistoryEntryType[keyof typeof ClinicalHistoryEntryType];

/**
 * Interface principal del historial clínico
 */
export interface ClinicalHistory {
  /** ID único del historial clínico */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** Fecha de creación del historial */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** Estado del historial */
  status: ClinicalHistoryStatus;

  /** Notas generales del historial */
  general_notes?: string;

  /** Antecedentes médicos */
  medical_history?: string;

  /** Alergias conocidas */
  allergies?: string;

  /** Medicamentos actuales */
  current_medications?: string;

  /** Condiciones médicas crónicas */
  chronic_conditions?: string;

  /** Información de contacto de emergencia */
  emergency_contact_info?: string;

  /** Notas de evolución */
  evolution_notes?: string;

  /** ID del médico responsable */
  responsible_doctor_id?: number;

  /** Fecha del último examen */
  last_examination_date?: string;

  /** Próxima cita programada */
  next_appointment_date?: string;
}

/**
 * Interface para crear un nuevo historial clínico
 */
export interface CreateClinicalHistoryData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** Estado inicial (opcional, por defecto ACTIVE) */
  status?: ClinicalHistoryStatus;

  /** Notas generales */
  general_notes?: string;

  /** Antecedentes médicos */
  medical_history?: string;

  /** Alergias conocidas */
  allergies?: string;

  /** Medicamentos actuales */
  current_medications?: string;

  /** Condiciones médicas crónicas */
  chronic_conditions?: string;

  /** Información de contacto de emergencia */
  emergency_contact_info?: string;

  /** Notas de evolución */
  evolution_notes?: string;

  /** ID del médico responsable */
  responsible_doctor_id?: number;

  /** Fecha del último examen */
  last_examination_date?: string;

  /** Próxima cita programada */
  next_appointment_date?: string;
}

/**
 * Interface para actualizar un historial clínico existente
 */
export interface UpdateClinicalHistoryData {
  /** Estado del historial */
  status?: ClinicalHistoryStatus;

  /** Notas generales */
  general_notes?: string;

  /** Antecedentes médicos */
  medical_history?: string;

  /** Alergias conocidas */
  allergies?: string;

  /** Medicamentos actuales */
  current_medications?: string;

  /** Condiciones médicas crónicas */
  chronic_conditions?: string;

  /** Información de contacto de emergencia */
  emergency_contact_info?: string;

  /** Notas de evolución */
  evolution_notes?: string;

  /** ID del médico responsable */
  responsible_doctor_id?: number;

  /** Fecha del último examen */
  last_examination_date?: string;

  /** Próxima cita programada */
  next_appointment_date?: string;
}

/**
 * Parámetros de búsqueda para historiales clínicos
 */
export interface ClinicalHistorySearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** Estado del historial */
  status?: ClinicalHistoryStatus;

  /** ID del médico responsable */
  responsible_doctor_id?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Búsqueda por texto en notas */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'created_at' | 'updated_at' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para historiales clínicos
 */
export interface ClinicalHistoryApiResponse {
  /** Datos de los historiales clínicos */
  data: ClinicalHistory[];

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
 * Respuesta de la API para un historial clínico individual
 */
export interface ClinicalHistorySingleApiResponse {
  /** Datos del historial clínico */
  data: ClinicalHistory;
}

/**
 * Interface para entrada de historial clínico (para actualizaciones)
 */
export interface ClinicalHistoryEntry {
  /** ID de la entrada */
  id: number;

  /** ID del historial clínico */
  clinical_history_id: number;

  /** Tipo de entrada */
  entry_type: ClinicalHistoryEntryType;

  /** Fecha de la entrada */
  entry_date: string;

  /** Título/descripción breve */
  title: string;

  /** Contenido detallado */
  content: string;

  /** ID del profesional que registra */
  recorded_by: number;

  /** Notas adicionales */
  notes?: string;

  /** Archivos adjuntos (URLs o IDs) */
  attachments?: string[];
}

/**
 * Interface para crear entrada de historial clínico
 */
export interface CreateClinicalHistoryEntryData {
  /** ID del historial clínico */
  clinical_history_id: number;

  /** Tipo de entrada */
  entry_type: ClinicalHistoryEntryType;

  /** Título/descripción breve */
  title: string;

  /** Contenido detallado */
  content: string;

  /** ID del profesional que registra */
  recorded_by: number;

  /** Notas adicionales */
  notes?: string;

  /** Archivos adjuntos */
  attachments?: string[];
}

/**
 * Valores por defecto para crear historial clínico
 */
export const defaultCreateClinicalHistoryData: CreateClinicalHistoryData = {
  patient_id: 0,
  status: ClinicalHistoryStatus.ACTIVE,
  general_notes: '',
  medical_history: '',
  allergies: '',
  current_medications: '',
  chronic_conditions: '',
  emergency_contact_info: '',
  evolution_notes: ''
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultClinicalHistorySearchParams: ClinicalHistorySearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'created_at',
  sort_order: 'desc'
};