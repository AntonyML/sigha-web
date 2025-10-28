import type {
  PermissionsConfig,
  RolePermissions,
  Permission,
  PermissionModuleType,
  PermissionActionType
} from '../../types/permissions';

/**
 * PermissionStorage - Singleton para gestionar permisos del sistema
 *
 * Maneja la carga y verificación de permisos desde configuración JSON
 */
class PermissionStorage {
  private static instance: PermissionStorage;
  private permissionsConfig: PermissionsConfig | null = null;
  private loaded = false;

  private constructor() {
    // Singleton: constructor privado
  }

  /**
   * Obtiene la instancia única del PermissionStorage
   */
  public static getInstance(): PermissionStorage {
    if (!PermissionStorage.instance) {
      PermissionStorage.instance = new PermissionStorage();
    }
    return PermissionStorage.instance;
  }

  /**
   * Carga la configuración de permisos desde el archivo JSON
   */
  public async loadPermissions(): Promise<void> {
    if (this.loaded) return;

    try {
      // En un entorno real, esto vendría de una API
      // Por ahora, importamos el JSON directamente
      const response = await fetch('/src/infrastructure/storage/permissions.json');
      if (!response.ok) {
        throw new Error(`Failed to load permissions: ${response.status}`);
      }
      this.permissionsConfig = await response.json();
      this.loaded = true;
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Fallback: configuración básica
      this.permissionsConfig = {
        roles: [],
        defaultPermissions: [],
        publicModules: []
      };
      this.loaded = true;
    }
  }

  /**
   * Obtiene la configuración completa de permisos
   */
  public getPermissionsConfig(): PermissionsConfig | null {
    return this.permissionsConfig;
  }

  /**
   * Obtiene los permisos de un rol específico
   */
  public getRolePermissions(roleId: number): RolePermissions | null {
    if (!this.permissionsConfig) return null;
    return this.permissionsConfig.roles.find(role => role.roleId === roleId) || null;
  }

  /**
   * Verifica si un rol tiene un permiso específico
   */
  public hasPermission(
    roleId: number,
    module: PermissionModuleType,
    action: PermissionActionType
  ): boolean {
    const rolePermissions = this.getRolePermissions(roleId);
    if (!rolePermissions) return false;

    const permission = rolePermissions.permissions.find(
      p => p.module === module && p.action === action
    );

    return permission ? permission.enabled : false;
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  public getAllPermissionsForRole(roleId: number): Permission[] {
    const rolePermissions = this.getRolePermissions(roleId);
    return rolePermissions ? rolePermissions.permissions : [];
  }

  /**
   * Verifica si un módulo es público (accesible sin autenticación)
   */
  public isPublicModule(module: PermissionModuleType): boolean {
    if (!this.permissionsConfig) return false;
    return this.permissionsConfig.publicModules.includes(module);
  }

  /**
   * Obtiene los permisos por defecto para nuevos roles
   */
  public getDefaultPermissions(): Permission[] {
    return this.permissionsConfig?.defaultPermissions || [];
  }

  /**
   * Obtiene todos los roles disponibles
   */
  public getAllRoles(): RolePermissions[] {
    return this.permissionsConfig?.roles || [];
  }

  /**
   * Verifica si la configuración está cargada
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Fuerza la recarga de permisos
   */
  public async reloadPermissions(): Promise<void> {
    this.loaded = false;
    await this.loadPermissions();
  }
}

// Exportar la instancia única
export const permissionStorage = PermissionStorage.getInstance();