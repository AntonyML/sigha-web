import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const serviceMock = vi.hoisted(() => ({ get: vi.fn() }));
const searchParamsMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/infrastructure/api/services/platformOrganizationsService', () => ({
  platformOrganizationsService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    requestStepUp: vi.fn(),
    hasStepUpToken: vi.fn(),
    clearStepUpToken: vi.fn(),
    get: serviceMock.get,
  },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: searchParamsMock.get }),
}));

import Page from '@/app/(platform)/platform/organizations/view/page';

const org = {
  id: 5,
  name: 'Hogar San Pedro',
  slug: 'hogar-san-pedro',
  logoUrl: null,
  status: 'ACTIVE',
  planTier: 'BASIC',
  isActive: true,
  brandingOverrides: null,
  memberCount: 2,
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
};

describe('ruta /platform/organizations/view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.get.mockResolvedValue(org);
  });
  afterEach(() => vi.clearAllMocks());

  it('carga el detalle con el id recibido por query string', async () => {
    searchParamsMock.get.mockReturnValue('5');

    render(<Page />);

    expect(await screen.findByRole('heading', { name: 'Hogar San Pedro' })).toBeInTheDocument();
    expect(serviceMock.get).toHaveBeenCalledWith(5);
  });

  it('avisa que no existe cuando la ruta llega sin id', async () => {
    searchParamsMock.get.mockReturnValue(null);

    render(<Page />);

    expect(
      await screen.findByText('La organización solicitada no existe.'),
    ).toBeInTheDocument();
    expect(serviceMock.get).not.toHaveBeenCalled();
  });
});
