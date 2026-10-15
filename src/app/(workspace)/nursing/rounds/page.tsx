'use client';

import { Suspense } from 'react';
import NursingRoundsPage from '@/modules/nursing/presentation/pages/nursing/NursingRoundsPage';
import { LoadingSpinner } from '@/shared/ui';

export default function NursingRoundsRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando rondas de sala..." />}>
      <NursingRoundsPage />
    </Suspense>
  );
}
