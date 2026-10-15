'use client';

import { Suspense } from 'react';
import { PermissionGate } from '@/app/permission-gate';
import { LoadingSpinner } from '@/shared/ui';
import SystemAuditLogsPage from '@/modules/audit/presentation/pages/system-audit/SystemAuditLogsPage';

export default function SystemAuditLogsRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando auditoría administrativa..." />}>
      <PermissionGate module="systemAudit"><SystemAuditLogsPage /></PermissionGate>
    </Suspense>
  );
}
