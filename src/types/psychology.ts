// Tipos sincronizados con backend: controller/nursing/psychology.controller.ts
// Endpoint base: /psychology/sessions

export type PsychologySessionType =
  | 'evaluation'
  | 'therapy'
  | 'follow_up'
  | 'group therapy';

export type Mood =
  | 'stable'
  | 'anxious'
  | 'depressed'
  | 'irritable'
  | 'other';

export type CognitiveStatus =
  | 'normal'
  | 'mild impairment'
  | 'moderate impairment'
  | 'severe impairment';

export interface PsychologySession {
  id: number;
  psy_date: string;
  psy_session_type: PsychologySessionType;
  psy_mood: Mood;
  psy_cognitive_status: CognitiveStatus;
  psy_observations?: string;
  psy_therapy_goal?: string;
  psy_progress?: string;
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
      identification?: string;
    };
    staff?: {
      id: number;
      name?: string;
      firstLastName?: string;
    };
  };
}
}

export interface CreatePsychologySessionDto {
  psy_date?: string;
  psy_session_type: PsychologySessionType;
  psy_mood: Mood;
  psy_cognitive_status: CognitiveStatus;
  psy_observations?: string;
  psy_therapy_goal?: string;
  psy_progress?: string;
  id_appointment: number;
}

export interface UpdatePsychologySessionDto extends Partial<Omit<CreatePsychologySessionDto, 'id_appointment'>> {}

export interface PsychologySessionApiResponse {
  message: string;
  data: PsychologySession[];
}

export interface SinglePsychologySessionApiResponse {
  message: string;
  data: PsychologySession;
}
