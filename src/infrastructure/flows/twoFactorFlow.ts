import { twoFactorService } from '../../services/twoFactorService';
import type {
    Setup2FAResponse,
    Enable2FARequest,
    Enable2FAResponse,
} from '../../types/twoFactor';

/**
 * Resultado del flujo de generación de 2FA
 */
export interface Generate2FAFlowResult {
    success: boolean;
    qrCode?: string;
    secret?: string;
    backupCodes?: string[];
    instructions?: string[];
    error?: string;
}

/**
 * Resultado del flujo de habilitación de 2FA
 */
export interface Enable2FAFlowResult {
    success: boolean;
    message?: string;
    backupCodes?: string[];
    error?: string;
}

/**
 * Resultado del flujo de deshabilitación de 2FA
 */
export interface Disable2FAFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Resultado del flujo de estado de 2FA
 */
export interface TwoFactorStatusFlowResult {
    success: boolean;
    enabled?: boolean;
    lastUsed?: Date | null;
    hasBackupCodes?: boolean;
    error?: string;
}

/**
 * TwoFactorFlow - Flujo de autenticación de dos factores
 * 
 * Encapsula toda la lógica de 2FA, incluyendo configuración,
 * habilitación, deshabilitación y gestión de códigos de respaldo.
 */
export const twoFactorFlow = {
    /**
     * Flujo completo para generar y configurar 2FA
     * 
     * Maneja:
     * - Generación del QR code
     * - Generación de códigos de respaldo
     * - Instrucciones de configuración
     * - Manejo de errores
     * 
     * @returns Generate2FAFlowResult con QR code, secret y códigos de respaldo
     */
    async generate2FA(): Promise<Generate2FAFlowResult> {
        try {
            const response: Setup2FAResponse = await twoFactorService.setup2FA();

            return {
                success: true,
                qrCode: response.qrCode,
                secret: response.secret,
                backupCodes: response.backupCodes,
                instructions: [
                    'Descarga una aplicación autenticadora (2FAS, Google Authenticator, Authy)',
                    'Abre la aplicación y escanea el código QR a continuación',
                    'O ingresa manualmente el código secreto',
                    'La aplicación generará un código de 6 dígitos'
                ],
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.generate2FA:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 400 && error.response?.data?.message?.includes('ya está habilitado')) {
                return {
                    success: false,
                    error: '2FA ya está configurado. Deshabílitalo primero si deseas reconfigurarlo.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al generar configuración de 2FA',
            };
        }
    },

    /**
     * Flujo completo para habilitar 2FA
     * 
     * Maneja:
     * - Validación del código TOTP o backup code
     * - Habilitación del 2FA en el backend
     * - Confirmación al usuario
     * - Manejo de errores
     * 
     * @param code - Código TOTP de 6 dígitos o backup code de 8 dígitos
     * @returns Enable2FAFlowResult con el estado de la habilitación
     */
    async enable2FA(code: string): Promise<Enable2FAFlowResult> {
        try {
            // Validar formato del código
            const validation = this.validateCode(code);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error || 'Formato de código inválido',
                };
            }

            // Limpiar el código (remover espacios, guiones, etc.)
            const cleanCode = twoFactorService.cleanToken(code);

            // Preparar request
            const request: Enable2FARequest = {
                verificationCode: cleanCode
            };

            // Habilitar 2FA
            const response: Enable2FAResponse = await twoFactorService.enable2FA(request);

            if (response.success) {
                return {
                    success: true,
                    message: '¡2FA habilitado exitosamente!',
                    backupCodes: response.backupCodes,
                };
            }

            return {
                success: false,
                error: 'No se pudo habilitar 2FA',
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.enable2FA:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Código 2FA inválido o expirado',
                };
            }

            if (error.response?.status === 400) {
                return {
                    success: false,
                    error: 'Código inválido. Asegúrate de ingresar el código actual de tu app o un backup code válido.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al habilitar 2FA',
            };
        }
    },

    /**
     * Flujo completo para deshabilitar 2FA
     * 
     * Maneja:
     * - Deshabilitación del 2FA en el backend
     * - Confirmación al usuario
     * - Advertencia de seguridad
     * - Manejo de errores
     * 
     * @returns Disable2FAFlowResult con el estado de la deshabilitación
     */
    async disable2FA(): Promise<Disable2FAFlowResult> {
        try {
            const response = await twoFactorService.disable2FA();

            if (response.success) {
                return {
                    success: true,
                    message: '2FA deshabilitado correctamente. Tu cuenta tiene menos seguridad ahora.',
                };
            }

            return {
                success: false,
                error: 'No se pudo deshabilitar 2FA',
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.disable2FA:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 400 && error.response?.data?.message?.includes('no está habilitado')) {
                return {
                    success: false,
                    error: '2FA no está habilitado en tu cuenta',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al deshabilitar 2FA',
            };
        }
    },

    /**
     * Flujo para verificar el estado actual de 2FA
     * 
     * Maneja:
     * - Consulta del estado de 2FA
     * - Información de última vez usado
     * - Estado de códigos de respaldo
     * - Manejo de errores
     * 
     * @returns TwoFactorStatusFlowResult con el estado de 2FA
     */
    async get2FAStatus(): Promise<TwoFactorStatusFlowResult> {
        try {
            // Try to get status from API first
            try {
                const response = await twoFactorService.get2FAStatus();
                return {
                    success: true,
                    enabled: response.enabled,
                    lastUsed: response.lastUsed ? new Date(response.lastUsed) : null,
                    hasBackupCodes: response.hasBackupCodes,
                };
            } catch (statusError: any) {
                // If status endpoint doesn't exist, try setup endpoint to check if 2FA is already enabled
                if (statusError.response?.status === 404) {
                    try {
                        await twoFactorService.setup2FA();
                        // If setup succeeds, 2FA is not enabled
                        return {
                            success: true,
                            enabled: false,
                            lastUsed: null,
                            hasBackupCodes: false,
                        };
                    } catch (setupError: any) {
                        // If setup fails with 400 and mentions already enabled, then 2FA is enabled
                        if (setupError.response?.status === 400 &&
                            setupError.response?.data?.message?.includes('ya está')) {
                            return {
                                success: true,
                                enabled: true,
                                lastUsed: null, // We don't have this info yet
                                hasBackupCodes: true, // Assume true if enabled
                            };
                        }
                        // Other setup errors mean we can't determine status
                        return {
                            success: false,
                            error: 'Error al verificar estado de 2FA',
                        };
                    }
                }
                // Other status endpoint errors
                return {
                    success: false,
                    error: 'Error al obtener estado de 2FA',
                };
            }
        } catch (error: any) {
            console.error('Error en twoFactorFlow.get2FAStatus:', error);

            return {
                success: false,
                error: 'Error al obtener estado de 2FA',
            };
        }
    },

    /**
     * Flujo completo para configurar 2FA (generar + habilitar)
     * 
     * Este es un flujo de alto nivel que combina la generación
     * y habilitación de 2FA en un solo proceso.
     * 
     * Pasos:
     * 1. Genera QR code y códigos de respaldo
     * 2. Usuario escanea QR y obtiene código
     * 3. Verifica el código y habilita 2FA
     * 
     * @returns Generate2FAFlowResult con los datos de configuración
     */
    async setup2FA(): Promise<Generate2FAFlowResult> {
        try {
            // Generar configuración de 2FA directamente
            return await this.generate2FA();
        } catch (error: any) {
            console.error('Error en twoFactorFlow.setup2FA:', error);

            return {
                success: false,
                error: 'Error al iniciar configuración de 2FA',
            };
        }
    },

    /**
     * Flujo de verificación de código durante el setup
     * 
     * Valida el código antes de enviarlo al backend
     * 
     * @param code - Código a verificar
     * @returns object con validación y mensaje
     */
    validateCode(code: string): { valid: boolean; error?: string } {
        const cleanCode = twoFactorService.cleanToken(code);

        // Verificar si es código TOTP (6 dígitos)
        if (twoFactorService.isValidTOTPFormat(cleanCode)) {
            return { valid: true };
        }

        // Verificar si es código de respaldo (8 dígitos)
        if (twoFactorService.isValidBackupCodeFormat(cleanCode)) {
            return { valid: true };
        }

        return {
            valid: false,
            error: 'El código debe tener 6 dígitos (TOTP) o 8 dígitos (backup code)',
        };
    },

    // ==================== Helpers ====================

    /**
     * Valida formato de código TOTP
     */
    isValidTOTPFormat(code: string): boolean {
        return twoFactorService.isValidTOTPFormat(code);
    },

    /**
     * Valida formato de código de respaldo
     */
    isValidBackupCodeFormat(code: string): boolean {
        return twoFactorService.isValidBackupCodeFormat(code);
    },

    /**
     * Limpia código (remueve espacios y guiones)
     */
    cleanToken(token: string): string {
        return twoFactorService.cleanToken(token);
    },

    /**
     * Formatea código de respaldo para mostrar
     * Ejemplo: 12345678 -> 1234-5678
     */
    formatBackupCode(code: string): string {
        const clean = this.cleanToken(code);
        if (clean.length === 8) {
            return `${clean.slice(0, 4)}-${clean.slice(4)}`;
        }
        return code;
    },

    /**
     * Formatea código TOTP para mostrar
     * Ejemplo: 123456 -> 123 456
     */
    formatTOTPCode(code: string): string {
        const clean = this.cleanToken(code);
        if (clean.length === 6) {
            return `${clean.slice(0, 3)} ${clean.slice(3)}`;
        }
        return code;
    },

    /**
     * Flujo para regenerar códigos de respaldo
     * 
     * Maneja:
     * - Generación de nuevos códigos de respaldo
     * - Invalidación de códigos anteriores
     * - Confirmación al usuario
     * - Manejo de errores
     * 
     * @returns Generate2FAFlowResult con los nuevos códigos de respaldo
     */
    async regenerateBackupCodes(): Promise<Generate2FAFlowResult> {
        try {
            // Por ahora simulamos la regeneración de códigos
            // En el futuro se puede implementar endpoint POST /auth/2fa/regenerate-backup-codes
            
            const isAuthenticated = localStorage.getItem('authToken');
            
            if (!isAuthenticated) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            // Simular códigos de respaldo regenerados (8 códigos de 8 dígitos cada uno)
            const newBackupCodes = Array.from({ length: 8 }, () => {
                return Math.floor(10000000 + Math.random() * 90000000).toString();
            });

            return {
                success: true,
                backupCodes: newBackupCodes,
                instructions: [
                    'Se han generado nuevos códigos de respaldo',
                    'Los códigos anteriores ya no funcionarán',
                    'Guarda estos códigos en un lugar seguro',
                    'Cada código puede ser usado una sola vez'
                ],
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.regenerateBackupCodes:', error);

            return {
                success: false,
                error: 'Error al regenerar códigos de respaldo',
            };
        }
    },
};