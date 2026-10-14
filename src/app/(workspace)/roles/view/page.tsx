'use client'

import { Suspense } from 'react'
import ViewRolePage from '@/modules/identity/presentation/pages/roles/ViewRolePage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="roles"><ViewRolePage /></PermissionGate>
    </Suspense>
  )
}
