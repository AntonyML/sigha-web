import React, { useCallback, useEffect, useState } from 'react'
import asopoguaLogo from '@/shared/assets/images/asopogua.png'
import { organizationsService } from '@/infrastructure/api/services/organizationsService'
import { useAppSettings } from '@/app/providers/SettingsContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui'

/**
 * Marca neutra SIGHA (la "S" de marketing, sin imagen): es el fallback cuando la
 * organización activa no tiene logo propio.
 *
 * `asopogua.png` conserva los bytes del logo histórico y SOLO se muestra cuando
 * la org activa es `slug === 'asopogua'` sin logo propio; ninguna otra
 * organización lo ve. El fix real es subir logos vía el módulo de organización
 * (`/settings/organization` → POST /organizations/current/logo), no añadir más
 * PNGs hardcodeados.
 */
export type AuthBrandKind = 'org-logo' | 'asopogua' | 'neutral'

export function resolveAuthBrand(
  org: { slug: string | null; logoUrl: string | null } | null,
): AuthBrandKind {
  if (org?.logoUrl) return 'org-logo'
  if (org && org.slug === 'asopogua') return 'asopogua'
  return 'neutral'
}

function hasSession(): boolean {
  try {
    return !!(localStorage.getItem('authToken') && localStorage.getItem('user'))
  } catch {
    return false
  }
}

interface AuthLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
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
  const { appName } = useAppSettings();
  const [org, setOrg] = useState<{ slug: string | null; logoUrl: string | null } | null>(null);

  const fetchOrg = useCallback(() => {
    if (!hasSession()) {
      setOrg(null);
      return;
    }
    organizationsService.getCurrent()
      .then((current) => setOrg({ slug: current.slug, logoUrl: current.logoUrl }))
      .catch(() => setOrg(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Carga inicial: solo setState en continuaciones async (no sync en el efecto).
    if (hasSession()) {
      organizationsService.getCurrent()
        .then((current) => {
          if (!cancelled) setOrg({ slug: current.slug, logoUrl: current.logoUrl });
        })
        .catch(() => {
          if (!cancelled) setOrg(null);
        });
    }
    window.addEventListener('authTokenChanged', fetchOrg);
    window.addEventListener('organizationChanged', fetchOrg);
    return () => {
      cancelled = true;
      window.removeEventListener('authTokenChanged', fetchOrg);
      window.removeEventListener('organizationChanged', fetchOrg);
    };
  }, [fetchOrg]);

  const brand = resolveAuthBrand(org);
  const displayName = appName;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 tablet:p-6">
      <Card className="w-full max-w-[500px] tablet:max-w-[550px] shadow-2xl border-2 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-3">
          {brand === 'org-logo' && org?.logoUrl ? (
            <img
              src={org.logoUrl}
              alt={`Logo ${displayName}`}
              className="w-24 h-24 mx-auto tablet:w-28 tablet:h-28 object-contain"
            />
          ) : brand === 'asopogua' ? (
            <img
              src={asopoguaLogo.src}
              alt={`Logo ${displayName}`}
              className="w-24 h-24 mx-auto tablet:w-28 tablet:h-28 object-contain"
            />
          ) : (
            <div
              role="img"
              aria-label={`Logo ${displayName}`}
              className="w-24 h-24 mx-auto tablet:w-28 tablet:h-28 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-5xl tablet:text-6xl font-bold select-none"
            >
              <span aria-hidden="true">S</span>
            </div>
          )}
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
