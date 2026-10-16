'use client'

import Link from 'next/link'
import { usePlatformContext } from '@/modules/platform/presentation/context/PlatformContextProvider'
import type { OrganizationStatus } from '@/shared/types/platform'

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  ARCHIVED: 'Archivada',
}

export default function PlatformHomePage() {
  const { inspectedOrganization, loading, error } = usePlatformContext()

  return (
    <section aria-labelledby="platform-heading">
      <h1 id="platform-heading" className="h3">
        Plano de plataforma
      </h1>
      <p className="text-muted">
        Gestión SaaS de SIGHA: organizaciones, planes y estado del servicio.
      </p>

      <div
        className="card mb-4"
        role="region"
        aria-labelledby="inspected-org-summary-heading"
      >
        <div className="card-body">
          <h2 id="inspected-org-summary-heading" className="h6 mb-3">
            Resumen de organización inspeccionada
          </h2>
          {loading ? (
            <p className="text-muted mb-0">Cargando resumen de organización...</p>
          ) : error ? (
            <p className="text-danger mb-0" role="alert">
              {error}
            </p>
          ) : !inspectedOrganization ? (
            <p className="text-muted mb-0">
              Selecciona una organización en la barra superior para consultar su resumen.
            </p>
          ) : (
            <dl className="row mb-0">
              <dt className="col-sm-3 text-muted">Nombre</dt>
              <dd className="col-sm-9 fw-semibold" data-testid="inspected-org-name">
                {inspectedOrganization.name}
              </dd>
              <dt className="col-sm-3 text-muted">Estado</dt>
              <dd className="col-sm-9" data-testid="inspected-org-status">
                {STATUS_LABELS[inspectedOrganization.status]} ({inspectedOrganization.status})
              </dd>
              <dt className="col-sm-3 text-muted">Plan</dt>
              <dd className="col-sm-9" data-testid="inspected-org-plan">
                {inspectedOrganization.planTier}
              </dd>
            </dl>
          )}
        </div>
      </div>

      <Link className="btn btn-primary" href="/platform/organizations">
        Gestionar organizaciones
      </Link>
    </section>
  )
}
