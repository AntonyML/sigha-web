'use client'

import { Suspense } from 'react'
import OlderAdultFamilyListPage from '@/modules/residents/presentation/pages/older-adult-family/OlderAdultFamilyListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <OlderAdultFamilyListPage />
    </Suspense>
  )
}
