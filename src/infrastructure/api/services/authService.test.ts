import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/infrastructure/api/organizationAccessRedirect', () => ({
  createApiClient: () => ({
    get: getMock,
    post: postMock,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }),
}));

vi.mock('@/shared/lib/navigationUtils', () => ({
  navigateTo: vi.fn(),
  getCurrentPath: vi.fn(() => '/'),
}));

import { authService } from '@/infrastructure/api/services/authService';
import type { AuthUser } from '@/shared/types/auth';

function makeToken(payload: Record<string, unknown>): string {
  const enc = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${enc({ alg: 'none', typ: 'JWT' })}.${enc(payload)}.signature`;
}

const apiUser = (extra: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  uEmail: 'owner@example.test',
  uName: 'Owner',
  roles: ['global-admin'],
  roleIds: [99],
  ...extra,
});

describe('authService — claims canonicos de sesion (web-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('login resuelve roles/roleIds de la organizacion activa y propaga platformRole', async () => {
    const accessToken = makeToken({ sub: 1, orgId: 5, orgRoleIds: [2], orgRoles: ['admin'] });
    postMock.mockResolvedValue({
      data: {
        accessToken,
        refreshToken: 'refresh',
        organizations: [{ id: 5, name: 'Org', slug: 'org', logoUrl: null, isPrimary: true }],
        user: apiUser({ orgRoleIds: [2], orgRoles: ['admin'], platformRole: 'PLATFORM_OWNER' }),
      },
    });

    await authService.login({ uEmail: 'owner@example.test', uPassword: 'secret' });

    const stored = authService.getStoredUser();
    expect(stored?.roles).toEqual(['admin']);
    expect(stored?.roleIds).toEqual([2]);
    expect(stored?.orgRoles).toEqual(['admin']);
    expect(stored?.orgRoleIds).toEqual([2]);
    expect(stored?.platformRole).toBe('PLATFORM_OWNER');
  });

  it('login hace fallback a los claims legacy roleIds/roles cuando no hay org scoping', async () => {
    const accessToken = makeToken({ sub: 1, roleIds: [7], roles: ['nurse'] });
    postMock.mockResolvedValue({
      data: {
        accessToken,
        refreshToken: 'refresh',
        organizations: [],
        user: apiUser(),
      },
    });

    await authService.login({ uEmail: 'owner@example.test', uPassword: 'secret' });

    const stored = authService.getStoredUser();
    expect(stored?.roles).toEqual(['nurse']);
    expect(stored?.roleIds).toEqual([7]);
    expect(stored?.platformRole).toBeNull();
  });

  it('switchActiveOrganization usa POST /auth/context y refresca el contexto del usuario', async () => {
    localStorage.setItem('authToken', 'old-token');
    localStorage.setItem(
      'user',
      JSON.stringify(apiUser({ roles: ['nurse'], roleIds: [3], platformRole: null })),
    );

    const accessToken = makeToken({
      sub: 1,
      orgId: 8,
      orgRoleIds: [4],
      orgRoles: ['director'],
      platformRole: 'PLATFORM_SUPPORT',
    });
    postMock.mockResolvedValue({
      data: {
        accessToken,
        refreshToken: 'refresh',
        activeOrganization: { id: 8, name: 'Org', slug: 'org', logoUrl: null },
        organizations: [],
      },
    });

    await authService.switchActiveOrganization(8);

    expect(postMock).toHaveBeenCalledWith('/auth/context', { organizationId: 8 });
    const stored = authService.getStoredUser();
    expect(stored?.roles).toEqual(['director']);
    expect(stored?.roleIds).toEqual([4]);
    expect(stored?.platformRole).toBe('PLATFORM_SUPPORT');
    expect(localStorage.getItem('authToken')).toBe(accessToken);
  });
});
