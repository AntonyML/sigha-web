'use client';

import { Suspense } from 'react';
import LifestyleAssessmentPage from '@/modules/lifestyle/presentation/pages/lifestyle/LifestyleAssessmentPage';
import { LoadingSpinner } from '@/shared/ui';

export default function LifestyleRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando evaluaciones de estilo de vida..." />}>
      <LifestyleAssessmentPage />
    </Suspense>
  );
}
