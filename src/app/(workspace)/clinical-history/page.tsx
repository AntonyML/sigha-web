'use client'

import { Suspense } from 'react'
import ClinicalConditionsListPage from '@/modules/clinical-history/presentation/pages/clinical-history/ClinicalConditionsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ClinicalConditionsListPage />
    </Suspense>
  )
}
