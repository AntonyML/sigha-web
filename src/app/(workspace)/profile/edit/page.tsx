'use client'

import { Suspense } from 'react'
import EditProfilePage from '@/modules/identity/presentation/pages/profile/EditProfilePage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditProfilePage />
    </Suspense>
  )
}
