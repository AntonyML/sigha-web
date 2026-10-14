'use client'

import { useCallback, useMemo } from 'react'
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'
import { normalizeNavigationTarget, useRouteSelection } from '@/shared/navigation/routeSelectionContext'

export interface NavigationOptions {
  replace?: boolean
  params?: Record<string, string | number>
}

/** Small compatibility seam while feature screens transition to Next navigation. */
export function useNavigate() {
  const router = useRouter()
  const setRouteParameters = useRouteSelection()?.setRouteParameters

  return useCallback((destination: string | number, options?: NavigationOptions) => {
    if (typeof destination === 'number') {
      if (destination < 0) router.back()
      else if (destination > 0) router.forward()
      return
    }

    const normalized = normalizeNavigationTarget(destination)
    const nextPathname = new URL(normalized.href, window.location.origin).pathname

    for (const [routePath, parameters] of Object.entries(normalized.selections)) {
      setRouteParameters?.(routePath, parameters)
    }
    if (options?.params) {
      const parameters = Object.fromEntries(Object.entries(options.params).map(([key, value]) => [key, String(value)]))
      setRouteParameters?.(nextPathname, parameters)
    }

    if (options?.replace) router.replace(normalized.href)
    else router.push(normalized.href)
  }, [router, setRouteParameters])
}

export function useLocation() {
  const pathname = usePathname() ?? '/'
  const params = useNextSearchParams()
  const search = params.size > 0 ? `?${params.toString()}` : ''

  return useMemo(() => ({ pathname, search, hash: '' }), [pathname, search])
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  const pathname = usePathname() ?? '/'
  const routeSelection = useRouteSelection()
  const nextParams = useNextParams() as T | null
  return { ...(nextParams ?? {}), ...(routeSelection?.selections[pathname] ?? {}) } as T
}

export function useSearchParams() {
  const pathname = usePathname() ?? '/'
  const nextSearchParams = useNextSearchParams()
  const routeSelection = useRouteSelection()
  const searchParams = useMemo(() => {
    const merged = new URLSearchParams(nextSearchParams?.toString())
    for (const [key, value] of Object.entries(routeSelection?.selections[pathname] ?? {})) {
      if (!merged.has(key)) merged.set(key, value)
    }
    return merged
  }, [nextSearchParams, pathname, routeSelection?.selections])

  return [searchParams] as const
}
