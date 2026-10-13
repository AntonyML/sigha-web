'use client'

import { Suspense } from 'react'
import InterfaceSettingsPage from '@/modules/workspace-settings/presentation/pages/settings/InterfaceSettingsPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <InterfaceSettingsPage />
    </Suspense>
  )
}
