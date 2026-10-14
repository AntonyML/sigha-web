import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getMock, patchMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    get: getMock,
    patch: patchMock,
    post: postMock,
  },
}));

import { organizationsService } from '@/infrastructure/api/services/organizationsService';

describe('organizationsService — contrato congelado T2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCurrent usa GET /organizations/current y devuelve la org activa', async () => {
    getMock.mockResolvedValue({
      data: { id: 1, name: 'ASOPOGUA', slug: 'asopogua', logoUrl: null },
    });
    const org = await organizationsService.getCurrent();
    expect(getMock).toHaveBeenCalledWith('/organizations/current');
    expect(org).toEqual({ id: 1, name: 'ASOPOGUA', slug: 'asopogua', logoUrl: null });
  });

  it('updateCurrent usa PATCH /organizations/current con el nombre', async () => {
    patchMock.mockResolvedValue({
      data: { id: 1, name: 'Nuevo nombre', slug: 'asopogua', logoUrl: null },
    });
    const org = await organizationsService.updateCurrent('Nuevo nombre');
    expect(patchMock).toHaveBeenCalledWith('/organizations/current', { name: 'Nuevo nombre' });
    expect(org.name).toBe('Nuevo nombre');
  });

  it('uploadLogo envía multipart a POST /organizations/current/logo', async () => {
    postMock.mockResolvedValue({
      data: { id: 1, name: 'ASOPOGUA', slug: 'asopogua', logoUrl: 'https://cdn/logo.png' },
    });
    const file = new File(['bytes'], 'logo.png', { type: 'image/png' });
    const org = await organizationsService.uploadLogo(file);
    expect(postMock).toHaveBeenCalledTimes(1);
    const [url, formData] = postMock.mock.calls[0];
    expect(url).toBe('/organizations/current/logo');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('file')).toBe(file);
    expect(org.logoUrl).toBe('https://cdn/logo.png');
  });
});
