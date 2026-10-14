import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { orgMocks, navigateMock, updateGeneralMock } = vi.hoisted(() => ({
  orgMocks: {
    getCurrent: vi.fn(),
    updateCurrent: vi.fn(),
    uploadLogo: vi.fn(),
  },
  navigateMock: vi.fn(),
  updateGeneralMock: vi.fn(),
}));

let adminAccess = true;

vi.mock('@/infrastructure/api/services/organizationsService', () => ({
  organizationsService: orgMocks,
}));

vi.mock('@/shared/navigation', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/shared/lib/permissionUtils', () => ({
  PermissionUtils: {},
  usePermissions: () => ({
    isLoaded: true,
    isAdminOrDirectorSync: () => adminAccess,
  }),
}));

vi.mock('@/app/providers/SettingsContext', () => ({
  useAppSettings: () => ({ appName: 'SIGHA', logoUrl: '', timezone: 'America/Costa_Rica' }),
  useGeneralSettingsUpdate: () => updateGeneralMock,
}));

import OrganizationSettingsPage from '@/modules/organizations/presentation/pages/OrganizationSettingsPage';

describe('OrganizationSettingsPage — marca por organización', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminAccess = true;
    orgMocks.getCurrent.mockResolvedValue({
      id: 1,
      name: 'ASOPOGUA',
      slug: 'asopogua',
      logoUrl: null,
    });
  });

  it('muestra el nombre de la org y el estado sin logo', async () => {
    render(<OrganizationSettingsPage />);
    await waitFor(() => expect(orgMocks.getCurrent).toHaveBeenCalled());
    expect(await screen.findByDisplayValue('ASOPOGUA')).toBeInTheDocument();
    expect(screen.getByText('Sin logo')).toBeInTheDocument();
    expect(screen.getByText('asopogua')).toBeInTheDocument();
  });

  it('redirige a /settings cuando no es admin', async () => {
    adminAccess = false;
    render(<OrganizationSettingsPage />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/settings'));
    expect(orgMocks.getCurrent).not.toHaveBeenCalled();
  });

  it('guardar actualiza el nombre y refresca SettingsContext', async () => {
    const user = userEvent.setup();
    orgMocks.updateCurrent.mockResolvedValue({
      id: 1,
      name: 'Nuevo nombre',
      slug: 'asopogua',
      logoUrl: null,
    });
    render(<OrganizationSettingsPage />);
    const input = await screen.findByDisplayValue('ASOPOGUA');
    await user.clear(input);
    await user.type(input, 'Nuevo nombre');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(orgMocks.updateCurrent).toHaveBeenCalledWith('Nuevo nombre'));
    expect(updateGeneralMock).toHaveBeenCalledWith({
      appName: 'Nuevo nombre',
      logoUrl: '',
      timezone: 'America/Costa_Rica',
    });
    expect(await screen.findByText('Organización actualizada correctamente.')).toBeInTheDocument();
  });

  it('subir logo previsualiza, actualiza y refresca SettingsContext', async () => {
    const user = userEvent.setup();
    orgMocks.uploadLogo.mockResolvedValue({
      id: 1,
      name: 'ASOPOGUA',
      slug: 'asopogua',
      logoUrl: 'https://cdn/nuevo-logo.png',
    });
    render(<OrganizationSettingsPage />);
    await screen.findByDisplayValue('ASOPOGUA');
    const file = new File(['bytes'], 'logo.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Subir logo de la organización');
    await user.upload(fileInput, file);
    await waitFor(() => expect(orgMocks.uploadLogo).toHaveBeenCalled());
    expect(updateGeneralMock).toHaveBeenCalledWith({
      appName: 'ASOPOGUA',
      logoUrl: 'https://cdn/nuevo-logo.png',
      timezone: 'America/Costa_Rica',
    });
    expect(await screen.findByText('Logo subido correctamente.')).toBeInTheDocument();
  });

  it('rechaza archivos que exceden 2MB sin llamar al backend', async () => {
    const user = userEvent.setup();
    render(<OrganizationSettingsPage />);
    await screen.findByDisplayValue('ASOPOGUA');
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Subir logo de la organización');
    await user.upload(fileInput, big);
    expect(await screen.findByText('El archivo excede el tamaño máximo de 2MB.')).toBeInTheDocument();
    expect(orgMocks.uploadLogo).not.toHaveBeenCalled();
  });
});
