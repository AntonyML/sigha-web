/**
 * Physiotherapy Types
 *
 * Tipos e interfaces para el manejo de sesiones de fisioterapia.
 * Incluye interfaces para terapias, ejercicios y seguimiento de progreso.
 */

/**
 * Estado de una sesión de fisioterapia
 */
export enum PhysiotherapySessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  POSTPONED = 'postponed'
}

/**
 * Tipo de terapia de fisioterapia
 */
export enum PhysiotherapyType {
  MANUAL_THERAPY = 'manual_therapy',
  EXERCISE_THERAPY = 'exercise_therapy',
  ELECTROTHERAPY = 'electrotherapy',
  ULTRASOUND = 'ultrasound',
  HEAT_COLD_THERAPY = 'heat_cold_therapy',
  MASSAGE = 'massage',
  STRETCHING = 'stretching',
  STRENGTH_TRAINING = 'strength_training',
  BALANCE_TRAINING = 'balance_training',
  GAIT_TRAINING = 'gait_training'
}

/**
 * Área del cuerpo tratada
 */
export enum BodyArea {
  HEAD_NECK = 'head_neck',
  UPPER_LIMBS = 'upper_limbs',
  LOWER_LIMBS = 'lower_limbs',
  TRUNK = 'trunk',
  BACK = 'back',
  JOINTS = 'joints',
  MUSCLES = 'muscles',
  GENERAL = 'general'
}

/**
 * Nivel de dolor (escala 0-10)
 */
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Interface principal de la sesión de fisioterapia
 */
export interface PhysiotherapySession {
  /** ID único de la sesión */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del fisioterapeuta */
  therapist_id: number;

  /** ID del área especializada (opcional) */
  specialized_area_id?: number;

  /** Tipo de terapia */
  therapy_type: PhysiotherapyType;

  /** Área del cuerpo tratada */
  body_area: BodyArea;

  /** Estado de la sesión */
  status: PhysiotherapySessionStatus;

  /** Fecha y hora programada */
  scheduled_date: string;

  /** Duración programada en minutos */
  scheduled_duration: number;

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Duración real en minutos */
  actual_duration?: number;

  /** Objetivos de la sesión */
  objectives: string;

  /** Técnicas utilizadas */
  techniques_used?: string[];

  /** Nivel de dolor inicial (0-10) */
  initial_pain_level?: PainLevel;

  /** Nivel de dolor final (0-10) */
  final_pain_level?: PainLevel;

  /** Observaciones del fisioterapeuta */
  therapist_notes?: string;

  /** Progreso observado */
  progress_notes?: string;

  /** Recomendaciones para el paciente */
  patient_recommendations?: string;

  /** Ejercicios para casa */
  home_exercises?: string;

  /** Próxima sesión sugerida */
  next_session_date?: string;

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
 * Interface para crear una nueva sesión de fisioterapia
 */
export interface CreatePhysiotherapySessionData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** ID del fisioterapeuta (requerido) */
  therapist_id: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de terapia (requerido) */
  therapy_type: PhysiotherapyType;

  /** Área del cuerpo tratada (requerido) */
  body_area: BodyArea;

  /** Estado inicial (opcional, por defecto SCHEDULED) */
  status?: PhysiotherapySessionStatus;

  /** Fecha y hora programada (requerido) */
  scheduled_date: string;

  /** Duración programada en minutos (requerido) */
  scheduled_duration: number;

  /** Objetivos de la sesión (requerido) */
  objectives: string;

  /** Técnicas que se utilizarán */
  techniques_used?: PhysiotherapyType[];

  /** ID del usuario que programa (requerido) */
  scheduled_by: number;
}

/**
 * Interface para actualizar una sesión de fisioterapia existente
 */
export interface UpdatePhysiotherapySessionData {
  /** ID del fisioterapeuta */
  therapist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de terapia */
  therapy_type?: PhysiotherapyType;

  /** Área del cuerpo tratada */
  body_area?: BodyArea;

  /** Estado de la sesión */
  status?: PhysiotherapySessionStatus;

  /** Fecha y hora programada */
  scheduled_date?: string;

  /** Duración programada en minutos */
  scheduled_duration?: number;

  /** Objetivos de la sesión */
  objectives?: string;

  /** Técnicas utilizadas */
  techniques_used?: PhysiotherapyType[];

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Duración real en minutos */
  actual_duration?: number;

  /** Nivel de dolor inicial */
  initial_pain_level?: PainLevel;

  /** Nivel de dolor final */
  final_pain_level?: PainLevel;

  /** Observaciones del fisioterapeuta */
  therapist_notes?: string;

  /** Progreso observado */
  progress_notes?: string;

  /** Recomendaciones para el paciente */
  patient_recommendations?: string;

  /** Ejercicios para casa */
  home_exercises?: string;

  /** Próxima sesión sugerida */
  next_session_date?: string;

  /** Motivo de cancelación/postergación */
  cancellation_reason?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Parámetros de búsqueda para sesiones de fisioterapia
 */
export interface PhysiotherapySessionSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** ID del fisioterapeuta */
  therapist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de terapia */
  therapy_type?: PhysiotherapyType;

  /** Área del cuerpo */
  body_area?: BodyArea;

