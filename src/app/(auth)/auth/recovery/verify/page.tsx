'use client'

import { Suspense } from 'react'
import PasswordRecoveryVerifyPage from '@/modules/auth/presentation/pages/login/PasswordRecoveryVerifyPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <PasswordRecoveryVerifyPage />
    </Suspense>
  )
}
