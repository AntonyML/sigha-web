import { permissionService } from '../../../services/permissionService';
import type {
  PermissionCheckResult,
  PermissionModuleType,
  PermissionActionType,
  RolePermissions
} from '../../../types/permissions';

/**
 * Resultado de verificación de permisos
 */
export interface PermissionCheckFlowResult extends PermissionCheckResult {
  success: boolean;
  error?: string;
}

/**
 * Resultado de obtención de permisos de rol
 */
export interface GetRolePermissionsFlowResult {
  success: boolean;
  rolePermissions?: RolePermissions;
  error?: string;
}

/**
 * Resultado de obtención de todos los roles
 */
export interface GetAllRolesFlowResult {
  success: boolean;
  roles?: RolePermissions[];
  error?: string;
}

/**
 * PermissionFlow - Flujo de gestión de permisos
 *
 * Encapsula toda la lógica de permisos, incluyendo verificación,
 * obtención de permisos por rol y validaciones.
 */
export const permissionFlow = {
  /**
   * Inicializa el sistema de permisos
   * Debe llamarse al inicio de la aplicación
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      await permissionService.initialize();
      return { success: true };
    } catch (error) {
      console.error('Error initializing permission system:', error);
      return {
        success: false,
        error: 'Error al inicializar el sistema de permisos'
      };
    }
  },

  /**
   * Verifica si un usuario tiene un permiso específico
   *
   * @param userRoleId - ID del rol del usuario
   * @param module - Módulo del sistema
   * @param action - Acción a verificar
   * @returns Resultado de la verificación
   */
  checkPermission(
    userRoleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): PermissionCheckFlowResult {
    try {
      const result = permissionService.checkPermission(userRoleId, module, action);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        success: false,
        hasPermission: false,
        error: 'Error al verificar permisos'
      };
    }
  },

  /**
   * Verifica si un usuario puede acceder a un módulo
   * (al menos tiene permiso de vista)
   *
   * @param userRoleId - ID del rol del usuario
   * @param module - Módulo del sistema
   * @returns true si puede acceder al módulo
   */
  canAccessModule(userRoleId: number, module: PermissionModuleType): boolean {
    try {
      return permissionService.canAccessModule(userRoleId, module);
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  },

  /**
   * Verifica si un usuario puede realizar una acción específica
   *
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
    try {
      return permissionService.canPerformAction(userRoleId, module, action);
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  },

  /**
   * Obtiene todos los permisos de un rol específico
   *
   * @param roleId - ID del rol
   * @returns Resultado con los permisos del rol
   */
  getRolePermissions(roleId: number): GetRolePermissionsFlowResult {
    try {
      const roleInfo = permissionService.getRoleInfo(roleId);

      if (!roleInfo) {
        return {
          success: false,
          error: `Rol con ID ${roleId} no encontrado`
        };
      }

      return {
        success: true,
        rolePermissions: roleInfo
      };
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return {
        success: false,
        error: 'Error al obtener permisos del rol'
      };
    }
  },

  /**
   * Obtiene información de todos los roles disponibles
   *
   * @returns Resultado con todos los roles
   */
  getAllRoles(): GetAllRolesFlowResult {
    try {
      const roles = permissionService.getAllRoles();
      return {
        success: true,
        roles
      };
    } catch (error) {
      console.error('Error getting all roles:', error);
      return {
        success: false,
        error: 'Error al obtener roles'
      };
    }
  },

  /**
   * Verifica múltiples permisos a la vez
   *
   * @param userRoleId - ID del rol del usuario
   * @param permissions - Lista de permisos a verificar
   * @returns Objeto con resultados de cada verificación
   */
  checkMultiplePermissions(
    userRoleId: number,
    permissions: Array<{ module: PermissionModuleType; action: PermissionActionType }>
  ): Record<string, boolean> {
    try {
      return permissionService.checkMultiplePermissions(userRoleId, permissions);
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      // Retorna false para todos los permisos en caso de error
      const result: Record<string, boolean> = {};
      permissions.forEach(({ module, action }) => {
        result[`${module}:${action}`] = false;
      });
      return result;
    }
  },

  /**
   * Verifica si un módulo es público (accesible sin autenticación)
   *
   * @param module - Módulo del sistema
   * @returns true si es público
   */
  isPublicModule(module: PermissionModuleType): boolean {
    try {
      return permissionService.isPublicModule(module);
    } catch (error) {
      console.error('Error checking public module:', error);
      return false;
    }
  },

  // ==================== Helpers ====================

  /**
   * Obtiene los módulos disponibles en el sistema
   */
  getAvailableModules(): PermissionModuleType[] {
    try {
      return permissionService.getAvailableModules();
    } catch (error) {
      console.error('Error getting available modules:', error);
      return [];
    }
  },

  /**
   * Obtiene las acciones disponibles en el sistema
   */
  getAvailableActions(): PermissionActionType[] {
    try {
      return permissionService.getAvailableActions();
    } catch (error) {
      console.error('Error getting available actions:', error);
      return [];
    }
  },

  /**
   * Valida que un módulo y acción sean válidos
   */
  isValidPermission(module: string, action: string): boolean {
    const availableModules = this.getAvailableModules();
    const availableActions = this.getAvailableActions();

    return availableModules.includes(module as PermissionModuleType) &&
           availableActions.includes(action as PermissionActionType);
  }
};