/**
 * Specialized Audit Validations
 * Validaciones para operaciones especializadas de auditoría
 */

/**
 * Valida ID de usuario para operaciones de auditoría
 */
export function validateUserId(userId: number): string | null {
  if (!userId || userId <= 0) {
    return 'El ID de usuario debe ser un número positivo.';
  }

  if (!Number.isInteger(userId)) {
    return 'El ID de usuario debe ser un número entero.';
  }

  return null;
}

/**
 * Valida parámetros de entidad para operaciones de auditoría
 */
export function validateEntityParams(entity: string, entityId: number): string | null {
  if (!entity || typeof entity !== 'string') {
    return 'El nombre de la entidad es requerido.';
  }

  if (entity.trim() !== entity) {
    return 'El nombre de la entidad no debe tener espacios al inicio o final.';
  }

  if (!entityId || entityId <= 0) {
    return 'El ID de la entidad debe ser un número positivo.';
  }

  if (!Number.isInteger(entityId)) {
    return 'El ID de la entidad debe ser un número entero.';
  }

  return null;
}

/**
 * Valida ID de registro para historial
 */
export function validateRecordId(recordId: string): string | null {
  if (!recordId || typeof recordId !== 'string') {
    return 'El ID del registro es requerido.';
  }

  if (recordId.trim() !== recordId) {
    return 'El ID del registro no debe tener espacios al inicio o final.';
  }

  if (recordId.length === 0) {
    return 'El ID del registro no puede estar vacío.';
  }

  return null;
}