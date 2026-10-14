import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { settingsMocks, navigateMock, updateGeneralMock, organizationSettingsMock } = vi.hoisted(() => ({
  settingsMocks: {
    getGeneralSettings: vi.fn(),
    updateGeneralSettings: vi.fn(),
  },
  navigateMock: vi.fn(),
  updateGeneralMock: vi.fn(),
  organizationSettingsMock: {
    activeOrganization: {
      id: 7,
      name: 'Clínica Roble',
      slug: 'clinica-roble',
      logoUrl: 'https://cdn.example/org-logo.png',
    },
    loaded: true,
  },
}))

let canEdit = true
let canAccess = true
let canManageOrganization = true

vi.mock('@/infrastructure/api/services/settingsService', () => ({
  settingsService: settingsMocks,
}))

vi.mock('@/shared/navigation', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('@/shared/lib/permissionUtils', () => ({
  PermissionUtils: { canAccessModule: () => canAccess },
  usePermissions: () => ({
    isLoaded: true,
    canPerformAction: () => canEdit,
    isAdminOrDirectorSync: () => canManageOrganization,
  }),
}))

vi.mock('@/app/providers/SettingsContext', () => ({
  useAppSettings: () => ({ appName: 'Clínica Roble', logoUrl: 'https://cdn.example/org-logo.png', timezone: 'America/Costa_Rica' }),
  useGeneralSettingsUpdate: () => updateGeneralMock,
  useOrganizationSettings: () => organizationSettingsMock,
}))

import GeneralSettingsPage from './GeneralSettingsPage'

describe('GeneralSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canEdit = true
    canAccess = true
    canManageOrganization = true
    settingsMocks.getGeneralSettings.mockResolvedValue({
      appName: 'SIGHA global',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: 'https://cdn.example/global-logo.png',
    })
  })

  it('separa las preferencias del sistema de la identidad de la organización activa', async () => {
    render(<GeneralSettingsPage />)

    expect(await screen.findByRole('heading', { name: 'Configuración general' })).toBeInTheDocument()
    expect(screen.getByLabelText('Idioma')).toHaveValue('es')
    expect(screen.getByLabelText('Zona horaria')).toHaveValue('America/Costa_Rica')
    expect(screen.getByRole('heading', { name: 'Organización activa' })).toBeInTheDocument()
    expect(screen.getByText('Clínica Roble')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Logo de Clínica Roble' })).toHaveAttribute('src', 'https://cdn.example/org-logo.png')
    expect(screen.getByText('Cambiar esta identidad no modifica SIGHA ni las demás organizaciones.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre de la aplicación')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Seleccionar logo')).not.toBeInTheDocument()
  })

  it('guarda idioma/zona horaria y conserva la identidad global sin aplicarla al espacio activo', async () => {
    const user = userEvent.setup()
    settingsMocks.updateGeneralSettings.mockResolvedValue({
      appName: 'SIGHA global',
      language: 'es',
      timezone: 'UTC',
      logoUrl: 'https://cdn.example/global-logo.png',
    })
    render(<GeneralSettingsPage />)

    await screen.findByRole('heading', { name: 'Organización activa' })
    await user.selectOptions(screen.getByLabelText('Zona horaria'), 'UTC')
    await user.click(screen.getByRole('button', { name: /Guardar preferencias/ }))

    await waitFor(() => expect(settingsMocks.updateGeneralSettings).toHaveBeenCalledWith({
      appName: 'SIGHA global',
      language: 'es',
      timezone: 'UTC',
      logoUrl: 'https://cdn.example/global-logo.png',
    }))
    expect(updateGeneralMock).toHaveBeenCalledWith({
      appName: 'Clínica Roble',
      logoUrl: 'https://cdn.example/org-logo.png',
      timezone: 'UTC',
    })
    expect(await screen.findByText('Preferencias guardadas correctamente.')).toBeInTheDocument()
  })

  it('enlaza la edición de nombre y logo a los ajustes de la organización', async () => {
    const user = userEvent.setup()
    render(<GeneralSettingsPage />)

    await user.click(await screen.findByRole('button', { name: 'Administrar nombre y logo' }))

    expect(navigateMock).toHaveBeenCalledWith('/settings/organization')
    expect(settingsMocks.updateGeneralSettings).not.toHaveBeenCalled()
  })

  it('mantiene las preferencias en solo lectura cuando no hay permiso de edición', async () => {
    canEdit = false
    render(<GeneralSettingsPage />)

    expect(await screen.findByText('Solo lectura')).toBeInTheDocument()
    expect(screen.getByLabelText('Zona horaria')).toBeDisabled()
    expect(screen.getByRole('button', { name: /Guardar preferencias/ })).toBeDisabled()
  })

  it('deshabilita el guardado si no se pudieron cargar los valores globales que debe preservar', async () => {
    settingsMocks.getGeneralSettings.mockRejectedValueOnce(new Error('offline'))
    render(<GeneralSettingsPage />)

    expect(await screen.findByText(/No se pudieron cargar las preferencias generales/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar preferencias/ })).toBeDisabled()
    expect(settingsMocks.updateGeneralSettings).not.toHaveBeenCalled()
  })

  it('inicializa preferencias ausentes con la marca oficial de SIGHA, no con la de una organización', async () => {
    const user = userEvent.setup()
    settingsMocks.getGeneralSettings.mockRejectedValueOnce({ response: { status: 404 } })
    settingsMocks.updateGeneralSettings.mockResolvedValue({
      appName: 'SIGHA',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: '',
    })
    render(<GeneralSettingsPage />)

    expect(await screen.findByText(/Aún no hay preferencias generales guardadas/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Guardar preferencias/ }))

    await waitFor(() => expect(settingsMocks.updateGeneralSettings).toHaveBeenCalledWith({
      appName: 'SIGHA',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: '',
    }))
  })

  it('redirige al centro de configuración si el usuario no tiene acceso', async () => {
    canAccess = false
    render(<GeneralSettingsPage />)

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/settings'))
    expect(settingsMocks.getGeneralSettings).not.toHaveBeenCalled()
  })
})
