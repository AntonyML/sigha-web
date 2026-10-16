import { describe, it, expect, vi, beforeEach } from 'vitest';

const { instance, getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => {
  const getMock = vi.fn();
  const postMock = vi.fn();
  const patchMock = vi.fn();
  const deleteMock = vi.fn();
  const instance = {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
    interceptors: { request: { use: vi.fn() } },
  };
  return { instance, getMock, postMock, patchMock, deleteMock };
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

const sampleMember = {
  userId: 10,
  name: 'Ana Rojas',
  email: 'ana@ejemplo.test',
  roleId: 2,
  roleName: 'admin',
  isPrimary: true,
  joinedAt: '2026-01-01T00:00:00.000Z',
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

  it('listMembers consulta GET /platform/organizations/:id/members', async () => {
    getMock.mockResolvedValue({ data: [sampleMember] });
    const result = await platformOrganizationsService.listMembers(1);
    expect(getMock).toHaveBeenCalledWith('/platform/organizations/1/members');
    expect(result).toEqual([sampleMember]);
  });

  it('addMember, updateMemberRole y removeMember envían x-platform-step-up-token cuando está activo', async () => {
    postMock.mockResolvedValueOnce({
      data: { accessToken: 'step-token', expiresAt: '2026-01-01T00:05:00.000Z' },
    });
    await platformOrganizationsService.requestStepUp('123456');

    postMock.mockResolvedValueOnce({ data: sampleMember });
    const created = await platformOrganizationsService.addMember(1, { userId: 10, roleId: 2 });
    expect(postMock).toHaveBeenLastCalledWith(
      '/platform/organizations/1/members',
      { userId: 10, roleId: 2 },
      { headers: { 'x-platform-step-up-token': 'step-token' } },
    );
    expect(created).toEqual(sampleMember);

    patchMock.mockResolvedValueOnce({ data: { ...sampleMember, roleId: 3, roleName: 'enfermeria' } });
    const updated = await platformOrganizationsService.updateMemberRole(1, 10, { roleId: 3 });
    expect(patchMock).toHaveBeenLastCalledWith(
      '/platform/organizations/1/members/10',
      { roleId: 3 },
      { headers: { 'x-platform-step-up-token': 'step-token' } },
    );
    expect(updated.roleId).toBe(3);

    deleteMock.mockResolvedValueOnce({ data: { removed: true, promotedUserId: 10 } });
    const removed = await platformOrganizationsService.removeMember(1, 10);
    expect(deleteMock).toHaveBeenLastCalledWith('/platform/organizations/1/members/10', {
      headers: { 'x-platform-step-up-token': 'step-token' },
    });
    expect(removed).toEqual({ removed: true, promotedUserId: 10 });
  });
});
