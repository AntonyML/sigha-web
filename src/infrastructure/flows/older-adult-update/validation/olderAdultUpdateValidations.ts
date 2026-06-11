/**
 * Validaciones para Older Adult Update Flow
 *
 * Contiene todas las validaciones de negocio para actualizaciones de adultos mayores,
 * incluyendo validación de datos, IDs y manejo de errores.
 */

/**
 * Tipos de error para validaciones de actualizaciones de adultos mayores
 */
export enum OlderAdultUpdateValidationError {
    INVALID_ID = 'INVALID_ID',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_PATIENT_ID = 'INVALID_PATIENT_ID',
    INVALID_UPDATE_TYPE = 'INVALID_UPDATE_TYPE',
    INVALID_UPDATE_DATA = 'INVALID_UPDATE_DATA',
    INVALID_DATE = 'INVALID_DATE',
    INVALID_DESCRIPTION = 'INVALID_DESCRIPTION',
    FUTURE_DATE = 'FUTURE_DATE'
}

/**
 * Tipos de actualización permitidos
 */
export enum UpdateType {
    PERSONAL_INFO = 'personal_info',
    MEDICAL_INFO = 'medical_info',
    CONTACT_INFO = 'contact_info',
    EMERGENCY_CONTACT = 'emergency_contact',
    HEALTH_STATUS = 'health_status',
    MEDICATION = 'medication',
    LIVING_SITUATION = 'living_situation',
    OTHER = 'other'
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
    isValid: boolean;
    error?: OlderAdultUpdateValidationError;
}

/**
 * Valida un ID de actualización de adulto mayor
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validateOlderAdultUpdateId(id: string | number | null | undefined): ValidationResult {
    if (id === null || id === undefined) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_ID };
    }

    const numId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_ID };
    }

    return { isValid: true };
}

/**
 * Valida el ID del paciente
 *
 * @param patientId - ID del paciente a validar
 * @returns Resultado de la validación
 */
export function validatePatientId(patientId: string | number | null | undefined): ValidationResult {
    if (patientId === null || patientId === undefined) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_PATIENT_ID };
    }

    const numId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_PATIENT_ID };
    }

    return { isValid: true };
}

/**
 * Valida el tipo de actualización
 *
 * @param updateType - Tipo de actualización a validar
 * @returns Resultado de la validación
 */
export function validateUpdateType(updateType: string | null | undefined): ValidationResult {
    if (!updateType || typeof updateType !== 'string') {
        return { isValid: false, error: OlderAdultUpdateValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedType = updateType.trim();

    if (trimmedType.length === 0 || trimmedType.length > 50) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_TYPE };
    }

    // Verificar que sea uno de los tipos permitidos
    const validTypes = Object.values(UpdateType);
    if (!validTypes.includes(trimmedType as UpdateType)) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_TYPE };
    }

    return { isValid: true };
}

/**
 * Valida la fecha de la actualización
 *
 * @param date - Fecha a validar
 * @returns Resultado de la validación
 */
export function validateUpdateDate(date: string | Date | null | undefined): ValidationResult {
    if (!date) {
        return { isValid: false, error: OlderAdultUpdateValidationError.MISSING_REQUIRED_FIELD };
    }

    let dateObj: Date;

    if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_DATE };
    }

    if (isNaN(dateObj.getTime())) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_DATE };
    }

    // No permitir fechas futuras
    const now = new Date();
    if (dateObj > now) {
        return { isValid: false, error: OlderAdultUpdateValidationError.FUTURE_DATE };
    }

    // No permitir fechas demasiado antiguas (más de 100 años)
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    if (dateObj < hundredYearsAgo) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_DATE };
    }

    return { isValid: true };
}

/**
 * Valida la descripción de la actualización
 *
 * @param description - Descripción a validar
 * @returns Resultado de la validación
 */
export function validateUpdateDescription(description: string | null | undefined): ValidationResult {
    if (!description || typeof description !== 'string') {
        return { isValid: false, error: OlderAdultUpdateValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 10 || trimmedDescription.length > 1000) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_DESCRIPTION };
    }

    return { isValid: true };
}

/**
 * Valida los datos de actualización específicos según el tipo
 *
 * @param updateType - Tipo de actualización
 * @param updateData - Datos específicos de la actualización
 * @returns Resultado de la validación
 */
export function validateUpdateSpecificData(updateType: string, updateData: any): ValidationResult {
    if (!updateData || typeof updateData !== 'object') {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    switch (updateType) {
        case UpdateType.PERSONAL_INFO:
            return validatePersonalInfoData(updateData);

        case UpdateType.MEDICAL_INFO:
            return validateMedicalInfoData(updateData);

        case UpdateType.CONTACT_INFO:
            return validateContactInfoData(updateData);

        case UpdateType.EMERGENCY_CONTACT:
            return validateEmergencyContactData(updateData);

        case UpdateType.HEALTH_STATUS:
            return validateHealthStatusData(updateData);

        case UpdateType.MEDICATION:
            return validateMedicationData(updateData);

        case UpdateType.LIVING_SITUATION:
            return validateLivingSituationData(updateData);

        case UpdateType.OTHER:
            return validateOtherUpdateData(updateData);

        default:
            return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_TYPE };
    }
}

