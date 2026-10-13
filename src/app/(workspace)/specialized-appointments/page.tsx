'use client'

import { Suspense } from 'react'
import SpecializedAppointmentsListPage from '@/modules/specialized-appointments/presentation/pages/specialized-appointments/SpecializedAppointmentsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SpecializedAppointmentsListPage />
    </Suspense>
  )
}
