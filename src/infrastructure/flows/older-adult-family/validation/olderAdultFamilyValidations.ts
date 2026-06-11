/**
 * Validaciones para Older Adult Family Flow
 *
 * Contiene todas las validaciones de negocio para miembros de familia de adultos mayores,
 * incluyendo validación de datos, IDs y manejo de errores.
 */

/**
 * Tipos de error para validaciones de familia de adultos mayores
 */
export enum OlderAdultFamilyValidationError {
    INVALID_ID = 'INVALID_ID',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_PATIENT_ID = 'INVALID_PATIENT_ID',
    INVALID_NAME = 'INVALID_NAME',
    INVALID_RELATIONSHIP = 'INVALID_RELATIONSHIP',
    INVALID_PHONE = 'INVALID_PHONE',
    INVALID_EMAIL = 'INVALID_EMAIL',
    INVALID_ADDRESS = 'INVALID_ADDRESS',
    DUPLICATE_FAMILY_MEMBER = 'DUPLICATE_FAMILY_MEMBER',
    INVALID_EMERGENCY_CONTACT = 'INVALID_EMERGENCY_CONTACT'
}

/**
 * Tipos de relación familiar permitidos
 */
export enum FamilyRelationship {
    SPOUSE = 'spouse',
    CHILD = 'child',
    PARENT = 'parent',
    SIBLING = 'sibling',
    GRANDCHILD = 'grandchild',
    GRANDPARENT = 'grandparent',
    AUNT_UNCLE = 'aunt_uncle',
    NIECE_NEPHEW = 'niece_nephew',
    COUSIN = 'cousin',
    IN_LAW = 'in_law',
    OTHER = 'other'
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
    isValid: boolean;
    error?: OlderAdultFamilyValidationError;
}

/**
 * Valida un ID de miembro de familia de adulto mayor
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validateOlderAdultFamilyId(id: string | number | null | undefined): ValidationResult {
    if (id === null || id === undefined) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_ID };
    }

    const numId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_ID };
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
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_PATIENT_ID };
    }

    const numId = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

    if (isNaN(numId) || numId <= 0) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_PATIENT_ID };
    }

    return { isValid: true };
}

/**
 * Valida el nombre del miembro de familia
 *
 * @param name - Nombre a validar
 * @returns Resultado de la validación
 */
export function validateFamilyMemberName(name: string | null | undefined): ValidationResult {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: OlderAdultFamilyValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_NAME };
    }

    // Solo permitir letras, espacios, apóstrofes y guiones
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_NAME };
    }

    return { isValid: true };
}

/**
 * Valida la relación familiar
 *
 * @param relationship - Relación a validar
 * @returns Resultado de la validación
 */
export function validateRelationship(relationship: string | null | undefined): ValidationResult {
    if (!relationship || typeof relationship !== 'string') {
        return { isValid: false, error: OlderAdultFamilyValidationError.MISSING_REQUIRED_FIELD };
    }

    const trimmedRelationship = relationship.trim();

    if (trimmedRelationship.length < 2 || trimmedRelationship.length > 50) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_RELATIONSHIP };
    }

    // Verificar que sea una relación válida
    const validRelationships = Object.values(FamilyRelationship);
    if (!validRelationships.includes(trimmedRelationship as FamilyRelationship)) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_RELATIONSHIP };
    }

    return { isValid: true };
}

/**
 * Valida el teléfono del miembro de familia
 *
 * @param phone - Teléfono a validar
 * @returns Resultado de la validación
 */
export function validateFamilyPhone(phone: string | null | undefined): ValidationResult {
    // El teléfono puede ser opcional para algunos miembros de familia
    if (!phone) {
        return { isValid: true };
    }

    if (typeof phone !== 'string') {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_PHONE };
    }

    const trimmedPhone = phone.trim();

    // Permitir diferentes formatos de teléfono: +1234567890, 123-456-7890, (123) 456-7890, etc.
    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_PHONE };
    }

    // Remover todos los caracteres no numéricos para verificar longitud mínima
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_PHONE };
    }

    return { isValid: true };
}

/**
 * Valida el email del miembro de familia
 *
 * @param email - Email a validar
 * @returns Resultado de la validación
 */
export function validateFamilyEmail(email: string | null | undefined): ValidationResult {
    // Email es opcional
    if (!email) {
        return { isValid: true };
    }

    if (typeof email !== 'string') {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_EMAIL };
    }

    const trimmedEmail = email.trim();

    // Regex básico para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_EMAIL };
    }

    if (trimmedEmail.length > 254) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_EMAIL };
    }

    return { isValid: true };
}

/**
 * Valida la dirección del miembro de familia
 *
 * @param address - Dirección a validar
 * @returns Resultado de la validación
 */
