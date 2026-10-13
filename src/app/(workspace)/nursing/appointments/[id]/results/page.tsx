'use client'

import { Suspense } from 'react'
import AppointmentResults from '@/modules/nursing/presentation/pages/nursing/AppointmentResults'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <AppointmentResults />
    </Suspense>
  )
}
