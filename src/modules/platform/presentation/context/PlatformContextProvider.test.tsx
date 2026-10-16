import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { PlatformOrganization } from '@/shared/types/platform'

const serviceMock = vi.hoisted(() => ({
  list: vi.fn(),
}))

const authStorageMock = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getUser: vi.fn(),
  setActiveOrganization: vi.fn(),
  setAuthToken: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/infrastructure/api/services/platformOrganizationsService', () => ({
  platformOrganizationsService: serviceMock,
}))

vi.mock('@/infrastructure/storage/authStorage', () => ({
  authStorage: authStorageMock,
}))

import PlatformLayout from '@/app/(platform)/layout'
import PlatformHomePage from '@/app/(platform)/platform/page'
import {
  PlatformContextProvider,
  PlatformOrganizationSelector,
  usePlatformContext,
} from './PlatformContextProvider'

const makeOrg = (overrides: Partial<PlatformOrganization> = {}): PlatformOrganization => ({
  id: 1,
  name: 'Hogar San Pedro',
  slug: 'hogar-san-pedro',
  logoUrl: null,
  status: 'ACTIVE',
  planTier: 'BASIC',
  isActive: true,
  brandingOverrides: null,
  memberCount: 4,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('PlatformContextProvider + PlatformLayout + PlatformHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStorageMock.isAuthenticated.mockReturnValue(true)
    authStorageMock.getUser.mockReturnValue({
      id: 1,
      uEmail: 'owner@sigha.test',
      uName: 'Platform Owner',
      roles: [],
      roleIds: [],
      platformRole: 'PLATFORM_OWNER',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('monta el selector en PlatformLayout y actualiza en memoria el panel de resumen en /platform sin tocar la sesión/tenant', async () => {
    const orgs: PlatformOrganization[] = [
      makeOrg({ id: 1, name: 'Hogar San Pedro', status: 'ACTIVE', planTier: 'BASIC' }),
      makeOrg({
        id: 2,
        name: 'Residencia Santa Clara',
        slug: 'residencia-santa-clara',
        status: 'SUSPENDED',
        planTier: 'ENTERPRISE',
      }),
    ]
    serviceMock.list.mockResolvedValue(orgs)

    render(
      <PlatformLayout>
        <PlatformHomePage />
      </PlatformLayout>,
    )

    const selector = await screen.findByLabelText('Organización inspeccionada')
    await waitFor(() => expect(selector).toHaveValue('1'))

    expect(screen.getByTestId('inspected-org-name')).toHaveTextContent('Hogar San Pedro')
    expect(screen.getByTestId('inspected-org-status')).toHaveTextContent('Activa (ACTIVE)')
    expect(screen.getByTestId('inspected-org-plan')).toHaveTextContent('BASIC')

    fireEvent.change(selector, { target: { value: '2' } })

    expect(selector).toHaveValue('2')
    expect(screen.getByTestId('inspected-org-name')).toHaveTextContent('Residencia Santa Clara')
    expect(screen.getByTestId('inspected-org-status')).toHaveTextContent('Suspendida (SUSPENDED)')
    expect(screen.getByTestId('inspected-org-plan')).toHaveTextContent('ENTERPRISE')

    expect(authStorageMock.setActiveOrganization).not.toHaveBeenCalled()
    expect(authStorageMock.setAuthToken).not.toHaveBeenCalled()
  })

  it('muestra mensaje vacío de solo lectura cuando no hay organizaciones registradas', async () => {
    serviceMock.list.mockResolvedValue([])

    render(
      <PlatformContextProvider>
        <PlatformOrganizationSelector />
        <PlatformHomePage />
      </PlatformContextProvider>,
    )

    expect(
      await screen.findByText(
        'Selecciona una organización en la barra superior para consultar su resumen.',
      ),
    ).toBeInTheDocument()
    const selector = screen.getByLabelText('Organización inspeccionada')
    expect(selector).toBeDisabled()
  })

  it('muestra error cuando falla la carga de organizaciones de plataforma', async () => {
    serviceMock.list.mockRejectedValue({
      response: { data: { message: 'Servicio de plataforma no disponible' } },
    })

    render(
      <PlatformContextProvider>
        <PlatformOrganizationSelector />
        <PlatformHomePage />
      </PlatformContextProvider>,
    )

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThanOrEqual(1)
    expect(alerts[0]).toHaveTextContent('Servicio de plataforma no disponible')
  })

  it('lanza error descriptivo si usePlatformContext se invoca fuera de PlatformContextProvider', () => {
    function OrphanConsumer() {
      usePlatformContext()
      return null
    }

    expect(() => render(<OrphanConsumer />)).toThrow(
      'usePlatformContext debe usarse dentro de un PlatformContextProvider',
    )
  })
})
