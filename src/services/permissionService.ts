import {
  PermissionModule,
  PermissionAction,
  type PermissionModuleType,
  type PermissionActionType,
  type Permission,
  type RolePermissions,
  type PermissionCheckResult,
} from '../types/permissions';

/**
 * PermissionService - Resolvedor estático de permisos por rol.
 *
 * Mantiene una configuración interna de permisos por nombre de rol
 * (espejo de las reglas de `permissionUtils.canAccessModule`).
 * Los roles se identifican por nombre porque es lo que llega desde
 * el backend y lo que ya consumen las pages existentes.
 */

type RolePolicy = Record<string, Partial<Record<PermissionModuleType, PermissionActionType[]>>>;

const ALL_ACTIONS: PermissionActionType[] = [
  PermissionAction.VIEW,
  PermissionAction.CREATE,
  PermissionAction.EDIT,
  PermissionAction.DELETE,
];

const PUBLIC_MODULES: PermissionModuleType[] = [
  PermissionModule.DASHBOARD,
  PermissionModule.TWO_FACTOR,
];

const ROLE_POLICY: Record<string, RolePolicy> = {
  'super admin': {
    [PermissionModule.USERS]: ALL_ACTIONS,
    [PermissionModule.ROLES]: ALL_ACTIONS,
    [PermissionModule.AUDITS]: ALL_ACTIONS,
    [PermissionModule.VIRTUAL_FILES]: ALL_ACTIONS,
    [PermissionModule.PROGRAMS]: ALL_ACTIONS,
    [PermissionModule.SUB_PROGRAMS]: ALL_ACTIONS,
    [PermissionModule.VACCINES]: ALL_ACTIONS,
    [PermissionModule.ENTRANCE_EXIT]: ALL_ACTIONS,
    [PermissionModule.TWO_FACTOR]: ALL_ACTIONS,
    [PermissionModule.DASHBOARD]: ALL_ACTIONS,
  },
  admin: {
    [PermissionModule.USERS]: ALL_ACTIONS,
    [PermissionModule.ROLES]: ALL_ACTIONS,
    [PermissionModule.AUDITS]: ALL_ACTIONS,
    [PermissionModule.VIRTUAL_FILES]: ALL_ACTIONS,
    [PermissionModule.PROGRAMS]: ALL_ACTIONS,
    [PermissionModule.SUB_PROGRAMS]: ALL_ACTIONS,
    [PermissionModule.VACCINES]: ALL_ACTIONS,
    [PermissionModule.ENTRANCE_EXIT]: ALL_ACTIONS,
    [PermissionModule.TWO_FACTOR]: ALL_ACTIONS,
    [PermissionModule.DASHBOARD]: ALL_ACTIONS,
  },
  director: {
    [PermissionModule.VIRTUAL_FILES]: [PermissionAction.VIEW],
    [PermissionModule.PROGRAMS]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.SUB_PROGRAMS]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.ENTRANCE_EXIT]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.DASHBOARD]: [PermissionAction.VIEW],
    [PermissionModule.AUDITS]: [PermissionAction.VIEW],
  },
  nurse: {
    [PermissionModule.NURSING]: ALL_ACTIONS,
    [PermissionModule.VACCINES]: ALL_ACTIONS,
    [PermissionModule.VIRTUAL_FILES]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.ENTRANCE_EXIT]: [PermissionAction.VIEW, PermissionAction.CREATE],
    [PermissionModule.DASHBOARD]: [PermissionAction.VIEW],
    [PermissionModule.PROGRAMS]: [PermissionAction.VIEW],
    [PermissionModule.SUB_PROGRAMS]: [PermissionAction.VIEW],
  },
  physiotherapist: {
    [PermissionModule.VIRTUAL_FILES]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.ENTRANCE_EXIT]: [PermissionAction.VIEW, PermissionAction.CREATE],
    [PermissionModule.DASHBOARD]: [PermissionAction.VIEW],
    [PermissionModule.PROGRAMS]: [PermissionAction.VIEW],
    [PermissionModule.SUB_PROGRAMS]: [PermissionAction.VIEW],
  },
  psychologist: {
    [PermissionModule.VIRTUAL_FILES]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.ENTRANCE_EXIT]: [PermissionAction.VIEW, PermissionAction.CREATE],
    [PermissionModule.DASHBOARD]: [PermissionAction.VIEW],
    [PermissionModule.PROGRAMS]: [PermissionAction.VIEW],
    [PermissionModule.SUB_PROGRAMS]: [PermissionAction.VIEW],
  },
  'social worker': {
    [PermissionModule.VIRTUAL_FILES]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EDIT],
    [PermissionModule.ENTRANCE_EXIT]: [PermissionAction.VIEW, PermissionAction.CREATE],
    [PermissionModule.DASHBOARD]: [PermissionAction.VIEW],
    [PermissionModule.PROGRAMS]: [PermissionAction.VIEW],
    [PermissionModule.SUB_PROGRAMS]: [PermissionAction.VIEW],
  },
  'not specified': {},
};

