'use client'

import { Suspense } from 'react'
import ProgramListPage from '@/modules/care-planning/presentation/pages/programs/ProgramListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ProgramListPage />
    </Suspense>
  )
}
