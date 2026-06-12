/**
 * Older Adult Family Types
 *
 * Tipos e interfaces para el manejo de miembros de familia de adultos mayores.
 * Incluye interfaces para gestión de familiares, contactos de emergencia y relaciones familiares.
 */

/**
 * Relación familiar con el adulto mayor
 */
export const OlderAdultFamilyRelationship = {
  SPOUSE: 'spouse',
  CHILD: 'child',
  PARENT: 'parent',
  SIBLING: 'sibling',
  GRANDCHILD: 'grandchild',
  GRANDPARENT: 'grandparent',
  AUNT_UNCLE: 'aunt_uncle',
  NIECE_NEPHEW: 'niece_nephew',
  COUSIN: 'cousin',
  IN_LAW: 'in_law',
  OTHER: 'other',
} as const;
export type OlderAdultFamilyRelationship = typeof OlderAdultFamilyRelationship[keyof typeof OlderAdultFamilyRelationship];

/**
 * Estado del miembro de familia
 */
export const OlderAdultFamilyStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DECEASED: 'deceased',
  NO_CONTACT: 'no_contact',
} as const;
export type OlderAdultFamilyStatus = typeof OlderAdultFamilyStatus[keyof typeof OlderAdultFamilyStatus];

/**
 * Nivel de involucramiento familiar
 */
export const FamilyInvolvementLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
} as const;
export type FamilyInvolvementLevel = typeof FamilyInvolvementLevel[keyof typeof FamilyInvolvementLevel];

/**
 * Tipo específico de parentesco familiar
 */
export const KinshipType = {
  SON: 'son',
  DAUGHTER: 'daughter',
  GRANDSON: 'grandson',
  GRANDDAUGHTER: 'granddaughter',
  FATHER: 'father',
  MOTHER: 'mother',
  GRANDFATHER: 'grandfather',
  GRANDMOTHER: 'grandmother',
  BROTHER: 'brother',
  SISTER: 'sister',
  UNCLE: 'uncle',
  AUNT: 'aunt',
  NEPHEW: 'nephew',
  NIECE: 'niece',
  COUSIN_MALE: 'cousin_male',
  COUSIN_FEMALE: 'cousin_female',
  FATHER_IN_LAW: 'father_in_law',
  MOTHER_IN_LAW: 'mother_in_law',
  BROTHER_IN_LAW: 'brother_in_law',
  SISTER_IN_LAW: 'sister_in_law',
  SPOUSE: 'spouse',
  OTHER: 'other',
} as const;
export type KinshipType = typeof KinshipType[keyof typeof KinshipType];

/**
 * Interface principal del miembro de familia de adulto mayor
 */
export interface OlderAdultFamily {
  /** ID único del miembro de familia */
  id: number;

  /** ID del paciente (adulto mayor) */
  patient_id: number;

  /** Nombre completo del familiar */
  name: string;

  /** Relación familiar con el paciente */
  relationship: OlderAdultFamilyRelationship;

  /** Tipo específico de parentesco */
  kinship_type?: KinshipType;

  /** Relación específica (para casos de "other") */
  specific_relationship?: string;

  /** Fecha de nacimiento */
  birth_date?: string;

  /** Edad (calculada automáticamente) */
  age?: number;

  /** Género */
  gender?: string;

  /** Teléfono principal */
  phone?: string;

  /** Teléfono alternativo */
  alternate_phone?: string;

  /** Correo electrónico */
  email?: string;

  /** Dirección completa */
  address?: string;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Código postal */
  postal_code?: string;

  /** País */
  country?: string;

  /** Indica si puede ser contacto de emergencia */
  can_be_emergency_contact: boolean;

  /** Indica si es contacto de emergencia activo */
  is_emergency_contact: boolean;

  /** Nivel de involucramiento en el cuidado */
  involvement_level: FamilyInvolvementLevel;

  /** Estado del familiar */
  status: OlderAdultFamilyStatus;

  /** Notas sobre el familiar */
  notes?: string;

  /** Último contacto con el familiar */
  last_contact_date?: string;

  /** Frecuencia de visitas */
  visit_frequency?: string;

  /** Apoyo proporcionado al adulto mayor */
  support_provided?: string[];

