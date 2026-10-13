'use client'

import { Suspense } from 'react'
import CreatePermissionPage from '@/modules/identity/presentation/pages/permissions/CreatePermissionPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="permissions"><CreatePermissionPage /></PermissionGate>
    </Suspense>
  )
}
