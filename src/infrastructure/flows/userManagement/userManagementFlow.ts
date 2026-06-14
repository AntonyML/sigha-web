import { userManagementService } from '../../../services/userManagementService';
import type {
    User,
    CreateUserData,
    UpdateUserData
} from '../../../types/user';
import {
    validateCreateUserData,
    validateUpdateUserData,
    getUserManagementErrorMessage
} from './validation/userValidations';
import type { AxiosError } from 'axios';

export interface GetUsersFlowResult {
    success: boolean;
    users?: User[];
    total?: number;
    error?: string;
}

export interface GetUserFlowResult {
    success: boolean;
    user?: User;
    error?: string;
}

export interface CreateUserFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

export interface UpdateUserFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

export interface DeleteUserFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface SearchUsersFlowResult {
    success: boolean;
    users?: User[];
    error?: string;
}

export interface ToggleUserStatusFlowResult {
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
}

export const userManagementFlow = {
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

            const axiosError = error as AxiosError;
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
                error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al obtener usuarios.',
            };
        }
    },

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

            const axiosError = error as AxiosError;
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
                error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al obtener usuario.',
            };
        }
    },

    async createUser(data: CreateUserData): Promise<CreateUserFlowResult> {
        try {
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
            const axiosError = error as AxiosError;
            console.error('Error response:', axiosError.response?.data);
            console.error('Error status:', axiosError.response?.status);
            return {
                success: false,
                error: getUserManagementErrorMessage(axiosError),
            };
        }
    },

    async updateUser(id: number, data: UpdateUserData): Promise<UpdateUserFlowResult> {
        try {
            if (!id || id <= 0) {
                return {
                    success: false,
                    error: 'ID de usuario inválido.',
                };
            }

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

            const axiosError = error as AxiosError;
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
                error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al eliminar usuario.',
            };
        }
    },

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

            const axiosError = error as AxiosError;
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
                error: (axiosError.response?.data as { message?: string } | undefined)?.message || 'Error al cambiar estado del usuario.',
            };
        }
    },
};
