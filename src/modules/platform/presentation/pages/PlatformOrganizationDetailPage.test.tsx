import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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

import PlatformOrganizationDetailPage from './PlatformOrganizationDetailPage';
import PlatformOrganizationsPage from './PlatformOrganizationsPage';

const org = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Hogar San Pedro',
  slug: 'hogar-san-pedro',
  logoUrl: null,
  status: 'ACTIVE',
  planTier: 'PREMIUM',
  isActive: true,
  brandingOverrides: null,
  memberCount: 4,
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-02-15T08:30:00.000Z',
  ...overrides,
});

describe('PlatformOrganizationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.hasStepUpToken.mockReturnValue(true);
  });
  afterEach(() => vi.clearAllMocks());

  it('muestra identidad, membresías y fechas de la organización', async () => {
    serviceMock.get.mockResolvedValue(org());

    render(<PlatformOrganizationDetailPage organizationId={1} />);

    expect(
      await screen.findByRole('heading', { name: 'Hogar San Pedro' }),
    ).toBeInTheDocument();
    expect(serviceMock.get).toHaveBeenCalledWith(1);
    expect(screen.getByText('/hogar-san-pedro')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('miembros registrados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al listado/ })).toHaveAttribute(
      'href',
      '/platform/organizations',
    );

    const times = Array.from(document.querySelectorAll('time'));
    expect(times.map((time) => time.getAttribute('dateTime'))).toEqual([
      '2026-01-01T10:00:00.000Z',
      '2026-02-15T08:30:00.000Z',
    ]);
    expect(
      screen.getByText('Sin overrides: la organización usa la identidad por defecto de la plataforma.'),
    ).toBeInTheDocument();
  });

  it('muestra los overrides de marca cuando existen', async () => {
    serviceMock.get.mockResolvedValue(
      org({
        brandingOverrides: {
          displayName: 'San Pedro',
          logoUrl: 'https://cdn.ejemplo.test/logo.png',
          primaryColor: '#0f62fe',
        },
      }),
    );

    render(<PlatformOrganizationDetailPage organizationId={7} />);

    expect(await screen.findByText('San Pedro')).toBeInTheDocument();
    expect(screen.getByText('https://cdn.ejemplo.test/logo.png')).toBeInTheDocument();
    expect(screen.getByText('#0f62fe')).toBeInTheDocument();
    expect(serviceMock.get).toHaveBeenCalledWith(7);
  });

  it('avisa cuando la organización no existe', async () => {
    serviceMock.get.mockRejectedValue({ response: { status: 404 } });

    render(<PlatformOrganizationDetailPage organizationId={99} />);

    expect(
      await screen.findByText('La organización solicitada no existe.'),
    ).toBeInTheDocument();
  });

  it('no consulta la API si el identificador de la ruta no es válido', async () => {
    render(<PlatformOrganizationDetailPage organizationId={Number('abc')} />);

    expect(
      await screen.findByText('La organización solicitada no existe.'),
    ).toBeInTheDocument();
    expect(serviceMock.get).not.toHaveBeenCalled();
  });

  it('reporta el mensaje de la API cuando la carga falla', async () => {
    serviceMock.get.mockRejectedValue({
      response: { status: 403, data: { message: 'Sin permisos de plataforma.' } },
    });

    render(<PlatformOrganizationDetailPage organizationId={2} />);

    expect(await screen.findByText('Sin permisos de plataforma.')).toBeInTheDocument();
  });
});

describe('PlatformOrganizationsPage · enlace al detalle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.hasStepUpToken.mockReturnValue(true);
  });
  afterEach(() => vi.clearAllMocks());

  it('enlaza cada fila con el detalle de la organización', async () => {
    serviceMock.list.mockResolvedValue([org()]);

    render(<PlatformOrganizationsPage />);

    const link = await screen.findByRole('link', { name: 'Hogar San Pedro' });
    expect(link).toHaveAttribute('href', '/platform/organizations/view?id=1');
  });
});
