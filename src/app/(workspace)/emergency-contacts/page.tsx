'use client'

import { Suspense } from 'react'
import EmergencyContactsListPage from '@/modules/emergency-contacts/presentation/pages/emergency-contacts/EmergencyContactsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EmergencyContactsListPage />
    </Suspense>
  )
}
