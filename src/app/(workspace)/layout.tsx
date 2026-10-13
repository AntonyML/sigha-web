'use client'

import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SettingsProvider } from '@/app/providers/SettingsContext'
import { TwoFactorProvider, useTwoFactorStatus } from '@/modules/security/application/flows/twoFactor'
import { authStorage } from '@/infrastructure/storage/authStorage'
import { PermissionUtils } from '@/shared/lib/permissionUtils'
import { AppLayout } from '@/shared/ui'
import { NotificationProvider } from '@/shared/ui/notifications/NotificationCenter'
import { LoadingSpinner } from '@/shared/ui'

const TWO_FACTOR_EXEMPT_PATHS = ['/two-factor', '/profile', '/profile/edit']

function AuthenticationGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.replace('/login')
      return
    }
    void PermissionUtils.load().catch((error: unknown) => {
      console.error('No se pudieron cargar los permisos iniciales', error)
    })
    setAuthenticated(true)
  }, [router])

  if (!authenticated) return <LoadingSpinner message="Verificando sesión..." />
  return <>{children}</>
}

function TwoFactorGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isEnabled, loading } = useTwoFactorStatus()
  const exempt = TWO_FACTOR_EXEMPT_PATHS.includes(pathname)
  const requiresSetup = isEnabled === false && !exempt

  useEffect(() => {
    if (requiresSetup) router.replace('/two-factor')
  }, [requiresSetup, router])

  if (loading || requiresSetup) {
    return <LoadingSpinner message={loading ? 'Verificando seguridad...' : 'Redirigiendo a configuración de seguridad...'} />
  }

  return (
    <Suspense fallback={<LoadingSpinner message="Cargando navegación..." />}>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  )
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <TwoFactorProvider>
          <AuthenticationGate>
            <TwoFactorGate>{children}</TwoFactorGate>
          </AuthenticationGate>
        </TwoFactorProvider>
      </NotificationProvider>
    </SettingsProvider>
  )
}
