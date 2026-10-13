'use client'

import { Suspense } from 'react'
import EditUserPage from '@/modules/identity/presentation/pages/users/EditUserPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="users"><EditUserPage /></PermissionGate>
    </Suspense>
  )
}
