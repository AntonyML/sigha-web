import type { AuditAction } from '../../../types/audit';
import type {  AuditReport } from '../../../types/audit';

/**
 * Formatea la fecha de un registro de auditoría
 * Maneja múltiples formatos de fecha del backend
 */
export function formatAuditDate(dateString: string | undefined | null): string {
  if (!dateString) return 'Fecha no disponible';

  try {
    // Intentar parsear como fecha ISO
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }

    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando fecha:', dateString, error);
    return dateString || 'Fecha no disponible';
  }
}

/**
 * Obtiene una descripción amigable de la acción
 * Sincronizado con backend enum AuditAction
 */
export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    login: 'Inicio de sesión',
    logout: 'Cierre de sesión',
    create: 'Creación',
    update: 'Actualización',
    delete: 'Eliminación',
    view: 'Visualización',
    export: 'Exportación',
    other: 'Otra acción',
  };

  return labels[action] || action;
}

/**
 * Obtiene una descripción amigable de la tabla
 * Backend usa nombres de tabla MySQL directamente
 */
export function getTableLabel(tableName: string | null): string {
  if (!tableName) return 'Sistema';

  const labels: Record<string, string> = {
    users: 'Usuarios',
    roles: 'Roles',
    older_adult: 'Adultos Mayores',
    older_adult_family: 'Familiares',
    programs: 'Programas',
    sub_programs: 'Subprogramas',
    clinical_history: 'Historia Clínica',
    clinical_medication: 'Medicación',
    entrances_exits: 'Entradas/Salidas',
    specialized_area: 'Áreas Especializadas',
    specialized_appointment: 'Citas',
    nursing_records: 'Registros de Enfermería',
    physiotherapy_sessions: 'Sesiones de Fisioterapia',
    psychology_sessions: 'Sesiones de Psicología',
    social_work_reports: 'Reportes de Trabajo Social',
    medical_record: 'Expediente Médico',
    digital_record: 'Registros Digitales',
    audit_reports: 'Reportes de Auditoría',
    notifications: 'Notificaciones',
  };

  return labels[tableName] || tableName;
}

/**
 * Obtiene la clase CSS para el badge de acción
 */
export function getActionBadgeClass(action: AuditAction): string {
  const classes: Record<AuditAction, string> = {
    create: 'bg-success',
    update: 'bg-primary',
    delete: 'bg-danger',
    login: 'bg-info',
    logout: 'bg-secondary',
    view: 'bg-secondary',
    export: 'bg-info',
    other: 'bg-secondary',
  };

  return classes[action] || 'bg-secondary';
}

/**
 * Obtiene una descripción amigable y explicativa del reporte de auditoría
 * Convierte información técnica en lenguaje natural para usuarios finales
 */
export function getAuditReportDescription(record: AuditReport): {
  userFriendly: string;
  technical?: string;
} {
  const { ar_action, ar_entity_name, ar_observations, ar_entity_id } = record;
  const tableLabel = getTableLabel(ar_entity_name || '');

  // Descripciones específicas para casos comunes
  if (ar_observations) {
    // Casos de envío de códigos de verificación
    if (ar_observations.includes('Send code_verify') && ar_observations.includes('code_verifiy_email')) {
      return {
        userFriendly: `Se envió un código de verificación al correo electrónico para ${ar_action === 'create' ? 'registro' : 'recuperación'} de cuenta`,
        technical: `Send code_verify id=code_verifiy_email (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    // Casos de envío de códigos 2FA
    if (ar_observations.includes('Send 6_codes_2fa') && ar_observations.includes('6_codes_2fa_email')) {
      return {
        userFriendly: 'Se enviaron 6 códigos de autenticación de dos factores al correo electrónico',
        technical: `Send 6_codes_2fa id=6_codes_2fa_email (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    if (ar_observations.includes('Send 8_codes_2fa') && ar_observations.includes('8_codes_2fa_email')) {
      return {
        userFriendly: 'Se enviaron 8 códigos de autenticación de dos factores al correo electrónico',
        technical: `Send 8_codes_2fa id=8_codes_2fa_email (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    // Casos de login/logout
    if (ar_action === 'login' && ar_entity_name === 'users') {
      return {
        userFriendly: 'Inicio de sesión exitoso en el sistema',
        technical: ar_observations
      };
    }

    if (ar_action === 'logout' && ar_entity_name === 'users') {
      return {
        userFriendly: 'Cierre de sesión del sistema',
        technical: ar_observations
      };
    }

    // Casos de creación/edición/eliminación de registros
    if (ar_action === 'create' && ar_entity_name) {
      return {
        userFriendly: `Se creó un nuevo registro en ${tableLabel}`,
        technical: `${ar_observations} (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    if (ar_action === 'update' && ar_entity_name) {
      return {
        userFriendly: `Se actualizó un registro en ${tableLabel}`,
        technical: `${ar_observations} (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    if (ar_action === 'delete' && ar_entity_name) {
      return {
        userFriendly: `Se eliminó un registro de ${tableLabel}`,
        technical: `${ar_observations} (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    if (ar_action === 'view' && ar_entity_name) {
      return {
        userFriendly: `Se consultó información de ${tableLabel}`,
        technical: `${ar_observations} (ID: ${ar_entity_id || 'N/A'})`
      };
    }

    if (ar_action === 'export' && ar_entity_name) {
      return {
        userFriendly: `Se exportaron datos de ${tableLabel}`,
        technical: `${ar_observations} (ID: ${ar_entity_id || 'N/A'})`
      };
    }
  }

  // Descripción por defecto si no hay casos específicos
  const actionLabel = getActionLabel(ar_action as AuditAction);
  const baseDescription = ar_entity_name
    ? `${actionLabel} en ${tableLabel}${ar_entity_id ? ` (ID: ${ar_entity_id})` : ''}`
    : `${actionLabel}${ar_entity_id ? ` (ID: ${ar_entity_id})` : ''}`;

  return {
    userFriendly: baseDescription,
    technical: ar_observations || undefined
  };
}

/**
 * Obtiene icono para la acción
 */
export function getActionIcon(action: AuditAction): string {
  const icons: Record<AuditAction, string> = {
    login: 'arrow_right_circle',
    logout: 'arrow_left_circle',
    create: 'plus',
    update: 'pencil',
    delete: 'trash',
    view: 'eye',
    export: 'arrow_down_tray',
    other: 'document',
  };

  return icons[action] || 'document';
}