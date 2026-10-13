'use client'

import { Suspense } from 'react'
import ListUser from '@/modules/identity/presentation/pages/users/UserListPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="users"><ListUser /></PermissionGate>
    </Suspense>
  )
}
