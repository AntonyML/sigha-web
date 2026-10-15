'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PermissionUtils } from '@/shared/lib/permissionUtils'
import { LoadingSpinner } from '@/shared/ui'

export function PermissionGate({ module, children }: { module: string; children: ReactNode }) {
  const router = useRouter()
  const [, setRevision] = useState(0)
  const [loaded, setLoaded] = useState(PermissionUtils.isLoaded())
  const [loadError, setLoadError] = useState(PermissionUtils.getLoadError())
  const canAccess = loaded && PermissionUtils.canAccessModule(module)

  useEffect(() => {
    let cancelled = false
    const unsubscribe = PermissionUtils.subscribe(() => {
      setLoaded(PermissionUtils.isLoaded())
      setLoadError(PermissionUtils.getLoadError())
      setRevision((current) => current + 1)
    })

    void PermissionUtils.load().catch(() => undefined).finally(() => {
      if (!cancelled) {
        setLoaded(PermissionUtils.isLoaded())
        setLoadError(PermissionUtils.getLoadError())
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loaded && !loadError && !canAccess) router.replace('/dashboard')
  }, [canAccess, loaded, loadError, router])

  if (loadError) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        <p className="mb-2">{loadError}</p>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => void PermissionUtils.load(true).catch(() => undefined)}
        >
          Reintentar carga de permisos
        </button>
      </div>
    )
  }

  if (!loaded || !canAccess) {
    return <LoadingSpinner message={loaded ? 'Redirigiendo...' : 'Verificando permisos...'} />
  }

  return <>{children}</>
}
