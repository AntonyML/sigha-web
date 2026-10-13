'use client'

import { Suspense } from 'react'
import PasswordRecoveryRequestPage from '@/modules/auth/presentation/pages/login/PasswordRecoveryRequestPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PasswordRecoveryRequestPage />
    </Suspense>
  )
}
