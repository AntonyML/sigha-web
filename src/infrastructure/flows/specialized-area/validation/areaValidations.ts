/**
 * Specialized Area Validations
 *
 * Validaciones de negocio para las áreas especializadas.
 * Incluye validaciones de datos, reglas de negocio y mensajes de error.
 */

import type { CreateSpecializedAreaData, UpdateSpecializedAreaData } from '../../../../types/specializedArea';
import type { AxiosError } from 'axios';

/**
 * Valida los datos para crear un área especializada
 *
 * @param data - Datos del área especializada
 * @returns Mensaje de error o null si es válido
 */
export function validateSpecializedAreaData(data: CreateSpecializedAreaData): string | null {
    // TODO: Implementar validaciones específicas cuando se definan los tipos
    // Validaciones básicas por ahora

    if (!data || typeof data !== 'object') {
        return 'Los datos del área especializada son requeridos.';
    }

    // Validar que tenga al menos un campo básico
    // Esto se actualizará cuando se definan los tipos específicos

    return null; // Datos válidos
}

/**
 * Valida el ID de un área especializada
 *
 * @param id - ID a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateSpecializedAreaId(id: string | number): string | null {
    if (id === null || id === undefined) {
        return 'El ID del área especializada es requerido.';
    }

    if (typeof id === 'string') {
        if (!id.trim()) {
            return 'El ID del área especializada no puede estar vacío.';
        }

        // Intentar convertir a número si es string numérico
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return 'El ID del área especializada debe ser un número válido.';
        }
    } else if (typeof id === 'number') {
        if (id <= 0) {
            return 'El ID del área especializada debe ser un número positivo.';
        }
    } else {
        return 'El ID del área especializada debe ser un número o string numérico.';
    }

    return null; // ID válido
}

/**
 * Obtiene el mensaje de error para operaciones de áreas especializadas
 *
 * @param operation - Operación que falló
 * @param error - Error original
 * @returns Mensaje de error amigable
 */
export function getSpecializedAreaErrorMessage(operation: string, error: unknown): string {
    const operationMessages: Record<string, string> = {
        'getAll': 'Error al obtener las áreas especializadas.',
        'getById': 'Error al obtener el área especializada.',
        'create': 'Error al crear el área especializada.',
        'update': 'Error al actualizar el área especializada.',
        'delete': 'Error al eliminar el área especializada.',
    };

    const baseMessage = operationMessages[operation] || 'Error en la operación del área especializada.';

    if (error instanceof Error) {
        // Aquí se pueden agregar mapeos específicos de errores del backend
        if (error.message.includes('404')) {
            return 'Área especializada no encontrada.';
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
 * Valida permisos para operaciones de áreas especializadas
 *
 * @param operation - Operación a validar
 * @param userRole - Rol del usuario
 * @returns true si tiene permisos, false si no
 */
export function validateSpecializedAreaPermissions(operation: string, userRole?: string): boolean {
    // TODO: Implementar validaciones de permisos cuando se defina el sistema de roles
    // Por ahora, permitir todas las operaciones
    return true;
}