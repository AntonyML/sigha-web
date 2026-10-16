import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const { brandingMock } = vi.hoisted(() => ({
  brandingMock: {
    value: { appName: 'SIGHA Global', logoUrl: 'https://cdn/platform.png' as string | null },
  },
}))

vi.mock('@/app/providers/PlatformBrandingContext', () => ({
  usePlatformBranding: () => ({ branding: brandingMock.value, loaded: true, updateBranding: vi.fn() }),
}))

import { AuthLayout } from '@/shared/ui/layouts/AuthLayout/AuthLayout'

describe('AuthLayout — identidad SaaS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    brandingMock.value = { appName: 'SIGHA Global', logoUrl: 'https://cdn/platform.png' }
  })

  it('muestra el logo global de la plataforma', () => {
    render(<AuthLayout title="Acceso">hijos</AuthLayout>)

    const logo = screen.getByRole('img', { name: 'Logo SIGHA Global' })
    expect(logo.querySelector('img')).toHaveAttribute('src', 'https://cdn/platform.png')
  })

  it('usa la inicial global cuando la plataforma no tiene logo', () => {
    brandingMock.value = { appName: 'Marea', logoUrl: null }
    render(<AuthLayout title="Acceso">hijos</AuthLayout>)

    expect(screen.getByRole('img', { name: 'Logo Marea' })).toHaveTextContent('M')
  })
})
