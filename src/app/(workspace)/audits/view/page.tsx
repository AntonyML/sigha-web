'use client'

import { Suspense } from 'react'
import ViewAuditPage from '@/modules/audit/presentation/pages/audit/ViewAuditPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><ViewAuditPage /></PermissionGate>
    </Suspense>
  )
}
