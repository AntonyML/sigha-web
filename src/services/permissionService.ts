import type {
  PermissionCheckResult,
  PermissionModuleType,
  PermissionActionType,
  RolePermissions,
  Permission
} from '../types/permissions';
import { PermissionModule } from '../types/permissions';
import { permissionStorage } from '../infrastructure/storage/permissionStorage';

/**
 * PermissionService - Servicio para gestión de permisos
 *
 * Proporciona métodos para verificar permisos de usuarios y gestionar
 * la configuración de permisos del sistema.
 */
export const permissionService = {
  /**
   * Inicializa el servicio cargando la configuración de permisos
   */
  async initialize(): Promise<void> {
    await permissionStorage.loadPermissions();
  },

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param userRoleId - ID del rol del usuario
   * @param module - Módulo del sistema
   * @param action - Acción a verificar
   * @returns Resultado de la verificación de permisos
   */
  checkPermission(
    userRoleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): PermissionCheckResult {
    const hasPermission = permissionStorage.hasPermission(userRoleId, module, action);
    const userPermissions = permissionStorage.getAllPermissionsForRole(userRoleId);

    return {
      hasPermission,
      userPermissions,
    };
  },

  /**
   * Verifica si un usuario puede acceder a un módulo completo
   * (al menos tiene permiso de vista)
   * @param userRoleId - ID del rol del usuario
   * @param module - Módulo del sistema
   * @returns true si puede ver el módulo
   */
  canAccessModule(userRoleId: number, module: PermissionModuleType): boolean {
    return permissionStorage.hasPermission(userRoleId, module, 'view' as PermissionActionType);
  },

  /**
   * Verifica si un usuario puede realizar una acción específica
   * @param userRoleId - ID del rol del usuario
   * @param module - Módulo del sistema
   * @param action - Acción a verificar
   * @returns true si puede realizar la acción
   */
  canPerformAction(
    userRoleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): boolean {
    return permissionStorage.hasPermission(userRoleId, module, action);
  },

  /**
   * Obtiene todos los permisos de un rol por nombre
   * @param roleName - Nombre del rol
   * @returns Lista de permisos del rol
   */
  getRolePermissionsByName(roleName: string): Permission[] {
    return permissionStorage.getAllPermissionsForRoleByName(roleName);
  },

  /**
   * Obtiene información completa de un rol por nombre
   * @param roleName - Nombre del rol
   * @returns Información del rol con permisos
   */
  getRoleInfoByName(roleName: string): RolePermissions | null {
    return permissionStorage.getRolePermissionsByName(roleName);
  },

  /**
   * Obtiene todos los roles disponibles
   * @returns Lista de todos los roles
   */
  getAllRoles(): RolePermissions[] {
    return permissionStorage.getAllRoles();
  },

  /**
   * Verifica si un módulo es público
   * @param module - Módulo del sistema
   * @returns true si es accesible sin autenticación
   */
  isPublicModule(module: PermissionModuleType): boolean {
    return permissionStorage.isPublicModule(module);
  },

  /**
   * Obtiene los permisos por defecto para nuevos roles
   * @returns Lista de permisos por defecto
   */
  getDefaultPermissions(): Permission[] {
    return permissionStorage.getDefaultPermissions();
  },

  /**
   * Verifica múltiples permisos a la vez
   * @param userRoleId - ID del rol del usuario
   * @param permissions - Lista de permisos a verificar
   * @returns Objeto con resultados de cada verificación
   */
  checkMultiplePermissions(
    userRoleId: number,
    permissions: Array<{ module: PermissionModuleType; action: PermissionActionType }>
  ): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    permissions.forEach(({ module, action }) => {
      const key = `${module}:${action}`;
      results[key] = permissionStorage.hasPermission(userRoleId, module, action);
    });

    return results;
  },

  /**
   * Obtiene todos los módulos disponibles
   * @returns Lista de módulos del sistema
   */
  getAvailableModules(): PermissionModuleType[] {
    return Object.values(PermissionModule) as PermissionModuleType[];
  },

  /**
   * Actualiza los permisos de un rol
   * @param roleId - ID del rol
   * @param permissions - Lista de permisos actualizados
   */
  updateRolePermissions(roleId: number, permissions: Permission[]): Promise<void> {
    return permissionStorage.updateRolePermissions(roleId, permissions);
  },
};