import { twoFactorService } from '../../../services/twoFactorService';
import type {
    Setup2FAResponse,
    Enable2FARequest,
    Enable2FAResponse,
    Verify2FARequest,
    Verify2FAResponse,
    TwoFactorStatusResponse,
    Disable2FAResponse,
} from '../../../types/twoFactor';
import {
  validateEnable2FAData,
  validateVerify2FAData,
  getTwoFactorErrorMessage
} from './validation/twoFactorValidations';

/**
 * Resultado del flujo de obtención de estado 2FA
 */
export interface Get2FAStatusFlowResult {
    success: boolean;
    enabled: boolean;
    lastUsed?: Date | null;
    hasBackupCodes: boolean;
    error?: string;
}

/**
 * Resultado del flujo de configuración 2FA
 */
export interface Setup2FAFlowResult {
    success: boolean;
    qrCode?: string;
    secret?: string;
    backupCodes?: string[];
    error?: string;
}

/**
 * Resultado del flujo de habilitación 2FA
 */
export interface Enable2FAFlowResult {
    success: boolean;
    message?: string;
    backupCodes?: string[];
    error?: string;
}

/**
 * Resultado del flujo de verificación 2FA
 */
export interface Verify2FAFlowResult {
    success: boolean;
    token?: string;
    error?: string;
}

/**
 * Resultado del flujo de deshabilitación 2FA
 */
export interface Disable2FAFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * TwoFactorFlow - Flujo de autenticación de dos factores
 * 
 * Encapsula toda la lógica de 2FA, incluyendo:
 * - Obtención de estado actual
 * - Configuración inicial
 * - Habilitación con verificación
 * - Verificación durante login
 * - Deshabilitación
 */
export const twoFactorFlow = {
    /**
     * Obtener estado actual de 2FA
     */
    getStatus: async (): Promise<Get2FAStatusFlowResult> => {
        try {
            const status: TwoFactorStatusResponse = await twoFactorService.get2FAStatus();
            
            return {
                success: true,
                enabled: status.enabled,
                lastUsed: status.lastUsed ? new Date(status.lastUsed) : null,
                hasBackupCodes: status.hasBackupCodes,
            };
        } catch (error: unknown) {
            console.error('Error getting 2FA status:', error);
            
            return {
                success: false,
                enabled: false,
                hasBackupCodes: false,
                error: getTwoFactorErrorMessage(error),
            };
        }
    },

    /**
     * Configurar 2FA - genera QR code y backup codes
     */
    setup: async (): Promise<Setup2FAFlowResult> => {
        try {
            const setup: Setup2FAResponse = await twoFactorService.setup2FA();
            
            return {
                success: true,
                qrCode: setup.qrCode,
                secret: setup.secret,
                backupCodes: setup.backupCodes,
            };
        } catch (error: unknown) {
            console.error('Error setting up 2FA:', error);
            
            return {
                success: false,
                secret: '',
                qrCode: '',
                backupCodes: [],
                error: getTwoFactorErrorMessage(error),
            };
        }
    },

    /**
     * Habilitar 2FA después de verificar el código
     */
    enable: async (data: Enable2FARequest): Promise<Enable2FAFlowResult> => {
        try {
            // Validar código antes de enviar
            const validationError = validateEnable2FAData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            console.log('DEBUG: Sending enable2FA request with data:', JSON.stringify(data));
            const result: Enable2FAResponse = await twoFactorService.enable2FA(data);
            
            return {
                success: true,
                message: result.message,
                backupCodes: result.backupCodes,
            };
        } catch (error: unknown) {
            console.error('Error enabling 2FA:', error);
            
            return {
                success: false,
                error: getTwoFactorErrorMessage(error),
            };
        }
    },

    /**
     * Verificar código 2FA durante login
     */
    verify: async (data: Verify2FARequest): Promise<Verify2FAFlowResult> => {
        try {
            // Validar formato del código
            const validationError = validateVerify2FAData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            const result: Verify2FAResponse = await twoFactorService.verify2FA(data);
            
            // Guardar token si la verificación fue exitosa
            if (result.success && result.token) {
                localStorage.setItem('authToken', result.token);
            }
            
            return {
                success: true,
                token: result.token,
            };
        } catch (error: unknown) {
            console.error('Error verifying 2FA:', error);
            
            return {
                success: false,
                error: getTwoFactorErrorMessage(error),
            };
        }
    },

    /**
     * Deshabilitar 2FA
     */
    disable: async (code: string): Promise<Disable2FAFlowResult> => {
        try {
            // Validar código antes de enviar
            if (!twoFactorService.isValidTOTPFormat(code)) {
                return {
                    success: false,
                    error: 'El código debe tener 6 dígitos',
                };
            }

            const result: Disable2FAResponse = await twoFactorService.disable2FA({ code });
            
            return {
                success: true,
                message: result.message,
            };
        } catch (error: unknown) {
            console.error('Error disabling 2FA:', error);
            
            return {
                success: false,
                error: getTwoFactorErrorMessage(error),
            };
        }
    },

    // ==================== Helpers ====================

    /**
     * Validar si un código es válido (TOTP o backup)
     */
    isValidCode: (code: string): boolean => {
        return twoFactorService.isValidTOTPFormat(code) || 
               twoFactorService.isValidBackupCodeFormat(code);
    },

    /**
     * Limpiar formato de código
     */
    cleanCode: (code: string): string => {
        return twoFactorService.cleanToken(code);
    },

    /**
     * Verificar si el usuario tiene 2FA habilitado (desde localStorage)
     */
    isEnabled: (): boolean => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.twoFactorEnabled || false;
            } catch {
                return false;
            }
        }
        return false;
    },
};
