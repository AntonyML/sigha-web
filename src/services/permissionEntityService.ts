import type { PermissionEntity, CreatePermissionData, UpdatePermissionData } from '../types/permissionEntity';
import { permissionEntityStorage } from '../infrastructure/storage/permissionEntityStorage';

/**
 * PermissionEntityService - Servicio para gestión de entidades de permisos
 *
 * Utiliza almacenamiento local (JSON) en lugar de API REST
 */
export const permissionEntityService = {
  /**
   * Inicializa el servicio cargando los permisos
   */
  async initialize(): Promise<void> {
    await permissionEntityStorage.loadPermissions();
  },

  /**
   * Obtener todos los permisos
   */
  async getAllPermissions(): Promise<PermissionEntity[]> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }
    return permissionEntityStorage.getAllPermissions();
  },

  /**
   * Obtener un permiso por ID
   */
  async getPermissionById(id: number): Promise<PermissionEntity> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    const permission = permissionEntityStorage.getPermissionById(id);
    if (!permission) {
      throw new Error(`Permiso con ID ${id} no encontrado`);
    }
    return permission;
  },

  /**
   * Crear un nuevo permiso
   */
  async createPermission(data: CreatePermissionData): Promise<PermissionEntity> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    // Validar que no exista un permiso con el mismo nombre, módulo y acción
    if (permissionEntityStorage.existsPermission(data.name, data.module, data.action)) {
      throw new Error('Ya existe un permiso con el mismo nombre, módulo y acción');
    }

    return permissionEntityStorage.createPermission(data);
  },

  /**
   * Actualizar un permiso existente
   */
  async updatePermission(id: number, data: UpdatePermissionData): Promise<PermissionEntity> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    // Validar que no exista un permiso con el mismo nombre, módulo y acción (excluyendo el actual)
    if (data.name && data.module && data.action) {
      if (permissionEntityStorage.existsPermission(data.name, data.module, data.action, id)) {
        throw new Error('Ya existe otro permiso con el mismo nombre, módulo y acción');
      }
    }

    const updatedPermission = permissionEntityStorage.updatePermission(id, data);
    if (!updatedPermission) {
      throw new Error(`Permiso con ID ${id} no encontrado`);
    }
    return updatedPermission;
  },

  /**
   * Eliminar un permiso
   */
  async deletePermission(id: number): Promise<void> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    const deleted = permissionEntityStorage.deletePermission(id);
    if (!deleted) {
      throw new Error(`Permiso con ID ${id} no encontrado`);
    }
  },

  /**
   * Buscar permisos por criterios
   */
  async searchPermissions(criteria: {
    name?: string;
    module?: string;
    action?: string;
    enabled?: boolean;
  }): Promise<PermissionEntity[]> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    return permissionEntityStorage.searchPermissions(criteria);
  },

  /**
   * Obtener permisos por módulo
   */
  async getPermissionsByModule(module: string): Promise<PermissionEntity[]> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    return permissionEntityStorage.getPermissionsByModule(module);
  },

  /**
   * Obtener módulos disponibles
   */
  async getAvailableModules(): Promise<string[]> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    return permissionEntityStorage.getAvailableModules();
  },

  /**
   * Obtener acciones disponibles
   */
  async getAvailableActions(): Promise<string[]> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    return permissionEntityStorage.getAvailableActions();
  },

  /**
   * Exportar permisos como JSON string
   */
  async exportToJson(): Promise<string> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    return permissionEntityStorage.exportToJson();
  },

  /**
   * Descargar permisos como archivo JSON
   */
  async downloadAsJson(filename?: string): Promise<void> {
    // Asegurar que los permisos estén cargados
    if (!permissionEntityStorage.isLoaded()) {
      await permissionEntityStorage.loadPermissions();
    }

    permissionEntityStorage.downloadAsJson(filename);
  }
};