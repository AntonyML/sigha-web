'use client'

import { Suspense } from 'react'
import VaccineListPage from '@/modules/care-planning/presentation/pages/vaccines/VaccineListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <VaccineListPage />
    </Suspense>
  )
}
