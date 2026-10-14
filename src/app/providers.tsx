'use client'

import type { ReactNode } from 'react'
import axios from 'axios'
import { FeedbackProvider } from '@/app/providers/FeedbackContext'
import { registerOrganizationAccessRedirect } from '@/infrastructure/api/organizationAccessRedirect'
import { Toast } from '@/shared/ui'

registerOrganizationAccessRedirect(axios)

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FeedbackProvider>
      {children}
      <Toast />
    </FeedbackProvider>
  )
}
