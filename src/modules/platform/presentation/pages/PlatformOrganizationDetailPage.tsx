'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Alert, LoadingSpinner } from '@/shared/ui'
import { platformOrganizationsService } from '@/infrastructure/api/services/platformOrganizationsService'
import type { OrganizationStatus, PlatformOrganization } from '@/shared/types/platform'

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  ARCHIVED: 'Archivada',
}

const STATUS_BADGES: Record<OrganizationStatus, string> = {
  ACTIVE: 'badge text-bg-success',
  SUSPENDED: 'badge text-bg-warning',
  ARCHIVED: 'badge text-bg-secondary',
}

const NOT_FOUND_MESSAGE = 'La organización solicitada no existe.'

const formatDateTime = (value: string) => new Date(value).toLocaleString('es-CR')

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { response?: { status?: number } }).response?.status === 404

interface PlatformOrganizationDetailPageProps {
  organizationId: number
}

/**
 * Read-only detail of a single tenant for the platform plane. It only consumes
 * `GET /platform/organizations/:id`; the mutations with step-up 2FA stay in the
 * listing screen.
 */
export default function PlatformOrganizationDetailPage({
  organizationId,
}: PlatformOrganizationDetailPageProps) {
  const [organization, setOrganization] = useState<PlatformOrganization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasValidId = Number.isInteger(organizationId) && organizationId > 0

  useEffect(() => {
    let active = true
    void (async () => {
      if (!hasValidId) {
        setOrganization(null)
        setError(NOT_FOUND_MESSAGE)
        setLoading(false)
        return
      }

      try {
        const data = await platformOrganizationsService.get(organizationId)
        if (active) setOrganization(data)
      } catch (err) {
        if (active) {
          setError(
            isNotFound(err)
              ? NOT_FOUND_MESSAGE
              : extractMessage(err, 'No se pudo cargar la organización.'),
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [hasValidId, organizationId])

  const branding = organization?.brandingOverrides ?? null

  return (
    <section aria-labelledby="platform-organization-detail-heading">
      <Link
        className="link-secondary small text-decoration-none"
        href="/platform/organizations"
      >
        ← Volver al listado de organizaciones
      </Link>

      <h1 id="platform-organization-detail-heading" className="h3 mt-2 mb-3">
        {organization ? organization.name : 'Detalle de organización'}
      </h1>

      {error && (
        <Alert variant="error" title="No se pudo cargar la organización">
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando organización..." />
      ) : organization ? (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h6">Identidad</h2>
              <dl className="row mb-0">
                <dt className="col-sm-3">Nombre</dt>
                <dd className="col-sm-9">{organization.name}</dd>
                <dt className="col-sm-3">Slug</dt>
                <dd className="col-sm-9">/{organization.slug}</dd>
                <dt className="col-sm-3">Estado</dt>
                <dd className="col-sm-9">
                  <span className={STATUS_BADGES[organization.status]}>
                    {STATUS_LABELS[organization.status]}
                  </span>
                </dd>
                <dt className="col-sm-3">Plan</dt>
                <dd className="col-sm-9">{organization.planTier}</dd>
              </dl>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h6">Membresías</h2>
              <p className="mb-0">
                <span className="h4 me-2">{organization.memberCount}</span>
                <span className="text-muted">
                  {organization.memberCount === 1
                    ? 'miembro registrado'
                    : 'miembros registrados'}
                </span>
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h6">Personalización de marca</h2>
              {branding ? (
                <dl className="row mb-0">
                  <dt className="col-sm-3">Nombre visible</dt>
                  <dd className="col-sm-9">{branding.displayName ?? '—'}</dd>
                  <dt className="col-sm-3">Logo</dt>
                  <dd className="col-sm-9 text-break">{branding.logoUrl ?? '—'}</dd>
                  <dt className="col-sm-3">Color primario</dt>
                  <dd className="col-sm-9">
                    {branding.primaryColor ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="d-inline-block border rounded me-2 align-middle"
                          style={{
                            width: '1rem',
                            height: '1rem',
                            backgroundColor: branding.primaryColor,
                          }}
                        />
                        {branding.primaryColor}
                      </>
                    ) : (
                      '—'
                    )}
                  </dd>
                </dl>
              ) : (
                <p className="text-muted mb-0">
                  Sin overrides: la organización usa la identidad por defecto de la plataforma.
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="h6">Fechas</h2>
              <dl className="row mb-0">
                <dt className="col-sm-3">Creada</dt>
                <dd className="col-sm-9">
                  <time dateTime={organization.createdAt}>
                    {formatDateTime(organization.createdAt)}
                  </time>
                </dd>
                <dt className="col-sm-3">Última actualización</dt>
                <dd className="col-sm-9">
                  <time dateTime={organization.updatedAt}>
                    {formatDateTime(organization.updatedAt)}
                  </time>
                </dd>
              </dl>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
