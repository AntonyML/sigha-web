export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'medication' | 'vital_signs' | 'treatment' | 'follow_up' | 'emergency';

export interface Patient {
  id: number;
  identification: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  birthDate: string;
  age?: number;
  phone?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  allergies?: string;
  createAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patient?: Patient;
  appointmentType: AppointmentType;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  medications?: string;
  diagnosis?: string;
  nurseNotes?: string;
  createAt: string;
  updatedAt?: string;
}

export interface AppointmentApiPayload {
  patientId: number;
  appointmentType: AppointmentType;
  scheduledDate: string;
  scheduledTime: string;
  reason: string;
  notes?: string;
}

export interface AppointmentForm {
  id?: number;
  patientId: number;
  appointmentType: AppointmentType;
  scheduledDate: string;
  scheduledTime: string;
  reason: string;
  notes: string;
}

export interface CompleteAppointmentForm {
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  medications: string;
  diagnosis: string;
  nurseNotes: string;
  status: AppointmentStatus;
}

export const defaultAppointmentForm: AppointmentForm = {
  patientId: 0,
  appointmentType: 'consultation',
  scheduledDate: '',
  scheduledTime: '',
  reason: '',
  notes: ''
};

export const defaultCompleteAppointmentForm: CompleteAppointmentForm = {
  vitalSigns: {
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: ''
  },
  medications: '',
  diagnosis: '',
  nurseNotes: '',
  status: 'completed'
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó'
};

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  consultation: 'Consulta',
  medication: 'Medicación',
  vital_signs: 'Signos Vitales',
  treatment: 'Tratamiento',
  follow_up: 'Seguimiento',
  emergency: 'Emergencia'
};