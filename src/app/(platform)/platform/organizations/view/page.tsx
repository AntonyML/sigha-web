'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PlatformOrganizationDetailPage from '@/modules/platform/presentation/pages/PlatformOrganizationDetailPage'
import { LoadingSpinner } from '@/shared/ui'

/**
 * The web is exported statically (`output: 'export'`), so a route cannot carry
 * arbitrary path parameters: the detail screen is addressed with `?id=` like
 * the other migrated detail screens (`/users/view?id=`, `/medical-records/view?id=`).
 */
function PlatformOrganizationDetailRoute() {
  const searchParams = useSearchParams()

  return <PlatformOrganizationDetailPage organizationId={Number(searchParams.get('id'))} />
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando organización..." />}>
      <PlatformOrganizationDetailRoute />
    </Suspense>
  )
}
