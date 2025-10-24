import { profileService } from '../../services/profileService';
import type {
  User,
  UpdateUserData,
  UserChangePasswordData
} from '../../types/user';

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

            // Manejar diferentes tipos de errores
            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para acceder a tu perfil.',
                };
            }

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Tu perfil no fue encontrado.',
                };
            }

            return {
                success: false,
                error: 'Error al obtener tu perfil. Inténtalo nuevamente.',
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
            if (data.uEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.uEmail)) {
                    return {
                        success: false,
                        error: 'El formato del email no es válido.',
                    };
                }
            }

            const user = await profileService.updateProfile(data);

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en profileFlow.updateProfile:', error);

            if (error.response?.status === 400) {
                const messages = error.response.data?.message;
                if (Array.isArray(messages)) {
                    return {
                        success: false,
                        error: messages.join(', '),
                    };
                }
                return {
                    success: false,
                    error: 'Los datos proporcionados no son válidos.',
                };
            }

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para actualizar tu perfil.',
                };
            }

            if (error.response?.status === 409) {
                return {
                    success: false,
                    error: 'El email ya está en uso por otro usuario.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar tu perfil.',
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
            if (!data.currentPassword?.trim()) {
                return {
                    success: false,
                    error: 'La contraseña actual es obligatoria.',
                };
            }

            if (!data.newPassword?.trim()) {
                return {
                    success: false,
                    error: 'La nueva contraseña es obligatoria.',
                };
            }

            if (data.newPassword.length < 8) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe tener al menos 8 caracteres.',
                };
            }

            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número.',
                };
            }

            if (data.currentPassword === data.newPassword) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe ser diferente a la actual.',
                };
            }

            await profileService.changePassword(data);

            return {
                success: true,
                message: 'Contraseña cambiada exitosamente.',
            };
        } catch (error: any) {
            console.error('Error en profileFlow.changePassword:', error);

            if (error.response?.status === 400) {
                const messages = error.response.data?.message;
                if (Array.isArray(messages)) {
                    return {
                        success: false,
                        error: messages.join(', '),
                    };
                }
                return {
                    success: false,
                    error: 'Los datos proporcionados no son válidos.',
                };
            }

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para cambiar tu contraseña.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar la contraseña.',
            };
        }
    },
};