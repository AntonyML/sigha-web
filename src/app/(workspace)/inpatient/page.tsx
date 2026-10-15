'use client';

import { Suspense } from 'react';
import InpatientCensusPage from '@/modules/inpatient/presentation/pages/inpatient/InpatientCensusPage';
import { LoadingSpinner } from '@/shared/ui';
import { PermissionGate } from '@/app/permission-gate';

export default function InpatientRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando censo residencial y mapa de camas..." />}>
      <PermissionGate module="beds"><InpatientCensusPage /></PermissionGate>
    </Suspense>
  );
}
