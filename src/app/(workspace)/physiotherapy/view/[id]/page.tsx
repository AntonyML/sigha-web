'use client'

import { Suspense } from 'react'
import ViewPhysiotherapySessionPage from '@/modules/physiotherapy/presentation/pages/physiotherapy/ViewPhysiotherapySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewPhysiotherapySessionPage />
    </Suspense>
  )
}
