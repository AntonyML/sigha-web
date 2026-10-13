import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthUser } from '@/shared/types/auth';

const { authFlowMock, refreshMock, markEnabledMock, navigation } = vi.hoisted(() => ({
  authFlowMock: {
    verify2FA: vi.fn(),
    clearLocalSession: vi.fn(),
  },
  refreshMock: vi.fn(),
  markEnabledMock: vi.fn(),
  navigation: { pathname: '/auth/verify-2fa' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (destination: string) => { navigation.pathname = destination.split('?')[0]; },
    replace: (destination: string) => { navigation.pathname = destination.split('?')[0]; },
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams('email=usuario%40ejemplo.com'),
  useParams: () => ({}),
}));

vi.mock('@/modules/auth/application/flows/auth', () => ({
  authFlow: authFlowMock,
}));

vi.mock('@/modules/security/application/flows/twoFactor', () => ({
  useTwoFactorStatus: () => ({
    isEnabled: null,
    loading: false,
    refresh: refreshMock,
    markEnabled: markEnabledMock,
  }),
}));

import TwoFactorVerificationPage from '@/modules/auth/presentation/pages/login/TwoFactorVerificationPage';

const TEST_USER: AuthUser = {
  id: 1,
  uEmail: 'usuario@ejemplo.com',
  uName: 'Usuario',
  roles: ['admin'],
  roleIds: [1],
};

function renderPage() {
  navigation.pathname = '/auth/verify-2fa';
  render(<TwoFactorVerificationPage />);
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

  it('espera el refresh del estado 2FA y marca isEnabled=true antes de navegar a /dashboard', async () => {
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
    expect(navigation.pathname).toBe('/auth/verify-2fa');
    expect(markEnabledMock).not.toHaveBeenCalled();

    await act(async () => {
      resolveRefresh();
    });

    await waitFor(() => expect(navigation.pathname).toBe('/dashboard'));
    expect(markEnabledMock).toHaveBeenCalledTimes(1);
  });

  it('navega a /dashboard cuando la verificación es exitosa y el refresh ya resolvió', async () => {
    const user = userEvent.setup();
    authFlowMock.verify2FA.mockResolvedValue({ success: true, user: TEST_USER });

    renderPage();

    await user.type(screen.getByLabelText('Código de Verificación'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verificar Código' }));

    await waitFor(() => expect(navigation.pathname).toBe('/dashboard'));
    expect(markEnabledMock).toHaveBeenCalledTimes(1);
  });

  it('no navega y muestra error cuando verify2FA falla', async () => {
    const user = userEvent.setup();
    authFlowMock.verify2FA.mockResolvedValue({ success: false, error: 'Código 2FA inválido' });

    renderPage();

    await user.type(screen.getByLabelText('Código de Verificación'), '999999');
    await user.click(screen.getByRole('button', { name: 'Verificar Código' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Código 2FA inválido'));
    expect(navigation.pathname).toBe('/auth/verify-2fa');
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
