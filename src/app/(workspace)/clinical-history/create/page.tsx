'use client'

import { Suspense } from 'react'
import CreateClinicalConditionPage from '@/modules/clinical-history/presentation/pages/clinical-history/CreateClinicalConditionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateClinicalConditionPage />
    </Suspense>
  )
}
