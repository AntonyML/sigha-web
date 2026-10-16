import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const { settingsMocks } = vi.hoisted(() => ({
  settingsMocks: {
    getPublicGlobalSettings: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/settingsService', () => ({ settingsService: settingsMocks }))
vi.mock('@/shared/ui/navigation/Navbar/UserMenu', () => ({ default: () => <span>Menú de usuario</span> }))
vi.mock('@/shared/ui/navigation/Navbar/MobileBottomNav', () => ({ default: () => <span>Navegación móvil</span> }))
vi.mock('@/shared/ui/navigation/Navbar/GlobalSearch', () => ({ default: () => <span>Búsqueda</span> }))
vi.mock('@/shared/ui/navigation/Navbar/NavbarDateTime', () => ({ default: () => <span>Fecha</span> }))
vi.mock('@/shared/ui/navigation/Navbar/NavbarBell', () => ({ default: () => <span>Notificaciones</span> }))
vi.mock('@/shared/ui/navigation/Navbar/OrganizationSwitcher', () => ({ default: () => <span>Organización activa</span> }))

import { PlatformBrandingProvider } from '@/app/providers/PlatformBrandingContext'
import Navbar from './Navbar'

describe('Navbar SaaS branding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settingsMocks.getPublicGlobalSettings.mockResolvedValue({
      appName: 'SIGHA Bienestar',
      logoUrl: 'https://cdn.example/sigha.png',
    })
  })

  it('muestra el branding global y conserva separado el selector de organización', async () => {
    const { container } = render(
      <PlatformBrandingProvider><Navbar /></PlatformBrandingProvider>,
    )

    expect(await screen.findAllByText('SIGHA Bienestar')).toHaveLength(2)
    expect(screen.getAllByText('Organización activa')).toHaveLength(2)
    const logos = container.querySelectorAll('.navbar-brand-image')
    expect(logos).toHaveLength(2)
    expect(Array.from(logos).every((logo) => (logo as HTMLImageElement).src.includes('sigha.png'))).toBe(true)
  })
})
