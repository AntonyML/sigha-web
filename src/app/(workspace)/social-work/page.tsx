'use client'

import { Suspense } from 'react'
import SocialWorkReportsListPage from '@/modules/social-work/presentation/pages/social-work/SocialWorkReportsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SocialWorkReportsListPage />
    </Suspense>
  )
}
