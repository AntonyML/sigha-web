// src/infrastructure/flows/passwordRecovery/passwordRecoveryFlow.ts

import { authService } from '../../../services/authService';
import {
  validatePasswordRecoveryRequest,
  validatePasswordResetRequest,
  getPasswordRecoveryErrorMessage
} from './validation/passwordRecoveryValidations';

/**
 * Resultado del flujo de solicitud de recuperación
 */
export interface RequestRecoveryFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Resultado del flujo de verificación de código
 */
export interface VerifyRecoveryCodeFlowResult {
  success: boolean;
  message?: string;
  error?: string;
  /** Token limpio (8 dígitos sin espacios) — el call site debe almacenarlo en sessionStorage */
  cleanToken?: string;
}

/**
 * Resultado del flujo de cambio de contraseña
 */
export interface ResetPasswordFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * PasswordRecoveryFlow - Flujo de recuperación de contraseña
 *
 * Encapsula toda la lógica de recuperación de contraseña, utilizando
 * los endpoints del backend para forgot-password y reset-password.
 */
export const passwordRecoveryFlow = {
  /**
   * Solicitar recuperación de contraseña
   * Llama al endpoint /auth/forgot-password del backend
   */
  async requestRecovery(email: string): Promise<RequestRecoveryFlowResult> {
    try {
      // Validar email
      const validationError = validatePasswordRecoveryRequest(email);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Llamar al endpoint del backend
      const response = await authService.forgotPassword(email);

      // Guardar email para el siguiente paso
      sessionStorage.setItem('recovery_email', email);

      return {
        success: true,
        message: response.message || 'Código de recuperación enviado al email.',
      };
    } catch (error: unknown) {
      console.error('Error en passwordRecoveryFlow.requestRecovery:', error);
      return {
        success: false,
        error: getPasswordRecoveryErrorMessage(error),
      };
    }
  },

  /**
   * Validar formato del código de recuperación (8 dígitos)
   * NO hace llamada HTTP — solo validación local de formato.
   * Devuelve cleanToken en el resultado para que el call site lo almacene.
   */
  async validateRecoveryCodeFormat(token: string): Promise<VerifyRecoveryCodeFlowResult> {
    try {
      // Validar que el token no esté vacío
      if (!token || token.trim().length === 0) {
        return {
          success: false,
          error: 'El código de recuperación es requerido.',
        };
      }

      // Limpiar espacios y validar formato (exactamente 8 dígitos)
      const cleanToken = token.replace(/\s/g, '');
      if (cleanToken.length !== 8 || !/^\d{8}$/.test(cleanToken)) {
        return {
          success: false,
          error: 'El código debe tener 8 dígitos.',
        };
      }

      return {
        success: true,
        message: 'Formato de código válido.',
        cleanToken,
      };
    } catch (error: unknown) {
      console.error('Error en passwordRecoveryFlow.validateRecoveryCodeFormat:', error);
      return {
        success: false,
        error: getPasswordRecoveryErrorMessage(error),
      };
    }
  },

  /**
   * Cambiar contraseña usando el token
   * Llama al endpoint /auth/reset-password del backend
   */
  async resetPassword(newPassword: string, confirmPassword: string): Promise<ResetPasswordFlowResult> {
    try {
      // Verificar que tengamos el token
      const token = sessionStorage.getItem('recovery_token');
      if (!token) {
        return {
          success: false,
          error: 'Debes verificar el código de recuperación primero.',
        };
      }

      // Validar datos
      const validationError = validatePasswordResetRequest(newPassword, confirmPassword);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Llamar al endpoint del backend
      const response = await authService.resetPassword(token, newPassword);

      // Limpiar datos de recuperación
      sessionStorage.removeItem('recovery_email');
      sessionStorage.removeItem('recovery_token');

      return {
        success: true,
        message: response.message || 'Contraseña cambiada exitosamente.',
      };
    } catch (error: unknown) {
      console.error('Error en passwordRecoveryFlow.resetPassword:', error);
      return {
        success: false,
        error: getPasswordRecoveryErrorMessage(error),
      };
    }
  },
};
