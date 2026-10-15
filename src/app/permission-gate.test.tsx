import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PermissionGate } from './permission-gate';

const permissionState = vi.hoisted(() => ({ loaded: false, error: null as string | null, allowed: false }));
const permissionMock = vi.hoisted(() => ({ load: vi.fn(), subscribe: vi.fn() }));
const routerMock = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => routerMock }));
vi.mock('@/shared/lib/permissionUtils', () => ({
  PermissionUtils: {
    isLoaded: () => permissionState.loaded,
    getLoadError: () => permissionState.error,
    canAccessModule: () => permissionState.allowed,
    load: permissionMock.load,
    subscribe: permissionMock.subscribe,
  },
}));

describe('PermissionGate', () => {
  beforeEach(() => {
    permissionState.loaded = false;
    permissionState.error = null;
    permissionState.allowed = false;
    permissionMock.subscribe.mockReturnValue(() => undefined);
    permissionMock.load.mockResolvedValue(undefined);
  });
  afterEach(() => vi.clearAllMocks());

  it('shows a retryable explanation instead of silently hiding the route when permissions fail', async () => {
    permissionMock.load.mockImplementation(async () => {
      permissionState.error = 'No se pudieron cargar los permisos. Compruebe la conexión e inténtelo de nuevo.';
      throw new Error('offline');
    });
    render(<PermissionGate module="carePlans"><div>Contenido de cuidados</div></PermissionGate>);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los permisos');
    expect(screen.getByRole('button', { name: 'Reintentar carga de permisos' })).toBeInTheDocument();
    expect(screen.queryByText('Contenido de cuidados')).not.toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('renders an authorized module and redirects a user without view access', async () => {
    permissionState.loaded = true;
    permissionState.allowed = true;
    render(<PermissionGate module="accessLogs"><div>Acceso concedido</div></PermissionGate>);
    expect(screen.getByText('Acceso concedido')).toBeInTheDocument();

    permissionState.allowed = false;
    const { unmount } = render(<PermissionGate module="systemAudit"><div>Auditoría</div></PermissionGate>);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard'));
    unmount();
  });
});
