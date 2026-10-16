import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const { settingsMocks } = vi.hoisted(() => ({
  settingsMocks: {
    getPublicGlobalSettings: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/settingsService', () => ({ settingsService: settingsMocks }))

import { PlatformBrandingProvider } from '@/app/providers/PlatformBrandingContext'
import { PlatformLogo } from './PlatformLogo'

describe('PlatformLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra la imagen SaaS pública y su nombre accesible', async () => {
    settingsMocks.getPublicGlobalSettings.mockResolvedValue({
      appName: 'SIGHA Bienestar',
      logoUrl: 'https://cdn.example/sigha.png',
    })

    render(
      <PlatformBrandingProvider>
        <PlatformLogo className="logo" imageClassName="logo-image" label="Logo SIGHA Bienestar" />
      </PlatformBrandingProvider>,
    )

    const logo = await screen.findByRole('img', { name: 'Logo SIGHA Bienestar' })
    expect(logo.querySelector('img')).toHaveAttribute('src', 'https://cdn.example/sigha.png')
  })

  it('usa la inicial del nombre si no hay logo global', async () => {
    settingsMocks.getPublicGlobalSettings.mockResolvedValue({ appName: 'Marea', logoUrl: null })

    render(
      <PlatformBrandingProvider>
        <PlatformLogo className="logo" fallbackClassName="logo-fallback" label="Logo Marea" />
      </PlatformBrandingProvider>,
    )

    expect(await screen.findByRole('img', { name: 'Logo Marea' })).toHaveTextContent('M')
  })
})
