'use client'

import { Suspense } from 'react'
import ListVirtualFile from '@/modules/residents/presentation/pages/older-adults/OlderAdultsListPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ListVirtualFile />
    </Suspense>
  )
}
