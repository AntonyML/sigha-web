'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PermissionUtils } from '@/shared/lib/permissionUtils'
import { LoadingSpinner } from '@/shared/ui'

export function PermissionGate({ module, children }: { module: string; children: ReactNode }) {
  const router = useRouter()
  const [, setRevision] = useState(0)
  const [loaded, setLoaded] = useState(PermissionUtils.isLoaded())
  const canAccess = loaded && PermissionUtils.canAccessModule(module)

  useEffect(() => {
    let cancelled = false
    const unsubscribe = PermissionUtils.subscribe(() => {
      setLoaded(PermissionUtils.isLoaded())
      setRevision((current) => current + 1)
    })

    void PermissionUtils.load().finally(() => {
      if (!cancelled) setLoaded(PermissionUtils.isLoaded())
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loaded && !canAccess) router.replace('/dashboard')
  }, [canAccess, loaded, router])

  if (!loaded || !canAccess) {
    return <LoadingSpinner message={loaded ? 'Redirigiendo...' : 'Verificando permisos...'} />
  }

  return <>{children}</>
}
