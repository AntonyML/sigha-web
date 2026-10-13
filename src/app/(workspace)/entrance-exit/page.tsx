'use client'

import { Suspense } from 'react'
import EntranceExitDashboard from '@/modules/resident-access/presentation/pages/entrance-exit/EntranceExitDashboard'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EntranceExitDashboard />
    </Suspense>
  )
}
