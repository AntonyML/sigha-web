'use client';

import { Suspense } from 'react';
import { PermissionGate } from '@/app/permission-gate';
import { LoadingSpinner } from '@/shared/ui';
import CarePlansPage from '@/modules/care-planning/presentation/pages/care-plans/CarePlansPage';

export default function CarePlansRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando planes de cuidado..." />}>
      <PermissionGate module="carePlans"><CarePlansPage /></PermissionGate>
    </Suspense>
  );
}