/**
 * Valida datos de información personal
 */
function validatePersonalInfoData(data: any): ValidationResult {
    // Al menos uno de los campos debe estar presente
    const hasValidField = data.name || data.birthDate || data.gender || data.nationality;

    if (!hasValidField) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    // Validar nombre si está presente
    if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2)) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    // Validar fecha de nacimiento si está presente
    if (data.birthDate) {
        const dateValidation = validateUpdateDate(data.birthDate);
        if (!dateValidation.isValid) {
            return dateValidation;
        }
    }

    return { isValid: true };
}

/**
 * Valida datos de información médica
 */
function validateMedicalInfoData(data: any): ValidationResult {
    // Al menos uno de los campos debe estar presente
    const hasValidField = data.bloodType || data.allergies || data.chronicConditions || data.disabilities;

    if (!hasValidField) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de información de contacto
 */
function validateContactInfoData(data: any): ValidationResult {
    // Al menos uno de los campos debe estar presente
    const hasValidField = data.phone || data.email || data.address;

    if (!hasValidField) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de contacto de emergencia
 */
function validateEmergencyContactData(data: any): ValidationResult {
    // Debe tener al menos nombre y teléfono
    if (!data.name || !data.phone) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de estado de salud
 */
function validateHealthStatusData(data: any): ValidationResult {
    // Al menos uno de los campos debe estar presente
    const hasValidField = data.generalHealth || data.mobility || data.mentalHealth || data.nutrition;

    if (!hasValidField) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de medicación
 */
function validateMedicationData(data: any): ValidationResult {
    // Debe tener al menos nombre del medicamento
    if (!data.medicationName) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de situación de vivienda
 */
function validateLivingSituationData(data: any): ValidationResult {
    // Al menos uno de los campos debe estar presente
    const hasValidField = data.livingArrangement || data.careLevel || data.assistanceNeeded;

    if (!hasValidField) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida datos de otros tipos de actualización
 */
function validateOtherUpdateData(data: any): ValidationResult {
    // Para otros tipos, solo verificar que haya algún dato
    if (Object.keys(data).length === 0) {
        return { isValid: false, error: OlderAdultUpdateValidationError.INVALID_UPDATE_DATA };
    }

    return { isValid: true };
}

/**
 * Valida los datos completos de una actualización de adulto mayor
 *
 * @param data - Datos de la actualización a validar
 * @returns Resultado de la validación
 */
export function validateOlderAdultUpdateData(data: any): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: OlderAdultUpdateValidationError.MISSING_REQUIRED_FIELD };
    }

    // Validar campos requeridos
    const patientIdValidation = validatePatientId(data.patientId);
    if (!patientIdValidation.isValid) {
        return patientIdValidation;
    }

    const updateTypeValidation = validateUpdateType(data.updateType);
    if (!updateTypeValidation.isValid) {
        return updateTypeValidation;
    }

    const dateValidation = validateUpdateDate(data.updateDate || data.date);
    if (!dateValidation.isValid) {
        return dateValidation;
    }

    const descriptionValidation = validateUpdateDescription(data.description);
    if (!descriptionValidation.isValid) {
        return descriptionValidation;
    }

    // Validar datos específicos según el tipo
    const specificDataValidation = validateUpdateSpecificData(data.updateType, data.updateData || data.specificData || {});
    if (!specificDataValidation.isValid) {
        return specificDataValidation;
    }

    return { isValid: true };
}

/**
 * Convierte un error de validación en un mensaje legible
 *
 * @param error - Error de validación
 * @returns Mensaje de error
 */
export function getOlderAdultUpdateErrorMessage(error: OlderAdultUpdateValidationError): string {
    switch (error) {
        case OlderAdultUpdateValidationError.INVALID_ID:
            return 'ID de actualización inválido';

        case OlderAdultUpdateValidationError.MISSING_REQUIRED_FIELD:
            return 'Campo requerido faltante';

        case OlderAdultUpdateValidationError.INVALID_PATIENT_ID:
            return 'ID de paciente inválido';

        case OlderAdultUpdateValidationError.INVALID_UPDATE_TYPE:
            return 'Tipo de actualización inválido. Debe ser uno de: personal_info, medical_info, contact_info, emergency_contact, health_status, medication, living_situation, other';

        case OlderAdultUpdateValidationError.INVALID_UPDATE_DATA:
            return 'Datos de actualización inválidos o incompletos para el tipo especificado';

        case OlderAdultUpdateValidationError.INVALID_DATE:
            return 'Fecha inválida. Debe ser una fecha válida no anterior a 100 años';

        case OlderAdultUpdateValidationError.INVALID_DESCRIPTION:
            return 'Descripción inválida. Debe tener entre 10 y 1000 caracteres';

        case OlderAdultUpdateValidationError.FUTURE_DATE:
            return 'No se permiten fechas futuras';

        default:
            return 'Error de validación desconocido';
    }
}