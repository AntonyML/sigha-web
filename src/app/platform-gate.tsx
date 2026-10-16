'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '@/infrastructure/storage/authStorage'
import type { AuthUser } from '@/shared/types/auth'
import { LoadingSpinner } from '@/shared/ui'

/** Platform-plane roles, mirrored from the API `platform_role` enum. */
export const PLATFORM_ROLES = ['PLATFORM_OWNER', 'PLATFORM_SUPPORT'] as const

/**
 * Reads the platform-plane role from the stored user. Tolerant of payloads that
 * predate the `platformRole` claim (returns null instead of throwing).
 */
export function readPlatformRole(user: AuthUser | null): string | null {
  const role = (user as { platformRole?: string | null } | null)?.platformRole
  return typeof role === 'string' ? role : null
}

/** True when the stored user carries a platform-plane role. */
export function hasPlatformRole(user: AuthUser | null = authStorage.getUser()): boolean {
  const role = readPlatformRole(user)
  return role !== null && (PLATFORM_ROLES as readonly string[]).includes(role)
}

/**
 * Browser-side UX gate for the platform plane. NestJS remains the authority:
 * every platform endpoint is also protected server-side by `PlatformGuard`.
 */
export function PlatformGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (!active) return
      if (!authStorage.isAuthenticated()) {
        router.replace('/login')
        return
      }
      if (!hasPlatformRole()) {
        router.replace('/dashboard')
        return
      }
      setAllowed(true)
    })
    return () => {
      active = false
    }
  }, [router])

  if (!allowed) return <LoadingSpinner message="Verificando acceso a la plataforma..." />
  return <>{children}</>
}
