'use client'

import { Suspense } from 'react'
import ActivityLogsPage from '@/modules/audit/presentation/pages/audit/ActivityLogsPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><ActivityLogsPage /></PermissionGate>
    </Suspense>
  )
}
