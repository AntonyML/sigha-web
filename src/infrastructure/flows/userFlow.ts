import { userService } from '../../services/userService';
import type { User, UpdateUserData, UserChangePasswordData } from '../../types/user';

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
 * Flujo de operaciones para usuarios normales
 *
 * Este flujo maneja las operaciones que un usuario normal puede realizar:
 * - Obtener su propio perfil
 * - Actualizar su propio perfil (solo nombre y apellidos)
 * - Cambiar su propia contraseña
 *
 * Todas las operaciones requieren autenticación JWT y solo afectan
 * al usuario autenticado (no puede modificar otros usuarios).
 */
export const userFlow = {
    /**
     * Obtener perfil del usuario autenticado
     *
     * @returns GetProfileFlowResult con los datos del usuario
     */
    async getProfile(): Promise<GetProfileFlowResult> {
        try {
            const user = await userService.getProfile();

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en userFlow.getProfile:', error);

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
     * Solo permite actualizar: uName, uFLastName, uSLastName
     * Otros campos son ignorados por el backend
     *
     * @param data Datos a actualizar (solo campos permitidos)
     * @returns UpdateProfileFlowResult con el usuario actualizado
     */
    async updateProfile(data: Partial<UpdateUserData>): Promise<UpdateProfileFlowResult> {
        try {
            // Validación básica del frontend
            if (!data.uName?.trim()) {
                return {
                    success: false,
                    error: 'El nombre es obligatorio.',
                };
            }

            if (!data.uFLastName?.trim()) {
                return {
                    success: false,
                    error: 'El primer apellido es obligatorio.',
                };
            }

            const user = await userService.updateProfile(data);

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en userFlow.updateProfile:', error);

            // Manejar diferentes tipos de errores
            if (error.response?.status === 400) {
                // Errores de validación
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

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Tu perfil no fue encontrado.',
                };
            }

            if (error.response?.status === 409) {
                return {
                    success: false,
                    error: 'Ya existe un usuario con esos datos.',
                };
            }

            return {
                success: false,
                error: 'Error al actualizar tu perfil. Inténtalo nuevamente.',
            };
        }
    },

    /**
     * Cambiar contraseña del usuario autenticado
     *
     * @param data Datos para cambio de contraseña
     * @returns ChangePasswordFlowResult con resultado de la operación
     */
    async changePassword(data: UserChangePasswordData): Promise<ChangePasswordFlowResult> {
        try {
            // Validación básica del frontend
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
                    error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.',
                };
            }

            if (data.currentPassword === data.newPassword) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe ser diferente a la actual.',
                };
            }

            await userService.changeUserPassword(data);

            return {
                success: true,
                message: 'Contraseña cambiada exitosamente.',
            };
        } catch (error: any) {
            console.error('Error en userFlow.changePassword:', error);

            // Manejar diferentes tipos de errores
            if (error.response?.status === 400) {
                return {
                    success: false,
                    error: 'La contraseña actual es incorrecta.',
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

            if (error.response?.status === 422) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe ser diferente a la actual.',
                };
            }

            return {
                success: false,
                error: 'Error al cambiar tu contraseña. Inténtalo nuevamente.',
            };
        }
    },
};