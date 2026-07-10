import { httpClient } from './httpClient';
import type {
  Setup2FAResponse,
  Enable2FARequest,
  Enable2FAResponse,
  Disable2FAResponse,
  TwoFactorStatusResponse,
  Verify2FARequest,
  Verify2FAResponse,
} from '../types/twoFactor';
import { config } from '../config/app.config';

export const twoFactorService = {
  /**
   * Obtener estado actual de 2FA
   */
  get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
    const response = await httpClient.get('/auth/2fa/status');
    return response.data;
  },

  /**
   * Configurar 2FA - genera QR code y backup codes
   */
  setup2FA: async (): Promise<Setup2FAResponse> => {
    const response = await httpClient.post<Setup2FAResponse>('/auth/setup-2fa');
    return response.data;
  },

  /**
   * Habilitar 2FA después de verificar el código
   */
  enable2FA: async (data: Enable2FARequest): Promise<Enable2FAResponse> => {
    const requestBody = { verificationCode: data.code };
    const response = await httpClient.post<Enable2FAResponse>('/auth/enable-2fa', requestBody);
    return response.data;
  },

  /**
   * Verificar código 2FA durante login
   */
  verify2FA: async (data: Verify2FARequest): Promise<Verify2FAResponse> => {
    const response = await httpClient.post<Verify2FAResponse>('/auth/verify-2fa', data);
    return response.data;
  },

  /**
   * Deshabilitar 2FA
   */
  disable2FA: async (data: { code: string }): Promise<Disable2FAResponse> => {
    const response = await httpClient.post<Disable2FAResponse>('/auth/disable-2fa', data);
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