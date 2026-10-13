'use client'

import { Suspense } from 'react'
import RegisterEntranceExit from '@/modules/resident-access/presentation/pages/entrance-exit/RegisterEntranceExit'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <RegisterEntranceExit />
    </Suspense>
  )
}