const DEFAULT_ROLE_ID = 0;

class PermissionService {
  private initialized = false;
  private rolesByName: Map<string, RolePermissions> = new Map();
  private roleIdByName: Map<string, number> = new Map();
  private roleNameById: Map<number, string> = new Map();
  private rolePermissionsByName: Map<string, Permission[]> = new Map();

  async initialize(): Promise<void> {
    this.rebuild();
    this.initialized = true;
  }

  private ensureReady(): void {
    if (!this.initialized) this.rebuild();
  }

  private rebuild(): void {
    this.rolesByName.clear();
    this.roleIdByName.clear();
    this.roleNameById.clear();
    this.rolePermissionsByName.clear();

    Object.entries(ROLE_POLICY).forEach(([roleName], idx) => {
      const roleId = idx + 1;
      this.roleIdByName.set(roleName, roleId);
      this.roleNameById.set(roleId, roleName);

      const policy = ROLE_POLICY[roleName] ?? {};
      const permissions: Permission[] = [];
      Object.entries(policy).forEach(([module, actions]) => {
        (actions as PermissionActionType[]).forEach(action => {
          permissions.push({
            module: module as PermissionModuleType,
            action,
            enabled: true,
          });
        });
      });

      const rolePermissions: RolePermissions = {
        roleId,
        roleName,
        permissions,
      };
      this.rolesByName.set(roleName, rolePermissions);
      this.rolePermissionsByName.set(roleName, permissions);
    });
  }

  // ==================== Helpers internos ====================

  private permissionsForRoleName(roleName: string | null | undefined): Permission[] {
    this.ensureReady();
    if (!roleName) return [];
    const key = roleName.toLowerCase();
    const direct = this.rolePermissionsByName.get(roleName) ?? this.rolePermissionsByName.get(key);
    if (direct) return direct.map(p => ({ ...p }));
    return [];
  }

  private isPublic(module: PermissionModuleType): boolean {
    return PUBLIC_MODULES.includes(module);
  }

  // ==================== API pública ====================

  getRoleInfo(roleId: number): RolePermissions | null {
    this.ensureReady();
    const name = this.roleNameById.get(roleId);
    if (!name) return null;
    return this.rolesByName.get(name) ?? null;
  }

  getAllRoles(): RolePermissions[] {
    this.ensureReady();
    return Array.from(this.rolesByName.values()).map(r => ({
      ...r,
      permissions: r.permissions.map(p => ({ ...p })),
    }));
  }

  getRolePermissionsByName(roleName: string): Permission[] {
    return this.permissionsForRoleName(roleName);
  }

  getAvailableModules(): PermissionModuleType[] {
    this.ensureReady();
    return Object.values(PermissionModule) as PermissionModuleType[];
  }

  getAvailableActions(): PermissionActionType[] {
    return Object.values(PermissionAction) as PermissionActionType[];
  }

  isPublicModule(module: PermissionModuleType): boolean {
    return this.isPublic(module);
  }

  canAccessModule(userRoleId: number, module: PermissionModuleType): boolean {
    if (this.isPublic(module)) return true;
    const role = this.getRoleInfo(userRoleId);
    if (!role) return false;
    return role.permissions.some(p => p.module === module && p.enabled);
  }

  canPerformAction(
    userRoleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): boolean {
    if (this.isPublic(module) && action === PermissionAction.VIEW) return true;
    const role = this.getRoleInfo(userRoleId);
    if (!role) return false;
    return role.permissions.some(p => p.module === module && p.action === action && p.enabled);
  }

  checkPermission(
    userRoleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): PermissionCheckResult {
    const role = this.getRoleInfo(userRoleId);
    const hasPermission = this.canPerformAction(userRoleId, module, action);
    return {
      hasPermission,
      requiredPermission: { module, action, enabled: true },
      userPermissions: role ? role.permissions.map(p => ({ ...p })) : [],
    };
  }

  checkMultiplePermissions(
    userRoleId: number,
    permissions: Array<{ module: PermissionModuleType; action: PermissionActionType }>
  ): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    permissions.forEach(({ module, action }) => {
      result[`${module}:${action}`] = this.canPerformAction(userRoleId, module, action);
    });
    return result;
  }

  /**
   * Persiste los permisos de un rol (en memoria).
   * Devuelve la lista actualizada para mantener la API previa.
   */
  async updateRolePermissions(roleId: number, permissions: Permission[]): Promise<Permission[]> {
    this.ensureReady();
    const name = this.roleNameById.get(roleId);
    if (!name) return permissions;
    this.rolePermissionsByName.set(name, permissions.map(p => ({ ...p })));
    const existing = this.rolesByName.get(name);
    if (existing) {
      this.rolesByName.set(name, { ...existing, permissions: permissions.map(p => ({ ...p })) });
    }
    return permissions.map(p => ({ ...p }));
  }
}

export const permissionService = new PermissionService();
export { DEFAULT_ROLE_ID };
