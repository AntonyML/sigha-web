import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionUtils } from './permissionUtils';
import { authStorage } from '@/infrastructure/storage/authStorage';
import { permissionApiService } from '@/infrastructure/api/services/permissionApiService';
import type { AuthUser } from '@/shared/types/auth';
import type { RolePermissionApi } from '@/infrastructure/api/services/permissionApiService';

vi.mock('@/infrastructure/storage/authStorage', () => ({
  authStorage: { getUser: vi.fn() },
}));
vi.mock('@/infrastructure/api/services/permissionApiService', () => ({
  permissionApiService: { getByRole: vi.fn() },
}));

describe('PermissionUtils', () => {
  beforeEach(() => {
    PermissionUtils.clearCache();
    vi.mocked(authStorage.getUser).mockReturnValue({ id: 7, uEmail: 'test@example.test', uName: 'Test', roles: [], roleIds: [4] } satisfies AuthUser);
  });
  afterEach(() => {
    PermissionUtils.clearCache();
    vi.clearAllMocks();
  });

  const userWith = (over: Partial<AuthUser> = {}): AuthUser => ({
    id: 7, uEmail: 'test@example.test', uName: 'Test', roles: [], roleIds: [4], ...over,
  });

  const grantedPermission = (pModule: string, pAction: string): RolePermissionApi => ({
    id: 1, roleId: 4, permissionId: 9, rpGranted: true, createdAt: '', updatedAt: '',
    permission: { id: 9, pName: 'Permiso', pDescription: '', pModule, pAction, pEnabled: true, createdAt: '', updatedAt: '' },
  });

  it('fails closed and exposes a clear error when permission loading fails', async () => {
    vi.mocked(permissionApiService.getByRole).mockRejectedValue(new Error('offline'));
    await expect(PermissionUtils.load(true)).rejects.toThrow('offline');
    expect(PermissionUtils.getLoadError()).toMatch(/No se pudieron cargar los permisos/);
    expect(PermissionUtils.canAccessModule('carePlans')).toBe(false);
  });

  it('clears the error and grants access after a successful retry', async () => {
    vi.mocked(permissionApiService.getByRole).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([
      {
        id: 1, roleId: 4, permissionId: 9, rpGranted: true, createdAt: '', updatedAt: '',
        permission: { id: 9, pName: 'Planes', pDescription: '', pModule: 'carePlans', pAction: 'view', pEnabled: true, createdAt: '', updatedAt: '' },
      },
    ] satisfies RolePermissionApi[]);
    await expect(PermissionUtils.load(true)).rejects.toThrow('offline');
    await PermissionUtils.load(true);
    expect(PermissionUtils.getLoadError()).toBeNull();
    expect(PermissionUtils.canAccessModule('carePlans')).toBe(true);
  });

  describe('grupo 1: plano plataforma', () => {
    it('reconoce PLATFORM_OWNER y PLATFORM_SUPPORT como rol de plataforma', () => {
      for (const platformRole of ['PLATFORM_OWNER', 'PLATFORM_SUPPORT']) {
        PermissionUtils.clearCache();
        vi.mocked(authStorage.getUser).mockReturnValue(userWith({ platformRole, orgRoles: [] }));
        expect(PermissionUtils.hasPlatformRole()).toBe(true);
        expect(PermissionUtils.isSuperAdminSync()).toBe(true);
        expect(PermissionUtils.isSuperAdmin()).toBe(true);
        expect(PermissionUtils.isAdmin()).toBe(true);
      }
    });

    it('no concede plataforma con rol nulo, vacío, desconocido o en otra caja', () => {
      for (const platformRole of [null, '', 'PLATFORM_ADMIN', 'platform_owner', 'OWNER']) {
        PermissionUtils.clearCache();
        vi.mocked(authStorage.getUser).mockReturnValue(userWith({ platformRole, orgRoles: [] }));
        expect(PermissionUtils.hasPlatformRole()).toBe(false);
        expect(PermissionUtils.isSuperAdminSync()).toBe(false);
      }
    });

    it('mantiene el plano por permisos cuando no hay rol de plataforma', async () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ platformRole: null, orgRoles: [] }));
      vi.mocked(permissionApiService.getByRole).mockResolvedValue([grantedPermission('users', 'create')]);
      await PermissionUtils.load(true);
      expect(PermissionUtils.isAdmin()).toBe(true);
      expect(PermissionUtils.isSuperAdmin()).toBe(false);
      expect(PermissionUtils.hasPlatformRole()).toBe(false);
    });
  });

  describe('grupo 2: scoping por organización', () => {
    it('reconoce admin y director desde orgRoles', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['admin'] }));
      expect(PermissionUtils.isAdminSync()).toBe(true);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(true);
    });

    it('director habilita isAdminOrDirectorSync pero no isAdminSync', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['director'] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(true);
    });

    it('normaliza la caja de los roles de organización', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['ADMIN', 'Director'] }));
      expect(PermissionUtils.isAdminSync()).toBe(true);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(true);
    });

    it('ignora roles de organización que no son admin ni director', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['member', 'viewer'] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(false);
    });
  });

  describe('grupo 3: precedencia de orgRoles y sesión sin organización', () => {
    it('un orgRoles vacío manda sobre roles: sin organización no hay admin', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: [], roles: ['admin', 'director'] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(false);
    });

    it('cae a roles cuando la sesión no trae orgRoles', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ roles: ['admin'] }));
      expect(PermissionUtils.isAdminSync()).toBe(true);
    });

    it('sin roles de ningún tipo queda en falso', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ roles: [] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(false);
    });

    it('director en orgRoles con admin en roles no escala isAdminSync', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['director'], roles: ['admin'] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(true);
    });
  });

  describe('grupo 4: no regresión de "super admin" y límites entre planos', () => {
    it('"super admin" ya no habilita las comprobaciones de organización', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ orgRoles: ['super admin'], roles: ['super admin'] }));
      expect(PermissionUtils.isSuperAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(false);
    });

    it('el rol de plataforma no habilita el alcance de organización', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ platformRole: 'PLATFORM_OWNER', orgRoles: [] }));
      expect(PermissionUtils.isAdminSync()).toBe(false);
      expect(PermissionUtils.isAdminOrDirectorSync()).toBe(false);
      expect(PermissionUtils.isSuperAdminSync()).toBe(true);
    });

    it('canManageRoles sigue resolviéndose por permisos', async () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ platformRole: null, orgRoles: [] }));
      vi.mocked(permissionApiService.getByRole).mockResolvedValue([grantedPermission('roles', 'edit')]);
      await PermissionUtils.load(true);
      expect(PermissionUtils.canManageRoles()).toBe(true);
    });

    it('isNotSpecifiedSync sigue mirando los roles efectivos', () => {
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ roles: ['not specified'] }));
      expect(PermissionUtils.isNotSpecifiedSync()).toBe(true);
      vi.mocked(authStorage.getUser).mockReturnValue(userWith({ roles: ['admin'] }));
      expect(PermissionUtils.isNotSpecifiedSync()).toBe(false);
    });
  });
});
