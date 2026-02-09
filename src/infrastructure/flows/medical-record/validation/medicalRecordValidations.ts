/**
 * Medical Record Validations
 *
 * Validaciones de negocio para los registros médicos.
 * Incluye validaciones de datos, reglas de negocio y mensajes de error.
 */

// TODO: Importar tipos cuando estén creados
// import type { CreateMedicalRecordData, UpdateMedicalRecordData } from '../../../../types/medicalRecord';

/**
 * Valida los datos para crear un registro médico
 *
 * @param data - Datos del registro médico
 * @returns Mensaje de error o null si es válido
 */
export function validateMedicalRecordData(data: any): string | null {
    // TODO: Implementar validaciones específicas cuando se definan los tipos
    // Validaciones básicas por ahora

    if (!data || typeof data !== 'object') {
        return 'Los datos del registro médico son requeridos.';
    }

    // Validar que tenga al menos un campo básico
    // Esto se actualizará cuando se definan los tipos específicos

    return null; // Datos válidos
}

/**
 * Valida el ID de un registro médico
 *
 * @param id - ID a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateMedicalRecordId(id: string | number): string | null {
    if (id === null || id === undefined) {
        return 'El ID del registro médico es requerido.';
    }

    if (typeof id === 'string') {
        if (!id.trim()) {
            return 'El ID del registro médico no puede estar vacío.';
        }

        // Intentar convertir a número si es string numérico
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return 'El ID del registro médico debe ser un número válido.';
        }
    } else if (typeof id === 'number') {
        if (id <= 0) {
            return 'El ID del registro médico debe ser un número positivo.';
        }
    } else {
        return 'El ID del registro médico debe ser un número o string numérico.';
    }

    return null; // ID válido
}

/**
 * Obtiene el mensaje de error para operaciones de registros médicos
 *
 * @param operation - Operación que falló
 * @param error - Error original
 * @returns Mensaje de error amigable
 */
export function getMedicalRecordErrorMessage(operation: string, error: unknown): string {
    const operationMessages: Record<string, string> = {
        'getAll': 'Error al obtener los registros médicos.',
        'getById': 'Error al obtener el registro médico.',
        'create': 'Error al crear el registro médico.',
        'update': 'Error al actualizar el registro médico.',
        'delete': 'Error al eliminar el registro médico.',
    };

    const baseMessage = operationMessages[operation] || 'Error en la operación del registro médico.';

    if (error instanceof Error) {
        // Aquí se pueden agregar mapeos específicos de errores del backend
        if (error.message.includes('404')) {
            return 'Registro médico no encontrado.';
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
 * Valida permisos para operaciones de registros médicos
 *
 * @param operation - Operación a validar
 * @param userRole - Rol del usuario
 * @returns true si tiene permisos, false si no
 */
export function validateMedicalRecordPermissions(operation: string, userRole?: string): boolean {
    // TODO: Implementar validaciones de permisos cuando se defina el sistema de roles
    // Por ahora, permitir todas las operaciones
    return true;
}