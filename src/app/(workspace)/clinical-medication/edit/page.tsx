'use client'

import { Suspense } from 'react'
import EditClinicalMedicationPage from '@/modules/clinical-medication/presentation/pages/clinical-medication/EditClinicalMedicationPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditClinicalMedicationPage />
    </Suspense>
  )
}
