'use client'

import { Suspense } from 'react'
import TwoFactorVerificationPage from '@/modules/auth/presentation/pages/login/TwoFactorVerificationPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <TwoFactorVerificationPage />
    </Suspense>
  )
}
