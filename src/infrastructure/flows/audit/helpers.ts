import type { AuditAction } from '../../../types/audit';
import type { DigitalRecord } from '../../../types/audit';

/**
 * Formatea la fecha de un registro de auditoría
 */
export function formatAuditDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
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
 * Determina si una auditoría es crítica (requiere atención)
 */
export function isCriticalAudit(record: DigitalRecord): boolean {
  const criticalActions: AuditAction[] = ['delete'];
  const criticalTables = ['users', 'roles', 'older_adult'];

  return (
    criticalActions.includes(record.action) ||
    (record.tableName !== null && criticalTables.includes(record.tableName))
  );
}

/**
 * Obtiene una descripción amigable y explicativa del registro de auditoría
 * Convierte información técnica en lenguaje natural para usuarios finales
 */
export function getAuditDescription(record: DigitalRecord): {
  userFriendly: string;
  technical?: string;
} {
  const { action, tableName, description, recordId } = record;
  const tableLabel = getTableLabel(tableName || '');

  // Descripciones específicas para casos comunes
  if (description) {
    // Casos de envío de códigos de verificación
    if (description.includes('Send code_verify') && description.includes('code_verifiy_email')) {
      return {
        userFriendly: `Se envió un código de verificación al correo electrónico para ${action === 'create' ? 'registro' : 'recuperación'} de cuenta`,
        technical: `Send code_verify id=code_verifiy_email (ID: ${recordId || 'N/A'})`
      };
    }

    // Casos de envío de códigos 2FA
    if (description.includes('Send 6_codes_2fa') && description.includes('6_codes_2fa_email')) {
      return {
        userFriendly: 'Se enviaron 6 códigos de autenticación de dos factores al correo electrónico',
        technical: `Send 6_codes_2fa id=6_codes_2fa_email (ID: ${recordId || 'N/A'})`
      };
    }

    if (description.includes('Send 8_codes_2fa') && description.includes('8_codes_2fa_email')) {
      return {
        userFriendly: 'Se enviaron 8 códigos de autenticación de dos factores al correo electrónico',
        technical: `Send 8_codes_2fa id=8_codes_2fa_email (ID: ${recordId || 'N/A'})`
      };
    }

    // Casos de login/logout
    if (action === 'login' && tableName === 'users') {
      return {
        userFriendly: 'Inicio de sesión exitoso en el sistema',
        technical: description
      };
    }

    if (action === 'logout' && tableName === 'users') {
      return {
        userFriendly: 'Cierre de sesión del sistema',
        technical: description
      };
    }

    // Casos de creación/edición/eliminación de registros
    if (action === 'create' && tableName) {
      return {
        userFriendly: `Se creó un nuevo registro en ${tableLabel}`,
        technical: `${description} (ID: ${recordId || 'N/A'})`
      };
    }

    if (action === 'update' && tableName) {
      return {
        userFriendly: `Se actualizó un registro en ${tableLabel}`,
        technical: `${description} (ID: ${recordId || 'N/A'})`
      };
    }

    if (action === 'delete' && tableName) {
      return {
        userFriendly: `Se eliminó un registro de ${tableLabel}`,
        technical: `${description} (ID: ${recordId || 'N/A'})`
      };
    }

    if (action === 'view' && tableName) {
      return {
        userFriendly: `Se consultó información de ${tableLabel}`,
        technical: `${description} (ID: ${recordId || 'N/A'})`
      };
    }

    if (action === 'export' && tableName) {
      return {
        userFriendly: `Se exportaron datos de ${tableLabel}`,
        technical: `${description} (ID: ${recordId || 'N/A'})`
      };
    }
  }

  // Descripción por defecto si no hay casos específicos
  const actionLabel = getActionLabel(action);
  const baseDescription = tableName
    ? `${actionLabel} en ${tableLabel}${recordId ? ` (ID: ${recordId})` : ''}`
    : `${actionLabel}${recordId ? ` (ID: ${recordId})` : ''}`;

  return {
    userFriendly: baseDescription,
    technical: description || undefined
  };
}

/**
 * Obtiene información adicional técnica del registro (opcional)
 */
export function getAuditTechnicalInfo(record: DigitalRecord): string | null {
  const description = getAuditDescription(record);
  return description.technical || null;
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