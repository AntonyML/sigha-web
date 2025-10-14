import { authService } from '../../services/authService';
import type {
    LoginCredentials,
    LoginResponse,
    AuthUser,
    SessionsResponse,
    UserSession,
} from '../../types/auth';
import type { Verify2FARequest } from '../../types/twoFactor';

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
 * Resultado del flujo de refresh token
 */
export interface RefreshTokenFlowResult {
    success: boolean;
    error?: string;
}

/**
 * Resultado del flujo de obtener usuario actual
 */
export interface GetCurrentUserFlowResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

/**
 * Resultado del flujo de gestión de sesiones
 */
export interface SessionsFlowResult {
    success: boolean;
    sessions?: UserSession[];
    error?: string;
}

/**
 * AuthFlow - Flujo de autenticación
 * 
 * Encapsula toda la lógica de autenticación, incluyendo login, logout,
 * manejo de tokens, sesiones y verificación 2FA.
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
     * @param credentials - Email y password del usuario
     * @returns LoginFlowResult con el estado del login
     */
    async login(credentials: LoginCredentials): Promise<LoginFlowResult> {
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
            const response: LoginResponse = await authService.login(credentials);

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
            const request: Verify2FARequest = {
                sessionToken: tempToken,
                token: cleanCode,
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

    /**
     * Flujo de refresh token
     * 
     * Maneja:
     * - Renovación automática del access token
     * - Validación de refresh token
     * - Manejo de errores (redirige a login si falla)
     * 
     * @returns RefreshTokenFlowResult con el estado del refresh
     */
    async refreshToken(): Promise<RefreshTokenFlowResult> {
        try {
            await authService.refreshToken();
            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en authFlow.refreshToken:', error);

            // Si falla el refresh, limpiar sesión
            authService.clearLocalSession();

            return {
                success: false,
                error: 'Sesión expirada, por favor inicia sesión nuevamente',
            };
        }
    },

    /**
     * Flujo para obtener usuario actual desde el backend
     * 
     * Maneja:
     * - Obtención de datos actualizados del usuario
     * - Actualización del localStorage
     * - Manejo de errores
     * 
     * @returns GetCurrentUserFlowResult con los datos del usuario
     */
    async getCurrentUser(): Promise<GetCurrentUserFlowResult> {
        try {
            const user = await authService.getCurrentUser();

            // Actualizar usuario en localStorage
            localStorage.setItem('user', JSON.stringify(user));

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en authFlow.getCurrentUser:', error);

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener datos del usuario',
            };
        }
    },

    /**
     * Flujo para obtener sesiones activas del usuario
     * 
     * @returns SessionsFlowResult con la lista de sesiones
     */
    async getActiveSessions(): Promise<SessionsFlowResult> {
        try {
            const response: SessionsResponse = await authService.getActiveSessions();

            return {
                success: true,
                sessions: response.sessions,
            };
        } catch (error: any) {
            console.error('Error en authFlow.getActiveSessions:', error);

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener sesiones activas',
            };
        }
    },

    /**
     * Flujo para cerrar una sesión específica
     * 
     * @param sessionId - ID de la sesión a cerrar
     * @returns LogoutFlowResult con el estado
     */
    async logoutSession(sessionId: number): Promise<LogoutFlowResult> {
        try {
            await authService.logoutSession(sessionId);

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en authFlow.logoutSession:', error);

            return {
                success: false,
                error: error.response?.data?.message || 'Error al cerrar la sesión',
            };
        }
    },

    /**
     * Flujo para cerrar todas las sesiones del usuario
     * 
     * @returns LogoutFlowResult con el estado
     */
    async logoutAllSessions(): Promise<LogoutFlowResult> {
        try {
            await authService.logoutAllSessions();

            // Limpiar sesión local también
            authService.clearLocalSession();

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en authFlow.logoutAllSessions:', error);

            return {
                success: false,
                error: error.response?.data?.message || 'Error al cerrar todas las sesiones',
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
