/**
 * Older Adult Update Types
 *
 * Tipos e interfaces para el manejo de actualizaciones de información de adultos mayores.
 * Incluye interfaces para diferentes tipos de actualizaciones y seguimiento de cambios.
 */

/**
 * Tipo de actualización de información del adulto mayor
 */
export enum OlderAdultUpdateType {
  PERSONAL_INFO = 'personal_info',
  MEDICAL_INFO = 'medical_info',
  CONTACT_INFO = 'contact_info',
  EMERGENCY_CONTACT = 'emergency_contact',
  HEALTH_STATUS = 'health_status',
  MEDICATION = 'medication',
  LIVING_SITUATION = 'living_situation',
  OTHER = 'other'
}

/**
 * Estado de la actualización
 */
export enum OlderAdultUpdateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

/**
 * Interface principal de la actualización de adulto mayor
 */
export interface OlderAdultUpdate {
  /** ID único de la actualización */
  id: number;

  /** ID del paciente */
  patient_id: number;

  /** Tipo de actualización */
  update_type: OlderAdultUpdateType;

  /** Fecha de la actualización */
  update_date: string;

  /** Descripción detallada del cambio (10-1000 caracteres) */
  description: string;

  /** Datos específicos de la actualización según el tipo */
  update_data: OlderAdultUpdateData;

  /** Estado de la actualización */
  status: OlderAdultUpdateStatus;

  /** ID del usuario que realizó la actualización */
  updated_by: number;

  /** ID del usuario que aprobó/rechazó (si aplica) */
  approved_by?: number;

  /** Fecha de aprobación/rechazo */
  approved_at?: string;

  /** Comentarios de aprobación/rechazo */
  approval_comments?: string;

  /** Campos anteriores (antes del cambio) */
  previous_values?: Record<string, any>;

  /** Campos nuevos (después del cambio) */
  new_values?: Record<string, any>;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Interface base para datos específicos de actualización
 */
export interface OlderAdultUpdateData {
  // Los campos específicos varían según el tipo de actualización
  [key: string]: any;
}

/**
 * Datos específicos para actualización de información personal
 */
export interface PersonalInfoUpdateData extends OlderAdultUpdateData {
  /** Nombre completo */
  name?: string;

  /** Fecha de nacimiento */
  birth_date?: string;

  /** Género */
  gender?: string;

  /** Nacionalidad */
  nationality?: string;

  /** Estado civil */
  marital_status?: string;

  /** Religión */
  religion?: string;

  /** Idiomas */
  languages?: string[];
}

/**
 * Datos específicos para actualización de información médica
 */
export interface MedicalInfoUpdateData extends OlderAdultUpdateData {
  /** Tipo de sangre */
  blood_type?: string;

  /** Alergias */
  allergies?: string[];

  /** Condiciones crónicas */
  chronic_conditions?: string[];

  /** Discapacidades */
  disabilities?: string[];

  /** Cirugías previas */
  previous_surgeries?: string[];

  /** Historial médico familiar */
  family_medical_history?: string;
}

/**
 * Datos específicos para actualización de información de contacto
 */
export interface ContactInfoUpdateData extends OlderAdultUpdateData {
  /** Teléfono principal */
  phone?: string;

  /** Teléfono alternativo */
  alternate_phone?: string;

  /** Correo electrónico */
  email?: string;

  /** Dirección */
  address?: string;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Código postal */
  postal_code?: string;

  /** País */
  country?: string;
}

/**
 * Datos específicos para actualización de contacto de emergencia
 */
export interface EmergencyContactUpdateData extends OlderAdultUpdateData {
  /** Nombre del contacto */
  name: string;

  /** Relación */
  relationship: string;

  /** Teléfono */
  phone: string;

  /** Teléfono alternativo */
  alternate_phone?: string;

  /** Correo electrónico */
  email?: string;

  /** Dirección */
  address?: string;

  /** Es contacto primario */
  is_primary?: boolean;
}

/**
 * Datos específicos para actualización de estado de salud
 */
export interface HealthStatusUpdateData extends OlderAdultUpdateData {
  /** Estado de salud general */
  general_health?: string;

  /** Movilidad */
  mobility?: string;

  /** Salud mental */
  mental_health?: string;

  /** Nutrición */
  nutrition?: string;

  /** Nivel de dolor (0-10) */
  pain_level?: number;

  /** Síntomas actuales */
  current_symptoms?: string[];

  /** Nivel de energía */
  energy_level?: string;
}

/**
 * Datos específicos para actualización de medicación
 */
export interface MedicationUpdateData extends OlderAdultUpdateData {
  /** Nombre del medicamento */
  medication_name: string;

  /** Dosis */
  dosage?: string;

  /** Frecuencia */
  frequency?: string;

  /** Propósito */
  purpose?: string;

  /** Efectos secundarios */
  side_effects?: string[];

  /** Fecha de inicio */
  start_date?: string;

  /** Fecha de finalización */
  end_date?: string;
}

/**
 * Datos específicos para actualización de situación de vivienda
 */
export interface LivingSituationUpdateData extends OlderAdultUpdateData {
  /** Arreglo de vivienda */
  living_arrangement?: string;

  /** Nivel de cuidado requerido */
  care_level?: string;

  /** Asistencia necesaria */
  assistance_needed?: string[];

  /** Apoyo familiar disponible */
  family_support?: string;

  /** Servicios comunitarios utilizados */
  community_services?: string[];

