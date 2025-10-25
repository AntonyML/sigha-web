import { authService } from '../../services/authService';
import { twoFactorService } from '../../services/twoFactorService';
import type { AuthUser, LoginResponse } from '../../types/auth';

/**
 * Resultado del flujo de login
 */
export interface LoginFlowResult {
    success: boolean;
    requiresTwoFactor: boolean;
    user?: AuthUser;
    error?: string;
}

/**
 * Resultado del flujo de verificación 2FA
 */
export interface Verify2FAFlowResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

/**
 * Resultado del flujo de logout
 */
export interface LogoutFlowResult {
    success: boolean;
    error?: string;
}

/**
 * AuthFlow - Flujo de autenticación
 * 
 * Encapsula toda la lógica de autenticación, incluyendo login, logout,
 * manejo de tokens y verificación 2FA.
 */
export const authFlow = {
    /**
     * Flujo completo de login
     *
     * Maneja:
     * - Validación de credenciales
     * - Login normal (sin 2FA)
     * - Login con 2FA (indica que requiere verificación)
     * - Almacenamiento de tokens y usuario
     * - Manejo de errores
     *
     * @param credentials - email y password del usuario
     * @returns LoginFlowResult con el estado del login
     */
    async login(credentials: { email: string; password: string }): Promise<LoginFlowResult> {
        try {
            // Validar credenciales
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    requiresTwoFactor: false,
                    error: 'Email y contraseña son requeridos',
                };
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(credentials.email)) {
                return {
                    success: false,
                    requiresTwoFactor: false,
                    error: 'El formato del email no es válido',
                };
            }

            // Intentar login
            const response: LoginResponse = await authService.login({
                uEmail: credentials.email,
                uPassword: credentials.password
            });

            // Caso 1: Requiere 2FA
            if (response.requiresTwoFactor) {
                return {
                    success: true,
                    requiresTwoFactor: true,
                };
            }

            // Caso 2: Login exitoso sin 2FA
            if (response.accessToken && response.user) {
                return {
                    success: true,
                    requiresTwoFactor: false,
                    user: response.user,
                };
            }

            // Caso inesperado
            return {
                success: false,
                requiresTwoFactor: false,
                error: 'Respuesta inesperada del servidor',
            };
        } catch (error: any) {
            console.error('Error en authFlow.login:', error);

            // Manejo de errores específicos
            if (error.response?.status === 401) {
                return {
                    success: false,
                    requiresTwoFactor: false,
                    error: 'Credenciales inválidas',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    requiresTwoFactor: false,
                    error: 'Usuario inactivo o bloqueado',
                };
            }

            return {
                success: false,
                requiresTwoFactor: false,
                error: error.response?.data?.message || 'Error al iniciar sesión',
            };
        }
    },

    /**
     * Flujo completo de verificación 2FA
     * 
     * Maneja:
     * - Validación del código 2FA
     * - Verificación con el backend
     * - Almacenamiento de tokens finales
     * - Limpieza del tempToken
     * - Manejo de errores
     * 
     * @param code - Código TOTP de 6 dígitos
     * @returns Verify2FAFlowResult con el estado de la verificación
     */
    async verify2FA(code: string): Promise<Verify2FAFlowResult> {
        try {
            console.log('Iniciando verify2FA con código:', code);

            // Validar que el código tenga el formato correcto (6 dígitos TOTP o 8 dígitos backup)
            const cleanCode = code.replace(/[\s-]/g, '');
            console.log('Código limpiado:', cleanCode);

            if (!twoFactorService.isValidTOTPFormat(cleanCode) && !twoFactorService.isValidBackupCodeFormat(cleanCode)) {
                console.log('Código con formato inválido');
                return {
                    success: false,
                    error: 'El código debe tener 6 dígitos (TOTP) u 8 dígitos (código de respaldo)',
                };
            }

            // Verificar código 2FA
            const tempToken = authService.getTempToken();
            console.log('TempToken obtenido:', tempToken);

            if (!tempToken) {
                console.log('No hay tempToken disponible');
                return {
                    success: false,
                    error: 'No hay sesión de autenticación pendiente',
                };
            }

            console.log('Enviando request a authService.verify2FA');
            const response = await authService.verify2FA({
                tempToken,
                code: cleanCode
            });
            console.log('Respuesta de authService.verify2FA:', response);

            if (response.accessToken && response.user) {
                console.log('Verificación exitosa, retornando usuario');
                return {
                    success: true,
                    user: response.user,
                };
            }

            console.log('Respuesta inesperada del servidor');
            return {
                success: false,
                error: 'Respuesta inesperada del servidor',
            };
        } catch (error: any) {
            console.error('Error en authFlow.verify2FA:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            console.error('Error message:', error.message);

            if (error.response?.status === 401) {
                // Distinguir entre código inválido y token expirado
                const errorMessage = error.response?.data?.message || '';
                if (errorMessage.includes('Token temporal') || errorMessage.includes('expirado')) {
                    return {
                        success: false,
                        error: 'El tiempo para verificar el código ha expirado (5 minutos desde el login inicial). La hora del servidor puede estar desincronizada. Por favor, inicia sesión nuevamente.',
                    };
                } else {
                    return {
                        success: false,
                        error: 'Código 2FA inválido. Verifica que el código sea correcto.',
                    };
                }
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al verificar código 2FA',
            };
        }
    },

    /**
     * Flujo completo de logout
     * 
     * Maneja:
     * - Cierre de sesión en el backend
     * - Limpieza de localStorage
     * - Manejo de errores (limpia igualmente)
     * 
     * @returns LogoutFlowResult con el estado del logout
     */
    async logout(): Promise<LogoutFlowResult> {
        try {
            await authService.logout();
            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en authFlow.logout:', error);

            // Aunque falle, limpiamos la sesión local
            authService.clearLocalSession();

            return {
                success: true, // Consideramos éxito porque se limpió localmente
                error: 'Sesión cerrada localmente (error al comunicar con servidor)',
            };
        }
    },

    // ==================== Helpers ====================

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return authService.isAuthenticated();
    },

    /**
     * Obtiene el usuario almacenado en localStorage
     */
    getStoredUser(): AuthUser | null {
        return authService.getStoredUser();
    },

    /**
     * Obtiene el token almacenado
     */
    getToken(): string | null {
        return authService.getToken();
    },

    /**
     * Limpia la sesión local
     */
    clearLocalSession(): void {
        authService.clearLocalSession();
    },
};
