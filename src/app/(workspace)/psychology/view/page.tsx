'use client'

import { Suspense } from 'react'
import ViewPsychologySessionPage from '@/modules/psychology/presentation/pages/psychology/ViewPsychologySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewPsychologySessionPage />
    </Suspense>
  )
}
