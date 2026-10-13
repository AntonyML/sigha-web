'use client'

import { Suspense } from 'react'
import ViewMedicalRecordPage from '@/modules/medical-records/presentation/pages/medical-records/ViewMedicalRecordPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewMedicalRecordPage />
    </Suspense>
  )
}
