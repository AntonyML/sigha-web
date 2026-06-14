import { roleService } from '../../../services/roleService';
import type { UserRole, CreateRoleData, UpdateRoleData } from '../../../types/user';
import { getRoleErrorMessage } from './validation/roleValidations';

export interface GetRolesFlowResult {
    success: boolean;
    roles?: UserRole[];
    error?: string;
}

export interface GetRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

export interface CreateRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

export interface UpdateRoleFlowResult {
    success: boolean;
    role?: UserRole;
    error?: string;
}

export interface DeleteRoleFlowResult {
    success: boolean;
    error?: string;
}

export const roleFlow = {
    async getAllRoles(): Promise<GetRolesFlowResult> {
        try {
            const roles = await roleService.getAllRoles();
            return {
                success: true,
                roles,
            };
        } catch (error: unknown) {
            console.error('Error en roleFlow.getAllRoles:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    async getRoleById(id: number): Promise<GetRoleFlowResult> {
        try {
            const role = await roleService.getRoleById(id);
            return {
                success: true,
                role,
            };
        } catch (error: unknown) {
            console.error('Error en roleFlow.getRoleById:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    async createRole(roleData: CreateRoleData): Promise<CreateRoleFlowResult> {
        try {
            const role = await roleService.createRole(roleData);
            return {
                success: true,
                role,
            };
        } catch (error: unknown) {
            console.error('Error en roleFlow.createRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    async updateRole(id: number, roleData: UpdateRoleData): Promise<UpdateRoleFlowResult> {
        try {
            const role = await roleService.updateRole(id, roleData);
            return {
                success: true,
                role,
            };
        } catch (error: unknown) {
            console.error('Error en roleFlow.updateRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },

    async deleteRole(id: number): Promise<DeleteRoleFlowResult> {
        try {
            await roleService.deleteRole(id);
            return {
                success: true,
            };
        } catch (error: unknown) {
            console.error('Error en roleFlow.deleteRole:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },
};
