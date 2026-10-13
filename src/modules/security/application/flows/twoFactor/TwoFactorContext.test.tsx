import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { TwoFactorStatusResponse } from '@/shared/types/twoFactor';

const { get2FAStatusMock } = vi.hoisted(() => ({
  get2FAStatusMock: vi.fn(),
}));

vi.mock('../../../services/twoFactorService', () => ({
  twoFactorService: {
    get2FAStatus: get2FAStatusMock,
  },
}));

import { TwoFactorProvider } from '@/modules/security/application/flows/twoFactor/TwoFactorContext';
import { useTwoFactorStatus } from '@/modules/security/application/flows/twoFactor/useTwoFactorStatus';

/**
 * REGRESIÓN: race condition en el flujo de login con 2FA.
 *
 * El usuario ingresa el código de 6 dígitos, se guarda el accessToken y se
 * dispara `authTokenChanged`. Si el re-chequeo de estado 2FA no marca
 * `loading = true`, el TwoFactorGuard evalúa un `isEnabled` obsoleto
 * (`false`) y redirige a /two-factor en vez de dejar pasar a /dashboard.
 */
describe('TwoFactorContext — re-chequeo de estado al autenticarse', () => {
  beforeEach(() => {
    localStorage.clear();
    get2FAStatusMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('sin token de sesión el estado queda en isEnabled=false y loading=false', async () => {
    const { result } = renderHook(() => useTwoFactorStatus(), { wrapper: TwoFactorProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isEnabled).toBe(false);
    expect(get2FAStatusMock).not.toHaveBeenCalled();
  });

  it('al aparecer un token y dispararse authTokenChanged, loading pasa a true mientras el status está pendiente', async () => {
    let resolveStatus: (v: TwoFactorStatusResponse) => void = () => {};
    get2FAStatusMock.mockImplementation(
      () =>
        new Promise<TwoFactorStatusResponse>((resolve) => {
          resolveStatus = resolve;
        }),
    );

    const { result } = renderHook(() => useTwoFactorStatus(), { wrapper: TwoFactorProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isEnabled).toBe(false);

    localStorage.setItem('authToken', 'token-e2e');
    act(() => {
      window.dispatchEvent(new CustomEvent('authTokenChanged'));
    });

    try {
      // Con el código actual el handler llama a check2FAStatus() directamente y
      // loading nunca pasa a true -> este waitFor falla (reproducción del bug).
      await waitFor(() => expect(result.current.loading).toBe(true), { timeout: 1000 });
    } finally {
      await act(async () => {
        resolveStatus({ enabled: true, lastUsed: null, hasBackupCodes: true });
      });
    }

    expect(get2FAStatusMock).toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(true);
  });

  it('al resolver el status con enabled=true, isEnabled refleja el backend', async () => {
    get2FAStatusMock.mockResolvedValue({ enabled: true, lastUsed: null, hasBackupCodes: true });

    localStorage.setItem('authToken', 'token-e2e');
    const { result } = renderHook(() => useTwoFactorStatus(), { wrapper: TwoFactorProvider });

    await waitFor(() => expect(result.current.isEnabled).toBe(true));
    expect(result.current.loading).toBe(false);
  });
});
