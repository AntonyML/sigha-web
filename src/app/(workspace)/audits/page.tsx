'use client'

import { Suspense } from 'react'
import AuditMenuPage from '@/modules/audit/presentation/pages/audit/AuditMenuPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><AuditMenuPage /></PermissionGate>
    </Suspense>
  )
}
