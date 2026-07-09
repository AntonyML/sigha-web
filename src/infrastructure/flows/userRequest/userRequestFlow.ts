// src/infrastructure/flows/userRequest/userRequestFlow.ts

import { authService } from '../../../services/authService';
import { validateUserRequestForm, type UserRequestFormData } from './validation/userRequestValidations';

/**
 * Resultado del flujo de solicitud de creación de cuenta
 */
export interface UserRequestFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * UserRequestFlow - Flujo de solicitud de creación de cuenta
 *
 * Encapsula la lógica de validación y envío de la solicitud
 * al endpoint POST /user-requests del backend.
 */
export const userRequestFlow = {
  /**
   * Enviar solicitud de creación de cuenta
   * Llama al endpoint /user-requests del backend
   */
  async submitRequest(data: UserRequestFormData): Promise<UserRequestFlowResult> {
    try {
      // Validar formulario completo
      const validationError = validateUserRequestForm(data);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Llamar al endpoint del backend (público, sin JWT)
      const response = await authService.requestUserAccount({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        reason: data.reason.trim(),
      });

      return {
        success: true,
        message: response.message || 'Tu solicitud fue enviada. Un administrador la revisará pronto.',
      };
    } catch (error: unknown) {
      console.error('Error en userRequestFlow.submitRequest:', error);
      return {
        success: false,
        error: getUserRequestErrorMessage(error),
      };
    }
  },
};

/**
 * Extrae mensaje de error amigable del error de axios/servidor
 */
function getUserRequestErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (status === 400) {
      return data?.message || data?.error || 'Datos inválidos. Verifica la información ingresada.';
    }
    if (status === 429) {
      return 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.';
    }
    if (status && status >= 500) {
      return 'Error del servidor. Por favor, intenta de nuevo más tarde.';
    }
    return data?.message || data?.error || 'Error al enviar la solicitud.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error inesperado. Por favor, intenta de nuevo.';
}