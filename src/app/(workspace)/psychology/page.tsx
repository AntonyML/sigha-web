'use client'

import { Suspense } from 'react'
import PsychologySessionsListPage from '@/modules/psychology/presentation/pages/psychology/PsychologySessionsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PsychologySessionsListPage />
    </Suspense>
  )
}
