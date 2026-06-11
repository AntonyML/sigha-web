/**
 * Psychology Types
 *
 * Tipos e interfaces para el manejo de sesiones de psicología.
 * Incluye interfaces para sesiones psicológicas, evaluaciones y seguimiento terapéutico.
 */

/**
 * Estado de una sesión de psicología
 */
export const PsychologySessionStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  POSTPONED: 'postponed'
} as const;
export type PsychologySessionStatus = typeof PsychologySessionStatus[keyof typeof PsychologySessionStatus];

/**
 * Tipo de sesión de psicología
 */
export const PsychologySessionType = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
  FAMILY: 'family',
  COUPLES: 'couples'
} as const;
export type PsychologySessionType = typeof PsychologySessionType[keyof typeof PsychologySessionType];

/**
 * Área de especialización psicológica
 */
export const PsychologySpecialty = {
  CLINICAL_PSYCHOLOGY: 'clinical_psychology',
  COGNITIVE_BEHAVIORAL: 'cognitive_behavioral',
  PSYCHOANALYSIS: 'psychoanalysis',
  FAMILY_THERAPY: 'family_therapy',
  GERONTOLOGY: 'gerontology',
  TRAUMA_THERAPY: 'trauma_therapy',
  DEPRESSION_ANXIETY: 'depression_anxiety',
  COGNITIVE_DISORDERS: 'cognitive_disorders'
} as const;
export type PsychologySpecialty = typeof PsychologySpecialty[keyof typeof PsychologySpecialty];

/**
 * Nivel de urgencia de la sesión
 */
export const PsychologyUrgencyLevel = {
  ROUTINE: 'routine',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
} as const;
export type PsychologyUrgencyLevel = typeof PsychologyUrgencyLevel[keyof typeof PsychologyUrgencyLevel];

/**
 * Interface principal de la sesión de psicología
 */
export interface PsychologySession {
  /** ID único de la sesión */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del psicólogo */
  psychologist_id: number;

  /** ID del área especializada (opcional) */
  specialized_area_id?: number;

  /** Tipo de sesión */
  session_type: PsychologySessionType;

  /** Especialidad del psicólogo */
  specialty: PsychologySpecialty;

  /** Estado de la sesión */
  status: PsychologySessionStatus;

  /** Nivel de urgencia */
  urgency_level: PsychologyUrgencyLevel;

  /** Fecha de la sesión */
  session_date: string;

  /** Hora de inicio (formato HH:MM) */
  start_time: string;

  /** Duración en minutos (30-90) */
  duration: number;

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Duración real en minutos */
  actual_duration?: number;

  /** Objetivos de la sesión */
  objectives: string;

  /** Notas del psicólogo sobre la sesión */
  session_notes?: string;

  /** Observaciones del paciente */
  patient_observations?: string;

  /** Diagnóstico o evaluación preliminar */
  preliminary_assessment?: string;

  /** Plan de tratamiento recomendado */
  treatment_plan?: string;

  /** Próxima sesión recomendada */
  next_session_recommended?: string;

  /** Recursos recomendados */
  recommended_resources?: string[];

  /** Motivo de cancelación/postergación */
  cancellation_reason?: string;

  /** ID del usuario que programó */
  scheduled_by: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** ID del usuario que actualizó */
  updated_by?: number;
}

/**
 * Interface para crear una nueva sesión de psicología
 */
export interface CreatePsychologySessionData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** ID del psicólogo (requerido) */
  psychologist_id: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de sesión (requerido) */
  session_type: PsychologySessionType;

  /** Especialidad del psicólogo (requerido) */
  specialty: PsychologySpecialty;

  /** Nivel de urgencia (opcional, por defecto ROUTINE) */
  urgency_level?: PsychologyUrgencyLevel;

  /** Estado inicial (opcional, por defecto SCHEDULED) */
  status?: PsychologySessionStatus;

  /** Fecha de la sesión (requerido) */
  session_date: string;

  /** Hora de inicio (requerido, formato HH:MM) */
  start_time: string;

  /** Duración en minutos (requerido, 30-90) */
  duration: number;

  /** Objetivos de la sesión (requerido) */
  objectives: string;

  /** ID del usuario que programa (requerido) */
  scheduled_by: number;
}

