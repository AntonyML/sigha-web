'use client'

import { Suspense } from 'react'
import EditPsychologySessionPage from '@/modules/psychology/presentation/pages/psychology/EditPsychologySessionPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditPsychologySessionPage />
    </Suspense>
  )
}
