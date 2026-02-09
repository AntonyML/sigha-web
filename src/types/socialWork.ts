/**
 * Social Work Types
 *
 * Tipos e interfaces para el manejo de reportes de trabajo social.
 * Incluye interfaces para intervenciones sociales, seguimiento de beneficiarios y coordinación de servicios.
 */

/**
 * Estado de un reporte de trabajo social
 */
export enum SocialWorkReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

/**
 * Tipo de intervención social
 */
export enum SocialWorkInterventionType {
  FAMILY_SUPPORT = 'family_support',
  ECONOMIC_ASSISTANCE = 'economic_assistance',
  HOUSING_SUPPORT = 'housing_support',
  LEGAL_AID = 'legal_aid',
  PSYCHOLOGICAL_SUPPORT = 'psychological_support',
  HEALTHCARE_COORDINATION = 'healthcare_coordination',
  EDUCATIONAL_SUPPORT = 'educational_support',
  COMMUNITY_INTEGRATION = 'community_integration',
  ELDER_CARE = 'elder_care',
  DISABILITY_SUPPORT = 'disability_support',
  CRISIS_INTERVENTION = 'crisis_intervention',
  OTHER = 'other'
}

/**
 * Nivel de prioridad de la intervención
 */
export enum SocialWorkPriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Tipo de beneficiario
 */
export enum BeneficiaryType {
  ELDERLY_PERSON = 'elderly_person',
  FAMILY_MEMBER = 'family_member',
  CAREGIVER = 'caregiver',
  COMMUNITY_MEMBER = 'community_member'
}

/**
 * Interface principal del reporte de trabajo social
 */
export interface SocialWorkReport {
  /** ID único del reporte */
  id: number;

  /** ID del beneficiario */
  beneficiary_id: number;

  /** Tipo de beneficiario */
  beneficiary_type: BeneficiaryType;

  /** ID del trabajador social */
  social_worker_id: number;

  /** ID del área especializada (opcional) */
  specialized_area_id?: number;

  /** Tipo de intervención */
  intervention_type: SocialWorkInterventionType;

  /** Nivel de prioridad */
  priority_level: SocialWorkPriorityLevel;

  /** Estado del reporte */
  status: SocialWorkReportStatus;

  /** Fecha del reporte */
  report_date: string;

  /** Descripción detallada de la intervención (mínimo 50 caracteres) */
  description: string;

  /** Objetivos de la intervención */
  objectives: string;

  /** Acciones realizadas */
  actions_taken?: string;

  /** Resultados obtenidos */
  outcomes?: string;

  /** Recomendaciones */
  recommendations?: string;

  /** Recursos utilizados o referidos */
  resources_used?: string[];

  /** Seguimiento requerido */
  follow_up_required?: boolean;

  /** Fecha de seguimiento */
  follow_up_date?: string;

  /** Observaciones adicionales */
  additional_notes?: string;

  /** ID del aprobador (si está aprobado) */
  approved_by?: number;

  /** Fecha de aprobación */
  approved_at?: string;

  /** Comentarios de aprobación/rechazo */
  approval_comments?: string;

  /** ID del usuario que envió el reporte */
  submitted_by?: number;

  /** Fecha de envío */
  submitted_at?: string;

  /** ID del usuario que creó el reporte */
  created_by: number;

  /** Fecha de creación */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;

  /** ID del usuario que actualizó */
  updated_by?: number;
}

/**
 * Interface para crear un nuevo reporte de trabajo social
 */
export interface CreateSocialWorkReportData {
  /** ID del beneficiario (requerido) */
  beneficiary_id: number;

  /** Tipo de beneficiario (requerido) */
  beneficiary_type: BeneficiaryType;

  /** ID del trabajador social (requerido) */
  social_worker_id: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de intervención (requerido) */
  intervention_type: SocialWorkInterventionType;

  /** Nivel de prioridad (opcional, por defecto MEDIUM) */
  priority_level?: SocialWorkPriorityLevel;

  /** Estado inicial (opcional, por defecto DRAFT) */
  status?: SocialWorkReportStatus;

  /** Fecha del reporte (requerido) */
  report_date: string;

  /** Descripción detallada (requerido, mínimo 50 caracteres) */
  description: string;

  /** Objetivos de la intervención (requerido) */
  objectives: string;

  /** Seguimiento requerido */
  follow_up_required?: boolean;

  /** Fecha de seguimiento */
  follow_up_date?: string;

