'use client'

import { useCallback, useMemo } from 'react'
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'

export interface NavigationOptions {
  replace?: boolean
}

/** Small compatibility seam while feature screens transition to Next navigation. */
export function useNavigate() {
  const router = useRouter()

  return useCallback((destination: string | number, options?: NavigationOptions) => {
    if (typeof destination === 'number') {
      if (destination < 0) router.back()
      else if (destination > 0) router.forward()
      return
    }

    if (options?.replace) router.replace(destination)
    else router.push(destination)
  }, [router])
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
  return useNextParams() as T
}

export function useSearchParams() {
  return [useNextSearchParams()] as const
}
