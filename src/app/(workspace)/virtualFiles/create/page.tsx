'use client'

import { Suspense } from 'react'
import CreateVirtualFile from '@/modules/residents/presentation/pages/older-adults/CreateVirtualRecordPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <CreateVirtualFile />
    </Suspense>
  )
}