  /** ID del usuario que crea (requerido) */
  created_by: number;
}

/**
 * Interface para actualizar un reporte de trabajo social existente
 */
export interface UpdateSocialWorkReportData {
  /** ID del beneficiario */
  beneficiary_id?: number;

  /** Tipo de beneficiario */
  beneficiary_type?: BeneficiaryType;

  /** ID del trabajador social */
  social_worker_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de intervención */
  intervention_type?: SocialWorkInterventionType;

  /** Nivel de prioridad */
  priority_level?: SocialWorkPriorityLevel;

  /** Estado del reporte */
  status?: SocialWorkReportStatus;

  /** Fecha del reporte */
  report_date?: string;

  /** Descripción detallada */
  description?: string;

  /** Objetivos de la intervención */
  objectives?: string;

  /** Acciones realizadas */
  actions_taken?: string;

  /** Resultados obtenidos */
  outcomes?: string;

  /** Recomendaciones */
  recommendations?: string;

  /** Recursos utilizados */
  resources_used?: SocialWorkInterventionType[];

  /** Seguimiento requerido */
  follow_up_required?: boolean;

  /** Fecha de seguimiento */
  follow_up_date?: string;

  /** Observaciones adicionales */
  additional_notes?: string;

  /** Comentarios de aprobación/rechazo */
  approval_comments?: string;

  /** ID del usuario que actualiza */
  updated_by?: number;
}

/**
 * Interface para enviar un reporte de trabajo social
 */
export interface SubmitSocialWorkReportData {
  /** ID del usuario que envía */
  submitted_by: number;

  /** Comentarios adicionales al enviar */
  submission_comments?: string;
}

/**
 * Interface para aprobar/rechazar un reporte de trabajo social
 */
export interface ApproveSocialWorkReportData {
  /** Acción: aprobar o rechazar */
  action: 'approve' | 'reject';

  /** ID del usuario que aprueba/rechaza */
  approved_by: number;

  /** Comentarios de aprobación/rechazo */
  approval_comments?: string;
}

/**
 * Parámetros de búsqueda para reportes de trabajo social
 */
export interface SocialWorkReportSearchParams {
  /** ID del beneficiario */
  beneficiary_id?: number;

  /** Tipo de beneficiario */
  beneficiary_type?: BeneficiaryType;

  /** ID del trabajador social */
  social_worker_id?: number;

  /** ID del área especializada */
  specialized_area_id?: number;

  /** Tipo de intervención */
  intervention_type?: SocialWorkInterventionType;

  /** Nivel de prioridad */
  priority_level?: SocialWorkPriorityLevel;

  /** Estado del reporte */
  status?: SocialWorkReportStatus;

  /** ID del usuario que creó */
  created_by?: number;

  /** ID del usuario que aprobó */
  approved_by?: number;

  /** Fecha desde (formato YYYY-MM-DD) */
  date_from?: string;

  /** Fecha hasta (formato YYYY-MM-DD) */
  date_to?: string;

  /** Solo reportes con seguimiento requerido */
  follow_up_required?: boolean;

  /** Solo reportes pendientes de aprobación */
  pending_approval?: boolean;

  /** Búsqueda por texto en descripción u objetivos */
  search_text?: string;

  /** Página para paginación */
  page?: number;

  /** Límite de resultados por página */
  limit?: number;

  /** Ordenar por campo */
  sort_by?: 'report_date' | 'created_at' | 'status' | 'intervention_type' | 'priority_level' | 'beneficiary_id';

  /** Dirección del ordenamiento */
  sort_order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para reportes de trabajo social
 */
export interface SocialWorkReportApiResponse {
  /** Datos de los reportes de trabajo social */
  data: SocialWorkReport[];

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
 * Respuesta de la API para un reporte de trabajo social individual
 */
export interface SocialWorkReportSingleApiResponse {
  /** Datos del reporte de trabajo social */
  data: SocialWorkReport;
}

/**
 * Interface para estadísticas de intervención social
 */
export interface SocialWorkInterventionStats {
  /** ID de la estadística */
  id: number;

  /** Tipo de intervención */
  intervention_type: SocialWorkInterventionType;

  /** Número total de intervenciones */
  total_interventions: number;

  /** Número de intervenciones exitosas */
  successful_interventions: number;

  /** Tasa de éxito */
  success_rate: number;

  /** Número de beneficiarios únicos */
  unique_beneficiaries: number;

