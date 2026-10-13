'use client'

import { Suspense } from 'react'
import NursingDashboard from '@/modules/nursing/presentation/pages/nursing/NursingDashboard'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <NursingDashboard />
    </Suspense>
  )
}
