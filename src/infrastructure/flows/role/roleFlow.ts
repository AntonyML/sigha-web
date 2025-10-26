import { roleService } from '../../../services/roleService';
import type { UserRole } from '../../../types/user';
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
        } catch (error: any) {
            console.error('Error en roleFlow.getAllRoles:', error);
            return {
                success: false,
                error: getRoleErrorMessage(error),
            };
        }
    },
};