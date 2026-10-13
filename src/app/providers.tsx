'use client'

import type { ReactNode } from 'react'
import { FeedbackProvider } from '@/app/providers/FeedbackContext'
import { Toast } from '@/shared/ui'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FeedbackProvider>
      {children}
      <Toast />
    </FeedbackProvider>
  )
}