  /** Promedio de tiempo de resolución (días) */
  average_resolution_time: number;

  /** Mes de referencia */
  reference_month: string;

  /** Año de referencia */
  reference_year: number;
}

/**
 * Estadísticas generales de trabajo social
 */
export interface SocialWorkStats {
  /** Total de reportes en el período */
  total_reports: number;

  /** Reportes por estado */
  reports_by_status: Record<SocialWorkReportStatus, number>;

  /** Reportes por tipo de intervención */
  reports_by_intervention: Record<SocialWorkInterventionType, number>;

  /** Reportes por prioridad */
  reports_by_priority: Record<SocialWorkPriorityLevel, number>;

  /** Reportes por tipo de beneficiario */
  reports_by_beneficiary_type: Record<BeneficiaryType, number>;

  /** Tasa de aprobación de reportes */
  approval_rate: number;

  /** Promedio de tiempo de aprobación (días) */
  average_approval_time: number;

  /** Número de beneficiarios activos */
  active_beneficiaries: number;

  /** Número de intervenciones con seguimiento */
  follow_up_interventions: number;
}

/**
 * Constantes para etiquetas de tipos de intervención
 */
export const SOCIAL_WORK_INTERVENTION_LABELS: Record<SocialWorkInterventionType, string> = {
  [SocialWorkInterventionType.FAMILY_SUPPORT]: 'Apoyo Familiar',
  [SocialWorkInterventionType.ECONOMIC_ASSISTANCE]: 'Asistencia Económica',
  [SocialWorkInterventionType.HOUSING_SUPPORT]: 'Apoyo Habitacional',
  [SocialWorkInterventionType.LEGAL_AID]: 'Asistencia Legal',
  [SocialWorkInterventionType.PSYCHOLOGICAL_SUPPORT]: 'Apoyo Psicológico',
  [SocialWorkInterventionType.HEALTHCARE_COORDINATION]: 'Coordinación de Salud',
  [SocialWorkInterventionType.EDUCATIONAL_SUPPORT]: 'Apoyo Educativo',
  [SocialWorkInterventionType.COMMUNITY_INTEGRATION]: 'Integración Comunitaria',
  [SocialWorkInterventionType.ELDER_CARE]: 'Cuidado de Ancianos',
  [SocialWorkInterventionType.DISABILITY_SUPPORT]: 'Apoyo para Discapacidad',
  [SocialWorkInterventionType.CRISIS_INTERVENTION]: 'Intervención en Crisis',
  [SocialWorkInterventionType.OTHER]: 'Otro'
};

/**
 * Constantes para etiquetas de tipos de beneficiario
 */
export const BENEFICIARY_TYPE_LABELS: Record<BeneficiaryType, string> = {
  [BeneficiaryType.ELDERLY_PERSON]: 'Persona Anciana',
  [BeneficiaryType.FAMILY_MEMBER]: 'Familiar',
  [BeneficiaryType.CAREGIVER]: 'Cuidador',
  [BeneficiaryType.COMMUNITY_MEMBER]: 'Miembro de Comunidad'
};

/**
 * Constantes para etiquetas de niveles de prioridad
 */
export const SOCIAL_WORK_PRIORITY_LABELS: Record<SocialWorkPriorityLevel, string> = {
  [SocialWorkPriorityLevel.LOW]: 'Baja',
  [SocialWorkPriorityLevel.MEDIUM]: 'Media',
  [SocialWorkPriorityLevel.HIGH]: 'Alta',
  [SocialWorkPriorityLevel.URGENT]: 'Urgente'
};

/**
 * Valores por defecto para crear reporte de trabajo social
 */
export const defaultCreateSocialWorkReportData: CreateSocialWorkReportData = {
  beneficiary_id: 0,
  beneficiary_type: BeneficiaryType.ELDERLY_PERSON,
  social_worker_id: 0,
  intervention_type: SocialWorkInterventionType.ELDER_CARE,
  priority_level: SocialWorkPriorityLevel.MEDIUM,
  status: SocialWorkReportStatus.DRAFT,
  report_date: '',
  description: '',
  objectives: '',
  follow_up_required: false,
  created_by: 0
};

/**
 * Valores por defecto para parámetros de búsqueda
 */
export const defaultSocialWorkReportSearchParams: SocialWorkReportSearchParams = {
  page: 1,
  limit: 10,
  sort_by: 'report_date',
  sort_order: 'desc',
  pending_approval: false
};