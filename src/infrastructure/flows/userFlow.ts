import { userService } from '../../services/userService';
import type {
    User,
    UserRole,
    CreateUserData,
    UpdateUserData,
    UserChangePasswordData,
    UserSearchParams,
} from '../../types/user';

/**
 * Resultado genérico de operaciones de usuario
 */
export interface UserFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Resultado de obtener un usuario
 */
export interface GetUserFlowResult extends UserFlowResult {
    user?: User;
}

/**
 * Resultado de obtener lista de usuarios
 */
export interface GetUsersFlowResult extends UserFlowResult {
    users?: User[];
    total?: number;
}

/**
 * Resultado de crear un usuario
 */
export interface CreateUserFlowResult extends UserFlowResult {
    user?: User;
}

/**
 * Resultado de actualizar un usuario
 */
export interface UpdateUserFlowResult extends UserFlowResult {
    user?: User;
}

/**
 * Resultado de obtener roles
 */
export interface GetRolesFlowResult extends UserFlowResult {
    roles?: UserRole[];
}

/**
 * UserFlow - Flujo de gestión de usuarios
 * 
 * Encapsula toda la lógica de CRUD de usuarios, validaciones,
 * búsquedas y gestión de contraseñas.
 */
export const userFlow = {
    /**
     * Flujo para obtener todos los usuarios
     * 
     * Maneja:
     * - Obtención de lista de usuarios
     * - Manejo de errores
     * - Validación de respuesta
     * 
     * @returns GetUsersFlowResult con la lista de usuarios
     */
    async getAllUsers(): Promise<GetUsersFlowResult> {
        try {
            const users = await userService.getAllUsers();

            return {
                success: true,
                users,
                total: users.length,
            };
        } catch (error: any) {
            console.error('Error en userFlow.getAllUsers:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para ver la lista de usuarios.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener usuarios',
            };
        }
    },

    /**
     * Flujo para obtener un usuario por ID
     * 
     * Maneja:
     * - Validación del ID
     * - Obtención del usuario
     * - Manejo de errores 404
     * 
     * @param id - ID del usuario
     * @returns GetUserFlowResult con el usuario encontrado
     */
    async getUserById(id: number): Promise<GetUserFlowResult> {
        try {
            // Validar ID
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido',
                };
            }

            const user = await userService.getUserById(id);

            return {
                success: true,
                user,
            };
        } catch (error: any) {
            console.error('Error en userFlow.getUserById:', error);

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado',
                };
            }

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener usuario',
            };
        }
    },

    /**
     * Flujo completo para crear un usuario
     * 
     * Maneja:
     * - Validación de datos requeridos
     * - Validación de formato de email
     * - Validación de contraseña
     * - Creación del usuario
     * - Manejo de errores (email duplicado, etc.)
     * 
     * @param data - Datos del nuevo usuario
     * @returns CreateUserFlowResult con el usuario creado
     */
    async createUser(data: CreateUserData): Promise<CreateUserFlowResult> {
        try {
            // Validar datos requeridos
            if (!data.uIdentification || !data.uName || !data.uFLastName) {
                return {
                    success: false,
                    error: 'Identificación, nombre y primer apellido son requeridos',
                };
            }

            if (!data.uEmail || !data.uPassword) {
                return {
                    success: false,
                    error: 'Email y contraseña son requeridos',
                };
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.uEmail)) {
                return {
                    success: false,
                    error: 'El formato del email no es válido',
                };
            }

            // Validar longitud de contraseña
            if (data.uPassword.length < 8) {
                return {
                    success: false,
                    error: 'La contraseña debe tener al menos 8 caracteres',
                };
            }

            // Validar roleId
            if (!data.roleId || data.roleId <= 0) {
                return {
                    success: false,
                    error: 'Debe seleccionar un rol válido',
                };
            }

            // Crear usuario
            const user = await userService.createUser(data);

            return {
                success: true,
                user,
                message: 'Usuario creado exitosamente',
            };
        } catch (error: any) {
            console.error('Error en userFlow.createUser:', error);

            if (error.response?.status === 409) {
                return {
                    success: false,
                    error: 'Ya existe un usuario con ese email o identificación',
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
                    error: 'No tienes permisos para crear usuarios.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear usuario',
            };
        }
    },

    /**
     * Flujo completo para actualizar un usuario
     * 
     * Maneja:
     * - Validación del ID
     * - Validación de datos (si se proporcionan)
     * - Actualización del usuario
     * - Manejo de errores
     * 
     * @param id - ID del usuario a actualizar
     * @param data - Datos a actualizar
     * @returns UpdateUserFlowResult con el usuario actualizado
     */
    async updateUser(id: number, data: UpdateUserData): Promise<UpdateUserFlowResult> {
        try {
            // Validar ID
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido',
                };
            }

            // Validar que se envíe al menos un campo
            if (Object.keys(data).length === 0) {
                return {
                    success: false,
                    error: 'Debe proporcionar al menos un campo para actualizar',
                };
            }

            // Validar formato de email si se proporciona
            if (data.uEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.uEmail)) {
                    return {
                        success: false,
                        error: 'El formato del email no es válido',
                    };
                }
            }

            // Validar contraseña si se proporciona
            if (data.uPassword && data.uPassword.length < 8) {
                return {
                    success: false,
                    error: 'La contraseña debe tener al menos 8 caracteres',
                };
            }

            // Actualizar usuario
            const user = await userService.updateUser(id, data);

            return {
                success: true,
                user,
                message: 'Usuario actualizado exitosamente',
            };
        } catch (error: any) {
            console.error('Error en userFlow.updateUser:', error);

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado',
                };
            }

            if (error.response?.status === 409) {
                return {
                    success: false,
                    error: 'Ya existe un usuario con ese email o identificación',
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
                    error: 'No tienes permisos para actualizar usuarios.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar usuario',
            };
        }
    },

    /**
     * Flujo para eliminar un usuario
     * 
     * Maneja:
     * - Validación del ID
     * - Confirmación (debe manejarse en la UI)
     * - Eliminación del usuario
     * - Manejo de errores
     * 
     * @param id - ID del usuario a eliminar
     * @returns UserFlowResult con el resultado de la operación
     */
    async deleteUser(id: number): Promise<UserFlowResult> {
        try {
            // Validar ID
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido',
                };
            }

            await userService.deleteUser(id);

            return {
                success: true,
                message: 'Usuario eliminado exitosamente',
            };
        } catch (error: any) {
            console.error('Error en userFlow.deleteUser:', error);

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado',
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
                    error: 'No tienes permisos para eliminar usuarios.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar usuario',
            };
        }
    },

    /**
     * Flujo para cambiar contraseña de un usuario
     * 
     * Maneja:
     * - Validación de contraseñas
     * - Verificación de que las contraseñas coincidan
     * - Cambio de contraseña
     * - Manejo de errores
     * 
     * @param id - ID del usuario
     * @param data - Contraseñas (actual, nueva, confirmación)
     * @returns UserFlowResult con el resultado
     */
    async changePassword(id: number, data: UserChangePasswordData): Promise<UserFlowResult> {
        try {
            // Validar ID
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido',
                };
            }

            // Validar que todos los campos estén presentes
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
                return {
                    success: false,
                    error: 'Todos los campos son requeridos',
                };
            }

            // Validar longitud de nueva contraseña
            if (data.newPassword.length < 6) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe tener al menos 6 caracteres',
                };
            }

            // Validar que las contraseñas coincidan
            if (data.newPassword !== data.confirmPassword) {
                return {
                    success: false,
                    error: 'Las contraseñas nuevas no coinciden',
                };
            }

            // Validar que la nueva contraseña sea diferente a la actual
            if (data.currentPassword === data.newPassword) {
                return {
                    success: false,
                    error: 'La nueva contraseña debe ser diferente a la actual',
                };
            }

            await userService.changeUserPassword(id, data);

            return {
                success: true,
                message: 'Contraseña cambiada exitosamente',
            };
        } catch (error: any) {
            console.error('Error en userFlow.changePassword:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'Contraseña actual incorrecta',
                };
            }

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar contraseña',
            };
        }
    },

    /**
     * Flujo para buscar usuarios con filtros
     * 
     * Maneja:
     * - Validación de parámetros de búsqueda
     * - Búsqueda con filtros
     * - Manejo de resultados vacíos
     * - Manejo de errores
     * 
     * @param params - Parámetros de búsqueda
     * @returns GetUsersFlowResult con usuarios encontrados
     */
    async searchUsers(params: UserSearchParams): Promise<GetUsersFlowResult> {
        try {
            // Validar que se proporcione al menos un parámetro
            if (Object.keys(params).length === 0) {
                return {
                    success: false,
                    error: 'Debe proporcionar al menos un parámetro de búsqueda',
                };
            }

            const users = await userService.searchUsers(params);

            if (users.length === 0) {
                return {
                    success: true,
                    users: [],
                    total: 0,
                    message: 'No se encontraron usuarios con los criterios especificados',
                };
            }

            return {
                success: true,
                users,
                total: users.length,
            };
        } catch (error: any) {
            console.error('Error en userFlow.searchUsers:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al buscar usuarios',
            };
        }
    },

    /**
     * Flujo para obtener todos los roles disponibles
     * 
     * Maneja:
     * - Obtención de roles
     * - Caché de roles (opcional)
     * - Manejo de errores
     * 
     * @returns GetRolesFlowResult con la lista de roles
     */
    async getAllRoles(): Promise<GetRolesFlowResult> {
        try {
            const roles = await userService.getAllRoles();

            return {
                success: true,
                roles,
            };
        } catch (error: any) {
            console.error('Error en userFlow.getAllRoles:', error);

            if (error.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener roles',
            };
        }
    },

    /**
     * Flujo para activar/desactivar un usuario
     * 
     * Maneja:
     * - Obtención del estado actual
     * - Toggle del estado
     * - Actualización del usuario
     * 
     * @param id - ID del usuario
     * @param isActive - Nuevo estado activo/inactivo
     * @returns UpdateUserFlowResult
     */
    async toggleUserStatus(id: number, isActive: boolean): Promise<UpdateUserFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido',
                };
            }

            const user = await userService.updateUser(id, { u_is_active: isActive });

            return {
                success: true,
                user,
                message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            };
        } catch (error: any) {
            console.error('Error en userFlow.toggleUserStatus:', error);

            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado',
                };
            }

            if (error.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para cambiar el estado de usuarios.',
                };
            }

            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar estado del usuario',
            };
        }
    },

    // ==================== Helpers ====================

    /**
     * Valida que un email tenga formato correcto
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Valida que una contraseña cumpla los requisitos mínimos
     */
    isValidPassword(password: string): { valid: boolean; error?: string } {
        if (!password) {
            return { valid: false, error: 'La contraseña es requerida' };
        }

        if (password.length < 6) {
            return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Puedes agregar más validaciones aquí
        // Ejemplo: verificar mayúsculas, números, caracteres especiales, etc.

        return { valid: true };
    },

    /**
     * Formatea el nombre completo del usuario
     */
    getFullName(user: User): string {
        const parts = [user.uName, user.uFLastName];
        if (user.uSLastName) {
            parts.push(user.uSLastName);
        }
        return parts.join(' ');
    },

    /**
     * Obtiene las iniciales del usuario
     */
    getInitials(user: User): string {
        const firstInitial = user.uName.charAt(0).toUpperCase();
        const lastInitial = user.uFLastName.charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    },

    /**
     * Verifica si un usuario está activo
     */
    isUserActive(user: User): boolean {
        return user.uIsActive === true;
    },

    /**
     * Verifica si el email del usuario está verificado
     */
    isEmailVerified(user: User): boolean {
        return user.uEmailVerified === true;
    },
};
