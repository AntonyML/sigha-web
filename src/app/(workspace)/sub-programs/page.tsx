'use client'

import { Suspense } from 'react'
import SubProgramListPage from '@/modules/care-planning/presentation/pages/sub-programs/SubProgramListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SubProgramListPage />
    </Suspense>
  )
}
