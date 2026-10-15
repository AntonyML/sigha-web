'use client'

import { Suspense } from 'react'
import EntranceExitDashboard from '@/modules/resident-access/presentation/pages/entrance-exit/EntranceExitDashboard'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="accessLogs"><EntranceExitDashboard /></PermissionGate>
    </Suspense>
  )
}
