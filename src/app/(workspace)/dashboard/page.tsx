'use client'

import { Suspense } from 'react'
import Dashboard from '@/modules/dashboard/presentation/pages/dashboard/DashboardPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <Dashboard />
    </Suspense>
  )
}
