'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const STORAGE_KEY = 'sigha-route-selection-v1'

export type RouteSelection = Record<string, string>
export type RouteSelectionStore = Record<string, RouteSelection>

type RouteSelectionContextValue = {
  ready: boolean
  selections: RouteSelectionStore
  setRouteParameters: (pathname: string, parameters: Record<string, string | null>) => void
  clearRouteSelection: (pathname: string) => void
}

type DynamicRouteRule = {
  pattern: RegExp
  destination: string
  parameter: string
  fallback: string
}

const dynamicRouteRules: DynamicRouteRule[] = [
  { pattern: /^\/virtualFiles\/view\/([^/]+)\/?$/, destination: '/virtualFiles/view', parameter: 'id', fallback: '/virtualFiles' },
  { pattern: /^\/virtualFiles\/edit\/([^/]+)\/?$/, destination: '/virtualFiles/edit', parameter: 'id', fallback: '/virtualFiles' },
  { pattern: /^\/physiotherapy\/view\/([^/]+)\/?$/, destination: '/physiotherapy/view', parameter: 'id', fallback: '/physiotherapy' },
  { pattern: /^\/physiotherapy\/edit\/([^/]+)\/?$/, destination: '/physiotherapy/edit', parameter: 'id', fallback: '/physiotherapy' },
  { pattern: /^\/permissions\/view\/([^/]+)\/?$/, destination: '/permissions/view', parameter: 'id', fallback: '/permissions' },
  { pattern: /^\/permissions\/edit\/([^/]+)\/?$/, destination: '/permissions/edit', parameter: 'id', fallback: '/permissions' },
  { pattern: /^\/users\/view\/([^/]+)\/?$/, destination: '/users/view', parameter: 'id', fallback: '/users' },
  { pattern: /^\/users\/edit\/([^/]+)\/?$/, destination: '/users/edit', parameter: 'id', fallback: '/users' },
  { pattern: /^\/specialized-appointments\/edit\/([^/]+)\/?$/, destination: '/specialized-appointments/edit', parameter: 'id', fallback: '/specialized-appointments' },
  { pattern: /^\/emergency-contacts\/edit\/([^/]+)\/?$/, destination: '/emergency-contacts/edit', parameter: 'id', fallback: '/emergency-contacts' },
  { pattern: /^\/programs\/view\/([^/]+)\/?$/, destination: '/programs/view', parameter: 'id', fallback: '/programs' },
  { pattern: /^\/programs\/edit\/([^/]+)\/?$/, destination: '/programs/edit', parameter: 'id', fallback: '/programs' },
  { pattern: /^\/nursing\/patients\/([^/]+)\/appointments\/?$/, destination: '/nursing/patients/appointments', parameter: 'patientId', fallback: '/nursing' },
  { pattern: /^\/psychology\/view\/([^/]+)\/?$/, destination: '/psychology/view', parameter: 'id', fallback: '/psychology' },
  { pattern: /^\/psychology\/edit\/([^/]+)\/?$/, destination: '/psychology/edit', parameter: 'id', fallback: '/psychology' },
  { pattern: /^\/social-work\/view\/([^/]+)\/?$/, destination: '/social-work/view', parameter: 'id', fallback: '/social-work' },
  { pattern: /^\/social-work\/edit\/([^/]+)\/?$/, destination: '/social-work/edit', parameter: 'id', fallback: '/social-work' },
  { pattern: /^\/roles\/view\/([^/]+)\/?$/, destination: '/roles/view', parameter: 'id', fallback: '/roles' },
  { pattern: /^\/roles\/edit\/([^/]+)\/?$/, destination: '/roles/edit', parameter: 'id', fallback: '/roles' },
  { pattern: /^\/clinical-medication\/edit\/([^/]+)\/?$/, destination: '/clinical-medication/edit', parameter: 'id', fallback: '/clinical-medication' },
  { pattern: /^\/nursing\/appointments\/([^/]+)\/view\/?$/, destination: '/nursing/appointments/view', parameter: 'id', fallback: '/nursing/appointments/history' },
  { pattern: /^\/nursing\/appointments\/([^/]+)\/results\/?$/, destination: '/nursing/appointments/results', parameter: 'id', fallback: '/nursing/appointments/history' },
  { pattern: /^\/nursing\/appointments\/([^/]+)\/complete\/?$/, destination: '/nursing/appointments/complete', parameter: 'id', fallback: '/nursing/appointments/history' },
  { pattern: /^\/medical-records\/view\/([^/]+)\/?$/, destination: '/medical-records/view', parameter: 'id', fallback: '/medical-records' },
  { pattern: /^\/medical-records\/edit\/([^/]+)\/?$/, destination: '/medical-records/edit', parameter: 'id', fallback: '/medical-records' },
  { pattern: /^\/notifications\/view\/([^/]+)\/?$/, destination: '/notifications/view', parameter: 'id', fallback: '/notifications' },
  { pattern: /^\/notifications\/([^/]+)\/?$/, destination: '/notifications/view', parameter: 'id', fallback: '/notifications' },
  { pattern: /^\/audits\/view\/([^/]+)\/?$/, destination: '/audits/view', parameter: 'id', fallback: '/audits' },
  { pattern: /^\/older-adult-family\/edit\/([^/]+)\/?$/, destination: '/older-adult-family/edit', parameter: 'id', fallback: '/older-adult-family' },
  { pattern: /^\/specialized-areas\/edit\/([^/]+)\/?$/, destination: '/specialized-areas/edit', parameter: 'id', fallback: '/specialized-areas' },
  // These two list screens currently navigate to edit URLs without a matching
  // App Router page. Keep their identifiers out of the browser address bar.
  { pattern: /^\/vaccines\/edit\/([^/]+)\/?$/, destination: '/vaccines', parameter: 'id', fallback: '/vaccines' },
  { pattern: /^\/sub-programs\/edit\/([^/]+)\/?$/, destination: '/sub-programs', parameter: 'id', fallback: '/sub-programs' },
]

