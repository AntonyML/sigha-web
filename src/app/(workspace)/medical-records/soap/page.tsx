'use client';

import { Suspense } from 'react';
import SoapEncounterPage from '@/modules/medical-records/presentation/pages/medical-records/SoapEncounterPage';
import { LoadingSpinner } from '@/shared/ui';

export default function SoapEncounterRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando notas SOAP..." />}>
      <SoapEncounterPage />
    </Suspense>
  );
}
