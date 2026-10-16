'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { settingsService } from '@/infrastructure/api/services/settingsService'
import type { GlobalSettings } from '@/shared/types/globalSettings'

const DEFAULT_BRANDING: GlobalSettings = {
  appName: 'SIGHA',
  logoUrl: null,
}

interface PlatformBrandingContextValue {
  branding: GlobalSettings
  loaded: boolean
  updateBranding: (branding: GlobalSettings) => void
}

const PlatformBrandingContext = createContext<PlatformBrandingContextValue | null>(null)

function normalizeBranding(branding: GlobalSettings): GlobalSettings {
  return {
    appName: branding.appName?.trim() || DEFAULT_BRANDING.appName,
    logoUrl: branding.logoUrl?.trim() || null,
  }
}

export function PlatformBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<GlobalSettings>(DEFAULT_BRANDING)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true

    const loadBranding = async () => {
      try {
        const publicBranding = await settingsService.getPublicGlobalSettings()
        if (active) setBranding(normalizeBranding(publicBranding))
      } catch {
        // Keep the default identity when the public settings endpoint is unavailable.
      } finally {
        if (active) setLoaded(true)
      }
    }

    void loadBranding()
    return () => { active = false }
  }, [])

  const updateBranding = useCallback((nextBranding: GlobalSettings) => {
    setBranding(normalizeBranding(nextBranding))
  }, [])

  return (
    <PlatformBrandingContext.Provider value={{ branding, loaded, updateBranding }}>
      {children}
    </PlatformBrandingContext.Provider>
  )
}

export function usePlatformBranding(): PlatformBrandingContextValue {
  return useContext(PlatformBrandingContext) ?? {
    branding: DEFAULT_BRANDING,
    loaded: true,
    updateBranding: () => {},
  }
}