/**
 * Interface para actualizar una sesión de psicología existente
 */
export interface UpdatePsychologySessionData {
  /** ID del psicólogo */
  psychologist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de sesión */
  session_type?: PsychologySessionType;

  /** Especialidad del psicólogo */
  specialty?: PsychologySpecialty;

  /** Nivel de urgencia */
  urgency_level?: PsychologyUrgencyLevel;

  /** Estado de la sesión */
  status?: PsychologySessionStatus;

  /** Fecha de la sesión */
  session_date?: string;

  /** Hora de inicio */
  start_time?: string;

  /** Duración en minutos */
  duration?: number;

  /** Objetivos de la sesión */
  objectives?: string;

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Duración real en minutos */
  actual_duration?: number;

  /** Notas del psicólogo */
  session_notes?: string;

  /** Observaciones del paciente */
  patient_observations?: string;

  /** Diagnóstico preliminar */
  preliminary_assessment?: string;

  /** Plan de tratamiento */
  treatment_plan?: string;

  /** Próxima sesión recomendada */
  next_session_recommended?: string;

  /** Recursos recomendados */
  recommended_resources?: PsychologySpecialty[];

  /** Motivo de cancelación/postergación */
  cancellation_reason?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Interface para completar una sesión de psicología
 */
export interface CompletePsychologySessionData {
  /** Notas de la sesión (requeridas para completar) */
  session_notes: string;

  /** Observaciones del paciente */
  patient_observations?: string;

  /** Diagnóstico o evaluación preliminar */
  preliminary_assessment?: string;

  /** Plan de tratamiento recomendado */
  treatment_plan?: string;

  /** Próxima sesión recomendada */
  next_session_recommended?: string;

  /** Recursos recomendados */
  recommended_resources?: PsychologySpecialty[];

  /** Duración real de la sesión */
  actual_duration?: number;

  /** ID del usuario que completa */
  updated_by: number;
}

/**
 * Interface para cancelar una sesión de psicología
 */
export interface CancelPsychologySessionData {
  /** Motivo de la cancelación (requerido) */
  cancellation_reason: string;

  /** ID del usuario que cancela */
  updated_by: number;
}

/**
 * Parámetros de búsqueda para sesiones de psicología
 */
export interface PsychologySessionSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** ID del psicólogo */
  psychologist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de sesión */
  session_type?: PsychologySessionType;

  /** Especialidad */
  specialty?: PsychologySpecialty;

  /** Estado de la sesión */
  status?: PsychologySessionStatus;

  /** Nivel de urgencia */
  urgency_level?: PsychologyUrgencyLevel;

  /** ID del usuario que programó */
  scheduled_by?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Solo sesiones futuras */
  upcoming_only?: boolean;

  /** Solo sesiones del día actual */
  today_only?: boolean;

  /** Búsqueda por texto en objetivos o notas */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'session_date' | 'created_at' | 'status' | 'session_type' | 'specialty' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para sesiones de psicología
 */
export interface PsychologySessionApiResponse {
  /** Datos de las sesiones de psicología */
  data: PsychologySession[];

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
 * Respuesta de la API para una sesión de psicología individual
 */
export interface PsychologySessionSingleApiResponse {
  /** Datos de la sesión de psicología */
  data: PsychologySession;
}

/**
 * Interface para evaluación psicológica
 */
export interface PsychologicalAssessment {
  /** ID de la evaluación */
  id: number;

  /** ID de la sesión relacionada */
  session_id: number;

  /** ID del paciente */
  patient_id: number;

  /** Tipo de evaluación */
  assessment_type: 'initial' | 'follow_up' | 'discharge' | 'crisis';

  /** Escalas utilizadas */
  scales_used?: string[];

  /** Resultados de las escalas */
  scale_results?: Record<string, number>;

  /** Diagnóstico principal */
  primary_diagnosis?: string;

