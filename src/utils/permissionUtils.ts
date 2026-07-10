import { useEffect, useState } from 'react';
import { authStorage } from '../infrastructure/storage/authStorage';
import { permissionApiService } from '../services/permissionApiService';

const PUBLIC_MODULES = new Set<string>([
  'profile',
  'twoFactor',
  'two-factor',
  'dashboard',
]);

const ADMIN_MODULES = new Set<string>(['users', 'roles', 'permissions', 'audits']);

type Listener = () => void;

class PermissionUtilsImpl {
  private granted = new Set<string>();
  private loadedForUserId: number | null = null;
  private inFlight: Promise<void> | null = null;
  private listeners = new Set<Listener>();

  constructor() {
    // Listen for token changes (e.g., after 2FA enable) to reload permissions
    if (typeof window !== 'undefined') {
      window.addEventListener('authTokenChanged', () => this.load(true));
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try { l(); } catch (err) { console.error('PermissionUtils listener error:', err); }
    });
  }

  isLoaded(): boolean {
    return this.loadedForUserId !== null;
  }

  clearCache(): void {
    this.granted = new Set();
    this.loadedForUserId = null;
    this.inFlight = null;
    this.notify();
  }

  /**
   * Carga los permisos efectivos del usuario autenticado.
   * Fuente de verdad: roleIds del JWT (obtenidos vía /auth/profile),
   * cruzados contra GET /permissions/role/:roleId por cada rol.
   */
  async load(force = false): Promise<void> {
    if (this.inFlight) return this.inFlight;

    const user = authStorage.getUser();
    if (!user) {
      this.granted = new Set();
      this.loadedForUserId = null;
      this.notify();
      return;
    }

    const roleIds: number[] = Array.isArray(user.roleIds) ? user.roleIds : [];

    if (roleIds.length === 0) {
      this.granted = new Set();
      this.loadedForUserId = user.id;
      this.notify();
      return;
    }

    if (!force && this.loadedForUserId === user.id) return;

    this.inFlight = (async () => {
      try {
        const permsPerRole = await Promise.all(
          roleIds.map(rid => permissionApiService.getByRole(rid).catch(() => []))
        );

        const merged = new Set<string>();
        for (const rolePerms of permsPerRole) {
          for (const rp of rolePerms) {
            if (rp.rpGranted && rp.permission.pEnabled) {
              merged.add(`${rp.permission.pModule}:${rp.permission.pAction}`);
            }
          }
        }

        this.granted = merged;
        this.loadedForUserId = user.id;
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err);
        this.granted = new Set();
        this.loadedForUserId = null;
      } finally {
        this.inFlight = null;
      }
      this.notify();
    })();

    return this.inFlight;
  }

  has(module: string, action: string): boolean {
    return this.granted.has(`${module}:${action}`);
  }

  isPublicModule(module: string): boolean {
    return PUBLIC_MODULES.has(module);
  }

  canAccessModule(module: string): boolean {
    if (this.isPublicModule(module)) return true;
    return this.has(module, 'view');
  }

  canPerformAction(module: string, action: string): boolean {
    if (this.isPublicModule(module) && action === 'view') return true;
    return this.has(module, action);
  }

  isAdminUser(): boolean {
    return (
      this.has('users', 'create') ||
      this.has('users', 'edit') ||
      this.has('roles', 'edit') ||
      this.has('permissions', 'edit') ||
      this.has('audits', 'view')
    );
  }

  isSuperAdminUser(): boolean {
    return this.has('roles', 'edit') || this.has('permissions', 'edit');
  }

  getRoleNames(): string[] {
    const user = authStorage.getUser();
    if (!user || !Array.isArray(user.roles)) return [];
    return user.roles;
  }

  getRoleNamesLower(): string[] {
    return this.getRoleNames().map(r => r.toLowerCase());
  }

  hasRole(roleName: string): boolean {
    return this.getRoleNamesLower().includes(roleName.toLowerCase());
  }

  isAuthenticated(): boolean {
    return authStorage.isAuthenticated();
  }

  canViewAllUsers(): boolean { return this.canAccessModule('users'); }
  canCreateUsers(): boolean { return this.canPerformAction('users', 'create'); }
  canEditUsers(): boolean { return this.canPerformAction('users', 'edit'); }
  canDeleteUsers(): boolean { return this.canPerformAction('users', 'delete'); }
  canManageRoles(): boolean { return this.canAccessModule('roles') || this.isSuperAdminUser(); }
  canToggleUserStatus(): boolean { return this.canPerformAction('users', 'edit'); }
  isSuperAdmin(): boolean { return this.isSuperAdminUser(); }
  isAdmin(): boolean { return this.isAdminUser(); }

  isSuperAdminSync(): boolean { return this.hasRole('super admin'); }
  isAdminSync(): boolean { return this.hasRole('admin'); }
  isAdminOrDirectorSync(): boolean {
    return this.hasRole('super admin') || this.hasRole('admin') || this.hasRole('director');
  }
  isNotSpecifiedSync(): boolean {
    const names = this.getRoleNamesLower();
    return names.length === 0 || (names.length === 1 && names[0] === 'not specified');
  }
  isAdminModuleSync(module: string): boolean { return ADMIN_MODULES.has(module); }
}

export const PermissionUtils = new PermissionUtilsImpl();

/**
 * Hook de React que se re-renderiza cuando el caché de permisos cambia.
 */
export function usePermissions() {
  const [, force] = useState(0);

  useEffect(() => {
    const unsubscribe = PermissionUtils.subscribe(() => force((n) => n + 1));
    void PermissionUtils.load();
    return unsubscribe;
  }, []);

  return {
    isLoaded: PermissionUtils.isLoaded(),
    canAccessModule: (module: string) => PermissionUtils.canAccessModule(module),
    canPerformAction: (module: string, action: string) => PermissionUtils.canPerformAction(module, action),
    isPublicModule: (module: string) => PermissionUtils.isPublicModule(module),
    isSuperAdmin: () => PermissionUtils.isSuperAdmin(),
    isAdmin: () => PermissionUtils.isAdmin(),
    isSuperAdminSync: () => PermissionUtils.isSuperAdminSync(),
    isAdminSync: () => PermissionUtils.isAdminSync(),
    isAdminOrDirectorSync: () => PermissionUtils.isAdminOrDirectorSync(),
    isNotSpecifiedSync: () => PermissionUtils.isNotSpecifiedSync(),
    canViewAllUsers: () => PermissionUtils.canViewAllUsers(),
    canCreateUsers: () => PermissionUtils.canCreateUsers(),
    canEditUsers: () => PermissionUtils.canEditUsers(),
    canDeleteUsers: () => PermissionUtils.canDeleteUsers(),
    canManageRoles: () => PermissionUtils.canManageRoles(),
    canToggleUserStatus: () => PermissionUtils.canToggleUserStatus(),
    getRoleNames: () => PermissionUtils.getRoleNames(),
    hasRole: (role: string) => PermissionUtils.hasRole(role),
    load: (force = false) => PermissionUtils.load(force),
    clearCache: () => PermissionUtils.clearCache(),
  };
}