  /** Preocupaciones del familiar */
  family_concerns?: string[];

  /** ID del usuario que registró al familiar */
  created_by: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** ID del usuario que actualizó */
  updated_by?: number;
}

/**
 * Interface para crear un nuevo miembro de familia
 */
export interface CreateOlderAdultFamilyData {
  /** ID del paciente (requerido) */
  patient_id: number;

  /** Nombre completo (requerido) */
  name: string;

  /** Relación familiar (requerido) */
  relationship: OlderAdultFamilyRelationship;

  /** Tipo específico de parentesco */
  kinship_type?: KinshipType;

  /** Relación específica (para casos de "other") */
  specific_relationship?: string;

  /** Fecha de nacimiento */
  birth_date?: string;

  /** Género */
  gender?: string;

  /** Teléfono principal */
  phone?: string;

  /** Teléfono alternativo */
  alternate_phone?: string;

  /** Correo electrónico */
  email?: string;

  /** Dirección completa */
  address?: string;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Código postal */
  postal_code?: string;

  /** País */
  country?: string;

  /** Indica si es contacto de emergencia (opcional, por defecto false) */
  is_emergency_contact?: boolean;

  /** Nivel de involucramiento (opcional, por defecto MEDIUM) */
  involvement_level?: FamilyInvolvementLevel;

  /** Estado inicial (opcional, por defecto ACTIVE) */
  status?: OlderAdultFamilyStatus;

  /** Notas */
  notes?: string;

  /** Frecuencia de visitas */
  visit_frequency?: string;

  /** Apoyo proporcionado */
  support_provided?: string[];

  /** Preocupaciones del familiar */
  family_concerns?: string[];

  /** ID del usuario que crea (requerido) */
  created_by: number;
}

/**
 * Interface para actualizar un miembro de familia existente
 */
export interface UpdateOlderAdultFamilyData {
  /** Nombre completo */
  name?: string;

  /** Relación familiar */
  relationship?: OlderAdultFamilyRelationship;

  /** Tipo específico de parentesco */
  kinship_type?: KinshipType;

  /** Relación específica */
  specific_relationship?: string;

  /** Fecha de nacimiento */
  birth_date?: string;

  /** Género */
  gender?: string;

  /** Teléfono principal */
  phone?: string;

  /** Teléfono alternativo */
  alternate_phone?: string;

  /** Correo electrónico */
  email?: string;

  /** Dirección completa */
  address?: string;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Código postal */
  postal_code?: string;

  /** País */
  country?: string;

  /** Indica si es contacto de emergencia */
  is_emergency_contact?: boolean;

  /** Nivel de involucramiento */
  involvement_level?: FamilyInvolvementLevel;

  /** Estado del familiar */
  status?: OlderAdultFamilyStatus;

  /** Notas */
  notes?: string;

  /** Último contacto */
  last_contact_date?: string;

  /** Frecuencia de visitas */
  visit_frequency?: string;

  /** Apoyo proporcionado */
  support_provided?: string[];

  /** Preocupaciones del familiar */
  family_concerns?: string[];

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Interface para registrar un contacto con familiar
 */
export interface FamilyContactData {
  /** Fecha del contacto */
  contact_date: string;

  /** Tipo de contacto */
  contact_type: 'phone' | 'visit' | 'email' | 'other';

  /** Notas del contacto */
  contact_notes?: string;

  /** Resultado del contacto */
  contact_result?: string;

  /** ID del usuario que realizó el contacto */
  contacted_by: number;
}

/**
 * Parámetros de búsqueda para miembros de familia
 */
export interface OlderAdultFamilySearchParams {
  /** ID del paciente */
  patient_id?: number;

  /** Nombre del familiar (búsqueda parcial) */
  name?: string;

  /** Relación familiar */
  relationship?: OlderAdultFamilyRelationship;

  /** Tipo específico de parentesco */
  kinship_type?: KinshipType;

  /** Estado del familiar */
  status?: OlderAdultFamilyStatus;

  /** Nivel de involucramiento */
  involvement_level?: FamilyInvolvementLevel;

  /** Solo contactos de emergencia */
  emergency_contacts_only?: boolean;

  /** Solo familiares activos */
  active_only?: boolean;

