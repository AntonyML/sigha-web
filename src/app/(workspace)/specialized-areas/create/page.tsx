'use client'

import { Suspense } from 'react'
import CreateSpecializedAreaPage from '@/modules/specialized-areas/presentation/pages/specialized-areas/CreateSpecializedAreaPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateSpecializedAreaPage />
    </Suspense>
  )
}
