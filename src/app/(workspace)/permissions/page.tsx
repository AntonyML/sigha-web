'use client'

import { Suspense } from 'react'
import PermissionListPage from '@/modules/identity/presentation/pages/permissions/PermissionListPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="permissions"><PermissionListPage /></PermissionGate>
    </Suspense>
  )
}
