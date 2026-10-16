'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import Link from 'next/link'
import { Alert, Button, Input, LoadingSpinner } from '@/shared/ui'
import { platformOrganizationsService } from '@/infrastructure/api/services/platformOrganizationsService'
import {
  ORGANIZATION_STATUSES,
  PLAN_TIERS,
  type OrganizationStatus,
  type PlanTier,
  type PlatformOrganization,
  type UpdatePlatformOrganizationPayload,
} from '@/shared/types/platform'

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  ARCHIVED: 'Archivada',
}

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

const isSixDigitCode = (value: string) => /^\d{6}$/.test(value.trim())

export default function PlatformOrganizationsPage() {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [stepUpCode, setStepUpCode] = useState('')
  const [stepUpActive, setStepUpActive] = useState(
    platformOrganizationsService.hasStepUpToken(),
  )

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [planTier, setPlanTier] = useState<PlanTier>('BASIC')

  const load = useCallback(async () => {
    setError(null)
    try {
      setOrganizations(await platformOrganizationsService.list())
    } catch (err) {
      setError(extractMessage(err, 'No se pudieron cargar las organizaciones.'))
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await platformOrganizationsService.list()
        if (active) setOrganizations(data)
      } catch (err) {
        if (active) {
          setError(extractMessage(err, 'No se pudieron cargar las organizaciones.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  /** Ensures a valid step-up token before any mutation, prompting for TOTP once. */
  const ensureStepUp = useCallback(async (): Promise<boolean> => {
    if (platformOrganizationsService.hasStepUpToken()) {
      setStepUpActive(true)
      return true
    }
    if (!isSixDigitCode(stepUpCode)) {
      setError('Ingresa un código 2FA de 6 dígitos para confirmar el cambio.')
      return false
    }
    await platformOrganizationsService.requestStepUp(stepUpCode.trim())
    setStepUpCode('')
    setStepUpActive(true)
    return true
  }, [stepUpCode])

  const handleCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setNotice(null)
      setBusy(true)
      try {
        if (!(await ensureStepUp())) return
        const created = await platformOrganizationsService.create({
          name: name.trim(),
          slug: slug.trim() || undefined,
          planTier,
        })
        setNotice(`Organización "${created.name}" creada.`)
        setName('')
        setSlug('')
        setPlanTier('BASIC')
        await load()
      } catch (err) {
        setError(extractMessage(err, 'No se pudo crear la organización.'))
      } finally {
        setBusy(false)
      }
    },
    [ensureStepUp, name, slug, planTier, load],
  )

  const handleUpdate = useCallback(
    async (org: PlatformOrganization, patch: UpdatePlatformOrganizationPayload) => {
      setError(null)
      setNotice(null)
      setBusy(true)
      try {
        if (!(await ensureStepUp())) return
        const updated = await platformOrganizationsService.update(org.id, patch)
        setNotice(`Organización "${updated.name}" actualizada.`)
        await load()
      } catch (err) {
        setError(extractMessage(err, 'No se pudo actualizar la organización.'))
      } finally {
        setBusy(false)
      }
    },
    [ensureStepUp, load],
  )

  const onStatusChange = (org: PlatformOrganization) => (event: ChangeEvent<HTMLSelectElement>) => {
    void handleUpdate(org, { status: event.target.value as OrganizationStatus })
  }

  const onPlanChange = (org: PlatformOrganization) => (event: ChangeEvent<HTMLSelectElement>) => {
    void handleUpdate(org, { planTier: event.target.value as PlanTier })
  }

  return (
    <section aria-labelledby="platform-orgs-heading">
      <h1 id="platform-orgs-heading" className="h3 mb-3">
        Organizaciones
      </h1>
      <p className="text-muted">
        Gestión platform-wide de tenants: alta, estado de ciclo de vida y plan comercial.
      </p>

      {error && (
        <Alert variant="error" title="No se pudo completar la acción">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert variant="success" title="Listo">
          {notice}
        </Alert>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h6">Verificación 2FA</h2>
          <p className="text-muted small mb-2">
            Las mutaciones de plataforma requieren re-verificar tu código TOTP (válido 5 minutos).
          </p>
          {stepUpActive ? (
            <span className="badge text-bg-success" role="status">
              Verificación 2FA activa
            </span>
          ) : (
            <Input
              label="Código 2FA (6 dígitos)"
              value={stepUpCode}
              onChange={(event) => setStepUpCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label="Código 2FA"
            />
          )}
        </div>
      </div>

      <div className="card mb-4">
        <form className="card-body" onSubmit={handleCreate}>
          <h2 className="h6">Nueva organización</h2>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <Input
                label="Nombre"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <Input
                label="Slug (opcional)"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="se deriva del nombre"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label" htmlFor="new-org-plan">
                Plan
              </label>
              <select
                id="new-org-plan"
                className="form-select"
                value={planTier}
                onChange={(event) => setPlanTier(event.target.value as PlanTier)}
              >
                {PLAN_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={busy}>
            Crear organización
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando organizaciones..." />
      ) : organizations.length === 0 ? (
        <p className="text-muted">Aún no hay organizaciones registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Organización</th>
                <th scope="col">Miembros</th>
                <th scope="col">Estado</th>
                <th scope="col">Plan</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>
                    <Link
                      className="fw-semibold link-primary text-decoration-none"
                      href={`/platform/organizations/view?id=${org.id}`}
                    >
                      {org.name}
                    </Link>
                    <div className="text-muted small">/{org.slug}</div>
                  </td>
                  <td>{org.memberCount}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={org.status}
                      onChange={onStatusChange(org)}
                      aria-label={`Estado de ${org.name}`}
                      disabled={busy}
                    >
                      {ORGANIZATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={org.planTier}
                      onChange={onPlanChange(org)}
                      aria-label={`Plan de ${org.name}`}
                      disabled={busy}
                    >
                      {PLAN_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
