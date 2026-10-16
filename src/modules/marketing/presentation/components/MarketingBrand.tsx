'use client'

import Link from 'next/link'
import { usePlatformBranding } from '@/app/providers/PlatformBrandingContext'
import { PlatformLogo } from '@/shared/ui/branding/PlatformLogo'

interface MarketingBrandProps {
  className: string
}

export function MarketingBrand({ className }: MarketingBrandProps) {
  const { branding } = usePlatformBranding()

  return (
    <Link aria-label={`${branding.appName}, inicio`} className={className} href="/">
      <PlatformLogo
        className={`brand-mark${branding.logoUrl ? ' has-image' : ''}`}
        imageClassName="brand-logo-image"
      />
      <span>{branding.appName}</span>
    </Link>
  )
}

export function PlatformName() {
  const { branding } = usePlatformBranding()
  return <>{branding.appName}</>
}
