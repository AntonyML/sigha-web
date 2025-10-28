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
   * Verificar código de recuperación (almacenar token)
   * Almacena el token recibido por email para usarlo en resetPassword
   */
  async verifyRecoveryCode(token: string): Promise<VerifyRecoveryCodeFlowResult> {
    try {
      // Validar token
      if (!token || token.trim().length === 0) {
        return {
          success: false,
          error: 'El código de recuperación es requerido.',
        };
      }

      // Limpiar espacios y validar formato (8 dígitos con posible espacio)
      const cleanToken = token.replace(/\s/g, '');
      if (cleanToken.length !== 8 || !/^\d{8}$/.test(cleanToken)) {
        return {
          success: false,
          error: 'El código debe tener 8 dígitos.',
        };
      }

      // Verificar que hayamos solicitado recuperación
      const storedEmail = sessionStorage.getItem('recovery_email');
      if (!storedEmail) {
        return {
          success: false,
          error: 'No se encontró una solicitud de recuperación activa.',
        };
      }

      // Guardar token para el siguiente paso
      sessionStorage.setItem('recovery_token', cleanToken);

      return {
        success: true,
        message: 'Código de recuperación verificado correctamente.',
      };
    } catch (error: unknown) {
      console.error('Error en passwordRecoveryFlow.verifyRecoveryCode:', error);
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