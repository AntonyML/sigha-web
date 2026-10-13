'use client'

import { Suspense } from 'react'
import CreateVaccinePage from '@/modules/care-planning/presentation/pages/vaccines/CreateVaccinePage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateVaccinePage />
    </Suspense>
  )
}
