'use client'

import { Suspense } from 'react'
import CreateUser from '@/modules/identity/presentation/pages/users/CreateUserPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="users"><CreateUser /></PermissionGate>
    </Suspense>
  )
}
