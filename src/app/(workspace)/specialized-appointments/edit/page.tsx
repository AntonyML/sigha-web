'use client'

import { Suspense } from 'react'
import EditSpecializedAppointmentPage from '@/modules/specialized-appointments/presentation/pages/specialized-appointments/EditSpecializedAppointmentPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditSpecializedAppointmentPage />
    </Suspense>
  )
}