const requiredSelections: Record<string, { parameter: string; fallback: string }> = {
  '/virtualFiles/view': { parameter: 'id', fallback: '/virtualFiles' },
  '/virtualFiles/edit': { parameter: 'id', fallback: '/virtualFiles' },
  '/physiotherapy/view': { parameter: 'id', fallback: '/physiotherapy' },
  '/physiotherapy/edit': { parameter: 'id', fallback: '/physiotherapy' },
  '/permissions/view': { parameter: 'id', fallback: '/permissions' },
  '/permissions/edit': { parameter: 'id', fallback: '/permissions' },
  '/users/view': { parameter: 'id', fallback: '/users' },
  '/users/edit': { parameter: 'id', fallback: '/users' },
  '/specialized-appointments/edit': { parameter: 'id', fallback: '/specialized-appointments' },
  '/emergency-contacts/edit': { parameter: 'id', fallback: '/emergency-contacts' },
  '/programs/view': { parameter: 'id', fallback: '/programs' },
  '/programs/edit': { parameter: 'id', fallback: '/programs' },
  '/nursing/patients/appointments': { parameter: 'patientId', fallback: '/nursing' },
  '/psychology/view': { parameter: 'id', fallback: '/psychology' },
  '/psychology/edit': { parameter: 'id', fallback: '/psychology' },
  '/social-work/view': { parameter: 'id', fallback: '/social-work' },
  '/social-work/edit': { parameter: 'id', fallback: '/social-work' },
  '/roles/view': { parameter: 'id', fallback: '/roles' },
  '/roles/edit': { parameter: 'id', fallback: '/roles' },
  '/clinical-medication/edit': { parameter: 'id', fallback: '/clinical-medication' },
  '/nursing/appointments/view': { parameter: 'id', fallback: '/nursing/appointments/history' },
  '/nursing/appointments/results': { parameter: 'id', fallback: '/nursing/appointments/history' },
  '/nursing/appointments/complete': { parameter: 'id', fallback: '/nursing/appointments/history' },
  '/medical-records/view': { parameter: 'id', fallback: '/medical-records' },
  '/medical-records/edit': { parameter: 'id', fallback: '/medical-records' },
  '/notifications/view': { parameter: 'id', fallback: '/notifications' },
  '/audits/view': { parameter: 'id', fallback: '/audits' },
  '/older-adult-family/edit': { parameter: 'id', fallback: '/older-adult-family' },
  '/specialized-areas/edit': { parameter: 'id', fallback: '/specialized-areas' },
}

const sensitiveQueryKeys = new Set([
  'id', 'patientid', 'userid', 'recordid', 'appointmentid', 'notificationid',
  'auditid', 'roleid', 'programid', 'permissionid', 'virtualfileid', 'contactid',
  'medicalrecordid', 'specializedappointmentid', 'areaid', 'subprogramid', 'vaccineid',
])

type RouteSelectionUpdates = Record<string, Record<string, string | null>>

function addParameter(updates: RouteSelectionUpdates, pathname: string, name: string, value: string | null) {
  updates[pathname] ??= {}
  updates[pathname][name] = value
}

