/**
 * Main Audit Validations
 * Validaciones para operaciones principales de auditoría
 */

import type { SearchDigitalRecordsDto } from '../../../../types/audit';

/**
 * Valida parámetros de búsqueda de registros digitales
 */
export function validateSearchParams(params?: SearchDigitalRecordsDto): string | null {
  if (params && typeof params !== 'object') {
    return 'Los parámetros de búsqueda deben ser un objeto válido.';
  }

  // Validar filtros de fecha si están presentes
  if (params?.startDate && params?.endDate) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Las fechas de búsqueda deben tener un formato válido.';
    }

    if (startDate > endDate) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
    }
  }

  return null;
}

/**
 * Valida ID de registro digital
 */
export function validateDigitalRecordId(id: number): string | null {
  if (!id || id <= 0) {
    return 'El ID del registro digital debe ser un número positivo.';
  }

  if (!Number.isInteger(id)) {
    return 'El ID del registro digital debe ser un número entero.';
  }

  return null;
}