'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { PlatformGate } from '../platform-gate'

/**
 * Platform-plane shell. Isolated from the workspace shell on purpose: the SaaS
 * owner operates across organizations, so no organization-scoped providers
 * (settings/organization/2FA gates) are mounted here.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <PlatformGate>
      <div className="d-flex flex-column min-vh-100">
        <header className="navbar navbar-dark bg-dark px-4" role="banner">
          <span className="navbar-brand mb-0 h1">SIGHA · Plataforma</span>
          <Link className="btn btn-outline-light btn-sm" href="/dashboard">
            Volver al espacio de trabajo
          </Link>
        </header>
        <main className="flex-grow-1 container py-4">{children}</main>
      </div>
    </PlatformGate>
  )
}
