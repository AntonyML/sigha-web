// Tipos sincronizados con backend: controller/nursing/physiotherapy.controller.ts
// Endpoint base: /physiotherapy/sessions

export type PhysiotherapyType =
  | 'therapy'
  | 'evaluation'
  | 'follow_up'
  | 'exercise_program'
  | 'pain_management'
  | 'rehabilitation';

export type MobilityLevel =
  | 'independent'
  | 'minimal_assistance'
  | 'moderate'
  | 'maximum_assistance'
  | 'total_dependence';

export interface PhysiotherapySession {
  id: number;
  ps_date: string;
  ps_type: PhysiotherapyType;
  ps_mobility_level: MobilityLevel;
  ps_pain_level?: number;
  ps_treatment_description?: string;
  ps_exercise_plan?: string;
  ps_progress_notes?: string;
  created_at?: string;
  create_at?: string;
  id_appointment?: {
    id: number;
    saAppointmentDate?: string;
    patient?: {
      id: number;
      name: string;
      firstLastName: string;
      secondLastName: string;
      identification?: string;
    };
    staff?: {
      id: number;
      u_name?: string;
      u_f_last_name?: string;
    };
  };
  /** @deprecated use id_appointment */
  appointment?: {
    id: number;
    appointmentDate?: string;
    patient?: {
      id: number;
      name: string;
      firstLastName: string;
      secondLastName: string;
    };
    staff?: {
      id: number;
      name?: string;
      firstLastName?: string;
    };
  };
}

export interface CreatePhysiotherapySessionDto {
  ps_date?: string;
  ps_type: PhysiotherapyType;
  ps_mobility_level: MobilityLevel;
  ps_pain_level?: number;
  ps_treatment_description?: string;
  ps_exercise_plan?: string;
  ps_progress_notes?: string;
  id_appointment: number;
}

export interface UpdatePhysiotherapySessionDto extends Partial<Omit<CreatePhysiotherapySessionDto, 'id_appointment'>> {}

export interface PhysiotherapySessionApiResponse {
  message: string;
  data: PhysiotherapySession[];
}

export interface SinglePhysiotherapySessionApiResponse {
  message: string;
  data: PhysiotherapySession;
}
