'use client'

import { Suspense } from 'react'
import SystemHealthPage from '@/modules/audit/presentation/pages/audit/SystemHealthPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><SystemHealthPage /></PermissionGate>
    </Suspense>
  )
}
