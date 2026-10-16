import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PlatformGate, hasPlatformRole, readPlatformRole, PLATFORM_ROLES } from './platform-gate';
import type { AuthUser } from '@/shared/types/auth';

const routerMock = vi.hoisted(() => ({ replace: vi.fn() }));
const authMock = vi.hoisted(() => ({ isAuthenticated: vi.fn(), getUser: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => routerMock }));
vi.mock('@/infrastructure/storage/authStorage', () => ({ authStorage: authMock }));

/**
 * Local view of the stored user including the platform claim. Keeps this task
 * independent from the session-claims change so it compiles on its own base.
 */
type PlatformUser = AuthUser & { platformRole?: string | null };

const baseUser: PlatformUser = { id: 1, uEmail: 'owner@example.test', uName: 'Owner', roles: [], roleIds: [] };

describe('PlatformGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.isAuthenticated.mockReturnValue(true);
    authMock.getUser.mockReturnValue(baseUser);
  });
  afterEach(() => vi.clearAllMocks());

  it('redirects unauthenticated visitors to /login', async () => {
    authMock.isAuthenticated.mockReturnValue(false);
    render(<PlatformGate><div>Plano</div></PlatformGate>);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Plano')).not.toBeInTheDocument();
  });

  it('redirects authenticated users without a platform role to /dashboard', async () => {
    render(<PlatformGate><div>Plano</div></PlatformGate>);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText('Plano')).not.toBeInTheDocument();
  });

  it('renders platform content for a platform owner', async () => {
    authMock.getUser.mockReturnValue({ ...baseUser, platformRole: 'PLATFORM_OWNER' });
    render(<PlatformGate><div>Plano</div></PlatformGate>);

    expect(await screen.findByText('Plano')).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});

describe('platform role helpers', () => {
  it('detects known platform roles and ignores unknown or missing claims', () => {
    const support: PlatformUser = { ...baseUser, platformRole: 'PLATFORM_SUPPORT' };
    const owner: PlatformUser = { ...baseUser, platformRole: 'PLATFORM_OWNER' };
    const orgAdmin: PlatformUser = { ...baseUser, platformRole: 'admin' };

    expect(readPlatformRole(support)).toBe('PLATFORM_SUPPORT');
    expect(readPlatformRole(baseUser)).toBeNull();
    expect(hasPlatformRole(owner)).toBe(true);
    expect(hasPlatformRole(baseUser)).toBe(false);
    expect(hasPlatformRole(orgAdmin)).toBe(false);
    expect(PLATFORM_ROLES).toContain('PLATFORM_OWNER');
  });
});
