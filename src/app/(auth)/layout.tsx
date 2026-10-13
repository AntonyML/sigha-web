'use client'

import type { ReactNode } from 'react'
import { TwoFactorProvider } from '@/modules/security/application/flows/twoFactor'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <TwoFactorProvider>{children}</TwoFactorProvider>
}
