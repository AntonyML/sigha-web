'use client'

import { Suspense } from 'react'
import OrganizationSettingsPage from '@/modules/organizations/presentation/pages/OrganizationSettingsPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <OrganizationSettingsPage />
    </Suspense>
  )
}
