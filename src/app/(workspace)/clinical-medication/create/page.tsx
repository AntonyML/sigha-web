'use client'

import { Suspense } from 'react'
import CreateClinicalMedicationPage from '@/modules/clinical-medication/presentation/pages/clinical-medication/CreateClinicalMedicationPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateClinicalMedicationPage />
    </Suspense>
  )
}
