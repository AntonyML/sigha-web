/**
 * Reports Audit Validations
 * Validaciones para operaciones de reportes de auditoría
 */

/**
 * Valida ID de reporte de auditoría
 */
export function validateAuditReportId(id: number): string | null {
  if (!id || id <= 0) {
    return 'El ID del reporte de auditoría debe ser un número positivo.';
  }

  if (!Number.isInteger(id)) {
    return 'El ID del reporte de auditoría debe ser un número entero.';
  }

  return null;
}