'use client'

import { Suspense } from 'react'
import SecurityAuditPage from '@/modules/audit/presentation/pages/audit/SecurityAuditPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><SecurityAuditPage /></PermissionGate>
    </Suspense>
  )
}
