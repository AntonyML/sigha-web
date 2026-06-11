import { userManagementService } from '../../../services/userManagementService';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserSearchParams
} from '../../../types/user';
import {
  validateCreateUserData,
  validateUpdateUserData,
  validateUserSearchParams,
  getUserManagementErrorMessage
} from './validation/userValidations';
import { AxiosError } from 'axios';

/**
 * Resultado del flujo de obtención de usuarios
 */
export interface GetUsersFlowResult {
    success: boolean;
    users?: User[];
    total?: number;
    error?: string;
}

/**
 * Resultado del flujo de obtención de un usuario
 */
export interface GetUserFlowResult {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * Resultado del flujo de creación de usuario
 */
export interface CreateUserFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

/**
 * Resultado del flujo de actualización de usuario
 */
export interface UpdateUserFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

/**
 * Resultado del flujo de eliminación de usuario
 */
export interface DeleteUserFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Resultado del flujo de búsqueda de usuarios
 */
export interface SearchUsersFlowResult {
    success: boolean;
    users?: User[];
    error?: string;
}

/**
 * Resultado del flujo de toggle de estado de usuario
 */
export interface ToggleUserStatusFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

/**
 * UserManagementFlow - Flujo de gestión administrativa de usuarios
 *
 * Maneja todas las operaciones de administración de usuarios:
 * - CRUD completo de usuarios
 * - Búsqueda y filtrado
 * - Gestión de estados de usuario
 *
 * Todas las operaciones incluyen validación del frontend y manejo robusto de errores.
 */
export const userManagementFlow = {
    /**
     * Obtener todos los usuarios (Admin)
     *
     * @returns GetUsersFlowResult con la lista de usuarios
     */
    async getAllUsers(): Promise<GetUsersFlowResult> {
        try {
            const users = await userManagementService.getAllUsers();

            return {
                success: true,
                users,
                total: users.length,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.getAllUsers:', error);

            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (axiosError.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para ver la lista de usuarios.',
                };
            }

            return {
                success: false,
                error: axiosError.response?.data?.message || 'Error al obtener usuarios.',
            };
        }
    },

    /**
     * Obtener usuario por ID (Admin)
     *
     * @param id ID del usuario
     * @returns GetUserFlowResult con el usuario encontrado
     */
    async getUserById(id: number): Promise<GetUserFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido.',
                };
            }

            const user = await userManagementService.getUserById(id);

            return {
                success: true,
                user,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.getUserById:', error);

            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado.',
                };
            }

            if (axiosError.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (axiosError.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para ver este usuario.',
                };
            }

            return {
                success: false,
                error: axiosError.response?.data?.message || 'Error al obtener usuario.',
            };
        }
    },

    /**
     * Crear nuevo usuario (Admin)
     *
     * @param data Datos del nuevo usuario
     * @returns CreateUserFlowResult con el usuario creado
     */
    async createUser(data: CreateUserData): Promise<CreateUserFlowResult> {
        try {
            // Validaciones del frontend
            const validationError = validateCreateUserData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            const user = await userManagementService.createUser(data);

            return {
                success: true,
                user,
                message: 'Usuario creado exitosamente.',
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.createUser:', error);
            const axiosError = error as AxiosError<any>;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
            return {
                success: false,
                error: getUserManagementErrorMessage(axiosError),
            };
        }
    },

    /**
     * Actualizar usuario (Admin)
     *
     * @param id ID del usuario a actualizar
     * @param data Datos a actualizar
     * @returns UpdateUserFlowResult con el usuario actualizado
     */
    async updateUser(id: number, data: UpdateUserData): Promise<UpdateUserFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido.',
                };
            }

            // Validaciones del frontend
            const validationError = validateUpdateUserData(data);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            const user = await userManagementService.updateUser(id, data);

            return {
                success: true,
                user,
                message: 'Usuario actualizado exitosamente.',
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.updateUser:', error);
            return {
                success: false,
                error: getUserManagementErrorMessage(error),
            };
        }
    },

    /**
     * Eliminar usuario (Admin)
     *
     * @param id ID del usuario a eliminar
     * @returns DeleteUserFlowResult con el resultado
     */
    async deleteUser(id: number): Promise<DeleteUserFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido.',
                };
            }

            await userManagementService.deleteUser(id);

            return {
                success: true,
                message: 'Usuario eliminado exitosamente.',
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.deleteUser:', error);

            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (axiosError.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para eliminar usuarios.',
                };
            }

            if (axiosError.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado.',
                };
            }

            return {
                success: false,
                error: axiosError.response?.data?.message || 'Error al eliminar usuario.',
            };
        }
    },

    /**
     * Buscar usuarios
     *
     * @param searchTerm Término de búsqueda
     * @returns SearchUsersFlowResult con los usuarios encontrados
     */
    async searchUsers(searchTerm: string): Promise<SearchUsersFlowResult> {
        try {
            if (!searchTerm?.trim()) {
                return {
                    success: false,
                    error: 'Debe proporcionar un término de búsqueda.',
                };
            }

            const users = await userManagementService.searchUsers(searchTerm.trim());

            return {
                success: true,
                users,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.searchUsers:', error);
            return {
                success: false,
                error: getUserManagementErrorMessage(error),
            };
        }
    },

    /**
     * Obtener usuarios por rol
     *
     * @param roleId ID del rol
     * @returns GetUsersFlowResult con los usuarios del rol
     */
    async getUsersByRole(roleId: number): Promise<GetUsersFlowResult> {
        try {
            if (!roleId || roleId <= 0) {
                return {
                    success: false,
                    error: 'ID de rol inválido.',
                };
            }

            const users = await userManagementService.getUsersByRole(roleId);

            return {
                success: true,
                users,
                total: users.length,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.getUsersByRole:', error);

            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (axiosError.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para ver usuarios por rol.',
                };
            }

            return {
                success: false,
                error: axiosError.response?.data?.message || 'Error al obtener usuarios por rol.',
            };
        }
    },

    /**
     * Toggle estado de usuario (Admin)
     *
     * @param id ID del usuario
     * @returns ToggleUserStatusFlowResult con el usuario actualizado
     */
    async toggleUserStatus(id: number): Promise<ToggleUserStatusFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido.',
                };
            }

            const user = await userManagementService.toggleUserStatus(id);
            const isActive = user.uIsActive;
            const action = isActive ? 'activado' : 'desactivado';

            return {
                success: true,
                user,
                message: `Usuario ${action} exitosamente.`,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.toggleUserStatus:', error);

            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.status === 401) {
                return {
                    success: false,
                    error: 'No estás autenticado. Por favor inicia sesión.',
                };
            }

            if (axiosError.response?.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para cambiar el estado de usuarios.',
                };
            }

            if (axiosError.response?.status === 404) {
                return {
                    success: false,
                    error: 'Usuario no encontrado.',
                };
            }

            return {
                success: false,
                error: axiosError.response?.data?.message || 'Error al cambiar estado del usuario.',
            };
        }
    },

    /**
     * Búsqueda avanzada de usuarios con filtros
     *
     * @param params Parámetros de búsqueda
     * @returns GetUsersFlowResult con los usuarios filtrados
     */
    async searchUsersAdvanced(params: UserSearchParams): Promise<GetUsersFlowResult> {
        try {
            // Validar parámetros
            const validationError = validateUserSearchParams(params);
            if (validationError) {
                return {
                    success: false,
                    error: validationError,
                };
            }

            // Verificar que al menos un parámetro de búsqueda esté presente
            if (!params.term?.trim() && !params.roleId) {
                return {
                    success: false,
                    error: 'Debe proporcionar un término de búsqueda o seleccionar un rol.',
                };
            }

            let users: User[];

            if (params.term?.trim()) {
                // Búsqueda por término
                users = await userManagementService.searchUsers(params.term.trim());
            } else {
                // Búsqueda por rol
                users = await userManagementService.getUsersByRole(params.roleId!);
            }

            return {
                success: true,
                users,
                total: users.length,
            };
        } catch (error: unknown) {
            console.error('Error en userManagementFlow.searchUsersAdvanced:', error);
            return {
                success: false,
                error: getUserManagementErrorMessage(error),
            };
        }
    },
};