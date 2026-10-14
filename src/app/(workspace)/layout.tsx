'use client'

import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SettingsProvider, useOrganizationSettings } from '@/app/providers/SettingsContext'
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
    let active = true;
    let cleanup: (() => void) | undefined;
    void Promise.resolve().then(() => {
      if (!active) return;
      const maybeCleanup = (() => {
    if (!authStorage.isAuthenticated()) {
      router.replace('/login')
      return
    }
    setAuthenticated(true)

      })();
      if (typeof maybeCleanup === "function") cleanup = maybeCleanup;
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, [router])

  if (!authenticated) return <LoadingSpinner message="Verificando sesión..." />
  return <>{children}</>
}

function OrganizationGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { loaded, activeOrganization, selectionRequired } = useOrganizationSettings()

  useEffect(() => {
    if (!loaded) return
    if (!authStorage.isAuthenticated()) {
      router.replace('/login')
      return
    }
    if (selectionRequired || !activeOrganization) {
      router.replace('/seleccionar-organizacion')
      return
    }
    void PermissionUtils.load().catch((error: unknown) => {
      console.error('No se pudieron cargar los permisos iniciales', error)
    })
  }, [activeOrganization, loaded, router, selectionRequired])

  if (!loaded || !activeOrganization || selectionRequired) {
    return <LoadingSpinner message="Verificando organización activa..." />
  }

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
      <AuthenticationGate>
        <OrganizationGate>
          <NotificationProvider>
            <TwoFactorProvider>
              <TwoFactorGate>{children}</TwoFactorGate>
            </TwoFactorProvider>
          </NotificationProvider>
        </OrganizationGate>
      </AuthenticationGate>
    </SettingsProvider>
  )
}