  /** Satisfacción con la vivienda */
  housing_satisfaction?: string;
}

/**
 * Datos específicos para otros tipos de actualización
 */
export interface OtherUpdateData extends OlderAdultUpdateData {
  /** Categoría específica */
  category?: string;

  /** Detalles adicionales */
  details: Record<string, any>;
}

/**
 * Interface para crear una nueva actualización de adulto mayor
 */
export interface CreateOlderAdultUpdateData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** Tipo de actualización (requerido) */
  update_type: OlderAdultUpdateType;

  /** Fecha de la actualización (requerido) */
  update_date: string;

  /** Descripción detallada (requerido, 10-1000 caracteres) */
  description: string;

  /** Datos específicos según el tipo (requerido) */
  update_data: OlderAdultUpdateData;

  /** Estado inicial (opcional, por defecto PENDING) */
  status?: OlderAdultUpdateStatus;

  /** ID del usuario que realiza la actualización (requerido) */
  updated_by: number;
}

/**
 * Interface para actualizar una actualización existente
 */
export interface UpdateOlderAdultUpdateData {
  /** Tipo de actualización */
  update_type?: OlderAdultUpdateType;

  /** Fecha de la actualización */
  update_date?: string;

  /** Descripción */
  description?: string;

  /** Datos específicos */
  update_data?: OlderAdultUpdateData;

  /** Estado */
  status?: OlderAdultUpdateStatus;

  /** Comentarios de aprobación/rechazo */
  approval_comments?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Interface para aprobar/rechazar una actualización
 */
export interface ApproveOlderAdultUpdateData {
  /** Acción: aprobar o rechazar */
  action: 'approve' | 'reject';

  /** Comentarios */
  comments?: string;

  /** ID del usuario que aprueba/rechaza */
  approved_by: number;
}

/**
 * Parámetros de búsqueda para actualizaciones de adultos mayores
 */
export interface OlderAdultUpdateSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** Tipo de actualización */
  update_type?: OlderAdultUpdateType;

  /** Estado de la actualización */
  status?: OlderAdultUpdateStatus;

  /** ID del usuario que realizó la actualización */
  updated_by?: number;

  /** ID del usuario que aprobó */
  approved_by?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Solo actualizaciones pendientes */
  pending_only?: boolean;

  /** Solo actualizaciones aprobadas */
  approved_only?: boolean;

  /** Búsqueda por texto en descripción */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'update_date' | 'created_at' | 'status' | 'update_type' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para actualizaciones de adultos mayores
 */
export interface OlderAdultUpdateApiResponse {
  /** Datos de las actualizaciones */
  data: OlderAdultUpdate[];

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
 * Respuesta de la API para una actualización individual
 */
export interface OlderAdultUpdateSingleApiResponse {
  /** Datos de la actualización */
  data: OlderAdultUpdate;
}

/**
 * Estadísticas de actualizaciones de adultos mayores
 */
export interface OlderAdultUpdateStats {
  /** Total de actualizaciones */
  total_updates: number;

  /** Actualizaciones por tipo */
  updates_by_type: Record<OlderAdultUpdateType, number>;

  /** Actualizaciones por estado */
  updates_by_status: Record<OlderAdultUpdateStatus, number>;

  /** Actualizaciones por mes */
  updates_by_month: Record<string, number>;

  /** Tasa de aprobación */
  approval_rate: number;

  /** Promedio de tiempo de aprobación (días) */
  average_approval_time: number;

  /** Actualizaciones pendientes */
  pending_updates: number;

  /** Pacientes con actualizaciones recientes */
  patients_with_recent_updates: number;
}

/**
 * Constantes para etiquetas de tipos de actualización
 */
export const OLDER_ADULT_UPDATE_TYPE_LABELS: Record<OlderAdultUpdateType, string> = {
  [OlderAdultUpdateType.PERSONAL_INFO]: 'Información Personal',
  [OlderAdultUpdateType.MEDICAL_INFO]: 'Información Médica',
  [OlderAdultUpdateType.CONTACT_INFO]: 'Información de Contacto',
  [OlderAdultUpdateType.EMERGENCY_CONTACT]: 'Contacto de Emergencia',
  [OlderAdultUpdateType.HEALTH_STATUS]: 'Estado de Salud',
  [OlderAdultUpdateType.MEDICATION]: 'Medicación',
  [OlderAdultUpdateType.LIVING_SITUATION]: 'Situación de Vivienda',
  [OlderAdultUpdateType.OTHER]: 'Otro'
};

/**
 * Constantes para etiquetas de estados
 */
export const OLDER_ADULT_UPDATE_STATUS_LABELS: Record<OlderAdultUpdateStatus, string> = {
  [OlderAdultUpdateStatus.PENDING]: 'Pendiente',
  [OlderAdultUpdateStatus.APPROVED]: 'Aprobada',
  [OlderAdultUpdateStatus.REJECTED]: 'Rechazada',
  [OlderAdultUpdateStatus.ARCHIVED]: 'Archivada'
};

/**
 * Valores por defecto para crear actualización
 */
export const defaultCreateOlderAdultUpdateData: CreateOlderAdultUpdateData = {
  patient_id: 0,
  update_type: OlderAdultUpdateType.OTHER,
  update_date: '',
  description: '',
  update_data: {},
  status: OlderAdultUpdateStatus.PENDING,
  updated_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultOlderAdultUpdateSearchParams: OlderAdultUpdateSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'update_date',
  sort_order: 'desc',
  pending_only: false
};