import type { AuthUser } from '../../types/auth';

/**
 * AuthStorage - Singleton para gestionar el estado de autenticación
 * 
 * Maneja el almacenamiento y recuperación de:
 * - Token de acceso (accessToken)
 * - Token de refresco (refreshToken)
 * - Token temporal para 2FA (tempToken)
 * - Información del usuario (user)
 */
class AuthStorage {
    private static instance: AuthStorage;

    // Keys de localStorage
    private readonly AUTH_TOKEN_KEY = 'authToken';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';
    private readonly TEMP_TOKEN_KEY = 'tempToken';
    private readonly USER_KEY = 'user';

    private constructor() {
        // Singleton: constructor privado
    }

    /**
     * Obtiene la instancia única del AuthStorage
     */
    public static getInstance(): AuthStorage {
        if (!AuthStorage.instance) {
            AuthStorage.instance = new AuthStorage();
        }
        return AuthStorage.instance;
    }

    // ==================== Token de Acceso ====================

    /**
     * Guarda el token de acceso
     */
    public setAuthToken(token: string): void {
        localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    }

    /**
     * Obtiene el token de acceso
     */
    public getAuthToken(): string | null {
        return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }

    /**
     * Elimina el token de acceso
     */
    public removeAuthToken(): void {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
    }

    // ==================== Token de Refresco ====================

    /**
     * Guarda el refresh token
     */
    public setRefreshToken(token: string): void {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    /**
     * Obtiene el refresh token
     */
    public getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Elimina el refresh token
     */
    public removeRefreshToken(): void {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    // ==================== Token Temporal (2FA) ====================

    /**
     * Guarda el token temporal para 2FA
     */
    public setTempToken(token: string): void {
        localStorage.setItem(this.TEMP_TOKEN_KEY, token);
    }

    /**
     * Obtiene el token temporal para 2FA
     */
    public getTempToken(): string | null {
        return localStorage.getItem(this.TEMP_TOKEN_KEY);
    }

    /**
     * Elimina el token temporal
     */
    public removeTempToken(): void {
        localStorage.removeItem(this.TEMP_TOKEN_KEY);
    }

    // ==================== Usuario ====================

    /**
     * Guarda la información del usuario
     */
    public setUser(user: AuthUser): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Obtiene la información del usuario
     */
    public getUser(): AuthUser | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as AuthUser;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    }

    /**
     * Elimina la información del usuario
     */
    public removeUser(): void {
        localStorage.removeItem(this.USER_KEY);
    }

    // ==================== Helpers ====================

    /**
     * Verifica si el usuario está autenticado
     */
    public isAuthenticated(): boolean {
        const token = this.getAuthToken();
        const user = this.getUser();
        return !!(token && user);
    }

    /**
     * Verifica si hay un proceso de 2FA pendiente
     */
    public hasPending2FA(): boolean {
        return !!this.getTempToken();
    }

    /**
     * Limpia toda la información de autenticación
     */
    public clearAll(): void {
        this.removeAuthToken();
        this.removeRefreshToken();
        this.removeTempToken();
        this.removeUser();
    }

    /**
     * Obtiene toda la información de autenticación
     */
    public getAuthData(): {
        authToken: string | null;
        refreshToken: string | null;
        tempToken: string | null;
        user: AuthUser | null;
    } {
        return {
            authToken: this.getAuthToken(),
            refreshToken: this.getRefreshToken(),
            tempToken: this.getTempToken(),
            user: this.getUser(),
        };
    }
}

// Exportar la instancia única
export const authStorage = AuthStorage.getInstance();
