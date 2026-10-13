'use client'

import { Suspense } from 'react'
import RoleListPage from '@/modules/identity/presentation/pages/roles/RoleListPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="roles"><RoleListPage /></PermissionGate>
    </Suspense>
  )
}
