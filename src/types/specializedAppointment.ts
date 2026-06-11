/**
 * Specialized Appointment Types
 *
 * Tipos e interfaces para el manejo de citas especializadas.
 * Incluye interfaces para agendamiento, estados y gestión de citas médicas.
 */

/**
 * Estado de una cita especializada
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

/**
 * Tipo de cita especializada
 */
export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  PROCEDURE = 'procedure',
  EMERGENCY = 'emergency',
  SPECIALIST_REFERRAL = 'specialist_referral',
  THERAPY_SESSION = 'therapy_session',
  DIAGNOSTIC_TEST = 'diagnostic_test'
}

/**
 * Prioridad de la cita
 */
export enum AppointmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Interface principal de la cita especializada
 */
export interface SpecializedAppointment {
  /** ID único de la cita */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del especialista/profesional */
  specialist_id: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de cita */
  appointment_type: AppointmentType;

  /** Estado de la cita */
  status: AppointmentStatus;

  /** Prioridad de la cita */
  priority: AppointmentPriority;

  /** Fecha y hora programada */
  scheduled_date: string;

  /** Duración estimada en minutos */
  duration_minutes: number;

  /** Fecha y hora de finalización estimada */
  scheduled_end_date?: string;

  /** Motivo de la cita */
  reason: string;

  /** Notas adicionales */
  notes?: string;

  /** Síntomas o condición actual */
  symptoms?: string;

  /** ID de la cita anterior (para seguimientos) */
  previous_appointment_id?: number;

  /** ID del usuario que programó la cita */
  scheduled_by: number;

  /** Fecha y hora de creación */
  created_at: string;

  /** Fecha y hora de última actualización */
  updated_at: string;

  /** ID del usuario que actualizó por última vez */
  updated_by?: number;

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Notas del especialista después de la cita */
  specialist_notes?: string;

  /** Tratamiento o recomendaciones */
  treatment_plan?: string;
}

/**
 * Interface para crear una nueva cita especializada
 */
export interface CreateSpecializedAppointmentData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** ID del especialista/profesional (requerido) */
  specialist_id: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de cita (requerido) */
  appointment_type: AppointmentType;

  /** Estado inicial (opcional, por defecto SCHEDULED) */
  status?: AppointmentStatus;

  /** Prioridad (opcional, por defecto NORMAL) */
  priority?: AppointmentPriority;

  /** Fecha y hora programada (requerido) */
  scheduled_date: string;

  /** Duración estimada en minutos (requerido) */
  duration_minutes: number;

  /** Motivo de la cita (requerido) */
  reason: string;

  /** Notas adicionales */
  notes?: string;

  /** Síntomas o condición actual */
  symptoms?: string;

  /** ID de la cita anterior */
  previous_appointment_id?: number;

  /** ID del usuario que programa (requerido) */
  scheduled_by: number;
}

/**
 * Interface para actualizar una cita especializada existente
 */
export interface UpdateSpecializedAppointmentData {
  /** ID del especialista/profesional */
  specialist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de cita */
  appointment_type?: AppointmentType;

  /** Estado de la cita */
  status?: AppointmentStatus;

  /** Prioridad de la cita */
  priority?: AppointmentPriority;

  /** Fecha y hora programada */
  scheduled_date?: string;

  /** Duración estimada en minutos */
  duration_minutes?: number;

  /** Motivo de la cita */
  reason?: string;

  /** Notas adicionales */
  notes?: string;

  /** Síntomas o condición actual */
  symptoms?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;

  /** Fecha y hora real de inicio */
  actual_start_date?: string;

  /** Fecha y hora real de finalización */
  actual_end_date?: string;

  /** Notas del especialista */
  specialist_notes?: string;

  /** Tratamiento o recomendaciones */
  treatment_plan?: string;
}

/**
 * Parámetros de búsqueda para citas especializadas
 */
export interface SpecializedAppointmentSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** ID del especialista */
  specialist_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de cita */
  appointment_type?: AppointmentType;

  /** Estado de la cita */
  status?: AppointmentStatus;

  /** Prioridad de la cita */
  priority?: AppointmentPriority;

  /** ID del usuario que programó */
  scheduled_by?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Solo citas futuras */
  upcoming_only?: boolean;

  /** Solo citas del día actual */
  today_only?: boolean;

  /** Búsqueda por texto en motivo o notas */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'scheduled_date' | 'created_at' | 'priority' | 'status' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para citas especializadas
 */
export interface SpecializedAppointmentApiResponse {
  /** Datos de las citas especializadas */
  data: SpecializedAppointment[];

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
 * Respuesta de la API para una cita especializada individual
 */
export interface SpecializedAppointmentSingleApiResponse {
  /** Datos de la cita especializada */
  data: SpecializedAppointment;
}

/**
 * Interface para reagendar una cita
 */
export interface RescheduleAppointmentData {
  /** Nueva fecha y hora programada */
  new_scheduled_date: string;

