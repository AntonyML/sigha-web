/**
 * Clinical History Validations
 *
 * Validaciones de negocio para el historial clínico.
 * Incluye validaciones de datos, reglas de negocio y mensajes de error.
 */

import type { CreateClinicalHistoryData, UpdateClinicalHistoryData } from '../../../../types/clinicalHistory';

/**
 * Valida los datos para crear un historial clínico
 *
 * @param data - Datos del historial clínico
 * @returns Mensaje de error o null si es válido
 */
export function validateClinicalHistoryData(data: CreateClinicalHistoryData): string | null {
    // TODO: Implementar validaciones específicas cuando se definan los tipos
    // Validaciones básicas por ahora

    if (!data || typeof data !== 'object') {
        return 'Los datos del historial clínico son requeridos.';
    }

    // Validar que tenga al menos un campo básico
    // Esto se actualizará cuando se definan los tipos específicos

    return null; // Datos válidos
}

/**
 * Valida el ID de un historial clínico
 *
 * @param id - ID a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateClinicalHistoryId(id: string | number): string | null {
    if (id === null || id === undefined) {
        return 'El ID del historial clínico es requerido.';
    }

    if (typeof id === 'string') {
        if (!id.trim()) {
            return 'El ID del historial clínico no puede estar vacío.';
        }

        // Intentar convertir a número si es string numérico
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return 'El ID del historial clínico debe ser un número válido.';
        }
    } else if (typeof id === 'number') {
        if (id <= 0) {
            return 'El ID del historial clínico debe ser un número positivo.';
        }
    } else {
        return 'El ID del historial clínico debe ser un número o string numérico.';
    }

    return null; // ID válido
}

/**
 * Obtiene el mensaje de error para operaciones del historial clínico
 *
 * @param operation - Operación que falló
 * @param error - Error original
 * @returns Mensaje de error amigable
 */
export function getClinicalHistoryErrorMessage(operation: string, error: unknown): string {
    const operationMessages: Record<string, string> = {
        'getAll': 'Error al obtener los historiales clínicos.',
        'getById': 'Error al obtener el historial clínico.',
        'create': 'Error al crear el historial clínico.',
        'update': 'Error al actualizar el historial clínico.',
        'delete': 'Error al eliminar el historial clínico.',
    };

    const baseMessage = operationMessages[operation] || 'Error en la operación del historial clínico.';

    if (error instanceof Error) {
        // Aquí se pueden agregar mapeos específicos de errores del backend
        if (error.message.includes('404')) {
            return 'Historial clínico no encontrado.';
        }
        if (error.message.includes('403')) {
            return 'No tienes permisos para realizar esta operación.';
        }
        if (error.message.includes('400')) {
            return 'Los datos proporcionados no son válidos.';
        }
    }

    return baseMessage;
}

/**
 * Valida permisos para operaciones del historial clínico
 *
 * @param operation - Operación a validar
 * @param userRole - Rol del usuario
 * @returns true si tiene permisos, false si no
 */
export function validateClinicalHistoryPermissions(operation: string, userRole?: string): boolean {
    // TODO: Implementar validaciones de permisos cuando se defina el sistema de roles
    // Por ahora, permitir todas las operaciones
    return true;
}