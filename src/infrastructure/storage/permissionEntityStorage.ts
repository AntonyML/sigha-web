import type { PermissionEntity, CreatePermissionData, UpdatePermissionData } from '../../types/permissionEntity';

/**
 * PermissionEntityStorage - Singleton para gestionar entidades de permisos
 *
 * Maneja la carga, creación, actualización y eliminación de permisos individuales
 */
class PermissionEntityStorage {
  private static instance: PermissionEntityStorage;
  private permissions: PermissionEntity[] = [];
  private loaded = false;
  private nextId = 1;

  private constructor() {
    // Singleton: constructor privado
    // La carga se hace en loadPermissions()
  }

  /**
   * Obtiene la instancia única del PermissionEntityStorage
   */
  public static getInstance(): PermissionEntityStorage {
    if (!PermissionEntityStorage.instance) {
      PermissionEntityStorage.instance = new PermissionEntityStorage();
    }
    return PermissionEntityStorage.instance;
  }

  /**
   * Carga los permisos desde localStorage o archivo JSON
   */
  public async loadPermissions(): Promise<void> {
    if (this.loaded) return;

    try {
      // Primero intentar cargar desde localStorage (datos actualizados)
      const stored = localStorage.getItem('permissionEntities');
      const storedNextId = localStorage.getItem('permissionEntities_nextId');

      if (stored) {
        // Si hay datos en localStorage, usarlos
        this.permissions = JSON.parse(stored);
        this.nextId = storedNextId ? parseInt(storedNextId, 10) : 1;
        console.log('Permisos cargados desde localStorage:', this.permissions.length, 'permisos');
      } else {
        // Si no hay datos en localStorage, cargar desde el archivo JSON inicial
        const response = await fetch('/permissionEntities.json');
        if (!response.ok) {
          throw new Error(`Failed to load permission entities: ${response.status}`);
        }
        this.permissions = await response.json();

        // Calcular el próximo ID disponible
        if (this.permissions.length > 0) {
          this.nextId = Math.max(...this.permissions.map(p => p.id)) + 1;
        }

        console.log('Permisos cargados desde archivo JSON:', this.permissions.length, 'permisos');
      }

      this.loaded = true;
    } catch (error) {
      console.error('Error loading permission entities:', error);
      // Fallback: array vacío
      this.permissions = [];
      this.nextId = 1;
      this.loaded = true;
    }
  }

  /**
   * Obtiene todos los permisos
   */
  public getAllPermissions(): PermissionEntity[] {
    return [...this.permissions];
  }

  /**
   * Obtiene un permiso por ID
   */
  public getPermissionById(id: number): PermissionEntity | null {
    return this.permissions.find(permission => permission.id === id) || null;
  }

  /**
   * Crea un nuevo permiso
   */
  public createPermission(data: CreatePermissionData): PermissionEntity {
    const now = new Date().toISOString();
    const newPermission: PermissionEntity = {
      id: this.nextId++,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    this.permissions.push(newPermission);
    this.saveToStorage();
    return newPermission;
  }

  /**
   * Actualiza un permiso existente
   */
  public updatePermission(id: number, data: UpdatePermissionData): PermissionEntity | null {
    const index = this.permissions.findIndex(permission => permission.id === id);
    if (index === -1) return null;

    const existingPermission = this.permissions[index];
    const updatedPermission: PermissionEntity = {
      ...existingPermission,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.permissions[index] = updatedPermission;
    this.saveToStorage();
    return updatedPermission;
  }

  /**
   * Elimina un permiso
   */
  public deletePermission(id: number): boolean {
    const index = this.permissions.findIndex(permission => permission.id === id);
    if (index === -1) return false;

    this.permissions.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Busca permisos por criterios
   */
  public searchPermissions(criteria: {
    name?: string;
    module?: string;
    action?: string;
    enabled?: boolean;
  }): PermissionEntity[] {
    return this.permissions.filter(permission => {
      if (criteria.name && !permission.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      if (criteria.module && permission.module !== criteria.module) {
        return false;
      }
      if (criteria.action && permission.action !== criteria.action) {
        return false;
      }
      if (criteria.enabled !== undefined && permission.enabled !== criteria.enabled) {
        return false;
      }
      return true;
    });
  }

  /**
   * Obtiene permisos por módulo
   */
  public getPermissionsByModule(module: string): PermissionEntity[] {
    return this.permissions.filter(permission => permission.module === module);
  }

  /**
   * Obtiene permisos por acción
   */
  public getPermissionsByAction(action: string): PermissionEntity[] {
    return this.permissions.filter(permission => permission.action === action);
  }

  /**
   * Verifica si existe un permiso con el mismo nombre, módulo y acción
   */
  public existsPermission(name: string, module: string, action: string, excludeId?: number): boolean {
    return this.permissions.some(permission =>
      permission.name.toLowerCase() === name.toLowerCase() &&
      permission.module === module &&
      permission.action === action &&
      (excludeId === undefined || permission.id !== excludeId)
    );
  }

  /**
   * Obtiene módulos únicos disponibles
   */
  public getAvailableModules(): string[] {
    const modules = [...new Set(this.permissions.map(p => p.module))];
    return modules.sort();
  }

  /**
   * Obtiene acciones únicas disponibles
   */
  public getAvailableActions(): string[] {
    const actions = [...new Set(this.permissions.map(p => p.action))];
    return actions.sort();
  }

  /**
   * Verifica si la configuración está cargada
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Guarda los cambios en localStorage para persistencia
   * Los permisos nuevos y modificados se mantienen entre sesiones
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('permissionEntities', JSON.stringify(this.permissions));
      localStorage.setItem('permissionEntities_nextId', this.nextId.toString());
      console.log('Permisos guardados en localStorage:', this.permissions.length, 'permisos');
    } catch (error) {
      console.warn('No se pudo guardar en localStorage:', error);
    }
  }

  /**
   * Fuerza la recarga de permisos
   */
  public async reloadPermissions(): Promise<void> {
    this.loaded = false;
    await this.loadPermissions();
  }

  /**
   * Exporta todos los permisos como JSON string para descarga
   */
  public exportToJson(): string {
    return JSON.stringify(this.permissions, null, 2);
  }

  /**
   * Descarga los permisos como archivo JSON
   */
  public downloadAsJson(filename: string = 'permissionEntities.json'): void {
    const jsonString = this.exportToJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

// Exportar la instancia única
export const permissionEntityStorage = PermissionEntityStorage.getInstance();