import { twoFactorService } from '../../services/twoFactorService';
import type {
    TwoFactorSetupResponse,
    TwoFactorStatusResponse,
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
 * Resultado del flujo de regeneración de códigos de respaldo
 */
export interface RegenerateBackupCodesFlowResult {
    success: boolean;
    backupCodes?: string[];
    message?: string;
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
            const response: TwoFactorSetupResponse = await twoFactorService.generate2FA();

            return {
                success: true,
                qrCode: response.qrCode,
                secret: response.secret,
                backupCodes: response.backupCodes,
                instructions: response.instructions,
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.generate2FA:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 409) {
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
     * - Validación del código TOTP
     * - Habilitación del 2FA en el backend
     * - Confirmación al usuario
     * - Manejo de errores
     * 
     * @param code - Código TOTP de 6 dígitos de la app 2FAS
     * @returns Enable2FAFlowResult con el estado de la habilitación
     */
    async enable2FA(code: string): Promise<Enable2FAFlowResult> {
        try {
            // Validar formato del código
            if (!twoFactorService.isValidTOTPFormat(code)) {
                return {
                    success: false,
                    error: 'El código debe tener 6 dígitos numéricos',
                };
            }

            // Limpiar el código (remover espacios, guiones, etc.)
            const cleanCode = twoFactorService.cleanToken(code);

            // Habilitar 2FA
            const response = await twoFactorService.enable2FA(cleanCode);

            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                };
            }

            return {
                success: false,
                error: response.message || 'Código inválido',
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
                    error: 'Código inválido. Asegúrate de ingresar el código actual de tu app.',
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
                    message: response.message,
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

            if (error.response?.status === 404) {
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
            const response: TwoFactorStatusResponse = await twoFactorService.get2FAStatus();

            return {
                success: true,
                enabled: response.enabled,
                lastUsed: response.lastUsed,
                hasBackupCodes: response.hasBackupCodes,
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.get2FAStatus:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener estado de 2FA',
            };
        }
    },

    /**
     * Flujo completo para regenerar códigos de respaldo
     * 
     * Maneja:
     * - Generación de nuevos códigos de respaldo
     * - Invalidación de códigos anteriores
     * - Recordatorio de guardar códigos
     * - Manejo de errores
     * 
     * @returns RegenerateBackupCodesFlowResult con los nuevos códigos
     */
    async regenerateBackupCodes(): Promise<RegenerateBackupCodesFlowResult> {
        try {
            const response = await twoFactorService.regenerateBackupCodes();

            if (response.success && response.backupCodes) {
                return {
                    success: true,
                    backupCodes: response.backupCodes,
                    message: response.message,
                };
            }

            return {
                success: false,
                error: 'No se pudieron regenerar los códigos de respaldo',
            };
        } catch (error: any) {
            console.error('Error en twoFactorFlow.regenerateBackupCodes:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: '2FA no está configurado. Configúralo primero.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al regenerar códigos de respaldo',
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
            // Primero verificar si ya está habilitado
            const status = await this.get2FAStatus();

            if (status.success && status.enabled) {
                return {
                    success: false,
                    error: '2FA ya está habilitado. Deshabílitalo primero si deseas reconfigurarlo.',
                };
            }

            // Generar configuración de 2FA
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
     * Flujo para verificar si el usuario tiene 2FA habilitado
     * 
     * Método simplificado que solo retorna true/false
     * 
     * @returns boolean indicando si 2FA está habilitado
     */
    async is2FAEnabled(): Promise<boolean> {
        try {
            return await twoFactorService.is2FAEnabled();
        } catch (error) {
            console.error('Error en twoFactorFlow.is2FAEnabled:', error);
            return false;
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

        // Verificar si es código de respaldo (8 caracteres hex)
        if (twoFactorService.isValidBackupCodeFormat(cleanCode)) {
            return { valid: true };
        }

        return {
            valid: false,
            error: 'El código debe tener 6 dígitos (TOTP) o 8 caracteres hexadecimales (respaldo)',
        };
    },

    /**
     * Flujo para obtener información de debug (solo desarrollo)
     * 
     * ADVERTENCIA: Este método solo debe usarse en desarrollo
     * 
     * @returns Información de debug del 2FA
     */
    async getDebugInfo(): Promise<any> {
        try {
            const isDev = import.meta.env.DEV;
            if (!isDev) {
                console.warn('ADVERTENCIA: Debug info no disponible en producción');
                return null;
            }

            return await twoFactorService.get2FADebug();
        } catch (error) {
            console.error('Error en twoFactorFlow.getDebugInfo:', error);
            return null;
        }
    },    // ==================== Helpers ====================

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
     * Ejemplo: A1B2C3D4 -> A1B2-C3D4
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
};