  /** Ciudad */
  city?: string;

  /** Estado/Provincia */
  state?: string;

  /** Búsqueda por teléfono */
  phone_search?: string;

  /** ID del usuario que creó */
  created_by?: number;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'name' | 'relationship' | 'created_at' | 'status' | 'patient_id' | 'involvement_level';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para miembros de familia
 */
export interface OlderAdultFamilyApiResponse {
  /** Datos de los miembros de familia */
  data: OlderAdultFamily[];

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
 * Respuesta de la API para un miembro de familia individual
 */
export interface OlderAdultFamilySingleApiResponse {
  /** Datos del miembro de familia */
  data: OlderAdultFamily;
}

/**
 * Interface para árbol genealógico familiar
 */
export interface FamilyTreeNode {
  /** Miembro de familia */
  family_member: OlderAdultFamily;

  /** Hijos en el árbol (otros miembros relacionados) */
  children?: FamilyTreeNode[];

  /** Nivel en el árbol */
  level: number;

  /** Posición relativa al paciente */
  position: 'ancestor' | 'descendant' | 'sibling' | 'spouse';
}

/**
 * Estadísticas de familia de adultos mayores
 */
export interface OlderAdultFamilyStats {
  /** Total de miembros de familia registrados */
  total_family_members: number;

  /** Miembros por relación */
  members_by_relationship: Record<OlderAdultFamilyRelationship, number>;

  /** Miembros por estado */
  members_by_status: Record<OlderAdultFamilyStatus, number>;

  /** Miembros por nivel de involucramiento */
  members_by_involvement: Record<FamilyInvolvementLevel, number>;

  /** Número de contactos de emergencia */
  emergency_contacts: number;

  /** Número de pacientes con familia registrada */
  patients_with_family: number;

  /** Promedio de miembros de familia por paciente */
  average_family_members_per_patient: number;

  /** Miembros contactados recientemente (últimos 30 días) */
  recently_contacted: number;

