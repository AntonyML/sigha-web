import { useEffect, useState } from 'react';
import { authStorage } from '../infrastructure/storage/authStorage';
import { permissionApiService } from '../services/permissionApiService';
import { roleFlow } from '../infrastructure/flows/role';
import type { UserRole } from '../types/user';

const PUBLIC_MODULES = new Set<string>([
  'profile',
  'main',
  'main-menu',
  'twoFactor',
  'two-factor',
  'dashboard',
]);

const ADMIN_MODULES = new Set<string>(['users', 'roles', 'permissions', 'audits']);

type Listener = () => void;

class PermissionUtilsImpl {
  private granted = new Set<string>();
  private loadedForRoleId: number | null = null;
  private rolesCache: UserRole[] | null = null;
  private inFlight: Promise<void> | null = null;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('PermissionUtils listener error:', err);
      }
    });
  }

  isLoaded(): boolean {
    return this.loadedForRoleId !== null;
  }

  clearCache(): void {
    this.granted = new Set();
    this.loadedForRoleId = null;
    this.rolesCache = null;
    this.inFlight = null;
    this.notify();
  }

  /**
   * Carga (y cachea) los permisos efectivos del usuario autenticado.
   * Resuelve el `roleId` desde el nombre del rol si es necesario.
   */
  async load(force = false): Promise<void> {
    if (this.inFlight) return this.inFlight;

    const user = authStorage.getUser();
    if (!user || user.role === undefined || user.role === null) {
      this.granted = new Set();
      this.loadedForRoleId = null;
      this.notify();
      return;
    }

    let roleId: number | null = typeof user.role === 'number' ? user.role : null;

    if (roleId === null) {
      const roleName = String(user.role).toLowerCase();
      if (!this.rolesCache) {
        const result = await roleFlow.getAllRoles();
        this.rolesCache = result.roles ?? null;
      }
      const found = this.rolesCache?.find((r) => r.rName.toLowerCase() === roleName);
      roleId = found?.id ?? null;
    }

    if (roleId === null) {
      this.granted = new Set();
      this.loadedForRoleId = null;
      this.notify();
      return;
    }

    if (!force && this.loadedForRoleId === roleId) return;

    this.inFlight = (async () => {
      try {
        const rolePerms = await permissionApiService.getByRole(roleId!);
        this.granted = new Set(
          rolePerms
            .filter((rp) => rp.rpGranted && rp.permission.pEnabled)
            .map((rp) => `${rp.permission.pModule}:${rp.permission.pAction}`)
        );
        this.loadedForRoleId = roleId;
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err);
        this.granted = new Set();
        this.loadedForRoleId = null;
      } finally {
        this.inFlight = null;
      }
      this.notify();
    })();

    return this.inFlight;
  }

  // ──────────────────── Consultas (síncronas, leen el caché) ────────────────────

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

  /**
   * Considera "admin" al usuario que puede gestionar usuarios, roles o permisos.
   * Es síncrono: si el caché no se ha cargado, devuelve `false`.
   */
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

  // ──────────────────── Identidad de rol (cache-friendly) ────────────────────

  getRoleName(): string | null {
    const user = authStorage.getUser();
    if (!user || user.role === undefined || user.role === null) return null;
    if (typeof user.role === 'string') return user.role;
    if (this.rolesCache) {
      const found = this.rolesCache.find((r) => r.id === user.role);
      if (found) return found.rName;
    }
    return null;
  }

  getRoleNameLower(): string | null {
    const name = this.getRoleName();
    return name ? name.toLowerCase() : null;
  }

  isAuthenticated(): boolean {
    return authStorage.isAuthenticated();
  }

  // ──────────────────── Alias de compatibilidad ────────────────────
  // Mantienen la API que ya consumen los componentes (Navbar, Sidebar, MainMenu).
  // Son síncronos y delegan al caché o al nombre del rol.

  canViewAllUsers(): boolean {
    return this.canAccessModule('users');
  }

  canCreateUsers(): boolean {
    return this.canPerformAction('users', 'create');
  }

  canEditUsers(): boolean {
    return this.canPerformAction('users', 'edit');
  }

  canDeleteUsers(): boolean {
    return this.canPerformAction('users', 'delete');
  }

  canManageRoles(): boolean {
    return this.canAccessModule('roles') || this.isSuperAdminUser();
  }

  canToggleUserStatus(): boolean {
    return this.canPerformAction('users', 'edit');
  }

  isSuperAdmin(): boolean {
    return this.isSuperAdminUser();
  }

  isAdmin(): boolean {
    return this.isAdminUser();
  }

  // Helpers legados (basados en el nombre del rol) — usados por Navbar/Sidebar
  // para decidir si el usuario todavía no tiene un rol asignado.
  isSuperAdminSync(): boolean {
    return this.getRoleNameLower() === 'super admin';
  }

  isAdminSync(): boolean {
    return this.getRoleNameLower() === 'admin';
  }

  isAdminOrDirectorSync(): boolean {
    const role = this.getRoleNameLower();
    return role === 'super admin' || role === 'admin' || role === 'director';
  }

  isNotSpecifiedSync(): boolean {
    const role = this.getRoleNameLower();
    return role === null || role === 'not specified';
  }

  isAdminModuleSync(module: string): boolean {
    return ADMIN_MODULES.has(module);
  }
}

export const PermissionUtils = new PermissionUtilsImpl();

/**
 * Hook de React que se re-renderiza cuando el caché de permisos cambia.
 * Devuelve una vista estable de los métodos síncronos de `PermissionUtils`.
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
    canPerformAction: (module: string, action: string) =>
      PermissionUtils.canPerformAction(module, action),
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
    load: (force = false) => PermissionUtils.load(force),
    clearCache: () => PermissionUtils.clearCache(),
  };
}
