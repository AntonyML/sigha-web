/**
 * Specialized Appointment Types
 *
 * Tipos e interfaces para el manejo de citas especializadas.
 * Includes legacy UI enums + backend DTOs (snake_case sa_*).
 */

export const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
} as const;
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentType = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  PROCEDURE: 'procedure',
  EMERGENCY: 'emergency',
  SPECIALIST_REFERRAL: 'specialist_referral',
  THERAPY_SESSION: 'therapy_session',
  DIAGNOSTIC_TEST: 'diagnostic_test',
} as const;
export type AppointmentType = typeof AppointmentType[keyof typeof AppointmentType];

export const AppointmentPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type AppointmentPriority = typeof AppointmentPriority[keyof typeof AppointmentPriority];

export interface SpecializedAppointment {
  id: number;
  patient_id: number;
  specialist_id: number;
  specialized_area_id?: number;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  scheduled_date: string;
  duration_minutes: number;
  scheduled_end_date?: string;
  reason: string;
  notes?: string;
  symptoms?: string;
  previous_appointment_id?: number;
  scheduled_by: number;
  created_at: string;
  updated_at: string;
  updated_by?: number;
  actual_start_date?: string;
  actual_end_date?: string;
  specialist_notes?: string;
  treatment_plan?: string;
}

export interface CreateSpecializedAppointmentData {
  patient_id: number;
  specialist_id: number;
  specialized_area_id?: number;
  appointment_type: AppointmentType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  scheduled_date: string;
  duration_minutes: number;
  reason: string;
  notes?: string;
  symptoms?: string;
  previous_appointment_id?: number;
  scheduled_by: number;
}

export interface UpdateSpecializedAppointmentData {
  specialist_id?: number;
  specialized_area_id?: number;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  scheduled_date?: string;
  duration_minutes?: number;
  reason?: string;
  notes?: string;
  symptoms?: string;
  updated_by?: number;
  actual_start_date?: string;
  actual_end_date?: string;
  specialist_notes?: string;
  treatment_plan?: string;
}

export interface SpecializedAppointmentSearchParams {
  patient_id?: number;
  specialist_id?: number;
  specialized_area_id?: number;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  scheduled_by?: number;
  date_from?: string;
  date_to?: string;
  upcoming_only?: boolean;
  today_only?: boolean;
  search_text?: string;
  page?: number;
  limit?: number;
  sort_by?: 'scheduled_date' | 'created_at' | 'priority' | 'status' | 'patient_id';
  sort_order?: 'asc' | 'desc';
}

export interface SpecializedAppointmentApiResponse {
  data: SpecializedAppointment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SpecializedAppointmentSingleApiResponse {
  data: SpecializedAppointment;
}

export interface RescheduleAppointmentData {
  new_scheduled_date: string;
  new_duration_minutes?: number;
  reschedule_reason: string;
  notes?: string;
  rescheduled_by: number;
}

export interface CancelAppointmentData {
  cancellation_reason: string;
  notes?: string;
  cancelled_by: number;
  auto_reschedule?: boolean;
  suggested_new_date?: string;
}

export interface CompleteAppointmentData {
  actual_start_date: string;
  actual_end_date: string;
  specialist_notes: string;
  treatment_plan?: string;
  next_appointment_suggested?: string;
  completed_by: number;
}

export interface AppointmentStats {
  total_appointments: number;
  appointments_by_status: Record<AppointmentStatus, number>;
  appointments_by_type: Record<AppointmentType, number>;
  appointments_by_specialist: Record<number, number>;
  attendance_rate: number;
  average_duration: number;
  cancelled_appointments: number;
  rescheduled_appointments: number;
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  [AppointmentType.CONSULTATION]: 'Consulta',
  [AppointmentType.FOLLOW_UP]: 'Seguimiento',
  [AppointmentType.PROCEDURE]: 'Procedimiento',
  [AppointmentType.EMERGENCY]: 'Emergencia',
  [AppointmentType.SPECIALIST_REFERRAL]: 'Derivación a especialista',
  [AppointmentType.THERAPY_SESSION]: 'Sesión de terapia',
  [AppointmentType.DIAGNOSTIC_TEST]: 'Prueba diagnóstica',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.IN_PROGRESS]: 'En progreso',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No asistió',
  [AppointmentStatus.RESCHEDULED]: 'Reagendada',
};

export const defaultCreateSpecializedAppointmentData: CreateSpecializedAppointmentData = {
  patient_id: 0,
  specialist_id: 0,
  appointment_type: AppointmentType.CONSULTATION,
  status: AppointmentStatus.SCHEDULED,
  priority: AppointmentPriority.NORMAL,
  scheduled_date: '',
  duration_minutes: 30,
  reason: '',
  scheduled_by: 0,
};

export const defaultSpecializedAppointmentSearchParams: SpecializedAppointmentSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'scheduled_date',
  sort_order: 'asc',
  upcoming_only: true,
};

// ---- Backend API types ----
export const AppointmentTypeApi = {
  CHECKUP: 'checkup',
  EVALUATION: 'evaluation',
  THERAPY: 'therapy',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
} as const;
export type AppointmentTypeApi = typeof AppointmentTypeApi[keyof typeof AppointmentTypeApi];

export const AppointmentPriorityApi = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type AppointmentPriorityApi = typeof AppointmentPriorityApi[keyof typeof AppointmentPriorityApi];

export const AppointmentStatusApi = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
} as const;
export type AppointmentStatusApi = typeof AppointmentStatusApi[keyof typeof AppointmentStatusApi];

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
