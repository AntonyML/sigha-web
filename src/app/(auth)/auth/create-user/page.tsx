'use client'

import { Suspense } from 'react'
import CreateUserPage from '@/modules/auth/presentation/pages/login/CreateUserPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateUserPage />
    </Suspense>
  )
}
