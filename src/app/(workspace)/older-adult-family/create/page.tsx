'use client'

import { Suspense } from 'react'
import CreateOlderAdultFamilyPage from '@/modules/residents/presentation/pages/older-adult-family/CreateOlderAdultFamilyPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateOlderAdultFamilyPage />
    </Suspense>
  )
}
