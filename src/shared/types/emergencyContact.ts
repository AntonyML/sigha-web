/**
 * Emergency Contact Types
 *
 * Tipos e interfaces para el manejo de contactos de emergencia.
 * Incluye interfaces para gestión de contactos de emergencia de pacientes.
 */

/**
 * Relación familiar o conocida con el paciente
 */
export const EmergencyContactRelationship = {
  PADRE: 'padre',
  MADRE: 'madre',
  HIJO: 'hijo',
  HIJA: 'hija',
  HERMANO: 'hermano',
  HERMANA: 'hermana',
  ESPOSO: 'esposo',
  ESPOSA: 'esposa',
  PAREJA: 'pareja',
  AMIGO: 'amigo',
  AMIGA: 'amiga',
  TIO: 'tío',
  TIA: 'tía',
  SOBRINO: 'sobrino',
  SOBRINA: 'sobrina',
  ABUELo: 'abuelo',
  ABUELA: 'abuela',
  VECINO: 'vecino',
  VECINA: 'vecina',
  CUIDADOR: 'cuidador',
  CUIDADORA: 'cuidadora',
  OTRO: 'otro',
} as const;
export type EmergencyContactRelationship = typeof EmergencyContactRelationship[keyof typeof EmergencyContactRelationship];

/**
 * Estado del contacto de emergencia
 */
export const EmergencyContactStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DECEASED: 'deceased',
  UNREACHABLE: 'unreachable',
} as const;
export type EmergencyContactStatus = typeof EmergencyContactStatus[keyof typeof EmergencyContactStatus];

/**
 * Prioridad del contacto (1 = primario, 2 = secundario, etc.)
 */
export type ContactPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Interface principal del contacto de emergencia
 */
export interface EmergencyContact {
  /** ID único del contacto */
  id: number;

  /** ID del paciente al que pertenece */
  patient_id: number;

  /** Nombre completo del contacto */
  name: string;

  /** Relación con el paciente */
  relationship: EmergencyContactRelationship;

  /** Teléfono principal */
  phone: string;

  /** Teléfono alternativo (opcional) */
  alternate_phone?: string;

  /** Correo electrónico (opcional) */
  email?: string;

  /** Dirección del contacto (opcional) */
  address?: string;

  /** Ciudad (opcional) */
  city?: string;

  /** Estado/Provincia (opcional) */
  state?: string;

  /** Código postal (opcional) */
  postal_code?: string;

  /** País (opcional) */
  country?: string;

  /** Prioridad del contacto (1 = primario) */
  priority: ContactPriority;

  /** Indica si es el contacto primario */
  is_primary: boolean;

  /** Estado del contacto */
  status: EmergencyContactStatus;

  /** Notas adicionales sobre el contacto */
  notes?: string;

  /** Última vez que se contactó */
  last_contacted_at?: string;

  /** Resultado del último contacto */
  last_contact_result?: string;

  /** ID del usuario que creó el contacto */
  created_by: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** ID del usuario que actualizó */
  updated_by?: number;
}

/**
 * Interface para crear un nuevo contacto de emergencia
 */
export interface CreateEmergencyContactData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** Nombre completo (requerido) */
  name: string;

  /** Relación con el paciente (requerido) */
  relationship: EmergencyContactRelationship;

  /** Teléfono principal (requerido) */
  phone: string;

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

  /** Prioridad del contacto (opcional, por defecto 1) */
  priority?: ContactPriority;

  /** Indica si es primario (opcional, por defecto false) */
  is_primary?: boolean;

  /** Estado inicial (opcional, por defecto ACTIVE) */
  status?: EmergencyContactStatus;

  /** Notas adicionales */
  notes?: string;

  /** ID del usuario que crea (requerido) */
  created_by: number;
}

/**
 * Interface para actualizar un contacto de emergencia existente
 */
export interface UpdateEmergencyContactData {
  /** Nombre completo */
  name?: string;

  /** Relación con el paciente */
  relationship?: EmergencyContactRelationship;

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

  /** Prioridad del contacto */
  priority?: ContactPriority;

  /** Indica si es primario */
  is_primary?: boolean;

  /** Estado del contacto */
  status?: EmergencyContactStatus;

  /** Notas adicionales */
  notes?: string;

  /** Última vez que se contactó */
  last_contacted_at?: string;

  /** Resultado del último contacto */
  last_contact_result?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Interface para registrar un contacto con el emergency contact
 */
export interface ContactAttemptData {
  /** Fecha y hora del contacto */
  contacted_at: string;

  /** Resultado del contacto */
  contact_result: string;

  /** Notas del contacto */
  contact_notes?: string;

  /** ID del usuario que realizó el contacto */
  contacted_by: number;
}

/**
 * Parámetros de búsqueda para contactos de emergencia
 */
export interface EmergencyContactSearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** Nombre del contacto (búsqueda parcial) */
  name?: string;

  /** Relación con el paciente */
  relationship?: EmergencyContactRelationship;

  /** Estado del contacto */
  status?: EmergencyContactStatus;

