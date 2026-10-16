import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const { settingsMocks } = vi.hoisted(() => ({
  settingsMocks: {
    getPublicGlobalSettings: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/settingsService', () => ({ settingsService: settingsMocks }))

import { PlatformBrandingProvider, usePlatformBranding } from './PlatformBrandingContext'

function BrandingProbe() {
  const { branding, loaded } = usePlatformBranding()

  return (
    <div>
      <span data-testid="platform-name">{branding.appName}</span>
      <span data-testid="platform-logo">{branding.logoUrl || 'Sin logo'}</span>
      <span data-testid="branding-loaded">{String(loaded)}</span>
    </div>
  )
}

describe('PlatformBrandingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settingsMocks.getPublicGlobalSettings.mockResolvedValue({
      appName: 'SIGHA Bienestar',
      logoUrl: 'https://cdn.example/sigha.png',
    })
  })

  it('carga la identidad SaaS desde la configuración global pública', async () => {
    render(<PlatformBrandingProvider><BrandingProbe /></PlatformBrandingProvider>)

    expect(await screen.findByTestId('platform-name')).toHaveTextContent('SIGHA Bienestar')
    expect(screen.getByTestId('platform-logo')).toHaveTextContent('https://cdn.example/sigha.png')
    expect(screen.getByTestId('branding-loaded')).toHaveTextContent('true')
    expect(settingsMocks.getPublicGlobalSettings).toHaveBeenCalledOnce()
  })

  it('mantiene una identidad de respaldo si falla la lectura pública', async () => {
    settingsMocks.getPublicGlobalSettings.mockRejectedValueOnce(new Error('API no disponible'))

    render(<PlatformBrandingProvider><BrandingProbe /></PlatformBrandingProvider>)

    expect(await screen.findByTestId('branding-loaded')).toHaveTextContent('true')
    expect(screen.getByTestId('platform-name')).toHaveTextContent('SIGHA')
    expect(screen.getByTestId('platform-logo')).toHaveTextContent('Sin logo')
  })
})
