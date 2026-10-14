import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OrganizationSwitcher from './OrganizationSwitcher'

const mocks = vi.hoisted(() => ({
  context: {
    organizations: [
      { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null, isPrimary: true },
      { id: 34, name: 'Hogar Sur', slug: 'hogar-sur', logoUrl: null, isPrimary: false },
    ],
    activeOrganization: { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null },
    selectionRequired: false,
    loaded: true,
    switchOrganization: vi.fn(),
  },
  reloadPage: vi.fn(),
}))

vi.mock('@/app/providers/SettingsContext', () => ({
  useOrganizationSettings: () => mocks.context,
}))
vi.mock('@/shared/lib/navigationUtils', () => ({ reloadPage: mocks.reloadPage }))

describe('OrganizationSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.context.organizations = [
      { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null, isPrimary: true },
      { id: 34, name: 'Hogar Sur', slug: 'hogar-sur', logoUrl: null, isPrimary: false },
    ]
    mocks.context.activeOrganization = { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null }
    mocks.context.switchOrganization.mockResolvedValue(mocks.context.organizations[1])
  })

  it('does not render when the user has one organization', () => {
    mocks.context.organizations = [mocks.context.organizations[0]]

    render(<OrganizationSwitcher />)

    expect(screen.queryByRole('combobox', { name: 'Cambiar organización' })).not.toBeInTheDocument()
  })

  it('switches the active organization and reloads the current data', async () => {
    render(<OrganizationSwitcher />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Cambiar organización' }), {
      target: { value: '34' },
    })

    await waitFor(() => {
      expect(mocks.context.switchOrganization).toHaveBeenCalledWith(34)
      expect(mocks.reloadPage).toHaveBeenCalledOnce()
    })
  })
})