  /** Estado de la sesión */
  status?: PhysiotherapySessionStatus;

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
  sort_by?: 'scheduled_date' | 'created_at' | 'status' | 'therapy_type' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para sesiones de fisioterapia
 */
export interface PhysiotherapySessionApiResponse {
  /** Datos de las sesiones de fisioterapia */
  data: PhysiotherapySession[];

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
 * Respuesta de la API para una sesión de fisioterapia individual
 */
export interface PhysiotherapySessionSingleApiResponse {
  /** Datos de la sesión de fisioterapia */
  data: PhysiotherapySession;
}

/**
 * Interface para plan de tratamiento de fisioterapia
 */
export interface PhysiotherapyTreatmentPlan {
  /** ID del plan */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del fisioterapeuta responsable */
  therapist_id: number;

  /** Diagnóstico o condición tratada */
  diagnosis: string;

  /** Objetivos generales del tratamiento */
  treatment_goals: string;

  /** Frecuencia recomendada de sesiones */
  recommended_frequency: string;

  /** Duración estimada del tratamiento */
  estimated_duration_weeks?: number;

  /** Sesiones completadas */
  completed_sessions: number;

  /** Sesiones totales planificadas */
  total_sessions_planned?: number;

  /** Estado del plan */
  status: 'active' | 'completed' | 'discontinued' | 'on_hold';

  /** Notas adicionales */
  notes?: string;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Interface para ejercicio específico
 */
export interface PhysiotherapyExercise {
  /** ID del ejercicio */
  id: number;

  /** Nombre del ejercicio */
  name: string;

  /** Descripción detallada */
  description: string;

  /** Área del cuerpo que trabaja */
  body_area: BodyArea;

  /** Dificultad del ejercicio */
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  /** Equipamiento necesario */
  equipment_needed?: string[];

  /** Repeticiones recomendadas */
  recommended_repetitions?: string;

  /** Series recomendadas */
  recommended_sets?: number;

  /** Duración aproximada en minutos */
  duration_minutes?: number;

  /** Instrucciones de seguridad */
  safety_instructions?: string;

  /** URL de video demostrativo */
  video_url?: string;
}

/**
 * Estadísticas de fisioterapia
 */
export interface PhysiotherapyStats {
  /** Total de sesiones en el período */
  total_sessions: number;

  /** Sesiones por estado */
  sessions_by_status: Record<PhysiotherapySessionStatus, number>;

  /** Sesiones por tipo de terapia */
  sessions_by_therapy: Record<PhysiotherapyType, number>;

  /** Sesiones por área del cuerpo */
  sessions_by_body_area: Record<BodyArea, number>;

  /** Tasa de asistencia */
  attendance_rate: number;

  /** Promedio de duración de sesiones */
  average_session_duration: number;

  /** Mejora promedio en niveles de dolor */
  average_pain_improvement: number;

  /** Pacientes activos en tratamiento */
  active_patients: number;
}

/**
 * Constantes para etiquetas de tipos de terapia
 */
export const PHYSIOTHERAPY_TYPE_LABELS: Record<PhysiotherapyType, string> = {
  [PhysiotherapyType.MANUAL_THERAPY]: 'Terapia Manual',
  [PhysiotherapyType.EXERCISE_THERAPY]: 'Terapia de Ejercicio',
  [PhysiotherapyType.ELECTROTHERAPY]: 'Electroterapia',
  [PhysiotherapyType.ULTRASOUND]: 'Ultrasonido',
  [PhysiotherapyType.HEAT_COLD_THERAPY]: 'Termoterapia/Crioterapia',
  [PhysiotherapyType.MASSAGE]: 'Masaje',
  [PhysiotherapyType.STRETCHING]: 'Estiramiento',
  [PhysiotherapyType.STRENGTH_TRAINING]: 'Entrenamiento de Fuerza',
  [PhysiotherapyType.BALANCE_TRAINING]: 'Entrenamiento de Equilibrio',
  [PhysiotherapyType.GAIT_TRAINING]: 'Entrenamiento de Marcha'
};

/**
 * Constantes para etiquetas de áreas del cuerpo
 */
export const BODY_AREA_LABELS: Record<BodyArea, string> = {
  [BodyArea.HEAD_NECK]: 'Cabeza/Cuello',
  [BodyArea.UPPER_LIMBS]: 'Extremidades Superiores',
  [BodyArea.LOWER_LIMBS]: 'Extremidades Inferiores',
  [BodyArea.TRUNK]: 'Tronco',
  [BodyArea.BACK]: 'Espalda',
  [BodyArea.JOINTS]: 'Articulaciones',
  [BodyArea.MUSCLES]: 'Músculos',
  [BodyArea.GENERAL]: 'General'
};

/**
 * Valores por defecto para crear sesión de fisioterapia
 */
export const defaultCreatePhysiotherapySessionData: CreatePhysiotherapySessionData = {
  patient_id: 0,
  therapist_id: 0,
  therapy_type: PhysiotherapyType.EXERCISE_THERAPY,
  body_area: BodyArea.GENERAL,
  status: PhysiotherapySessionStatus.SCHEDULED,
  scheduled_date: '',
  scheduled_duration: 45,
  objectives: '',
  scheduled_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultPhysiotherapySessionSearchParams: PhysiotherapySessionSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'scheduled_date',
  sort_order: 'asc',
  upcoming_only: true
};