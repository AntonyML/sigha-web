import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const { settingsMocks } = vi.hoisted(() => ({
  settingsMocks: {
    getPublicGlobalSettings: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/settingsService', () => ({ settingsService: settingsMocks }))

import { PlatformBrandingProvider } from '@/app/providers/PlatformBrandingContext'
import { MarketingBrand, PlatformName } from './MarketingBrand'

describe('MarketingBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el nombre y el logo SaaS cargados desde configuraciones globales', async () => {
    settingsMocks.getPublicGlobalSettings.mockResolvedValue({
      appName: 'SIGHA Bienestar',
      logoUrl: 'https://cdn.example/sigha.png',
    })

    const { container } = render(
      <PlatformBrandingProvider>
        <>
          <MarketingBrand className="brand" />
          <span>© <PlatformName /></span>
        </>
      </PlatformBrandingProvider>,
    )

    expect(await screen.findByRole('link', { name: 'SIGHA Bienestar, inicio' })).toBeInTheDocument()
    expect(screen.getByText('© SIGHA Bienestar')).toBeInTheDocument()
    expect(container.querySelector('.brand-logo-image')).toHaveAttribute('src', 'https://cdn.example/sigha.png')
  })
})
