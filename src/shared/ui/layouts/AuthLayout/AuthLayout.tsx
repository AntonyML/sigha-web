'use client'

import type { ReactNode } from 'react'
import { usePlatformBranding } from '@/app/providers/PlatformBrandingContext'
import { PlatformLogo } from '@/shared/ui/branding/PlatformLogo'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui'

interface AuthLayoutProps {
  title: string
  description?: string
  children: ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
  backButtonText?: string
}

export function AuthLayout({
  title,
  description,
  children,
  showBackButton = false,
  onBackClick,
  backButtonText = "Volver"
}: AuthLayoutProps) {
  const { branding } = usePlatformBranding()
  const displayName = branding.appName
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 tablet:p-6">
      <Card className="w-full max-w-[500px] tablet:max-w-[550px] shadow-2xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-3">
          <PlatformLogo
            className="w-24 h-24 mx-auto tablet:w-28 tablet:h-28 flex items-center justify-center"
            imageClassName="w-full h-full object-contain"
            fallbackClassName="w-full h-full rounded-2xl bg-blue-600 text-white flex items-center justify-center text-5xl tablet:text-6xl font-bold select-none"
            label={`Logo ${displayName}`}
          />
          <div className="space-y-1">
            <CardTitle className="font-bold text-primary text-2xl tablet:text-3xl">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showBackButton && onBackClick && (
            <div className="flex justify-start mb-4">
              <button
                type="button"
                onClick={onBackClick}
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {backButtonText}
              </button>
            </div>
          )}

          {children}
        </CardContent>
      </Card>
    </div>
  )
}
