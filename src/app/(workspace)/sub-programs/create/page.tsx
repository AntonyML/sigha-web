'use client'

import { Suspense } from 'react'
import CreateSubProgramPage from '@/modules/care-planning/presentation/pages/sub-programs/CreateSubProgramPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateSubProgramPage />
    </Suspense>
  )
}
