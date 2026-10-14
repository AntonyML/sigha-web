import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'

const { navigation } = vi.hoisted(() => ({
  navigation: {
    pathname: '/programs/view',
    router: {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router,
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

import { useNavigate, useParams } from '@/shared/navigation'
import { RouteSelectionProvider } from '@/shared/navigation/routeSelectionContext'

function ProgramDetailNavigation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!Number(id)) navigate('/programs')
  }, [id, navigate])

  return (
    <>
      <output data-testid="program-id">{id ?? ''}</output>
      <button onClick={() => navigate(`/programs/edit/${id}`)}>Editar</button>
    </>
  )
}

describe('navegación entre detalle y edición de programas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.pathname = '/programs/view'
    window.sessionStorage.clear()
    window.sessionStorage.setItem(
      'sigha-route-selection-v1',
      JSON.stringify({ '/programs/view': { id: '42' } }),
    )
  })

  afterEach(() => cleanup())

  it('conserva el id del detalle mientras navega a editar y no vuelve al listado', async () => {
    const user = userEvent.setup()
    const page = render(
      <RouteSelectionProvider>
        <ProgramDetailNavigation />
      </RouteSelectionProvider>,
    )

    expect(await screen.findByTestId('program-id')).toHaveTextContent('42')
    await user.click(screen.getByRole('button', { name: 'Editar' }))

    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/programs/edit'))
    expect(navigation.router.push).toHaveBeenCalledTimes(1)

    navigation.pathname = '/programs/edit'
    page.rerender(
      <RouteSelectionProvider>
        <ProgramDetailNavigation />
      </RouteSelectionProvider>,
    )

    expect(await screen.findByTestId('program-id')).toHaveTextContent('42')
    expect(navigation.router.push).toHaveBeenCalledTimes(1)
  })
})
