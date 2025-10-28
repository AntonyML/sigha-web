import { roleService } from '../../../services/roleService';
import type { UserRole, CreateRoleData, UpdateRoleData } from '../../../types/user';
import { getRoleErrorMessage } from './validation/roleValidations';

/**
 * Resultado del flujo de obtención de roles
 */
export interface GetRolesFlowResult {
    success: boolean;
    roles?: UserRole[];
    error?: string;
}

/**
 * Resultado del flujo de obtención de un rol
 */
export interface GetRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

/**
 * Resultado del flujo de creación de rol
 */
export interface CreateRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

/**
 * Resultado del flujo de actualización de rol
 */
export interface UpdateRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

/**
 * Resultado del flujo de eliminación de rol
 */
export interface DeleteRoleFlowResult {
    success: boolean;
    error?: string;
}

/**
 * Resultado del flujo de verificación de rol admin
 */
export interface CheckAdminRoleFlowResult {
    success: boolean;
    isAdmin?: boolean;
    error?: string;
}

/**
 * Resultado del flujo de verificación de 2FA
 */
export interface CheckTwoFactorFlowResult {
    success: boolean;
    requires2FA?: boolean;
    error?: string;
}

/**
 * Resultado del flujo de inicialización de roles
 */
export interface InitializeRolesFlowResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * RoleFlow - Flujo de gestión de roles
 *
 * Maneja todas las operaciones relacionadas con roles y permisos
 */
export const roleFlow = {
    /**
     * Obtener todos los roles
     *
     * @returns GetRolesFlowResult con la lista de roles
     */
    async getAllRoles(): Promise<GetRolesFlowResult> {
        try {
            const roles = await roleService.getAllRoles();

            return {
                success: true,
                roles,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.getAllRoles:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Obtener roles administrativos
     *
     * @returns GetRolesFlowResult con la lista de roles administrativos
     */
    async getAdminRoles(): Promise<GetRolesFlowResult> {
        try {
            const roles = await roleService.getAdminRoles();

            return {
                success: true,
                roles,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.getAdminRoles:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Obtener un rol por ID
     *
     * @param id - ID del rol
     * @returns GetRoleFlowResult con el rol
     */
    async getRoleById(id: number): Promise<GetRoleFlowResult> {
        try {
            const role = await roleService.getRoleById(id);

            return {
                success: true,
                role,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.getRoleById:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Crear un nuevo rol
     *
     * @param roleData - Datos del rol a crear
     * @returns CreateRoleFlowResult con el rol creado
     */
    async createRole(roleData: CreateRoleData): Promise<CreateRoleFlowResult> {
        try {
            const role = await roleService.createRole(roleData);

            return {
                success: true,
                role,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.createRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Actualizar un rol existente
     *
     * @param id - ID del rol
     * @param roleData - Datos a actualizar
     * @returns UpdateRoleFlowResult con el rol actualizado
     */
    async updateRole(id: number, roleData: UpdateRoleData): Promise<UpdateRoleFlowResult> {
        try {
            const role = await roleService.updateRole(id, roleData);

            return {
                success: true,
                role,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.updateRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Eliminar un rol
     *
     * @param id - ID del rol a eliminar
     * @returns DeleteRoleFlowResult
     */
    async deleteRole(id: number): Promise<DeleteRoleFlowResult> {
        try {
            await roleService.deleteRole(id);

            return {
                success: true,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.deleteRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Verificar si un rol es administrativo
     *
     * @param id - ID del rol
     * @returns CheckAdminRoleFlowResult
     */
    async isAdminRole(id: number): Promise<CheckAdminRoleFlowResult> {
        try {
            const isAdmin = await roleService.isAdminRole(id);

            return {
                success: true,
                isAdmin,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.isAdminRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Verificar si un rol requiere 2FA
     *
     * @param id - ID del rol
     * @returns CheckTwoFactorFlowResult
     */
    async requiresTwoFactor(id: number): Promise<CheckTwoFactorFlowResult> {
        try {
            const requires2FA = await roleService.requiresTwoFactor(id);

            return {
                success: true,
                requires2FA,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.requiresTwoFactor:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    /**
     * Inicializar roles del sistema
     *
     * @returns InitializeRolesFlowResult
     */
    async initializeSystemRoles(): Promise<InitializeRolesFlowResult> {
        try {
            const result = await roleService.initializeSystemRoles();

            return {
                success: true,
                message: result.message,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleFlow.initializeSystemRoles:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },
};