  /** Tasa de miembros activos */
  active_members_rate: number;
}

/**
 * Constantes para etiquetas de relaciones familiares
 */
export const OLDER_ADULT_FAMILY_RELATIONSHIP_LABELS: Record<OlderAdultFamilyRelationship, string> = {
  [OlderAdultFamilyRelationship.SPOUSE]: 'Cónyuge',
  [OlderAdultFamilyRelationship.CHILD]: 'Hijo/Hija',
  [OlderAdultFamilyRelationship.PARENT]: 'Padre/Madre',
  [OlderAdultFamilyRelationship.SIBLING]: 'Hermano/Hermana',
  [OlderAdultFamilyRelationship.GRANDCHILD]: 'Nieto/Nieta',
  [OlderAdultFamilyRelationship.GRANDPARENT]: 'Abuelo/Abuela',
  [OlderAdultFamilyRelationship.AUNT_UNCLE]: 'Tío/Tía',
  [OlderAdultFamilyRelationship.NIECE_NEPHEW]: 'Sobrino/Sobrina',
  [OlderAdultFamilyRelationship.COUSIN]: 'Primo/Prima',
  [OlderAdultFamilyRelationship.IN_LAW]: 'Pariente Político',
  [OlderAdultFamilyRelationship.OTHER]: 'Otro'
};

/**
 * Constantes para etiquetas de estados
 */
export const OLDER_ADULT_FAMILY_STATUS_LABELS: Record<OlderAdultFamilyStatus, string> = {
  [OlderAdultFamilyStatus.ACTIVE]: 'Activo',
  [OlderAdultFamilyStatus.INACTIVE]: 'Inactivo',
  [OlderAdultFamilyStatus.DECEASED]: 'Fallecido',
  [OlderAdultFamilyStatus.NO_CONTACT]: 'Sin Contacto'
};

/**
 * Constantes para etiquetas de niveles de involucramiento
 */
export const FAMILY_INVOLVEMENT_LEVEL_LABELS: Record<FamilyInvolvementLevel, string> = {
  [FamilyInvolvementLevel.HIGH]: 'Alto',
  [FamilyInvolvementLevel.MEDIUM]: 'Medio',
  [FamilyInvolvementLevel.LOW]: 'Bajo',
  [FamilyInvolvementLevel.NONE]: 'Ninguno'
};

/**
 * Relaciones que pueden ser contactos de emergencia
 */
export const EMERGENCY_CONTACT_RELATIONSHIPS: OlderAdultFamilyRelationship[] = [
  OlderAdultFamilyRelationship.SPOUSE,
  OlderAdultFamilyRelationship.CHILD,
  OlderAdultFamilyRelationship.PARENT,
  OlderAdultFamilyRelationship.SIBLING,
  OlderAdultFamilyRelationship.AUNT_UNCLE,
  OlderAdultFamilyRelationship.IN_LAW
];

/**
 * Constantes para etiquetas de tipos de parentesco
 */
export const KINSHIP_TYPE_LABELS: Record<KinshipType, string> = {
  [KinshipType.SON]: 'Hijo',
  [KinshipType.DAUGHTER]: 'Hija',
  [KinshipType.GRANDSON]: 'Nieto',
  [KinshipType.GRANDDAUGHTER]: 'Nieta',
  [KinshipType.FATHER]: 'Padre',
  [KinshipType.MOTHER]: 'Madre',
  [KinshipType.GRANDFATHER]: 'Abuelo',
  [KinshipType.GRANDMOTHER]: 'Abuela',
  [KinshipType.BROTHER]: 'Hermano',
  [KinshipType.SISTER]: 'Hermana',
  [KinshipType.UNCLE]: 'Tío',
  [KinshipType.AUNT]: 'Tía',
  [KinshipType.NEPHEW]: 'Sobrino',
  [KinshipType.NIECE]: 'Sobrina',
  [KinshipType.COUSIN_MALE]: 'Primo',
  [KinshipType.COUSIN_FEMALE]: 'Prima',
  [KinshipType.FATHER_IN_LAW]: 'Suegro',
  [KinshipType.MOTHER_IN_LAW]: 'Suegra',
  [KinshipType.BROTHER_IN_LAW]: 'Cuñado',
  [KinshipType.SISTER_IN_LAW]: 'Cuñada',
  [KinshipType.SPOUSE]: 'Cónyuge',
  [KinshipType.OTHER]: 'Otro'
};

/**
 * Valores por defecto para crear miembro de familia
 */
export const defaultCreateOlderAdultFamilyData: CreateOlderAdultFamilyData = {
  patient_id: 0,
  name: '',
  relationship: OlderAdultFamilyRelationship.OTHER,
  is_emergency_contact: false,
  involvement_level: FamilyInvolvementLevel.MEDIUM,
  status: OlderAdultFamilyStatus.ACTIVE,
  created_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultOlderAdultFamilySearchParams: OlderAdultFamilySearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'name',
  sort_order: 'asc',
  active_only: true
};

// ---- Backend API types ----
export const KinshipTypeApi = {
  SON: 'son',
  DAUGHTER: 'daughter',
  GRANDSON: 'grandson',
  GRANDDAUGHTER: 'granddaughter',
  BROTHER: 'brother',
  SISTER: 'sister',
  NEPHEW: 'nephew',
  NIECE: 'niece',
  HUSBAND: 'husband',
  WIFE: 'wife',
  LEGAL_GUARDIAN: 'legal guardian',
  OTHER: 'other',
  NOT_SPECIFIED: 'not specified',
} as const;
export type KinshipTypeApi = typeof KinshipTypeApi[keyof typeof KinshipTypeApi];

export interface OlderAdultFamilyApi {
  id: number;
  pfIdentification: string;
  pfName: string;
  pfFLastName: string;
  pfSLastName: string;
  pfPhoneNumber?: string;
  pfEmail?: string;
  pfKinship: KinshipTypeApi;
}

export interface CreateOlderAdultFamilyDto {
  pfIdentification: string;
  pfName: string;
  pfFLastName: string;
  pfSLastName: string;
  pfPhoneNumber?: string;
  pfEmail?: string;
  pfKinship: KinshipTypeApi;
}

export interface UpdateOlderAdultFamilyDto {
  pfIdentification?: string;
  pfName?: string;
  pfFLastName?: string;
  pfSLastName?: string;
  pfPhoneNumber?: string;
  pfEmail?: string;
  pfKinship?: KinshipTypeApi;
}