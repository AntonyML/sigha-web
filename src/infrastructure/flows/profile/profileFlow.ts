import { profileService } from '../../../services/profileService';
import type {
  User,
  UpdateUserData,
  UserChangePasswordData
} from '../../../types/user';
import {
  validateUpdateProfileData,
  validateChangePasswordData,
  getProfileErrorMessage
} from './validation/profileValidations';

/**
 * Resultado del flujo de obtención de perfil
 */
export interface GetProfileFlowResult {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * Resultado del flujo de actualización de perfil
 */
export interface UpdateProfileFlowResult {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * Resultado del flujo de cambio de contraseña
 */
export interface ChangePasswordFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * ProfileFlow - Flujo de gestión del perfil propio
 *
 * Maneja todas las operaciones relacionadas con el perfil del usuario autenticado:
 * - Obtener perfil propio
 * - Actualizar perfil propio
 * - Cambiar contraseña propia
 */
export const profileFlow = {
    /**
     * Obtener perfil del usuario autenticado
     *
     * @returns GetProfileFlowResult con los datos del usuario
     */
    async getProfile(): Promise<GetProfileFlowResult> {
        try {
            const user = await profileService.getProfile();

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en profileFlow.getProfile:', error);
            return {
                success: false,
                error: getProfileErrorMessage(error),
            };
        }
    },

    /**
     * Actualizar perfil del usuario autenticado
     *
     * @param data Datos a actualizar (campos limitados)
     * @returns UpdateProfileFlowResult con el usuario actualizado
     */
    async updateProfile(data: Partial<UpdateUserData>): Promise<UpdateProfileFlowResult> {
        try {
            // Validaciones del frontend
            const validationError = validateUpdateProfileData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            const user = await profileService.updateProfile(data);

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en profileFlow.updateProfile:', error);
            return {
                success: false,
                error: getProfileErrorMessage(error),
            };
        }
    },

    /**
     * Cambiar contraseña del usuario autenticado
     *
     * @param data Datos del cambio de contraseña
     * @returns ChangePasswordFlowResult con el resultado
     */
    async changePassword(data: UserChangePasswordData): Promise<ChangePasswordFlowResult> {
        try {
            // Validaciones del frontend
            const validationError = validateChangePasswordData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            await profileService.changePassword(data);

            return {
                success: true,
                message: 'Contraseña cambiada exitosamente.',
            };
        } catch (error: any) {
            console.error('Error en profileFlow.changePassword:', error);
            return {
                success: false,
                error: getProfileErrorMessage(error),
            };
        }
    },
};