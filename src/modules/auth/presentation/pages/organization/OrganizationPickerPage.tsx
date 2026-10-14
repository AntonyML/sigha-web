'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Building2, Loader2 } from 'lucide-react'
import { authService } from '@/infrastructure/api/services/authService'
import type { OrganizationSummary } from '@/shared/types/organization'
import { AuthLayout, ButtonNew as Button } from '@/shared/ui'

export default function OrganizationPickerPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadOrganizations = async () => {
      const redirectedAfterAccessDenied = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('reason') === 'access-denied'
      if (redirectedAfterAccessDenied && !cancelled) setAccessDenied(true)

      if (!authService.isAuthenticated()) {
        router.replace('/login')
        setLoading(false)
        return
      }

      try {
        const result = await authService.getOrganizations()
        if (cancelled) return
        setOrganizations(result)

        if (result.length === 1) {
          if (!redirectedAfterAccessDenied && authService.getActiveOrganizationId() === result[0].id) {
            router.replace('/dashboard')
            return
          }
          setSelectedOrganizationId(result[0].id)
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar tus organizaciones. Inténtalo de nuevo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadOrganizations()
    return () => { cancelled = true }
  }, [router])

  async function continueWithSelection() {
    if (selectedOrganizationId === null) return
    setSelecting(true)
    setError('')

    try {
      await authService.switchActiveOrganization(selectedOrganizationId)
      router.replace('/dashboard')
    } catch {
      setError('No se pudo activar esta organización. Vuelve a elegir una organización.')
      setSelecting(false)
    }
  }

  function returnToLogin() {
    authService.clearLocalSession()
    router.replace('/login')
  }

  if (loading) {
    return (
      <AuthLayout title="Cargando organizaciones" description="Verificando las organizaciones disponibles">
        <div className="flex items-center justify-center gap-3 py-8" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Cargando...</span>
        </div>
      </AuthLayout>
    )
  }

  if (organizations.length === 0) {
    if (error) {
      return (
        <AuthLayout title="No se pudieron cargar las organizaciones" description="No fue posible verificar tu acceso. Inténtalo de nuevo más tarde.">
          <div className="space-y-4">
            <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </p>
            <Button type="button" className="w-full" onClick={returnToLogin}>
              Volver al inicio de sesión
            </Button>
          </div>
        </AuthLayout>
      )
    }

    return (
      <AuthLayout title="Sin organización asignada" description="No puedes entrar al espacio de trabajo todavía.">
        <div className="space-y-4">
          <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Tu usuario no tiene una organización asignada. Contacta al administrador para obtener acceso.
          </p>
          <Button type="button" className="w-full" onClick={returnToLogin}>
            Volver al inicio de sesión
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Selecciona tu organización" description="Elige el hogar al que quieres acceder.">
      <div className="space-y-4">
        {accessDenied && (
          <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            La API rechazó el acceso actual. Selecciona de nuevo una organización para continuar.
          </p>
        )}
        <div className="space-y-3" role="group" aria-label="Organizaciones disponibles">
          {organizations.map((organization) => (
            <button
              key={organization.id}
              type="button"
              aria-pressed={selectedOrganizationId === organization.id}
              onClick={() => setSelectedOrganizationId(organization.id)}
              disabled={selecting}
              className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                selectedOrganizationId === organization.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {organization.logoUrl ? (
                <Image src={organization.logoUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded object-contain" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded bg-muted" aria-hidden="true">
                  <Building2 className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{organization.name}</span>
                <span className="block text-sm text-muted-foreground">{organization.slug}</span>
              </span>
              {organization.isPrimary && (
                <span className="text-xs text-muted-foreground">Principal</span>
              )}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <Button
          type="button"
          className="w-full"
          disabled={selectedOrganizationId === null || selecting}
          onClick={() => void continueWithSelection()}
        >
          {selecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {selecting ? 'Activando...' : 'Continuar'}
        </Button>
      </div>
    </AuthLayout>
  )
}