  /** Diagnósticos secundarios */
  secondary_diagnoses?: string[];

  /** Nivel de funcionamiento */
  functioning_level?: 'high' | 'moderate' | 'low' | 'severely_impaired';

  /** Recomendaciones de tratamiento */
  treatment_recommendations: string;

  /** Medicación recomendada */
  recommended_medication?: string;

  /** Fecha de la evaluación */
  assessment_date: string;

  /** ID del psicólogo que realizó la evaluación */
  assessed_by: number;

  /** Fecha de creación */
  created_at: string;
}

/**
 * Estadísticas de psicología
 */
export interface PsychologyStats {
  /** Total de sesiones en el período */
  total_sessions: number;

  /** Sesiones por estado */
  sessions_by_status: Record<PsychologySessionStatus, number>;

  /** Sesiones por tipo */
  sessions_by_type: Record<PsychologySessionType, number>;

  /** Sesiones por especialidad */
  sessions_by_specialty: Record<PsychologySpecialty, number>;

  /** Tasa de asistencia */
  attendance_rate: number;

  /** Promedio de duración de sesiones */
  average_session_duration: number;

  /** Número de evaluaciones realizadas */
  total_assessments: number;

  /** Pacientes activos en tratamiento */
  active_patients: number;

  /** Sesiones por nivel de urgencia */
  sessions_by_urgency: Record<PsychologyUrgencyLevel, number>;
}

/**
 * Constantes para etiquetas de tipos de sesión
 */
export const PSYCHOLOGY_SESSION_TYPE_LABELS: Record<PsychologySessionType, string> = {
  [PsychologySessionType.INDIVIDUAL]: 'Individual',
  [PsychologySessionType.GROUP]: 'Grupal',
  [PsychologySessionType.FAMILY]: 'Familiar',
  [PsychologySessionType.COUPLES]: 'Parejas'
};

/**
 * Constantes para etiquetas de especialidades
 */
export const PSYCHOLOGY_SPECIALTY_LABELS: Record<PsychologySpecialty, string> = {
  [PsychologySpecialty.CLINICAL_PSYCHOLOGY]: 'Psicología Clínica',
  [PsychologySpecialty.COGNITIVE_BEHAVIORAL]: 'Terapia Cognitivo-Conductual',
  [PsychologySpecialty.PSYCHOANALYSIS]: 'Psicoanálisis',
  [PsychologySpecialty.FAMILY_THERAPY]: 'Terapia Familiar',
  [PsychologySpecialty.GERONTOLOGY]: 'Gerontología',
  [PsychologySpecialty.TRAUMA_THERAPY]: 'Terapia de Trauma',
  [PsychologySpecialty.DEPRESSION_ANXIETY]: 'Depresión y Ansiedad',
  [PsychologySpecialty.COGNITIVE_DISORDERS]: 'Trastornos Cognitivos'
};

/**
 * Constantes para etiquetas de niveles de urgencia
 */
export const PSYCHOLOGY_URGENCY_LABELS: Record<PsychologyUrgencyLevel, string> = {
  [PsychologyUrgencyLevel.ROUTINE]: 'Rutina',
  [PsychologyUrgencyLevel.URGENT]: 'Urgente',
  [PsychologyUrgencyLevel.EMERGENCY]: 'Emergencia'
};

/**
 * Valores por defecto para crear sesión de psicología
 */
export const defaultCreatePsychologySessionData: CreatePsychologySessionData = {
  patient_id: 0,
  psychologist_id: 0,
  session_type: PsychologySessionType.INDIVIDUAL,
  specialty: PsychologySpecialty.CLINICAL_PSYCHOLOGY,
  urgency_level: PsychologyUrgencyLevel.ROUTINE,
  status: PsychologySessionStatus.SCHEDULED,
  session_date: '',
  start_time: '',
  duration: 50,
  objectives: '',
  scheduled_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultPsychologySessionSearchParams: PsychologySessionSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'session_date',
  sort_order: 'asc',
  upcoming_only: true
};