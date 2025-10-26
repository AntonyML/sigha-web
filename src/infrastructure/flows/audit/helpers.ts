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
 * Obtiene icono para la acción
 */
export function getActionIcon(action: AuditAction): string {
  const icons: Record<AuditAction, string> = {
    login: '🔓',
    logout: '🔒',
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    view: '👁️',
    export: '📤',
    other: '📋',
  };

  return icons[action] || '📋';
}