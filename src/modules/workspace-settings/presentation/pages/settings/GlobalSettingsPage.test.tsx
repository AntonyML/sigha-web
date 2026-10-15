import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { settingsMocks, routerMock } = vi.hoisted(() => ({
  settingsMocks: {
    verifyGlobalSettingsAccess: vi.fn(),
    getGlobalSettings: vi.fn(),
    updateGlobalSettings: vi.fn(),
    uploadGlobalLogo: vi.fn(),
  },
  routerMock: { replace: vi.fn() },
}))

let isLoaded = true
let isAdmin = true
let isSuperAdmin = false

vi.mock('@/infrastructure/api/services/settingsService', () => ({
  settingsService: settingsMocks,
}))

vi.mock('@/shared/lib/permissionUtils', () => ({
  usePermissions: () => ({
    isLoaded,
    isAdminSync: () => isAdmin,
    isSuperAdminSync: () => isSuperAdmin,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}))

import GlobalSettingsPage from './GlobalSettingsPage'

describe('GlobalSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isLoaded = true
    isAdmin = true
    isSuperAdmin = false
    settingsMocks.verifyGlobalSettingsAccess.mockResolvedValue({
      accessToken: 'short-lived-step-up-token',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    settingsMocks.getGlobalSettings.mockResolvedValue({ appName: 'SIGHA', logoUrl: null })
    settingsMocks.updateGlobalSettings.mockResolvedValue({ appName: 'SIGHA Institucional', logoUrl: null })
    settingsMocks.uploadGlobalLogo.mockResolvedValue({ logoUrl: 'https://cdn.example/global-logo.png' })
  })

  it('redirige a personas que no son administradoras y no solicita 2FA', async () => {
    isAdmin = false
    isSuperAdmin = false
    render(<GlobalSettingsPage />)

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/settings'))
    expect(screen.queryByRole('heading', { name: 'Configuraciones Globales' })).not.toBeInTheDocument()
    expect(settingsMocks.verifyGlobalSettingsAccess).not.toHaveBeenCalled()
  })

  it('pide un TOTP antes de cargar la identidad global', async () => {
    const user = userEvent.setup()
    render(<GlobalSettingsPage />)

    expect(await screen.findByRole('heading', { name: 'Confirma tu identidad' })).toBeInTheDocument()
    expect(screen.getByText(/los códigos de recuperación no abren esta sección/)).toBeInTheDocument()
    expect(settingsMocks.getGlobalSettings).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Código de autenticación'), '123456')
    await user.click(screen.getByRole('button', { name: /Verificar y continuar/ }))

    expect(await screen.findByRole('heading', { name: 'Identidad de SIGHA' })).toBeInTheDocument()
    expect(settingsMocks.verifyGlobalSettingsAccess).toHaveBeenCalledWith('123456')
    expect(settingsMocks.getGlobalSettings).toHaveBeenCalledWith('short-lived-step-up-token')
    expect(screen.getByLabelText('Nombre de la plataforma')).toHaveValue('SIGHA')
    expect(screen.getByText(/El nombre y el logo de cada organización se administran por separado/)).toBeInTheDocument()
    expect(window.localStorage.getItem('global-settings-step-up-token')).toBeNull()
  })

  it('muestra el error de 2FA y mantiene cerrada la sección si el TOTP es inválido', async () => {
    settingsMocks.verifyGlobalSettingsAccess.mockRejectedValueOnce(new Error('Código inválido'))
    const user = userEvent.setup()
    render(<GlobalSettingsPage />)

    await user.type(await screen.findByLabelText('Código de autenticación'), '654321')
    await user.click(screen.getByRole('button', { name: /Verificar y continuar/ }))

    expect(await screen.findByText('Código inválido')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Confirma tu identidad' })).toBeInTheDocument()
    expect(settingsMocks.getGlobalSettings).not.toHaveBeenCalled()
  })

  it('guarda el nombre usando el token temporal y permite bloquear la sección', async () => {
    const user = userEvent.setup()
    render(<GlobalSettingsPage />)
    await user.type(await screen.findByLabelText('Código de autenticación'), '123456')
    await user.click(screen.getByRole('button', { name: /Verificar y continuar/ }))

    const nameInput = await screen.findByLabelText('Nombre de la plataforma')
    await user.clear(nameInput)
    await user.type(nameInput, 'SIGHA Institucional')
    await user.click(screen.getByRole('button', { name: /Guardar nombre/ }))

    await waitFor(() => expect(settingsMocks.updateGlobalSettings).toHaveBeenCalledWith(
      'short-lived-step-up-token',
      { appName: 'SIGHA Institucional' },
    ))
    expect(await screen.findByText('La identidad global de la plataforma se guardó correctamente.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bloquear ahora' }))
    expect(await screen.findByRole('heading', { name: 'Confirma tu identidad' })).toBeInTheDocument()
  })

  it('envía el archivo de logo por la operación global protegida', async () => {
    const user = userEvent.setup()
    render(<GlobalSettingsPage />)
    await user.type(await screen.findByLabelText('Código de autenticación'), '123456')
    await user.click(screen.getByRole('button', { name: /Verificar y continuar/ }))

    const logoInput = await screen.findByLabelText('Logo global')
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await user.upload(logoInput, file)

    await waitFor(() => expect(settingsMocks.uploadGlobalLogo).toHaveBeenCalledWith('short-lived-step-up-token', file))
    expect(await screen.findByRole('img', { name: 'Logo global de SIGHA' })).toHaveAttribute('src', 'https://cdn.example/global-logo.png')
  })
})
