import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  getCurrentPath: vi.fn(() => '/dashboard'),
}));

vi.mock('@/shared/lib/navigationUtils', () => ({
  navigateTo: mocks.navigateTo,
  getCurrentPath: mocks.getCurrentPath,
}));

import {
  isOrganizationAccessError,
  redirectForOrganizationAccessError,
} from './organizationAccessRedirect';

describe('organizationAccessRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.getCurrentPath.mockReturnValue('/dashboard');
  });

  it('redirige a /seleccionar-organizacion?reason=access-denied cuando el 403 es por membresía u organización inactiva', () => {
    localStorage.setItem('authToken', 'token-valido');

    redirectForOrganizationAccessError(403, {
      statusCode: 403,
      message: 'El usuario no pertenece a la organización activa',
      error: 'Forbidden',
    });

    expect(mocks.navigateTo).toHaveBeenCalledWith('/seleccionar-organizacion?reason=access-denied');
  });

  it('NO redirige al selector de organización cuando el 403 es por falta de rol de negocio (Forbidden resource)', () => {
    localStorage.setItem('authToken', 'token-valido');

    redirectForOrganizationAccessError(403, {
      statusCode: 403,
      message: 'Forbidden resource',
      error: 'Forbidden',
    });

    expect(mocks.navigateTo).not.toHaveBeenCalled();
  });

  it('NO redirige al selector de organización cuando el 403 es del plano plataforma', () => {
    localStorage.setItem('authToken', 'token-valido');

    redirectForOrganizationAccessError(403, {
      statusCode: 403,
      message: 'Se requiere un rol de plataforma para acceder a este recurso',
      error: 'Forbidden',
    });

    expect(mocks.navigateTo).not.toHaveBeenCalled();
    expect(
      isOrganizationAccessError(403, {
        message: 'Se requiere una organización activa en la sesión para acceder a este recurso de negocio',
      }),
    ).toBe(true);
  });
});
