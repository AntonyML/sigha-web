'use client'

import { Suspense } from 'react'
import RoleChangesListPage from '@/modules/identity/presentation/pages/role-changes/RoleChangesListPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="roles"><RoleChangesListPage /></PermissionGate>
    </Suspense>
  )
}
