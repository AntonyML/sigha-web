import axios from 'axios';
import type {
    TwoFactorSetupResponse,
    TwoFactorStatusResponse,
    Enable2FARequest,
    Enable2FAResponse,
    Disable2FAResponse,
    RegenerateBackupCodesResponse,
    TwoFactorDebugResponse,
} from '../types/twoFactor';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Si el token expiró, redirigir a login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const twoFactorService = {
    /**
     * Generar QR code y secret para configurar 2FA
     * Requiere autenticación
     */
    generate2FA: async (): Promise<TwoFactorSetupResponse> => {
        const response = await apiClient.post<TwoFactorSetupResponse>('/auth/2fa/generate');
        return response.data;
    },

    /**
     * Habilitar 2FA después de verificar el código TOTP
     * Requiere autenticación
     */
    enable2FA: async (token: string): Promise<Enable2FAResponse> => {
        const request: Enable2FARequest = { token };
        const response = await apiClient.post<Enable2FAResponse>('/auth/2fa/enable', request);
        return response.data;
    },

    /**
     * Deshabilitar 2FA
     * Requiere autenticación
     */
    disable2FA: async (): Promise<Disable2FAResponse> => {
        const response = await apiClient.post<Disable2FAResponse>('/auth/2fa/disable');
        return response.data;
    },

    /**
     * Obtener estado actual de 2FA
     * Requiere autenticación
     */
    get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
        const response = await apiClient.get<TwoFactorStatusResponse>('/auth/2fa/status');
        return response.data;
    },

    /**
     * Regenerar códigos de respaldo
     * Requiere autenticación
     */
    regenerateBackupCodes: async (): Promise<RegenerateBackupCodesResponse> => {
        const response = await apiClient.post<RegenerateBackupCodesResponse>(
            '/auth/2fa/regenerate-backup-codes'
        );
        return response.data;
    },

    /**
     * Obtener información de debug de 2FA (solo para desarrollo)
     * Requiere autenticación
     * ⚠️ Este endpoint debe ser eliminado en producción
     */
    get2FADebug: async (): Promise<TwoFactorDebugResponse> => {
        const response = await apiClient.get<TwoFactorDebugResponse>('/auth/2fa/debug');
        return response.data;
    },

    // ==================== Helpers ====================

    /**
     * Verificar si el usuario tiene 2FA habilitado
     */
    is2FAEnabled: async (): Promise<boolean> => {
        try {
            const status = await twoFactorService.get2FAStatus();
            return status.enabled;
        } catch (error) {
            console.error('Error checking 2FA status:', error);
            return false;
        }
    },

    /**
     * Validar formato de código TOTP (6 dígitos)
     */
    isValidTOTPFormat: (token: string): boolean => {
        const cleanToken = token.replace(/[\s-]/g, '');
        return /^\d{6}$/.test(cleanToken);
    },

    /**
     * Validar formato de código de respaldo (8 caracteres hex)
     */
    isValidBackupCodeFormat: (code: string): boolean => {
        const cleanCode = code.replace(/[\s-]/g, '');
        return /^[0-9A-F]{8}$/i.test(cleanCode);
    },

    /**
     * Limpiar formato de código (remover espacios y guiones)
     */
    cleanToken: (token: string): string => {
        return token.replace(/[\s-]/g, '');
    },
};