  /** Solo contactos primarios */
  primary_only?: boolean;

  /** Prioridad específica */
  priority?: ContactPriority;

  /** ID del usuario que creó */
  created_by?: number;

  /** Solo contactos activos */
  active_only?: boolean;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Búsqueda por teléfono */
  phone_search?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'name' | 'relationship' | 'priority' | 'created_at' | 'status' | 'patient_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para contactos de emergencia
 */
export interface EmergencyContactApiResponse {
  /** Datos de los contactos de emergencia */
  data: EmergencyContact[];

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
 * Respuesta de la API para un contacto de emergencia individual
 */
export interface EmergencyContactSingleApiResponse {
  /** Datos del contacto de emergencia */
  data: EmergencyContact;
}

/**
 * Interface para estadísticas de contactos de emergencia
 */
export interface EmergencyContactStats {
  /** Total de contactos registrados */
  total_contacts: number;

  /** Contactos por estado */
  contacts_by_status: Record<EmergencyContactStatus, number>;

  /** Contactos por relación */
  contacts_by_relationship: Record<EmergencyContactRelationship, number>;

  /** Número de pacientes con al menos un contacto */
  patients_with_contacts: number;

  /** Número de pacientes con contacto primario */
  patients_with_primary_contact: number;

  /** Promedio de contactos por paciente */
  average_contacts_per_patient: number;

  /** Contactos contactados en los últimos 30 días */
  recently_contacted: number;

  /** Tasa de contactos activos */
  active_contact_rate: number;
}

/**
 * Interface para validar unicidad de contacto
 */
export interface EmergencyContactUniquenessCheck {
  /** ID del paciente */
  patient_id: number;

  /** Nombre del contacto */
  name: string;

  /** Teléfono del contacto */
  phone: string;

  /** Excluir este ID si es una actualización */
  exclude_id?: number;
}

/**
 * Constantes para etiquetas de relaciones
 */
export const EMERGENCY_CONTACT_RELATIONSHIP_LABELS: Record<EmergencyContactRelationship, string> = {
  [EmergencyContactRelationship.PADRE]: 'Padre',
  [EmergencyContactRelationship.MADRE]: 'Madre',
  [EmergencyContactRelationship.HIJO]: 'Hijo',
  [EmergencyContactRelationship.HIJA]: 'Hija',
  [EmergencyContactRelationship.HERMANO]: 'Hermano',
  [EmergencyContactRelationship.HERMANA]: 'Hermana',
  [EmergencyContactRelationship.ESPOSO]: 'Esposo',
  [EmergencyContactRelationship.ESPOSA]: 'Esposa',
  [EmergencyContactRelationship.PAREJA]: 'Pareja',
  [EmergencyContactRelationship.AMIGO]: 'Amigo',
  [EmergencyContactRelationship.AMIGA]: 'Amiga',
  [EmergencyContactRelationship.TIO]: 'Tío',
  [EmergencyContactRelationship.TIA]: 'Tía',
  [EmergencyContactRelationship.SOBRINO]: 'Sobrino',
  [EmergencyContactRelationship.SOBRINA]: 'Sobrina',
  [EmergencyContactRelationship.ABUELo]: 'Abuelo',
  [EmergencyContactRelationship.ABUELA]: 'Abuela',
  [EmergencyContactRelationship.VECINO]: 'Vecino',
  [EmergencyContactRelationship.VECINA]: 'Vecina',
  [EmergencyContactRelationship.CUIDADOR]: 'Cuidador',
  [EmergencyContactRelationship.CUIDADORA]: 'Cuidadora',
  [EmergencyContactRelationship.OTRO]: 'Otro'
};

/**
 * Constantes para etiquetas de estados
 */
export const EMERGENCY_CONTACT_STATUS_LABELS: Record<EmergencyContactStatus, string> = {
  [EmergencyContactStatus.ACTIVE]: 'Activo',
  [EmergencyContactStatus.INACTIVE]: 'Inactivo',
  [EmergencyContactStatus.DECEASED]: 'Fallecido',
  [EmergencyContactStatus.UNREACHABLE]: 'Inalcanzable'
};

/**
 * Valores por defecto para crear contacto de emergencia
 */
export const defaultCreateEmergencyContactData: CreateEmergencyContactData = {
  patient_id: 0,
  name: '',
  relationship: EmergencyContactRelationship.OTRO,
  phone: '',
  priority: 1,
  is_primary: false,
  status: EmergencyContactStatus.ACTIVE,
  created_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultEmergencyContactSearchParams: EmergencyContactSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'priority',
  sort_order: 'asc',
  active_only: true
};

// ---- Backend API types ----
export interface EmergencyContactApi {
  id: number;
  enPhoneNumber: string;
  idOlderAdult?: number;
}

export interface CreateEmergencyContactDto {
  enPhoneNumber: string;
  idOlderAdult?: number;
}

export interface UpdateEmergencyContactDto {
  enPhoneNumber?: string;
  idOlderAdult?: number;
}