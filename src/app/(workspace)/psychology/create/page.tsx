'use client'

import { Suspense } from 'react'
import CreatePsychologySessionPage from '@/modules/psychology/presentation/pages/psychology/CreatePsychologySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreatePsychologySessionPage />
    </Suspense>
  )
}
