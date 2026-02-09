/**
 * Clinical Medication Validations
 *
 * Validaciones de negocio para los medicamentos clínicos.
 * Incluye validaciones de datos, reglas de negocio y mensajes de error.
 */

// TODO: Importar tipos cuando estén creados
// import type { CreateClinicalMedicationData, UpdateClinicalMedicationData } from '../../../../types/clinicalMedication';

/**
 * Valida los datos para crear un medicamento clínico
 *
 * @param data - Datos del medicamento clínico
 * @returns Mensaje de error o null si es válido
 */
export function validateClinicalMedicationData(data: any): string | null {
    // TODO: Implementar validaciones específicas cuando se definan los tipos
    // Validaciones básicas por ahora

    if (!data || typeof data !== 'object') {
        return 'Los datos del medicamento clínico son requeridos.';
    }

    // Validar que tenga al menos un campo básico
    // Esto se actualizará cuando se definan los tipos específicos

    return null; // Datos válidos
}

/**
 * Valida el ID de un medicamento clínico
 *
 * @param id - ID a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateClinicalMedicationId(id: string | number): string | null {
    if (id === null || id === undefined) {
        return 'El ID del medicamento clínico es requerido.';
    }

    if (typeof id === 'string') {
        if (!id.trim()) {
            return 'El ID del medicamento clínico no puede estar vacío.';
        }

        // Intentar convertir a número si es string numérico
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return 'El ID del medicamento clínico debe ser un número válido.';
        }
    } else if (typeof id === 'number') {
        if (id <= 0) {
            return 'El ID del medicamento clínico debe ser un número positivo.';
        }
    } else {
        return 'El ID del medicamento clínico debe ser un número o string numérico.';
    }

    return null; // ID válido
}

/**
 * Obtiene el mensaje de error para operaciones de medicamentos clínicos
 *
 * @param operation - Operación que falló
 * @param error - Error original
 * @returns Mensaje de error amigable
 */
export function getClinicalMedicationErrorMessage(operation: string, error: unknown): string {
    const operationMessages: Record<string, string> = {
        'getAll': 'Error al obtener los medicamentos clínicos.',
        'getById': 'Error al obtener el medicamento clínico.',
        'create': 'Error al crear el medicamento clínico.',
        'update': 'Error al actualizar el medicamento clínico.',
        'delete': 'Error al eliminar el medicamento clínico.',
    };

    const baseMessage = operationMessages[operation] || 'Error en la operación del medicamento clínico.';

    if (error instanceof Error) {
        // Aquí se pueden agregar mapeos específicos de errores del backend
        if (error.message.includes('404')) {
            return 'Medicamento clínico no encontrado.';
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
 * Valida permisos para operaciones de medicamentos clínicos
 *
 * @param operation - Operación a validar
 * @param userRole - Rol del usuario
 * @returns true si tiene permisos, false si no
 */
export function validateClinicalMedicationPermissions(operation: string, userRole?: string): boolean {
    // TODO: Implementar validaciones de permisos cuando se defina el sistema de roles
    // Por ahora, permitir todas las operaciones
    return true;
}