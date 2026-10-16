import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const { serviceMock, authStorageMock } = vi.hoisted(() => ({
  serviceMock: {
    listMembers: vi.fn(),
    addMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    requestStepUp: vi.fn(),
    hasStepUpToken: vi.fn(),
    clearStepUpToken: vi.fn(),
  },
  authStorageMock: {
    getUser: vi.fn(),
  },
}))

vi.mock('@/infrastructure/api/services/platformOrganizationsService', () => ({
  platformOrganizationsService: serviceMock,
}))

vi.mock('@/infrastructure/storage/authStorage', () => ({
  authStorage: authStorageMock,
}))

import PlatformOrganizationMembersSection from './PlatformOrganizationMembersSection'

const sampleMembers = [
  {
    userId: 10,
    name: 'Ana Rojas',
    email: 'ana@ejemplo.test',
    roleId: 2,
    roleName: 'admin',
    isPrimary: true,
    joinedAt: '2026-01-10T12:00:00.000Z',
  },
  {
    userId: 20,
    name: 'Carlos Mora',
    email: 'carlos@ejemplo.test',
    roleId: 3,
    roleName: 'enfermeria',
    isPrimary: false,
    joinedAt: '2026-02-01T15:30:00.000Z',
  },
]

describe('PlatformOrganizationMembersSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStorageMock.getUser.mockReturnValue({
      id: '1',
      email: 'owner@sigha.test',
      name: 'Owner',
      role: 'admin',
      platformRole: 'PLATFORM_OWNER',
    })
    serviceMock.hasStepUpToken.mockReturnValue(true)
    serviceMock.listMembers.mockResolvedValue(sampleMembers)
  })
  afterEach(() => vi.clearAllMocks())

  it('lista las membresías de la organización y no rotula joinedAt como fecha de ingreso', async () => {
    render(<PlatformOrganizationMembersSection organizationId={1} initialMemberCount={2} />)

    expect(await screen.findByText('Ana Rojas')).toBeInTheDocument()
    expect(screen.getByText('Carlos Mora')).toBeInTheDocument()
    expect(serviceMock.listMembers).toHaveBeenCalledWith(1)
    expect(screen.getByText('Primaria')).toBeInTheDocument()
    expect(screen.getByText('Secundaria')).toBeInTheDocument()
    expect(screen.getByText('Cuenta creada')).toBeInTheDocument()
    expect(screen.queryByText(/fecha de ingreso/i)).not.toBeInTheDocument()
  })

  it('muestra los controles de alta, cambio de rol y baja cuando platformRole es PLATFORM_OWNER', async () => {
    render(<PlatformOrganizationMembersSection organizationId={1} />)

    expect(await screen.findByText('Ana Rojas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir miembro' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cambiar rol' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Quitar' })).toHaveLength(2)
  })

  it('oculta los controles de alta, cambio de rol y baja cuando platformRole es PLATFORM_SUPPORT', async () => {
    authStorageMock.getUser.mockReturnValue({
      id: '2',
      email: 'support@sigha.test',
      name: 'Support',
      role: 'admin',
      platformRole: 'PLATFORM_SUPPORT',
    })

    render(<PlatformOrganizationMembersSection organizationId={1} />)

    expect(await screen.findByText('Ana Rojas')).toBeInTheDocument()
    expect(screen.getByText('Carlos Mora')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir miembro' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cambiar rol' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quitar' })).not.toBeInTheDocument()
    expect(screen.queryByText('Verificación 2FA')).not.toBeInTheDocument()
  })

  it('añade un miembro solicitando step-up 2FA cuando no hay token activo', async () => {
    serviceMock.hasStepUpToken.mockReturnValue(false)
    serviceMock.requestStepUp.mockResolvedValue({
      accessToken: 'step-token',
      expiresAt: '2026-01-01T00:05:00.000Z',
    })
    serviceMock.addMember.mockResolvedValue({
      userId: 30,
      name: 'Elena Vargas',
      email: 'elena@ejemplo.test',
      roleId: 4,
      roleName: 'fisioterapia',
      isPrimary: false,
      joinedAt: '2026-03-01T00:00:00.000Z',
    })

    render(<PlatformOrganizationMembersSection organizationId={1} />)
    await screen.findByText('Ana Rojas')

    fireEvent.change(screen.getByLabelText('Código 2FA'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('ID de usuario'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('ID de rol'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir miembro' }))

    await waitFor(() => {
      expect(serviceMock.requestStepUp).toHaveBeenCalledWith('123456')
    })
    expect(serviceMock.addMember).toHaveBeenCalledWith(1, { userId: 30, roleId: 4 })
    expect(
      await screen.findByText(/Membresía añadida para Elena Vargas/),
    ).toBeInTheDocument()
  })

  it('bloquea mutación con Alert si falta el código 2FA de 6 dígitos', async () => {
    serviceMock.hasStepUpToken.mockReturnValue(false)

    render(<PlatformOrganizationMembersSection organizationId={1} />)
    await screen.findByText('Ana Rojas')

    fireEvent.change(screen.getByLabelText('ID de usuario'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('ID de rol'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir miembro' }))

    expect(
      await screen.findByText('Ingresa un código 2FA de 6 dígitos para confirmar el cambio.'),
    ).toBeInTheDocument()
    expect(serviceMock.addMember).not.toHaveBeenCalled()
  })

  it('cambia el rol de un miembro y refresca la lista', async () => {
    serviceMock.updateMemberRole.mockResolvedValue({
      ...sampleMembers[0],
      roleId: 5,
      roleName: 'psicologia',
    })

    render(<PlatformOrganizationMembersSection organizationId={1} />)
    await screen.findByText('Ana Rojas')

    const roleInput = screen.getByLabelText('Nuevo rol para Ana Rojas')
    fireEvent.change(roleInput, { target: { value: '5' } })

    const changeButtons = screen.getAllByRole('button', { name: 'Cambiar rol' })
    fireEvent.click(changeButtons[0])

    await waitFor(() => {
      expect(serviceMock.updateMemberRole).toHaveBeenCalledWith(1, 10, { roleId: 5 })
    })
    expect(
      await screen.findByText('Rol de Ana Rojas actualizado a psicologia.'),
    ).toBeInTheDocument()
  })

  it('quita un miembro e informa si se promovió otra membresía primaria', async () => {
    serviceMock.removeMember.mockResolvedValue({ removed: true, promotedUserId: 10 })

    render(<PlatformOrganizationMembersSection organizationId={1} />)
    await screen.findByText('Ana Rojas')

    const removeButtons = screen.getAllByRole('button', { name: 'Quitar' })
    fireEvent.click(removeButtons[0])

    await waitFor(() => {
      expect(serviceMock.removeMember).toHaveBeenCalledWith(1, 10)
    })
    expect(
      await screen.findByText(
        /Membresía de Ana Rojas eliminada\. Se promovió otra membresía primaria del usuario #10\./,
      ),
    ).toBeInTheDocument()
  })

  it('muestra errores de la API en un Alert cuando falla una operación', async () => {
    serviceMock.addMember.mockRejectedValue({
      response: { status: 409, data: { message: 'El usuario ya es miembro de la organización' } },
    })

    render(<PlatformOrganizationMembersSection organizationId={1} />)
    await screen.findByText('Ana Rojas')

    fireEvent.change(screen.getByLabelText('ID de usuario'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('ID de rol'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir miembro' }))

    expect(
      await screen.findByText('El usuario ya es miembro de la organización'),
    ).toBeInTheDocument()
  })
})
