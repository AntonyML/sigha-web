'use client'

import { Suspense } from 'react'
import ViewAdultsPage from '@/modules/residents/presentation/pages/older-adults/ViewAdultsPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewAdultsPage />
    </Suspense>
  )
}
