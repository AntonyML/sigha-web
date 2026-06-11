import type { PermissionEntity, CreatePermissionData, UpdatePermissionData } from '../../types/permissionEntity';

/**
 * PermissionEntityStorage - Singleton para gestionar permisos como entidades
 *
 * Persiste los permisos en localStorage y expone operaciones
 * CRUD síncronas (load es la única operación async).
 */
class PermissionEntityStorage {
    private static instance: PermissionEntityStorage;

    private readonly STORAGE_KEY = 'permissionEntities';
    private permissions: PermissionEntity[] = [];
    private loaded = false;

    private constructor() {
        // Singleton: constructor privado
    }

    public static getInstance(): PermissionEntityStorage {
        if (!PermissionEntityStorage.instance) {
            PermissionEntityStorage.instance = new PermissionEntityStorage();
        }
        return PermissionEntityStorage.instance;
    }

    // ==================== Carga / Estado ====================

    /**
     * Carga los permisos desde localStorage.
     * Si no existen, siembra con permisos por defecto.
     */
    public async loadPermissions(): Promise<void> {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as PermissionEntity[];
                this.permissions = Array.isArray(parsed) ? parsed : [];
            } else {
                this.permissions = this.seedPermissions();
                this.persist();
            }
            this.loaded = true;
        } catch (error) {
            console.error('Error cargando permisos:', error);
            this.permissions = this.seedPermissions();
            this.loaded = true;
        }
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    private persist(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.permissions));
        } catch (error) {
            console.error('Error persistiendo permisos:', error);
        }
    }

    private seedPermissions(): PermissionEntity[] {
        const now = new Date().toISOString();
        const base = (module: string, action: string, name: string): PermissionEntity => ({
            id: 0,
            name,
            description: `${module} - ${action}`,
            module,
            action,
            enabled: true,
            createdAt: now,
            updatedAt: now,
        });
        const seed: Omit<PermissionEntity, 'id'>[] = [
            base('users', 'view', 'users:view'),
            base('users', 'create', 'users:create'),
            base('users', 'edit', 'users:edit'),
            base('users', 'delete', 'users:delete'),
            base('roles', 'view', 'roles:view'),
            base('roles', 'create', 'roles:create'),
            base('roles', 'edit', 'roles:edit'),
            base('roles', 'delete', 'roles:delete'),
            base('permissions', 'view', 'permissions:view'),
            base('permissions', 'create', 'permissions:create'),
            base('permissions', 'edit', 'permissions:edit'),
            base('permissions', 'delete', 'permissions:delete'),
        ];
        return seed.map((p, idx) => ({ ...p, id: idx + 1 }));
    }

    private nextId(): number {
        return this.permissions.reduce((max, p) => (p.id > max ? p.id : max), 0) + 1;
    }

    // ==================== Lectura ====================

    public getAllPermissions(): PermissionEntity[] {
        return [...this.permissions];
    }

    public getPermissionById(id: number): PermissionEntity | undefined {
        return this.permissions.find(p => p.id === id);
    }

    public existsPermission(name: string, module: string, action: string, excludeId?: number): boolean {
        return this.permissions.some(p =>
            p.name === name &&
            p.module === module &&
            p.action === action &&
            (excludeId === undefined || p.id !== excludeId)
        );
    }

    public searchPermissions(criteria: {
        name?: string;
        module?: string;
        action?: string;
        enabled?: boolean;
    }): PermissionEntity[] {
        return this.permissions.filter(p => {
            if (criteria.name !== undefined && !p.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
            if (criteria.module !== undefined && p.module !== criteria.module) return false;
            if (criteria.action !== undefined && p.action !== criteria.action) return false;
            if (criteria.enabled !== undefined && p.enabled !== criteria.enabled) return false;
            return true;
        });
    }

    public getPermissionsByModule(module: string): PermissionEntity[] {
        return this.permissions.filter(p => p.module === module);
    }

    public getAvailableModules(): string[] {
        const modules = new Set<string>();
        this.permissions.forEach(p => modules.add(p.module));
        return Array.from(modules).sort();
    }

    public getAvailableActions(): string[] {
        const actions = new Set<string>();
        this.permissions.forEach(p => actions.add(p.action));
        return Array.from(actions).sort();
    }

    // ==================== Escritura ====================

    public createPermission(data: CreatePermissionData): PermissionEntity {
        const now = new Date().toISOString();
        const created: PermissionEntity = {
            id: this.nextId(),
            name: data.name,
            description: data.description,
            module: data.module,
            action: data.action,
            enabled: data.enabled,
            createdAt: now,
            updatedAt: now,
        };
        this.permissions.push(created);
        this.persist();
        return created;
    }

    public updatePermission(id: number, data: UpdatePermissionData): PermissionEntity | undefined {
        const idx = this.permissions.findIndex(p => p.id === id);
        if (idx === -1) return undefined;
        const current = this.permissions[idx];
        const updated: PermissionEntity = {
            ...current,
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.module !== undefined && { module: data.module }),
            ...(data.action !== undefined && { action: data.action }),
            ...(data.enabled !== undefined && { enabled: data.enabled }),
            updatedAt: new Date().toISOString(),
        };
        this.permissions[idx] = updated;
        this.persist();
        return updated;
    }

    public deletePermission(id: number): boolean {
        const before = this.permissions.length;
        this.permissions = this.permissions.filter(p => p.id !== id);
        const removed = this.permissions.length < before;
        if (removed) this.persist();
        return removed;
    }

    // ==================== Exportación ====================

    public exportToJson(): string {
        return JSON.stringify(this.permissions, null, 2);
    }

    public downloadAsJson(filename = 'permisos.json'): void {
        const json = this.exportToJson();
        const blob = new Blob([json], { type: 'application/json' });
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
