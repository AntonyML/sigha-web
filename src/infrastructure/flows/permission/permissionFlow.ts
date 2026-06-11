import { permissionApiService } from '../../../services/permissionApiService';
import type { PermissionApi, RolePermissionApi } from '../../../services/permissionApiService';
import { authStorage } from '../../../infrastructure/storage/authStorage';
import { roleFlow } from '../../../infrastructure/flows/role';
import type { UserRole } from '../../../types/user';
import { getPermissionErrorMessage } from './validation/permissionValidations';

export interface GetPermissionsFlowResult {
  success: boolean;
  permissions?: PermissionApi[];
  error?: string;
}

export interface GetPermissionFlowResult {
  success: boolean;
  permission?: PermissionApi;
  error?: string;
}

export interface CreatePermissionFlowResult {
  success: boolean;
  permission?: PermissionApi;
  error?: string;
}

export interface UpdatePermissionFlowResult {
  success: boolean;
  permission?: PermissionApi;
  error?: string;
}

export interface DeletePermissionFlowResult {
  success: boolean;
  error?: string;
}

export interface GetRolePermissionsFlowResult {
  success: boolean;
  permissions?: RolePermissionApi[];
  error?: string;
}

export interface SetRolePermissionsFlowResult {
  success: boolean;
  permissions?: RolePermissionApi[];
  error?: string;
}

export interface LoadCurrentUserResult {
  success: boolean;
  roleId?: number;
  error?: string;
}

export const permissionFlow = {
  // ──────────────── Catálogo ────────────────

  async getAllPermissions(): Promise<GetPermissionsFlowResult> {
    try {
      const permissions = await permissionApiService.getAll();
      return { success: true, permissions };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  async getPermissionById(id: number): Promise<GetPermissionFlowResult> {
    try {
      const permission = await permissionApiService.getById(id);
      return { success: true, permission };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  async createPermission(
    payload: Parameters<typeof permissionApiService.create>[0]
  ): Promise<CreatePermissionFlowResult> {
    try {
      const permission = await permissionApiService.create(payload);
      return { success: true, permission };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  async updatePermission(
    id: number,
    payload: Parameters<typeof permissionApiService.update>[1]
  ): Promise<UpdatePermissionFlowResult> {
    try {
      const permission = await permissionApiService.update(id, payload);
      return { success: true, permission };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  async deletePermission(id: number): Promise<DeletePermissionFlowResult> {
    try {
      await permissionApiService.remove(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  // ──────────────── Por rol ────────────────

  async getRolePermissions(roleId: number): Promise<GetRolePermissionsFlowResult> {
    try {
      const permissions = await permissionApiService.getByRole(roleId);
      return { success: true, permissions };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  async setRolePermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<SetRolePermissionsFlowResult> {
    try {
      const permissions = await permissionApiService.setRolePermissions(roleId, permissionIds);
      return { success: true, permissions };
    } catch (error) {
      return { success: false, error: getPermissionErrorMessage(error) };
    }
  },

  // ──────────────── Sesión actual ────────────────

  /**
   * Resuelve el roleId del usuario autenticado a partir del rol (id o nombre)
   * almacenado en authStorage. Devuelve `null` si no hay usuario o no se puede
   * mapear a un ID.
   */
  async resolveCurrentRoleId(rolesCache?: UserRole[] | null): Promise<number | null> {
    const user = authStorage.getUser();
    if (!user || user.role === undefined || user.role === null) return null;

    if (typeof user.role === 'number') return user.role;

    const roleName = String(user.role).toLowerCase();
    const roles = rolesCache ?? (await roleFlow.getAllRoles()).roles ?? null;
    const found = roles?.find(r => r.rName.toLowerCase() === roleName);
    return found?.id ?? null;
  },
};
