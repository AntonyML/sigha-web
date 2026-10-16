import { beforeEach, describe, expect, it, vi } from 'vitest'

const { httpMocks } = vi.hoisted(() => ({
  httpMocks: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: httpMocks,
}))

import { settingsService } from './settingsService'

describe('settingsService global settings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lee el nombre y logo públicos de la plataforma sin step-up', async () => {
    const branding = { appName: 'SIGHA Bienestar', logoUrl: 'https://cdn.example/sigha.png' }
    httpMocks.get.mockResolvedValueOnce({ data: branding })

    await expect(settingsService.getPublicGlobalSettings()).resolves.toEqual(branding)
    expect(httpMocks.get).toHaveBeenCalledWith('/settings/global/public')
  })

  it('verifica el código TOTP en el endpoint de step-up', async () => {
    const grant = { accessToken: 'temporary-token', expiresAt: '2026-10-14T20:00:00.000Z' }
    httpMocks.post.mockResolvedValueOnce({ data: grant })

    await expect(settingsService.verifyGlobalSettingsAccess('012345')).resolves.toEqual(grant)
    expect(httpMocks.post).toHaveBeenCalledWith('/settings/global/verify-2fa', { twoFactorCode: '012345' })
  })

  it('adjunta el token temporal a la lectura y actualización globales', async () => {
    const settings = { appName: 'SIGHA', logoUrl: null }
    httpMocks.get.mockResolvedValueOnce({ data: { id: 4, category: 'global', settings } })
    httpMocks.put.mockResolvedValueOnce({ data: { id: 4, category: 'global', settings } })

    await expect(settingsService.getGlobalSettings('temporary-token')).resolves.toEqual(settings)
    await expect(settingsService.updateGlobalSettings('temporary-token', { appName: 'SIGHA' })).resolves.toEqual(settings)

    expect(httpMocks.get).toHaveBeenCalledWith('/settings/global', {
      headers: { 'x-global-settings-token': 'temporary-token' },
    })
    expect(httpMocks.put).toHaveBeenCalledWith('/settings/global', { appName: 'SIGHA' }, {
      headers: { 'x-global-settings-token': 'temporary-token' },
    })
  })

  it('adjunta el token temporal a la carga de logo global', async () => {
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    httpMocks.post.mockResolvedValueOnce({ data: { logoUrl: 'https://cdn.example/logo.png' } })

    await expect(settingsService.uploadGlobalLogo('temporary-token', file)).resolves.toEqual({
      logoUrl: 'https://cdn.example/logo.png',
    })

    const [url, formData, options] = httpMocks.post.mock.calls[0]
    expect(url).toBe('/settings/global/logo')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('file')).toBe(file)
    expect(options.headers).toEqual({
      'Content-Type': undefined,
      'x-global-settings-token': 'temporary-token',
    })
  })
})
