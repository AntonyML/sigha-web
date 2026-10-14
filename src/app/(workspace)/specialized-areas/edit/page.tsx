'use client'

import { Suspense } from 'react'
import EditSpecializedAreaPage from '@/modules/specialized-areas/presentation/pages/specialized-areas/EditSpecializedAreaPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditSpecializedAreaPage />
    </Suspense>
  )
}