export function validateFamilyAddress(address: string | null | undefined): ValidationResult {
    // La dirección puede ser opcional
    if (!address) {
        return { isValid: true };
    }

    if (typeof address !== 'string') {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_ADDRESS };
    }

    const trimmedAddress = address.trim();

    if (trimmedAddress.length < 10 || trimmedAddress.length > 500) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_ADDRESS };
    }

    return { isValid: true };
}

/**
 * Valida si el miembro de familia puede ser contacto de emergencia
 *
 * @param isEmergencyContact - Indicador de contacto de emergencia
 * @param relationship - Relación familiar
 * @returns Resultado de la validación
 */
export function validateEmergencyContactStatus(isEmergencyContact: boolean | null | undefined, relationship: string): ValidationResult {
    // Si no es contacto de emergencia, no hay validación adicional
    if (!isEmergencyContact) {
        return { isValid: true };
    }

    // Si es contacto de emergencia, debe tener una relación que lo permita
    const allowedRelationships = [
        FamilyRelationship.SPOUSE,
        FamilyRelationship.CHILD,
        FamilyRelationship.PARENT,
        FamilyRelationship.SIBLING,
        FamilyRelationship.AUNT_UNCLE,
        FamilyRelationship.IN_LAW
    ];

    if (!allowedRelationships.includes(relationship as FamilyRelationship)) {
        return { isValid: false, error: OlderAdultFamilyValidationError.INVALID_EMERGENCY_CONTACT };
    }

    return { isValid: true };
}

/**
 * Valida los datos completos de un miembro de familia de adulto mayor
 *
 * @param data - Datos del miembro de familia a validar
 * @returns Resultado de la validación
 */
export function validateOlderAdultFamilyData(data: any): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: OlderAdultFamilyValidationError.MISSING_REQUIRED_FIELD };
    }

    // Validar campos requeridos
    const patientIdValidation = validatePatientId(data.patientId);
    if (!patientIdValidation.isValid) {
        return patientIdValidation;
    }

    const nameValidation = validateFamilyMemberName(data.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    const relationshipValidation = validateRelationship(data.relationship);
    if (!relationshipValidation.isValid) {
        return relationshipValidation;
    }

    // Validar campos opcionales si están presentes
    if (data.phone !== undefined) {
        const phoneValidation = validateFamilyPhone(data.phone);
        if (!phoneValidation.isValid) {
            return phoneValidation;
        }
    }

    if (data.email !== undefined) {
        const emailValidation = validateFamilyEmail(data.email);
        if (!emailValidation.isValid) {
            return emailValidation;
        }
    }

    if (data.address !== undefined) {
        const addressValidation = validateFamilyAddress(data.address);
        if (!addressValidation.isValid) {
            return addressValidation;
        }
    }

    // Validar estado de contacto de emergencia
    if (data.isEmergencyContact !== undefined) {
        const emergencyValidation = validateEmergencyContactStatus(data.isEmergencyContact, data.relationship);
        if (!emergencyValidation.isValid) {
            return emergencyValidation;
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
export function getOlderAdultFamilyErrorMessage(error: OlderAdultFamilyValidationError): string {
    switch (error) {
        case OlderAdultFamilyValidationError.INVALID_ID:
            return 'ID de miembro de familia inválido';

        case OlderAdultFamilyValidationError.MISSING_REQUIRED_FIELD:
            return 'Campo requerido faltante';

        case OlderAdultFamilyValidationError.INVALID_PATIENT_ID:
            return 'ID de paciente inválido';

        case OlderAdultFamilyValidationError.INVALID_NAME:
            return 'Nombre inválido. Debe contener solo letras y tener entre 2 y 100 caracteres';

        case OlderAdultFamilyValidationError.INVALID_RELATIONSHIP:
            return 'Relación familiar inválida. Debe ser uno de: spouse, child, parent, sibling, grandchild, grandparent, aunt_uncle, niece_nephew, cousin, in_law, other';

        case OlderAdultFamilyValidationError.INVALID_PHONE:
            return 'Teléfono inválido. Debe ser un número válido con al menos 7 dígitos';

        case OlderAdultFamilyValidationError.INVALID_EMAIL:
            return 'Email inválido. Debe tener un formato válido';

        case OlderAdultFamilyValidationError.INVALID_ADDRESS:
            return 'Dirección inválida. Debe tener entre 10 y 500 caracteres';

        case OlderAdultFamilyValidationError.DUPLICATE_FAMILY_MEMBER:
            return 'Ya existe un miembro de familia con estos datos';

        case OlderAdultFamilyValidationError.INVALID_EMERGENCY_CONTACT:
            return 'Solo ciertos familiares pueden ser designados como contactos de emergencia';

        default:
            return 'Error de validación desconocido';
    }
}