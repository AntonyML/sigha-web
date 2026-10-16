'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { platformOrganizationsService } from '@/infrastructure/api/services/platformOrganizationsService'
import type { PlatformOrganization } from '@/shared/types/platform'

export interface PlatformContextValue {
  organizations: PlatformOrganization[]
  inspectedOrganizationId: number | null
  inspectedOrganization: PlatformOrganization | null
  loading: boolean
  error: string | null
  selectOrganization: (organizationId: number | null) => void
  refreshOrganizations: () => Promise<void>
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined)

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

/**
 * Platform-plane React context. Holds the inspected organization purely in memory
 * (never persisted to localStorage, cookies, or session tenant state) so the SaaS
 * operator can inspect any organization without mutating their workspace tenant.
 */
export function PlatformContextProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([])
  const [inspectedOrganizationId, setInspectedOrganizationId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshOrganizations = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const list = await platformOrganizationsService.list()
      setOrganizations(list)
      setInspectedOrganizationId((currentId) => {
        if (currentId !== null && list.some((org) => org.id === currentId)) {
          return currentId
        }
        return list[0]?.id ?? null
      })
    } catch (err) {
      setError(extractMessage(err, 'No se pudieron cargar las organizaciones de plataforma.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const list = await platformOrganizationsService.list()
        if (!active) return
        setOrganizations(list)
        setInspectedOrganizationId((currentId) => {
          if (currentId !== null && list.some((org) => org.id === currentId)) {
            return currentId
          }
          return list[0]?.id ?? null
        })
      } catch (err) {
        if (active) {
          setError(extractMessage(err, 'No se pudieron cargar las organizaciones de plataforma.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const selectOrganization = useCallback((organizationId: number | null) => {
    setInspectedOrganizationId(organizationId)
  }, [])

  const inspectedOrganization = useMemo(
    () => organizations.find((org) => org.id === inspectedOrganizationId) ?? null,
    [organizations, inspectedOrganizationId],
  )

  const value = useMemo<PlatformContextValue>(
    () => ({
      organizations,
      inspectedOrganizationId,
      inspectedOrganization,
      loading,
      error,
      selectOrganization,
      refreshOrganizations,
    }),
    [
      organizations,
      inspectedOrganizationId,
      inspectedOrganization,
      loading,
      error,
      selectOrganization,
      refreshOrganizations,
    ],
  )

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatformContext(): PlatformContextValue {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatformContext debe usarse dentro de un PlatformContextProvider')
  }
  return context
}

/**
 * Shell selector that binds the inspected organization in memory for the
 * platform plane without coupling to the workspace session/tenant context.
 */
export function PlatformOrganizationSelector() {
  const selectId = useId()
  const {
    organizations,
    inspectedOrganizationId,
    loading,
    error,
    selectOrganization,
  } = usePlatformContext()

  const handleChange = (value: string) => {
    if (!value) {
      selectOrganization(null)
      return
    }
    const parsed = Number(value)
    if (Number.isInteger(parsed)) {
      selectOrganization(parsed)
    }
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <label
        htmlFor={`platform-inspected-org-${selectId}`}
        className="text-light small mb-0 text-nowrap"
      >
        Organización inspeccionada
      </label>
      <select
        id={`platform-inspected-org-${selectId}`}
        aria-label="Organización inspeccionada"
        className="form-select form-select-sm bg-dark text-light border-secondary"
        value={inspectedOrganizationId ?? ''}
        disabled={loading || organizations.length === 0}
        onChange={(event) => handleChange(event.target.value)}
      >
        {organizations.length === 0 ? (
          <option value="">
            {loading ? 'Cargando organizaciones...' : 'Sin organizaciones'}
          </option>
        ) : (
          organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))
        )}
      </select>
      {error && (
        <span role="alert" className="badge text-bg-danger">
          {error}
        </span>
      )}
    </div>
  )
}
