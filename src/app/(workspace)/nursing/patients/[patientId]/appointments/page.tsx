'use client'

import { Suspense } from 'react'
import PatientAppointments from '@/modules/nursing/presentation/pages/nursing/PatientAppointments'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PatientAppointments />
    </Suspense>
  )
}
