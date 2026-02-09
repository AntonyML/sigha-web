/**
 * Validaciones para Emergency Contact Flow
 *
 * Contiene todas las validaciones de negocio para contactos de emergencia,
 * incluyendo validación de datos, IDs y manejo de errores.
 */

/**
 * Tipos de error para validaciones de contactos de emergencia
 */
export enum EmergencyContactValidationError {
    INVALID_ID = 'INVALID_ID',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_NAME = 'INVALID_NAME',
    INVALID_PHONE = 'INVALID_PHONE',
    INVALID_EMAIL = 'INVALID_EMAIL',
    INVALID_RELATIONSHIP = 'INVALID_RELATIONSHIP',
    INVALID_PATIENT_ID = 'INVALID_PATIENT_ID',
    DUPLICATE_CONTACT = 'DUPLICATE_CONTACT'
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
    isValid: boolean;
    error?: EmergencyContactValidationError;
}

/**
 * Valida un ID de contacto de emergencia
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validateEmergencyContactId(id: string | number | null | undefined): ValidationResult {
    if (id === null || id === undefined) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_ID };
    }

    const numId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_ID };
    }

    return { isValid: true };
}

/**
 * Valida el nombre del contacto de emergencia
 *
 * @param name - Nombre a validar
 * @returns Resultado de la validación
 */
export function validateContactName(name: string | null | undefined): ValidationResult {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: EmergencyContactValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_NAME };
    }

    // Solo permitir letras, espacios, apóstrofes y guiones
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_NAME };
    }

    return { isValid: true };
}

/**
 * Valida el teléfono del contacto de emergencia
 *
 * @param phone - Teléfono a validar
 * @returns Resultado de la validación
 */
export function validateContactPhone(phone: string | null | undefined): ValidationResult {
    if (!phone || typeof phone !== 'string') {
        return { isValid: false, error: EmergencyContactValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedPhone = phone.trim();

    // Permitir diferentes formatos de teléfono: +1234567890, 123-456-7890, (123) 456-7890, etc.
    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_PHONE };
    }

    // Remover todos los caracteres no numéricos para verificar longitud mínima
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_PHONE };
    }

    return { isValid: true };
}

/**
 * Valida el email del contacto de emergencia (opcional)
 *
 * @param email - Email a validar
 * @returns Resultado de la validación
 */
export function validateContactEmail(email: string | null | undefined): ValidationResult {
    // Email es opcional, así que si no se proporciona, es válido
    if (!email) {
        return { isValid: true };
    }

    if (typeof email !== 'string') {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_EMAIL };
    }

    const trimmedEmail = email.trim();

    // Regex básico para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_EMAIL };
    }

    if (trimmedEmail.length > 254) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_EMAIL };
    }

    return { isValid: true };
}

/**
 * Valida la relación con el paciente
 *
 * @param relationship - Relación a validar
 * @returns Resultado de la validación
 */
export function validateRelationship(relationship: string | null | undefined): ValidationResult {
    if (!relationship || typeof relationship !== 'string') {
        return { isValid: false, error: EmergencyContactValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedRelationship = relationship.trim();

    if (trimmedRelationship.length < 2 || trimmedRelationship.length > 50) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_RELATIONSHIP };
    }

    // Lista de relaciones comunes permitidas
    const validRelationships = [
        'padre', 'madre', 'hijo', 'hija', 'hermano', 'hermana',
        'esposo', 'esposa', 'pareja', 'amigo', 'amiga',
        'tío', 'tía', 'sobrino', 'sobrina', 'abuelo', 'abuela',
        'vecino', 'vecina', 'cuidador', 'cuidadora', 'otro'
    ];

    if (!validRelationships.includes(trimmedRelationship.toLowerCase())) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_RELATIONSHIP };
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
        return { isValid: false, error: EmergencyContactValidationError.INVALID_PATIENT_ID };
    }

    const numId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: EmergencyContactValidationError.INVALID_PATIENT_ID };
    }

    return { isValid: true };
}

/**
 * Valida los datos completos de un contacto de emergencia
 *
 * @param data - Datos del contacto a validar
 * @returns Resultado de la validación
 */
export function validateEmergencyContactData(data: any): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: EmergencyContactValidationError.MISSING_REQUIRED_FIELD };
    }

    // Validar campos requeridos
    const nameValidation = validateContactName(data.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    const phoneValidation = validateContactPhone(data.phone);
    if (!phoneValidation.isValid) {
        return phoneValidation;
    }

    const relationshipValidation = validateRelationship(data.relationship);
    if (!relationshipValidation.isValid) {
        return relationshipValidation;
    }

    const patientIdValidation = validatePatientId(data.patientId);
    if (!patientIdValidation.isValid) {
        return patientIdValidation;
    }

    // Validar email si se proporciona
    if (data.email !== undefined) {
        const emailValidation = validateContactEmail(data.email);
        if (!emailValidation.isValid) {
            return emailValidation;
        }
    }

    return { isValid: true };
}

/**
 * Convierte un error de validación en un mensaje legible
 *
 * @param error - Error de validación
 * @returns Mensaje de error
 */
export function getEmergencyContactErrorMessage(error: EmergencyContactValidationError): string {
    switch (error) {
        case EmergencyContactValidationError.INVALID_ID:
            return 'ID de contacto de emergencia inválido';

        case EmergencyContactValidationError.MISSING_REQUIRED_FIELD:
            return 'Campo requerido faltante';

        case EmergencyContactValidationError.INVALID_NAME:
            return 'Nombre inválido. Debe contener solo letras y tener entre 2 y 100 caracteres';

        case EmergencyContactValidationError.INVALID_PHONE:
            return 'Teléfono inválido. Debe ser un número válido con al menos 7 dígitos';

        case EmergencyContactValidationError.INVALID_EMAIL:
            return 'Email inválido. Debe tener un formato válido';

        case EmergencyContactValidationError.INVALID_RELATIONSHIP:
            return 'Relación inválida. Debe ser una relación familiar o conocida válida';

        case EmergencyContactValidationError.INVALID_PATIENT_ID:
            return 'ID de paciente inválido';

        case EmergencyContactValidationError.DUPLICATE_CONTACT:
            return 'Ya existe un contacto de emergencia con estos datos';

        default:
            return 'Error de validación desconocido';
    }
}