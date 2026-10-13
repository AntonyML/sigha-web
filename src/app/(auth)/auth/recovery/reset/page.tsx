'use client'

import { Suspense } from 'react'
import PasswordRecoveryResetPage from '@/modules/auth/presentation/pages/login/PasswordRecoveryResetPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PasswordRecoveryResetPage />
    </Suspense>
  )
}
