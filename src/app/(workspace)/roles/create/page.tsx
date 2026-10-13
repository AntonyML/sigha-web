'use client'

import { Suspense } from 'react'
import CreateRolePage from '@/modules/identity/presentation/pages/roles/CreateRolePage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="roles"><CreateRolePage /></PermissionGate>
    </Suspense>
  )
}
