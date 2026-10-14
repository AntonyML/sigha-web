'use client'

import { Suspense } from 'react'
import EditSocialWorkReportPage from '@/modules/social-work/presentation/pages/social-work/EditSocialWorkReportPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditSocialWorkReportPage />
    </Suspense>
  )
}
