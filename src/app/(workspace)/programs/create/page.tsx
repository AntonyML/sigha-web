'use client'

import { Suspense } from 'react'
import CreateProgramPage from '@/modules/care-planning/presentation/pages/programs/CreateProgramPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateProgramPage />
    </Suspense>
  )
}
