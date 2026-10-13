'use client'

import { Suspense } from 'react'
import ClinicalMedicationListPage from '@/modules/clinical-medication/presentation/pages/clinical-medication/ClinicalMedicationListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ClinicalMedicationListPage />
    </Suspense>
  )
}
