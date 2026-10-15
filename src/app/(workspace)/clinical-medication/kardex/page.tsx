'use client';

import { Suspense } from 'react';
import DailyKardexPage from '@/modules/clinical-medication/presentation/pages/kardex/DailyKardexPage';
import { LoadingSpinner } from '@/shared/ui';

export default function KardexRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando hoja de medicación..." />}>
      <DailyKardexPage />
    </Suspense>
  );
}
