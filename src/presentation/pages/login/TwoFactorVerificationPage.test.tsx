import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { AuthUser } from '../../../types/auth';

const { authFlowMock, refreshMock } = vi.hoisted(() => ({
  authFlowMock: {
    verify2FA: vi.fn(),
    clearLocalSession: vi.fn(),
  },
  refreshMock: vi.fn(),
}));

vi.mock('../../../infrastructure/flows/auth', () => ({
  authFlow: authFlowMock,
}));

vi.mock('../../../infrastructure/flows/twoFactor', () => ({
  useTwoFactorStatus: () => ({
    isEnabled: null,
    loading: false,
    refresh: refreshMock,
  }),
}));

import TwoFactorVerificationPage from './TwoFactorVerificationPage';

const TEST_USER: AuthUser = {
  id: 1,
  uEmail: 'usuario@ejemplo.com',
  uName: 'Usuario',
  roles: ['admin'],
  roleIds: [1],
};

let currentPath = '';

function LocationProbe() {
  const location = useLocation();
  currentPath = location.pathname;
  return null;
}

function renderPage() {
  currentPath = '';
  render(
    <MemoryRouter initialEntries={[{ pathname: '/auth/verify-2fa', state: { email: 'usuario@ejemplo.com' } }]}>
      <LocationProbe />
      <Routes>
        <Route path="/auth/verify-2fa" element={<TwoFactorVerificationPage />} />
        <Route path="*" element={<div>ruta-sin-matching</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * REGRESIÓN: tras verificar el código de 6 dígitos, la página debe esperar a
 * que el estado 2FA se refresque (para que el TwoFactorGuard lea
 * isEnabled=true) antes de navegar a /dashboard.
 *
 * Con el código actual la página navega a /dashboard sin refrescar el estado;
 * el guard ve el `isEnabled` obsoleto (false) y redirige a /two-factor.
 */
describe('TwoFactorVerificationPage — navegación post-verificación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    refreshMock.mockResolvedValue(undefined);
  });

  it('espera el refresh del estado 2FA antes de navegar a /dashboard', async () => {
    const user = userEvent.setup();
    let resolveRefresh: () => void = () => {};
    refreshMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    authFlowMock.verify2FA.mockResolvedValue({ success: true, user: TEST_USER });

    renderPage();

    await user.type(screen.getByLabelText('Código de Verificación'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verificar Código' }));

    // La página debe llamar refresh() (estado 2FA) antes de navegar.
    await waitFor(() => expect(refreshMock).toHaveBeenCalled(), { timeout: 2000 });
    expect(currentPath).toBe('/auth/verify-2fa');

    await act(async () => {
      resolveRefresh();
    });

    await waitFor(() => expect(currentPath).toBe('/dashboard'));
  });

  it('navega a /dashboard cuando la verificación es exitosa y el refresh ya resolvió', async () => {
    const user = userEvent.setup();
    authFlowMock.verify2FA.mockResolvedValue({ success: true, user: TEST_USER });

    renderPage();

    await user.type(screen.getByLabelText('Código de Verificación'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verificar Código' }));

    await waitFor(() => expect(currentPath).toBe('/dashboard'));
  });

  it('no navega y muestra error cuando verify2FA falla', async () => {
    const user = userEvent.setup();
    authFlowMock.verify2FA.mockResolvedValue({ success: false, error: 'Código 2FA inválido' });

    renderPage();

    await user.type(screen.getByLabelText('Código de Verificación'), '999999');
    await user.click(screen.getByRole('button', { name: 'Verificar Código' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Código 2FA inválido'));
    expect(currentPath).toBe('/auth/verify-2fa');
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
