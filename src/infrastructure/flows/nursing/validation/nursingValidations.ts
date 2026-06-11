/**
 * Nursing Validations
 *
 * Funciones de validación de negocio para citas y registros de enfermería.
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
 * Errores de validación para enfermería
 */
export enum NursingValidationError {
    INVALID_ID = 'INVALID_ID',
    MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
    INVALID_DATE = 'INVALID_DATE',
    INVALID_DURATION = 'INVALID_DURATION',
    INVALID_APPOINTMENT_TYPE = 'INVALID_APPOINTMENT_TYPE',
    INVALID_PRIORITY = 'INVALID_PRIORITY',
    INVALID_NURSING_AREA = 'INVALID_NURSING_AREA',
    INVALID_PATIENT = 'INVALID_PATIENT',
    INVALID_STAFF = 'INVALID_STAFF',
    APPOINTMENT_ALREADY_COMPLETED = 'APPOINTMENT_ALREADY_COMPLETED',
    APPOINTMENT_ALREADY_CANCELLED = 'APPOINTMENT_ALREADY_CANCELLED',
    INVALID_STATUS = 'INVALID_STATUS',
    INVALID_VITAL_SIGNS = 'INVALID_VITAL_SIGNS',
    INVALID_MOBILITY = 'INVALID_MOBILITY',
    INVALID_QUALITY_LEVEL = 'INVALID_QUALITY_LEVEL'
}

/**
 * Valida un ID de cita/registro de enfermería
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validateNursingId(id: string | number): ValidationResult {
    if (!id || (typeof id === 'string' && id.trim() === '') || (typeof id === 'number' && id <= 0)) {
        return {
            isValid: false,
            error: NursingValidationError.INVALID_ID
        };
    }

    // Si es string, verificar que sea un número válido
    if (typeof id === 'string') {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return {
                isValid: false,
                error: NursingValidationError.INVALID_ID
            };
        }
    }

    return { isValid: true };
}

/**
 * Valida los datos de una cita de enfermería
 *
 * @param data - Datos a validar
 * @returns Mensaje de error si la validación falla, null si es válida
 */
export function validateNursingAppointmentData(data: any): string | null {
    if (!data) {
        return getNursingErrorMessage(NursingValidationError.MISSING_REQUIRED_FIELDS);
    }

    // Validar campos requeridos
    const requiredFields = ['saAppointmentDate', 'saAppointmentType', 'saPriority', 'idArea', 'idPatient', 'idStaff'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return getNursingErrorMessage(NursingValidationError.MISSING_REQUIRED_FIELDS);
        }
    }

    // Validar fecha
    const appointmentDate = new Date(data.saAppointmentDate);
    if (isNaN(appointmentDate.getTime())) {
        return getNursingErrorMessage(NursingValidationError.INVALID_DATE);
    }

    // Validar que la fecha no sea en el pasado (con tolerancia de 1 hora)
    const now = new Date();
    now.setHours(now.getHours() - 1);
    if (appointmentDate < now) {
        return getNursingErrorMessage(NursingValidationError.INVALID_DATE);
    }

    // Validar duración si se proporciona (entre 15 y 120 minutos)
    if (data.saDurationMinutes) {
        const duration = parseInt(data.saDurationMinutes, 10);
        if (isNaN(duration) || duration < 15 || duration > 120) {
            return getNursingErrorMessage(NursingValidationError.INVALID_DURATION);
        }
    }

    // Validar tipo de cita
    const validAppointmentTypes = ['checkup', 'evaluation', 'therapy', 'follow_up', 'emergency'];
    if (!validAppointmentTypes.includes(data.saAppointmentType)) {
        return getNursingErrorMessage(NursingValidationError.INVALID_APPOINTMENT_TYPE);
    }

    // Validar prioridad
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(data.saPriority)) {
        return getNursingErrorMessage(NursingValidationError.INVALID_PRIORITY);
    }

    // Validar IDs
    if (!validateNursingId(data.idArea).isValid) {
        return getNursingErrorMessage(NursingValidationError.INVALID_NURSING_AREA);
    }

    if (!validateNursingId(data.idPatient).isValid) {
        return getNursingErrorMessage(NursingValidationError.INVALID_PATIENT);
    }

    if (!validateNursingId(data.idStaff).isValid) {
        return getNursingErrorMessage(NursingValidationError.INVALID_STAFF);
    }

    return null;
}

/**
 * Valida los datos de un registro de enfermería
 *
 * @param data - Datos del registro a validar
 * @returns Mensaje de error si la validación falla, null si es válida
 */
