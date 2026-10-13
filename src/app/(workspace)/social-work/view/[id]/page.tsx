'use client'

import { Suspense } from 'react'
import ViewSocialWorkReportPage from '@/modules/social-work/presentation/pages/social-work/ViewSocialWorkReportPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ViewSocialWorkReportPage />
    </Suspense>
  )
}
