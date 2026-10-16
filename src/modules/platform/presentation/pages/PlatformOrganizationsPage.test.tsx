import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const serviceMock = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  requestStepUp: vi.fn(),
  hasStepUpToken: vi.fn(),
  clearStepUpToken: vi.fn(),
}));

vi.mock('@/infrastructure/api/services/platformOrganizationsService', () => ({
  platformOrganizationsService: serviceMock,
}));

import PlatformOrganizationsPage from './PlatformOrganizationsPage';

const org = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Hogar San Pedro',
  slug: 'hogar-san-pedro',
  logoUrl: null,
  status: 'ACTIVE',
  planTier: 'BASIC',
  isActive: true,
  brandingOverrides: null,
  memberCount: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('PlatformOrganizationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.list.mockResolvedValue([org()]);
    serviceMock.hasStepUpToken.mockReturnValue(true);
  });
  afterEach(() => vi.clearAllMocks());

  it('lista las organizaciones con su conteo de miembros', async () => {
    render(<PlatformOrganizationsPage />);

    expect(await screen.findByText('Hogar San Pedro')).toBeInTheDocument();
    expect(screen.getByText('/hogar-san-pedro')).toBeInTheDocument();
    expect(serviceMock.list).toHaveBeenCalledTimes(1);
  });

  it('crea una organización tras verificar 2FA cuando no hay step-up previo', async () => {
    serviceMock.hasStepUpToken.mockReturnValue(false);
    serviceMock.requestStepUp.mockResolvedValue({
      accessToken: 'step-token',
      expiresAt: '2026-01-01T00:05:00.000Z',
    });
    serviceMock.create.mockResolvedValue(org({ id: 2, name: 'Nueva Org', slug: 'nueva-org' }));

    render(<PlatformOrganizationsPage />);
    await screen.findByText('Hogar San Pedro');

    fireEvent.change(screen.getByLabelText('Código 2FA (6 dígitos)'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Org' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear organización' }).closest('form')!);

    await waitFor(() =>
      expect(serviceMock.create).toHaveBeenCalledWith({
        name: 'Nueva Org',
        slug: undefined,
        planTier: 'BASIC',
      }),
    );
    expect(serviceMock.requestStepUp).toHaveBeenCalledWith('123456');
    expect(await screen.findByText(/creada/)).toBeInTheDocument();
  });

  it('no muta si falta el código 2FA y no hay step-up', async () => {
    serviceMock.hasStepUpToken.mockReturnValue(false);

    render(<PlatformOrganizationsPage />);
    await screen.findByText('Hogar San Pedro');

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Org' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear organización' }).closest('form')!);

    expect(await screen.findByText(/código 2FA de 6 dígitos/)).toBeInTheDocument();
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('cambia el estado de una organización vía update', async () => {
    serviceMock.update.mockResolvedValue(org({ status: 'SUSPENDED' }));

    render(<PlatformOrganizationsPage />);
    await screen.findByText('Hogar San Pedro');

    fireEvent.change(screen.getByLabelText('Estado de Hogar San Pedro'), {
      target: { value: 'SUSPENDED' },
    });

    await waitFor(() =>
      expect(serviceMock.update).toHaveBeenCalledWith(1, { status: 'SUSPENDED' }),
    );
  });
});
