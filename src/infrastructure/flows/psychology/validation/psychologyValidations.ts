/**
 * Psychology Validations
 *
 * Funciones de validación de negocio para sesiones de psicología.
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
 * Errores de validación para psicología
 */
export const PsychologyValidationError = {
    INVALID_ID: 'INVALID_ID',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
    INVALID_DATE: 'INVALID_DATE',
    INVALID_DURATION: 'INVALID_DURATION',
    INVALID_PSYCHOLOGIST: 'INVALID_PSYCHOLOGIST',
    INVALID_PATIENT: 'INVALID_PATIENT',
    SESSION_ALREADY_COMPLETED: 'SESSION_ALREADY_COMPLETED',
    SESSION_ALREADY_CANCELLED: 'SESSION_ALREADY_CANCELLED',
    INVALID_STATUS: 'INVALID_STATUS',
    SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
    INVALID_SESSION_TYPE: 'INVALID_SESSION_TYPE'
} as const;
export type PsychologyValidationError = typeof PsychologyValidationError[keyof typeof PsychologyValidationError];

/**
 * Valida un ID de sesión de psicología
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validatePsychologyId(id: string | number): ValidationResult {
    if (!id || (typeof id === 'string' && id.trim() === '') || (typeof id === 'number' && id <= 0)) {
        return {
            isValid: false,
            error: PsychologyValidationError.INVALID_ID
        };
    }

    // Si es string, verificar que sea un número válido
    if (typeof id === 'string') {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return {
                isValid: false,
                error: PsychologyValidationError.INVALID_ID
            };
        }
    }

    return { isValid: true };
}

/**
 * Valida los datos de una sesión de psicología
 *
 * @param data - Datos a validar
 * @returns Mensaje de error si la validación falla, null si es válida
 */
export function validatePsychologyData(data: any): string | null {
    if (!data) {
        return getPsychologyErrorMessage(PsychologyValidationError.MISSING_REQUIRED_FIELDS);
    }

    // Validar campos requeridos
    const requiredFields = ['patientId', 'psychologistId', 'sessionDate', 'startTime', 'duration', 'sessionType'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return getPsychologyErrorMessage(PsychologyValidationError.MISSING_REQUIRED_FIELDS);
        }
    }

    // Validar fecha
    const sessionDate = new Date(data.sessionDate);
    if (isNaN(sessionDate.getTime())) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_DATE);
    }

    // Validar que la fecha no sea en el pasado (con tolerancia de 1 hora)
    const now = new Date();
    now.setHours(now.getHours() - 1);
    if (sessionDate < now) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_DATE);
    }

    // Validar duración (entre 30 y 90 minutos para sesiones psicológicas)
    const duration = parseInt(data.duration, 10);
    if (isNaN(duration) || duration < 30 || duration > 90) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_DURATION);
    }

    // Validar IDs de psicólogo y paciente
    if (!validatePsychologyId(data.patientId).isValid) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_PATIENT);
    }

    if (!validatePsychologyId(data.psychologistId).isValid) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_PSYCHOLOGIST);
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime)) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_DATE);
    }

    // Validar tipo de sesión
    const validSessionTypes = ['individual', 'group', 'family', 'couples'];
    if (!validSessionTypes.includes(data.sessionType)) {
        return getPsychologyErrorMessage(PsychologyValidationError.INVALID_SESSION_TYPE);
    }

    return null;
}

/**
 * Valida la cancelación de una sesión de psicología
 *
 * @param sessionId - ID de la sesión
 * @param reason - Razón de la cancelación (opcional)
 * @returns Resultado de la validación
 */
export function validateSessionCancellation(sessionId: string | number, reason?: string): ValidationResult {
    // Validar ID
    const idValidation = validatePsychologyId(sessionId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar razón de cancelación si se proporciona
    if (reason && reason.trim().length < 5) {
        return {
            isValid: false,
            error: PsychologyValidationError.INVALID_STATUS
        };
    }

    return { isValid: true };
}

/**
 * Valida la completación de una sesión de psicología
 *
 * @param sessionId - ID de la sesión
 * @param notes - Notas de la sesión (opcional)
 * @returns Resultado de la validación
 */
export function validateSessionCompletion(sessionId: string | number, notes?: string): ValidationResult {
    // Validar ID
    const idValidation = validatePsychologyId(sessionId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar notas si se proporcionan (para sesiones psicológicas, las notas son importantes)
    if (notes && notes.trim().length < 20) {
        return {
            isValid: false,
            error: PsychologyValidationError.INVALID_STATUS
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
export function getPsychologyErrorMessage(error: string): string {
    switch (error) {
        case PsychologyValidationError.INVALID_ID:
            return 'ID de sesión de psicología inválido';
        case PsychologyValidationError.MISSING_REQUIRED_FIELDS:
            return 'Faltan campos requeridos para la sesión de psicología';
        case PsychologyValidationError.INVALID_DATE:
            return 'Fecha u hora de la sesión inválida';
        case PsychologyValidationError.INVALID_DURATION:
            return 'Duración de la sesión debe estar entre 30 y 90 minutos';
        case PsychologyValidationError.INVALID_PSYCHOLOGIST:
            return 'Psicólogo asignado inválido';
        case PsychologyValidationError.INVALID_PATIENT:
            return 'Paciente asignado inválido';
        case PsychologyValidationError.SESSION_ALREADY_COMPLETED:
            return 'La sesión ya ha sido completada';
        case PsychologyValidationError.SESSION_ALREADY_CANCELLED:
            return 'La sesión ya ha sido cancelada';
        case PsychologyValidationError.INVALID_STATUS:
            return 'Estado de la sesión inválido';
        case PsychologyValidationError.SCHEDULE_CONFLICT:
            return 'Conflicto de horario con otra sesión';
        case PsychologyValidationError.INVALID_SESSION_TYPE:
            return 'Tipo de sesión inválido (debe ser: individual, group, family, o couples)';
        default:
            return 'Error de validación desconocido en psicología';
    }
}