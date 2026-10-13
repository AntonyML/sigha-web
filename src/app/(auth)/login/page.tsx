'use client'

import { Suspense } from 'react'
import LoginForm from '@/modules/auth/presentation/pages/login/LoginPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <LoginForm />
    </Suspense>
  )
}
