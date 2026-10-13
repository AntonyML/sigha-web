'use client'

import { Suspense } from 'react'
import SpecializedAreasListPage from '@/modules/specialized-areas/presentation/pages/specialized-areas/SpecializedAreasListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SpecializedAreasListPage />
    </Suspense>
  )
}
