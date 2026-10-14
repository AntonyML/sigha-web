'use client'

import { Suspense } from 'react'
import ViewProgramPage from '@/modules/care-planning/presentation/pages/programs/ViewProgramPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewProgramPage />
    </Suspense>
  )
}
