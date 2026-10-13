'use client'

import { Suspense } from 'react'
import EditVirtualFile from '@/modules/residents/presentation/pages/older-adults/EditVirtualRecordPage'
import { LoadingSpinner } from '@/shared/ui'

export default function RoutePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <EditVirtualFile />
    </Suspense>
  )
}
