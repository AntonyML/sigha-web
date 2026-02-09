/**
 * Specialized Appointment Validations
 *
 * Validaciones de negocio para las citas especializadas.
 * Incluye validaciones de datos, reglas de negocio y mensajes de error.
 */

// TODO: Importar tipos cuando estén creados
// import type { CreateSpecializedAppointmentData, UpdateSpecializedAppointmentData } from '../../../../types/specializedAppointment';

/**
 * Valida los datos para crear una cita especializada
 *
 * @param data - Datos de la cita especializada
 * @returns Mensaje de error o null si es válido
 */
export function validateSpecializedAppointmentData(data: any): string | null {
    // TODO: Implementar validaciones específicas cuando se definan los tipos
    // Validaciones básicas por ahora

    if (!data || typeof data !== 'object') {
        return 'Los datos de la cita especializada son requeridos.';
    }

    // Validar que tenga al menos un campo básico
    // Esto se actualizará cuando se definan los tipos específicos

    return null; // Datos válidos
}

/**
 * Valida el ID de una cita especializada
 *
 * @param id - ID a validar
 * @returns Mensaje de error o null si es válido
 */
export function validateSpecializedAppointmentId(id: string | number): string | null {
    if (id === null || id === undefined) {
        return 'El ID de la cita especializada es requerido.';
    }

    if (typeof id === 'string') {
        if (!id.trim()) {
            return 'El ID de la cita especializada no puede estar vacío.';
        }

        // Intentar convertir a número si es string numérico
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return 'El ID de la cita especializada debe ser un número válido.';
        }
    } else if (typeof id === 'number') {
        if (id <= 0) {
            return 'El ID de la cita especializada debe ser un número positivo.';
        }
    } else {
        return 'El ID de la cita especializada debe ser un número o string numérico.';
    }

    return null; // ID válido
}

/**
 * Obtiene el mensaje de error para operaciones de citas especializadas
 *
 * @param operation - Operación que falló
 * @param error - Error original
 * @returns Mensaje de error amigable
 */
export function getSpecializedAppointmentErrorMessage(operation: string, error: unknown): string {
    const operationMessages: Record<string, string> = {
        'getAll': 'Error al obtener las citas especializadas.',
        'getById': 'Error al obtener la cita especializada.',
        'create': 'Error al crear la cita especializada.',
        'update': 'Error al actualizar la cita especializada.',
        'cancel': 'Error al cancelar la cita especializada.',
        'complete': 'Error al completar la cita especializada.',
    };

    const baseMessage = operationMessages[operation] || 'Error en la operación de la cita especializada.';

    if (error instanceof Error) {
        // Aquí se pueden agregar mapeos específicos de errores del backend
        if (error.message.includes('404')) {
            return 'Cita especializada no encontrada.';
        }
        if (error.message.includes('403')) {
            return 'No tienes permisos para realizar esta operación.';
        }
        if (error.message.includes('400')) {
            return 'Los datos proporcionados no son válidos.';
        }
        if (error.message.includes('409')) {
            return 'Conflicto en la programación de la cita.';
        }
    }

    return baseMessage;
}

/**
 * Valida permisos para operaciones de citas especializadas
 *
 * @param operation - Operación a validar
 * @param userRole - Rol del usuario
 * @returns true si tiene permisos, false si no
 */
export function validateSpecializedAppointmentPermissions(operation: string, userRole?: string): boolean {
    // TODO: Implementar validaciones de permisos cuando se defina el sistema de roles
    // Por ahora, permitir todas las operaciones
    return true;
}

/**
 * Valida que una cita pueda ser cancelada
 *
 * @param appointmentData - Datos de la cita
 * @returns Mensaje de error o null si puede ser cancelada
 */
export function validateAppointmentCancellation(appointmentData: any): string | null {
    // TODO: Implementar validaciones específicas de negocio para cancelación
    // Por ejemplo: no permitir cancelar citas que ya pasaron, etc.

    return null; // Puede ser cancelada
}

/**
 * Valida que una cita pueda ser completada
 *
 * @param appointmentData - Datos de la cita
 * @returns Mensaje de error o null si puede ser completada
 */
export function validateAppointmentCompletion(appointmentData: any): string | null {
    // TODO: Implementar validaciones específicas de negocio para completación
    // Por ejemplo: verificar que la cita esté en estado programada, etc.

    return null; // Puede ser completada
}