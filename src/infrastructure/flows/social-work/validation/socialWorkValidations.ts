/**
 * Social Work Validations
 *
 * Funciones de validación de negocio para reportes de trabajo social.
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
 * Errores de validación para trabajo social
 */
export enum SocialWorkValidationError {
    INVALID_ID = 'INVALID_ID',
    MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
    INVALID_DATE = 'INVALID_DATE',
    INVALID_REPORT_CONTENT = 'INVALID_REPORT_CONTENT',
    INVALID_SOCIAL_WORKER = 'INVALID_SOCIAL_WORKER',
    INVALID_BENEFICIARY = 'INVALID_BENEFICIARY',
    REPORT_ALREADY_APPROVED = 'REPORT_ALREADY_APPROVED',
    REPORT_ALREADY_SUBMITTED = 'REPORT_ALREADY_SUBMITTED',
    INVALID_STATUS = 'INVALID_STATUS',
    INVALID_INTERVENTION_TYPE = 'INVALID_INTERVENTION_TYPE'
}

/**
 * Valida un ID de reporte de trabajo social
 *
 * @param id - ID a validar
 * @returns Resultado de la validación
 */
export function validateSocialWorkId(id: string | number): ValidationResult {
    if (!id || (typeof id === 'string' && id.trim() === '') || (typeof id === 'number' && id <= 0)) {
        return {
            isValid: false,
            error: SocialWorkValidationError.INVALID_ID
        };
    }

    // Si es string, verificar que sea un número válido
    if (typeof id === 'string') {
        const numId = parseInt(id, 10);
        if (isNaN(numId) || numId <= 0) {
            return {
                isValid: false,
                error: SocialWorkValidationError.INVALID_ID
            };
        }
    }

    return { isValid: true };
}

/**
 * Valida los datos de un reporte de trabajo social
 *
 * @param data - Datos a validar
 * @returns Mensaje de error si la validación falla, null si es válida
 */
export function validateSocialWorkData(data: any): string | null {
    if (!data) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.MISSING_REQUIRED_FIELDS);
    }

    // Validar campos requeridos
    const requiredFields = ['beneficiaryId', 'socialWorkerId', 'reportDate', 'interventionType', 'description'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return getSocialWorkErrorMessage(SocialWorkValidationError.MISSING_REQUIRED_FIELDS);
        }
    }

    // Validar fecha
    const reportDate = new Date(data.reportDate);
    if (isNaN(reportDate.getTime())) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_DATE);
    }

    // Validar que la fecha no sea futura
    const now = new Date();
    if (reportDate > now) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_DATE);
    }

    // Validar IDs de trabajador social y beneficiario
    if (!validateSocialWorkId(data.beneficiaryId).isValid) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_BENEFICIARY);
    }

    if (!validateSocialWorkId(data.socialWorkerId).isValid) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_SOCIAL_WORKER);
    }

    // Validar contenido de la descripción (mínimo 50 caracteres)
    if (data.description.trim().length < 50) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_REPORT_CONTENT);
    }

    // Validar tipo de intervención
    const validInterventionTypes = [
        'family_support', 'economic_assistance', 'housing_support',
        'legal_aid', 'psychological_support', 'healthcare_coordination',
        'educational_support', 'community_integration', 'elder_care',
        'disability_support', 'crisis_intervention', 'other'
    ];
    if (!validInterventionTypes.includes(data.interventionType)) {
        return getSocialWorkErrorMessage(SocialWorkValidationError.INVALID_INTERVENTION_TYPE);
    }

    return null;
}

/**
 * Valida la aprobación de un reporte de trabajo social
 *
 * @param reportId - ID del reporte
 * @param approverId - ID del aprobador
 * @returns Resultado de la validación
 */
export function validateReportApproval(reportId: string | number, approverId?: string | number): ValidationResult {
    // Validar ID del reporte
    const idValidation = validateSocialWorkId(reportId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar ID del aprobador si se proporciona
    if (approverId && !validateSocialWorkId(approverId).isValid) {
        return {
            isValid: false,
            error: SocialWorkValidationError.INVALID_SOCIAL_WORKER
        };
    }

    return { isValid: true };
}

/**
 * Valida el envío de un reporte de trabajo social
 *
 * @param reportId - ID del reporte
 * @param submitterId - ID del remitente
 * @returns Resultado de la validación
 */
export function validateReportSubmission(reportId: string | number, submitterId?: string | number): ValidationResult {
    // Validar ID del reporte
    const idValidation = validateSocialWorkId(reportId);
    if (!idValidation.isValid) {
        return idValidation;
    }

    // Validar ID del remitente si se proporciona
    if (submitterId && !validateSocialWorkId(submitterId).isValid) {
        return {
            isValid: false,
            error: SocialWorkValidationError.INVALID_SOCIAL_WORKER
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
export function getSocialWorkErrorMessage(error: string): string {
    switch (error) {
        case SocialWorkValidationError.INVALID_ID:
            return 'ID de reporte de trabajo social inválido';
        case SocialWorkValidationError.MISSING_REQUIRED_FIELDS:
            return 'Faltan campos requeridos para el reporte de trabajo social';
        case SocialWorkValidationError.INVALID_DATE:
            return 'Fecha del reporte inválida';
        case SocialWorkValidationError.INVALID_REPORT_CONTENT:
            return 'El contenido del reporte debe tener al menos 50 caracteres';
        case SocialWorkValidationError.INVALID_SOCIAL_WORKER:
            return 'Trabajador social asignado inválido';
        case SocialWorkValidationError.INVALID_BENEFICIARY:
            return 'Beneficiario asignado inválido';
        case SocialWorkValidationError.REPORT_ALREADY_APPROVED:
            return 'El reporte ya ha sido aprobado';
        case SocialWorkValidationError.REPORT_ALREADY_SUBMITTED:
            return 'El reporte ya ha sido enviado';
        case SocialWorkValidationError.INVALID_STATUS:
            return 'Estado del reporte inválido';
        case SocialWorkValidationError.INVALID_INTERVENTION_TYPE:
            return 'Tipo de intervención inválido (debe ser: family_support, economic_assistance, housing_support, legal_aid, psychological_support, healthcare_coordination, educational_support, community_integration, elder_care, disability_support, crisis_intervention, u other)';
        default:
            return 'Error de validación desconocido en trabajo social';
    }
}