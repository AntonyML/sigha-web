'use client'

import { Suspense } from 'react'
import CreatePhysiotherapySessionPage from '@/modules/physiotherapy/presentation/pages/physiotherapy/CreatePhysiotherapySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreatePhysiotherapySessionPage />
    </Suspense>
  )
}
