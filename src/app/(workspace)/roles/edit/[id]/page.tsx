'use client'

import { Suspense } from 'react'
import EditRolePage from '@/modules/identity/presentation/pages/roles/EditRolePage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="roles"><EditRolePage /></PermissionGate>
    </Suspense>
  )
}
