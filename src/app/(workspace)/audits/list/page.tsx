'use client'

import { Suspense } from 'react'
import AuditListPage from '@/modules/audit/presentation/pages/audit/AuditListPage'
import { LoadingSpinner } from '@/shared/ui'
import { PermissionGate } from '@/app/permission-gate'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PermissionGate module="audits"><AuditListPage /></PermissionGate>
    </Suspense>
  )
}
