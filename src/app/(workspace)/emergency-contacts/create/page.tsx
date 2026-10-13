'use client'

import { Suspense } from 'react'
import CreateEmergencyContactPage from '@/modules/emergency-contacts/presentation/pages/emergency-contacts/CreateEmergencyContactPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateEmergencyContactPage />
    </Suspense>
  )
}
