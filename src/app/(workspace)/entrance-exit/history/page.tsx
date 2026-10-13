'use client'

import { Suspense } from 'react'
import EntranceExitHistory from '@/modules/resident-access/presentation/pages/entrance-exit/EntranceExitHistory'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EntranceExitHistory />
    </Suspense>
  )
}
