import { authService } from '../../../services/authService';
import type { AuthUser, LoginResponse } from '../../../types/auth';
import {
    validateLoginCredentials,
    getLoginErrorMessage,
    validate2FACode,
    get2FAErrorMessage
} from './validation/authValidations';

export interface LoginFlowResult {
    success: boolean;
    requiresTwoFactor: boolean;
    user?: AuthUser;
    error?: string;
}

export interface Verify2FAFlowResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

export interface LogoutFlowResult {
    success: boolean;
    error?: string;
}

export const authFlow = {
    async login(credentials: { email: string; password: string }): Promise<LoginFlowResult> {
        try {
            const validationError = validateLoginCredentials(credentials.email, credentials.password);
            if (validationError) {
                return {
                    success: false,
                    requiresTwoFactor: false,
                    error: validationError,
                };
            }

            const response: LoginResponse = await authService.login({
                uEmail: credentials.email,
                uPassword: credentials.password
            });

            if (response.requiresTwoFactor) {
                return {
                    success: true,
                    requiresTwoFactor: true,
                };
            }

            if (response.accessToken && response.user) {
                const stored = authService.getStoredUser();
                return {
                    success: true,
                    requiresTwoFactor: false,
                    user: stored ?? response.user,
                };
            }

            return {
                success: false,
                requiresTwoFactor: false,
                error: 'Respuesta inesperada del servidor',
            };
        } catch (error: unknown) {
            console.error('Error en authFlow.login:', error);
            return {
                success: false,
                requiresTwoFactor: false,
                error: getLoginErrorMessage(error),
            };
        }
    },

    async verify2FA(code: string): Promise<Verify2FAFlowResult> {
        try {
            const validationError = validate2FACode(code);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            const response = await authService.verify2FA(code.replace(/[\s-]/g, ''));

            if (response.accessToken && response.user) {
                const stored = authService.getStoredUser();
                return {
                    success: true,
                    user: stored ?? response.user,
                };
            }

            return {
                success: false,
                error: 'Respuesta inesperada del servidor',
            };
        } catch (error: unknown) {
            console.error('Error en authFlow.verify2FA:', error);
            return {
                success: false,
                error: get2FAErrorMessage(error),
            };
        }
    },

    async logout(): Promise<LogoutFlowResult> {
        try {
            await authService.logout();
            return {
                success: true,
            };
        } catch (error: unknown) {
            console.error('Error en authFlow.logout:', error);

            authService.clearLocalSession();

            return {
                success: true,
                error: 'Sesión cerrada localmente (error al comunicar con servidor)',
            };
        }
    },

    isAuthenticated(): boolean {
        return authService.isAuthenticated();
    },

    getStoredUser(): AuthUser | null {
        return authService.getStoredUser();
    },

    getToken(): string | null {
        return authService.getToken();
    },

    clearLocalSession(): void {
        authService.clearLocalSession();
    },
};
