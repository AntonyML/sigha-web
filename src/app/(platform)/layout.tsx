'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePlatformBranding } from '@/app/providers/PlatformBrandingContext'
import { PlatformLogo } from '@/shared/ui/branding/PlatformLogo'
import { PlatformGate } from '../platform-gate'
import {
  PlatformContextProvider,
  PlatformOrganizationSelector,
} from '@/modules/platform/presentation/context/PlatformContextProvider'

/**
 * Platform-plane shell. Isolated from the workspace shell on purpose: the SaaS
 * owner operates across organizations, so no organization-scoped providers
 * (settings/organization/2FA gates) are mounted here.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  const { branding } = usePlatformBranding()

  return (
    <PlatformGate>
      <PlatformContextProvider>
        <div className="d-flex flex-column min-vh-100">
          <header className="navbar navbar-dark bg-dark px-4 flex-wrap gap-3" role="banner">
            <span className="navbar-brand mb-0 h1 d-inline-flex align-items-center gap-2">
              <PlatformLogo
                className={`navbar-brand-icon${branding.logoUrl ? ' has-image' : ''}`}
                imageClassName="navbar-brand-image"
              />
              <span>{branding.appName} · Plataforma</span>
            </span>
            <div className="d-flex align-items-center gap-3 ms-auto">
              <PlatformOrganizationSelector />
              <Link className="btn btn-outline-light btn-sm" href="/dashboard">
                Volver al espacio de trabajo
              </Link>
            </div>
          </header>
          <main className="flex-grow-1 container py-4">{children}</main>
        </div>
      </PlatformContextProvider>
    </PlatformGate>
  )
}
