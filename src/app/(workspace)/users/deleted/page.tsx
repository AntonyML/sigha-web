'use client'

import { Suspense } from 'react'
import DeletedUsersPage from '@/modules/identity/presentation/pages/users/DeletedUsersPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="users"><DeletedUsersPage /></PermissionGate>
    </Suspense>
  )
}
