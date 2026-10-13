'use client'

import { Suspense } from 'react'
import CreateNotificationPage from '@/modules/notifications/presentation/pages/notifications/CreateNotificationPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateNotificationPage />
    </Suspense>
  )
}
