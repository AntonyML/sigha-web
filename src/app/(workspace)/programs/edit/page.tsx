'use client'

import { Suspense } from 'react'
import EditProgramPage from '@/modules/care-planning/presentation/pages/programs/EditProgramPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditProgramPage />
    </Suspense>
  )
}
