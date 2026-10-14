import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { settingsMocks, navigateMock, updateGeneralMock } = vi.hoisted(() => ({
  settingsMocks: {
    getGeneralSettings: vi.fn(),
    updateGeneralSettings: vi.fn(),
    uploadLogo: vi.fn(),
  },
  navigateMock: vi.fn(),
  updateGeneralMock: vi.fn(),
}))

let canEdit = true
let canAccess = true

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
  }),
}))

vi.mock('@/app/providers/SettingsContext', () => ({
  useGeneralSettingsUpdate: () => updateGeneralMock,
}))

import GeneralSettingsPage from './GeneralSettingsPage'

describe('GeneralSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canEdit = true
    canAccess = true
    settingsMocks.getGeneralSettings.mockResolvedValue({
      appName: 'ASOPOGUA',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: '',
    })
  })

  it('presenta los ajustes con los componentes y la vista previa de identidad', async () => {
    render(<GeneralSettingsPage />)

    expect(await screen.findByRole('heading', { name: 'Configuración general' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de la aplicación')).toHaveValue('ASOPOGUA')
    expect(screen.getByLabelText('Idioma')).toHaveValue('es')
    expect(screen.getByLabelText('Zona horaria')).toHaveValue('America/Costa_Rica')
    expect(screen.getByText('Vista previa')).toBeInTheDocument()
    expect(screen.getByText('ASOPOGUA')).toBeInTheDocument()
    expect(screen.getByText('Sin logo')).toBeInTheDocument()
  })

  it('guarda los valores y actualiza la configuración compartida', async () => {
    const user = userEvent.setup()
    settingsMocks.updateGeneralSettings.mockResolvedValue({ logoUrl: '' })
    render(<GeneralSettingsPage />)

    const appName = await screen.findByLabelText('Nombre de la aplicación')
    await user.clear(appName)
    await user.type(appName, 'Centro SIGHA')
    await user.click(screen.getByRole('button', { name: /Guardar cambios/ }))

    await waitFor(() => expect(settingsMocks.updateGeneralSettings).toHaveBeenCalledWith({
      appName: 'Centro SIGHA',
      language: 'es',
      timezone: 'America/Costa_Rica',
      logoUrl: '',
    }))
    expect(updateGeneralMock).toHaveBeenCalledWith({
      appName: 'Centro SIGHA',
      logoUrl: '',
      timezone: 'America/Costa_Rica',
    })
    expect(await screen.findByText('Configuración guardada correctamente.')).toBeInTheDocument()
  })

  it('carga el logo y lo refleja en la previsualización', async () => {
    const user = userEvent.setup()
    settingsMocks.uploadLogo.mockResolvedValue({ logoUrl: 'https://cdn.example/logo.png' })
    render(<GeneralSettingsPage />)

    await screen.findByLabelText('Nombre de la aplicación')
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Seleccionar logo'), file)

    await waitFor(() => expect(settingsMocks.uploadLogo).toHaveBeenCalledWith(file))
    expect(await screen.findByAltText('Logo de ASOPOGUA')).toHaveAttribute('src', 'https://cdn.example/logo.png')
    expect(updateGeneralMock).toHaveBeenCalledWith({
      appName: 'ASOPOGUA',
      logoUrl: 'https://cdn.example/logo.png',
      timezone: 'America/Costa_Rica',
    })
    expect(await screen.findByText('Logo subido correctamente.')).toBeInTheDocument()
  })

  it('mantiene los controles en solo lectura cuando no hay permiso de edición', async () => {
    canEdit = false
    render(<GeneralSettingsPage />)

    expect(await screen.findByText('Solo lectura')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de la aplicación')).toBeDisabled()
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeDisabled()
  })

  it('redirige al centro de configuración si el usuario no tiene acceso', async () => {
    canAccess = false
    render(<GeneralSettingsPage />)

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/settings'))
    expect(settingsMocks.getGeneralSettings).not.toHaveBeenCalled()
  })
})
