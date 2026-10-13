'use client'

import { Suspense } from 'react'
import CreateSpecializedAppointmentPage from '@/modules/specialized-appointments/presentation/pages/specialized-appointments/CreateSpecializedAppointmentPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateSpecializedAppointmentPage />
    </Suspense>
  )
}
