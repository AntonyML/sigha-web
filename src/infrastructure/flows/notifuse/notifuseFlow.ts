// src/infrastructure/flows/notifuse/notifuseFlow.ts

import { NotifuseService } from '../../../services/notifuseService';
import { validateSendCodeVerifyRequest, validateSendBackupCodesRequest } from './validation/notifuseValidations';
import type {
  SendCodeVerifyRequest,
  SendBackupCodesRequest,
  NotifuseResponse,
} from '../../../types/notifuse';

/**
 * Resultado del flujo de envío de código de verificación
 */
export interface SendCodeVerifyFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Resultado del flujo de envío de códigos de respaldo
 */
export interface SendBackupCodesFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * NotifuseFlow - Flujo de notificaciones
 *
 * Encapsula la lógica para enviar notificaciones por email,
 * incluyendo códigos de verificación y códigos de respaldo 2FA.
 */
export const notifuseFlow = {
  /**
   * Flujo para enviar código de verificación por email
   *
   * Maneja:
   * - Validación básica de datos
   * - Envío de la notificación
   * - Manejo de errores
   *
   * @param request - Datos para el envío del código
   * @returns SendCodeVerifyFlowResult con el estado del envío
   */
  async sendCodeVerify(request: SendCodeVerifyRequest): Promise<SendCodeVerifyFlowResult> {
    try {
      // Validación de datos
      const validationError = validateSendCodeVerifyRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Enviar notificación
      const response: NotifuseResponse = await NotifuseService.sendCodeVerify(request);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Código de verificación enviado exitosamente',
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al enviar código de verificación',
        };
      }
    } catch (error: unknown) {
      console.error('Error en notifuseFlow.sendCodeVerify:', error);
      return {
        success: false,
        error: 'Error inesperado al enviar código de verificación',
      };
    }
  },

  /**
   * Flujo para enviar códigos de respaldo por email
   *
   * Maneja:
   * - Validación básica de datos
   * - Envío de la notificación
   * - Manejo de errores
   *
   * @param request - Datos para el envío de códigos de respaldo
   * @returns SendBackupCodesFlowResult con el estado del envío
   */
  async sendBackupCodes(request: SendBackupCodesRequest): Promise<SendBackupCodesFlowResult> {
    try {
      // Validación de datos
      const validationError = validateSendBackupCodesRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Enviar notificación
      const response: NotifuseResponse = await NotifuseService.sendBackupCodes(request);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Códigos de respaldo enviados exitosamente',
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al enviar códigos de respaldo',
        };
      }
    } catch (error: unknown) {
      console.error('Error en notifuseFlow.sendBackupCodes:', error);
      return {
        success: false,
        error: 'Error inesperado al enviar códigos de respaldo',
      };
    }
  },
};