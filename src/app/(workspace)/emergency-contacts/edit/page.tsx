'use client'

import { Suspense } from 'react'
import EditEmergencyContactPage from '@/modules/emergency-contacts/presentation/pages/emergency-contacts/EditEmergencyContactPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditEmergencyContactPage />
    </Suspense>
  )
}
