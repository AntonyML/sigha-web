'use client'

import { Suspense } from 'react'
import AuditDashboardPage from '@/modules/audit/presentation/pages/audit/AuditDashboardPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><AuditDashboardPage /></PermissionGate>
    </Suspense>
  )
}
