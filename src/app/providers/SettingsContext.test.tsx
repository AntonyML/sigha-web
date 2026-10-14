import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { authMocks, settingsMocks } = vi.hoisted(() => ({
  authMocks: {
    hasPendingOrganizationSelection: vi.fn(),
    getOrganizations: vi.fn(),
    getActiveOrganizationId: vi.fn(),
    switchActiveOrganization: vi.fn(),
  },
  settingsMocks: {
    getGeneralSettings: vi.fn(),
    getInterfaceSettings: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/authService', () => ({ authService: authMocks }))
vi.mock('@/infrastructure/api/services/settingsService', () => ({ settingsService: settingsMocks }))

import {
  SettingsProvider,
  useAppSettings,
  useOrganizationSettings,
} from './SettingsContext'

const clinicWithLogo = {
  id: 1,
  name: 'Clínica Roble',
  slug: 'clinica-roble',
  logoUrl: 'https://cdn.example/roble.png',
  isPrimary: true,
}

const clinicWithoutLogo = {
  id: 2,
  name: 'Centro del Valle',
  slug: 'centro-del-valle',
  logoUrl: null,
  isPrimary: false,
}

function SettingsProbe() {
  const settings = useAppSettings()
  const { activeOrganization, organizations, switchOrganization, updateActiveOrganization } = useOrganizationSettings()

  return (
    <div>
      <span data-testid="active-name">{activeOrganization?.name}</span>
      <span data-testid="active-logo">{settings.logoUrl || 'Sin logo activo'}</span>
      <span data-testid="app-name">{settings.appName}</span>
      <span data-testid="organization-list">{organizations.map((organization) => organization.name).join(', ')}</span>
      <button type="button" onClick={() => { void switchOrganization(2) }}>Cambiar organización</button>
      <button
        type="button"
        onClick={() => updateActiveOrganization({
          id: 1,
          name: 'Clínica Roble Norte',
          slug: 'clinica-roble',
          logoUrl: null,
        })}
      >
        Actualizar organización activa
      </button>
    </div>
  )
}

describe('SettingsContext — marca de la organización activa', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('authToken', 'test-token')
    localStorage.setItem('user', '{}')

    authMocks.hasPendingOrganizationSelection.mockReturnValue(false)
    authMocks.getOrganizations.mockResolvedValue([clinicWithLogo, clinicWithoutLogo])
    authMocks.getActiveOrganizationId.mockReturnValue(1)
    authMocks.switchActiveOrganization.mockResolvedValue({
      activeOrganization: clinicWithoutLogo,
      organizations: [clinicWithLogo, clinicWithoutLogo],
    })
    settingsMocks.getGeneralSettings.mockResolvedValue({
      appName: 'SIGHA global',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: 'https://cdn.example/global-logo.png',
    })
    settingsMocks.getInterfaceSettings.mockResolvedValue({
      theme: 'light',
      density: 'comfortable',
      typography: 'system-ui',
      brandColor: '#2563eb',
    })
  })

  it('no hereda el logo global ni el logo anterior al cambiar de organización', async () => {
    const user = userEvent.setup()
    render(<SettingsProvider><SettingsProbe /></SettingsProvider>)

    expect(await screen.findByTestId('active-name')).toHaveTextContent('Clínica Roble')
    expect(screen.getByTestId('active-logo')).toHaveTextContent('https://cdn.example/roble.png')

    await user.click(screen.getByRole('button', { name: 'Cambiar organización' }))

    await waitFor(() => expect(screen.getByTestId('active-name')).toHaveTextContent('Centro del Valle'))
    expect(screen.getByTestId('app-name')).toHaveTextContent('Centro del Valle')
    expect(screen.getByTestId('active-logo')).toHaveTextContent('Sin logo activo')
    expect(screen.getByTestId('active-logo')).not.toHaveTextContent('global-logo.png')
  })

  it('sincroniza el nombre/logo del contexto y el selector después de editar la organización activa', async () => {
    const user = userEvent.setup()
    render(<SettingsProvider><SettingsProbe /></SettingsProvider>)

    expect(await screen.findByTestId('active-name')).toHaveTextContent('Clínica Roble')
    await user.click(screen.getByRole('button', { name: 'Actualizar organización activa' }))

    expect(screen.getByTestId('active-name')).toHaveTextContent('Clínica Roble Norte')
    expect(screen.getByTestId('app-name')).toHaveTextContent('Clínica Roble Norte')
    expect(screen.getByTestId('active-logo')).toHaveTextContent('Sin logo activo')
    expect(screen.getByTestId('organization-list')).toHaveTextContent('Clínica Roble Norte, Centro del Valle')
    expect(document.title).toBe('Clínica Roble Norte')
  })
})
