'use client'

import { Suspense } from 'react'
import ProfilePage from '@/modules/identity/presentation/pages/profile/ProfilePage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ProfilePage />
    </Suspense>
  )
}
