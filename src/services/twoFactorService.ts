import axios from 'axios';
import type {
  Setup2FAResponse,
  Enable2FARequest,
  Enable2FAResponse,
  Disable2FAResponse,
} from '../types/twoFactor';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const twoFactorService = {
  /**
   * Configurar 2FA - genera QR code y backup codes
   */
  setup2FA: async (): Promise<Setup2FAResponse> => {
    const response = await apiClient.post<Setup2FAResponse>('/auth/setup-2fa');
    return response.data;
  },

  /**
   * Habilitar 2FA después de verificar el código
   */
  enable2FA: async (data: Enable2FARequest): Promise<Enable2FAResponse> => {
    const response = await apiClient.post<Enable2FAResponse>('/auth/enable-2fa', data);
    return response.data;
  },

  /**
   * Deshabilitar 2FA
   */
  disable2FA: async (): Promise<Disable2FAResponse> => {
    const response = await apiClient.post<Disable2FAResponse>('/auth/disable-2fa');
    return response.data;
  },

  // ==================== Helpers ====================

  /**
   * Validar formato de código TOTP (6 dígitos)
   */
  isValidTOTPFormat: (token: string): boolean => {
    const cleanToken = token.replace(/[\s-]/g, '');
    return /^\d{6}$/.test(cleanToken);
  },

  /**
   * Validar formato de código de respaldo (8 dígitos)
   */
  isValidBackupCodeFormat: (code: string): boolean => {
    const cleanCode = code.replace(/[\s-]/g, '');
    return /^\d{8}$/.test(cleanCode);
  },

  /**
   * Limpiar formato de código (remover espacios y guiones)
   */
  cleanToken: (token: string): string => {
    return token.replace(/[\s-]/g, '');
  },
};