import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

let isLoaded = true
let isAdmin = false
let isSuperAdmin = false

vi.mock('@/shared/lib/permissionUtils', () => ({
  usePermissions: () => ({
    isLoaded,
    isAdminSync: () => isAdmin,
    isSuperAdminSync: () => isSuperAdmin,
  }),
}))

import SettingsHubPage from './SettingsHubPage'

describe('SettingsHubPage', () => {
  beforeEach(() => {
    isLoaded = true
    isAdmin = false
    isSuperAdmin = false
  })

  it('presenta la identidad general como propia de la organización activa', () => {
    render(<SettingsHubPage />)

    const generalLink = screen.getByRole('link', { name: /General/ })
    expect(within(generalLink).getByText('Identidad por organización')).toBeInTheDocument()
    expect(generalLink).toHaveAttribute('href', '/settings/general')
  })

  it('muestra Configuraciones Globales a un administrador', () => {
    isAdmin = true
    render(<SettingsHubPage />)

    const globalLink = screen.getByRole('link', { name: /Configuraciones Globales/ })
    expect(globalLink).toHaveAttribute('href', '/settings/global')
    expect(within(globalLink).getByText('Código 2FA')).toBeInTheDocument()
  })

  it('muestra Configuraciones Globales a un superadministrador', () => {
    isSuperAdmin = true
    render(<SettingsHubPage />)

    expect(screen.getByRole('link', { name: /Configuraciones Globales/ })).toBeInTheDocument()
  })

  it('oculta Configuraciones Globales a otros roles y mientras aún carga el perfil', () => {
    const { rerender } = render(<SettingsHubPage />)
    expect(screen.queryByRole('link', { name: /Configuraciones Globales/ })).not.toBeInTheDocument()

    isLoaded = false
    isAdmin = true
    rerender(<SettingsHubPage />)
    expect(screen.queryByRole('link', { name: /Configuraciones Globales/ })).not.toBeInTheDocument()
  })
})