  /** Nueva duración en minutos */
  new_duration_minutes?: number;

  /** Razón del reagendamiento */
  reschedule_reason: string;

  /** Notas adicionales */
  notes?: string;

  /** ID del usuario que reagenda */
  rescheduled_by: number;
}

/**
 * Interface para cancelar una cita
 */
export interface CancelAppointmentData {
  /** Razón de la cancelación */
  cancellation_reason: string;

  /** Notas adicionales */
  notes?: string;

  /** ID del usuario que cancela */
  cancelled_by: number;

  /** Reagendar automáticamente */
  auto_reschedule?: boolean;

  /** Nueva fecha sugerida para reagendamiento */
  suggested_new_date?: string;
}

/**
 * Interface para completar una cita
 */
export interface CompleteAppointmentData {
  /** Fecha y hora real de inicio */
  actual_start_date: string;

  /** Fecha y hora real de finalización */
  actual_end_date: string;

  /** Notas del especialista */
  specialist_notes: string;

  /** Tratamiento o recomendaciones */
  treatment_plan?: string;

  /** Próxima cita sugerida */
  next_appointment_suggested?: string;

  /** ID del usuario que completa */
  completed_by: number;
}

/**
 * Estadísticas de citas por período
 */
export interface AppointmentStats {
  /** Total de citas en el período */
  total_appointments: number;

  /** Citas por estado */
  appointments_by_status: Record<AppointmentStatus, number>;

  /** Citas por tipo */
  appointments_by_type: Record<AppointmentType, number>;

  /** Citas por especialista */
  appointments_by_specialist: Record<number, number>;

  /** Tasa de asistencia (completed / (completed + no_show)) */
  attendance_rate: number;

  /** Promedio de duración de citas */
  average_duration: number;

  /** Citas canceladas */
  cancelled_appointments: number;

  /** Citas reagendadas */
  rescheduled_appointments: number;
}

/**
 * Constantes para etiquetas de tipos de cita
 */
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  [AppointmentType.CONSULTATION]: 'Consulta',
  [AppointmentType.FOLLOW_UP]: 'Seguimiento',
  [AppointmentType.PROCEDURE]: 'Procedimiento',
  [AppointmentType.EMERGENCY]: 'Emergencia',
  [AppointmentType.SPECIALIST_REFERRAL]: 'Derivación a especialista',
  [AppointmentType.THERAPY_SESSION]: 'Sesión de terapia',
  [AppointmentType.DIAGNOSTIC_TEST]: 'Prueba diagnóstica'
};

/**
 * Constantes para etiquetas de estados de cita
 */
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.IN_PROGRESS]: 'En progreso',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No asistió',
  [AppointmentStatus.RESCHEDULED]: 'Reagendada'
};

/**
 * Valores por defecto para crear cita especializada
 */
export const defaultCreateSpecializedAppointmentData: CreateSpecializedAppointmentData = {
  patient_id: 0,
  specialist_id: 0,
  appointment_type: AppointmentType.CONSULTATION,
  status: AppointmentStatus.SCHEDULED,
  priority: AppointmentPriority.NORMAL,
  scheduled_date: '',
  duration_minutes: 30,
  reason: '',
  scheduled_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultSpecializedAppointmentSearchParams: SpecializedAppointmentSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'scheduled_date',
  sort_order: 'asc',
  upcoming_only: true
};

// ---- Backend API types ----
export enum AppointmentTypeApi {
  CHECKUP = 'checkup',
  EVALUATION = 'evaluation',
  THERAPY = 'therapy',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

export enum AppointmentPriorityApi {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AppointmentStatusApi {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export interface SpecializedAppointmentApi {
  id: number;
  saAppointmentDate: string;
  saAppointmentType?: AppointmentTypeApi;
  saPriority?: AppointmentPriorityApi;
  saStatus?: AppointmentStatusApi;
  saNotes?: string;
  saObservations?: string;
  saDurationMinutes?: number;
  saNextAppointment?: string;
  idArea: number;
  idPatient: number;
  idStaff: number;
}

export interface CreateSpecializedAppointmentDto {
  saAppointmentDate: string;
  saAppointmentType?: AppointmentTypeApi;
  saPriority?: AppointmentPriorityApi;
  saStatus?: AppointmentStatusApi;
  saNotes?: string;
  saObservations?: string;
  saDurationMinutes?: number;
  saNextAppointment?: string;
  idArea: number;
  idPatient: number;
  idStaff: number;
}

export interface UpdateSpecializedAppointmentDto {
  saAppointmentDate?: string;
  saAppointmentType?: AppointmentTypeApi;
  saPriority?: AppointmentPriorityApi;
  saStatus?: AppointmentStatusApi;
  saNotes?: string;
  saObservations?: string;
  saDurationMinutes?: number;
  saNextAppointment?: string;
  idArea?: number;
  idPatient?: number;
  idStaff?: number;
}