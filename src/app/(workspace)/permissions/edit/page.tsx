'use client'

import { Suspense } from 'react'
import EditPermissionPage from '@/modules/identity/presentation/pages/permissions/EditPermissionPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="permissions"><EditPermissionPage /></PermissionGate>
    </Suspense>
  )
}
