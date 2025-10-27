// src/infrastructure/flows/passwordRecovery/passwordRecoveryFlow.ts

import { notifuseFlow } from '../notifuse';
import type { SendBackupCodesRequest } from '../../../types/notifuse';
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
 * Encapsula toda la lógica de recuperación de contraseña, incluyendo:
 * - Solicitud de códigos de recuperación por email
 * - Verificación del código de recuperación
 * - Cambio de contraseña
 *
 * NOTA: Esta es una implementación simplificada que simula el proceso.
 * En producción, necesitaría endpoints específicos en el backend.
 */
export const passwordRecoveryFlow = {
  /**
   * Solicitar recuperación de contraseña
   * Envía códigos de recuperación simulados al email del usuario
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

      // Simular envío de códigos de recuperación
      // En producción, esto debería obtener códigos reales del backend
      const mockCodes = [
        '12345678', '87654321', '11223344', '44332211',
        '55667788', '88776655', '99887766', '66778899'
      ];

      // Preparar datos para notifuse
      const request: SendBackupCodesRequest = {
        workspace_id: 'hogar_ancianos_workspace', // Valor hardcodeado por ahora
        notification: {
          id: '6_codes_2fa_email',
          contact: {
            email: email,
            first_name: 'Usuario',
          },
          data: {
            titulo_principal: 'Recuperación de Contraseña',
            nombre_usuario: 'Usuario',
            mensaje_contexto: 'Has solicitado recuperar tu contraseña. Utiliza uno de los siguientes códigos para completar el proceso:',
            tiempo_expiracion: '24 horas',
            ubicacion: 'Sistema Hogar de Ancianos ASOPOGUA',
            fecha_hora: new Date().toLocaleString('es-ES'),
            codigo_1: mockCodes[0],
            codigo_2: mockCodes[1],
            codigo_3: mockCodes[2],
            codigo_4: mockCodes[3],
            codigo_5: mockCodes[4],
            codigo_6: mockCodes[5],
            codigo_7: mockCodes[6],
            codigo_8: mockCodes[7],
          },
        },
      };

      // Enviar códigos por email
      const result = await notifuseFlow.sendBackupCodes(request);

      if (result.success) {
        // Guardar email y códigos temporalmente para verificación
        sessionStorage.setItem('recovery_email', email);
        sessionStorage.setItem('recovery_codes', JSON.stringify(mockCodes));

        return {
          success: true,
          message: 'Se han enviado los códigos de recuperación a tu email.',
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al enviar los códigos de recuperación.',
        };
      }
    } catch (error: unknown) {
      console.error('Error en passwordRecoveryFlow.requestRecovery:', error);
      return {
        success: false,
        error: getPasswordRecoveryErrorMessage(error),
      };
    }
  },

  /**
   * Verificar código de recuperación
   */
  async verifyRecoveryCode(code: string): Promise<VerifyRecoveryCodeFlowResult> {
    try {
      // Validar código
      if (!code || code.trim().length === 0) {
        return {
          success: false,
          error: 'El código de recuperación es requerido.',
        };
      }

      // Obtener códigos guardados
      const storedCodes = sessionStorage.getItem('recovery_codes');
      if (!storedCodes) {
        return {
          success: false,
          error: 'No hay códigos de recuperación activos. Solicita uno nuevo.',
        };
      }

      const codes = JSON.parse(storedCodes);
      const cleanCode = code.trim();

      // Verificar si el código es válido
      if (!codes.includes(cleanCode)) {
        return {
          success: false,
          error: 'Código de recuperación inválido.',
        };
      }

      // Marcar como verificado
      sessionStorage.setItem('recovery_verified', 'true');

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
   * Cambiar contraseña después de verificar el código
   */
  async resetPassword(newPassword: string, confirmPassword: string): Promise<ResetPasswordFlowResult> {
    try {
      // Verificar que el código haya sido validado
      const isVerified = sessionStorage.getItem('recovery_verified');
      if (!isVerified) {
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

      // Simular cambio de contraseña
      // En producción, esto debería llamar a un endpoint real
      const email = sessionStorage.getItem('recovery_email');
      if (!email) {
        return {
          success: false,
          error: 'Sesión de recuperación expirada.',
        };
      }

      // Limpiar datos de recuperación
      sessionStorage.removeItem('recovery_email');
      sessionStorage.removeItem('recovery_codes');
      sessionStorage.removeItem('recovery_verified');

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente.',
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