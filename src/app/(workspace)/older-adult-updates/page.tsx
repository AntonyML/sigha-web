'use client'

import { Suspense } from 'react'
import OlderAdultUpdatesListPage from '@/modules/residents/presentation/pages/older-adult-updates/OlderAdultUpdatesListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <OlderAdultUpdatesListPage />
    </Suspense>
  )
}
