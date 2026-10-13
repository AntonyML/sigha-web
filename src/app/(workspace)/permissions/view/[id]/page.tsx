'use client'

import { Suspense } from 'react'
import ViewPermissionPage from '@/modules/identity/presentation/pages/permissions/ViewPermissionPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="permissions"><ViewPermissionPage /></PermissionGate>
    </Suspense>
  )
}
