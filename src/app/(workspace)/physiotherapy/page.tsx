'use client'

import { Suspense } from 'react'
import PhysiotherapySessionsListPage from '@/modules/physiotherapy/presentation/pages/physiotherapy/PhysiotherapySessionsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PhysiotherapySessionsListPage />
    </Suspense>
  )
}
