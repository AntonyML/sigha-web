'use client'

import { Suspense } from 'react'
import ViewUserPage from '@/modules/identity/presentation/pages/users/ViewUserPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="users"><ViewUserPage /></PermissionGate>
    </Suspense>
  )
}
