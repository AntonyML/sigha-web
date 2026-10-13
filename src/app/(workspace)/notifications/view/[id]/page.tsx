'use client'

import { Suspense } from 'react'
import ViewNotificationPage from '@/modules/notifications/presentation/pages/notifications/ViewNotificationPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewNotificationPage />
    </Suspense>
  )
}
