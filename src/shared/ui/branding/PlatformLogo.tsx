'use client'

/* eslint-disable @next/next/no-img-element -- The SaaS logo is stored at a configurable public URL. */
import { usePlatformBranding } from '@/app/providers/PlatformBrandingContext'

interface PlatformLogoProps {
  className: string
  imageClassName?: string
  fallbackClassName?: string
  label?: string
}

export function PlatformLogo({ className, imageClassName, fallbackClassName, label }: PlatformLogoProps) {
  const { branding } = usePlatformBranding()
  const initial = branding.appName.trim().charAt(0).toLocaleUpperCase() || 'S'

  return (
    <span
      className={className}
      {...(label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true })}
    >
      {branding.logoUrl ? (
        <img src={branding.logoUrl} alt="" className={imageClassName} />
      ) : (
        <span className={fallbackClassName}>{initial}</span>
      )}
    </span>
  )
}