export function validateNursingRecordData(data: any): string | null {
    if (!data) {
        return getNursingErrorMessage(NursingValidationError.MISSING_REQUIRED_FIELDS);
    }

    // Validar signos vitales si se proporcionan
    if (data.nrTemperature) {
        const temp = parseFloat(data.nrTemperature);
        if (isNaN(temp) || temp < 30 || temp > 45) {
            return getNursingErrorMessage(NursingValidationError.INVALID_VITAL_SIGNS);
        }
    }

    if (data.nrBloodPressure && !/^(\d{2,3})\/(\d{2,3})$/.test(data.nrBloodPressure)) {
        return getNursingErrorMessage(NursingValidationError.INVALID_VITAL_SIGNS);
    }

    if (data.nrHeartRate) {
        const heartRate = parseInt(data.nrHeartRate, 10);
        if (isNaN(heartRate) || heartRate < 30 || heartRate > 250) {
            return getNursingErrorMessage(NursingValidationError.INVALID_VITAL_SIGNS);
        }
    }

    if (data.nrPainLevel) {
        const painLevel = parseInt(data.nrPainLevel, 10);
        if (isNaN(painLevel) || painLevel < 0 || painLevel > 10) {
            return getNursingErrorMessage(NursingValidationError.INVALID_VITAL_SIGNS);
        }
    }

    // Validar movilidad si se proporciona
    if (data.nrMobility) {
        const validMobility = ['independent', 'assisted', 'bedridden'];
        if (!validMobility.includes(data.nrMobility)) {
            return getNursingErrorMessage(NursingValidationError.INVALID_MOBILITY);
        }
    }

    // Validar niveles de calidad si se proporcionan
    const qualityFields = ['nrAppetite', 'nrSleepQuality'];
    const validQualityLevels = ['good', 'regular', 'poor'];

    for (const field of qualityFields) {
        if (data[field] && !validQualityLevels.includes(data[field])) {
            return getNursingErrorMessage(NursingValidationError.INVALID_QUALITY_LEVEL);
        }
    }

    return null;
}

/**
 * Valida la cancelación de una cita de enfermería
 *
 * @param appointmentId - ID de la cita
 * @param reason - Razón de la cancelación (opcional)
 * @returns Resultado de la validación
 */
export function validateAppointmentCancellation(appointmentId: string | number, reason?: string): ValidationResult {
    // Validar ID de la cita
    const idValidation = validateNursingId(appointmentId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar razón de cancelación si se proporciona
    if (reason && reason.trim().length < 5) {
        return {
            isValid: false,
            error: NursingValidationError.INVALID_STATUS
        };
    }

    return { isValid: true };
}

/**
 * Valida la completación de una cita de enfermería
 *
 * @param appointmentId - ID de la cita
 * @param recordData - Datos del registro
 * @returns Resultado de la validación
 */
export function validateAppointmentCompletion(appointmentId: string | number, recordData?: any): ValidationResult {
    // Validar ID de la cita
    const idValidation = validateNursingId(appointmentId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar datos del registro si se proporcionan
    if (recordData) {
        const recordValidation = validateNursingRecordData(recordData);
        if (recordValidation) {
            return {
                isValid: false,
                error: NursingValidationError.INVALID_VITAL_SIGNS
            };
        }
    }

    return { isValid: true };
}

/**
 * Obtiene el mensaje de error correspondiente a un código de error
 *
 * @param error - Código de error
 * @returns Mensaje de error legible
 */
export function getNursingErrorMessage(error: string): string {
    switch (error) {
        case NursingValidationError.INVALID_ID:
            return 'ID de cita/registro de enfermería inválido';
        case NursingValidationError.MISSING_REQUIRED_FIELDS:
            return 'Faltan campos requeridos para la cita de enfermería';
        case NursingValidationError.INVALID_DATE:
            return 'Fecha u hora de la cita inválida';
        case NursingValidationError.INVALID_DURATION:
            return 'Duración de la cita debe estar entre 15 y 120 minutos';
        case NursingValidationError.INVALID_APPOINTMENT_TYPE:
            return 'Tipo de cita inválido (debe ser: checkup, evaluation, therapy, follow_up, o emergency)';
        case NursingValidationError.INVALID_PRIORITY:
            return 'Prioridad de la cita inválida (debe ser: low, medium, high, o urgent)';
        case NursingValidationError.INVALID_NURSING_AREA:
            return 'Área de enfermería asignada inválida';
        case NursingValidationError.INVALID_PATIENT:
            return 'Paciente asignado inválido';
        case NursingValidationError.INVALID_STAFF:
            return 'Personal asignado inválido';
        case NursingValidationError.APPOINTMENT_ALREADY_COMPLETED:
            return 'La cita ya ha sido completada';
        case NursingValidationError.APPOINTMENT_ALREADY_CANCELLED:
            return 'La cita ya ha sido cancelada';
        case NursingValidationError.INVALID_STATUS:
            return 'Estado de la cita inválido';
        case NursingValidationError.INVALID_VITAL_SIGNS:
            return 'Signos vitales inválidos en el registro de enfermería';
        case NursingValidationError.INVALID_MOBILITY:
            return 'Nivel de movilidad inválido (debe ser: independent, assisted, o bedridden)';
        case NursingValidationError.INVALID_QUALITY_LEVEL:
            return 'Nivel de calidad inválido (debe ser: good, regular, o poor)';
        default:
            return 'Error de validación desconocido en enfermería';
    }
}