'use client'

import { Suspense } from 'react'
import TwoFactorPage from '@/modules/security/presentation/pages/two-factor/TwoFactorPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <TwoFactorPage />
    </Suspense>
  )
}
