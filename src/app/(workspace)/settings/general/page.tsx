'use client'

import { Suspense } from 'react'
import GeneralSettingsPage from '@/modules/workspace-settings/presentation/pages/settings/GeneralSettingsPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <GeneralSettingsPage />
    </Suspense>
  )
}
