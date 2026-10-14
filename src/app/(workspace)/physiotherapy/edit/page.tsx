'use client'

import { Suspense } from 'react'
import EditPhysiotherapySessionPage from '@/modules/physiotherapy/presentation/pages/physiotherapy/EditPhysiotherapySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditPhysiotherapySessionPage />
    </Suspense>
  )
}
