/**
 * Physiotherapy Validations
 *
 * Funciones de validación de negocio para sesiones de fisioterapia.
 * Incluye validaciones de datos, IDs y operaciones específicas del dominio.
 */

/**
 * Resultado de validación
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Errores de validación para fisioterapia
 */
export const PhysiotherapyValidationError = {
    INVALID_ID: 'INVALID_ID',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
    INVALID_DATE: 'INVALID_DATE',
    INVALID_DURATION: 'INVALID_DURATION',
    INVALID_THERAPIST: 'INVALID_THERAPIST',
    INVALID_PATIENT: 'INVALID_PATIENT',
    SESSION_ALREADY_COMPLETED: 'SESSION_ALREADY_COMPLETED',
    SESSION_ALREADY_CANCELLED: 'SESSION_ALREADY_CANCELLED',
    INVALID_STATUS: 'INVALID_STATUS',
    SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
} as const;
export type PhysiotherapyValidationError = typeof PhysiotherapyValidationError[keyof typeof PhysiotherapyValidationError];

/**
 * Valida un ID de sesión de fisioterapia
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validatePhysiotherapyId(id: string | number): ValidationResult {
    if (!id || (typeof id === 'string' && id.trim() === '') || (typeof id === 'number' && id <= 0)) {
        return {
            isValid: false,
            error: PhysiotherapyValidationError.INVALID_ID
        };
    }

    // Si es string, verificar que sea un número válido
    if (typeof id === 'string') {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return {
                isValid: false,
                error: PhysiotherapyValidationError.INVALID_ID
            };
        }
    }

    return { isValid: true };
}

/**
 * Valida los datos de una sesión de fisioterapia
 *
 * @param data - Datos a validar
 * @returns Mensaje de error si la validación falla, null si es válida
 */
export function validatePhysiotherapyData(data: any): string | null {
    if (!data) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.MISSING_REQUIRED_FIELDS);
    }

    // Validar campos requeridos
    const requiredFields = ['patientId', 'therapistId', 'sessionDate', 'startTime', 'duration'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.MISSING_REQUIRED_FIELDS);
        }
    }

    // Validar fecha
    const sessionDate = new Date(data.sessionDate);
    if (isNaN(sessionDate.getTime())) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_DATE);
    }

    // Validar que la fecha no sea en el pasado (con tolerancia de 1 hora)
    const now = new Date();
    now.setHours(now.getHours() - 1);
    if (sessionDate < now) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_DATE);
    }

    // Validar duración (entre 15 y 120 minutos)
    const duration = parseInt(data.duration, 10);
    if (isNaN(duration) || duration < 15 || duration > 120) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_DURATION);
    }

    // Validar IDs de terapeuta y paciente
    if (!validatePhysiotherapyId(data.patientId).isValid) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_PATIENT);
    }

    if (!validatePhysiotherapyId(data.therapistId).isValid) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_THERAPIST);
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime)) {
        return getPhysiotherapyErrorMessage(PhysiotherapyValidationError.INVALID_DATE);
    }

    return null;
}

/**
 * Valida la cancelación de una sesión de fisioterapia
 *
 * @param sessionId - ID de la sesión
 * @param reason - Razón de la cancelación (opcional)
 * @returns Resultado de la validación
 */
export function validateSessionCancellation(sessionId: string | number, reason?: string): ValidationResult {
    // Validar ID
    const idValidation = validatePhysiotherapyId(sessionId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar razón de cancelación si se proporciona
    if (reason && reason.trim().length < 5) {
        return {
            isValid: false,
            error: PhysiotherapyValidationError.INVALID_STATUS
        };
    }

    return { isValid: true };
}

/**
 * Valida la completación de una sesión de fisioterapia
 *
 * @param sessionId - ID de la sesión
 * @param notes - Notas de la sesión (opcional)
 * @returns Resultado de la validación
 */
export function validateSessionCompletion(sessionId: string | number, notes?: string): ValidationResult {
    // Validar ID
    const idValidation = validatePhysiotherapyId(sessionId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar notas si se proporcionan
    if (notes && notes.trim().length < 10) {
        return {
            isValid: false,
            error: PhysiotherapyValidationError.INVALID_STATUS
        };
    }

    return { isValid: true };
}

/**
 * Obtiene el mensaje de error correspondiente a un código de error
 *
 * @param error - Código de error
 * @returns Mensaje de error legible
 */
export function getPhysiotherapyErrorMessage(error: string): string {
    switch (error) {
        case PhysiotherapyValidationError.INVALID_ID:
            return 'ID de sesión de fisioterapia inválido';
        case PhysiotherapyValidationError.MISSING_REQUIRED_FIELDS:
            return 'Faltan campos requeridos para la sesión de fisioterapia';
        case PhysiotherapyValidationError.INVALID_DATE:
            return 'Fecha u hora de la sesión inválida';
        case PhysiotherapyValidationError.INVALID_DURATION:
            return 'Duración de la sesión debe estar entre 15 y 120 minutos';
        case PhysiotherapyValidationError.INVALID_THERAPIST:
            return 'Terapeuta asignado inválido';
        case PhysiotherapyValidationError.INVALID_PATIENT:
            return 'Paciente asignado inválido';
        case PhysiotherapyValidationError.SESSION_ALREADY_COMPLETED:
            return 'La sesión ya ha sido completada';
        case PhysiotherapyValidationError.SESSION_ALREADY_CANCELLED:
            return 'La sesión ya ha sido cancelada';
        case PhysiotherapyValidationError.INVALID_STATUS:
            return 'Estado de la sesión inválido';
        case PhysiotherapyValidationError.SCHEDULE_CONFLICT:
            return 'Conflicto de horario con otra sesión';
        default:
            return 'Error de validación desconocido en fisioterapia';
    }
}