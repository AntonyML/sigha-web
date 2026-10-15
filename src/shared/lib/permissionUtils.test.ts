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
});
