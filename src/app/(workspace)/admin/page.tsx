'use client'

import { Suspense } from 'react'
import AdminHubPage from '@/modules/administration/presentation/pages/admin/AdminHubPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <AdminHubPage />
    </Suspense>
  )
}
