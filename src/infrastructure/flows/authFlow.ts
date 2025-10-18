import { authService } from '../../services/authService';
import type {
    LoginCredentials,
    LoginResponse,
    AuthUser,
} from '../../types/auth';
import type { TwoFactorVerificationRequest } from '../../types/twoFactor';

/**
 * Resultado del flujo de login
 */
export interface LoginFlowResult {
    success: boolean;
    requiresTwoFactor: boolean;
    user?: AuthUser;
    tempToken?: string;
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
     * - Login con 2FA (retorna tempToken)
     * - Almacenamiento de tokens y usuario
     * - Manejo de errores
     * 
     * @param credentials - uEmail y uPassword del usuario
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

            // Convertir credenciales al formato del backend
            const loginCredentials: LoginCredentials = {
                uEmail: credentials.email,
                uPassword: credentials.password
            };

            // Intentar login
            const response: LoginResponse = await authService.login(loginCredentials);

            // Caso 1: Requiere 2FA
            if (response.requiresTwoFactor && response.tempToken) {
                return {
                    success: true,
                    requiresTwoFactor: true,
                    tempToken: response.tempToken,
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
            // Validar que el código tenga el formato correcto
            const cleanCode = code.replace(/[\s-]/g, '');
            if (!/^\d{6}$/.test(cleanCode)) {
                return {
                    success: false,
                    error: 'El código debe tener 6 dígitos',
                };
            }

            // Obtener tempToken
            const tempToken = authService.getTempToken();
            if (!tempToken) {
                return {
                    success: false,
                    error: 'No hay sesión de autenticación pendiente',
                };
            }

            // Verificar código 2FA
            const request: TwoFactorVerificationRequest = {
                tempToken: tempToken,
                twoFactorCode: cleanCode,
            };

            const response = await authService.verify2FA(request);

            if (response.accessToken && response.user) {
                return {
                    success: true,
                    user: response.user,
                };
            }

            return {
                success: false,
                error: 'Respuesta inesperada del servidor',
            };
        } catch (error: any) {
            console.error('Error en authFlow.verify2FA:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Código 2FA inválido o expirado',
                };
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
     * Obtiene el tempToken (para flujo 2FA)
     */
    getTempToken(): string | null {
        return authService.getTempToken();
    },

    /**
     * Limpia la sesión local
     */
    clearLocalSession(): void {
        authService.clearLocalSession();
    },
};
