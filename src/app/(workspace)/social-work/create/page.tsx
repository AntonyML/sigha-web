'use client'

import { Suspense } from 'react'
import CreateSocialWorkReportPage from '@/modules/social-work/presentation/pages/social-work/CreateSocialWorkReportPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateSocialWorkReportPage />
    </Suspense>
  )
}
