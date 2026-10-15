'use client'

import { Suspense } from 'react'
import RegisterEntranceExit from '@/modules/resident-access/presentation/pages/entrance-exit/RegisterEntranceExit'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="accessLogs"><RegisterEntranceExit /></PermissionGate>
    </Suspense>
  )
}
