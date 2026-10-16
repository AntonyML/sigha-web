import { describe, it, expect, vi, beforeEach } from 'vitest';

const { instance, getMock, postMock, patchMock } = vi.hoisted(() => {
  const getMock = vi.fn();
  const postMock = vi.fn();
  const patchMock = vi.fn();
  const instance = {
    get: getMock,
    post: postMock,
    patch: patchMock,
    interceptors: { request: { use: vi.fn() } },
  };
  return { instance, getMock, postMock, patchMock };
});

vi.mock('axios', () => ({ default: { create: () => instance } }));
vi.mock('@/shared/config/app.config', () => ({
  config: { api: { baseUrl: '/api/backend' } },
}));
vi.mock('@/infrastructure/storage/authStorage', () => ({
  authStorage: { getAuthToken: vi.fn(() => 'token') },
}));

import { platformOrganizationsService } from '@/infrastructure/api/services/platformOrganizationsService';

const sampleOrg = {
  id: 1,
  name: 'Hogar San Pedro',
  slug: 'hogar-san-pedro',
  logoUrl: null,
  status: 'ACTIVE',
  planTier: 'BASIC',
  isActive: true,
  brandingOverrides: null,
  memberCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

describe('platformOrganizationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platformOrganizationsService.clearStepUpToken();
  });

  it('list consulta GET /platform/organizations', async () => {
    getMock.mockResolvedValue({ data: [sampleOrg] });
    const result = await platformOrganizationsService.list();
    expect(getMock).toHaveBeenCalledWith('/platform/organizations');
    expect(result).toEqual([sampleOrg]);
  });

  it('las mutaciones sin step-up no envían el header x-platform-step-up-token', async () => {
    postMock.mockResolvedValue({ data: sampleOrg });
    await platformOrganizationsService.create({ name: 'Nueva' });
    expect(postMock).toHaveBeenCalledWith('/platform/organizations', { name: 'Nueva' }, { headers: {} });
  });

  it('requestStepUp guarda el token y las mutaciones lo envían', async () => {
    postMock.mockResolvedValueOnce({
      data: { accessToken: 'step-token', expiresAt: '2026-01-01T00:05:00.000Z' },
    });

    await platformOrganizationsService.requestStepUp('123456');
    expect(postMock).toHaveBeenCalledWith('/platform/step-up', { code: '123456' });
    expect(platformOrganizationsService.hasStepUpToken()).toBe(true);

    postMock.mockResolvedValueOnce({ data: sampleOrg });
    await platformOrganizationsService.create({ name: 'Nueva' });
    expect(postMock).toHaveBeenLastCalledWith(
      '/platform/organizations',
      { name: 'Nueva' },
      { headers: { 'x-platform-step-up-token': 'step-token' } },
    );
  });

  it('update usa PATCH con el header de step-up', async () => {
    postMock.mockResolvedValueOnce({
      data: { accessToken: 'step-token', expiresAt: '2026-01-01T00:05:00.000Z' },
    });
    await platformOrganizationsService.requestStepUp('123456');

    patchMock.mockResolvedValue({ data: { ...sampleOrg, status: 'SUSPENDED' } });
    await platformOrganizationsService.update(1, { status: 'SUSPENDED' });

    expect(patchMock).toHaveBeenCalledWith(
      '/platform/organizations/1',
      { status: 'SUSPENDED' },
      { headers: { 'x-platform-step-up-token': 'step-token' } },
    );
  });
});
