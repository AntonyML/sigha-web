'use client'

import { Suspense } from 'react'
import CompleteAppointment from '@/modules/nursing/presentation/pages/nursing/CompleteAppointment'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CompleteAppointment />
    </Suspense>
  )
}
