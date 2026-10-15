'use client';

import { Suspense } from 'react';
import LifestyleAssessmentPage from '@/modules/lifestyle/presentation/pages/lifestyle/LifestyleAssessmentPage';
import { LoadingSpinner } from '@/shared/ui';
import { PermissionGate } from '@/app/permission-gate';

export default function LifestyleRoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando evaluaciones de estilo de vida..." />}>
      <PermissionGate module="lifestyle"><LifestyleAssessmentPage /></PermissionGate>
    </Suspense>
  );
}
