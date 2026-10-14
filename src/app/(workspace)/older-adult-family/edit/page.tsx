'use client'

import { Suspense } from 'react'
import EditOlderAdultFamilyPage from '@/modules/residents/presentation/pages/older-adult-family/EditOlderAdultFamilyPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditOlderAdultFamilyPage />
    </Suspense>
  )
}
