'use client'

import { Suspense } from 'react'
import SettingsHubPage from '@/modules/workspace-settings/presentation/pages/settings/SettingsHubPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SettingsHubPage />
    </Suspense>
  )
}
