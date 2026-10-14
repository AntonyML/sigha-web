export type AppointmentStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

export type AppointmentType = 
  | 'checkup'
  | 'evaluation'
  | 'therapy'
  | 'follow_up'
  | 'emergency';

export type AppointmentPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type Mobility = 
  | 'independent'
  | 'assisted'
  | 'bedridden';

export type QualityLevel = 
  | 'good'
  | 'regular'
  | 'poor';

export interface NursingArea {
  id: number;
  name: string;
  description?: string;
}

export interface NursingPatient {
  id: number;
  identification: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
}

export interface NursingStaff {
  id: number;
  name: string;
  firstLastName: string;
  secondLastName: string;
  email: string;
}

export interface NursingRecord {
  id: number;
  date: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  painLevel?: number;
  mobility?: Mobility;
  appetite?: QualityLevel;
  sleepQuality?: QualityLevel;
  notes?: string;
  createAt: string;
}

export interface NursingAppointment {
  id: number;
  appointmentDate: string;
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  notes?: string;
  observations?: string;
  durationMinutes?: number;
  nextAppointment?: string | null;
  createAt: string;
  area: NursingArea | null;
  patient: NursingPatient | null;
  staff: NursingStaff | null;
  nursingRecord?: NursingRecord | null;
}

export interface GetNursingAppointmentsDto {
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAppointmentDto {
  saAppointmentDate: string;
  saAppointmentType: AppointmentType;
  saPriority: AppointmentPriority;
  saNotes?: string;
  saDurationMinutes?: number;
  idArea: number;
  idPatient: number;
  idStaff: number;
}

export interface UpdateAppointmentDto {
  saAppointmentDate?: string;
  saAppointmentType?: AppointmentType;
  saPriority?: AppointmentPriority;
  saNotes?: string;
  saObservations?: string;
  saDurationMinutes?: number;
  idStaff?: number;
}

export interface CancelAppointmentDto {
  cancellationReason?: string;
}

export interface CompleteAppointmentDto {
  nrTemperature?: number;
  nrBloodPressure?: string;
  nrHeartRate?: number;
  nrPainLevel?: number;
  nrMobility?: Mobility;
  nrAppetite?: QualityLevel;
  nrSleepQuality?: QualityLevel;
  nrNotes?: string;
}

export interface NursingAppointmentResponse {
  message: string;
  data: NursingAppointment[];
}

export interface SingleNursingAppointmentResponse {
  message: string;
  data: NursingAppointment;
}

export interface CompleteAppointmentResponse {
  message: string;
  data: {
    appointment: NursingAppointment;
    nursingRecord: NursingRecord;
  };
}

export interface NursingRecordsResponse {
  message: string;
  data: NursingRecord[];
}

export interface AppointmentForm {
  id?: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  notes: string;
  durationMinutes: number;
  idArea: number;
  idPatient: number;
  idStaff: number;
}

export interface CompleteAppointmentForm {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  painLevel: string;
  mobility: Mobility;
  appetite: QualityLevel;
  sleepQuality: QualityLevel;
  notes: string;
}

export const defaultAppointmentForm: AppointmentForm = {
  appointmentDate: '',
  appointmentTime: '',
  appointmentType: 'checkup',
  priority: 'medium',
  notes: '',
  durationMinutes: 30,
  idArea: 0,
  idPatient: 0,
  idStaff: 0
};

export const defaultCompleteAppointmentForm: CompleteAppointmentForm = {
  temperature: '',
  bloodPressure: '',
  heartRate: '',
  painLevel: '0',
  mobility: 'independent',
  appetite: 'good',
  sleepQuality: 'good',
  notes: ''
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  'scheduled': 'Programada',
  'in_progress': 'En Progreso',
  'completed': 'Completada',
  'cancelled': 'Cancelada',
  'rescheduled': 'Reprogramada',
  'no_show': 'No se presentó'
};

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  'checkup': 'Chequeo General',
  'evaluation': 'Evaluación',
  'therapy': 'Terapia',
  'follow_up': 'Seguimiento',
  'emergency': 'Emergencia'
};

export const appointmentPriorityLabels: Record<AppointmentPriority, string> = {
  'low': 'Baja',
  'medium': 'Media',
  'high': 'Alta',
  'urgent': 'Urgente'
};

export const mobilityLabels: Record<Mobility, string> = {
  'independent': 'Independiente',
  'assisted': 'Asistido',
  'bedridden': 'Postrado en cama'
};

export const qualityLevelLabels: Record<QualityLevel, string> = {
  'good': 'Bueno',
  'regular': 'Regular',
  'poor': 'Malo'
};

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  'scheduled': 'primary',
  'in_progress': 'warning',
  'completed': 'success',
  'cancelled': 'danger',
  'rescheduled': 'info',
  'no_show': 'secondary'
};

export const appointmentPriorityColors: Record<AppointmentPriority, string> = {
  'low': 'secondary',
  'medium': 'primary',
  'high': 'warning',
  'urgent': 'danger'
};

export const appointmentTypeColors: Record<AppointmentType, string> = {
  'checkup': 'info',
  'evaluation': 'primary',
  'therapy': 'success',
  'follow_up': 'warning',
  'emergency': 'danger'
};