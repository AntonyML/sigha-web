'use client'

import { Suspense } from 'react'
import MedicalRecordsListPage from '@/modules/medical-records/presentation/pages/medical-records/MedicalRecordsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <MedicalRecordsListPage />
    </Suspense>
  )
}
