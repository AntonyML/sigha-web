'use client'

import { Suspense } from 'react'
import SecuritySettingsPage from '@/modules/workspace-settings/presentation/pages/settings/SecuritySettingsPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SecuritySettingsPage />
    </Suspense>
  )
}
