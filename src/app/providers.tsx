'use client'

import type { ReactNode } from 'react'
import axios from 'axios'
import { FeedbackProvider } from '@/app/providers/FeedbackContext'
import { PlatformBrandingProvider } from '@/app/providers/PlatformBrandingContext'
import { registerOrganizationAccessRedirect } from '@/infrastructure/api/organizationAccessRedirect'
import { RouteSelectionProvider } from '@/shared/navigation/routeSelectionContext'
import { Toast } from '@/shared/ui'

registerOrganizationAccessRedirect(axios)

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PlatformBrandingProvider>
      <RouteSelectionProvider>
        <FeedbackProvider>
          {children}
          <Toast />
        </FeedbackProvider>
      </RouteSelectionProvider>
    </PlatformBrandingProvider>
  )
}
