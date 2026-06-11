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

    // Primero intentar cargar desde localStorage
    if (this.loadFromLocalStorage()) {
      this.loaded = true;
      return;
    }

    try {
      // En un entorno real, esto vendría de una API
      // Por ahora, importamos el JSON directamente
      const response = await fetch('/permissions.json');
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
   * Obtiene los permisos de un rol específico por nombre
   */
  public getRolePermissionsByName(roleName: string): RolePermissions | null {
    if (!this.permissionsConfig) return null;
    return this.permissionsConfig.roles.find(role =>
      role.roleName.toLowerCase() === roleName.toLowerCase()
    ) || null;
  }

  /**
   * Obtiene todos los permisos de un rol por nombre
   */
  public getAllPermissionsForRoleByName(roleName: string): Permission[] {
    const rolePermissions = this.getRolePermissionsByName(roleName);
    return rolePermissions ? rolePermissions.permissions : [];
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
   * Actualiza los permisos de un rol
   */
  public async updateRolePermissions(roleId: number, permissions: Permission[]): Promise<void> {
    if (!this.permissionsConfig) {
      throw new Error('Configuración de permisos no cargada');
    }

    const roleIndex = this.permissionsConfig.roles.findIndex(role => role.roleId === roleId);
    if (roleIndex === -1) {
      throw new Error(`Rol con ID ${roleId} no encontrado`);
    }

    this.permissionsConfig.roles[roleIndex].permissions = permissions;

    // En un entorno real, aquí se guardaría en el backend
    // Por ahora, simulamos guardando en localStorage para persistencia temporal
    try {
      localStorage.setItem('permissionsConfig', JSON.stringify(this.permissionsConfig));
    } catch (error) {
      console.warn('No se pudo guardar en localStorage:', error);
    }
  }

  /**
   * Carga permisos desde localStorage si existen
   */
  private loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem('permissionsConfig');
      if (saved) {
        this.permissionsConfig = JSON.parse(saved);
        return true;
      }
    } catch (error) {
      console.warn('Error cargando permisos desde localStorage:', error);
    }
    return false;
  }
}

// Exportar la instancia única
export const permissionStorage = PermissionStorage.getInstance();