'use client'

import { Suspense } from 'react'
import NotificationsListPage from '@/modules/notifications/presentation/pages/notifications/NotificationsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <NotificationsListPage />
    </Suspense>
  )
}
