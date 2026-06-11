/**
 * Medical Record Types
 *
 * Tipos e interfaces para el manejo de registros médicos de pacientes.
 * Incluye interfaces para consultas, diagnósticos, tratamientos y seguimientos.
 */

/**
 * Tipo de registro médico
 */
export const MedicalRecordType = {
  CONSULTATION: 'consultation',
  EMERGENCY: 'emergency',
  FOLLOW_UP: 'follow_up',
  PROCEDURE: 'procedure',
  LABORATORY: 'laboratory',
  IMAGING: 'imaging',
  PRESCRIPTION: 'prescription',
  VACCINATION: 'vaccination'
} as const;
export type MedicalRecordType = typeof MedicalRecordType[keyof typeof MedicalRecordType];

/**
 * Estado de un registro médico
 */
export const MedicalRecordStatus = {
  DRAFT: 'draft',
  FINALIZED: 'finalized',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
} as const;
export type MedicalRecordStatus = typeof MedicalRecordStatus[keyof typeof MedicalRecordStatus];

/**
 * Prioridad del registro médico
 */
export const MedicalRecordPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;
export type MedicalRecordPriority = typeof MedicalRecordPriority[keyof typeof MedicalRecordPriority];

/**
 * Interface principal del registro médico
 */
export interface MedicalRecord {
  /** ID único del registro médico */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** ID del profesional que registra */
  recorded_by: number;

  /** Tipo de registro médico */
  record_type: MedicalRecordType;

  /** Estado del registro */
  status: MedicalRecordStatus;

  /** Prioridad del registro */
  priority: MedicalRecordPriority;

  /** Fecha y hora del registro */
  record_date: string;

  /** Título/descripción breve */
  title: string;

  /** Descripción detallada */
  description?: string;

  /** Síntomas presentados */
  symptoms?: string;

  /** Diagnóstico realizado */
  diagnosis?: string;

  /** Tratamiento prescrito */
  treatment?: string;

  /** Notas adicionales */
  notes?: string;

  /** Archivos adjuntos (URLs o referencias) */
  attachments?: string[];

  /** ID de la cita relacionada (opcional) */
  appointment_id?: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** ID del profesional que actualizó por última vez */
  updated_by?: number;
}

/**
 * Interface para crear un nuevo registro médico
 */
export interface CreateMedicalRecordData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** ID del profesional que registra (requerido) */
  recorded_by: number;

  /** Tipo de registro médico (requerido) */
  record_type: MedicalRecordType;

  /** Estado inicial (opcional, por defecto DRAFT) */
  status?: MedicalRecordStatus;

  /** Prioridad (opcional, por defecto NORMAL) */
  priority?: MedicalRecordPriority;

  /** Fecha y hora del registro (opcional, por defecto ahora) */
  record_date?: string;

  /** Título/descripción breve (requerido) */
  title: string;

  /** Descripción detallada */
  description?: string;

  /** Síntomas presentados */
  symptoms?: string;

  /** Diagnóstico realizado */
  diagnosis?: string;

  /** Tratamiento prescrito */
  treatment?: string;

  /** Notas adicionales */
  notes?: string;

  /** Archivos adjuntos */
  attachments?: string[];

  /** ID de la cita relacionada */
  appointment_id?: number;
}

/**
 * Interface para actualizar un registro médico existente
 */
export interface UpdateMedicalRecordData {
  /** Tipo de registro médico */
  record_type?: MedicalRecordType;

  /** Estado del registro */
  status?: MedicalRecordStatus;

  /** Prioridad del registro */
  priority?: MedicalRecordPriority;

  /** Fecha y hora del registro */
  record_date?: string;

  /** Título/descripción breve */
  title?: string;

  /** Descripción detallada */
  description?: string;

  /** Síntomas presentados */
  symptoms?: string;

  /** Diagnóstico realizado */
  diagnosis?: string;

  /** Tratamiento prescrito */
  treatment?: string;

  /** Notas adicionales */
  notes?: string;

  /** Archivos adjuntos */
  attachments?: string[];

  /** ID de la cita relacionada */
  appointment_id?: number;

  /** ID del profesional que actualiza */
  updated_by?: number;
}

/**
 * Parámetros de búsqueda para registros médicos
 */
export interface MedicalRecordSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** ID del profesional que registró */
  recorded_by?: number;

  /** Tipo de registro médico */
  record_type?: MedicalRecordType;

  /** Estado del registro */
  status?: MedicalRecordStatus;

  /** Prioridad del registro */
  priority?: MedicalRecordPriority;

  /** ID de la cita relacionada */
  appointment_id?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Búsqueda por texto en título, descripción o diagnóstico */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'record_date' | 'created_at' | 'updated_at' | 'priority';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para registros médicos
 */
export interface MedicalRecordApiResponse {
  /** Datos de los registros médicos */
  data: MedicalRecord[];

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
 * Respuesta de la API para un registro médico individual
 */
export interface MedicalRecordSingleApiResponse {
  /** Datos del registro médico */
  data: MedicalRecord;
}

/**
 * Interface para resultados de laboratorio
 */
export interface LaboratoryResult {
  /** ID del resultado */
  id: number;

  /** ID del registro médico */
  medical_record_id: number;

  /** Tipo de examen */
  test_type: string;

  /** Nombre del examen */
  test_name: string;

  /** Resultado del examen */
  result: string;

  /** Valores de referencia */
  reference_values?: string;

  /** Unidad de medida */
  unit?: string;

  /** Fecha del examen */
  test_date: string;

  /** Notas del laboratorio */
  notes?: string;

  /** Estado del resultado */
  status: 'pending' | 'completed' | 'reviewed';
}

/**
 * Interface para imágenes médicas
 */
export interface MedicalImage {
  /** ID de la imagen */
  id: number;

  /** ID del registro médico */
  medical_record_id: number;

  /** Tipo de imagen */
  image_type: string;

  /** Descripción de la imagen */
  description: string;

  /** URL o path de la imagen */
  image_url: string;

  /** Fecha de la imagen */
  image_date: string;

  /** Notas del radiólogo/técnico */
  notes?: string;

  /** Hallazgos */
  findings?: string;

  /** Estado de la interpretación */
  status: 'pending' | 'interpreted' | 'reviewed';
}

/**
 * Valores por defecto para crear registro médico
 */
export const defaultCreateMedicalRecordData: CreateMedicalRecordData = {
  patient_id: 0,
  recorded_by: 0,
  record_type: MedicalRecordType.CONSULTATION,
  status: MedicalRecordStatus.DRAFT,
  priority: MedicalRecordPriority.NORMAL,
  title: '',
  description: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  notes: ''
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultMedicalRecordSearchParams: MedicalRecordSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'record_date',
  sort_order: 'desc'
};