function normalizePathname(pathname: string, updates: RouteSelectionUpdates): string {
  for (const rule of dynamicRouteRules) {
    const match = pathname.match(rule.pattern)
    if (!match) continue

    try {
      addParameter(updates, rule.destination, rule.parameter, decodeURIComponent(match[1]))
    } catch {
      addParameter(updates, rule.destination, rule.parameter, match[1])
    }
    return rule.destination
  }
  return pathname.replace(/\/$/, '') || '/'
}

function normalizeLocalTarget(target: string, updates: RouteSelectionUpdates, allowExternal = false): string | null {
  if (target.startsWith('//')) return allowExternal ? target : null

  let url: URL
  const localOrigin = typeof window === 'undefined' ? 'https://sigha.invalid' : window.location.origin
  try {
    url = new URL(target, localOrigin)
  } catch {
    return null
  }
  if (url.origin !== localOrigin) return allowExternal ? target : null

  const pathname = normalizePathname(url.pathname, updates)
  const search = new URLSearchParams()
  for (const [key, value] of url.searchParams) {
    const normalizedKey = key.toLowerCase()
    if (normalizedKey === 'returnto') {
      const returnTo = normalizeLocalTarget(value, updates)
      if (returnTo) search.set(key, returnTo)
    } else if (sensitiveQueryKeys.has(normalizedKey)) {
      addParameter(updates, pathname, key, value)
    } else {
      search.append(key, value)
    }
  }

  if (pathname === '/nursing/appointments/new' && !url.searchParams.has('patientId')) {
    addParameter(updates, pathname, 'patientId', null)
  }

  const query = search.toString()
  return `${pathname}${query ? `?${query}` : ''}${url.hash}`
}

export function normalizeNavigationTarget(destination: string): {
  href: string
  selections: RouteSelectionUpdates
} {
  const selections: RouteSelectionUpdates = {}
  const href = normalizeLocalTarget(destination, selections, true) ?? destination
  return { href, selections }
}

export function getRequiredRouteSelection(pathname: string) {
  return requiredSelections[pathname]
}

function readStoredSelections(): RouteSelectionStore {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(Object.entries(parsed).flatMap(([pathname, value]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return []
      const parameters = Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0))
      return [[pathname, parameters]]
    }))
  } catch {
    return {}
  }
}

function persistSelections(selections: RouteSelectionStore) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
  } catch {
    // Navigation still works for the current render when browser storage is unavailable.
  }
}

const RouteSelectionContext = createContext<RouteSelectionContextValue | null>(null)

export function RouteSelectionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const [selections, setSelections] = useState<RouteSelectionStore>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const currentTarget = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const normalized = normalizeNavigationTarget(currentTarget)
    const restored = readStoredSelections()

    for (const [routePath, parameters] of Object.entries(normalized.selections)) {
      restored[routePath] ??= {}
      for (const [name, value] of Object.entries(parameters)) {
        if (value === null || value.length === 0) delete restored[routePath][name]
        else restored[routePath][name] = value
      }
      if (Object.keys(restored[routePath]).length === 0) delete restored[routePath]
    }

    if (Object.keys(normalized.selections).length > 0) persistSelections(restored)
    setSelections(restored)
    if (normalized.href !== currentTarget) router.replace(normalized.href)
    setReady(true)
  }, [router])

  const setRouteParameters = useCallback((routePath: string, parameters: Record<string, string | null>) => {
    setSelections(previous => {
      const next = { ...previous, [routePath]: { ...(previous[routePath] ?? {}) } }
      for (const [name, value] of Object.entries(parameters)) {
        if (value === null || value.length === 0) delete next[routePath][name]
        else next[routePath][name] = value
      }
      if (Object.keys(next[routePath]).length === 0) delete next[routePath]
      persistSelections(next)
      return next
    })
  }, [])

  const clearRouteSelection = useCallback((routePath: string) => {
    setSelections(previous => {
      if (!(routePath in previous)) return previous
      const next = { ...previous }
      delete next[routePath]
      persistSelections(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const required = getRequiredRouteSelection(pathname)
    if (required && !selections[pathname]?.[required.parameter]) router.replace(required.fallback)
  }, [pathname, ready, router, selections])

  const value = useMemo(() => ({ ready, selections, setRouteParameters, clearRouteSelection }), [ready, selections, setRouteParameters, clearRouteSelection])
  const required = getRequiredRouteSelection(pathname)

  return (
    <RouteSelectionContext.Provider value={value}>
      {ready || !required ? children : null}
    </RouteSelectionContext.Provider>
  )
}

export function useRouteSelection() {
  return useContext(RouteSelectionContext)
}
