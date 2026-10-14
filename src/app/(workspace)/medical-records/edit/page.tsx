'use client'

import { Suspense } from 'react'
import EditMedicalRecordPage from '@/modules/medical-records/presentation/pages/medical-records/EditMedicalRecordPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditMedicalRecordPage />
    </Suspense>
  )
}
