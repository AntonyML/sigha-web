import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OrganizationPickerPage from './OrganizationPickerPage'

const mocks = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn() },
  authService: {
    isAuthenticated: vi.fn(),
    getOrganizations: vi.fn(),
    getActiveOrganizationId: vi.fn(),
    switchActiveOrganization: vi.fn(),
    clearLocalSession: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router,
}))
vi.mock('@/infrastructure/api/services/authService', () => ({ authService: mocks.authService }))

const organizations = [
  { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null, isPrimary: true },
  { id: 34, name: 'Hogar Sur', slug: 'hogar-sur', logoUrl: null, isPrimary: false },
]

describe('OrganizationPickerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState({}, '', '/')
    mocks.authService.isAuthenticated.mockReturnValue(true)
    mocks.authService.getOrganizations.mockResolvedValue(organizations)
    mocks.authService.getActiveOrganizationId.mockReturnValue(12)
    mocks.authService.switchActiveOrganization.mockResolvedValue({ activeOrganization: organizations[1] })
  })

  it('carga y muestra las organizaciones del usuario', async () => {
    render(<OrganizationPickerPage />)

    expect(await screen.findByRole('button', { name: /Hogar Norte/ })).toBeVisible()
    expect(screen.getByRole('button', { name: /Hogar Sur/ })).toBeVisible()
    expect(mocks.authService.getOrganizations).toHaveBeenCalledOnce()
  })

  it('continúa directamente cuando la única organización ya está activa en el token', async () => {
    mocks.authService.getOrganizations.mockResolvedValue([organizations[0]])
    mocks.authService.getActiveOrganizationId.mockReturnValue(12)

    render(<OrganizationPickerPage />)

    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/dashboard'))
  })

  it('mantiene el picker tras un 403 aunque la única organización ya esté activa', async () => {
    window.history.replaceState({}, '', '/seleccionar-organizacion?reason=access-denied')
    mocks.authService.getOrganizations.mockResolvedValue([organizations[0]])
    mocks.authService.getActiveOrganizationId.mockReturnValue(12)

    render(<OrganizationPickerPage />)

    expect(await screen.findByText('La API rechazó el acceso actual. Selecciona de nuevo una organización para continuar.')).toBeVisible()
    expect(mocks.router.replace).not.toHaveBeenCalledWith('/dashboard')
    expect(screen.getByRole('button', { name: /Hogar Norte/ })).toBeVisible()
  })

  it('activa la organización elegida antes de continuar', async () => {
    render(<OrganizationPickerPage />)

    fireEvent.click(await screen.findByRole('button', { name: /Hogar Sur/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(mocks.authService.switchActiveOrganization).toHaveBeenCalledWith(34)
      expect(mocks.router.replace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('bloquea el acceso cuando el usuario no tiene organizaciones', async () => {
    mocks.authService.getOrganizations.mockResolvedValue([])
    render(<OrganizationPickerPage />)

    expect(await screen.findByText('Sin organización asignada', { exact: true })).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent('no tiene una organización asignada')
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument()
  })

  it('distingue un error de API de una cuenta sin organizaciones', async () => {
    mocks.authService.getOrganizations.mockRejectedValue(new Error('forbidden'))
    render(<OrganizationPickerPage />)

    expect(await screen.findByText('No se pudieron cargar las organizaciones', { exact: true })).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar tus organizaciones')
  })
})
