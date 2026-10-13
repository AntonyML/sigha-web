'use client'

import { Suspense } from 'react'
import ScheduleAppointment from '@/modules/nursing/presentation/pages/nursing/ScheduleAppointment'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ScheduleAppointment />
    </Suspense>
  )
}
