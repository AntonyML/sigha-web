'use client';

import { Suspense } from 'react';
import InpatientCensusPage from '@/modules/inpatient/presentation/pages/inpatient/InpatientCensusPage';
import { LoadingSpinner } from '@/shared/ui';

export default function InpatientRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando censo residencial y mapa de camas..." />}>
      <InpatientCensusPage />
    </Suspense>
  );
}
