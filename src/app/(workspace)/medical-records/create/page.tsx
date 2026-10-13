'use client'

import { Suspense } from 'react'
import CreateMedicalRecordPage from '@/modules/medical-records/presentation/pages/medical-records/CreateMedicalRecordPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateMedicalRecordPage />
    </Suspense>
  )
}
