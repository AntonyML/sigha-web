'use client'

import { Suspense } from 'react'
import AppointmentDetail from '@/modules/nursing/presentation/pages/nursing/AppointmentDetail'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <AppointmentDetail />
    </Suspense>
  )
}
